import { ActorKind, ActorReference, CommandId, EvidenceSnapshot, SourceReference, UtcInstant, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { AccessDisposition, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext } from '../tenant/tenant-governance.ts';
import { CredentialLifecycleBasis } from './credential-lifecycle-timeline.ts';
import { ExpiryRenewalEvaluation, LifecycleCalendarContext } from './expiry-renewal-policy.ts';
import { RecurringObligation, RecurringObligationProjection } from './recurring-obligation.ts';

export const RENEWAL_CASE_OPERATION = 'credential.lifecycle.renewal-case';
export const RENEWAL_CASE_FIELD = 'credential:renewal-case';
export type RenewalCaseState = 'DRAFT' | 'PREPARING' | 'READY' | 'SUBMITTED' | 'AWAITING_INFORMATION' | 'RENEWAL_RECORDED' | 'REJECTION_RECORDED' | 'CANCELLED';
export type RenewalCasePermission = 'OPEN' | 'READ' | 'PREPARE' | 'ATTACH_PACKAGE' | 'MARK_READY' | 'RECORD_EXTERNAL' | 'RECORD_OUTCOME' | 'CANCEL';
const PERMISSIONS: readonly RenewalCasePermission[] = Object.freeze(['OPEN', 'READ', 'PREPARE', 'ATTACH_PACKAGE', 'MARK_READY', 'RECORD_EXTERNAL', 'RECORD_OUTCOME', 'CANCEL']);
const TERMINAL: readonly RenewalCaseState[] = Object.freeze(['RENEWAL_RECORDED', 'REJECTION_RECORDED', 'CANCELLED']);
function opaque(value: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(value)) throw new TypeError('Bounded opaque reference required');
  return value;
}
function time(value: UtcInstant): number {
  if (!(value instanceof UtcInstant)) throw new TypeError('Explicit UtcInstant required');
  return value.toEpochMilliseconds();
}
function same(a: { toString(): string }, b: { toString(): string }): boolean { return a.toString() === b.toString(); }
function compare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function canonical(value: unknown): string { return JSON.stringify(value); }
function integer(value: number, maximum: number, minimum = 0): void {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new RangeError('Value outside explicit bounds');
}
function refs(values: readonly string[], allowEmpty = false): readonly string[] {
  if (!Array.isArray(values) || values.length > 1000 || (!allowEmpty && values.length === 0)) throw new TypeError('Bounded reference collection required');
  const result = Array.from(values).map(opaque).sort(compare);
  if (new Set(result).size !== result.length) throw new TypeError('Duplicate references');
  return Object.freeze(result);
}
function exact(value: unknown, keys: readonly string[]): void {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw new TypeError('Missing or unexpected controlled payload fields');
}
// Traverse only assembled metadata, never raw document or caller payload objects.
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function sourceView(s: SourceReference) {
  return { id: s.id.toString(), version: s.version.toString(), authorityId: s.authority.id.toString(), jurisdiction: s.jurisdiction.toString(), retrievedAt: s.retrievedAt.toString(), verificationState: s.verificationState.toString(), effectiveFrom: s.effectiveFrom?.toString() ?? null, effectiveTo: s.effectiveTo?.toString() ?? null, hash: s.contentHash?.toString() ?? null };
}
function evidenceView(s: EvidenceSnapshot) {
  return { capturedAt: s.capturedAt.toString(), entries: s.entries.map(e => ({ id: e.evidenceId.toString(), evidenceClass: e.evidenceClass, kind: e.evidenceKind, hash: e.contentHash?.toString() ?? null, verificationState: e.verificationState.toString(), sourceId: e.sourceId?.toString() ?? null, sourceVersion: e.sourceVersion?.toString() ?? null })).sort((a, b) => compare(a.id, b.id)) };
}
function evidenceIssues(snapshot: EvidenceSnapshot, source: SourceReference, jurisdiction: string, on: string): string[] {
  const issues: string[] = [];
  if (source.verificationState.toString() !== 'VERIFIED') issues.push('SOURCE_UNVERIFIED');
  if (source.jurisdiction.toString() !== jurisdiction) issues.push('SOURCE_JURISDICTION_MISMATCH');
  if ((source.effectiveFrom !== null && source.effectiveFrom.toString() > on) || (source.effectiveTo !== null && source.effectiveTo.toString() < on)) issues.push('SOURCE_OUTSIDE_EFFECTIVITY');
  if (snapshot.entries.length === 0) issues.push('EVIDENCE_MISSING');
  for (const e of snapshot.entries) {
    if (e.verificationState.toString() !== 'VERIFIED') issues.push('EVIDENCE_UNVERIFIED');
    if (e.sourceId === null || e.sourceVersion === null || !same(e.sourceId, source.id) || !same(e.sourceVersion, source.version)) issues.push('EVIDENCE_SOURCE_MISMATCH');
  }
  return [...new Set(issues)].sort(compare);
}

