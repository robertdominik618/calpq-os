import { EvidenceId, GapEvaluationId, SourceId } from '../ids.ts';
import { Jurisdiction } from '../jurisdiction.ts';
import { SubjectReference } from '../party-references.ts';
import { DomainOutcome } from '../result/domain-evaluation-result.ts';
import { DateOnly, UtcInstant } from '../time.ts';
import { VersionId } from '../version.ts';
import { CatalogProvenanceBinding, CatalogProvenanceTargetKind } from './catalog-provenance-binding.ts';
import { CredentialDefinition, RequirementDefinition } from './credential-requirement-catalog.ts';
import {
  EquivalenceEffectType,
  EquivalenceRule,
  EquivalenceRuleApplicationState,
  RecognitionDecision,
  RecognitionDecisionEffectType,
  RecognitionRoute,
  RecognitionRouteApplicationState,
} from './equivalence-recognition-review.ts';
import { EligibilityAssessment } from '../eligibility/eligibility-assessment.ts';
import {
  QualificationPathDefinition,
  QualificationPathStep,
  QualificationPathStepType,
} from './qualification-path.ts';
import { GovernedRequirementSetVersion } from './requirement-set-versioning.ts';

function sameSubject(left: SubjectReference, right: SubjectReference): boolean {
  return left.id.toString() === right.id.toString() && left.kind === right.kind;
}

function sameJurisdiction(left: Jurisdiction, right: Jurisdiction): boolean {
  return left.toString() === right.toString();
}

function controlledCode(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 160) throw new RangeError(`${label} is too long`);
  if (!/^[A-Z0-9][A-Z0-9._:-]*$/.test(normalized)) {
    throw new TypeError(`${label} must use controlled uppercase machine-code characters`);
  }
  return normalized;
}

function normalizeCodes(values: readonly string[], label: string): readonly string[] {
  if (!Array.isArray(values)) throw new TypeError(`${label} must be an array`);
  const normalized = values.map((value) => controlledCode(value, label)).sort();
  return Object.freeze([...new Set(normalized)]);
}

function normalizeSourceIds(values: readonly SourceId[]): readonly SourceId[] {
  if (values.some((value) => !(value instanceof SourceId))) throw new TypeError('Gap source IDs must use SourceId');
  const byId = new Map(values.map((value) => [value.toString(), value]));
  return Object.freeze([...byId.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value));
}

function normalizeEvidenceIds(values: readonly EvidenceId[]): readonly EvidenceId[] {
  if (values.some((value) => !(value instanceof EvidenceId))) throw new TypeError('Gap evidence IDs must use EvidenceId');
  const byId = new Map(values.map((value) => [value.toString(), value]));
  return Object.freeze([...byId.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value));
}

export const GapItemState = {
  ALREADY_SATISFIED: 'ALREADY_SATISFIED',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
  RECOGNITION_POSSIBLE: 'RECOGNITION_POSSIBLE',
  INFORMATION_MISSING: 'INFORMATION_MISSING',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
} as const;
export type GapItemState = (typeof GapItemState)[keyof typeof GapItemState];

export const GapRuleReferenceKind = {
  QUALIFICATION_PATH: 'QUALIFICATION_PATH',
  REQUIREMENT_SET: 'REQUIREMENT_SET',
  ELIGIBILITY_ASSESSMENT: 'ELIGIBILITY_ASSESSMENT',
  EQUIVALENCE_RULE: 'EQUIVALENCE_RULE',
  RECOGNITION_ROUTE: 'RECOGNITION_ROUTE',
  RECOGNITION_DECISION: 'RECOGNITION_DECISION',
} as const;
export type GapRuleReferenceKind = (typeof GapRuleReferenceKind)[keyof typeof GapRuleReferenceKind];

export interface GapRuleReference {
  readonly kind: GapRuleReferenceKind;
  readonly id: string;
  readonly version: string;
}

function ruleReference(kind: GapRuleReferenceKind, id: string, version: VersionId): GapRuleReference {
  return Object.freeze({ kind, id, version: version.toString() });
}

function normalizeRuleReferences(values: readonly GapRuleReference[]): readonly GapRuleReference[] {
  const byKey = new Map<string, GapRuleReference>();
  for (const value of values) {
    const key = `${value.kind}|${value.id}|${value.version}`;
    byKey.set(key, Object.freeze({ ...value }));
  }
  return Object.freeze([...byKey.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value));
}

function requirementIdentity(requirement: RequirementDefinition): string {
  return `${requirement.id.toString()}|${requirement.version.toString()}`;
}

function normalizeRequirements(values: readonly RequirementDefinition[]): readonly RequirementDefinition[] {
  const byKey = new Map<string, RequirementDefinition>();
  for (const value of values) {
    if (!(value instanceof RequirementDefinition)) throw new TypeError('Residual gaps must use RequirementDefinition');
    byKey.set(requirementIdentity(value), value);
  }
  return Object.freeze([...byKey.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([, value]) => value));
}

function mapDomainOutcome(outcome: DomainOutcome): GapItemState {
  switch (outcome) {
    case DomainOutcome.SATISFIED: return GapItemState.ALREADY_SATISFIED;
    case DomainOutcome.NOT_SATISFIED: return GapItemState.ACTION_REQUIRED;
    case DomainOutcome.INDETERMINATE: return GapItemState.INFORMATION_MISSING;
    case DomainOutcome.REVIEW_REQUIRED: return GapItemState.REVIEW_REQUIRED;
  }
}

function gapReasonForOutcome(outcome: DomainOutcome): string {
  switch (outcome) {
    case DomainOutcome.SATISFIED: return 'GAP.ELIGIBILITY_SATISFIED';
    case DomainOutcome.NOT_SATISFIED: return 'GAP.ELIGIBILITY_NOT_SATISFIED';
    case DomainOutcome.INDETERMINATE: return 'GAP.ELIGIBILITY_INFORMATION_MISSING';
    case DomainOutcome.REVIEW_REQUIRED: return 'GAP.ELIGIBILITY_REVIEW_REQUIRED';
  }
}

