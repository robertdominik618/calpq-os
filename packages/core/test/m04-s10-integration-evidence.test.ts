import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActivityDefinition,
  ActivityDefinitionId,
  ActorId,
  ActorKind,
  ActorReference,
  AtomicRequirementResult,
  CatalogEffectivePeriod,
  CatalogProvenanceBinding,
  CatalogProvenanceTargetKind,
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
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  EvidenceSnapshot,
  ExplanationClassification,
  ExplanationGraphId,
  ExplanationNodeKind,
  GapEvaluationId,
  GapItemState,
  GapNavigatorEvaluation,
  HistoricalCatalogQueryId,
  HistoricalCatalogVersionQuery,
  HistoricalReplayId,
  HistoricalReplayState,
  HistoricalSnapshotReplay,
  HistoricalVersionQueryState,
  Jurisdiction,
  ProfessionDefinition,
  ProfessionDefinitionId,
  ProvenanceEnvelope,
  QualificationPathDefinition,
  QualificationPathId,
  QualificationPathStep,
  QualificationPathStepType,
  RecognitionRoute,
  RecognitionRouteApplicationState,
  RecognitionRouteId,
  RecognitionRouteKind,
  RegulatoryStatus,
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
  GovernedRequirementSetVersion,
  compareGapEvaluations,
} from '../src/index.ts';

/*
 * S10 fixtures are intentionally synthetic integration data. Labels such as
 * “Electrician” are inherited from earlier M04 test fixtures and MUST NOT be
 * interpreted as a statement of current Czech legal requirements.
 */

const IDS = {
  source: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1001',
  authority: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1002',
  process: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1003',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1004',
  otherSubject: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1005',
  ruleSet: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1006',
  catalogDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1007',
  eligibilityDecisionA: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1008',
  eligibilityDecisionB: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1009',
  routeDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1010',
  activity: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1011',
  profession: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1012',
  credential: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1013',
  foreignCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1014',
  requirementQualification: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1015',
  requirementExam: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1016',
  requirementSet: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1017',
  directPath: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1018',
  recognitionPath: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1019',
  evidence: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1020',
  mixedAssessment: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1021',
  satisfiedAssessment: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1022',
  mixedGap: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1023',
  satisfiedGap: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1024',
  recognitionGap: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1025',
  reviewGap: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1026',
  explanation: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1027',
  recognitionExplanation: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1028',
  reviewExplanation: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1029',
  queryOld: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1030',
  queryNewEarly: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1031',
  queryNewLate: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1032',
  queryExactOld: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1033',
  queryAmbiguous: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1034',
  queryExactNew: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1035',
  replayOld: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1036',
  replayGapTie: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1037',
  replayExplanationTie: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1038',
  routeGeneral: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1039',
  routeUnknown: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1040',
  gapTie: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1041',
  graphTieA: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1042',
  graphTieB: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1043',
  pathReviewGap: '018f22e2-79b0-7cc3-98c4-dc0c0c0c1044',
} as const;

const cz = Jurisdiction.fromCode('CZ');
const differentJurisdiction = Jurisdiction.fromCode('CZ-10');
const eu = Jurisdiction.fromCode('EU');
const sourceId = SourceId.from(IDS.source);
const authority = ActorReference.create(ActorId.from(IDS.authority), ActorKind.EXTERNAL_AUTHORITY);
const processActor = ActorReference.create(ActorId.from(IDS.process), ActorKind.SYSTEM_PROCESS);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);
const otherSubject = SubjectReference.create(SubjectId.from(IDS.otherSubject), SubjectKind.PERSON);

function period(from: string, to: string): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({ effectiveFrom: DateOnly.from(from), effectiveTo: DateOnly.from(to) });
}

const OLD_PERIOD = period('2026-01-01', '2026-06-30');
const NEW_PERIOD = period('2026-07-01', '2026-12-31');

