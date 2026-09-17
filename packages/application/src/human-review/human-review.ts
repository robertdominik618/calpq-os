import { ActorId, ActorKind, ActorReference, CommandId, SourceId, UtcInstant, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { MultiChannelIntakeSubmission } from '../intake/index.ts';
import { IntakeSecurityAssessment, IntakeSecurityDisposition } from '../security/index.ts';
import { AccessDisposition, TenantAccessDecision } from '../tenant/tenant-governance.ts';
import { AuthorityResolutionOutcome, AuthorityResolutionResult, TrustEntity } from '../trust/index.ts';
import { VerificationAssuranceLevel, VerificationMethod, VerificationRequest, VerificationRouteDefinition, VerificationRouteOutcome, VerificationRouteRegistrySnapshot, VerificationRouteResult, VerificationRouteSelection, VerificationRouteState } from '../verification/index.ts';

function text(value: string, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > 1024 || /[\u0000-\u001f\u007f]/.test(value)) throw new TypeError(`${label} requires bounded nonempty text`);
  return value.trim();
}
function texts(values: readonly string[], label: string, allowEmpty = false): readonly string[] {
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0)) throw new TypeError(`${label} requires an array`);
  const normalized = values.map(value => text(value, label)).sort();
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} must be unique`);
  return Object.freeze(normalized);
}
function instant(value: UtcInstant, label: string): number {
  if (!(value instanceof UtcInstant)) throw new TypeError(`${label} requires UtcInstant`);
  return value.toEpochMilliseconds();
}
function same(left: { toString(): string }, right: { toString(): string }): boolean { return left.toString() === right.toString(); }
function scoped(context: ApplicationExecutionContext, operation: string, access: TenantAccessDecision, claims: readonly string[]): void {
  if (!(context instanceof ApplicationExecutionContext) || context.operation.toString() !== operation || context.tenantScope === null || context.organizationScope === null || context.subject === null || context.purpose === null || context.accessDecision === null) throw new TypeError('Review requires scoped operation context');
  if (!(access instanceof TenantAccessDecision) || access.disposition !== AccessDisposition.ALLOW || !same(access.tenant, context.tenantScope) || !same(access.purpose, context.purpose) || !same(access.reference, context.accessDecision) || claims.some(claim => !access.allowedFields.includes(claim))) throw new TypeError('Review access denied');
}
const ASSURANCE: Readonly<Record<VerificationAssuranceLevel, number>> = Object.freeze({ BASIC: 1, SUBSTANTIAL: 2, HIGH: 3 });

export class HumanReviewCaseId {
  readonly #value: string;
  private constructor(value: string) { this.#value = value.toLowerCase(); Object.freeze(this); }
  static from(value: string): HumanReviewCaseId {
    if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new TypeError('HumanReviewCaseId requires UUIDv7');
    return new HumanReviewCaseId(value);
  }
  toString(): string { return this.#value; }
  toJSON(): string { return this.#value; }
}

export interface HumanReviewCaseInput {
  readonly id: HumanReviewCaseId;
  readonly request: VerificationRequest;
  readonly registry: VerificationRouteRegistrySnapshot;
  readonly route: VerificationRouteDefinition;
  readonly intake: MultiChannelIntakeSubmission;
  readonly security: IntakeSecurityAssessment;
  readonly context: ApplicationExecutionContext;
  readonly accessDecision: TenantAccessDecision;
  readonly claims: readonly string[];
  readonly authorityResolutions: readonly AuthorityResolutionResult[];
  readonly priorResults: readonly VerificationRouteResult[];
  readonly excludedReviewerIds?: readonly ActorId[];
}

export class HumanReviewCase {
  readonly id!: HumanReviewCaseId;
  readonly request!: VerificationRequest;
  readonly registry!: VerificationRouteRegistrySnapshot;
  readonly route!: VerificationRouteDefinition;
  readonly intake!: MultiChannelIntakeSubmission;
  readonly security!: IntakeSecurityAssessment;
  readonly context!: ApplicationExecutionContext;
  readonly accessDecision!: TenantAccessDecision;
  readonly claims!: readonly string[];
  readonly authorityResolutions!: readonly AuthorityResolutionResult[];
  readonly priorResults!: readonly VerificationRouteResult[];
  readonly excludedReviewerIds!: readonly ActorId[];
  private constructor(input: Required<HumanReviewCaseInput>) { Object.assign(this, input); Object.freeze(this); }
  static open(input: HumanReviewCaseInput): HumanReviewCase {
    if (!(input.id instanceof HumanReviewCaseId) || !(input.request instanceof VerificationRequest) || !(input.registry instanceof VerificationRouteRegistrySnapshot) || !(input.route instanceof VerificationRouteDefinition) || !(input.intake instanceof MultiChannelIntakeSubmission) || !(input.security instanceof IntakeSecurityAssessment)) throw new TypeError('Review case requires governed inputs');
    const claims = texts(input.claims, 'Review claims');
    scoped(input.context, 'verification.human-review.open', input.accessDecision, claims);
    const archive = input.security.archiveEntry;
    if (input.request.evidence !== archive.originalArtifact || input.intake.originalArtifact !== archive.originalArtifact || !same(input.intake.id, archive.intakeId)) throw new TypeError('Review must bind exact intake and archived original');
    if (input.intake.subject === null || input.intake.organization === null || !same(input.intake.subject.id, input.context.subject!.id) || input.intake.subject.kind !== input.context.subject!.kind || !same(input.intake.organization, input.context.organizationScope!) || input.request.subjectReference !== input.intake.subject.id.toString()) throw new TypeError('Review subject or organization mismatch');
    const route = input.route;
    if (!input.registry.routes.includes(route) || (route.method !== VerificationMethod.HUMAN_REVIEW && route.method !== VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION)) throw new TypeError('Review requires registered human or manual route');
    if (route.state !== VerificationRouteState.ACTIVE || !route.isEffectiveAt(input.request.evaluationInstant) || !input.request.acceptableMethods.includes(route.method) || ASSURANCE[route.assuranceLevel] < ASSURANCE[input.request.requiredAssurance] || !route.jurisdictions.some(jurisdiction => same(jurisdiction, input.request.jurisdiction))) throw new TypeError('Review route is not applicable at required assurance');
    if (claims.some(claim => !input.request.claims.includes(claim) || !route.supportedClaims.includes(claim))) throw new TypeError('Review claim outside request or route');
    if (instant(input.request.asKnownAt, 'Request knowledge') > instant(input.registry.asKnownAt, 'Registry knowledge') || instant(route.retrievedAt, 'Route retrieval') > instant(input.request.asKnownAt, 'Request knowledge')) throw new RangeError('Review route exceeds knowledge cutoff');
    if (instant(input.context.requestedAt, 'Review opening') < Math.max(instant(input.request.asKnownAt, 'Request knowledge'), instant(input.registry.asKnownAt, 'Registry knowledge'), instant(archive.archivedAt, 'Archive time'), instant(input.security.evaluatedAt, 'Security time'))) throw new RangeError('Review opening predates a required snapshot');
    if (!Array.isArray(input.authorityResolutions) || input.authorityResolutions.some(result => !(result instanceof AuthorityResolutionResult) || result.snapshot !== input.registry.trustSnapshot)) throw new TypeError('Review authority must bind exact Trust Registry snapshot');
    if (new Set(input.authorityResolutions.map(result => result.id.toString())).size !== input.authorityResolutions.length) throw new TypeError('Review authority resolution IDs must be unique');
    if (!Array.isArray(input.priorResults) || input.priorResults.some(result => !(result instanceof VerificationRouteResult) || result.providerRequest.request !== input.request || !input.registry.routes.includes(result.providerRequest.route) || result.authorityResolutions.some(authority => authority.snapshot !== input.registry.trustSnapshot) || instant(result.providerResult.checkedAt, 'Prior check') > instant(input.context.requestedAt, 'Review opening'))) throw new TypeError('Prior result must bind exact request, registry and known time');
    if (new Set(input.priorResults.map(result => result.providerRequest.attemptId.toString())).size !== input.priorResults.length) throw new TypeError('Prior attempt IDs must be unique');
    const suppliedExclusions = input.excludedReviewerIds ?? [];
    if (!Array.isArray(suppliedExclusions) || suppliedExclusions.some(id => !(id instanceof ActorId))) throw new TypeError('Excluded reviewers require ActorId');
    const excluded = new Map<string, ActorId>();
    for (const id of [...suppliedExclusions, input.intake.receivedBy.id, archive.originalArtifact.acquiredBy.id]) excluded.set(id.toString(), id);
    return new HumanReviewCase({ id: input.id, request: input.request, registry: input.registry, route, intake: input.intake, security: input.security, context: input.context, accessDecision: input.accessDecision, claims, authorityResolutions: Object.freeze([...input.authorityResolutions].sort((a, b) => a.id.toString().localeCompare(b.id.toString()))), priorResults: Object.freeze([...input.priorResults].sort((a, b) => a.providerRequest.attemptId.toString().localeCompare(b.providerRequest.attemptId.toString()))), excludedReviewerIds: Object.freeze([...excluded.values()].sort((a, b) => a.toString().localeCompare(b.toString()))) });
  }
  toJSON() {
    return Object.freeze({ id: this.id.toString(), requestId: this.request.id.toString(), registryId: this.registry.id.toString(), routeId: this.route.id.toString(), method: this.route.method, intakeId: this.intake.id.toString(), evidenceId: this.request.evidence.id.toString(), tenant: this.context.tenantScope!.toString(), organization: this.context.organizationScope!.toString(), subjectId: this.context.subject!.id.toString(), purpose: this.context.purpose!.toString(), openedAt: this.context.requestedAt.toString(), asKnownAt: this.request.asKnownAt.toString(), policyVersion: this.registry.policyVersion.toString(), claims: Object.freeze([...this.claims]), uncheckedRequestClaims: Object.freeze(this.request.claims.filter(claim => !this.claims.includes(claim))), securityDisposition: this.security.disposition, authorityResolutionIds: Object.freeze(this.authorityResolutions.map(result => result.id.toString())), priorAttemptIds: Object.freeze(this.priorResults.map(result => result.providerRequest.attemptId.toString())), excludedReviewerIds: Object.freeze(this.excludedReviewerIds.map(String)) });
  }
}

export const HumanReviewPermission = { REVIEW: 'REVIEW', MANUAL_CONFIRMATION: 'MANUAL_CONFIRMATION' } as const;
export type HumanReviewPermission = (typeof HumanReviewPermission)[keyof typeof HumanReviewPermission];
export interface HumanReviewerMandateInput {
  readonly reference: string;
  readonly reviewCase: HumanReviewCase;
  readonly reviewer: ActorReference;
  readonly grantedBy: ActorReference;
  readonly verifierEntity: TrustEntity;
  readonly accessDecision: TenantAccessDecision;
  readonly claims: readonly string[];
  readonly permissions: readonly HumanReviewPermission[];
  readonly grantedAt: UtcInstant;
  readonly validFrom: UtcInstant;
  readonly validUntil: UtcInstant;
  readonly revokedAt?: UtcInstant | null;
  readonly sourceId: SourceId;
  readonly sourceVersion: VersionId;
  readonly sourceSnapshotReference: string;
}
export class HumanReviewerMandate {
  readonly reference!: string;
  readonly reviewCase!: HumanReviewCase;
  readonly reviewer!: ActorReference;
  readonly grantedBy!: ActorReference;
  readonly verifierEntity!: TrustEntity;
  readonly accessDecision!: TenantAccessDecision;
  readonly claims!: readonly string[];
  readonly permissions!: readonly HumanReviewPermission[];
  readonly grantedAt!: UtcInstant;
  readonly validFrom!: UtcInstant;
  readonly validUntil!: UtcInstant;
  readonly revokedAt!: UtcInstant | null;
  readonly sourceId!: SourceId;
  readonly sourceVersion!: VersionId;
  readonly sourceSnapshotReference!: string;
  private constructor(input: Required<HumanReviewerMandateInput>) { Object.assign(this, input); Object.freeze(this); }
  static create(input: HumanReviewerMandateInput): HumanReviewerMandate {
    if (!(input.reviewCase instanceof HumanReviewCase) || !(input.reviewer instanceof ActorReference) || input.reviewer.kind !== ActorKind.HUMAN_USER || !(input.grantedBy instanceof ActorReference) || same(input.reviewer.id, input.grantedBy.id)) throw new TypeError('Mandate requires an independently assigned human reviewer');
    if (input.reviewCase.excludedReviewerIds.some(id => same(id, input.reviewer.id))) throw new TypeError('Self-review or excluded reviewer is prohibited');
    if (input.verifierEntity !== input.reviewCase.route.verifierEntity) throw new TypeError('Reviewer mandate requires exact verification entity');
    const claims = texts(input.claims, 'Mandate claims');
    if (claims.some(claim => !input.reviewCase.claims.includes(claim))) throw new TypeError('Mandate claims exceed review case');
    if (!Array.isArray(input.permissions) || input.permissions.length === 0 || !input.permissions.includes(HumanReviewPermission.REVIEW) || input.permissions.some(permission => !Object.values(HumanReviewPermission).includes(permission)) || new Set(input.permissions).size !== input.permissions.length) throw new TypeError('Mandate permissions must be controlled and unique');
    if (input.permissions.includes(HumanReviewPermission.MANUAL_CONFIRMATION) && input.reviewCase.route.method !== VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION) throw new TypeError('Manual permission requires manual route');
    const access = input.accessDecision;
    if (!(access instanceof TenantAccessDecision) || access.disposition !== AccessDisposition.ALLOW || !same(access.tenant, input.reviewCase.context.tenantScope!) || !same(access.purpose, input.reviewCase.context.purpose!) || claims.some(claim => !access.allowedFields.includes(claim))) throw new TypeError('Mandate access denied or scope mismatch');
    const grant = instant(input.grantedAt, 'Mandate grant');
    const start = instant(input.validFrom, 'Mandate validity start');
    const end = instant(input.validUntil, 'Mandate validity end');
    const revokedAt = input.revokedAt ?? null;
    if (start > end || grant > end || grant < instant(input.reviewCase.context.requestedAt, 'Case opening') || (revokedAt !== null && instant(revokedAt, 'Mandate revocation') < grant)) throw new RangeError('Invalid mandate validity or revocation');
    if (!(input.sourceId instanceof SourceId) || !(input.sourceVersion instanceof VersionId)) throw new TypeError('Mandate requires source/version provenance');
    return new HumanReviewerMandate({ reference: text(input.reference, 'Mandate reference'), reviewCase: input.reviewCase, reviewer: input.reviewer, grantedBy: input.grantedBy, verifierEntity: input.verifierEntity, accessDecision: access, claims, permissions: Object.freeze([...input.permissions].sort()), grantedAt: input.grantedAt, validFrom: input.validFrom, validUntil: input.validUntil, revokedAt, sourceId: input.sourceId, sourceVersion: input.sourceVersion, sourceSnapshotReference: text(input.sourceSnapshotReference, 'Mandate source snapshot') });
  }
  assertCanApply(context: ApplicationExecutionContext, command: HumanReviewCommand): void {
    if (!(command instanceof HumanReviewCommand) || command.reviewCase !== this.reviewCase) throw new TypeError('Mandate case mismatch');
    scoped(context, 'verification.human-review.record', this.accessDecision, command.claims);
    const opening = this.reviewCase.context;
    if (!same(context.tenantScope!, opening.tenantScope!) || !same(context.organizationScope!, opening.organizationScope!) || !same(context.subject!.id, opening.subject!.id) || context.subject!.kind !== opening.subject!.kind || !same(context.purpose!, opening.purpose!) || !same(context.actor.id, this.reviewer.id) || context.actor.kind !== ActorKind.HUMAN_USER || command.claims.some(claim => !this.claims.includes(claim))) throw new TypeError('Reviewer invocation scope mismatch');
    const now = instant(context.requestedAt, 'Review invocation');
    if (now < instant(this.grantedAt, 'Mandate grant') || now < instant(this.validFrom, 'Mandate validity start') || now > instant(this.validUntil, 'Mandate validity end') || (this.revokedAt !== null && now >= instant(this.revokedAt, 'Mandate revocation'))) throw new RangeError('Reviewer mandate not active');
    if (command.action === HumanReviewAction.CONFIRM_CLAIMS && !this.permissions.includes(HumanReviewPermission.MANUAL_CONFIRMATION)) throw new TypeError('Manual confirmation permission required');
  }
  toJSON() { return Object.freeze({ reference: this.reference, caseId: this.reviewCase.id.toString(), reviewerId: this.reviewer.id.toString(), grantedById: this.grantedBy.id.toString(), verifierEntityId: this.verifierEntity.id.toString(), accessDecisionReference: this.accessDecision.reference.toString(), auditReference: this.accessDecision.auditReference.toString(), claims: Object.freeze([...this.claims]), permissions: Object.freeze([...this.permissions]), grantedAt: this.grantedAt.toString(), validFrom: this.validFrom.toString(), validUntil: this.validUntil.toString(), revokedAt: this.revokedAt?.toString() ?? null, sourceId: this.sourceId.toString(), sourceVersion: this.sourceVersion.toString(), sourceSnapshotReference: this.sourceSnapshotReference }); }
}

export const ManualObservationOutcome = { CONFIRMED: 'CONFIRMED', NOT_CONFIRMED: 'NOT_CONFIRMED', SOURCE_UNAVAILABLE: 'SOURCE_UNAVAILABLE' } as const;
export type ManualObservationOutcome = (typeof ManualObservationOutcome)[keyof typeof ManualObservationOutcome];
export interface ManualClaimObservationInput {
  readonly reviewCase: HumanReviewCase;
  readonly claim: string;
  readonly observation: ManualObservationOutcome;
  readonly assertionFingerprint?: string | null;
  readonly evidenceReferences: readonly string[];
  readonly sourceId: SourceId;
  readonly sourceVersion: VersionId;
  readonly sourceSnapshotReference: string;
  readonly sourceRetrievedAt: UtcInstant;
  readonly checkedAt: UtcInstant;
}
export class ManualClaimObservation {
  readonly reviewCase!: HumanReviewCase;
  readonly claim!: string;
  readonly observation!: ManualObservationOutcome;
  readonly assertionFingerprint!: string | null;
  readonly evidenceReferences!: readonly string[];
  readonly sourceId!: SourceId;
  readonly sourceVersion!: VersionId;
  readonly sourceSnapshotReference!: string;
  readonly sourceRetrievedAt!: UtcInstant;
  readonly checkedAt!: UtcInstant;
  private constructor(input: Required<ManualClaimObservationInput>) { Object.assign(this, input); Object.freeze(this); }
  static create(input: ManualClaimObservationInput): ManualClaimObservation {
    if (!(input.reviewCase instanceof HumanReviewCase) || input.reviewCase.route.method !== VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION) throw new TypeError('Manual observation requires manual review case');
    const claim = text(input.claim, 'Observed claim');
    if (!input.reviewCase.claims.includes(claim) || !Object.values(ManualObservationOutcome).includes(input.observation)) throw new TypeError('Manual claim or observation outside controlled scope');
    if (!(input.sourceId instanceof SourceId) || !(input.sourceVersion instanceof VersionId)) throw new TypeError('Manual observation requires source/version');
    const retrieved = instant(input.sourceRetrievedAt, 'Manual source retrieval');
    const checked = instant(input.checkedAt, 'Manual observation check');
    if (retrieved > instant(input.reviewCase.request.asKnownAt, 'Request knowledge') || retrieved > checked || checked < instant(input.reviewCase.context.requestedAt, 'Case opening')) throw new RangeError('Manual observation exceeds time or knowledge scope');
    const fingerprint = input.assertionFingerprint == null ? null : text(input.assertionFingerprint, 'Assertion fingerprint');
    if ((input.observation === ManualObservationOutcome.CONFIRMED) !== (fingerprint !== null)) throw new TypeError('Only confirmed observations require assertion fingerprints');
    return new ManualClaimObservation({ reviewCase: input.reviewCase, claim, observation: input.observation, assertionFingerprint: fingerprint, evidenceReferences: texts(input.evidenceReferences, 'Manual evidence references'), sourceId: input.sourceId, sourceVersion: input.sourceVersion, sourceSnapshotReference: text(input.sourceSnapshotReference, 'Manual source snapshot'), sourceRetrievedAt: input.sourceRetrievedAt, checkedAt: input.checkedAt });
  }
  toJSON() { return Object.freeze({ caseId: this.reviewCase.id.toString(), claim: this.claim, observation: this.observation, assertionFingerprint: this.assertionFingerprint, evidenceReferences: Object.freeze([...this.evidenceReferences]), sourceId: this.sourceId.toString(), sourceVersion: this.sourceVersion.toString(), sourceSnapshotReference: this.sourceSnapshotReference, sourceRetrievedAt: this.sourceRetrievedAt.toString(), checkedAt: this.checkedAt.toString() }); }
}

export const HumanReviewAction = { REQUEST_EVIDENCE: 'REQUEST_EVIDENCE', ESCALATE: 'ESCALATE', COMPLETE_REVIEW: 'COMPLETE_REVIEW', REJECT: 'REJECT', CONFIRM_CLAIMS: 'CONFIRM_CLAIMS' } as const;
export type HumanReviewAction = (typeof HumanReviewAction)[keyof typeof HumanReviewAction];
export interface HumanReviewCommandInput {
  readonly id: CommandId;
  readonly reviewCase: HumanReviewCase;
  readonly action: HumanReviewAction;
  readonly claims: readonly string[];
  readonly observations: readonly ManualClaimObservation[];
  readonly evidenceReferences: readonly string[];
  readonly rationaleReference: string;
  readonly submittedAt: UtcInstant;
  readonly idempotencyKey: string;
}
export class HumanReviewCommand {
  readonly id!: CommandId;
  readonly reviewCase!: HumanReviewCase;
  readonly action!: HumanReviewAction;
  readonly claims!: readonly string[];
  readonly observations!: readonly ManualClaimObservation[];
  readonly evidenceReferences!: readonly string[];
  readonly rationaleReference!: string;
  readonly submittedAt!: UtcInstant;
  readonly idempotencyKey!: string;
  private constructor(input: HumanReviewCommandInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: HumanReviewCommandInput): HumanReviewCommand {
    if (!(input.id instanceof CommandId) || !(input.reviewCase instanceof HumanReviewCase) || !Object.values(HumanReviewAction).includes(input.action)) throw new TypeError('Review command requires governed identity, case and action');
    const claims = texts(input.claims, 'Command claims');
    if (claims.some(claim => !input.reviewCase.claims.includes(claim))) throw new TypeError('Command claims exceed case');
    if (instant(input.submittedAt, 'Command submission') < instant(input.reviewCase.context.requestedAt, 'Case opening')) throw new RangeError('Command submission predates case');
    if (!Array.isArray(input.observations) || input.observations.some(observation => !(observation instanceof ManualClaimObservation) || observation.reviewCase !== input.reviewCase || !claims.includes(observation.claim) || instant(observation.checkedAt, 'Observation check') > instant(input.submittedAt, 'Command submission'))) throw new TypeError('Command observations must bind exact case, claims and submission time');
    if (new Set(input.observations.map(observation => observation.claim)).size !== input.observations.length) throw new TypeError('Duplicate claim observations');
    if (input.action === HumanReviewAction.CONFIRM_CLAIMS) {
      if (input.reviewCase.route.method !== VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION || input.observations.length !== claims.length) throw new TypeError('Confirmation requires manual route and one observation per checked claim');
    } else if (input.observations.length !== 0) throw new TypeError('Generic review cannot contain manual confirmation observations');
    return new HumanReviewCommand({ id: input.id, reviewCase: input.reviewCase, action: input.action, claims, observations: Object.freeze([...input.observations].sort((a, b) => a.claim.localeCompare(b.claim))), evidenceReferences: texts(input.evidenceReferences, 'Command evidence references'), rationaleReference: text(input.rationaleReference, 'Review rationale reference'), submittedAt: input.submittedAt, idempotencyKey: text(input.idempotencyKey, 'Review idempotency key') });
  }
  toJSON() { return Object.freeze({ id: this.id.toString(), caseId: this.reviewCase.id.toString(), action: this.action, claims: Object.freeze([...this.claims]), observations: Object.freeze(this.observations.map(observation => observation.toJSON())), evidenceReferences: Object.freeze([...this.evidenceReferences]), rationaleReference: this.rationaleReference, submittedAt: this.submittedAt.toString(), idempotencyKey: this.idempotencyKey }); }
}

export interface HumanReviewClaimResult {
  readonly claim: string;
  readonly outcome: VerificationRouteOutcome;
  readonly assertionFingerprint: string | null;
  readonly authorityResolutionIds: readonly string[];
  readonly conditions: readonly string[];
  readonly limitations: readonly string[];
  readonly reasonCodes: readonly string[];
}
function evaluateObservation(observation: ManualClaimObservation): HumanReviewClaimResult {
  const reviewCase = observation.reviewCase;
  const request = reviewCase.request;
  const route = reviewCase.route;
  const matching = reviewCase.authorityResolutions.filter(result => result.entity === route.verifierEntity && result.requestedRole === route.authorityRole && result.claimScope === observation.claim && same(result.jurisdiction, request.jurisdiction) && same(result.evaluationInstant, request.evaluationInstant) && same(result.asKnownAt, request.asKnownAt));
  const conditions = Object.freeze([...new Set(matching.flatMap(result => [...result.conditions]))].sort());
  const limitations = Object.freeze([...new Set(matching.flatMap(result => [...result.limitations]))].sort());
  let outcome: VerificationRouteOutcome = VerificationRouteOutcome.REVIEW_REQUIRED;
  const reasons: string[] = [];
  if (observation.observation === ManualObservationOutcome.SOURCE_UNAVAILABLE) {
    outcome = VerificationRouteOutcome.INDETERMINATE; reasons.push('MANUAL_SOURCE_UNAVAILABLE');
  } else if (observation.observation === ManualObservationOutcome.NOT_CONFIRMED) {
    reasons.push('MANUAL_OBSERVATION_NOT_CONFIRMATION');
  } else {
    const selected = VerificationRouteSelection.select({ registry: reviewCase.registry, request, authorityResolutions: reviewCase.authorityResolutions });
    if (matching.length !== 1 || matching[0]!.outcome !== AuthorityResolutionOutcome.AUTHORIZED || conditions.length > 0 || limitations.length > 0 || !selected.items.some(item => item.route === route && item.claims.includes(observation.claim))) reasons.push('MANUAL_AUTHORITY_INSUFFICIENT_OR_CONDITIONAL');
    if (reviewCase.security.disposition !== IntakeSecurityDisposition.PROCESSING_ALLOWED || reviewCase.security.archiveEntry.integrity.state !== 'MATCHED') reasons.push('MANUAL_CONFIRMATION_SECURITY_BLOCKED');
    if (reviewCase.priorResults.some(result => result.checkedClaims.includes(observation.claim) && (result.outcome === VerificationRouteOutcome.REVIEW_REQUIRED || result.outcome === VerificationRouteOutcome.FAILED || (result.outcome === VerificationRouteOutcome.VERIFIED && result.assertionFingerprintFor(observation.claim) !== observation.assertionFingerprint)))) reasons.push('PRIOR_CLAIM_REQUIRES_GOVERNED_RESOLUTION');
    if (reasons.length === 0) { outcome = VerificationRouteOutcome.VERIFIED; reasons.push('AUTHORIZED_MANUAL_CLAIM_CONFIRMED'); }
  }
  return Object.freeze({ claim: observation.claim, outcome, assertionFingerprint: outcome === VerificationRouteOutcome.VERIFIED ? observation.assertionFingerprint : null, authorityResolutionIds: Object.freeze(matching.map(result => result.id.toString())), conditions, limitations, reasonCodes: Object.freeze(reasons.sort()) });
}

export const HumanReviewStatus = { OPEN: 'OPEN', IN_REVIEW: 'IN_REVIEW', AWAITING_EVIDENCE: 'AWAITING_EVIDENCE', ESCALATED: 'ESCALATED', REVIEWED: 'REVIEWED', REJECTED: 'REJECTED', CONFIRMED: 'CONFIRMED' } as const;
export type HumanReviewStatus = (typeof HumanReviewStatus)[keyof typeof HumanReviewStatus];
export interface HumanReviewDecisionRecord {
  readonly revision: number;
  readonly command: HumanReviewCommand;
  readonly context: ApplicationExecutionContext;
  readonly mandate: HumanReviewerMandate;
  readonly claimResults: readonly HumanReviewClaimResult[];
  readonly status: HumanReviewStatus;
}
export class HumanReviewHistory {
  readonly reviewCase: HumanReviewCase;
  readonly records: readonly HumanReviewDecisionRecord[];
  readonly revision: number;
  readonly status: HumanReviewStatus;
  readonly confirmedClaims: readonly string[];
  private constructor(reviewCase: HumanReviewCase, records: readonly HumanReviewDecisionRecord[], status: HumanReviewStatus, confirmedClaims: readonly string[]) { this.reviewCase = reviewCase; this.records = Object.freeze([...records]); this.revision = records.length; this.status = status; this.confirmedClaims = Object.freeze([...confirmedClaims]); Object.freeze(this); }
  static start(reviewCase: HumanReviewCase): HumanReviewHistory {
    if (!(reviewCase instanceof HumanReviewCase)) throw new TypeError('History requires governed review case');
    return new HumanReviewHistory(reviewCase, [], HumanReviewStatus.OPEN, []);
  }
  apply(input: { readonly command: HumanReviewCommand; readonly context: ApplicationExecutionContext; readonly mandate: HumanReviewerMandate; readonly expectedRevision: number }): HumanReviewHistory {
    if (!(input.command instanceof HumanReviewCommand) || input.command.reviewCase !== this.reviewCase || !(input.mandate instanceof HumanReviewerMandate) || input.mandate.reviewCase !== this.reviewCase) throw new TypeError('Review history case or mandate mismatch');
    input.mandate.assertCanApply(input.context, input.command);
    if (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0) throw new RangeError('Expected review revision must be a nonnegative safe integer');
    if (instant(input.context.requestedAt, 'Invocation time') < instant(input.command.submittedAt, 'Submission time')) throw new RangeError('Invocation predates submitted command');
    const prior = this.records.find(record => record.command.idempotencyKey === input.command.idempotencyKey);
    if (prior !== undefined) {
      if (JSON.stringify(prior.command.toJSON()) !== JSON.stringify(input.command.toJSON()) || !same(prior.context.actor.id, input.context.actor.id)) throw new TypeError('Review idempotency key collision');
      return this;
    }
    if (this.records.some(record => same(record.command.id, input.command.id))) throw new TypeError('Review command ID already used');
    if (input.expectedRevision !== this.revision) throw new RangeError('Review revision conflict');
    if (this.status === HumanReviewStatus.REVIEWED || this.status === HumanReviewStatus.REJECTED || this.status === HumanReviewStatus.CONFIRMED) throw new TypeError('Terminal review cannot be changed');
    const previous = this.records.at(-1);
    if (previous !== undefined && (instant(input.context.requestedAt, 'Invocation time') < instant(previous.context.requestedAt, 'Previous invocation') || instant(input.command.submittedAt, 'Submission time') < instant(previous.command.submittedAt, 'Previous submission'))) throw new RangeError('Review history time must be monotonic');
    if (input.command.action === HumanReviewAction.CONFIRM_CLAIMS && input.command.claims.some(claim => this.confirmedClaims.includes(claim))) throw new TypeError('Previously confirmed claim requires a new governed case');
    const results = Object.freeze(input.command.observations.map(evaluateObservation));
    const confirmed = Object.freeze([...new Set([...this.confirmedClaims, ...results.filter(result => result.outcome === VerificationRouteOutcome.VERIFIED).map(result => result.claim)])].sort());
    let status: HumanReviewStatus;
    switch (input.command.action) {
      case HumanReviewAction.REQUEST_EVIDENCE: status = HumanReviewStatus.AWAITING_EVIDENCE; break;
      case HumanReviewAction.ESCALATE: status = HumanReviewStatus.ESCALATED; break;
      case HumanReviewAction.COMPLETE_REVIEW: status = HumanReviewStatus.REVIEWED; break;
      case HumanReviewAction.REJECT: status = HumanReviewStatus.REJECTED; break;
      case HumanReviewAction.CONFIRM_CLAIMS: status = confirmed.length === this.reviewCase.claims.length ? HumanReviewStatus.CONFIRMED : HumanReviewStatus.IN_REVIEW; break;
    }
    const record: HumanReviewDecisionRecord = Object.freeze({ revision: this.revision + 1, command: input.command, context: input.context, mandate: input.mandate, claimResults: results, status });
    return new HumanReviewHistory(this.reviewCase, [...this.records, record], status, confirmed);
  }
  toJSON() {
    return Object.freeze({ caseId: this.reviewCase.id.toString(), revision: this.revision, status: this.status, confirmedClaims: Object.freeze([...this.confirmedClaims]), outstandingCaseClaims: Object.freeze(this.reviewCase.claims.filter(claim => !this.confirmedClaims.includes(claim))), uncheckedRequestClaims: Object.freeze(this.reviewCase.request.claims.filter(claim => !this.confirmedClaims.includes(claim))), records: Object.freeze(this.records.map(record => Object.freeze({ revision: record.revision, command: record.command.toJSON(), actorId: record.context.actor.id.toString(), tenant: record.context.tenantScope!.toString(), organization: record.context.organizationScope!.toString(), subjectId: record.context.subject!.id.toString(), purpose: record.context.purpose!.toString(), correlationId: record.context.correlationId.toString(), executedAt: record.context.requestedAt.toString(), accessDecisionReference: record.context.accessDecision!.toString(), accessAuditReference: record.mandate.accessDecision.auditReference.toString(), mandate: record.mandate.toJSON(), claimResults: record.claimResults, status: record.status }))) });
  }
}
