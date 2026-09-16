import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActorId,
  ActorKind,
  ActorReference,
  AtomicRequirementResult,
  CatalogEffectivePeriod,
  CatalogProvenanceBinding,
  ContentHash,
  CredentialDefinition,
  CredentialDefinitionId,
  CredentialDefinitionReference,
  DateOnly,
  DecisionId,
  DomainOutcome,
  EligibilityAssessment,
  EligibilityAssessmentId,
  EquivalenceEffectType,
  EquivalenceRule,
  EquivalenceRuleId,
  EquivalenceSourceObjectType,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  EvidenceSnapshot,
  GapEvaluationId,
  GapItemState,
  GapNavigatorEvaluation,
  GapRuleReferenceKind,
  GovernedRequirementSetVersion,
  Jurisdiction,
  ProvenanceEnvelope,
  QualificationPathDefinition,
  QualificationPathId,
  QualificationPathStep,
  QualificationPathStepType,
  RecognitionDecision,
  RecognitionDecisionEffectType,
  RecognitionRoute,
  RecognitionRouteId,
  RecognitionRouteKind,
  RequirementDefinition,
  RequirementDefinitionId,
  RequirementGroup,
  RequirementGroupMode,
  RequirementId,
  RequirementSet,
  RequirementSetId,
  RuleSetId,
  SourceId,
  SourceReference,
  SourceType,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
  VersionId,
  compareGapEvaluations,
} from '../src/index.ts';

const IDS = {
  sourceA: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7001',
  authority: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7002',
  process: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7003',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7004',
  otherSubject: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7005',
  ruleSet: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7006',
  pathProvDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7007',
  eligibilityDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7008',
  s06ProvDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7009',
  recognitionDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7010',
  targetCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7011',
  otherTargetCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7012',
  foreignCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7013',
  requirementA: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7014',
  requirementResidual: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7015',
  requirementSet: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7016',
  otherRequirementSet: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7017',
  path: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7018',
  otherPath: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7019',
  assessment: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7020',
  assessment2: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7021',
  evidenceA: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7022',
  evidenceB: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7023',
  gap: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7024',
  gap2: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7025',
  eqRule: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7026',
  eqRule2: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7027',
  route: '018f22e2-79b0-7cc3-98c4-dc0c0c0b7028',
} as const;

const cz = Jurisdiction.fromCode('CZ');
const eu = Jurisdiction.fromCode('EU');
const sourceAId = SourceId.from(IDS.sourceA);
const authority = ActorReference.create(ActorId.from(IDS.authority), ActorKind.EXTERNAL_AUTHORITY);
const processActor = ActorReference.create(ActorId.from(IDS.process), ActorKind.SYSTEM_PROCESS);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);
const otherSubject = SubjectReference.create(SubjectId.from(IDS.otherSubject), SubjectKind.PERSON);

function period(from = '2026-01-01', to: string | null = '2026-12-31'): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({ effectiveFrom: DateOnly.from(from), effectiveTo: to === null ? null : DateOnly.from(to) });
}

