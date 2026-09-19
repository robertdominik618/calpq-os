import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActorId,
  ActorKind,
  ActorReference,
  AtomicRequirementResult,
  CatalogEffectivePeriod,
  CatalogProvenanceBinding,
  CatalogQueryExplanationGraph,
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
  ExplanationClassification,
  ExplanationEdgeKind,
  ExplanationGraphId,
  ExplanationNodeKind,
  ExplanationUnresolvedFactCode,
  GapEvaluationId,
  GapItemState,
  GapNavigatorEvaluation,
  GovernedRequirementSetVersion,
  Jurisdiction,
  ProvenanceEnvelope,
  QualificationPathDefinition,
  QualificationPathId,
  QualificationPathStep,
  QualificationPathStepType,
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
} from '../src/index.ts';

const IDS = {
  source: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8001',
  authority: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8002',
  process: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8003',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8004',
  ruleSet: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8005',
  pathDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8006',
  eligibilityDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8007',
  s06Decision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8008',
  targetCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8010',
  foreignCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8011',
  requirementA: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8012',
  requirementB: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8013',
  residual: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8014',
  setA: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8015',
  setB: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8016',
  path: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8017',
  assessmentA: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8018',
  assessmentB: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8019',
  evidenceA: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8020',
  gap: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8021',
  graph: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8022',
  graph2: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8023',
  eqRule: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8024',
  route: '018f22e2-79b0-7cc3-98c4-dc0c0c0b8025',
} as const;

const cz = Jurisdiction.fromCode('CZ');
const eu = Jurisdiction.fromCode('EU');
const sourceId = SourceId.from(IDS.source);
const authority = ActorReference.create(ActorId.from(IDS.authority), ActorKind.EXTERNAL_AUTHORITY);
const processActor = ActorReference.create(ActorId.from(IDS.process), ActorKind.SYSTEM_PROCESS);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);

function period(): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({ effectiveFrom: DateOnly.from('2026-01-01'), effectiveTo: DateOnly.from('2026-12-31') });
}

