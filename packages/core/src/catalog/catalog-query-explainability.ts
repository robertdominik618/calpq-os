import { ExplanationGraphId, SourceId } from '../ids.ts';
import { GapItemState, GapNavigatorEvaluation, GapRequirementItem, GapStepItem } from './gap-navigator.ts';
import type { GapRuleReference } from './gap-navigator.ts';
import { SourceReference } from '../provenance/source-reference.ts';
import { UtcInstant } from '../time.ts';
import { VerificationStateCode } from '../verification-state.ts';

export const ExplanationClassification = {
  EXPLAINED: 'EXPLAINED',
  INDETERMINATE: 'INDETERMINATE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type ExplanationClassification = (typeof ExplanationClassification)[keyof typeof ExplanationClassification];

export const ExplanationNodeKind = {
  GAP_EVALUATION: 'GAP_EVALUATION',
  QUALIFICATION_PATH: 'QUALIFICATION_PATH',
  PATH_STEP: 'PATH_STEP',
  REQUIREMENT: 'REQUIREMENT',
  REASON: 'REASON',
  SOURCE: 'SOURCE',
  RULE: 'RULE',
  EVIDENCE: 'EVIDENCE',
} as const;
export type ExplanationNodeKind = (typeof ExplanationNodeKind)[keyof typeof ExplanationNodeKind];

export const ExplanationEdgeKind = {
  EVALUATES_PATH: 'EVALUATES_PATH',
  PATH_CONTAINS_STEP: 'PATH_CONTAINS_STEP',
  STEP_CONTAINS_REQUIREMENT: 'STEP_CONTAINS_REQUIREMENT',
  HAS_REASON: 'HAS_REASON',
  SUPPORTED_BY_SOURCE: 'SUPPORTED_BY_SOURCE',
  SUPPORTED_BY_RULE: 'SUPPORTED_BY_RULE',
  SUPPORTED_BY_EVIDENCE: 'SUPPORTED_BY_EVIDENCE',
  BLOCKED_BY_STEP: 'BLOCKED_BY_STEP',
  HAS_RESIDUAL_REQUIREMENT: 'HAS_RESIDUAL_REQUIREMENT',
} as const;
export type ExplanationEdgeKind = (typeof ExplanationEdgeKind)[keyof typeof ExplanationEdgeKind];

export const ExplanationUnresolvedFactCode = {
  SOURCE_REFERENCE_MISSING: 'SOURCE_REFERENCE_MISSING',
  SOURCE_VERIFICATION_REVIEW_REQUIRED: 'SOURCE_VERIFICATION_REVIEW_REQUIRED',
  TARGET_SOURCE_LINK_MISSING: 'TARGET_SOURCE_LINK_MISSING',
  GAP_INFORMATION_MISSING: 'GAP_INFORMATION_MISSING',
  GAP_REVIEW_REQUIRED: 'GAP_REVIEW_REQUIRED',
} as const;
export type ExplanationUnresolvedFactCode = (typeof ExplanationUnresolvedFactCode)[keyof typeof ExplanationUnresolvedFactCode];

export interface ExplanationUnresolvedFact {
  readonly code: ExplanationUnresolvedFactCode;
  readonly targetKey: string;
  readonly referenceId: string | null;
}

export interface ExplanationGraphNode {
  readonly key: string;
  readonly kind: ExplanationNodeKind;
  readonly referenceId: string;
  readonly referenceVersion: string | null;
  readonly gapState: GapItemState | null;
  readonly verificationState: string | null;
}

export interface ExplanationGraphEdge {
  readonly from: string;
  readonly to: string;
  readonly kind: ExplanationEdgeKind;
}

function key(kind: ExplanationNodeKind, id: string, version: string | null = null): string {
  return version === null ? `${kind}:${id}` : `${kind}:${id}@${version}`;
}

function nodeSort(left: ExplanationGraphNode, right: ExplanationGraphNode): number {
  return left.key.localeCompare(right.key);
}

function edgeSort(left: ExplanationGraphEdge, right: ExplanationGraphEdge): number {
  return `${left.from}|${left.kind}|${left.to}`.localeCompare(`${right.from}|${right.kind}|${right.to}`);
}

function factSort(left: ExplanationUnresolvedFact, right: ExplanationUnresolvedFact): number {
  return `${left.code}|${left.targetKey}|${left.referenceId ?? ''}`.localeCompare(`${right.code}|${right.targetKey}|${right.referenceId ?? ''}`);
}

function frozenNode(input: ExplanationGraphNode): ExplanationGraphNode {
  return Object.freeze({ ...input });
}

function frozenEdge(input: ExplanationGraphEdge): ExplanationGraphEdge {
  return Object.freeze({ ...input });
}

function frozenFact(input: ExplanationUnresolvedFact): ExplanationUnresolvedFact {
  return Object.freeze({ ...input });
}

function subjectIdentity(evaluation: GapNavigatorEvaluation): Readonly<{ id: string; kind: string }> {
  return Object.freeze({ id: evaluation.subject.id.toString(), kind: evaluation.subject.kind });
}

function sourceSnapshotSignature(source: SourceReference): string {
  return JSON.stringify({
    id: source.id.toString(),
    authority: { id: source.authority.id.toString(), kind: source.authority.kind },
    jurisdiction: source.jurisdiction.toString(),
    sourceType: source.sourceType,
    canonicalLocator: source.canonicalLocator,
    version: source.version.toString(),
    publicationDate: source.publicationDate?.toString() ?? null,
    effectiveFrom: source.effectiveFrom?.toString() ?? null,
    effectiveTo: source.effectiveTo?.toString() ?? null,
    retrievedAt: source.retrievedAt.toString(),
    verificationState: source.verificationState.toString(),
    contentHash: source.contentHash?.toString() ?? null,
  });
}

function sourceMap(values: readonly SourceReference[], evaluatedAt: UtcInstant): ReadonlyMap<string, SourceReference> {
  const result = new Map<string, SourceReference>();
  for (const source of values) {
    if (!(source instanceof SourceReference)) throw new TypeError('Explanation sources must use SourceReference');
    if (source.retrievedAt.toEpochMilliseconds() > evaluatedAt.toEpochMilliseconds()) {
      throw new RangeError('Explanation cannot use a SourceReference retrieved after its evaluation instant');
    }
    const id = source.id.toString();
    if (result.has(id)) {
      throw new TypeError('Explanation requires exactly one SourceReference per SourceId');
    }
    result.set(id, source);
  }
  return result;
}

function assertPathProvenanceSourceSnapshots(
  evaluation: GapNavigatorEvaluation,
  sources: ReadonlyMap<string, SourceReference>,
): void {
  for (const expected of evaluation.pathProvenance.sourceReferences) {
    const actual = sources.get(expected.id.toString());
    if (actual === undefined) continue;
    if (sourceSnapshotSignature(actual) !== sourceSnapshotSignature(expected)) {
      throw new TypeError('Explanation source must match the exact path-provenance SourceReference snapshot');
    }
  }
}

function referencedSourceIds(evaluation: GapNavigatorEvaluation): readonly SourceId[] {
  const byId = new Map<string, SourceId>();
  const add = (sourceId: SourceId): void => { byId.set(sourceId.toString(), sourceId); };
  evaluation.pathProvenance.sourceReferences.forEach((source) => add(source.id));
  evaluation.items.forEach((item) => {
    item.sourceReferenceIds.forEach(add);
    item.requirementItems.forEach((requirement) => requirement.sourceReferenceIds.forEach(add));
  });
  return Object.freeze([...byId.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value));
}

function targetNode(
  targetKey: string,
  kindValue: ExplanationNodeKind,
  id: string,
  version: string | null,
  state: GapItemState | null,
): ExplanationGraphNode {
  return frozenNode({ key: targetKey, kind: kindValue, referenceId: id, referenceVersion: version, gapState: state, verificationState: null });
}

interface LinkableGapItem {
  readonly state: GapItemState;
  readonly reasonCodes: readonly string[];
  readonly sourceReferenceIds: readonly SourceId[];
  readonly evidenceIds: readonly { toString(): string }[];
  readonly ruleReferences: readonly GapRuleReference[];
  readonly blockedByStepCodes: readonly string[];
  readonly residualRequirements: readonly { readonly id: { toString(): string }; readonly version: { toString(): string } }[];
}

function materializeLinks(
  target: ExplanationGraphNode,
  item: LinkableGapItem,
  nodes: Map<string, ExplanationGraphNode>,
  edges: Map<string, ExplanationGraphEdge>,
  sources: ReadonlyMap<string, SourceReference>,
  unresolved: Map<string, ExplanationUnresolvedFact>,
  stepKeys: ReadonlyMap<string, string>,
): void {
  const addNode = (value: ExplanationGraphNode): void => { nodes.set(value.key, value); };
  const addEdge = (from: string, to: string, kindValue: ExplanationEdgeKind): void => {
    const value = frozenEdge({ from, to, kind: kindValue });
    edges.set(`${from}|${kindValue}|${to}`, value);
  };
  const addFact = (value: ExplanationUnresolvedFact): void => {
    const frozen = frozenFact(value);
    unresolved.set(`${frozen.code}|${frozen.targetKey}|${frozen.referenceId ?? ''}`, frozen);
  };

  for (const reason of item.reasonCodes) {
    const reasonKey = key(ExplanationNodeKind.REASON, reason);
    addNode(frozenNode({ key: reasonKey, kind: ExplanationNodeKind.REASON, referenceId: reason, referenceVersion: null, gapState: null, verificationState: null }));
    addEdge(target.key, reasonKey, ExplanationEdgeKind.HAS_REASON);
  }

  if (item.reasonCodes.length > 0 && item.sourceReferenceIds.length === 0) {
    addFact({ code: ExplanationUnresolvedFactCode.TARGET_SOURCE_LINK_MISSING, targetKey: target.key, referenceId: null });
  }

  for (const sourceId of item.sourceReferenceIds) {
    const id = sourceId.toString();
    const source = sources.get(id);
    if (source === undefined) {
      addFact({ code: ExplanationUnresolvedFactCode.SOURCE_REFERENCE_MISSING, targetKey: target.key, referenceId: id });
      continue;
    }
    const sourceKey = key(ExplanationNodeKind.SOURCE, id, source.version.toString());
    addNode(frozenNode({
      key: sourceKey,
      kind: ExplanationNodeKind.SOURCE,
      referenceId: id,
      referenceVersion: source.version.toString(),
      gapState: null,
      verificationState: source.verificationState.toString(),
    }));
    addEdge(target.key, sourceKey, ExplanationEdgeKind.SUPPORTED_BY_SOURCE);
    if (source.verificationState.toString() !== VerificationStateCode.VERIFIED) {
      addFact({ code: ExplanationUnresolvedFactCode.SOURCE_VERIFICATION_REVIEW_REQUIRED, targetKey: target.key, referenceId: id });
    }
  }

  for (const rule of item.ruleReferences) {
    const ruleId = `${rule.kind}:${rule.id}`;
    const ruleKey = key(ExplanationNodeKind.RULE, ruleId, rule.version);
    addNode(frozenNode({ key: ruleKey, kind: ExplanationNodeKind.RULE, referenceId: ruleId, referenceVersion: rule.version, gapState: null, verificationState: null }));
    addEdge(target.key, ruleKey, ExplanationEdgeKind.SUPPORTED_BY_RULE);
  }

  for (const evidence of item.evidenceIds) {
    const id = evidence.toString();
    const evidenceKey = key(ExplanationNodeKind.EVIDENCE, id);
    addNode(frozenNode({ key: evidenceKey, kind: ExplanationNodeKind.EVIDENCE, referenceId: id, referenceVersion: null, gapState: null, verificationState: null }));
    addEdge(target.key, evidenceKey, ExplanationEdgeKind.SUPPORTED_BY_EVIDENCE);
  }

  for (const blockerCode of item.blockedByStepCodes) {
    const blocker = stepKeys.get(blockerCode);
    if (blocker !== undefined) addEdge(target.key, blocker, ExplanationEdgeKind.BLOCKED_BY_STEP);
  }

  for (const residual of item.residualRequirements) {
    const residualKey = key(ExplanationNodeKind.REQUIREMENT, residual.id.toString(), residual.version.toString());
    if (!nodes.has(residualKey)) {
      addNode(frozenNode({ key: residualKey, kind: ExplanationNodeKind.REQUIREMENT, referenceId: residual.id.toString(), referenceVersion: residual.version.toString(), gapState: null, verificationState: null }));
    }
    addEdge(target.key, residualKey, ExplanationEdgeKind.HAS_RESIDUAL_REQUIREMENT);
  }

  if (item.state === GapItemState.INFORMATION_MISSING) {
    addFact({ code: ExplanationUnresolvedFactCode.GAP_INFORMATION_MISSING, targetKey: target.key, referenceId: null });
  }
  if (item.state === GapItemState.REVIEW_REQUIRED) {
    addFact({ code: ExplanationUnresolvedFactCode.GAP_REVIEW_REQUIRED, targetKey: target.key, referenceId: null });
  }
}

function classificationFor(facts: readonly ExplanationUnresolvedFact[]): ExplanationClassification {
  if (facts.some((fact) => fact.code === ExplanationUnresolvedFactCode.GAP_REVIEW_REQUIRED
      || fact.code === ExplanationUnresolvedFactCode.SOURCE_VERIFICATION_REVIEW_REQUIRED)) {
    return ExplanationClassification.REVIEW_REQUIRED;
  }
  if (facts.length > 0) return ExplanationClassification.INDETERMINATE;
  return ExplanationClassification.EXPLAINED;
}

export interface CatalogQueryExplanationGraphInput {
  readonly id: ExplanationGraphId;
  readonly gapEvaluation: GapNavigatorEvaluation;
  readonly sourceReferences: readonly SourceReference[];
  readonly evaluatedAt: UtcInstant;
}

export class CatalogQueryExplanationGraph {
  readonly id: ExplanationGraphId;
  readonly gapEvaluationId: string;
  readonly subject: Readonly<{ id: string; kind: string }>;
  readonly qualificationPathId: string;
  readonly qualificationPathVersion: string;
  readonly jurisdiction: string;
  readonly effectiveOn: string;
  readonly evaluatedAt: UtcInstant;
  readonly classification: ExplanationClassification;
  readonly nodes: readonly ExplanationGraphNode[];
  readonly edges: readonly ExplanationGraphEdge[];
  readonly unresolvedFacts: readonly ExplanationUnresolvedFact[];

  private constructor(input: CatalogQueryExplanationGraphInput, nodes: readonly ExplanationGraphNode[], edges: readonly ExplanationGraphEdge[], facts: readonly ExplanationUnresolvedFact[]) {
    this.id = input.id;
    this.gapEvaluationId = input.gapEvaluation.id.toString();
    this.subject = subjectIdentity(input.gapEvaluation);
    this.qualificationPathId = input.gapEvaluation.path.id.toString();
    this.qualificationPathVersion = input.gapEvaluation.path.version.toString();
    this.jurisdiction = input.gapEvaluation.jurisdiction.toString();
    this.effectiveOn = input.gapEvaluation.effectiveOn.toString();
    this.evaluatedAt = input.evaluatedAt;
    this.classification = classificationFor(facts);
    this.nodes = Object.freeze([...nodes].sort(nodeSort));
    this.edges = Object.freeze([...edges].sort(edgeSort));
    this.unresolvedFacts = Object.freeze([...facts].sort(factSort));
    Object.freeze(this);
  }

  static build(input: CatalogQueryExplanationGraphInput): CatalogQueryExplanationGraph {
    if (!(input.id instanceof ExplanationGraphId)) throw new TypeError('Explanation graph requires ExplanationGraphId');
    if (!(input.gapEvaluation instanceof GapNavigatorEvaluation)) throw new TypeError('Explanation graph requires GapNavigatorEvaluation');
    if (!(input.evaluatedAt instanceof UtcInstant)) throw new TypeError('Explanation graph requires explicit UtcInstant');
    if (input.evaluatedAt.toEpochMilliseconds() < input.gapEvaluation.evaluatedAt.toEpochMilliseconds()) {
      throw new RangeError('Explanation graph cannot predate its GapNavigatorEvaluation');
    }

    const sources = sourceMap(input.sourceReferences, input.evaluatedAt);
    assertPathProvenanceSourceSnapshots(input.gapEvaluation, sources);
    const materialSourceIds = referencedSourceIds(input.gapEvaluation);
    const nodes = new Map<string, ExplanationGraphNode>();
    const edges = new Map<string, ExplanationGraphEdge>();
    const unresolved = new Map<string, ExplanationUnresolvedFact>();

    const rootKey = key(ExplanationNodeKind.GAP_EVALUATION, input.gapEvaluation.id.toString());
    const pathKey = key(ExplanationNodeKind.QUALIFICATION_PATH, input.gapEvaluation.path.id.toString(), input.gapEvaluation.path.version.toString());
    nodes.set(rootKey, targetNode(rootKey, ExplanationNodeKind.GAP_EVALUATION, input.gapEvaluation.id.toString(), null, null));
    nodes.set(pathKey, targetNode(pathKey, ExplanationNodeKind.QUALIFICATION_PATH, input.gapEvaluation.path.id.toString(), input.gapEvaluation.path.version.toString(), null));
    edges.set(`${rootKey}|${ExplanationEdgeKind.EVALUATES_PATH}|${pathKey}`, frozenEdge({ from: rootKey, to: pathKey, kind: ExplanationEdgeKind.EVALUATES_PATH }));

    for (const sourceId of materialSourceIds) {
      const id = sourceId.toString();
      if (!sources.has(id)) {
        const fact = frozenFact({ code: ExplanationUnresolvedFactCode.SOURCE_REFERENCE_MISSING, targetKey: pathKey, referenceId: id });
        unresolved.set(`${fact.code}|${fact.targetKey}|${id}`, fact);
      }
    }

    const stepKeys = new Map<string, string>();
    for (const item of input.gapEvaluation.items) {
      const stepKey = key(ExplanationNodeKind.PATH_STEP, item.step.code);
      stepKeys.set(item.step.code, stepKey);
      nodes.set(stepKey, targetNode(stepKey, ExplanationNodeKind.PATH_STEP, item.step.code, null, item.state));
      edges.set(`${pathKey}|${ExplanationEdgeKind.PATH_CONTAINS_STEP}|${stepKey}`, frozenEdge({ from: pathKey, to: stepKey, kind: ExplanationEdgeKind.PATH_CONTAINS_STEP }));
    }

    for (const item of input.gapEvaluation.items) {
      const stepKey = stepKeys.get(item.step.code) as string;
      const stepNode = nodes.get(stepKey) as ExplanationGraphNode;
      materializeLinks(stepNode, item as GapStepItem, nodes, edges, sources, unresolved, stepKeys);
      for (const requirement of item.requirementItems) {
        const requirementKey = key(ExplanationNodeKind.REQUIREMENT, requirement.requirementDefinition.id.toString(), requirement.requirementDefinition.version.toString());
        const requirementNode = targetNode(requirementKey, ExplanationNodeKind.REQUIREMENT, requirement.requirementDefinition.id.toString(), requirement.requirementDefinition.version.toString(), requirement.state);
        nodes.set(requirementKey, requirementNode);
        edges.set(`${stepKey}|${ExplanationEdgeKind.STEP_CONTAINS_REQUIREMENT}|${requirementKey}`, frozenEdge({ from: stepKey, to: requirementKey, kind: ExplanationEdgeKind.STEP_CONTAINS_REQUIREMENT }));
        materializeLinks(requirementNode, requirement as GapRequirementItem, nodes, edges, sources, unresolved, stepKeys);
      }
    }

    for (const source of input.gapEvaluation.pathProvenance.sourceReferences) {
      const id = source.id.toString();
      const exact = sources.get(id);
      if (exact === undefined) continue;
      const sourceKey = key(ExplanationNodeKind.SOURCE, id, exact.version.toString());
      nodes.set(sourceKey, frozenNode({ key: sourceKey, kind: ExplanationNodeKind.SOURCE, referenceId: id, referenceVersion: exact.version.toString(), gapState: null, verificationState: exact.verificationState.toString() }));
      edges.set(`${pathKey}|${ExplanationEdgeKind.SUPPORTED_BY_SOURCE}|${sourceKey}`, frozenEdge({ from: pathKey, to: sourceKey, kind: ExplanationEdgeKind.SUPPORTED_BY_SOURCE }));
      if (exact.verificationState.toString() !== VerificationStateCode.VERIFIED) {
        const fact = frozenFact({ code: ExplanationUnresolvedFactCode.SOURCE_VERIFICATION_REVIEW_REQUIRED, targetKey: pathKey, referenceId: id });
        unresolved.set(`${fact.code}|${fact.targetKey}|${id}`, fact);
      }
    }

    return new CatalogQueryExplanationGraph(input, [...nodes.values()], [...edges.values()], [...unresolved.values()]);
  }

  nodesOfKind(kindValue: ExplanationNodeKind): readonly ExplanationGraphNode[] {
    return Object.freeze(this.nodes.filter((node) => node.kind === kindValue));
  }

  edgesFrom(nodeKey: string): readonly ExplanationGraphEdge[] {
    return Object.freeze(this.edges.filter((edge) => edge.from === nodeKey));
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      gapEvaluationId: this.gapEvaluationId,
      subject: { ...this.subject },
      qualificationPath: { id: this.qualificationPathId, version: this.qualificationPathVersion },
      jurisdiction: this.jurisdiction,
      effectiveOn: this.effectiveOn,
      evaluatedAt: this.evaluatedAt.toJSON(),
      classification: this.classification,
      nodes: this.nodes.map((node) => ({ ...node })),
      edges: this.edges.map((edge) => ({ ...edge })),
      unresolvedFacts: this.unresolvedFacts.map((fact) => ({ ...fact })),
    };
  }
}
