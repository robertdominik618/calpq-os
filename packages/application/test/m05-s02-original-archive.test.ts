import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActorId,
  ActorKind,
  ActorReference,
  ContentHash,
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
import { OrganizationScopeReference } from '../src/index.ts';
import {
  DocumentIntakeId,
  IntakeChannelProvenance,
  IntakeMediaMetadata,
  IntakeSecurityClassification,
  MultiChannelIntakeSubmission,
} from '../src/intake/index.ts';
import {
  ArchiveByteIntegrityObservation,
  ArchiveByteIntegrityState,
  OriginalArchiveEntry,
  OriginalArchiveRelationship,
  OriginalArchiveRelationshipKind,
  OriginalContentAddress,
} from '../src/archive/original-document-archive.ts';

const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078001';
const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078002';
const ORIGINAL_A_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078003';
const ORIGINAL_B_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078004';
const INTAKE_A_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078005';
const INTAKE_B_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c078006';
const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);

const actor = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);
const organization = OrganizationScopeReference.from('org:m05-s02-owner');

function original(input: {
  readonly id?: string;
  readonly hash?: string;
  readonly mediaType?: string | null;
  readonly acquiredAt?: string;
  readonly contentReference?: string;
} = {}): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(input.id ?? ORIGINAL_A_ID),
    kind: EvidenceKind.DOCUMENT,
    contentReference: input.contentReference ?? 'object://immutable/m05-s02-original-a',
    mediaType: input.mediaType === undefined ? 'application/pdf' : input.mediaType,
    contentHash: ContentHash.sha256(input.hash ?? HASH_A),
    acquiredAt: UtcInstant.from(input.acquiredAt ?? '2026-09-17T07:20:00Z'),
    acquiredBy: actor,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
}

function submission(input: {
  readonly intakeId?: string;
  readonly artifact?: EvidenceReference;
  readonly receivedAt?: string;
  readonly mediaType?: string;
  readonly byteLength?: number;
} = {}): MultiChannelIntakeSubmission {
  return MultiChannelIntakeSubmission.create({
    id: DocumentIntakeId.from(input.intakeId ?? INTAKE_A_ID),
    provenance: IntakeChannelProvenance.fileUpload(`upload:${input.intakeId ?? INTAKE_A_ID}`),
    receivedAt: UtcInstant.from(input.receivedAt ?? '2026-09-17T07:30:00Z'),
    receivedBy: actor,
    subject,
    organization,
    originalArtifact: input.artifact ?? original(),
    media: IntakeMediaMetadata.create({
      mediaType: input.mediaType ?? 'application/pdf',
      byteLength: input.byteLength ?? 4096,
      originalFileName: 'credential.pdf',
    }),
    securityClassification: IntakeSecurityClassification.CONFIDENTIAL,
  });
}

function matched(hash = HASH_A, checkedAt = '2026-09-17T07:45:00Z'): ArchiveByteIntegrityObservation {
  return ArchiveByteIntegrityObservation.matched({
    observedContentHash: ContentHash.sha256(hash),
    checkedAt: UtcInstant.from(checkedAt),
    methodReference: 'integrity:sha256-readback-v1',
  });
}

function mismatch(hash = HASH_B, checkedAt = '2026-09-17T07:45:00Z'): ArchiveByteIntegrityObservation {
  return ArchiveByteIntegrityObservation.mismatch({
    observedContentHash: ContentHash.sha256(hash),
    checkedAt: UtcInstant.from(checkedAt),
    methodReference: 'integrity:sha256-readback-v1',
  });
}

function archive(input: {
  readonly submission?: MultiChannelIntakeSubmission;
  readonly archivedAt?: string;
  readonly integrity?: ArchiveByteIntegrityObservation;
  readonly storageObjectReference?: string;
  readonly encryptionProfileReference?: string;
  readonly accessPolicyReference?: string;
  readonly retentionPolicyReference?: string;
} = {}): OriginalArchiveEntry {
  return OriginalArchiveEntry.create({
    submission: input.submission ?? submission(),
    storageObjectReference: input.storageObjectReference ?? 'archive://sha256/aa/object-a',
    archivedAt: UtcInstant.from(input.archivedAt ?? '2026-09-17T08:00:00Z'),
    encryptionProfileReference: input.encryptionProfileReference ?? 'encryption:aes256-at-rest-v1',
    accessPolicyReference: input.accessPolicyReference ?? 'access:subject-owner-v1',
    retentionPolicyReference: input.retentionPolicyReference ?? 'retention:credential-original-v1',
    integrity: input.integrity ?? matched(),
  });
}

