import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CatalogEffectivePeriod,
  CredentialDefinition,
  CredentialDefinitionId,
  CredentialDefinitionReference,
  DateOnly,
  GovernedRequirementSetVersion,
  Jurisdiction,
  RequirementDefinition,
  RequirementDefinitionId,
  RequirementGroup,
  RequirementGroupMode,
  RequirementId,
  RequirementSet,
  RequirementSetId,
  RequirementSetVersionSelectionState,
  SourceId,
  VersionId,
  selectRequirementSetVersion,
} from '../src/index.ts';

const CREDENTIAL_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090001';
const REQUIREMENT_A_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090002';
const REQUIREMENT_B_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090003';
const REQUIREMENT_SET_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c090004';
const SOURCE_A = '018f22e2-79b0-7cc3-98c4-dc0c0c090005';
const SOURCE_B = '018f22e2-79b0-7cc3-98c4-dc0c0c090006';

const credentialId = CredentialDefinitionId.from(CREDENTIAL_ID);
const requirementAId = RequirementDefinitionId.from(REQUIREMENT_A_ID);
const requirementBId = RequirementDefinitionId.from(REQUIREMENT_B_ID);
const requirementSetId = RequirementSetId.from(REQUIREMENT_SET_ID);
const sourceA = SourceId.from(SOURCE_A);
const sourceB = SourceId.from(SOURCE_B);
const cz = Jurisdiction.fromCode('CZ');
const prague = Jurisdiction.fromCode('CZ-10');

function period(from = '2026-01-01', to: string | null = null): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({
    effectiveFrom: DateOnly.from(from),
    effectiveTo: to === null ? null : DateOnly.from(to),
  });
}