function source(options: { readonly verification?: VerificationStateCode; readonly version?: string } = {}): SourceReference {
  return SourceReference.create({
    id: sourceAId,
    authority,
    jurisdiction: cz,
    sourceType: SourceType.REGULATION,
    canonicalLocator: 'urn:calpq:m04:s07:source-a',
    version: VersionId.from(options.version ?? 'source-1'),
    publicationDate: DateOnly.from('2025-12-15'),
    effectiveFrom: DateOnly.from('2026-01-01'),
    effectiveTo: DateOnly.from('2026-12-31'),
    retrievedAt: UtcInstant.from('2026-01-02T09:00:00Z'),
    verificationState: VerificationState.from(options.verification ?? VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256('a'.repeat(64)),
  });
}

function credential(id = IDS.targetCredential, jurisdiction = cz, version = 'credential-1'): CredentialDefinition {
  return CredentialDefinition.create({
    id: CredentialDefinitionId.from(id),
    version: VersionId.from(version),
    code: `CRED.${id.slice(-4).toUpperCase()}`,
    preferredLabel: 'Governed target credential',
    aliases: [],
    description: 'M04 S07 governed credential.',
    jurisdiction,
    effectivePeriod: period(),
    sourceReferenceIds: [sourceAId],
  });
}

function requirement(id = IDS.requirementA, code = 'REQ.A'): RequirementDefinition {
  return RequirementDefinition.create({
    id: RequirementDefinitionId.from(id),
    version: VersionId.from('requirement-1'),
    code,
    preferredLabel: `Requirement ${code}`,
    aliases: [],
    description: 'M04 S07 governed requirement.',
    jurisdiction: cz,
    effectivePeriod: period(),
    sourceReferenceIds: [sourceAId],
  });
}

function governedSet(options: {
  readonly id?: string;
  readonly version?: string;
  readonly requirements?: readonly RequirementDefinition[];
} = {}): GovernedRequirementSetVersion {
  const target = credential();
  const requirements = options.requirements ?? [requirement()];
  const requirementIds = requirements.map((entry) => RequirementId.from(entry.code));
  const set = RequirementSet.create({
    id: RequirementSetId.from(options.id ?? IDS.requirementSet),
    version: VersionId.from(options.version ?? 'set-1'),
    credentialDefinition: CredentialDefinitionReference.create(target.id, target.version),
    requirementIds,
    groups: [RequirementGroup.create({ code: 'GROUP.ALL', mode: RequirementGroupMode.ALL, requirementIds })],
  });
  return GovernedRequirementSetVersion.create({
    requirementSet: set,
    credentialDefinition: target,
    requirementDefinitions: requirements,
    jurisdiction: cz,
    effectivePeriod: period(),
    sourceReferenceIds: [sourceAId],
  });
}

function step(code = 'STEP.REQUIREMENTS', set: GovernedRequirementSetVersion | null = governedSet(), options: {
  readonly type?: QualificationPathStepType;
  readonly prerequisites?: readonly string[];
  readonly alternativeGroup?: string | null;
} = {}): QualificationPathStep {
  const type = options.type ?? QualificationPathStepType.SATISFY_REQUIREMENT_SET;
  return QualificationPathStep.create({
    code,
    type,
    prerequisiteStepCodes: options.prerequisites ?? [],
    alternativeGroupCode: options.alternativeGroup ?? null,
    requirementSetVersion: type === QualificationPathStepType.SATISFY_REQUIREMENT_SET ? set : null,
    sourceReferenceIds: [sourceAId],
  });
}

function path(options: {
  readonly id?: string;
  readonly version?: string;
  readonly steps?: readonly QualificationPathStep[];
  readonly effectivePeriod?: CatalogEffectivePeriod;
} = {}): QualificationPathDefinition {
  return QualificationPathDefinition.create({
    id: QualificationPathId.from(options.id ?? IDS.path),
    version: VersionId.from(options.version ?? 'path-1'),
    targetCredentialDefinition: credential(),
    jurisdiction: cz,
    effectivePeriod: options.effectivePeriod ?? period(),
    steps: options.steps ?? [step()],
    sourceReferenceIds: [sourceAId],
  });
}

function catalogProvenance(ref: SourceReference, targetVersion: VersionId, evaluatedAt = '2026-01-03T09:00:00Z'): ProvenanceEnvelope {
  return ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.pathProvDecision),
    evaluatedAt: UtcInstant.from(evaluatedAt),
    actor: processActor,
    subject: null,
    ruleSetId: RuleSetId.from(IDS.ruleSet),
    ruleVersion: targetVersion,
    sources: [ref],
    evidence: [],
  });
}

function pathBinding(value: QualificationPathDefinition, ref = source(), evaluatedAt = '2026-01-03T09:00:00Z'): CatalogProvenanceBinding {
  return CatalogProvenanceBinding.create({ target: value, sourceReferences: [ref], provenance: catalogProvenance(ref, value.version, evaluatedAt) });
}

function evidence(id: string, ref = source()): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(id),
    kind: EvidenceKind.REGISTRY_RESPONSE,
    contentReference: `urn:calpq:m04:s07:evidence:${id}`,
    mediaType: 'application/json',
    contentHash: ContentHash.sha256(id.endsWith('23') ? 'b'.repeat(64) : 'c'.repeat(64)),
    acquiredAt: UtcInstant.from('2026-01-04T09:00:00Z'),
    acquiredBy: processActor,
    source: ref,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
}

function assessment(set: GovernedRequirementSetVersion, outcome: DomainOutcome, options: {
  readonly id?: string;
  readonly subjectRef?: SubjectReference;
  readonly setOverride?: GovernedRequirementSetVersion;
  readonly evaluatedAt?: string;
  readonly evidenceId?: string;
  readonly atomicReasonCodes?: readonly string[];
} = {}): EligibilityAssessment {
  const actualSet = options.setOverride ?? set;
  const ref = source();
  const ev = evidence(options.evidenceId ?? IDS.evidenceA, ref);
  const evaluatedAt = UtcInstant.from(options.evaluatedAt ?? '2026-01-05T09:00:00Z');
  const subjectRef = options.subjectRef ?? subject;
  const atomicResults = actualSet.requirementDefinitions.map((entry) => AtomicRequirementResult.create({
    requirementId: RequirementId.from(entry.code),
    outcome,
    reasonCodes: options.atomicReasonCodes ?? ['FV11.REASON'],
  }));
  return EligibilityAssessment.evaluate({
    id: EligibilityAssessmentId.from(options.id ?? IDS.assessment),
    subject: subjectRef,
    credentialDefinition: CredentialDefinitionReference.create(actualSet.credentialDefinition.id, actualSet.credentialDefinition.version),
    requirementSet: actualSet.requirementSet,
    evaluatedAt,
    evidenceSnapshot: EvidenceSnapshot.capture([ev], UtcInstant.from('2026-01-04T10:00:00Z')),
    atomicResults,
    evaluator: processActor,
    provenance: ProvenanceEnvelope.create({
      identity: DecisionId.from(IDS.eligibilityDecision),
      evaluatedAt,
      actor: processActor,
      subject: subjectRef,
      ruleSetId: RuleSetId.from(IDS.ruleSet),
      ruleVersion: actualSet.version,
      sources: [ref],
      evidence: [ev],
    }),
  });
}

