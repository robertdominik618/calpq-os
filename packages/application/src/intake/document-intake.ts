import {
  ActorReference,
  EvidenceClass,
  EvidenceId,
  EvidenceReference,
  SubjectReference,
  UtcInstant,
  VerificationStateCode,
} from '../../../core/src/index.ts';
import { OrganizationScopeReference } from '../references.ts';

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MEDIA_TYPE_PATTERN = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+(?:\s*;.*)?$/i;

export class DocumentIntakeId {
  readonly #value: string;
  private constructor(value: string) {
    if (typeof value !== 'string' || !UUID_V7_PATTERN.test(value)) {
      throw new TypeError('DocumentIntakeId requires RFC 9562 UUIDv7 text');
    }
    this.#value = value.toLowerCase();
    Object.freeze(this);
  }
  static from(value: string): DocumentIntakeId { return new DocumentIntakeId(value); }
  toString(): string { return this.#value; }
  toJSON(): string { return this.#value; }
}

export const IntakeSourceChannel = {
  CAMERA: 'CAMERA',
  SCAN: 'SCAN',
  FILE_UPLOAD: 'FILE_UPLOAD',
  EMAIL_ATTACHMENT: 'EMAIL_ATTACHMENT',
  SHARE_SHEET: 'SHARE_SHEET',
  URL: 'URL',
  API: 'API',
  OTHER: 'OTHER',
} as const;
export type IntakeSourceChannel = (typeof IntakeSourceChannel)[keyof typeof IntakeSourceChannel];
const CHANNELS = new Set<string>(Object.values(IntakeSourceChannel));

export const IntakeSecurityClassification = {
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  RESTRICTED: 'RESTRICTED',
} as const;
export type IntakeSecurityClassification = (typeof IntakeSecurityClassification)[keyof typeof IntakeSecurityClassification];
const SECURITY = new Set<string>(Object.values(IntakeSecurityClassification));

export const IntakeProcessingState = {
  RECEIVED: 'RECEIVED',
  STORED: 'STORED',
  DERIVATION_PENDING: 'DERIVATION_PENDING',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED',
} as const;
export type IntakeProcessingState = (typeof IntakeProcessingState)[keyof typeof IntakeProcessingState];
const PROCESSING = new Set<string>(Object.values(IntakeProcessingState));

export class IntakeMediaMetadata {
  readonly mediaType: string;
  readonly byteLength: number;
  readonly originalFileName: string | null;

  private constructor(mediaType: string, byteLength: number, originalFileName: string | null) {
    this.mediaType = mediaType;
    this.byteLength = byteLength;
    this.originalFileName = originalFileName;
    Object.freeze(this);
  }

  static create(input: {
    readonly mediaType: string;
    readonly byteLength: number;
    readonly originalFileName?: string | null;
  }): IntakeMediaMetadata {
    if (typeof input.mediaType !== 'string' || !MEDIA_TYPE_PATTERN.test(input.mediaType)) {
      throw new TypeError('Intake media type must be valid');
    }
    if (!Number.isSafeInteger(input.byteLength) || input.byteLength < 0) {
      throw new RangeError('Intake byte length must be a non-negative safe integer');
    }
    const fileName = input.originalFileName ?? null;
    if (fileName !== null && (typeof fileName !== 'string' || fileName.trim().length === 0 || fileName.length > 512)) {
      throw new TypeError('Original filename must be bounded non-empty text when supplied');
    }
    return new IntakeMediaMetadata(input.mediaType, input.byteLength, fileName?.trim() ?? null);
  }
}

export interface DocumentIntakeRecordInput {
  readonly id: DocumentIntakeId;
  readonly sourceChannel: IntakeSourceChannel;
  readonly receivedAt: UtcInstant;
  readonly receivedBy: ActorReference;
  readonly subject?: SubjectReference | null;
  readonly organization?: OrganizationScopeReference | null;
  readonly originalArtifact: EvidenceReference;
  readonly media: IntakeMediaMetadata;
  readonly securityClassification: IntakeSecurityClassification;
  readonly processingState: IntakeProcessingState;
}

export class DocumentIntakeRecord {
  readonly id: DocumentIntakeId;
  readonly sourceChannel: IntakeSourceChannel;
  readonly receivedAt: UtcInstant;
  readonly receivedBy: ActorReference;
  readonly subject: SubjectReference | null;
  readonly organization: OrganizationScopeReference | null;
  readonly originalArtifact: EvidenceReference;
  readonly media: IntakeMediaMetadata;
  readonly securityClassification: IntakeSecurityClassification;
  readonly processingState: IntakeProcessingState;

  private constructor(input: DocumentIntakeRecordInput) {
    this.id = input.id;
    this.sourceChannel = input.sourceChannel;
    this.receivedAt = input.receivedAt;
    this.receivedBy = input.receivedBy;
    this.subject = input.subject ?? null;
    this.organization = input.organization ?? null;
    this.originalArtifact = input.originalArtifact;
    this.media = input.media;
    this.securityClassification = input.securityClassification;
    this.processingState = input.processingState;
    Object.freeze(this);
  }

  static create(input: DocumentIntakeRecordInput): DocumentIntakeRecord {
    if (!(input.id instanceof DocumentIntakeId)) throw new TypeError('Intake record requires DocumentIntakeId');
    if (!CHANNELS.has(input.sourceChannel)) throw new TypeError('Intake source channel must be controlled');
    if (!(input.receivedAt instanceof UtcInstant)) throw new TypeError('Intake record requires received-at UtcInstant');
    if (!(input.receivedBy instanceof ActorReference)) throw new TypeError('Intake record requires receiving ActorReference');
    if (input.subject != null && !(input.subject instanceof SubjectReference)) throw new TypeError('Intake subject requires SubjectReference');
    if (input.organization != null && !(input.organization instanceof OrganizationScopeReference)) throw new TypeError('Intake organization requires OrganizationScopeReference');
    if (!(input.originalArtifact instanceof EvidenceReference)) throw new TypeError('Intake record requires EvidenceReference original artifact');
    if (input.originalArtifact.evidenceClass !== EvidenceClass.ORIGINAL) throw new TypeError('Intake original artifact must be ORIGINAL evidence');
    if (input.originalArtifact.contentHash === null) throw new TypeError('Intake original artifact requires immutable content hash');
    if (input.originalArtifact.verificationState.toString() === VerificationStateCode.VERIFIED) {
      throw new TypeError('Document intake must not create verified evidence');
    }
    if (!(input.media instanceof IntakeMediaMetadata)) throw new TypeError('Intake record requires media metadata');
    if (!SECURITY.has(input.securityClassification)) throw new TypeError('Intake security classification must be controlled');
    if (!PROCESSING.has(input.processingState)) throw new TypeError('Intake processing state must be controlled');
    return new DocumentIntakeRecord(input);
  }

  withProcessingState(nextState: IntakeProcessingState): DocumentIntakeRecord {
    if (!PROCESSING.has(nextState)) throw new TypeError('Intake processing state must be controlled');
    return DocumentIntakeRecord.create({
      id: this.id,
      sourceChannel: this.sourceChannel,
      receivedAt: this.receivedAt,
      receivedBy: this.receivedBy,
      subject: this.subject,
      organization: this.organization,
      originalArtifact: this.originalArtifact,
      media: this.media,
      securityClassification: this.securityClassification,
      processingState: nextState,
    });
  }
}

export class IntakeCorrectionRecord {
  readonly intakeId: DocumentIntakeId;
  readonly originalEvidenceId: EvidenceId;
  readonly correctionEvidence: EvidenceReference;
  readonly correctedBy: ActorReference;
  readonly correctedAt: UtcInstant;
  readonly reason: string;

  private constructor(input: {
    readonly intakeId: DocumentIntakeId;
    readonly originalEvidenceId: EvidenceId;
    readonly correctionEvidence: EvidenceReference;
    readonly correctedBy: ActorReference;
    readonly correctedAt: UtcInstant;
    readonly reason: string;
  }) {
    this.intakeId = input.intakeId;
    this.originalEvidenceId = input.originalEvidenceId;
    this.correctionEvidence = input.correctionEvidence;
    this.correctedBy = input.correctedBy;
    this.correctedAt = input.correctedAt;
    this.reason = input.reason.trim();
    Object.freeze(this);
  }

  static create(input: {
    readonly intake: DocumentIntakeRecord;
    readonly correctionEvidence: EvidenceReference;
    readonly correctedBy: ActorReference;
    readonly correctedAt: UtcInstant;
    readonly reason: string;
  }): IntakeCorrectionRecord {
    if (!(input.intake instanceof DocumentIntakeRecord)) throw new TypeError('Correction requires DocumentIntakeRecord');
    if (!(input.correctionEvidence instanceof EvidenceReference)) throw new TypeError('Correction requires EvidenceReference');
    if (input.correctionEvidence.evidenceClass !== EvidenceClass.DERIVED) throw new TypeError('Correction evidence must remain DERIVED evidence');
    if (input.correctionEvidence.derivationParent?.toString() !== input.intake.originalArtifact.id.toString()) {
      throw new TypeError('Correction evidence must link to the immutable original evidence');
    }
    if (input.correctionEvidence.verificationState.toString() === VerificationStateCode.VERIFIED) {
      throw new TypeError('Correction evidence cannot auto-promote to VERIFIED');
    }
    if (!(input.correctedBy instanceof ActorReference)) throw new TypeError('Correction requires ActorReference');
    if (!(input.correctedAt instanceof UtcInstant)) throw new TypeError('Correction requires UtcInstant');
    if (typeof input.reason !== 'string' || input.reason.trim().length === 0 || input.reason.length > 512) {
      throw new TypeError('Correction reason must be bounded non-empty text');
    }
    return new IntakeCorrectionRecord({
      intakeId: input.intake.id,
      originalEvidenceId: input.intake.originalArtifact.id,
      correctionEvidence: input.correctionEvidence,
      correctedBy: input.correctedBy,
      correctedAt: input.correctedAt,
      reason: input.reason,
    });
  }
}
