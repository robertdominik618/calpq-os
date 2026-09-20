import { SourceId } from '../ids.ts';
import { VerificationStateCode } from '../verification-state.ts';
import { SourceReference } from '../provenance/source-reference.ts';

export const AuthoritativeSourceRegistryStatus = {
  VERIFIED: 'VERIFIED',
  UNVERIFIED: 'UNVERIFIED',
  STALE_REVIEW_REQUIRED: 'STALE_REVIEW_REQUIRED',
} as const;
export type AuthoritativeSourceRegistryStatus =
  (typeof AuthoritativeSourceRegistryStatus)[keyof typeof AuthoritativeSourceRegistryStatus];

const DOMAIN_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export interface AuthoritativeSourceRecordInput {
  readonly source: SourceReference;
  readonly affectedDomain: string;
  readonly reviewReason?: string | null;
}

function registryStatusFor(source: SourceReference): AuthoritativeSourceRegistryStatus {
  const state = source.verificationState.toString();
  if (state === VerificationStateCode.VERIFIED) return AuthoritativeSourceRegistryStatus.VERIFIED;
  if (state === VerificationStateCode.UNVERIFIED) return AuthoritativeSourceRegistryStatus.UNVERIFIED;
  if (state === VerificationStateCode.STALE || state === VerificationStateCode.REVIEW_REQUIRED) {
    return AuthoritativeSourceRegistryStatus.STALE_REVIEW_REQUIRED;
  }
  throw new TypeError('Authoritative source registry accepts only VERIFIED, UNVERIFIED, STALE or REVIEW_REQUIRED source states');
}

export class AuthoritativeSourceRecord {
  readonly source: SourceReference;
  readonly affectedDomain: string;
  readonly registryStatus: AuthoritativeSourceRegistryStatus;
  readonly reviewReason: string | null;

  private constructor(
    source: SourceReference,
    affectedDomain: string,
    registryStatus: AuthoritativeSourceRegistryStatus,
    reviewReason: string | null,
  ) {
    this.source = source;
    this.affectedDomain = affectedDomain;
    this.registryStatus = registryStatus;
    this.reviewReason = reviewReason;
    Object.freeze(this);
  }

  static create(input: AuthoritativeSourceRecordInput): AuthoritativeSourceRecord {
    if (!(input.source instanceof SourceReference)) {
      throw new TypeError('Authoritative source record requires SourceReference');
    }
    if (input.source.canonicalLocator === null) {
      throw new TypeError('Authoritative source record requires a canonical source locator');
    }
    if (typeof input.affectedDomain !== 'string' || !DOMAIN_PATTERN.test(input.affectedDomain)) {
      throw new TypeError('Affected domain must be an explicit bounded domain token');
    }

    const registryStatus = registryStatusFor(input.source);
    const suppliedReason = input.reviewReason ?? null;
    if (
      suppliedReason !== null &&
      (typeof suppliedReason !== 'string' || suppliedReason.trim().length === 0 || suppliedReason.length > 512)
    ) {
      throw new TypeError('Review reason must be a non-empty bounded string when supplied');
    }
    if (
      registryStatus === AuthoritativeSourceRegistryStatus.STALE_REVIEW_REQUIRED &&
      suppliedReason === null
    ) {
      throw new TypeError('Stale or review-required source requires an explicit review reason');
    }

    return new AuthoritativeSourceRecord(
      input.source,
      input.affectedDomain,
      registryStatus,
      suppliedReason,
    );
  }
}

export class AuthoritativeSourceRegistry {
  readonly #records: readonly AuthoritativeSourceRecord[];
  readonly #bySourceId: Map<string, AuthoritativeSourceRecord>;

  private constructor(records: readonly AuthoritativeSourceRecord[]) {
    this.#records = Object.freeze([...records]);
    this.#bySourceId = new Map(records.map((record) => [record.source.id.toString(), record]));
    Object.freeze(this);
  }

  static create(records: readonly AuthoritativeSourceRecord[]): AuthoritativeSourceRegistry {
    if (!Array.isArray(records)) {
      throw new TypeError('Authoritative source registry requires an array of records');
    }

    const seen = new Set<string>();
    for (const record of records) {
      if (!(record instanceof AuthoritativeSourceRecord)) {
        throw new TypeError('Authoritative source registry accepts only AuthoritativeSourceRecord values');
      }
      const id = record.source.id.toString();
      if (seen.has(id)) {
        throw new TypeError('Duplicate authoritative source identity');
      }
      seen.add(id);
    }

    return new AuthoritativeSourceRegistry(records);
  }

  get size(): number {
    return this.#records.length;
  }

  list(): readonly AuthoritativeSourceRecord[] {
    return this.#records;
  }

  findBySourceId(sourceId: SourceId): AuthoritativeSourceRecord | null {
    if (!(sourceId instanceof SourceId)) {
      throw new TypeError('Authoritative source lookup requires SourceId');
    }
    return this.#bySourceId.get(sourceId.toString()) ?? null;
  }
}
