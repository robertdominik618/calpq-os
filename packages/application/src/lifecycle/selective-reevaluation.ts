import { ActorReference, SubjectReference, UtcInstant, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { AccessDisposition, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext } from '../tenant/tenant-governance.ts';
import {
  LifecycleChangeEvent,
  LifecycleDependencyGraphSnapshot,
  LifecycleDependencyImpactMode,
  LifecycleDependencyImpactTraversal,
  LifecycleDependencyNodeType,
} from './dependency-graph.ts';
import type { DependencyImpactCandidateView, DependencyImpactPathView, DependencyImpactVersionView } from './dependency-graph.ts';

export const SELECTIVE_REEVALUATION_OPERATION = 'credential.lifecycle.selective-reevaluation';
export const SELECTIVE_REEVALUATION_FIELD = 'credential:selective-reevaluation';

export const LifecycleReevaluationFactState = {
  COMPLETE: 'COMPLETE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
} as const;
export type LifecycleReevaluationFactState = (typeof LifecycleReevaluationFactState)[keyof typeof LifecycleReevaluationFactState];

export const LifecycleReevaluationOutcome = {
  UNCHANGED: 'UNCHANGED',
  STATUS_CHANGED: 'STATUS_CHANGED',
  FUTURE_IMPACT_REGISTERED: 'FUTURE_IMPACT_REGISTERED',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
} as const;
export type LifecycleReevaluationOutcome = (typeof LifecycleReevaluationOutcome)[keyof typeof LifecycleReevaluationOutcome];

export const LifecycleReevaluationBatchOutcome = {
  NO_IMPACT: 'NO_IMPACT',
  COMPLETED: 'COMPLETED',
  FUTURE_IMPACT_REGISTERED: 'FUTURE_IMPACT_REGISTERED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
} as const;
export type LifecycleReevaluationBatchOutcome = (typeof LifecycleReevaluationBatchOutcome)[keyof typeof LifecycleReevaluationBatchOutcome];

type DeepReadonly<T> = T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
const FACT_STATES = Object.freeze(Object.values(LifecycleReevaluationFactState));
const NODE_TYPES = Object.freeze(Object.values(LifecycleDependencyNodeType));
const MAX_FACTS = 512;
const MAX_VERSION_BINDINGS = 64;
const MAX_EVIDENCE_REFERENCES = 256;
const MAX_REASON_CODES = 128;

function text(value: string, label: string, max = 4096): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > max) throw new RangeError(`${label} is too long`);
  return normalized;
}
function opaque(value: string, label: string, max = 256): string {
  const normalized = text(value, label, max);
  if (!/^[A-Za-z0-9][A-Za-z0-9._:-]*$/.test(normalized)) throw new TypeError(`${label} contains unsupported characters`);
  return normalized;
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
function dense<T>(value: readonly T[], max: number, min = 0): T[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) throw new TypeError('Bounded dense collection required');
  for (let i = 0; i < value.length; i++) if (!(i in value)) throw new TypeError('Sparse collection rejected');
  return Array.from(value);
}
function integer(value: number, min: number, max: number): number {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new RangeError('Value outside explicit bounds');
  return value;
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

export interface LifecycleReevaluationVersionBindingInput {
  readonly reference: string;
  readonly type: LifecycleDependencyNodeType;
  readonly version: VersionId;
}
export interface LifecycleReevaluationVersionBinding {
  readonly reference: string;
  readonly type: LifecycleDependencyNodeType;
  readonly version: VersionId;
}

export interface LifecycleReevaluationFactInput {
  readonly reference: string;
  readonly candidateDedupKey: string;
  readonly targetReference: string;
  readonly targetType: LifecycleDependencyNodeType;
  readonly targetVersion: VersionId | null;
  readonly state: LifecycleReevaluationFactState;
  readonly previousDecisionReference: string | null;
  readonly previousResult: string | null;
  readonly newResult: string | null;
  readonly actionRequired: boolean;
  readonly evaluatedBy: ActorReference;
  readonly evaluatedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly versionBindings: readonly LifecycleReevaluationVersionBindingInput[];
  readonly evidenceReferences: readonly string[];
  readonly provenanceReference: string;
  readonly correlationReference: string;
  readonly causationReference: string | null;
  readonly reasonCodes: readonly string[];
}

/** Immutable result fact supplied by an already-governed target evaluator. It is evidence input, not legal authority. */
export class LifecycleReevaluationFact {
  readonly reference: string;
  readonly candidateDedupKey: string;
  readonly targetReference: string;
  readonly targetType: LifecycleDependencyNodeType;
  readonly targetVersion: VersionId | null;
  readonly state: LifecycleReevaluationFactState;
  readonly previousDecisionReference: string | null;
  readonly previousResult: string | null;
  readonly newResult: string | null;
  readonly actionRequired: boolean;
  readonly evaluatedBy: ActorReference;
  readonly evaluatedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly versionBindings: readonly LifecycleReevaluationVersionBinding[];
  readonly evidenceReferences: readonly string[];
  readonly provenanceReference: string;
  readonly correlationReference: string;
  readonly causationReference: string | null;
  readonly reasonCodes: readonly string[];

  private constructor(input: LifecycleReevaluationFactInput, versionBindings: readonly LifecycleReevaluationVersionBinding[], evidenceReferences: readonly string[], reasonCodes: readonly string[]) {
    this.reference = input.reference;
    this.candidateDedupKey = input.candidateDedupKey;
    this.targetReference = input.targetReference;
    this.targetType = input.targetType;
    this.targetVersion = input.targetVersion;
    this.state = input.state;
    this.previousDecisionReference = input.previousDecisionReference;
    this.previousResult = input.previousResult;
    this.newResult = input.newResult;
    this.actionRequired = input.actionRequired;
    this.evaluatedBy = input.evaluatedBy;
    this.evaluatedAt = input.evaluatedAt;
    this.asKnownAt = input.asKnownAt;
    this.versionBindings = Object.freeze([...versionBindings]);
    this.evidenceReferences = Object.freeze([...evidenceReferences]);
    this.provenanceReference = input.provenanceReference;
    this.correlationReference = input.correlationReference;
    this.causationReference = input.causationReference;
    this.reasonCodes = Object.freeze([...reasonCodes]);
    Object.freeze(this);
  }

  static create(input: LifecycleReevaluationFactInput): LifecycleReevaluationFact {
    const state = controlled(input.state, FACT_STATES, 'Reevaluation fact state');
    const targetType = controlled(input.targetType, NODE_TYPES, 'Reevaluation target type');
    if (input.targetVersion !== null && !(input.targetVersion instanceof VersionId)) throw new TypeError('Target version must be VersionId or null');
    if (!(input.evaluatedBy instanceof ActorReference)) throw new TypeError('Reevaluation fact requires evaluator actor');
    const evaluated = instant(input.evaluatedAt), known = instant(input.asKnownAt);
    if (known > evaluated) throw new RangeError('Reevaluation fact knowledge horizon exceeds evaluation instant');
    if (typeof input.actionRequired !== 'boolean') throw new TypeError('Action-required flag must be boolean');

    const previousDecisionReference = input.previousDecisionReference === null ? null : opaque(input.previousDecisionReference, 'Previous decision reference');
    const previousResult = input.previousResult === null ? null : text(input.previousResult, 'Previous result', 512);
    if ((previousDecisionReference === null) !== (previousResult === null)) throw new TypeError('Previous decision reference and previous result must be paired');

    let newResult: string | null = input.newResult === null ? null : text(input.newResult, 'New result', 512);
    if (state === LifecycleReevaluationFactState.COMPLETE) {
      if (newResult === null) throw new TypeError('Complete reevaluation fact requires new result');
    } else {
      if (newResult !== null || input.actionRequired) throw new TypeError('Review or indeterminate fact cannot carry positive result/action');
      newResult = null;
    }

    const versionBindings = dense(input.versionBindings, MAX_VERSION_BINDINGS).map(value => {
      if (value === null || typeof value !== 'object' || !(value.version instanceof VersionId)) throw new TypeError('Governed version binding required');
      return Object.freeze({
        reference: opaque(value.reference, 'Version binding reference'),
        type: controlled(value.type, NODE_TYPES, 'Version binding type'),
        version: value.version,
      });
    }).sort((a, b) => compare(a.reference, b.reference));
    if (new Set(versionBindings.map(value => value.reference)).size !== versionBindings.length) throw new TypeError('Duplicate version binding reference');

    const evidenceReferences = dense(input.evidenceReferences, MAX_EVIDENCE_REFERENCES).map(value => opaque(value, 'Evidence reference')).sort(compare);
    if (new Set(evidenceReferences).size !== evidenceReferences.length) throw new TypeError('Duplicate evidence reference');

    const reasonCodes = dense(input.reasonCodes, MAX_REASON_CODES).map(value => opaque(value, 'Reevaluation reason code', 128)).sort(compare);
    if (new Set(reasonCodes).size !== reasonCodes.length) throw new TypeError('Duplicate reevaluation reason code');

    return new LifecycleReevaluationFact({
      ...input,
      reference: opaque(input.reference, 'Reevaluation fact reference'),
      candidateDedupKey: text(input.candidateDedupKey, 'Candidate deduplication key', 4096),
      targetReference: opaque(input.targetReference, 'Target reference'),
      targetType,
      previousDecisionReference,
      previousResult,
      newResult,
      provenanceReference: opaque(input.provenanceReference, 'Reevaluation provenance reference'),
      correlationReference: opaque(input.correlationReference, 'Reevaluation correlation reference'),
      causationReference: input.causationReference === null ? null : opaque(input.causationReference, 'Reevaluation causation reference'),
      state,
    }, versionBindings, evidenceReferences, reasonCodes);
  }

  toJSON() {
    return freeze({
      reference: this.reference,
      candidateDedupKey: this.candidateDedupKey,
      targetReference: this.targetReference,
      targetType: this.targetType,
      targetVersion: this.targetVersion?.toString() ?? null,
      state: this.state,
      previousDecisionReference: this.previousDecisionReference,
      previousResult: this.previousResult,
      newResult: this.newResult,
      actionRequired: this.actionRequired,
      evaluatorId: this.evaluatedBy.id.toString(),
      evaluatorKind: this.evaluatedBy.kind,
      evaluatedAt: this.evaluatedAt.toString(),
      asKnownAt: this.asKnownAt.toString(),
      versionBindings: this.versionBindings.map(value => ({ reference: value.reference, type: value.type, version: value.version.toString() })),
      evidenceReferences: [...this.evidenceReferences],
      provenanceReference: this.provenanceReference,
      correlationReference: this.correlationReference,
      causationReference: this.causationReference,
      reasonCodes: [...this.reasonCodes],
    });
  }
}

export interface SelectiveReevaluationInput {
  readonly context: ApplicationExecutionContext;
  readonly authorizedContext: TenantContext;
  readonly boundary: TenantBoundary;
  readonly accessDecision: TenantAccessDecision;
  readonly graph: LifecycleDependencyGraphSnapshot;
  readonly event: LifecycleChangeEvent;
  readonly impact: LifecycleDependencyImpactTraversal;
  readonly facts: readonly LifecycleReevaluationFact[];
  readonly evaluatedAt: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly maxDecisions: number;
}

export interface LifecycleReevaluationDecisionView {
  readonly order: number;
  readonly decisionReference: string;
  readonly dedupKey: string;
  readonly targetReference: string;
  readonly targetType: LifecycleDependencyNodeType;
  readonly targetVersion: string | null;
  readonly impactMode: LifecycleDependencyImpactMode;
  readonly outcome: LifecycleReevaluationOutcome;
  readonly reviewRequired: boolean;
  readonly futureImpact: boolean;
  readonly candidateDedupKey: string;
  readonly evaluationFactReference: string | null;
  readonly previousDecisionReference: string | null;
  readonly previousResult: string | null;
  readonly newResult: string | null;
  readonly actionRequired: boolean;
  readonly evaluatorId: string | null;
  readonly evaluatorKind: string | null;
  readonly evaluatedAt: string;
  readonly asKnownAt: string;
  readonly dependencyPaths: readonly DependencyImpactPathView[];
  readonly requiredVersions: readonly DependencyImpactVersionView[];
  readonly evidenceReferences: readonly string[];
  readonly provenanceReference: string | null;
  readonly correlationReference: string;
  readonly causationReference: string | null;
  readonly reasonCodes: readonly string[];
  readonly reevaluationPerformed: boolean;
}

export interface SelectiveReevaluationView {
  readonly graphId: string;
  readonly graphVersion: string;
  readonly eventId: string;
  readonly eventType: string;
  readonly evaluatedAt: string;
  readonly asKnownAt: string;
  readonly outcome: LifecycleReevaluationBatchOutcome;
  readonly complete: boolean;
  readonly conclusive: boolean;
  readonly decisions: readonly LifecycleReevaluationDecisionView[];
  readonly decisionEvidenceProduced: number;
  readonly reevaluationFactsApplied: number;
  readonly reviewCount: number;
  readonly indeterminateCount: number;
  readonly futureImpactCount: number;
  readonly reasonCodes: readonly string[];
  readonly actorId: string;
  readonly correlationId: string;
  readonly accessDecisionReference: string;
  readonly accessAuditReference: string;
  readonly authorizationAuthority: false;
  readonly credentialStateMutated: false;
  readonly authorizationStateMutated: false;
  readonly historicalDecisionMutated: false;
  readonly complianceStateChanged: false;
  readonly notificationScheduled: false;
  readonly providerInvoked: false;
  readonly eventsEmitted: 0;
  readonly physicalDeletionAuthorized: false;
}

function assertReader(input: SelectiveReevaluationInput): void {
  const c = input.context, reader = input.authorizedContext, access = input.accessDecision;
  if (!(c instanceof ApplicationExecutionContext) || !(reader instanceof TenantContext) || !(input.boundary instanceof TenantBoundary) || !(access instanceof TenantAccessDecision)) throw new TenantAccessDeniedError();
  input.boundary.assertKnown(reader);
  if (c.tenantScope === null || c.organizationScope === null || c.purpose === null || c.accessDecision === null || c.operation.toString() !== SELECTIVE_REEVALUATION_OPERATION) throw new TenantAccessDeniedError();
  if (!same(c.tenantScope, reader.tenant) || !same(c.organizationScope, reader.organization) || !same(c.purpose, reader.purpose) || !same(c.actor.id, reader.actor.id) || c.actor.kind !== reader.actor.kind || !same(c.correlationId, reader.correlationId)) throw new TenantAccessDeniedError();
  if (access.disposition !== AccessDisposition.ALLOW || !same(access.tenant, reader.tenant) || !same(access.purpose, reader.purpose) || !same(access.reference, c.accessDecision) || !access.allowedFields.includes(SELECTIVE_REEVALUATION_FIELD)) throw new TenantAccessDeniedError();
  if (!(input.graph instanceof LifecycleDependencyGraphSnapshot)) throw new TenantAccessDeniedError();
  if (!same(input.graph.tenant, reader.tenant) || !same(input.graph.organization, reader.organization)) throw new TenantAccessDeniedError();
  if (input.graph.subject === null) {
    if (c.subject !== null) throw new TenantAccessDeniedError();
  } else if (c.subject === null || !sameSubject(input.graph.subject, c.subject)) throw new TenantAccessDeniedError();
}

function minimumDepth(candidate: DependencyImpactCandidateView): number {
  if (candidate.paths.length === 0) throw new TypeError('Impact candidate requires explanatory path');
  return Math.min(...candidate.paths.map(path => path.edges.length));
}
function copiedPaths(candidate: DependencyImpactCandidateView): readonly DependencyImpactPathView[] {
  return candidate.paths.map(path => ({ nodes: [...path.nodes], edges: [...path.edges], impactMode: path.impactMode }));
}
function copiedVersions(candidate: DependencyImpactCandidateView): readonly DependencyImpactVersionView[] {
  return candidate.requiredVersions.map(value => ({ ...value }));
}
function versionsFromFact(fact: LifecycleReevaluationFact): readonly DependencyImpactVersionView[] {
  return fact.versionBindings.map(value => ({ reference: value.reference, type: value.type, version: value.version.toString() }));
}
function batchOutcome(decisions: readonly LifecycleReevaluationDecisionView[], impactComplete: boolean): LifecycleReevaluationBatchOutcome {
  if (decisions.length === 0 && impactComplete) return LifecycleReevaluationBatchOutcome.NO_IMPACT;
  if (!impactComplete || decisions.some(value => value.outcome === LifecycleReevaluationOutcome.REVIEW_REQUIRED)) return LifecycleReevaluationBatchOutcome.REVIEW_REQUIRED;
  if (decisions.some(value => value.outcome === LifecycleReevaluationOutcome.INDETERMINATE)) return LifecycleReevaluationBatchOutcome.INDETERMINATE;
  if (decisions.length > 0 && decisions.every(value => value.outcome === LifecycleReevaluationOutcome.FUTURE_IMPACT_REGISTERED)) return LifecycleReevaluationBatchOutcome.FUTURE_IMPACT_REGISTERED;
  return LifecycleReevaluationBatchOutcome.COMPLETED;
}

/** Pure selective reevaluation orchestration and immutable decision-evidence projection. No persistence or legal-state mutation. */
export class LifecycleSelectiveReevaluation {
  readonly #view: DeepReadonly<SelectiveReevaluationView>;
  private constructor(view: SelectiveReevaluationView) { this.#view = freeze(view); Object.freeze(this); }
  toJSON(): DeepReadonly<SelectiveReevaluationView> { return this.#view; }

  static evaluate(input: SelectiveReevaluationInput): LifecycleSelectiveReevaluation {
    assertReader(input);
    if (!(input.event instanceof LifecycleChangeEvent) || input.event.graph !== input.graph) throw new TypeError('Change event must bind exact dependency graph');
    if (!(input.impact instanceof LifecycleDependencyImpactTraversal)) throw new TypeError('Exact dependency impact traversal required');

    const impact = input.impact.toJSON();
    if (impact.graphId !== input.graph.id || impact.graphVersion !== input.graph.version.toString() || impact.eventId !== input.event.id) throw new TypeError('Impact traversal graph/event identity mismatch');
    if (impact.correlationId !== input.context.correlationId.toString()) throw new TenantAccessDeniedError();

    const evaluated = instant(input.evaluatedAt), requested = instant(input.context.requestedAt), known = instant(input.asKnownAt);
    if (evaluated !== requested) throw new RangeError('Reevaluation instant must match invocation horizon');
    if (known > evaluated) throw new RangeError('Reevaluation knowledge horizon exceeds evaluation instant');
    if (instant(UtcInstant.from(impact.evaluatedAt)) > evaluated || instant(UtcInstant.from(impact.asKnownAt)) > known || instant(input.graph.asKnownAt) > known || instant(input.event.observedAt) > known || instant(input.event.occurredAt) > known) throw new RangeError('Reevaluation input exceeds knowledge horizon');

    const maxDecisions = integer(input.maxDecisions, 1, 512);
    const candidates = [...impact.candidates].sort((a, b) => {
      const depth = minimumDepth(a) - minimumDepth(b);
      return depth !== 0 ? depth : compare(a.targetReference, b.targetReference);
    });
    if (candidates.length > maxDecisions) throw new RangeError('Reevaluation decision budget exceeded');

    const facts = dense(input.facts, MAX_FACTS);
    if (!facts.every(value => value instanceof LifecycleReevaluationFact)) throw new TypeError('Governed reevaluation facts required');
    const factMap = new Map<string, LifecycleReevaluationFact>();
    for (const current of facts) {
      if (factMap.has(current.candidateDedupKey)) throw new TypeError('Duplicate reevaluation fact for candidate');
      factMap.set(current.candidateDedupKey, current);
    }
    const candidateKeys = new Set(candidates.map(value => value.dedupKey));
    for (const current of facts) if (!candidateKeys.has(current.candidateDedupKey)) throw new TypeError('Reevaluation fact targets unrelated candidate');
    if (!impact.complete && facts.length > 0) throw new TypeError('Incomplete impact traversal cannot consume reevaluation facts');

    const decisions: LifecycleReevaluationDecisionView[] = [];
    let factsApplied = 0;

    for (let index = 0; index < candidates.length; index++) {
      const candidate = candidates[index]!;
      const currentFact = factMap.get(candidate.dedupKey) ?? null;
      if ((candidate.reviewRequired || candidate.futureImpact) && currentFact !== null) throw new TypeError('Review/future impact candidate cannot consume current reevaluation fact');

      if (currentFact !== null) {
        if (currentFact.targetReference !== candidate.targetReference || currentFact.targetType !== candidate.targetType || (currentFact.targetVersion?.toString() ?? null) !== candidate.targetVersion) throw new TypeError('Reevaluation fact target binding mismatch');
        if (canonical(versionsFromFact(currentFact)) !== canonical(candidate.requiredVersions)) throw new TypeError('Reevaluation fact required-version mismatch');
        if (currentFact.correlationReference !== input.event.correlationReference) throw new TypeError('Reevaluation fact correlation mismatch');
        if (instant(currentFact.evaluatedAt) !== evaluated || instant(currentFact.asKnownAt) > known || instant(currentFact.asKnownAt) < instant(UtcInstant.from(impact.asKnownAt))) throw new RangeError('Reevaluation fact horizon mismatch');
        factsApplied += 1;
      }

      let outcome: LifecycleReevaluationOutcome;
      let factForDecision: LifecycleReevaluationFact | null = currentFact;
      const reasons = new Set<string>(candidate.reasonCodes);

      if (!impact.complete) {
        outcome = LifecycleReevaluationOutcome.REVIEW_REQUIRED;
        factForDecision = null;
        reasons.add('IMPACT_TRAVERSAL_INCOMPLETE');
      } else if (candidate.reviewRequired) {
        outcome = LifecycleReevaluationOutcome.REVIEW_REQUIRED;
        factForDecision = null;
        reasons.add('CANDIDATE_REVIEW_BOUNDARY');
      } else if (candidate.futureImpact) {
        outcome = LifecycleReevaluationOutcome.FUTURE_IMPACT_REGISTERED;
        factForDecision = null;
        reasons.add('FUTURE_EFFECTIVE_CHANGE');
      } else if (currentFact === null) {
        outcome = LifecycleReevaluationOutcome.INDETERMINATE;
        reasons.add('REEVALUATION_RESULT_MISSING');
      } else if (currentFact.state === LifecycleReevaluationFactState.REVIEW_REQUIRED) {
        outcome = LifecycleReevaluationOutcome.REVIEW_REQUIRED;
        reasons.add('EVALUATOR_REVIEW_REQUIRED');
      } else if (currentFact.state === LifecycleReevaluationFactState.INDETERMINATE) {
        outcome = LifecycleReevaluationOutcome.INDETERMINATE;
        reasons.add('EVALUATOR_INDETERMINATE');
      } else if (currentFact.actionRequired) {
        outcome = LifecycleReevaluationOutcome.ACTION_REQUIRED;
        reasons.add('ACTION_REQUIRED');
      } else if (currentFact.previousResult === null || currentFact.previousResult !== currentFact.newResult) {
        outcome = LifecycleReevaluationOutcome.STATUS_CHANGED;
        reasons.add('REEVALUATED_STATUS_CHANGED');
      } else {
        outcome = LifecycleReevaluationOutcome.UNCHANGED;
        reasons.add('REEVALUATED_UNCHANGED');
      }

      if (factForDecision !== null) for (const reason of factForDecision.reasonCodes) reasons.add(reason);
      reasons.add(`REEVALUATION_OUTCOME:${outcome}`);

      const marker = factForDecision?.reference ?? (outcome === LifecycleReevaluationOutcome.FUTURE_IMPACT_REGISTERED ? 'boundary:future' : outcome === LifecycleReevaluationOutcome.REVIEW_REQUIRED ? 'boundary:review' : 'boundary:missing');
      const decisionReference = `reeval:${input.graph.id}:${input.graph.version.toString()}:${input.event.id}:${candidate.targetReference}:${marker}`;
      const dedupKey = `reeval-dedup:${input.graph.id}:${input.graph.version.toString()}:${input.event.id}:${candidate.dedupKey}:${marker}`;
      const factView = factForDecision?.toJSON() ?? null;

      decisions.push({
        order: index + 1,
        decisionReference,
        dedupKey,
        targetReference: candidate.targetReference,
        targetType: candidate.targetType,
        targetVersion: candidate.targetVersion,
        impactMode: candidate.impactMode,
        outcome,
        reviewRequired: outcome === LifecycleReevaluationOutcome.REVIEW_REQUIRED,
        futureImpact: outcome === LifecycleReevaluationOutcome.FUTURE_IMPACT_REGISTERED,
        candidateDedupKey: candidate.dedupKey,
        evaluationFactReference: factView?.reference ?? null,
        previousDecisionReference: factView?.previousDecisionReference ?? null,
        previousResult: factView?.previousResult ?? null,
        newResult: factView?.newResult ?? null,
        actionRequired: factView?.actionRequired ?? false,
        evaluatorId: factView?.evaluatorId ?? null,
        evaluatorKind: factView?.evaluatorKind ?? null,
        evaluatedAt: input.evaluatedAt.toString(),
        asKnownAt: input.asKnownAt.toString(),
        dependencyPaths: copiedPaths(candidate),
        requiredVersions: copiedVersions(candidate),
        evidenceReferences: factView === null ? [] : [...factView.evidenceReferences],
        provenanceReference: factView?.provenanceReference ?? null,
        correlationReference: input.event.correlationReference,
        causationReference: factView?.causationReference ?? null,
        reasonCodes: [...reasons].sort(compare),
        reevaluationPerformed: factForDecision?.state === LifecycleReevaluationFactState.COMPLETE,
      });
    }

    const outcome = batchOutcome(decisions, impact.complete);
    const reviewCount = decisions.filter(value => value.outcome === LifecycleReevaluationOutcome.REVIEW_REQUIRED).length;
    const indeterminateCount = decisions.filter(value => value.outcome === LifecycleReevaluationOutcome.INDETERMINATE).length;
    const futureImpactCount = decisions.filter(value => value.outcome === LifecycleReevaluationOutcome.FUTURE_IMPACT_REGISTERED).length;
    const complete = impact.complete && indeterminateCount === 0;
    const conclusive = complete && reviewCount === 0;
    const reasons = new Set<string>(impact.reasonCodes);
    reasons.add(`BATCH_OUTCOME:${outcome}`);
    if (!impact.complete) reasons.add('IMPACT_TRAVERSAL_INCOMPLETE');
    if (reviewCount > 0) reasons.add('REVIEW_REQUIRED');
    if (indeterminateCount > 0) reasons.add('INDETERMINATE_RESULT');

    return new LifecycleSelectiveReevaluation({
      graphId: input.graph.id,
      graphVersion: input.graph.version.toString(),
      eventId: input.event.id,
      eventType: input.event.type,
      evaluatedAt: input.evaluatedAt.toString(),
      asKnownAt: input.asKnownAt.toString(),
      outcome,
      complete,
      conclusive,
      decisions,
      decisionEvidenceProduced: decisions.length,
      reevaluationFactsApplied: factsApplied,
      reviewCount,
      indeterminateCount,
      futureImpactCount,
      reasonCodes: [...reasons].sort(compare),
      actorId: input.context.actor.id.toString(),
      correlationId: input.context.correlationId.toString(),
      accessDecisionReference: input.accessDecision.reference.toString(),
      accessAuditReference: input.accessDecision.auditReference.toString(),
      authorizationAuthority: false,
      credentialStateMutated: false,
      authorizationStateMutated: false,
      historicalDecisionMutated: false,
      complianceStateChanged: false,
      notificationScheduled: false,
      providerInvoked: false,
      eventsEmitted: 0,
      physicalDeletionAuthorized: false,
    });
  }
}
