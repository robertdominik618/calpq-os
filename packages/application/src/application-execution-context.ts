import {
  ActorReference,
  CommandId,
  CorrelationId,
  EventId,
  SubjectReference,
  UtcInstant,
  VersionId,
} from '../../core/src/index.ts';
import type { CausationReference } from '../../core/src/index.ts';
import {
  AccessDecisionReference,
  ApplicationOperationReference,
  OrganizationScopeReference,
  PurposeReference,
  TenantScopeReference,
} from './references.ts';

export interface ApplicationExecutionContextInput {
  readonly operation: ApplicationOperationReference;
  readonly actor: ActorReference;
  readonly subject?: SubjectReference | null;
  readonly tenantScope?: TenantScopeReference | null;
  readonly organizationScope?: OrganizationScopeReference | null;
  readonly correlationId: CorrelationId;
  readonly causationId?: CausationReference | null;
  readonly requestedAt: UtcInstant;
  readonly contractVersion: VersionId;
  readonly accessDecision?: AccessDecisionReference | null;
  readonly purpose?: PurposeReference | null;
  readonly locale?: string | null;
}

function normalizeLocale(locale: string | null | undefined): string | null {
  if (locale == null) return null;
  if (typeof locale !== 'string') throw new TypeError('Locale must be text');
  const normalized = locale.trim();
  if (normalized.length === 0 || normalized.length > 35) throw new TypeError('Locale must be a compact presentation hint');
  return normalized;
}

export class ApplicationExecutionContext {
  readonly operation: ApplicationOperationReference;
  readonly actor: ActorReference;
  readonly subject: SubjectReference | null;
  readonly tenantScope: TenantScopeReference | null;
  readonly organizationScope: OrganizationScopeReference | null;
  readonly correlationId: CorrelationId;
  readonly causationId: CausationReference | null;
  readonly requestedAt: UtcInstant;
  readonly contractVersion: VersionId;
  readonly accessDecision: AccessDecisionReference | null;
  readonly purpose: PurposeReference | null;
  readonly locale: string | null;

  private constructor(input: ApplicationExecutionContextInput) {
    this.operation = input.operation;
    this.actor = input.actor;
    this.subject = input.subject ?? null;
    this.tenantScope = input.tenantScope ?? null;
    this.organizationScope = input.organizationScope ?? null;
    this.correlationId = input.correlationId;
    this.causationId = input.causationId ?? null;
    this.requestedAt = input.requestedAt;
    this.contractVersion = input.contractVersion;
    this.accessDecision = input.accessDecision ?? null;
    this.purpose = input.purpose ?? null;
    this.locale = normalizeLocale(input.locale);
    Object.freeze(this);
  }

  static create(input: ApplicationExecutionContextInput): ApplicationExecutionContext {
    if (!(input.operation instanceof ApplicationOperationReference)) throw new TypeError('Execution context requires operation reference');
    if (!(input.actor instanceof ActorReference)) throw new TypeError('Execution context requires ActorReference');
    if (input.subject != null && !(input.subject instanceof SubjectReference)) throw new TypeError('Subject scope requires SubjectReference');
    if (input.tenantScope != null && !(input.tenantScope instanceof TenantScopeReference)) throw new TypeError('Tenant scope requires TenantScopeReference');
    if (input.organizationScope != null && !(input.organizationScope instanceof OrganizationScopeReference)) throw new TypeError('Organization scope requires OrganizationScopeReference');
    if (!(input.correlationId instanceof CorrelationId)) throw new TypeError('Execution context requires CorrelationId');
    if (input.causationId != null && !(input.causationId instanceof CommandId) && !(input.causationId instanceof EventId)) {
      throw new TypeError('Causation must reference a CommandId or EventId');
    }
    if (!(input.requestedAt instanceof UtcInstant)) throw new TypeError('Execution context requires requested-at UtcInstant');
    if (!(input.contractVersion instanceof VersionId)) throw new TypeError('Execution context requires explicit contract VersionId');
    if (input.accessDecision != null && !(input.accessDecision instanceof AccessDecisionReference)) throw new TypeError('Access context requires AccessDecisionReference');
    if (input.purpose != null && !(input.purpose instanceof PurposeReference)) throw new TypeError('Purpose context requires PurposeReference');
    return new ApplicationExecutionContext(input);
  }

  toJSON(): Readonly<Record<string, unknown>> {
    return Object.freeze({
      operation: this.operation.toString(),
      actor: this.actor.toJSON(),
      subject: this.subject?.toJSON() ?? null,
      tenantScope: this.tenantScope?.toString() ?? null,
      organizationScope: this.organizationScope?.toString() ?? null,
      correlationId: this.correlationId.toString(),
      causationId: this.causationId?.toString() ?? null,
      requestedAt: this.requestedAt.toString(),
      contractVersion: this.contractVersion.toString(),
      accessDecision: this.accessDecision?.toString() ?? null,
      purpose: this.purpose?.toString() ?? null,
      locale: this.locale,
    });
  }
}
