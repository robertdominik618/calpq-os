import { HistoricalCatalogQueryId, HistoricalReplayId } from '../ids.ts';
import { Jurisdiction } from '../jurisdiction.ts';
import { SubjectReference } from '../party-references.ts';
import { DateOnly, UtcInstant } from '../time.ts';
import { VersionId } from '../version.ts';
import { CatalogProvenanceBinding, CatalogProvenanceTargetKind } from './catalog-provenance-binding.ts';
import { CatalogQueryExplanationGraph } from './catalog-query-explainability.ts';
import { GapNavigatorEvaluation } from './gap-navigator.ts';

function sameJurisdiction(left: Jurisdiction, right: Jurisdiction): boolean {
  return left.toString() === right.toString();
}

function sameSubject(left: SubjectReference, right: SubjectReference): boolean {
  return left.id.toString() === right.id.toString() && left.kind === right.kind;
}

function requiredIdentifier(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 512) throw new RangeError(`${label} is too long`);
  if (/\p{C}/u.test(normalized)) throw new TypeError(`${label} contains control characters`);
  return normalized;
}

function knownBy(binding: CatalogProvenanceBinding, asKnownAt: UtcInstant): boolean {
  const cutoff = asKnownAt.toEpochMilliseconds();
  return binding.provenance.evaluatedAt.toEpochMilliseconds() <= cutoff
    && binding.sourceReferences.every((source) => source.retrievedAt.toEpochMilliseconds() <= cutoff);
}

function targetEffectiveOn(binding: CatalogProvenanceBinding, effectiveOn: DateOnly, jurisdiction: Jurisdiction): boolean {
  return sameJurisdiction(binding.target.jurisdiction, jurisdiction)
    && binding.target.effectivePeriod.isEffectiveOn(effectiveOn);
}

function bindingKey(binding: CatalogProvenanceBinding): string {
  return [binding.targetKind, binding.targetId, binding.targetVersion.toString(), binding.target.jurisdiction.toString()].join('|');
}

function normalizeBindings(values: readonly CatalogProvenanceBinding[]): readonly CatalogProvenanceBinding[] {
  if (!Array.isArray(values)) throw new TypeError('Historical query candidates must be an array');
  if (values.some((value) => !(value instanceof CatalogProvenanceBinding))) {
    throw new TypeError('Historical query candidates must use CatalogProvenanceBinding');
  }
  const keys = values.map(bindingKey);
  if (new Set(keys).size !== keys.length) {
    throw new TypeError('Historical query candidates must be unique by target kind/id/version/jurisdiction');
  }
  return Object.freeze([...values].sort((left, right) => bindingKey(left).localeCompare(bindingKey(right))));
}

function sortedVersions(values: readonly CatalogProvenanceBinding[]): readonly string[] {
  return Object.freeze([...new Set(values.map((value) => value.targetVersion.toString()))].sort());
}

export const HistoricalVersionQueryState = {
  SELECTED: 'SELECTED',
  NOT_FOUND: 'NOT_FOUND',
  NOT_YET_KNOWN: 'NOT_YET_KNOWN',
  AMBIGUOUS_REVIEW_REQUIRED: 'AMBIGUOUS_REVIEW_REQUIRED',
} as const;
export type HistoricalVersionQueryState =
  (typeof HistoricalVersionQueryState)[keyof typeof HistoricalVersionQueryState];

export interface HistoricalCatalogVersionQueryInput {
  readonly id: HistoricalCatalogQueryId;
  readonly targetKind: CatalogProvenanceTargetKind;
  readonly targetId: string;
  readonly requestedVersion?: VersionId | null;
  readonly jurisdiction: Jurisdiction;
  readonly effectiveOn: DateOnly;
  readonly asKnownAt: UtcInstant;
  readonly executedAt: UtcInstant;
  readonly candidates: readonly CatalogProvenanceBinding[];
}

export class HistoricalCatalogVersionQuery {
  readonly id: HistoricalCatalogQueryId;
  readonly targetKind: CatalogProvenanceTargetKind;
  readonly targetId: string;
  readonly requestedVersion: VersionId | null;
  readonly jurisdiction: Jurisdiction;
  readonly effectiveOn: DateOnly;
  readonly asKnownAt: UtcInstant;
  readonly executedAt: UtcInstant;
  readonly state: HistoricalVersionQueryState;
  readonly selected: CatalogProvenanceBinding | null;
  readonly candidateVersions: readonly string[];
  readonly knownCandidateVersions: readonly string[];
  readonly sourceReviewRequired: boolean;

