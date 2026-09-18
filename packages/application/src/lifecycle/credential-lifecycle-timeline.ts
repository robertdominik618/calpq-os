import {
  AggregateId, AggregateType, CredentialArtifact, CredentialDefinitionReference,
  DateOnly, DecisionId, EventEnvelope, EventId, Jurisdiction, SourceReference,
  UtcInstant, VersionId,
} from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { OrganizationScopeReference, PurposeReference, TenantScopeReference } from '../references.ts';
import {
  AccessDisposition, TenantAccessDecision, TenantAccessDeniedError,
  TenantBoundary, TenantContext,
} from '../tenant/tenant-governance.ts';
import {
  ActivityTimelineOrdering, ActivityTimelineReference, ActivityTimelineReferenceKind,
} from '../timeline/activity-timeline-read-model.ts';

export const CREDENTIAL_LIFECYCLE_READ_OPERATION = 'credential.lifecycle.timeline.read';
export const CREDENTIAL_LIFECYCLE_READ_FIELD = 'credential:lifecycle-timeline';
const MAX_ITEMS = 10_000;
type RecordedEnvelope = EventEnvelope<Readonly<Record<string, unknown>>>;

function compare(left: string, right: string): number { return left < right ? -1 : left > right ? 1 : 0; }
function same(left: { toString(): string }, right: { toString(): string }): boolean { return left.toString() === right.toString(); }
function instant(value: UtcInstant): number {
  if (!(value instanceof UtcInstant)) throw new TypeError('Lifecycle time requires UtcInstant');
  return value.toEpochMilliseconds();
}
function reference(value: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(value)) {
    throw new TypeError('Lifecycle basis reference requires a bounded opaque identifier');
  }
  return value;
}
function list<T>(values: readonly T[], predicate: (value: T) => boolean, label: string): readonly T[] {
  if (!Array.isArray(values) || values.length > MAX_ITEMS) throw new TypeError(`${label} requires a bounded array`);
  const copied = Array.from(values);
  if (!copied.every(predicate)) throw new TypeError(`${label} requires dense governed values`);
  return Object.freeze(copied);
}
function unique(keys: readonly string[], label: string): void {
  if (new Set(keys).size !== keys.length) throw new TypeError(`Duplicate ${label}`);
}
function sorted(values: readonly string[]): readonly string[] { return Object.freeze([...values].sort(compare)); }
// Only newly assembled plain output is recursively frozen. Domain payloads are never traversed.
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function provenance(ref: DecisionId | EventId) {
  return freeze({ kind: ref instanceof EventId ? 'EVENT' as const : 'DECISION' as const, id: ref.toString() });
}
function sourceKey(source: SourceReference): string { return JSON.stringify([source.id.toString(), source.version.toString()]); }

export interface CredentialLifecycleBasisInput {
  readonly snapshotReference: string;
  readonly artifact: CredentialArtifact;
  readonly artifactVersion: VersionId;
  readonly credentialDefinition: CredentialDefinitionReference;
  readonly aggregateId: AggregateId;
  readonly aggregateType: AggregateType;
  readonly tenant: TenantScopeReference;
  readonly organization: OrganizationScopeReference;
  readonly purpose: PurposeReference;
  readonly jurisdiction: Jurisdiction;
  readonly recordedAt: UtcInstant;
  readonly sources: readonly SourceReference[];
  readonly ruleVersionRefs: readonly VersionId[];
}

/** Scoped, trusted read-side association; not a new evidence store or an authority decision. */
export class CredentialLifecycleBasis {
  readonly snapshotReference!: string;
  readonly artifact!: CredentialArtifact;
  readonly artifactVersion!: VersionId;
  readonly credentialDefinition!: CredentialDefinitionReference;
  readonly aggregateId!: AggregateId;
  readonly aggregateType!: AggregateType;
  readonly tenant!: TenantScopeReference;
  readonly organization!: OrganizationScopeReference;
  readonly purpose!: PurposeReference;
  readonly jurisdiction!: Jurisdiction;
  readonly recordedAt!: UtcInstant;
  readonly sources!: readonly SourceReference[];
  readonly ruleVersionRefs!: readonly VersionId[];
  private constructor(input: CredentialLifecycleBasisInput) { Object.assign(this, input); Object.freeze(this); }

