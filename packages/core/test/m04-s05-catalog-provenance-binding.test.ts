import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActivityDefinition,
  ActivityDefinitionId,
  ActorId,
  ActorKind,
  ActorReference,
  CatalogEffectivePeriod,
  CatalogProvenanceBinding,
  CatalogProvenanceTargetKind,
  ContentHash,
  CredentialDefinition,
  CredentialDefinitionId,
  CredentialDefinitionReference,
  DateOnly,
  DecisionId,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  GovernedRequirementSetVersion,
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
  type CatalogProvenanceTarget,
} from '../src/index.ts';

const IDS = {
  sourceA: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5001',
  sourceB: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5002',
  sourceC: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5003',
  authority: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5004',
  process: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5005',
  decision: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5006',
  rules: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5007',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5008',
  evidence: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5009',
  activity: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5010',
  profession: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5011',
  credential: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5012',
  requirement: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5013',
  requirementSet: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5014',
  path: '018f22e2-79b0-7cc3-98c4-dc0c0c0a5015',
} as const;

const sourceAId = SourceId.from(IDS.sourceA);
const sourceBId = SourceId.from(IDS.sourceB);
const sourceCId = SourceId.from(IDS.sourceC);
const jurisdiction = Jurisdiction.fromCode('CZ');
const authority = ActorReference.create(ActorId.from(IDS.authority), ActorKind.EXTERNAL_AUTHORITY);
const processActor = ActorReference.create(ActorId.from(IDS.process), ActorKind.SYSTEM_PROCESS);

function period(from = '2026-01-01', to: string | null = '2026-12-31'): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({
    effectiveFrom: DateOnly.from(from),
    effectiveTo: to === null ? null : DateOnly.from(to),
  });
}

function source(
  id: SourceId = sourceAId,
  overrides: {
    readonly version?: string;
    readonly verificationState?: VerificationStateCode;
    readonly hashChar?: string | null;
    readonly retrievedAt?: string;
    readonly canonicalLocator?: string | null;
  } = {},
): SourceReference {
  return SourceReference.create({
    id,
    authority,
    jurisdiction,
    sourceType: SourceType.REGULATION,
    canonicalLocator: overrides.canonicalLocator === undefined ? `urn:calpq:source:${id.toString()}` : overrides.canonicalLocator,
    version: VersionId.from(overrides.version ?? 'source-1'),
    publicationDate: DateOnly.from('2025-12-15'),
    effectiveFrom: DateOnly.from('2026-01-01'),
    effectiveTo: DateOnly.from('2026-12-31'),
    retrievedAt: UtcInstant.from(overrides.retrievedAt ?? '2026-01-02T10:00:00Z'),
    verificationState: VerificationState.from(overrides.verificationState ?? VerificationStateCode.VERIFIED),
    contentHash: overrides.hashChar === null ? null : ContentHash.sha256((overrides.hashChar ?? 'a').repeat(64)),
  });
}

function provenance(
  sources: readonly SourceReference[],
  overrides: {
    readonly evaluatedAt?: string;
    readonly subject?: SubjectReference | null;
    readonly evidence?: readonly EvidenceReference[];
  } = {},
): ProvenanceEnvelope {
  return ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.decision),
    evaluatedAt: UtcInstant.from(overrides.evaluatedAt ?? '2026-01-03T10:00:00Z'),
    actor: processActor,
    subject: overrides.subject ?? null,
    ruleSetId: RuleSetId.from(IDS.rules),
    ruleVersion: VersionId.from('catalog-binding-rules-1'),
    sources,
    evidence: overrides.evidence ?? [],
  });
}

function activity(sourceReferenceIds: readonly SourceId[] = [sourceAId], version = 'activity-1'): ActivityDefinition {
  return ActivityDefinition.create({
    id: ActivityDefinitionId.from(IDS.activity),
    version: VersionId.from(version),
    preferredLabel: 'Electrical installation activity',
    aliases: [],
    description: 'Governed regulated activity definition.',
    jurisdiction,
    effectivePeriod: period(),
    regulatoryStatus: RegulatoryStatus.REGULATED,
    sourceReferenceIds,
  });
}

function profession(sourceReferenceIds: readonly SourceId[] = [sourceAId], version = 'profession-1'): ProfessionDefinition {
  return ProfessionDefinition.create({
    id: ProfessionDefinitionId.from(IDS.profession),
    version: VersionId.from(version),
    preferredLabel: 'Electrician',
    aliases: [],
    description: 'Governed profession definition.',
    jurisdiction,
    effectivePeriod: period(),
    regulatoryStatus: RegulatoryStatus.REGULATED,
    sourceReferenceIds,
    externalClassifications: [],
  });
}

