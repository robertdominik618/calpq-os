import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import {
  AggregateId,
  CommandId,
  EventId,
  Revision,
  VersionId,
} from '../../core/src/index.ts';
import {
  AuditReference,
  OptimisticConcurrencyConflict,
  OutboxRecord,
  TenantScopeReference,
  UnitOfWorkCommitStatus,
  executeAcceptedMutation,
} from '../src/index.ts';
import type { AcceptedMutation } from '../src/index.ts';
import { InMemoryUnitOfWork } from '../test-support/index.ts';

const TENANT_A = TenantScopeReference.from('tenant:a');
const TENANT_B = TenantScopeReference.from('tenant:b');
const AGGREGATE_ID = AggregateId.from('018f22e2-79b0-7cc3-98c4-dc0c0c074001');
const COMMAND_1 = CommandId.from('018f22e2-79b0-7cc3-98c4-dc0c0c074002');
const COMMAND_2 = CommandId.from('018f22e2-79b0-7cc3-98c4-dc0c0c074003');
const EVENT_1 = EventId.from('018f22e2-79b0-7cc3-98c4-dc0c0c074004');

class DemoAggregate {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
    Object.freeze(this);
  }
}

function mutation(options: {
  tenant?: TenantScopeReference;
  commandId?: CommandId;
  expected?: Revision;
  next?: Revision;
  state?: DemoAggregate;
  outcome?: string;
} = {}): AcceptedMutation<DemoAggregate, Readonly<{ kind: string }>, string> {
  const expected = options.expected ?? Revision.initial();
  return Object.freeze({
    tenantScope: options.tenant ?? TENANT_A,
    commandId: options.commandId ?? COMMAND_1,
    aggregateId: AGGREGATE_ID,
    expectedRevision: expected,
    nextRevision: options.next ?? expected.next(),
    authoritativeState: options.state ?? new DemoAggregate('accepted'),
    eventId: EVENT_1,
    event: Object.freeze({ kind: 'DEMO_ACCEPTED' }),
    outbox: OutboxRecord.create(EVENT_1, 'demo.accepted', VersionId.from('event-v1')),
    outcome: options.outcome ?? 'ACCEPTED',
    auditReference: AuditReference.from('audit:decision:1'),
  });
}

test('FV07-01 repository-domain-type', async () => {
  const fake = new InMemoryUnitOfWork();
  const aggregate = new DemoAggregate('domain-value');
  fake.seedAggregate(TENANT_A, AGGREGATE_ID, aggregate, Revision.from(2));
  const loaded = await fake.repository<DemoAggregate>().load(TENANT_A, AGGREGATE_ID);
  assert.equal(loaded?.value instanceof DemoAggregate, true);
  assert.strictEqual(loaded?.value, aggregate);
});

test('FV07-02 tenant-scope', async () => {
  const fake = new InMemoryUnitOfWork();
  fake.seedAggregate(TENANT_A, AGGREGATE_ID, new DemoAggregate('A'), Revision.from(1));
  fake.seedAggregate(TENANT_B, AGGREGATE_ID, new DemoAggregate('B'), Revision.from(4));
  assert.equal((await fake.repository<DemoAggregate>().load(TENANT_A, AGGREGATE_ID))?.value.name, 'A');
  assert.equal((await fake.repository<DemoAggregate>().load(TENANT_B, AGGREGATE_ID))?.value.name, 'B');
});

test('FV07-03 unit-of-work', async () => {
  const fake = new InMemoryUnitOfWork();
  const result = await fake.commitAccepted(mutation());
  assert.equal(result.status, UnitOfWorkCommitStatus.COMMITTED);
  assert.equal(result.revision.toNumber(), 1);
});

test('FV07-04 idempotency-claim', async () => {
  const fake = new InMemoryUnitOfWork();
  await fake.commitAccepted(mutation());
  const replay = await fake.commitAccepted(mutation({ state: new DemoAggregate('ignored-on-replay') }));
  assert.equal(replay.status, UnitOfWorkCommitStatus.REPLAYED);
  assert.deepEqual(fake.snapshot(), { aggregates: 1, events: 1, outbox: 1, outcomes: 1, audits: 1 });
});

test('FV07-05 expected-revision', async () => {
  const fake = new InMemoryUnitOfWork();
  fake.seedAggregate(TENANT_A, AGGREGATE_ID, new DemoAggregate('r2'), Revision.from(2));
  const result = await fake.commitAccepted(mutation({ expected: Revision.from(2), next: Revision.from(3) }));
  assert.equal(result.revision.toNumber(), 3);
});

test('FV07-06 authoritative-write', async () => {
  const fake = new InMemoryUnitOfWork();
  const next = new DemoAggregate('authoritative');
  await fake.commitAccepted(mutation({ state: next }));
  const loaded = await fake.repository<DemoAggregate>().load(TENANT_A, AGGREGATE_ID);
  assert.strictEqual(loaded?.value, next);
  assert.equal(loaded?.revision.toNumber(), 1);
});

