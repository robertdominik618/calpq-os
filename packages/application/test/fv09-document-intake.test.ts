import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import {
  ActorId,
  ActorKind,
  ActorReference,
  ContentHash,
  EvidenceClass,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
} from '../../core/src/index.ts';
import {
  DocumentIntakeId,
  DocumentIntakeRecord,
  IntakeCorrectionRecord,
  IntakeMediaMetadata,
  IntakeProcessingState,
  IntakeSecurityClassification,
  IntakeSourceChannel,
  OrganizationScopeReference,
} from '../src/index.ts';

const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c076001';
const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c076002';
const ORIGINAL_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c076003';
const DERIVED_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c076004';
const INTAKE_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c076005';
const HASH = 'a'.repeat(64);

const actor = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);

function original(verificationState = VerificationStateCode.UNVERIFIED): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(ORIGINAL_ID),
    kind: EvidenceKind.DOCUMENT,
    contentReference: 'object://immutable/original-1',
    mediaType: 'application/pdf',
    contentHash: ContentHash.sha256(HASH),
    acquiredAt: UtcInstant.from('2026-09-15T07:00:00Z'),
    acquiredBy: actor,
    verificationState: VerificationState.from(verificationState),
  });
}

function intake(channel: typeof IntakeSourceChannel[keyof typeof IntakeSourceChannel] = IntakeSourceChannel.FILE_UPLOAD): DocumentIntakeRecord {
  return DocumentIntakeRecord.create({
    id: DocumentIntakeId.from(INTAKE_ID),
    sourceChannel: channel,
    receivedAt: UtcInstant.from('2026-09-15T07:01:00Z'),
    receivedBy: actor,
    subject,
    organization: OrganizationScopeReference.from('org:tenant-owner'),
    originalArtifact: original(),
    media: IntakeMediaMetadata.create({
      mediaType: 'application/pdf',
      byteLength: 2048,
      originalFileName: 'credential.pdf',
    }),
    securityClassification: IntakeSecurityClassification.CONFIDENTIAL,
    processingState: IntakeProcessingState.RECEIVED,
  });
}

function correctionEvidence(): EvidenceReference {
  return EvidenceReference.derived({
    id: EvidenceId.from(DERIVED_ID),
    kind: EvidenceKind.NORMALIZED_FIELDS,
    contentReference: 'object://derived/correction-1',
    mediaType: 'application/json',
    contentHash: ContentHash.sha256('b'.repeat(64)),
    acquiredAt: UtcInstant.from('2026-09-15T07:05:00Z'),
    acquiredBy: actor,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
    derivationParent: EvidenceId.from(ORIGINAL_ID),
  });
}

test('FV09-01 intake-id', () => {
  const id = DocumentIntakeId.from(INTAKE_ID.toUpperCase());
  assert.equal(id.toString(), INTAKE_ID);
  assert.throws(() => DocumentIntakeId.from('42'), TypeError);
});

test('FV09-02 source-channel', () => {
  assert.equal(intake(IntakeSourceChannel.EMAIL_ATTACHMENT).sourceChannel, 'EMAIL_ATTACHMENT');
  assert.throws(() => DocumentIntakeRecord.create({
    id: DocumentIntakeId.from(INTAKE_ID),
    sourceChannel: 'TRUSTED_REGISTRY' as typeof IntakeSourceChannel[keyof typeof IntakeSourceChannel],
    receivedAt: UtcInstant.from('2026-09-15T07:01:00Z'),
    receivedBy: actor,
    originalArtifact: original(),
    media: IntakeMediaMetadata.create({ mediaType: 'application/pdf', byteLength: 1 }),
    securityClassification: IntakeSecurityClassification.INTERNAL,
    processingState: IntakeProcessingState.RECEIVED,
  }), TypeError);
});

test('FV09-03 received-at', () => {
  assert.equal(intake().receivedAt.toString(), '2026-09-15T07:01:00.000Z');
});

test('FV09-04 subject-context', () => {
  assert.strictEqual(intake().subject, subject);
});

test('FV09-05 organization-context', () => {
  assert.equal(intake().organization?.toString(), 'org:tenant-owner');
});

test('FV09-06 original-artifact-reference', () => {
  const record = intake();
  assert.equal(record.originalArtifact.evidenceClass, EvidenceClass.ORIGINAL);
  assert.equal(record.originalArtifact.id.toString(), ORIGINAL_ID);
});

test('FV09-07 media-metadata', () => {
  const media = intake().media;
  assert.equal(media.mediaType, 'application/pdf');
  assert.equal(media.byteLength, 2048);
  assert.equal(media.originalFileName, 'credential.pdf');
  assert.equal(Object.isFrozen(media), true);
});

test('FV09-08 content-hash', () => {
  assert.deepEqual(intake().originalArtifact.contentHash?.toJSON(), { algorithm: 'SHA-256', digest: HASH });
  assert.throws(() => DocumentIntakeRecord.create({
    id: DocumentIntakeId.from(INTAKE_ID),
    sourceChannel: IntakeSourceChannel.SCAN,
    receivedAt: UtcInstant.from('2026-09-15T07:01:00Z'),
    receivedBy: actor,
    originalArtifact: EvidenceReference.original({
      id: EvidenceId.from(ORIGINAL_ID),
      kind: EvidenceKind.DOCUMENT,
      contentReference: 'object://missing-hash',
      mediaType: 'application/pdf',
      acquiredAt: UtcInstant.from('2026-09-15T07:00:00Z'),
      acquiredBy: actor,
      verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
    }),
    media: IntakeMediaMetadata.create({ mediaType: 'application/pdf', byteLength: 1 }),
    securityClassification: IntakeSecurityClassification.INTERNAL,
    processingState: IntakeProcessingState.RECEIVED,
  }), /content hash/i);
});