  private constructor(input: HistoricalCatalogVersionQueryInput, state: HistoricalVersionQueryState, selected: CatalogProvenanceBinding | null, applicable: readonly CatalogProvenanceBinding[], known: readonly CatalogProvenanceBinding[]) {
    this.id = input.id;
    this.targetKind = input.targetKind;
    this.targetId = requiredIdentifier(input.targetId, 'Historical query target ID');
    this.requestedVersion = input.requestedVersion ?? null;
    this.jurisdiction = input.jurisdiction;
    this.effectiveOn = input.effectiveOn;
    this.asKnownAt = input.asKnownAt;
    this.executedAt = input.executedAt;
    this.state = state;
    this.selected = selected;
    this.candidateVersions = sortedVersions(applicable);
    this.knownCandidateVersions = sortedVersions(known);
    this.sourceReviewRequired = selected?.requiresSourceReview() ?? false;
    Object.freeze(this);
  }

  static execute(input: HistoricalCatalogVersionQueryInput): HistoricalCatalogVersionQuery {
    if (!(input.id instanceof HistoricalCatalogQueryId)) throw new TypeError('Historical query requires HistoricalCatalogQueryId');
    if (!Object.values(CatalogProvenanceTargetKind).includes(input.targetKind)) throw new TypeError('Historical query target kind must be controlled');
    const targetId = requiredIdentifier(input.targetId, 'Historical query target ID');
    const requestedVersion = input.requestedVersion ?? null;
    if (requestedVersion !== null && !(requestedVersion instanceof VersionId)) throw new TypeError('Historical query requestedVersion must use VersionId');
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Historical query requires Jurisdiction');
    if (!(input.effectiveOn instanceof DateOnly)) throw new TypeError('Historical query requires explicit DateOnly effectiveOn');
    if (!(input.asKnownAt instanceof UtcInstant)) throw new TypeError('Historical query requires explicit UtcInstant asKnownAt');
    if (!(input.executedAt instanceof UtcInstant)) throw new TypeError('Historical query requires explicit UtcInstant executedAt');
    if (input.executedAt.toEpochMilliseconds() < input.asKnownAt.toEpochMilliseconds()) {
      throw new RangeError('Historical query execution cannot predate its knowledge cutoff');
    }

    const candidates = normalizeBindings(input.candidates);
    const applicable = candidates.filter((binding) =>
      binding.targetKind === input.targetKind
      && binding.targetId === targetId
      && (requestedVersion === null || binding.targetVersion.toString() === requestedVersion.toString())
      && targetEffectiveOn(binding, input.effectiveOn, input.jurisdiction));
    const known = applicable.filter((binding) => knownBy(binding, input.asKnownAt));

    if (applicable.length === 0) {
      return new HistoricalCatalogVersionQuery(input, HistoricalVersionQueryState.NOT_FOUND, null, applicable, known);
    }
    if (known.length === 0) {
      return new HistoricalCatalogVersionQuery(input, HistoricalVersionQueryState.NOT_YET_KNOWN, null, applicable, known);
    }
    if (known.length > 1) {
      return new HistoricalCatalogVersionQuery(input, HistoricalVersionQueryState.AMBIGUOUS_REVIEW_REQUIRED, null, applicable, known);
    }
    return new HistoricalCatalogVersionQuery(input, HistoricalVersionQueryState.SELECTED, known[0] ?? null, applicable, known);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      targetKind: this.targetKind,
      targetId: this.targetId,
      requestedVersion: this.requestedVersion?.toString() ?? null,
      jurisdiction: this.jurisdiction.toJSON(),
      effectiveOn: this.effectiveOn.toString(),
      asKnownAt: this.asKnownAt.toString(),
      executedAt: this.executedAt.toString(),
      state: this.state,
      selected: this.selected?.toJSON() ?? null,
      candidateVersions: [...this.candidateVersions],
      knownCandidateVersions: [...this.knownCandidateVersions],
      sourceReviewRequired: this.sourceReviewRequired,
    };
  }
}

export const HistoricalReplayState = {
  VERSION_QUERY_UNRESOLVED: 'VERSION_QUERY_UNRESOLVED',
  CATALOG_VERSION_ONLY: 'CATALOG_VERSION_ONLY',
  GAP_SNAPSHOT_REPLAYED: 'GAP_SNAPSHOT_REPLAYED',
  FULL_SNAPSHOT_REPLAYED: 'FULL_SNAPSHOT_REPLAYED',
  AMBIGUOUS_REVIEW_REQUIRED: 'AMBIGUOUS_REVIEW_REQUIRED',
} as const;
export type HistoricalReplayState = (typeof HistoricalReplayState)[keyof typeof HistoricalReplayState];

