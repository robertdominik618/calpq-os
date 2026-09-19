import { ActorReference, DateOnly, SourceReference, UtcInstant, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { AccessDisposition, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext } from '../tenant/tenant-governance.ts';
import { CredentialLifecycleBasis } from './credential-lifecycle-timeline.ts';
import { ExpiryRenewalEvaluation, LifecycleCalendarContext, shiftLifecycleDate } from './expiry-renewal-policy.ts';
import { RecurringObligationProjection } from './recurring-obligation.ts';
import { RenewalCaseHistory } from './renewal-case.ts';

export const NOTIFICATION_POLICY_OPERATION = 'credential.lifecycle.notification.project';
export const NOTIFICATION_POLICY_FIELD = 'credential:lifecycle-notification';

export type NotificationIntentKind = 'REMINDER' | 'ESCALATION';
export type NotificationObservationKind = 'RECORDED' | 'DELIVERED' | 'FAILED' | 'ACKNOWLEDGED' | 'SUPPRESSED';
export type NotificationProjectionOutcome = 'SUPPRESSED' | 'DUE' | 'ESCALATED' | 'REVIEW_REQUIRED';
export type NotificationTrigger =
  | { readonly kind: 'WINDOW_OPENS' }
  | { readonly kind: 'RENEWAL_DUE' }
  | { readonly kind: 'GRACE_END' }
  | { readonly kind: 'OBLIGATION_DUE'; readonly occurrenceReference: string };

export interface NotificationStageInput {
  readonly id: string;
  readonly level: number;
  readonly trigger: NotificationTrigger;
  readonly offsetDays: number;
  readonly dedupWindowDays: number;
  readonly audiencePurpose: string;
  readonly intentKind: NotificationIntentKind;
}

type NotificationStage = Readonly<{
  id: string;
  level: number;
  trigger: NotificationTrigger;
  offsetDays: number;
  dedupWindowDays: number;
  audiencePurpose: string;
  intentKind: NotificationIntentKind;
}>;

type DeepReadonly<T> = T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;

function opaque(value: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/.test(value)) throw new TypeError('Bounded opaque reference required');
  return value;
}
function instant(value: UtcInstant): number {
  if (!(value instanceof UtcInstant)) throw new TypeError('Explicit UtcInstant required');
  return value.toEpochMilliseconds();
}
function date(value: DateOnly): string {
  if (!(value instanceof DateOnly)) throw new TypeError('Explicit DateOnly required');
  return value.toString();
}
function same(a: { toString(): string }, b: { toString(): string }): boolean { return a.toString() === b.toString(); }
function compare(a: string, b: string): number { return a < b ? -1 : a > b ? 1 : 0; }
function canonical(value: unknown): string { return JSON.stringify(value); }
function integer(value: number, minimum: number, maximum: number): void {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) throw new RangeError('Value outside explicit bounds');
}
function exact(value: unknown, keys: readonly string[]): void {
  if (value === null || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join('|') !== [...keys].sort().join('|')) throw new TypeError('Unexpected or missing controlled fields');
}
function freeze<T>(value: T): DeepReadonly<T> {
  if (value !== null && typeof value === 'object') {
    for (const child of Object.values(value as Record<string, unknown>)) freeze(child);
    Object.freeze(value);
  }
  return value as DeepReadonly<T>;
}
function sourceView(source: SourceReference) {
  return {
    id: source.id.toString(),
    version: source.version.toString(),
    authorityId: source.authority.id.toString(),
    jurisdiction: source.jurisdiction.toString(),
    retrievedAt: source.retrievedAt.toString(),
    verificationState: source.verificationState.toString(),
    effectiveFrom: source.effectiveFrom?.toString() ?? null,
    effectiveTo: source.effectiveTo?.toString() ?? null,
    hash: source.contentHash?.toString() ?? null,
  };
}
function outsideSource(source: SourceReference, on: string): boolean {
  return (source.effectiveFrom !== null && source.effectiveFrom.toString() > on) || (source.effectiveTo !== null && source.effectiveTo.toString() < on);
}
function stageTrigger(input: NotificationTrigger): NotificationTrigger {
  if (input === null || typeof input !== 'object') throw new TypeError('Controlled notification trigger required');
  if (input.kind === 'WINDOW_OPENS' || input.kind === 'RENEWAL_DUE' || input.kind === 'GRACE_END') {
    exact(input, ['kind']);
    return Object.freeze({ kind: input.kind });
  }
  if (input.kind === 'OBLIGATION_DUE') {
    exact(input, ['kind', 'occurrenceReference']);
    return Object.freeze({ kind: input.kind, occurrenceReference: opaque(input.occurrenceReference) });
  }
  throw new TypeError('Unsupported notification trigger');
}
function stage(input: NotificationStageInput): NotificationStage {
  exact(input, ['id', 'level', 'trigger', 'offsetDays', 'dedupWindowDays', 'audiencePurpose', 'intentKind']);
  integer(input.level, 1, 1000);
  integer(input.offsetDays, -3650, 3650);
  integer(input.dedupWindowDays, 0, 3650);
  if (!['REMINDER', 'ESCALATION'].includes(input.intentKind)) throw new TypeError('Controlled notification intent kind required');
  return Object.freeze({
    id: opaque(input.id),
    level: input.level,
    trigger: stageTrigger(input.trigger),
    offsetDays: input.offsetDays,
    dedupWindowDays: input.dedupWindowDays,
    audiencePurpose: opaque(input.audiencePurpose),
    intentKind: input.intentKind,
  });
}

