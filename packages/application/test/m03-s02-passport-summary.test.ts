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
  CredentialGroupReadModel,
  CredentialProjectionSummaryReadModel,
  DashboardReadModel,
  PassportAuthorityClass,
  PassportSummarySourceKind,
  ProfessionalPassportProjection,
  ProfessionalPassportSummaryReadModel,
  summarizePassportAuthorityClasses,
} from '../src/index.ts';

const SUBJECT_A_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079201';
const SUBJECT_B_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079202';
const subjectA = SubjectReference.create(SubjectId.from(SUBJECT_A_ID), SubjectKind.PERSON);
const subjectB = SubjectReference.create(SubjectId.from(SUBJECT_B_ID), SubjectKind.PERSON);

function item(authorityClass: typeof PassportAuthorityClass[keyof typeof PassportAuthorityClass]) {
  return Object.freeze({ authorityClass }) as ProfessionalPassportProjection['items'][number];
}

function passport(input: {
  readonly subject?: SubjectReference;
  readonly assessmentId?: string;
  readonly credentialDefinitionId?: string;
  readonly credentialDefinitionVersion?: string;
  readonly requirementSetId?: string;
  readonly requirementSetVersion?: string;
  readonly outcome?: typeof DomainOutcome[keyof typeof DomainOutcome];
  readonly evaluatedAt?: string;
  readonly generatedAt?: string;
  readonly items?: readonly ProfessionalPassportProjection['items'][number][];
} = {}): ProfessionalPassportProjection {
  const value = Object.create(ProfessionalPassportProjection.prototype) as ProfessionalPassportProjection & Record<string, unknown>;
  Object.assign(value, {
    subject: input.subject ?? subjectA,
    assessmentId: input.assessmentId ?? 'assessment-201',
    credentialDefinitionId: input.credentialDefinitionId ?? 'credential-a',
    credentialDefinitionVersion: input.credentialDefinitionVersion ?? 'v1',
    requirementSetId: input.requirementSetId ?? 'requirements-a',
    requirementSetVersion: input.requirementSetVersion ?? 'r1',
    eligibilityOutcome: input.outcome ?? DomainOutcome.SATISFIED,
    authoritativeEvaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-15T12:00:00Z'),
    generatedAt: UtcInstant.from(input.generatedAt ?? '2026-09-15T12:01:00Z'),
    items: Object.freeze([...(input.items ?? [])]),
    authorizationAuthority: false,
  });
  return Object.freeze(value);
}

function compose(projections: readonly ProfessionalPassportProjection[]) {
  return ProfessionalPassportSummaryReadModel.compose({ subject: subjectA, projections });
}

test('M03S02-01 explicit-subject-required', () => {
  assert.throws(() => ProfessionalPassportSummaryReadModel.compose({
    subject: {} as SubjectReference,
    projections: [],
  }), TypeError);
});

test('M03S02-02 projection-array-required', () => {
  assert.throws(() => ProfessionalPassportSummaryReadModel.compose({
    subject: subjectA,
    projections: {} as readonly ProfessionalPassportProjection[],
  }), TypeError);
});

test('M03S02-03 invalid-projection-rejected', () => {
  assert.throws(() => compose([{} as ProfessionalPassportProjection]), TypeError);
});

test('M03S02-04 empty-summary-supported', () => {
  const summary = compose([]);
  assert.equal(summary.projectionCount, 0);
  assert.equal(summary.credentialGroupCount, 0);
  assert.deepEqual(summary.groups, []);
  assert.deepEqual(summary.outcomeCounts, {
    SATISFIED: 0,
    NOT_SATISFIED: 0,
    INDETERMINATE: 0,
    REVIEW_REQUIRED: 0,
  });
});

test('M03S02-05 subject-preserved', () => {
  assert.strictEqual(compose([passport()]).subject, subjectA);
});

test('M03S02-06 mixed-subject-rejected', () => {
  assert.throws(() => compose([
    passport({ assessmentId: 'assessment-201' }),
    passport({ subject: subjectB, assessmentId: 'assessment-202' }),
  ]), /cannot mix subjects/);
});

test('M03S02-07 duplicate-assessment-rejected', () => {
  assert.throws(() => compose([
    passport({ assessmentId: 'assessment-duplicate', credentialDefinitionVersion: 'v1' }),
    passport({ assessmentId: 'assessment-duplicate', credentialDefinitionVersion: 'v2' }),
  ]), /Duplicate eligibility assessment projection/);
});

