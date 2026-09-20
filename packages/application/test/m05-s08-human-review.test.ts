import test from 'node:test';
import assert from 'node:assert/strict';
import { ActorId, ActorKind, ActorReference, CommandId, ContentHash, CorrelationId, EvidenceId, EvidenceKind, EvidenceReference, Jurisdiction, SourceId, SubjectId, SubjectKind, SubjectReference, UtcInstant, VerificationState, VerificationStateCode, VersionId } from '../../core/src/index.ts';
import { AccessDecisionReference, ApplicationExecutionContext, ApplicationOperationReference, AuditReference, OrganizationScopeReference, PurposeReference, TenantScopeReference } from '../src/index.ts';
import type { ApplicationExecutionContextInput } from '../src/index.ts';
import { DocumentIntakeId, IntakeChannelProvenance, IntakeMediaMetadata, IntakeSecurityClassification, MultiChannelIntakeSubmission } from '../src/intake/index.ts';
import { ArchiveByteIntegrityObservation, OriginalArchiveEntry } from '../src/archive/original-document-archive.ts';
import { IntakeSecurityAssessment, IntakeSecurityControl, IntakeSecurityObservation, IntakeSecurityObservationOutcome, IntakeSecurityObservationReason, SecurityControlPolicy, SecurityScannerReference } from '../src/security/index.ts';
import { AccessDisposition, TenantAccessDecision } from '../src/tenant/tenant-governance.ts';
import { AuthorityResolutionResult, AuthorityRole, AuthorityScope, AuthorityScopeId, TrustAnchorKind, TrustAnchorRecord, TrustAnchorRecordId, TrustAnchorVerificationState, TrustEntity, TrustEntityId, TrustEntityKind, TrustEntityStatus, TrustIdentifier, TrustIdentifierKind, TrustRegistrySnapshot, TrustRegistrySnapshotId, TrustResolutionId } from '../src/trust/index.ts';
import { VerificationAssuranceLevel, VerificationAttemptId, VerificationMethod, VerificationProviderRequest, VerificationProviderResult, VerificationRequest, VerificationRequestId, VerificationRouteDefinition, VerificationRouteId, VerificationRouteOutcome, VerificationRouteRegistrySnapshot, VerificationRouteRegistrySnapshotId, VerificationRouteResult, VerificationRouteState } from '../src/verification/index.ts';
import { HumanReviewAction, HumanReviewCase, HumanReviewCaseId, HumanReviewCommand, HumanReviewHistory, HumanReviewPermission, HumanReviewStatus, HumanReviewerMandate, ManualClaimObservation, ManualObservationOutcome } from '../src/human-review/index.ts';
import type { HumanReviewCaseInput, HumanReviewCommandInput, HumanReviewerMandateInput, ManualClaimObservationInput } from '../src/human-review/index.ts';

const uuid = (n: number) => `018f3f7e-3333-7abc-8def-${String(n).padStart(12, '0')}`;
const at = (value: string) => UtcInstant.from(value);
const T0 = at('2026-01-01T00:00:00Z');
const EVAL = at('2026-05-01T00:00:00Z');
const KNOWN = at('2026-09-01T00:00:00Z');
const OPEN = at('2026-09-02T00:00:00Z');
const CHECK = at('2026-09-03T00:00:00Z');
const SUBMIT = at('2026-09-04T00:00:00Z');
const EXEC = at('2026-09-05T00:00:00Z');
const LATER = at('2026-09-06T00:00:00Z');
const END = at('2026-12-01T00:00:00Z');
const A = 'credential:number';
const B = 'credential:issuer';
const CZ = Jurisdiction.fromCode('CZ');
const PRAGUE = Jurisdiction.fromCode('CZ-10');
const SOURCE = SourceId.from(uuid(90));
const VERSION = VersionId.from('m05-s08-v1');
const actor = (n: number, kind: ActorKind = ActorKind.HUMAN_USER) => ActorReference.create(ActorId.from(uuid(n)), kind);
const ACQUIRER = actor(1), SUBMITTER = actor(2), REVIEWER = actor(3), ADMIN = actor(4), OPENER = actor(5);
const SUBJECT = SubjectReference.create(SubjectId.from(uuid(6)), SubjectKind.PERSON);
const TENANT = TenantScopeReference.from('tenant:m05-s08');
const ORG = OrganizationScopeReference.from('org:m05-s08');
const PURPOSE = PurposeReference.from('purpose:credential-review');
const OPEN_ACCESS = AccessDecisionReference.from('access:case-open');
const REVIEW_ACCESS = AccessDecisionReference.from('access:case-review');