function source(options: {
  readonly version?: string;
  readonly retrievedAt?: string;
  readonly verification?: VerificationStateCode;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
} = {}): SourceReference {
  return SourceReference.create({
    id: sourceId,
    authority,
    jurisdiction: cz,
    sourceType: SourceType.REGULATION,
    canonicalLocator: 'urn:calpq:m04:s10:synthetic-source',
    version: VersionId.from(options.version ?? 'source-v1'),
    publicationDate: DateOnly.from(options.effectiveFrom === '2026-07-01' ? '2026-06-20' : '2025-12-20'),
    effectiveFrom: DateOnly.from(options.effectiveFrom ?? '2026-01-01'),
    effectiveTo: DateOnly.from(options.effectiveTo ?? '2026-06-30'),
    retrievedAt: UtcInstant.from(options.retrievedAt ?? '2026-01-02T09:00:00Z'),
    verificationState: VerificationState.from(options.verification ?? VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256((options.version ?? 'source-v2') === 'source-v2' ? 'b'.repeat(64) : 'a'.repeat(64)),
  });
}

const sourceV1 = source();
const sourceV2 = source({
  version: 'source-v2',
  effectiveFrom: '2026-07-01',
  effectiveTo: '2026-12-31',
  retrievedAt: '2026-08-15T09:00:00Z',
});

function activity(version: string, effectivePeriod: CatalogEffectivePeriod): ActivityDefinition {
  return ActivityDefinition.create({
    id: ActivityDefinitionId.from(IDS.activity),
    version: VersionId.from(version),
    preferredLabel: 'Synthetic electrical installation activity',
    aliases: ['Synthetic electrical work'],
    description: 'Synthetic S10 integration fixture; not legal content.',
    jurisdiction: cz,
    effectivePeriod,
    regulatoryStatus: RegulatoryStatus.REGULATED,
    sourceReferenceIds: [sourceId],
  });
}

function profession(version: string, effectivePeriod: CatalogEffectivePeriod): ProfessionDefinition {
  return ProfessionDefinition.create({
    id: ProfessionDefinitionId.from(IDS.profession),
    version: VersionId.from(version),
    preferredLabel: 'Synthetic electrician',
    aliases: ['Synthetic electrical professional'],
    description: 'Synthetic S10 integration fixture; not legal content.',
    jurisdiction: cz,
    effectivePeriod,
    regulatoryStatus: RegulatoryStatus.PARTIALLY_REGULATED,
    sourceReferenceIds: [sourceId],
    externalClassifications: [],
  });
}

function credential(version: string, effectivePeriod: CatalogEffectivePeriod, jurisdiction = cz, id = IDS.credential): CredentialDefinition {
  return CredentialDefinition.create({
    id: CredentialDefinitionId.from(id),
    version: VersionId.from(version),
    code: id === IDS.foreignCredential ? 'CRED.SYNTHETIC.FOREIGN' : 'CRED.SYNTHETIC.ELECTRICIAN',
    preferredLabel: id === IDS.foreignCredential ? 'Synthetic foreign credential' : 'Synthetic electrician credential',
    aliases: [],
    description: 'Synthetic S10 credential fixture; not legal content.',
    jurisdiction,
    effectivePeriod,
    sourceReferenceIds: [sourceId],
  });
}

function requirement(id: string, version: string, code: string, effectivePeriod: CatalogEffectivePeriod): RequirementDefinition {
  return RequirementDefinition.create({
    id: RequirementDefinitionId.from(id),
    version: VersionId.from(version),
    code,
    preferredLabel: `Synthetic ${code}`,
    aliases: [],
    description: 'Synthetic S10 atomic requirement; not legal content.',
    jurisdiction: cz,
    effectivePeriod,
    sourceReferenceIds: [sourceId],
  });
}

interface CatalogVersionFixture {
  readonly activity: ActivityDefinition;
  readonly profession: ProfessionDefinition;
  readonly credential: CredentialDefinition;
  readonly qualification: RequirementDefinition;
  readonly exam: RequirementDefinition;
  readonly set: GovernedRequirementSetVersion;
  readonly path: QualificationPathDefinition;
  readonly source: SourceReference;
  readonly pathBinding: CatalogProvenanceBinding;
}

function catalogVersion(input: {
  readonly suffix: 'v1' | 'v2' | 'v2b';
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly source: SourceReference;
  readonly pathVersion?: string;
}): CatalogVersionFixture {
  const activityNode = activity(`activity-${input.suffix}`, input.effectivePeriod);
  const professionNode = profession(`profession-${input.suffix}`, input.effectivePeriod);
  const credentialNode = credential(`credential-${input.suffix}`, input.effectivePeriod);
  const qualification = requirement(IDS.requirementQualification, `qualification-${input.suffix}`, 'REQ.SYNTHETIC.QUALIFICATION', input.effectivePeriod);
  const exam = requirement(IDS.requirementExam, `exam-${input.suffix}`, 'REQ.SYNTHETIC.EXAM', input.effectivePeriod);
  const requirementIds = [RequirementId.from(qualification.code), RequirementId.from(exam.code)];
  const executableSet = RequirementSet.create({
    id: RequirementSetId.from(IDS.requirementSet),
    version: VersionId.from(`set-${input.suffix}`),
    credentialDefinition: CredentialDefinitionReference.create(credentialNode.id, credentialNode.version),
    requirementIds,
    groups: [RequirementGroup.create({
      code: 'GROUP.ALL',
      mode: RequirementGroupMode.ALL,
      requirementIds,
    })],
  });
  const governedSet = GovernedRequirementSetVersion.create({
    requirementSet: executableSet,
    credentialDefinition: credentialNode,
    requirementDefinitions: [qualification, exam],
    jurisdiction: cz,
    effectivePeriod: input.effectivePeriod,
    sourceReferenceIds: [sourceId],
  });
  const step = QualificationPathStep.create({
    code: 'STEP.SATISFY.REQUIREMENTS',
    type: QualificationPathStepType.SATISFY_REQUIREMENT_SET,
    requirementSetVersion: governedSet,
    sourceReferenceIds: [sourceId],
  });
  const path = QualificationPathDefinition.create({
    id: QualificationPathId.from(IDS.directPath),
    version: VersionId.from(input.pathVersion ?? `path-${input.suffix}`),
    targetCredentialDefinition: credentialNode,
    targetActivityDefinition: activityNode,
    targetProfessionDefinition: professionNode,
    jurisdiction: cz,
    effectivePeriod: input.effectivePeriod,
    steps: [step],
    sourceReferenceIds: [sourceId],
  });
  const provenance = ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.catalogDecision),
    evaluatedAt: UtcInstant.from(input.suffix === 'v1' ? '2026-01-03T09:00:00Z' : '2026-08-16T09:00:00Z'),
    actor: processActor,
    subject: null,
    ruleSetId: RuleSetId.from(IDS.ruleSet),
    ruleVersion: path.version,
    sources: [input.source],
    evidence: [],
  });
  const pathBinding = CatalogProvenanceBinding.create({ target: path, sourceReferences: [input.source], provenance });
  return Object.freeze({ activity: activityNode, profession: professionNode, credential: credentialNode, qualification, exam, set: governedSet, path, source: input.source, pathBinding });
}

