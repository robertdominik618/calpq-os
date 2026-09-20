import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActorId,
  ActorKind,
  ActorReference,
  CorrelationId,
  UtcInstant,
  VersionId,
} from '../../core/src/index.ts';
import {
  AccessDecisionReference,
  AccessDisposition,
  ApplicationExecutionContext,
  ApplicationOperationReference,
  AuditReference,
  OrganizationScopeReference,
  PurposeReference,
  SystemTenantContext,
  TenantAccessDecision,
  TenantAccessDeniedError,
  TenantAsyncEnvelope,
  TenantAuditEvidence,
  TenantBoundary,
  TenantContext,
  TenantResourceAddress,
  TenantResourceSurface,
  TenantScopeReference,
  executeSensitiveRead,
} from '../src/index.ts';

const IDS = {
  actor: '018f22e2-79b0-7cc3-98c4-dc0c0c080001',
  system: '018f22e2-79b0-7cc3-98c4-dc0c0c080002',
  correlation: '018f22e2-79b0-7cc3-98c4-dc0c0c080003',
} as const;

const tenantA = TenantScopeReference.from('tenant:A');
const tenantB = TenantScopeReference.from('tenant:B');
const organization = OrganizationScopeReference.from('org:A');
const actor = ActorReference.create(ActorId.from(IDS.actor), ActorKind.HUMAN_USER);
const systemActor = ActorReference.create(ActorId.from(IDS.system), ActorKind.SYSTEM_PROCESS);
const purpose = PurposeReference.from('credential-review');
const otherPurpose = PurposeReference.from('marketing');
const correlationId = CorrelationId.from(IDS.correlation);
const boundary = TenantBoundary.create([tenantA]);

function context(tenant = tenantA, selectedPurpose = purpose): TenantContext {
  return TenantContext.create({ tenant, organization, actor, purpose: selectedPurpose, correlationId });
}

function decision(options: {
  tenant?: TenantScopeReference;
  purpose?: PurposeReference;
  disposition?: typeof AccessDisposition[keyof typeof AccessDisposition];
  allowedFields?: readonly string[];
} = {}): TenantAccessDecision {
  return TenantAccessDecision.create({
    reference: AccessDecisionReference.from('access:1'),
    tenant: options.tenant ?? tenantA,
    purpose: options.purpose ?? purpose,
    disposition: options.disposition ?? AccessDisposition.ALLOW,
    allowedFields: options.allowedFields ?? ['name', 'status'],
    decidedBy: actor,
    auditReference: AuditReference.from('audit:access:1'),
  });
}

function executionContext(includeTenant = true): ApplicationExecutionContext {
  return ApplicationExecutionContext.create({
    operation: ApplicationOperationReference.from('credential.read'),
    actor,
    tenantScope: includeTenant ? tenantA : null,
    organizationScope: organization,
    correlationId,
    requestedAt: UtcInstant.from('2026-09-15T09:15:00Z'),
    contractVersion: VersionId.from('app-1'),
    purpose,
  });
}

async function readWith(input: Partial<Parameters<typeof executeSensitiveRead>[0]> = {}) {
  return executeSensitiveRead({
    context: context(),
    boundary,
    resourceTenant: tenantA,
    accessDecision: decision(),
    requestedFields: ['name'],
    loader: async () => Object.freeze({ name: 'Alice', status: 'VERIFIED', secret: 'hidden' }),
    ...input,
  });
}

test('FV13-01 explicit-tenant', () => {
  assert.strictEqual(context().tenant, tenantA);
  assert.throws(() => TenantContext.create({ tenant: undefined as never, organization, actor, purpose, correlationId }), /explicit TenantScopeReference/);
});

test('FV13-02 organization-scope', () => {
  assert.strictEqual(context().organization, organization);
});

test('FV13-03 actor-reference', () => {
  assert.strictEqual(context().actor, actor);
});

test('FV13-04 purpose-reference', () => {
  assert.strictEqual(context().purpose, purpose);
});

test('FV13-05 correlation-reference', () => {
  assert.strictEqual(context().correlationId, correlationId);
});

test('FV13-06 no-default-tenant', () => {
  const source = readFileSync('packages/application/src/tenant/tenant-governance.ts', 'utf8');
  assert.doesNotMatch(source, /DEFAULT_TENANT|defaultTenant|currentTenant|ambientTenant/);
  assert.throws(() => TenantContext.fromExecutionContext(executionContext(false)), TenantAccessDeniedError);
});

test('FV13-07 missing-tenant-fail-closed', async () => {
  assert.throws(() => TenantContext.fromExecutionContext(executionContext(false)), /Access denied/);
  await assert.rejects(() => readWith({ context: context(tenantB) }), /Access denied/);
});

test('FV13-08 conflicting-tenant-fail-closed', async () => {
  let loaded = false;
  await assert.rejects(() => readWith({
    resourceTenant: tenantB,
    loader: async () => { loaded = true; return { name: 'leak' }; },
  }), /Access denied/);
  assert.equal(loaded, false);
});

test('FV13-09 repository-tenant-scope', () => {
  const address = TenantResourceAddress.create(context(), TenantResourceSurface.REPOSITORY, 'credential:123');
  assert.equal(address.toString(), 'tenant:A::REPOSITORY::credential:123');
});

