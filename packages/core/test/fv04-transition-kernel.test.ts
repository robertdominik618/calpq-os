import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import {
  ActorId,
  ActorKind,
  ActorReference,
  AggregateId,
  AggregateSnapshot,
  AggregateType,
  CommandEnvelope,
  CommandId,
  CommandType,
  CoreErrorFamily,
  CorrelationId,
  DecisionId,
  EventId,
  EventType,
  ProvenanceEnvelope,
  ReasonCode,
  Revision,
  RuleSetId,
  SubjectId,
  SubjectKind,
  SubjectReference,
  TransitionDecision,
  TransitionKernel,
  UtcInstant,
  VersionId,
} from '../src/index.ts';
import {
  DeterministicIdGenerator,
  FixedClock,
} from '../test-support/index.ts';

const IDS = {
  aggregate: '018f22e2-79b0-7cc3-98c4-dc0c0c074001',
  command: '018f22e2-79b0-7cc3-98c4-dc0c0c074002',
  command2: '018f22e2-79b0-7cc3-98c4-dc0c0c074003',
  correlation: '018f22e2-79b0-7cc3-98c4-dc0c0c074004',
  cause: '018f22e2-79b0-7cc3-98c4-dc0c0c074005',
  event: '018f22e2-79b0-7cc3-98c4-dc0c0c074006',
  actor: '018f22e2-79b0-7cc3-98c4-dc0c0c074007',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c074008',
  decision: '018f22e2-79b0-7cc3-98c4-dc0c0c074009',
  rules: '018f22e2-79b0-7cc3-98c4-dc0c0c07400a',
} as const;

const NOW = UtcInstant.from('2026-09-15T05:30:00Z');
const AGGREGATE_TYPE = AggregateType.from('TEST_COUNTER');
const COMMAND_TYPE = CommandType.from('INCREMENT_COUNTER');
const EVENT_TYPE = EventType.from('COUNTER_INCREMENTED');
const actor = ActorReference.create(ActorId.from(IDS.actor), ActorKind.SYSTEM_PROCESS);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.DOMAIN_OBJECT);
const creationProvenance = ProvenanceEnvelope.create({
  identity: DecisionId.from(IDS.decision),
  evaluatedAt: NOW,
  actor,
  subject,
  ruleSetId: RuleSetId.from(IDS.rules),
  ruleVersion: VersionId.from('test-rules-1'),
});

type CounterState = Readonly<Record<'count', number>>;
type IncrementPayload = Readonly<Record<'delta', number>>;
type CounterEventPayload = Readonly<Record<'count', number>>;

function aggregate(revision = 0, count = 0): AggregateSnapshot<CounterState> {
  return AggregateSnapshot.create({
    aggregateId: AggregateId.from(IDS.aggregate),
    aggregateType: AGGREGATE_TYPE,
    revision: Revision.from(revision),
    creationProvenance,
    state: { count },
  });
}

function command(options: {
  commandId?: string;
  expectedRevision?: number;
  delta?: number;
  causationId?: EventId | null;
} = {}): CommandEnvelope<IncrementPayload> {
  return CommandEnvelope.create({
    commandId: CommandId.from(options.commandId ?? IDS.command),
    commandType: COMMAND_TYPE,
    aggregateId: AggregateId.from(IDS.aggregate),
    expectedRevision: Revision.from(options.expectedRevision ?? 0),
    issuedAt: NOW,
    actor,
    correlationId: CorrelationId.from(IDS.correlation),
    payload: { delta: options.delta ?? 1 },
    causationId: options.causationId ?? null,
  });
}

function kernel(eventIds: readonly string[] = [IDS.event]): TransitionKernel {
  return new TransitionKernel(
    new FixedClock(NOW),
    new DeterministicIdGenerator(eventIds),
  );
}

function decide(state: CounterState, payload: IncrementPayload) {
  const next = state.count + payload.delta;
  return TransitionDecision.accepted<CounterState, CounterEventPayload>(
    { count: next },
    [{ eventType: EVENT_TYPE, payload: { count: next } }],
  );
}

