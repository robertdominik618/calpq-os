// Test-only composition. No network, storage, OCR, authentication or production orchestrator.
import {
  ActorId, ActorKind, ActorReference, CommandId, ContentHash, CorrelationId,
  EvidenceId, EvidenceKind, EvidenceReference, Jurisdiction, SourceId,
  SubjectId, SubjectKind, SubjectReference, UtcInstant, VerificationState,
  VerificationStateCode, VersionId,
} from '../../core/src/index.ts';
import {
  AccessDecisionReference, ApplicationExecutionContext, ApplicationOperationReference,
  AuditReference, OrganizationScopeReference, PurposeReference, TenantScopeReference,
} from '../src/index.ts';
import { AccessDisposition, TenantAccessDecision } from '../src/tenant/tenant-governance.ts';
import {
  DocumentIntakeId, ExternalIntakeSourceKind, IntakeChannelProvenance,
  IntakeMediaMetadata, IntakeSecurityClassification, MultiChannelIntakeSubmission,
} from '../src/intake/index.ts';
import {
  ArchiveByteIntegrityObservation, ArchiveCommand, ArchiveDependencyInventory,
  ArchiveDisposalAssessment, ArchiveEvidenceSnapshot, ArchiveHold, ArchiveLifecycle,
  ArchiveLifecycleGrant, ArchiveLink, ArchiveLinkRelation, ArchiveOperation,
  ArchiveRetentionPolicy, ArchiveScope, OriginalArchiveEntry,
} from '../src/archive/index.ts';
import {
  DerivedExtractionProposalRecord, ExtractionConfidence, ExtractionFieldProposal,
  ExtractionFieldReviewDecision, ExtractionProcessorKind, ExtractionProcessorReference,
  ExtractionProposalReviewHistory, ExtractionReviewActorRole, ExtractionReviewState,
} from '../src/extraction/index.ts';
import {
  IntakeSecurityAssessment, IntakeSecurityControl, IntakeSecurityObservation,
  IntakeSecurityObservationOutcome, IntakeSecurityObservationReason,
  SecurityControlPolicy, SecurityScannerReference,
} from '../src/security/index.ts';
import {
  AuthorityResolutionResult, AuthorityRole, AuthorityScope, AuthorityScopeId,
  TrustAnchorKind, TrustAnchorRecord, TrustAnchorRecordId, TrustAnchorVerificationState,
  TrustEntity, TrustEntityId, TrustEntityKind, TrustEntityStatus,
  TrustRegistrySnapshot, TrustRegistrySnapshotId, TrustResolutionId,
} from '../src/trust/index.ts';
import {
  VerificationAssuranceLevel, VerificationAttemptId, VerificationMethod,
  VerificationProviderRequest, VerificationProviderResult, VerificationRequest,
  VerificationRequestId, VerificationRouteDefinition, VerificationRouteId,
  VerificationRouteOutcome, VerificationRouteRegistrySnapshot,
  VerificationRouteRegistrySnapshotId, VerificationRouteResult, VerificationRouteSelection,
} from '../src/verification/index.ts';
import type { VerificationProviderPort } from '../src/verification/index.ts';
import {
  HumanReviewAction, HumanReviewCase, HumanReviewCaseId, HumanReviewCommand,
  HumanReviewHistory, HumanReviewPermission, HumanReviewerMandate,
  ManualClaimObservation, ManualObservationOutcome,
} from '../src/human-review/index.ts';