function secondArchive(hash = HASH_B): OriginalArchiveEntry {
  const artifact = original({
    id: ORIGINAL_B_ID,
    hash,
    contentReference: 'object://immutable/m05-s02-original-b',
  });
  return archive({
    submission: submission({ intakeId: INTAKE_B_ID, artifact }),
    archivedAt: '2026-09-17T08:10:00Z',
    integrity: ArchiveByteIntegrityObservation.matched({
      observedContentHash: ContentHash.sha256(hash),
      checkedAt: UtcInstant.from('2026-09-17T08:05:00Z'),
      methodReference: 'integrity:sha256-readback-v1',
    }),
    storageObjectReference: 'archive://sha256/bb/object-b',
  });
}

test('M05S02-01 controlled byte-integrity vocabulary', () => {
  assert.deepEqual(Object.values(ArchiveByteIntegrityState), ['NOT_CHECKED', 'MATCHED', 'MISMATCH']);
});

test('M05S02-02 controlled relationship vocabulary', () => {
  assert.deepEqual(Object.values(OriginalArchiveRelationshipKind), ['REPLACES', 'SUPPLEMENTS', 'DUPLICATES', 'RELATED_TO']);
});

test('M05S02-03 content address is canonical Core SHA-256 identity', () => {
  const hash = ContentHash.sha256(HASH_A);
  assert.equal(OriginalContentAddress.fromHash(hash).toString(), `sha256:${HASH_A}`);
});

test('M05S02-04 content address preserves exact ContentHash object', () => {
  const hash = ContentHash.sha256(HASH_A);
  assert.strictEqual(OriginalContentAddress.fromHash(hash).contentHash, hash);
});

test('M05S02-05 archive preserves exact original EvidenceReference object', () => {
  const artifact = original();
  const entry = archive({ submission: submission({ artifact }) });
  assert.strictEqual(entry.originalArtifact, artifact);
});

test('M05S02-06 archive preserves intake id', () => {
  assert.equal(archive().intakeId.toString(), INTAKE_A_ID);
});

test('M05S02-07 archive preserves exact S01 provenance object', () => {
  const intake = submission();
  assert.strictEqual(archive({ submission: intake }).provenance, intake.provenance);
});

test('M05S02-08 archive preserves media type', () => {
  assert.equal(archive().media.mediaType, 'application/pdf');
});

test('M05S02-09 archive preserves byte length', () => {
  assert.equal(archive().media.byteLength, 4096);
});

test('M05S02-10 archive preserves original acquired-at', () => {
  assert.equal(archive().acquiredAt.toString(), '2026-09-17T07:20:00.000Z');
});

test('M05S02-11 archive preserves intake received-at', () => {
  assert.equal(archive().receivedAt.toString(), '2026-09-17T07:30:00.000Z');
});

test('M05S02-12 archive uses explicit archived-at', () => {
  assert.equal(archive().archivedAt.toString(), '2026-09-17T08:00:00.000Z');
});

test('M05S02-13 archive preserves security classification', () => {
  assert.equal(archive().securityClassification, IntakeSecurityClassification.CONFIDENTIAL);
});

test('M05S02-14 storage object reference is bounded and normalized', () => {
  assert.equal(archive({ storageObjectReference: '  archive://bucket/object-a  ' }).storageObjectReference, 'archive://bucket/object-a');
});

test('M05S02-15 encryption profile reference is preserved and normalized', () => {
  assert.equal(archive({ encryptionProfileReference: '  encryption:v2  ' }).encryptionProfileReference, 'encryption:v2');
});

test('M05S02-16 access policy reference is preserved and normalized', () => {
  assert.equal(archive({ accessPolicyReference: '  access:v2  ' }).accessPolicyReference, 'access:v2');
});

