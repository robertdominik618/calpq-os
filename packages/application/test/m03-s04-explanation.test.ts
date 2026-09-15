import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActorId,
  ActorKind,
  ActorReference,
  AtomicRequirementResult,
  ContentHash,
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
  Jurisdiction,
  ProvenanceEnvelope,
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
} from '../../core/src/index.ts';
import {
  CredentialCardReadModel,
  EvidenceSourceExplanationReadModel,
  ExplanationViewSourceKind,
  ProfessionalPassportProjection,
  WhyAffordanceKind,
  WhyTargetKind,
} from '../src/index.ts';

const IDS = {
  authority: '018f22e2-79b0-7cc3-98c4-dc0c0c079401',
  reviewer: '018f22e2-79b0-7cc3-98c4-dc0c0c079402',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c079403',
  otherSubject: '018f22e2-79b0-7cc3-98c4-dc0c0c079404',
  source: '018f22e2-79b0-7cc3-98c4-dc0c0c079405',
  original: '018f22e2-79b0-7cc3-98c4-dc0c0c079406',
  derived: '018f22e2-79b0-7cc3-98c4-dc0c0c079407',
  credential: '018f22e2-79b0-7cc3-98c4-dc0c0c079408',
  otherCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c079409',
  requirementSet: '018f22e2-79b0-7cc3-98c4-dc0c0c079410',
  otherRequirementSet: '018f22e2-79b0-7cc3-98c4-dc0c0c079411',
  assessment: '018f22e2-79b0-7cc3-98c4-dc0c0c079412',
  decision: '018f22e2-79b0-7cc3-98c4-dc0c0c079413',
  ruleSet: '018f22e2-79b0-7cc3-98c4-dc0c0c079414',
} as const;

const authority = ActorReference.create(ActorId.from(IDS.authority), ActorKind.EXTERNAL_AUTHORITY);
const reviewer = ActorReference.create(ActorId.from(IDS.reviewer), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);
const otherSubject = SubjectReference.create(SubjectId.from(IDS.otherSubject), SubjectKind.PERSON);

interface AssessmentOptions {
  readonly subject?: SubjectReference;
  readonly credentialId?: string;
  readonly credentialVersion?: string;
  readonly requirementSetId?: string;
  readonly requirementSetVersion?: string;
  readonly outcome?: DomainOutcome;
  readonly evaluatedAt?: string;
  readonly reasonCodes?: readonly string[];
  readonly sourceVersion?: string;
}