export const id = (n: number): string => `018f3f7e-5555-7abc-8def-${String(n).padStart(12, '0')}`;
const at = (s: string): UtcInstant => UtcInstant.from(s);
export const T = Object.freeze({
  original: at('2026-01-01T00:00:00Z'), derived: at('2026-02-01T00:00:00Z'),
  correction: at('2026-03-01T00:00:00Z'), known: at('2026-09-01T00:00:00Z'),
  open: at('2026-09-02T00:00:00Z'), checked: at('2026-09-03T00:00:00Z'),
  submitted: at('2026-09-04T00:00:00Z'), executed: at('2026-09-05T00:00:00Z'),
  captured: at('2026-09-06T00:00:00Z'), expiry: at('2026-09-07T00:00:00Z'),
  now: at('2026-09-08T00:00:00Z'), later: at('2026-09-09T00:00:00Z'),
  end: at('2026-12-01T00:00:00Z'),
});
export const A = 'credential:number', B = 'credential:issuer';
export const SYNTHETIC_BYTES = '%PDF-1.4\n%CALPQ SYNTHETIC TEST DOCUMENT\n';
export const SYNTHETIC_SHA256 = '4af39ba960d1b43ff50252258118a248247baee1f88e5ef83fb49e59b3dfcd9c';
export const OWNER = ActorReference.create(ActorId.from(id(1)), ActorKind.HUMAN_USER);
export const REVIEWER = ActorReference.create(ActorId.from(id(2)), ActorKind.HUMAN_USER);
export const ADMIN = ActorReference.create(ActorId.from(id(3)), ActorKind.HUMAN_USER);
export const TENANT = TenantScopeReference.from('tenant:s10');
export const ORG = OrganizationScopeReference.from('org:s10');
export const PURPOSE = PurposeReference.from('purpose:s10-evidence');
export const ACCESS = AccessDecisionReference.from('access:s10');
export const VERSION = VersionId.from('s10-v1');
export const SOURCE = SourceId.from(id(4));
const CZ = Jurisdiction.fromCode('CZ');
export const channels = Object.freeze([
  IntakeChannelProvenance.camera('capture:s10'),
  IntakeChannelProvenance.scan('scan:s10'),
  IntakeChannelProvenance.fileUpload('upload:s10'),
  IntakeChannelProvenance.emailAttachment('message:s10', 'attachment:s10'),
  IntakeChannelProvenance.shareSheet('application:s10', 'share:s10'),
  IntakeChannelProvenance.url('urlref:s10', 'retrieval:s10'),
  IntakeChannelProvenance.providerAdapter({ sourceKind: ExternalIntakeSourceKind.REGISTRY, adapterReference: 'adapter:intake:s10', externalRecordReference: 'record:s10' }),
]);
export function access(overrides: Partial<Parameters<typeof TenantAccessDecision.create>[0]> = {}) {
  return TenantAccessDecision.create({ reference: ACCESS, tenant: TENANT, purpose: PURPOSE,
    disposition: AccessDisposition.ALLOW, allowedFields: ['archive:metadata', A, B],
    decidedBy: ADMIN, auditReference: AuditReference.from('audit:s10-access'), ...overrides });
}
export interface IntegrationOptions {
  readonly channel?: number; readonly base?: number;
  readonly authority?: 'authorized' | 'missing' | 'conditional' | 'conflict';
  readonly security?: 'pass' | 'quarantine' | 'missing';
  readonly manualAssurance?: VerificationAssuranceLevel;
  readonly method?: VerificationMethod;
  readonly claims?: readonly string[];
  readonly proposedValue?: string;
}
export function makeFixture(options: IntegrationOptions = {}) {
  const n = options.base ?? 100;
  const subject = SubjectReference.create(SubjectId.from(id(n + 2)), SubjectKind.PERSON);
  const original = EvidenceReference.original({ id: EvidenceId.from(id(n)), kind: EvidenceKind.DOCUMENT,
    contentReference: `object://private/s10/${n}`, mediaType: 'application/pdf',
    contentHash: ContentHash.sha256(SYNTHETIC_SHA256), acquiredAt: T.original, acquiredBy: OWNER,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED) });
  const intake = MultiChannelIntakeSubmission.create({ id: DocumentIntakeId.from(id(n + 1)),
    provenance: channels[options.channel ?? 2]!, receivedAt: T.original, receivedBy: OWNER,
    subject, organization: ORG, originalArtifact: original,
    media: IntakeMediaMetadata.create({ mediaType: 'application/pdf', byteLength: SYNTHETIC_BYTES.length, originalFileName: 's10-private-person.pdf' }),
    securityClassification: IntakeSecurityClassification.CONFIDENTIAL });
  const archive = OriginalArchiveEntry.create({ submission: intake, storageObjectReference: `archive://private/s10/${n}`,
    archivedAt: T.original, encryptionProfileReference: 'encryption:s10', accessPolicyReference: 'policy:access:s10',
    retentionPolicyReference: 'retention:s10', integrity: ArchiveByteIntegrityObservation.matched({
      observedContentHash: original.contentHash!, checkedAt: T.original, methodReference: 'sha256:synthetic-fixture' }) });
  const scope = ArchiveScope.create({ intake, archive, tenant: TENANT });
  const scanner = SecurityScannerReference.create({ adapterReference: 'scanner:fixture', engineReference: 'engine:fixture', engineVersion: '1', configurationReference: 'config:fixture' });
  const security = IntakeSecurityAssessment.evaluate({ archiveEntry: archive,
    policy: SecurityControlPolicy.create({ policyReference: 'security:s10', requiredControls: [IntakeSecurityControl.MALWARE_SCAN] }),
    observations: options.security === 'missing' ? [] : [IntakeSecurityObservation.create({ archiveEntry: archive,
      control: IntakeSecurityControl.MALWARE_SCAN,
      outcome: options.security === 'quarantine' ? IntakeSecurityObservationOutcome.MALICIOUS : IntakeSecurityObservationOutcome.PASS,
      reason: options.security === 'quarantine' ? IntakeSecurityObservationReason.MALICIOUS_CONTENT : IntakeSecurityObservationReason.CONTROL_PASSED,
      observedAt: T.original, scanner })], evaluatedAt: T.original });
  const field = ExtractionFieldProposal.create({ fieldPath: A, proposedValue: options.proposedValue ?? 'PRIVATE-RAW-001',
    sourceLocator: 'page:1', confidence: ExtractionConfidence.from(1) });
  const processor = ExtractionProcessorReference.create({ kind: ExtractionProcessorKind.OCR_ENGINE,
    processorReference: 'fixture:ocr', processorVersion: '1' });
  const derived = DerivedExtractionProposalRecord.create({ parent: archive, processor, proposals: [field],
    derivedEvidence: EvidenceReference.derived({ id: EvidenceId.from(id(n + 3)), kind: EvidenceKind.EXTRACTED_METADATA,
      contentReference: `derived://private/s10/${n}`, mediaType: 'application/json', acquiredAt: T.derived,
      acquiredBy: OWNER, derivationParent: original.id, verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED) }) });
  const correction = ExtractionProposalReviewHistory.start(derived).append({ state: ExtractionReviewState.USER_CORRECTED,
    reviewedBy: REVIEWER, actorRole: ExtractionReviewActorRole.REVIEWER, reviewedAt: T.correction,
    reason: 'reason:corrected-from-document', fieldDecisions: [ExtractionFieldReviewDecision.corrected({
      fieldProposal: field, correctedValue: 'PRIVATE-CORRECTED-001', reason: 'reason:source-value' })] });
  const entity = TrustEntity.create({ id: TrustEntityId.from(id(n + 10)), legalName: 'Private Synthetic Verifier',
    kind: TrustEntityKind.VERIFIER, jurisdictions: [CZ], identifiers: [], status: TrustEntityStatus.ACTIVE,
    validFrom: T.original, provenanceReference: 'provenance:verifier' });
  const authorityScopes = [A, B].map((claim, i) => AuthorityScope.create({ id: AuthorityScopeId.from(id(n + 11 + i)),
    entity, role: AuthorityRole.VERIFIER, claimScope: claim, jurisdiction: CZ, validFrom: T.original,
    sourceId: SOURCE, sourceVersion: VERSION, conditions: options.authority === 'conditional' ? ['condition:unresolved'] : [] }));
  const anchors = authorityScopes.map((s, i) => TrustAnchorRecord.create({ id: TrustAnchorRecordId.from(id(n + 13 + i)),
    entity, authorityScope: s, kind: TrustAnchorKind.OFFICIAL_REGISTRY_ENTRY, sourceId: SOURCE, sourceVersion: VERSION,
    sourceSnapshotReference: 'snapshot:trust:s10', retrievedAt: T.original, validFrom: T.original,
    verificationState: TrustAnchorVerificationState.VERIFIED, provenanceReference: 'provenance:anchor' }));
  const trust = TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(id(n + 15)), asKnownAt: T.known,
    entities: [entity], authorityScopes, anchors, policyVersion: VERSION });
  const routeBase = { capability: 'fixture:verify', verifierEntity: entity, authorityRole: AuthorityRole.VERIFIER,
    supportedClaims: [A, B], jurisdictions: [CZ], assuranceLevel: VerificationAssuranceLevel.HIGH,
    validFrom: T.original, sourceId: SOURCE, sourceVersion: VERSION, sourceSnapshotReference: 'snapshot:routes:s10', retrievedAt: T.original };
  const automatic = VerificationRouteDefinition.create({ ...routeBase, id: VerificationRouteId.from(id(n + 20)), method: VerificationMethod.OFFICIAL_REGISTRY_LOOKUP, priority: 1 });
  const alternate = VerificationRouteDefinition.create({ ...routeBase, id: VerificationRouteId.from(id(n + 21)), method: VerificationMethod.OFFICIAL_REGISTRY_LOOKUP, priority: 2 });
  const manual = VerificationRouteDefinition.create({ ...routeBase, id: VerificationRouteId.from(id(n + 22)),
    method: options.method ?? VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION,
    assuranceLevel: options.manualAssurance ?? VerificationAssuranceLevel.HIGH, priority: 3 });
  const registry = VerificationRouteRegistrySnapshot.create({ id: VerificationRouteRegistrySnapshotId.from(id(n + 23)),
    trustSnapshot: trust, asKnownAt: T.known, routes: [automatic, alternate, manual], policyVersion: VERSION });
  const request = VerificationRequest.create({ id: VerificationRequestId.from(id(n + 24)), evidence: original,
    subjectReference: subject.id.toString(), claims: options.claims ?? [A, B], jurisdiction: CZ, useCase: 's10-integration',
    requiredAssurance: VerificationAssuranceLevel.HIGH, acceptableMethods: [automatic.method, manual.method],
    evaluationInstant: T.original, asKnownAt: T.known, idempotencyKey: `verification:${n}` });
  const authority = options.authority === 'missing' ? [] : [A, B].map((claim, i) => AuthorityResolutionResult.resolve({
    id: TrustResolutionId.from(id(n + 25 + i)), snapshot: trust, entity, requestedRole: AuthorityRole.VERIFIER,
    claimScope: claim, jurisdiction: CZ, evaluationInstant: T.original, asKnownAt: T.known,
    conflictReferences: options.authority === 'conflict' ? ['conflict:authority'] : [] }));
  const selection = VerificationRouteSelection.select({ registry, request, authorityResolutions: authority });
  return Object.freeze({ n, subject, original, intake, archive, scope, security, field, processor, derived,
    correction, entity, trust, automatic, alternate, manual, registry, request, authority, selection });
}
export type IntegrationFixture = ReturnType<typeof makeFixture>;
export function context(f: IntegrationFixture, operation: string, time = T.executed,
  overrides: Partial<Parameters<typeof ApplicationExecutionContext.create>[0]> = {}) {
  return ApplicationExecutionContext.create({ operation: ApplicationOperationReference.from(operation), actor: REVIEWER,
    subject: f.subject, tenantScope: TENANT, organizationScope: ORG, purpose: PURPOSE, accessDecision: ACCESS,
    requestedAt: time, correlationId: CorrelationId.from(id(f.n + 30)), contractVersion: VERSION, ...overrides });
}
export function archiveGrant(f: IntegrationFixture) {
  return ArchiveLifecycleGrant.create({ reference: `grant:${f.n}`, scope: f.scope, actor: REVIEWER,
    purpose: PURPOSE, permissions: Object.values(ArchiveOperation), accessDecision: access(), validFrom: T.original,
    validUntil: T.end, sourceId: SOURCE, sourceVersion: VERSION, decisionReference: 'decision:grant:s10' });
}
export function retention(overrides: Partial<Parameters<typeof ArchiveRetentionPolicy.create>[0]> = {}) {
  return ArchiveRetentionPolicy.create({ reference: 'retention:s10', version: VERSION, sourceId: SOURCE,
    sourceSnapshotReference: 'snapshot:retention:s10', reviewedAt: T.correction, retainThrough: T.expiry, reviewDueAt: T.end, ...overrides });
}
export function lifecycle(f: IntegrationFixture, policy = retention()) {
  return ArchiveLifecycle.start({ scope: f.scope, policy, context: context(f, ArchiveOperation.OPEN, T.open), grant: archiveGrant(f) });
}
export function archiveApply(f: IntegrationFixture, state: ArchiveLifecycle,
  change: Parameters<typeof ArchiveCommand.create>[0]['change'], time = T.executed, commandNumber = f.n + 500) {
  const command = ArchiveCommand.create({ id: CommandId.from(id(commandNumber)), scope: f.scope, change,
    submittedAt: time, idempotencyKey: `archive:${commandNumber}`, reasonReference: 'reason:integration' });
  return state.apply({ command, context: context(f, command.operation, time), grant: archiveGrant(f), expectedRevision: state.revision });
}
export function link(f: IntegrationFixture) {
  return ArchiveLink.create({ id: id(f.n + 40), source: f.scope, relation: ArchiveLinkRelation.EVIDENCES_CREDENTIAL,
    targetKind: 'CREDENTIAL', targetReference: `credential:${f.n}`, targetTenant: TENANT, targetOrganization: ORG,
    scopeReference: 'scope:s10', sourceId: SOURCE, sourceVersion: VERSION, sourceSnapshotReference: 'snapshot:link',
    recordedAt: T.open, validFrom: T.open, validUntil: null });
}
export function hold(f: IntegrationFixture) {
  return ArchiveHold.create({ id: id(f.n + 41), scope: f.scope, basisReference: 'basis:required-preservation',
    recordedAt: T.open, startsAt: T.open, endsAt: null });
}
export function capture(f: IntegrationFixture, state = lifecycle(f),
  overrides: Partial<Parameters<typeof ArchiveEvidenceSnapshot.capture>[0]> = {}) {
  return ArchiveEvidenceSnapshot.capture({ id: id(f.n + 42), lifecycle: state,
    context: context(f, ArchiveOperation.CAPTURE, T.captured), grant: archiveGrant(f), security: f.security,
    derivedRecords: [f.derived], extractionReviews: [f.correction], verificationResults: [], humanReviews: [],
    preserveUntil: T.expiry, ...overrides });
}
export function inventory(state: ArchiveLifecycle, overrides: Partial<Parameters<typeof ArchiveDependencyInventory.create>[0]> = {}) {
  return ArchiveDependencyInventory.create({ lifecycle: state, completeness: 'COMPLETE', blockingReferences: [],
    observedAt: T.now, freshUntil: T.later, sourceId: SOURCE, sourceVersion: VERSION,
    sourceSnapshotReference: 'snapshot:dependencies:s10', ...overrides });
}
export function assess(f: IntegrationFixture, state: ArchiveLifecycle, deps = inventory(state)) {
  return ArchiveDisposalAssessment.evaluate({ lifecycle: state, inventory: deps,
    context: context(f, ArchiveOperation.ASSESS, T.now), grant: archiveGrant(f) });
}
export async function runProvider(f: IntegrationFixture,
  options: { readonly outcome?: VerificationRouteOutcome; readonly claims?: readonly string[];
    readonly reason?: string; readonly fingerprint?: string; readonly route?: VerificationRouteDefinition;
    readonly attempt?: number; readonly checkedAt?: UtcInstant } = {}) {
  const route = options.route ?? f.automatic, claims = options.claims ?? [A];
  const request = VerificationProviderRequest.create({ attemptId: VerificationAttemptId.from(id(options.attempt ?? f.n + 50)),
    route, request: f.request, claims, idempotencyKey: `provider:${options.attempt ?? f.n + 50}` });
  const calls: VerificationProviderRequest[] = [];
  const outcome = options.outcome ?? VerificationRouteOutcome.VERIFIED;
  const port: VerificationProviderPort = {
    capability: route.capability,
    execute(received) {
      calls.push(received);
      return VerificationProviderResult.create({ outcome, adapterReference: 'fixture:provider', adapterVersion: '1',
        checkedClaims: received.claims,
        assertionFingerprints: outcome === VerificationRouteOutcome.VERIFIED
          ? Object.fromEntries(received.claims.map(claim => [claim, options.fingerprint ?? `assertion:${claim}`])) : {},
        sourceSnapshotReference: 'snapshot:provider:s10', sourceVersionReference: '1',
        checkedAt: options.checkedAt ?? T.known, reasonCodes: options.reason ? [options.reason] : [] });
    },
  };
  const result = VerificationRouteResult.normalize({ providerRequest: request,
    providerResult: await port.execute(request), authorityResolutions: f.authority });
  return Object.freeze({ result, request, calls: Object.freeze(calls), port });
}
export function reviewCase(f: IntegrationFixture, priorResults: readonly VerificationRouteResult[] = [],
  overrides: Partial<Parameters<typeof HumanReviewCase.open>[0]> = {}) {
  return HumanReviewCase.open({ id: HumanReviewCaseId.from(id(f.n + 60)), request: f.request, registry: f.registry,
    route: f.manual, intake: f.intake, security: f.security, context: context(f, 'verification.human-review.open', T.open),
    accessDecision: access(), claims: [A, B], authorityResolutions: f.authority, priorResults, ...overrides });
}
export function mandate(c: HumanReviewCase,
  overrides: Partial<Parameters<typeof HumanReviewerMandate.create>[0]> = {}) {
  return HumanReviewerMandate.create({ reference: 'mandate:s10', reviewCase: c, reviewer: REVIEWER,
    grantedBy: ADMIN, verifierEntity: c.route.verifierEntity, accessDecision: access(), claims: c.claims,
    permissions: c.route.method === VerificationMethod.HUMAN_REVIEW ? [HumanReviewPermission.REVIEW]
      : [HumanReviewPermission.REVIEW, HumanReviewPermission.MANUAL_CONFIRMATION],
    grantedAt: T.open, validFrom: T.open, validUntil: T.end, sourceId: SOURCE, sourceVersion: VERSION,
    sourceSnapshotReference: 'snapshot:mandate:s10', ...overrides });
}
export function reviewCommand(f: IntegrationFixture, c: HumanReviewCase,
  options: { readonly action?: HumanReviewAction; readonly claims?: readonly string[];
    readonly observation?: ManualObservationOutcome; readonly fingerprint?: string; readonly number?: number } = {}) {
  const action = options.action ?? HumanReviewAction.CONFIRM_CLAIMS;
  const claims = options.claims ?? (action === HumanReviewAction.COMPLETE_REVIEW ? c.claims : [A]);
  const observation = options.observation ?? ManualObservationOutcome.CONFIRMED;
  const number = options.number ?? f.n + 61;
  return HumanReviewCommand.create({ id: CommandId.from(id(number)), reviewCase: c, action, claims,
    observations: action === HumanReviewAction.CONFIRM_CLAIMS ? claims.map(claim => ManualClaimObservation.create({
      reviewCase: c, claim, observation,
      assertionFingerprint: observation === ManualObservationOutcome.CONFIRMED ? options.fingerprint ?? `assertion:${claim}` : null,
      evidenceReferences: ['evidence:manual:s10'], sourceId: SOURCE, sourceVersion: VERSION,
      sourceSnapshotReference: 'snapshot:manual:s10', sourceRetrievedAt: T.known, checkedAt: T.checked })) : [],
    evidenceReferences: ['evidence:review:s10'], rationaleReference: 'rationale:review:s10',
    submittedAt: T.submitted, idempotencyKey: `review:${number}` });
}
export function confirm(f: IntegrationFixture, c = reviewCase(f), cmd = reviewCommand(f, c),
  m = mandate(c), history = HumanReviewHistory.start(c)) {
  return history.apply({ command: cmd, mandate: m, context: context(f, 'verification.human-review.record'), expectedRevision: history.revision });
}