function source(options: { verification?: VerificationStateCode; version?: string; retrievedAt?: string } = {}): SourceReference {
  return SourceReference.create({
    id: sourceId,
    authority,
    jurisdiction: cz,
    sourceType: SourceType.REGULATION,
    canonicalLocator: 'urn:calpq:m04:s08:source',
    version: VersionId.from(options.version ?? 'source-1'),
    publicationDate: DateOnly.from('2025-12-15'),
    effectiveFrom: DateOnly.from('2026-01-01'),
    effectiveTo: DateOnly.from('2026-12-31'),
    retrievedAt: UtcInstant.from(options.retrievedAt ?? '2026-01-02T09:00:00Z'),
    verificationState: VerificationState.from(options.verification ?? VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256('8'.repeat(64)),
  });
}

function credential(id = IDS.targetCredential, jurisdiction = cz, sourceIds: readonly SourceId[] = [sourceId]): CredentialDefinition {
  return CredentialDefinition.create({
    id: CredentialDefinitionId.from(id),
    version: VersionId.from('credential-1'),
    code: `CRED.${id.slice(-4).toUpperCase()}`,
    preferredLabel: 'S08 target credential',
    aliases: [],
    description: 'Governed S08 credential.',
    jurisdiction,
    effectivePeriod: period(),
    sourceReferenceIds: sourceIds,
  });
}

function requirement(id = IDS.requirementA, code = 'REQ.A', sourceIds: readonly SourceId[] = [sourceId]): RequirementDefinition {
  return RequirementDefinition.create({
    id: RequirementDefinitionId.from(id),
    version: VersionId.from('requirement-1'),
    code,
    preferredLabel: `Requirement ${code}`,
    aliases: [],
    description: 'Governed S08 requirement.',
    jurisdiction: cz,
    effectivePeriod: period(),
    sourceReferenceIds: sourceIds,
  });
}

function governedSet(options: { id?: string; requirementValue?: RequirementDefinition; sourceIds?: readonly SourceId[] } = {}): GovernedRequirementSetVersion {
  const target = credential();
  const req = options.requirementValue ?? requirement();
  const requirementIds = [RequirementId.from(req.code)];
  const set = RequirementSet.create({
    id: RequirementSetId.from(options.id ?? IDS.setA),
    version: VersionId.from('set-1'),
    credentialDefinition: CredentialDefinitionReference.create(target.id, target.version),
    requirementIds,
    groups: [RequirementGroup.create({ code: 'GROUP.ALL', mode: RequirementGroupMode.ALL, requirementIds })],
  });
  return GovernedRequirementSetVersion.create({
    requirementSet: set,
    credentialDefinition: target,
    requirementDefinitions: [req],
    jurisdiction: cz,
    effectivePeriod: period(),
    sourceReferenceIds: options.sourceIds ?? [sourceId],
  });
}

function pathStep(code: string, set: GovernedRequirementSetVersion | null, options: { type?: QualificationPathStepType; prerequisites?: readonly string[]; alternative?: string | null; sourceIds?: readonly SourceId[] } = {}): QualificationPathStep {
  const type = options.type ?? QualificationPathStepType.SATISFY_REQUIREMENT_SET;
  return QualificationPathStep.create({
    code,
    type,
    prerequisiteStepCodes: options.prerequisites ?? [],
    alternativeGroupCode: options.alternative ?? null,
    requirementSetVersion: type === QualificationPathStepType.SATISFY_REQUIREMENT_SET ? set : null,
    sourceReferenceIds: options.sourceIds ?? [sourceId],
  });
}

function path(steps: readonly QualificationPathStep[], sourceIds: readonly SourceId[] = [sourceId]): QualificationPathDefinition {
  return QualificationPathDefinition.create({
    id: QualificationPathId.from(IDS.path),
    version: VersionId.from('path-1'),
    targetCredentialDefinition: credential(IDS.targetCredential, cz, sourceIds),
    jurisdiction: cz,
    effectivePeriod: period(),
    steps,
    sourceReferenceIds: sourceIds,
  });
}

function provenance(ref: SourceReference, ruleVersion: VersionId, identity = IDS.pathDecision, subjectRef: SubjectReference | null = null): ProvenanceEnvelope {
  return ProvenanceEnvelope.create({
    identity: DecisionId.from(identity),
    evaluatedAt: UtcInstant.from('2026-01-03T09:00:00Z'),
    actor: processActor,
    subject: subjectRef,
    ruleSetId: RuleSetId.from(IDS.ruleSet),
    ruleVersion,
    sources: [ref],
    evidence: [],
  });
}

function binding(valuePath: QualificationPathDefinition, ref = source()): CatalogProvenanceBinding {
  return CatalogProvenanceBinding.create({ target: valuePath, sourceReferences: [ref], provenance: provenance(ref, valuePath.version) });
}

function evidence(ref = source()): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(IDS.evidenceA),
    kind: EvidenceKind.REGISTRY_RESPONSE,
    contentReference: 'urn:calpq:m04:s08:evidence-a',
    mediaType: 'application/json',
    contentHash: ContentHash.sha256('9'.repeat(64)),
    acquiredAt: UtcInstant.from('2026-01-04T09:00:00Z'),
    acquiredBy: processActor,
    source: ref,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
}

