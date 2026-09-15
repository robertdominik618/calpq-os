import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ArtifactFormat,
  CredentialArtifact,
  CredentialArtifactId,
  CredentialArtifactKind,
  DateOnly,
  DomainOutcome,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
} from '../../core/src/index.ts';
import {
  CredentialCardDocumentBinding,
  CredentialCardDocumentSourceKind,
  CredentialCardFacetAvailability,
  CredentialCardFacetKind,
  CredentialCardLifecycleSourceKind,
  CredentialCardReadModel,
  CredentialCardUnavailableReason,
  CredentialCardVerificationSourceKind,
  PassportAuthorityClass,
  ProfessionalPassportProjection,
  VerificationRecordState,
} from '../src/index.ts';

const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079201';
const OTHER_SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079202';
const ARTIFACT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079203';
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);
const otherSubject = SubjectReference.create(SubjectId.from(OTHER_SUBJECT_ID), SubjectKind.PERSON);

function item(input: {
  readonly verificationStatus?: string;
  readonly verificationRecordState?: typeof VerificationRecordState[keyof typeof VerificationRecordState] | null;
} = {}): ProfessionalPassportProjection['items'][number] {
  return Object.freeze({
    authorityClass: PassportAuthorityClass.EVIDENCE,
    verificationStatus: input.verificationStatus ?? VerificationStateCode.UNVERIFIED,
    verificationRecordState: input.verificationRecordState ?? null,
  }) as unknown as ProfessionalPassportProjection['items'][number];
}

function passport(input: {
  readonly outcome?: typeof DomainOutcome[keyof typeof DomainOutcome];
  readonly items?: readonly ProfessionalPassportProjection['items'][number][];
  readonly authorizationAuthority?: boolean;
  readonly credentialDefinitionId?: string;
} = {}): ProfessionalPassportProjection {
  const value = Object.create(ProfessionalPassportProjection.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject,
    assessmentId: 'assessment-003',
    credentialDefinitionId: input.credentialDefinitionId ?? 'credential-definition-003',
    credentialDefinitionVersion: 'v4',
    requirementSetId: 'requirement-set-003',
    requirementSetVersion: 'v8',
    eligibilityOutcome: input.outcome ?? DomainOutcome.SATISFIED,
    authoritativeEvaluatedAt: UtcInstant.from('2026-09-15T12:00:00Z'),
    generatedAt: UtcInstant.from('2026-09-15T12:01:00Z'),
    items: Object.freeze([...(input.items ?? [])]),
    authorizationAuthority: input.authorizationAuthority ?? false,
  });
  return Object.freeze(value) as unknown as ProfessionalPassportProjection;
}

function artifact(input: {
  readonly artifactSubject?: SubjectReference | null;
  readonly expiresOn?: string | null;
  readonly verificationState?: string;
} = {}): CredentialArtifact {
  const value = Object.create(CredentialArtifact.prototype) as Record<string, unknown>;
  Object.assign(value, {
    id: CredentialArtifactId.from(ARTIFACT_ID),
    kind: CredentialArtifactKind.CARD,
    format: ArtifactFormat.DOCUMENT,
    subject: input.artifactSubject === undefined ? subject : input.artifactSubject,
    issuer: null,
    issuedOn: DateOnly.from('2025-01-10'),
    effectiveFrom: DateOnly.from('2025-01-10'),
    expiresOn: input.expiresOn === undefined
      ? DateOnly.from('2030-01-10')
      : input.expiresOn === null ? null : DateOnly.from(input.expiresOn),
    verificationState: VerificationState.from(input.verificationState ?? VerificationStateCode.VERIFIED),
    provenanceRefs: Object.freeze([]),
  });
  return Object.freeze(value) as unknown as CredentialArtifact;
}