export interface RenewalCaseDefinitionInput {
  readonly id: string;
  readonly version: VersionId;
  readonly basis: CredentialLifecycleBasis;
  readonly applicant: ActorReference;
  readonly recipient: ActorReference;
  readonly requiredClaims: readonly string[];
  readonly requiredOccurrences: readonly { readonly obligation: RecurringObligation; readonly sequence: number }[];
  readonly planReference: string;
  readonly planVersion: VersionId;
  readonly createdAt: UtcInstant;
  readonly predecessorCaseReference: string | null;
}
/** A pinned internal renewal plan; construction establishes consistency, not issuing authority. */
export class RenewalCaseDefinition {
  readonly id!: string;
  readonly version!: VersionId;
  readonly basis!: CredentialLifecycleBasis;
  readonly applicant!: ActorReference;
  readonly recipient!: ActorReference;
  readonly requiredClaims!: readonly string[];
  readonly requiredOccurrences!: RenewalCaseDefinitionInput['requiredOccurrences'];
  readonly planReference!: string;
  readonly planVersion!: VersionId;
  readonly createdAt!: UtcInstant;
  readonly predecessorCaseReference!: string | null;
  private constructor(input: RenewalCaseDefinitionInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: RenewalCaseDefinitionInput): RenewalCaseDefinition {
    if (!(input.version instanceof VersionId) || !(input.basis instanceof CredentialLifecycleBasis) || !(input.applicant instanceof ActorReference) || !(input.recipient instanceof ActorReference) || !(input.planVersion instanceof VersionId)) throw new TypeError('Governed case, basis and parties required');
    if (time(input.createdAt) < time(input.basis.recordedAt)) throw new RangeError('Case creation predates basis knowledge');
    if (!Array.isArray(input.requiredOccurrences) || input.requiredOccurrences.length > 1000) throw new TypeError('Bounded required occurrences required');
    const occurrences = Array.from(input.requiredOccurrences).map(item => {
      exact(item, ['obligation', 'sequence']);
      if (!(item.obligation instanceof RecurringObligation) || item.obligation.basis !== input.basis) throw new TypeError('Occurrence must use exact case basis');
      integer(item.sequence, 10000, 1);
      if (time(item.obligation.recordedAt) > time(input.createdAt)) throw new RangeError('Required obligation postdates case');
      return Object.freeze({ obligation: item.obligation, sequence: item.sequence });
    }).sort((a, b) => compare(a.obligation.occurrenceReference(a.sequence), b.obligation.occurrenceReference(b.sequence)));
    if (new Set(occurrences.map(o => o.obligation.occurrenceReference(o.sequence))).size !== occurrences.length) throw new TypeError('Duplicate required occurrence');
    const predecessor = input.predecessorCaseReference === null ? null : opaque(input.predecessorCaseReference);
    if (predecessor === input.id) throw new TypeError('Case cannot supersede itself');
    return new RenewalCaseDefinition({ id: opaque(input.id), version: input.version, basis: input.basis, applicant: input.applicant, recipient: input.recipient, requiredClaims: refs(input.requiredClaims), requiredOccurrences: Object.freeze(occurrences), planReference: opaque(input.planReference), planVersion: input.planVersion, createdAt: input.createdAt, predecessorCaseReference: predecessor });
  }
  toJSON() {
    return freeze({ id: this.id, version: this.version.toString(), basis: this.basis.toJSON(), applicantId: this.applicant.id.toString(), recipientId: this.recipient.id.toString(), requiredClaims: [...this.requiredClaims], requiredOccurrences: this.requiredOccurrences.map(o => ({ reference: o.obligation.occurrenceReference(o.sequence), sequence: o.sequence, obligation: o.obligation.toJSON() })), planReference: this.planReference, planVersion: this.planVersion.toString(), createdAt: this.createdAt.toString(), predecessorCaseReference: this.predecessorCaseReference });
  }
}