export interface LifecycleNotificationPolicyInput {
  readonly id: string;
  readonly version: VersionId;
  readonly basis: CredentialLifecycleBasis;
  readonly validFrom: DateOnly;
  readonly validTo: DateOnly | null;
  readonly knownAt: UtcInstant;
  readonly source: SourceReference;
  readonly sourceSnapshotReference: string;
  readonly approvedAt: UtcInstant;
  readonly approvedBy: ActorReference;
  readonly approvalReference: string;
  readonly stages: readonly NotificationStageInput[];
}

/** Immutable provider-neutral notification policy. Construction proves consistency, never legal or delivery authority. */
export class LifecycleNotificationPolicy {
  readonly id!: string;
  readonly version!: VersionId;
  readonly basis!: CredentialLifecycleBasis;
  readonly validFrom!: DateOnly;
  readonly validTo!: DateOnly | null;
  readonly knownAt!: UtcInstant;
  readonly source!: SourceReference;
  readonly sourceSnapshotReference!: string;
  readonly approvedAt!: UtcInstant;
  readonly approvedBy!: ActorReference;
  readonly approvalReference!: string;
  readonly stages!: readonly NotificationStage[];
  private constructor(input: Omit<LifecycleNotificationPolicyInput, 'stages'> & { readonly stages: readonly NotificationStage[] }) { Object.assign(this, input); Object.freeze(this); }

  static create(input: LifecycleNotificationPolicyInput): LifecycleNotificationPolicy {
    if (!(input.version instanceof VersionId) || !(input.basis instanceof CredentialLifecycleBasis) || !(input.validFrom instanceof DateOnly) || (input.validTo !== null && !(input.validTo instanceof DateOnly)) || !(input.knownAt instanceof UtcInstant) || !(input.source instanceof SourceReference) || !(input.approvedAt instanceof UtcInstant) || !(input.approvedBy instanceof ActorReference)) throw new TypeError('Governed notification policy identity, scope, source and approval required');
    const start = date(input.validFrom), end = input.validTo === null ? null : date(input.validTo), known = instant(input.knownAt);
    if (end !== null && start > end) throw new RangeError('Inverted notification policy effectivity');
    if (instant(input.source.retrievedAt) > known || instant(input.approvedAt) > known || instant(input.basis.recordedAt) > known) throw new RangeError('Notification policy knowledge predates governed inputs');
    if (!same(input.source.jurisdiction, input.basis.jurisdiction)) throw new TypeError('Notification source jurisdiction mismatch');
    if (!Array.isArray(input.stages) || input.stages.length === 0 || input.stages.length > 1000 || !input.stages.every(value => value !== undefined)) throw new TypeError('Bounded dense notification stage collection required');
    const stages = Array.from(input.stages).map(stage);
    if (new Set(stages.map(value => value.id)).size !== stages.length || new Set(stages.map(value => value.level)).size !== stages.length) throw new TypeError('Duplicate notification stage identity or level');
    for (let i = 1; i < stages.length; i++) if (stages[i - 1]!.level >= stages[i]!.level) throw new TypeError('Notification stage levels must be strictly ordered');
    return new LifecycleNotificationPolicy({
      id: opaque(input.id), version: input.version, basis: input.basis, validFrom: input.validFrom, validTo: input.validTo,
      knownAt: input.knownAt, source: input.source, sourceSnapshotReference: opaque(input.sourceSnapshotReference),
      approvedAt: input.approvedAt, approvedBy: input.approvedBy, approvalReference: opaque(input.approvalReference),
      stages: Object.freeze(stages),
    });
  }

