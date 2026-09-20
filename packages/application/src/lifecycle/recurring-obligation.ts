import { ActorReference, CredentialDefinitionReference, DateOnly, EvidenceSnapshot, Jurisdiction, SourceReference, UtcInstant, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { AccessDisposition, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext } from '../tenant/tenant-governance.ts';
import { CredentialLifecycleBasis } from './credential-lifecycle-timeline.ts';
import { LifecycleCalendarContext, shiftLifecycleDate } from './expiry-renewal-policy.ts';
import type { CalendarUnit, MonthEndConvention } from './expiry-renewal-policy.ts';

export const RECURRING_OBLIGATION_OPERATION = 'credential.lifecycle.obligations.project';
export const RECURRING_OBLIGATION_FIELD = 'credential:recurring-obligations';
export type ObligationKind = 'EXAM' | 'MEDICAL_CHECK' | 'CONTINUING_EDUCATION' | 'PERIODIC_CHECK';
export type RecurrenceCadence = 'FIXED_ANCHOR' | 'AFTER_ACCEPTED_COMPLETION';
export type ObligationAnchor = { readonly kind: 'ISSUED_ON' } | { readonly kind: 'EFFECTIVE_FROM' } | { readonly kind: 'EXPLICIT_DATE'; readonly on: DateOnly; readonly reference: string };
type DeepReadonly<T> = T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
type Mutable<T> = { -readonly [K in keyof T]: T[K] };

function opaque(value: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(value)) throw new TypeError('Bounded opaque reference required');
  return value;
}
function instant(value: UtcInstant): number {
  if (!(value instanceof UtcInstant)) throw new TypeError('Explicit UtcInstant required');
  return value.toEpochMilliseconds();
}
function date(value: DateOnly): string {
  if (!(value instanceof DateOnly) || Number(value.toString().slice(0, 4)) < 1) throw new TypeError('Explicit supported DateOnly required');
  return value.toString();
}
function same(a: { toString(): string }, b: { toString(): string }): boolean { return a.toString() === b.toString(); }
function compare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function integer(value: number, minimum: number, maximum: number): void {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new RangeError('Quantity outside explicit bounds');
}
function exact(value: unknown, keys: readonly string[]): void {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw new TypeError('Unexpected or missing controlled fields');
}
function references(values: readonly string[], allowEmpty: boolean): readonly string[] {
  if (!Array.isArray(values) || values.length > 1000 || (!allowEmpty && values.length === 0)) throw new TypeError('Bounded reference array required');
  const copied = Array.from(values).map(opaque).sort(compare);
  if (new Set(copied).size !== copied.length) throw new TypeError('Duplicate reference');
  return Object.freeze(copied);
}
// Freeze assembled output only; never traverse raw evidence or event payload objects.
function freeze<T>(value: T): T {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value;
}
function sourceView(source: SourceReference) {
  return { id: source.id.toString(), version: source.version.toString(), authorityId: source.authority.id.toString(), jurisdiction: source.jurisdiction.toString(), retrievedAt: source.retrievedAt.toString(), verificationState: source.verificationState.toString(), effectiveFrom: source.effectiveFrom?.toString() ?? null, effectiveTo: source.effectiveTo?.toString() ?? null, hash: source.contentHash?.toString() ?? null };
}
function outsideSource(source: SourceReference, on: string): boolean {
  return (source.effectiveFrom !== null && source.effectiveFrom.toString() > on) || (source.effectiveTo !== null && source.effectiveTo.toString() < on);
}

export interface RecurringObligationRuleInput {
  readonly id: string;
  readonly version: VersionId;
  readonly credentialDefinition: CredentialDefinitionReference;
  readonly jurisdiction: Jurisdiction;
  readonly validFrom: DateOnly;
  readonly validTo: DateOnly | null;
  readonly knownAt: UtcInstant;
  readonly source: SourceReference;
  readonly sourceSnapshotReference: string;
  readonly approvedAt: UtcInstant;
  readonly approvedBy: ActorReference;
  readonly approvalReference: string;
  readonly conditions: readonly string[];
  readonly kind: ObligationKind;
  readonly cadence: RecurrenceCadence;
  readonly interval: { readonly amount: number; readonly unit: CalendarUnit; readonly monthEnd: MonthEndConvention };
  readonly windowDaysBeforeDue: number;
  readonly graceDaysAfterDue: number;
  readonly requiredEvidenceClaims: readonly string[];
}