export interface RenewalEvidencePackageInput {
  readonly definition: RenewalCaseDefinition;
  readonly reference: string;
  readonly expiry: ExpiryRenewalEvaluation;
  readonly evidenceSnapshot: EvidenceSnapshot;
  readonly coveredClaims: readonly string[];
  readonly source: SourceReference;
  readonly reviewedBy: ActorReference;
  readonly reviewReference: string;
  readonly recordedAt: UtcInstant;
  readonly validUntil: UtcInstant;
  readonly obligationProjections: readonly RecurringObligationProjection[];
}
export class RenewalEvidencePackage {
  readonly definition!: RenewalCaseDefinition;
  readonly reference!: string;
  readonly expiry!: ExpiryRenewalEvaluation;
  readonly evidenceSnapshot!: EvidenceSnapshot;
  readonly coveredClaims!: readonly string[];
  readonly source!: SourceReference;
  readonly reviewedBy!: ActorReference;
  readonly reviewReference!: string;
  readonly recordedAt!: UtcInstant;
  readonly validUntil!: UtcInstant;
  readonly obligationProjections!: readonly RecurringObligationProjection[];
  private constructor(input: RenewalEvidencePackageInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: RenewalEvidencePackageInput): RenewalEvidencePackage {
    if (!(input.definition instanceof RenewalCaseDefinition) || !(input.expiry instanceof ExpiryRenewalEvaluation) || !(input.evidenceSnapshot instanceof EvidenceSnapshot) || !(input.source instanceof SourceReference) || !(input.reviewedBy instanceof ActorReference)) throw new TypeError('Governed evidence package required');
    const recorded = time(input.recordedAt), e = input.expiry.toJSON();
    if (canonical(e.basis) !== canonical(input.definition.basis.toJSON())) throw new TypeError('Expiry evaluation basis mismatch');
    if (recorded < time(input.definition.createdAt) || time(input.validUntil) < recorded || time(input.evidenceSnapshot.capturedAt) > recorded || time(input.source.retrievedAt) > recorded || time(UtcInstant.from(e.calendar.evaluatedAt)) > recorded || time(UtcInstant.from(e.asKnownAt)) > recorded) throw new RangeError('Evidence package time or validity mismatch');
    if (input.evidenceSnapshot.entries.length > 1000 || !Array.isArray(input.obligationProjections) || input.obligationProjections.length > 1000) throw new RangeError('Package evidence budget exceeded');
    const projections = Array.from(input.obligationProjections);
    for (const p of projections) {
      if (!(p instanceof RecurringObligationProjection)) throw new TypeError('Governed obligation projection required');
      const v = p.toJSON();
      if (!input.definition.requiredOccurrences.some(o => canonical(o.obligation.toJSON()) === canonical(v.obligation))) throw new TypeError('Foreign obligation projection');
      if (time(UtcInstant.from(v.calendar.evaluatedAt)) > recorded || time(UtcInstant.from(v.asKnownAt)) > recorded) throw new RangeError('Projection knowledge exceeds package recording');
    }
    if (new Set(projections.map(p => canonical(p.toJSON().obligation))).size !== projections.length) throw new TypeError('Duplicate obligation projection');
    projections.sort((a, b) => compare(canonical(a.toJSON().obligation), canonical(b.toJSON().obligation)));
    return new RenewalEvidencePackage({ definition: input.definition, reference: opaque(input.reference), expiry: input.expiry, evidenceSnapshot: input.evidenceSnapshot, coveredClaims: refs(input.coveredClaims, true), source: input.source, reviewedBy: input.reviewedBy, reviewReference: opaque(input.reviewReference), recordedAt: input.recordedAt, validUntil: input.validUntil, obligationProjections: Object.freeze(projections) });
  }
  readiness(calendar: LifecycleCalendarContext, requiredClaims: readonly string[]): readonly string[] {
    const now = time(calendar.evaluatedAt), today = calendar.evaluatedOn.toString(), e = this.expiry.toJSON();
    const issues = evidenceIssues(this.evidenceSnapshot, this.source, this.definition.basis.jurisdiction.toString(), today);
    if (now < time(this.recordedAt)) issues.push('EVIDENCE_PACKAGE_NOT_YET_KNOWN');
    if (now > time(this.validUntil)) issues.push('EVIDENCE_PACKAGE_EXPIRED');
    if (requiredClaims.some(claim => !this.coveredClaims.includes(claim))) issues.push('REQUIRED_CLAIM_COVERAGE_MISSING');
    if (e.outcome !== 'EVALUATED' || e.policy === null || e.policy.renewal.mode !== 'WINDOW' || e.windowOpensOn === null || e.renewalDueOn === null) issues.push('RENEWAL_POLICY_UNRESOLVED');
    else if (today < e.windowOpensOn || today > e.renewalDueOn) issues.push('OUTSIDE_RENEWAL_ACTION_WINDOW');
    for (const needed of this.definition.requiredOccurrences) {
      const p = this.obligationProjections.find(item => canonical(item.toJSON().obligation) === canonical(needed.obligation.toJSON()));
      if (p === undefined) { issues.push('REQUIRED_OBLIGATION_PROJECTION_MISSING'); continue; }
      const view = p.toJSON(), occurrence = view.occurrences.find(item => item.reference === needed.obligation.occurrenceReference(needed.sequence));
      if (view.outcome === 'REVIEW_REQUIRED' || occurrence === undefined || occurrence.completionState !== 'ACCEPTED_RECORD' || occurrence.reasonCodes.length !== 0) issues.push('REQUIRED_OBLIGATION_NOT_ACCEPTED');
    }
    return Object.freeze([...new Set(issues)].sort(compare));
  }
  toJSON() {
    return freeze({ definitionId: this.definition.id, definitionVersion: this.definition.version.toString(), reference: this.reference, expiry: this.expiry.toJSON(), evidence: evidenceView(this.evidenceSnapshot), coveredClaims: [...this.coveredClaims], source: sourceView(this.source), reviewedById: this.reviewedBy.id.toString(), reviewReference: this.reviewReference, recordedAt: this.recordedAt.toString(), validUntil: this.validUntil.toString(), obligationProjections: this.obligationProjections.map(p => p.toJSON()) });
  }
}