function assessment(set: GovernedRequirementSetVersion, outcome: DomainOutcome, options: { id?: string; reasonCodes?: readonly string[] } = {}): EligibilityAssessment {
  const ref = source();
  const ev = evidence(ref);
  const evaluatedAt = UtcInstant.from('2026-01-05T09:00:00Z');
  return EligibilityAssessment.evaluate({
    id: EligibilityAssessmentId.from(options.id ?? IDS.assessmentA),
    subject,
    credentialDefinition: CredentialDefinitionReference.create(set.credentialDefinition.id, set.credentialDefinition.version),
    requirementSet: set.requirementSet,
    evaluatedAt,
    evidenceSnapshot: EvidenceSnapshot.capture([ev], UtcInstant.from('2026-01-04T10:00:00Z')),
    atomicResults: set.requirementDefinitions.map((entry) => AtomicRequirementResult.create({
      requirementId: RequirementId.from(entry.code),
      outcome,
      reasonCodes: options.reasonCodes ?? ['FV11.S08.REASON'],
    })),
    evaluator: processActor,
    provenance: ProvenanceEnvelope.create({
      identity: DecisionId.from(IDS.eligibilityDecision),
      evaluatedAt,
      actor: processActor,
      subject,
      ruleSetId: RuleSetId.from(IDS.ruleSet),
      ruleVersion: set.version,
      sources: [ref],
      evidence: [ev],
    }),
  });
}

function gap(valuePath: QualificationPathDefinition, options: { assessments?: readonly EligibilityAssessment[]; pathBinding?: CatalogProvenanceBinding; rules?: readonly EquivalenceRule[]; routes?: readonly RecognitionRoute[]; id?: string } = {}): GapNavigatorEvaluation {
  return GapNavigatorEvaluation.evaluate({
    id: GapEvaluationId.from(options.id ?? IDS.gap),
    subject,
    path: valuePath,
    pathProvenance: options.pathBinding ?? binding(valuePath),
    jurisdiction: cz,
    effectiveOn: DateOnly.from('2026-06-01'),
    evaluatedAt: UtcInstant.from('2026-06-02T09:00:00Z'),
    eligibilityAssessments: options.assessments ?? [],
    equivalenceRules: options.rules ?? [],
    recognitionRoutes: options.routes ?? [],
    recognitionDecisions: [],
  });
}

function graph(valueGap: GapNavigatorEvaluation, options: { sources?: readonly SourceReference[]; id?: string; evaluatedAt?: string } = {}): CatalogQueryExplanationGraph {
  return CatalogQueryExplanationGraph.build({
    id: ExplanationGraphId.from(options.id ?? IDS.graph),
    gapEvaluation: valueGap,
    sourceReferences: options.sources ?? [source()],
    evaluatedAt: UtcInstant.from(options.evaluatedAt ?? '2026-06-03T09:00:00Z'),
  });
}

function single(outcome?: DomainOutcome, reasonCodes?: readonly string[]): { set: GovernedRequirementSetVersion; valuePath: QualificationPathDefinition; valueGap: GapNavigatorEvaluation } {
  const set = governedSet();
  const valuePath = path([pathStep('STEP.REQUIREMENTS', set)]);
  const assessments = outcome === undefined ? [] : [assessment(set, outcome, { reasonCodes })];
  return { set, valuePath, valueGap: gap(valuePath, { assessments }) };
}

function equivalence(target: RequirementDefinition, effectType: EquivalenceEffectType, residual: readonly RequirementDefinition[] = []): EquivalenceRule {
  const ref = source();
  const foreign = credential(IDS.foreignCredential, eu);
  return EquivalenceRule.create({
    id: EquivalenceRuleId.from(IDS.eqRule),
    sourceObjectType: EquivalenceSourceObjectType.CREDENTIAL_DEFINITION,
    sourceObjectId: foreign.id.toString(),
    sourceObjectVersion: foreign.version,
    target,
    effectType,
    jurisdiction: cz,
    effectivePeriod: period(),
    residualRequirements: residual,
    sourceReferences: [ref],
    provenance: provenance(ref, VersionId.from('s06-rule-1'), IDS.s06Decision),
  });
}

function recognitionRoute(): RecognitionRoute {
  const ref = source();
  return RecognitionRoute.create({
    id: RecognitionRouteId.from(IDS.route),
    kind: RecognitionRouteKind.GENERAL_RECOGNITION,
    sourceCredentialDefinition: credential(IDS.foreignCredential, eu),
    targetCredentialDefinition: credential(),
    jurisdiction: cz,
    effectivePeriod: period(),
    sourceReferences: [ref],
    provenance: provenance(ref, VersionId.from('s06-rule-1'), IDS.s06Decision),
  });
}

