import {
  ReconciliationState,
  RecoveryStatus,
  RetryDisposition,
  reconcileRuntime,
  validateRecovery,
} from '../src/index.ts';
import type { ReconciliationResult, RecoveryValidation, RetryDecision } from '../src/index.ts';

declare const retry: RetryDecision;
declare const reconciliation: ReconciliationResult;
declare const recovery: RecoveryValidation;

void RetryDisposition.SAFE_REPLAY;
void ReconciliationState.CONSISTENT;
void RecoveryStatus.READY;
void reconcileRuntime({ authoritativeRevision: 1, projectionRevision: 1, checkpointRevision: 1 });
void validateRecovery({ authoritativeStateValid: true, deliveryPositionValid: true, auditReferencesValid: true, projectionCheckpointValid: true, accessRestrictionsSatisfied: true, privacyRestrictionsSatisfied: true });

// @ts-expect-error Retry decisions are immutable operational evidence.
retry.disposition = RetryDisposition.NO_RETRY;

// @ts-expect-error Reconciliation cannot authorize rewriting authoritative history.
reconciliation.rewriteAuthoritativeHistory = true;

// @ts-expect-error Recovery exposure decision is immutable after validation.
recovery.exposeNormally = true;
