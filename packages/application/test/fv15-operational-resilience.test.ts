import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import type { ApplicationExecutionContext, UseCaseHandler } from '../src/index.ts';
import {
  AsyncFailureKind,
  InMemoryDeliveryDeduplicator,
  ReconciliationState,
  RecoveryStatus,
  RetryDisposition,
  authoritativeValue,
  classifyRetry,
  dependencyOutageDecision,
  invokeAsyncUseCase,
  reconcileRuntime,
  validateRecovery,
} from '../src/index.ts';

const context = Object.freeze({}) as ApplicationExecutionContext;
const identity = Object.freeze({ messageId: 'msg-1', logicalOperationId: 'operation-1' });

class CountingHandler implements UseCaseHandler<number, number> {
  count = 0;
  async execute(input: number): Promise<number> {
    this.count += 1;
    return input * 2;
  }
}

function recovery(overrides: Partial<Parameters<typeof validateRecovery>[0]> = {}) {
  return validateRecovery({
    authoritativeStateValid: true,
    deliveryPositionValid: true,
    auditReferencesValid: true,
    projectionCheckpointValid: true,
    accessRestrictionsSatisfied: true,
    privacyRestrictionsSatisfied: true,
    ...overrides,
  });
}

test('FV15-01 async-use-case-parity', async () => {
  const handler = new CountingHandler();
  const result = await invokeAsyncUseCase({ handler, payload: 3, context, identity, deduplicator: new InMemoryDeliveryDeduplicator() });
  assert.equal(result.result, 6);
  assert.equal(handler.count, 1);
});

test('FV15-02 duplicate-command-safe', async () => {
  const handler = new CountingHandler();
  const deduplicator = new InMemoryDeliveryDeduplicator();
  const first = await invokeAsyncUseCase({ handler, payload: 4, context, identity, deduplicator });
  const second = await invokeAsyncUseCase({ handler, payload: 999, context, identity: { ...identity, messageId: 'msg-2' }, deduplicator });
  assert.equal(first.result, 8);
  assert.equal(second.result, 8);
  assert.equal(second.replayed, true);
  assert.equal(handler.count, 1);
});

test('FV15-03 duplicate-event-safe', () => {
  const deduplicator = new InMemoryDeliveryDeduplicator();
  deduplicator.complete({ messageId: 'event-delivery-1', logicalOperationId: 'event-42' }, { applied: true });
  deduplicator.complete({ messageId: 'event-delivery-2', logicalOperationId: 'event-42' }, { applied: false });
  assert.deepEqual(deduplicator.replay({ messageId: 'event-delivery-3', logicalOperationId: 'event-42' }), { applied: true });
});

test('FV15-04 safe-replay', () => {
  assert.equal(classifyRetry({ failure: AsyncFailureKind.DUPLICATE_DELIVERY, attempt: 1, maxAttempts: 3 }).disposition, RetryDisposition.SAFE_REPLAY);
});

test('FV15-05 bounded-transient-retry', () => {
  const decision = classifyRetry({ failure: AsyncFailureKind.TRANSIENT_DEPENDENCY, attempt: 1, maxAttempts: 3 });
  assert.equal(decision.disposition, RetryDisposition.BOUNDED_TRANSIENT_RETRY);
  assert.equal(decision.nextAttempt, 2);
  assert.equal(classifyRetry({ failure: AsyncFailureKind.TRANSIENT_DEPENDENCY, attempt: 3, maxAttempts: 3 }).disposition, RetryDisposition.HUMAN_REVIEW);
});

test('FV15-06 reissue-required', () => {
  assert.equal(classifyRetry({ failure: AsyncFailureKind.EXPIRED_OR_INVALID_REQUEST, attempt: 1, maxAttempts: 3 }).disposition, RetryDisposition.REISSUE_REQUIRED);
});

test('FV15-07 no-retry', () => {
  assert.equal(classifyRetry({ failure: AsyncFailureKind.PERMANENT_REJECTION, attempt: 1, maxAttempts: 3 }).disposition, RetryDisposition.NO_RETRY);
});

test('FV15-08 human-review-retry', () => {
  assert.equal(classifyRetry({ failure: AsyncFailureKind.AMBIGUOUS_OUTCOME, attempt: 1, maxAttempts: 3 }).disposition, RetryDisposition.HUMAN_REVIEW);
});

