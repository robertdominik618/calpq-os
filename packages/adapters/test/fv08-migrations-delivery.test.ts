import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import {
  AggregateId,
  CommandId,
  CorrelationId,
  EventId,
  Revision,
  UtcInstant,
  VersionId,
} from '../../core/src/index.ts';
import {
  AuditReference,
  OutboxRecord,
  TenantScopeReference,
  executeAcceptedMutation,
} from '../../application/src/index.ts';
import type { AcceptedMutation } from '../../application/src/index.ts';
import { InMemoryUnitOfWork } from '../../application/test-support/index.ts';
import {
  AppliedMigration,
  ConsumerCheckpoint,
  DeliveryState,
  MigrationIntegrityError,
  MigrationManifest,
  MigrationPhase,
  OutboxDeliveryMessage,
} from '../src/index.ts';
import {
  InMemoryAtLeastOnceOutbox,
  InMemoryCheckpointStore,
  InMemoryInboxDeduplicator,
} from '../test-support/index.ts';

const MIGRATION_DIR = 'packages/adapters/migrations/postgresql';
const manifestInput = JSON.parse(readFileSync(`${MIGRATION_DIR}/manifest.json`, 'utf8')) as {
  schemaVersion: number;
  database: string;
  migrations: Array<{ id: string; file: string; phase: typeof MigrationPhase[keyof typeof MigrationPhase]; checksumSha256: string }>;
};

const TENANT = TenantScopeReference.from('tenant:fv08');
const AGGREGATE_ID = AggregateId.from('018f22e2-79b0-7cc3-98c4-dc0c0c075001');
const COMMAND_ID = CommandId.from('018f22e2-79b0-7cc3-98c4-dc0c0c075002');
const EVENT_A = EventId.from('018f22e2-79b0-7cc3-98c4-dc0c0c075003');
const EVENT_B = EventId.from('018f22e2-79b0-7cc3-98c4-dc0c0c075004');
const CORRELATION = CorrelationId.from('018f22e2-79b0-7cc3-98c4-dc0c0c075005');

