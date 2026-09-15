import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  DomainOutcome,
  EligibilityAssessment,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
} from '../../core/src/index.ts';
import {
  ActivityTimelineEventKind,
  ActivityTimelineOmissionReason,
  ActivityTimelineOrdering,
  ActivityTimelineReadModel,
  CredentialExplanationReadModel,
  DocumentIntakeRecord,
  IntakeCorrectionRecord,
  ProfessionalPassportProjection,
} from '../src/index.ts';

const subject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079501'),
  SubjectKind.PERSON,
);
const otherSubject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079502'),
  SubjectKind.PERSON,
);

function textValue(value: string) {
  return Object.freeze({ toString: () => value });
}

function actor(id: string) {
  return Object.freeze({
    toJSON: () => Object.freeze({ referenceType: 'ACTOR' as const, id, kind: 'SYSTEM_PROCESS' as const }),
  });
}

function assessment(input: {
  readonly subjectValue?: SubjectReference;
  readonly assessmentId?: string;
  readonly provenanceIdentity?: string;
  readonly evaluatedAt?: string;
  readonly outcome?: typeof DomainOutcome[keyof typeof DomainOutcome];
  readonly ruleSetId?: string;
  readonly ruleVersion?: string;
  readonly reasonCodes?: readonly string[];
} = {}): EligibilityAssessment {
  const value = Object.create(EligibilityAssessment.prototype) as Record<string, unknown>;
  Object.assign(value, {
    id: textValue(input.assessmentId ?? 'assessment-005'),
    subject: input.subjectValue ?? subject,
    credentialDefinition: Object.freeze({
      id: textValue('credential-definition-005'),
      version: textValue('v5'),
    }),
    requirementSetId: textValue('requirement-set-005'),
    requirementSetVersion: textValue('v8'),
    evaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-15T12:00:00Z'),
    atomicResults: Object.freeze([
      Object.freeze({
        requirementId: textValue('REQ-A'),
        outcome: DomainOutcome.SATISFIED,
        reasonCodes: Object.freeze([...(input.reasonCodes ?? ['REQ_A_SATISFIED'])]),
      }),
    ]),
    outcome: input.outcome ?? DomainOutcome.SATISFIED,
    evaluator: actor('evaluator-005'),
    provenance: Object.freeze({
      identity: textValue(input.provenanceIdentity ?? 'decision-005'),
      ruleSetId: textValue(input.ruleSetId ?? 'ruleset-005'),
      ruleVersion: textValue(input.ruleVersion ?? 'v8'),
      sources: Object.freeze([]),
      evidence: Object.freeze([]),
    }),
  });
  return Object.freeze(value) as unknown as EligibilityAssessment;
}

function explanation(input: {
  readonly subjectValue?: SubjectReference;
  readonly assessmentId?: string;
  readonly provenanceIdentity?: string;
  readonly evaluatedAt?: string;
  readonly ruleSetId?: string;
  readonly ruleVersion?: string;
  readonly authorizationAuthority?: boolean;
  readonly decisionAuthority?: boolean;
} = {}): CredentialExplanationReadModel {
  const value = Object.create(CredentialExplanationReadModel.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject: input.subjectValue ?? subject,
    assessmentId: input.assessmentId ?? 'assessment-005',
    credentialDefinitionId: 'credential-definition-005',
    credentialDefinitionVersion: 'v5',
    requirementSetId: 'requirement-set-005',
    requirementSetVersion: 'v8',
    evaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-15T12:00:00Z').toString(),
    provenanceIdentity: input.provenanceIdentity ?? 'decision-005',
    ruleSetId: input.ruleSetId ?? 'ruleset-005',
    ruleVersion: input.ruleVersion ?? 'v8',
    evaluator: Object.freeze({ referenceType: 'ACTOR', id: 'evaluator-005', kind: 'SYSTEM_PROCESS' }),
    eligibility: Object.freeze({
      reasonCode: 'ELIGIBILITY_PRESENTED_FROM_AUTHORITATIVE_ASSESSMENT',
      sources: Object.freeze([]),
      evidence: Object.freeze([]),
      requirementReasons: Object.freeze([]),
    }),
    authorizationAuthority: input.authorizationAuthority ?? false,
    decisionAuthority: input.decisionAuthority ?? false,
  });
  return Object.freeze(value) as unknown as CredentialExplanationReadModel;
}

