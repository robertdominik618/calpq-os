import {
  ActorReference,
  ContentHash,
  EvidenceClass,
  EvidenceReference,
  UtcInstant,
} from '../../../core/src/index.ts';
import {
  DocumentIntakeId,
  IntakeMediaMetadata,
  IntakeSecurityClassification,
} from '../intake/document-intake.ts';
import {
  IntakeChannelProvenance,
  MultiChannelIntakeSubmission,
} from '../intake/multi-channel-intake.ts';

const MAX_STORAGE_REFERENCE_LENGTH = 2048;
const MAX_POLICY_REFERENCE_LENGTH = 512;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function normalizeReference(value: string, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > maxLength) throw new RangeError(`${label} is too long`);
  if (CONTROL_CHARACTER_PATTERN.test(normalized)) throw new TypeError(`${label} must not contain control characters`);
  return normalized;
}

function requireUtcInstant(value: UtcInstant, label: string): UtcInstant {
  if (!(value instanceof UtcInstant)) throw new TypeError(`${label} requires UtcInstant`);
  return value;
}

function sameHash(left: ContentHash, right: ContentHash): boolean {
  return left.toString() === right.toString();
}

export class OriginalContentAddress {
  readonly contentHash: ContentHash;

  private constructor(contentHash: ContentHash) {
    this.contentHash = contentHash;
    Object.freeze(this);
  }

  static fromHash(contentHash: ContentHash): OriginalContentAddress {
    if (!(contentHash instanceof ContentHash)) {
      throw new TypeError('Original content address requires ContentHash');
    }
    return new OriginalContentAddress(contentHash);
  }

  toString(): string {
    return this.contentHash.toString();
  }

  toJSON(): Readonly<{ algorithm: 'SHA-256'; digest: string }> {
    return Object.freeze(this.contentHash.toJSON());
  }
}

export const ArchiveByteIntegrityState = {
  NOT_CHECKED: 'NOT_CHECKED',
  MATCHED: 'MATCHED',
  MISMATCH: 'MISMATCH',
} as const;
export type ArchiveByteIntegrityState = (typeof ArchiveByteIntegrityState)[keyof typeof ArchiveByteIntegrityState];

export class ArchiveByteIntegrityObservation {
  readonly state: ArchiveByteIntegrityState;
  readonly observedContentHash: ContentHash | null;
  readonly checkedAt: UtcInstant | null;
  readonly methodReference: string | null;

  private constructor(input: {
    readonly state: ArchiveByteIntegrityState;
    readonly observedContentHash?: ContentHash | null;
    readonly checkedAt?: UtcInstant | null;
    readonly methodReference?: string | null;
  }) {
    this.state = input.state;
    this.observedContentHash = input.observedContentHash ?? null;
    this.checkedAt = input.checkedAt ?? null;
    this.methodReference = input.methodReference ?? null;
    Object.freeze(this);
  }

  static notChecked(): ArchiveByteIntegrityObservation {
    return new ArchiveByteIntegrityObservation({ state: ArchiveByteIntegrityState.NOT_CHECKED });
  }

  static matched(input: {
    readonly observedContentHash: ContentHash;
    readonly checkedAt: UtcInstant;
    readonly methodReference: string;
  }): ArchiveByteIntegrityObservation {
    return ArchiveByteIntegrityObservation.checked(ArchiveByteIntegrityState.MATCHED, input);
  }

  static mismatch(input: {
    readonly observedContentHash: ContentHash;
    readonly checkedAt: UtcInstant;
    readonly methodReference: string;
  }): ArchiveByteIntegrityObservation {
    return ArchiveByteIntegrityObservation.checked(ArchiveByteIntegrityState.MISMATCH, input);
  }