const v1 = catalogVersion({ suffix: 'v1', effectivePeriod: OLD_PERIOD, source: sourceV1 });
const v2 = catalogVersion({ suffix: 'v2', effectivePeriod: NEW_PERIOD, source: sourceV2 });
const v2b = catalogVersion({ suffix: 'v2b', effectivePeriod: NEW_PERIOD, source: sourceV2, pathVersion: 'path-v2b' });

function bindingFor(target: ActivityDefinition | ProfessionDefinition | CredentialDefinition | RequirementDefinition | GovernedRequirementSetVersion, ref: SourceReference, evaluatedAt: string): CatalogProvenanceBinding {
  return CatalogProvenanceBinding.create({
    target,
    sourceReferences: [ref],
    provenance: ProvenanceEnvelope.create({
      identity: DecisionId.from(IDS.catalogDecision),
      evaluatedAt: UtcInstant.from(evaluatedAt),
      actor: processActor,
      subject: null,
      ruleSetId: RuleSetId.from(IDS.ruleSet),
      ruleVersion: target.version,
      sources: [ref],
      evidence: [],
    }),
  });
}

const activityBindingV1 = bindingFor(v1.activity, sourceV1, '2026-01-03T09:00:00Z');
const professionBindingV1 = bindingFor(v1.profession, sourceV1, '2026-01-03T09:00:00Z');
const credentialBindingV1 = bindingFor(v1.credential, sourceV1, '2026-01-03T09:00:00Z');
const qualificationBindingV1 = bindingFor(v1.qualification, sourceV1, '2026-01-03T09:00:00Z');
const setBindingV1 = bindingFor(v1.set, sourceV1, '2026-01-03T09:00:00Z');

function evidence(): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(IDS.evidence),
    kind: EvidenceKind.DOCUMENT,
    contentReference: 'object://m04-s10/synthetic-evidence.pdf',
    mediaType: 'application/pdf',
    contentHash: ContentHash.sha256('c'.repeat(64)),
    acquiredAt: UtcInstant.from('2026-05-09T08:00:00Z'),
    acquiredBy: processActor,
    source: sourceV1,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
}

function assessment(input: {
  readonly id: string;
  readonly fixture?: CatalogVersionFixture;
  readonly first: DomainOutcome;
  readonly second: DomainOutcome;
  readonly evaluatedAt: string;
  readonly decisionId: string;
  readonly subjectRef?: SubjectReference;
}): EligibilityAssessment {
  const fixture = input.fixture ?? v1;
  const ev = evidence();
  const evaluatedAt = UtcInstant.from(input.evaluatedAt);
  return EligibilityAssessment.evaluate({
    id: EligibilityAssessmentId.from(input.id),
    subject: input.subjectRef ?? subject,
    credentialDefinition: CredentialDefinitionReference.create(fixture.credential.id, fixture.credential.version),
    requirementSet: fixture.set.requirementSet,
    evaluatedAt,
    evidenceSnapshot: EvidenceSnapshot.capture([ev], UtcInstant.from('2026-05-09T09:00:00Z')),
    atomicResults: [
      AtomicRequirementResult.create({
        requirementId: RequirementId.from(fixture.qualification.code),
        outcome: input.first,
        reasonCodes: [input.first === DomainOutcome.SATISFIED ? 'S10.QUALIFICATION.SATISFIED' : 'S10.QUALIFICATION.UNRESOLVED'],
      }),
      AtomicRequirementResult.create({
        requirementId: RequirementId.from(fixture.exam.code),
        outcome: input.second,
        reasonCodes: [input.second === DomainOutcome.SATISFIED ? 'S10.EXAM.SATISFIED' : 'S10.EXAM.MISSING'],
      }),
    ],
    evaluator: processActor,
    provenance: ProvenanceEnvelope.create({
      identity: DecisionId.from(input.decisionId),
      evaluatedAt,
      actor: processActor,
      subject: input.subjectRef ?? subject,
      ruleSetId: RuleSetId.from(IDS.ruleSet),
      ruleVersion: fixture.set.version,
      sources: [sourceV1],
      evidence: [ev],
    }),
  });
}

const mixedAssessment = assessment({
  id: IDS.mixedAssessment,
  first: DomainOutcome.SATISFIED,
  second: DomainOutcome.NOT_SATISFIED,
  evaluatedAt: '2026-05-10T09:00:00Z',
  decisionId: IDS.eligibilityDecisionA,
});
const satisfiedAssessment = assessment({
  id: IDS.satisfiedAssessment,
  first: DomainOutcome.SATISFIED,
  second: DomainOutcome.SATISFIED,
  evaluatedAt: '2026-05-11T09:00:00Z',
  decisionId: IDS.eligibilityDecisionB,
});

