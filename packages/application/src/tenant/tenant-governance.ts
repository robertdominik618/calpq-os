import {
  ActorKind,
  ActorReference,
  CorrelationId,
  UtcInstant,
} from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import {
  AccessDecisionReference,
  ApplicationOperationReference,
  OrganizationScopeReference,
  PurposeReference,
  TenantScopeReference,
} from '../references.ts';
import { AuditReference } from '../persistence/unit-of-work.ts';

function requiredText(value: string, label: string, max = 256): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > max) throw new RangeError(`${label} is too long`);
  return normalized;
}

function sameTenant(left: TenantScopeReference, right: TenantScopeReference): boolean {
  return left.toString() === right.toString();
}

export class TenantAccessDeniedError extends Error {
  constructor() {
    super('Access denied');
    this.name = 'TenantAccessDeniedError';
  }
}

export class TenantContext {
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly actor: ActorReference;
  readonly purpose: PurposeReference;
  readonly correlationId: CorrelationId;

  private constructor(input: {
    readonly tenant: TenantScopeReference;
    readonly organization: OrganizationScopeReference;
    readonly actor: ActorReference;
    readonly purpose: PurposeReference;
    readonly correlationId: CorrelationId;
  }) {
    this.tenant = input.tenant;
    this.organization = input.organization;
    this.actor = input.actor;
    this.purpose = input.purpose;
    this.correlationId = input.correlationId;
    Object.freeze(this);
  }

  static create(input: {
    readonly tenant: TenantScopeReference;
    readonly organization: OrganizationScopeReference;
    readonly actor: ActorReference;
    readonly purpose: PurposeReference;
    readonly correlationId: CorrelationId;
  }): TenantContext {
    if (!(input.tenant instanceof TenantScopeReference)) throw new TypeError('TenantContext requires explicit TenantScopeReference');
    if (!(input.organization instanceof OrganizationScopeReference)) throw new TypeError('TenantContext requires OrganizationScopeReference');
    if (!(input.actor instanceof ActorReference)) throw new TypeError('TenantContext requires ActorReference');
    if (!(input.purpose instanceof PurposeReference)) throw new TypeError('TenantContext requires PurposeReference');
    if (!(input.correlationId instanceof CorrelationId)) throw new TypeError('TenantContext requires CorrelationId');
    return new TenantContext(input);
  }

  static fromExecutionContext(context: ApplicationExecutionContext): TenantContext {
    if (!(context instanceof ApplicationExecutionContext)) throw new TenantAccessDeniedError();
    if (context.tenantScope === null || context.organizationScope === null || context.purpose === null) {
      throw new TenantAccessDeniedError();
    }
    return TenantContext.create({
      tenant: context.tenantScope,
      organization: context.organizationScope,
      actor: context.actor,
      purpose: context.purpose,
      correlationId: context.correlationId,
    });
  }
}

export class TenantBoundary {
  readonly #knownTenants: ReadonlySet<string>;

  private constructor(knownTenants: ReadonlySet<string>) {
    this.#knownTenants = knownTenants;
    Object.freeze(this);
  }

  static create(knownTenants: readonly TenantScopeReference[]): TenantBoundary {
    if (!Array.isArray(knownTenants) || knownTenants.length === 0) throw new TypeError('TenantBoundary requires known tenant scopes');
    if (knownTenants.some((tenant) => !(tenant instanceof TenantScopeReference))) throw new TypeError('TenantBoundary requires TenantScopeReference values');
    const keys = knownTenants.map(String);
    if (new Set(keys).size !== keys.length) throw new TypeError('TenantBoundary tenant scopes must be unique');
    return new TenantBoundary(new Set(keys));
  }

  assertKnown(context: TenantContext): void {
    if (!(context instanceof TenantContext) || !this.#knownTenants.has(context.tenant.toString())) {
      throw new TenantAccessDeniedError();
    }
  }
}

export const TenantResourceSurface = {
  REPOSITORY: 'REPOSITORY',
  CACHE: 'CACHE',
  SEARCH: 'SEARCH',
  STORAGE: 'STORAGE',
  WORKER: 'WORKER',
  ASYNC: 'ASYNC',
} as const;
export type TenantResourceSurface = (typeof TenantResourceSurface)[keyof typeof TenantResourceSurface];

export class TenantResourceAddress {
  readonly tenant: TenantScopeReference;
  readonly surface: TenantResourceSurface;
  readonly key: string;
  readonly degraded: boolean;

  private constructor(tenant: TenantScopeReference, surface: TenantResourceSurface, key: string, degraded: boolean) {
    this.tenant = tenant;
    this.surface = surface;
    this.key = key;
    this.degraded = degraded;
    Object.freeze(this);
  }

  static create(context: TenantContext, surface: TenantResourceSurface, key: string): TenantResourceAddress {
    if (!(context instanceof TenantContext)) throw new TypeError('Tenant resource address requires TenantContext');
    if (!Object.values(TenantResourceSurface).includes(surface)) throw new TypeError('Tenant resource surface must be controlled');
    return new TenantResourceAddress(context.tenant, surface, requiredText(key, 'Tenant resource key'), false);
  }