function passportItem(input: {
  readonly evidenceId?: string;
  readonly provenanceIdentity?: string;
  readonly verifiedAt?: string | null;
  readonly verifier?: ReturnType<typeof actor> | null;
  readonly reviewer?: ReturnType<typeof actor> | null;
  readonly verificationRecordState?: string | null;
} = {}) {
  const verifiedAt = input.verifiedAt === undefined ? '2026-09-15T11:45:00Z' : input.verifiedAt;
  return Object.freeze({
    evidenceId: textValue(input.evidenceId ?? 'evidence-005'),
    provenanceIdentity: textValue(input.provenanceIdentity ?? 'decision-005'),
    origin: 'ORIGINAL_EVIDENCE',
    authorityClass: 'VERIFIED_EVIDENCE',
    verificationStatus: 'VERIFIED',
    derivationMethod: null,
    verifier: input.verifier === undefined ? actor('verifier-005') : input.verifier,
    reviewer: input.reviewer === undefined ? actor('reviewer-005') : input.reviewer,
    verifiedAt: verifiedAt === null ? null : UtcInstant.from(verifiedAt),
    verificationRecordState: input.verificationRecordState === undefined ? 'VERIFIED' : input.verificationRecordState,
    verificationMethod: 'REGISTRY_LOOKUP',
    sourceVersion: 'source-v5',
    verificationSourceVersion: 'verify-v5',
    sourceHash: 'sha256:evidence-005',
    contentReference: 'blob:evidence-005',
  });
}

function passport(input: {
  readonly subjectValue?: SubjectReference;
  readonly assessmentId?: string;
  readonly evaluatedAt?: string;
  readonly outcome?: typeof DomainOutcome[keyof typeof DomainOutcome];
  readonly authorizationAuthority?: boolean;
  readonly items?: readonly ReturnType<typeof passportItem>[];
} = {}): ProfessionalPassportProjection {
  const value = Object.create(ProfessionalPassportProjection.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject: input.subjectValue ?? subject,
    assessmentId: input.assessmentId ?? 'assessment-005',
    credentialDefinitionId: 'credential-definition-005',
    credentialDefinitionVersion: 'v5',
    requirementSetId: 'requirement-set-005',
    requirementSetVersion: 'v8',
    eligibilityOutcome: input.outcome ?? DomainOutcome.SATISFIED,
    authoritativeEvaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-15T12:00:00Z'),
    generatedAt: UtcInstant.from('2026-09-15T12:30:00Z'),
    items: Object.freeze([...(input.items ?? [passportItem()])]),
    authorizationAuthority: input.authorizationAuthority ?? false,
  });
  return Object.freeze(value) as unknown as ProfessionalPassportProjection;
}

function intake(input: {
  readonly id?: string;
  readonly subjectValue?: SubjectReference | null;
  readonly receivedAt?: string;
  readonly evidenceId?: string;
} = {}): DocumentIntakeRecord {
  const value = Object.create(DocumentIntakeRecord.prototype) as Record<string, unknown>;
  Object.assign(value, {
    id: textValue(input.id ?? '018f22e2-79b0-7cc3-98c4-dc0c0c079511'),
    sourceChannel: 'FILE_UPLOAD',
    receivedAt: UtcInstant.from(input.receivedAt ?? '2026-09-15T11:00:00Z'),
    receivedBy: actor('receiver-005'),
    subject: input.subjectValue === undefined ? subject : input.subjectValue,
    originalArtifact: Object.freeze({ id: textValue(input.evidenceId ?? 'evidence-original-005') }),
    media: Object.freeze({ mediaType: 'application/pdf' }),
  });
  return Object.freeze(value) as unknown as DocumentIntakeRecord;
}