function targetIsExactRequirement(target: CredentialDefinition | RequirementDefinition, requirement: RequirementDefinition): boolean {
  return target instanceof RequirementDefinition
    && target.id.toString() === requirement.id.toString()
    && target.version.toString() === requirement.version.toString();
}

function targetIsPathCredential(target: CredentialDefinition | RequirementDefinition, path: QualificationPathDefinition): boolean {
  return target instanceof CredentialDefinition
    && target.id.toString() === path.targetCredentialDefinition.id.toString()
    && target.version.toString() === path.targetCredentialDefinition.version.toString();
}

interface GapBasis {
  readonly state: GapItemState;
  readonly reasonCodes: readonly string[];
  readonly sourceReferenceIds: readonly SourceId[];
  readonly evidenceIds: readonly EvidenceId[];
  readonly ruleReferences: readonly GapRuleReference[];
  readonly residualRequirements: readonly RequirementDefinition[];
}

function withBasis(input: GapBasis, patch: Partial<GapBasis>): GapBasis {
  return {
    state: patch.state ?? input.state,
    reasonCodes: normalizeCodes(patch.reasonCodes ?? input.reasonCodes, 'Gap reason code'),
    sourceReferenceIds: normalizeSourceIds(patch.sourceReferenceIds ?? input.sourceReferenceIds),
    evidenceIds: normalizeEvidenceIds(patch.evidenceIds ?? input.evidenceIds),
    ruleReferences: normalizeRuleReferences(patch.ruleReferences ?? input.ruleReferences),
    residualRequirements: normalizeRequirements(patch.residualRequirements ?? input.residualRequirements),
  };
}

export class GapRequirementItem {
  readonly requirementDefinition: RequirementDefinition;
  readonly state: GapItemState;
  readonly reasonCodes: readonly string[];
  readonly sourceReferenceIds: readonly SourceId[];
  readonly evidenceIds: readonly EvidenceId[];
  readonly ruleReferences: readonly GapRuleReference[];
  readonly blockedByStepCodes: readonly string[];
  readonly residualRequirements: readonly RequirementDefinition[];

  constructor(input: {
    readonly requirementDefinition: RequirementDefinition;
    readonly basis: GapBasis;
    readonly blockedByStepCodes: readonly string[];
  }) {
    if (!(input.requirementDefinition instanceof RequirementDefinition)) {
      throw new TypeError('Gap requirement item requires RequirementDefinition');
    }
    this.requirementDefinition = input.requirementDefinition;
    this.state = input.basis.state;
    this.reasonCodes = normalizeCodes(input.basis.reasonCodes, 'Gap requirement reason code');
    this.sourceReferenceIds = normalizeSourceIds(input.basis.sourceReferenceIds);
    this.evidenceIds = normalizeEvidenceIds(input.basis.evidenceIds);
    this.ruleReferences = normalizeRuleReferences(input.basis.ruleReferences);
    this.blockedByStepCodes = normalizeCodes(input.blockedByStepCodes, 'Gap blocked-by step code');
    this.residualRequirements = normalizeRequirements(input.basis.residualRequirements);
    Object.freeze(this);
  }

  toJSON(): Record<string, unknown> {
    return {
      requirementDefinition: {
        id: this.requirementDefinition.id.toString(),
        version: this.requirementDefinition.version.toString(),
        code: this.requirementDefinition.code,
      },
      state: this.state,
      why: [...this.reasonCodes],
      sourceReferenceIds: this.sourceReferenceIds.map(String),
      evidenceIds: this.evidenceIds.map(String),
      ruleReferences: this.ruleReferences.map((value) => ({ ...value })),
      blockedByStepCodes: [...this.blockedByStepCodes],
      residualRequirements: this.residualRequirements.map((requirement) => ({
        id: requirement.id.toString(),
        version: requirement.version.toString(),
        code: requirement.code,
      })),
    };
  }
}

export class GapStepItem {
  readonly step: QualificationPathStep;
  readonly state: GapItemState;
  readonly reasonCodes: readonly string[];
  readonly sourceReferenceIds: readonly SourceId[];
  readonly evidenceIds: readonly EvidenceId[];
  readonly ruleReferences: readonly GapRuleReference[];
  readonly blockedByStepCodes: readonly string[];
  readonly requirementItems: readonly GapRequirementItem[];
  readonly residualRequirements: readonly RequirementDefinition[];

  constructor(input: {
    readonly step: QualificationPathStep;
    readonly basis: GapBasis;
    readonly blockedByStepCodes: readonly string[];
    readonly requirementItems?: readonly GapRequirementItem[];
  }) {
    if (!(input.step instanceof QualificationPathStep)) throw new TypeError('Gap step item requires QualificationPathStep');
    this.step = input.step;
    this.state = input.basis.state;
    this.reasonCodes = normalizeCodes(input.basis.reasonCodes, 'Gap step reason code');
    this.sourceReferenceIds = normalizeSourceIds(input.basis.sourceReferenceIds);
    this.evidenceIds = normalizeEvidenceIds(input.basis.evidenceIds);
    this.ruleReferences = normalizeRuleReferences(input.basis.ruleReferences);
    this.blockedByStepCodes = normalizeCodes(input.blockedByStepCodes, 'Gap blocked-by step code');
    this.requirementItems = Object.freeze([...(input.requirementItems ?? [])]);
    this.residualRequirements = normalizeRequirements(input.basis.residualRequirements);
    Object.freeze(this);
  }

