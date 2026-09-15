import { EvidenceId } from '../ids.ts';
import { UtcInstant } from '../time.ts';
import { ActorReference } from '../party-references.ts';
import { VerificationState, VerificationStateCode } from '../verification-state.ts';
import { ContentHash } from './content-hash.ts';
import { SourceReference } from './source-reference.ts';

export const EvidenceClass = {
  ORIGINAL: 'ORIGINAL',
  DERIVED: 'DERIVED',
} as const;
export type EvidenceClass = (typeof EvidenceClass)[keyof typeof EvidenceClass];

export const EvidenceKind = {
  DOCUMENT: 'DOCUMENT',
  IMAGE: 'IMAGE',
  REGISTRY_RESPONSE: 'REGISTRY_RESPONSE',
  ATTESTATION: 'ATTESTATION',
  DATA_EXPORT: 'DATA_EXPORT',
  OCR_TEXT: 'OCR_TEXT',
  NORMALIZED_FIELDS: 'NORMALIZED_FIELDS',
  AI_SUMMARY: 'AI_SUMMARY',
  CLASSIFICATION: 'CLASSIFICATION',
  EXTRACTED_METADATA: 'EXTRACTED_METADATA',
} as const;
export type EvidenceKind = (typeof EvidenceKind)[keyof typeof EvidenceKind];

const ORIGINAL_KINDS = new Set<EvidenceKind>([
  EvidenceKind.DOCUMENT,
  EvidenceKind.IMAGE,
  EvidenceKind.REGISTRY_RESPONSE,
  EvidenceKind.ATTESTATION,
  EvidenceKind.DATA_EXPORT,
]);
const DERIVED_KINDS = new Set<EvidenceKind>([
  EvidenceKind.OCR_TEXT,
  EvidenceKind.NORMALIZED_FIELDS,
  EvidenceKind.AI_SUMMARY,
  EvidenceKind.CLASSIFICATION,
  EvidenceKind.EXTRACTED_METADATA,
]);
const MEDIA_TYPE_PATTERN = /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+(?:\s*;.*)?$/i;

interface EvidenceBaseInput {
  readonly id: EvidenceId;
  readonly kind: EvidenceKind;
  readonly contentReference: string;
  readonly mediaType?: string | null;
  readonly contentHash?: ContentHash | null;
  readonly acquiredAt: UtcInstant;
  readonly acquiredBy: ActorReference;
  readonly source?: SourceReference | null;
  readonly verificationState: VerificationState;
}

export interface OriginalEvidenceInput extends EvidenceBaseInput {}

export interface DerivedEvidenceInput extends EvidenceBaseInput {
  readonly derivationParent: EvidenceId;
}

export class EvidenceReference {
  readonly id: EvidenceId;
  readonly kind: EvidenceKind;
  readonly evidenceClass: EvidenceClass;
  readonly contentReference: string;
  readonly mediaType: string | null;
  readonly contentHash: ContentHash | null;
  readonly acquiredAt: UtcInstant;
  readonly acquiredBy: ActorReference;
  readonly source: SourceReference | null;
  readonly derivationParent: EvidenceId | null;
  readonly verificationState: VerificationState;

  private constructor(
    input: EvidenceBaseInput,
    evidenceClass: EvidenceClass,
    derivationParent: EvidenceId | null,
  ) {
    this.id = input.id;
    this.kind = input.kind;
    this.evidenceClass = evidenceClass;
    this.contentReference = input.contentReference;
    this.mediaType = input.mediaType ?? null;
    this.contentHash = input.contentHash ?? null;
    this.acquiredAt = input.acquiredAt;
    this.acquiredBy = input.acquiredBy;
    this.source = input.source ?? null;
    this.derivationParent = derivationParent;
    this.verificationState = input.verificationState;
    Object.freeze(this);
  }

  static original(input: OriginalEvidenceInput): EvidenceReference {
    EvidenceReference.validateBase(input);
    if (!ORIGINAL_KINDS.has(input.kind)) {
      throw new TypeError('Original evidence must use an original evidence kind');
    }
    return new EvidenceReference(input, EvidenceClass.ORIGINAL, null);
  }

  static derived(input: DerivedEvidenceInput): EvidenceReference {
    EvidenceReference.validateBase(input);
    if (!DERIVED_KINDS.has(input.kind)) {
      throw new TypeError('Derived evidence must use a derived evidence kind');
    }
    if (!(input.derivationParent instanceof EvidenceId)) {
      throw new TypeError('Derived evidence requires an EvidenceId derivation parent');
    }
    if (input.verificationState.toString() === VerificationStateCode.VERIFIED) {
      throw new TypeError('Derived OCR/AI/extracted evidence cannot be created as VERIFIED without a later approved verification path');
    }
    return new EvidenceReference(input, EvidenceClass.DERIVED, input.derivationParent);
  }

  private static validateBase(input: EvidenceBaseInput): void {
    if (!(input.id instanceof EvidenceId)) throw new TypeError('EvidenceReference requires EvidenceId');
    if (typeof input.contentReference !== 'string' || input.contentReference.trim().length === 0 || input.contentReference.length > 2048) {
      throw new TypeError('Evidence content reference must be a non-empty bounded reference');
    }
    if (input.mediaType !== undefined && input.mediaType !== null && !MEDIA_TYPE_PATTERN.test(input.mediaType)) {
      throw new TypeError('Evidence media type must be a valid media type when supplied');
    }
    if (input.contentHash !== undefined && input.contentHash !== null && !(input.contentHash instanceof ContentHash)) {
      throw new TypeError('Evidence content hash must use ContentHash');
    }
    if (!(input.acquiredAt instanceof UtcInstant)) throw new TypeError('EvidenceReference requires acquired-at UtcInstant');
    if (!(input.acquiredBy instanceof ActorReference)) throw new TypeError('EvidenceReference requires acquisition ActorReference');
    if (input.source !== undefined && input.source !== null && !(input.source instanceof SourceReference)) {
      throw new TypeError('Evidence source must use SourceReference');
    }
    if (!(input.verificationState instanceof VerificationState)) {
      throw new TypeError('EvidenceReference requires VerificationState');
    }
  }
}