function edgeKinds(value: CatalogQueryExplanationGraph): readonly string[] { return value.edges.map((entry) => entry.kind); }

// 01-08: exact context and graph identity
test('M04S08-01-semantic-explanation-id-is-preserved', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); assert.equal(g.id.toString(), IDS.graph); });
test('M04S08-02-gap-evaluation-id-is-preserved', () => { const x = single(DomainOutcome.SATISFIED); assert.equal(graph(x.valueGap).gapEvaluationId, IDS.gap); });
test('M04S08-03-subject-context-is-preserved', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); assert.equal(g.subject.id, IDS.subject); });
test('M04S08-04-path-id-is-preserved', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); assert.equal(g.qualificationPathId, IDS.path); });
test('M04S08-05-path-version-is-preserved', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); assert.equal(g.qualificationPathVersion, 'path-1'); });
test('M04S08-06-jurisdiction-is-preserved', () => { assert.equal(graph(single(DomainOutcome.SATISFIED).valueGap).jurisdiction, 'CZ'); });
test('M04S08-07-effective-date-is-preserved', () => { assert.equal(graph(single(DomainOutcome.SATISFIED).valueGap).effectiveOn, '2026-06-01'); });
test('M04S08-08-explicit-evaluation-instant-is-preserved', () => { assert.equal(graph(single(DomainOutcome.SATISFIED).valueGap).evaluatedAt.toString(), '2026-06-03T09:00:00.000Z'); });

// 09-16: structured graph topology and exact links
test('M04S08-09-root-evaluates-path-edge-exists', () => { assert.ok(edgeKinds(graph(single(DomainOutcome.SATISFIED).valueGap)).includes(ExplanationEdgeKind.EVALUATES_PATH)); });
test('M04S08-10-path-contains-step-edge-exists', () => { assert.ok(edgeKinds(graph(single(DomainOutcome.SATISFIED).valueGap)).includes(ExplanationEdgeKind.PATH_CONTAINS_STEP)); });
test('M04S08-11-step-contains-requirement-edge-exists', () => { assert.ok(edgeKinds(graph(single(DomainOutcome.SATISFIED).valueGap)).includes(ExplanationEdgeKind.STEP_CONTAINS_REQUIREMENT)); });
test('M04S08-12-reason-edge-preserves-s07-why', () => { const x = single(DomainOutcome.NOT_SATISFIED, ['FV11.MISSING.EXAM']); const g = graph(x.valueGap); assert.ok(g.nodes.some((node) => node.kind === ExplanationNodeKind.REASON && node.referenceId === 'FV11.MISSING.EXAM')); });
test('M04S08-13-source-edge-links-material-source', () => { assert.ok(edgeKinds(graph(single(DomainOutcome.SATISFIED).valueGap)).includes(ExplanationEdgeKind.SUPPORTED_BY_SOURCE)); });
test('M04S08-14-rule-edge-links-exact-rule-reference', () => { assert.ok(edgeKinds(graph(single(DomainOutcome.SATISFIED).valueGap)).includes(ExplanationEdgeKind.SUPPORTED_BY_RULE)); });
test('M04S08-15-evidence-edge-links-exact-evidence-id', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); assert.ok(g.nodes.some((node) => node.kind === ExplanationNodeKind.EVIDENCE && node.referenceId === IDS.evidenceA)); });
test('M04S08-16-source-node-carries-exact-version-and-verification', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); const n = g.nodes.find((node) => node.kind === ExplanationNodeKind.SOURCE); assert.equal(n?.referenceVersion, 'source-1'); assert.equal(n?.verificationState, VerificationStateCode.VERIFIED); });

