import { CoreError, CoreErrorFamily } from '../result/core-error.ts';
import { ReasonCode } from '../result/reason-code.ts';
import { EventId } from '../ids.ts';
import type { EvidenceId } from '../ids.ts';
import type { Clock } from '../ports/clock.ts';
import type { IdGenerator } from '../ports/id-generator.ts';
import type { Revision } from '../revision.ts';
import type { VersionId } from '../version.ts';
import type { ProvenanceReference } from './command-envelope.ts';
import { CommandEnvelope } from './command-envelope.ts';
import { EventEnvelope } from './event-envelope.ts';
import { EventType } from './contract-names.ts';
import { AggregateSnapshot } from './aggregate-snapshot.ts';
import type { EnvelopePayload } from './envelope-utils.ts';
import type { CommandId } from '../ids.ts';

export interface EventEmission<TPayload extends EnvelopePayload> {
  readonly eventType: EventType;
  readonly payload: TPayload;
  readonly ruleVersionRefs?: readonly VersionId[];
  readonly contractVersionRefs?: readonly VersionId[];
  readonly provenanceRefs?: readonly ProvenanceReference[];
  readonly evidenceRefs?: readonly EvidenceId[];
}

export type AcceptedDecision<TState extends EnvelopePayload, TEventPayload extends EnvelopePayload> = Readonly<{
  kind: 'ACCEPTED';
  stateChanged: true;
  newState: TState;
  events: readonly EventEmission<TEventPayload>[];
}> | Readonly<{
  kind: 'ACCEPTED';
  stateChanged: false;
  newState: TState;
  events: readonly [];
}>;

export type NonAcceptedDecisionKind = 'REJECTED' | 'REVIEW_REQUIRED' | 'INDETERMINATE';
export type NonAcceptedDecision = Readonly<{
  kind: NonAcceptedDecisionKind;
  reasonCodes: readonly ReasonCode[];
}>;

export type TransitionDecisionShape<TState extends EnvelopePayload, TEventPayload extends EnvelopePayload> =
  | AcceptedDecision<TState, TEventPayload>
  | NonAcceptedDecision;

function validateReasonCodes(reasonCodes: readonly ReasonCode[]): readonly ReasonCode[] {
  if (reasonCodes.length === 0) throw new TypeError('Transition decision requires at least one ReasonCode');
  for (const code of reasonCodes) {
    if (!(code instanceof ReasonCode)) throw new TypeError('Transition reasons must use ReasonCode');
  }
  return Object.freeze([...reasonCodes]);
}

export const TransitionDecision = Object.freeze({
  accepted<TState extends EnvelopePayload, TEventPayload extends EnvelopePayload>(
    newState: TState,
    events: readonly EventEmission<TEventPayload>[],
  ): AcceptedDecision<TState, TEventPayload> {
    if (events.length === 0) throw new TypeError('State-changing accepted transition requires at least one event');
    return Object.freeze({ kind: 'ACCEPTED', stateChanged: true, newState, events: Object.freeze([...events]) });
  },

  acceptedNoChange<TState extends EnvelopePayload>(state: TState): AcceptedDecision<TState, never> {
    const events = Object.freeze([] as const);
    return Object.freeze({ kind: 'ACCEPTED', stateChanged: false, newState: state, events });
  },

  rejected(reasonCodes: readonly ReasonCode[]): NonAcceptedDecision {
    return Object.freeze({ kind: 'REJECTED', reasonCodes: validateReasonCodes(reasonCodes) });
  },

  reviewRequired(reasonCodes: readonly ReasonCode[]): NonAcceptedDecision {
    return Object.freeze({ kind: 'REVIEW_REQUIRED', reasonCodes: validateReasonCodes(reasonCodes) });
  },

  indeterminate(reasonCodes: readonly ReasonCode[]): NonAcceptedDecision {
    return Object.freeze({ kind: 'INDETERMINATE', reasonCodes: validateReasonCodes(reasonCodes) });
  },
});

export type AcceptedTransition<TState extends EnvelopePayload, TEventPayload extends EnvelopePayload> = Readonly<{
  kind: 'ACCEPTED';
  commandId: CommandId;
  aggregate: AggregateSnapshot<TState>;
  events: readonly EventEnvelope<TEventPayload>[];
}>;

export type NonAcceptedTransition<TState extends EnvelopePayload> = Readonly<{
  kind: NonAcceptedDecisionKind;
  commandId: CommandId;
  aggregate: AggregateSnapshot<TState>;
  reasonCodes: readonly ReasonCode[];
}>;

export type CompletedTransition<TState extends EnvelopePayload, TEventPayload extends EnvelopePayload> =
  | AcceptedTransition<TState, TEventPayload>
  | NonAcceptedTransition<TState>;

export type ConflictTransition<TState extends EnvelopePayload> = Readonly<{
  kind: 'CONFLICT';
  commandId: CommandId;
  aggregate: AggregateSnapshot<TState>;
  expectedRevision: Revision;
  observedRevision: Revision;
  error: CoreError;
}>;