  deduplicationKey(stageId: string, triggerIdentity: string): string {
    const selected = this.stages.find(value => value.id === stageId);
    if (selected === undefined) throw new TypeError('Unknown notification stage');
    const subject = this.basis.artifact.subject;
    if (subject === null) throw new TypeError('Notification basis requires subject');
    if (typeof triggerIdentity !== 'string' || triggerIdentity.length === 0 || triggerIdentity.length > 1024) throw new TypeError('Bounded trigger identity required');
    return JSON.stringify([
      'calpq.notification.dedup.v1',
      this.basis.tenant.toString(),
      this.basis.organization.toString(),
      subject.id.toString(), subject.kind,
      this.basis.snapshotReference,
      this.basis.credentialDefinition.id.toString(), this.basis.credentialDefinition.version.toString(),
      this.id, this.version.toString(),
      triggerIdentity, selected.id, selected.audiencePurpose,
    ]);
  }

  toJSON() {
    return freeze({
      id: this.id, version: this.version.toString(), basisSnapshotReference: this.basis.snapshotReference,
      credentialDefinition: { id: this.basis.credentialDefinition.id.toString(), version: this.basis.credentialDefinition.version.toString() },
      jurisdiction: this.basis.jurisdiction.toString(), validFrom: this.validFrom.toString(), validTo: this.validTo?.toString() ?? null,
      knownAt: this.knownAt.toString(), source: sourceView(this.source), sourceSnapshotReference: this.sourceSnapshotReference,
      approvedAt: this.approvedAt.toString(), approvedById: this.approvedBy.id.toString(), approvalReference: this.approvalReference,
      stages: this.stages.map(value => ({ id: value.id, level: value.level, trigger: { ...value.trigger }, offsetDays: value.offsetDays, dedupWindowDays: value.dedupWindowDays, audiencePurpose: value.audiencePurpose, intentKind: value.intentKind })),
    });
  }
}

export interface NotificationObservationInput {
  readonly policy: LifecycleNotificationPolicy;
  readonly id: string;
  readonly kind: NotificationObservationKind;
  readonly stageId: string;
  readonly triggerIdentity: string;
  readonly audiencePurpose: string;
  readonly dedupKey: string;
  readonly occurredAt: UtcInstant;
  readonly recordedAt: UtcInstant;
  readonly provenanceReference: string;
}

/** Observation of an external notification lifecycle fact. It never sends, schedules, retries or acknowledges anything itself. */
export class NotificationObservation {
  readonly policy!: LifecycleNotificationPolicy;
  readonly id!: string;
  readonly kind!: NotificationObservationKind;
  readonly stageId!: string;
  readonly triggerIdentity!: string;
  readonly audiencePurpose!: string;
  readonly dedupKey!: string;
  readonly occurredAt!: UtcInstant;
  readonly recordedAt!: UtcInstant;
  readonly provenanceReference!: string;
  private constructor(input: NotificationObservationInput) { Object.assign(this, input); Object.freeze(this); }

