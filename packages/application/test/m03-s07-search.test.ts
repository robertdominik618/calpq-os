import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  SubjectId,
  SubjectKind,
  SubjectReference,
} from '../../core/src/index.ts';
import {
  ActivityTimelineReadModel,
  ApprovedSearchQueryModel,
  ApprovedSearchRecord,
  CredentialCardReadModel,
  CredentialExplanationReadModel,
  IntentSearchIntent,
  IntentSearchMatchKind,
  IntentSearchNoResultReason,
  IntentSearchOrdering,
  IntentSearchQuery,
  IntentSearchReadModel,
  IntentSearchRecordKind,
  IntentSearchSourceKind,
  IntentSearchToken,
  MissingConditionNextActionReadModel,
  ProfessionalPassportSummaryReadModel,
} from '../src/index.ts';

const subject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079701'),
  SubjectKind.PERSON,
);
const otherSubject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079702'),
  SubjectKind.PERSON,
);

function passportSummary(subjectValue = subject): ProfessionalPassportSummaryReadModel {
  const value = Object.create(ProfessionalPassportSummaryReadModel.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject: subjectValue,
    authorizationAuthority: false,
    groups: Object.freeze([
      Object.freeze({
        credentialDefinitionId: 'credential-alpha',
        credentialDefinitionVersions: Object.freeze(['v1', 'v2']),
        assessments: Object.freeze([
          Object.freeze({ assessmentId: 'assessment-alpha', requirementSetId: 'requirements-alpha', requirementSetVersion: 'rv2', eligibilityOutcome: 'NOT_SATISFIED' }),
        ]),
      }),
      Object.freeze({
        credentialDefinitionId: 'credential-beta',
        credentialDefinitionVersions: Object.freeze(['v1']),
        assessments: Object.freeze([
          Object.freeze({ assessmentId: 'assessment-beta', requirementSetId: 'requirements-beta', requirementSetVersion: 'rv1', eligibilityOutcome: 'SATISFIED' }),
        ]),
      }),
    ]),
  });
  return Object.freeze(value) as unknown as ProfessionalPassportSummaryReadModel;
}

function card(subjectValue = subject, authorizationAuthority = false): CredentialCardReadModel {
  const value = Object.create(CredentialCardReadModel.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject: subjectValue,
    authorizationAuthority,
    assessmentId: 'assessment-alpha',
    credentialDefinitionId: 'credential-alpha',
    credentialDefinitionVersion: 'v2',
    requirementSetId: 'requirements-alpha',
    requirementSetVersion: 'rv2',
    eligibility: Object.freeze({ outcome: 'NOT_SATISFIED' }),
    document: Object.freeze({
      availability: 'AVAILABLE',
      reasonCode: null,
      artifactId: 'artifact-alpha',
      bindingReference: 'binding-alpha',
    }),
    lifecycle: Object.freeze({ reasonCode: 'LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03' }),
  });
  return Object.freeze(value) as unknown as CredentialCardReadModel;
}

function explanation(subjectValue = subject, decisionAuthority = false): CredentialExplanationReadModel {
  const value = Object.create(CredentialExplanationReadModel.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject: subjectValue,
    assessmentId: 'assessment-alpha',
    provenanceIdentity: 'decision-alpha',
    authorizationAuthority: false,
    decisionAuthority,
    eligibility: Object.freeze({
      sources: Object.freeze([
        Object.freeze({ sourceId: 'source-law-alpha', sourceType: 'LAW', version: '2026-1', verificationState: 'VERIFIED' }),
      ]),
      evidence: Object.freeze([
        Object.freeze({ evidenceId: 'evidence-alpha', kind: 'DOCUMENT', evidenceClass: 'ORIGINAL', mediaType: 'application/pdf', sourceId: 'source-law-alpha', verificationState: 'VERIFIED' }),
      ]),
      requirementReasons: Object.freeze([
        Object.freeze({ requirementId: 'REQ-A', outcome: 'NOT_SATISFIED', reasonCodes: Object.freeze(['MISSING_EVIDENCE']) }),
      ]),
    }),
    verification: Object.freeze({
      verificationItems: Object.freeze([
        Object.freeze({
          evidenceId: 'evidence-alpha', provenanceIdentity: 'decision-alpha', origin: 'ORIGINAL_EVIDENCE', authorityClass: 'VERIFIED_EVIDENCE',
          verificationStatus: 'VERIFIED', verificationRecordState: 'VERIFIED', verificationMethod: 'REGISTRY_LOOKUP', sourceVersion: '2026-1', verificationSourceVersion: 'verify-v1',
        }),
      ]),
    }),
  });
  return Object.freeze(value) as unknown as CredentialExplanationReadModel;
}