/** Consistent approved-rule snapshot; an authenticated external entrypoint supplies actual approval. */
export class RecurringObligationRule {
  readonly id!: string;
  readonly version!: VersionId;
  readonly credentialDefinition!: CredentialDefinitionReference;
  readonly jurisdiction!: Jurisdiction;
  readonly validFrom!: DateOnly;
  readonly validTo!: DateOnly | null;
  readonly knownAt!: UtcInstant;
  readonly source!: SourceReference;
  readonly sourceSnapshotReference!: string;
  readonly approvedAt!: UtcInstant;
  readonly approvedBy!: ActorReference;
  readonly approvalReference!: string;
  readonly conditions!: readonly string[];
  readonly kind!: ObligationKind;
  readonly cadence!: RecurrenceCadence;
  readonly interval!: RecurringObligationRuleInput['interval'];
  readonly windowDaysBeforeDue!: number;
  readonly graceDaysAfterDue!: number;
  readonly requiredEvidenceClaims!: readonly string[];
  private constructor(input: RecurringObligationRuleInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: RecurringObligationRuleInput): RecurringObligationRule {
    if (!(input.version instanceof VersionId) || !(input.credentialDefinition instanceof CredentialDefinitionReference) || !(input.jurisdiction instanceof Jurisdiction) || !(input.source instanceof SourceReference) || !(input.approvedBy instanceof ActorReference)) throw new TypeError('Governed rule identity, target, source and approval required');
    const start = date(input.validFrom), end = input.validTo === null ? null : date(input.validTo), known = instant(input.knownAt);
    if (end !== null && start > end) throw new RangeError('Inverted rule effectivity');
    if (instant(input.source.retrievedAt) > known || instant(input.approvedAt) > known) throw new RangeError('Rule knowledge predates source or approval');
    if (!['EXAM', 'MEDICAL_CHECK', 'CONTINUING_EDUCATION', 'PERIODIC_CHECK'].includes(input.kind) || !['FIXED_ANCHOR', 'AFTER_ACCEPTED_COMPLETION'].includes(input.cadence)) throw new TypeError('Controlled obligation kind and cadence required');
    exact(input.interval, ['amount', 'unit', 'monthEnd']);
    if (!['DAYS', 'MONTHS', 'YEARS'].includes(input.interval.unit) || !['CLAMP', 'REJECT'].includes(input.interval.monthEnd)) throw new TypeError('Controlled calendar interval required');
    integer(input.interval.amount, 1, input.interval.unit === 'DAYS' ? 365250 : input.interval.unit === 'MONTHS' ? 12000 : 1000);
    integer(input.windowDaysBeforeDue, 0, 365250); integer(input.graceDaysAfterDue, 0, 365250);
    return new RecurringObligationRule({ id: opaque(input.id), version: input.version, credentialDefinition: input.credentialDefinition, jurisdiction: input.jurisdiction, validFrom: input.validFrom, validTo: input.validTo, knownAt: input.knownAt, source: input.source, sourceSnapshotReference: opaque(input.sourceSnapshotReference), approvedAt: input.approvedAt, approvedBy: input.approvedBy, approvalReference: opaque(input.approvalReference), conditions: references(input.conditions, true), kind: input.kind, cadence: input.cadence, interval: Object.freeze({ ...input.interval }), windowDaysBeforeDue: input.windowDaysBeforeDue, graceDaysAfterDue: input.graceDaysAfterDue, requiredEvidenceClaims: references(input.requiredEvidenceClaims, false) });
  }
  toJSON() {
    return freeze({ id: this.id, version: this.version.toString(), credentialDefinition: { id: this.credentialDefinition.id.toString(), version: this.credentialDefinition.version.toString() }, jurisdiction: this.jurisdiction.toString(), validFrom: this.validFrom.toString(), validTo: this.validTo?.toString() ?? null, knownAt: this.knownAt.toString(), source: sourceView(this.source), sourceSnapshotReference: this.sourceSnapshotReference, approvedAt: this.approvedAt.toString(), approvedById: this.approvedBy.id.toString(), approvalReference: this.approvalReference, conditions: [...this.conditions], kind: this.kind, cadence: this.cadence, interval: { ...this.interval }, windowDaysBeforeDue: this.windowDaysBeforeDue, graceDaysAfterDue: this.graceDaysAfterDue, requiredEvidenceClaims: [...this.requiredEvidenceClaims] });
  }
}

