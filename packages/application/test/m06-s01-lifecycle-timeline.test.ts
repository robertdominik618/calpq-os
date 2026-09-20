import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ActorId, ActorKind, ActorReference, AggregateId, AggregateType, ArtifactFormat,
  CommandId, ContentHash, CorrelationId, CredentialArtifact, CredentialArtifactId,
  CredentialArtifactKind, CredentialDefinitionId, CredentialDefinitionReference,
  DateOnly, DecisionId, EventEnvelope, EventId, EventType, EvidenceId, EvidenceKind,
  EvidenceReference, EvidenceSnapshot, ExternalArtifactReference, Jurisdiction,
  Revision, SourceId, SourceReference, SourceType, SubjectId, SubjectKind,
  SubjectReference, UtcInstant, VerificationState, VerificationStateCode, VersionId,
} from '../../core/src/index.ts';
import {
  AccessDecisionReference, AccessDisposition, ActivityTimelineOrdering,
  ActivityTimelineReferenceKind, ApplicationExecutionContext, ApplicationOperationReference,
  AuditReference, OrganizationScopeReference, PurposeReference, TenantAccessDecision,
  TenantAccessDeniedError, TenantBoundary, TenantContext, TenantScopeReference,
} from '../src/index.ts';
import {
  CREDENTIAL_LIFECYCLE_READ_FIELD, CREDENTIAL_LIFECYCLE_READ_OPERATION,
  CredentialLifecycleBasis, CredentialLifecycleDateKind, CredentialLifecycleEventBinding,
  CredentialLifecycleIssueCode as Issue, CredentialLifecycleTimelineReadModel,
} from '../src/lifecycle/index.ts';
import type { CredentialLifecycleBasisInput, CredentialLifecycleTimelineInput } from '../src/lifecycle/index.ts';

const uuid = (n: number) => `018f3f7e-6666-7abc-8def-${String(n).padStart(12, '0')}`;
const at = (s: string) => UtcInstant.from(s);
const day = (s: string) => DateOnly.from(s);
const T0 = at('2026-01-01T00:00:00Z'), O1 = at('2026-02-01T00:00:00Z'), O2 = at('2026-03-01T00:00:00Z');
const EVAL = at('2026-06-01T00:00:00Z'), KNOWN = at('2026-09-01T00:00:00Z');
const REQUEST = at('2026-09-02T00:00:00Z'), FUTURE = at('2026-10-01T00:00:00Z');
const V = VersionId.from('contract-v1'), RULE = VersionId.from('rule-v1');
const TENANT = TenantScopeReference.from('tenant:lifecycle'), ORG = OrganizationScopeReference.from('org:lifecycle');
const PURPOSE = PurposeReference.from('purpose:credential-lifecycle');
const ACTOR = ActorReference.create(ActorId.from(uuid(1)), ActorKind.HUMAN_USER);
const ISSUER = ActorReference.create(ActorId.from(uuid(2)), ActorKind.HUMAN_USER);
const SUBJECT = SubjectReference.create(SubjectId.from(uuid(3)), SubjectKind.PERSON);
const CORRELATION = CorrelationId.from(uuid(4)), ACCESS = AccessDecisionReference.from('access:lifecycle-read');
const CZ = Jurisdiction.fromCode('CZ'), AGGREGATE = AggregateId.from(uuid(5));
const AGGREGATE_TYPE = AggregateType.from('CREDENTIAL');
const VERIFY = VerificationState.from(VerificationStateCode.UNVERIFIED);