  withNotApplicable(reasonCode: string): GapStepItem {
    const basis: GapBasis = {
      state: GapItemState.NOT_APPLICABLE,
      reasonCodes: normalizeCodes([...this.reasonCodes, reasonCode], 'Gap step reason code'),
      sourceReferenceIds: this.sourceReferenceIds,
      evidenceIds: this.evidenceIds,
      ruleReferences: this.ruleReferences,
      residualRequirements: this.residualRequirements,
    };
    return new GapStepItem({
      step: this.step,
      basis,
      blockedByStepCodes: this.blockedByStepCodes,
      requirementItems: this.requirementItems,
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      step: this.step.toJSON(),
      state: this.state,
      why: [...this.reasonCodes],
      sourceReferenceIds: this.sourceReferenceIds.map(String),
      evidenceIds: this.evidenceIds.map(String),
      ruleReferences: this.ruleReferences.map((value) => ({ ...value })),
      blockedByStepCodes: [...this.blockedByStepCodes],
      requirementItems: this.requirementItems.map((item) => item.toJSON()),
      residualRequirements: this.residualRequirements.map((requirement) => ({
        id: requirement.id.toString(),
        version: requirement.version.toString(),
        code: requirement.code,
      })),
    };
  }
}

export interface GapPathMetrics {
  readonly alreadySatisfiedSteps: number;
  readonly actionRequiredSteps: number;
  readonly recognitionPossibleSteps: number;
  readonly informationMissingSteps: number;
  readonly reviewRequiredSteps: number;
  readonly notApplicableSteps: number;
  readonly unresolvedPrerequisiteLinks: number;
  readonly residualRequirementCount: number;
}

function pathMetrics(items: readonly GapStepItem[]): GapPathMetrics {
  const count = (state: GapItemState): number => items.filter((item) => item.state === state).length;
  const residual = new Set(items.flatMap((item) => item.residualRequirements.map(requirementIdentity)));
  return Object.freeze({
    alreadySatisfiedSteps: count(GapItemState.ALREADY_SATISFIED),
    actionRequiredSteps: count(GapItemState.ACTION_REQUIRED),
    recognitionPossibleSteps: count(GapItemState.RECOGNITION_POSSIBLE),
    informationMissingSteps: count(GapItemState.INFORMATION_MISSING),
    reviewRequiredSteps: count(GapItemState.REVIEW_REQUIRED),
    notApplicableSteps: count(GapItemState.NOT_APPLICABLE),
    unresolvedPrerequisiteLinks: items.reduce((sum, item) => sum + item.blockedByStepCodes.length, 0),
    residualRequirementCount: residual.size,
  });
}

function isResolvedForPrerequisite(item: GapStepItem): boolean {
  return item.state === GapItemState.ALREADY_SATISFIED || item.state === GapItemState.NOT_APPLICABLE;
}

function assessmentKey(set: GovernedRequirementSetVersion): string {
  return `${set.id.toString()}|${set.version.toString()}`;
}

function exactAssessmentFor(
  governedSet: GovernedRequirementSetVersion,
  byKey: ReadonlyMap<string, EligibilityAssessment>,
): EligibilityAssessment | null {
  return byKey.get(assessmentKey(governedSet)) ?? null;
}

function evidenceIds(assessment: EligibilityAssessment | null): readonly EvidenceId[] {
  return assessment === null
    ? Object.freeze([])
    : normalizeEvidenceIds(assessment.evidenceSnapshot.entries.map((entry) => entry.evidenceId));
}

function sourceIdsFromAssessment(assessment: EligibilityAssessment | null): readonly SourceId[] {
  return assessment === null
    ? Object.freeze([])
    : normalizeSourceIds(assessment.provenance.sources.map((source) => source.id));
}

function requirementRules(
  requirement: RequirementDefinition,
  rules: readonly EquivalenceRule[],
): readonly EquivalenceRule[] {
  return rules.filter((rule) => targetIsExactRequirement(rule.target, requirement));
}

function requirementDecisions(
  requirement: RequirementDefinition,
  decisions: readonly RecognitionDecision[],
): readonly RecognitionDecision[] {
  return decisions.filter((decision) => targetIsExactRequirement(decision.target, requirement));
}

function applyDecisionToRequirement(base: GapBasis, decisions: readonly RecognitionDecision[]): GapBasis {
  if (base.state === GapItemState.ALREADY_SATISFIED || decisions.length === 0) return base;
  if (decisions.length > 1) {
    return withBasis(base, {
      state: GapItemState.REVIEW_REQUIRED,
      reasonCodes: [...base.reasonCodes, 'GAP.MULTIPLE_RECOGNITION_DECISIONS'],
      sourceReferenceIds: [...base.sourceReferenceIds, ...decisions.flatMap((value) => value.sourceReferences.map((source) => source.id))],
      ruleReferences: [...base.ruleReferences, ...decisions.map((value) => ruleReference(
        GapRuleReferenceKind.RECOGNITION_DECISION,
        value.id.toString(),
        value.provenance.ruleVersion,
      ))],
    });
  }
  const decision = decisions[0];
  if (decision === undefined) return base;
  const common = {
    sourceReferenceIds: [...base.sourceReferenceIds, ...decision.sourceReferences.map((source) => source.id)],
    ruleReferences: [...base.ruleReferences, ruleReference(
      GapRuleReferenceKind.RECOGNITION_DECISION,
      decision.id.toString(),
      decision.provenance.ruleVersion,
    )],
  };
  if (decision.effectType === RecognitionDecisionEffectType.FULL_SUBSTITUTION
      || decision.effectType === RecognitionDecisionEffectType.REQUIREMENT_EXEMPTION) {
    return withBasis(base, { ...common, state: GapItemState.ALREADY_SATISFIED, reasonCodes: [...base.reasonCodes, 'GAP.RECOGNITION_DECISION_SATISFIES_REQUIREMENT'] });
  }
  if (decision.effectType === RecognitionDecisionEffectType.PARTIAL_SUBSTITUTION
      || decision.effectType === RecognitionDecisionEffectType.CREDIT_OR_REDUCTION) {
    return withBasis(base, {
      ...common,
      state: GapItemState.ACTION_REQUIRED,
      reasonCodes: [...base.reasonCodes, 'GAP.PARTIAL_RECOGNITION_RESIDUAL_REQUIRED'],
      residualRequirements: [...base.residualRequirements, ...decision.residualRequirements],
    });
  }
  return withBasis(base, { ...common, reasonCodes: [...base.reasonCodes, 'GAP.RECOGNITION_DECISION_NO_EQUIVALENCE'] });
}

function applyRuleToRequirement(base: GapBasis, rules: readonly EquivalenceRule[]): GapBasis {
  if (base.state === GapItemState.ALREADY_SATISFIED || rules.length === 0) return base;
  if (rules.length > 1) {
    return withBasis(base, {
      state: GapItemState.REVIEW_REQUIRED,
      reasonCodes: [...base.reasonCodes, 'GAP.MULTIPLE_EQUIVALENCE_RULES'],
      sourceReferenceIds: [...base.sourceReferenceIds, ...rules.flatMap((value) => value.sourceReferences.map((source) => source.id))],
      ruleReferences: [...base.ruleReferences, ...rules.map((value) => ruleReference(
        GapRuleReferenceKind.EQUIVALENCE_RULE,
        value.id.toString(),
        value.provenance.ruleVersion,
      ))],
    });
  }
  const rule = rules[0];
  if (rule === undefined) return base;
  const common = {
    sourceReferenceIds: [...base.sourceReferenceIds, ...rule.sourceReferences.map((source) => source.id)],
    ruleReferences: [...base.ruleReferences, ruleReference(
      GapRuleReferenceKind.EQUIVALENCE_RULE,
      rule.id.toString(),
      rule.provenance.ruleVersion,
    )],
  };
  const state = rule.applicationState(DateOnly.from(rule.effectivePeriod.effectiveFrom.toString()), rule.jurisdiction);
  if (state === EquivalenceRuleApplicationState.SOURCE_REVIEW_REQUIRED || rule.effectType === EquivalenceEffectType.REVIEW_REQUIRED) {
    return withBasis(base, { ...common, state: GapItemState.REVIEW_REQUIRED, reasonCodes: [...base.reasonCodes, 'GAP.EQUIVALENCE_REVIEW_REQUIRED'] });
  }
  if (rule.effectType === EquivalenceEffectType.RECOGNITION_ROUTE_ONLY) {
    return withBasis(base, { ...common, state: GapItemState.RECOGNITION_POSSIBLE, reasonCodes: [...base.reasonCodes, 'GAP.RECOGNITION_ROUTE_REQUIRED'] });
  }
  if (rule.effectType === EquivalenceEffectType.FULL_SUBSTITUTION || rule.effectType === EquivalenceEffectType.REQUIREMENT_EXEMPTION) {
    return withBasis(base, { ...common, state: GapItemState.ALREADY_SATISFIED, reasonCodes: [...base.reasonCodes, 'GAP.EQUIVALENCE_SATISFIES_REQUIREMENT'] });
  }
  if (rule.effectType === EquivalenceEffectType.PARTIAL_SUBSTITUTION || rule.effectType === EquivalenceEffectType.CREDIT_OR_REDUCTION) {
    return withBasis(base, {
      ...common,
      state: GapItemState.ACTION_REQUIRED,
      reasonCodes: [...base.reasonCodes, 'GAP.PARTIAL_EQUIVALENCE_RESIDUAL_REQUIRED'],
      residualRequirements: [...base.residualRequirements, ...rule.residualRequirements],
    });
  }
  return withBasis(base, { ...common, reasonCodes: [...base.reasonCodes, 'GAP.NO_EQUIVALENCE'] });
}

function requirementItem(
  requirement: RequirementDefinition,
  governedSet: GovernedRequirementSetVersion,
  assessment: EligibilityAssessment | null,
  rules: readonly EquivalenceRule[],
  decisions: readonly RecognitionDecision[],
  path: QualificationPathDefinition,
): GapRequirementItem {
  const atomic = assessment?.atomicResults.find((result) => result.requirementId.toString() === requirement.code) ?? null;
  let basis: GapBasis = {
    state: atomic === null ? GapItemState.INFORMATION_MISSING : mapDomainOutcome(atomic.outcome),
    reasonCodes: atomic === null
      ? ['GAP.ELIGIBILITY_ASSESSMENT_MISSING']
      : [gapReasonForOutcome(atomic.outcome), ...atomic.reasonCodes],
    sourceReferenceIds: normalizeSourceIds([
      ...path.sourceReferenceIds,
      ...governedSet.sourceReferenceIds,
      ...requirement.sourceReferenceIds,
      ...sourceIdsFromAssessment(assessment),
    ]),
    evidenceIds: evidenceIds(assessment),
    ruleReferences: normalizeRuleReferences([
      ruleReference(GapRuleReferenceKind.QUALIFICATION_PATH, path.id.toString(), path.version),
      ruleReference(GapRuleReferenceKind.REQUIREMENT_SET, governedSet.id.toString(), governedSet.version),
      ...(assessment === null ? [] : [ruleReference(
        GapRuleReferenceKind.ELIGIBILITY_ASSESSMENT,
        assessment.id.toString(),
        assessment.requirementSetVersion,
      )]),
    ]),
    residualRequirements: Object.freeze([]),
  };

  const matchingDecisions = requirementDecisions(requirement, decisions);
  basis = applyDecisionToRequirement(basis, matchingDecisions);
  if (matchingDecisions.length === 0) {
    basis = applyRuleToRequirement(basis, requirementRules(requirement, rules));
  }
  return new GapRequirementItem({ requirementDefinition: requirement, basis, blockedByStepCodes: [] });
}

function credentialDecisions(path: QualificationPathDefinition, decisions: readonly RecognitionDecision[]): readonly RecognitionDecision[] {
  return decisions.filter((decision) => targetIsPathCredential(decision.target, path));
}

function credentialRules(path: QualificationPathDefinition, rules: readonly EquivalenceRule[]): readonly EquivalenceRule[] {
  return rules.filter((rule) => targetIsPathCredential(rule.target, path));
}

function stepBasis(
  step: QualificationPathStep,
  path: QualificationPathDefinition,
  assessment: EligibilityAssessment | null,
  rules: readonly EquivalenceRule[],
  routes: readonly RecognitionRoute[],
  decisions: readonly RecognitionDecision[],
): GapBasis {
  const baseSources = normalizeSourceIds([
    ...path.sourceReferenceIds,
    ...step.sourceReferenceIds,
    ...sourceIdsFromAssessment(assessment),
  ]);
  const baseRules = normalizeRuleReferences([
    ruleReference(GapRuleReferenceKind.QUALIFICATION_PATH, path.id.toString(), path.version),
    ...(assessment === null ? [] : [ruleReference(
      GapRuleReferenceKind.ELIGIBILITY_ASSESSMENT,
      assessment.id.toString(),
      assessment.requirementSetVersion,
    )]),
  ]);

  if (step.type === QualificationPathStepType.SATISFY_REQUIREMENT_SET) {
    if (assessment === null) {
      return {
        state: GapItemState.INFORMATION_MISSING,
        reasonCodes: Object.freeze(['GAP.ELIGIBILITY_ASSESSMENT_MISSING']),
        sourceReferenceIds: baseSources,
        evidenceIds: Object.freeze([]),
        ruleReferences: baseRules,
        residualRequirements: Object.freeze([]),
      };
    }
    return {
      state: mapDomainOutcome(assessment.outcome),
      reasonCodes: Object.freeze([gapReasonForOutcome(assessment.outcome)]),
      sourceReferenceIds: baseSources,
      evidenceIds: evidenceIds(assessment),
      ruleReferences: baseRules,
      residualRequirements: Object.freeze([]),
    };
  }

  const pathDecisions = credentialDecisions(path, decisions);
  const pathRules = credentialRules(path, rules);
  const routeStates = routes.map((route) => route.applicationState(DateOnly.from(path.effectivePeriod.effectiveFrom.toString()), path.jurisdiction));
  const routeReview = routeStates.includes(RecognitionRouteApplicationState.REVIEW_REQUIRED)
    || routeStates.includes(RecognitionRouteApplicationState.SOURCE_REVIEW_REQUIRED);
  const routeAvailable = routeStates.includes(RecognitionRouteApplicationState.ROUTE_AVAILABLE);
  const recognitionSources = normalizeSourceIds([
    ...baseSources,
    ...routes.flatMap((route) => route.sourceReferences.map((source) => source.id)),
    ...pathDecisions.flatMap((decision) => decision.sourceReferences.map((source) => source.id)),
    ...pathRules.flatMap((rule) => rule.sourceReferences.map((source) => source.id)),
  ]);
  const recognitionRefs = normalizeRuleReferences([
    ...baseRules,
    ...routes.map((route) => ruleReference(GapRuleReferenceKind.RECOGNITION_ROUTE, route.id.toString(), route.provenance.ruleVersion)),
    ...pathDecisions.map((decision) => ruleReference(GapRuleReferenceKind.RECOGNITION_DECISION, decision.id.toString(), decision.provenance.ruleVersion)),
    ...pathRules.map((rule) => ruleReference(GapRuleReferenceKind.EQUIVALENCE_RULE, rule.id.toString(), rule.provenance.ruleVersion)),
  ]);

  if (step.type === QualificationPathStepType.REQUEST_RECOGNITION) {
    if (pathDecisions.length === 1) {
      return { state: GapItemState.ALREADY_SATISFIED, reasonCodes: Object.freeze(['GAP.RECOGNITION_DECISION_ALREADY_EXISTS']), sourceReferenceIds: recognitionSources, evidenceIds: Object.freeze([]), ruleReferences: recognitionRefs, residualRequirements: normalizeRequirements(pathDecisions[0]?.residualRequirements ?? []) };
    }
    if (pathDecisions.length > 1 || routeReview) {
      return { state: GapItemState.REVIEW_REQUIRED, reasonCodes: Object.freeze(['GAP.RECOGNITION_REVIEW_REQUIRED']), sourceReferenceIds: recognitionSources, evidenceIds: Object.freeze([]), ruleReferences: recognitionRefs, residualRequirements: Object.freeze([]) };
    }
    if (routeAvailable || pathRules.some((rule) => rule.effectType === EquivalenceEffectType.RECOGNITION_ROUTE_ONLY)) {
      return { state: GapItemState.RECOGNITION_POSSIBLE, reasonCodes: Object.freeze(['GAP.RECOGNITION_ROUTE_AVAILABLE']), sourceReferenceIds: recognitionSources, evidenceIds: Object.freeze([]), ruleReferences: recognitionRefs, residualRequirements: Object.freeze([]) };
    }
  }

  if (step.type === QualificationPathStepType.OBTAIN_AUTHORITY_DECISION && pathDecisions.length === 1) {
    return { state: GapItemState.ALREADY_SATISFIED, reasonCodes: Object.freeze(['GAP.AUTHORITY_DECISION_ALREADY_EXISTS']), sourceReferenceIds: recognitionSources, evidenceIds: Object.freeze([]), ruleReferences: recognitionRefs, residualRequirements: normalizeRequirements(pathDecisions[0]?.residualRequirements ?? []) };
  }

  if (step.type === QualificationPathStepType.OBTAIN_CREDENTIAL && pathDecisions.length === 1) {
    const decision = pathDecisions[0];
    if (decision?.effectType === RecognitionDecisionEffectType.FULL_SUBSTITUTION) {
      return { state: GapItemState.ALREADY_SATISFIED, reasonCodes: Object.freeze(['GAP.RECOGNIZED_CREDENTIAL_SATISFIED']), sourceReferenceIds: recognitionSources, evidenceIds: Object.freeze([]), ruleReferences: recognitionRefs, residualRequirements: Object.freeze([]) };
    }
    if (decision?.effectType === RecognitionDecisionEffectType.PARTIAL_SUBSTITUTION || decision?.effectType === RecognitionDecisionEffectType.CREDIT_OR_REDUCTION) {
      return { state: GapItemState.ACTION_REQUIRED, reasonCodes: Object.freeze(['GAP.PARTIAL_RECOGNITION_RESIDUAL_REQUIRED']), sourceReferenceIds: recognitionSources, evidenceIds: Object.freeze([]), ruleReferences: recognitionRefs, residualRequirements: normalizeRequirements(decision.residualRequirements) };
    }
  }

  if (routeReview) {
    return { state: GapItemState.REVIEW_REQUIRED, reasonCodes: Object.freeze(['GAP.RECOGNITION_REVIEW_REQUIRED']), sourceReferenceIds: recognitionSources, evidenceIds: Object.freeze([]), ruleReferences: recognitionRefs, residualRequirements: Object.freeze([]) };
  }

  return {
    state: GapItemState.ACTION_REQUIRED,
    reasonCodes: Object.freeze(['GAP.PATH_STEP_ACTION_REQUIRED']),
    sourceReferenceIds: recognitionSources,
    evidenceIds: Object.freeze([]),
    ruleReferences: recognitionRefs,
    residualRequirements: Object.freeze([]),
  };
}

function validateInputs(input: GapNavigatorEvaluationInput): ReadonlyMap<string, EligibilityAssessment> {
  if (!(input.id instanceof GapEvaluationId)) throw new TypeError('Gap evaluation requires GapEvaluationId');
  if (!(input.subject instanceof SubjectReference)) throw new TypeError('Gap evaluation requires SubjectReference');
  if (!(input.path instanceof QualificationPathDefinition)) throw new TypeError('Gap evaluation requires QualificationPathDefinition');
  if (!(input.pathProvenance instanceof CatalogProvenanceBinding)) throw new TypeError('Gap evaluation requires CatalogProvenanceBinding');
  if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Gap evaluation requires controlled Jurisdiction');
  if (!(input.effectiveOn instanceof DateOnly)) throw new TypeError('Gap evaluation requires explicit DateOnly');
  if (!(input.evaluatedAt instanceof UtcInstant)) throw new TypeError('Gap evaluation requires explicit UtcInstant');
  if (!input.path.isEffectiveOn(input.effectiveOn, input.jurisdiction)) throw new TypeError('Gap evaluation path is not applicable to exact jurisdiction/date');
  if (input.pathProvenance.targetKind !== CatalogProvenanceTargetKind.QUALIFICATION_PATH
      || input.pathProvenance.targetId !== input.path.id.toString()
      || input.pathProvenance.targetVersion.toString() !== input.path.version.toString()) {
    throw new TypeError('Gap evaluation provenance must bind the exact QualificationPath version');
  }
  if (input.evaluatedAt.toEpochMilliseconds() < input.pathProvenance.provenance.evaluatedAt.toEpochMilliseconds()) {
    throw new RangeError('Gap evaluation cannot predate path provenance');
  }

  const governedSets = input.path.steps.flatMap((step) => step.requirementSetVersion === null ? [] : [step.requirementSetVersion]);
  const setVersionsById = new Map<string, Set<string>>();
  for (const set of governedSets) {
    const id = set.id.toString();
    const versions = setVersionsById.get(id) ?? new Set<string>();
    versions.add(set.version.toString());
    setVersionsById.set(id, versions);
  }

  const byKey = new Map<string, EligibilityAssessment>();
  for (const assessment of input.eligibilityAssessments) {
    if (!(assessment instanceof EligibilityAssessment)) throw new TypeError('Gap eligibility inputs must use EligibilityAssessment');
    if (!sameSubject(assessment.subject, input.subject)) throw new TypeError('Gap eligibility assessment subject must match exact gap subject');
    if (assessment.evaluatedAt.toEpochMilliseconds() > input.evaluatedAt.toEpochMilliseconds()) throw new RangeError('Gap evaluation cannot predate eligibility assessment');
    const id = assessment.requirementSetId.toString();
    const versions = setVersionsById.get(id);
    if (versions === undefined) throw new TypeError('Gap eligibility assessment does not belong to the selected QualificationPath');
    if (!versions.has(assessment.requirementSetVersion.toString())) throw new TypeError('Gap eligibility assessment RequirementSet version must match exact path version');
    const key = `${id}|${assessment.requirementSetVersion.toString()}`;
    if (byKey.has(key)) throw new TypeError('Gap evaluation requires at most one selected EligibilityAssessment per exact RequirementSet version');
    byKey.set(key, assessment);
  }

  for (const rule of input.equivalenceRules ?? []) {
    if (!(rule instanceof EquivalenceRule)) throw new TypeError('Gap equivalence inputs must use EquivalenceRule');
    const state = rule.applicationState(input.effectiveOn, input.jurisdiction);
    if (state === EquivalenceRuleApplicationState.INAPPLICABLE_DATE || state === EquivalenceRuleApplicationState.INAPPLICABLE_JURISDICTION) {
      throw new TypeError('Gap equivalence input is outside exact jurisdiction/date');
    }
    if (rule.provenance.evaluatedAt.toEpochMilliseconds() > input.evaluatedAt.toEpochMilliseconds()) throw new RangeError('Gap evaluation cannot predate equivalence provenance');
  }

  for (const route of input.recognitionRoutes ?? []) {
    if (!(route instanceof RecognitionRoute)) throw new TypeError('Gap recognition route inputs must use RecognitionRoute');
    const state = route.applicationState(input.effectiveOn, input.jurisdiction);
    if (state === RecognitionRouteApplicationState.INAPPLICABLE_DATE || state === RecognitionRouteApplicationState.INAPPLICABLE_JURISDICTION) {
      throw new TypeError('Gap recognition route is outside exact jurisdiction/date');
    }
    if (route.targetCredentialDefinition.id.toString() !== input.path.targetCredentialDefinition.id.toString()
        || route.targetCredentialDefinition.version.toString() !== input.path.targetCredentialDefinition.version.toString()) {
      throw new TypeError('Gap recognition route target must match exact path credential version');
    }
    if (route.provenance.evaluatedAt.toEpochMilliseconds() > input.evaluatedAt.toEpochMilliseconds()) throw new RangeError('Gap evaluation cannot predate recognition-route provenance');
  }

  const pathRequirementIdentities = new Set(governedSets.flatMap((set) => set.requirementDefinitions.map(requirementIdentity)));
  for (const decision of input.recognitionDecisions ?? []) {
    if (!(decision instanceof RecognitionDecision)) throw new TypeError('Gap recognition decision inputs must use RecognitionDecision');
    if (!sameSubject(decision.subject, input.subject)) throw new TypeError('Gap recognition decision subject must match exact gap subject');
    if (!decision.isEffectiveOn(input.effectiveOn, input.jurisdiction)) throw new TypeError('Gap recognition decision is outside exact jurisdiction/date');
    const targetIsRequirement = decision.target instanceof RequirementDefinition && pathRequirementIdentities.has(requirementIdentity(decision.target));
    if (!targetIsRequirement && !targetIsPathCredential(decision.target, input.path)) {
      throw new TypeError('Gap recognition decision target is outside selected path');
    }
    if (decision.provenance.evaluatedAt.toEpochMilliseconds() > input.evaluatedAt.toEpochMilliseconds()) throw new RangeError('Gap evaluation cannot predate recognition-decision provenance');
  }
  return byKey;
}

export interface GapNavigatorEvaluationInput {
  readonly id: GapEvaluationId;
  readonly subject: SubjectReference;
  readonly path: QualificationPathDefinition;
  readonly pathProvenance: CatalogProvenanceBinding;
  readonly jurisdiction: Jurisdiction;
  readonly effectiveOn: DateOnly;
  readonly evaluatedAt: UtcInstant;
  readonly eligibilityAssessments: readonly EligibilityAssessment[];
  readonly equivalenceRules?: readonly EquivalenceRule[];
  readonly recognitionRoutes?: readonly RecognitionRoute[];
  readonly recognitionDecisions?: readonly RecognitionDecision[];
}

export class GapNavigatorEvaluation {
  readonly id: GapEvaluationId;
  readonly subject: SubjectReference;
  readonly path: QualificationPathDefinition;
  readonly jurisdiction: Jurisdiction;
  readonly effectiveOn: DateOnly;
  readonly evaluatedAt: UtcInstant;
  readonly pathProvenance: CatalogProvenanceBinding;
  readonly items: readonly GapStepItem[];
  readonly metrics: GapPathMetrics;
  readonly complete: boolean;