function credential(sourceReferenceIds: readonly SourceId[] = [sourceAId], version = 'credential-1'): CredentialDefinition {
  return CredentialDefinition.create({
    id: CredentialDefinitionId.from(IDS.credential),
    version: VersionId.from(version),
    code: 'CRED.ELECTRICIAN.AUTH',
    preferredLabel: 'Electrician authorization',
    aliases: [],
    description: 'Governed credential definition.',
    jurisdiction,
    effectivePeriod: period(),
    sourceReferenceIds,
  });
}

function requirement(sourceReferenceIds: readonly SourceId[] = [sourceBId], version = 'requirement-1'): RequirementDefinition {
  return RequirementDefinition.create({
    id: RequirementDefinitionId.from(IDS.requirement),
    version: VersionId.from(version),
    code: 'REQ.PROFESSIONAL.QUALIFICATION',
    preferredLabel: 'Professional qualification',
    aliases: [],
    description: 'Governed requirement definition.',
    jurisdiction,
    effectivePeriod: period(),
    sourceReferenceIds,
  });
}

function governedRequirementSet(
  sourceReferenceIds: readonly SourceId[] = [sourceCId],
  version = 'requirement-set-1',
): GovernedRequirementSetVersion {
  const credentialDefinition = credential([sourceAId]);
  const requirementDefinition = requirement([sourceBId]);
  const requirementId = RequirementId.from(requirementDefinition.code);
  const executable = RequirementSet.create({
    id: RequirementSetId.from(IDS.requirementSet),
    version: VersionId.from(version),
    credentialDefinition: CredentialDefinitionReference.create(
      credentialDefinition.id,
      credentialDefinition.version,
    ),
    requirementIds: [requirementId],
    groups: [RequirementGroup.create({
      code: 'GROUP.PRIMARY',
      mode: RequirementGroupMode.ALL,
      requirementIds: [requirementId],
    })],
  });
  return GovernedRequirementSetVersion.create({
    requirementSet: executable,
    credentialDefinition,
    requirementDefinitions: [requirementDefinition],
    jurisdiction,
    effectivePeriod: period(),
    sourceReferenceIds,
  });
}

function qualificationPath(
  rootSourceIds: readonly SourceId[] = [sourceAId],
  stepSourceIds: readonly SourceId[] = [sourceBId],
  version = 'path-1',
): QualificationPathDefinition {
  const requirementSetVersion = governedRequirementSet([sourceCId]);
  const step = QualificationPathStep.create({
    code: 'STEP.REQUIREMENTS',
    type: QualificationPathStepType.SATISFY_REQUIREMENT_SET,
    requirementSetVersion,
    sourceReferenceIds: stepSourceIds,
  });
  return QualificationPathDefinition.create({
    id: QualificationPathId.from(IDS.path),
    version: VersionId.from(version),
    targetCredentialDefinition: requirementSetVersion.credentialDefinition,
    jurisdiction,
    effectivePeriod: period(),
    steps: [step],
    sourceReferenceIds: rootSourceIds,
  });
}

function bind(
  target: CatalogProvenanceTarget = activity(),
  sources: readonly SourceReference[] = [source(sourceAId)],
  provenanceEnvelope: ProvenanceEnvelope = provenance(sources),
): CatalogProvenanceBinding {
  return CatalogProvenanceBinding.create({
    target,
    sourceReferences: sources,
    provenance: provenanceEnvelope,
  });
}

test('M04S05-01 activity-definition-target-is-supported', () => {
  assert.equal(bind(activity()).targetKind, CatalogProvenanceTargetKind.ACTIVITY_DEFINITION);
});

test('M04S05-02 profession-definition-target-is-supported', () => {
  assert.equal(bind(profession()).targetKind, CatalogProvenanceTargetKind.PROFESSION_DEFINITION);
});

test('M04S05-03 credential-definition-target-is-supported', () => {
  assert.equal(bind(credential()).targetKind, CatalogProvenanceTargetKind.CREDENTIAL_DEFINITION);
});

test('M04S05-04 requirement-definition-target-is-supported', () => {
  assert.equal(bind(requirement([sourceAId])).targetKind, CatalogProvenanceTargetKind.REQUIREMENT_DEFINITION);
});

test('M04S05-05 governed-requirement-set-target-is-supported', () => {
  assert.equal(bind(governedRequirementSet([sourceAId])).targetKind, CatalogProvenanceTargetKind.REQUIREMENT_SET_VERSION);
});

