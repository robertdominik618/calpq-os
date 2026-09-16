import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActorId,
  ActorKind,
  ActorReference,
  ActivityDefinition,
  ActivityDefinitionId,
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
  ExplanationGraphId,
  GapEvaluationId,
  GapNavigatorEvaluation,
  GovernedRequirementSetVersion,
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
} from '../src/index.ts';

const IDS = {
  source: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9001',
  authority: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9002',
  process: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9003',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9004',
  otherSubject: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9005',
  ruleSet: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9006',
  provenanceDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9007',
  activity: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9010',
  profession: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9011',
  credential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9012',
  requirement: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9013',
  set: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9014',
  path: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9015',
  query: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9020',
  query2: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9021',
  replay: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9022',
  replay2: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9023',
  gap1: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9030',
  gap2: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9031',
  gap3: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9032',
  graph1: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9040',
  graph2: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9041',
  graph3: '018f22e2-79b0-7cc3-98c4-dc0c0c0b9042',
} as const;

const cz = Jurisdiction.fromCode('CZ');
const eu = Jurisdiction.fromCode('EU');
const sourceId = SourceId.from(IDS.source);
const authority = ActorReference.create(ActorId.from(IDS.authority), ActorKind.EXTERNAL_AUTHORITY);
const processActor = ActorReference.create(ActorId.from(IDS.process), ActorKind.SYSTEM_PROCESS);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);
const otherSubject = SubjectReference.create(SubjectId.from(IDS.otherSubject), SubjectKind.PERSON);

function period(from = '2025-01-01', to: string | null = '2025-12-31'): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({ effectiveFrom: DateOnly.from(from), effectiveTo: to === null ? null : DateOnly.from(to) });
}

function source(options: { version?: string; retrievedAt?: string; verification?: VerificationStateCode } = {}): SourceReference {
  return SourceReference.create({
    id: sourceId,
    authority,
    jurisdiction: cz,
    sourceType: SourceType.REGULATION,
    canonicalLocator: 'urn:calpq:m04:s09:source',
    version: VersionId.from(options.version ?? 'source-1'),
    publicationDate: DateOnly.from('2024-12-15'),
    effectiveFrom: DateOnly.from('2025-01-01'),
    effectiveTo: DateOnly.from('2025-12-31'),
    retrievedAt: UtcInstant.from(options.retrievedAt ?? '2025-01-02T09:00:00Z'),
    verificationState: VerificationState.from(options.verification ?? VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256('9'.repeat(64)),
  });
}

function activity(version = 'activity-1', valuePeriod = period()): ActivityDefinition {
  return ActivityDefinition.create({
    id: ActivityDefinitionId.from(IDS.activity), version: VersionId.from(version), preferredLabel: 'Historical activity', aliases: [], description: 'Historical activity.', jurisdiction: cz, effectivePeriod: valuePeriod, regulatoryStatus: RegulatoryStatus.REGULATED, sourceReferenceIds: [sourceId],
  });
}

function profession(version = 'profession-1', valuePeriod = period()): ProfessionDefinition {
  return ProfessionDefinition.create({
    id: ProfessionDefinitionId.from(IDS.profession), version: VersionId.from(version), preferredLabel: 'Historical profession', aliases: [], description: 'Historical profession.', jurisdiction: cz, effectivePeriod: valuePeriod, regulatoryStatus: RegulatoryStatus.REGULATED, sourceReferenceIds: [sourceId], externalClassifications: [],
  });
}

function credential(version = 'credential-1', valuePeriod = period()): CredentialDefinition {
  return CredentialDefinition.create({
    id: CredentialDefinitionId.from(IDS.credential), version: VersionId.from(version), code: 'CRED.HIST', preferredLabel: 'Historical credential', aliases: [], description: 'Historical credential.', jurisdiction: cz, effectivePeriod: valuePeriod, sourceReferenceIds: [sourceId],
  });
}

function requirement(version = 'requirement-1', valuePeriod = period()): RequirementDefinition {
  return RequirementDefinition.create({
    id: RequirementDefinitionId.from(IDS.requirement), version: VersionId.from(version), code: 'REQ.HIST', preferredLabel: 'Historical requirement', aliases: [], description: 'Historical requirement.', jurisdiction: cz, effectivePeriod: valuePeriod, sourceReferenceIds: [sourceId],
  });
}

function governedSet(version = 'set-1', valuePeriod = period()): GovernedRequirementSetVersion {
  const cred = credential('credential-1', valuePeriod);
  const req = requirement('requirement-1', valuePeriod);
  const requirementIds = [RequirementId.from(req.code)];
  const set = RequirementSet.create({
    id: RequirementSetId.from(IDS.set), version: VersionId.from(version), credentialDefinition: CredentialDefinitionReference.create(cred.id, cred.version), requirementIds,
    groups: [RequirementGroup.create({ code: 'GROUP.ALL', mode: RequirementGroupMode.ALL, requirementIds })],
  });
  return GovernedRequirementSetVersion.create({ requirementSet: set, credentialDefinition: cred, requirementDefinitions: [req], jurisdiction: cz, effectivePeriod: valuePeriod, sourceReferenceIds: [sourceId] });
}

function path(version = 'path-1', valuePeriod = period()): QualificationPathDefinition {
  return QualificationPathDefinition.create({
    id: QualificationPathId.from(IDS.path), version: VersionId.from(version), targetCredentialDefinition: credential('credential-1', valuePeriod), jurisdiction: cz, effectivePeriod: valuePeriod,
    steps: [QualificationPathStep.create({ code: 'STEP.OBTAIN', type: QualificationPathStepType.OBTAIN_CREDENTIAL, sourceReferenceIds: [sourceId] })], sourceReferenceIds: [sourceId],
  });
}

function provenance(ref: SourceReference, version: VersionId, evaluatedAt = '2025-01-03T09:00:00Z'): ProvenanceEnvelope {
  return ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.provenanceDecision), evaluatedAt: UtcInstant.from(evaluatedAt), actor: processActor, subject: null,
    ruleSetId: RuleSetId.from(IDS.ruleSet), ruleVersion: version, sources: [ref], evidence: [],
  });
}