  private static checked(
    state: typeof ArchiveByteIntegrityState.MATCHED | typeof ArchiveByteIntegrityState.MISMATCH,
    input: {
      readonly observedContentHash: ContentHash;
      readonly checkedAt: UtcInstant;
      readonly methodReference: string;
    },
  ): ArchiveByteIntegrityObservation {
    if (!(input.observedContentHash instanceof ContentHash)) {
      throw new TypeError('Byte-integrity observation requires ContentHash');
    }
    requireUtcInstant(input.checkedAt, 'Byte-integrity checked-at');
    return new ArchiveByteIntegrityObservation({
      state,
      observedContentHash: input.observedContentHash,
      checkedAt: input.checkedAt,
      methodReference: normalizeReference(input.methodReference, 'Byte-integrity method reference', MAX_POLICY_REFERENCE_LENGTH),
    });
  }

  toJSON() {
    return Object.freeze({
      state: this.state,
      observedContentHash: this.observedContentHash?.toJSON() ?? null,
      checkedAt: this.checkedAt?.toString() ?? null,
      methodReference: this.methodReference,
    });
  }
}

export interface OriginalArchiveEntryInput {
  readonly submission: MultiChannelIntakeSubmission;
  readonly storageObjectReference: string;
  readonly archivedAt: UtcInstant;
  readonly encryptionProfileReference: string;
  readonly accessPolicyReference: string;
  readonly retentionPolicyReference: string;
  readonly integrity: ArchiveByteIntegrityObservation;
}

export class OriginalArchiveEntry {
  readonly intakeId: DocumentIntakeId;
  readonly originalArtifact: EvidenceReference;
  readonly provenance: IntakeChannelProvenance;
  readonly contentAddress: OriginalContentAddress;
  readonly storageObjectReference: string;
  readonly media: IntakeMediaMetadata;
  readonly acquiredAt: UtcInstant;
  readonly receivedAt: UtcInstant;
  readonly archivedAt: UtcInstant;
  readonly securityClassification: IntakeSecurityClassification;
  readonly encryptionProfileReference: string;
  readonly accessPolicyReference: string;
  readonly retentionPolicyReference: string;
  readonly integrity: ArchiveByteIntegrityObservation;

  private constructor(input: {
    readonly submission: MultiChannelIntakeSubmission;
    readonly contentAddress: OriginalContentAddress;
    readonly storageObjectReference: string;
    readonly archivedAt: UtcInstant;
    readonly encryptionProfileReference: string;
    readonly accessPolicyReference: string;
    readonly retentionPolicyReference: string;
    readonly integrity: ArchiveByteIntegrityObservation;
  }) {
    this.intakeId = input.submission.id;
    this.originalArtifact = input.submission.originalArtifact;
    this.provenance = input.submission.provenance;
    this.contentAddress = input.contentAddress;
    this.storageObjectReference = input.storageObjectReference;
    this.media = input.submission.media;
    this.acquiredAt = input.submission.originalArtifact.acquiredAt;
    this.receivedAt = input.submission.receivedAt;
    this.archivedAt = input.archivedAt;
    this.securityClassification = input.submission.securityClassification;
    this.encryptionProfileReference = input.encryptionProfileReference;
    this.accessPolicyReference = input.accessPolicyReference;
    this.retentionPolicyReference = input.retentionPolicyReference;
    this.integrity = input.integrity;
    Object.freeze(this);
  }

