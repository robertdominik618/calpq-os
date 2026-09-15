import type { IdGenerator, SemanticIdType } from '../src/ports/id-generator.ts';

export class DeterministicIdGenerator implements IdGenerator {
  readonly #values: readonly string[];
  #index = 0;

  constructor(values: readonly string[]) {
    this.#values = [...values];
  }

  next<TId>(idType: SemanticIdType<TId>): TId {
    const value = this.#values[this.#index];
    if (value === undefined) {
      throw new RangeError('Deterministic ID sequence exhausted');
    }

    this.#index += 1;
    return idType.from(value);
  }

  remaining(): number {
    return this.#values.length - this.#index;
  }
}