function binding(target: ActivityDefinition | ProfessionDefinition | CredentialDefinition | RequirementDefinition | GovernedRequirementSetVersion | QualificationPathDefinition, options: { ref?: SourceReference; evaluatedAt?: string } = {}): CatalogProvenanceBinding {
  const ref = options.ref ?? source();
  return CatalogProvenanceBinding.create({ target, sourceReferences: [ref], provenance: provenance(ref, target.version, options.evaluatedAt) });
}

function query(candidates: readonly CatalogProvenanceBinding[], options: {
  id?: string;
  kind?: CatalogProvenanceTargetKind;
  targetId?: string;
  requestedVersion?: string | null;
  jurisdiction?: Jurisdiction;
  effectiveOn?: string;
  asKnownAt?: string;
  executedAt?: string;
} = {}): HistoricalCatalogVersionQuery {
  return HistoricalCatalogVersionQuery.execute({
    id: HistoricalCatalogQueryId.from(options.id ?? IDS.query),
    targetKind: options.kind ?? CatalogProvenanceTargetKind.QUALIFICATION_PATH,
    targetId: options.targetId ?? IDS.path,
    requestedVersion: options.requestedVersion === undefined || options.requestedVersion === null ? null : VersionId.from(options.requestedVersion),
    jurisdiction: options.jurisdiction ?? cz,
    effectiveOn: DateOnly.from(options.effectiveOn ?? '2025-06-01'),
    asKnownAt: UtcInstant.from(options.asKnownAt ?? '2025-06-10T00:00:00Z'),
    executedAt: UtcInstant.from(options.executedAt ?? '2026-01-01T00:00:00Z'),
    candidates,
  });
}

function gapSnapshot(valuePath: QualificationPathDefinition, valueBinding: CatalogProvenanceBinding, id: string, evaluatedAt: string, options: { subjectRef?: SubjectReference; effectiveOn?: string } = {}): GapNavigatorEvaluation {
  return GapNavigatorEvaluation.evaluate({
    id: GapEvaluationId.from(id), subject: options.subjectRef ?? subject, path: valuePath, pathProvenance: valueBinding, jurisdiction: cz,
    effectiveOn: DateOnly.from(options.effectiveOn ?? '2025-06-01'), evaluatedAt: UtcInstant.from(evaluatedAt), eligibilityAssessments: [],
  });
}