test('FV15-09 authoritative-state-priority', () => {
  assert.deepEqual(authoritativeValue({ revision: 7, value: 'truth' }, { revision: 99, value: 'projection' }), { revision: 7, value: 'truth' });
});

test('FV15-10 checkpoint-not-domain-truth', () => {
  const result = reconcileRuntime({ authoritativeRevision: 10, projectionRevision: 10, checkpointRevision: 9 });
  assert.equal(result.state, ReconciliationState.LAGGING);
  assert.equal(result.authoritativeRevision, 10);
});

test('FV15-11 projection-lag', () => {
  assert.equal(reconcileRuntime({ authoritativeRevision: 5, projectionRevision: 3, checkpointRevision: 5 }).state, ReconciliationState.LAGGING);
});

test('FV15-12 reconciliation-consistent', () => {
  assert.equal(reconcileRuntime({ authoritativeRevision: 5, projectionRevision: 5, checkpointRevision: 5 }).state, ReconciliationState.CONSISTENT);
});

test('FV15-13 reconciliation-lagging', () => {
  assert.equal(reconcileRuntime({ authoritativeRevision: 8, projectionRevision: 7, checkpointRevision: 6 }).state, ReconciliationState.LAGGING);
});

test('FV15-14 reconciliation-diverged', () => {
  assert.equal(reconcileRuntime({ authoritativeRevision: 8, projectionRevision: 8, checkpointRevision: 8, projectionChecksumMatches: false }).state, ReconciliationState.DIVERGED);
});

test('FV15-15 rebuild-required', () => {
  assert.equal(reconcileRuntime({ authoritativeRevision: 8, projectionRevision: 9, checkpointRevision: 8 }).state, ReconciliationState.REBUILD_REQUIRED);
});

test('FV15-16 outage-uncertainty', () => {
  const retry = dependencyOutageDecision(1, 3);
  assert.equal(retry.disposition, RetryDisposition.BOUNDED_TRANSIENT_RETRY);
  assert.doesNotMatch(retry.reasonCode, /SATISFIED|NOT_SATISFIED/);
});

test('FV15-17 history-not-rewritten', () => {
  assert.equal(reconcileRuntime({ authoritativeRevision: 4, projectionRevision: 2, checkpointRevision: 2 }).rewriteAuthoritativeHistory, false);
});

test('FV15-18 restore-validation', () => {
  assert.equal(recovery().status, RecoveryStatus.READY);
  assert.equal(recovery({ auditReferencesValid: false }).status, RecoveryStatus.BLOCKED);
  assert.equal(recovery({ deliveryPositionValid: false }).exposeNormally, false);
});

test('FV15-19 access-during-recovery', () => {
  const result = recovery({ accessRestrictionsSatisfied: false });
  assert.equal(result.status, RecoveryStatus.BLOCKED);
  assert.deepEqual(result.reasons, ['ACCESS_RESTRICTION_BLOCK']);
});

test('FV15-20 privacy-during-recovery', () => {
  const result = recovery({ privacyRestrictionsSatisfied: false });
  assert.equal(result.status, RecoveryStatus.BLOCKED);
  assert.deepEqual(result.reasons, ['PRIVACY_RESTRICTION_BLOCK']);
});

test('FV15-21 core-infrastructure-independence', () => {
  const coreIndex = readFileSync('packages/core/src/index.ts', 'utf8');
  assert.doesNotMatch(coreIndex, /RetryDisposition|InMemoryDeliveryDeduplicator|reconcileRuntime|validateRecovery/);
  const runtime = readFileSync('packages/application/src/runtime/operational-resilience.ts', 'utf8');
  assert.doesNotMatch(runtime, /from ['"](?:amqplib|bullmq|kafkajs|@aws-sdk|aws-sdk|redis|pg|postgres|typeorm|prisma)/);
});

test('FV15-22 architecture-boundary', () => {
  const source = readFileSync('packages/application/src/runtime/operational-resilience.ts', 'utf8');
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
  assert.doesNotMatch(source, /\bAuthorizationGrant\b/);
  assert.match(source, /invokeUseCase/);
});