function sha256(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function message(eventId = EVENT_A, streamKey = 'credential:alpha', revision = Revision.from(1)): OutboxDeliveryMessage {
  return OutboxDeliveryMessage.create({
    eventId,
    tenantScope: TENANT,
    streamKey,
    aggregateRevision: revision,
    eventType: 'CREDENTIAL_CHANGED',
    payloadVersion: VersionId.from('event-v1'),
    payload: { kind: 'CREDENTIAL_CHANGED' },
    correlationId: CORRELATION,
    causationId: COMMAND_ID,
  });
}

function acceptedMutation(): AcceptedMutation<Readonly<{ status: string }>, Readonly<{ kind: string }>, string> {
  return Object.freeze({
    tenantScope: TENANT,
    commandId: COMMAND_ID,
    aggregateId: AGGREGATE_ID,
    expectedRevision: Revision.initial(),
    nextRevision: Revision.from(1),
    authoritativeState: Object.freeze({ status: 'ACCEPTED' }),
    eventId: EVENT_A,
    event: Object.freeze({ kind: 'CREDENTIAL_CHANGED' }),
    outbox: OutboxRecord.create(EVENT_A, 'credential.changed', VersionId.from('event-v1')),
    outcome: 'ACCEPTED',
    auditReference: AuditReference.from('audit:fv08:1'),
  });
}

test('FV08-01 migration-order', () => {
  const manifest = MigrationManifest.create(manifestInput);
  assert.deepEqual(manifest.migrations.map((entry) => entry.id), [
    '0001_fv08_delivery_baseline',
    '0002_fv08_delivery_review_expand',
  ]);
  assert.equal(manifest.pending([]).length, 2);
});

test('FV08-02 migration-checksum', () => {
  for (const entry of manifestInput.migrations) {
    const content = readFileSync(`${MIGRATION_DIR}/${entry.file}`, 'utf8');
    assert.equal(sha256(content), entry.checksumSha256);
  }
});

test('FV08-03 applied-migration-immutable', () => {
  const manifest = MigrationManifest.create(manifestInput);
  const first = manifest.migrations[0];
  assert.ok(first);
  assert.equal(Object.isFrozen(first), true);
  const tampered = AppliedMigration.create({
    id: first.id,
    checksumSha256: '0'.repeat(64),
    appliedAt: UtcInstant.from('2026-09-15T06:00:00Z'),
    deploymentId: 'deploy:tamper-test',
  });
  assert.throws(() => manifest.pending([tampered]), MigrationIntegrityError);
});

test('FV08-04 forward-fix', () => {
  const baseline = readFileSync(`${MIGRATION_DIR}/0001_fv08_delivery_baseline.sql`, 'utf8');
  const fix = readFileSync(`${MIGRATION_DIR}/0002_fv08_delivery_review_expand.sql`, 'utf8');
  assert.doesNotMatch(baseline, /delivery_state|calpq_delivery_review/);
  assert.match(fix, /Forward-only EXPAND fix/);
  assert.match(fix, /ADD COLUMN delivery_state/);
});

test('FV08-05 expand-contract', () => {
  const manifest = MigrationManifest.create(manifestInput);
  assert.equal(manifest.migrations[1]?.phase, MigrationPhase.EXPAND);
  assert.equal(MigrationPhase.CONTRACT, 'CONTRACT');
  const expand = readFileSync(`${MIGRATION_DIR}/0002_fv08_delivery_review_expand.sql`, 'utf8');
  assert.match(expand, /NOT VALID/);
  assert.match(expand, /VALIDATE CONSTRAINT/);
  assert.doesNotMatch(expand, /\bDROP\s+(?:TABLE|COLUMN)\b|\bRENAME\b/i);
});

test('FV08-06 no-orm-auto-migration', () => {
  const packageJson = JSON.parse(readFileSync('packages/adapters/package.json', 'utf8')) as {
    dependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  };
  assert.deepEqual(packageJson.dependencies ?? {}, {});
  assert.doesNotMatch(JSON.stringify(packageJson.scripts ?? {}), /db\s+push|auto.?migrat|synchronize|schema.?sync/i);
});

test('FV08-07 outbox-same-transaction', async () => {
  const sql = readFileSync(`${MIGRATION_DIR}/0001_fv08_delivery_baseline.sql`, 'utf8');
  assert.match(sql, /CREATE TABLE calpq_outbox/);
  const uow = new InMemoryUnitOfWork();
  const delivery = new InMemoryAtLeastOnceOutbox();
  uow.failNextCommit();
  await assert.rejects(() => executeAcceptedMutation({
    unitOfWork: uow,
    mutation: acceptedMutation(),
    afterCommit: () => delivery.enqueue(message()),
  }));
  assert.equal(uow.snapshot().outbox, 0);
  assert.equal(delivery.getPending(EVENT_A), null);
});

test('FV08-08 post-commit-publication', async () => {
  const uow = new InMemoryUnitOfWork();
  const delivery = new InMemoryAtLeastOnceOutbox();
  let activeDuringPublication: boolean | null = null;
  await executeAcceptedMutation({
    unitOfWork: uow,
    mutation: acceptedMutation(),
    afterCommit: () => {
      activeDuringPublication = uow.isTransactionActive();
      delivery.enqueue(message());
    },
  });
  assert.equal(activeDuringPublication, false);
  assert.strictEqual(delivery.getPending(EVENT_A)?.eventId, EVENT_A);
});

test('FV08-09 at-least-once', () => {
  const delivery = new InMemoryAtLeastOnceOutbox();
  const outgoing = message();
  delivery.enqueue(outgoing);
  assert.strictEqual(delivery.getPending(EVENT_A), outgoing);
  assert.strictEqual(delivery.getPending(EVENT_A), outgoing);
  delivery.recordFailure({ eventId: EVENT_A, errorSummary: 'temporary outage', maxAttempts: 3 });
  assert.strictEqual(delivery.getPending(EVENT_A), outgoing);
});

test('FV08-10 stable-event-id', () => {
  const outgoing = message();
  assert.equal(outgoing.eventId.toString(), EVENT_A.toString());
  assert.equal(Object.isFrozen(outgoing), true);
  const sql = readFileSync(`${MIGRATION_DIR}/0001_fv08_delivery_baseline.sql`, 'utf8');
  assert.match(sql, /event_id uuid PRIMARY KEY/);
});

test('FV08-11 consumer-dedup', () => {
  const inbox = new InMemoryInboxDeduplicator();
  assert.equal(inbox.claim('consumer:passport', EVENT_A), true);
  assert.equal(inbox.claim('consumer:passport', EVENT_A), false);
  assert.equal(inbox.has('consumer:passport', EVENT_A), true);
});

test('FV08-12 checkpoint-not-domain-truth', () => {
  const store = new InMemoryCheckpointStore();
  store.advance(ConsumerCheckpoint.create('consumer:projection', 'credential:alpha', 'position:42'));
  assert.equal(store.get('consumer:projection', 'credential:alpha')?.sourcePosition, 'position:42');
  const coreIndex = readFileSync('packages/core/src/index.ts', 'utf8');
  const applicationIndex = readFileSync('packages/application/src/index.ts', 'utf8');
  assert.doesNotMatch(coreIndex, /ConsumerCheckpoint/);
  assert.doesNotMatch(applicationIndex, /ConsumerCheckpoint/);
});

test('FV08-13 duplicate-delivery-safe', () => {
  const inbox = new InMemoryInboxDeduplicator();
  let effects = 0;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (inbox.claim('consumer:effect', EVENT_A)) effects += 1;
  }
  assert.equal(effects, 1);
});