function explanationSnapshot(gap: GapNavigatorEvaluation, valueBinding: CatalogProvenanceBinding, id: string, evaluatedAt: string): CatalogQueryExplanationGraph {
  return CatalogQueryExplanationGraph.build({ id: ExplanationGraphId.from(id), gapEvaluation: gap, sourceReferences: valueBinding.sourceReferences, evaluatedAt: UtcInstant.from(evaluatedAt) });
}

function replay(versionQuery: HistoricalCatalogVersionQuery, gaps: readonly GapNavigatorEvaluation[] = [], explanations: readonly CatalogQueryExplanationGraph[] = [], options: { id?: string; subjectRef?: SubjectReference; replayedAt?: string } = {}): HistoricalSnapshotReplay {
  return HistoricalSnapshotReplay.replay({
    id: HistoricalReplayId.from(options.id ?? IDS.replay), versionQuery, subject: options.subjectRef ?? subject, gapSnapshots: gaps, explanationSnapshots: explanations,
    replayedAt: UtcInstant.from(options.replayedAt ?? '2026-01-02T00:00:00Z'),
  });
}

// 01-08: all S05 target kinds and exact identity
test('M04S09-01-activity-version-can-be-selected-historically', () => { const b = binding(activity()); assert.equal(query([b], { kind: CatalogProvenanceTargetKind.ACTIVITY_DEFINITION, targetId: IDS.activity }).state, HistoricalVersionQueryState.SELECTED); });
test('M04S09-02-profession-version-can-be-selected-historically', () => { const b = binding(profession()); assert.equal(query([b], { kind: CatalogProvenanceTargetKind.PROFESSION_DEFINITION, targetId: IDS.profession }).selected?.targetVersion.toString(), 'profession-1'); });
test('M04S09-03-credential-version-can-be-selected-historically', () => { const b = binding(credential()); assert.equal(query([b], { kind: CatalogProvenanceTargetKind.CREDENTIAL_DEFINITION, targetId: IDS.credential }).state, HistoricalVersionQueryState.SELECTED); });
test('M04S09-04-requirement-version-can-be-selected-historically', () => { const b = binding(requirement()); assert.equal(query([b], { kind: CatalogProvenanceTargetKind.REQUIREMENT_DEFINITION, targetId: IDS.requirement }).state, HistoricalVersionQueryState.SELECTED); });
test('M04S09-05-requirement-set-version-can-be-selected-historically', () => { const b = binding(governedSet()); assert.equal(query([b], { kind: CatalogProvenanceTargetKind.REQUIREMENT_SET_VERSION, targetId: IDS.set }).state, HistoricalVersionQueryState.SELECTED); });
test('M04S09-06-qualification-path-version-can-be-selected-historically', () => { const b = binding(path()); assert.equal(query([b]).selected?.targetVersion.toString(), 'path-1'); });
test('M04S09-07-wrong-target-id-is-not-found', () => { const b = binding(path()); assert.equal(query([b], { targetId: IDS.credential }).state, HistoricalVersionQueryState.NOT_FOUND); });
test('M04S09-08-wrong-target-kind-is-not-found', () => { const b = binding(path()); assert.equal(query([b], { kind: CatalogProvenanceTargetKind.CREDENTIAL_DEFINITION }).state, HistoricalVersionQueryState.NOT_FOUND); });