  static bind(input: CredentialLifecycleBasisInput): CredentialLifecycleBasis {
    if (!(input.artifact instanceof CredentialArtifact) || input.artifact.subject === null) throw new TypeError('Lifecycle basis requires a subject-bound CredentialArtifact');
    if (!(input.artifactVersion instanceof VersionId) || !(input.credentialDefinition instanceof CredentialDefinitionReference)) throw new TypeError('Lifecycle basis requires governed artifact and definition versions');
    if (!(input.aggregateId instanceof AggregateId) || !(input.aggregateType instanceof AggregateType)) throw new TypeError('Lifecycle basis requires governed aggregate identity');
    if (!(input.tenant instanceof TenantScopeReference) || !(input.organization instanceof OrganizationScopeReference) || !(input.purpose instanceof PurposeReference) || !(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Lifecycle basis requires governed scope');
    const recorded = instant(input.recordedAt);
    if (instant(input.artifact.evidenceSnapshot.capturedAt) > recorded) throw new RangeError('Evidence snapshot postdates lifecycle basis knowledge');
    const sources = list(input.sources, value => value instanceof SourceReference, 'Lifecycle sources');
    const rules = list(input.ruleVersionRefs, value => value instanceof VersionId, 'Lifecycle rule versions');
    if (sources.some(source => instant(source.retrievedAt) > recorded)) throw new RangeError('Source retrieval postdates lifecycle basis knowledge');
    unique(sources.map(sourceKey), 'lifecycle source/version identity');
    unique(rules.map(String), 'lifecycle rule version');
    return new CredentialLifecycleBasis({
      snapshotReference: reference(input.snapshotReference), artifact: input.artifact,
      artifactVersion: input.artifactVersion, credentialDefinition: input.credentialDefinition,
      aggregateId: input.aggregateId, aggregateType: input.aggregateType,
      tenant: input.tenant, organization: input.organization, purpose: input.purpose,
      jurisdiction: input.jurisdiction, recordedAt: input.recordedAt,
      sources: Object.freeze([...sources].sort((a, b) => compare(sourceKey(a), sourceKey(b)))),
      ruleVersionRefs: Object.freeze([...rules].sort((a, b) => compare(a.toString(), b.toString()))),
    });
  }
  toJSON() { return basisView(this); }
}

function basisView(basis: CredentialLifecycleBasis) {
  return freeze({
    snapshotReference: basis.snapshotReference,
    artifactId: basis.artifact.id.toString(), artifactVersion: basis.artifactVersion.toString(),
    artifactKind: basis.artifact.kind, artifactFormat: basis.artifact.format,
    artifactVerificationState: basis.artifact.verificationState.toJSON(),
    credentialDefinition: { id: basis.credentialDefinition.id.toString(), version: basis.credentialDefinition.version.toString() },
    aggregateId: basis.aggregateId.toString(), aggregateType: basis.aggregateType.toString(),
    tenant: basis.tenant.toString(), organization: basis.organization.toString(), purpose: basis.purpose.toString(),
    subject: { id: basis.artifact.subject!.id.toString(), kind: basis.artifact.subject!.kind },
    jurisdiction: basis.jurisdiction.toString(), recordedAt: basis.recordedAt.toString(),
    issuerId: basis.artifact.issuer?.id.toString() ?? null,
    provenanceRefs: basis.artifact.provenanceRefs.map(provenance).sort((a, b) => compare(`${a.kind}:${a.id}`, `${b.kind}:${b.id}`)),
    evidenceCapturedAt: basis.artifact.evidenceSnapshot.capturedAt.toString(),
    evidence: basis.artifact.evidenceSnapshot.entries.map(entry => ({
      id: entry.evidenceId.toString(), evidenceClass: entry.evidenceClass, kind: entry.evidenceKind,
      hash: entry.contentHash?.toString() ?? null, verificationState: entry.verificationState.toJSON(),
      sourceId: entry.sourceId?.toString() ?? null, sourceVersion: entry.sourceVersion?.toString() ?? null,
    })).sort((a, b) => compare(a.id, b.id)),
    sources: basis.sources.map(source => ({
      id: source.id.toString(), version: source.version.toString(), sourceType: source.sourceType,
      authorityId: source.authority.id.toString(), jurisdiction: source.jurisdiction.toString(),
      retrievedAt: source.retrievedAt.toString(), verificationState: source.verificationState.toJSON(),
      publicationDate: source.publicationDate?.toString() ?? null,
      effectiveFrom: source.effectiveFrom?.toString() ?? null, effectiveTo: source.effectiveTo?.toString() ?? null,
      hash: source.contentHash?.toString() ?? null,
    })),
    ruleVersionRefs: basis.ruleVersionRefs.map(String),
  });
}

export interface CredentialLifecycleEventBindingInput {
  readonly basis: CredentialLifecycleBasis;
  readonly event: RecordedEnvelope;
  readonly knownAt: UtcInstant;
  readonly effectiveAt?: UtcInstant | null;
}

/** Bind a previously recorded event; neither payload interpretation nor event issuance occurs. */
export class CredentialLifecycleEventBinding {
  readonly basis: CredentialLifecycleBasis;
  readonly event: RecordedEnvelope;
  readonly knownAt: UtcInstant;
  readonly effectiveAt: UtcInstant | null;
  private constructor(input: CredentialLifecycleEventBindingInput) {
    this.basis = input.basis; this.event = input.event; this.knownAt = input.knownAt;
    this.effectiveAt = input.effectiveAt ?? null; Object.freeze(this);
  }
  static bind(input: CredentialLifecycleEventBindingInput): CredentialLifecycleEventBinding {
    if (!(input.basis instanceof CredentialLifecycleBasis) || !(input.event instanceof EventEnvelope)) throw new TypeError('Lifecycle event binding requires exact basis and EventEnvelope');
    if (!same(input.event.aggregateId, input.basis.aggregateId) || !same(input.event.aggregateType, input.basis.aggregateType)) throw new TypeError('Lifecycle event aggregate mismatch');
    if (instant(input.knownAt) < instant(input.event.occurredAt)) throw new RangeError('Event knowledge cannot predate occurrence');
    if (input.effectiveAt != null) instant(input.effectiveAt);
    const evidence = new Set(input.basis.artifact.evidenceSnapshot.entries.map(entry => entry.evidenceId.toString()));
    if (input.event.evidenceRefs.some(id => !evidence.has(id.toString()))) throw new TypeError('Event evidence is outside the exact lifecycle snapshot');
    for (const refs of [input.event.evidenceRefs, input.event.ruleVersionRefs, input.event.contractVersionRefs]) {
      unique(refs.map(String), 'event reference');
    }
    unique(input.event.provenanceRefs.map(ref => `${ref instanceof EventId ? 'EVENT' : 'DECISION'}:${ref}`), 'event provenance reference');
    if (input.event.causationId instanceof EventId && same(input.event.causationId, input.event.eventId)) throw new TypeError('Event cannot cause itself');
    return new CredentialLifecycleEventBinding(input);
  }
  toJSON() { return eventView(this); }
}

function eventView(binding: CredentialLifecycleEventBinding) {
  const event = binding.event;
  return freeze({
    eventId: event.eventId.toString(), eventType: event.eventType.toString(),
    aggregateRevision: event.aggregateRevision.toNumber(), occurredAt: event.occurredAt.toString(),
    knownAt: binding.knownAt.toString(), effectiveAt: binding.effectiveAt?.toString() ?? null,
    actor: { id: event.actor.id.toString(), kind: event.actor.kind },
    commandId: event.commandId.toString(), correlationId: event.correlationId.toString(),
    causation: event.causationId === null ? null : {
      kind: event.causationId instanceof EventId ? 'EVENT' as const : 'COMMAND' as const,
      id: event.causationId.toString(),
    },
    ruleVersionRefs: sorted(event.ruleVersionRefs.map(String)),
    contractVersionRefs: sorted(event.contractVersionRefs.map(String)),
    provenanceRefs: event.provenanceRefs.map(provenance).sort((a, b) => compare(`${a.kind}:${a.id}`, `${b.kind}:${b.id}`)),
    evidenceIds: sorted(event.evidenceRefs.map(String)),
    decisionAuthority: false as const,
  });
}

export const CredentialLifecycleDateKind = {
  ISSUED_ON: 'ISSUED_ON', EFFECTIVE_FROM: 'EFFECTIVE_FROM', EXPIRES_ON: 'EXPIRES_ON',
} as const;
export type CredentialLifecycleDateKind = (typeof CredentialLifecycleDateKind)[keyof typeof CredentialLifecycleDateKind];
export interface CredentialLifecycleCalendarFact {
  readonly kind: CredentialLifecycleDateKind;
  readonly date: string;
  readonly precision: 'DATE_ONLY';
  readonly origin: 'DECLARED_ARTIFACT_DATE';
  readonly snapshotReference: string;
  readonly eventCreated: false;
}
export const CredentialLifecycleIssueCode = {
  ISSUED_DATE_MISSING: 'ISSUED_DATE_MISSING', EFFECTIVE_DATE_MISSING: 'EFFECTIVE_DATE_MISSING',
  EXPIRY_DATE_MISSING: 'EXPIRY_DATE_MISSING', ISSUER_MISSING: 'ISSUER_MISSING',
  SOURCES_MISSING: 'SOURCES_MISSING', RULE_VERSIONS_MISSING: 'RULE_VERSIONS_MISSING',
  SOURCE_VERSION_UNRESOLVED: 'SOURCE_VERSION_UNRESOLVED', NO_RECORDED_EVENTS: 'NO_RECORDED_EVENTS',
  HISTORY_COMPLETENESS_NOT_ASSERTED: 'HISTORY_COMPLETENESS_NOT_ASSERTED',
  EVENT_EVIDENCE_MISSING: 'EVENT_EVIDENCE_MISSING', EVENT_RULE_VERSIONS_MISSING: 'EVENT_RULE_VERSIONS_MISSING',
  EVENT_RULE_VERSION_UNRESOLVED: 'EVENT_RULE_VERSION_UNRESOLVED', EFFECTIVE_INSTANT_MISSING: 'EFFECTIVE_INSTANT_MISSING',
  SAME_INSTANT_NON_CAUSAL_ORDER: 'SAME_INSTANT_NON_CAUSAL_ORDER', REVISION_GAP: 'REVISION_GAP',
  REVISION_TIME_CONFLICT: 'REVISION_TIME_CONFLICT', CAUSATION_NOT_IN_PROVIDED_SET: 'CAUSATION_NOT_IN_PROVIDED_SET',
  CAUSATION_TIME_CONFLICT: 'CAUSATION_TIME_CONFLICT', CAUSATION_CYCLE: 'CAUSATION_CYCLE',
} as const;
export type CredentialLifecycleIssueCode = (typeof CredentialLifecycleIssueCode)[keyof typeof CredentialLifecycleIssueCode];
export interface CredentialLifecycleIssue {
  readonly code: CredentialLifecycleIssueCode;
  readonly severity: 'INFORMATION' | 'REVIEW_REQUIRED';
  readonly eventIds: readonly string[];
}
export interface CredentialLifecycleTimelineInput {
  readonly context: ApplicationExecutionContext;
  readonly authorizedContext: TenantContext;
  readonly boundary: TenantBoundary;
  readonly accessDecision: TenantAccessDecision;
  readonly basis: CredentialLifecycleBasis;
  readonly events: readonly CredentialLifecycleEventBinding[];
  readonly jurisdiction: Jurisdiction;
  readonly evaluatedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
}
type DeepReadonly<T> = T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
export interface CredentialLifecycleTimelineView {
  readonly basis: DeepReadonly<ReturnType<typeof basisView>>;
  readonly evaluatedAt: string;
  readonly asKnownAt: string;
  readonly projectedAt: string;
  readonly readerId: string;
  readonly correlationId: string;
  readonly accessDecisionReference: string;
  readonly accessAuditReference: string;
  readonly ordering: typeof ActivityTimelineOrdering.OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK;
  readonly calendarOrdering: 'DATE_ASC_KIND_NON_CAUSAL';
  readonly calendarComparison: 'NOT_PERFORMED';
  readonly historyCoverage: 'PROVIDED_EVENTS_ONLY';
  readonly events: readonly DeepReadonly<ReturnType<typeof eventView>>[];
  readonly calendarFacts: readonly CredentialLifecycleCalendarFact[];
  readonly issues: readonly CredentialLifecycleIssue[];
  readonly chronologyNeedsReview: boolean;
  readonly navigationReferences: readonly Readonly<{ kind: ActivityTimelineReferenceKind; id: string }>[];
  readonly authorizationAuthority: false;
  readonly decisionAuthority: false;
  readonly renewalPerformed: false;
}

function assertReader(input: CredentialLifecycleTimelineInput): void {
  const c = input.context, reader = input.authorizedContext, access = input.accessDecision;
  if (!(c instanceof ApplicationExecutionContext) || !(reader instanceof TenantContext) || !(input.boundary instanceof TenantBoundary) || !(access instanceof TenantAccessDecision)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if (c.tenantScope === null || c.organizationScope === null || c.subject === null || c.purpose === null || c.accessDecision === null || c.operation.toString() !== CREDENTIAL_LIFECYCLE_READ_OPERATION) throw new TenantAccessDeniedError();
  if (!same(c.tenantScope, reader.tenant) || !same(c.organizationScope, reader.organization) || !same(c.purpose, reader.purpose) || !same(c.actor.id, reader.actor.id) || c.actor.kind !== reader.actor.kind || !same(c.correlationId, reader.correlationId)) throw new TenantAccessDeniedError();
  if (access.disposition !== AccessDisposition.ALLOW || !same(access.reference, c.accessDecision) || !same(access.tenant, reader.tenant) || !same(access.purpose, reader.purpose) || !access.allowedFields.includes(CREDENTIAL_LIFECYCLE_READ_FIELD)) throw new TenantAccessDeniedError();
}

export class CredentialLifecycleTimelineReadModel {
  readonly data: CredentialLifecycleTimelineView;
  readonly authorizationAuthority = false as const;
  readonly decisionAuthority = false as const;
  private constructor(data: CredentialLifecycleTimelineView) { this.data = freeze(data); Object.freeze(this); }
  get events() { return this.data.events; }
  get calendarFacts() { return this.data.calendarFacts; }
  get issues() { return this.data.issues; }
  toJSON(): CredentialLifecycleTimelineView { return this.data; }

  static compose(input: CredentialLifecycleTimelineInput): CredentialLifecycleTimelineReadModel {
    assertReader(input);
    const basis = input.basis, c = input.context;
    if (!(basis instanceof CredentialLifecycleBasis)) throw new TypeError('Lifecycle projection requires governed basis');
    if (!same(c.tenantScope!, basis.tenant) || !same(c.organizationScope!, basis.organization) || !same(c.purpose!, basis.purpose) || !same(c.subject!.id, basis.artifact.subject!.id) || c.subject!.kind !== basis.artifact.subject!.kind) throw new TenantAccessDeniedError();
    if (!(input.jurisdiction instanceof Jurisdiction) || !same(input.jurisdiction, basis.jurisdiction)) throw new TenantAccessDeniedError();
    const evaluated = instant(input.evaluatedAt), known = instant(input.asKnownAt), invoked = instant(c.requestedAt);
    if (evaluated > invoked || known > invoked) throw new RangeError('Lifecycle query exceeds invocation time');
    if (instant(basis.recordedAt) > known) throw new RangeError('Lifecycle basis not available at knowledge cutoff');
    const bindings = list(input.events, value => value instanceof CredentialLifecycleEventBinding, 'Lifecycle events');
    if (bindings.some(binding => binding.basis !== basis)) throw new TypeError('Lifecycle events require exact basis binding');
    // Do not report IDs, counts or chronology derived from records outside the requested horizons.
    const visible = bindings.filter(binding => instant(binding.knownAt) <= known && instant(binding.event.occurredAt) <= evaluated);
    unique(visible.map(binding => binding.event.eventId.toString()), 'visible lifecycle event identity');
    unique(visible.map(binding => String(binding.event.aggregateRevision.toNumber())), 'visible lifecycle aggregate revision');
    visible.sort((a, b) => instant(b.event.occurredAt) - instant(a.event.occurredAt) || compare(a.event.eventId.toString(), b.event.eventId.toString()));

    const issueMap = new Map<string, CredentialLifecycleIssue>();
    const issue = (code: CredentialLifecycleIssueCode, ids: readonly string[] = [], review = false): void => {
      const eventIds = sorted([...new Set(ids)]), key = JSON.stringify([code, eventIds]);
      issueMap.set(key, freeze({ code, severity: review ? 'REVIEW_REQUIRED' as const : 'INFORMATION' as const, eventIds }));
    };
    issue(CredentialLifecycleIssueCode.HISTORY_COMPLETENESS_NOT_ASSERTED);
    if (visible.length === 0) issue(CredentialLifecycleIssueCode.NO_RECORDED_EVENTS);
    if (basis.artifact.issuer === null) issue(CredentialLifecycleIssueCode.ISSUER_MISSING);
    if (basis.sources.length === 0) issue(CredentialLifecycleIssueCode.SOURCES_MISSING);
    if (basis.ruleVersionRefs.length === 0) issue(CredentialLifecycleIssueCode.RULE_VERSIONS_MISSING);
    const sourceKeys = new Set(basis.sources.map(sourceKey));
    if (basis.artifact.evidenceSnapshot.entries.some(entry => entry.sourceId !== null && !sourceKeys.has(JSON.stringify([entry.sourceId.toString(), entry.sourceVersion?.toString() ?? null])))) issue(CredentialLifecycleIssueCode.SOURCE_VERSION_UNRESOLVED);
    const calendarFacts: CredentialLifecycleCalendarFact[] = [];
    const dates: ReadonlyArray<readonly [CredentialLifecycleDateKind, DateOnly | null, CredentialLifecycleIssueCode]> = [
      [CredentialLifecycleDateKind.ISSUED_ON, basis.artifact.issuedOn, CredentialLifecycleIssueCode.ISSUED_DATE_MISSING],
      [CredentialLifecycleDateKind.EFFECTIVE_FROM, basis.artifact.effectiveFrom, CredentialLifecycleIssueCode.EFFECTIVE_DATE_MISSING],
      [CredentialLifecycleDateKind.EXPIRES_ON, basis.artifact.expiresOn, CredentialLifecycleIssueCode.EXPIRY_DATE_MISSING],
    ];
    for (const [kind, date, missing] of dates) {
      if (date === null) issue(missing);
      else calendarFacts.push(freeze({kind, date: date.toString(), precision: 'DATE_ONLY' as const, origin: 'DECLARED_ARTIFACT_DATE' as const, snapshotReference: basis.snapshotReference, eventCreated: false as const}));
    }
    calendarFacts.sort((a, b) => compare(a.date, b.date) || compare(a.kind, b.kind));
    const byId = new Map(visible.map(binding => [binding.event.eventId.toString(), binding]));
    const times = new Map<string, string[]>();
    const rules = new Set(basis.ruleVersionRefs.map(String));
    for (const binding of visible) {
      const event = binding.event, id = event.eventId.toString(), time = event.occurredAt.toString();
      const atTime = times.get(time) ?? []; atTime.push(id); times.set(time, atTime);
      if (event.evidenceRefs.length === 0) issue(CredentialLifecycleIssueCode.EVENT_EVIDENCE_MISSING, [id]);
      if (event.ruleVersionRefs.length === 0) issue(CredentialLifecycleIssueCode.EVENT_RULE_VERSIONS_MISSING, [id]);
      if (event.ruleVersionRefs.some(version => !rules.has(version.toString()))) issue(CredentialLifecycleIssueCode.EVENT_RULE_VERSION_UNRESOLVED, [id]);
      if (binding.effectiveAt === null) issue(CredentialLifecycleIssueCode.EFFECTIVE_INSTANT_MISSING, [id]);
      if (event.causationId instanceof EventId) {
        const cause = byId.get(event.causationId.toString());
        if (cause === undefined) issue(CredentialLifecycleIssueCode.CAUSATION_NOT_IN_PROVIDED_SET, [id]);
        else if (instant(cause.event.occurredAt) > instant(event.occurredAt) || cause.event.aggregateRevision.toNumber() >= event.aggregateRevision.toNumber()) issue(CredentialLifecycleIssueCode.CAUSATION_TIME_CONFLICT, [id, cause.event.eventId.toString()], true);
      }
    }
    for (const ids of times.values()) if (ids.length > 1) issue(CredentialLifecycleIssueCode.SAME_INSTANT_NON_CAUSAL_ORDER, ids);
    const byRevision = [...visible].sort((a, b) => a.event.aggregateRevision.toNumber() - b.event.aggregateRevision.toNumber());
    for (let i = 0; i < byRevision.length; i++) {
      const current = byRevision[i]!, previous = byRevision[i - 1];
      if (previous === undefined) {
        if (current.event.aggregateRevision.toNumber() > 1) issue(CredentialLifecycleIssueCode.REVISION_GAP, [current.event.eventId.toString()]);
      } else {
        const ids = [previous.event.eventId.toString(), current.event.eventId.toString()];
        if (current.event.aggregateRevision.toNumber() - previous.event.aggregateRevision.toNumber() > 1) issue(CredentialLifecycleIssueCode.REVISION_GAP, ids);
        if (instant(previous.event.occurredAt) > instant(current.event.occurredAt)) issue(CredentialLifecycleIssueCode.REVISION_TIME_CONFLICT, ids, true);
      }
    }
    // One outgoing event-cause edge per event: iterative linear traversal avoids recursive stack growth.
    const finished = new Set<string>();
    for (const binding of visible) {
      const chain: string[] = [], positions = new Map<string, number>();
      let current: CredentialLifecycleEventBinding | undefined = binding;
      while (current !== undefined) {
        const id = current.event.eventId.toString();
        if (finished.has(id)) break;
        const seen = positions.get(id);
        if (seen !== undefined) { issue(CredentialLifecycleIssueCode.CAUSATION_CYCLE, chain.slice(seen), true); break; }
        positions.set(id, chain.length); chain.push(id);
        current = current.event.causationId instanceof EventId ? byId.get(current.event.causationId.toString()) : undefined;
      }
      for (const id of chain) finished.add(id);
    }
    const issues = [...issueMap.entries()].sort((a, b) => compare(a[0], b[0])).map(([, value]) => value);
    const navigationReferences = [
      ActivityTimelineReference.create(ActivityTimelineReferenceKind.CREDENTIAL_DEFINITION, basis.credentialDefinition.id.toString()),
      ...basis.artifact.evidenceSnapshot.entries.map(entry => ActivityTimelineReference.create(ActivityTimelineReferenceKind.EVIDENCE, entry.evidenceId.toString())),
    ].map(ref => ref.toJSON()).sort((a, b) => compare(`${a.kind}:${a.id}`, `${b.kind}:${b.id}`));
    return new CredentialLifecycleTimelineReadModel({
      basis: basisView(basis), evaluatedAt: input.evaluatedAt.toString(), asKnownAt: input.asKnownAt.toString(),
      projectedAt: c.requestedAt.toString(), readerId: c.actor.id.toString(), correlationId: c.correlationId.toString(),
      accessDecisionReference: input.accessDecision.reference.toString(), accessAuditReference: input.accessDecision.auditReference.toString(),
      ordering: ActivityTimelineOrdering.OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK,
      calendarOrdering: 'DATE_ASC_KIND_NON_CAUSAL', calendarComparison: 'NOT_PERFORMED', historyCoverage: 'PROVIDED_EVENTS_ONLY',
      events: visible.map(eventView), calendarFacts, issues,
      chronologyNeedsReview: issues.some(value => value.severity === 'REVIEW_REQUIRED'), navigationReferences,
      authorizationAuthority: false, decisionAuthority: false, renewalPerformed: false,
    });
  }
}