function gap(input: {
  readonly id: string;
  readonly path?: QualificationPathDefinition;
  readonly binding?: CatalogProvenanceBinding;
  readonly assessments?: readonly EligibilityAssessment[];
  readonly routes?: readonly RecognitionRoute[];
  readonly evaluatedAt?: string;
  readonly effectiveOn?: string;
}): GapNavigatorEvaluation {
  return GapNavigatorEvaluation.evaluate({
    id: GapEvaluationId.from(input.id),
    subject,
    path: input.path ?? v1.path,
    pathProvenance: input.binding ?? v1.pathBinding,
    jurisdiction: cz,
    effectiveOn: DateOnly.from(input.effectiveOn ?? '2026-05-01'),
    evaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-05-10T09:30:00Z'),
    eligibilityAssessments: input.assessments ?? [mixedAssessment],
    recognitionRoutes: input.routes ?? [],
  });
}

const mixedGap = gap({ id: IDS.mixedGap });
const satisfiedGap = gap({
  id: IDS.satisfiedGap,
  assessments: [satisfiedAssessment],
  evaluatedAt: '2026-05-11T09:30:00Z',
});

function graph(id: string, evaluation: GapNavigatorEvaluation, refs: readonly SourceReference[], evaluatedAt: string): CatalogQueryExplanationGraph {
  return CatalogQueryExplanationGraph.build({
    id: ExplanationGraphId.from(id),
    gapEvaluation: evaluation,
    sourceReferences: refs,
    evaluatedAt: UtcInstant.from(evaluatedAt),
  });
}

const mixedGraph = graph(IDS.explanation, mixedGap, [sourceV1], '2026-05-10T10:00:00Z');

function recognitionPath(): QualificationPathDefinition {
  return QualificationPathDefinition.create({
    id: QualificationPathId.from(IDS.recognitionPath),
    version: VersionId.from('recognition-path-v1'),
    targetCredentialDefinition: v1.credential,
    targetActivityDefinition: v1.activity,
    targetProfessionDefinition: v1.profession,
    jurisdiction: cz,
    effectivePeriod: OLD_PERIOD,
    steps: [
      QualificationPathStep.create({
        code: 'STEP.REQUEST.RECOGNITION',
        type: QualificationPathStepType.REQUEST_RECOGNITION,
        sourceReferenceIds: [sourceId],
      }),
      QualificationPathStep.create({
        code: 'STEP.AUTHORITY.DECISION',
        type: QualificationPathStepType.OBTAIN_AUTHORITY_DECISION,
        prerequisiteStepCodes: ['STEP.REQUEST.RECOGNITION'],
        sourceReferenceIds: [sourceId],
      }),
    ],
    sourceReferenceIds: [sourceId],
  });
}

const recognitionPathV1 = recognitionPath();
const recognitionPathBinding = CatalogProvenanceBinding.create({
  target: recognitionPathV1,
  sourceReferences: [sourceV1],
  provenance: ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.catalogDecision),
    evaluatedAt: UtcInstant.from('2026-01-03T09:00:00Z'),
    actor: processActor,
    subject: null,
    ruleSetId: RuleSetId.from(IDS.ruleSet),
    ruleVersion: recognitionPathV1.version,
    sources: [sourceV1],
    evidence: [],
  }),
});

function recognitionRoute(id: string, kind: RecognitionRouteKind): RecognitionRoute {
  const foreign = credential('foreign-v1', OLD_PERIOD, eu, IDS.foreignCredential);
  return RecognitionRoute.create({
    id: RecognitionRouteId.from(id),
    kind,
    sourceCredentialDefinition: foreign,
    targetCredentialDefinition: v1.credential,
    jurisdiction: cz,
    effectivePeriod: OLD_PERIOD,
    conditionCodes: ['S10.REVIEW.GOVERNED'],
    sourceReferences: [sourceV1],
    provenance: ProvenanceEnvelope.create({
      identity: DecisionId.from(IDS.routeDecision),
      evaluatedAt: UtcInstant.from('2026-05-01T08:00:00Z'),
      actor: processActor,
      subject: null,
      ruleSetId: RuleSetId.from(IDS.ruleSet),
      ruleVersion: VersionId.from('recognition-route-rule-v1'),
      sources: [sourceV1],
      evidence: [],
    }),
  });
}

const generalRoute = recognitionRoute(IDS.routeGeneral, RecognitionRouteKind.GENERAL_RECOGNITION);
const unknownRoute = recognitionRoute(IDS.routeUnknown, RecognitionRouteKind.UNKNOWN_REVIEW_REQUIRED);
const recognitionGap = gap({
  id: IDS.recognitionGap,
  path: recognitionPathV1,
  binding: recognitionPathBinding,
  assessments: [],
  routes: [generalRoute],
  evaluatedAt: '2026-05-10T11:00:00Z',
});
const reviewGap = gap({
  id: IDS.reviewGap,
  path: recognitionPathV1,
  binding: recognitionPathBinding,
  assessments: [],
  routes: [unknownRoute],
  evaluatedAt: '2026-05-10T11:30:00Z',
});
const recognitionGraph = graph(IDS.recognitionExplanation, recognitionGap, [sourceV1], '2026-05-10T11:10:00Z');
const reviewGraph = graph(IDS.reviewExplanation, reviewGap, [sourceV1], '2026-05-10T11:40:00Z');