// 09-16: valid time versus knowledge time
test('M04S09-09-wrong-jurisdiction-is-not-found', () => { const b = binding(path()); assert.equal(query([b], { jurisdiction: eu }).state, HistoricalVersionQueryState.NOT_FOUND); });
test('M04S09-10-date-before-effective-period-is-not-found', () => { const b = binding(path()); assert.equal(query([b], { effectiveOn: '2024-12-31' }).state, HistoricalVersionQueryState.NOT_FOUND); });
test('M04S09-11-date-after-effective-period-is-not-found', () => { const b = binding(path()); assert.equal(query([b], { effectiveOn: '2026-01-01' }).state, HistoricalVersionQueryState.NOT_FOUND); });
test('M04S09-12-exact-requested-version-never-falls-forward', () => { const a = binding(path('path-1')); const b = binding(path('path-2'), { ref: source({ version: 'source-2' }), evaluatedAt: '2025-01-04T09:00:00Z' }); assert.equal(query([b, a], { requestedVersion: 'path-1' }).selected?.targetVersion.toString(), 'path-1'); });
test('M04S09-13-missing-exact-requested-version-is-not-found', () => { const a = binding(path('path-1')); assert.equal(query([a], { requestedVersion: 'path-9' }).state, HistoricalVersionQueryState.NOT_FOUND); });
test('M04S09-14-effective-version-known-only-later-is-not-yet-known', () => { const late = binding(path(), { ref: source({ retrievedAt: '2025-07-01T09:00:00Z' }), evaluatedAt: '2025-07-02T09:00:00Z' }); assert.equal(query([late], { asKnownAt: '2025-06-10T00:00:00Z' }).state, HistoricalVersionQueryState.NOT_YET_KNOWN); });
test('M04S09-15-source-retrieval-after-cutoff-keeps-version-not-yet-known', () => { const late = binding(path(), { ref: source({ retrievedAt: '2025-06-11T09:00:00Z' }), evaluatedAt: '2025-06-12T09:00:00Z' }); assert.equal(query([late], { asKnownAt: '2025-06-10T00:00:00Z' }).state, HistoricalVersionQueryState.NOT_YET_KNOWN); });
test('M04S09-16-later-known-overlapping-version-does-not-displace-known-history', () => { const old = binding(path('path-1')); const future = binding(path('path-2'), { ref: source({ version: 'source-2', retrievedAt: '2025-07-01T09:00:00Z' }), evaluatedAt: '2025-07-02T09:00:00Z' }); assert.equal(query([future, old], { asKnownAt: '2025-06-10T00:00:00Z' }).selected?.targetVersion.toString(), 'path-1'); });

// 17-24: fail-closed version query and deterministic metadata
test('M04S09-17-two-known-overlapping-versions-require-review', () => { const a = binding(path('path-1')); const b = binding(path('path-2'), { ref: source({ version: 'source-2' }), evaluatedAt: '2025-01-04T09:00:00Z' }); assert.equal(query([a, b]).state, HistoricalVersionQueryState.AMBIGUOUS_REVIEW_REQUIRED); });
test('M04S09-18-duplicate-target-version-candidate-is-rejected', () => { const a = binding(path()); assert.throws(() => query([a, a]), /unique by target kind\/id\/version/i); });
test('M04S09-19-query-execution-cannot-predate-knowledge-cutoff', () => { const a = binding(path()); assert.throws(() => query([a], { asKnownAt: '2026-02-01T00:00:00Z', executedAt: '2026-01-01T00:00:00Z' }), /cannot predate its knowledge cutoff/i); });
test('M04S09-20-selected-unverified-source-preserves-review-flag', () => { const ref = source({ verification: VerificationStateCode.UNVERIFIED }); const a = binding(path(), { ref }); const q = query([a]); assert.equal(q.state, HistoricalVersionQueryState.SELECTED); assert.equal(q.sourceReviewRequired, true); });
test('M04S09-21-candidate-version-list-is-canonical', () => { const a = binding(path('path-2'), { ref: source({ version: 'source-2', retrievedAt: '2025-07-01T09:00:00Z' }), evaluatedAt: '2025-07-02T09:00:00Z' }); const b = binding(path('path-1')); assert.deepEqual(query([a, b]).candidateVersions, ['path-1', 'path-2']); });
test('M04S09-22-known-candidate-versions-exclude-future-knowledge', () => { const a = binding(path('path-1')); const b = binding(path('path-2'), { ref: source({ version: 'source-2', retrievedAt: '2025-07-01T09:00:00Z' }), evaluatedAt: '2025-07-02T09:00:00Z' }); assert.deepEqual(query([a, b]).knownCandidateVersions, ['path-1']); });
test('M04S09-23-query-object-and-version-arrays-are-frozen', () => { const q = query([binding(path())]); assert.ok(Object.isFrozen(q)); assert.ok(Object.isFrozen(q.candidateVersions)); assert.ok(Object.isFrozen(q.knownCandidateVersions)); });
test('M04S09-24-query-serialization-is-deterministic-across-candidate-order', () => { const a = binding(path('path-1')); const b = binding(path('path-2'), { ref: source({ version: 'source-2', retrievedAt: '2025-07-01T09:00:00Z' }), evaluatedAt: '2025-07-02T09:00:00Z' }); assert.deepEqual(query([a, b]).toJSON(), query([b, a]).toJSON()); });