  private constructor(input: GapNavigatorEvaluationInput, items: readonly GapStepItem[]) {
    this.id = input.id;
    this.subject = input.subject;
    this.path = input.path;
    this.jurisdiction = input.jurisdiction;
    this.effectiveOn = input.effectiveOn;
    this.evaluatedAt = input.evaluatedAt;
    this.pathProvenance = input.pathProvenance;
    this.items = Object.freeze([...items]);
    this.metrics = pathMetrics(this.items);
    this.complete = this.items.every((item) => item.state === GapItemState.ALREADY_SATISFIED || item.state === GapItemState.NOT_APPLICABLE)
      && this.metrics.residualRequirementCount === 0;
    Object.freeze(this);
  }

  static evaluate(input: GapNavigatorEvaluationInput): GapNavigatorEvaluation {
    const assessments = validateInputs(input);
    const rules = Object.freeze([...(input.equivalenceRules ?? [])]);
    const routes = Object.freeze([...(input.recognitionRoutes ?? [])]);
    const decisions = Object.freeze([...(input.recognitionDecisions ?? [])]);
    const sourceReviewRequired = input.pathProvenance.requiresSourceReview();

    let rawItems = input.path.steps.map((step) => {
      const governedSet = step.requirementSetVersion;
      const assessment = governedSet === null ? null : exactAssessmentFor(governedSet, assessments);
      let basis = stepBasis(step, input.path, assessment, rules, routes, decisions);
      let requirementItems: readonly GapRequirementItem[] = Object.freeze([]);

      if (governedSet !== null) {
        requirementItems = Object.freeze(governedSet.requirementDefinitions.map((requirement) =>
          requirementItem(requirement, governedSet, assessment, rules, decisions, input.path)));
        const residual = normalizeRequirements(requirementItems.flatMap((item) => item.residualRequirements));
        if (residual.length > 0) {
          basis = withBasis(basis, {
            residualRequirements: residual,
            reasonCodes: [...basis.reasonCodes, 'GAP.RESIDUAL_REQUIREMENTS_PRESERVED'],
          });
        }
        const differsFromAssessment = assessment !== null && requirementItems.some((item) => {
          const atomic = assessment.atomicResults.find((result) => result.requirementId.toString() === item.requirementDefinition.code);
          return atomic !== undefined && mapDomainOutcome(atomic.outcome) !== item.state;
        });
        if (differsFromAssessment && basis.state !== GapItemState.ALREADY_SATISFIED) {
          basis = withBasis(basis, { reasonCodes: [...basis.reasonCodes, 'GAP.ELIGIBILITY_REEVALUATION_REQUIRED'] });
        }
      }

      if (sourceReviewRequired) {
        basis = withBasis(basis, {
          state: GapItemState.REVIEW_REQUIRED,
          reasonCodes: [...basis.reasonCodes, 'GAP.PATH_SOURCE_REVIEW_REQUIRED'],
          sourceReferenceIds: [...basis.sourceReferenceIds, ...input.pathProvenance.sourceReferences.map((source) => source.id)],
        });
      }
      return new GapStepItem({ step, basis, blockedByStepCodes: [], requirementItems });
    });

    const byCodeBeforeAlternatives = new Map(rawItems.map((item) => [item.step.code, item]));
    rawItems = rawItems.map((item) => {
      const blockers = item.step.prerequisiteStepCodes.filter((code) => {
        const prerequisite = byCodeBeforeAlternatives.get(code);
        return prerequisite === undefined || !isResolvedForPrerequisite(prerequisite);
      });
      if (blockers.length === 0) return item;
      const basis: GapBasis = {
        state: item.state,
        reasonCodes: normalizeCodes([...item.reasonCodes, 'GAP.PREREQUISITE_UNRESOLVED'], 'Gap reason code'),
        sourceReferenceIds: item.sourceReferenceIds,
        evidenceIds: item.evidenceIds,
        ruleReferences: item.ruleReferences,
        residualRequirements: item.residualRequirements,
      };
      const requirements = item.requirementItems.map((requirement) => new GapRequirementItem({
        requirementDefinition: requirement.requirementDefinition,
        basis: {
          state: requirement.state,
          reasonCodes: normalizeCodes([...requirement.reasonCodes, 'GAP.PREREQUISITE_UNRESOLVED'], 'Gap reason code'),
          sourceReferenceIds: requirement.sourceReferenceIds,
          evidenceIds: requirement.evidenceIds,
          ruleReferences: requirement.ruleReferences,
          residualRequirements: requirement.residualRequirements,
        },
        blockedByStepCodes: blockers,
      }));
      return new GapStepItem({ step: item.step, basis, blockedByStepCodes: blockers, requirementItems: requirements });
    });

    const satisfiedAlternativeGroups = new Set(rawItems
      .filter((item) => item.step.alternativeGroupCode !== null && item.state === GapItemState.ALREADY_SATISFIED)
      .map((item) => item.step.alternativeGroupCode as string));
    const items = rawItems.map((item) => {
      const group = item.step.alternativeGroupCode;
      if (group !== null && satisfiedAlternativeGroups.has(group) && item.state !== GapItemState.ALREADY_SATISFIED) {
        return item.withNotApplicable('GAP.ALTERNATIVE_ALREADY_SATISFIED');
      }
      return item;
    });

    return new GapNavigatorEvaluation(input, items);
  }