function timeline(subjectValue = subject, decisionAuthority = false): ActivityTimelineReadModel {
  const value = Object.create(ActivityTimelineReadModel.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject: subjectValue,
    authorizationAuthority: false,
    decisionAuthority,
    events: Object.freeze([
      Object.freeze({ eventId: 'event-eligibility-alpha', kind: 'ELIGIBILITY_EVALUATED', sourceKind: 'ELIGIBILITY_ASSESSMENT', reasonCodes: Object.freeze(['MISSING_EVIDENCE']), references: Object.freeze([{ kind: 'ASSESSMENT', id: 'assessment-alpha' }]) }),
      Object.freeze({ eventId: 'event-document-alpha', kind: 'DOCUMENT_RECEIVED', sourceKind: 'DOCUMENT_INTAKE_RECORD', reasonCodes: Object.freeze([]), references: Object.freeze([{ kind: 'EVIDENCE', id: 'evidence-alpha' }]) }),
    ]),
    omissions: Object.freeze([
      Object.freeze({ sourceKind: 'PROFESSIONAL_PASSPORT_ITEM', sourceReference: 'evidence-beta', reasonCode: 'VERIFICATION_EVENT_TIME_NOT_AVAILABLE' }),
    ]),
  });
  return Object.freeze(value) as unknown as ActivityTimelineReadModel;
}

function guidance(subjectValue = subject, decisionAuthority = false): MissingConditionNextActionReadModel {
  const value = Object.create(MissingConditionNextActionReadModel.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject: subjectValue,
    authorizationAuthority: false,
    decisionAuthority,
    actionRecommendationAuthority: false,
    assessmentId: 'assessment-alpha',
    provenanceIdentity: 'decision-alpha',
    missingConditions: Object.freeze([
      Object.freeze({
        requirementId: 'REQ-A', state: 'NOT_SATISFIED', reasonCodes: Object.freeze(['MISSING_EVIDENCE']),
        nextActionAvailability: 'AVAILABLE', nextActionReason: 'EXPLICIT_GOVERNED_ACTION_REFERENCE',
        nextActions: Object.freeze([
          Object.freeze({ actionCode: 'UPLOAD_EVIDENCE', labelKey: 'action.uploadEvidence', reasonCode: 'MISSING_EVIDENCE', provenanceIdentity: 'decision-alpha', supportingSourceIds: Object.freeze(['source-law-alpha']), supportingEvidenceIds: Object.freeze([]) }),
        ]),
      }),
      Object.freeze({
        requirementId: 'REQ-B', state: 'REVIEW_REQUIRED', reasonCodes: Object.freeze(['MANUAL_REVIEW']),
        nextActionAvailability: 'NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS', nextActionReason: 'NO_GOVERNED_ACTION_REFERENCE', nextActions: Object.freeze([]),
      }),
    ]),
  });
  return Object.freeze(value) as unknown as MissingConditionNextActionReadModel;
}

const models = () => Object.freeze([
  ApprovedSearchQueryModel.fromPassportSummary(passportSummary()),
  ApprovedSearchQueryModel.fromCredentialCard(card()),
  ApprovedSearchQueryModel.fromExplanation(explanation()),
  ApprovedSearchQueryModel.fromTimeline(timeline()),
  ApprovedSearchQueryModel.fromGuidance(guidance()),
]);

function query(intent: typeof IntentSearchIntent[keyof typeof IntentSearchIntent], terms: readonly string[], limit = 25) {
  return IntentSearchQuery.create({ subject, intent, terms, limit });
}

function search(intent: typeof IntentSearchIntent[keyof typeof IntentSearchIntent], terms: readonly string[], inputModels = models(), limit = 25) {
  return IntentSearchReadModel.search({ query: query(intent, terms, limit), models: inputModels });
}

test('M03S07-01 query-input-required', () => {
  assert.throws(() => IntentSearchReadModel.search({ query: {} as IntentSearchQuery, models: models() }), TypeError);
});

test('M03S07-02 models-must-use-approved-query-model', () => {
  assert.throws(() => IntentSearchReadModel.search({ query: query(IntentSearchIntent.CREDENTIAL, ['credential']), models: [{} as ApprovedSearchQueryModel] }), TypeError);
});