function correction(input: {
  readonly intakeId?: string;
  readonly correctedAt?: string;
  readonly correctionEvidenceId?: string;
} = {}): IntakeCorrectionRecord {
  const value = Object.create(IntakeCorrectionRecord.prototype) as Record<string, unknown>;
  Object.assign(value, {
    intakeId: textValue(input.intakeId ?? '018f22e2-79b0-7cc3-98c4-dc0c0c079511'),
    originalEvidenceId: textValue('evidence-original-005'),
    correctionEvidence: Object.freeze({ id: textValue(input.correctionEvidenceId ?? 'evidence-correction-005') }),
    correctedBy: actor('corrector-005'),
    correctedAt: UtcInstant.from(input.correctedAt ?? '2026-09-15T11:30:00Z'),
    reason: 'Corrected extracted holder name',
  });
  return Object.freeze(value) as unknown as IntakeCorrectionRecord;
}

function compose(input: {
  readonly explanationValue?: CredentialExplanationReadModel;
  readonly passportValue?: ProfessionalPassportProjection;
  readonly assessmentValue?: EligibilityAssessment;
  readonly intakes?: readonly DocumentIntakeRecord[];
  readonly corrections?: readonly IntakeCorrectionRecord[];
} = {}) {
  return ActivityTimelineReadModel.compose({
    explanation: input.explanationValue ?? explanation(),
    passport: input.passportValue ?? passport(),
    assessment: input.assessmentValue ?? assessment(),
    intakes: input.intakes,
    corrections: input.corrections,
  });
}

test('M03S05-01 explanation-input-required', () => {
  assert.throws(() => ActivityTimelineReadModel.compose({ explanation: {} as CredentialExplanationReadModel, passport: passport(), assessment: assessment() }), TypeError);
});

test('M03S05-02 passport-input-required', () => {
  assert.throws(() => ActivityTimelineReadModel.compose({ explanation: explanation(), passport: {} as ProfessionalPassportProjection, assessment: assessment() }), TypeError);
});

test('M03S05-03 authoritative-assessment-input-required', () => {
  assert.throws(() => ActivityTimelineReadModel.compose({ explanation: explanation(), passport: passport(), assessment: {} as EligibilityAssessment }), TypeError);
});

test('M03S05-04 presentation-inputs-must-remain-non-authoritative', () => {
  assert.throws(() => compose({ explanationValue: explanation({ decisionAuthority: true }) }), TypeError);
  assert.throws(() => compose({ passportValue: passport({ authorizationAuthority: true }) }), TypeError);
});

test('M03S05-05 subject-binding-must-match', () => {
  assert.throws(() => compose({ passportValue: passport({ subjectValue: otherSubject }) }), TypeError);
});

test('M03S05-06 assessment-identity-must-match', () => {
  assert.throws(() => compose({ assessmentValue: assessment({ assessmentId: 'assessment-other' }) }), TypeError);
});

test('M03S05-07 decision-provenance-identity-must-match', () => {
  assert.throws(() => compose({ explanationValue: explanation({ provenanceIdentity: 'decision-other' }) }), TypeError);
});

test('M03S05-08 authoritative-evaluation-instant-must-match', () => {
  assert.throws(() => compose({ passportValue: passport({ evaluatedAt: '2026-09-15T12:01:00Z' }) }), TypeError);
});

test('M03S05-09 eligibility-outcome-is-not-recomputed', () => {
  assert.throws(() => compose({ passportValue: passport({ outcome: DomainOutcome.REVIEW_REQUIRED }) }), TypeError);
});

test('M03S05-10 intakes-must-use-governed-record-type', () => {
  assert.throws(() => compose({ intakes: [{} as DocumentIntakeRecord] }), TypeError);
});

test('M03S05-11 corrections-must-use-governed-record-type', () => {
  assert.throws(() => compose({ corrections: [{} as IntakeCorrectionRecord] }), TypeError);
});

test('M03S05-12 intake-must-have-explicit-subject-binding', () => {
  assert.throws(() => compose({ intakes: [intake({ subjectValue: null })] }), TypeError);
});

test('M03S05-13 foreign-subject-intake-is-rejected', () => {
  assert.throws(() => compose({ intakes: [intake({ subjectValue: otherSubject })] }), TypeError);
});