type ArtifactInput = Parameters<typeof CredentialArtifact.create>[0];
type SourceInput = Parameters<typeof SourceReference.create>[0];
type ContextInput = Parameters<typeof ApplicationExecutionContext.create>[0];
function source(overrides: Partial<SourceInput> = {}) {
  return SourceReference.create({ id: SourceId.from(uuid(20)), authority: ISSUER, jurisdiction: CZ,
    sourceType: SourceType.ISSUER_RECORD, version: VersionId.from('source-v1'), retrievedAt: T0,
    verificationState: VERIFY, canonicalLocator: 'https://private.invalid/SECRET-SOURCE',
    contentHash: ContentHash.sha256('b'.repeat(64)), ...overrides });
}
function fixture(options: { artifact?: Partial<ArtifactInput>; basis?: Partial<CredentialLifecycleBasisInput> } = {}) {
  const src = source();
  const original = EvidenceReference.original({ id: EvidenceId.from(uuid(10)), kind: EvidenceKind.DOCUMENT,
    contentReference: 's3://PRIVATE-ORIGINAL', mediaType: 'application/pdf', contentHash: ContentHash.sha256('a'.repeat(64)),
    acquiredAt: T0, acquiredBy: ACTOR, source: src, verificationState: VERIFY });
  const derived = EvidenceReference.derived({ id: EvidenceId.from(uuid(11)), kind: EvidenceKind.OCR_TEXT,
    contentReference: 's3://PRIVATE-OCR', mediaType: 'text/plain', contentHash: ContentHash.sha256('c'.repeat(64)),
    acquiredAt: T0, acquiredBy: ACTOR, source: src, verificationState: VERIFY, derivationParent: original.id });
  const evidenceSnapshot = EvidenceSnapshot.capture([original, derived], T0);
  const artifactInput: ArtifactInput = { id: CredentialArtifactId.from(uuid(30)), kind: CredentialArtifactKind.CERTIFICATE,
    format: ArtifactFormat.DOCUMENT, subject: SUBJECT, issuer: ISSUER,
    issuedOn: day('2026-01-01'), effectiveFrom: day('2026-02-01'), expiresOn: day('2026-12-31'),
    verificationState: VERIFY, provenanceRefs: [DecisionId.from(uuid(31))], evidenceSnapshot,
    externalReference: ExternalArtifactReference.create({ externalIdentifier: 'PRIVATE-CREDENTIAL-NUMBER', locator: 's3://PRIVATE-ARTIFACT' }),
    ...options.artifact };
  const artifact = CredentialArtifact.create(artifactInput);
  const basisInput: CredentialLifecycleBasisInput = {
    snapshotReference: 'lifecycle:basis:1', artifact, artifactVersion: VersionId.from('artifact-v1'),
    credentialDefinition: CredentialDefinitionReference.create(CredentialDefinitionId.from(uuid(40)), VersionId.from('definition-v1')),
    aggregateId: AGGREGATE, aggregateType: AGGREGATE_TYPE,
    tenant: TENANT, organization: ORG, purpose: PURPOSE, jurisdiction: CZ, recordedAt: KNOWN,
    sources: [src], ruleVersionRefs: [RULE], ...options.basis };
  const basis = CredentialLifecycleBasis.bind(basisInput);
  return { src, original, derived, evidenceSnapshot, artifact, artifactInput, basisInput, basis };
}
function context(overrides: Partial<ContextInput> = {}) {
  return ApplicationExecutionContext.create({ operation: ApplicationOperationReference.from(CREDENTIAL_LIFECYCLE_READ_OPERATION),
    actor: ACTOR, subject: SUBJECT, tenantScope: TENANT, organizationScope: ORG, purpose: PURPOSE,
    correlationId: CORRELATION, requestedAt: REQUEST, contractVersion: V, accessDecision: ACCESS, ...overrides });
}
function reader(overrides: Partial<Parameters<typeof TenantContext.create>[0]> = {}) {
  return TenantContext.create({ tenant: TENANT, organization: ORG, actor: ACTOR, purpose: PURPOSE, correlationId: CORRELATION, ...overrides });
}
function access(overrides: Partial<Parameters<typeof TenantAccessDecision.create>[0]> = {}) {
  return TenantAccessDecision.create({ reference: ACCESS, tenant: TENANT, purpose: PURPOSE, disposition: AccessDisposition.ALLOW,
    allowedFields: [CREDENTIAL_LIFECYCLE_READ_FIELD], decidedBy: ISSUER, auditReference: AuditReference.from('audit:lifecycle-read'), ...overrides });
}
type Fixture = ReturnType<typeof fixture>;
type EnvelopeInput = Parameters<typeof EventEnvelope.create>[0];
function envelope(f: Fixture, n = 1, overrides: Partial<EnvelopeInput> = {}) {
  return EventEnvelope.create({ eventId: EventId.from(uuid(200 + n)), eventType: EventType.from(n === 1 ? 'CREDENTIAL_RECORDED' : 'CREDENTIAL_REVIEW_RECORDED'),
    aggregateId: f.basis.aggregateId, aggregateType: f.basis.aggregateType, aggregateRevision: Revision.from(n),
    occurredAt: n === 1 ? O1 : O2, commandId: CommandId.from(uuid(300 + n)), correlationId: CORRELATION, actor: ISSUER,
    payload: { privateValue: { text: 'PRIVATE-NESTED-PAYLOAD' } },
    causationId: n === 2 ? EventId.from(uuid(201)) : null,
    ruleVersionRefs: [RULE], contractVersionRefs: [V], provenanceRefs: [DecisionId.from(uuid(31))], evidenceRefs: [f.original.id],
    ...overrides });
}
function binding(f: Fixture, n = 1, overrides: Partial<EnvelopeInput> = {}, knownAt = KNOWN, effectiveAt: UtcInstant | null = null) {
  return CredentialLifecycleEventBinding.bind({ basis: f.basis, event: envelope(f, n, overrides), knownAt, effectiveAt });
}
function project(f = fixture(), overrides: Partial<CredentialLifecycleTimelineInput> = {}) {
  return CredentialLifecycleTimelineReadModel.compose({ context: context(), authorizedContext: reader(),
    boundary: TenantBoundary.create([TENANT]), accessDecision: access(), basis: f.basis,
    events: [binding(f), binding(f, 2)], jurisdiction: CZ, evaluatedAt: EVAL, asKnownAt: KNOWN, ...overrides });
}
const hasIssue = (p: CredentialLifecycleTimelineReadModel, code: string) => p.issues.some(issue => issue.code === code);

