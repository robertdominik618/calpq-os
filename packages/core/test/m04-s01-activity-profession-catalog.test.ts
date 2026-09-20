import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActivityDefinition,
  ActivityDefinitionId,
  CatalogEffectivePeriod,
  DateOnly,
  ExternalClassificationMappingRelation,
  ExternalClassificationReference,
  Jurisdiction,
  ProfessionDefinition,
  ProfessionDefinitionId,
  RegulatoryStatus,
  SourceId,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
  VersionId,
} from '../src/index.ts';

const ACTIVITY_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079001';
const PROFESSION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079002';
const SOURCE_A = '018f22e2-79b0-7cc3-98c4-dc0c0c079003';
const SOURCE_B = '018f22e2-79b0-7cc3-98c4-dc0c0c079004';

const activityId = ActivityDefinitionId.from(ACTIVITY_ID);
const professionId = ProfessionDefinitionId.from(PROFESSION_ID);
const sourceA = SourceId.from(SOURCE_A);
const sourceB = SourceId.from(SOURCE_B);
const jurisdiction = Jurisdiction.fromCode('CZ');

function effectivePeriod(from = '2026-01-01', to: string | null = null): CatalogEffectivePeriod {
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
    aliases: ['Electrical work'],
    description: 'Governed activity definition used for qualification catalog lookup.',
    jurisdiction,
    effectivePeriod: effectivePeriod(),
    regulatoryStatus: RegulatoryStatus.REGULATED,
    sourceReferenceIds: [sourceA],
    ...overrides,
  });
}

function classification(overrides: Partial<Parameters<typeof ExternalClassificationReference.create>[0]> = {}): ExternalClassificationReference {
  return ExternalClassificationReference.create({
    system: 'ESCO',
    conceptId: 'http://data.europa.eu/esco/occupation/example',
    datasetVersion: VersionId.from('esco-1'),
    mappingRelation: ExternalClassificationMappingRelation.EXACT,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
    mappedAt: UtcInstant.from('2026-09-15T08:00:00Z'),
    sourceReferenceId: sourceB,
    ...overrides,
  });
}

function profession(overrides: Partial<Parameters<typeof ProfessionDefinition.create>[0]> = {}): ProfessionDefinition {
  return ProfessionDefinition.create({
    id: professionId,
    version: VersionId.from('profession-1'),
    preferredLabel: 'Electrician',
    aliases: ['Electrical technician'],
    description: 'Governed profession definition distinct from a job or an activity.',
    jurisdiction,
    effectivePeriod: effectivePeriod(),
    regulatoryStatus: RegulatoryStatus.PARTIALLY_REGULATED,
    sourceReferenceIds: [sourceA],
    externalClassifications: [classification()],
    ...overrides,
  });
}

test('M04S01-01 activity-id-is-stable-calpq-uuidv7', () => {
  assert.equal(activityId.toString(), ACTIVITY_ID);
  assert.throws(() => ActivityDefinitionId.from('ESCO-123'), /UUIDv7/i);
});

test('M04S01-02 profession-id-is-stable-calpq-uuidv7', () => {
  assert.equal(professionId.toString(), PROFESSION_ID);
  assert.throws(() => ProfessionDefinitionId.from('ISCO-7411'), /UUIDv7/i);
});

test('M04S01-03 activity-and-profession-remain-distinct-models', () => {
  const a = activity();
  const p = profession();
  assert.equal(a instanceof ActivityDefinition, true);
  assert.equal(p instanceof ProfessionDefinition, true);
  assert.equal(a instanceof ProfessionDefinition, false);
  assert.equal(p instanceof ActivityDefinition, false);
});

test('M04S01-04 activity-label-is-trimmed', () => {
  assert.equal(activity({ preferredLabel: '  Electrical activity  ' }).preferredLabel, 'Electrical activity');
});

test('M04S01-05 profession-label-is-trimmed', () => {
  assert.equal(profession({ preferredLabel: '  Electrician  ' }).preferredLabel, 'Electrician');
});

test('M04S01-06 empty-label-is-rejected', () => {
  assert.throws(() => activity({ preferredLabel: '   ' }), /must not be empty/i);
});