  withDegradedMode(): TenantResourceAddress {
    return new TenantResourceAddress(this.tenant, this.surface, this.key, true);
  }

  toString(): string {
    return `${this.tenant.toString()}::${this.surface}::${this.key}`;
  }
}

export class TenantAsyncEnvelope<T> {
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly actor: ActorReference;
  readonly purpose: PurposeReference;
  readonly correlationId: CorrelationId;
  readonly payload: T;
  readonly attempt: number;

  private constructor(context: TenantContext, payload: T, attempt: number) {
    this.tenant = context.tenant;
    this.organization = context.organization;
    this.actor = context.actor;
    this.purpose = context.purpose;
    this.correlationId = context.correlationId;
    this.payload = payload;
    this.attempt = attempt;
    Object.freeze(this);
  }

  static create<T>(context: TenantContext, payload: T): TenantAsyncEnvelope<T> {
    if (!(context instanceof TenantContext)) throw new TypeError('Tenant async envelope requires TenantContext');
    return new TenantAsyncEnvelope(context, payload, 0);
  }

  nextRetry(): TenantAsyncEnvelope<T> {
    return new TenantAsyncEnvelope(TenantContext.create({
      tenant: this.tenant,
      organization: this.organization,
      actor: this.actor,
      purpose: this.purpose,
      correlationId: this.correlationId,
    }), this.payload, this.attempt + 1);
  }
}

export const AccessDisposition = {
  ALLOW: 'ALLOW',
  DENY: 'DENY',
} as const;
export type AccessDisposition = (typeof AccessDisposition)[keyof typeof AccessDisposition];

export class TenantAccessDecision {
  readonly reference: AccessDecisionReference;
  readonly tenant: TenantScopeReference;
  readonly purpose: PurposeReference;
  readonly disposition: AccessDisposition;
  readonly allowedFields: readonly string[];
  readonly decidedBy: ActorReference;
  readonly auditReference: AuditReference;

  private constructor(input: {
    readonly reference: AccessDecisionReference;
    readonly tenant: TenantScopeReference;
    readonly purpose: PurposeReference;
    readonly disposition: AccessDisposition;
    readonly allowedFields: readonly string[];
    readonly decidedBy: ActorReference;
    readonly auditReference: AuditReference;
  }) {
    this.reference = input.reference;
    this.tenant = input.tenant;
    this.purpose = input.purpose;
    this.disposition = input.disposition;
    this.allowedFields = Object.freeze([...input.allowedFields]);
    this.decidedBy = input.decidedBy;
    this.auditReference = input.auditReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly reference: AccessDecisionReference;
    readonly tenant: TenantScopeReference;
    readonly purpose: PurposeReference;
    readonly disposition: AccessDisposition;
    readonly allowedFields: readonly string[];
    readonly decidedBy: ActorReference;
    readonly auditReference: AuditReference;
  }): TenantAccessDecision {
    if (!(input.reference instanceof AccessDecisionReference)) throw new TypeError('Access decision requires AccessDecisionReference');
    if (!(input.tenant instanceof TenantScopeReference)) throw new TypeError('Access decision requires TenantScopeReference');
    if (!(input.purpose instanceof PurposeReference)) throw new TypeError('Access decision requires PurposeReference');
    if (!Object.values(AccessDisposition).includes(input.disposition)) throw new TypeError('Access disposition must be controlled');
    if (!Array.isArray(input.allowedFields)) throw new TypeError('Access decision allowedFields must be an array');
    const fields = input.allowedFields.map((field) => requiredText(field, 'Allowed field', 128));
    if (new Set(fields).size !== fields.length) throw new TypeError('Access decision allowedFields must be unique');
    if (input.disposition === AccessDisposition.ALLOW && fields.length === 0) throw new TypeError('ALLOW access decision requires minimum-necessary field scope');
    if (!(input.decidedBy instanceof ActorReference)) throw new TypeError('Access decision requires deciding ActorReference');
    if (!(input.auditReference instanceof AuditReference)) throw new TypeError('Access decision requires AuditReference');
    return new TenantAccessDecision({ ...input, allowedFields: fields });
  }
}

