import {
  ActorReference,
  CorrelationId,
} from '../../core/src/index.ts';
import {
  OrganizationScopeReference,
  PurposeReference,
  SystemTenantContext,
  TenantAccessDecision,
  TenantAsyncEnvelope,
  TenantContext,
  TenantScopeReference,
} from '../src/index.ts';

declare const actor: ActorReference;
declare const correlationId: CorrelationId;
declare const context: TenantContext;
declare const envelope: TenantAsyncEnvelope<{ readonly event: string }>;
declare const decision: TenantAccessDecision;
declare const system: SystemTenantContext;

const tenant = TenantScopeReference.from('tenant:A');
const organization = OrganizationScopeReference.from('org:A');
const purpose = PurposeReference.from('credential-review');
TenantContext.create({ tenant, organization, actor, purpose, correlationId });

// @ts-expect-error Organization scope cannot substitute for TenantScopeReference.
TenantContext.create({ tenant: organization, organization, actor, purpose, correlationId });

// @ts-expect-error TenantContext is immutable.
context.tenant = TenantScopeReference.from('tenant:B');

// @ts-expect-error Retry envelope tenant identity is immutable.
envelope.tenant = TenantScopeReference.from('tenant:B');

// @ts-expect-error Access field scope is immutable.
decision.allowedFields.push('secret');

// @ts-expect-error Bounded system tenant list is immutable.
system.permittedTenants.push(TenantScopeReference.from('tenant:B'));
