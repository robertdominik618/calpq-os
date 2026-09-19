import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActorId,
  ActorKind,
  ActorReference,
  AtomicRequirementResult,
  CredentialDefinitionId,
  CredentialDefinitionReference,
  DecisionId,
  DomainOutcome,
  EligibilityAssessment,
  EligibilityAssessmentId,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  EvidenceSnapshot,
  ProvenanceEnvelope,
  RequirementGroup,
  RequirementGroupMode,
  RequirementId,
  RequirementSet,
  RequirementSetId,
  RuleSetId,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
  VersionId,
} from '../src/index.ts';

const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078001';
const OTHER_SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078002';
const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078003';
const CREDENTIAL_DEFINITION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078004';
const REQUIREMENT_SET_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078005';
const ASSESSMENT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078006';
const EVIDENCE_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078007';
const DECISION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078008';
const RULE_SET_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078009';
const EVALUATED_AT = UtcInstant.from('2026-09-15T08:30:00Z');
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);
const otherSubject = SubjectReference.create(SubjectId.from(OTHER_SUBJECT_ID), SubjectKind.PERSON);
const evaluator = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.HUMAN_USER);
const credential = CredentialDefinitionReference.create(
  CredentialDefinitionId.from(CREDENTIAL_DEFINITION_ID),
  VersionId.from('credential-1'),
);
const evidence = EvidenceReference.original({
  id: EvidenceId.from(EVIDENCE_ID),
  kind: EvidenceKind.DOCUMENT,
  contentReference: 'object://eligibility/source-document',
  mediaType: 'application/pdf',
  acquiredAt: UtcInstant.from('2026-09-15T08:00:00Z'),
  acquiredBy: evaluator,
  verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
});
const snapshot = EvidenceSnapshot.capture([evidence], UtcInstant.from('2026-09-15T08:20:00Z'));

function requirementIds(count: number): RequirementId[] {
  return Array.from({ length: count }, (_, index) => RequirementId.from(`REQ-${index + 1}`));
}

function fixture(
  mode: typeof RequirementGroupMode[keyof typeof RequirementGroupMode],
  outcomes: readonly (typeof DomainOutcome[keyof typeof DomainOutcome])[],
  options: { threshold?: number; requirementVersion?: string; assessmentSubject?: SubjectReference; provenanceSubject?: SubjectReference } = {},
) {
  const ids = requirementIds(outcomes.length);
  const version = VersionId.from(options.requirementVersion ?? 'requirements-1');
  const set = RequirementSet.create({
    id: RequirementSetId.from(REQUIREMENT_SET_ID),
    version,
    credentialDefinition: credential,
    requirementIds: ids,
    groups: [RequirementGroup.create({
      code: 'PRIMARY',
      mode,
      requirementIds: ids,
      threshold: options.threshold,
    })],
  });
  const atomicResults = outcomes.map((outcome, index) => AtomicRequirementResult.create({
    requirementId: ids[index]!,
    outcome,
    reasonCodes: [`R-${index + 1}`],
  }));
  const assessmentSubject = options.assessmentSubject ?? subject;
  const provenanceSubject = options.provenanceSubject ?? assessmentSubject;
  const provenance = ProvenanceEnvelope.create({
    identity: DecisionId.from(DECISION_ID),
    evaluatedAt: EVALUATED_AT,
    actor: evaluator,
    subject: provenanceSubject,
    ruleSetId: RuleSetId.from(RULE_SET_ID),
    ruleVersion: version,
    evidence: [evidence],
  });
  const assessment = EligibilityAssessment.evaluate({
    id: EligibilityAssessmentId.from(ASSESSMENT_ID),
    subject: assessmentSubject,
    credentialDefinition: credential,
    requirementSet: set,
    evaluatedAt: EVALUATED_AT,
    evidenceSnapshot: snapshot,
    atomicResults,
    evaluator,
    provenance,
  });
  return { assessment, set, atomicResults };
}

function one(outcome: typeof DomainOutcome[keyof typeof DomainOutcome]) {
  return fixture(RequirementGroupMode.ALL, [outcome]).assessment;
}

test('FV11-01 subject-binding', () => {
  assert.strictEqual(one(DomainOutcome.SATISFIED).subject, subject);
  assert.throws(() => fixture(RequirementGroupMode.ALL, [DomainOutcome.SATISFIED], {
    assessmentSubject: subject,
    provenanceSubject: otherSubject,
  }), /subject must match/i);
});

test('FV11-02 credential-version', () => {
  const assessment = one(DomainOutcome.SATISFIED);
  assert.equal(assessment.credentialDefinition.id.toString(), CREDENTIAL_DEFINITION_ID);
  assert.equal(assessment.credentialDefinition.version.toString(), 'credential-1');
});

test('FV11-03 requirement-set-version', () => {
  const assessment = one(DomainOutcome.SATISFIED);
  assert.equal(assessment.requirementSetId.toString(), REQUIREMENT_SET_ID);
  assert.equal(assessment.requirementSetVersion.toString(), 'requirements-1');
});

test('FV11-04 evaluation-instant', () => {
  assert.equal(one(DomainOutcome.SATISFIED).evaluatedAt.toString(), '2026-09-15T08:30:00.000Z');
});

test('FV11-05 evidence-snapshot', () => {
  const assessment = one(DomainOutcome.SATISFIED);
  assert.strictEqual(assessment.evidenceSnapshot, snapshot);
  assert.equal(assessment.evidenceSnapshot.entries[0]?.evidenceId.toString(), EVIDENCE_ID);
});