  actionRequiredItems(): readonly GapStepItem[] {
    return Object.freeze(this.items.filter((item) => item.state !== GapItemState.ALREADY_SATISFIED && item.state !== GapItemState.NOT_APPLICABLE));
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      subject: this.subject.toJSON(),
      path: {
        id: this.path.id.toString(),
        version: this.path.version.toString(),
        targetCredentialDefinition: {
          id: this.path.targetCredentialDefinition.id.toString(),
          version: this.path.targetCredentialDefinition.version.toString(),
        },
      },
      jurisdiction: this.jurisdiction.toJSON(),
      effectiveOn: this.effectiveOn.toString(),
      evaluatedAt: this.evaluatedAt.toString(),
      pathProvenance: this.pathProvenance.toJSON(),
      items: this.items.map((item) => item.toJSON()),
      metrics: { ...this.metrics },
      complete: this.complete,
    };
  }
}

export interface GapPathComparisonEntry {
  readonly pathId: string;
  readonly pathVersion: string;
  readonly complete: boolean;
  readonly metrics: GapPathMetrics;
}

export class GapPathComparison {
  readonly entries: readonly GapPathComparisonEntry[];
  readonly advisoryOnly = true;
  readonly selectedPathId: null = null;

  constructor(evaluations: readonly GapNavigatorEvaluation[]) {
    if (!Array.isArray(evaluations) || evaluations.length < 2) throw new TypeError('Gap path comparison requires at least two evaluations');
    if (evaluations.some((value) => !(value instanceof GapNavigatorEvaluation))) throw new TypeError('Gap path comparison requires GapNavigatorEvaluation values');
    const keys = evaluations.map((value) => `${value.path.id.toString()}|${value.path.version.toString()}`);
    if (new Set(keys).size !== keys.length) throw new TypeError('Gap path comparison requires distinct path versions');
    this.entries = Object.freeze(evaluations
      .map((value) => Object.freeze({
        pathId: value.path.id.toString(),
        pathVersion: value.path.version.toString(),
        complete: value.complete,
        metrics: value.metrics,
      }))
      .sort((left, right) => `${left.pathId}|${left.pathVersion}`.localeCompare(`${right.pathId}|${right.pathVersion}`)));
    Object.freeze(this);
  }

  toJSON(): Record<string, unknown> {
    return { advisoryOnly: true, selectedPathId: null, entries: this.entries.map((entry) => ({ ...entry, metrics: { ...entry.metrics } })) };
  }
}

export function compareGapEvaluations(evaluations: readonly GapNavigatorEvaluation[]): GapPathComparison {
  return new GapPathComparison(evaluations);
}