function normalizeGapSnapshots(values: readonly GapNavigatorEvaluation[]): readonly GapNavigatorEvaluation[] {
  if (!Array.isArray(values)) throw new TypeError('Historical replay gap snapshots must be an array');
  if (values.some((value) => !(value instanceof GapNavigatorEvaluation))) throw new TypeError('Historical replay gap snapshots must use GapNavigatorEvaluation');
  const ids = values.map((value) => value.id.toString());
  if (new Set(ids).size !== ids.length) throw new TypeError('Historical replay GapEvaluationId values must be unique');
  return Object.freeze([...values]);
}

function normalizeExplanationSnapshots(values: readonly CatalogQueryExplanationGraph[]): readonly CatalogQueryExplanationGraph[] {
  if (!Array.isArray(values)) throw new TypeError('Historical replay explanation snapshots must be an array');
  if (values.some((value) => !(value instanceof CatalogQueryExplanationGraph))) throw new TypeError('Historical replay explanation snapshots must use CatalogQueryExplanationGraph');
  const ids = values.map((value) => value.id.toString());
  if (new Set(ids).size !== ids.length) throw new TypeError('Historical replay ExplanationGraphId values must be unique');
  return Object.freeze([...values]);
}

function latestGap(values: readonly GapNavigatorEvaluation[]): { readonly selected: GapNavigatorEvaluation | null; readonly ambiguous: boolean; readonly ids: readonly string[] } {
  if (values.length === 0) return { selected: null, ambiguous: false, ids: Object.freeze([]) };
  const sorted = [...values].sort((left, right) => {
    const time = right.evaluatedAt.toEpochMilliseconds() - left.evaluatedAt.toEpochMilliseconds();
    return time !== 0 ? time : left.id.toString().localeCompare(right.id.toString());
  });
  const latestTime = sorted[0]?.evaluatedAt.toEpochMilliseconds();
  const latest = sorted.filter((value) => value.evaluatedAt.toEpochMilliseconds() === latestTime);
  return {
    selected: latest.length === 1 ? latest[0] ?? null : null,
    ambiguous: latest.length > 1,
    ids: Object.freeze(sorted.map((value) => value.id.toString())),
  };
}

function latestExplanation(values: readonly CatalogQueryExplanationGraph[]): { readonly selected: CatalogQueryExplanationGraph | null; readonly ambiguous: boolean; readonly ids: readonly string[] } {
  if (values.length === 0) return { selected: null, ambiguous: false, ids: Object.freeze([]) };
  const sorted = [...values].sort((left, right) => {
    const time = right.evaluatedAt.toEpochMilliseconds() - left.evaluatedAt.toEpochMilliseconds();
    return time !== 0 ? time : left.id.toString().localeCompare(right.id.toString());
  });
  const latestTime = sorted[0]?.evaluatedAt.toEpochMilliseconds();
  const latest = sorted.filter((value) => value.evaluatedAt.toEpochMilliseconds() === latestTime);
  return {
    selected: latest.length === 1 ? latest[0] ?? null : null,
    ambiguous: latest.length > 1,
    ids: Object.freeze(sorted.map((value) => value.id.toString())),
  };
}

export interface HistoricalSnapshotReplayInput {
  readonly id: HistoricalReplayId;
  readonly versionQuery: HistoricalCatalogVersionQuery;
  readonly subject: SubjectReference;
  readonly gapSnapshots: readonly GapNavigatorEvaluation[];
  readonly explanationSnapshots: readonly CatalogQueryExplanationGraph[];
  readonly replayedAt: UtcInstant;
}

export class HistoricalSnapshotReplay {
  readonly id: HistoricalReplayId;
  readonly versionQuery: HistoricalCatalogVersionQuery;
  readonly subject: SubjectReference;
  readonly replayedAt: UtcInstant;
  readonly state: HistoricalReplayState;
  readonly gapSnapshot: GapNavigatorEvaluation | null;
  readonly explanationSnapshot: CatalogQueryExplanationGraph | null;
  readonly candidateGapEvaluationIds: readonly string[];
  readonly candidateExplanationGraphIds: readonly string[];

  private constructor(input: HistoricalSnapshotReplayInput, state: HistoricalReplayState, gapSnapshot: GapNavigatorEvaluation | null, explanationSnapshot: CatalogQueryExplanationGraph | null, gapIds: readonly string[], explanationIds: readonly string[]) {
    this.id = input.id;
    this.versionQuery = input.versionQuery;
    this.subject = input.subject;
    this.replayedAt = input.replayedAt;
    this.state = state;
    this.gapSnapshot = gapSnapshot;
    this.explanationSnapshot = explanationSnapshot;
    this.candidateGapEvaluationIds = Object.freeze([...gapIds]);
    this.candidateExplanationGraphIds = Object.freeze([...explanationIds]);
    Object.freeze(this);
  }

