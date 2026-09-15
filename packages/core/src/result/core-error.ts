import { ReasonCode } from './reason-code.ts';

export const CoreErrorFamily = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVARIANT_VIOLATION: 'INVARIANT_VIOLATION',
  STALE_SOURCE: 'STALE_SOURCE',
  DATA_INTEGRITY_ERROR: 'DATA_INTEGRITY_ERROR',
  EXTERNAL_DEPENDENCY_ERROR: 'EXTERNAL_DEPENDENCY_ERROR',
  UNSUPPORTED_OPERATION: 'UNSUPPORTED_OPERATION',
} as const;
export type CoreErrorFamily = (typeof CoreErrorFamily)[keyof typeof CoreErrorFamily];
const CORE_ERROR_FAMILIES = new Set<string>(Object.values(CoreErrorFamily));

export class CoreError extends Error {
  readonly family: CoreErrorFamily;
  readonly code: ReasonCode;

  private constructor(family: CoreErrorFamily, code: ReasonCode) {
    super(code.toString());
    this.name = 'CoreError';
    this.family = family;
    this.code = code;
    Object.freeze(this);
  }

  static create(family: CoreErrorFamily, code: ReasonCode): CoreError {
    if (!CORE_ERROR_FAMILIES.has(family)) throw new TypeError('Core error family must be controlled');
    if (!(code instanceof ReasonCode)) throw new TypeError('Core error code must use ReasonCode');
    return new CoreError(family, code);
  }

  toJSON(): { readonly family: CoreErrorFamily; readonly code: string } {
    return { family: this.family, code: this.code.toString() };
  }
}