export interface RenewalCaseGrantInput {
  readonly reference: string;
  readonly version: VersionId;
  readonly definition: RenewalCaseDefinition;
  readonly actor: ActorReference;
  readonly grantedBy: ActorReference;
  readonly permissions: readonly RenewalCasePermission[];
  readonly grantedAt: UtcInstant;
  readonly validFrom: UtcInstant;
  readonly validUntil: UtcInstant;
  readonly revokedAt: UtcInstant | null;
  readonly approvalReference: string;
}
export class RenewalCaseGrant {
  readonly reference!: string;
  readonly version!: VersionId;
  readonly definition!: RenewalCaseDefinition;
  readonly actor!: ActorReference;
  readonly grantedBy!: ActorReference;
  readonly permissions!: readonly RenewalCasePermission[];
  readonly grantedAt!: UtcInstant;
  readonly validFrom!: UtcInstant;
  readonly validUntil!: UtcInstant;
  readonly revokedAt!: UtcInstant | null;
  readonly approvalReference!: string;
  private constructor(input: RenewalCaseGrantInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: RenewalCaseGrantInput): RenewalCaseGrant {
    if (!(input.definition instanceof RenewalCaseDefinition) || !(input.version instanceof VersionId) || !(input.actor instanceof ActorReference) || input.actor.kind !== ActorKind.HUMAN_USER || !(input.grantedBy instanceof ActorReference) || same(input.actor.id, input.grantedBy.id)) throw new TypeError('Independently assigned human case grant required');
    if (!Array.isArray(input.permissions) || input.permissions.length === 0 || input.permissions.length > PERMISSIONS.length || Array.from(input.permissions).some(p => !PERMISSIONS.includes(p)) || new Set(input.permissions).size !== input.permissions.length) throw new TypeError('Controlled unique case permissions required');
    const granted = time(input.grantedAt), start = time(input.validFrom), end = time(input.validUntil);
    if (granted < time(input.definition.createdAt) || start > end || granted > end || (input.revokedAt !== null && time(input.revokedAt) < granted)) throw new RangeError('Invalid case grant validity');
    return new RenewalCaseGrant({ reference: opaque(input.reference), version: input.version, definition: input.definition, actor: input.actor, grantedBy: input.grantedBy, permissions: Object.freeze([...input.permissions].sort(compare)), grantedAt: input.grantedAt, validFrom: input.validFrom, validUntil: input.validUntil, revokedAt: input.revokedAt, approvalReference: opaque(input.approvalReference) });
  }
  toJSON() { return freeze({ reference: this.reference, version: this.version.toString(), definitionId: this.definition.id, definitionVersion: this.definition.version.toString(), actorId: this.actor.id.toString(), grantedById: this.grantedBy.id.toString(), permissions: [...this.permissions], grantedAt: this.grantedAt.toString(), validFrom: this.validFrom.toString(), validUntil: this.validUntil.toString(), revokedAt: this.revokedAt?.toString() ?? null, approvalReference: this.approvalReference }); }
}

