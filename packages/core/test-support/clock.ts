import type { Clock } from '../src/ports/clock.ts';
import { UtcInstant } from '../src/time.ts';

export class FixedClock implements Clock {
  readonly #instant: UtcInstant;

  constructor(instant: UtcInstant) {
    if (!(instant instanceof UtcInstant)) {
      throw new TypeError('FixedClock requires UtcInstant');
    }
    this.#instant = instant;
    Object.freeze(this);
  }

  now(): UtcInstant {
    return this.#instant;
  }
}

export class ControlledClock implements Clock {
  #current: UtcInstant;

  constructor(initial: UtcInstant) {
    if (!(initial instanceof UtcInstant)) {
      throw new TypeError('ControlledClock requires UtcInstant');
    }
    this.#current = initial;
  }

  now(): UtcInstant {
    return this.#current;
  }

  advanceByMilliseconds(milliseconds: number): UtcInstant {
    if (!Number.isSafeInteger(milliseconds) || milliseconds < 0) {
      throw new RangeError('Clock advance must be a non-negative safe integer');
    }

    const next = this.#current.toEpochMilliseconds() + milliseconds;
    if (!Number.isSafeInteger(next)) {
      throw new RangeError('Clock advance exceeds safe instant range');
    }

    this.#current = UtcInstant.fromEpochMilliseconds(next);
    return this.#current;
  }
}
