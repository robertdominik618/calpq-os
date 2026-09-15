import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  DomainOutcome,
  EligibilityAssessment,
  EvidenceReference,
  SourceReference,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
} from '../../core/src/index.ts';
import {
  CredentialCardFacetAvailability,
  CredentialCardFacetKind,
  CredentialCardReadModel,
  CredentialCardUnavailableReason,
  CredentialExplanationAffordance,
  CredentialExplanationAvailability,
  CredentialExplanationReadModel,
  CredentialExplanationReason,
  ProfessionalPassportProjection,
} from '../src/index.ts';

const subject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079401'),
  SubjectKind.PERSON,
);
const otherSubject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079402'),
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

function sourceReference(): SourceReference {
  const value = Object.create(SourceReference.prototype) as Record<string, unknown>;
  Object.assign(value, {
    id: textValue('source-law-001'),
    authority: actor('authority-001'),
    jurisdiction: Object.freeze({
      toJSON: () => Object.freeze({ code: 'CZ' as const, scope: 'STATE' as const }),
    }),
    sourceType: 'LAW',
    canonicalLocator: 'https://authority.example/source-law-001',
    version: textValue('source-v3'),
    publicationDate: textValue('2026-01-01'),
    effectiveFrom: textValue('2026-02-01'),
    effectiveTo: null,
    retrievedAt: UtcInstant.from('2026-09-15T12:00:00Z'),
    verificationState: textValue('VERIFIED'),
    contentHash: textValue('sha256:source'),
  });
  return Object.freeze(value) as unknown as SourceReference;
}

function evidenceReference(source: SourceReference = sourceReference()): EvidenceReference {
  const value = Object.create(EvidenceReference.prototype) as Record<string, unknown>;
  Object.assign(value, {
    id: textValue('evidence-001'),
    kind: 'DOCUMENT',
    evidenceClass: 'ORIGINAL',
    contentReference: 'blob:evidence-001',
    mediaType: 'application/pdf',
    contentHash: textValue('sha256:evidence'),
    acquiredAt: UtcInstant.from('2026-09-15T11:30:00Z'),
    acquiredBy: actor('acquirer-001'),
    source,
    derivationParent: null,
    verificationState: textValue('VERIFIED'),
  });
  return Object.freeze(value) as unknown as EvidenceReference;
}

function passport(input: {
  readonly subjectValue?: SubjectReference;
  readonly authorizationAuthority?: boolean;
  readonly assessmentId?: string;
  readonly credentialDefinitionId?: string;
  readonly credentialDefinitionVersion?: string;
  readonly requirementSetId?: string;
  readonly requirementSetVersion?: string;
  readonly evaluatedAt?: string;
  readonly provenanceIdentity?: string;
  readonly evidenceId?: string;
  readonly includeItem?: boolean;
} = {}): ProfessionalPassportProjection {
  const value = Object.create(ProfessionalPassportProjection.prototype) as Record<string, unknown>;
  const items = input.includeItem === false ? [] : [Object.freeze({
    evidenceId: textValue(input.evidenceId ?? 'evidence-001'),
    provenanceIdentity: textValue(input.provenanceIdentity ?? 'decision-001'),
    origin: 'ORIGINAL_EVIDENCE',
    authorityClass: 'VERIFIED_EVIDENCE',
    verificationStatus: 'VERIFIED',
    derivationMethod: null,
    verifier: actor('verifier-001'),
    reviewer: actor('reviewer-001'),
    verifiedAt: UtcInstant.from('2026-09-15T11:45:00Z'),
    verificationRecordState: 'VERIFIED',
    verificationMethod: 'REGISTRY_LOOKUP',
    sourceVersion: 'source-v3',
    verificationSourceVersion: 'verify-v2',
    sourceHash: 'sha256:evidence',
    contentReference: 'blob:evidence-001',
  })];
  Object.assign(value, {
    subject: input.subjectValue ?? subject,
    assessmentId: input.assessmentId ?? 'assessment-004',
    credentialDefinitionId: input.credentialDefinitionId ?? 'credential-definition-004',
    credentialDefinitionVersion: input.credentialDefinitionVersion ?? 'v5',
    requirementSetId: input.requirementSetId ?? 'requirement-set-004',
    requirementSetVersion: input.requirementSetVersion ?? 'v9',
    eligibilityOutcome: DomainOutcome.SATISFIED,
    authoritativeEvaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-15T12:00:00Z'),
    generatedAt: UtcInstant.from('2026-09-15T12:01:00Z'),
    items: Object.freeze(items),
    authorizationAuthority: input.authorizationAuthority ?? false,
  });
  return Object.freeze(value) as unknown as ProfessionalPassportProjection;
}

