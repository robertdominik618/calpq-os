export class Revision {
  readonly #value: number;

  private constructor(value: number) {
    this.#value = value;
    Object.freeze(this);
  }

  static initial(): Revision {
    return new Revision(0);
  }

  static from(value: number): Revision {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError('Revision must be a non-negative safe integer');
    }
    return new Revision(value);
  }

  next(): Revision {
    if (this.#value === Number.MAX_SAFE_INTEGER) {
      throw new RangeError('Revision cannot exceed Number.MAX_SAFE_INTEGER');
    }
    return new Revision(this.#value + 1);
  }

  toNumber(): number {
    return this.#value;
  }

  toJSON(): number {
    return this.#value;
  }
}