function s06Provenance(refs: readonly SourceReference[], subjectRef: SubjectReference | null): ProvenanceEnvelope {
  return ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.s06ProvDecision),
    evaluatedAt: UtcInstant.from('2026-01-06T09:00:00Z'),
    actor: processActor,
    subject: subjectRef,
    ruleSetId: RuleSetId.from(IDS.ruleSet),
    ruleVersion: VersionId.from('s06-rule-1'),
    sources: refs,
    evidence: [],
  });
}

function eqRule(target: CredentialDefinition | RequirementDefinition, effectType: EquivalenceEffectType, options: {
  readonly id?: string;
  readonly residual?: readonly RequirementDefinition[];
} = {}): EquivalenceRule {
  const ref = source();
  const foreign = credential(IDS.foreignCredential, eu, 'foreign-1');
  return EquivalenceRule.create({
    id: EquivalenceRuleId.from(options.id ?? IDS.eqRule),
    sourceObjectType: EquivalenceSourceObjectType.CREDENTIAL_DEFINITION,
    sourceObjectId: foreign.id.toString(),
    sourceObjectVersion: foreign.version,
    target,
    effectType,
    jurisdiction: cz,
    effectivePeriod: period(),
    residualRequirements: options.residual ?? [],
    sourceReferences: [ref],
    provenance: s06Provenance([ref], null),
  });
}

function route(options: {
  readonly kind?: RecognitionRouteKind;
  readonly target?: CredentialDefinition;
} = {}): RecognitionRoute {
  const ref = source();
  return RecognitionRoute.create({
    id: RecognitionRouteId.from(IDS.route),
    kind: options.kind ?? RecognitionRouteKind.GENERAL_RECOGNITION,
    sourceCredentialDefinition: credential(IDS.foreignCredential, eu, 'foreign-1'),
    targetCredentialDefinition: options.target ?? credential(),
    jurisdiction: cz,
    effectivePeriod: period(),
    sourceReferences: [ref],
    provenance: s06Provenance([ref], null),
  });
}

function decision(target: CredentialDefinition | RequirementDefinition, effectType: RecognitionDecisionEffectType, options: {
  readonly subjectRef?: SubjectReference;
  readonly residual?: readonly RequirementDefinition[];
  readonly effectivePeriod?: CatalogEffectivePeriod;
} = {}): RecognitionDecision {
  const ref = source();
  const subjectRef = options.subjectRef ?? subject;
  return RecognitionDecision.create({
    id: DecisionId.from(IDS.recognitionDecision),
    authority,
    subject: subjectRef,
    sourceCredentialDefinition: credential(IDS.foreignCredential, eu, 'foreign-1'),
    target,
    effectType,
    jurisdiction: cz,
    effectivePeriod: options.effectivePeriod ?? period(),
    residualRequirements: options.residual ?? [],
    sourceReferences: [ref],
    provenance: s06Provenance([ref], subjectRef),
  });
}

function evaluate(valuePath: QualificationPathDefinition, options: {
  readonly id?: string;
  readonly binding?: CatalogProvenanceBinding;
  readonly subjectRef?: SubjectReference;
  readonly jurisdiction?: Jurisdiction;
  readonly effectiveOn?: string;
  readonly evaluatedAt?: string;
  readonly assessments?: readonly EligibilityAssessment[];
  readonly rules?: readonly EquivalenceRule[];
  readonly routes?: readonly RecognitionRoute[];
  readonly decisions?: readonly RecognitionDecision[];
} = {}): GapNavigatorEvaluation {
  return GapNavigatorEvaluation.evaluate({
    id: GapEvaluationId.from(options.id ?? IDS.gap),
    subject: options.subjectRef ?? subject,
    path: valuePath,
    pathProvenance: options.binding ?? pathBinding(valuePath),
    jurisdiction: options.jurisdiction ?? cz,
    effectiveOn: DateOnly.from(options.effectiveOn ?? '2026-06-01'),
    evaluatedAt: UtcInstant.from(options.evaluatedAt ?? '2026-06-02T09:00:00Z'),
    eligibilityAssessments: options.assessments ?? [],
    equivalenceRules: options.rules ?? [],
    recognitionRoutes: options.routes ?? [],
    recognitionDecisions: options.decisions ?? [],
  });
}