test('FV13-10 cache-tenant-scope', () => {
  assert.match(TenantResourceAddress.create(context(), TenantResourceSurface.CACHE, 'passport:123').toString(), /^tenant:A::CACHE::/);
});

test('FV13-11 search-tenant-scope', () => {
  assert.match(TenantResourceAddress.create(context(), TenantResourceSurface.SEARCH, 'credentials').toString(), /^tenant:A::SEARCH::/);
});

test('FV13-12 storage-tenant-scope', () => {
  assert.match(TenantResourceAddress.create(context(), TenantResourceSurface.STORAGE, 'evidence/1').toString(), /^tenant:A::STORAGE::/);
});

test('FV13-13 worker-tenant-scope', () => {
  assert.match(TenantResourceAddress.create(context(), TenantResourceSurface.WORKER, 'verify').toString(), /^tenant:A::WORKER::/);
});

test('FV13-14 async-tenant-scope', () => {
  const envelope = TenantAsyncEnvelope.create(context(), { event: 'VERIFY' });
  assert.strictEqual(envelope.tenant, tenantA);
  assert.strictEqual(envelope.organization, organization);
  assert.strictEqual(envelope.actor, actor);
});

test('FV13-15 retry-retains-tenant', () => {
  const first = TenantAsyncEnvelope.create(context(), { event: 'VERIFY' });
  const retry = first.nextRetry();
  assert.strictEqual(retry.tenant, first.tenant);
  assert.strictEqual(retry.organization, first.organization);
  assert.strictEqual(retry.actor, first.actor);
  assert.strictEqual(retry.purpose, first.purpose);
  assert.strictEqual(retry.correlationId, first.correlationId);
  assert.equal(retry.attempt, 1);
});

test('FV13-16 access-before-read', async () => {
  let loaded = false;
  await assert.rejects(() => readWith({
    accessDecision: decision({ disposition: AccessDisposition.DENY, allowedFields: [] }),
    loader: async () => { loaded = true; return { name: 'leak' }; },
  }), /Access denied/);
  assert.equal(loaded, false);
});

test('FV13-17 purpose-before-read', async () => {
  let loaded = false;
  await assert.rejects(() => readWith({
    accessDecision: decision({ purpose: otherPurpose }),
    loader: async () => { loaded = true; return { name: 'leak' }; },
  }), /Access denied/);
  assert.equal(loaded, false);
});

test('FV13-18 minimum-necessary', async () => {
  const result = await readWith({ requestedFields: ['name'] });
  assert.deepEqual(result, { name: 'Alice' });
  assert.equal('status' in result, false);
  assert.equal('secret' in result, false);
});

test('FV13-19 cross-tenant-no-existence-leak', async () => {
  const messages: string[] = [];
  for (const resourceTenant of [tenantB, tenantA]) {
    try {
      await readWith({
        resourceTenant,
        accessDecision: resourceTenant === tenantA ? decision({ disposition: AccessDisposition.DENY, allowedFields: [] }) : decision(),
      });
    } catch (error) {
      messages.push((error as Error).message);
    }
  }
  assert.deepEqual(messages, ['Access denied', 'Access denied']);
});

test('FV13-20 system-operation-bounded', () => {
  const system = SystemTenantContext.create({
    actor: systemActor,
    purpose: PurposeReference.from('platform-reconciliation'),
    correlationId,
    auditReference: AuditReference.from('audit:system:1'),
    permittedTenants: [tenantA],
  });
  assert.doesNotThrow(() => system.assertPermitted(tenantA));
  assert.throws(() => system.assertPermitted(tenantB), /Access denied/);
});

test('FV13-21 audit-attribution', () => {
  const audit = TenantAuditEvidence.create({
    auditReference: AuditReference.from('audit:operation:1'),
    operation: ApplicationOperationReference.from('credential.read'),
    context: context(),
    occurredAt: UtcInstant.from('2026-09-15T09:20:00Z'),
  });
  assert.strictEqual(audit.tenant, tenantA);
  assert.strictEqual(audit.organization, organization);
  assert.strictEqual(audit.actor, actor);
  assert.strictEqual(audit.purpose, purpose);
  assert.strictEqual(audit.correlationId, correlationId);
});

test('FV13-22 audit-not-domain-truth', () => {
  const audit = TenantAuditEvidence.create({
    auditReference: AuditReference.from('audit:operation:2'),
    operation: ApplicationOperationReference.from('credential.read'),
    context: context(),
    occurredAt: UtcInstant.from('2026-09-15T09:20:00Z'),
  });
  assert.equal(audit.domainTruth, false);
  assert.equal('authoritativeState' in audit, false);
  assert.equal('eligibilityAssessment' in audit, false);
});

test('FV13-23 degraded-mode-isolation', () => {
  const normal = TenantResourceAddress.create(context(), TenantResourceSurface.CACHE, 'passport:1');
  const degraded = normal.withDegradedMode();
  assert.equal(degraded.degraded, true);
  assert.strictEqual(degraded.tenant, normal.tenant);
  assert.equal(degraded.surface, normal.surface);
  assert.equal(degraded.key, normal.key);
});

test('FV13-24 architecture-boundary', () => {
  const source = readFileSync('packages/application/src/tenant/tenant-governance.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
  assert.doesNotMatch(source, /DEFAULT_TENANT|defaultTenant|ambientTenant/);
});