function buildAssessment(options: AssessmentOptions = {}): EligibilityAssessment {
  const selectedSubject = options.subject ?? subject;
  const requirementId = RequirementId.from('REQ-IDENTITY');
  const credential = CredentialDefinitionReference.create(
    CredentialDefinitionId.from(options.credentialId ?? IDS.credential),
    VersionId.from(options.credentialVersion ?? 'credential-4'),
  );
  const requirementSet = RequirementSet.create({
    id: RequirementSetId.from(options.requirementSetId ?? IDS.requirementSet),
    version: VersionId.from(options.requirementSetVersion ?? 'requirements-4'),
    credentialDefinition: credential,
    requirementIds: [requirementId],
    groups: [RequirementGroup.create({
      code: 'PRIMARY',
      mode: RequirementGroupMode.ALL,
      requirementIds: [requirementId],
    })],
  });
  const src = SourceReference.create({
    id: SourceId.from(IDS.source),
    authority,
    jurisdiction: Jurisdiction.fromCode('CZ'),
    sourceType: SourceType.ISSUER_RECORD,
    canonicalLocator: 'https://authority.example.test/credential/record',
    version: VersionId.from(options.sourceVersion ?? 'source-4'),
    publicationDate: DateOnly.from('2026-01-15'),
    effectiveFrom: DateOnly.from('2026-02-01'),
    effectiveTo: DateOnly.from('2027-01-31'),
    retrievedAt: UtcInstant.from('2026-09-15T10:00:00Z'),
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256('a'.repeat(64)),
  });
  const original = EvidenceReference.original({
    id: EvidenceId.from(IDS.original),
    kind: EvidenceKind.DOCUMENT,
    contentReference: 'object://evidence/original-credential',
    mediaType: 'application/pdf',
    contentHash: ContentHash.sha256('b'.repeat(64)),
    acquiredAt: UtcInstant.from('2026-09-15T10:01:00Z'),
    acquiredBy: authority,
    source: src,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
  const derived = EvidenceReference.derived({
    id: EvidenceId.from(IDS.derived),
    kind: EvidenceKind.OCR_TEXT,
    contentReference: 'object://evidence/ocr-text',
    mediaType: 'text/plain',
    acquiredAt: UtcInstant.from('2026-09-15T10:02:00Z'),
    acquiredBy: reviewer,
    source: src,
    derivationParent: original.id,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
  const evaluatedAt = UtcInstant.from(options.evaluatedAt ?? '2026-09-15T10:30:00Z');
  const provenance = ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.decision),
    evaluatedAt,
    actor: reviewer,
    subject: selectedSubject,
    ruleSetId: RuleSetId.from(IDS.ruleSet),
    ruleVersion: requirementSet.version,
    sources: [src],
    evidence: [original, derived],
  });

  return EligibilityAssessment.evaluate({
    id: EligibilityAssessmentId.from(IDS.assessment),
    subject: selectedSubject,
    credentialDefinition: credential,
    requirementSet,
    evaluatedAt,
    evidenceSnapshot: EvidenceSnapshot.capture([original, derived], UtcInstant.from('2026-09-15T10:10:00Z')),
    atomicResults: [AtomicRequirementResult.create({
      requirementId,
      outcome: options.outcome ?? DomainOutcome.SATISFIED,
      reasonCodes: options.reasonCodes ?? ['IDENTITY_MATCHED', 'SOURCE_CONFIRMED'],
    })],
    evaluator: reviewer,
    provenance,
  });
}

function cardFromAssessment(assessment = buildAssessment()): CredentialCardReadModel {
  const passport = ProfessionalPassportProjection.rebuild({
    assessment,
    generatedAt: UtcInstant.from('2026-09-15T10:31:00Z'),
  });
  return CredentialCardReadModel.compose({ passport });
}

function explanation(assessment = buildAssessment(), card = cardFromAssessment(assessment)) {
  return EvidenceSourceExplanationReadModel.compose({ card, assessment });
}

test('M03S04-01 card-input-required', () => {
  assert.throws(() => EvidenceSourceExplanationReadModel.compose({ card: {} as never, assessment: buildAssessment() }), TypeError);
});

test('M03S04-02 assessment-input-required', () => {
  assert.throws(() => EvidenceSourceExplanationReadModel.compose({ card: cardFromAssessment(), assessment: {} as never }), TypeError);
});

test('M03S04-03 assessment-id-match-required', () => {
  const assessment = buildAssessment();
  const card = cardFromAssessment(assessment);
  const fake = Object.create(CredentialCardReadModel.prototype) as CredentialCardReadModel & Record<string, unknown>;
  Object.assign(fake, card, { assessmentId: 'different-assessment' });
  assert.throws(() => EvidenceSourceExplanationReadModel.compose({ card: Object.freeze(fake), assessment }), /exactly match/);
});

test('M03S04-04 subject-match-required', () => {
  const card = cardFromAssessment(buildAssessment());
  assert.throws(() => explanation(buildAssessment({ subject: otherSubject }), card), /exactly match/);
});

test('M03S04-05 credential-definition-id-match-required', () => {
  const card = cardFromAssessment(buildAssessment());
  assert.throws(() => explanation(buildAssessment({ credentialId: IDS.otherCredential }), card), /exactly match/);
});

test('M03S04-06 credential-definition-version-match-required', () => {
  const card = cardFromAssessment(buildAssessment());
  assert.throws(() => explanation(buildAssessment({ credentialVersion: 'credential-5' }), card), /exactly match/);
});

test('M03S04-07 requirement-set-id-match-required', () => {
  const card = cardFromAssessment(buildAssessment());
  assert.throws(() => explanation(buildAssessment({ requirementSetId: IDS.otherRequirementSet }), card), /exactly match/);
});

test('M03S04-08 requirement-set-version-match-required', () => {
  const card = cardFromAssessment(buildAssessment());
  assert.throws(() => explanation(buildAssessment({ requirementSetVersion: 'requirements-5' }), card), /exactly match/);
});

test('M03S04-09 eligibility-outcome-match-required', () => {
  const card = cardFromAssessment(buildAssessment());
  assert.throws(() => explanation(buildAssessment({ outcome: DomainOutcome.NOT_SATISFIED }), card), /exactly match/);
});

test('M03S04-10 evaluation-instant-match-required', () => {
  const card = cardFromAssessment(buildAssessment());
  assert.throws(() => explanation(buildAssessment({ evaluatedAt: '2026-09-15T10:40:00Z' }), card), /exactly match/);
});

test('M03S04-11 governed-source-kind', () => {
  assert.equal(explanation().sourceKind, ExplanationViewSourceKind.ELIGIBILITY_ASSESSMENT);
});

test('M03S04-12 why-affordance-explicit', () => {
  const why = explanation().why;
  assert.equal(why.kind, WhyAffordanceKind.WHY);
  assert.equal(why.targetKind, WhyTargetKind.ELIGIBILITY);
  assert.equal(why.labelKey, 'action.why');
});

test('M03S04-13 why-stable-reference', () => {
  const first = explanation().why.explanationReference;
  const second = explanation().why.explanationReference;
  assert.equal(first, `calpq:explanation:eligibility:${IDS.assessment}`);
  assert.equal(first, second);
});

test('M03S04-14 why-non-authoritative', () => {
  const view = explanation();
  assert.equal(view.why.decisionAuthority, false);
  assert.equal(view.decisionAuthority, false);
  assert.equal(view.authorizationAuthority, false);
});

test('M03S04-15 requirement-reasons-preserve-codes', () => {
  const reason = explanation().reasons[0]!;
  assert.equal(reason.requirementId, 'REQ-IDENTITY');
  assert.deepEqual(reason.reasonCodes, ['IDENTITY_MATCHED', 'SOURCE_CONFIRMED']);
});

test('M03S04-16 empty-reason-codes-preserved', () => {
  const view = explanation(buildAssessment({ reasonCodes: [] }));
  assert.deepEqual(view.reasons[0]?.reasonCodes, []);
});

test('M03S04-17 reason-entry-outcome-passthrough', () => {
  for (const outcome of Object.values(DomainOutcome)) {
    const assessment = buildAssessment({ outcome });
    assert.equal(explanation(assessment).reasons[0]?.outcome, outcome);
  }
});

test('M03S04-18 source-metadata-passthrough', () => {
  const source = explanation().sources[0]!;
  assert.equal(source.sourceId, IDS.source);
  assert.deepEqual(source.authority, authority.toJSON());
  assert.deepEqual(source.jurisdiction, { code: 'CZ', scope: 'STATE' });
  assert.equal(source.sourceType, SourceType.ISSUER_RECORD);
  assert.equal(source.canonicalLocator, 'https://authority.example.test/credential/record');
  assert.equal(source.version, 'source-4');
  assert.equal(source.publicationDate, '2026-01-15');
  assert.equal(source.effectiveFrom, '2026-02-01');
  assert.equal(source.effectiveTo, '2027-01-31');
  assert.equal(source.retrievedAt, '2026-09-15T10:00:00.000Z');
  assert.equal(source.contentHash, `sha256:${'a'.repeat(64)}`);
});

test('M03S04-19 source-verification-state-passthrough', () => {
  assert.equal(explanation().sources[0]?.verificationState, VerificationStateCode.VERIFIED);
});

test('M03S04-20 evidence-snapshot-identity-metadata', () => {
  const evidence = explanation().evidence;
  assert.deepEqual(evidence.map((item) => item.evidenceId), [IDS.original, IDS.derived]);
  assert.equal(evidence[0]?.evidenceKind, EvidenceKind.DOCUMENT);
  assert.equal(evidence[0]?.contentReference, 'object://evidence/original-credential');
  assert.equal(evidence[0]?.contentHash, `sha256:${'b'.repeat(64)}`);
  assert.equal(evidence[0]?.verificationState, VerificationStateCode.VERIFIED);
  assert.equal(evidence[1]?.evidenceKind, EvidenceKind.OCR_TEXT);
  assert.equal(evidence[1]?.verificationState, VerificationStateCode.UNVERIFIED);
});

test('M03S04-21 evidence-source-link-fields-preserved', () => {
  const evidence = explanation().evidence;
  assert.equal(evidence[0]?.sourceId, IDS.source);
  assert.equal(evidence[0]?.sourceVersion, 'source-4');
  assert.equal(evidence[1]?.sourceId, IDS.source);
  assert.equal(evidence[1]?.sourceVersion, 'source-4');
});

test('M03S04-22 provenance-rule-identity', () => {
  const provenance = explanation().provenance;
  assert.equal(provenance.provenanceIdentity, IDS.decision);
  assert.equal(provenance.ruleSetId, IDS.ruleSet);
  assert.equal(provenance.ruleVersion, 'requirements-4');
  assert.equal(provenance.evaluatedAt.toString(), '2026-09-15T10:30:00.000Z');
  assert.equal(provenance.sourceCount, 1);
  assert.equal(provenance.evidenceCount, 2);
});

test('M03S04-23 provenance-actor-evaluator', () => {
  const provenance = explanation().provenance;
  assert.deepEqual(provenance.actor, reviewer.toJSON());
  assert.deepEqual(provenance.evaluator, reviewer.toJSON());
});

test('M03S04-24 immutable-view-and-nested', () => {
  const view = explanation();
  assert.equal(Object.isFrozen(view), true);
  assert.equal(Object.isFrozen(view.why), true);
  assert.equal(Object.isFrozen(view.reasons), true);
  assert.equal(Object.isFrozen(view.reasons[0]), true);
  assert.equal(Object.isFrozen(view.reasons[0]?.reasonCodes), true);
  assert.equal(Object.isFrozen(view.sources), true);
  assert.equal(Object.isFrozen(view.sources[0]), true);
  assert.equal(Object.isFrozen(view.evidence), true);
  assert.equal(Object.isFrozen(view.evidence[0]), true);
  assert.equal(Object.isFrozen(view.provenance), true);
});

test('M03S04-25 deterministic-serialization', () => {
  assert.deepEqual(explanation().toJSON(), explanation().toJSON());
});

test('M03S04-26 architecture-boundary', () => {
  const source = readFileSync('packages/application/src/explanation/evidence-source-explanation.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|@aws-sdk|aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
  assert.doesNotMatch(source, /\b(?:AuthorizationGrant|QualificationPath)\b/);
  assert.doesNotMatch(source, /(?:aiSummary|generatedExplanation|humanReadableReason|legalConclusion)/i);
  assert.match(source, /AtomicRequirementResult|atomicResults/);
  assert.match(source, /SourceReference/);
  assert.match(source, /EvidenceSnapshotEntry/);
  assert.match(source, /WhyAffordance/);
});