function singleSetPath(outcome?: DomainOutcome): { readonly set: GovernedRequirementSetVersion; readonly valuePath: QualificationPathDefinition; readonly assessmentValue: EligibilityAssessment | null } {
  const set = governedSet();
  const valuePath = path({ steps: [step('STEP.REQUIREMENTS', set)] });
  return { set, valuePath, assessmentValue: outcome === undefined ? null : assessment(set, outcome) };
}

test('M04S07-01-satisfied-requirement-maps-already-satisfied', () => {
  const x = singleSetPath(DomainOutcome.SATISFIED);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!] }).items[0]?.requirementItems[0]?.state, GapItemState.ALREADY_SATISFIED);
});

test('M04S07-02-not-satisfied-requirement-maps-action-required', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!] }).items[0]?.requirementItems[0]?.state, GapItemState.ACTION_REQUIRED);
});

test('M04S07-03-indeterminate-requirement-maps-information-missing', () => {
  const x = singleSetPath(DomainOutcome.INDETERMINATE);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!] }).items[0]?.requirementItems[0]?.state, GapItemState.INFORMATION_MISSING);
});

test('M04S07-04-review-required-outcome-remains-review-required', () => {
  const x = singleSetPath(DomainOutcome.REVIEW_REQUIRED);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!] }).items[0]?.state, GapItemState.REVIEW_REQUIRED);
});

test('M04S07-05-missing-assessment-yields-information-missing', () => {
  const x = singleSetPath();
  assert.equal(evaluate(x.valuePath).items[0]?.state, GapItemState.INFORMATION_MISSING);
});

test('M04S07-06-step-state-consumes-fv11-outcome-without-recomputation', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const full = eqRule(x.set.requirementDefinitions[0]!, EquivalenceEffectType.FULL_SUBSTITUTION);
  const result = evaluate(x.valuePath, { assessments: [x.assessmentValue!], rules: [full] });
  assert.equal(result.items[0]?.state, GapItemState.ACTION_REQUIRED);
  assert.equal(result.items[0]?.requirementItems[0]?.state, GapItemState.ALREADY_SATISFIED);
  assert.ok(result.items[0]?.reasonCodes.includes('GAP.ELIGIBILITY_REEVALUATION_REQUIRED'));
});

test('M04S07-07-exact-requirement-set-version-mismatch-is-rejected', () => {
  const x = singleSetPath();
  const wrongSet = governedSet({ version: 'set-2' });
  const wrongAssessment = assessment(wrongSet, DomainOutcome.SATISFIED);
  assert.throws(() => evaluate(x.valuePath, { assessments: [wrongAssessment] }), /RequirementSet version must match exact path version/i);
});

test('M04S07-08-wrong-subject-assessment-is-rejected', () => {
  const x = singleSetPath();
  assert.throws(() => evaluate(x.valuePath, { assessments: [assessment(x.set, DomainOutcome.SATISFIED, { subjectRef: otherSubject })] }), /subject must match exact gap subject/i);
});

test('M04S07-09-future-assessment-is-rejected', () => {
  const x = singleSetPath();
  const future = assessment(x.set, DomainOutcome.SATISFIED, { evaluatedAt: '2026-07-01T09:00:00Z' });
  assert.throws(() => evaluate(x.valuePath, { assessments: [future] }), /cannot predate eligibility assessment/i);
});

test('M04S07-10-unrelated-requirement-set-assessment-is-rejected', () => {
  const x = singleSetPath();
  const unrelated = governedSet({ id: IDS.otherRequirementSet });
  assert.throws(() => evaluate(x.valuePath, { assessments: [assessment(unrelated, DomainOutcome.SATISFIED)] }), /does not belong to the selected QualificationPath/i);
});

test('M04S07-11-duplicate-exact-assessment-is-rejected', () => {
  const x = singleSetPath();
  const a = assessment(x.set, DomainOutcome.SATISFIED);
  const b = assessment(x.set, DomainOutcome.SATISFIED, { id: IDS.assessment2 });
  assert.throws(() => evaluate(x.valuePath, { assessments: [a, b] }), /at most one selected EligibilityAssessment/i);
});

test('M04S07-12-wrong-jurisdiction-path-is-rejected', () => {
  const x = singleSetPath();
  assert.throws(() => evaluate(x.valuePath, { jurisdiction: eu }), /path is not applicable/i);
});