test('M05S02-17 retention policy reference is preserved and normalized', () => {
  assert.equal(archive({ retentionPolicyReference: '  retention:v2  ' }).retentionPolicyReference, 'retention:v2');
});

test('M05S02-18 NOT_CHECKED integrity carries no fabricated observation', () => {
  const observation = ArchiveByteIntegrityObservation.notChecked();
  assert.deepEqual(observation.toJSON(), {
    state: 'NOT_CHECKED',
    observedContentHash: null,
    checkedAt: null,
    methodReference: null,
  });
  assert.equal(archive({ integrity: observation }).integrity.state, ArchiveByteIntegrityState.NOT_CHECKED);
});

test('M05S02-19 MATCHED integrity accepts exact original hash', () => {
  assert.equal(archive({ integrity: matched() }).integrity.state, ArchiveByteIntegrityState.MATCHED);
});

test('M05S02-20 MISMATCH integrity records a different observed hash without mutation', () => {
  const entry = archive({ integrity: mismatch() });
  assert.equal(entry.integrity.state, ArchiveByteIntegrityState.MISMATCH);
  assert.equal(entry.originalArtifact.contentHash?.toString(), `sha256:${HASH_A}`);
});

test('M05S02-21 MATCHED with a different hash fails closed', () => {
  assert.throws(() => archive({ integrity: matched(HASH_B) }), TypeError);
});

test('M05S02-22 MISMATCH with the original hash fails closed', () => {
  assert.throws(() => archive({ integrity: mismatch(HASH_A) }), TypeError);
});

test('M05S02-23 integrity check cannot predate intake receipt', () => {
  assert.throws(() => archive({ integrity: matched(HASH_A, '2026-09-17T07:29:59Z') }), RangeError);
});

test('M05S02-24 integrity check cannot occur after archive snapshot', () => {
  assert.throws(() => archive({ integrity: matched(HASH_A, '2026-09-17T08:00:01Z') }), RangeError);
});

test('M05S02-25 archive snapshot cannot predate intake receipt', () => {
  assert.throws(() => archive({ archivedAt: '2026-09-17T07:29:59Z' }), RangeError);
});

test('M05S02-26 archive snapshot cannot predate original acquisition', () => {
  const artifact = original({ acquiredAt: '2026-09-17T07:40:00Z' });
  const intake = submission({ artifact, receivedAt: '2026-09-17T07:30:00Z' });
  assert.throws(() => archive({ submission: intake, archivedAt: '2026-09-17T07:35:00Z', integrity: ArchiveByteIntegrityObservation.notChecked() }), RangeError);
});

test('M05S02-27 original and intake media type mismatch fails closed', () => {
  const artifact = original({ mediaType: 'image/png' });
  const intake = submission({ artifact, mediaType: 'application/pdf' });
  assert.throws(() => archive({ submission: intake, integrity: ArchiveByteIntegrityObservation.notChecked() }), TypeError);
});

test('M05S02-28 missing original media type fails closed', () => {
  const artifact = original({ mediaType: null });
  const intake = submission({ artifact });
  assert.throws(() => archive({ submission: intake, integrity: ArchiveByteIntegrityObservation.notChecked() }), TypeError);
});

test('M05S02-29 empty storage reference fails closed', () => {
  assert.throws(() => archive({ storageObjectReference: '   ' }), TypeError);
});

test('M05S02-30 oversized policy reference fails closed', () => {
  assert.throws(() => archive({ retentionPolicyReference: 'x'.repeat(513) }), RangeError);
});

test('M05S02-31 control characters in archive references fail closed', () => {
  assert.throws(() => archive({ accessPolicyReference: 'access:v1\nforged' }), TypeError);
});

test('M05S02-32 archive entry is immutable', () => {
  assert.equal(Object.isFrozen(archive()), true);
});

test('M05S02-33 content address and integrity observation are immutable', () => {
  const entry = archive();
  assert.equal(Object.isFrozen(entry.contentAddress), true);
  assert.equal(Object.isFrozen(entry.integrity), true);
});

test('M05S02-34 canonical archive projection is deterministic', () => {
  assert.deepEqual(archive().toJSON(), archive().toJSON());
});

test('M05S02-35 exact hash equality reports byte identity', () => {
  assert.equal(archive().hasSameBytesAs(secondArchive(HASH_A)), true);
});