test('M03S05-14 duplicate-intake-is-rejected', () => {
  const value = intake();
  assert.throws(() => compose({ intakes: [value, value] }), TypeError);
});

test('M03S05-15 correction-must-reference-admitted-subject-intake', () => {
  assert.throws(() => compose({ corrections: [correction()] }), TypeError);
});

test('M03S05-16 passport-item-provenance-must-match-decision', () => {
  assert.throws(() => compose({ passportValue: passport({ items: [passportItem({ provenanceIdentity: 'decision-other' })] }) }), TypeError);
});

test('M03S05-17 timestamped-verification-requires-verifier-attribution', () => {
  assert.throws(() => compose({ passportValue: passport({ items: [passportItem({ verifier: null })] }) }), TypeError);
});

test('M03S05-18 timestamped-verification-requires-record-state', () => {
  assert.throws(() => compose({ passportValue: passport({ items: [passportItem({ verificationRecordState: null })] }) }), TypeError);
});

test('M03S05-19 document-received-event-uses-explicit-record-time-and-actor', () => {
  const timeline = compose({ intakes: [intake()] });
  const event = timeline.events.find((entry) => entry.kind === ActivityTimelineEventKind.DOCUMENT_RECEIVED)!;
  assert.equal(event.occurredAt.toString(), '2026-09-15T11:00:00.000Z');
  assert.equal(event.actorAttributions[0]?.role, 'RECEIVED_BY');
  assert.equal(event.references[0]?.kind, 'INTAKE');
  assert.equal(event.details.sourceChannel, 'FILE_UPLOAD');
});

test('M03S05-20 correction-event-preserves-explicit-time-and-evidence-links', () => {
  const timeline = compose({ intakes: [intake()], corrections: [correction()] });
  const event = timeline.events.find((entry) => entry.kind === ActivityTimelineEventKind.DOCUMENT_CORRECTED)!;
  assert.equal(event.occurredAt.toString(), '2026-09-15T11:30:00.000Z');
  assert.deepEqual(event.references.map((reference) => reference.kind), ['INTAKE', 'ORIGINAL_EVIDENCE', 'CORRECTION_EVIDENCE']);
  assert.equal(event.details.reason, 'Corrected extracted holder name');
});

test('M03S05-21 verification-event-is-created-only-from-explicit-verifiedAt', () => {
  const timeline = compose();
  const event = timeline.events.find((entry) => entry.kind === ActivityTimelineEventKind.VERIFICATION_RECORDED)!;
  assert.equal(event.occurredAt.toString(), '2026-09-15T11:45:00.000Z');
  assert.deepEqual(event.actorAttributions.map((item) => item.role), ['VERIFIER', 'REVIEWER']);
  assert.equal(event.details.verificationRecordState, 'VERIFIED');
});

test('M03S05-22 verification-without-time-becomes-explicit-omission-not-invented-event', () => {
  const timeline = compose({ passportValue: passport({ items: [passportItem({ verifiedAt: null, verifier: null, verificationRecordState: null })] }) });
  assert.equal(timeline.events.some((entry) => entry.kind === ActivityTimelineEventKind.VERIFICATION_RECORDED), false);
  assert.equal(timeline.omissions.length, 1);
  assert.equal(timeline.omissions[0]?.reasonCode, ActivityTimelineOmissionReason.VERIFICATION_EVENT_TIME_NOT_AVAILABLE);
});

test('M03S05-23 eligibility-event-preserves-authoritative-time-outcome-and-reasons', () => {
  const timeline = compose({ assessmentValue: assessment({ reasonCodes: ['RULE_A', 'SOURCE_A'] }) });
  const event = timeline.events.find((entry) => entry.kind === ActivityTimelineEventKind.ELIGIBILITY_EVALUATED)!;
  assert.equal(event.occurredAt.toString(), '2026-09-15T12:00:00.000Z');
  assert.equal(event.details.outcome, DomainOutcome.SATISFIED);
  assert.deepEqual(event.reasonCodes, ['RULE_A', 'SOURCE_A']);
  assert.equal(event.actorAttributions[0]?.role, 'EVALUATOR');
});

