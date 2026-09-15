const SHA256_PATTERN = /^[0-9a-f]{64}$/i;

export class ContentHash {
  readonly #digest: string;

  private constructor(digest: string) {
    this.#digest = digest;
    Object.freeze(this);
  }

  static sha256(digest: string): ContentHash {
    if (typeof digest !== 'string' || !SHA256_PATTERN.test(digest)) {
      throw new TypeError('SHA-256 digest must contain exactly 64 hexadecimal characters');
    }
    return new ContentHash(digest.toLowerCase());
  }

  toString(): string {
    return `sha256:${this.#digest}`;
  }

  toJSON(): { readonly algorithm: 'SHA-256'; readonly digest: string } {
    return { algorithm: 'SHA-256', digest: this.#digest };
  }
}