export interface RecurringObligationInput {
  readonly id: string;
  readonly version: VersionId;
  readonly basis: CredentialLifecycleBasis;
  readonly rule: RecurringObligationRule;
  readonly anchor: ObligationAnchor;
  readonly recordedAt: UtcInstant;
}
export class RecurringObligation {
  readonly id: string;
  readonly version: VersionId;
  readonly basis: CredentialLifecycleBasis;
  readonly rule: RecurringObligationRule;
  readonly anchor: ObligationAnchor;
  readonly anchorOn: DateOnly | null;
  readonly recordedAt: UtcInstant;
  private constructor(input: RecurringObligationInput, anchorOn: DateOnly | null) {
    this.id = opaque(input.id); this.version = input.version; this.basis = input.basis; this.rule = input.rule;
    this.anchor = Object.freeze({ ...input.anchor }); this.anchorOn = anchorOn; this.recordedAt = input.recordedAt; Object.freeze(this);
  }
  static bind(input: RecurringObligationInput): RecurringObligation {
    if (!(input.version instanceof VersionId) || !(input.basis instanceof CredentialLifecycleBasis) || !(input.rule instanceof RecurringObligationRule)) throw new TypeError('Governed obligation version, exact basis and rule required');
    const rule = input.rule, basis = input.basis;
    if (!same(rule.credentialDefinition.id, basis.credentialDefinition.id) || !same(rule.credentialDefinition.version, basis.credentialDefinition.version) || !same(rule.jurisdiction, basis.jurisdiction)) throw new TypeError('Obligation rule target or jurisdiction mismatch');
    if (instant(input.recordedAt) < Math.max(instant(basis.recordedAt), instant(rule.knownAt))) throw new RangeError('Obligation knowledge predates required snapshots');
    const anchor = input.anchor;
    if (anchor === null || typeof anchor !== 'object') throw new TypeError('Controlled anchor required');
    let on: DateOnly | null;
    if (anchor.kind === 'ISSUED_ON' || anchor.kind === 'EFFECTIVE_FROM') {
      exact(anchor, ['kind']); on = anchor.kind === 'ISSUED_ON' ? basis.artifact.issuedOn : basis.artifact.effectiveFrom;
    } else if (anchor.kind === 'EXPLICIT_DATE') {
      exact(anchor, ['kind', 'on', 'reference']); date(anchor.on); opaque(anchor.reference); on = anchor.on;
    } else throw new TypeError('Unsupported obligation anchor');
    if (on !== null) date(on);
    return new RecurringObligation(input, on);
  }
  occurrenceReference(sequence: number): string {
    integer(sequence, 1, 10000);
    return JSON.stringify(['calpq.obligation.occurrence.v1', this.basis.tenant.toString(), this.id, this.version.toString(), this.basis.snapshotReference, this.rule.id, this.rule.version.toString(), sequence]);
  }
  toJSON() {
    return freeze({ id: this.id, version: this.version.toString(), basis: this.basis.toJSON(), rule: this.rule.toJSON(), anchor: { kind: this.anchor.kind, on: this.anchorOn?.toString() ?? null, reference: this.anchor.kind === 'EXPLICIT_DATE' ? this.anchor.reference : this.basis.snapshotReference }, recordedAt: this.recordedAt.toString() });
  }
}