test('M03S07-03 subject-reference-is-required', () => {
  assert.throws(() => IntentSearchQuery.create({ subject: {} as SubjectReference, intent: IntentSearchIntent.CREDENTIAL, terms: ['credential'] }), TypeError);
});

test('M03S07-04 intent-is-controlled', () => {
  assert.throws(() => IntentSearchQuery.create({ subject, intent: 'FREE_FORM' as never, terms: ['credential'] }), TypeError);
});

test('M03S07-05 query-requires-one-to-eight-terms', () => {
  assert.throws(() => IntentSearchQuery.create({ subject, intent: IntentSearchIntent.CREDENTIAL, terms: [] }), RangeError);
  assert.throws(() => IntentSearchQuery.create({ subject, intent: IntentSearchIntent.CREDENTIAL, terms: Array.from({ length: 9 }, (_, index) => `x${index}`) }), RangeError);
});

test('M03S07-06 normalized-duplicate-terms-are-rejected', () => {
  assert.throws(() => IntentSearchQuery.create({ subject, intent: IntentSearchIntent.CREDENTIAL, terms: ['Credential', 'credential'] }), TypeError);
});

test('M03S07-07 limit-is-bounded', () => {
  assert.throws(() => IntentSearchQuery.create({ subject, intent: IntentSearchIntent.CREDENTIAL, terms: ['x'], limit: 0 }), RangeError);
  assert.throws(() => IntentSearchQuery.create({ subject, intent: IntentSearchIntent.CREDENTIAL, terms: ['x'], limit: 101 }), RangeError);
});

test('M03S07-08 passport-summary-factory-requires-governed-type', () => {
  assert.throws(() => ApprovedSearchQueryModel.fromPassportSummary({} as ProfessionalPassportSummaryReadModel), TypeError);
});

test('M03S07-09 passport-summary-must-remain-non-authoritative', () => {
  const fake = Object.create(ProfessionalPassportSummaryReadModel.prototype) as Record<string, unknown>;
  Object.assign(fake, { subject, authorizationAuthority: true, groups: Object.freeze([]) });
  assert.throws(() => ApprovedSearchQueryModel.fromPassportSummary(Object.freeze(fake) as unknown as ProfessionalPassportSummaryReadModel), TypeError);
});

test('M03S07-10 credential-card-factory-requires-governed-non-authoritative-type', () => {
  assert.throws(() => ApprovedSearchQueryModel.fromCredentialCard({} as CredentialCardReadModel), TypeError);
  assert.throws(() => ApprovedSearchQueryModel.fromCredentialCard(card(subject, true)), TypeError);
});

test('M03S07-11 explanation-source-must-remain-non-authoritative', () => {
  assert.throws(() => ApprovedSearchQueryModel.fromExplanation(explanation(subject, true)), TypeError);
});

test('M03S07-12 timeline-source-must-remain-non-authoritative', () => {
  assert.throws(() => ApprovedSearchQueryModel.fromTimeline(timeline(subject, true)), TypeError);
});

test('M03S07-13 guidance-source-must-remain-non-authoritative', () => {
  assert.throws(() => ApprovedSearchQueryModel.fromGuidance(guidance(subject, true)), TypeError);
});

test('M03S07-14 cross-subject-model-is-rejected', () => {
  const foreign = ApprovedSearchQueryModel.fromCredentialCard(card(otherSubject));
  assert.throws(() => IntentSearchReadModel.search({ query: query(IntentSearchIntent.CREDENTIAL, ['credential']), models: [foreign] }), TypeError);
});

test('M03S07-15 credential-intent-searches-only-passport-and-card-records', () => {
  const result = search(IntentSearchIntent.CREDENTIAL, ['credential-alpha']);
  assert.ok(result.hits.length >= 2);
  assert.equal(result.hits.every((hit) => hit.sourceKind === IntentSearchSourceKind.PASSPORT_SUMMARY || hit.sourceKind === IntentSearchSourceKind.CREDENTIAL_CARD), true);
});

test('M03S07-16 evidence-intent-searches-only-evidence-approved-record-kinds', () => {
  const result = search(IntentSearchIntent.EVIDENCE, ['evidence-alpha']);
  assert.ok(result.hits.length >= 2);
  assert.equal(result.hits.every((hit) => [IntentSearchRecordKind.EVIDENCE_REFERENCE, IntentSearchRecordKind.VERIFICATION_ITEM].includes(hit.recordKind as never)), true);
});

