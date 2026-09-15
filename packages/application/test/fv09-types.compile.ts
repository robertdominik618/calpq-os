import {
  ActorId,
  ActorKind,
  ActorReference,
  ContentHash,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
} from '../../core/src/index.ts';
import {
  DocumentIntakeId,
  DocumentIntakeRecord,
  IntakeMediaMetadata,
  IntakeProcessingState,
  IntakeSecurityClassification,
  IntakeSourceChannel,
} from '../src/index.ts';

const actor = ActorReference.create(
  ActorId.from('018f22e2-79b0-7cc3-98c4-dc0c0c076101'),
  ActorKind.HUMAN_USER,
);
const original = EvidenceReference.original({
  id: EvidenceId.from('018f22e2-79b0-7cc3-98c4-dc0c0c076102'),
  kind: EvidenceKind.DOCUMENT,
  contentReference: 'object://compile/original',
  mediaType: 'application/pdf',
  contentHash: ContentHash.sha256('c'.repeat(64)),
  acquiredAt: UtcInstant.from('2026-09-15T07:20:00Z'),
  acquiredBy: actor,
  verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
});

const record = DocumentIntakeRecord.create({
  id: DocumentIntakeId.from('018f22e2-79b0-7cc3-98c4-dc0c0c076103'),
  sourceChannel: IntakeSourceChannel.FILE_UPLOAD,
  receivedAt: UtcInstant.from('2026-09-15T07:21:00Z'),
  receivedBy: actor,
  originalArtifact: original,
  media: IntakeMediaMetadata.create({ mediaType: 'application/pdf', byteLength: 128 }),
  securityClassification: IntakeSecurityClassification.INTERNAL,
  processingState: IntakeProcessingState.RECEIVED,
});
void record;

// @ts-expect-error DocumentIntakeId and EvidenceId are semantically distinct durable identities.
const wrongEvidenceId: EvidenceId = record.id;
void wrongEvidenceId;

// @ts-expect-error Intake records are immutable snapshots.
record.processingState = IntakeProcessingState.PROCESSED;

// @ts-expect-error Controlled source channel rejects arbitrary text at compile time.
const wrongChannel: typeof IntakeSourceChannel[keyof typeof IntakeSourceChannel] = 'TRUSTED';
void wrongChannel;