function assessment(input: {
  readonly subjectValue?: SubjectReference;
  readonly assessmentId?: string;
  readonly credentialDefinitionId?: string;
  readonly credentialDefinitionVersion?: string;
  readonly requirementSetId?: string;
  readonly requirementSetVersion?: string;
  readonly evaluatedAt?: string;
  readonly outcome?: typeof DomainOutcome[keyof typeof DomainOutcome];
  readonly provenanceIdentity?: string;
  readonly sources?: readonly SourceReference[];
  readonly evidence?: readonly EvidenceReference[];
  readonly reasonCodes?: readonly string[];
} = {}): EligibilityAssessment {
  const source = sourceReference();
  const evidence = evidenceReference(source);
  const value = Object.create(EligibilityAssessment.prototype) as Record<string, unknown>;
  Object.assign(value, {
    id: textValue(input.assessmentId ?? 'assessment-004'),
    subject: input.subjectValue ?? subject,
    credentialDefinition: Object.freeze({
      id: textValue(input.credentialDefinitionId ?? 'credential-definition-004'),
      version: textValue(input.credentialDefinitionVersion ?? 'v5'),
    }),
    requirementSetId: textValue(input.requirementSetId ?? 'requirement-set-004'),
    requirementSetVersion: textValue(input.requirementSetVersion ?? 'v9'),
    evaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-15T12:00:00Z'),
    atomicResults: Object.freeze([
      Object.freeze({
        requirementId: textValue('REQ-A'),
        outcome: DomainOutcome.SATISFIED,
        reasonCodes: Object.freeze([...(input.reasonCodes ?? ['REQ_A_EVIDENCE_SATISFIED'])]),
      }),
      Object.freeze({
        requirementId: textValue('REQ-B'),
        outcome: DomainOutcome.REVIEW_REQUIRED,
        reasonCodes: Object.freeze(['REQ_B_MANUAL_REVIEW_REQUIRED']),
      }),
    ]),
    groupResults: Object.freeze([]),
    outcome: input.outcome ?? DomainOutcome.SATISFIED,
    evaluator: actor('evaluator-001'),
    provenance: Object.freeze({
      identity: textValue(input.provenanceIdentity ?? 'decision-001'),
      ruleSetId: textValue('ruleset-004'),
      ruleVersion: textValue('v9'),
      sources: Object.freeze([...(input.sources ?? [source])]),
      evidence: Object.freeze([...(input.evidence ?? [evidence])]),
    }),
  });
  return Object.freeze(value) as unknown as EligibilityAssessment;
}