export interface ObligationCompletionRecordInput {
  readonly id: string;
  readonly obligation: RecurringObligation;
  readonly sequence: number;
  readonly completedOn: DateOnly | null;
  readonly recorded: LifecycleCalendarContext;
  readonly disposition: 'ACCEPTED' | 'REVIEW_REQUIRED' | 'REJECTED';
  readonly evidenceSnapshot: EvidenceSnapshot;
  readonly coveredClaims: readonly string[];
  readonly source: SourceReference;
  readonly reviewedBy: ActorReference;
  readonly reviewReference: string;
}
/** A previously issued external review observation, never an approval writer. */
export class ObligationCompletionRecord {
  readonly id!: string;
  readonly obligation!: RecurringObligation;
  readonly sequence!: number;
  readonly completedOn!: DateOnly | null;
  readonly recorded!: LifecycleCalendarContext;
  readonly disposition!: ObligationCompletionRecordInput['disposition'];
  readonly evidenceSnapshot!: EvidenceSnapshot;
  readonly coveredClaims!: readonly string[];
  readonly source!: SourceReference;
  readonly reviewedBy!: ActorReference;
  readonly reviewReference!: string;
  private constructor(input: ObligationCompletionRecordInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: ObligationCompletionRecordInput): ObligationCompletionRecord {
    if (!(input.obligation instanceof RecurringObligation) || !(input.recorded instanceof LifecycleCalendarContext) || !(input.evidenceSnapshot instanceof EvidenceSnapshot) || !(input.source instanceof SourceReference) || !(input.reviewedBy instanceof ActorReference)) throw new TypeError('Governed completion evidence, source, reviewer and recording context required');
    integer(input.sequence, 1, 10000);
    if (!['ACCEPTED', 'REVIEW_REQUIRED', 'REJECTED'].includes(input.disposition)) throw new TypeError('Controlled completion disposition required');
    if (input.disposition === 'ACCEPTED' && input.completedOn === null) throw new TypeError('Accepted completion requires an explicit date');
    if (input.completedOn !== null && date(input.completedOn) > date(input.recorded.evaluatedOn)) throw new RangeError('Completion date postdates recording');
    const recorded = instant(input.recorded.evaluatedAt);
    if (recorded < instant(input.obligation.recordedAt) || instant(input.evidenceSnapshot.capturedAt) > recorded || instant(input.source.retrievedAt) > recorded) throw new RangeError('Completion recording precedes required evidence');
    if (input.evidenceSnapshot.entries.length > 1000) throw new RangeError('Completion evidence budget exceeded');
    return new ObligationCompletionRecord({ id: opaque(input.id), obligation: input.obligation, sequence: input.sequence, completedOn: input.completedOn, recorded: input.recorded, disposition: input.disposition, evidenceSnapshot: input.evidenceSnapshot, coveredClaims: references(input.coveredClaims, true), source: input.source, reviewedBy: input.reviewedBy, reviewReference: opaque(input.reviewReference) });
  }
  toJSON() {
    return freeze({ id: this.id, occurrenceReference: this.obligation.occurrenceReference(this.sequence), sequence: this.sequence, completedOn: this.completedOn?.toString() ?? null, recorded: this.recorded.toJSON(), disposition: this.disposition, coveredClaims: [...this.coveredClaims], reviewedById: this.reviewedBy.id.toString(), reviewReference: this.reviewReference, source: sourceView(this.source), evidenceCapturedAt: this.evidenceSnapshot.capturedAt.toString(), evidence: this.evidenceSnapshot.entries.map(entry => ({ id: entry.evidenceId.toString(), evidenceClass: entry.evidenceClass, kind: entry.evidenceKind, hash: entry.contentHash?.toString() ?? null, verificationState: entry.verificationState.toString(), sourceId: entry.sourceId?.toString() ?? null, sourceVersion: entry.sourceVersion?.toString() ?? null })).sort((a, b) => compare(a.id, b.id)) });
  }
}

