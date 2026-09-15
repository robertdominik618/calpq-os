import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import {
  ActorId,
  ActorKind,
  ActorReference,
  CommandId,
  CorrelationId,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VersionId,
} from '../../core/src/index.ts';
import {
  AccessDecisionReference,
  ApplicationEntrypoint,
  ApplicationExecutionContext,
  ApplicationOperationReference,
  OrganizationScopeReference,
  PurposeReference,
  TenantScopeReference,
  invokeUseCase,
} from '../src/index.ts';
import type { UseCaseHandler } from '../src/index.ts';

const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c073981';
const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c073982';
const CORRELATION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c073983';
const CAUSATION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c073984';

const actor = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);

function makeContext(): ApplicationExecutionContext {
  return ApplicationExecutionContext.create({
    operation: ApplicationOperationReference.from('op:fv06:test'),
    actor,
    subject,
    tenantScope: TenantScopeReference.from('tenant:alpha'),
    organizationScope: OrganizationScopeReference.from('org:acme-cz'),
    correlationId: CorrelationId.from(CORRELATION_ID),
    causationId: CommandId.from(CAUSATION_ID),
    requestedAt: UtcInstant.from('2026-09-15T06:30:00Z'),
    contractVersion: VersionId.from('application-v1'),
    accessDecision: AccessDecisionReference.from('access:allow:123'),
    purpose: PurposeReference.from('purpose:credential-review'),
    locale: 'cs-CZ',
  });
}

const handler: UseCaseHandler<{ readonly value: string }, string> = {
  execute(input, context) {
    return `${context.correlationId.toString()}:${input.value}`;
  },
};

test('FV06-01 context', () => {
  const context = makeContext();
  assert.equal(context instanceof ApplicationExecutionContext, true);
  assert.equal(Object.isFrozen(context), true);
  assert.equal(context.operation.toString(), 'op:fv06:test');
});

test('FV06-02 actor', () => {
  const context = makeContext();
  assert.strictEqual(context.actor, actor);
  assert.equal(context.actor.toJSON().referenceType, 'ACTOR');
});

test('FV06-03 subject', () => {
  const context = makeContext();
  assert.strictEqual(context.subject, subject);
  assert.notDeepEqual(context.actor.toJSON(), context.subject?.toJSON());
});

test('FV06-04 organization', () => {
  const context = makeContext();
  assert.equal(context.tenantScope?.toString(), 'tenant:alpha');
  assert.equal(context.organizationScope?.toString(), 'org:acme-cz');
});

test('FV06-05 correlation', () => {
  assert.equal(makeContext().correlationId.toString(), CORRELATION_ID);
});

test('FV06-06 causation', () => {
  assert.equal(makeContext().causationId?.toString(), CAUSATION_ID);
});

test('FV06-07 requested-at', () => {
  const originalNow = Date.now;
  Date.now = () => { throw new Error('ambient wall clock forbidden'); };
  try {
    assert.equal(makeContext().requestedAt.toString(), '2026-09-15T06:30:00.000Z');
  } finally {
    Date.now = originalNow;
  }
});

test('FV06-08 version', () => {
  assert.equal(makeContext().contractVersion.toString(), 'application-v1');
});

test('FV06-09 access', () => {
  const context = makeContext();
  assert.equal(context.accessDecision?.toString(), 'access:allow:123');
  assert.equal(context.purpose?.toString(), 'purpose:credential-review');
});

test('FV06-10 minimum-data', () => {
  const minimal = ApplicationExecutionContext.create({
    operation: ApplicationOperationReference.from('op:minimal'),
    actor,
    correlationId: CorrelationId.from(CORRELATION_ID),
    requestedAt: UtcInstant.from('2026-09-15T06:30:00Z'),
    contractVersion: VersionId.from('application-v1'),
  });
  const serialized = JSON.stringify(minimal.toJSON());
  assert.equal(minimal.subject, null);
  assert.equal(minimal.tenantScope, null);
  assert.equal(minimal.organizationScope, null);
  assert.doesNotMatch(serialized, /password|bearer|token|cookie|session/i);
  assert.throws(() => ApplicationOperationReference.from('   '), TypeError);
});

test('FV06-11 api-parity', async () => {
  const output = await invokeUseCase({ entrypoint: ApplicationEntrypoint.API, handler, input: { value: 'same' }, context: makeContext() });
  assert.equal(output, `${CORRELATION_ID}:same`);
});

test('FV06-12 worker-parity', async () => {
  const output = await invokeUseCase({ entrypoint: ApplicationEntrypoint.WORKER, handler, input: { value: 'same' }, context: makeContext() });
  assert.equal(output, `${CORRELATION_ID}:same`);
});

test('FV06-13 scheduler-parity', async () => {
  const output = await invokeUseCase({ entrypoint: ApplicationEntrypoint.SCHEDULER, handler, input: { value: 'same' }, context: makeContext() });
  assert.equal(output, `${CORRELATION_ID}:same`);
});

test('FV06-14 orchestration-boundary', () => {
  const sources = [
    'packages/application/src/application-execution-context.ts',
    'packages/application/src/use-case-handler.ts',
    'packages/application/src/references.ts',
    'packages/application/src/ports.ts',
  ].map((path) => readFileSync(path, 'utf8')).join('\n');
  assert.doesNotMatch(sources, /EligibilityAssessment|AuthorizationGrant|legal requirement|issuer authority/i);
  assert.doesNotMatch(sources, /Date\.now\(|Math\.random\(|randomUUID\(/);
});

test('FV06-15 port-boundary', () => {
  const packageJson = JSON.parse(readFileSync('packages/application/package.json', 'utf8')) as {
    dependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  assert.deepEqual(packageJson.dependencies ?? {}, {});
  assert.deepEqual(packageJson.optionalDependencies ?? {}, {});
  assert.deepEqual(packageJson.peerDependencies ?? {}, {});
  const sources = readFileSync('packages/application/src/ports.ts', 'utf8');
  assert.doesNotMatch(sources, /from\s+['"](?:react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)(?:['"/])/i);
});

test('FV06-16 architecture-boundary', () => {
  const result = spawnSync('bash', ['tests/architecture_boundaries_test.sh'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const coreIndex = readFileSync('packages/core/src/index.ts', 'utf8');
  assert.doesNotMatch(coreIndex, /@calpq\/application|packages\/application/);
});