test('FV08-14 poison-message-review', () => {
  const delivery = new InMemoryAtLeastOnceOutbox();
  delivery.enqueue(message());
  assert.equal(delivery.recordFailure({ eventId: EVENT_A, errorSummary: 'bad payload', maxAttempts: 3, consumerId: 'consumer:x' }), DeliveryState.PENDING);
  assert.equal(delivery.recordFailure({ eventId: EVENT_A, errorSummary: 'bad payload', maxAttempts: 3, consumerId: 'consumer:x' }), DeliveryState.PENDING);
  assert.equal(delivery.recordFailure({ eventId: EVENT_A, errorSummary: 'bad payload', maxAttempts: 3, consumerId: 'consumer:x' }), DeliveryState.REVIEW_REQUIRED);
  assert.equal(delivery.getPending(EVENT_A), null);
  assert.equal(delivery.reviews().length, 1);
  assert.equal(delivery.reviews()[0]?.reasonCode, 'DELIVERY_UNPROCESSABLE');
});

test('FV08-15 no-global-order-assumption', () => {
  const delivery = new InMemoryAtLeastOnceOutbox();
  delivery.enqueue(message(EVENT_A, 'stream:a', Revision.from(9)));
  delivery.enqueue(message(EVENT_B, 'stream:b', Revision.from(1)));
  delivery.markPublished(EVENT_B);
  delivery.markPublished(EVENT_A);
  assert.equal(delivery.stateOf(EVENT_B), DeliveryState.PUBLISHED);
  assert.equal(delivery.stateOf(EVENT_A), DeliveryState.PUBLISHED);
});

test('FV08-16 architecture-boundary', () => {
  const result = spawnSync('bash', ['tests/architecture_boundaries_test.sh'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const core = readFileSync('packages/core/src/index.ts', 'utf8');
  const application = readFileSync('packages/application/src/index.ts', 'utf8');
  assert.doesNotMatch(core, /postgresql|MigrationManifest|InMemoryAtLeastOnceOutbox/i);
  assert.doesNotMatch(application, /postgresql|MigrationManifest|InMemoryAtLeastOnceOutbox/i);
});
