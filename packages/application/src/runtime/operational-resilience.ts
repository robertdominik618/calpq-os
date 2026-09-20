import type { ApplicationExecutionContext } from '../application-execution-context.ts';
import { ApplicationEntrypoint, invokeUseCase } from '../use-case-handler.ts';
import type { UseCaseHandler } from '../use-case-handler.ts';

function requiredText(value: string, label: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new TypeError(`${label} must not be empty`);
  return value.trim();
}

export const RetryDisposition = {
  SAFE_REPLAY: 'SAFE_REPLAY',
  BOUNDED_TRANSIENT_RETRY: 'BOUNDED_TRANSIENT_RETRY',
  REISSUE_REQUIRED: 'REISSUE_REQUIRED',
  NO_RETRY: 'NO_RETRY',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
} as const;
export type RetryDisposition = (typeof RetryDisposition)[keyof typeof RetryDisposition];

export const AsyncFailureKind = {
  DUPLICATE_DELIVERY: 'DUPLICATE_DELIVERY',
  TRANSIENT_DEPENDENCY: 'TRANSIENT_DEPENDENCY',
  EXPIRED_OR_INVALID_REQUEST: 'EXPIRED_OR_INVALID_REQUEST',
  PERMANENT_REJECTION: 'PERMANENT_REJECTION',
  AMBIGUOUS_OUTCOME: 'AMBIGUOUS_OUTCOME',
} as const;
export type AsyncFailureKind = (typeof AsyncFailureKind)[keyof typeof AsyncFailureKind];

export interface RetryDecision {
  readonly disposition: RetryDisposition;
  readonly nextAttempt: number | null;
  readonly reasonCode: string;
}

export function classifyRetry(input: {
  readonly failure: AsyncFailureKind;
  readonly attempt: number;
  readonly maxAttempts: number;
}): RetryDecision {
  if (!Number.isSafeInteger(input.attempt) || input.attempt < 1) throw new RangeError('attempt must be >= 1');
  if (!Number.isSafeInteger(input.maxAttempts) || input.maxAttempts < 1) throw new RangeError('maxAttempts must be >= 1');
  switch (input.failure) {
    case AsyncFailureKind.DUPLICATE_DELIVERY:
      return Object.freeze({ disposition: RetryDisposition.SAFE_REPLAY, nextAttempt: null, reasonCode: 'DUPLICATE_SAFE_REPLAY' });
    case AsyncFailureKind.TRANSIENT_DEPENDENCY:
      return input.attempt < input.maxAttempts
        ? Object.freeze({ disposition: RetryDisposition.BOUNDED_TRANSIENT_RETRY, nextAttempt: input.attempt + 1, reasonCode: 'TRANSIENT_RETRY' })
        : Object.freeze({ disposition: RetryDisposition.HUMAN_REVIEW, nextAttempt: null, reasonCode: 'TRANSIENT_RETRY_EXHAUSTED' });
    case AsyncFailureKind.EXPIRED_OR_INVALID_REQUEST:
      return Object.freeze({ disposition: RetryDisposition.REISSUE_REQUIRED, nextAttempt: null, reasonCode: 'REQUEST_REISSUE_REQUIRED' });
    case AsyncFailureKind.PERMANENT_REJECTION:
      return Object.freeze({ disposition: RetryDisposition.NO_RETRY, nextAttempt: null, reasonCode: 'PERMANENT_NO_RETRY' });
    case AsyncFailureKind.AMBIGUOUS_OUTCOME:
      return Object.freeze({ disposition: RetryDisposition.HUMAN_REVIEW, nextAttempt: null, reasonCode: 'AMBIGUOUS_REVIEW_REQUIRED' });
  }
}

export interface AsyncDeliveryIdentity {
  readonly messageId: string;
  readonly logicalOperationId: string;
}

export class InMemoryDeliveryDeduplicator {
  readonly #completed = new Map<string, unknown>();

  has(identity: AsyncDeliveryIdentity): boolean {
    return this.#completed.has(requiredText(identity.logicalOperationId, 'logical operation id'));
  }