test('M03S02-08 governed-source-kind', () => {
  assert.equal(compose([]).sourceKind, PassportSummarySourceKind.PROFESSIONAL_PASSPORT_PROJECTIONS);
});

test('M03S02-09 group-by-stable-credential-id', () => {
  const summary = compose([
    passport({ assessmentId: 'assessment-201', credentialDefinitionId: 'credential-a', credentialDefinitionVersion: 'v1' }),
    passport({ assessmentId: 'assessment-202', credentialDefinitionId: 'credential-a', credentialDefinitionVersion: 'v2' }),
  ]);
  assert.equal(summary.credentialGroupCount, 1);
  assert.equal(summary.groups[0]?.credentialDefinitionId, 'credential-a');
  assert.equal(summary.groups[0]?.assessmentCount, 2);
});

test('M03S02-10 separate-credential-groups-sorted', () => {
  const summary = compose([
    passport({ assessmentId: 'assessment-z', credentialDefinitionId: 'credential-z' }),
    passport({ assessmentId: 'assessment-a', credentialDefinitionId: 'credential-a' }),
  ]);
  assert.deepEqual(summary.groups.map((group) => group.credentialDefinitionId), ['credential-a', 'credential-z']);
});

test('M03S02-11 multiple-versions-preserved-within-group', () => {
  const summary = compose([
    passport({ assessmentId: 'assessment-v2', credentialDefinitionVersion: 'v2' }),
    passport({ assessmentId: 'assessment-v1', credentialDefinitionVersion: 'v1' }),
  ]);
  assert.deepEqual(summary.groups[0]?.credentialDefinitionVersions, ['v1', 'v2']);
});

test('M03S02-12 assessments-not-collapsed-across-versions', () => {
  const summary = compose([
    passport({ assessmentId: 'assessment-v1', credentialDefinitionVersion: 'v1' }),
    passport({ assessmentId: 'assessment-v2', credentialDefinitionVersion: 'v2' }),
  ]);
  assert.deepEqual(summary.groups[0]?.assessments.map((assessment) => assessment.assessmentId), [
    'assessment-v1',
    'assessment-v2',
  ]);
  assert.equal(summary.projectionCount, 2);
});

test('M03S02-13 requirement-set-identities-and-versions-preserved', () => {
  const assessment = compose([passport({
    requirementSetId: 'requirements-exact',
    requirementSetVersion: 'r17',
  })]).groups[0]?.assessments[0];
  assert.equal(assessment?.requirementSetId, 'requirements-exact');
  assert.equal(assessment?.requirementSetVersion, 'r17');
});

test('M03S02-14 eligibility-outcomes-passthrough-and-counted', () => {
  const projections = Object.values(DomainOutcome).map((outcome, index) => passport({
    assessmentId: `assessment-outcome-${index}`,
    outcome,
  }));
  const summary = compose(projections);
  for (const outcome of Object.values(DomainOutcome)) {
    assert.equal(summary.outcomeCounts[outcome], 1);
    assert.equal(summary.groups[0]?.outcomeCounts[outcome], 1);
  }
  assert.deepEqual(summary.groups[0]?.assessments.map((assessment) => assessment.eligibilityOutcome).sort(),
    Object.values(DomainOutcome).sort());
});

test('M03S02-15 evaluation-and-generation-instants-preserved', () => {
  const assessment = compose([passport({
    evaluatedAt: '2026-09-14T08:30:00Z',
    generatedAt: '2026-09-14T08:31:00Z',
  })]).groups[0]?.assessments[0];
  assert.equal(assessment?.authoritativeEvaluatedAt.toString(), '2026-09-14T08:30:00.000Z');
  assert.equal(assessment?.projectionGeneratedAt.toString(), '2026-09-14T08:31:00.000Z');
});