test('M04S07-13-expired-path-is-rejected', () => {
  const x = singleSetPath();
  assert.throws(() => evaluate(x.valuePath, { effectiveOn: '2027-01-01' }), /path is not applicable/i);
});

test('M04S07-14-wrong-path-provenance-target-is-rejected', () => {
  const x = singleSetPath();
  const other = path({ id: IDS.otherPath, steps: [step('STEP.OTHER', x.set)] });
  assert.throws(() => evaluate(x.valuePath, { binding: pathBinding(other) }), /must bind the exact QualificationPath version/i);
});

test('M04S07-15-gap-evaluation-cannot-predate-path-provenance', () => {
  const x = singleSetPath();
  const binding = pathBinding(x.valuePath, source(), '2026-06-03T09:00:00Z');
  assert.throws(() => evaluate(x.valuePath, { binding, evaluatedAt: '2026-06-02T09:00:00Z' }), /cannot predate path provenance/i);
});

test('M04S07-16-unverified-path-provenance-forces-review-required', () => {
  const x = singleSetPath(DomainOutcome.SATISFIED);
  const unverified = source({ verification: VerificationStateCode.UNVERIFIED });
  const result = evaluate(x.valuePath, { binding: pathBinding(x.valuePath, unverified), assessments: [x.assessmentValue!] });
  assert.equal(result.items[0]?.state, GapItemState.REVIEW_REQUIRED);
});

test('M04S07-17-gap-retains-evidence-snapshot-identities', () => {
  const x = singleSetPath(DomainOutcome.SATISFIED);
  assert.deepEqual(evaluate(x.valuePath, { assessments: [x.assessmentValue!] }).items[0]?.evidenceIds.map(String), [IDS.evidenceA]);
});

test('M04S07-18-gap-retains-source-identities', () => {
  const x = singleSetPath(DomainOutcome.SATISFIED);
  assert.deepEqual(evaluate(x.valuePath, { assessments: [x.assessmentValue!] }).items[0]?.sourceReferenceIds.map(String), [IDS.sourceA]);
});

test('M04S07-19-gap-retains-path-set-and-assessment-rule-references', () => {
  const x = singleSetPath(DomainOutcome.SATISFIED);
  const kinds = evaluate(x.valuePath, { assessments: [x.assessmentValue!] }).items[0]?.requirementItems[0]?.ruleReferences.map((entry) => entry.kind) ?? [];
  assert.ok(kinds.includes(GapRuleReferenceKind.QUALIFICATION_PATH));
  assert.ok(kinds.includes(GapRuleReferenceKind.REQUIREMENT_SET));
  assert.ok(kinds.includes(GapRuleReferenceKind.ELIGIBILITY_ASSESSMENT));
});

test('M04S07-20-gap-retains-fv11-reason-codes-as-why', () => {
  const x = singleSetPath();
  const a = assessment(x.set, DomainOutcome.NOT_SATISFIED, { atomicReasonCodes: ['FV11.MISSING.EXAM'] });
  assert.ok(evaluate(x.valuePath, { assessments: [a] }).items[0]?.requirementItems[0]?.reasonCodes.includes('FV11.MISSING.EXAM'));
});

test('M04S07-21-full-recognition-decision-can-satisfy-requirement-item', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const d = decision(x.set.requirementDefinitions[0]!, RecognitionDecisionEffectType.FULL_SUBSTITUTION);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!], decisions: [d] }).items[0]?.requirementItems[0]?.state, GapItemState.ALREADY_SATISFIED);
});

test('M04S07-22-recognition-decision-does-not-silently-recompute-fv11-step', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const d = decision(x.set.requirementDefinitions[0]!, RecognitionDecisionEffectType.FULL_SUBSTITUTION);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!], decisions: [d] }).items[0]?.state, GapItemState.ACTION_REQUIRED);
});

test('M04S07-23-partial-recognition-preserves-residual-requirements', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const residual = requirement(IDS.requirementResidual, 'REQ.RESIDUAL');
  const d = decision(x.set.requirementDefinitions[0]!, RecognitionDecisionEffectType.PARTIAL_SUBSTITUTION, { residual: [residual] });
  const item = evaluate(x.valuePath, { assessments: [x.assessmentValue!], decisions: [d] }).items[0]!;
  assert.equal(item.residualRequirements[0]?.id.toString(), IDS.requirementResidual);
  assert.equal(item.state, GapItemState.ACTION_REQUIRED);
});

test('M04S07-24-recognition-route-produces-recognition-possible', () => {
  const valuePath = path({ steps: [step('STEP.RECOGNITION', null, { type: QualificationPathStepType.REQUEST_RECOGNITION })] });
  assert.equal(evaluate(valuePath, { routes: [route()] }).items[0]?.state, GapItemState.RECOGNITION_POSSIBLE);
});