test('M05S02-36 different hashes report different bytes', () => {
  assert.equal(archive().hasSameBytesAs(secondArchive(HASH_B)), false);
});

test('M05S02-37 byte identity does not promote evidence verification', () => {
  const first = archive();
  const second = secondArchive(HASH_A);
  assert.equal(first.hasSameBytesAs(second), true);
  assert.equal(first.originalArtifact.verificationState.toString(), VerificationStateCode.UNVERIFIED);
  assert.equal(second.originalArtifact.verificationState.toString(), VerificationStateCode.UNVERIFIED);
});

function relationship(kind: typeof OriginalArchiveRelationshipKind[keyof typeof OriginalArchiveRelationshipKind], target = secondArchive(HASH_B)) {
  return OriginalArchiveRelationship.create({
    source: archive(),
    target,
    kind,
    recordedAt: UtcInstant.from('2026-09-17T08:20:00Z'),
    recordedBy: actor,
  });
}

test('M05S02-38 REPLACES relationship links distinct immutable originals without overwrite', () => {
  const link = relationship(OriginalArchiveRelationshipKind.REPLACES);
  assert.equal(link.kind, OriginalArchiveRelationshipKind.REPLACES);
  assert.notEqual(link.source.originalArtifact.id.toString(), link.target.originalArtifact.id.toString());
  assert.equal(Object.isFrozen(link), true);
});

test('M05S02-39 SUPPLEMENTS relationship preserves both endpoints', () => {
  const link = relationship(OriginalArchiveRelationshipKind.SUPPLEMENTS);
  assert.equal(link.kind, OriginalArchiveRelationshipKind.SUPPLEMENTS);
  assert.equal(link.source.originalArtifact.contentHash?.toString(), `sha256:${HASH_A}`);
  assert.equal(link.target.originalArtifact.contentHash?.toString(), `sha256:${HASH_B}`);
});

test('M05S02-40 DUPLICATES relationship requires byte-identical distinct originals', () => {
  const link = relationship(OriginalArchiveRelationshipKind.DUPLICATES, secondArchive(HASH_A));
  assert.equal(link.kind, OriginalArchiveRelationshipKind.DUPLICATES);
  assert.equal(link.source.hasSameBytesAs(link.target), true);
});

test('M05S02-41 relationship construction fails closed on self-link, non-duplicate bytes and early time', () => {
  const first = archive();
  assert.throws(() => OriginalArchiveRelationship.create({
    source: first,
    target: first,
    kind: OriginalArchiveRelationshipKind.RELATED_TO,
    recordedAt: UtcInstant.from('2026-09-17T08:20:00Z'),
    recordedBy: actor,
  }), TypeError);
  assert.throws(() => relationship(OriginalArchiveRelationshipKind.DUPLICATES, secondArchive(HASH_B)), TypeError);
  assert.throws(() => OriginalArchiveRelationship.create({
    source: first,
    target: secondArchive(HASH_B),
    kind: OriginalArchiveRelationshipKind.RELATED_TO,
    recordedAt: UtcInstant.from('2026-09-17T08:05:00Z'),
    recordedBy: actor,
  }), RangeError);
});

test('M05S02-42 S02 source contains no later-slice authority, provider SDK or ambient time/randomness', () => {
  const source = readFileSync('packages/application/src/archive/original-document-archive.ts', 'utf8');
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /from\s+['"](?:react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk|@google-cloud\/storage|@azure\/storage-blob)(?:['"/])/i);
  assert.doesNotMatch(source, /\b(?:EligibilityAssessment|RecognitionDecision|AuthorizationGrant)\b/);
  assert.doesNotMatch(source, /EvidenceReference\.derived\s*\(/);
  assert.doesNotMatch(source, /VerificationState\.from\s*\(/);
  assert.doesNotMatch(source, /\b(?:OCR_TEXT|AI_SUMMARY|NORMALIZED_FIELDS|EXTRACTED_METADATA)\b/);
  const json = archive().toJSON() as Readonly<Record<string, unknown>>;
  for (const forbidden of ['authenticity', 'legalValidity', 'ownership', 'eligibility', 'authorization', 'recognition']) {
    assert.equal(forbidden in json, false);
  }
});