export async function executeSensitiveRead(input: {
  readonly context: TenantContext;
  readonly boundary: TenantBoundary;
  readonly resourceTenant: TenantScopeReference;
  readonly accessDecision: TenantAccessDecision;
  readonly requestedFields: readonly string[];
  readonly loader: () => Promise<Readonly<Record<string, unknown>>>;
}): Promise<Readonly<Record<string, unknown>>> {
  if (!(input.context instanceof TenantContext) || !(input.boundary instanceof TenantBoundary)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(input.context);
  if (!(input.resourceTenant instanceof TenantScopeReference) || !sameTenant(input.context.tenant, input.resourceTenant)) {
    throw new TenantAccessDeniedError();
  }
  if (!(input.accessDecision instanceof TenantAccessDecision)) throw new TenantAccessDeniedError();
  if (!sameTenant(input.context.tenant, input.accessDecision.tenant)) throw new TenantAccessDeniedError();
  if (input.context.purpose.toString() !== input.accessDecision.purpose.toString()) throw new TenantAccessDeniedError();
  if (input.accessDecision.disposition !== AccessDisposition.ALLOW) throw new TenantAccessDeniedError();
  if (!Array.isArray(input.requestedFields) || input.requestedFields.length === 0) throw new TenantAccessDeniedError();

  const requested = input.requestedFields.map((field) => requiredText(field, 'Requested field', 128));
  const allowed = new Set(input.accessDecision.allowedFields);
  if (requested.some((field) => !allowed.has(field))) throw new TenantAccessDeniedError();

  const record = await input.loader();
  const disclosed: Record<string, unknown> = {};
  for (const field of requested) {
    if (Object.prototype.hasOwnProperty.call(record, field)) disclosed[field] = record[field];
  }
  return Object.freeze(disclosed);
}

export class SystemTenantContext {
  readonly actor: ActorReference;
  readonly purpose: PurposeReference;
  readonly correlationId: CorrelationId;
  readonly auditReference: AuditReference;
  readonly permittedTenants: readonly TenantScopeReference[];

  private constructor(input: {
    readonly actor: ActorReference;
    readonly purpose: PurposeReference;
    readonly correlationId: CorrelationId;
    readonly auditReference: AuditReference;
    readonly permittedTenants: readonly TenantScopeReference[];
  }) {
    this.actor = input.actor;
    this.purpose = input.purpose;
    this.correlationId = input.correlationId;
    this.auditReference = input.auditReference;
    this.permittedTenants = Object.freeze([...input.permittedTenants]);
    Object.freeze(this);
  }

  static create(input: {
    readonly actor: ActorReference;
    readonly purpose: PurposeReference;
    readonly correlationId: CorrelationId;
    readonly auditReference: AuditReference;
    readonly permittedTenants: readonly TenantScopeReference[];
  }): SystemTenantContext {
    if (!(input.actor instanceof ActorReference) || input.actor.kind !== ActorKind.SYSTEM_PROCESS) {
      throw new TypeError('Cross-tenant system context requires SYSTEM_PROCESS actor');
    }
    if (!(input.purpose instanceof PurposeReference)) throw new TypeError('System tenant context requires PurposeReference');
    if (!(input.correlationId instanceof CorrelationId)) throw new TypeError('System tenant context requires CorrelationId');
    if (!(input.auditReference instanceof AuditReference)) throw new TypeError('System tenant context requires AuditReference');
    if (!Array.isArray(input.permittedTenants) || input.permittedTenants.length === 0 || input.permittedTenants.some((tenant) => !(tenant instanceof TenantScopeReference))) {
      throw new TypeError('System tenant context requires bounded permitted tenant scopes');
    }
    const keys = input.permittedTenants.map(String);
    if (new Set(keys).size !== keys.length) throw new TypeError('System tenant permitted scopes must be unique');
    return new SystemTenantContext(input);
  }

  assertPermitted(tenant: TenantScopeReference): void {
    if (!(tenant instanceof TenantScopeReference) || !this.permittedTenants.some((allowed) => sameTenant(allowed, tenant))) {
      throw new TenantAccessDeniedError();
    }
  }
}

export class TenantAuditEvidence {
  readonly auditReference: AuditReference;
  readonly operation: ApplicationOperationReference;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly actor: ActorReference;
  readonly purpose: PurposeReference;
  readonly correlationId: CorrelationId;
  readonly occurredAt: UtcInstant;
  readonly domainTruth = false as const;

  private constructor(input: {
    readonly auditReference: AuditReference;
    readonly operation: ApplicationOperationReference;
    readonly context: TenantContext;
    readonly occurredAt: UtcInstant;
  }) {
    this.auditReference = input.auditReference;
    this.operation = input.operation;
    this.tenant = input.context.tenant;
    this.organization = input.context.organization;
    this.actor = input.context.actor;
    this.purpose = input.context.purpose;
    this.correlationId = input.context.correlationId;
    this.occurredAt = input.occurredAt;
    Object.freeze(this);
  }

  static create(input: {
    readonly auditReference: AuditReference;
    readonly operation: ApplicationOperationReference;
    readonly context: TenantContext;
    readonly occurredAt: UtcInstant;
  }): TenantAuditEvidence {
    if (!(input.auditReference instanceof AuditReference)) throw new TypeError('Tenant audit evidence requires AuditReference');
    if (!(input.operation instanceof ApplicationOperationReference)) throw new TypeError('Tenant audit evidence requires operation reference');
    if (!(input.context instanceof TenantContext)) throw new TypeError('Tenant audit evidence requires TenantContext');
    if (!(input.occurredAt instanceof UtcInstant)) throw new TypeError('Tenant audit evidence requires UtcInstant');
    return new TenantAuditEvidence(input);
  }
}