test('M03S07-17 explanation-intent-can-find-authoritative-reason-code-presentation', () => {
  const result = search(IntentSearchIntent.EXPLANATION, ['missing_evidence']);
  assert.equal(result.hits.some((hit) => hit.recordKind === IntentSearchRecordKind.REQUIREMENT_REASON), true);
});

test('M03S07-18 activity-intent-searches-only-timeline', () => {
  const result = search(IntentSearchIntent.ACTIVITY, ['eligibility_evaluated']);
  assert.equal(result.hits.length, 1);
  assert.equal(result.hits[0]?.sourceKind, IntentSearchSourceKind.ACTIVITY_TIMELINE);
});

test('M03S07-19 next-action-intent-searches-only-guidance', () => {
  const result = search(IntentSearchIntent.NEXT_ACTION, ['upload_evidence']);
  assert.equal(result.hits.length, 1);
  assert.equal(result.hits[0]?.recordKind, IntentSearchRecordKind.NEXT_ACTION);
});

test('M03S07-20 search-never-recalculates-governed-state', () => {
  const result = search(IntentSearchIntent.NEXT_ACTION, ['not_satisfied']);
  assert.equal(result.hits[0]?.recordKind, IntentSearchRecordKind.MISSING_CONDITION);
  assert.equal('eligibilityOutcome' in (result.hits[0] ?? {}), false);
});

test('M03S07-21 exact-match-is-supported', () => {
  const result = search(IntentSearchIntent.CREDENTIAL, ['credential-alpha']);
  assert.equal(result.hits[0]?.matchKinds.includes(IntentSearchMatchKind.EXACT), true);
});

test('M03S07-22 prefix-match-is-supported', () => {
  const result = search(IntentSearchIntent.CREDENTIAL, ['credential-al']);
  assert.equal(result.hits[0]?.matchKinds.includes(IntentSearchMatchKind.PREFIX), true);
});

test('M03S07-23 every-query-term-must-match-the-same-record', () => {
  const result = search(IntentSearchIntent.CREDENTIAL, ['credential-alpha', 'assessment-beta']);
  assert.equal(result.resultCount, 0);
});

test('M03S07-24 case-and-nfkc-normalization-are-deterministic', () => {
  const upper = search(IntentSearchIntent.CREDENTIAL, ['CREDENTIAL-ALPHA']).toJSON();
  const lower = search(IntentSearchIntent.CREDENTIAL, ['credential-alpha']).toJSON();
  assert.deepEqual(upper.hits, lower.hits);
});

test('M03S07-25 exact-match-ranks-above-prefix-match', () => {
  const recordExact = ApprovedSearchRecord.create({ sourceKind: IntentSearchSourceKind.CREDENTIAL_CARD, recordKind: IntentSearchRecordKind.CREDENTIAL_CARD, recordId: 'a', tokens: [IntentSearchToken.create({ field: 'id', value: 'credential', weight: 1 })] });
  const recordPrefix = ApprovedSearchRecord.create({ sourceKind: IntentSearchSourceKind.CREDENTIAL_CARD, recordKind: IntentSearchRecordKind.CREDENTIAL_CARD, recordId: 'b', tokens: [IntentSearchToken.create({ field: 'id', value: 'credential-long', weight: 50 })] });
  const model = Object.create(ApprovedSearchQueryModel.prototype) as Record<string, unknown>;
  Object.assign(model, { subject, sourceKind: IntentSearchSourceKind.CREDENTIAL_CARD, records: Object.freeze([recordPrefix, recordExact]), searchAuthority: false, decisionAuthority: false });
  const result = IntentSearchReadModel.search({ query: query(IntentSearchIntent.CREDENTIAL, ['credential']), models: [Object.freeze(model) as unknown as ApprovedSearchQueryModel] });
  assert.equal(result.hits[0]?.recordId, 'a');
});

test('M03S07-26 ranking-has-stable-lexical-tie-break', () => {
  const result = search(IntentSearchIntent.CREDENTIAL, ['credential']);
  for (let index = 1; index < result.hits.length; index += 1) {
    const previous = result.hits[index - 1]!;
    const current = result.hits[index]!;
    if (previous.score === current.score) {
      assert.ok(`${previous.sourceKind}:${previous.recordKind}:${previous.recordId}` <= `${current.sourceKind}:${current.recordKind}:${current.recordId}`);
    }
  }
  assert.equal(result.ordering, IntentSearchOrdering.SCORE_DESC_THEN_STABLE_ID);
});