function historicalQuery(input: {
  readonly id: string;
  readonly effectiveOn: string;
  readonly asKnownAt: string;
  readonly requestedVersion?: string;
  readonly candidates?: readonly CatalogProvenanceBinding[];
  readonly jurisdiction?: Jurisdiction;
}): HistoricalCatalogVersionQuery {
  return HistoricalCatalogVersionQuery.execute({
    id: HistoricalCatalogQueryId.from(input.id),
    targetKind: CatalogProvenanceTargetKind.QUALIFICATION_PATH,
    targetId: IDS.directPath,
    requestedVersion: input.requestedVersion === undefined ? null : VersionId.from(input.requestedVersion),
    jurisdiction: input.jurisdiction ?? cz,
    effectiveOn: DateOnly.from(input.effectiveOn),
    asKnownAt: UtcInstant.from(input.asKnownAt),
    executedAt: UtcInstant.from('2026-09-16T10:00:00Z'),
    candidates: input.candidates ?? [v1.pathBinding, v2.pathBinding],
  });
}

const oldQuery = historicalQuery({
  id: IDS.queryOld,
  effectiveOn: '2026-05-01',
  asKnownAt: '2026-05-11T00:00:00Z',
});
const newEarlyQuery = historicalQuery({
  id: IDS.queryNewEarly,
  effectiveOn: '2026-07-20',
  asKnownAt: '2026-08-01T00:00:00Z',
});
const newLateQuery = historicalQuery({
  id: IDS.queryNewLate,
  effectiveOn: '2026-07-20',
  asKnownAt: '2026-08-20T00:00:00Z',
});
const oldReplay = HistoricalSnapshotReplay.replay({
  id: HistoricalReplayId.from(IDS.replayOld),
  versionQuery: oldQuery,
  subject,
  gapSnapshots: [mixedGap],
  explanationSnapshots: [mixedGraph],
  replayedAt: UtcInstant.from('2026-09-16T10:05:00Z'),
});

// A — domestic direct qualification integration (01–12)
test('M04S10-01 domestic-fixture-binds-activity-and-profession-identities', () => {
  assert.equal(v1.path.targetActivityDefinition?.id.toString(), IDS.activity);
  assert.equal(v1.path.targetProfessionDefinition?.id.toString(), IDS.profession);
});

test('M04S10-02 domestic-fixture-binds-exact-credential-version', () => {
  assert.equal(v1.path.targetCredentialDefinition.id.toString(), IDS.credential);
  assert.equal(v1.path.targetCredentialDefinition.version.toString(), 'credential-v1');
});

test('M04S10-03 governed-set-preserves-two-executable-requirements-in-order', () => {
  assert.deepEqual(v1.set.requirementSet.requirementIds.map(String), ['REQ.SYNTHETIC.QUALIFICATION', 'REQ.SYNTHETIC.EXAM']);
  assert.deepEqual(v1.set.requirementDefinitions.map((value) => value.code), ['REQ.SYNTHETIC.QUALIFICATION', 'REQ.SYNTHETIC.EXAM']);
});

test('M04S10-04 qualification-path-binds-exact-governed-set-version', () => {
  assert.equal(v1.path.steps[0]?.requirementSetVersion, v1.set);
  assert.equal(v1.path.steps[0]?.requirementSetVersion?.version.toString(), 'set-v1');
});

test('M04S10-05 catalog-provenance-covers-representative-s01-s05-target-kinds', () => {
  assert.deepEqual([
    activityBindingV1.targetKind,
    professionBindingV1.targetKind,
    credentialBindingV1.targetKind,
    qualificationBindingV1.targetKind,
    setBindingV1.targetKind,
    v1.pathBinding.targetKind,
  ], [
    CatalogProvenanceTargetKind.ACTIVITY_DEFINITION,
    CatalogProvenanceTargetKind.PROFESSION_DEFINITION,
    CatalogProvenanceTargetKind.CREDENTIAL_DEFINITION,
    CatalogProvenanceTargetKind.REQUIREMENT_DEFINITION,
    CatalogProvenanceTargetKind.REQUIREMENT_SET_VERSION,
    CatalogProvenanceTargetKind.QUALIFICATION_PATH,
  ]);
});

test('M04S10-06 representative-catalog-sources-are-exact-and-verified', () => {
  for (const binding of [activityBindingV1, professionBindingV1, credentialBindingV1, qualificationBindingV1, setBindingV1, v1.pathBinding]) {
    assert.equal(binding.sourceReferences[0], sourceV1);
    assert.equal(binding.allSourcesVerified(), true);
  }
});

test('M04S10-07 mixed-fv11-assessment-remains-not-satisfied', () => {
  assert.equal(mixedAssessment.outcome, DomainOutcome.NOT_SATISFIED);
  assert.deepEqual(mixedAssessment.atomicResults.map((value) => value.outcome), [DomainOutcome.SATISFIED, DomainOutcome.NOT_SATISFIED]);
});

test('M04S10-08-gap-navigator-preserves-satisfied-and-missing-atomic-results', () => {
  const requirements = mixedGap.items[0]?.requirementItems ?? [];
  assert.equal(requirements[0]?.state, GapItemState.ALREADY_SATISFIED);
  assert.equal(requirements[1]?.state, GapItemState.ACTION_REQUIRED);
});