export interface RenewalCaseInvocation {
  readonly context: ApplicationExecutionContext;
  readonly authorizedContext: TenantContext;
  readonly boundary: TenantBoundary;
  readonly accessDecision: TenantAccessDecision;
  readonly calendar: LifecycleCalendarContext;
  readonly grant: RenewalCaseGrant;
}
function authorize(definition: RenewalCaseDefinition, input: RenewalCaseInvocation, permission: RenewalCasePermission): void {
  const c = input.context, reader = input.authorizedContext, a = input.accessDecision, g = input.grant;
  if (!(c instanceof ApplicationExecutionContext) || !(reader instanceof TenantContext) || !(input.boundary instanceof TenantBoundary) || !(a instanceof TenantAccessDecision)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if (a.disposition !== AccessDisposition.ALLOW || c.tenantScope === null || c.organizationScope === null || c.subject === null || c.purpose === null || c.accessDecision === null || c.operation.toString() !== RENEWAL_CASE_OPERATION || !a.allowedFields.includes(RENEWAL_CASE_FIELD)) throw new TenantAccessDeniedError();
  if (!same(c.tenantScope, reader.tenant) || !same(c.organizationScope, reader.organization) || !same(c.purpose, reader.purpose) || !same(c.actor.id, reader.actor.id) || c.actor.kind !== reader.actor.kind || !same(c.correlationId, reader.correlationId) || !same(a.tenant, reader.tenant) || !same(a.purpose, reader.purpose) || !same(a.reference, c.accessDecision)) throw new TenantAccessDeniedError();
  if (!(definition instanceof RenewalCaseDefinition) || !(g instanceof RenewalCaseGrant) || g.definition !== definition || !same(g.actor.id, c.actor.id) || g.actor.kind !== c.actor.kind || !g.permissions.includes(permission)) throw new TenantAccessDeniedError();
  const b = definition.basis;
  if (!same(b.tenant, reader.tenant) || !same(b.organization, reader.organization) || !same(b.purpose, reader.purpose) || !same(b.artifact.subject!.id, c.subject.id) || b.artifact.subject!.kind !== c.subject.kind) throw new TenantAccessDeniedError();
  const now = time(c.requestedAt);
  if (now < time(g.grantedAt) || now < time(g.validFrom) || now > time(g.validUntil) || (g.revokedAt !== null && now >= time(g.revokedAt))) throw new TenantAccessDeniedError();
  if (!(input.calendar instanceof LifecycleCalendarContext) || !same(input.calendar.evaluatedAt, c.requestedAt)) throw new RangeError('Calendar and invocation instant must match');
  if (now < time(definition.createdAt)) throw new RangeError('Invocation predates case');
}

export interface RenewalExternalObservationInput {
  readonly definition: RenewalCaseDefinition;
  readonly id: string;
  readonly kind: 'SUBMISSION' | 'INFORMATION_REQUEST' | 'RENEWAL' | 'REJECTION';
  readonly submissionReference: string;
  readonly packageReference: string;
  readonly occurred: LifecycleCalendarContext;
  readonly recordedAt: UtcInstant;
  readonly source: SourceReference;
  readonly evidenceSnapshot: EvidenceSnapshot;
  readonly reviewedBy: ActorReference;
  readonly reviewReference: string;
  readonly requestedClaims: readonly string[];
}
/** Records an external action/outcome already observed; this class sends or grants nothing. */
export class RenewalExternalObservation {
  readonly definition!: RenewalCaseDefinition;
  readonly id!: string;
  readonly kind!: RenewalExternalObservationInput['kind'];
  readonly submissionReference!: string;
  readonly packageReference!: string;
  readonly occurred!: LifecycleCalendarContext;
  readonly recordedAt!: UtcInstant;
  readonly source!: SourceReference;
  readonly evidenceSnapshot!: EvidenceSnapshot;
  readonly reviewedBy!: ActorReference;
  readonly reviewReference!: string;
  readonly requestedClaims!: readonly string[];
  private constructor(input: RenewalExternalObservationInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: RenewalExternalObservationInput): RenewalExternalObservation {
    if (!(input.definition instanceof RenewalCaseDefinition) || !(input.occurred instanceof LifecycleCalendarContext) || !(input.source instanceof SourceReference) || !(input.evidenceSnapshot instanceof EvidenceSnapshot) || !(input.reviewedBy instanceof ActorReference)) throw new TypeError('Governed external observation required');
    if (!['SUBMISSION', 'INFORMATION_REQUEST', 'RENEWAL', 'REJECTION'].includes(input.kind)) throw new TypeError('Controlled external observation kind required');
    const occurred = time(input.occurred.evaluatedAt), recorded = time(input.recordedAt), capture = time(input.evidenceSnapshot.capturedAt);
    if (occurred < time(input.definition.createdAt) || occurred > capture || capture > recorded || time(input.source.retrievedAt) > recorded || input.evidenceSnapshot.entries.length > 1000) throw new RangeError('External observation provenance/time mismatch');
    const requestedClaims = refs(input.requestedClaims, input.kind !== 'INFORMATION_REQUEST');
    if (input.kind !== 'INFORMATION_REQUEST' && requestedClaims.length > 0) throw new TypeError('Only information requests add claims');
    return new RenewalExternalObservation({ definition: input.definition, id: opaque(input.id), kind: input.kind, submissionReference: opaque(input.submissionReference), packageReference: opaque(input.packageReference), occurred: input.occurred, recordedAt: input.recordedAt, source: input.source, evidenceSnapshot: input.evidenceSnapshot, reviewedBy: input.reviewedBy, reviewReference: opaque(input.reviewReference), requestedClaims });
  }
  assertVerified(): void {
    if (!same(this.source.authority.id, this.definition.recipient.id) || this.source.authority.kind !== this.definition.recipient.kind || evidenceIssues(this.evidenceSnapshot, this.source, this.definition.basis.jurisdiction.toString(), this.occurred.evaluatedOn.toString()).length > 0) throw new TypeError('External observation requires verified recipient evidence or human review');
  }
  toJSON() { return freeze({ definitionId: this.definition.id, definitionVersion: this.definition.version.toString(), id: this.id, kind: this.kind, submissionReference: this.submissionReference, packageReference: this.packageReference, occurred: this.occurred.toJSON(), recordedAt: this.recordedAt.toString(), source: sourceView(this.source), evidence: evidenceView(this.evidenceSnapshot), reviewedById: this.reviewedBy.id.toString(), reviewReference: this.reviewReference, requestedClaims: [...this.requestedClaims] }); }
}

export type RenewalCaseChange =
  | { readonly kind: 'PREPARE' }
  | { readonly kind: 'MARK_READY' }
  | { readonly kind: 'CANCEL' }
  | { readonly kind: 'ATTACH_PACKAGE'; readonly package: RenewalEvidencePackage }
  | { readonly kind: 'RECORD_EXTERNAL'; readonly observation: RenewalExternalObservation };
export interface RenewalCaseCommandInput {
  readonly id: CommandId;
  readonly definition: RenewalCaseDefinition;
  readonly expectedRevision: number;
  readonly idempotencyKey: string;
  readonly submittedAt: UtcInstant;
  readonly rationaleReference: string;
  readonly change: RenewalCaseChange;
}
export class RenewalCaseCommand {
  readonly id!: CommandId;
  readonly definition!: RenewalCaseDefinition;
  readonly expectedRevision!: number;
  readonly idempotencyKey!: string;
  readonly submittedAt!: UtcInstant;
  readonly rationaleReference!: string;
  readonly change!: RenewalCaseChange;
  private constructor(input: RenewalCaseCommandInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: RenewalCaseCommandInput): RenewalCaseCommand {
    if (!(input.id instanceof CommandId) || !(input.definition instanceof RenewalCaseDefinition)) throw new TypeError('Governed command ID and definition required');
    integer(input.expectedRevision, 1000);
    if (time(input.submittedAt) < time(input.definition.createdAt)) throw new RangeError('Command submission predates definition');
    const change = input.change;
    if (change === null || typeof change !== 'object') throw new TypeError('Controlled command change required');
    switch (change.kind) {
      case 'PREPARE': case 'MARK_READY': case 'CANCEL': exact(change, ['kind']); break;
      case 'ATTACH_PACKAGE':
        exact(change, ['kind', 'package']);
        if (!(change.package instanceof RenewalEvidencePackage) || change.package.definition !== input.definition || time(change.package.recordedAt) > time(input.submittedAt)) throw new TypeError('Exact known evidence package required');
        break;
      case 'RECORD_EXTERNAL':
        exact(change, ['kind', 'observation']);
        if (!(change.observation instanceof RenewalExternalObservation) || change.observation.definition !== input.definition || time(change.observation.recordedAt) > time(input.submittedAt)) throw new TypeError('Exact known external observation required');
        break;
      default: throw new TypeError('Unknown renewal case command');
    }
    return new RenewalCaseCommand({ id: input.id, definition: input.definition, expectedRevision: input.expectedRevision, idempotencyKey: opaque(input.idempotencyKey), submittedAt: input.submittedAt, rationaleReference: opaque(input.rationaleReference), change: Object.freeze({ ...change }) });
  }
  toJSON() {
    const change = this.change;
    return freeze({ id: this.id.toString(), definitionId: this.definition.id, definitionVersion: this.definition.version.toString(), expectedRevision: this.expectedRevision, idempotencyKey: this.idempotencyKey, submittedAt: this.submittedAt.toString(), rationaleReference: this.rationaleReference, change: change.kind === 'ATTACH_PACKAGE' ? { kind: change.kind, package: change.package.toJSON() } : change.kind === 'RECORD_EXTERNAL' ? { kind: change.kind, observation: change.observation.toJSON() } : { kind: change.kind } });
  }
}
export class RenewalRevisionConflictError extends Error {
  readonly expected: number;
  readonly observed: number;
  constructor(expected: number, observed: number) { super('Renewal case revision conflict'); this.name = 'RenewalRevisionConflictError'; this.expected = expected; this.observed = observed; }
}
export interface RenewalCaseTransitionRecord {
  readonly revision: number;
  readonly command: RenewalCaseCommand;
  readonly context: ApplicationExecutionContext;
  readonly grant: RenewalCaseGrant;
  readonly accessDecision: TenantAccessDecision;
  readonly state: RenewalCaseState;
  readonly reasonCodes: readonly string[];
}
interface SubmissionRecord { readonly reference: string; readonly packageReference: string; readonly occurredAt: UtcInstant; readonly actor: ActorReference; }
interface HistoryState {
  readonly definition: RenewalCaseDefinition;
  readonly openedAt: UtcInstant;
  readonly state: RenewalCaseState;
  readonly records: readonly RenewalCaseTransitionRecord[];
  readonly evidencePackage: RenewalEvidencePackage | null;
  readonly requiredClaims: readonly string[];
  readonly readyAt: UtcInstant | null;
  readonly submission: SubmissionRecord | null;
  readonly round: number;
}
/** Pure internal workflow transitions. Durable commits/idempotency belong to the existing UnitOfWork. */
export class RenewalCaseHistory {
  readonly definition: RenewalCaseDefinition;
  readonly openedAt: UtcInstant;
  readonly state: RenewalCaseState;
  readonly records: readonly RenewalCaseTransitionRecord[];
  readonly revision: number;
  readonly evidencePackage: RenewalEvidencePackage | null;
  readonly requiredClaims: readonly string[];
  readonly readyAt: UtcInstant | null;
  readonly submission: SubmissionRecord | null;
  readonly round: number;
  private constructor(input: HistoryState) {
    this.definition = input.definition; this.openedAt = input.openedAt; this.state = input.state;
    this.records = Object.freeze([...input.records]); this.revision = this.records.length;
    this.evidencePackage = input.evidencePackage; this.requiredClaims = Object.freeze([...input.requiredClaims]);
    this.readyAt = input.readyAt; this.submission = input.submission; this.round = input.round; Object.freeze(this);
  }
  static open(input: { readonly definition: RenewalCaseDefinition; readonly invocation: RenewalCaseInvocation }): RenewalCaseHistory {
    authorize(input.definition, input.invocation, 'OPEN');
    return new RenewalCaseHistory({ definition: input.definition, openedAt: input.invocation.context.requestedAt, state: 'DRAFT', records: [], evidencePackage: null, requiredClaims: input.definition.requiredClaims, readyAt: null, submission: null, round: 0 });
  }
  read(invocation: RenewalCaseInvocation): ReturnType<RenewalCaseHistory['toJSON']> {
    authorize(this.definition, invocation, 'READ');
    if (time(invocation.context.requestedAt) < time(this.records.at(-1)?.context.requestedAt ?? this.openedAt)) throw new RangeError('Historical query cannot expose future workflow history');
    return this.toJSON();
  }
  apply(input: { readonly command: RenewalCaseCommand; readonly invocation: RenewalCaseInvocation }): RenewalCaseHistory {
    authorize(this.definition, input.invocation, 'READ');
    const c = input.command, i = input.invocation;
    if (!(c instanceof RenewalCaseCommand) || c.definition !== this.definition) throw new TypeError('Command must bind exact workflow definition');
    authorize(this.definition, i, c.change.kind);
    if (c.change.kind === 'RECORD_EXTERNAL' && (c.change.observation.kind === 'RENEWAL' || c.change.observation.kind === 'REJECTION')) authorize(this.definition, i, 'RECORD_OUTCOME');
    const now = time(i.context.requestedAt), previous = this.records.at(-1);
    if (now < time(c.submittedAt) || now < time(previous?.context.requestedAt ?? this.openedAt)) throw new RangeError('Invocation precedes command or recorded history');
    const replay = this.records.find(r => r.command.idempotencyKey === c.idempotencyKey || same(r.command.id, c.id));
    if (replay !== undefined) {
      if (canonical(replay.command.toJSON()) !== canonical(c.toJSON()) || !same(replay.context.actor.id, i.context.actor.id) || replay.context.actor.kind !== i.context.actor.kind) throw new TypeError('Command identity or idempotency collision');
      return this;
    }
    if (c.expectedRevision !== this.revision) throw new RenewalRevisionConflictError(c.expectedRevision, this.revision);
    if (TERMINAL.includes(this.state)) throw new TypeError('Terminal renewal case requires a new governed case');
    if (this.records.length >= 1000) throw new RangeError('Workflow history budget exceeded');
    if (time(c.submittedAt) < time(previous?.command.submittedAt ?? this.openedAt)) throw new RangeError('Command submission time must be monotonic');
    let state = this.state, evidencePackage = this.evidencePackage, requiredClaims = this.requiredClaims, readyAt = this.readyAt, submission = this.submission, round = this.round;
    const reasons: string[] = [], change = c.change;
    const requireState = (...allowed: RenewalCaseState[]) => { if (!allowed.includes(this.state)) throw new TypeError('Invalid renewal workflow transition'); };
    switch (change.kind) {
      case 'PREPARE': requireState('DRAFT'); state = 'PREPARING'; break;
      case 'ATTACH_PACKAGE': {
        requireState('PREPARING', 'READY', 'AWAITING_INFORMATION');
        if (this.records.some(r => r.command.change.kind === 'ATTACH_PACKAGE' && r.command.change.package.reference === change.package.reference)) throw new TypeError('Package reference cannot be reused');
        evidencePackage = change.package; readyAt = null;
        state = this.state === 'AWAITING_INFORMATION' ? 'AWAITING_INFORMATION' : 'PREPARING'; break;
      }
      case 'MARK_READY': {
        requireState('PREPARING', 'AWAITING_INFORMATION');
        reasons.push(...(evidencePackage === null ? ['EVIDENCE_PACKAGE_MISSING'] : evidencePackage.readiness(i.calendar, requiredClaims)));
        if (reasons.length === 0) { state = 'READY'; readyAt = i.context.requestedAt; }
        break;
      }
      case 'RECORD_EXTERNAL': {
        const o = change.observation;
        o.assertVerified();
        if (this.records.some(r => r.command.change.kind === 'RECORD_EXTERNAL' && r.command.change.observation.id === o.id)) throw new TypeError('External observation already recorded');
        if (time(o.recordedAt) > now) throw new RangeError('External observation exceeds invocation');
        if (o.kind === 'SUBMISSION') {
          requireState('READY');
          if (evidencePackage === null || readyAt === null || o.packageReference !== evidencePackage.reference || time(o.occurred.evaluatedAt) < time(readyAt)) throw new TypeError('Receipt must bind current ready package and actual later action');
          if (this.records.some(r => r.command.change.kind === 'RECORD_EXTERNAL' && r.command.change.observation.kind === 'SUBMISSION' && r.command.change.observation.submissionReference === o.submissionReference)) throw new TypeError('Submission receipt identity already used');
          const due = evidencePackage.expiry.toJSON().renewalDueOn;
          if (due !== null && o.occurred.evaluatedOn.toString() > due) reasons.push('EXTERNAL_SUBMISSION_AFTER_DUE');
          submission = Object.freeze({ reference: o.submissionReference, packageReference: o.packageReference, occurredAt: o.occurred.evaluatedAt, actor: i.context.actor });
          state = 'SUBMITTED'; round++; readyAt = null;
        } else {
          requireState('SUBMITTED', 'AWAITING_INFORMATION');
          if (submission === null || o.submissionReference !== submission.reference || o.packageReference !== submission.packageReference || time(o.occurred.evaluatedAt) < time(submission.occurredAt)) throw new TypeError('External response must bind current submission and package');
          if (o.kind === 'INFORMATION_REQUEST') {
            requireState('SUBMITTED');
            requiredClaims = refs([...new Set([...requiredClaims, ...o.requestedClaims])]);
            state = 'AWAITING_INFORMATION'; readyAt = null;
          } else {
            if ([this.definition.applicant.id, submission.actor.id].some(id => same(id, i.context.actor.id) || same(id, o.reviewedBy.id))) throw new TenantAccessDeniedError();
            state = o.kind === 'RENEWAL' ? 'RENEWAL_RECORDED' : 'REJECTION_RECORDED'; readyAt = null;
          }
        }
        break;
      }
      case 'CANCEL': state = 'CANCELLED'; readyAt = null; reasons.push('INTERNAL_CANCELLATION_ONLY'); break;
    }
    const record: RenewalCaseTransitionRecord = Object.freeze({ revision: this.revision + 1, command: c, context: i.context, grant: i.grant, accessDecision: i.accessDecision, state, reasonCodes: Object.freeze([...new Set(reasons)].sort(compare)) });
    return new RenewalCaseHistory({ definition: this.definition, openedAt: this.openedAt, state, records: [...this.records, record], evidencePackage, requiredClaims, readyAt, submission, round });
  }
  toJSON() {
    return freeze({ definition: this.definition.toJSON(), openedAt: this.openedAt.toString(), revision: this.revision, state: this.state, packageReference: this.evidencePackage?.reference ?? null, requiredClaims: [...this.requiredClaims], readyAt: this.readyAt?.toString() ?? null, round: this.round, submission: this.submission === null ? null : { reference: this.submission.reference, packageReference: this.submission.packageReference, occurredAt: this.submission.occurredAt.toString(), actorId: this.submission.actor.id.toString() }, records: this.records.map(r => ({ revision: r.revision, command: r.command.toJSON(), actorId: r.context.actor.id.toString(), actorKind: r.context.actor.kind, tenant: r.context.tenantScope!.toString(), organization: r.context.organizationScope!.toString(), subjectId: r.context.subject!.id.toString(), purpose: r.context.purpose!.toString(), correlationId: r.context.correlationId.toString(), recordedAt: r.context.requestedAt.toString(), accessDecisionReference: r.accessDecision.reference.toString(), auditReference: r.accessDecision.auditReference.toString(), grant: r.grant.toJSON(), state: r.state, reasonCodes: [...r.reasonCodes] })), authorizationAuthority: false as const, credentialStateMutated: false as const, renewalPerformed: false as const, submissionSent: false as const, externalWithdrawalPerformed: false as const, notificationScheduled: false as const, eventsEmitted: 0 as const, physicalDeletionAuthorized: false as const });
  }
}