  static create(input: OriginalArchiveEntryInput): OriginalArchiveEntry {
    if (!(input.submission instanceof MultiChannelIntakeSubmission)) {
      throw new TypeError('Original archive entry requires MultiChannelIntakeSubmission');
    }
    const original = input.submission.originalArtifact;
    if (!(original instanceof EvidenceReference) || original.evidenceClass !== EvidenceClass.ORIGINAL) {
      throw new TypeError('Original archive entry requires ORIGINAL EvidenceReference');
    }
    if (original.contentHash === null) {
      throw new TypeError('Original archive entry requires immutable content hash');
    }
    if (original.mediaType === null) {
      throw new TypeError('Original archive entry requires original media type');
    }
    if (original.mediaType !== input.submission.media.mediaType) {
      throw new TypeError('Original archive media type must match intake media metadata');
    }

    requireUtcInstant(input.archivedAt, 'Archived-at');
    if (input.archivedAt.toEpochMilliseconds() < input.submission.receivedAt.toEpochMilliseconds()) {
      throw new RangeError('Archived-at must not predate intake received-at');
    }
    if (input.archivedAt.toEpochMilliseconds() < original.acquiredAt.toEpochMilliseconds()) {
      throw new RangeError('Archived-at must not predate original acquired-at');
    }

    if (!(input.integrity instanceof ArchiveByteIntegrityObservation)) {
      throw new TypeError('Original archive entry requires ArchiveByteIntegrityObservation');
    }
    if (input.integrity.state === ArchiveByteIntegrityState.NOT_CHECKED) {
      if (input.integrity.observedContentHash !== null || input.integrity.checkedAt !== null || input.integrity.methodReference !== null) {
        throw new TypeError('NOT_CHECKED byte integrity must not contain checked values');
      }
    } else {
      const observed = input.integrity.observedContentHash;
      const checkedAt = input.integrity.checkedAt;
      if (observed === null || checkedAt === null || input.integrity.methodReference === null) {
        throw new TypeError('Checked byte integrity requires hash, time and method');
      }
      if (checkedAt.toEpochMilliseconds() < input.submission.receivedAt.toEpochMilliseconds()) {
        throw new RangeError('Byte-integrity check must not predate intake received-at');
      }
      if (checkedAt.toEpochMilliseconds() > input.archivedAt.toEpochMilliseconds()) {
        throw new RangeError('Byte-integrity check must not occur after archive snapshot time');
      }
      const matches = sameHash(observed, original.contentHash);
      if (input.integrity.state === ArchiveByteIntegrityState.MATCHED && !matches) {
        throw new TypeError('MATCHED byte integrity requires the exact original content hash');
      }
      if (input.integrity.state === ArchiveByteIntegrityState.MISMATCH && matches) {
        throw new TypeError('MISMATCH byte integrity requires a different observed content hash');
      }
    }

    return new OriginalArchiveEntry({
      submission: input.submission,
      contentAddress: OriginalContentAddress.fromHash(original.contentHash),
      storageObjectReference: normalizeReference(input.storageObjectReference, 'Storage object reference', MAX_STORAGE_REFERENCE_LENGTH),
      archivedAt: input.archivedAt,
      encryptionProfileReference: normalizeReference(input.encryptionProfileReference, 'Encryption profile reference', MAX_POLICY_REFERENCE_LENGTH),
      accessPolicyReference: normalizeReference(input.accessPolicyReference, 'Access policy reference', MAX_POLICY_REFERENCE_LENGTH),
      retentionPolicyReference: normalizeReference(input.retentionPolicyReference, 'Retention policy reference', MAX_POLICY_REFERENCE_LENGTH),
      integrity: input.integrity,
    });
  }

  hasSameBytesAs(other: OriginalArchiveEntry): boolean {
    if (!(other instanceof OriginalArchiveEntry)) {
      throw new TypeError('Byte identity comparison requires OriginalArchiveEntry');
    }
    return sameHash(this.contentAddress.contentHash, other.contentAddress.contentHash);
  }

  toJSON() {
    return Object.freeze({
      intakeId: this.intakeId.toString(),
      originalEvidenceId: this.originalArtifact.id.toString(),
      originalEvidenceKind: this.originalArtifact.kind,
      originalContentReference: this.originalArtifact.contentReference,
      originalContentHash: this.originalArtifact.contentHash!.toJSON(),
      originalVerificationState: this.originalArtifact.verificationState.toString(),
      sourceId: this.originalArtifact.source?.id.toString() ?? null,
      contentAddress: this.contentAddress.toString(),
      storageObjectReference: this.storageObjectReference,
      media: Object.freeze({
        mediaType: this.media.mediaType,
        byteLength: this.media.byteLength,
        originalFileName: this.media.originalFileName,
      }),
      acquiredAt: this.acquiredAt.toString(),
      receivedAt: this.receivedAt.toString(),
      archivedAt: this.archivedAt.toString(),
      securityClassification: this.securityClassification,
      encryptionProfileReference: this.encryptionProfileReference,
      accessPolicyReference: this.accessPolicyReference,
      retentionPolicyReference: this.retentionPolicyReference,
      integrity: this.integrity.toJSON(),
      provenance: this.provenance.toJSON(),
    });
  }
}