test('M04S10-09 mixed-path-is-not-falsely-complete', () => {
  assert.equal(mixedGap.items[0]?.state, GapItemState.ACTION_REQUIRED);
  assert.equal(mixedGap.complete, false);
  assert.equal(mixedGap.actionRequiredItems().length, 1);
});

test('M04S10-10 explainability-binds-exact-gap-and-path-version', () => {
  assert.equal(mixedGraph.gapEvaluationId, mixedGap.id.toString());
  assert.equal(mixedGraph.qualificationPathId, v1.path.id.toString());
  assert.equal(mixedGraph.qualificationPathVersion, v1.path.version.toString());
});

test('M04S10-11 action-required-is-explainable-without-being-promoted-to-review', () => {
  assert.equal(mixedGraph.classification, ExplanationClassification.EXPLAINED);
  assert.equal(mixedGraph.unresolvedFacts.length, 0);
});

test('M04S10-12 explanation-links-source-rule-and-evidence-without-new-authority', () => {
  assert.equal(mixedGraph.nodes.some((node) => node.kind === ExplanationNodeKind.SOURCE && node.referenceId === IDS.source), true);
  assert.equal(mixedGraph.nodes.some((node) => node.kind === ExplanationNodeKind.RULE), true);
  assert.equal(mixedGraph.nodes.some((node) => node.kind === ExplanationNodeKind.EVIDENCE && node.referenceId === IDS.evidence), true);
});

// B — recognition route remains procedural/review-governed (13–24)
test('M04S10-13 general-recognition-route-is-available-not-a-decision', () => {
  assert.equal(generalRoute.applicationState(DateOnly.from('2026-05-01'), cz), RecognitionRouteApplicationState.ROUTE_AVAILABLE);
});

test('M04S10-14 recognition-path-explicitly-models-request-and-authority-decision', () => {
  assert.deepEqual(recognitionPathV1.steps.map((step) => step.type), [
    QualificationPathStepType.REQUEST_RECOGNITION,
    QualificationPathStepType.OBTAIN_AUTHORITY_DECISION,
  ]);
});

test('M04S10-15 route-availability-becomes-recognition-possible-not-satisfied', () => {
  assert.equal(recognitionGap.items[0]?.state, GapItemState.RECOGNITION_POSSIBLE);
  assert.notEqual(recognitionGap.items[0]?.state, GapItemState.ALREADY_SATISFIED);
});

test('M04S10-16 recognition-route-never-makes-path-complete', () => {
  assert.equal(recognitionGap.complete, false);
  assert.equal(recognitionGap.metrics.recognitionPossibleSteps, 1);
});

test('M04S10-17 route-provenance-survives-into-gap-rule-references', () => {
  const refs = recognitionGap.items[0]?.ruleReferences ?? [];
  assert.equal(refs.some((ref) => ref.kind === 'RECOGNITION_ROUTE' && ref.id === IDS.routeGeneral), true);
});

test('M04S10-18 authority-decision-step-remains-blocked-by-unresolved-request', () => {
  assert.deepEqual(recognitionGap.items[1]?.blockedByStepCodes, ['STEP.REQUEST.RECOGNITION']);
  assert.equal(recognitionGap.items[1]?.state, GapItemState.ACTION_REQUIRED);
});

test('M04S10-19 unknown-route-is-explicit-review-required', () => {
  assert.equal(unknownRoute.applicationState(DateOnly.from('2026-05-01'), cz), RecognitionRouteApplicationState.REVIEW_REQUIRED);
});

test('M04S10-20 unknown-route-propagates-review-required-into-gap', () => {
  assert.equal(reviewGap.items[0]?.state, GapItemState.REVIEW_REQUIRED);
  assert.equal(reviewGap.complete, false);
});

test('M04S10-21 explainability-preserves-recognition-review-required', () => {
  assert.equal(reviewGraph.classification, ExplanationClassification.REVIEW_REQUIRED);
  assert.equal(reviewGraph.unresolvedFacts.some((fact) => fact.code === 'GAP_REVIEW_REQUIRED'), true);
});

test('M04S10-22 route-json-does-not-contain-recognition-decision-or-authorization-grant', () => {
  const serialized = JSON.stringify(generalRoute.toJSON());
  assert.doesNotMatch(serialized, /RecognitionDecision|AuthorizationGrant|authorizationGrant/);
});

test('M04S10-23 recognition-explanation-does-not-collapse-procedure-into-readiness', () => {
  assert.equal(recognitionGraph.classification, ExplanationClassification.EXPLAINED);
  assert.equal(recognitionGap.complete, false);
  assert.equal(recognitionGraph.nodes.some((node) => node.gapState === GapItemState.RECOGNITION_POSSIBLE), true);
});

test('M04S10-24 recognition-chain-serialization-is-deterministic', () => {
  assert.equal(JSON.stringify(recognitionGap.toJSON()), JSON.stringify(recognitionGap.toJSON()));
  assert.equal(JSON.stringify(recognitionGraph.toJSON()), JSON.stringify(recognitionGraph.toJSON()));
});

// C — historical version query/replay and no hindsight (25–36)
test('M04S10-25 historical-query-selects-old-path-for-old-effective-date', () => {
  assert.equal(oldQuery.state, HistoricalVersionQueryState.SELECTED);
  assert.equal(oldQuery.selected, v1.pathBinding);
});