function acceptOnce() {
  const result = kernel().execute({ aggregate: aggregate(), command: command(), decide });
  assert.equal(result.kind, 'ACCEPTED');
  if (result.kind !== 'ACCEPTED') throw new Error('expected accepted transition');
  return result;
}

test('FV04-01 command-id', () => {
  assert.equal(command().commandId.toString(), IDS.command);
});

test('FV04-02 command-type', () => {
  assert.equal(command().commandType.toString(), 'INCREMENT_COUNTER');
  assert.throws(() => CommandType.from('route:/increment'), TypeError);
});

test('FV04-03 correlation-id', () => {
  assert.equal(command().correlationId.toString(), IDS.correlation);
});

test('FV04-04 causation-id', () => {
  const cause = EventId.from(IDS.cause);
  assert.strictEqual(command({ causationId: cause }).causationId, cause);
});

test('FV04-05 expected-revision', () => {
  assert.equal(command({ expectedRevision: 7 }).expectedRevision.toNumber(), 7);
});

test('FV04-06 deterministic-transition', () => {
  const first = kernel().execute({ aggregate: aggregate(), command: command(), decide });
  const second = kernel().execute({ aggregate: aggregate(), command: command(), decide });
  assert.equal(first.kind, 'ACCEPTED');
  assert.equal(second.kind, 'ACCEPTED');
  if (first.kind !== 'ACCEPTED' || second.kind !== 'ACCEPTED') throw new Error('expected accepted transitions');
  assert.deepEqual(first.aggregate.state, second.aggregate.state);
  assert.equal(first.aggregate.revision.toNumber(), second.aggregate.revision.toNumber());
  assert.equal(first.events[0]?.eventId.toString(), second.events[0]?.eventId.toString());
  assert.equal(first.events[0]?.occurredAt.toString(), second.events[0]?.occurredAt.toString());

  const nonAcceptedDecisions = [
    TransitionDecision.rejected([ReasonCode.from('DOMAIN_REJECTED')]),
    TransitionDecision.reviewRequired([ReasonCode.from('DOMAIN_REVIEW_REQUIRED')]),
    TransitionDecision.indeterminate([ReasonCode.from('DOMAIN_INDETERMINATE')]),
  ];
  for (const nonAccepted of nonAcceptedDecisions) {
    const current = aggregate();
    const result = kernel([]).execute({ aggregate: current, command: command(), decide: () => nonAccepted });
    assert.notEqual(result.kind, 'DUPLICATE');
    if (result.kind === 'DUPLICATE') throw new Error('unexpected duplicate');
    assert.strictEqual(result.aggregate, current);
    assert.equal(result.aggregate.revision.toNumber(), 0);
  }
});

test('FV04-07 accepted-event', () => {
  const accepted = acceptOnce();
  assert.equal(accepted.events.length, 1);
  const event = accepted.events[0];
  assert.equal(event?.eventType.toString(), 'COUNTER_INCREMENTED');
  assert.equal(event?.commandId.toString(), IDS.command);
  assert.equal(event?.correlationId.toString(), IDS.correlation);
  assert.equal(event?.aggregateId.toString(), IDS.aggregate);
});

test('FV04-08 immutable-event-metadata', () => {
  const event = acceptOnce().events[0];
  assert.ok(event);
  assert.equal(Object.isFrozen(event), true);
  assert.equal(Object.isFrozen(event.payload), true);
  assert.equal(Object.isFrozen(event.evidenceRefs), true);
  assert.throws(() => Object.assign(event, { aggregateRevision: Revision.from(99) }), TypeError);
});

test('FV04-09 aggregate-revision', () => {
  const accepted = acceptOnce();
  assert.equal(accepted.aggregate.revision.toNumber(), 1);
  assert.equal(accepted.events[0]?.aggregateRevision.toNumber(), 1);
});

