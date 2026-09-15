import { ContentHash } from '../provenance/content-hash.ts';

function normalizeOptional(value: string | null | undefined, label: string): string | null {
  if (value === undefined || value === null) return null;
  const normalized = value.trim();
  if (normalized.length === 0 || normalized.length > 2048) {
    throw new TypeError(`${label} must be a non-empty bounded string when supplied`);
  }
  return normalized;
}

export interface ExternalArtifactReferenceInput {
  readonly externalIdentifier?: string | null;
  readonly locator?: string | null;
  readonly contentHash?: ContentHash | null;
}

export class ExternalArtifactReference {
  readonly externalIdentifier: string | null;
  readonly locator: string | null;
  readonly contentHash: ContentHash | null;

  private constructor(input: ExternalArtifactReferenceInput) {
    this.externalIdentifier = normalizeOptional(input.externalIdentifier, 'External identifier');
    this.locator = normalizeOptional(input.locator, 'External locator');
    this.contentHash = input.contentHash ?? null;
    Object.freeze(this);
  }

  static create(input: ExternalArtifactReferenceInput): ExternalArtifactReference {
    if (input.contentHash !== undefined && input.contentHash !== null && !(input.contentHash instanceof ContentHash)) {
      throw new TypeError('External content hash must use ContentHash');
    }
    const reference = new ExternalArtifactReference(input);
    if (reference.externalIdentifier === null && reference.locator === null && reference.contentHash === null) {
      throw new TypeError('External artifact reference requires an identifier, locator or content hash');
    }
    return reference;
  }
}
