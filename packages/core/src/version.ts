const VERSION_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

export class VersionId {
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
    Object.freeze(this);
  }

  static from(value: string): VersionId {
    if (typeof value !== 'string' || !VERSION_ID_PATTERN.test(value)) {
      throw new TypeError('Version identifier must be an explicit controlled token');
    }
    return new VersionId(value);
  }

  toString(): string {
    return this.#value;
  }

  toJSON(): string {
    return this.#value;
  }
}