test('M04S05-06 qualification-path-target-is-supported', () => {
  const target = qualificationPath([sourceAId], [sourceBId]);
  const refs = [source(sourceAId), source(sourceBId)];
  assert.equal(bind(target, refs, provenance([...refs].reverse())).targetKind, CatalogProvenanceTargetKind.QUALIFICATION_PATH);
});

test('M04S05-07 unsupported-target-is-rejected', () => {
  const ref = source(sourceAId);
  assert.throws(() => CatalogProvenanceBinding.create({
    target: {} as unknown as ActivityDefinition,
    sourceReferences: [ref],
    provenance: provenance([ref]),
  }), /supported catalog target/i);
});

test('M04S05-08 source-reference-array-must-be-nonempty', () => {
  assert.throws(() => bind(activity(), [], provenance([])), /at least one SourceReference/i);
});

test('M04S05-09 source-reference-type-is-enforced', () => {
  assert.throws(() => bind(activity(), ['bad'] as unknown as SourceReference[], provenance([source(sourceAId)])), /SourceReference/i);
});

test('M04S05-10 duplicate-source-identity-is-rejected-even-across-versions', () => {
  assert.throws(() => bind(
    activity(),
    [source(sourceAId, { version: 'source-1' }), source(sourceAId, { version: 'source-2' })],
    provenance([source(sourceAId)]),
  ), /unique SourceId/i);
});

test('M04S05-11 missing-required-source-is-rejected', () => {
  const ref = source(sourceAId);
  assert.throws(() => bind(
    activity([sourceAId, sourceBId]),
    [ref],
    provenance([ref]),
  ), /exactly match target SourceId/i);
});

test('M04S05-12 extra-source-is-rejected', () => {
  const refs = [source(sourceAId), source(sourceBId)];
  assert.throws(() => bind(activity([sourceAId]), refs, provenance(refs)), /exactly match target SourceId/i);
});

test('M04S05-13 qualification-path-binding-covers-root-and-step-source-identities', () => {
  const target = qualificationPath([sourceAId], [sourceBId, sourceCId]);
  const refs = [source(sourceAId), source(sourceBId), source(sourceCId)];
  const binding = bind(target, refs, provenance(refs));
  assert.deepEqual(binding.requiredSourceIds.map(String), [IDS.sourceA, IDS.sourceB, IDS.sourceC]);
});

test('M04S05-14 qualification-path-reused-root-step-source-is-deduplicated', () => {
  const target = qualificationPath([sourceAId], [sourceAId]);
  const ref = source(sourceAId);
  const binding = bind(target, [ref], provenance([ref]));
  assert.deepEqual(binding.requiredSourceIds.map(String), [IDS.sourceA]);
});

test('M04S05-15 provenance-envelope-type-is-required', () => {
  assert.throws(() => CatalogProvenanceBinding.create({
    target: activity(),
    sourceReferences: [source(sourceAId)],
    provenance: {} as unknown as ProvenanceEnvelope,
  }), /ProvenanceEnvelope/i);
});

test('M04S05-16 catalog-provenance-must-be-subject-free', () => {
  const ref = source(sourceAId);
  const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);
  assert.throws(() => bind(activity(), [ref], provenance([ref], { subject })), /subject-free/i);
});

