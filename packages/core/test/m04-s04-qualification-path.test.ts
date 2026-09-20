import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActivityDefinition,
  ActivityDefinitionId,
  CatalogEffectivePeriod,
  CredentialDefinition,
  CredentialDefinitionId,
  CredentialDefinitionReference,
  DateOnly,
  GovernedRequirementSetVersion,
  Jurisdiction,
  ProfessionDefinition,
  ProfessionDefinitionId,
  QualificationPathDefinition,
  QualificationPathId,
  QualificationPathSelectionState,
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
  SourceId,
  VersionId,
  selectQualificationPath,
} from '../src/index.ts';

const PATH_A = '018f22e2-79b0-7cc3-98c4-dc0c0c090001';
const PATH_B = '018f22e2-79b0-7cc3-98c4-dc0c0c090002';
const ACTIVITY_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090003';
const PROFESSION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090004';
const CREDENTIAL_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090005';
const REQUIREMENT_A_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090006';
const REQUIREMENT_B_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090007';
const REQUIREMENT_SET_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090008';
const SOURCE_A = '018f22e2-79b0-7cc3-98c4-dc0c0c090009';
const SOURCE_B = '018f22e2-79b0-7cc3-98c4-dc0c0c09000a';

const pathAId = QualificationPathId.from(PATH_A);
const pathBId = QualificationPathId.from(PATH_B);
const activityId = ActivityDefinitionId.from(ACTIVITY_ID);
const professionId = ProfessionDefinitionId.from(PROFESSION_ID);
const credentialId = CredentialDefinitionId.from(CREDENTIAL_ID);
const requirementAId = RequirementDefinitionId.from(REQUIREMENT_A_ID);
const requirementBId = RequirementDefinitionId.from(REQUIREMENT_B_ID);
const requirementSetId = RequirementSetId.from(REQUIREMENT_SET_ID);
const sourceA = SourceId.from(SOURCE_A);
const sourceB = SourceId.from(SOURCE_B);
const cz = Jurisdiction.fromCode('CZ');

function period(from = '2026-01-01', to: string | null = null): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({
    effectiveFrom: DateOnly.from(from),
    effectiveTo: to === null ? null : DateOnly.from(to),
  });
}