// 17-24: preserve all S07 states without reinterpretation
test('M04S08-17-already-satisfied-state-is-preserved', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); assert.ok(g.nodes.some((node) => node.kind === ExplanationNodeKind.PATH_STEP && node.gapState === GapItemState.ALREADY_SATISFIED)); });
test('M04S08-18-action-required-state-is-preserved', () => { const g = graph(single(DomainOutcome.NOT_SATISFIED).valueGap); assert.ok(g.nodes.some((node) => node.kind === ExplanationNodeKind.PATH_STEP && node.gapState === GapItemState.ACTION_REQUIRED)); });
test('M04S08-19-information-missing-state-is-preserved', () => { const g = graph(single().valueGap); assert.ok(g.nodes.some((node) => node.gapState === GapItemState.INFORMATION_MISSING)); });
test('M04S08-20-review-required-state-is-preserved', () => { const x = single(DomainOutcome.SATISFIED); const unverified = source({ verification: VerificationStateCode.UNVERIFIED }); const reviewed = gap(x.valuePath, { assessments: [assessment(x.set, DomainOutcome.SATISFIED)], pathBinding: binding(x.valuePath, unverified) }); const g = graph(reviewed, { sources: [unverified] }); assert.ok(g.nodes.some((node) => node.gapState === GapItemState.REVIEW_REQUIRED)); });
test('M04S08-21-recognition-possible-state-is-preserved', () => { const valuePath = path([pathStep('STEP.RECOGNITION', null, { type: QualificationPathStepType.REQUEST_RECOGNITION })]); const valueGap = gap(valuePath, { routes: [recognitionRoute()] }); const g = graph(valueGap); assert.ok(g.nodes.some((node) => node.gapState === GapItemState.RECOGNITION_POSSIBLE)); });
test('M04S08-22-not-applicable-alternative-state-is-preserved', () => { const setA = governedSet(); const setB = governedSet({ id: IDS.setB, requirementValue: requirement(IDS.requirementB, 'REQ.B') }); const valuePath = path([pathStep('STEP.A', setA, { alternative: 'ALT.ONE' }), pathStep('STEP.B', setB, { alternative: 'ALT.ONE' })]); const valueGap = gap(valuePath, { assessments: [assessment(setA, DomainOutcome.SATISFIED)] }); const g = graph(valueGap); assert.ok(g.nodes.some((node) => node.gapState === GapItemState.NOT_APPLICABLE)); });
test('M04S08-23-requirement-state-is-preserved-separately-from-step', () => { const x = single(DomainOutcome.NOT_SATISFIED); const g = graph(x.valueGap); assert.ok(g.nodes.some((node) => node.kind === ExplanationNodeKind.REQUIREMENT && node.gapState === GapItemState.ACTION_REQUIRED)); });
test('M04S08-24-graph-build-does-not-mutate-s07-state', () => { const x = single(DomainOutcome.NOT_SATISFIED); const before = JSON.stringify(x.valueGap.toJSON()); graph(x.valueGap); assert.equal(JSON.stringify(x.valueGap.toJSON()), before); });

