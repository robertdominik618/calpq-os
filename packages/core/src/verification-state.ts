export const VerificationStateCode = {
  UNVERIFIED: 'UNVERIFIED',
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  STALE: 'STALE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  NOT_APPLICABLE: 'NOT_APPLICABLE',
} as const;
export type VerificationStateCode = (typeof VerificationStateCode)[keyof typeof VerificationStateCode];
const VERIFICATION_STATES = new Set<string>(Object.values(VerificationStateCode));

export class VerificationState {
  readonly #value: VerificationStateCode;

  private constructor(value: VerificationStateCode) {
    this.#value = value;
    Object.freeze(this);
  }

  static from(value: string): VerificationState {
    if (typeof value !== 'string' || !VERIFICATION_STATES.has(value)) {
      throw new TypeError('Verification state must be a controlled value');
    }
    return new VerificationState(value as VerificationStateCode);
  }

  toString(): string {
    return this.#value;
  }

  toJSON(): VerificationStateCode {
    return this.#value;
  }
}