test('M04S10-26 historical-query-preserves-exact-old-path-version', () => {
  assert.equal(oldQuery.selected?.targetVersion.toString(), 'path-v1');
  assert.deepEqual(oldQuery.knownCandidateVersions, ['path-v1']);
});

test('M04S10-27 retroactively-effective-new-path-is-not-yet-known-before-retrieval', () => {
  assert.equal(newEarlyQuery.state, HistoricalVersionQueryState.NOT_YET_KNOWN);
  assert.equal(newEarlyQuery.selected, null);
});

test('M04S10-28 same-new-path-becomes-selectable-after-knowledge-cutoff', () => {
  assert.equal(newLateQuery.state, HistoricalVersionQueryState.SELECTED);
  assert.equal(newLateQuery.selected, v2.pathBinding);
});

test('M04S10-29 no-hindsight-state-distinguishes-applicable-from-known-candidates', () => {
  assert.deepEqual(newEarlyQuery.candidateVersions, ['path-v2']);
  assert.deepEqual(newEarlyQuery.knownCandidateVersions, []);
});

test('M04S10-30 explicit-old-version-never-falls-forward-into-new-period', () => {
  const query = historicalQuery({
    id: IDS.queryExactOld,
    effectiveOn: '2026-07-20',
    asKnownAt: '2026-08-20T00:00:00Z',
    requestedVersion: 'path-v1',
  });
  assert.equal(query.state, HistoricalVersionQueryState.NOT_FOUND);
  assert.equal(query.selected, null);
});

test('M04S10-31 historical-replay-returns-full-stored-s07-s08-snapshot', () => {
  assert.equal(oldReplay.state, HistoricalReplayState.FULL_SNAPSHOT_REPLAYED);
  assert.equal(oldReplay.gapSnapshot, mixedGap);
  assert.equal(oldReplay.explanationSnapshot, mixedGraph);
});

test('M04S10-32 replay-preserves-exact-gap-object-identity', () => {
  assert.strictEqual(oldReplay.gapSnapshot, mixedGap);
  assert.equal(oldReplay.gapSnapshot?.id.toString(), IDS.mixedGap);
});

test('M04S10-33 replay-preserves-exact-explanation-object-identity', () => {
  assert.strictEqual(oldReplay.explanationSnapshot, mixedGraph);
  assert.equal(oldReplay.explanationSnapshot?.id.toString(), IDS.explanation);
});

test('M04S10-34 replay-serialization-preserves-historical-path-version', () => {
  const serialized = JSON.stringify(oldReplay.toJSON());
  assert.match(serialized, /path-v1/);
  assert.doesNotMatch(serialized, /path-v2/);
});

test('M04S10-35 snapshots-after-knowledge-cutoff-are-not-used', () => {
  const query = historicalQuery({
    id: IDS.queryExactNew,
    effectiveOn: '2026-07-20',
    asKnownAt: '2026-08-20T00:00:00Z',
    requestedVersion: 'path-v2',
  });
  const replay = HistoricalSnapshotReplay.replay({
    id: HistoricalReplayId.from('018f22e2-79b0-7cc3-98c4-dc0c0c0c1045'),
    versionQuery: query,
    subject,
    gapSnapshots: [],
    explanationSnapshots: [],
    replayedAt: UtcInstant.from('2026-09-16T10:06:00Z'),
  });
  assert.equal(replay.state, HistoricalReplayState.CATALOG_VERSION_ONLY);
  assert.equal(replay.gapSnapshot, null);
});

test('M04S10-36 historical-objects-remain-frozen-and-nonrewritable', () => {
  assert.equal(Object.isFrozen(v1.path), true);
  assert.equal(Object.isFrozen(oldQuery), true);
  assert.equal(Object.isFrozen(oldReplay), true);
  assert.throws(() => { (oldReplay as unknown as { state: string }).state = 'REWRITTEN'; }, TypeError);
});

// D — fail-closed ambiguity, source review and integration boundaries (37–48)
test('M04S10-37 overlapping-known-path-versions-fail-closed-to-ambiguity', () => {
  const query = historicalQuery({
    id: IDS.queryAmbiguous,
    effectiveOn: '2026-07-20',
    asKnownAt: '2026-08-20T00:00:00Z',
    candidates: [v2.pathBinding, v2b.pathBinding],
  });
  assert.equal(query.state, HistoricalVersionQueryState.AMBIGUOUS_REVIEW_REQUIRED);
  assert.deepEqual(query.knownCandidateVersions, ['path-v2', 'path-v2b']);
});

test('M04S10-38 exact-requested-version-resolves-overlap-without-ranking', () => {
  const query = historicalQuery({
    id: IDS.queryExactNew,
    effectiveOn: '2026-07-20',
    asKnownAt: '2026-08-20T00:00:00Z',
    requestedVersion: 'path-v2',
    candidates: [v2.pathBinding, v2b.pathBinding],
  });
  assert.equal(query.state, HistoricalVersionQueryState.SELECTED);
  assert.equal(query.selected, v2.pathBinding);
});

test('M04S10-39 wrong-jurisdiction-never-reuses-cz-path', () => {
  const query = historicalQuery({
    id: IDS.queryExactOld,
    effectiveOn: '2026-05-01',
    asKnownAt: '2026-05-11T00:00:00Z',
    jurisdiction: differentJurisdiction,
  });
  assert.equal(query.state, HistoricalVersionQueryState.NOT_FOUND);
});