test('FV07-07 event-record', async () => {
  const fake = new InMemoryUnitOfWork();
  await fake.commitAccepted(mutation());
  assert.equal(fake.snapshot().events, 1);
});

test('FV07-08 outbox-record', async () => {
  const fake = new InMemoryUnitOfWork();
  await fake.commitAccepted(mutation());
  assert.equal(fake.snapshot().outbox, 1);
});

test('FV07-09 outcome-record', async () => {
  const fake = new InMemoryUnitOfWork();
  const result = await fake.commitAccepted(mutation({ outcome: 'RECORDED' }));
  assert.equal(result.outcome, 'RECORDED');
  assert.equal(fake.snapshot().outcomes, 1);
});

test('FV07-10 audit-reference', async () => {
  const fake = new InMemoryUnitOfWork();
  await fake.commitAccepted(mutation());
  assert.equal(fake.snapshot().audits, 1);
});

test('FV07-11 atomic-commit', async () => {
  const fake = new InMemoryUnitOfWork();
  await fake.commitAccepted(mutation());
  assert.deepEqual(fake.snapshot(), { aggregates: 1, events: 1, outbox: 1, outcomes: 1, audits: 1 });
});

test('FV07-12 rollback-no-partial-state', async () => {
  const fake = new InMemoryUnitOfWork();
  fake.failNextCommit();
  await assert.rejects(() => fake.commitAccepted(mutation()), /transaction failure/i);
  assert.deepEqual(fake.snapshot(), { aggregates: 0, events: 0, outbox: 0, outcomes: 0, audits: 0 });
  assert.equal(await fake.repository<DemoAggregate>().load(TENANT_A, AGGREGATE_ID), null);
});

test('FV07-13 stale-revision-conflict', async () => {
  const fake = new InMemoryUnitOfWork();
  fake.seedAggregate(TENANT_A, AGGREGATE_ID, new DemoAggregate('current'), Revision.from(2));
  await assert.rejects(
    () => fake.commitAccepted(mutation({ expected: Revision.from(1), next: Revision.from(2) })),
    OptimisticConcurrencyConflict,
  );
});

test('FV07-14 no-last-write-wins', async () => {
  const fake = new InMemoryUnitOfWork();
  await fake.commitAccepted(mutation({ state: new DemoAggregate('first') }));
  await assert.rejects(
    () => fake.commitAccepted(mutation({ commandId: COMMAND_2, expected: Revision.initial(), next: Revision.from(1), state: new DemoAggregate('stale-overwrite') })),
    OptimisticConcurrencyConflict,
  );
  assert.equal((await fake.repository<DemoAggregate>().load(TENANT_A, AGGREGATE_ID))?.value.name, 'first');
});

test('FV07-15 external-call-outside-transaction', async () => {
  const fake = new InMemoryUnitOfWork();
  let externalObservedActiveTransaction: boolean | null = null;
  await executeAcceptedMutation({
    unitOfWork: fake,
    mutation: mutation(),
    afterCommit: () => { externalObservedActiveTransaction = fake.isTransactionActive(); },
  });
  assert.equal(externalObservedActiveTransaction, false);
});

test('FV07-16 retry-identity', async () => {
  const fake = new InMemoryUnitOfWork();
  let postCommitCalls = 0;
  const first = mutation({ outcome: 'FIRST' });
  await executeAcceptedMutation({ unitOfWork: fake, mutation: first, afterCommit: () => { postCommitCalls += 1; } });
  const replay = await executeAcceptedMutation({ unitOfWork: fake, mutation: first, afterCommit: () => { postCommitCalls += 1; } });
  assert.equal(replay.status, UnitOfWorkCommitStatus.REPLAYED);
  assert.equal(replay.outcome, 'FIRST');
  assert.equal(postCommitCalls, 1);
});

test('FV07-17 core-persistence-independence', () => {
  const core = readFileSync('packages/core/src/index.ts', 'utf8');
  assert.doesNotMatch(core, /UnitOfWorkPort|TenantScopedRepository|@calpq\/application|packages\/application/);
  const appPersistence = [
    'packages/application/src/persistence/repository.ts',
    'packages/application/src/persistence/unit-of-work.ts',
  ].map((path) => readFileSync(path, 'utf8')).join('\n');
  assert.doesNotMatch(appPersistence, /from\s+['"](?:pg|postgres|mysql|sqlite|prisma|typeorm|sequelize|knex|drizzle|redis)(?:['"/])/i);
});

test('FV07-18 architecture-boundary', () => {
  const result = spawnSync('bash', ['tests/architecture_boundaries_test.sh'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
