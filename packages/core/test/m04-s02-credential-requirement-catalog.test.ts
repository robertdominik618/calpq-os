import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CatalogEffectivePeriod,
  CredentialDefinition,
  CredentialDefinitionId,
  DateOnly,
  Jurisdiction,
  RequirementDefinition,
  RequirementDefinitionId,
  SourceId,
  VersionId,
} from '../src/index.ts';

const CREDENTIAL_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c080001';
const REQUIREMENT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c080002';
const SOURCE_A = '018f22e2-79b0-7cc3-98c4-dc0c0c080003';
const SOURCE_B = '018f22e2-79b0-7cc3-98c4-dc0c0c080004';

const credentialId = CredentialDefinitionId.from(CREDENTIAL_ID);
const requirementId = RequirementDefinitionId.from(REQUIREMENT_ID);
const sourceA = SourceId.from(SOURCE_A);
const sourceB = SourceId.from(SOURCE_B);
const jurisdiction = Jurisdiction.fromCode('CZ');

function effectivePeriod(from = '2026-01-01', to: string | null = null): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({
    effectiveFrom: DateOnly.from(from),
    effectiveTo: to === null ? null : DateOnly.from(to),
  });
}

function credential(overrides: Partial<Parameters<typeof CredentialDefinition.create>[0]> = {}): CredentialDefinition {
  return CredentialDefinition.create({
    id: credentialId,
    version: VersionId.from('credential-definition-1'),
    code: 'CRED.ELECTRICIAN.AUTH',
    preferredLabel: 'Electrician authorization',
    aliases: ['Electrical authorization'],
    description: 'Governed credential definition describing an authorization class, never a personal artifact or grant.',
    jurisdiction,
    effectivePeriod: effectivePeriod(),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function requirement(overrides: Partial<Parameters<typeof RequirementDefinition.create>[0]> = {}): RequirementDefinition {
  return RequirementDefinition.create({
    id: requirementId,
    version: VersionId.from('requirement-definition-1'),
    code: 'REQ.PROFESSIONAL.QUALIFICATION',
    preferredLabel: 'Professional qualification',
    aliases: ['Qualification requirement'],
    description: 'Governed atomic requirement definition that carries no satisfaction or evidence state.',
    jurisdiction,
    effectivePeriod: effectivePeriod(),
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

test('M04S02-01 credential-id-is-stable-calpq-uuidv7', () => {
  assert.equal(credentialId.toString(), CREDENTIAL_ID);
  assert.throws(() => CredentialDefinitionId.from('credential-external-code'), /UUIDv7/i);
});

test('M04S02-02 requirement-definition-id-is-stable-calpq-uuidv7', () => {
  assert.equal(requirementId.toString(), REQUIREMENT_ID);
  assert.throws(() => RequirementDefinitionId.from('REQ-EXTERNAL'), /UUIDv7/i);
});

test('M04S02-03 credential-and-requirement-identities-remain-distinct', () => {
  assert.notEqual(credentialId.toString(), requirementId.toString());
  assert.equal(credential() instanceof RequirementDefinition, false);
  assert.equal(requirement() instanceof CredentialDefinition, false);
});

test('M04S02-04 credential-code-is-controlled', () => {
  assert.equal(credential({ code: '  CRED.ELECTRICIAN.AUTH  ' }).code, 'CRED.ELECTRICIAN.AUTH');
  assert.throws(() => credential({ code: 'credential free text' }), /controlled uppercase/i);
});

test('M04S02-05 requirement-code-is-controlled', () => {
  assert.equal(requirement({ code: 'REQ.EXAM.PASS' }).code, 'REQ.EXAM.PASS');
  assert.throws(() => requirement({ code: 'req lower' }), /controlled uppercase/i);
});

test('M04S02-06 labels-are-trimmed', () => {
  assert.equal(credential({ preferredLabel: '  Authorization  ' }).preferredLabel, 'Authorization');
  assert.equal(requirement({ preferredLabel: '  Examination  ' }).preferredLabel, 'Examination');
});

test('M04S02-07 empty-label-is-rejected', () => {
  assert.throws(() => credential({ preferredLabel: '   ' }), /must not be empty/i);
});

test('M04S02-08 aliases-are-normalized-and-frozen', () => {
  const node = requirement({ aliases: ['  Exam  ', 'Test'] });
  assert.deepEqual(node.aliases, ['Exam', 'Test']);
  assert.equal(Object.isFrozen(node.aliases), true);
});

test('M04S02-09 duplicate-aliases-are-rejected-case-insensitively', () => {
  assert.throws(() => credential({ aliases: ['Permit', 'permit'] }), /aliases must be unique/i);
});

test('M04S02-10 alias-cannot-duplicate-preferred-label', () => {
  assert.throws(() => requirement({ aliases: ['professional qualification'] }), /must not duplicate/i);
});

test('M04S02-11 description-is-required-and-bounded', () => {
  assert.throws(() => credential({ description: '' }), /must not be empty/i);
  assert.throws(() => requirement({ description: 'x'.repeat(4001) }), /too long/i);
});

test('M04S02-12 explicit-version-is-required', () => {
  assert.throws(() => credential({ version: 'v1' as unknown as VersionId }), /requires VersionId/i);
});

test('M04S02-13 controlled-jurisdiction-is-required', () => {
  assert.throws(() => requirement({ jurisdiction: 'CZ' as unknown as Jurisdiction }), /requires Jurisdiction/i);
});

test('M04S02-14 effective-period-is-explicit-and-reused', () => {
  const node = credential({ effectivePeriod: effectivePeriod('2026-01-01', '2026-12-31') });
  assert.equal(node.isEffectiveOn(DateOnly.from('2026-06-01')), true);
  assert.equal(node.isEffectiveOn(DateOnly.from('2027-01-01')), false);
  assert.throws(() => node.isEffectiveOn('2026-06-01' as unknown as DateOnly), /explicit DateOnly/i);
});

test('M04S02-15 source-reference-ids-are-required', () => {
  assert.throws(() => credential({ sourceReferenceIds: [] }), /at least one source reference ID/i);
});

test('M04S02-16 source-reference-id-type-is-enforced', () => {
  assert.throws(() => requirement({ sourceReferenceIds: ['source'] as unknown as SourceId[] }), /must use SourceId/i);
});

test('M04S02-17 source-reference-ids-are-unique-and-frozen', () => {
  assert.throws(() => credential({ sourceReferenceIds: [sourceA, sourceA] }), /must be unique/i);
  const node = credential({ sourceReferenceIds: [sourceA, sourceB] });
  assert.equal(Object.isFrozen(node.sourceReferenceIds), true);
});

test('M04S02-18 credential-definition-is-not-personal-artifact-grant-or-evidence', () => {
  const node = credential();
  assert.equal('subject' in node, false);
  assert.equal('artifact' in node, false);
  assert.equal('evidence' in node, false);
  assert.equal('authorizationGrant' in node, false);
});

test('M04S02-19 requirement-definition-has-no-outcome-evidence-or-eligibility-state', () => {
  const node = requirement();
  assert.equal('outcome' in node, false);
  assert.equal('evidence' in node, false);
  assert.equal('satisfied' in node, false);
  assert.equal('eligibility' in node, false);
});

test('M04S02-20 credential-and-requirement-definitions-remain-distinct-models', () => {
  assert.equal(credential() instanceof CredentialDefinition, true);
  assert.equal(requirement() instanceof RequirementDefinition, true);
});

test('M04S02-21 credential-historical-versions-remain-independent-and-immutable', () => {
  const first = credential({ version: VersionId.from('credential-definition-1'), preferredLabel: 'Old label' });
  const second = credential({ version: VersionId.from('credential-definition-2'), preferredLabel: 'New label' });
  assert.equal(first.preferredLabel, 'Old label');
  assert.equal(second.preferredLabel, 'New label');
  assert.equal(Object.isFrozen(first), true);
  assert.throws(() => { (first as unknown as { preferredLabel: string }).preferredLabel = 'rewritten'; }, TypeError);
});

test('M04S02-22 requirement-historical-versions-remain-independent-and-immutable', () => {
  const first = requirement({ version: VersionId.from('requirement-definition-1'), description: 'Historical rule wording.' });
  const second = requirement({ version: VersionId.from('requirement-definition-2'), description: 'Later rule wording.' });
  assert.equal(first.description, 'Historical rule wording.');
  assert.equal(second.description, 'Later rule wording.');
  assert.equal(Object.isFrozen(first), true);
});

test('M04S02-23 requirement-machine-code-can-remain-stable-across-versions', () => {
  const first = requirement({ version: VersionId.from('requirement-definition-1') });
  const second = requirement({ version: VersionId.from('requirement-definition-2') });
  assert.equal(first.code, second.code);
  assert.notEqual(first.version.toString(), second.version.toString());
});

test('M04S02-24 credential-machine-code-can-remain-stable-across-versions', () => {
  const first = credential({ version: VersionId.from('credential-definition-1') });
  const second = credential({ version: VersionId.from('credential-definition-2') });
  assert.equal(first.code, second.code);
  assert.notEqual(first.version.toString(), second.version.toString());
});

test('M04S02-25 serialization-is-deterministic', () => {
  assert.equal(JSON.stringify(credential().toJSON()), JSON.stringify(credential().toJSON()));
  assert.equal(JSON.stringify(requirement().toJSON()), JSON.stringify(requirement().toJSON()));
});

test('M04S02-26 serialization-preserves-machine-codes-and-source-identity', () => {
  const serialized = JSON.stringify(requirement({ sourceReferenceIds: [sourceA, sourceB] }).toJSON());
  assert.match(serialized, /REQ\.PROFESSIONAL\.QUALIFICATION/);
  assert.match(serialized, new RegExp(SOURCE_A));
  assert.match(serialized, new RegExp(SOURCE_B));
});

test('M04S02-27 slice-has-no-current-latest-active-effective-selection', () => {
  const source = readFileSync('packages/core/src/catalog/credential-requirement-catalog.ts', 'utf8');
  assert.doesNotMatch(source, /\b(isCurrent|currentVersion|latestVersion|activeVersion|selectEffective)\b/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)/);
});

test('M04S02-28 slice-does-not-implement-requirement-set-path-or-provenance-authority', () => {
  const source = readFileSync('packages/core/src/catalog/credential-requirement-catalog.ts', 'utf8');
  assert.doesNotMatch(source, /\bRequirementSet\b|\bRequirementGroup\b|\bQualificationPath\b|\bProvenanceEnvelope\b|\bEquivalenceDecision\b|\bGapNavigator\b/);
  assert.doesNotMatch(source, /from ['"]\.\.\/provenance\//);
});

test('M04S02-29 slice-does-not-implement-artifact-verification-or-authorization-authority', () => {
  const source = readFileSync('packages/core/src/catalog/credential-requirement-catalog.ts', 'utf8');
  assert.doesNotMatch(source, /\bCredentialArtifact\b|\bEvidenceSnapshot\b|\bEvidenceReference\b|\bAuthorizationGrant\b|EligibilityAssessment\.evaluate/);
});

test('M04S02-30 architecture-has-no-provider-ui-ai-or-ambient-time-authority', () => {
  const source = readFileSync('packages/core/src/catalog/credential-requirement-catalog.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /\b(llm|embedding|semanticSimilarity|fuzzySearch)\b/i);
});

test('M04S02-31 core-export-surface-exposes-admitted-s02-types-only', async () => {
  const core = await import('../src/index.ts');
  assert.equal('CredentialDefinition' in core, true);
  assert.equal('RequirementDefinition' in core, true);
  assert.equal('RequirementDefinitionId' in core, true);
  assert.equal('QualificationPath' in core, false);
  assert.equal('AuthorizationGrant' in core, false);
});

test('M04S02-32 existing-eligibility-contract-remains-definition-agnostic', () => {
  const eligibility = readFileSync('packages/core/src/eligibility/eligibility-assessment.ts', 'utf8');
  assert.doesNotMatch(eligibility, /RequirementDefinitionId|RequirementDefinition\.create/);
});