export type DuplicateTransition<TState extends EnvelopePayload, TEventPayload extends EnvelopePayload> = Readonly<{
  kind: 'DUPLICATE';
  commandId: CommandId;
  prior: CompletedTransition<TState, TEventPayload>;
}>;

export type TransitionResult<TState extends EnvelopePayload, TEventPayload extends EnvelopePayload> =
  | CompletedTransition<TState, TEventPayload>
  | ConflictTransition<TState>
  | DuplicateTransition<TState, TEventPayload>;

export interface ExecuteTransitionInput<
  TState extends EnvelopePayload,
  TCommandPayload extends EnvelopePayload,
  TEventPayload extends EnvelopePayload,
> {
  readonly aggregate: AggregateSnapshot<TState>;
  readonly command: CommandEnvelope<TCommandPayload>;
  readonly decide: (state: TState, payload: TCommandPayload) => TransitionDecisionShape<TState, TEventPayload>;
  readonly previouslyCompleted?: CompletedTransition<TState, TEventPayload> | null;
}

function sameId(left: { toString(): string }, right: { toString(): string }): boolean {
  return left.toString() === right.toString();
}

export class TransitionKernel {
  readonly #clock: Clock;
  readonly #idGenerator: IdGenerator;

  constructor(clock: Clock, idGenerator: IdGenerator) {
    this.#clock = clock;
    this.#idGenerator = idGenerator;
    Object.freeze(this);
  }

  execute<
    TState extends EnvelopePayload,
    TCommandPayload extends EnvelopePayload,
    TEventPayload extends EnvelopePayload,
  >(input: ExecuteTransitionInput<TState, TCommandPayload, TEventPayload>): TransitionResult<TState, TEventPayload> {
    if (!(input.aggregate instanceof AggregateSnapshot)) throw new TypeError('Transition requires AggregateSnapshot');
    if (!(input.command instanceof CommandEnvelope)) throw new TypeError('Transition requires CommandEnvelope');
    if (!sameId(input.aggregate.aggregateId, input.command.aggregateId)) {
      throw CoreError.create(CoreErrorFamily.INVARIANT_VIOLATION, ReasonCode.from('COMMAND_AGGREGATE_MISMATCH'));
    }

    const previous = input.previouslyCompleted ?? null;
    if (previous !== null) {
      if (!sameId(previous.commandId, input.command.commandId)) {
        throw CoreError.create(CoreErrorFamily.INVARIANT_VIOLATION, ReasonCode.from('IDEMPOTENCY_RECORD_COMMAND_MISMATCH'));
      }
      return Object.freeze({ kind: 'DUPLICATE', commandId: input.command.commandId, prior: previous });
    }

    if (input.command.expectedRevision.toNumber() !== input.aggregate.revision.toNumber()) {
      return Object.freeze({
        kind: 'CONFLICT',
        commandId: input.command.commandId,
        aggregate: input.aggregate,
        expectedRevision: input.command.expectedRevision,
        observedRevision: input.aggregate.revision,
        error: CoreError.create(CoreErrorFamily.CONFLICT, ReasonCode.from('STALE_EXPECTED_REVISION')),
      });
    }

    const decision = input.decide(input.aggregate.state, input.command.payload);
    if (decision.kind !== 'ACCEPTED') {
      return Object.freeze({
        kind: decision.kind,
        commandId: input.command.commandId,
        aggregate: input.aggregate,
        reasonCodes: decision.reasonCodes,
      });
    }

    if (!decision.stateChanged) {
      if (decision.newState !== input.aggregate.state || decision.events.length !== 0) {
        throw CoreError.create(CoreErrorFamily.INVARIANT_VIOLATION, ReasonCode.from('NO_CHANGE_TRANSITION_MUTATED_STATE'));
      }
      return Object.freeze({
        kind: 'ACCEPTED',
        commandId: input.command.commandId,
        aggregate: input.aggregate,
        events: Object.freeze([]),
      });
    }

    const nextRevision = input.aggregate.revision.next();
    const nextAggregate = AggregateSnapshot.revise(input.aggregate, nextRevision, decision.newState);
    const occurredAt = this.#clock.now();
    const events: EventEnvelope<TEventPayload>[] = [];
    for (const emission of decision.events) {
      events.push(EventEnvelope.create({
        eventId: this.#idGenerator.next(EventId),
        eventType: emission.eventType,
        aggregateId: input.aggregate.aggregateId,
        aggregateType: input.aggregate.aggregateType,
        aggregateRevision: nextRevision,
        occurredAt,
        commandId: input.command.commandId,
        correlationId: input.command.correlationId,
        actor: input.command.actor,
        payload: emission.payload,
        causationId: input.command.causationId,
        ruleVersionRefs: emission.ruleVersionRefs ?? [],
        contractVersionRefs: emission.contractVersionRefs ?? [],
        provenanceRefs: emission.provenanceRefs ?? input.command.provenanceRefs,
        evidenceRefs: emission.evidenceRefs ?? input.command.evidenceRefs,
      }));
    }

    return Object.freeze({
      kind: 'ACCEPTED',
      commandId: input.command.commandId,
      aggregate: nextAggregate,
      events: Object.freeze(events),
    });
  }
}
