import { SubjectReference, UtcInstant, VerificationState, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { OrganizationScopeReference, TenantScopeReference } from '../references.ts';
import { AccessDisposition, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext } from '../tenant/tenant-governance.ts';

export const DEPENDENCY_GRAPH_OPERATION = 'credential.lifecycle.dependency-graph';
export const DEPENDENCY_GRAPH_FIELD = 'credential:dependency-graph';

export const LifecycleDependencyNodeType = {
  REGULATORY_SOURCE_VERSION: 'REGULATORY_SOURCE_VERSION',
  RULE_VERSION: 'RULE_VERSION',
  REQUIREMENT_SET_VERSION: 'REQUIREMENT_SET_VERSION',
  CREDENTIAL_DEFINITION_VERSION: 'CREDENTIAL_DEFINITION_VERSION',
  QUALIFICATION_PATH_VERSION: 'QUALIFICATION_PATH_VERSION',
  RECOGNITION_ROUTE_VERSION: 'RECOGNITION_ROUTE_VERSION',
  EVIDENCE_RECORD: 'EVIDENCE_RECORD',
  ELIGIBILITY_ASSESSMENT: 'ELIGIBILITY_ASSESSMENT',
  AUTHORIZATION_GRANT: 'AUTHORIZATION_GRANT',
  PROFESSIONAL_PASSPORT: 'PROFESSIONAL_PASSPORT',
  RENEWAL_POLICY: 'RENEWAL_POLICY',
  RECURRING_OBLIGATION: 'RECURRING_OBLIGATION',
  RENEWAL_CASE: 'RENEWAL_CASE',
  NOTIFICATION_POLICY: 'NOTIFICATION_POLICY',
  ASSIGNMENT_PROFILE: 'ASSIGNMENT_PROFILE',
  ASSIGNMENT_DECISION: 'ASSIGNMENT_DECISION',
  COMPLIANCE_PROJECTION: 'COMPLIANCE_PROJECTION',
} as const;
export type LifecycleDependencyNodeType = (typeof LifecycleDependencyNodeType)[keyof typeof LifecycleDependencyNodeType];

export const LifecycleDependencyEdgeKind = {
  DERIVED_FROM: 'DERIVED_FROM',
  EVALUATED_AGAINST: 'EVALUATED_AGAINST',
  SATISFIES: 'SATISFIES',
  RECOGNIZED_BY: 'RECOGNIZED_BY',
  PROJECTS: 'PROJECTS',
  DEPENDS_ON: 'DEPENDS_ON',
  SUPERSEDES: 'SUPERSEDES',
  APPLIES_TO: 'APPLIES_TO',
} as const;
export type LifecycleDependencyEdgeKind = (typeof LifecycleDependencyEdgeKind)[keyof typeof LifecycleDependencyEdgeKind];

export const LifecycleDependencyImpactMode = {
  MANDATORY: 'MANDATORY',
  ADVISORY: 'ADVISORY',
  REVIEW_ONLY: 'REVIEW_ONLY',
} as const;
export type LifecycleDependencyImpactMode = (typeof LifecycleDependencyImpactMode)[keyof typeof LifecycleDependencyImpactMode];

export const LifecycleChangeType = {
  REGULATORY_RULE_CHANGED: 'REGULATORY_RULE_CHANGED',
  REQUIREMENT_SET_CHANGED: 'REQUIREMENT_SET_CHANGED',
  CREDENTIAL_STATUS_CHANGED: 'CREDENTIAL_STATUS_CHANGED',
  EVIDENCE_VERIFICATION_CHANGED: 'EVIDENCE_VERIFICATION_CHANGED',
  RECOGNITION_DECISION_CHANGED: 'RECOGNITION_DECISION_CHANGED',
  ROLE_CHANGED: 'ROLE_CHANGED',
  DELEGATION_CHANGED: 'DELEGATION_CHANGED',
  ASSIGNMENT_SCOPE_CHANGED: 'ASSIGNMENT_SCOPE_CHANGED',
  ORGANIZATION_STATUS_CHANGED: 'ORGANIZATION_STATUS_CHANGED',
  CATALOG_MAPPING_CHANGED: 'CATALOG_MAPPING_CHANGED',
  CLOCK_BOUNDARY_REACHED: 'CLOCK_BOUNDARY_REACHED',
} as const;
export type LifecycleChangeType = (typeof LifecycleChangeType)[keyof typeof LifecycleChangeType];

export const LifecycleDependencyImpactOutcome = {
  NO_IMPACT: 'NO_IMPACT',
  IMPACT_CANDIDATES: 'IMPACT_CANDIDATES',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type LifecycleDependencyImpactOutcome = (typeof LifecycleDependencyImpactOutcome)[keyof typeof LifecycleDependencyImpactOutcome];

type DeepReadonly<T> = T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
const NODE_TYPES = Object.freeze(Object.values(LifecycleDependencyNodeType));
const EDGE_KINDS = Object.freeze(Object.values(LifecycleDependencyEdgeKind));
const IMPACT_MODES = Object.freeze(Object.values(LifecycleDependencyImpactMode));
const CHANGE_TYPES = Object.freeze(Object.values(LifecycleChangeType));
const VERSION_REQUIRED = new Set<LifecycleDependencyNodeType>([
  LifecycleDependencyNodeType.REGULATORY_SOURCE_VERSION,
  LifecycleDependencyNodeType.RULE_VERSION,
  LifecycleDependencyNodeType.REQUIREMENT_SET_VERSION,
  LifecycleDependencyNodeType.CREDENTIAL_DEFINITION_VERSION,
  LifecycleDependencyNodeType.QUALIFICATION_PATH_VERSION,
  LifecycleDependencyNodeType.RECOGNITION_ROUTE_VERSION,
  LifecycleDependencyNodeType.RENEWAL_POLICY,
  LifecycleDependencyNodeType.RECURRING_OBLIGATION,
  LifecycleDependencyNodeType.NOTIFICATION_POLICY,
  LifecycleDependencyNodeType.ASSIGNMENT_PROFILE,
]);
const MAX_NODES = 256;
const MAX_EDGES = 2048;
const MODE_RANK: Readonly<Record<LifecycleDependencyImpactMode, number>> = Object.freeze({
  ADVISORY: 1,
  MANDATORY: 2,
  REVIEW_ONLY: 3,
});

function opaque(value: string, max = 256): string {
  if (typeof value !== 'string' || value.length === 0 || value.length > max || !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(value)) throw new TypeError('Bounded opaque reference required');
  return value;
}
function instant(value: UtcInstant): number {
  if (!(value instanceof UtcInstant)) throw new TypeError('Explicit UtcInstant required');
  return value.toEpochMilliseconds();
}
function same(a: { toString(): string }, b: { toString(): string }): boolean { return a.toString() === b.toString(); }
function sameSubject(a: SubjectReference | null, b: SubjectReference | null): boolean {
  if (a === null || b === null) return a === b;
  return same(a.id, b.id) && a.kind === b.kind;
}
function compare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function canonical(value: unknown): string { return JSON.stringify(value); }
function integer(value: number, min: number, max: number): number {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new RangeError('Value outside explicit bounds');
  return value;
}
function dense<T>(value: readonly T[], max: number, min = 0): T[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) throw new TypeError('Bounded dense collection required');
  for (let i = 0; i < value.length; i++) if (!(i in value)) throw new TypeError('Sparse collection rejected');
  return Array.from(value);
}
function freeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
function controlled<T extends string>(value: T, allowed: readonly string[], label: string): T {
  if (typeof value !== 'string' || !allowed.includes(value)) throw new TypeError(`${label} must be controlled`);
  return value;
}
function strongest(a: LifecycleDependencyImpactMode | null, b: LifecycleDependencyImpactMode): LifecycleDependencyImpactMode {
  if (a === null) return b;
  return MODE_RANK[a] >= MODE_RANK[b] ? a : b;
}

export interface LifecycleDependencyNodeInput {
  readonly reference: string;
  readonly type: LifecycleDependencyNodeType;
  readonly version: VersionId | null;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly subject: SubjectReference | null;
  readonly jurisdictionReference: string | null;
  readonly provenanceReference: string;
  readonly knownAt: UtcInstant;
}

export class LifecycleDependencyNode {
  readonly reference: string;
  readonly type: LifecycleDependencyNodeType;
  readonly version: VersionId | null;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly subject: SubjectReference | null;
  readonly jurisdictionReference: string | null;
  readonly provenanceReference: string;
  readonly knownAt: UtcInstant;

  private constructor(input: LifecycleDependencyNodeInput) {
    this.reference = input.reference;
    this.type = input.type;
    this.version = input.version;
    this.tenant = input.tenant;
    this.organization = input.organization;
    this.subject = input.subject;
    this.jurisdictionReference = input.jurisdictionReference;
    this.provenanceReference = input.provenanceReference;
    this.knownAt = input.knownAt;
    Object.freeze(this);
  }

  static create(input: LifecycleDependencyNodeInput): LifecycleDependencyNode {
    const type = controlled(input.type, NODE_TYPES, 'Dependency node type');
    if (VERSION_REQUIRED.has(type) && !(input.version instanceof VersionId)) throw new TypeError('Versioned dependency node requires VersionId');
    if (input.version !== null && !(input.version instanceof VersionId)) throw new TypeError('Dependency node version must be VersionId or null');
    if (!(input.tenant instanceof TenantScopeReference) || !(input.organization instanceof OrganizationScopeReference)) throw new TypeError('Dependency node requires tenant and organization scope');
    if (input.subject !== null && !(input.subject instanceof SubjectReference)) throw new TypeError('Dependency node subject must be governed');
    instant(input.knownAt);
    return new LifecycleDependencyNode({
      reference: opaque(input.reference),
      type,
      version: input.version,
      tenant: input.tenant,
      organization: input.organization,
      subject: input.subject,
      jurisdictionReference: input.jurisdictionReference === null ? null : opaque(input.jurisdictionReference),
      provenanceReference: opaque(input.provenanceReference),
      knownAt: input.knownAt,
    });
  }

  toJSON() {
    return freeze({
      reference: this.reference,
      type: this.type,
      version: this.version?.toString() ?? null,
      tenant: this.tenant.toString(),
      organization: this.organization.toString(),
      subject: this.subject === null ? null : { id: this.subject.id.toString(), kind: this.subject.kind },
      jurisdictionReference: this.jurisdictionReference,
      provenanceReference: this.provenanceReference,
      knownAt: this.knownAt.toString(),
    });
  }
}

export interface LifecycleDependencyEdgeInput {
  readonly id: string;
  readonly sourceReference: string;
  readonly targetReference: string;
  readonly kind: LifecycleDependencyEdgeKind;
  readonly impactMode: LifecycleDependencyImpactMode;
  readonly provenanceReference: string;
  readonly knownAt: UtcInstant;
}

export class LifecycleDependencyEdge {
  readonly id: string;
  readonly sourceReference: string;
  readonly targetReference: string;
  readonly kind: LifecycleDependencyEdgeKind;
  readonly impactMode: LifecycleDependencyImpactMode;
  readonly provenanceReference: string;
  readonly knownAt: UtcInstant;

  private constructor(input: LifecycleDependencyEdgeInput) {
    Object.assign(this, input);
    Object.freeze(this);
  }

  static create(input: LifecycleDependencyEdgeInput): LifecycleDependencyEdge {
    const sourceReference = opaque(input.sourceReference), targetReference = opaque(input.targetReference);
    if (sourceReference === targetReference) throw new TypeError('Dependency self-edge rejected');
    instant(input.knownAt);
    return new LifecycleDependencyEdge({
      id: opaque(input.id),
      sourceReference,
      targetReference,
      kind: controlled(input.kind, EDGE_KINDS, 'Dependency edge kind'),
      impactMode: controlled(input.impactMode, IMPACT_MODES, 'Dependency impact mode'),
      provenanceReference: opaque(input.provenanceReference),
      knownAt: input.knownAt,
    });
  }

  toJSON() {
    return freeze({
      id: this.id,
      sourceReference: this.sourceReference,
      targetReference: this.targetReference,
      kind: this.kind,
      impactMode: this.impactMode,
      provenanceReference: this.provenanceReference,
      knownAt: this.knownAt.toString(),
    });
  }
}

export interface LifecycleDependencyGraphSnapshotInput {
  readonly id: string;
  readonly version: VersionId;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly subject: SubjectReference | null;
  readonly nodes: readonly LifecycleDependencyNode[];
  readonly edges: readonly LifecycleDependencyEdge[];
  readonly capturedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly provenanceReference: string;
}

export class LifecycleDependencyGraphSnapshot {
  readonly id: string;
  readonly version: VersionId;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly subject: SubjectReference | null;
  readonly nodes: readonly LifecycleDependencyNode[];
  readonly edges: readonly LifecycleDependencyEdge[];
  readonly capturedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly provenanceReference: string;

  private constructor(input: LifecycleDependencyGraphSnapshotInput) {
    this.id = input.id;
    this.version = input.version;
    this.tenant = input.tenant;
    this.organization = input.organization;
    this.subject = input.subject;
    this.nodes = Object.freeze([...input.nodes]);
    this.edges = Object.freeze([...input.edges]);
    this.capturedAt = input.capturedAt;
    this.asKnownAt = input.asKnownAt;
    this.provenanceReference = input.provenanceReference;
    Object.freeze(this);
  }

  static create(input: LifecycleDependencyGraphSnapshotInput): LifecycleDependencyGraphSnapshot {
    if (!(input.version instanceof VersionId) || !(input.tenant instanceof TenantScopeReference) || !(input.organization instanceof OrganizationScopeReference)) throw new TypeError('Governed dependency graph identity and scope required');
    if (input.subject !== null && !(input.subject instanceof SubjectReference)) throw new TypeError('Dependency graph subject must be governed');
    const captured = instant(input.capturedAt), known = instant(input.asKnownAt);
    if (captured > known) throw new RangeError('Graph capture cannot exceed knowledge horizon');
    const nodes = dense(input.nodes, MAX_NODES, 1);
    if (!nodes.every(value => value instanceof LifecycleDependencyNode)) throw new TypeError('Dependency graph nodes must be governed');
    const edges = dense(input.edges, MAX_EDGES, 0);
    if (!edges.every(value => value instanceof LifecycleDependencyEdge)) throw new TypeError('Dependency graph edges must be governed');
    if (new Set(nodes.map(value => value.reference)).size !== nodes.length) throw new TypeError('Duplicate dependency node reference');
    if (new Set(edges.map(value => value.id)).size !== edges.length) throw new TypeError('Duplicate dependency edge identity');
    for (const current of nodes) {
      if (!same(current.tenant, input.tenant) || !same(current.organization, input.organization)) throw new TenantAccessDeniedError();
      if (input.subject === null) {
        if (current.subject !== null) throw new TenantAccessDeniedError();
      } else if (current.subject !== null && !sameSubject(current.subject, input.subject)) throw new TenantAccessDeniedError();
      if (instant(current.knownAt) > known) throw new RangeError('Dependency node exceeds graph knowledge horizon');
    }
    const nodeRefs = new Set(nodes.map(value => value.reference));
    for (const current of edges) {
      if (!nodeRefs.has(current.sourceReference) || !nodeRefs.has(current.targetReference)) throw new TypeError('Dependency edge endpoint missing from graph');
      if (instant(current.knownAt) > known) throw new RangeError('Dependency edge exceeds graph knowledge horizon');
    }
    nodes.sort((a, b) => compare(a.reference, b.reference));
    edges.sort((a, b) => compare(`${a.sourceReference}|${a.targetReference}|${a.kind}|${a.id}`, `${b.sourceReference}|${b.targetReference}|${b.kind}|${b.id}`));
    return new LifecycleDependencyGraphSnapshot({
      id: opaque(input.id),
      version: input.version,
      tenant: input.tenant,
      organization: input.organization,
      subject: input.subject,
      nodes,
      edges,
      capturedAt: input.capturedAt,
      asKnownAt: input.asKnownAt,
      provenanceReference: opaque(input.provenanceReference),
    });
  }

  getNode(reference: string): LifecycleDependencyNode {
    const key = opaque(reference);
    const found = this.nodes.find(value => value.reference === key);
    if (found === undefined) throw new TypeError('Dependency node not found');
    return found;
  }

  toJSON() {
    return freeze({
      id: this.id,
      version: this.version.toString(),
      tenant: this.tenant.toString(),
      organization: this.organization.toString(),
      subject: this.subject === null ? null : { id: this.subject.id.toString(), kind: this.subject.kind },
      nodes: this.nodes.map(value => value.toJSON()),
      edges: this.edges.map(value => value.toJSON()),
      capturedAt: this.capturedAt.toString(),
      asKnownAt: this.asKnownAt.toString(),
      provenanceReference: this.provenanceReference,
    });
  }
}

export interface LifecycleChangeEventInput {
  readonly id: string;
  readonly type: LifecycleChangeType;
  readonly graph: LifecycleDependencyGraphSnapshot;
  readonly rootNodeReference: string;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly subject: SubjectReference | null;
  readonly occurredAt: UtcInstant;
  readonly observedAt: UtcInstant;
  readonly effectiveFrom: UtcInstant | null;
  readonly verificationState: VerificationState;
  readonly jurisdictionReference: string | null;
  readonly provenanceReference: string;
  readonly correlationReference: string;
  readonly causationReference: string | null;
}

export class LifecycleChangeEvent {
  readonly id: string;
  readonly type: LifecycleChangeType;
  readonly graph: LifecycleDependencyGraphSnapshot;
  readonly rootNodeReference: string;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly subject: SubjectReference | null;
  readonly occurredAt: UtcInstant;
  readonly observedAt: UtcInstant;
  readonly effectiveFrom: UtcInstant | null;
  readonly verificationState: VerificationState;
  readonly jurisdictionReference: string | null;
  readonly provenanceReference: string;
  readonly correlationReference: string;
  readonly causationReference: string | null;

  private constructor(input: LifecycleChangeEventInput) {
    Object.assign(this, input);
    Object.freeze(this);
  }

  static create(input: LifecycleChangeEventInput): LifecycleChangeEvent {
    if (!(input.graph instanceof LifecycleDependencyGraphSnapshot) || !(input.tenant instanceof TenantScopeReference) || !(input.organization instanceof OrganizationScopeReference)) throw new TypeError('Governed change event scope required');
    if (input.subject !== null && !(input.subject instanceof SubjectReference)) throw new TypeError('Change event subject must be governed');
    if (!(input.verificationState instanceof VerificationState)) throw new TypeError('Change event verification state required');
    if (!same(input.tenant, input.graph.tenant) || !same(input.organization, input.graph.organization) || !sameSubject(input.subject, input.graph.subject)) throw new TenantAccessDeniedError();
    const occurred = instant(input.occurredAt), observed = instant(input.observedAt);
    if (observed < occurred) throw new RangeError('Change event observed before occurrence');
    if (input.effectiveFrom !== null) instant(input.effectiveFrom);
    const rootNodeReference = opaque(input.rootNodeReference);
    const root = input.graph.getNode(rootNodeReference);
    const jurisdictionReference = input.jurisdictionReference === null ? null : opaque(input.jurisdictionReference);
    if (jurisdictionReference !== null && root.jurisdictionReference !== null && jurisdictionReference !== root.jurisdictionReference) throw new TypeError('Change event jurisdiction mismatch');
    return new LifecycleChangeEvent({
      id: opaque(input.id),
      type: controlled(input.type, CHANGE_TYPES, 'Lifecycle change type'),
      graph: input.graph,
      rootNodeReference,
      tenant: input.tenant,
      organization: input.organization,
      subject: input.subject,
      occurredAt: input.occurredAt,
      observedAt: input.observedAt,
      effectiveFrom: input.effectiveFrom,
      verificationState: input.verificationState,
      jurisdictionReference,
      provenanceReference: opaque(input.provenanceReference),
      correlationReference: opaque(input.correlationReference),
      causationReference: input.causationReference === null ? null : opaque(input.causationReference),
    });
  }

  toJSON() {
    return freeze({
      id: this.id,
      type: this.type,
      graphId: this.graph.id,
      graphVersion: this.graph.version.toString(),
      rootNodeReference: this.rootNodeReference,
      tenant: this.tenant.toString(),
      organization: this.organization.toString(),
      subject: this.subject === null ? null : { id: this.subject.id.toString(), kind: this.subject.kind },
      occurredAt: this.occurredAt.toString(),
      observedAt: this.observedAt.toString(),
      effectiveFrom: this.effectiveFrom?.toString() ?? null,
      verificationState: this.verificationState.toString(),
      jurisdictionReference: this.jurisdictionReference,
      provenanceReference: this.provenanceReference,
      correlationReference: this.correlationReference,
      causationReference: this.causationReference,
    });
  }
}

export interface DependencyImpactTraversalInput {
  readonly context: ApplicationExecutionContext;
  readonly authorizedContext: TenantContext;
  readonly boundary: TenantBoundary;
  readonly accessDecision: TenantAccessDecision;
  readonly graph: LifecycleDependencyGraphSnapshot;
  readonly event: LifecycleChangeEvent;
  readonly evaluatedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly allowedTargetTypes: readonly LifecycleDependencyNodeType[];
  readonly maxDepth: number;
  readonly maxCandidates: number;
  readonly maxPaths: number;
}

export interface DependencyImpactPathView {
  readonly nodes: readonly string[];
  readonly edges: readonly string[];
  readonly impactMode: LifecycleDependencyImpactMode;
}
export interface DependencyImpactVersionView {
  readonly reference: string;
  readonly type: LifecycleDependencyNodeType;
  readonly version: string;
}
export interface DependencyImpactCandidateView {
  readonly targetReference: string;
  readonly targetType: LifecycleDependencyNodeType;
  readonly targetVersion: string | null;
  readonly impactMode: LifecycleDependencyImpactMode;
  readonly reviewRequired: boolean;
  readonly futureImpact: boolean;
  readonly dedupKey: string;
  readonly paths: readonly DependencyImpactPathView[];
  readonly requiredVersions: readonly DependencyImpactVersionView[];
  readonly reasonCodes: readonly string[];
}
export interface DependencyCycleView {
  readonly nodes: readonly string[];
  readonly edges: readonly string[];
  readonly closingNode: string;
}
export interface DependencyImpactTraversalView {
  readonly graphId: string;
  readonly graphVersion: string;
  readonly eventId: string;
  readonly eventType: LifecycleChangeType;
  readonly evaluatedAt: string;
  readonly asKnownAt: string;
  readonly outcome: LifecycleDependencyImpactOutcome;
  readonly complete: boolean;
  readonly futureEffective: boolean;
  readonly candidates: readonly DependencyImpactCandidateView[];
  readonly cycles: readonly DependencyCycleView[];
  readonly reasonCodes: readonly string[];
  readonly readerId: string;
  readonly correlationId: string;
  readonly accessDecisionReference: string;
  readonly accessAuditReference: string;
  readonly authorizationAuthority: false;
  readonly credentialStateMutated: false;
  readonly historicalDecisionMutated: false;
  readonly reevaluationPerformed: false;
  readonly complianceStateChanged: false;
  readonly notificationScheduled: false;
  readonly providerInvoked: false;
  readonly eventsEmitted: 0;
  readonly physicalDeletionAuthorized: false;
}

function assertReader(input: DependencyImpactTraversalInput): void {
  const c = input.context, reader = input.authorizedContext, access = input.accessDecision;
  if (!(c instanceof ApplicationExecutionContext) || !(reader instanceof TenantContext) || !(input.boundary instanceof TenantBoundary) || !(access instanceof TenantAccessDecision)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if (c.tenantScope === null || c.organizationScope === null || c.purpose === null || c.accessDecision === null || c.operation.toString() !== DEPENDENCY_GRAPH_OPERATION) throw new TenantAccessDeniedError();
  if (!same(c.tenantScope, reader.tenant) || !same(c.organizationScope, reader.organization) || !same(c.purpose, reader.purpose) || !same(c.actor.id, reader.actor.id) || c.actor.kind !== reader.actor.kind || !same(c.correlationId, reader.correlationId)) throw new TenantAccessDeniedError();
  if (access.disposition !== AccessDisposition.ALLOW || !same(access.tenant, reader.tenant) || !same(access.purpose, reader.purpose) || !same(access.reference, c.accessDecision) || !access.allowedFields.includes(DEPENDENCY_GRAPH_FIELD)) throw new TenantAccessDeniedError();
  if (!(input.graph instanceof LifecycleDependencyGraphSnapshot)) throw new TenantAccessDeniedError();
  if (!same(input.graph.tenant, reader.tenant) || !same(input.graph.organization, reader.organization)) throw new TenantAccessDeniedError();
  if (input.graph.subject === null) {
    if (c.subject !== null) throw new TenantAccessDeniedError();
  } else {
    if (c.subject === null || !sameSubject(input.graph.subject, c.subject)) throw new TenantAccessDeniedError();
  }
}

interface InternalPath {
  readonly nodes: readonly string[];
  readonly edges: readonly string[];
  readonly impactMode: LifecycleDependencyImpactMode;
}
interface InternalCandidate {
  readonly node: LifecycleDependencyNode;
  impactMode: LifecycleDependencyImpactMode;
  readonly paths: InternalPath[];
  readonly reasons: Set<string>;
}

function propagates(edge: LifecycleDependencyEdge): boolean { return edge.kind !== LifecycleDependencyEdgeKind.SUPERSEDES; }

/** Pure dependency impact traversal. It selects explainable candidates only; no reevaluation, mutation, provider call or authoritative status change occurs. */
export class LifecycleDependencyImpactTraversal {
  readonly #view: DeepReadonly<DependencyImpactTraversalView>;
  private constructor(view: DependencyImpactTraversalView) { this.#view = freeze(view); Object.freeze(this); }
  toJSON(): DeepReadonly<DependencyImpactTraversalView> { return this.#view; }

  static evaluate(input: DependencyImpactTraversalInput): LifecycleDependencyImpactTraversal {
    assertReader(input);
    if (!(input.event instanceof LifecycleChangeEvent) || input.event.graph !== input.graph) throw new TypeError('Change event must bind exact dependency graph');
    const evaluated = instant(input.evaluatedAt), requested = instant(input.context.requestedAt), known = instant(input.asKnownAt);
    if (evaluated !== requested) throw new RangeError('Dependency evaluation instant must match invocation horizon');
    if (known > evaluated || instant(input.graph.asKnownAt) > known || instant(input.graph.capturedAt) > known || instant(input.event.observedAt) > known || instant(input.event.occurredAt) > known) throw new RangeError('Dependency traversal exceeds knowledge horizon');

    const allowed = dense(input.allowedTargetTypes, NODE_TYPES.length, 1).map(value => controlled(value, NODE_TYPES, 'Allowed target node type'));
    if (new Set(allowed).size !== allowed.length) throw new TypeError('Allowed target node types must be unique');
    const allowedSet = new Set<LifecycleDependencyNodeType>(allowed);
    const maxDepth = integer(input.maxDepth, 1, 64), maxCandidates = integer(input.maxCandidates, 1, 512), maxPaths = integer(input.maxPaths, 1, 4096);
    const futureEffective = input.event.effectiveFrom !== null && instant(input.event.effectiveFrom) > evaluated;
    const eventVerified = input.event.verificationState.toString() === 'VERIFIED';

    const adjacency = new Map<string, LifecycleDependencyEdge[]>();
    for (const current of input.graph.edges) {
      const list = adjacency.get(current.sourceReference) ?? [];
      list.push(current);
      adjacency.set(current.sourceReference, list);
    }
    for (const list of adjacency.values()) list.sort((a, b) => compare(`${a.targetReference}|${a.kind}|${a.id}`, `${b.targetReference}|${b.kind}|${b.id}`));

    const candidateMap = new Map<string, InternalCandidate>();
    const cycles: DependencyCycleView[] = [];
    const cycleKeys = new Set<string>();
    const reasons = new Set<string>();
    let budgetReason: string | null = null;
    let pathExpansions = 0;

    const addCandidate = (node: LifecycleDependencyNode, mode: LifecycleDependencyImpactMode, nodes: readonly string[], edges: readonly string[], reason?: string): boolean => {
      let current = candidateMap.get(node.reference);
      if (current === undefined) {
        if (candidateMap.size >= maxCandidates) return false;
        current = { node, impactMode: mode, paths: [], reasons: new Set<string>() };
        candidateMap.set(node.reference, current);
      } else current.impactMode = strongest(current.impactMode, mode);
      const path: InternalPath = Object.freeze({ nodes: Object.freeze([...nodes]), edges: Object.freeze([...edges]), impactMode: mode });
      const key = canonical(path);
      if (!current.paths.some(value => canonical(value) === key)) current.paths.push(path);
      if (reason !== undefined) current.reasons.add(reason);
      return true;
    };

    type QueueItem = { readonly reference: string; readonly nodes: readonly string[]; readonly edges: readonly string[]; readonly mode: LifecycleDependencyImpactMode | null };
    const queue: QueueItem[] = [{ reference: input.event.rootNodeReference, nodes: [input.event.rootNodeReference], edges: [], mode: null }];

    outer: while (queue.length > 0) {
      const current = queue.shift()!;
      const outgoing = (adjacency.get(current.reference) ?? []).filter(propagates);
      if (current.edges.length >= maxDepth && outgoing.length > 0) {
        budgetReason = 'DEPTH_BUDGET_EXCEEDED';
        break;
      }
      for (const currentEdge of adjacency.get(current.reference) ?? []) {
        if (!propagates(currentEdge)) {
          reasons.add('SUPERSEDES_LINEAGE_NOT_PROPAGATED');
          continue;
        }
        pathExpansions += 1;
        if (pathExpansions > maxPaths) {
          budgetReason = 'PATH_BUDGET_EXCEEDED';
          break outer;
        }
        const target = input.graph.getNode(currentEdge.targetReference);
        const pathMode = eventVerified ? strongest(current.mode, currentEdge.impactMode) : LifecycleDependencyImpactMode.REVIEW_ONLY;
        const nextNodes = [...current.nodes, target.reference], nextEdges = [...current.edges, currentEdge.id];
        const cycleIndex = current.nodes.indexOf(target.reference);
        if (cycleIndex >= 0) {
          const cycle: DependencyCycleView = Object.freeze({
            nodes: Object.freeze([...current.nodes.slice(cycleIndex), target.reference]),
            edges: Object.freeze([...current.edges.slice(cycleIndex), currentEdge.id]),
            closingNode: target.reference,
          });
          const cycleKey = canonical(cycle);
          if (!cycleKeys.has(cycleKey)) { cycleKeys.add(cycleKey); cycles.push(cycle); }
          if (allowedSet.has(target.type) && !addCandidate(target, LifecycleDependencyImpactMode.REVIEW_ONLY, nextNodes, nextEdges, 'CYCLE_BOUNDARY_REVIEW_REQUIRED')) {
            budgetReason = 'CANDIDATE_BUDGET_EXCEEDED';
            break outer;
          }
          continue;
        }
        if (allowedSet.has(target.type) && !addCandidate(target, pathMode, nextNodes, nextEdges)) {
          budgetReason = 'CANDIDATE_BUDGET_EXCEEDED';
          break outer;
        }
        queue.push({ reference: target.reference, nodes: nextNodes, edges: nextEdges, mode: pathMode });
      }
    }

    cycles.sort((a, b) => compare(canonical(a), canonical(b)));
    if (!eventVerified) reasons.add('CHANGE_EVENT_REQUIRES_REVIEW');
    if (futureEffective) reasons.add('FUTURE_EFFECTIVE_CHANGE');
    if (cycles.length > 0) reasons.add('CYCLE_DETECTED');
    if (budgetReason !== null) reasons.add(budgetReason);

    const candidates: DependencyImpactCandidateView[] = [...candidateMap.values()]
      .sort((a, b) => compare(a.node.reference, b.node.reference))
      .map(current => {
        const paths = [...current.paths].sort((a, b) => compare(canonical(a), canonical(b)));
        const versionMap = new Map<string, DependencyImpactVersionView>();
        for (const path of paths) for (const reference of path.nodes) {
          const currentNode = input.graph.getNode(reference);
          if (currentNode.version !== null) versionMap.set(currentNode.reference, {
            reference: currentNode.reference,
            type: currentNode.type,
            version: currentNode.version.toString(),
          });
        }
        const requiredVersions = [...versionMap.values()].sort((a, b) => compare(a.reference, b.reference));
        const candidateReasons = new Set(current.reasons);
        candidateReasons.add(`IMPACT_MODE:${current.impactMode}`);
        if (!eventVerified) candidateReasons.add('CHANGE_EVENT_REQUIRES_REVIEW');
        if (futureEffective) candidateReasons.add('FUTURE_EFFECTIVE_CHANGE');
        return {
          targetReference: current.node.reference,
          targetType: current.node.type,
          targetVersion: current.node.version?.toString() ?? null,
          impactMode: current.impactMode,
          reviewRequired: current.impactMode === LifecycleDependencyImpactMode.REVIEW_ONLY,
          futureImpact: futureEffective,
          dedupKey: `impact:${input.graph.id}:${input.graph.version.toString()}:${input.event.id}:${current.node.reference}`,
          paths: paths.map(value => ({ nodes: [...value.nodes], edges: [...value.edges], impactMode: value.impactMode })),
          requiredVersions,
          reasonCodes: [...candidateReasons].sort(compare),
        };
      });

    if (candidates.length === 0) reasons.add('NO_AFFECTED_TARGETS');
    else reasons.add('AFFECTED_TARGETS_IDENTIFIED');
    const reviewCandidate = candidates.some(value => value.reviewRequired);
    const outcome: LifecycleDependencyImpactOutcome =
      budgetReason !== null || cycles.length > 0 || !eventVerified || reviewCandidate
        ? LifecycleDependencyImpactOutcome.REVIEW_REQUIRED
        : candidates.length === 0
          ? LifecycleDependencyImpactOutcome.NO_IMPACT
          : LifecycleDependencyImpactOutcome.IMPACT_CANDIDATES;

    return new LifecycleDependencyImpactTraversal({
      graphId: input.graph.id,
      graphVersion: input.graph.version.toString(),
      eventId: input.event.id,
      eventType: input.event.type,
      evaluatedAt: input.evaluatedAt.toString(),
      asKnownAt: input.asKnownAt.toString(),
      outcome,
      complete: budgetReason === null && cycles.length === 0,
      futureEffective,
      candidates,
      cycles,
      reasonCodes: [...reasons].sort(compare),
      readerId: input.context.actor.id.toString(),
      correlationId: input.context.correlationId.toString(),
      accessDecisionReference: input.accessDecision.reference.toString(),
      accessAuditReference: input.accessDecision.auditReference.toString(),
      authorizationAuthority: false,
      credentialStateMutated: false,
      historicalDecisionMutated: false,
      reevaluationPerformed: false,
      complianceStateChanged: false,
      notificationScheduled: false,
      providerInvoked: false,
      eventsEmitted: 0,
      physicalDeletionAuthorized: false,
    });
  }
}
