const REASON_CODE_PATTERN = /^[A-Z][A-Z0-9_]{2,63}$/;

export class ReasonCode {
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
    Object.freeze(this);
  }

  static from(value: string): ReasonCode {
    if (typeof value !== 'string' || !REASON_CODE_PATTERN.test(value)) {
      throw new TypeError('Reason code must be a stable uppercase machine-readable identifier');
    }
    return new ReasonCode(value);
  }

  toString(): string {
    return this.#value;
  }

  toJSON(): string {
    return this.#value;
  }
}
