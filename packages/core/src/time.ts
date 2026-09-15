const RFC3339_WITH_ZONE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|[+-]\d{2}:\d{2})$/i;
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidCalendarDate(year: number, month: number, day: number): boolean {
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= (daysInMonth[month - 1] ?? 0);
}

function isValidOffset(offset: string): boolean {
  if (offset.toUpperCase() === 'Z') return true;
  const hours = Number(offset.slice(1, 3));
  const minutes = Number(offset.slice(4, 6));
  return hours <= 23 && minutes <= 59;
}

export class UtcInstant {
  readonly #epochMilliseconds: number;

  private constructor(epochMilliseconds: number) {
    this.#epochMilliseconds = epochMilliseconds;
    Object.freeze(this);
  }

  static from(value: string): UtcInstant {
    if (typeof value !== 'string') {
      throw new TypeError('UTC instant must be a string');
    }

    const match = RFC3339_WITH_ZONE.exec(value);
    if (!match) {
      throw new TypeError('UTC instant must be an RFC 3339 timestamp with an explicit zone');
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    const second = Number(match[6]);
    const offset = match[8] ?? '';

    if (
      !isValidCalendarDate(year, month, day) ||
      hour > 23 ||
      minute > 59 ||
      second > 59 ||
      !isValidOffset(offset)
    ) {
      throw new TypeError('UTC instant contains invalid date/time components');
    }

    const epochMilliseconds = Date.parse(value);
    if (!Number.isFinite(epochMilliseconds)) {
      throw new TypeError('UTC instant is not a valid timestamp');
    }

    return new UtcInstant(epochMilliseconds);
  }

  static fromEpochMilliseconds(value: number): UtcInstant {
    if (!Number.isSafeInteger(value) || !Number.isFinite(new Date(value).getTime())) {
      throw new TypeError('Epoch milliseconds must be a valid safe-integer instant');
    }
    return new UtcInstant(value);
  }

  toEpochMilliseconds(): number {
    return this.#epochMilliseconds;
  }

  toString(): string {
    return new Date(this.#epochMilliseconds).toISOString();
  }

  toJSON(): string {
    return this.toString();
  }
}

export class DateOnly {
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
    Object.freeze(this);
  }

  static from(value: string): DateOnly {
    if (typeof value !== 'string') {
      throw new TypeError('Date-only value must be a string');
    }

    const match = DATE_ONLY_PATTERN.exec(value);
    if (!match) {
      throw new TypeError('Date-only value must use YYYY-MM-DD');
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (!isValidCalendarDate(year, month, day)) {
      throw new TypeError('Date-only value is not a valid calendar date');
    }

    return new DateOnly(value);
  }

  toString(): string {
    return this.#value;
  }

  toJSON(): string {
    return this.#value;
  }
}