test('M04S01-07 aliases-are-normalized-and-frozen', () => {
  const node = activity({ aliases: ['  Wiring  ', 'Installation'] });
  assert.deepEqual(node.aliases, ['Wiring', 'Installation']);
  assert.equal(Object.isFrozen(node.aliases), true);
});

test('M04S01-08 duplicate-aliases-are-rejected-case-insensitively', () => {
  assert.throws(() => activity({ aliases: ['Wiring', 'wiring'] }), /aliases must be unique/i);
});

test('M04S01-09 alias-cannot-duplicate-preferred-label', () => {
  assert.throws(() => activity({ aliases: ['electrical installation activity'] }), /must not duplicate/i);
});

test('M04S01-10 description-is-required-and-bounded', () => {
  assert.throws(() => activity({ description: '' }), /must not be empty/i);
  assert.throws(() => activity({ description: 'x'.repeat(4001) }), /too long/i);
});

test('M04S01-11 explicit-version-is-required', () => {
  assert.throws(() => activity({ version: 'activity-1' as unknown as VersionId }), /requires VersionId/i);
});

test('M04S01-12 controlled-jurisdiction-is-required', () => {
  assert.throws(() => activity({ jurisdiction: 'CZ' as unknown as Jurisdiction }), /requires Jurisdiction/i);
});

test('M04S01-13 open-ended-effective-period-is-explicit', () => {
  const period = effectivePeriod('2026-01-01');
  assert.equal(period.effectiveTo, null);
  assert.equal(period.isEffectiveOn(DateOnly.from('2099-12-31')), true);
});

test('M04S01-14 bounded-effective-period-is-inclusive', () => {
  const period = effectivePeriod('2026-01-01', '2026-12-31');
  assert.equal(period.isEffectiveOn(DateOnly.from('2026-01-01')), true);
  assert.equal(period.isEffectiveOn(DateOnly.from('2026-12-31')), true);
  assert.equal(period.isEffectiveOn(DateOnly.from('2027-01-01')), false);
});

test('M04S01-15 inverted-effective-period-is-rejected', () => {
  assert.throws(() => effectivePeriod('2026-12-31', '2026-01-01'), /cannot end before/i);
});

test('M04S01-16 applicability-requires-explicit-date', () => {
  const period = effectivePeriod();
  assert.throws(() => period.isEffectiveOn('2026-09-15' as unknown as DateOnly), /explicit DateOnly/i);
});

test('M04S01-17 all-four-regulatory-statuses-are-preserved', () => {
  for (const status of Object.values(RegulatoryStatus)) {
    assert.equal(activity({ regulatoryStatus: status }).regulatoryStatus, status);
  }
});

test('M04S01-18 invalid-regulatory-status-is-rejected', () => {
  assert.throws(() => activity({ regulatoryStatus: 'CURRENT' as typeof RegulatoryStatus.REGULATED }), /must be controlled/i);
});

test('M04S01-19 unknown-review-required-remains-explicit', () => {
  const node = profession({ regulatoryStatus: RegulatoryStatus.UNKNOWN_REVIEW_REQUIRED });
  assert.equal(node.regulatoryStatus, 'UNKNOWN_REVIEW_REQUIRED');
  assert.equal('satisfied' in node, false);
  assert.equal('eligible' in node, false);
});

test('M04S01-20 source-reference-ids-are-required', () => {
  assert.throws(() => activity({ sourceReferenceIds: [] }), /at least one source reference ID/i);
});

test('M04S01-21 source-reference-id-type-is-enforced', () => {
  assert.throws(() => activity({ sourceReferenceIds: ['source-a'] as unknown as SourceId[] }), /must use SourceId/i);
});

test('M04S01-22 source-reference-ids-are-unique-and-frozen', () => {
  assert.throws(() => activity({ sourceReferenceIds: [sourceA, sourceA] }), /must be unique/i);
  const node = activity({ sourceReferenceIds: [sourceA, sourceB] });
  assert.equal(Object.isFrozen(node.sourceReferenceIds), true);
});

test('M04S01-23 external-classification-list-can-be-empty-without-inventing-mapping', () => {
  const node = profession({ externalClassifications: [] });
  assert.deepEqual(node.externalClassifications, []);
  assert.equal(Object.isFrozen(node.externalClassifications), true);
});