test('M03S07-27 result-is-independent-of-input-model-order', () => {
  const input = models();
  const forward = IntentSearchReadModel.search({ query: query(IntentSearchIntent.CREDENTIAL, ['credential']), models: input }).toJSON();
  const reverse = IntentSearchReadModel.search({ query: query(IntentSearchIntent.CREDENTIAL, ['credential']), models: [...input].reverse() }).toJSON();
  assert.deepEqual(forward, reverse);
});

test('M03S07-28 duplicate-approved-record-is-rejected', () => {
  const model = ApprovedSearchQueryModel.fromCredentialCard(card());
  assert.throws(() => IntentSearchReadModel.search({ query: query(IntentSearchIntent.CREDENTIAL, ['credential']), models: [model, model] }), TypeError);
});

test('M03S07-29 limit-and-truncated-state-are-explicit', () => {
  const result = search(IntentSearchIntent.CREDENTIAL, ['credential'], models(), 1);
  assert.equal(result.resultCount, 1);
  assert.equal(result.truncated, true);
});

test('M03S07-30 no-result-state-is-explicit', () => {
  const result = search(IntentSearchIntent.CREDENTIAL, ['does-not-exist']);
  assert.equal(result.resultCount, 0);
  assert.equal(result.noResultReason, IntentSearchNoResultReason.NO_MATCHING_APPROVED_RECORDS);
});

test('M03S07-31 governed-references-are-preserved-in-results', () => {
  const result = search(IntentSearchIntent.NEXT_ACTION, ['upload_evidence']);
  assert.deepEqual(result.hits[0]?.references, ['assessment-alpha', 'decision-alpha']);
});

test('M03S07-32 query-model-result-and-nested-arrays-are-immutable', () => {
  const input = models();
  const q = query(IntentSearchIntent.CREDENTIAL, ['credential']);
  const result = IntentSearchReadModel.search({ query: q, models: input });
  assert.equal(Object.isFrozen(q), true);
  assert.equal(Object.isFrozen(q.terms), true);
  assert.equal(Object.isFrozen(input[0]), true);
  assert.equal(Object.isFrozen(input[0]?.records), true);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.hits), true);
  assert.equal(Object.isFrozen(result.hits[0]), true);
});

test('M03S07-33 serialization-is-deterministic', () => {
  const left = search(IntentSearchIntent.EXPLANATION, ['missing_evidence']).toJSON();
  const right = search(IntentSearchIntent.EXPLANATION, ['missing_evidence']).toJSON();
  assert.deepEqual(left, right);
});

test('M03S07-34 search-ranking-decision-and-authorization-authority-are-zero', () => {
  const result = search(IntentSearchIntent.CREDENTIAL, ['credential']);
  assert.equal(result.searchAuthority, false);
  assert.equal(result.rankingAuthority, false);
  assert.equal(result.decisionAuthority, false);
  assert.equal(result.authorizationAuthority, false);
  assert.equal(result.hits.every((hit) => hit.searchAuthority === false && hit.rankingAuthority === false && hit.decisionAuthority === false), true);
});

test('M03S07-35 architecture-boundary-excludes-provider-ai-fuzzy-and-ambient-state', () => {
  const source = readFileSync('packages/application/src/search/intent-search-read-model.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|@aws-sdk|aws-sdk|elasticsearch|@elastic|algoliasearch|meilisearch)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /embedding|vectorSearch|semanticSimilarity|fuzzySearch|llm|chatCompletion/i);
  assert.match(source, /IntentSearchIntent/);
  assert.match(source, /EXACT/);
  assert.match(source, /PREFIX/);
});

test('M03S07-36 architecture-boundary-excludes-new-domain-authority', () => {
  const source = readFileSync('packages/application/src/search/intent-search-read-model.ts', 'utf8');
  assert.doesNotMatch(source, /\bAuthorizationGrant\b|QualificationPath|CredentialCatalog|aggregateRequirementGroup|EligibilityAssessment\.evaluate/);
  assert.match(source, /searchAuthority = false/);
  assert.match(source, /rankingAuthority = false/);
  assert.match(source, /decisionAuthority = false/);
  assert.match(source, /authorizationAuthority = false/);
});