export interface RecurringObligationProjectionInput {
  readonly reference: string;
  readonly context: ApplicationExecutionContext;
  readonly authorizedContext: TenantContext;
  readonly boundary: TenantBoundary;
  readonly accessDecision: TenantAccessDecision;
  readonly obligation: RecurringObligation;
  readonly jurisdiction: Jurisdiction;
  readonly calendar: LifecycleCalendarContext;
  readonly asKnownAt: UtcInstant;
  readonly horizonOn: DateOnly;
  readonly maxOccurrences: number;
  readonly records: readonly ObligationCompletionRecord[];
}
export interface RecurringObligationOccurrence {
  readonly reference: string;
  readonly sequence: number;
  readonly anchorOn: string;
  readonly windowOpensOn: string;
  readonly dueOn: string;
  readonly graceEndsOn: string;
  readonly calendarState: 'UPCOMING' | 'ACTION_WINDOW' | 'DUE_TODAY' | 'OVERDUE_WITHIN_GRACE' | 'OVERDUE';
  readonly completionState: 'NONE_RECORDED' | 'ACCEPTED_RECORD' | 'REVIEW_REQUIRED';
  readonly completionTiming: 'UNKNOWN' | 'ON_OR_BEFORE_DUE' | 'AFTER_DUE';
  readonly records: readonly DeepReadonly<ReturnType<ObligationCompletionRecord['toJSON']>>[];
  readonly reasonCodes: readonly string[];
  readonly calculation: { readonly amount: number; readonly unit: CalendarUnit; readonly monthEnd: MonthEndConvention; readonly windowDaysBeforeDue: number; readonly graceDaysAfterDue: number };
}
export interface RecurringObligationProjectionView {
  readonly reference: string;
  readonly obligation: DeepReadonly<ReturnType<RecurringObligation['toJSON']>>;
  readonly calendar: DeepReadonly<ReturnType<LifecycleCalendarContext['toJSON']>>;
  readonly asKnownAt: string;
  readonly horizonOn: string;
  readonly maxOccurrences: number;
  readonly readerId: string;
  readonly correlationId: string;
  readonly accessDecisionReference: string;
  readonly accessAuditReference: string;
  readonly outcome: 'EVALUATED' | 'INDETERMINATE' | 'REVIEW_REQUIRED';
  readonly coverage: 'REQUESTED_HORIZON_AND_PROVIDED_RECORDS';
  readonly reasonCodes: readonly string[];
  readonly occurrences: readonly RecurringObligationOccurrence[];
  readonly stoppedAtSequence: number | null;
  readonly unmatchedRecordIds: readonly string[];
  readonly authorizationAuthority: false;
  readonly legalComplianceDetermined: false;
  readonly eventsEmitted: 0;
  readonly notificationScheduled: false;
  readonly historyMutated: false;
}
function assertReader(input: RecurringObligationProjectionInput): void {
  const c = input.context, reader = input.authorizedContext, a = input.accessDecision;
  if (!(c instanceof ApplicationExecutionContext) || !(reader instanceof TenantContext) || !(input.boundary instanceof TenantBoundary) || !(a instanceof TenantAccessDecision)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if (c.tenantScope === null || c.organizationScope === null || c.subject === null || c.purpose === null || c.accessDecision === null || c.operation.toString() !== RECURRING_OBLIGATION_OPERATION) throw new TenantAccessDeniedError();
  if (!same(c.tenantScope, reader.tenant) || !same(c.organizationScope, reader.organization) || !same(c.purpose, reader.purpose) || !same(c.actor.id, reader.actor.id) || c.actor.kind !== reader.actor.kind || !same(c.correlationId, reader.correlationId)) throw new TenantAccessDeniedError();
  if (a.disposition !== AccessDisposition.ALLOW || !same(a.tenant, reader.tenant) || !same(a.purpose, reader.purpose) || !same(a.reference, c.accessDecision) || !a.allowedFields.includes(RECURRING_OBLIGATION_FIELD)) throw new TenantAccessDeniedError();
  if (!(input.obligation instanceof RecurringObligation) || !(input.jurisdiction instanceof Jurisdiction)) throw new TenantAccessDeniedError();
  const basis = input.obligation.basis;
  if (!same(basis.tenant, reader.tenant) || !same(basis.organization, reader.organization) || !same(basis.purpose, reader.purpose) || !same(basis.artifact.subject!.id, c.subject.id) || basis.artifact.subject!.kind !== c.subject.kind || !same(basis.jurisdiction, input.jurisdiction)) throw new TenantAccessDeniedError();
}
function completionIssues(record: ObligationCompletionRecord, anchor: string, opens: string, today: string): string[] {
  const issues: string[] = [], rule = record.obligation.rule, source = record.source;
  if (record.disposition !== 'ACCEPTED') issues.push('COMPLETION_NOT_EXTERNALLY_ACCEPTED');
  if (record.completedOn === null) issues.push('COMPLETION_DATE_MISSING');
  else {
    const completed = record.completedOn.toString();
    if (completed <= anchor || completed < opens || completed > today) issues.push('COMPLETION_OUTSIDE_ACTION_WINDOW');
    if (outsideSource(source, completed)) issues.push('COMPLETION_SOURCE_OUTSIDE_EFFECTIVITY');
  }
  if (source.verificationState.toString() !== 'VERIFIED') issues.push('COMPLETION_SOURCE_UNVERIFIED');
  if (!same(source.jurisdiction, rule.jurisdiction)) issues.push('COMPLETION_SOURCE_JURISDICTION_MISMATCH');
  if (rule.requiredEvidenceClaims.some(claim => !record.coveredClaims.includes(claim))) issues.push('REQUIRED_CLAIM_COVERAGE_MISSING');
  if (record.evidenceSnapshot.entries.length === 0) issues.push('COMPLETION_EVIDENCE_MISSING');
  for (const entry of record.evidenceSnapshot.entries) {
    if (entry.verificationState.toString() !== 'VERIFIED') issues.push('COMPLETION_EVIDENCE_UNVERIFIED');
    if (entry.sourceId === null || entry.sourceVersion === null || !same(entry.sourceId, source.id) || !same(entry.sourceVersion, source.version)) issues.push('COMPLETION_EVIDENCE_SOURCE_MISMATCH');
  }
  return [...new Set(issues)].sort(compare);
}

/** Pure, bounded recurrence projection; no state transition, notification or legal verdict. */
export class RecurringObligationProjection {
  readonly #view: RecurringObligationProjectionView;
  private constructor(view: RecurringObligationProjectionView) { this.#view = freeze(view); Object.freeze(this); }
  toJSON(): RecurringObligationProjectionView { return this.#view; }
  static project(input: RecurringObligationProjectionInput): RecurringObligationProjection {
    assertReader(input);
    if (!(input.calendar instanceof LifecycleCalendarContext)) throw new TypeError('Explicit calendar context required');
    const known = instant(input.asKnownAt), evaluated = instant(input.calendar.evaluatedAt), requested = instant(input.context.requestedAt), o = input.obligation, rule = o.rule;
    if (known > requested || evaluated > requested || instant(o.recordedAt) > known) throw new RangeError('Projection exceeds invocation or knowledge horizon');
    const today = date(input.calendar.evaluatedOn), horizon = date(input.horizonOn);
    if (horizon < today) throw new RangeError('Projection horizon predates evaluation date');
    integer(input.maxOccurrences, 1, 1000);
    if (!Array.isArray(input.records) || input.records.length > 10000) throw new TypeError('Bounded completion records required');
    const supplied = Array.from(input.records);
    if (!supplied.every(record => record instanceof ObligationCompletionRecord && record.obligation === o)) throw new TypeError('Dense records must bind the exact obligation snapshot');
    const visible = supplied.filter(record => instant(record.recorded.evaluatedAt) <= known && instant(record.recorded.evaluatedAt) <= evaluated).sort((a, b) => a.sequence - b.sequence || compare(a.id, b.id));
    if (new Set(visible.map(record => record.id)).size !== visible.length) throw new TypeError('Duplicate visible completion record');
    const data: Mutable<RecurringObligationProjectionView> = { reference: opaque(input.reference), obligation: o.toJSON(), calendar: input.calendar.toJSON(), asKnownAt: input.asKnownAt.toString(), horizonOn: horizon, maxOccurrences: input.maxOccurrences, readerId: input.context.actor.id.toString(), correlationId: input.context.correlationId.toString(), accessDecisionReference: input.accessDecision.reference.toString(), accessAuditReference: input.accessDecision.auditReference.toString(), outcome: 'EVALUATED', coverage: 'REQUESTED_HORIZON_AND_PROVIDED_RECORDS', reasonCodes: [], occurrences: [], stoppedAtSequence: null, unmatchedRecordIds: [], authorizationAuthority: false, legalComplianceDetermined: false, eventsEmitted: 0, notificationScheduled: false, historyMutated: false };
    const reasons: string[] = [];
    const finish = (outcome: RecurringObligationProjectionView['outcome'], reason?: string): RecurringObligationProjection => {
      data.outcome = outcome; if (reason) reasons.push(reason); data.reasonCodes = [...new Set(reasons)].sort(compare);
      return new RecurringObligationProjection(data);
    };
    if (rule.source.verificationState.toString() !== 'VERIFIED') reasons.push('RULE_SOURCE_UNVERIFIED');
    if (!same(rule.source.jurisdiction, rule.jurisdiction)) reasons.push('RULE_SOURCE_JURISDICTION_MISMATCH');
    if (rule.conditions.length > 0) reasons.push('RULE_CONDITIONS_UNRESOLVED');
    if (o.basis.artifact.verificationState.toString() !== 'VERIFIED') reasons.push('ARTIFACT_FACTS_UNVERIFIED');
    if (o.anchorOn === null) return finish(reasons.length ? 'REVIEW_REQUIRED' : 'INDETERMINATE', 'ANCHOR_MISSING');
    const original = date(o.anchorOn);
    if (original < rule.validFrom.toString() || (rule.validTo !== null && original > rule.validTo.toString())) reasons.push('ANCHOR_OUTSIDE_RULE_EFFECTIVITY');
    if (outsideSource(rule.source, original)) reasons.push('RULE_SOURCE_OUTSIDE_EFFECTIVITY');
    if (reasons.length > 0) return finish('REVIEW_REQUIRED');
    const occurrences: RecurringObligationOccurrence[] = [], used = new Set<string>();
    let currentAnchor = o.anchorOn, incomplete = false, requiresReview = false;
    try {
      for (let sequence = 1; ; sequence++) {
        const amount = rule.interval.amount * (rule.cadence === 'FIXED_ANCHOR' ? sequence : 1);
        const due = shiftLifecycleDate(currentAnchor, amount, rule.interval.unit, rule.interval.monthEnd), dueOn = due.toString();
        if (dueOn > horizon || (rule.validTo !== null && dueOn > rule.validTo.toString())) break;
        if (occurrences.length >= input.maxOccurrences) return finish('REVIEW_REQUIRED', 'OCCURRENCE_BUDGET_EXCEEDED');
        const opens = shiftLifecycleDate(due, -rule.windowDaysBeforeDue, 'DAYS', 'REJECT').toString(), grace = shiftLifecycleDate(due, rule.graceDaysAfterDue, 'DAYS', 'REJECT').toString();
        const cycleRecords = visible.filter(record => record.sequence === sequence);
        for (const record of cycleRecords) used.add(record.id);
        let state: RecurringObligationOccurrence['completionState'] = 'NONE_RECORDED', timing: RecurringObligationOccurrence['completionTiming'] = 'UNKNOWN';
        let issues: string[] = [], accepted: ObligationCompletionRecord | null = null;
        if (cycleRecords.length > 1) { state = 'REVIEW_REQUIRED'; issues = ['MULTIPLE_COMPLETION_RECORDS']; }
        else if (cycleRecords.length === 1) {
          const record = cycleRecords[0]!; issues = completionIssues(record, currentAnchor.toString(), opens, today);
          if (issues.length > 0) state = 'REVIEW_REQUIRED';
          else { state = 'ACCEPTED_RECORD'; accepted = record; timing = record.completedOn!.toString() <= dueOn ? 'ON_OR_BEFORE_DUE' : 'AFTER_DUE'; }
        }
        if (state === 'REVIEW_REQUIRED') { requiresReview = true; reasons.push('COMPLETION_REVIEW_REQUIRED'); }
        occurrences.push({ reference: o.occurrenceReference(sequence), sequence, anchorOn: currentAnchor.toString(), windowOpensOn: opens, dueOn, graceEndsOn: grace, calendarState: today < opens ? 'UPCOMING' : today < dueOn ? 'ACTION_WINDOW' : today === dueOn ? 'DUE_TODAY' : today <= grace ? 'OVERDUE_WITHIN_GRACE' : 'OVERDUE', completionState: state, completionTiming: timing, records: cycleRecords.map(record => record.toJSON()), reasonCodes: issues, calculation: { amount, unit: rule.interval.unit, monthEnd: rule.interval.monthEnd, windowDaysBeforeDue: rule.windowDaysBeforeDue, graceDaysAfterDue: rule.graceDaysAfterDue } });
        if (rule.cadence === 'AFTER_ACCEPTED_COMPLETION') {
          if (accepted === null) { data.stoppedAtSequence = sequence; incomplete = true; reasons.push('NEXT_CYCLE_REQUIRES_ACCEPTED_COMPLETION'); break; }
          currentAnchor = accepted.completedOn!;
        }
      }
    } catch (error) {
      if (error instanceof RangeError) return finish('REVIEW_REQUIRED', 'CALENDAR_ADJUSTMENT_REQUIRED');
      throw error;
    }
    data.occurrences = occurrences;
    data.unmatchedRecordIds = visible.filter(record => !used.has(record.id)).map(record => record.id).sort(compare);
    if (data.unmatchedRecordIds.length > 0) { requiresReview = true; reasons.push('UNASSIGNED_COMPLETION_RECORDS'); }
    return finish(requiresReview ? 'REVIEW_REQUIRED' : incomplete ? 'INDETERMINATE' : 'EVALUATED');
  }
}