// 25-32: fail-closed explainability and S06 relationships
test('M04S08-25-complete-verified-linkage-is-explained', () => { assert.equal(graph(single(DomainOutcome.SATISFIED).valueGap).classification, ExplanationClassification.EXPLAINED); });
test('M04S08-26-missing-material-source-is-indeterminate', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap, { sources: [] }); assert.equal(g.classification, ExplanationClassification.INDETERMINATE); assert.ok(g.unresolvedFacts.some((f) => f.code === ExplanationUnresolvedFactCode.SOURCE_REFERENCE_MISSING)); });
test('M04S08-27-information-missing-gap-is-indeterminate', () => { assert.equal(graph(single().valueGap).classification, ExplanationClassification.INDETERMINATE); });
test('M04S08-28-unverified-source-requires-review', () => { const x = single(DomainOutcome.SATISFIED); const unverified = source({ verification: VerificationStateCode.UNVERIFIED }); const reviewed = gap(x.valuePath, { assessments: [assessment(x.set, DomainOutcome.SATISFIED)], pathBinding: binding(x.valuePath, unverified) }); assert.equal(graph(reviewed, { sources: [unverified] }).classification, ExplanationClassification.REVIEW_REQUIRED); });
test('M04S08-29-review-takes-precedence-over-indeterminate', () => { const x = single(DomainOutcome.SATISFIED); const unverified = source({ verification: VerificationStateCode.UNVERIFIED }); const reviewed = gap(x.valuePath, { pathBinding: binding(x.valuePath, unverified) }); assert.equal(graph(reviewed, { sources: [unverified] }).classification, ExplanationClassification.REVIEW_REQUIRED); });
test('M04S08-30-partial-equivalence-links-residual-requirement', () => { const x = single(DomainOutcome.NOT_SATISFIED); const residual = requirement(IDS.residual, 'REQ.RESIDUAL'); const rule = equivalence(x.set.requirementDefinitions[0]!, EquivalenceEffectType.PARTIAL_SUBSTITUTION, [residual]); const valueGap = gap(x.valuePath, { assessments: [assessment(x.set, DomainOutcome.NOT_SATISFIED)], rules: [rule] }); assert.ok(edgeKinds(graph(valueGap)).includes(ExplanationEdgeKind.HAS_RESIDUAL_REQUIREMENT)); });
test('M04S08-31-equivalence-rule-kind-remains-visible', () => { const x = single(DomainOutcome.NOT_SATISFIED); const rule = equivalence(x.set.requirementDefinitions[0]!, EquivalenceEffectType.FULL_SUBSTITUTION); const valueGap = gap(x.valuePath, { assessments: [assessment(x.set, DomainOutcome.NOT_SATISFIED)], rules: [rule] }); assert.ok(graph(valueGap).nodes.some((node) => node.kind === ExplanationNodeKind.RULE && node.referenceId.startsWith('EQUIVALENCE_RULE:'))); });
test('M04S08-32-recognition-route-remains-reason-linked', () => { const valuePath = path([pathStep('STEP.RECOGNITION', null, { type: QualificationPathStepType.REQUEST_RECOGNITION })]); const g = graph(gap(valuePath, { routes: [recognitionRoute()] })); assert.ok(g.nodes.some((node) => node.kind === ExplanationNodeKind.REASON && node.referenceId === 'GAP.RECOGNITION_ROUTE_AVAILABLE')); });