test('M04S01-24 external-classification-preserves-version-relation-verification-time-and-source', () => {
  const ref = classification();
  assert.equal(ref.system, 'ESCO');
  assert.equal(ref.datasetVersion.toString(), 'esco-1');
  assert.equal(ref.mappingRelation, 'EXACT');
  assert.equal(ref.verificationState.toString(), 'VERIFIED');
  assert.equal(ref.mappedAt.toString(), '2026-09-15T08:00:00.000Z');
  assert.equal(ref.sourceReferenceId.toString(), SOURCE_B);
});

test('M04S01-25 candidate-external-mapping-remains-descriptive-only', () => {
  const ref = classification({ mappingRelation: ExternalClassificationMappingRelation.CANDIDATE });
  assert.equal(ref.mappingRelation, 'CANDIDATE');
  assert.equal('authorizationGrant' in ref, false);
  assert.equal('eligibility' in ref, false);
  assert.equal('equivalenceDecision' in ref, false);
});

test('M04S01-26 duplicate-external-classification-reference-is-rejected', () => {
  const ref = classification();
  assert.throws(() => profession({ externalClassifications: [ref, ref] }), /must be unique/i);
});

test('M04S01-27 external-identifier-never-replaces-calpq-primary-identity', () => {
  const external = classification({ conceptId: '7411' });
  const node = profession({ externalClassifications: [external] });
  assert.equal(node.id.toString(), PROFESSION_ID);
  assert.equal(node.externalClassifications[0]?.conceptId, '7411');
  assert.notEqual(node.id.toString(), node.externalClassifications[0]?.conceptId);
});

test('M04S01-28 historical-node-versions-remain-independent-and-immutable', () => {
  const first = profession({ version: VersionId.from('profession-1'), preferredLabel: 'Electrician' });
  const second = profession({ version: VersionId.from('profession-2'), preferredLabel: 'Electrical professional' });
  assert.equal(first.version.toString(), 'profession-1');
  assert.equal(first.preferredLabel, 'Electrician');
  assert.equal(second.version.toString(), 'profession-2');
  assert.equal(Object.isFrozen(first), true);
  assert.throws(() => { (first as unknown as { preferredLabel: string }).preferredLabel = 'rewritten'; }, TypeError);
});

test('M04S01-29 serialization-is-deterministic-and-preserves-machine-semantics', () => {
  const first = JSON.stringify(profession().toJSON());
  const second = JSON.stringify(profession().toJSON());
  assert.equal(first, second);
  assert.match(first, /PARTIALLY_REGULATED/);
  assert.match(first, /esco-1/);
});

test('M04S01-30 slice-does-not-implement-later-catalog-path-or-provenance-authority', () => {
  const source = readFileSync('packages/core/src/catalog/activity-profession-catalog.ts', 'utf8');
  assert.doesNotMatch(source, /\bCredentialDefinitionReference\b|\bRequirementSet\b|\bEligibilityAssessment\b|\bQualificationPath\b|\bProvenanceEnvelope\b/);
  assert.doesNotMatch(source, /from ['"]\.\.\/provenance\//);
});

test('M04S01-31 architecture-has-no-authorization-provider-ui-ai-or-ambient-time-authority', () => {
  const source = readFileSync('packages/core/src/catalog/activity-profession-catalog.ts', 'utf8');
  assert.doesNotMatch(source, /\bAuthorizationGrant\b|EligibilityAssessment\.evaluate/);
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|aws-sdk|@aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /\b(llm|embedding|semanticSimilarity|fuzzySearch)\b/i);
});

test('M04S01-32 core-export-surface-exposes-only-the-admitted-s01-catalog-types', async () => {
  const core = await import('../src/index.ts');
  assert.equal('ActivityDefinition' in core, true);
  assert.equal('ProfessionDefinition' in core, true);
  assert.equal('ActivityDefinitionId' in core, true);
  assert.equal('ProfessionDefinitionId' in core, true);
  assert.equal('QualificationPath' in core, false);
  assert.equal('AuthorizationGrant' in core, false);
});