  static create(input: NotificationObservationInput): NotificationObservation {
    if (!(input.policy instanceof LifecycleNotificationPolicy) || !(input.occurredAt instanceof UtcInstant) || !(input.recordedAt instanceof UtcInstant)) throw new TypeError('Governed notification observation required');
    if (!['RECORDED', 'DELIVERED', 'FAILED', 'ACKNOWLEDGED', 'SUPPRESSED'].includes(input.kind)) throw new TypeError('Controlled notification observation kind required');
    if (instant(input.occurredAt) > instant(input.recordedAt)) throw new RangeError('Notification observation recording predates occurrence');
    const selected = input.policy.stages.find(value => value.id === input.stageId);
    if (selected === undefined) throw new TypeError('Notification observation uses foreign stage');
    const triggerIdentity = typeof input.triggerIdentity === 'string' && input.triggerIdentity.length > 0 && input.triggerIdentity.length <= 1024 ? input.triggerIdentity : (() => { throw new TypeError('Bounded trigger identity required'); })();
    if (opaque(input.audiencePurpose) !== selected.audiencePurpose) throw new TypeError('Notification audience mismatch');
    const expected = input.policy.deduplicationKey(selected.id, triggerIdentity);
    if (input.dedupKey !== expected) throw new TypeError('Notification deduplication identity mismatch');
    return new NotificationObservation({
      policy: input.policy, id: opaque(input.id), kind: input.kind, stageId: selected.id, triggerIdentity,
      audiencePurpose: selected.audiencePurpose, dedupKey: expected, occurredAt: input.occurredAt, recordedAt: input.recordedAt,
      provenanceReference: opaque(input.provenanceReference),
    });
  }

  toJSON() {
    return freeze({
      policyId: this.policy.id, policyVersion: this.policy.version.toString(), basisSnapshotReference: this.policy.basis.snapshotReference,
      id: this.id, kind: this.kind, stageId: this.stageId, triggerIdentity: this.triggerIdentity,
      audiencePurpose: this.audiencePurpose, dedupKey: this.dedupKey, occurredAt: this.occurredAt.toString(),
      recordedAt: this.recordedAt.toString(), provenanceReference: this.provenanceReference,
    });
  }
}

export interface NotificationProjectionInput {
  readonly context: ApplicationExecutionContext;
  readonly authorizedContext: TenantContext;
  readonly boundary: TenantBoundary;
  readonly accessDecision: TenantAccessDecision;
  readonly policy: LifecycleNotificationPolicy;
  readonly calendar: LifecycleCalendarContext;
  readonly asKnownAt: UtcInstant;
  readonly evaluation: ExpiryRenewalEvaluation;
  readonly history: RenewalCaseHistory | null;
  readonly obligationProjections: readonly RecurringObligationProjection[];
  readonly observations: readonly NotificationObservation[];
}

export interface NotificationProjectionView {
  readonly policyId: string;
  readonly policyVersion: string;
  readonly basisSnapshotReference: string;
  readonly evaluatedAt: string;
  readonly evaluatedOn: string;
  readonly asKnownAt: string;
  readonly outcome: NotificationProjectionOutcome;
  readonly stageId: string | null;
  readonly level: number | null;
  readonly intentKind: NotificationIntentKind | null;
  readonly audiencePurpose: string | null;
  readonly triggerIdentity: string | null;
  readonly triggerOn: string | null;
  readonly thresholdOn: string | null;
  readonly dedupKey: string | null;
  readonly caseState: ReturnType<RenewalCaseHistory['toJSON']>['state'] | null;
  readonly reasonCodes: readonly string[];
  readonly readerId: string;
  readonly correlationId: string;
  readonly accessDecisionReference: string;
  readonly accessAuditReference: string;
  readonly authorizationAuthority: false;
  readonly credentialStateMutated: false;
  readonly renewalPerformed: false;
  readonly notificationScheduled: false;
  readonly notificationSent: false;
  readonly providerInvoked: false;
  readonly eventsEmitted: 0;
  readonly physicalDeletionAuthorized: false;
}

