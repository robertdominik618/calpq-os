import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  DomainOutcome,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
} from '../../core/src/index.ts';
import {
  DashboardDestination,
  DashboardReadModel,
  DashboardSourceKind,
  PassportAuthorityClass,
  ProfessionalPassportProjection,
} from '../src/index.ts';

const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079101';
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);

function item(authorityClass: typeof PassportAuthorityClass[keyof typeof PassportAuthorityClass]) {
  return Object.freeze({ authorityClass }) as ProfessionalPassportProjection['items'][number];
}

function passport(input: {
  readonly outcome?: typeof DomainOutcome[keyof typeof DomainOutcome];
  readonly items?: readonly ProfessionalPassportProjection['items'][number][];
} = {}): ProfessionalPassportProjection {
  const value = Object.create(ProfessionalPassportProjection.prototype) as ProfessionalPassportProjection & Record<string, unknown>;
  Object.assign(value, {
    subject,
    assessmentId: 'assessment-001',
    credentialDefinitionId: 'credential-definition-001',
    credentialDefinitionVersion: 'v3',
    requirementSetId: 'requirement-set-001',
    requirementSetVersion: 'v7',
    eligibilityOutcome: input.outcome ?? DomainOutcome.SATISFIED,
    authoritativeEvaluatedAt: UtcInstant.from('2026-09-15T10:00:00Z'),
    generatedAt: UtcInstant.from('2026-09-15T10:01:00Z'),
    items: Object.freeze([...(input.items ?? [])]),
    authorizationAuthority: false,
  });
  return Object.freeze(value);
}

test('M03S01-01 passport-projection-input-required', () => {
  assert.throws(() => DashboardReadModel.fromPassport({} as ProfessionalPassportProjection), TypeError);
});

test('M03S01-02 governed-source-kind', () => {
  assert.equal(DashboardReadModel.fromPassport(passport()).sourceKind, DashboardSourceKind.PROFESSIONAL_PASSPORT_PROJECTION);
});

test('M03S01-03 subject-preserved', () => {
  assert.strictEqual(DashboardReadModel.fromPassport(passport()).subject, subject);
});

test('M03S01-04 authoritative-identifiers-and-versions-preserved', () => {
  const model = DashboardReadModel.fromPassport(passport());
  assert.equal(model.assessmentId, 'assessment-001');
  assert.equal(model.credentialDefinitionId, 'credential-definition-001');
  assert.equal(model.credentialDefinitionVersion, 'v3');
  assert.equal(model.requirementSetId, 'requirement-set-001');
  assert.equal(model.requirementSetVersion, 'v7');
});

test('M03S01-05 eligibility-outcome-passthrough', () => {
  for (const outcome of Object.values(DomainOutcome)) {
    assert.equal(DashboardReadModel.fromPassport(passport({ outcome })).eligibilityOutcome, outcome);
  }
});

test('M03S01-06 evaluation-and-projection-instants-preserved', () => {
  const model = DashboardReadModel.fromPassport(passport());
  assert.equal(model.authoritativeEvaluatedAt.toString(), '2026-09-15T10:00:00.000Z');
  assert.equal(model.projectionGeneratedAt.toString(), '2026-09-15T10:01:00.000Z');
});

test('M03S01-07 evidence-count-is-read-composition-only', () => {
  const model = DashboardReadModel.fromPassport(passport({ items: [
    item(PassportAuthorityClass.EVIDENCE),
    item(PassportAuthorityClass.VERIFIED_EVIDENCE),
    item(PassportAuthorityClass.DERIVED_INFORMATION),
  ] }));
  assert.equal(model.evidenceCount, 3);
});

test('M03S01-08 verified-evidence-count', () => {
  const model = DashboardReadModel.fromPassport(passport({ items: [
    item(PassportAuthorityClass.VERIFIED_EVIDENCE),
    item(PassportAuthorityClass.VERIFIED_EVIDENCE),
    item(PassportAuthorityClass.EVIDENCE),
  ] }));
  assert.equal(model.verifiedEvidenceCount, 2);
});

test('M03S01-09 evidence-only-count', () => {
  const model = DashboardReadModel.fromPassport(passport({ items: [
    item(PassportAuthorityClass.EVIDENCE),
    item(PassportAuthorityClass.DERIVED_INFORMATION),
  ] }));
  assert.equal(model.evidenceOnlyCount, 1);
});

test('M03S01-10 derived-information-count', () => {
  const model = DashboardReadModel.fromPassport(passport({ items: [
    item(PassportAuthorityClass.DERIVED_INFORMATION),
    item(PassportAuthorityClass.DERIVED_INFORMATION),
  ] }));
  assert.equal(model.derivedInformationCount, 2);
});

test('M03S01-11 controlled-navigation-destinations', () => {
  const destinations = DashboardReadModel.fromPassport(passport()).navigation.map((entry) => entry.destination);
  assert.deepEqual(destinations, [
    DashboardDestination.PASSPORT,
    DashboardDestination.CREDENTIALS,
    DashboardDestination.EVIDENCE,
    DashboardDestination.TIMELINE,
  ]);
});

test('M03S01-12 localization-ready-navigation-labels', () => {
  const navigation = DashboardReadModel.fromPassport(passport()).navigation;
  assert.deepEqual(navigation.map((entry) => entry.labelKey), [
    'navigation.passport',
    'navigation.credentials',
    'navigation.evidence',
    'navigation.timeline',
  ]);
  assert.equal(navigation.every((entry) => entry.labelKey.startsWith('navigation.')), true);
});

test('M03S01-13 immutable-dashboard-and-navigation', () => {
  const model = DashboardReadModel.fromPassport(passport());
  assert.equal(Object.isFrozen(model), true);
  assert.equal(Object.isFrozen(model.navigation), true);
  assert.equal(model.navigation.every(Object.isFrozen), true);
});

test('M03S01-14 deterministic-serialization', () => {
  const source = passport({ items: [item(PassportAuthorityClass.VERIFIED_EVIDENCE)] });
  assert.deepEqual(DashboardReadModel.fromPassport(source).toJSON(), DashboardReadModel.fromPassport(source).toJSON());
});

test('M03S01-15 non-authoritative-no-generic-valid-state', () => {
  const model = DashboardReadModel.fromPassport(passport());
  assert.equal(model.authorizationAuthority, false);
  assert.equal('valid' in model, false);
  assert.equal('isValid' in model, false);
  assert.equal('authorizationGrant' in model, false);
});

test('M03S01-16 architecture-boundary', () => {
  const source = readFileSync('packages/application/src/dashboard/dashboard-read-model.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|@aws-sdk|aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
  assert.doesNotMatch(source, /\b(?:AuthorizationGrant|EligibilityAssessment|VerificationRecord)\b/);
  assert.doesNotMatch(source, /\b(?:valid|isValid)\b/);
  assert.match(source, /ProfessionalPassportProjection/);
});