function activity(overrides: Partial<Parameters<typeof ActivityDefinition.create>[0]> = {}): ActivityDefinition {
  return ActivityDefinition.create({
    id: activityId,
    version: VersionId.from('activity-1'),
    preferredLabel: 'Electrical installation activity',
    aliases: [],
    description: 'Governed target activity.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01'),
    regulatoryStatus: RegulatoryStatus.REGULATED,
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function profession(overrides: Partial<Parameters<typeof ProfessionDefinition.create>[0]> = {}): ProfessionDefinition {
  return ProfessionDefinition.create({
    id: professionId,
    version: VersionId.from('profession-1'),
    preferredLabel: 'Electrician',
    aliases: [],
    description: 'Governed target profession.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01'),
    regulatoryStatus: RegulatoryStatus.REGULATED,
    sourceReferenceIds: [sourceA],
    externalClassifications: [],
    ...overrides,
  });
}

function credential(overrides: Partial<Parameters<typeof CredentialDefinition.create>[0]> = {}): CredentialDefinition {
  return CredentialDefinition.create({
    id: credentialId,
    version: VersionId.from('credential-1'),
    code: 'CRED.ELECTRICIAN.AUTH',
    preferredLabel: 'Electrician authorization',
    aliases: [],
    description: 'Governed target credential.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01'),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function requirementA(overrides: Partial<Parameters<typeof RequirementDefinition.create>[0]> = {}): RequirementDefinition {
  return RequirementDefinition.create({
    id: requirementAId,
    version: VersionId.from('requirement-a-1'),
    code: 'REQ.QUALIFICATION',
    preferredLabel: 'Qualification',
    aliases: [],
    description: 'Qualification requirement.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01'),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function requirementB(overrides: Partial<Parameters<typeof RequirementDefinition.create>[0]> = {}): RequirementDefinition {
  return RequirementDefinition.create({
    id: requirementBId,
    version: VersionId.from('requirement-b-1'),
    code: 'REQ.EXAM',
    preferredLabel: 'Exam',
    aliases: [],
    description: 'Exam requirement.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01'),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function executableRequirementSet(
  version = 'requirement-set-1',
  credentialDefinition = credential(),
): RequirementSet {
  const requirementAIdRuntime = RequirementId.from('REQ.QUALIFICATION');
  const requirementBIdRuntime = RequirementId.from('REQ.EXAM');
  return RequirementSet.create({
    id: requirementSetId,
    version: VersionId.from(version),
    credentialDefinition: CredentialDefinitionReference.create(
      credentialDefinition.id,
      credentialDefinition.version,
    ),
    requirementIds: [requirementAIdRuntime, requirementBIdRuntime],
    groups: [
      RequirementGroup.create({
        code: 'GROUP.ALL',
        mode: RequirementGroupMode.ALL,
        requirementIds: [requirementAIdRuntime, requirementBIdRuntime],
      }),
    ],
  });
}

function governedRequirementSet(
  overrides: Partial<Parameters<typeof GovernedRequirementSetVersion.create>[0]> = {},
): GovernedRequirementSetVersion {
  const cred = (overrides.credentialDefinition as CredentialDefinition | undefined) ?? credential();
  const requirementSet = (overrides.requirementSet as RequirementSet | undefined)
    ?? executableRequirementSet('requirement-set-1', cred);
  return GovernedRequirementSetVersion.create({
    requirementSet,
    credentialDefinition: cred,
    requirementDefinitions: [requirementA(), requirementB()],
    jurisdiction: cz,
    effectivePeriod: period('2026-01-01', '2028-12-31'),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function satisfyStep(
  overrides: Partial<Parameters<typeof QualificationPathStep.create>[0]> = {},
): QualificationPathStep {
  return QualificationPathStep.create({
    code: 'STEP.REQUIREMENTS',
    type: QualificationPathStepType.SATISFY_REQUIREMENT_SET,
    prerequisiteStepCodes: [],
    alternativeGroupCode: null,
    requirementSetVersion: governedRequirementSet(),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function examStep(
  overrides: Partial<Parameters<typeof QualificationPathStep.create>[0]> = {},
): QualificationPathStep {
  return QualificationPathStep.create({
    code: 'STEP.EXAM',
    type: QualificationPathStepType.PASS_EXAM_OR_ASSESSMENT,
    prerequisiteStepCodes: ['STEP.REQUIREMENTS'],
    alternativeGroupCode: null,
    requirementSetVersion: null,
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function path(
  overrides: Partial<Parameters<typeof QualificationPathDefinition.create>[0]> = {},
): QualificationPathDefinition {
  return QualificationPathDefinition.create({
    id: pathAId,
    version: VersionId.from('path-1'),
    targetCredentialDefinition: credential(),
    targetActivityDefinition: activity(),
    targetProfessionDefinition: profession(),
    jurisdiction: cz,
    effectivePeriod: period('2026-01-01', '2027-12-31'),
    steps: [satisfyStep(), examStep()],
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

test('M04S04-01 qualification-path-id-is-stable-calpq-uuidv7', () => {
  assert.equal(pathAId.toString(), PATH_A);
  assert.throws(() => QualificationPathId.from('PATH-A'), /UUIDv7/i);
});

test('M04S04-02 qualification-path-requires-explicit-version', () => {
  assert.throws(() => path({ version: 'path-1' as unknown as VersionId }), /requires VersionId/i);
});

test('M04S04-03 target-credential-definition-type-is-enforced', () => {
  assert.throws(
    () => path({ targetCredentialDefinition: 'credential' as unknown as CredentialDefinition }),
    /requires CredentialDefinition/i,
  );
});

test('M04S04-04 optional-activity-and-profession-target-types-are-enforced', () => {
  assert.throws(
    () => path({ targetActivityDefinition: 'activity' as unknown as ActivityDefinition }),
    /activity target must use ActivityDefinition/i,
  );
  assert.throws(
    () => path({ targetProfessionDefinition: 'profession' as unknown as ProfessionDefinition }),
    /profession target must use ProfessionDefinition/i,
  );
});

test('M04S04-05 credential-target-jurisdiction-must-match-exactly', () => {
  assert.throws(
    () => path({ targetCredentialDefinition: credential({ jurisdiction: Jurisdiction.fromCode('EU') }) }),
    /CredentialDefinition jurisdiction must match/i,
  );
});

test('M04S04-06 activity-and-profession-jurisdictions-must-match-exactly', () => {
  assert.throws(
    () => path({ targetActivityDefinition: activity({ jurisdiction: Jurisdiction.fromCode('EU') }) }),
    /ActivityDefinition jurisdiction must match/i,
  );
  assert.throws(
    () => path({ targetProfessionDefinition: profession({ jurisdiction: Jurisdiction.fromCode('EU') }) }),
    /ProfessionDefinition jurisdiction must match/i,
  );
});

test('M04S04-07 path-effective-period-must-be-contained-in-credential-period', () => {
  assert.throws(
    () => path({
      targetCredentialDefinition: credential({ effectivePeriod: period('2026-06-01', '2026-12-31') }),
    }),
    /contained in CredentialDefinition period/i,
  );
});

test('M04S04-08 path-effective-period-must-be-contained-in-activity-and-profession-periods', () => {
  assert.throws(
    () => path({ targetActivityDefinition: activity({ effectivePeriod: period('2026-06-01') }) }),
    /contained in ActivityDefinition period/i,
  );
  assert.throws(
    () => path({ targetProfessionDefinition: profession({ effectivePeriod: period('2026-06-01') }) }),
    /contained in ProfessionDefinition period/i,
  );
});

test('M04S04-09 path-step-code-is-controlled', () => {
  assert.equal(
    examStep({ code: '  STEP.EXAM.FINAL  ' }).code,
    'STEP.EXAM.FINAL',
  );
  assert.throws(() => examStep({ code: 'step free text' }), /controlled uppercase/i);
});

test('M04S04-10 path-step-type-is-controlled', () => {
  assert.throws(
    () => examStep({ type: 'FREE_FORM' as typeof QualificationPathStepType.PASS_EXAM_OR_ASSESSMENT }),
    /type must be controlled/i,
  );
});

test('M04S04-11 satisfy-requirement-set-step-requires-governed-s03-snapshot', () => {
  assert.throws(
    () => satisfyStep({ requirementSetVersion: null }),
    /requires GovernedRequirementSetVersion/i,
  );
});

test('M04S04-12 non-satisfy-step-cannot-carry-requirement-set-snapshot', () => {
  assert.throws(
    () => examStep({ requirementSetVersion: governedRequirementSet() }),
    /Only SATISFY_REQUIREMENT_SET/i,
  );
});

test('M04S04-13 prerequisite-codes-are-normalized-and-frozen', () => {
  const step = examStep({ prerequisiteStepCodes: ['  STEP.REQUIREMENTS  '] });
  assert.deepEqual(step.prerequisiteStepCodes, ['STEP.REQUIREMENTS']);
  assert.equal(Object.isFrozen(step.prerequisiteStepCodes), true);
});

test('M04S04-14 duplicate-prerequisite-codes-are-rejected', () => {
  assert.throws(
    () => examStep({ prerequisiteStepCodes: ['STEP.REQUIREMENTS', 'STEP.REQUIREMENTS'] }),
    /must be unique/i,
  );
});

test('M04S04-15 step-source-identities-are-required', () => {
  assert.throws(() => examStep({ sourceReferenceIds: [] }), /at least one source reference ID/i);
});

test('M04S04-16 step-source-identities-are-typed-unique-and-frozen', () => {
  assert.throws(
    () => examStep({ sourceReferenceIds: ['source'] as unknown as SourceId[] }),
    /must use SourceId/i,
  );
  assert.throws(() => examStep({ sourceReferenceIds: [sourceA, sourceA] }), /must be unique/i);
  assert.equal(Object.isFrozen(examStep({ sourceReferenceIds: [sourceA, sourceB] }).sourceReferenceIds), true);
});

test('M04S04-17 path-source-identities-are-required-typed-unique-and-frozen', () => {
  assert.throws(() => path({ sourceReferenceIds: [] }), /at least one source reference ID/i);
  assert.throws(
    () => path({ sourceReferenceIds: ['source'] as unknown as SourceId[] }),
    /must use SourceId/i,
  );
  assert.throws(() => path({ sourceReferenceIds: [sourceA, sourceA] }), /must be unique/i);
  assert.equal(Object.isFrozen(path({ sourceReferenceIds: [sourceA, sourceB] }).sourceReferenceIds), true);
});

test('M04S04-18 qualification-path-requires-at-least-one-step', () => {
  assert.throws(() => path({ steps: [] }), /requires path steps/i);
});

test('M04S04-19 qualification-path-step-instance-is-enforced', () => {
  assert.throws(
    () => path({ steps: ['STEP'] as unknown as QualificationPathStep[] }),
    /steps must use QualificationPathStep/i,
  );
});

test('M04S04-20 qualification-path-step-codes-must-be-unique', () => {
  const first = examStep({ code: 'STEP.DUP', prerequisiteStepCodes: [] });
  const second = examStep({ code: 'STEP.DUP', prerequisiteStepCodes: [] });
  assert.throws(() => path({ steps: [first, second] }), /step codes must be unique/i);
});

test('M04S04-21 unknown-prerequisite-is-rejected', () => {
  const step = examStep({ prerequisiteStepCodes: ['STEP.UNKNOWN'] });
  assert.throws(() => path({ steps: [step] }), /unknown step STEP.UNKNOWN/i);
});

test('M04S04-22 self-prerequisite-is-rejected', () => {
  const step = examStep({ code: 'STEP.SELF', prerequisiteStepCodes: ['STEP.SELF'] });
  assert.throws(() => path({ steps: [step] }), /cannot require itself/i);
});

test('M04S04-23 prerequisite-cycle-is-rejected', () => {
  const first = examStep({ code: 'STEP.A', prerequisiteStepCodes: ['STEP.B'] });
  const second = examStep({ code: 'STEP.B', prerequisiteStepCodes: ['STEP.A'] });
  assert.throws(() => path({ steps: [first, second] }), /acyclic graph/i);
});

test('M04S04-24 valid-prerequisite-dag-is-preserved', () => {
  const first = examStep({ code: 'STEP.A', prerequisiteStepCodes: [] });
  const second = examStep({ code: 'STEP.B', prerequisiteStepCodes: ['STEP.A'] });
  const third = examStep({ code: 'STEP.C', prerequisiteStepCodes: ['STEP.B'] });
  const node = path({ steps: [first, second, third] });
  assert.deepEqual(node.steps[2]?.prerequisiteStepCodes, ['STEP.B']);
});

test('M04S04-25 alternative-group-code-is-controlled', () => {
  assert.throws(
    () => examStep({ alternativeGroupCode: 'alternative group' }),
    /alternative group code must use controlled uppercase/i,
  );
});

test('M04S04-26 alternative-group-requires-at-least-two-member-steps', () => {
  const first = examStep({
    code: 'STEP.A',
    prerequisiteStepCodes: [],
    alternativeGroupCode: 'ALT.ROUTE',
  });
  assert.throws(() => path({ steps: [first] }), /requires at least two steps/i);
});

test('M04S04-27 valid-alternative-group-remains-explicit-without-resolution', () => {
  const first = examStep({
    code: 'STEP.A',
    prerequisiteStepCodes: [],
    alternativeGroupCode: 'ALT.ROUTE',
  });
  const second = examStep({
    code: 'STEP.B',
    prerequisiteStepCodes: [],
    alternativeGroupCode: 'ALT.ROUTE',
  });
  const node = path({ steps: [first, second] });
  assert.equal(node.steps[0]?.alternativeGroupCode, 'ALT.ROUTE');
  assert.equal(node.steps[1]?.alternativeGroupCode, 'ALT.ROUTE');
  assert.equal('selectedAlternative' in node, false);
});

test('M04S04-28 bound-requirement-set-jurisdiction-must-match-path', () => {
  const euCredential = credential({ jurisdiction: Jurisdiction.fromCode('EU') });
  const euRequirementA = requirementA({ jurisdiction: Jurisdiction.fromCode('EU') });
  const euRequirementB = requirementB({ jurisdiction: Jurisdiction.fromCode('EU') });
  const euSet = GovernedRequirementSetVersion.create({
    requirementSet: executableRequirementSet('requirement-set-eu', euCredential),
    credentialDefinition: euCredential,
    requirementDefinitions: [euRequirementA, euRequirementB],
    jurisdiction: Jurisdiction.fromCode('EU'),
    effectivePeriod: period('2026-01-01', '2028-12-31'),
    sourceReferenceIds: [sourceA],
  });
  assert.throws(
    () => path({ steps: [satisfyStep({ requirementSetVersion: euSet })] }),
    /RequirementSetVersion jurisdiction must match/i,
  );
});

test('M04S04-29 bound-requirement-set-period-must-contain-path-period', () => {
  const narrowSet = governedRequirementSet({
    effectivePeriod: period('2026-06-01', '2026-12-31'),
  });
  assert.throws(
    () => path({ steps: [satisfyStep({ requirementSetVersion: narrowSet })] }),
    /contained in RequirementSetVersion period/i,
  );
});

test('M04S04-30 exact-s03-requirement-set-snapshot-is-preserved-without-recomputation', () => {
  const governed = governedRequirementSet();
  const step = satisfyStep({ requirementSetVersion: governed });
  const node = path({ steps: [step] });
  assert.equal(node.steps[0]?.requirementSetVersion, governed);
  assert.equal(governed.toExecutableRequirementSet(), governed.requirementSet);
  assert.equal('outcome' in node, false);
});

test('M04S04-31 path-root-and-nested-arrays-are-immutable', () => {
  const node = path();
  assert.equal(Object.isFrozen(node), true);
  assert.equal(Object.isFrozen(node.steps), true);
  assert.equal(Object.isFrozen(node.steps[0]?.prerequisiteStepCodes), true);
  assert.equal(Object.isFrozen(node.sourceReferenceIds), true);
});

test('M04S04-32 serialization-is-deterministic', () => {
  assert.equal(JSON.stringify(path().toJSON()), JSON.stringify(path().toJSON()));
});

test('M04S04-33 serialization-preserves-targets-graph-alternatives-and-requirement-set-version', () => {
  const first = satisfyStep({
    code: 'STEP.REQ.A',
    alternativeGroupCode: 'ALT.REQ',
  });
  const second = satisfyStep({
    code: 'STEP.REQ.B',
    alternativeGroupCode: 'ALT.REQ',
  });
  const final = examStep({
    code: 'STEP.FINAL',
    prerequisiteStepCodes: ['STEP.REQ.A'],
  });
  const serialized = JSON.stringify(path({ steps: [first, second, final] }).toJSON());
  assert.match(serialized, new RegExp(CREDENTIAL_ID));
  assert.match(serialized, new RegExp(ACTIVITY_ID));
  assert.match(serialized, new RegExp(PROFESSION_ID));
  assert.match(serialized, /ALT\.REQ/);
  assert.match(serialized, /STEP\.REQ\.A/);
  assert.match(serialized, /requirement-set-1/);
});

test('M04S04-34 historical-path-versions-remain-independent', () => {
  const first = path({ version: VersionId.from('path-1') });
  const second = path({
    version: VersionId.from('path-2'),
    steps: [examStep({ code: 'STEP.LATER', prerequisiteStepCodes: [] })],
  });
  assert.equal(first.version.toString(), 'path-1');
  assert.equal(second.version.toString(), 'path-2');
  assert.equal(first.steps[0]?.code, 'STEP.REQUIREMENTS');
  assert.equal(second.steps[0]?.code, 'STEP.LATER');
});

test('M04S04-35 effective-evaluation-requires-explicit-date-and-jurisdiction', () => {
  const node = path();
  assert.equal(node.isEffectiveOn(DateOnly.from('2026-06-01'), cz), true);
  assert.equal(node.isEffectiveOn(DateOnly.from('2028-01-01'), cz), false);
  assert.equal(node.isEffectiveOn(DateOnly.from('2026-06-01'), Jurisdiction.fromCode('EU')), false);
  assert.throws(() => node.isEffectiveOn('2026-06-01' as unknown as DateOnly, cz), /explicit DateOnly/i);
  assert.throws(
    () => node.isEffectiveOn(DateOnly.from('2026-06-01'), 'CZ' as unknown as Jurisdiction),
    /explicit Jurisdiction/i,
  );
});

test('M04S04-36 selector-enforces-candidate-and-query-types', () => {
  assert.throws(
    () => selectQualificationPath({
      candidates: ['path'] as unknown as QualificationPathDefinition[],
      targetCredentialDefinitionId: credentialId,
      jurisdiction: cz,
      effectiveOn: DateOnly.from('2026-06-01'),
    }),
    /candidates must use QualificationPathDefinition/i,
  );
  assert.throws(
    () => selectQualificationPath({
      candidates: [],
      targetCredentialDefinitionId: 'credential' as unknown as CredentialDefinitionId,
      jurisdiction: cz,
      effectiveOn: DateOnly.from('2026-06-01'),
    }),
    /credential target must use CredentialDefinitionId/i,
  );
  assert.throws(
    () => selectQualificationPath({
      candidates: [],
      targetCredentialDefinitionId: credentialId,
      jurisdiction: 'CZ' as unknown as Jurisdiction,
      effectiveOn: DateOnly.from('2026-06-01'),
    }),
    /requires Jurisdiction/i,
  );
});

test('M04S04-37 selector-requires-at-least-one-explicit-target-criterion', () => {
  assert.throws(
    () => selectQualificationPath({
      candidates: [path()],
      jurisdiction: cz,
      effectiveOn: DateOnly.from('2026-06-01'),
    }),
    /at least one explicit target criterion/i,
  );
});

test('M04S04-38 selector-rejects-duplicate-candidate-identity-version-jurisdiction', () => {
  const candidate = path();
  assert.throws(
    () => selectQualificationPath({
      candidates: [candidate, candidate],
      targetCredentialDefinitionId: credentialId,
      jurisdiction: cz,
      effectiveOn: DateOnly.from('2026-06-01'),
    }),
    /duplicate identity\/version\/jurisdiction/i,
  );
});

test('M04S04-39 selector-returns-not-found-for-non-applicable-context', () => {
  const result = selectQualificationPath({
    candidates: [path()],
    targetCredentialDefinitionId: credentialId,
    jurisdiction: cz,
    effectiveOn: DateOnly.from('2030-01-01'),
  });
  assert.equal(result.state, QualificationPathSelectionState.NOT_FOUND);
  assert.equal(result.selected, null);
  assert.deepEqual(result.candidates, []);
});

test('M04S04-40 selector-selects-exactly-one-applicable-path', () => {
  const candidate = path();
  const result = selectQualificationPath({
    candidates: [candidate],
    targetCredentialDefinitionId: credentialId,
    jurisdiction: cz,
    effectiveOn: DateOnly.from('2026-06-01'),
  });
  assert.equal(result.state, QualificationPathSelectionState.SELECTED);
  assert.equal(result.selected, candidate);
  assert.deepEqual(result.candidates, [candidate]);
});

test('M04S04-41 selector-can-require-exact-activity-and-profession-targets', () => {
  const candidate = path();
  const result = selectQualificationPath({
    candidates: [candidate],
    targetActivityDefinitionId: activityId,
    targetProfessionDefinitionId: professionId,
    jurisdiction: cz,
    effectiveOn: DateOnly.from('2026-06-01'),
  });
  assert.equal(result.state, QualificationPathSelectionState.SELECTED);
  assert.equal(result.selected, candidate);
  const miss = selectQualificationPath({
    candidates: [candidate],
    targetActivityDefinitionId: ActivityDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c09000b'),
    jurisdiction: cz,
    effectiveOn: DateOnly.from('2026-06-01'),
  });
  assert.equal(miss.state, QualificationPathSelectionState.NOT_FOUND);
});

test('M04S04-42 distinct-applicable-paths-remain-multiple-unranked-candidates', () => {
  const first = path({ id: pathAId });
  const second = path({ id: pathBId });
  const result = selectQualificationPath({
    candidates: [second, first],
    targetCredentialDefinitionId: credentialId,
    jurisdiction: cz,
    effectiveOn: DateOnly.from('2026-06-01'),
  });
  assert.equal(result.state, QualificationPathSelectionState.MULTIPLE_APPLICABLE);
  assert.equal(result.selected, null);
  assert.deepEqual(result.candidates.map((candidate) => candidate.id.toString()), [PATH_A, PATH_B]);
  assert.equal('score' in result, false);
  assert.equal('recommended' in result, false);
});

test('M04S04-43 overlapping-versions-of-same-path-fail-closed-to-review', () => {
  const first = path({ id: pathAId, version: VersionId.from('path-1') });
  const second = path({ id: pathAId, version: VersionId.from('path-2') });
  const result = selectQualificationPath({
    candidates: [second, first],
    targetCredentialDefinitionId: credentialId,
    jurisdiction: cz,
    effectiveOn: DateOnly.from('2026-06-01'),
  });
  assert.equal(result.state, QualificationPathSelectionState.AMBIGUOUS_REVIEW_REQUIRED);
  assert.equal(result.selected, null);
  assert.deepEqual(result.candidates.map((candidate) => candidate.version.toString()), ['path-1', 'path-2']);
});

test('M04S04-44 architecture-exposes-s04-without-s05-plus-or-hidden-ranking-authority', async () => {
  const source = readFileSync('packages/core/src/catalog/qualification-path.ts', 'utf8');
  assert.doesNotMatch(source, /\bProvenanceEnvelope\b|\bSourceReference\b|\bEquivalenceDecision\b|\bGapNavigator\b/);
  assert.doesNotMatch(source, /\bEvidenceSnapshot\b|\bCredentialArtifact\b|\bAuthorizationGrant\b|EligibilityAssessment\.evaluate/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /\b(llm|embedding|semanticSimilarity|fuzzySearch|shortestPath|lowestCost|highestConfidence)\b/i);
  const core = await import('../src/index.ts');
  assert.equal('QualificationPathDefinition' in core, true);
  assert.equal('QualificationPathStep' in core, true);
  assert.equal('QualificationPathId' in core, true);
  assert.equal('GapNavigator' in core, false);
  assert.equal('AuthorizationGrant' in core, false);
});