function binding(input: {
  readonly credentialDefinitionId?: string;
  readonly artifactValue?: CredentialArtifact;
  readonly bindingReference?: string;
} = {}): CredentialCardDocumentBinding {
  return CredentialCardDocumentBinding.create({
    credentialDefinitionId: input.credentialDefinitionId ?? 'credential-definition-003',
    artifact: input.artifactValue ?? artifact(),
    bindingReference: input.bindingReference ?? 'read-binding:artifact-003',
  });
}

test('M03S03-01 passport-input-required', () => {
  assert.throws(() => CredentialCardReadModel.compose({ passport: {} as ProfessionalPassportProjection }), TypeError);
});

test('M03S03-02 non-authoritative-source-required', () => {
  assert.throws(() => CredentialCardReadModel.compose({ passport: passport({ authorizationAuthority: true }) }), TypeError);
});

test('M03S03-03 root-subject-and-identifiers-preserved', () => {
  const card = CredentialCardReadModel.compose({ passport: passport() });
  assert.strictEqual(card.subject, subject);
  assert.equal(card.assessmentId, 'assessment-003');
  assert.equal(card.credentialDefinitionId, 'credential-definition-003');
  assert.equal(card.credentialDefinitionVersion, 'v4');
  assert.equal(card.requirementSetId, 'requirement-set-003');
  assert.equal(card.requirementSetVersion, 'v8');
  assert.equal(card.projectionGeneratedAt.toString(), '2026-09-15T12:01:00.000Z');
});

test('M03S03-04 no-document-binding-means-source-unavailable-not-missing', () => {
  const document = CredentialCardReadModel.compose({ passport: passport() }).document;
  assert.equal(document.availability, CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE);
  assert.equal(document.sourceKind, CredentialCardDocumentSourceKind.NONE);
  assert.equal(document.reasonCode, CredentialCardUnavailableReason.DOCUMENT_SOURCE_NOT_AVAILABLE);
  assert.equal('missing' in document, false);
});

test('M03S03-05 document-binding-type-required', () => {
  assert.throws(() => CredentialCardReadModel.compose({
    passport: passport(),
    documentBinding: {} as CredentialCardDocumentBinding,
  }), TypeError);
});

test('M03S03-06 document-binding-credential-id-must-match-card', () => {
  assert.throws(() => CredentialCardReadModel.compose({
    passport: passport(),
    documentBinding: binding({ credentialDefinitionId: 'credential-definition-other' }),
  }), TypeError);
});

test('M03S03-07 document-artifact-requires-explicit-subject', () => {
  assert.throws(() => CredentialCardReadModel.compose({
    passport: passport(),
    documentBinding: binding({ artifactValue: artifact({ artifactSubject: null }) }),
  }), TypeError);
});

test('M03S03-08 document-artifact-subject-must-match-card', () => {
  assert.throws(() => CredentialCardReadModel.compose({
    passport: passport(),
    documentBinding: binding({ artifactValue: artifact({ artifactSubject: otherSubject }) }),
  }), TypeError);
});

test('M03S03-09 document-metadata-preserved-without-validity-inference', () => {
  const document = CredentialCardReadModel.compose({
    passport: passport(),
    documentBinding: binding(),
  }).document;
  assert.equal(document.availability, CredentialCardFacetAvailability.AVAILABLE);
  assert.equal(document.sourceKind, CredentialCardDocumentSourceKind.CREDENTIAL_ARTIFACT);
  assert.equal(document.artifactId, ARTIFACT_ID);
  assert.equal(document.artifactKind, CredentialArtifactKind.CARD);
  assert.equal(document.artifactFormat, ArtifactFormat.DOCUMENT);
  assert.equal(document.issuedOn, '2025-01-10');
  assert.equal(document.effectiveFrom, '2025-01-10');
  assert.equal(document.expiresOn, '2030-01-10');
  assert.equal(document.bindingReference, 'read-binding:artifact-003');
});