test('M06S01-01 governed artifact basis and exact snapshot identity', () => {
  const f = fixture(); assert.equal(f.basis.artifact, f.artifact); assert.equal(f.basis.artifact.evidenceSnapshot, f.evidenceSnapshot);
  assert.equal(f.basis.aggregateId, AGGREGATE); assert.equal(f.basis.toJSON().artifactId, f.artifact.id.toString());
});
test('M06S01-02 subjectless or structural fake artifacts rejected', () => {
  assert.throws(() => fixture({ artifact: { subject: null } }), /subject-bound/);
  const f = fixture(); assert.throws(() => CredentialLifecycleBasis.bind({ ...f.basisInput, artifact: {} as never }), /subject-bound/);
});
test('M06S01-03 tenant organization and purpose require governed references', () => {
  const f = fixture(); for (const key of ['tenant', 'organization', 'purpose', 'jurisdiction'] as const) {
    assert.throws(() => CredentialLifecycleBasis.bind({ ...f.basisInput, [key]: 'untrusted' }), /governed scope/);
  }
});
test('M06S01-04 credential-definition and artifact versions preserved and typed', () => {
  const f = fixture(), view = project(f).data.basis; assert.equal(view.artifactVersion, 'artifact-v1'); assert.equal(view.credentialDefinition.version, 'definition-v1');
  assert.throws(() => CredentialLifecycleBasis.bind({ ...f.basisInput, artifactVersion: 'fake' as never }));
  assert.throws(() => CredentialLifecycleBasis.bind({ ...f.basisInput, credentialDefinition: {} as never }));
});
test('M06S01-05 source retrieval cannot exceed basis recorded time', () => {
  assert.throws(() => fixture({ basis: { sources: [source({ retrievedAt: FUTURE })] } }), /Source retrieval/);
});
test('M06S01-06 evidence capture cannot exceed basis recorded time', () => {
  const f = fixture(); assert.throws(() => fixture({ artifact: { evidenceSnapshot: EvidenceSnapshot.capture([f.original], FUTURE) } }), /Evidence snapshot/);
});
test('M06S01-07 duplicate source version identities rejected', () => {
  const src = source(); assert.throws(() => fixture({ basis: { sources: [src, source()] } }), /Duplicate lifecycle source/);
});
test('M06S01-08 duplicate rule-version references rejected', () => {
  assert.throws(() => fixture({ basis: { ruleVersionRefs: [RULE, VersionId.from(RULE.toString())] } }), /Duplicate lifecycle rule/);
});
test('M06S01-09 basis collections copied and frozen', () => {
  const sources = [source()], rules = [RULE]; const f = fixture({ basis: { sources, ruleVersionRefs: rules } }); sources.pop(); rules.pop();
  assert.equal(f.basis.sources.length, 1); assert.equal(f.basis.ruleVersionRefs.length, 1); assert(Object.isFrozen(f.basis)); assert(Object.isFrozen(f.basis.sources));
});
test('M06S01-10 invalid or raw-content basis reference rejected', () => {
  for (const snapshotReference of ['', ' private ', 'https://private.invalid/file', '<script>payload</script>', 'x'.repeat(257)]) {
    assert.throws(() => fixture({ basis: { snapshotReference } }), /opaque identifier/);
  }
});
test('M06S01-11 only an existing governed envelope may be bound', () => {
  const f = fixture(); assert.throws(() => CredentialLifecycleEventBinding.bind({ basis: f.basis, event: {} as never, knownAt: KNOWN }), /EventEnvelope/);
  const b = binding(f); assert(b.event instanceof EventEnvelope); assert(Object.isFrozen(b));
});
test('M06S01-12 event aggregate identity mismatch rejected', () => {
  const f = fixture(); assert.throws(() => binding(f, 1, { aggregateId: AggregateId.from(uuid(999)) }), /aggregate mismatch/);
});
test('M06S01-13 event aggregate type mismatch rejected', () => {
  const f = fixture(); assert.throws(() => binding(f, 1, { aggregateType: AggregateType.from('OTHER_AGGREGATE') }), /aggregate mismatch/);
});
test('M06S01-14 foreign or duplicate event evidence references rejected', () => {
  const f = fixture(); assert.throws(() => binding(f, 1, { evidenceRefs: [EvidenceId.from(uuid(999))] }), /outside/);
  assert.throws(() => binding(f, 1, { evidenceRefs: [f.original.id, f.original.id] }), /Duplicate event reference/);
});
test('M06S01-15 event known-at cannot predate occurrence', () => {
  const f = fixture(); assert.throws(() => binding(f, 1, {}, T0), /cannot predate/);
});
test('M06S01-16 self-causation and duplicate provenance or version refs rejected', () => {
  const f = fixture(); assert.throws(() => binding(f, 1, { causationId: EventId.from(uuid(201)) }), /cause itself/);
  assert.throws(() => binding(f, 1, { ruleVersionRefs: [RULE, RULE] }), /Duplicate/);
  assert.throws(() => binding(f, 1, { provenanceRefs: [DecisionId.from(uuid(31)), DecisionId.from(uuid(31))] }), /Duplicate/);
});
test('M06S01-17 effective-at stays distinct from occurrence and knowledge', () => {
  const f = fixture(), b = binding(f, 1, {}, KNOWN, T0), p = project(f, { events: [b] });
  assert.equal(p.events[0]!.effectiveAt, T0.toString()); assert.equal(p.events[0]!.occurredAt, O1.toString()); assert.equal(p.events[0]!.knownAt, KNOWN.toString());
});
test('M06S01-18 event cannot cross exact basis snapshots', () => {
  const f = fixture(), g = fixture(); assert.throws(() => project(f, { events: [binding(g)] }), /exact basis/);
});
test('M06S01-19 properly authorized scoped read succeeds', () => {
  const p = project(); assert.equal(p.events.length, 2); assert.equal(p.data.basis.tenant, TENANT.toString());
  assert.equal(p.data.readerId, ACTOR.id.toString()); assert.equal(p.data.accessDecisionReference, ACCESS.toString()); assert.equal(p.data.accessAuditReference, 'audit:lifecycle-read');
});
test('M06S01-20 missing invocation tenant or subject rejected', () => {
  const f = fixture(); for (const change of [{ tenantScope: null }, { subject: null }, { organizationScope: null }, { purpose: null }]) {
    assert.throws(() => project(f, { context: context(change) }), TenantAccessDeniedError);
  }
});
test('M06S01-21 unknown tenant rejected', () => {
  assert.throws(() => project(fixture(), { boundary: TenantBoundary.create([TenantScopeReference.from('tenant:other')]) }), TenantAccessDeniedError);
});
test('M06S01-22 organization mismatch rejected', () => {
  const f = fixture(), other = OrganizationScopeReference.from('org:other');
  assert.throws(() => project(f, { context: context({ organizationScope: other }), authorizedContext: reader({ organization: other }) }), TenantAccessDeniedError);
});
test('M06S01-23 subject identity or kind mismatch rejected', () => {
  assert.throws(() => project(fixture(), { context: context({ subject: SubjectReference.create(SubjectId.from(uuid(999)), SubjectKind.PERSON) }) }), TenantAccessDeniedError);
});
test('M06S01-24 purpose mismatch rejected', () => {
  const f = fixture(), other = PurposeReference.from('purpose:other');
  assert.throws(() => project(f, { authorizedContext: reader({ purpose: other }) }), TenantAccessDeniedError);
  assert.throws(() => project(f, { accessDecision: access({ purpose: other }) }), TenantAccessDeniedError);
});
test('M06S01-25 explicit denial cannot be overridden', () => {
  assert.throws(() => project(fixture(), { accessDecision: access({ disposition: AccessDisposition.DENY }) }), TenantAccessDeniedError);
});
test('M06S01-26 access reference and tenant remain bound', () => {
  const f = fixture(); assert.throws(() => project(f, { accessDecision: access({ reference: AccessDecisionReference.from('access:other') }) }), TenantAccessDeniedError);
  assert.throws(() => project(f, { accessDecision: access({ tenant: TenantScopeReference.from('tenant:other') }) }), TenantAccessDeniedError);
});
test('M06S01-27 minimum field permission required', () => {
  assert.throws(() => project(fixture(), { accessDecision: access({ allowedFields: ['credential:unrelated'] }) }), TenantAccessDeniedError);
});
test('M06S01-28 authorized reader actor must match invocation', () => {
  assert.throws(() => project(fixture(), { authorizedContext: reader({ actor: ISSUER }) }), TenantAccessDeniedError);
});
test('M06S01-29 reader correlation must match invocation', () => {
  assert.throws(() => project(fixture(), { authorizedContext: reader({ correlationId: CorrelationId.from(uuid(999)) }) }), TenantAccessDeniedError);
});
test('M06S01-30 exact read operation required', () => {
  assert.throws(() => project(fixture(), { context: context({ operation: ApplicationOperationReference.from('credential.renew') }) }), TenantAccessDeniedError);
});
test('M06S01-31 requested jurisdiction must match basis', () => {
  assert.throws(() => project(fixture(), { jurisdiction: Jurisdiction.fromCode('CZ-10') }), TenantAccessDeniedError);
});
test('M06S01-32 denial precedes invalid or sensitive basis processing', () => {
  assert.throws(() => project(fixture(), { basis: null as never, accessDecision: access({ disposition: AccessDisposition.DENY }) }), error => error instanceof TenantAccessDeniedError && error.message === 'Access denied');
});
test('M06S01-33 evaluation cannot exceed invocation', () => {
  assert.throws(() => project(fixture(), { evaluatedAt: FUTURE }), /exceeds invocation/);
});
test('M06S01-34 knowledge cutoff cannot exceed invocation', () => {
  assert.throws(() => project(fixture(), { asKnownAt: FUTURE }), /exceeds invocation/);
});
test('M06S01-35 future-known basis cannot enter historical query', () => {
  assert.throws(() => project(fixture(), { asKnownAt: EVAL }), /not available at knowledge cutoff/);
});
test('M06S01-36 inclusive knowledge and occurrence boundaries', () => {
  const f = fixture(), b = binding(f, 1, { occurredAt: KNOWN }); const p = project(f, { events: [b], evaluatedAt: KNOWN });
  assert.equal(p.events.length, 1); assert.equal(p.data.asKnownAt, f.basis.recordedAt.toString());
});
test('M06S01-37 future-known events create no hidden metadata leak', () => {
  const f = fixture(), visible = [binding(f), binding(f, 2)], hidden = binding(f, 3, {}, REQUEST);
  assert.equal(JSON.stringify(project(f, { events: visible })), JSON.stringify(project(f, { events: [...visible, hidden] })));
  assert(!JSON.stringify(project(f, { events: [...visible, hidden] })).includes(hidden.event.eventId.toString()));
});
test('M06S01-38 future occurrence excluded from historical event lane', () => {
  const f = fixture(), b = binding(f, 1, { occurredAt: at('2026-07-01T00:00:00Z') });
  const p = project(f, { events: [b] }); assert.equal(p.events.length, 0); assert(hasIssue(p, Issue.NO_RECORDED_EVENTS));
});
test('M06S01-39 evaluation and knowledge axes remain independent', () => {
  const f = fixture({ basis: { recordedAt: T0 } }); const b = binding(f, 1, {}, O2);
  const before = project(f, { events: [b], asKnownAt: O1, evaluatedAt: EVAL });
  const after = project(f, { events: [b], asKnownAt: KNOWN, evaluatedAt: EVAL });
  assert.equal(before.events.length, 0); assert.equal(after.events.length, 1);
  assert.equal(after.data.evaluatedAt, EVAL.toString()); assert.equal(after.data.asKnownAt, KNOWN.toString());
});
test('M06S01-40 DateOnly never becomes fabricated midnight event', () => {
  const p = project(fixture(), { events: [] }); assert.equal(p.events.length, 0); assert.equal(p.calendarFacts.length, 3);
  for (const fact of p.calendarFacts) { assert.match(fact.date, /^\d{4}-\d{2}-\d{2}$/); assert.equal(fact.precision, 'DATE_ONLY'); assert.equal(fact.eventCreated, false); }
  assert.equal(p.data.calendarComparison, 'NOT_PERFORMED');
});
test('M06S01-41 leap-day and same-day facts preserve exact precision', () => {
  const date = day('2024-02-29'); const f = fixture({ artifact: { issuedOn: date, effectiveFrom: date, expiresOn: date } });
  const p = project(f); assert(p.calendarFacts.every(fact => fact.date === '2024-02-29')); assert.equal(new Set(p.calendarFacts.map(fact => fact.kind)).size, 3);
});
test('M06S01-42 missing expiry is not unlimited validity', () => {
  const p = project(fixture({ artifact: { expiresOn: null } })); assert(hasIssue(p, Issue.EXPIRY_DATE_MISSING));
  assert(!p.calendarFacts.some(fact => fact.kind === CredentialLifecycleDateKind.EXPIRES_ON)); assert(!JSON.stringify(p).includes('UNLIMITED'));
});
test('M06S01-43 missing dates issuer and events are explained', () => {
  const p = project(fixture({ artifact: { issuedOn: null, effectiveFrom: null, expiresOn: null, issuer: null } }), { events: [] });
  for (const code of [Issue.ISSUED_DATE_MISSING, Issue.EFFECTIVE_DATE_MISSING, Issue.EXPIRY_DATE_MISSING, Issue.ISSUER_MISSING, Issue.NO_RECORDED_EVENTS]) assert(hasIssue(p, code));
});
test('M06S01-44 source provenance retained without locator', () => {
  const f = fixture(), src = project(f).data.basis.sources[0]!;
  assert.equal(src.id, f.src.id.toString()); assert.equal(src.version, f.src.version.toString()); assert.equal(src.retrievedAt, T0.toString());
  assert.equal(src.verificationState, 'UNVERIFIED'); assert.equal(src.hash, 'sha256:' + 'b'.repeat(64)); assert(!('canonicalLocator' in src));
});
test('M06S01-45 missing source and rule provenance explicitly reported', () => {
  const p = project(fixture({ basis: { sources: [], ruleVersionRefs: [] } }));
  for (const code of [Issue.SOURCES_MISSING, Issue.RULE_VERSIONS_MISSING, Issue.SOURCE_VERSION_UNRESOLVED, Issue.EVENT_RULE_VERSION_UNRESOLVED]) assert(hasIssue(p, code));
});
test('M06S01-46 unverified inputs remain unverified', () => {
  const f = fixture(), p = project(f); assert.equal(p.data.basis.artifactVerificationState, 'UNVERIFIED');
  assert(p.data.basis.evidence.every(entry => entry.verificationState === 'UNVERIFIED')); assert.equal(f.artifact.verificationState.toString(), 'UNVERIFIED');
});
test('M06S01-47 time passing creates no expiry renewal or authority event', () => {
  const f = fixture({ artifact: { expiresOn: day('2026-03-01') } }); const earlier = project(f, { evaluatedAt: O2 }), later = project(f, { evaluatedAt: EVAL });
  assert.deepEqual(earlier.events, later.events); assert.equal(later.data.renewalPerformed, false); assert.equal(later.data.authorizationAuthority, false);
  assert(!later.events.some(event => /EXPIRED|RENEWED|REVOKED/.test(event.eventType))); assert(!('lifecycleState' in later.data));
});
test('M06S01-48 future effective time preserved without state fabrication', () => {
  const f = fixture(), p = project(f, { events: [binding(f, 1, {}, KNOWN, FUTURE)] });
  assert.equal(p.events[0]!.effectiveAt, FUTURE.toString()); assert.equal(p.events[0]!.occurredAt, O1.toString()); assert.equal(p.decisionAuthority, false);
});
test('M06S01-49 event and calendar ordering independent of input order', () => {
  const f = fixture(), events = [binding(f), binding(f, 2)];
  assert.equal(JSON.stringify(project(f, { events })), JSON.stringify(project(f, { events: [...events].reverse() })));
  const p = project(f); assert.equal(p.events[0]!.eventId, uuid(202)); assert.equal(p.calendarFacts[0]!.kind, CredentialLifecycleDateKind.ISSUED_ON);
});
test('M06S01-50 ties have explicit non-causal ordering', () => {
  const f = fixture(), events = [binding(f, 2, { occurredAt: O1 }), binding(f)]; const p = project(f, { events });
  assert.deepEqual(p.events.map(event => event.eventId), [uuid(201), uuid(202)]); assert(hasIssue(p, Issue.SAME_INSTANT_NON_CAUSAL_ORDER));
  assert.equal(p.data.ordering, ActivityTimelineOrdering.OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK);
});
test('M06S01-51 duplicate visible event IDs rejected', () => {
  const f = fixture(); assert.throws(() => project(f, { events: [binding(f), binding(f, 2, { eventId: EventId.from(uuid(201)), causationId: null })] }), /Duplicate visible lifecycle event identity/);
});
test('M06S01-52 duplicate visible aggregate revisions rejected', () => {
  const f = fixture(); assert.throws(() => project(f, { events: [binding(f), binding(f, 2, { aggregateRevision: Revision.from(1) })] }), /Duplicate visible lifecycle aggregate revision/);
});
test('M06S01-53 conflicting chronology flagged without losing events', () => {
  const f = fixture(), p = project(f, { events: [binding(f, 1, { occurredAt: O2 }), binding(f, 2, { occurredAt: O1 })] });
  assert.equal(p.events.length, 2); assert(hasIssue(p, Issue.REVISION_TIME_CONFLICT)); assert.equal(p.data.chronologyNeedsReview, true);
});
test('M06S01-54 revision gaps do not create invented events', () => {
  const f = fixture(), p = project(f, { events: [binding(f), binding(f, 3)] });
  assert(hasIssue(p, Issue.REVISION_GAP)); assert.deepEqual(p.events.map(event => event.aggregateRevision), [3, 1]);
});
test('M06S01-55 missing and forward causes remain explicit', () => {
  const f = fixture(); const missing = project(f, { events: [binding(f, 1, { causationId: EventId.from(uuid(999)) })] });
  assert(hasIssue(missing, Issue.CAUSATION_NOT_IN_PROVIDED_SET));
  const forward = project(f, { events: [binding(f, 1, { causationId: EventId.from(uuid(202)) }), binding(f, 2, { causationId: null })] });
  assert(hasIssue(forward, Issue.CAUSATION_TIME_CONFLICT)); assert.equal(forward.events.length, 2);
});
test('M06S01-56 causal cycles detected without rewriting history', () => {
  const f = fixture(), events = [binding(f, 1, { causationId: EventId.from(uuid(202)) }), binding(f, 2)];
  const before = JSON.stringify(events); const p = project(f, { events }); assert(hasIssue(p, Issue.CAUSATION_CYCLE));
  assert.deepEqual(p.issues.find(issue => issue.code === Issue.CAUSATION_CYCLE)!.eventIds, [uuid(201), uuid(202)]);
  assert.equal(JSON.stringify(events), before); assert.equal(p.events.length, 2);
});
test('M06S01-57 old and new basis views remain isolated', () => {
  const old = fixture(), newer = fixture({ basis: { snapshotReference: 'lifecycle:basis:2', artifactVersion: VersionId.from('artifact-v2') }, artifact: { expiresOn: day('2027-12-31') } });
  const p = project(old), before = JSON.stringify(p), next = project(newer); assert.equal(JSON.stringify(p), before);
  assert.equal(p.calendarFacts.find(f => f.kind === 'EXPIRES_ON')!.date, '2026-12-31'); assert.equal(next.calendarFacts.find(f => f.kind === 'EXPIRES_ON')!.date, '2027-12-31');
});
test('M06S01-58 serialization excludes raw locators identifiers and payloads', () => {
  const f = fixture(), b = binding(f); for (const value of [project(f), f.basis, b]) {
    const json = JSON.stringify(value); for (const secret of ['PRIVATE-', 'SECRET-SOURCE', 's3://', 'https://private', 'privateValue']) assert(!json.includes(secret));
  }
});
test('M06S01-59 outputs are deeply frozen', () => {
  const p = project(); assert(Object.isFrozen(p)); assert(Object.isFrozen(p.data.basis.sources[0])); assert(Object.isFrozen(p.events[0]!.evidenceIds));
  assert.equal(Reflect.set(p.events[0]!, 'occurredAt', 'changed'), false); assert.throws(() => (p.data.basis.sources as unknown[]).push({}));
  assert(Object.isFrozen(p.calendarFacts[0])); assert(Object.isFrozen(p.issues[0]!.eventIds));
});
test('M06S01-60 upstream objects and nested payloads not mutated or frozen', () => {
  const f = fixture(), nested = { secret: 'PRIVATE-MUTABLE' }, ev = envelope(f, 1, { payload: { nested } });
  const b = CredentialLifecycleEventBinding.bind({ basis: f.basis, event: ev, knownAt: KNOWN }); const before = JSON.stringify(f.artifact);
  const p = project(f, { events: [b] }), serialized = JSON.stringify(p); assert.equal(Object.isFrozen(nested), false);
  nested.secret = 'changed'; assert.equal(JSON.stringify(p), serialized); assert.equal(JSON.stringify(f.artifact), before); assert.equal(b.event, ev);
});
test('M06S01-61 evidence classes hashes states and versions preserved', () => {
  const f = fixture(), evidence = project(f).data.basis.evidence; assert.equal(evidence.length, 2);
  assert.deepEqual(evidence.map(entry => entry.evidenceClass), ['ORIGINAL', 'DERIVED']);
  assert.equal(evidence[0]!.hash, 'sha256:' + 'a'.repeat(64)); assert.equal(evidence[1]!.sourceVersion, 'source-v1');
  assert.equal(evidence[1]!.sourceId, f.src.id.toString()); assert.equal(evidence[1]!.verificationState, 'UNVERIFIED');
});
test('M06S01-62 existing M03 references and ordering reused', () => {
  const f = fixture(), p = project(f); assert.equal(p.data.ordering, ActivityTimelineOrdering.OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK);
  assert(p.data.navigationReferences.some(ref => ref.kind === ActivityTimelineReferenceKind.CREDENTIAL_DEFINITION && ref.id === f.basis.credentialDefinition.id.toString()));
  assert.equal(p.data.navigationReferences.filter(ref => ref.kind === ActivityTimelineReferenceKind.EVIDENCE).length, 2);
});
test('M06S01-63 sparse and over-budget arrays rejected without truncation', () => {
  const f = fixture(), b = binding(f); assert.throws(() => project(f, { events: new Array(2) }), /dense governed/);
  assert.throws(() => project(f, { events: Array(10_001).fill(b) }), /bounded array/);
  assert.throws(() => fixture({ basis: { sources: new Array(1) } }), /dense governed/);
});
test('M06S01-64 repeated output deterministic without fabricated authority or completeness', () => {
  const f = fixture(); const a = project(f), b = project(f); assert.equal(JSON.stringify(a), JSON.stringify(b));
  assert.equal(a.authorizationAuthority, false); assert.equal(a.decisionAuthority, false); assert.equal(a.data.renewalPerformed, false);
  assert.equal(a.data.historyCoverage, 'PROVIDED_EVENTS_ONLY'); assert(hasIssue(a, Issue.HISTORY_COMPLETENESS_NOT_ASSERTED));
  assert.equal(a.toJSON(), a.data); assert(!('payload' in a.events[0]!));
});