test('M03S02-16 evidence-metrics-aggregate-without-promotion', () => {
  const summary = compose([
    passport({
      assessmentId: 'assessment-201',
      items: [item(PassportAuthorityClass.VERIFIED_EVIDENCE), item(PassportAuthorityClass.EVIDENCE)],
    }),
    passport({
      assessmentId: 'assessment-202',
      items: [item(PassportAuthorityClass.DERIVED_INFORMATION), item(PassportAuthorityClass.DERIVED_INFORMATION)],
    }),
  ]);
  assert.equal(summary.evidenceCount, 4);
  assert.equal(summary.verifiedEvidenceCount, 1);
  assert.equal(summary.evidenceOnlyCount, 1);
  assert.equal(summary.derivedInformationCount, 2);
});

test('M03S02-17 deterministic-independent-of-input-order', () => {
  const first = passport({ assessmentId: 'assessment-201', credentialDefinitionId: 'credential-b', credentialDefinitionVersion: 'v2' });
  const second = passport({ assessmentId: 'assessment-202', credentialDefinitionId: 'credential-a', credentialDefinitionVersion: 'v3' });
  const third = passport({ assessmentId: 'assessment-203', credentialDefinitionId: 'credential-b', credentialDefinitionVersion: 'v1' });
  assert.deepEqual(compose([first, second, third]).toJSON(), compose([third, first, second]).toJSON());
});

test('M03S02-18 immutable-summary-groups-assessments', () => {
  const summary = compose([passport()]);
  const group = summary.groups[0];
  const assessment = group?.assessments[0];
  assert.equal(Object.isFrozen(summary), true);
  assert.equal(Object.isFrozen(summary.groups), true);
  assert.equal(Object.isFrozen(summary.outcomeCounts), true);
  assert.equal(Object.isFrozen(group), true);
  assert.equal(Object.isFrozen(group?.assessments), true);
  assert.equal(Object.isFrozen(group?.credentialDefinitionVersions), true);
  assert.equal(Object.isFrozen(group?.outcomeCounts), true);
  assert.equal(Object.isFrozen(assessment), true);
});

test('M03S02-19 group-rejects-mixed-credential-identity', () => {
  const left = CredentialProjectionSummaryReadModel.fromPassport(passport({
    assessmentId: 'assessment-left',
    credentialDefinitionId: 'credential-left',
  }));
  const right = CredentialProjectionSummaryReadModel.fromPassport(passport({
    assessmentId: 'assessment-right',
    credentialDefinitionId: 'credential-right',
  }));
  assert.throws(() => CredentialGroupReadModel.create('credential-left', [left, right]), /cannot mix credential definition identities/);
});

test('M03S02-20 shared-metrics-preserve-slice01-dashboard-semantics', () => {
  const source = passport({ items: [
    item(PassportAuthorityClass.VERIFIED_EVIDENCE),
    item(PassportAuthorityClass.EVIDENCE),
    item(PassportAuthorityClass.DERIVED_INFORMATION),
  ] });
  const metrics = summarizePassportAuthorityClasses(source);
  const dashboard = DashboardReadModel.fromPassport(source);
  assert.equal(dashboard.evidenceCount, metrics.evidenceCount);
  assert.equal(dashboard.verifiedEvidenceCount, metrics.verifiedEvidenceCount);
  assert.equal(dashboard.evidenceOnlyCount, metrics.evidenceOnlyCount);
  assert.equal(dashboard.derivedInformationCount, metrics.derivedInformationCount);
});

test('M03S02-21 non-authoritative-no-current-latest-valid-inference', () => {
  const summary = compose([passport()]);
  assert.equal(summary.authorizationAuthority, false);
  for (const key of ['current', 'latest', 'valid', 'isValid', 'authorizationGrant']) {
    assert.equal(key in summary, false);
    assert.equal(key in (summary.groups[0] ?? {}), false);
    assert.equal(key in (summary.groups[0]?.assessments[0] ?? {}), false);
  }
});

test('M03S02-22 architecture-boundary', () => {
  const summarySource = readFileSync('packages/application/src/passport/professional-passport-summary.ts', 'utf8');
  const metricsSource = readFileSync('packages/application/src/passport/passport-read-metrics.ts', 'utf8');
  const source = `${summarySource}\n${metricsSource}`;
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|@aws-sdk|aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
  assert.doesNotMatch(source, /\b(?:AuthorizationGrant|EligibilityAssessment|VerificationRecord|QualificationPath)\b/);
  assert.doesNotMatch(source, /\b(?:current|latest|valid|isValid)\b/);
  assert.match(source, /ProfessionalPassportProjection/);
  assert.match(source, /credentialDefinitionId/);
});