test('M04S07-25-recognition-route-alone-never-completes-path', () => {
  const valuePath = path({ steps: [step('STEP.RECOGNITION', null, { type: QualificationPathStepType.REQUEST_RECOGNITION })] });
  assert.equal(evaluate(valuePath, { routes: [route()] }).complete, false);
});

test('M04S07-26-recognition-decision-satisfies-request-recognition-step', () => {
  const valuePath = path({ steps: [step('STEP.RECOGNITION', null, { type: QualificationPathStepType.REQUEST_RECOGNITION })] });
  const d = decision(valuePath.targetCredentialDefinition, RecognitionDecisionEffectType.FULL_SUBSTITUTION);
  assert.equal(evaluate(valuePath, { decisions: [d] }).items[0]?.state, GapItemState.ALREADY_SATISFIED);
});

test('M04S07-27-recognition-decision-satisfies-authority-decision-step', () => {
  const valuePath = path({ steps: [step('STEP.DECISION', null, { type: QualificationPathStepType.OBTAIN_AUTHORITY_DECISION })] });
  const d = decision(valuePath.targetCredentialDefinition, RecognitionDecisionEffectType.FULL_SUBSTITUTION);
  assert.equal(evaluate(valuePath, { decisions: [d] }).items[0]?.state, GapItemState.ALREADY_SATISFIED);
});

test('M04S07-28-full-credential-recognition-satisfies-obtain-credential-step', () => {
  const valuePath = path({ steps: [step('STEP.CREDENTIAL', null, { type: QualificationPathStepType.OBTAIN_CREDENTIAL })] });
  const d = decision(valuePath.targetCredentialDefinition, RecognitionDecisionEffectType.FULL_SUBSTITUTION);
  assert.equal(evaluate(valuePath, { decisions: [d] }).items[0]?.state, GapItemState.ALREADY_SATISFIED);
});

test('M04S07-29-partial-credential-recognition-keeps-residual-action', () => {
  const valuePath = path({ steps: [step('STEP.CREDENTIAL', null, { type: QualificationPathStepType.OBTAIN_CREDENTIAL })] });
  const residual = requirement(IDS.requirementResidual, 'REQ.RESIDUAL');
  const d = decision(valuePath.targetCredentialDefinition, RecognitionDecisionEffectType.PARTIAL_SUBSTITUTION, { residual: [residual] });
  const item = evaluate(valuePath, { decisions: [d] }).items[0]!;
  assert.equal(item.state, GapItemState.ACTION_REQUIRED);
  assert.equal(item.residualRequirements[0]?.id.toString(), IDS.requirementResidual);
});

test('M04S07-30-unknown-recognition-route-requires-review', () => {
  const valuePath = path({ steps: [step('STEP.RECOGNITION', null, { type: QualificationPathStepType.REQUEST_RECOGNITION })] });
  assert.equal(evaluate(valuePath, { routes: [route({ kind: RecognitionRouteKind.UNKNOWN_REVIEW_REQUIRED })] }).items[0]?.state, GapItemState.REVIEW_REQUIRED);
});

test('M04S07-31-wrong-target-recognition-route-is-rejected', () => {
  const valuePath = path({ steps: [step('STEP.RECOGNITION', null, { type: QualificationPathStepType.REQUEST_RECOGNITION })] });
  const wrong = route({ target: credential(IDS.otherTargetCredential) });
  assert.throws(() => evaluate(valuePath, { routes: [wrong] }), /target must match exact path credential version/i);
});

test('M04S07-32-wrong-subject-recognition-decision-is-rejected', () => {
  const valuePath = path({ steps: [step('STEP.CREDENTIAL', null, { type: QualificationPathStepType.OBTAIN_CREDENTIAL })] });
  const d = decision(valuePath.targetCredentialDefinition, RecognitionDecisionEffectType.FULL_SUBSTITUTION, { subjectRef: otherSubject });
  assert.throws(() => evaluate(valuePath, { decisions: [d] }), /subject must match exact gap subject/i);
});

test('M04S07-33-out-of-period-recognition-decision-is-rejected', () => {
  const valuePath = path({ steps: [step('STEP.CREDENTIAL', null, { type: QualificationPathStepType.OBTAIN_CREDENTIAL })] });
  const d = decision(valuePath.targetCredentialDefinition, RecognitionDecisionEffectType.FULL_SUBSTITUTION, { effectivePeriod: period('2026-01-01', '2026-03-31') });
  assert.throws(() => evaluate(valuePath, { effectiveOn: '2026-06-01', decisions: [d] }), /outside exact jurisdiction\/date/i);
});