test('M03S05-24 decision-provenance-presentation-preserves-authoritative-bindings', () => {
  const provenance = compose().decisionProvenance;
  assert.equal(provenance.assessmentId, 'assessment-005');
  assert.equal(provenance.decisionIdentity, 'decision-005');
  assert.equal(provenance.outcome, DomainOutcome.SATISFIED);
  assert.equal(provenance.ruleSetId, 'ruleset-005');
  assert.equal(provenance.ruleVersion, 'v8');
  assert.equal(provenance.evaluatedAt.toString(), '2026-09-15T12:00:00.000Z');
  assert.equal(provenance.decisionAuthority, false);
});

test('M03S05-25 decision-provenance-rule-binding-fails-closed', () => {
  assert.throws(() => compose({ explanationValue: explanation({ ruleVersion: 'v-other' }) }), TypeError);
});

test('M03S05-26 timeline-is-reverse-chronological-from-governed-times', () => {
  const timeline = compose({ intakes: [intake()], corrections: [correction()] });
  assert.deepEqual(timeline.events.map((event) => event.kind), [
    ActivityTimelineEventKind.ELIGIBILITY_EVALUATED,
    ActivityTimelineEventKind.VERIFICATION_RECORDED,
    ActivityTimelineEventKind.DOCUMENT_CORRECTED,
    ActivityTimelineEventKind.DOCUMENT_RECEIVED,
  ]);
  assert.equal(timeline.ordering, ActivityTimelineOrdering.OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK);
});

test('M03S05-27 equal-times-use-explicit-non-causal-kind-tie-break', () => {
  const same = '2026-09-15T12:00:00Z';
  const timeline = compose({
    passportValue: passport({ items: [passportItem({ verifiedAt: same })] }),
    intakes: [intake({ receivedAt: same })],
    corrections: [correction({ correctedAt: same })],
  });
  assert.deepEqual(timeline.events.map((event) => event.kind), [
    ActivityTimelineEventKind.ELIGIBILITY_EVALUATED,
    ActivityTimelineEventKind.VERIFICATION_RECORDED,
    ActivityTimelineEventKind.DOCUMENT_CORRECTED,
    ActivityTimelineEventKind.DOCUMENT_RECEIVED,
  ]);
});

test('M03S05-28 deterministic-serialization-and-zero-authority', () => {
  const left = compose({ intakes: [intake()], corrections: [correction()] });
  const right = compose({ intakes: [intake()], corrections: [correction()] });
  assert.deepEqual(left.toJSON(), right.toJSON());
  assert.equal(left.authorizationAuthority, false);
  assert.equal(left.decisionAuthority, false);
  assert.equal(left.events.every((event) => event.decisionAuthority === false), true);
});

test('M03S05-29 root-and-nested-presentation-state-are-immutable', () => {
  const timeline = compose({ intakes: [intake()], corrections: [correction()] });
  assert.equal(Object.isFrozen(timeline), true);
  assert.equal(Object.isFrozen(timeline.events), true);
  assert.equal(Object.isFrozen(timeline.events[0]), true);
  assert.equal(Object.isFrozen(timeline.events[0]?.actorAttributions), true);
  assert.equal(Object.isFrozen(timeline.events[0]?.references), true);
  assert.equal(Object.isFrozen(timeline.omissions), true);
  assert.equal(Object.isFrozen(timeline.decisionProvenance), true);
});

test('M03S05-30 architecture-boundary-no-invented-history-or-authority', () => {
  const source = readFileSync('packages/application/src/timeline/activity-timeline-read-model.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|@aws-sdk|aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /\bAuthorizationGrant\b/);
  assert.doesNotMatch(source, /passport\.generatedAt/);
  assert.doesNotMatch(source, /\b(isValid|latest|current|active|expired)\b/);
  assert.match(source, /verifiedAt/);
  assert.match(source, /evaluatedAt/);
  assert.match(source, /receivedAt/);
  assert.match(source, /correctedAt/);
  assert.match(source, /VERIFICATION_EVENT_TIME_NOT_AVAILABLE/);
  assert.match(source, /OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK/);
});