test('FV09-09 provenance', () => {
  const record = intake();
  assert.strictEqual(record.receivedBy, actor);
  assert.strictEqual(record.originalArtifact.acquiredBy, actor);
  assert.equal(record.originalArtifact.acquiredAt.toString(), '2026-09-15T07:00:00.000Z');
});

test('FV09-10 security-classification', () => {
  assert.equal(intake().securityClassification, IntakeSecurityClassification.CONFIDENTIAL);
});

test('FV09-11 processing-state', () => {
  const received = intake();
  const review = received.withProcessingState(IntakeProcessingState.REVIEW_REQUIRED);
  assert.equal(received.processingState, IntakeProcessingState.RECEIVED);
  assert.equal(review.processingState, IntakeProcessingState.REVIEW_REQUIRED);
  assert.notStrictEqual(received, review);
});

test('FV09-12 original-immutable', () => {
  const record = intake();
  assert.equal(Object.isFrozen(record), true);
  assert.equal(Object.isFrozen(record.originalArtifact), true);
  assert.equal(record.originalArtifact.contentReference, 'object://immutable/original-1');
});

test('FV09-13 derived-separate', () => {
  const record = intake();
  const derived = correctionEvidence();
  assert.equal(derived.evidenceClass, EvidenceClass.DERIVED);
  assert.equal(derived.derivationParent?.toString(), record.originalArtifact.id.toString());
  assert.notStrictEqual(derived, record.originalArtifact);
  assert.equal(record.originalArtifact.evidenceClass, EvidenceClass.ORIGINAL);
});

test('FV09-14 reviewed-fact-separate', () => {
  const review = intake().withProcessingState(IntakeProcessingState.REVIEW_REQUIRED);
  assert.equal(review.processingState, 'REVIEW_REQUIRED');
  assert.equal(review.originalArtifact.verificationState.toString(), VerificationStateCode.UNVERIFIED);
  assert.equal('reviewedFact' in review, false);
});

test('FV09-15 verified-evidence-separate', () => {
  assert.throws(() => DocumentIntakeRecord.create({
    id: DocumentIntakeId.from(INTAKE_ID),
    sourceChannel: IntakeSourceChannel.API,
    receivedAt: UtcInstant.from('2026-09-15T07:01:00Z'),
    receivedBy: actor,
    originalArtifact: original(VerificationStateCode.VERIFIED),
    media: IntakeMediaMetadata.create({ mediaType: 'application/pdf', byteLength: 1 }),
    securityClassification: IntakeSecurityClassification.RESTRICTED,
    processingState: IntakeProcessingState.PROCESSED,
  }), /must not create verified evidence/i);
});

test('FV09-16 intake-not-eligibility', () => {
  const source = readFileSync('packages/application/src/intake/document-intake.ts', 'utf8');
  assert.doesNotMatch(source, /EligibilityAssessment/);
  assert.equal('eligibility' in intake(), false);
});

test('FV09-17 intake-not-authorization', () => {
  const source = readFileSync('packages/application/src/intake/document-intake.ts', 'utf8');
  assert.doesNotMatch(source, /AuthorizationGrant/);
  assert.equal('authorization' in intake(), false);
});

test('FV09-18 correction-linked-not-overwrite', () => {
  const record = intake();
  const hashBefore = record.originalArtifact.contentHash?.toString();
  const correction = IntakeCorrectionRecord.create({
    intake: record,
    correctionEvidence: correctionEvidence(),
    correctedBy: actor,
    correctedAt: UtcInstant.from('2026-09-15T07:06:00Z'),
    reason: 'Human corrected extracted surname',
  });
  assert.equal(correction.originalEvidenceId.toString(), ORIGINAL_ID);
  assert.equal(correction.correctionEvidence.derivationParent?.toString(), ORIGINAL_ID);
  assert.equal(record.originalArtifact.contentHash?.toString(), hashBefore);
  assert.equal(record.originalArtifact.contentReference, 'object://immutable/original-1');
});

test('FV09-19 channel-not-trust', () => {
  const api = intake(IntakeSourceChannel.API);
  const file = intake(IntakeSourceChannel.FILE_UPLOAD);
  assert.equal(api.originalArtifact.verificationState.toString(), VerificationStateCode.UNVERIFIED);
  assert.equal(file.originalArtifact.verificationState.toString(), VerificationStateCode.UNVERIFIED);
  assert.notEqual(api.sourceChannel, file.sourceChannel);
});

test('FV09-20 architecture-boundary', () => {
  const result = spawnSync('bash', ['tests/architecture_boundaries_test.sh'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  const source = readFileSync('packages/application/src/intake/document-intake.ts', 'utf8');
  assert.doesNotMatch(source, /from\s+['"](?:react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk)(?:['"/])/i);
  assert.doesNotMatch(source, /Date\.now\(|Math\.random\(|randomUUID\(/);
});