  replay<T>(identity: AsyncDeliveryIdentity): T | null {
    return (this.#completed.get(requiredText(identity.logicalOperationId, 'logical operation id')) as T | undefined) ?? null;
  }

  complete<T>(identity: AsyncDeliveryIdentity, result: T): void {
    requiredText(identity.messageId, 'message id');
    const logicalId = requiredText(identity.logicalOperationId, 'logical operation id');
    if (!this.#completed.has(logicalId)) this.#completed.set(logicalId, result);
  }
}

export async function invokeAsyncUseCase<TInput, TOutput>(input: {
  readonly handler: UseCaseHandler<TInput, TOutput>;
  readonly payload: TInput;
  readonly context: ApplicationExecutionContext;
  readonly identity: AsyncDeliveryIdentity;
  readonly deduplicator: InMemoryDeliveryDeduplicator;
}): Promise<{ readonly replayed: boolean; readonly result: TOutput }> {
  const replay = input.deduplicator.replay<TOutput>(input.identity);
  if (replay !== null) return Object.freeze({ replayed: true, result: replay });
  const result = await invokeUseCase({
    entrypoint: ApplicationEntrypoint.WORKER,
    handler: input.handler,
    input: input.payload,
    context: input.context,
  });
  input.deduplicator.complete(input.identity, result);
  return Object.freeze({ replayed: false, result });
}

export const ReconciliationState = {
  CONSISTENT: 'CONSISTENT',
  LAGGING: 'LAGGING',
  DIVERGED: 'DIVERGED',
  REBUILD_REQUIRED: 'REBUILD_REQUIRED',
} as const;
export type ReconciliationState = (typeof ReconciliationState)[keyof typeof ReconciliationState];

export interface ReconciliationResult {
  readonly state: ReconciliationState;
  readonly authoritativeRevision: number;
  readonly projectionRevision: number;
  readonly checkpointRevision: number;
  readonly rewriteAuthoritativeHistory: false;
}

export function reconcileRuntime(input: {
  readonly authoritativeRevision: number;
  readonly projectionRevision: number;
  readonly checkpointRevision: number;
  readonly projectionChecksumMatches?: boolean;
}): ReconciliationResult {
  for (const [name, value] of Object.entries(input).filter(([key]) => key.endsWith('Revision'))) {
    if (!Number.isSafeInteger(value) || (value as number) < 0) throw new RangeError(`${name} must be a non-negative integer`);
  }
  let state: ReconciliationState;
  if (input.projectionChecksumMatches === false) state = ReconciliationState.DIVERGED;
  else if (input.projectionRevision > input.authoritativeRevision || input.checkpointRevision > input.authoritativeRevision) state = ReconciliationState.REBUILD_REQUIRED;
  else if (input.projectionRevision < input.authoritativeRevision || input.checkpointRevision < input.authoritativeRevision) state = ReconciliationState.LAGGING;
  else state = ReconciliationState.CONSISTENT;
  return Object.freeze({
    state,
    authoritativeRevision: input.authoritativeRevision,
    projectionRevision: input.projectionRevision,
    checkpointRevision: input.checkpointRevision,
    rewriteAuthoritativeHistory: false,
  });
}

export function authoritativeValue<T>(authoritative: T, _projection: T): T {
  return authoritative;
}

export const RecoveryStatus = {
  READY: 'READY',
  BLOCKED: 'BLOCKED',
} as const;
export type RecoveryStatus = (typeof RecoveryStatus)[keyof typeof RecoveryStatus];

export interface RecoveryValidation {
  readonly status: RecoveryStatus;
  readonly reasons: readonly string[];
  readonly exposeNormally: boolean;
}

export function validateRecovery(input: {
  readonly authoritativeStateValid: boolean;
  readonly deliveryPositionValid: boolean;
  readonly auditReferencesValid: boolean;
  readonly projectionCheckpointValid: boolean;
  readonly accessRestrictionsSatisfied: boolean;
  readonly privacyRestrictionsSatisfied: boolean;
}): RecoveryValidation {
  const reasons: string[] = [];
  if (!input.authoritativeStateValid) reasons.push('AUTHORITATIVE_STATE_INVALID');
  if (!input.deliveryPositionValid) reasons.push('DELIVERY_POSITION_INVALID');
  if (!input.auditReferencesValid) reasons.push('AUDIT_REFERENCE_INVALID');
  if (!input.projectionCheckpointValid) reasons.push('PROJECTION_CHECKPOINT_INVALID');
  if (!input.accessRestrictionsSatisfied) reasons.push('ACCESS_RESTRICTION_BLOCK');
  if (!input.privacyRestrictionsSatisfied) reasons.push('PRIVACY_RESTRICTION_BLOCK');
  return Object.freeze({
    status: reasons.length === 0 ? RecoveryStatus.READY : RecoveryStatus.BLOCKED,
    reasons: Object.freeze(reasons),
    exposeNormally: reasons.length === 0,
  });
}

export function dependencyOutageDecision(attempt: number, maxAttempts: number): RetryDecision {
  return classifyRetry({ failure: AsyncFailureKind.TRANSIENT_DEPENDENCY, attempt, maxAttempts });
}
