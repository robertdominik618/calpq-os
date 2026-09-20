import { SourceId } from '../ids.ts';
import { DateOnly, UtcInstant } from '../time.ts';
import { VersionId } from '../version.ts';
import { ActorReference } from '../party-references.ts';
import { Jurisdiction } from '../jurisdiction.ts';
import { VerificationState } from '../verification-state.ts';
import { ContentHash } from './content-hash.ts';

export const SourceType = {
  LAW: 'LAW',
  REGULATION: 'REGULATION',
  REGISTRY: 'REGISTRY',
  OFFICIAL_GUIDANCE: 'OFFICIAL_GUIDANCE',
  STANDARD: 'STANDARD',
  ISSUER_RECORD: 'ISSUER_RECORD',
  OTHER_AUTHORITY_SOURCE: 'OTHER_AUTHORITY_SOURCE',
} as const;
export type SourceType = (typeof SourceType)[keyof typeof SourceType];
const SOURCE_TYPES = new Set<string>(Object.values(SourceType));

export interface SourceReferenceInput {
  readonly id: SourceId;
  readonly authority: ActorReference;
  readonly jurisdiction: Jurisdiction;
  readonly sourceType: SourceType;
  readonly canonicalLocator?: string | null;
  readonly version: VersionId;
  readonly publicationDate?: DateOnly | null;
  readonly effectiveFrom?: DateOnly | null;
  readonly effectiveTo?: DateOnly | null;
  readonly retrievedAt: UtcInstant;
  readonly verificationState: VerificationState;
  readonly contentHash?: ContentHash | null;
}

export class SourceReference {
  readonly id: SourceId;
  readonly authority: ActorReference;
  readonly jurisdiction: Jurisdiction;
  readonly sourceType: SourceType;
  readonly canonicalLocator: string | null;
  readonly version: VersionId;
  readonly publicationDate: DateOnly | null;
  readonly effectiveFrom: DateOnly | null;
  readonly effectiveTo: DateOnly | null;
  readonly retrievedAt: UtcInstant;
  readonly verificationState: VerificationState;
  readonly contentHash: ContentHash | null;

  private constructor(input: SourceReferenceInput) {
    this.id = input.id;
    this.authority = input.authority;
    this.jurisdiction = input.jurisdiction;
    this.sourceType = input.sourceType;
    this.canonicalLocator = input.canonicalLocator ?? null;
    this.version = input.version;
    this.publicationDate = input.publicationDate ?? null;
    this.effectiveFrom = input.effectiveFrom ?? null;
    this.effectiveTo = input.effectiveTo ?? null;
    this.retrievedAt = input.retrievedAt;
    this.verificationState = input.verificationState;
    this.contentHash = input.contentHash ?? null;
    Object.freeze(this);
  }

  static create(input: SourceReferenceInput): SourceReference {
    if (!(input.id instanceof SourceId)) throw new TypeError('SourceReference requires SourceId');
    if (!(input.authority instanceof ActorReference)) throw new TypeError('SourceReference requires ActorReference authority');
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('SourceReference requires controlled Jurisdiction');
    if (!SOURCE_TYPES.has(input.sourceType)) throw new TypeError('Source type must be controlled');
    if (!(input.version instanceof VersionId)) throw new TypeError('SourceReference requires VersionId');
    if (!(input.retrievedAt instanceof UtcInstant)) throw new TypeError('SourceReference requires retrieved-at UtcInstant');
    if (!(input.verificationState instanceof VerificationState)) throw new TypeError('SourceReference requires VerificationState');

    const locator = input.canonicalLocator ?? null;
    if (locator !== null && (typeof locator !== 'string' || locator.trim().length === 0 || locator.length > 2048)) {
      throw new TypeError('Canonical source locator must be a non-empty bounded string when supplied');
    }

    for (const date of [input.publicationDate, input.effectiveFrom, input.effectiveTo]) {
      if (date !== undefined && date !== null && !(date instanceof DateOnly)) {
        throw new TypeError('Source dates must use DateOnly values');
      }
    }
    if (input.contentHash !== undefined && input.contentHash !== null && !(input.contentHash instanceof ContentHash)) {
      throw new TypeError('Source content hash must use ContentHash');
    }

    const from = input.effectiveFrom?.toString() ?? null;
    const to = input.effectiveTo?.toString() ?? null;
    if (from !== null && to !== null && from > to) {
      throw new RangeError('Source effective-from date must not be after effective-to date');
    }

    return new SourceReference(input);
  }
}