function card(input: {
  readonly subjectValue?: SubjectReference;
  readonly authorizationAuthority?: boolean;
  readonly assessmentId?: string;
  readonly credentialDefinitionId?: string;
  readonly credentialDefinitionVersion?: string;
  readonly requirementSetId?: string;
  readonly requirementSetVersion?: string;
  readonly evaluatedAt?: string;
  readonly outcome?: typeof DomainOutcome[keyof typeof DomainOutcome];
  readonly documentAvailable?: boolean;
} = {}): CredentialCardReadModel {
  const value = Object.create(CredentialCardReadModel.prototype) as Record<string, unknown>;
  const documentAvailable = input.documentAvailable ?? false;
  Object.assign(value, {
    subject: input.subjectValue ?? subject,
    assessmentId: input.assessmentId ?? 'assessment-004',
    credentialDefinitionId: input.credentialDefinitionId ?? 'credential-definition-004',
    credentialDefinitionVersion: input.credentialDefinitionVersion ?? 'v5',
    requirementSetId: input.requirementSetId ?? 'requirement-set-004',
    requirementSetVersion: input.requirementSetVersion ?? 'v9',
    projectionGeneratedAt: UtcInstant.from('2026-09-15T12:01:00Z'),
    document: Object.freeze({
      availability: documentAvailable
        ? CredentialCardFacetAvailability.AVAILABLE
        : CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE,
      reasonCode: documentAvailable ? null : CredentialCardUnavailableReason.DOCUMENT_SOURCE_NOT_AVAILABLE,
      artifactId: documentAvailable ? 'artifact-004' : null,
      bindingReference: documentAvailable ? 'read-binding:artifact-004' : null,
    }),
    verification: Object.freeze({}),
    eligibility: Object.freeze({
      outcome: input.outcome ?? DomainOutcome.SATISFIED,
      evaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-15T12:00:00Z'),
    }),
    lifecycle: Object.freeze({
      reasonCode: CredentialCardUnavailableReason.LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03,
    }),
    authorizationAuthority: input.authorizationAuthority ?? false,
  });
  return Object.freeze(value) as unknown as CredentialCardReadModel;
}

function compose(input: {
  readonly cardValue?: CredentialCardReadModel;
  readonly passportValue?: ProfessionalPassportProjection;
  readonly assessmentValue?: EligibilityAssessment;
} = {}) {
  return CredentialExplanationReadModel.compose({
    card: input.cardValue ?? card(),
    passport: input.passportValue ?? passport(),
    assessment: input.assessmentValue ?? assessment(),
  });
}

test('M03S04-01 credential-card-input-required', () => {
  assert.throws(() => CredentialExplanationReadModel.compose({ card: {} as CredentialCardReadModel, passport: passport(), assessment: assessment() }), TypeError);
});

test('M03S04-02 passport-input-required', () => {
  assert.throws(() => CredentialExplanationReadModel.compose({ card: card(), passport: {} as ProfessionalPassportProjection, assessment: assessment() }), TypeError);
});

test('M03S04-03 authoritative-assessment-input-required', () => {
  assert.throws(() => CredentialExplanationReadModel.compose({ card: card(), passport: passport(), assessment: {} as EligibilityAssessment }), TypeError);
});

test('M03S04-04 card-must-remain-non-authoritative', () => {
  assert.throws(() => compose({ cardValue: card({ authorizationAuthority: true }) }), TypeError);
});

test('M03S04-05 passport-must-remain-non-authoritative', () => {
  assert.throws(() => compose({ passportValue: passport({ authorizationAuthority: true }) }), TypeError);
});

test('M03S04-06 subject-binding-must-match', () => {
  assert.throws(() => compose({ passportValue: passport({ subjectValue: otherSubject }) }), TypeError);
});

test('M03S04-07 assessment-identity-must-match', () => {
  assert.throws(() => compose({ assessmentValue: assessment({ assessmentId: 'assessment-other' }) }), TypeError);
});

test('M03S04-08 credential-definition-binding-must-match', () => {
  assert.throws(() => compose({ assessmentValue: assessment({ credentialDefinitionVersion: 'v-other' }) }), TypeError);
});

test('M03S04-09 requirement-set-binding-must-match', () => {
  assert.throws(() => compose({ assessmentValue: assessment({ requirementSetId: 'requirement-set-other' }) }), TypeError);
});

test('M03S04-10 eligibility-outcome-must-be-passthrough', () => {
  assert.throws(() => compose({ assessmentValue: assessment({ outcome: DomainOutcome.REVIEW_REQUIRED }) }), TypeError);
});

test('M03S04-11 evaluation-instant-must-match', () => {
  assert.throws(() => compose({ assessmentValue: assessment({ evaluatedAt: '2026-09-15T12:02:00Z' }) }), TypeError);
});