function access(overrides: Partial<Parameters<typeof TenantAccessDecision.create>[0]> = {}) {
  return TenantAccessDecision.create({ reference: REVIEW_ACCESS, tenant: TENANT, purpose: PURPOSE, disposition: AccessDisposition.ALLOW, allowedFields: [A, B], decidedBy: ADMIN, auditReference: AuditReference.from('audit:review-access'), ...overrides });
}
function context(overrides: Partial<ApplicationExecutionContextInput> = {}, opening = false) {
  return ApplicationExecutionContext.create({ operation: ApplicationOperationReference.from(opening ? 'verification.human-review.open' : 'verification.human-review.record'), actor: opening ? OPENER : REVIEWER, subject: SUBJECT, tenantScope: TENANT, organizationScope: ORG, correlationId: CorrelationId.from(uuid(7)), requestedAt: opening ? OPEN : EXEC, contractVersion: VERSION, accessDecision: opening ? OPEN_ACCESS : REVIEW_ACCESS, purpose: PURPOSE, ...overrides });
}
type RouteInput = Parameters<typeof VerificationRouteDefinition.create>[0];
type RequestInput = Parameters<typeof VerificationRequest.create>[0];
function fixture(options: { method?: VerificationMethod; route?: Partial<RouteInput>; request?: Partial<RequestInput>; authority?: 'authorized' | 'conditional' | 'none' | 'denied' | 'conflict'; security?: 'pass' | 'quarantine' | 'missing'; unchecked?: boolean } = {}) {
  const original = EvidenceReference.original({ id: EvidenceId.from(uuid(10)), kind: EvidenceKind.DOCUMENT, contentReference: 'object://private/raw-original', mediaType: 'application/pdf', contentHash: ContentHash.sha256('a'.repeat(64)), acquiredAt: T0, acquiredBy: ACQUIRER, verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED) });
  const intake = MultiChannelIntakeSubmission.create({ id: DocumentIntakeId.from(uuid(11)), provenance: IntakeChannelProvenance.fileUpload('upload:m05-s08'), receivedAt: T0, receivedBy: SUBMITTER, subject: SUBJECT, organization: ORG, originalArtifact: original, media: IntakeMediaMetadata.create({ mediaType: 'application/pdf', byteLength: 1024, originalFileName: 'private-person-document.pdf' }), securityClassification: IntakeSecurityClassification.CONFIDENTIAL });
  const archive = OriginalArchiveEntry.create({ submission: intake, storageObjectReference: 'archive://private/secret-original', archivedAt: T0, encryptionProfileReference: 'encryption:test', accessPolicyReference: 'policy:private', retentionPolicyReference: 'retention:test', integrity: options.unchecked ? ArchiveByteIntegrityObservation.notChecked() : ArchiveByteIntegrityObservation.matched({ observedContentHash: original.contentHash!, checkedAt: T0, methodReference: 'integrity:sha256' }) });
  const scanner = SecurityScannerReference.create({ adapterReference: 'adapter:security:test', engineReference: 'engine:security:test', engineVersion: '1', configurationReference: 'config:security:test' });
  const security = IntakeSecurityAssessment.evaluate({ archiveEntry: archive, policy: SecurityControlPolicy.create({ policyReference: 'security:policy:v1', requiredControls: [IntakeSecurityControl.MALWARE_SCAN] }), observations: options.security === 'missing' ? [] : [IntakeSecurityObservation.create({ archiveEntry: archive, control: IntakeSecurityControl.MALWARE_SCAN, outcome: options.security === 'quarantine' ? IntakeSecurityObservationOutcome.MALICIOUS : IntakeSecurityObservationOutcome.PASS, reason: options.security === 'quarantine' ? IntakeSecurityObservationReason.MALICIOUS_CONTENT : IntakeSecurityObservationReason.CONTROL_PASSED, observedAt: KNOWN, scanner })], evaluatedAt: KNOWN });
  const entity = TrustEntity.create({ id: TrustEntityId.from(uuid(20)), legalName: 'Private Verifier Legal Name', kind: TrustEntityKind.VERIFIER, jurisdictions: [CZ], identifiers: [TrustIdentifier.create({ kind: TrustIdentifierKind.LEGAL_REGISTRY_ID, value: 'CZ-TEST-1', sourceReference: 'registry:test' })], status: TrustEntityStatus.ACTIVE, validFrom: T0, provenanceReference: 'provenance:verifier' });
  const scopes = options.authority === 'denied' ? [] : [A, B].map((claim, n) => AuthorityScope.create({ id: AuthorityScopeId.from(uuid(30 + n)), entity, role: AuthorityRole.VERIFIER, claimScope: claim, jurisdiction: CZ, validFrom: T0, sourceId: SOURCE, sourceVersion: VERSION, conditions: options.authority === 'conditional' ? ['condition:unresolved'] : [] }));
  const anchors = scopes.map((scope, n) => TrustAnchorRecord.create({ id: TrustAnchorRecordId.from(uuid(40 + n)), entity, authorityScope: scope, kind: TrustAnchorKind.OFFICIAL_REGISTRY_ENTRY, sourceId: SOURCE, sourceVersion: VERSION, sourceSnapshotReference: 'snapshot:trust:v1', retrievedAt: T0, validFrom: T0, verificationState: TrustAnchorVerificationState.VERIFIED, provenanceReference: 'provenance:anchor' }));
  const trust = TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(uuid(50)), asKnownAt: KNOWN, entities: [entity], authorityScopes: scopes, anchors, policyVersion: VERSION });
  const routeInput: RouteInput = { id: VerificationRouteId.from(uuid(60)), method: options.method ?? VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION, capability: 'capability:manual-review', verifierEntity: entity, authorityRole: AuthorityRole.VERIFIER, supportedClaims: [A, B], jurisdictions: [CZ], assuranceLevel: VerificationAssuranceLevel.HIGH, priority: 1, state: VerificationRouteState.ACTIVE, validFrom: T0, sourceId: SOURCE, sourceVersion: VERSION, sourceSnapshotReference: 'snapshot:route:v1', retrievedAt: T0, ...options.route };
  const route = VerificationRouteDefinition.create(routeInput);
  const autoRoute = VerificationRouteDefinition.create({ ...routeInput, id: VerificationRouteId.from(uuid(61)), method: VerificationMethod.OFFICIAL_REGISTRY_LOOKUP, capability: 'capability:registry', retrievedAt: T0, validFrom: T0, validTo: null, state: VerificationRouteState.ACTIVE, jurisdictions: [CZ], assuranceLevel: VerificationAssuranceLevel.HIGH });
  const registry = VerificationRouteRegistrySnapshot.create({ id: VerificationRouteRegistrySnapshotId.from(uuid(62)), trustSnapshot: trust, asKnownAt: KNOWN, routes: [route, autoRoute], policyVersion: VERSION });
  const request = VerificationRequest.create({ id: VerificationRequestId.from(uuid(70)), evidence: original, subjectReference: SUBJECT.id.toString(), claims: [A, B], jurisdiction: CZ, useCase: 'credential-review', requiredAssurance: VerificationAssuranceLevel.HIGH, acceptableMethods: [...new Set([route.method, autoRoute.method])], evaluationInstant: EVAL, asKnownAt: KNOWN, idempotencyKey: 'verify:request:1', ...options.request });
  const resolutions = options.authority === 'none' ? [] : [A, B].map((claim, n) => AuthorityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(80 + n)), snapshot: trust, entity, requestedRole: AuthorityRole.VERIFIER, claimScope: claim, jurisdiction: request.jurisdiction, evaluationInstant: request.evaluationInstant, asKnownAt: request.asKnownAt, conflictReferences: options.authority === 'conflict' ? ['conflict:authority'] : [] }));
  const input: HumanReviewCaseInput = { id: HumanReviewCaseId.from(uuid(100)), request, registry, route, intake, security, context: context({}, true), accessDecision: access({ reference: OPEN_ACCESS }), claims: [A, B], authorityResolutions: resolutions, priorResults: [] };
  return { input, original, intake, archive, security, entity, trust, route, autoRoute, registry, request, resolutions, routeInput };
}
const open = (f = fixture(), overrides: Partial<HumanReviewCaseInput> = {}) => HumanReviewCase.open({ ...f.input, ...overrides });
function mandate(c: HumanReviewCase, overrides: Partial<HumanReviewerMandateInput> = {}) {
  return HumanReviewerMandate.create({ reference: 'mandate:reviewer:1', reviewCase: c, reviewer: REVIEWER, grantedBy: ADMIN, verifierEntity: c.route.verifierEntity, accessDecision: access(), claims: c.claims, permissions: c.route.method === VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION ? [HumanReviewPermission.REVIEW, HumanReviewPermission.MANUAL_CONFIRMATION] : [HumanReviewPermission.REVIEW], grantedAt: OPEN, validFrom: OPEN, validUntil: END, sourceId: SOURCE, sourceVersion: VERSION, sourceSnapshotReference: 'snapshot:reviewer-assignment:v1', ...overrides });
}
function observation(c: HumanReviewCase, overrides: Partial<ManualClaimObservationInput> = {}) {
  return ManualClaimObservation.create({ reviewCase: c, claim: A, observation: ManualObservationOutcome.CONFIRMED, assertionFingerprint: 'assertion:A', evidenceReferences: ['evidence:manual-contact'], sourceId: SOURCE, sourceVersion: VERSION, sourceSnapshotReference: 'snapshot:manual-source:v1', sourceRetrievedAt: EVAL, checkedAt: CHECK, ...overrides });
}
function command(c: HumanReviewCase, overrides: Partial<HumanReviewCommandInput> = {}) {
  const claims = overrides.claims ?? [A];
  const action = overrides.action ?? HumanReviewAction.CONFIRM_CLAIMS;
  return HumanReviewCommand.create({ id: CommandId.from(uuid(200)), reviewCase: c, action, claims, observations: action === HumanReviewAction.CONFIRM_CLAIMS ? claims.map(claim => observation(c, { claim })) : [], evidenceReferences: ['evidence:review-input'], rationaleReference: 'rationale:review:1', submittedAt: SUBMIT, idempotencyKey: 'review:command:1', ...overrides });
}
function execute(c: HumanReviewCase, cmd = command(c), options: { history?: HumanReviewHistory; mandate?: HumanReviewerMandate; context?: ApplicationExecutionContext; expectedRevision?: number } = {}) {
  const history = options.history ?? HumanReviewHistory.start(c);
  return history.apply({ command: cmd, context: options.context ?? context(), mandate: options.mandate ?? mandate(c), expectedRevision: options.expectedRevision ?? history.revision });
}
function prior(f: ReturnType<typeof fixture>, outcome: VerificationRouteOutcome, fingerprint = 'assertion:A', route = f.autoRoute, checkedAt = KNOWN) {
  const providerRequest = VerificationProviderRequest.create({ attemptId: VerificationAttemptId.from(uuid(300)), route, request: f.request, claims: [A], idempotencyKey: 'prior:attempt:1' });
  const providerResult = VerificationProviderResult.create({ outcome, adapterReference: 'adapter:registry:test', adapterVersion: '1', checkedClaims: [A], assertionFingerprints: outcome === VerificationRouteOutcome.VERIFIED ? { [A]: fingerprint } : {}, sourceSnapshotReference: 'snapshot:provider:v1', sourceVersionReference: '1', checkedAt, reasonCodes: outcome === VerificationRouteOutcome.INDETERMINATE ? ['PROVIDER_UNAVAILABLE'] : [] });
  return VerificationRouteResult.normalize({ providerRequest, providerResult, authorityResolutions: f.resolutions });
}
const result = (history: HumanReviewHistory) => history.records.at(-1)!.claimResults[0]!;