test('M03S03-10 document-facet-does-not-collapse-artifact-verification-state', () => {
  const document = CredentialCardReadModel.compose({
    passport: passport(),
    documentBinding: binding({ artifactValue: artifact({ verificationState: VerificationStateCode.FAILED }) }),
  }).document;
  assert.equal('verificationState' in document, false);
  assert.equal('verified' in document, false);
});

test('M03S03-11 verification-evidence-state-counts-preserve-all-governed-states', () => {
  const states = Object.values(VerificationStateCode);
  const verification = CredentialCardReadModel.compose({
    passport: passport({ items: states.map((verificationStatus) => item({ verificationStatus })) }),
  }).verification;
  assert.equal(verification.sourceKind, CredentialCardVerificationSourceKind.PROFESSIONAL_PASSPORT_PROJECTION);
  for (const state of states) assert.equal(verification.evidenceStateCounts[state], 1);
  assert.equal(verification.evidenceCount, states.length);
});

test('M03S03-12 verification-record-state-counts-preserve-all-governed-states', () => {
  const states = Object.values(VerificationRecordState);
  const verification = CredentialCardReadModel.compose({
    passport: passport({ items: states.map((verificationRecordState) => item({
      verificationStatus: VerificationStateCode.VERIFIED,
      verificationRecordState,
    })) }),
  }).verification;
  for (const state of states) assert.equal(verification.recordStateCounts[state], 1);
  assert.equal(verification.linkedRecordCount, states.length);
  assert.equal(verification.unlinkedRecordCount, 0);
});

test('M03S03-13 verification-unlinked-records-remain-explicit', () => {
  const verification = CredentialCardReadModel.compose({
    passport: passport({ items: [
      item(),
      item(),
      item({ verificationRecordState: VerificationRecordState.VERIFIED, verificationStatus: VerificationStateCode.VERIFIED }),
    ] }),
  }).verification;
  assert.equal(verification.unlinkedRecordCount, 2);
  assert.equal(verification.linkedRecordCount, 1);
});

test('M03S03-14 verification-facet-has-no-single-collapsed-status', () => {
  const verification = CredentialCardReadModel.compose({ passport: passport() }).verification;
  assert.equal('state' in verification, false);
  assert.equal('status' in verification, false);
  assert.equal('valid' in verification, false);
  assert.equal('isValid' in verification, false);
});

test('M03S03-15 eligibility-four-outcome-passthrough', () => {
  for (const outcome of Object.values(DomainOutcome)) {
    assert.equal(CredentialCardReadModel.compose({ passport: passport({ outcome }) }).eligibility.outcome, outcome);
  }
});

test('M03S03-16 eligibility-authoritative-identifiers-and-evaluation-preserved', () => {
  const eligibility = CredentialCardReadModel.compose({ passport: passport() }).eligibility;
  assert.equal(eligibility.assessmentId, 'assessment-003');
  assert.equal(eligibility.credentialDefinitionId, 'credential-definition-003');
  assert.equal(eligibility.credentialDefinitionVersion, 'v4');
  assert.equal(eligibility.requirementSetId, 'requirement-set-003');
  assert.equal(eligibility.requirementSetVersion, 'v8');
  assert.equal(eligibility.evaluatedAt.toString(), '2026-09-15T12:00:00.000Z');
});

test('M03S03-17 lifecycle-is-separate-and-explicitly-source-unavailable', () => {
  const lifecycle = CredentialCardReadModel.compose({ passport: passport() }).lifecycle;
  assert.equal(lifecycle.facetKind, CredentialCardFacetKind.LIFECYCLE);
  assert.equal(lifecycle.availability, CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE);
  assert.equal(lifecycle.sourceKind, CredentialCardLifecycleSourceKind.NONE);
  assert.equal(lifecycle.reasonCode, CredentialCardUnavailableReason.LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03);
  assert.equal(lifecycle.state, null);
  assert.equal(lifecycle.evaluatedAt, null);
});