test('M03S04-12 passport-item-provenance-must-match-assessment', () => {
  assert.throws(() => compose({ passportValue: passport({ provenanceIdentity: 'decision-other' }) }), TypeError);
});

test('M03S04-13 explicit-why-affordance-exists-for-all-four-facets', () => {
  const explanation = compose();
  assert.deepEqual(explanation.facetOrder, [CredentialCardFacetKind.DOCUMENT, CredentialCardFacetKind.VERIFICATION, CredentialCardFacetKind.ELIGIBILITY, CredentialCardFacetKind.LIFECYCLE]);
  for (const facet of [explanation.document, explanation.verification, explanation.eligibility, explanation.lifecycle]) {
    assert.equal(facet.explanationAvailability, CredentialExplanationAvailability.AVAILABLE);
    assert.equal(facet.affordance, CredentialExplanationAffordance.WHY);
  }
});

test('M03S04-14 unavailable-document-source-is-explained-not-inferred-missing', () => {
  const document = compose().document;
  assert.equal(document.reasonCode, CredentialCardUnavailableReason.DOCUMENT_SOURCE_NOT_AVAILABLE);
  assert.equal(document.sourceDetailAvailability, CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE);
  assert.deepEqual(document.supportingReferences, []);
  assert.equal('missing' in document, false);
});

test('M03S04-15 explicit-document-binding-reference-is-preserved-without-provenance-invention', () => {
  const document = compose({ cardValue: card({ documentAvailable: true }) }).document;
  assert.equal(document.reasonCode, CredentialExplanationReason.DOCUMENT_PRESENTED_FROM_EXPLICIT_BINDING);
  assert.deepEqual(document.supportingReferences, ['artifact-004', 'read-binding:artifact-004']);
  assert.equal(document.sourceDetailAvailability, CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE);
  assert.deepEqual(document.sources, []);
});

test('M03S04-16 verification-item-state-and-attribution-are-preserved', () => {
  const item = compose().verification.verificationItems[0]!;
  assert.equal(item.evidenceId, 'evidence-001');
  assert.equal(item.provenanceIdentity, 'decision-001');
  assert.equal(item.verificationStatus, 'VERIFIED');
  assert.equal(item.verificationRecordState, 'VERIFIED');
  assert.equal(item.verificationMethod, 'REGISTRY_LOOKUP');
  assert.equal(item.verifiedAt, '2026-09-15T11:45:00.000Z');
  assert.deepEqual(item.verifier, { referenceType: 'ACTOR', id: 'verifier-001', kind: 'SYSTEM_PROCESS' });
  assert.deepEqual(item.reviewer, { referenceType: 'ACTOR', id: 'reviewer-001', kind: 'SYSTEM_PROCESS' });
});

test('M03S04-17 governed-evidence-is-joined-only-by-evidence-id', () => {
  const item = compose().verification.verificationItems[0]!;
  assert.equal(item.evidenceReferenceAvailability, CredentialExplanationAvailability.AVAILABLE);
  assert.equal(item.evidenceReferenceReasonCode, null);
  assert.equal(item.governedEvidence?.evidenceId, 'evidence-001');
  assert.equal(item.governedEvidence?.contentReference, 'blob:evidence-001');
});

test('M03S04-18 absent-governed-evidence-remains-explicitly-unavailable', () => {
  const item = compose({ assessmentValue: assessment({ evidence: [] }) }).verification.verificationItems[0]!;
  assert.equal(item.evidenceReferenceAvailability, CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE);
  assert.equal(item.evidenceReferenceReasonCode, CredentialExplanationReason.GOVERNED_EVIDENCE_REFERENCE_NOT_AVAILABLE);
  assert.equal(item.governedEvidence, null);
});

test('M03S04-19 eligibility-reason-codes-are-preserved-verbatim', () => {
  const reasons = compose({ assessmentValue: assessment({ reasonCodes: ['RULE_SOURCE_MATCHED', 'EVIDENCE_LINKED'] }) }).eligibility.requirementReasons;
  assert.deepEqual(reasons[0]?.reasonCodes, ['RULE_SOURCE_MATCHED', 'EVIDENCE_LINKED']);
  assert.equal(reasons[0]?.requirementId, 'REQ-A');
  assert.equal(reasons[1]?.reasonCodes[0], 'REQ_B_MANUAL_REVIEW_REQUIRED');
});