test('M04S10-40 duplicate-historical-binding-candidates-are-rejected', () => {
  assert.throws(() => historicalQuery({
    id: IDS.queryAmbiguous,
    effectiveOn: '2026-05-01',
    asKnownAt: '2026-05-11T00:00:00Z',
    candidates: [v1.pathBinding, v1.pathBinding],
  }), /unique by target kind\/id\/version\/jurisdiction/i);
});

test('M04S10-41 duplicate-exact-assessments-for-path-set-are-rejected', () => {
  assert.throws(() => gap({
    id: IDS.pathReviewGap,
    assessments: [mixedAssessment, mixedAssessment],
  }), /at most one selected EligibilityAssessment/i);
});

test('M04S10-42 equally-latest-gap-snapshots-fail-closed-in-replay', () => {
  const tiedGap = gap({ id: IDS.gapTie, evaluatedAt: mixedGap.evaluatedAt.toString() });
  const replay = HistoricalSnapshotReplay.replay({
    id: HistoricalReplayId.from(IDS.replayGapTie),
    versionQuery: oldQuery,
    subject,
    gapSnapshots: [mixedGap, tiedGap],
    explanationSnapshots: [],
    replayedAt: UtcInstant.from('2026-09-16T10:07:00Z'),
  });
  assert.equal(replay.state, HistoricalReplayState.AMBIGUOUS_REVIEW_REQUIRED);
  assert.equal(replay.gapSnapshot, null);
});

test('M04S10-43 equally-latest-explanation-snapshots-fail-closed-in-replay', () => {
  const graphA = graph(IDS.graphTieA, mixedGap, [sourceV1], '2026-05-10T10:00:00Z');
  const graphB = graph(IDS.graphTieB, mixedGap, [sourceV1], '2026-05-10T10:00:00Z');
  const replay = HistoricalSnapshotReplay.replay({
    id: HistoricalReplayId.from(IDS.replayExplanationTie),
    versionQuery: oldQuery,
    subject,
    gapSnapshots: [mixedGap],
    explanationSnapshots: [graphA, graphB],
    replayedAt: UtcInstant.from('2026-09-16T10:08:00Z'),
  });
  assert.equal(replay.state, HistoricalReplayState.AMBIGUOUS_REVIEW_REQUIRED);
  assert.strictEqual(replay.gapSnapshot, mixedGap);
  assert.equal(replay.explanationSnapshot, null);
});

test('M04S10-44 unverified-path-source-forces-review-required-gap-state', () => {
  const reviewSource = source({ version: 'source-review', verification: VerificationStateCode.UNVERIFIED });
  const reviewBinding = CatalogProvenanceBinding.create({
    target: v1.path,
    sourceReferences: [reviewSource],
    provenance: ProvenanceEnvelope.create({
      identity: DecisionId.from(IDS.catalogDecision),
      evaluatedAt: UtcInstant.from('2026-01-03T09:00:00Z'),
      actor: processActor,
      subject: null,
      ruleSetId: RuleSetId.from(IDS.ruleSet),
      ruleVersion: v1.path.version,
      sources: [reviewSource],
      evidence: [],
    }),
  });
  const evaluation = gap({ id: IDS.pathReviewGap, binding: reviewBinding });
  assert.equal(evaluation.items[0]?.state, GapItemState.REVIEW_REQUIRED);
  assert.equal(evaluation.complete, false);
});

test('M04S10-45 missing-material-source-in-explanation-is-indeterminate-not-invented', () => {
  const incomplete = graph(IDS.graphTieA, mixedGap, [], '2026-05-10T10:00:00Z');
  assert.equal(incomplete.classification, ExplanationClassification.INDETERMINATE);
  assert.equal(incomplete.unresolvedFacts.some((fact) => fact.code === 'SOURCE_REFERENCE_MISSING'), true);
});

test('M04S10-46 path-comparison-remains-advisory-and-never-selects-a-winner', () => {
  const comparison = compareGapEvaluations([mixedGap, recognitionGap]);
  assert.equal(comparison.advisoryOnly, true);
  assert.equal(comparison.selectedPathId, null);
  assert.equal(comparison.entries.length, 2);
});

test('M04S10-47 integrated-chain-serialization-is-deterministic', () => {
  const first = JSON.stringify({ path: v1.path.toJSON(), gap: mixedGap.toJSON(), graph: mixedGraph.toJSON(), replay: oldReplay.toJSON() });
  const second = JSON.stringify({ path: v1.path.toJSON(), gap: mixedGap.toJSON(), graph: mixedGraph.toJSON(), replay: oldReplay.toJSON() });
  assert.equal(first, second);
});

test('M04S10-48 representative-integration-evidence-creates-no-authorization-or-ui-truth', () => {
  const serialized = JSON.stringify({
    catalog: v1.path.toJSON(),
    gap: mixedGap.toJSON(),
    explanation: mixedGraph.toJSON(),
    historicalReplay: oldReplay.toJSON(),
    recognition: reviewGap.toJSON(),
  });
  assert.doesNotMatch(serialized, /AuthorizationGrant|authorizationGrant|NextBestAction|selectedPathId/);
  assert.equal(otherSubject.id.toString() !== subject.id.toString(), true);
});