test('M04S07-34-recognition-route-only-equivalence-is-recognition-possible', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const rule = eqRule(x.set.requirementDefinitions[0]!, EquivalenceEffectType.RECOGNITION_ROUTE_ONLY);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!], rules: [rule] }).items[0]?.requirementItems[0]?.state, GapItemState.RECOGNITION_POSSIBLE);
});

test('M04S07-35-review-required-equivalence-remains-review-required', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const rule = eqRule(x.set.requirementDefinitions[0]!, EquivalenceEffectType.REVIEW_REQUIRED);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!], rules: [rule] }).items[0]?.requirementItems[0]?.state, GapItemState.REVIEW_REQUIRED);
});

test('M04S07-36-full-equivalence-can-satisfy-requirement-item', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const rule = eqRule(x.set.requirementDefinitions[0]!, EquivalenceEffectType.FULL_SUBSTITUTION);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!], rules: [rule] }).items[0]?.requirementItems[0]?.state, GapItemState.ALREADY_SATISFIED);
});

test('M04S07-37-equivalence-does-not-silently-recompute-fv11-step', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const rule = eqRule(x.set.requirementDefinitions[0]!, EquivalenceEffectType.FULL_SUBSTITUTION);
  assert.equal(evaluate(x.valuePath, { assessments: [x.assessmentValue!], rules: [rule] }).items[0]?.state, GapItemState.ACTION_REQUIRED);
});

test('M04S07-38-partial-equivalence-preserves-residual-requirement', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const residual = requirement(IDS.requirementResidual, 'REQ.RESIDUAL');
  const rule = eqRule(x.set.requirementDefinitions[0]!, EquivalenceEffectType.PARTIAL_SUBSTITUTION, { residual: [residual] });
  const result = evaluate(x.valuePath, { assessments: [x.assessmentValue!], rules: [rule] });
  assert.equal(result.items[0]?.residualRequirements[0]?.id.toString(), IDS.requirementResidual);
  assert.equal(result.complete, false);
});

test('M04S07-39-unresolved-prerequisite-is-explicitly-recorded', () => {
  const first = step('STEP.FIRST', null, { type: QualificationPathStepType.PASS_EXAM_OR_ASSESSMENT });
  const second = step('STEP.SECOND', null, { type: QualificationPathStepType.PAY_FEE_OR_COMPLETE_ADMIN_STEP, prerequisites: ['STEP.FIRST'] });
  const result = evaluate(path({ steps: [first, second] }));
  assert.deepEqual(result.items[1]?.blockedByStepCodes, ['STEP.FIRST']);
  assert.ok(result.items[1]?.reasonCodes.includes('GAP.PREREQUISITE_UNRESOLVED'));
});

test('M04S07-40-already-satisfied-prerequisite-is-not-returned-as-action', () => {
  const set = governedSet();
  const first = step('STEP.FIRST', set);
  const second = step('STEP.SECOND', null, { type: QualificationPathStepType.PAY_FEE_OR_COMPLETE_ADMIN_STEP, prerequisites: ['STEP.FIRST'] });
  const valuePath = path({ steps: [first, second] });
  const a = assessment(set, DomainOutcome.SATISFIED);
  assert.deepEqual(evaluate(valuePath, { assessments: [a] }).actionRequiredItems().map((item) => item.step.code), ['STEP.SECOND']);
});

test('M04S07-41-satisfied-alternative-marks-unsatisfied-sibling-not-applicable', () => {
  const set = governedSet();
  const first = step('STEP.ALT.A', set, { alternativeGroup: 'ALT.PATH' });
  const second = step('STEP.ALT.B', null, { type: QualificationPathStepType.PASS_EXAM_OR_ASSESSMENT, alternativeGroup: 'ALT.PATH' });
  const valuePath = path({ steps: [first, second] });
  const result = evaluate(valuePath, { assessments: [assessment(set, DomainOutcome.SATISFIED)] });
  assert.equal(result.items[1]?.state, GapItemState.NOT_APPLICABLE);
});

test('M04S07-42-action-required-view-excludes-satisfied-and-not-applicable', () => {
  const set = governedSet();
  const first = step('STEP.ALT.A', set, { alternativeGroup: 'ALT.PATH' });
  const second = step('STEP.ALT.B', null, { type: QualificationPathStepType.PASS_EXAM_OR_ASSESSMENT, alternativeGroup: 'ALT.PATH' });
  const valuePath = path({ steps: [first, second] });
  assert.equal(evaluate(valuePath, { assessments: [assessment(set, DomainOutcome.SATISFIED)] }).actionRequiredItems().length, 0);
});