// 25-32: replay selection and exact historical context
 test('M04S09-25-unresolved-version-query-cannot-replay-snapshots', () => { const q = query([], {}); assert.equal(replay(q).state, HistoricalReplayState.VERSION_QUERY_UNRESOLVED); });
test('M04S09-26-selected-non-path-version-replays-catalog-only', () => { const b = binding(credential()); const q = query([b], { kind: CatalogProvenanceTargetKind.CREDENTIAL_DEFINITION, targetId: IDS.credential }); assert.equal(replay(q).state, HistoricalReplayState.CATALOG_VERSION_ONLY); });
test('M04S09-27-selected-path-without-stored-gap-is-catalog-only', () => { const b = binding(path()); assert.equal(replay(query([b])).state, HistoricalReplayState.CATALOG_VERSION_ONLY); });
test('M04S09-28-exact-stored-gap-snapshot-is-replayed', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const r = replay(query([b]), [g]); assert.equal(r.state, HistoricalReplayState.GAP_SNAPSHOT_REPLAYED); assert.equal(r.gapSnapshot, g); });
test('M04S09-29-exact-stored-explanation-completes-full-replay', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const e = explanationSnapshot(g, b, IDS.graph1, '2025-06-03T09:00:00Z'); const r = replay(query([b]), [g], [e]); assert.equal(r.state, HistoricalReplayState.FULL_SNAPSHOT_REPLAYED); assert.equal(r.explanationSnapshot, e); });
test('M04S09-30-gap-for-wrong-subject-is-ignored', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z', { subjectRef: otherSubject }); assert.equal(replay(query([b]), [g]).state, HistoricalReplayState.CATALOG_VERSION_ONLY); });
test('M04S09-31-gap-for-wrong-path-version-is-ignored', () => { const p1 = path('path-1'); const b1 = binding(p1); const p2 = path('path-2'); const b2 = binding(p2, { ref: source({ version: 'source-2' }) }); const g2 = gapSnapshot(p2, b2, IDS.gap2, '2025-06-02T09:00:00Z'); assert.equal(replay(query([b1]), [g2]).state, HistoricalReplayState.CATALOG_VERSION_ONLY); });
test('M04S09-32-gap-for-different-effective-date-is-ignored', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z', { effectiveOn: '2025-06-02' }); assert.equal(replay(query([b]), [g]).state, HistoricalReplayState.CATALOG_VERSION_ONLY); });

// 33-40: cutoff and ambiguity semantics
 test('M04S09-33-gap-created-after-as-known-cutoff-is-ignored', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-07-01T09:00:00Z'); assert.equal(replay(query([b]), [g]).state, HistoricalReplayState.CATALOG_VERSION_ONLY); });
test('M04S09-34-latest-eligible-gap-before-cutoff-is-selected', () => { const p = path(); const b = binding(p); const g1 = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const g2 = gapSnapshot(p, b, IDS.gap2, '2025-06-05T09:00:00Z'); assert.equal(replay(query([b]), [g1, g2]).gapSnapshot, g2); });
test('M04S09-35-tied-latest-gap-snapshots-require-review', () => { const p = path(); const b = binding(p); const g1 = gapSnapshot(p, b, IDS.gap1, '2025-06-05T09:00:00Z'); const g2 = gapSnapshot(p, b, IDS.gap2, '2025-06-05T09:00:00Z'); assert.equal(replay(query([b]), [g1, g2]).state, HistoricalReplayState.AMBIGUOUS_REVIEW_REQUIRED); });
test('M04S09-36-duplicate-gap-evaluation-id-is-rejected', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); assert.throws(() => replay(query([b]), [g, g]), /GapEvaluationId values must be unique/i); });
test('M04S09-37-explanation-for-different-gap-is-ignored', () => { const p = path(); const b = binding(p); const g1 = gapSnapshot(p, b, IDS.gap1, '2025-06-05T09:00:00Z'); const g2 = gapSnapshot(p, b, IDS.gap2, '2025-06-02T09:00:00Z'); const e2 = explanationSnapshot(g2, b, IDS.graph2, '2025-06-03T09:00:00Z'); assert.equal(replay(query([b]), [g1, g2], [e2]).state, HistoricalReplayState.GAP_SNAPSHOT_REPLAYED); });
test('M04S09-38-explanation-created-after-cutoff-is-ignored', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const e = explanationSnapshot(g, b, IDS.graph1, '2025-07-01T09:00:00Z'); assert.equal(replay(query([b]), [g], [e]).state, HistoricalReplayState.GAP_SNAPSHOT_REPLAYED); });
test('M04S09-39-explanation-for-wrong-path-version-is-ignored', () => { const p1 = path('path-1'); const b1 = binding(p1); const g1 = gapSnapshot(p1, b1, IDS.gap1, '2025-06-05T09:00:00Z'); const p2 = path('path-2'); const b2 = binding(p2, { ref: source({ version: 'source-2' }) }); const g2 = gapSnapshot(p2, b2, IDS.gap2, '2025-06-02T09:00:00Z'); const e2 = explanationSnapshot(g2, b2, IDS.graph2, '2025-06-03T09:00:00Z'); assert.equal(replay(query([b1]), [g1], [e2]).state, HistoricalReplayState.GAP_SNAPSHOT_REPLAYED); });
test('M04S09-40-latest-eligible-explanation-before-cutoff-is-selected', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const e1 = explanationSnapshot(g, b, IDS.graph1, '2025-06-03T09:00:00Z'); const e2 = explanationSnapshot(g, b, IDS.graph2, '2025-06-05T09:00:00Z'); assert.equal(replay(query([b]), [g], [e1, e2]).explanationSnapshot, e2); });