test('FV11-06 atomic-results', () => {
  const { assessment, atomicResults } = fixture(RequirementGroupMode.ALL, [DomainOutcome.SATISFIED, DomainOutcome.NOT_SATISFIED]);
  assert.deepEqual(assessment.atomicResults.map((item) => item.outcome), atomicResults.map((item) => item.outcome));
  assert.equal(Object.isFrozen(assessment.atomicResults), true);
});

test('FV11-07 satisfied', () => {
  assert.equal(one(DomainOutcome.SATISFIED).outcome, DomainOutcome.SATISFIED);
});

test('FV11-08 not-satisfied', () => {
  assert.equal(one(DomainOutcome.NOT_SATISFIED).outcome, DomainOutcome.NOT_SATISFIED);
});

test('FV11-09 indeterminate', () => {
  assert.equal(one(DomainOutcome.INDETERMINATE).outcome, DomainOutcome.INDETERMINATE);
});

test('FV11-10 review-required', () => {
  assert.equal(one(DomainOutcome.REVIEW_REQUIRED).outcome, DomainOutcome.REVIEW_REQUIRED);
});

test('FV11-11 all-satisfied', () => {
  assert.equal(fixture(RequirementGroupMode.ALL, [DomainOutcome.SATISFIED, DomainOutcome.SATISFIED]).assessment.outcome, DomainOutcome.SATISFIED);
});

test('FV11-12 all-negative', () => {
  assert.equal(fixture(RequirementGroupMode.ALL, [DomainOutcome.SATISFIED, DomainOutcome.NOT_SATISFIED, DomainOutcome.REVIEW_REQUIRED]).assessment.outcome, DomainOutcome.NOT_SATISFIED);
});

test('FV11-13 all-review', () => {
  assert.equal(fixture(RequirementGroupMode.ALL, [DomainOutcome.SATISFIED, DomainOutcome.REVIEW_REQUIRED]).assessment.outcome, DomainOutcome.REVIEW_REQUIRED);
});

test('FV11-14 all-indeterminate', () => {
  assert.equal(fixture(RequirementGroupMode.ALL, [DomainOutcome.SATISFIED, DomainOutcome.INDETERMINATE]).assessment.outcome, DomainOutcome.INDETERMINATE);
});

test('FV11-15 any-satisfied', () => {
  assert.equal(fixture(RequirementGroupMode.ANY, [DomainOutcome.NOT_SATISFIED, DomainOutcome.SATISFIED, DomainOutcome.REVIEW_REQUIRED]).assessment.outcome, DomainOutcome.SATISFIED);
});

test('FV11-16 any-negative', () => {
  assert.equal(fixture(RequirementGroupMode.ANY, [DomainOutcome.NOT_SATISFIED, DomainOutcome.NOT_SATISFIED]).assessment.outcome, DomainOutcome.NOT_SATISFIED);
});

test('FV11-17 any-review', () => {
  assert.equal(fixture(RequirementGroupMode.ANY, [DomainOutcome.NOT_SATISFIED, DomainOutcome.REVIEW_REQUIRED]).assessment.outcome, DomainOutcome.REVIEW_REQUIRED);
});

test('FV11-18 any-indeterminate', () => {
  assert.equal(fixture(RequirementGroupMode.ANY, [DomainOutcome.NOT_SATISFIED, DomainOutcome.INDETERMINATE]).assessment.outcome, DomainOutcome.INDETERMINATE);
});

test('FV11-19 at-least-satisfied', () => {
  assert.equal(fixture(RequirementGroupMode.AT_LEAST, [DomainOutcome.SATISFIED, DomainOutcome.SATISFIED, DomainOutcome.NOT_SATISFIED], { threshold: 2 }).assessment.outcome, DomainOutcome.SATISFIED);
});

test('FV11-20 at-least-negative', () => {
  assert.equal(fixture(RequirementGroupMode.AT_LEAST, [DomainOutcome.SATISFIED, DomainOutcome.NOT_SATISFIED, DomainOutcome.NOT_SATISFIED], { threshold: 2 }).assessment.outcome, DomainOutcome.NOT_SATISFIED);
});

test('FV11-21 at-least-review', () => {
  assert.equal(fixture(RequirementGroupMode.AT_LEAST, [DomainOutcome.SATISFIED, DomainOutcome.REVIEW_REQUIRED, DomainOutcome.NOT_SATISFIED], { threshold: 2 }).assessment.outcome, DomainOutcome.REVIEW_REQUIRED);
});

test('FV11-22 historical-immutable', () => {
  const first = fixture(RequirementGroupMode.ALL, [DomainOutcome.SATISFIED], { requirementVersion: 'requirements-1' }).assessment;
  const second = fixture(RequirementGroupMode.ALL, [DomainOutcome.NOT_SATISFIED], { requirementVersion: 'requirements-2' }).assessment;
  assert.equal(first.requirementSetVersion.toString(), 'requirements-1');
  assert.equal(first.outcome, DomainOutcome.SATISFIED);
  assert.equal(second.requirementSetVersion.toString(), 'requirements-2');
  assert.equal(second.outcome, DomainOutcome.NOT_SATISFIED);
  assert.equal(Object.isFrozen(first), true);
  assert.throws(() => { (first as unknown as { outcome: string }).outcome = DomainOutcome.NOT_SATISFIED; }, TypeError);
});

test('FV11-23 eligibility-not-grant', async () => {
  const assessment = one(DomainOutcome.SATISFIED);
  assert.equal('authorizationGrant' in assessment, false);
  const core = await import('../src/index.ts');
  assert.equal('AuthorizationGrant' in core, false);
});

test('FV11-24 architecture-boundary', () => {
  const source = readFileSync('packages/core/src/eligibility/eligibility-assessment.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk)/);
  assert.doesNotMatch(source, /\bAuthorizationGrant\b/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
});