// 33-40: prerequisites, source integrity and deterministic snapshots
test('M04S08-33-unresolved-prerequisite-produces-blocked-by-edge', () => { const setA = governedSet(); const valuePath = path([pathStep('STEP.A', setA), pathStep('STEP.B', null, { type: QualificationPathStepType.OBTAIN_CREDENTIAL, prerequisites: ['STEP.A'] })]); const g = graph(gap(valuePath)); assert.ok(edgeKinds(g).includes(ExplanationEdgeKind.BLOCKED_BY_STEP)); });
test('M04S08-34-prerequisite-reason-is-preserved', () => { const setA = governedSet(); const valuePath = path([pathStep('STEP.A', setA), pathStep('STEP.B', null, { type: QualificationPathStepType.OBTAIN_CREDENTIAL, prerequisites: ['STEP.A'] })]); const g = graph(gap(valuePath)); assert.ok(g.nodes.some((node) => node.kind === ExplanationNodeKind.REASON && node.referenceId === 'GAP.PREREQUISITE_UNRESOLVED')); });
test('M04S08-35-source-input-is-unique-and-bound-to-exact-path-provenance-snapshot', () => { const x = single(DomainOutcome.SATISFIED); assert.throws(() => graph(x.valueGap, { sources: [source(), source()] }), /exactly one SourceReference per SourceId/i); assert.throws(() => graph(x.valueGap, { sources: [source({ version: 'source-2' })] }), /exact path-provenance SourceReference snapshot/i); assert.throws(() => graph(x.valueGap, { sources: [source({ verification: VerificationStateCode.UNVERIFIED })] }), /exact path-provenance SourceReference snapshot/i); });
test('M04S08-36-future-retrieved-source-is-rejected', () => { const x = single(DomainOutcome.SATISFIED); assert.throws(() => graph(x.valueGap, { sources: [source({ retrievedAt: '2026-07-01T00:00:00Z' })] }), /retrieved after its evaluation instant/i); });
test('M04S08-37-explanation-cannot-predate-gap-evaluation', () => { const x = single(DomainOutcome.SATISFIED); assert.throws(() => graph(x.valueGap, { evaluatedAt: '2026-06-01T00:00:00Z' }), /cannot predate its GapNavigatorEvaluation/i); });
test('M04S08-38-same-input-serializes-identically', () => { const x = single(DomainOutcome.SATISFIED); const a = graph(x.valueGap); const b = graph(x.valueGap); assert.deepEqual(a.toJSON(), b.toJSON()); });
test('M04S08-39-node-order-is-canonical', () => { const nodes = graph(single(DomainOutcome.SATISFIED).valueGap).nodes.map((node) => node.key); assert.deepEqual(nodes, [...nodes].sort()); });
test('M04S08-40-edge-order-is-canonical', () => { const edges = graph(single(DomainOutcome.SATISFIED).valueGap).edges.map((edge) => `${edge.from}|${edge.kind}|${edge.to}`); assert.deepEqual(edges, [...edges].sort()); });

// 41-48: immutability, controlled input and authority boundaries
test('M04S08-41-graph-is-frozen', () => { assert.ok(Object.isFrozen(graph(single(DomainOutcome.SATISFIED).valueGap))); });
test('M04S08-42-nodes-and-edges-arrays-are-frozen', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); assert.ok(Object.isFrozen(g.nodes)); assert.ok(Object.isFrozen(g.edges)); });
test('M04S08-43-individual-nodes-and-edges-are-frozen', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); assert.ok(g.nodes.every(Object.isFrozen)); assert.ok(g.edges.every(Object.isFrozen)); });
test('M04S08-44-unresolved-facts-are-frozen', () => { const g = graph(single().valueGap); assert.ok(Object.isFrozen(g.unresolvedFacts)); assert.ok(g.unresolvedFacts.every(Object.isFrozen)); });
test('M04S08-45-nodes-of-kind-is-read-only-derived-view', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); const view = g.nodesOfKind(ExplanationNodeKind.REASON); assert.ok(Object.isFrozen(view)); assert.ok(view.length > 0); });
test('M04S08-46-edges-from-is-read-only-derived-view', () => { const g = graph(single(DomainOutcome.SATISFIED).valueGap); const root = g.nodes.find((node) => node.kind === ExplanationNodeKind.GAP_EVALUATION)!; const view = g.edgesFrom(root.key); assert.ok(Object.isFrozen(view)); assert.ok(view.some((edge) => edge.kind === ExplanationEdgeKind.EVALUATES_PATH)); });
test('M04S08-47-changed-governed-input-produces-new-snapshot-without-mutating-old', () => { const a = single(DomainOutcome.SATISFIED); const first = graph(a.valueGap); const b = single(DomainOutcome.NOT_SATISFIED); const second = graph(b.valueGap, { id: IDS.graph2 }); assert.equal(first.classification, ExplanationClassification.EXPLAINED); assert.notDeepEqual(first.toJSON(), second.toJSON()); assert.ok(first.nodes.some((node) => node.gapState === GapItemState.ALREADY_SATISFIED)); });
test('M04S08-48-core-output-contains-no-authoritative-free-text-narrative-field', () => { const json = graph(single(DomainOutcome.SATISFIED).valueGap).toJSON(); assert.equal('narrative' in json, false); assert.equal('recommendation' in json, false); assert.equal('selectedPathId' in json, false); });