function credential(overrides: Partial<Parameters<typeof CredentialDefinition.create>[0]> = {}): CredentialDefinition {
  return CredentialDefinition.create({
    id: credentialId,
    version: VersionId.from('credential-v1'),
    code: 'CRED.ELECTRICIAN.AUTH',
    preferredLabel: 'Electrician authorization',
    aliases: [],
    description: 'Credential definition for governed RequirementSet version tests.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01', '2030-12-31'),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function requirementA(overrides: Partial<Parameters<typeof RequirementDefinition.create>[0]> = {}): RequirementDefinition {
  return RequirementDefinition.create({
    id: requirementAId,
    version: VersionId.from('requirement-a-v1'),
    code: 'REQ.QUALIFICATION',
    preferredLabel: 'Qualification',
    aliases: [],
    description: 'Qualification requirement.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01', '2030-12-31'),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function requirementB(overrides: Partial<Parameters<typeof RequirementDefinition.create>[0]> = {}): RequirementDefinition {
  return RequirementDefinition.create({
    id: requirementBId,
    version: VersionId.from('requirement-b-v1'),
    code: 'REQ.EXAM',
    preferredLabel: 'Examination',
    aliases: [],
    description: 'Examination requirement.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01', '2030-12-31'),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function executableSet(version = 'requirement-set-v1', credentialVersion = 'credential-v1'): RequirementSet {
  const reqA = RequirementId.from('REQ.QUALIFICATION');
  const reqB = RequirementId.from('REQ.EXAM');
  return RequirementSet.create({
    id: requirementSetId,
    version: VersionId.from(version),
    credentialDefinition: CredentialDefinitionReference.create(credentialId, VersionId.from(credentialVersion)),
    requirementIds: [reqA, reqB],
    groups: [
      RequirementGroup.create({
        code: 'CORE',
        mode: RequirementGroupMode.ALL,
        requirementIds: [reqA, reqB],
      }),
    ],
  });
}

function governed(overrides: Partial<Parameters<typeof GovernedRequirementSetVersion.create>[0]> = {}): GovernedRequirementSetVersion {
  return GovernedRequirementSetVersion.create({
    requirementSet: executableSet(),
    credentialDefinition: credential(),
    requirementDefinitions: [requirementA(), requirementB()],
    jurisdiction: cz,
    effectivePeriod: period('2026-01-01', '2026-12-31'),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

test('M04S03-01 preserves-wrapped-requirement-set-id-and-version', () => {
  const node = governed();
  assert.equal(node.id.toString(), REQUIREMENT_SET_ID);
  assert.equal(node.version.toString(), 'requirement-set-v1');
});

test('M04S03-02 requires-requirement-set-instance', () => {
  assert.throws(() => governed({ requirementSet: {} as RequirementSet }), /requires RequirementSet/i);
});

test('M04S03-03 requires-credential-definition-instance', () => {
  assert.throws(() => governed({ credentialDefinition: {} as CredentialDefinition }), /requires CredentialDefinition/i);
});

test('M04S03-04 credential-id-must-match-executable-set', () => {
  const alternate = CredentialDefinition.create({
    id: CredentialDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c090099'),
    version: VersionId.from('credential-v1'),
    code: 'CRED.OTHER',
    preferredLabel: 'Other',
    aliases: [],
    description: 'Other credential.',
    jurisdiction: cz,
    effectivePeriod: period('2025-01-01', '2030-12-31'),
    sourceReferenceIds: [sourceA],
  });
  assert.throws(() => governed({ credentialDefinition: alternate }), /credential identity/i);
});

test('M04S03-05 credential-version-must-match-executable-set', () => {
  assert.throws(() => governed({ credentialDefinition: credential({ version: VersionId.from('credential-v2') }) }), /credential version/i);
});

test('M04S03-06 jurisdiction-is-required-and-matches-credential', () => {
  assert.throws(() => governed({ jurisdiction: 'CZ' as unknown as Jurisdiction }), /requires Jurisdiction/i);
  assert.throws(() => governed({ jurisdiction: prague }), /jurisdiction must match/i);
});

test('M04S03-07 effective-period-is-required', () => {
  assert.throws(() => governed({ effectivePeriod: {} as CatalogEffectivePeriod }), /requires CatalogEffectivePeriod/i);
});

test('M04S03-08 set-period-must-be-contained-in-credential-period', () => {
  assert.throws(() => governed({ effectivePeriod: period('2024-01-01', '2026-12-31') }), /contained in CredentialDefinition/i);
});

test('M04S03-09 requirement-definitions-are-required', () => {
  assert.throws(() => governed({ requirementDefinitions: [] }), /requires RequirementDefinition entries/i);
});

test('M04S03-10 requirement-definition-type-is-enforced', () => {
  assert.throws(() => governed({ requirementDefinitions: [{} as RequirementDefinition] }), /must use RequirementDefinition/i);
});

test('M04S03-11 requirement-definition-identity-version-is-unique', () => {
  const a = requirementA();
  assert.throws(() => governed({ requirementDefinitions: [a, a] }), /identity\/version entries must be unique/i);
});

test('M04S03-12 requirement-definition-machine-codes-are-unique', () => {
  const duplicateCode = requirementB({ code: 'REQ.QUALIFICATION' });
  assert.throws(() => governed({ requirementDefinitions: [requirementA(), duplicateCode] }), /machine codes must be unique/i);
});

test('M04S03-13 definition-count-matches-executable-requirement-count', () => {
  assert.throws(() => governed({ requirementDefinitions: [requirementA()] }), /match executable RequirementId order exactly/i);
});

test('M04S03-14 definition-code-order-matches-executable-requirement-order-exactly', () => {
  assert.throws(() => governed({ requirementDefinitions: [requirementB(), requirementA()] }), /order exactly/i);
});

test('M04S03-15 requirement-definition-jurisdiction-must-match-exactly', () => {
  assert.throws(() => governed({ requirementDefinitions: [requirementA(), requirementB({ jurisdiction: prague })] }), /jurisdiction must match/i);
});

test('M04S03-16 set-period-must-be-contained-in-every-requirement-definition-period', () => {
  assert.throws(() => governed({ requirementDefinitions: [requirementA(), requirementB({ effectivePeriod: period('2026-06-01', '2030-12-31') })] }), /contained in every RequirementDefinition/i);
});

test('M04S03-17 source-references-are-required', () => {
  assert.throws(() => governed({ sourceReferenceIds: [] }), /at least one source reference ID/i);
});

test('M04S03-18 source-reference-type-is-enforced', () => {
  assert.throws(() => governed({ sourceReferenceIds: ['source'] as unknown as SourceId[] }), /must use SourceId/i);
});

test('M04S03-19 source-references-are-unique-and-frozen', () => {
  assert.throws(() => governed({ sourceReferenceIds: [sourceA, sourceA] }), /must be unique/i);
  const node = governed({ sourceReferenceIds: [sourceA, sourceB] });
  assert.equal(Object.isFrozen(node.sourceReferenceIds), true);
});

test('M04S03-20 root-and-nested-definition-array-are-immutable', () => {
  const node = governed();
  assert.equal(Object.isFrozen(node), true);
  assert.equal(Object.isFrozen(node.requirementDefinitions), true);
  assert.throws(() => { (node.requirementDefinitions as RequirementDefinition[]).push(requirementA()); }, TypeError);
});

test('M04S03-21 effective-evaluation-requires-explicit-date-and-jurisdiction', () => {
  const node = governed();
  assert.equal(node.isEffectiveOn(DateOnly.from('2026-06-01'), cz), true);
  assert.throws(() => node.isEffectiveOn('2026-06-01' as unknown as DateOnly, cz), /explicit DateOnly/i);
  assert.throws(() => node.isEffectiveOn(DateOnly.from('2026-06-01'), 'CZ' as unknown as Jurisdiction), /explicit Jurisdiction/i);
});

test('M04S03-22 jurisdiction-match-is-exact-with-no-parent-fallback', () => {
  assert.equal(governed().isEffectiveOn(DateOnly.from('2026-06-01'), prague), false);
});

test('M04S03-23 serialization-is-deterministic', () => {
  assert.equal(JSON.stringify(governed().toJSON()), JSON.stringify(governed().toJSON()));
});

test('M04S03-24 serialization-preserves-group-mode-membership-and-threshold', () => {
  const json = JSON.stringify(governed().toJSON());
  assert.match(json, /"mode":"ALL"/);
  assert.match(json, /REQ\.QUALIFICATION/);
  assert.match(json, /REQ\.EXAM/);
  assert.match(json, /"threshold":null/);
});

test('M04S03-25 historical-versions-preserve-exact-independent-runtime-snapshots', () => {
  const firstSet = executableSet('requirement-set-v1');
  const secondSet = executableSet('requirement-set-v2');
  const first = governed({ requirementSet: firstSet, effectivePeriod: period('2026-01-01', '2026-06-30') });
  const second = governed({ requirementSet: secondSet, effectivePeriod: period('2026-07-01', '2026-12-31') });
  assert.equal(first.toExecutableRequirementSet(), firstSet);
  assert.equal(second.toExecutableRequirementSet(), secondSet);
  assert.notEqual(first.version.toString(), second.version.toString());
});

test('M04S03-26 selector-requires-typed-query-inputs', () => {
  const node = governed();
  assert.throws(() => selectRequirementSetVersion({ candidates: [node], requirementSetId: 'id' as unknown as RequirementSetId, credentialDefinitionId: credentialId, jurisdiction: cz, effectiveOn: DateOnly.from('2026-06-01') }), /requires RequirementSetId/i);
  assert.throws(() => selectRequirementSetVersion({ candidates: [node], requirementSetId, credentialDefinitionId: 'id' as unknown as CredentialDefinitionId, jurisdiction: cz, effectiveOn: DateOnly.from('2026-06-01') }), /requires CredentialDefinitionId/i);
  assert.throws(() => selectRequirementSetVersion({ candidates: [node], requirementSetId, credentialDefinitionId: credentialId, jurisdiction: 'CZ' as unknown as Jurisdiction, effectiveOn: DateOnly.from('2026-06-01') }), /requires Jurisdiction/i);
  assert.throws(() => selectRequirementSetVersion({ candidates: [node], requirementSetId, credentialDefinitionId: credentialId, jurisdiction: cz, effectiveOn: '2026-06-01' as unknown as DateOnly }), /explicit DateOnly/i);
});

test('M04S03-27 selector-candidate-type-is-enforced', () => {
  assert.throws(() => selectRequirementSetVersion({ candidates: [{} as GovernedRequirementSetVersion], requirementSetId, credentialDefinitionId: credentialId, jurisdiction: cz, effectiveOn: DateOnly.from('2026-06-01') }), /candidates must use GovernedRequirementSetVersion/i);
});

test('M04S03-28 selector-rejects-duplicate-candidate-identity-version-jurisdiction', () => {
  const node = governed();
  assert.throws(() => selectRequirementSetVersion({ candidates: [node, node], requirementSetId, credentialDefinitionId: credentialId, jurisdiction: cz, effectiveOn: DateOnly.from('2026-06-01') }), /duplicate identity\/version\/jurisdiction/i);
});

test('M04S03-29 selector-returns-not-found-outside-effective-window', () => {
  const result = selectRequirementSetVersion({ candidates: [governed()], requirementSetId, credentialDefinitionId: credentialId, jurisdiction: cz, effectiveOn: DateOnly.from('2027-01-01') });
  assert.equal(result.state, RequirementSetVersionSelectionState.NOT_FOUND);
  assert.equal(result.selected, null);
  assert.deepEqual(result.candidateVersions, []);
});

test('M04S03-30 selector-selects-exactly-one-match-without-recomputation', () => {
  const node = governed();
  const result = selectRequirementSetVersion({ candidates: [node], requirementSetId, credentialDefinitionId: credentialId, jurisdiction: cz, effectiveOn: DateOnly.from('2026-06-01') });
  assert.equal(result.state, RequirementSetVersionSelectionState.SELECTED);
  assert.equal(result.selected, node);
  assert.equal(result.selected?.toExecutableRequirementSet(), node.requirementSet);
});

test('M04S03-31 overlapping-applicable-versions-require-review', () => {
  const first = governed({ requirementSet: executableSet('requirement-set-v2') });
  const second = governed({ requirementSet: executableSet('requirement-set-v10') });
  const result = selectRequirementSetVersion({ candidates: [first, second], requirementSetId, credentialDefinitionId: credentialId, jurisdiction: cz, effectiveOn: DateOnly.from('2026-06-01') });
  assert.equal(result.state, RequirementSetVersionSelectionState.AMBIGUOUS_REVIEW_REQUIRED);
  assert.equal(result.selected, null);
});

test('M04S03-32 ambiguous-candidate-versions-are-deterministically-sorted-without-preference', () => {
  const first = governed({ requirementSet: executableSet('requirement-set-v2') });
  const second = governed({ requirementSet: executableSet('requirement-set-v10') });
  const result = selectRequirementSetVersion({ candidates: [first, second], requirementSetId, credentialDefinitionId: credentialId, jurisdiction: cz, effectiveOn: DateOnly.from('2026-06-01') });
  assert.deepEqual(result.candidateVersions, ['requirement-set-v10', 'requirement-set-v2']);
  assert.equal(Object.isFrozen(result.candidateVersions), true);
});

test('M04S03-33 core-export-surface-exposes-s03-without-qualification-path', async () => {
  const core = await import('../src/index.ts');
  assert.equal('GovernedRequirementSetVersion' in core, true);
  assert.equal('selectRequirementSetVersion' in core, true);
  assert.equal('RequirementSetVersionSelectionState' in core, true);
  assert.equal('QualificationPath' in core, false);
});

test('M04S03-34 architecture-has-no-s04-plus-evidence-authorization-ai-provider-or-ambient-authority', () => {
  const source = readFileSync('packages/core/src/catalog/requirement-set-versioning.ts', 'utf8');
  assert.doesNotMatch(source, /\bQualificationPath\b|\bProvenanceEnvelope\b|\bEquivalenceDecision\b|\bGapNavigator\b|\bAuthorizationGrant\b|EligibilityAssessment\.evaluate/);
  assert.doesNotMatch(source, /\bCredentialArtifact\b|\bEvidenceSnapshot\b|\bEvidenceReference\b/);
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  const eligibility = readFileSync('packages/core/src/eligibility/eligibility-assessment.ts', 'utf8');
  assert.doesNotMatch(eligibility, /GovernedRequirementSetVersion|selectRequirementSetVersion/);
});