function assertReader(input: NotificationProjectionInput): void {
  const c = input.context, reader = input.authorizedContext, access = input.accessDecision;
  if (!(c instanceof ApplicationExecutionContext) || !(reader instanceof TenantContext) || !(input.boundary instanceof TenantBoundary) || !(access instanceof TenantAccessDecision)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if (c.tenantScope === null || c.organizationScope === null || c.subject === null || c.purpose === null || c.accessDecision === null || c.operation.toString() !== NOTIFICATION_POLICY_OPERATION) throw new TenantAccessDeniedError();
  if (!same(c.tenantScope, reader.tenant) || !same(c.organizationScope, reader.organization) || !same(c.purpose, reader.purpose) || !same(c.actor.id, reader.actor.id) || c.actor.kind !== reader.actor.kind || !same(c.correlationId, reader.correlationId)) throw new TenantAccessDeniedError();
  if (access.disposition !== AccessDisposition.ALLOW || !same(access.tenant, reader.tenant) || !same(access.purpose, reader.purpose) || !same(access.reference, c.accessDecision) || !access.allowedFields.includes(NOTIFICATION_POLICY_FIELD)) throw new TenantAccessDeniedError();
  if (!(input.policy instanceof LifecycleNotificationPolicy)) throw new TenantAccessDeniedError();
  const basis = input.policy.basis, subject = basis.artifact.subject;
  if (subject === null || !same(basis.tenant, reader.tenant) || !same(basis.organization, reader.organization) || !same(basis.purpose, reader.purpose) || !same(subject.id, c.subject.id) || subject.kind !== c.subject.kind) throw new TenantAccessDeniedError();
}

type Candidate = Readonly<{ stage: NotificationStage; triggerIdentity: string; triggerOn: string; thresholdOn: string }>;

function obligationCandidate(stage: NotificationStage, projections: readonly RecurringObligationProjection[]): Candidate | 'MISSING' | 'REVIEW' {
  if (stage.trigger.kind !== 'OBLIGATION_DUE') throw new TypeError('Obligation trigger required');
  const matches: { projection: RecurringObligationProjection; occurrence: ReturnType<RecurringObligationProjection['toJSON']>['occurrences'][number] }[] = [];
  for (const projection of projections) {
    const view = projection.toJSON();
    if (view.outcome === 'REVIEW_REQUIRED') return 'REVIEW';
    for (const occurrence of view.occurrences) if (occurrence.reference === stage.trigger.occurrenceReference) matches.push({ projection, occurrence });
  }
  if (matches.length === 0) return 'MISSING';
  if (matches.length !== 1) return 'REVIEW';
  const dueOn = matches[0]!.occurrence.dueOn;
  const thresholdOn = shiftLifecycleDate(DateOnly.from(dueOn), stage.offsetDays, 'DAYS', 'REJECT').toString();
  return Object.freeze({ stage, triggerIdentity: `OBLIGATION_DUE:${stage.trigger.occurrenceReference}:${dueOn}`, triggerOn: dueOn, thresholdOn });
}

function renewalCandidate(stage: NotificationStage, evaluation: ReturnType<ExpiryRenewalEvaluation['toJSON']>): Candidate | 'MISSING' {
  let triggerOn: string | null = null;
  if (stage.trigger.kind === 'WINDOW_OPENS') triggerOn = evaluation.windowOpensOn;
  else if (stage.trigger.kind === 'RENEWAL_DUE') triggerOn = evaluation.renewalDueOn;
  else if (stage.trigger.kind === 'GRACE_END') triggerOn = evaluation.graceEndsOn;
  else throw new TypeError('Renewal trigger required');
  if (triggerOn === null) return 'MISSING';
  const thresholdOn = shiftLifecycleDate(DateOnly.from(triggerOn), stage.offsetDays, 'DAYS', 'REJECT').toString();
  return Object.freeze({ stage, triggerIdentity: `${stage.trigger.kind}:${triggerOn}`, triggerOn, thresholdOn });
}

/** Pure lifecycle projection. It creates notification intent metadata only; no scheduler, provider, delivery, retry or credential mutation. */
export class LifecycleNotificationProjection {
  readonly #view: DeepReadonly<NotificationProjectionView>;
  private constructor(view: NotificationProjectionView) { this.#view = freeze(view); Object.freeze(this); }
  toJSON(): DeepReadonly<NotificationProjectionView> { return this.#view; }

  static evaluate(input: NotificationProjectionInput): LifecycleNotificationProjection {
    assertReader(input);
    if (!(input.calendar instanceof LifecycleCalendarContext) || !(input.asKnownAt instanceof UtcInstant) || !(input.evaluation instanceof ExpiryRenewalEvaluation)) throw new TypeError('Governed notification projection inputs required');
    const requested = instant(input.context.requestedAt), evaluatedAt = instant(input.calendar.evaluatedAt), known = instant(input.asKnownAt), policy = input.policy;
    if (evaluatedAt !== requested) throw new RangeError('Notification calendar and invocation instant must match');
    if (known > requested || instant(policy.knownAt) > known || instant(policy.basis.recordedAt) > known || instant(policy.source.retrievedAt) > known || instant(policy.approvedAt) > known) throw new RangeError('Notification projection exceeds invocation or knowledge horizon');
    if (canonical(input.evaluation.toJSON().basis) !== canonical(policy.basis.toJSON())) throw new TypeError('Notification expiry evaluation basis mismatch');
    if (!Array.isArray(input.obligationProjections) || input.obligationProjections.length > 1000 || !input.obligationProjections.every(value => value instanceof RecurringObligationProjection)) throw new TypeError('Bounded governed obligation projections required');
    if (!Array.isArray(input.observations) || input.observations.length > 1000 || !input.observations.every(value => value instanceof NotificationObservation)) throw new TypeError('Bounded governed notification observations required');
    const projections = Array.from(input.obligationProjections);
    const projectionKeys = projections.map(value => value.toJSON().reference);
    if (new Set(projectionKeys).size !== projectionKeys.length) throw new TypeError('Duplicate obligation projection identity');
    for (const projection of projections) if (canonical(projection.toJSON().obligation.basis) !== canonical(policy.basis.toJSON())) throw new TypeError('Foreign obligation projection basis');
    const observations = Array.from(input.observations);
    if (new Set(observations.map(value => value.id)).size !== observations.length) throw new TypeError('Duplicate notification observation identity');
    for (const observation of observations) {
      if (observation.policy !== policy) throw new TypeError('Foreign notification policy observation');
      if (instant(observation.recordedAt) > known || instant(observation.occurredAt) > requested) throw new RangeError('Future notification observation not visible');
    }
    if (input.history !== null) {
      if (!(input.history instanceof RenewalCaseHistory) || input.history.definition.basis !== policy.basis) throw new TypeError('Foreign renewal case history');
      const last = input.history.records.at(-1);
      if (last !== undefined && instant(last.context.requestedAt) > known) throw new RangeError('Future renewal case history not visible');
    }
    const today = date(input.calendar.evaluatedOn), policyStart = date(policy.validFrom), policyEnd = policy.validTo === null ? null : date(policy.validTo), reasons: string[] = [];
    const base: Omit<NotificationProjectionView, 'outcome' | 'stageId' | 'level' | 'intentKind' | 'audiencePurpose' | 'triggerIdentity' | 'triggerOn' | 'thresholdOn' | 'dedupKey' | 'caseState' | 'reasonCodes'> = {
      policyId: policy.id, policyVersion: policy.version.toString(), basisSnapshotReference: policy.basis.snapshotReference,
      evaluatedAt: input.calendar.evaluatedAt.toString(), evaluatedOn: today, asKnownAt: input.asKnownAt.toString(),
      readerId: input.context.actor.id.toString(), correlationId: input.context.correlationId.toString(),
      accessDecisionReference: input.accessDecision.reference.toString(), accessAuditReference: input.accessDecision.auditReference.toString(),
      authorizationAuthority: false, credentialStateMutated: false, renewalPerformed: false, notificationScheduled: false,
      notificationSent: false, providerInvoked: false, eventsEmitted: 0, physicalDeletionAuthorized: false,
    };
    const finish = (outcome: NotificationProjectionOutcome, candidate: Candidate | null, extra: readonly string[] = []): LifecycleNotificationProjection => {
      const all = [...new Set([...reasons, ...extra])].sort(compare);
      return new LifecycleNotificationProjection({
        ...base, outcome, stageId: candidate?.stage.id ?? null, level: candidate?.stage.level ?? null,
        intentKind: candidate?.stage.intentKind ?? null, audiencePurpose: candidate?.stage.audiencePurpose ?? null,
        triggerIdentity: candidate?.triggerIdentity ?? null, triggerOn: candidate?.triggerOn ?? null,
        thresholdOn: candidate?.thresholdOn ?? null,
        dedupKey: candidate === null ? null : policy.deduplicationKey(candidate.stage.id, candidate.triggerIdentity),
        caseState: input.history?.state ?? null, reasonCodes: all,
      });
    };
    if (today < policyStart || (policyEnd !== null && today > policyEnd)) return finish('REVIEW_REQUIRED', null, ['NOTIFICATION_POLICY_OUTSIDE_EFFECTIVITY']);
    if (policy.source.verificationState.toString() !== 'VERIFIED' || !same(policy.source.jurisdiction, policy.basis.jurisdiction) || outsideSource(policy.source, today)) return finish('REVIEW_REQUIRED', null, ['NOTIFICATION_POLICY_SOURCE_UNRESOLVED']);
    const evaluation = input.evaluation.toJSON();
    if (evaluation.outcome !== 'EVALUATED' || evaluation.policy === null) return finish('REVIEW_REQUIRED', null, ['EXPIRY_RENEWAL_EVALUATION_UNRESOLVED']);
    if (observations.some(value => value.occurredAt.toString().slice(0, 10) < policyStart)) return finish('REVIEW_REQUIRED', null, ['OBSERVATION_PREDATES_POLICY_EFFECTIVITY']);
    if (input.history !== null && ['RENEWAL_RECORDED', 'REJECTION_RECORDED', 'CANCELLED'].includes(input.history.state)) return finish('SUPPRESSED', null, ['RENEWAL_CASE_TERMINAL_REMINDER_OBSOLETE']);

    const candidates: Candidate[] = [];
    for (const current of policy.stages) {
      let candidate: Candidate | 'MISSING' | 'REVIEW';
      if (current.trigger.kind === 'OBLIGATION_DUE') candidate = obligationCandidate(current, projections);
      else candidate = renewalCandidate(current, evaluation);
      if (candidate === 'REVIEW') return finish('REVIEW_REQUIRED', null, ['OBLIGATION_TRIGGER_REQUIRES_REVIEW']);
      if (candidate === 'MISSING') return finish('REVIEW_REQUIRED', null, ['NOTIFICATION_TRIGGER_DATA_MISSING']);
      if (today >= candidate.thresholdOn) candidates.push(candidate);
    }
    if (candidates.length === 0) return finish('SUPPRESSED', null, ['NO_NOTIFICATION_STAGE_DUE']);
    candidates.sort((a, b) => a.stage.level - b.stage.level || compare(a.stage.id, b.stage.id));
    const selected = candidates.at(-1)!;
    for (const lower of candidates.slice(0, -1)) reasons.push(`SUPERSEDED_STAGE:${lower.stage.id}`);
    const key = policy.deduplicationKey(selected.stage.id, selected.triggerIdentity);
    const selectedWindowMs = selected.stage.dedupWindowDays * 86_400_000;
    const equivalent = observations
      .filter(value => value.stageId === selected.stage.id && value.audiencePurpose === selected.stage.audiencePurpose && value.triggerIdentity === selected.triggerIdentity && value.dedupKey === key)
      .filter(value => ['RECORDED', 'DELIVERED', 'ACKNOWLEDGED'].includes(value.kind))
      .some(value => requested - instant(value.occurredAt) >= 0 && requested - instant(value.occurredAt) <= selectedWindowMs);
    if (equivalent) return finish('SUPPRESSED', selected, ['DEDUPLICATED']);
    const escalated = selected.stage.intentKind === 'ESCALATION' || candidates.length > 1;
    return finish(escalated ? 'ESCALATED' : 'DUE', selected, [escalated ? 'STAGE_ESCALATED' : 'STAGE_DUE']);
  }
}