test('FV04-10 duplicate-command', () => {
  const transitionKernel = kernel([IDS.event]);
  const first = transitionKernel.execute({ aggregate: aggregate(), command: command(), decide });
  assert.equal(first.kind, 'ACCEPTED');
  if (first.kind !== 'ACCEPTED') throw new Error('expected accepted transition');
  const duplicate = transitionKernel.execute({
    aggregate: first.aggregate,
    command: command(),
    decide: () => { throw new Error('duplicate must not re-run decision logic'); },
    previouslyCompleted: first,
  });
  assert.equal(duplicate.kind, 'DUPLICATE');
});

test('FV04-11 duplicate-outcome', () => {
  const first = acceptOnce();
  const duplicate = kernel([]).execute({
    aggregate: first.aggregate,
    command: command({ expectedRevision: 1, delta: 999 }),
    decide,
    previouslyCompleted: first,
  });
  assert.equal(duplicate.kind, 'DUPLICATE');
  if (duplicate.kind !== 'DUPLICATE') throw new Error('expected duplicate');
  assert.strictEqual(duplicate.prior, first);
});

test('FV04-12 stale-revision', () => {
  const result = kernel([]).execute({ aggregate: aggregate(1, 1), command: command({ expectedRevision: 0 }), decide });
  assert.equal(result.kind, 'CONFLICT');
  if (result.kind !== 'CONFLICT') throw new Error('expected conflict');
  assert.equal(result.expectedRevision.toNumber(), 0);
  assert.equal(result.observedRevision.toNumber(), 1);
});

test('FV04-13 conflict-outcome', () => {
  const result = kernel([]).execute({ aggregate: aggregate(2, 2), command: command({ expectedRevision: 1 }), decide });
  assert.equal(result.kind, 'CONFLICT');
  if (result.kind !== 'CONFLICT') throw new Error('expected conflict');
  assert.equal(result.error.family, CoreErrorFamily.CONFLICT);
  assert.equal(result.error.code.toString(), 'STALE_EXPECTED_REVISION');
});

test('FV04-14 no-last-write-wins', () => {
  let calls = 0;
  const current = aggregate(3, 3);
  const result = kernel([]).execute({
    aggregate: current,
    command: command({ expectedRevision: 2 }),
    decide: (state, payload) => { calls += 1; return decide(state, payload); },
  });
  assert.equal(result.kind, 'CONFLICT');
  assert.equal(calls, 0);
  if (result.kind !== 'CONFLICT') throw new Error('expected conflict');
  assert.strictEqual(result.aggregate, current);
  assert.equal(result.aggregate.state.count, 3);
});

test('FV04-15 replay-stability', () => {
  const first = acceptOnce();
  const duplicate = kernel([]).execute({
    aggregate: first.aggregate,
    command: command({ expectedRevision: 1 }),
    decide,
    previouslyCompleted: first,
  });
  assert.equal(duplicate.kind, 'DUPLICATE');
  if (duplicate.kind !== 'DUPLICATE' || duplicate.prior.kind !== 'ACCEPTED') throw new Error('expected accepted replay');
  assert.strictEqual(duplicate.prior, first);
  assert.equal(duplicate.prior.events[0]?.eventId.toString(), first.events[0]?.eventId.toString());
  assert.equal(duplicate.prior.aggregate.revision.toNumber(), first.aggregate.revision.toNumber());
});

test('FV04-16 core-storage-independence', () => {
  const source = readFileSync('packages/core/src/transition/transition-kernel.ts', 'utf8');
  assert.doesNotMatch(source, /\b(Map|WeakMap|database|sql|redis|repository|idempotencyStore|storageClient)\b/i);
});

test('FV04-17 transport-neutrality', () => {
  const source = [
    readFileSync('packages/core/src/transition/command-envelope.ts', 'utf8'),
    readFileSync('packages/core/src/transition/event-envelope.ts', 'utf8'),
  ].join('\n');
  assert.doesNotMatch(source, /\b(http|header|cookie|queue|deliveryTag|orm|databaseRow)\b/i);
});

test('FV04-18 architecture-boundary', () => {
  const guard = spawnSync('bash', ['tests/architecture_boundaries_test.sh'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(guard.status, 0, `${guard.stdout}\n${guard.stderr}`);
});