test('M05S08-01 UUIDv7 identities reject malformed values', () => {
  assert.throws(() => HumanReviewCaseId.from('not-a-uuid'));
  assert.throws(() => HumanReviewCaseId.from(uuid(1).replace('-7abc-', '-4abc-')));
  const c = open(); assert.throws(() => command(c, { id: 'invalid' as never }));
  assert.equal(HumanReviewCaseId.from(uuid(100).toUpperCase()).toString(), uuid(100));
});
test('M05S08-02 case preserves exact governed bindings', () => {
  const f = fixture(), c = open(f); assert.equal(c.request, f.request); assert.equal(c.route, f.route); assert.equal(c.security, f.security); assert.equal(c.intake, f.intake); assert.equal(c.registry, f.registry); assert.equal(HumanReviewHistory.start(c).status, HumanReviewStatus.OPEN);
});
test('M05S08-03 different original evidence is rejected', () => {
  const f = fixture(), g = fixture(); assert.throws(() => open(f, { request: g.request }));
});
test('M05S08-04 different intake identity is rejected', () => {
  const f = fixture(); const intake = MultiChannelIntakeSubmission.create({ id: DocumentIntakeId.from(uuid(12)), provenance: f.intake.provenance, receivedAt: T0, receivedBy: SUBMITTER, subject: SUBJECT, organization: ORG, originalArtifact: f.original, media: f.intake.media, securityClassification: f.intake.securityClassification });
  assert.throws(() => open(f, { intake }));
});
test('M05S08-05 opening organization mismatch is rejected', () => {
  assert.throws(() => open(fixture(), { context: context({ organizationScope: OrganizationScopeReference.from('org:other') }, true) }));
});
test('M05S08-06 opening subject mismatch is rejected', () => {
  assert.throws(() => open(fixture(), { context: context({ subject: SubjectReference.create(SubjectId.from(uuid(99)), SubjectKind.PERSON) }, true) }));
});
test('M05S08-07 noncanonical request subject is rejected', () => {
  assert.throws(() => open(fixture({ request: { subjectReference: 'display-name:not-an-id' } })));
});
test('M05S08-08 missing tenant or purpose is rejected', () => {
  assert.throws(() => open(fixture(), { context: context({ tenantScope: null }, true) }));
  assert.throws(() => open(fixture(), { context: context({ purpose: null }, true) }));
});
test('M05S08-09 automated route cannot become human review', () => {
  assert.throws(() => open(fixture({ method: VerificationMethod.OFFICIAL_REGISTRY_LOOKUP })));
});
test('M05S08-10 unregistered route is rejected', () => {
  const f = fixture(); const route = VerificationRouteDefinition.create({ ...f.routeInput, id: VerificationRouteId.from(uuid(900)) }); assert.throws(() => open(f, { route }));
});
test('M05S08-11 unacceptable route method is rejected', () => {
  assert.throws(() => open(fixture({ request: { acceptableMethods: [VerificationMethod.OFFICIAL_REGISTRY_LOOKUP] } })));
});
test('M05S08-12 insufficient route assurance is rejected', () => {
  assert.throws(() => open(fixture({ route: { assuranceLevel: VerificationAssuranceLevel.BASIC } })));
});
test('M05S08-13 route jurisdiction mismatch is rejected', () => {
  assert.throws(() => open(fixture({ route: { jurisdictions: [PRAGUE] } })));
});
test('M05S08-14 inactive and ineffective routes are rejected', () => {
  assert.throws(() => open(fixture({ route: { state: VerificationRouteState.INACTIVE } })));
  assert.throws(() => open(fixture({ route: { validFrom: KNOWN } })));
});
test('M05S08-15 future-known route cannot enter historical review', () => {
  assert.throws(() => open(fixture({ route: { retrievedAt: KNOWN }, request: { asKnownAt: EVAL } })));
});
test('M05S08-16 opening cannot predate required snapshots', () => {
  assert.throws(() => open(fixture(), { context: context({ requestedAt: EVAL }, true) }));
});
test('M05S08-17 foreign authority snapshot is rejected', () => {
  assert.throws(() => open(fixture(), { authorityResolutions: fixture().resolutions }));
});
test('M05S08-18 prior results must bind exact request and knowledge cutoff', () => {
  const f = fixture(); assert.throws(() => open(fixture(), { priorResults: [prior(f, VerificationRouteOutcome.VERIFIED)] }));
  const futureResult = prior(f, VerificationRouteOutcome.VERIFIED, 'assertion:A', f.autoRoute, OPEN);
  assert.throws(() => open(f, { priorResults: [futureResult] }), /Prior result must bind exact request, registry and known time/);
});
test('M05S08-19 prior result outside route registry is rejected', () => {
  const f = fixture(); const route = VerificationRouteDefinition.create({ ...f.routeInput, id: VerificationRouteId.from(uuid(901)), method: VerificationMethod.OFFICIAL_REGISTRY_LOOKUP }); const p = prior(f, VerificationRouteOutcome.VERIFIED, 'assertion:A', route); assert.throws(() => open(f, { priorResults: [p] }));
});
test('M05S08-20 duplicate authority resolution identities are rejected', () => {
  const f = fixture(); assert.throws(() => open(f, { authorityResolutions: [f.resolutions[0]!, f.resolutions[0]!] }));
});
test('M05S08-21 case collections are copied and frozen', () => {
  const f = fixture(), claims = [B, A], resolutions = [...f.resolutions]; const c = open(f, { claims, authorityResolutions: resolutions }); claims.pop(); resolutions.pop(); assert.deepEqual(c.claims, [B, A].sort()); assert.equal(c.authorityResolutions.length, 2); assert(Object.isFrozen(c)); assert(Object.isFrozen(c.claims)); assert.throws(() => (c.claims as string[]).push('other'));
});
test('M05S08-22 case summary excludes raw document and storage data', () => {
  const summary = JSON.stringify(open()); for (const forbidden of ['private-person-document', 'object://', 'archive://', 'Private Verifier Legal Name']) assert(!summary.includes(forbidden)); assert(summary.includes('securityDisposition'));
});
test('M05S08-23 valid reviewer mandate preserves provenance', () => {
  const c = open(), m = mandate(c); assert.equal(m.reviewCase, c); assert.equal(m.reviewer, REVIEWER); assert.equal(m.verifierEntity, c.route.verifierEntity); assert.equal(m.toJSON().sourceVersion, VERSION.toString()); assert(Object.isFrozen(m.permissions));
});
test('M05S08-24 nonhuman reviewer and self-grant are rejected', () => {
  const c = open(); assert.throws(() => mandate(c, { reviewer: actor(3, ActorKind.SYSTEM_PROCESS) })); assert.throws(() => mandate(c, { grantedBy: REVIEWER }));
});
test('M05S08-25 acquiring and submitting actors cannot self-review', () => {
  const c = open(); assert.throws(() => mandate(c, { reviewer: ACQUIRER })); assert.throws(() => mandate(c, { reviewer: SUBMITTER }));
});
test('M05S08-26 explicitly excluded owner is rejected', () => {
  const c = open(fixture(), { excludedReviewerIds: [REVIEWER.id] }); assert.throws(() => mandate(c));
});
test('M05S08-27 access denial cannot be overridden by mandate', () => {
  const c = open(); assert.throws(() => mandate(c, { accessDecision: access({ disposition: AccessDisposition.DENY }) })); assert.throws(() => open(fixture(), { accessDecision: access({ reference: OPEN_ACCESS, disposition: AccessDisposition.DENY }) }));
});
test('M05S08-28 access tenant and purpose mismatch are rejected', () => {
  const c = open(); assert.throws(() => mandate(c, { accessDecision: access({ tenant: TenantScopeReference.from('tenant:other') }) })); assert.throws(() => mandate(c, { accessDecision: access({ purpose: PurposeReference.from('purpose:other') }) }));
});
test('M05S08-29 mandate verification entity is case-bound', () => {
  const c = open(); assert.throws(() => mandate(c, { verifierEntity: fixture().entity }));
});
test('M05S08-30 mandate claims and permissions are bounded', () => {
  const c = open(); assert.throws(() => mandate(c, { claims: ['unknown:claim'] })); assert.throws(() => mandate(c, { permissions: ['ADMIN' as never] })); assert.throws(() => mandate(c, { permissions: [HumanReviewPermission.REVIEW, HumanReviewPermission.REVIEW] })); assert.throws(() => mandate(c, { accessDecision: access({ allowedFields: [A] }) }));
});
test('M05S08-31 invalid validity and revocation intervals are rejected', () => {
  const c = open(); assert.throws(() => mandate(c, { validFrom: END, validUntil: OPEN })); assert.throws(() => mandate(c, { revokedAt: T0 })); assert.throws(() => mandate(c, { grantedAt: T0 }));
});
test('M05S08-32 expired mandate blocks invocation', () => {
  const c = open(); assert.throws(() => execute(c, command(c), { mandate: mandate(c, { validUntil: SUBMIT }) }));
});
test('M05S08-33 revoked mandate blocks invocation and replay', () => {
  const c = open(), cmd = command(c), h = execute(c, cmd); const revoked = mandate(c, { revokedAt: EXEC }); assert.throws(() => execute(c, cmd, { mandate: revoked })); assert.throws(() => execute(c, cmd, { history: h, mandate: revoked, expectedRevision: 0 }));
});
test('M05S08-34 different invocation reviewer is rejected', () => {
  const c = open(); assert.throws(() => execute(c, command(c), { context: context({ actor: actor(8) }) }));
});
test('M05S08-35 wrong invocation operation is rejected', () => {
  const c = open(); assert.throws(() => execute(c, command(c), { context: context({ operation: ApplicationOperationReference.from('credential.issue') }) }));
});
test('M05S08-36 mismatched access-decision reference is rejected', () => {
  const c = open(); assert.throws(() => execute(c, command(c), { context: context({ accessDecision: AccessDecisionReference.from('access:other') }) }));
});
test('M05S08-37 invocation organization and subject remain case-bound', () => {
  const c = open(), cmd = command(c); assert.throws(() => execute(c, cmd, { context: context({ organizationScope: OrganizationScopeReference.from('org:other') }) })); assert.throws(() => execute(c, cmd, { context: context({ subject: SubjectReference.create(SubjectId.from(uuid(999)), SubjectKind.PERSON) }) }));
});
test('M05S08-38 manual observations require source evidence and fingerprint', () => {
  const c = open(); assert.throws(() => observation(c, { evidenceReferences: [] })); assert.throws(() => observation(c, { sourceSnapshotReference: ' ' })); assert.throws(() => observation(c, { assertionFingerprint: null })); assert.throws(() => observation(c, { sourceId: 'fake' as never })); assert.throws(() => observation(c, { evidenceReferences: ['duplicate', 'duplicate'] }));
});
test('M05S08-39 observation claims remain in exact manual case', () => {
  assert.throws(() => observation(open(), { claim: 'outside:claim' })); assert.throws(() => observation(open(fixture({ method: VerificationMethod.HUMAN_REVIEW }))));
});
test('M05S08-40 observation time and source knowledge are enforced', () => {
  const c = open(); assert.throws(() => observation(c, { checkedAt: T0 })); assert.throws(() => observation(c, { sourceRetrievedAt: OPEN })); assert.throws(() => command(c, { observations: [observation(c, { checkedAt: EXEC })] }));
});
test('M05S08-41 authorized manual confirmation verifies checked claim', () => {
  const c = open(), h = execute(c); assert.equal(result(h).outcome, VerificationRouteOutcome.VERIFIED); assert.equal(result(h).assertionFingerprint, 'assertion:A'); assert.deepEqual(h.confirmedClaims, [A]); assert.equal(result(h).authorityResolutionIds.length, 1); assert(result(h).reasonCodes.includes('AUTHORIZED_MANUAL_CLAIM_CONFIRMED'));
});
test('M05S08-42 conditional authority remains review-required', () => {
  const c = open(fixture({ authority: 'conditional' })), h = execute(c); assert.equal(result(h).outcome, VerificationRouteOutcome.REVIEW_REQUIRED); assert.deepEqual(result(h).conditions, ['condition:unresolved']); assert.deepEqual(h.confirmedClaims, []);
});
test('M05S08-43 missing or negative authority cannot verify', () => {
  for (const authority of ['none', 'denied'] as const) { const c = open(fixture({ authority })); assert.equal(result(execute(c)).outcome, VerificationRouteOutcome.REVIEW_REQUIRED); }
});
test('M05S08-44 conflicting authority cannot verify', () => {
  const c = open(fixture({ authority: 'conflict' })); assert.equal(result(execute(c)).outcome, VerificationRouteOutcome.REVIEW_REQUIRED);
});
test('M05S08-45 quarantine blocks positive confirmation', () => {
  const c = open(fixture({ security: 'quarantine' })), before = JSON.stringify(c.security); const h = execute(c); assert.equal(result(h).outcome, VerificationRouteOutcome.REVIEW_REQUIRED); assert(result(h).reasonCodes.includes('MANUAL_CONFIRMATION_SECURITY_BLOCKED')); assert.equal(JSON.stringify(c.security), before);
});
test('M05S08-46 incomplete security or unchecked integrity blocks confirmation', () => {
  const incomplete = open(fixture({ security: 'missing' })), unchecked = open(fixture({ unchecked: true })); assert.equal(result(execute(incomplete)).outcome, VerificationRouteOutcome.REVIEW_REQUIRED); assert.equal(result(execute(unchecked)).outcome, VerificationRouteOutcome.REVIEW_REQUIRED);
});
test('M05S08-47 unavailable source is indeterminate not failed', () => {
  const c = open(); const cmd = command(c, { observations: [observation(c, { observation: ManualObservationOutcome.SOURCE_UNAVAILABLE, assertionFingerprint: null })] }); assert.equal(result(execute(c, cmd)).outcome, VerificationRouteOutcome.INDETERMINATE); const negative = command(c, { observations: [observation(c, { observation: ManualObservationOutcome.NOT_CONFIRMED, assertionFingerprint: null })] }); assert.equal(result(execute(c, negative)).outcome, VerificationRouteOutcome.REVIEW_REQUIRED);
});
test('M05S08-48 contradictory or unresolved prior result cannot be overwritten', () => {
  for (const outcome of [VerificationRouteOutcome.VERIFIED, VerificationRouteOutcome.FAILED, VerificationRouteOutcome.REVIEW_REQUIRED]) { const f = fixture(), p = prior(f, outcome, 'assertion:different'), c = open(f, { priorResults: [p] }); const h = execute(c); assert.equal(result(h).outcome, VerificationRouteOutcome.REVIEW_REQUIRED); assert(result(h).reasonCodes.includes('PRIOR_CLAIM_REQUIRES_GOVERNED_RESOLUTION')); }
});
test('M05S08-49 provider outage permits supported manual fallback', () => {
  const f = fixture(), p = prior(f, VerificationRouteOutcome.INDETERMINATE), c = open(f, { priorResults: [p] }); assert.equal(result(execute(c)).outcome, VerificationRouteOutcome.VERIFIED); assert.equal(p.outcome, VerificationRouteOutcome.INDETERMINATE); const g = fixture(), samePrior = prior(g, VerificationRouteOutcome.VERIFIED), sameCase = open(g, { priorResults: [samePrior] }); assert.equal(result(execute(sameCase)).outcome, VerificationRouteOutcome.VERIFIED);
});
test('M05S08-50 partial confirmation preserves unchecked claims', () => {
  const c = open(), h = execute(c); assert.equal(h.status, HumanReviewStatus.IN_REVIEW); assert.deepEqual(h.toJSON().outstandingCaseClaims, [B]); assert.deepEqual(h.toJSON().uncheckedRequestClaims, [B]); const scopedCase = open(fixture(), { claims: [A] }); const scopedHistory = execute(scopedCase); assert.equal(scopedHistory.status, HumanReviewStatus.CONFIRMED); assert.deepEqual(scopedHistory.toJSON().uncheckedRequestClaims, [B]);
});
test('M05S08-51 complete generic review covers full case without verifying evidence', () => {
  const c = open(fixture({ method: VerificationMethod.HUMAN_REVIEW }));
  assert.throws(() => command(c, { action: HumanReviewAction.COMPLETE_REVIEW, claims: [A] }), /Complete review must cover every case claim/);
  const complete = command(c, { action: HumanReviewAction.COMPLETE_REVIEW, claims: c.claims });
  assert.throws(() => execute(c, complete, { mandate: mandate(c, { claims: [A] }) }), /Reviewer invocation scope mismatch/);
  const h = execute(c, complete); assert.equal(h.status, HumanReviewStatus.REVIEWED); assert.deepEqual(h.confirmedClaims, []); assert.deepEqual(h.records[0]!.claimResults, []); assert.throws(() => mandate(c, { permissions: [HumanReviewPermission.REVIEW, HumanReviewPermission.MANUAL_CONFIRMATION] }));
});
test('M05S08-52 review rejection does not assert negative claim truth', () => {
  const c = open(), h = execute(c, command(c, { action: HumanReviewAction.REJECT })); assert.equal(h.status, HumanReviewStatus.REJECTED); assert.deepEqual(h.records[0]!.claimResults, []); assert(!JSON.stringify(h).includes('FAILED'));
});
test('M05S08-53 evidence requests and escalation remain nonterminal', () => {
  const c = open(), first = command(c, { action: HumanReviewAction.REQUEST_EVIDENCE }), h = execute(c, first); assert.equal(h.status, HumanReviewStatus.AWAITING_EVIDENCE); const second = command(c, { id: CommandId.from(uuid(201)), idempotencyKey: 'review:2', action: HumanReviewAction.ESCALATE }); const next = execute(c, second, { history: h }); assert.equal(next.status, HumanReviewStatus.ESCALATED); assert.equal(next.revision, 2);
});
test('M05S08-54 exact same-actor replay preserves history identity and revision', () => {
  const c = open(), cmd = command(c), h = execute(c, cmd); const replay = execute(c, cmd, { history: h, expectedRevision: 0, context: context({ requestedAt: LATER }) }); assert.equal(replay, h); assert.equal(replay.revision, 1);
  const otherReviewer = actor(8);
  assert.throws(() => execute(c, cmd, { history: h, expectedRevision: 0, mandate: mandate(c, { reviewer: otherReviewer }), context: context({ actor: otherReviewer, requestedAt: LATER }) }), /Review idempotency key collision/);
});
test('M05S08-55 idempotency key collision is rejected', () => {
  const c = open(), h = execute(c); assert.throws(() => execute(c, command(c, { rationaleReference: 'rationale:changed' }), { history: h, expectedRevision: 0 }));
});
test('M05S08-56 stale and invalid expected revisions are rejected', () => {
  const c = open(), h = execute(c), next = command(c, { id: CommandId.from(uuid(201)), idempotencyKey: 'review:2', claims: [B] }); assert.throws(() => execute(c, next, { history: h, expectedRevision: 0 })); for (const expectedRevision of [-1, NaN, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => execute(c, command(c), { expectedRevision }));
});
test('M05S08-57 terminal history rejects new mutations', () => {
  const c = open(), h = execute(c, command(c, { action: HumanReviewAction.COMPLETE_REVIEW, claims: c.claims })); assert.throws(() => execute(c, command(c, { id: CommandId.from(uuid(202)), idempotencyKey: 'review:after-terminal' }), { history: h }));
});
test('M05S08-58 command and invocation time remain monotonic including replay', () => {
  const c = open(), cmd = command(c); assert.throws(() => execute(c, cmd, { context: context({ requestedAt: CHECK }) }));
  const confirmed = execute(c, cmd);
  assert.throws(() => execute(c, cmd, { history: confirmed, expectedRevision: 0, context: context({ requestedAt: SUBMIT }) }), /Review invocation cannot predate recorded history, including replay/);
  const h = execute(c, command(c, { action: HumanReviewAction.ESCALATE }), { context: context({ requestedAt: LATER }) }); assert.throws(() => execute(c, command(c, { id: CommandId.from(uuid(201)), idempotencyKey: 'review:2' }), { history: h })); assert.throws(() => command(c, { submittedAt: T0 }));
});
test('M05S08-59 uncontrolled action and absent confirmation permission are rejected', () => {
  const c = open(); assert.throws(() => command(c, { action: 'AUTO_APPROVE' as never })); assert.throws(() => execute(c, command(c), { mandate: mandate(c, { permissions: [HumanReviewPermission.REVIEW] }) })); assert.throws(() => command(c, { observations: [] })); assert.throws(() => command(c, { action: HumanReviewAction.ESCALATE, observations: [observation(c)] }));
});
test('M05S08-60 histories and upstream snapshots remain immutable', () => {
  const f = fixture(), c = open(f), originalJSON = JSON.stringify(f.original), registryJSON = JSON.stringify(f.registry), h0 = HumanReviewHistory.start(c), h = execute(c, command(c), { history: h0 }); assert.equal(h0.revision, 0); assert.equal(h0.records.length, 0); assert(Object.isFrozen(h.records[0])); assert(Object.isFrozen(result(h).reasonCodes)); assert.throws(() => (h.records as unknown[]).push({})); assert.equal(Reflect.set(h, 'revision', 999), false); assert.equal(JSON.stringify(f.original), originalJSON); assert.equal(JSON.stringify(f.registry), registryJSON); assert.equal(JSON.stringify(f.original.verificationState), JSON.stringify(VerificationState.from(VerificationStateCode.UNVERIFIED)));
});
test('M05S08-61 canonical command serialization is deterministic', () => {
  const c = open(), first = command(c, { claims: [A, B], evidenceReferences: ['evidence:z', 'evidence:a'] }), second = command(c, { claims: [B, A], evidenceReferences: ['evidence:a', 'evidence:z'] }); assert.equal(JSON.stringify(first), JSON.stringify(second)); assert(Object.isFrozen(first.observations)); const serialized = first.toJSON(); assert(Object.isFrozen(serialized.observations));
});
test('M05S08-62 separate confirmations close only after full coverage', () => {
  const c = open(), h = execute(c), second = command(c, { id: CommandId.from(uuid(201)), idempotencyKey: 'review:2', claims: [B] }), next = execute(c, second, { history: h }); assert.equal(next.status, HumanReviewStatus.CONFIRMED); assert.equal(next.revision, 2); assert.deepEqual([...next.confirmedClaims].sort(), [A, B].sort()); assert.deepEqual(next.toJSON().uncheckedRequestClaims, []); assert.equal(next.records[0], h.records[0]); assert.equal(h.status, HumanReviewStatus.IN_REVIEW);
});
test('M05S08-63 command ID reuse and reconfirmation are rejected', () => {
  const c = open(), h = execute(c); assert.throws(() => execute(c, command(c, { idempotencyKey: 'review:other-key', claims: [B] }), { history: h })); assert.throws(() => execute(c, command(c, { id: CommandId.from(uuid(201)), idempotencyKey: 'review:2', claims: [A] }), { history: h }));
});
test('M05S08-64 foreign commands and observations cannot cross histories', () => {
  const c = open(), foreign = open(); assert.throws(() => execute(c, command(foreign))); assert.throws(() => command(c, { observations: [observation(foreign)] })); assert.throws(() => execute(c, command(c), { mandate: mandate(foreign) }));
});