test('M04S05-17 catalog-provenance-must-be-evidence-free', () => {
  const ref = source(sourceAId);
  const evidence = EvidenceReference.original({
    id: EvidenceId.from(IDS.evidence),
    kind: EvidenceKind.REGISTRY_RESPONSE,
    contentReference: 'urn:calpq:evidence:s05',
    mediaType: 'application/json',
    contentHash: ContentHash.sha256('e'.repeat(64)),
    acquiredAt: UtcInstant.from('2026-01-02T10:30:00Z'),
    acquiredBy: processActor,
    source: ref,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
  assert.throws(() => bind(activity(), [ref], provenance([ref], { evidence: [evidence] })), /evidence-free/i);
});

test('M04S05-18 provenance-missing-bound-source-is-rejected', () => {
  const refs = [source(sourceAId), source(sourceBId)];
  assert.throws(() => bind(activity([sourceAId, sourceBId]), refs, provenance([refs[0]!])), /exact source snapshots/i);
});

test('M04S05-19 provenance-extra-source-is-rejected', () => {
  const bound = [source(sourceAId)];
  const provRefs = [bound[0]!, source(sourceBId)];
  assert.throws(() => bind(activity(), bound, provenance(provRefs)), /exact source snapshots/i);
});

test('M04S05-20 provenance-source-version-mismatch-is-rejected', () => {
  const bound = source(sourceAId, { version: 'source-1' });
  const mismatched = source(sourceAId, { version: 'source-2' });
  assert.throws(() => bind(activity(), [bound], provenance([mismatched])), /exact source snapshots/i);
});

test('M04S05-21 provenance-source-state-or-hash-mismatch-is-rejected', () => {
  const bound = source(sourceAId, { version: 'source-1', verificationState: VerificationStateCode.VERIFIED, hashChar: 'a' });
  const mismatched = source(sourceAId, { version: 'source-1', verificationState: VerificationStateCode.STALE, hashChar: 'b' });
  assert.throws(() => bind(activity(), [bound], provenance([mismatched])), /exact source snapshots/i);
});

test('M04S05-22 provenance-evaluation-cannot-predate-source-retrieval', () => {
  const ref = source(sourceAId, { retrievedAt: '2026-02-02T10:00:00Z' });
  assert.throws(() => bind(activity(), [ref], provenance([ref], { evaluatedAt: '2026-02-01T10:00:00Z' })), /cannot predate/i);
});

test('M04S05-23 source-order-is-nonsemantic-and-canonicalized', () => {
  const target = activity([sourceBId, sourceAId]);
  const a = source(sourceAId);
  const b = source(sourceBId);
  const binding = bind(target, [b, a], provenance([a, b]));
  assert.deepEqual(binding.sourceReferences.map((value) => value.id.toString()), [IDS.sourceA, IDS.sourceB]);
});

test('M04S05-24 required-source-identities-are-immutable', () => {
  const binding = bind();
  assert.equal(Object.isFrozen(binding.requiredSourceIds), true);
  assert.throws(() => (binding.requiredSourceIds as SourceId[]).push(sourceBId), TypeError);
});

test('M04S05-25 bound-source-reference-array-is-immutable', () => {
  const binding = bind();
  assert.equal(Object.isFrozen(binding.sourceReferences), true);
  assert.throws(() => (binding.sourceReferences as SourceReference[]).push(source(sourceBId)), TypeError);
});

test('M04S05-26 binding-root-is-immutable', () => {
  const binding = bind();
  assert.equal(Object.isFrozen(binding), true);
  assert.throws(() => { (binding as unknown as { targetId: string }).targetId = 'rewritten'; }, TypeError);
});

test('M04S05-27 exact-target-identity-is-preserved', () => {
  assert.equal(bind(activity()).targetId, IDS.activity);
});

test('M04S05-28 exact-target-version-is-preserved', () => {
  assert.equal(bind(activity([sourceAId], 'activity-historical-7')).targetVersion.toString(), 'activity-historical-7');
});

test('M04S05-29 exact-source-version-is-preserved', () => {
  const ref = source(sourceAId, { version: 'law-2026.4' });
  const json = bind(activity(), [ref], provenance([ref])).toJSON() as any;
  assert.equal(json.sourceReferences[0].version, 'law-2026.4');
});

test('M04S05-30 exact-source-authority-is-preserved', () => {
  const ref = source(sourceAId);
  const json = bind(activity(), [ref], provenance([ref])).toJSON() as any;
  assert.deepEqual(json.sourceReferences[0].authority, authority.toJSON());
});

test('M04S05-31 source-jurisdiction-type-and-locator-are-preserved', () => {
  const ref = source(sourceAId, { canonicalLocator: 'https://authority.example/rule/1' });
  const json = bind(activity(), [ref], provenance([ref])).toJSON() as any;
  assert.equal(json.sourceReferences[0].jurisdiction.code, 'CZ');
  assert.equal(json.sourceReferences[0].sourceType, SourceType.REGULATION);
  assert.equal(json.sourceReferences[0].canonicalLocator, 'https://authority.example/rule/1');
});

test('M04S05-32 source-publication-and-effective-dates-are-preserved', () => {
  const ref = source(sourceAId);
  const json = bind(activity(), [ref], provenance([ref])).toJSON() as any;
  assert.equal(json.sourceReferences[0].publicationDate, '2025-12-15');
  assert.equal(json.sourceReferences[0].effectiveFrom, '2026-01-01');
  assert.equal(json.sourceReferences[0].effectiveTo, '2026-12-31');
});

test('M04S05-33 source-retrieval-instant-is-preserved', () => {
  const ref = source(sourceAId, { retrievedAt: '2026-01-02T12:34:56Z' });
  const json = bind(activity(), [ref], provenance([ref])).toJSON() as any;
  assert.equal(json.sourceReferences[0].retrievedAt, '2026-01-02T12:34:56.000Z');
});

test('M04S05-34 source-verification-state-is-preserved-without-promotion', () => {
  const ref = source(sourceAId, { verificationState: VerificationStateCode.REVIEW_REQUIRED });
  const json = bind(activity(), [ref], provenance([ref])).toJSON() as any;
  assert.equal(json.sourceReferences[0].verificationState, VerificationStateCode.REVIEW_REQUIRED);
});

test('M04S05-35 source-content-hash-is-preserved', () => {
  const ref = source(sourceAId, { hashChar: 'c' });
  const json = bind(activity(), [ref], provenance([ref])).toJSON() as any;
  assert.equal(json.sourceReferences[0].contentHash, `sha256:${'c'.repeat(64)}`);
});

test('M04S05-36 all-sources-verified-is-true-only-when-every-source-is-verified', () => {
  const refs = [source(sourceAId), source(sourceBId)];
  const binding = bind(activity([sourceAId, sourceBId]), refs, provenance(refs));
  assert.equal(binding.allSourcesVerified(), true);
  assert.equal(binding.requiresSourceReview(), false);
});

test('M04S05-37 unverified-source-remains-reviewable-and-is-not-promoted', () => {
  const ref = source(sourceAId, { verificationState: VerificationStateCode.UNVERIFIED });
  const binding = bind(activity(), [ref], provenance([ref]));
  assert.equal(binding.allSourcesVerified(), false);
  assert.equal(binding.requiresSourceReview(), true);
  assert.equal(ref.verificationState.toString(), VerificationStateCode.UNVERIFIED);
});

test('M04S05-38 stale-source-remains-reviewable-and-is-not-promoted', () => {
  const ref = source(sourceAId, { verificationState: VerificationStateCode.STALE });
  const binding = bind(activity(), [ref], provenance([ref]));
  assert.equal(binding.allSourcesVerified(), false);
  assert.equal(ref.verificationState.toString(), VerificationStateCode.STALE);
});

test('M04S05-39 failed-review-required-and-not-applicable-states-remain-nonverified', () => {
  for (const state of [
    VerificationStateCode.FAILED,
    VerificationStateCode.REVIEW_REQUIRED,
    VerificationStateCode.NOT_APPLICABLE,
  ]) {
    const ref = source(sourceAId, { verificationState: state });
    assert.equal(bind(activity(), [ref], provenance([ref])).allSourcesVerified(), false);
    assert.equal(ref.verificationState.toString(), state);
  }
});

test('M04S05-40 serialization-is-deterministic-and-canonical', () => {
  const target = activity([sourceBId, sourceAId]);
  const refs = [source(sourceBId), source(sourceAId)];
  const first = bind(target, refs, provenance(refs));
  const second = bind(target, [...refs].reverse(), provenance([...refs].reverse()));
  assert.equal(JSON.stringify(first.toJSON()), JSON.stringify(second.toJSON()));
});

test('M04S05-41 historical-source-version-bindings-remain-independent', () => {
  const v1 = source(sourceAId, { version: 'law-v1', hashChar: 'a' });
  const v2 = source(sourceAId, { version: 'law-v2', hashChar: 'b' });
  const first = bind(activity(), [v1], provenance([v1]));
  const second = bind(activity(), [v2], provenance([v2]));
  assert.equal((first.toJSON() as any).sourceReferences[0].version, 'law-v1');
  assert.equal((second.toJSON() as any).sourceReferences[0].version, 'law-v2');
  assert.equal((first.toJSON() as any).sourceReferences[0].version, 'law-v1');
});

test('M04S05-42 architecture-retains-no-s06-plus-evidence-verification-or-ambient-authority', () => {
  const sourceText = readFileSync('packages/core/src/catalog/catalog-provenance-binding.ts', 'utf8');
  assert.doesNotMatch(sourceText, /\bEquivalenceDecision\b|\bGapNavigator\b|\bAuthorizationGrant\b|EligibilityAssessment\.evaluate/);
  assert.doesNotMatch(sourceText, /\bCredentialArtifact\b|\bEvidenceSnapshot\b|SourceReference\.create|ProvenanceEnvelope\.create|VerificationState\.from/);
  assert.doesNotMatch(sourceText, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(sourceText, /from ['"](?:react|react-native|expo|next|vue|svelte|openai|@anthropic-ai|aws-sdk|@aws-sdk)/);
  for (const path of [
    'packages/core/src/catalog/activity-profession-catalog.ts',
    'packages/core/src/catalog/credential-requirement-catalog.ts',
    'packages/core/src/catalog/requirement-set-versioning.ts',
    'packages/core/src/catalog/qualification-path.ts',
  ]) {
    assert.doesNotMatch(readFileSync(path, 'utf8'), /CatalogProvenanceBinding/);
  }
});