export const OriginalArchiveRelationshipKind = {
  REPLACES: 'REPLACES',
  SUPPLEMENTS: 'SUPPLEMENTS',
  DUPLICATES: 'DUPLICATES',
  RELATED_TO: 'RELATED_TO',
} as const;
export type OriginalArchiveRelationshipKind = (typeof OriginalArchiveRelationshipKind)[keyof typeof OriginalArchiveRelationshipKind];
const RELATIONSHIP_KINDS = new Set<string>(Object.values(OriginalArchiveRelationshipKind));

export class OriginalArchiveRelationship {
  readonly source: OriginalArchiveEntry;
  readonly target: OriginalArchiveEntry;
  readonly kind: OriginalArchiveRelationshipKind;
  readonly recordedAt: UtcInstant;
  readonly recordedBy: ActorReference;

  private constructor(input: {
    readonly source: OriginalArchiveEntry;
    readonly target: OriginalArchiveEntry;
    readonly kind: OriginalArchiveRelationshipKind;
    readonly recordedAt: UtcInstant;
    readonly recordedBy: ActorReference;
  }) {
    this.source = input.source;
    this.target = input.target;
    this.kind = input.kind;
    this.recordedAt = input.recordedAt;
    this.recordedBy = input.recordedBy;
    Object.freeze(this);
  }

  static create(input: {
    readonly source: OriginalArchiveEntry;
    readonly target: OriginalArchiveEntry;
    readonly kind: OriginalArchiveRelationshipKind;
    readonly recordedAt: UtcInstant;
    readonly recordedBy: ActorReference;
  }): OriginalArchiveRelationship {
    if (!(input.source instanceof OriginalArchiveEntry) || !(input.target instanceof OriginalArchiveEntry)) {
      throw new TypeError('Archive relationship requires OriginalArchiveEntry endpoints');
    }
    if (input.source.originalArtifact.id.toString() === input.target.originalArtifact.id.toString()) {
      throw new TypeError('Archive relationship requires distinct original evidence IDs');
    }
    if (!RELATIONSHIP_KINDS.has(input.kind)) {
      throw new TypeError('Archive relationship kind must be controlled');
    }
    requireUtcInstant(input.recordedAt, 'Archive relationship recorded-at');
    if (!(input.recordedBy instanceof ActorReference)) {
      throw new TypeError('Archive relationship requires ActorReference');
    }
    const recorded = input.recordedAt.toEpochMilliseconds();
    if (recorded < input.source.archivedAt.toEpochMilliseconds() || recorded < input.target.archivedAt.toEpochMilliseconds()) {
      throw new RangeError('Archive relationship cannot predate either archive entry');
    }
    if (input.kind === OriginalArchiveRelationshipKind.DUPLICATES && !input.source.hasSameBytesAs(input.target)) {
      throw new TypeError('DUPLICATES relationship requires byte-identical content hashes');
    }
    return new OriginalArchiveRelationship(input);
  }

  toJSON() {
    return Object.freeze({
      sourceOriginalEvidenceId: this.source.originalArtifact.id.toString(),
      targetOriginalEvidenceId: this.target.originalArtifact.id.toString(),
      kind: this.kind,
      recordedAt: this.recordedAt.toString(),
      recordedBy: this.recordedBy.toJSON(),
    });
  }
}