test('M03S04-20 source-reference-details-are-exposed-without-upgrade', () => {
  const source = compose().eligibility.sources[0]!;
  assert.equal(source.sourceId, 'source-law-001');
  assert.equal(source.sourceType, 'LAW');
  assert.equal(source.version, 'source-v3');
  assert.equal(source.canonicalLocator, 'https://authority.example/source-law-001');
  assert.equal(source.verificationState, 'VERIFIED');
  assert.deepEqual(source.jurisdiction, { code: 'CZ', scope: 'STATE' });
  assert.equal(source.decisionAuthority, false);
});

test('M03S04-21 evidence-reference-details-are-exposed-without-upgrade', () => {
  const evidence = compose().eligibility.evidence[0]!;
  assert.equal(evidence.evidenceId, 'evidence-001');
  assert.equal(evidence.kind, 'DOCUMENT');
  assert.equal(evidence.evidenceClass, 'ORIGINAL');
  assert.equal(evidence.sourceId, 'source-law-001');
  assert.equal(evidence.verificationState, 'VERIFIED');
  assert.equal(evidence.decisionAuthority, false);
});

test('M03S04-22 provenance-rule-and-evaluator-identities-are-preserved', () => {
  const explanation = compose();
  assert.equal(explanation.provenanceIdentity, 'decision-001');
  assert.equal(explanation.ruleSetId, 'ruleset-004');
  assert.equal(explanation.ruleVersion, 'v9');
  assert.deepEqual(explanation.evaluator, { referenceType: 'ACTOR', id: 'evaluator-001', kind: 'SYSTEM_PROCESS' });
});

test('M03S04-23 lifecycle-unavailability-is-explained-without-date-inference', () => {
  const lifecycle = compose().lifecycle;
  assert.equal(lifecycle.reasonCode, CredentialCardUnavailableReason.LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03);
  assert.equal(lifecycle.sourceDetailAvailability, CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE);
  assert.deepEqual(lifecycle.sources, []);
  assert.deepEqual(lifecycle.evidence, []);
});

test('M03S04-24 read-model-and-nested-explanation-state-are-immutable', () => {
  const explanation = compose();
  assert.equal(Object.isFrozen(explanation), true);
  assert.equal(Object.isFrozen(explanation.facetOrder), true);
  assert.equal(Object.isFrozen(explanation.document), true);
  assert.equal(Object.isFrozen(explanation.verification.sources), true);
  assert.equal(Object.isFrozen(explanation.verification.evidence), true);
  assert.equal(Object.isFrozen(explanation.verification.verificationItems), true);
  assert.equal(Object.isFrozen(explanation.eligibility.requirementReasons), true);
  assert.equal(Object.isFrozen(explanation.eligibility.requirementReasons[0]?.reasonCodes), true);
});

test('M03S04-25 deterministic-serialization-and-zero-decision-authority', () => {
  const left = compose();
  const right = compose();
  assert.deepEqual(left.toJSON(), right.toJSON());
  assert.equal(left.authorizationAuthority, false);
  assert.equal(left.decisionAuthority, false);
  for (const facet of [left.document, left.verification, left.eligibility, left.lifecycle]) {
    assert.equal(facet.decisionAuthority, false);
  }
});

test('M03S04-26 architecture-boundary', () => {
  const source = readFileSync('packages/application/src/explanation/credential-explanation-read-model.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|@aws-sdk|aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /\bAuthorizationGrant\b/);
  assert.doesNotMatch(source, /\b(isValid|latest|current|active|expired)\b/);
  assert.match(source, /EligibilityAssessment/);
  assert.match(source, /provenance/);
  assert.match(source, /SourceReference/);
  assert.match(source, /EvidenceReference/);
  assert.match(source, /CredentialExplanationAffordance/);
});