test('M04S07-43-path-comparison-is-advisory-and-selects-no-winner', () => {
  const a = evaluate(path({ id: IDS.path, steps: [step('STEP.A', null, { type: QualificationPathStepType.PASS_EXAM_OR_ASSESSMENT })] }));
  const b = evaluate(path({ id: IDS.otherPath, steps: [step('STEP.B', null, { type: QualificationPathStepType.PAY_FEE_OR_COMPLETE_ADMIN_STEP })] }), { id: IDS.gap2 });
  const comparison = compareGapEvaluations([a, b]);
  assert.equal(comparison.advisoryOnly, true);
  assert.equal(comparison.selectedPathId, null);
});

test('M04S07-44-path-comparison-order-is-canonical', () => {
  const a = evaluate(path({ id: IDS.path, steps: [step('STEP.A', null, { type: QualificationPathStepType.PASS_EXAM_OR_ASSESSMENT })] }));
  const b = evaluate(path({ id: IDS.otherPath, steps: [step('STEP.B', null, { type: QualificationPathStepType.PAY_FEE_OR_COMPLETE_ADMIN_STEP })] }), { id: IDS.gap2 });
  assert.equal(JSON.stringify(compareGapEvaluations([a, b]).toJSON()), JSON.stringify(compareGapEvaluations([b, a]).toJSON()));
});

test('M04S07-45-new-evidence-creates-new-gap-snapshot-without-mutating-history', () => {
  const x = singleSetPath();
  const firstAssessment = assessment(x.set, DomainOutcome.NOT_SATISFIED, { evidenceId: IDS.evidenceA });
  const first = evaluate(x.valuePath, { assessments: [firstAssessment] });
  const firstJson = JSON.stringify(first.toJSON());
  const secondAssessment = assessment(x.set, DomainOutcome.SATISFIED, { id: IDS.assessment2, evidenceId: IDS.evidenceB, evaluatedAt: '2026-05-01T09:00:00Z' });
  const second = evaluate(x.valuePath, { id: IDS.gap2, assessments: [secondAssessment] });
  assert.notEqual(JSON.stringify(second.toJSON()), firstJson);
  assert.equal(JSON.stringify(first.toJSON()), firstJson);
  assert.deepEqual(second.items[0]?.evidenceIds.map(String), [IDS.evidenceB]);
});

test('M04S07-46-new-path-version-creates-distinct-evaluation-snapshot', () => {
  const set = governedSet();
  const p1 = path({ version: 'path-1', steps: [step('STEP.REQUIREMENTS', set)] });
  const p2 = path({ version: 'path-2', steps: [step('STEP.REQUIREMENTS', set)] });
  const a = assessment(set, DomainOutcome.SATISFIED);
  assert.notEqual(evaluate(p1, { assessments: [a] }).path.version.toString(), evaluate(p2, { id: IDS.gap2, assessments: [a] }).path.version.toString());
});

test('M04S07-47-derived-output-is-immutable-and-rule-input-order-is-canonical', () => {
  const x = singleSetPath(DomainOutcome.NOT_SATISFIED);
  const r1 = eqRule(x.set.requirementDefinitions[0]!, EquivalenceEffectType.FULL_SUBSTITUTION, { id: IDS.eqRule });
  const r2 = eqRule(x.set.requirementDefinitions[0]!, EquivalenceEffectType.REVIEW_REQUIRED, { id: IDS.eqRule2 });
  const left = evaluate(x.valuePath, { assessments: [x.assessmentValue!], rules: [r1, r2] });
  const right = evaluate(x.valuePath, { assessments: [x.assessmentValue!], rules: [r2, r1] });
  assert.equal(JSON.stringify(left.toJSON()), JSON.stringify(right.toJSON()));
  assert.throws(() => (left.items as unknown as Array<unknown>).push(null), TypeError);
  assert.throws(() => (left.items[0]!.reasonCodes as string[]).push('GAP.MUTATE'), TypeError);
});

test('M04S07-48-failed-gap-projection-never-mutates-authoritative-inputs', () => {
  const x = singleSetPath();
  const a = assessment(x.set, DomainOutcome.SATISFIED);
  const pathBefore = JSON.stringify(x.valuePath.toJSON());
  const assessmentBefore = JSON.stringify({ id: a.id.toString(), outcome: a.outcome, atomic: a.atomicResults.map((v) => [v.requirementId.toString(), v.outcome]) });
  assert.throws(() => evaluate(x.valuePath, { jurisdiction: eu, assessments: [a] }), /path is not applicable/i);
  assert.equal(JSON.stringify(x.valuePath.toJSON()), pathBefore);
  assert.equal(JSON.stringify({ id: a.id.toString(), outcome: a.outcome, atomic: a.atomicResults.map((v) => [v.requirementId.toString(), v.outcome]) }), assessmentBefore);
});