// 41-48: replay ambiguity, immutability and snapshot identity
 test('M04S09-41-tied-latest-explanations-require-review', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const e1 = explanationSnapshot(g, b, IDS.graph1, '2025-06-05T09:00:00Z'); const e2 = explanationSnapshot(g, b, IDS.graph2, '2025-06-05T09:00:00Z'); assert.equal(replay(query([b]), [g], [e1, e2]).state, HistoricalReplayState.AMBIGUOUS_REVIEW_REQUIRED); });
test('M04S09-42-duplicate-explanation-graph-id-is-rejected', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const e = explanationSnapshot(g, b, IDS.graph1, '2025-06-03T09:00:00Z'); assert.throws(() => replay(query([b]), [g], [e, e]), /ExplanationGraphId values must be unique/i); });
test('M04S09-43-replay-cannot-predate-version-query-execution', () => { const b = binding(path()); const q = query([b], { executedAt: '2026-01-02T00:00:00Z' }); assert.throws(() => replay(q, [], [], { replayedAt: '2026-01-01T00:00:00Z' }), /cannot predate its version query execution/i); });
test('M04S09-44-replay-object-is-frozen', () => { const b = binding(path()); assert.ok(Object.isFrozen(replay(query([b])))); });
test('M04S09-45-replay-candidate-id-arrays-are-frozen', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const r = replay(query([b]), [g]); assert.ok(Object.isFrozen(r.candidateGapEvaluationIds)); assert.ok(Object.isFrozen(r.candidateExplanationGraphIds)); });
test('M04S09-46-replay-returns-original-gap-snapshot-identity', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); assert.equal(replay(query([b]), [g]).gapSnapshot, g); });
test('M04S09-47-later-snapshot-does-not-rewrite-prior-replay', () => { const p = path(); const b = binding(p); const g1 = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const oldQuery = query([b], { id: IDS.query, asKnownAt: '2025-06-03T00:00:00Z' }); const first = replay(oldQuery, [g1]); const g2 = gapSnapshot(p, b, IDS.gap2, '2025-06-05T09:00:00Z'); const newQuery = query([b], { id: IDS.query2, asKnownAt: '2025-06-10T00:00:00Z' }); const second = replay(newQuery, [g1, g2], [], { id: IDS.replay2 }); assert.equal(first.gapSnapshot, g1); assert.equal(second.gapSnapshot, g2); assert.equal(first.gapSnapshot, g1); });
test('M04S09-48-replay-does-not-mutate-stored-snapshot-serialization', () => { const p = path(); const b = binding(p); const g = gapSnapshot(p, b, IDS.gap1, '2025-06-02T09:00:00Z'); const before = JSON.stringify(g.toJSON()); replay(query([b]), [g]); assert.equal(JSON.stringify(g.toJSON()), before); });