test('M03S03-18 document-expiry-does-not-infer-lifecycle-state', () => {
  const card = CredentialCardReadModel.compose({
    passport: passport(),
    documentBinding: binding({ artifactValue: artifact({ expiresOn: '2020-01-10' }) }),
  });
  assert.equal(card.document.expiresOn, '2020-01-10');
  assert.equal(card.lifecycle.state, null);
  assert.equal(card.lifecycle.availability, CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE);
});

test('M03S03-19 four-facets-remain-distinct-and-stably-ordered', () => {
  const card = CredentialCardReadModel.compose({ passport: passport() });
  assert.deepEqual(card.facetOrder, [
    CredentialCardFacetKind.DOCUMENT,
    CredentialCardFacetKind.VERIFICATION,
    CredentialCardFacetKind.ELIGIBILITY,
    CredentialCardFacetKind.LIFECYCLE,
  ]);
  assert.equal(card.document.facetKind, CredentialCardFacetKind.DOCUMENT);
  assert.equal(card.verification.facetKind, CredentialCardFacetKind.VERIFICATION);
  assert.equal(card.eligibility.facetKind, CredentialCardFacetKind.ELIGIBILITY);
  assert.equal(card.lifecycle.facetKind, CredentialCardFacetKind.LIFECYCLE);
});

test('M03S03-20 facet-availability-is-independent', () => {
  const card = CredentialCardReadModel.compose({ passport: passport() });
  assert.equal(card.document.availability, CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE);
  assert.equal(card.verification.availability, CredentialCardFacetAvailability.AVAILABLE);
  assert.equal(card.eligibility.availability, CredentialCardFacetAvailability.AVAILABLE);
  assert.equal(card.lifecycle.availability, CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE);
});

test('M03S03-21 card-and-nested-state-are-immutable', () => {
  const card = CredentialCardReadModel.compose({
    passport: passport({ items: [item()] }),
    documentBinding: binding(),
  });
  assert.equal(Object.isFrozen(card), true);
  assert.equal(Object.isFrozen(card.facetOrder), true);
  assert.equal(Object.isFrozen(card.document), true);
  assert.equal(Object.isFrozen(card.verification), true);
  assert.equal(Object.isFrozen(card.verification.evidenceStateCounts), true);
  assert.equal(Object.isFrozen(card.verification.recordStateCounts), true);
  assert.equal(Object.isFrozen(card.eligibility), true);
  assert.equal(Object.isFrozen(card.lifecycle), true);
});

test('M03S03-22 deterministic-serialization', () => {
  const source = passport({ items: [item({
    verificationStatus: VerificationStateCode.VERIFIED,
    verificationRecordState: VerificationRecordState.VERIFIED,
  })] });
  const documentBinding = binding();
  assert.deepEqual(
    CredentialCardReadModel.compose({ passport: source, documentBinding }).toJSON(),
    CredentialCardReadModel.compose({ passport: source, documentBinding }).toJSON(),
  );
});

test('M03S03-23 non-authoritative-no-generic-combined-credential-state', () => {
  const card = CredentialCardReadModel.compose({ passport: passport() });
  assert.equal(card.authorizationAuthority, false);
  for (const key of ['valid', 'isValid', 'current', 'latest', 'active', 'expired', 'authorizationGrant']) {
    assert.equal(key in card, false);
  }
  assert.equal(card.document.decisionAuthority, false);
  assert.equal(card.verification.decisionAuthority, false);
  assert.equal(card.eligibility.decisionAuthority, false);
  assert.equal(card.lifecycle.decisionAuthority, false);
});

test('M03S03-24 architecture-boundary', () => {
  const source = readFileSync('packages/application/src/credential-card/credential-card-read-model.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|fastify|@?prisma|typeorm|openai|@anthropic-ai|@aws-sdk|aws-sdk)/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /\bAuthorizationGrant\b/);
  assert.match(source, /ProfessionalPassportProjection/);
  assert.match(source, /CredentialArtifact/);
  assert.match(source, /LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03/);
});