  static replay(input: HistoricalSnapshotReplayInput): HistoricalSnapshotReplay {
    if (!(input.id instanceof HistoricalReplayId)) throw new TypeError('Historical replay requires HistoricalReplayId');
    if (!(input.versionQuery instanceof HistoricalCatalogVersionQuery)) throw new TypeError('Historical replay requires HistoricalCatalogVersionQuery');
    if (!(input.subject instanceof SubjectReference)) throw new TypeError('Historical replay requires SubjectReference');
    if (!(input.replayedAt instanceof UtcInstant)) throw new TypeError('Historical replay requires explicit UtcInstant replayedAt');
    if (input.replayedAt.toEpochMilliseconds() < input.versionQuery.executedAt.toEpochMilliseconds()) {
      throw new RangeError('Historical replay cannot predate its version query execution');
    }

    const gaps = normalizeGapSnapshots(input.gapSnapshots);
    const explanations = normalizeExplanationSnapshots(input.explanationSnapshots);
    const selected = input.versionQuery.selected;
    if (input.versionQuery.state !== HistoricalVersionQueryState.SELECTED || selected === null) {
      return new HistoricalSnapshotReplay(input, HistoricalReplayState.VERSION_QUERY_UNRESOLVED, null, null, [], []);
    }
    if (selected.targetKind !== CatalogProvenanceTargetKind.QUALIFICATION_PATH) {
      return new HistoricalSnapshotReplay(input, HistoricalReplayState.CATALOG_VERSION_ONLY, null, null, [], []);
    }

    const cutoff = input.versionQuery.asKnownAt.toEpochMilliseconds();
    const matchingGaps = gaps.filter((gap) =>
      gap.path.id.toString() === selected.targetId
      && gap.path.version.toString() === selected.targetVersion.toString()
      && sameSubject(gap.subject, input.subject)
      && sameJurisdiction(gap.jurisdiction, input.versionQuery.jurisdiction)
      && gap.effectiveOn.toString() === input.versionQuery.effectiveOn.toString()
      && gap.evaluatedAt.toEpochMilliseconds() <= cutoff);
    const gapSelection = latestGap(matchingGaps);
    if (gapSelection.ambiguous) {
      return new HistoricalSnapshotReplay(input, HistoricalReplayState.AMBIGUOUS_REVIEW_REQUIRED, null, null, gapSelection.ids, []);
    }
    if (gapSelection.selected === null) {
      return new HistoricalSnapshotReplay(input, HistoricalReplayState.CATALOG_VERSION_ONLY, null, null, gapSelection.ids, []);
    }

    const gap = gapSelection.selected;
    const matchingExplanations = explanations.filter((graph) =>
      graph.gapEvaluationId === gap.id.toString()
      && graph.subject.id === input.subject.id.toString()
      && graph.subject.kind === input.subject.kind
      && graph.qualificationPathId === selected.targetId
      && graph.qualificationPathVersion === selected.targetVersion.toString()
      && graph.jurisdiction === input.versionQuery.jurisdiction.toString()
      && graph.effectiveOn === input.versionQuery.effectiveOn.toString()
      && graph.evaluatedAt.toEpochMilliseconds() >= gap.evaluatedAt.toEpochMilliseconds()
      && graph.evaluatedAt.toEpochMilliseconds() <= cutoff);
    const explanationSelection = latestExplanation(matchingExplanations);
    if (explanationSelection.ambiguous) {
      return new HistoricalSnapshotReplay(input, HistoricalReplayState.AMBIGUOUS_REVIEW_REQUIRED, gap, null, gapSelection.ids, explanationSelection.ids);
    }
    if (explanationSelection.selected === null) {
      return new HistoricalSnapshotReplay(input, HistoricalReplayState.GAP_SNAPSHOT_REPLAYED, gap, null, gapSelection.ids, explanationSelection.ids);
    }
    return new HistoricalSnapshotReplay(input, HistoricalReplayState.FULL_SNAPSHOT_REPLAYED, gap, explanationSelection.selected, gapSelection.ids, explanationSelection.ids);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      versionQuery: this.versionQuery.toJSON(),
      subject: this.subject.toJSON(),
      replayedAt: this.replayedAt.toString(),
      state: this.state,
      candidateGapEvaluationIds: [...this.candidateGapEvaluationIds],
      candidateExplanationGraphIds: [...this.candidateExplanationGraphIds],
      gapSnapshot: this.gapSnapshot?.toJSON() ?? null,
      explanationSnapshot: this.explanationSnapshot?.toJSON() ?? null,
    };
  }
}
