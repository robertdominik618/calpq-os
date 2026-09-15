import {
  AggregateId,
  CommandId,
  CorrelationId,
  DecisionId,
  EventId,
  EvidenceId,
} from '../ids.ts';
import { ActorReference } from '../party-references.ts';
import { Revision } from '../revision.ts';
import { UtcInstant } from '../time.ts';
import { VersionId } from '../version.ts';
import { AggregateType, EventType } from './contract-names.ts';
import { freezePayload } from './envelope-utils.ts';
import type { EnvelopePayload } from './envelope-utils.ts';
import type { CausationReference, ProvenanceReference } from './command-envelope.ts';

export interface EventEnvelopeInput<TPayload extends EnvelopePayload> {
  readonly eventId: EventId;
  readonly eventType: EventType;
  readonly aggregateId: AggregateId;
  readonly aggregateType: AggregateType;
  readonly aggregateRevision: Revision;
  readonly occurredAt: UtcInstant;
  readonly commandId: CommandId;
  readonly correlationId: CorrelationId;
  readonly actor: ActorReference;
  readonly payload: TPayload;
  readonly causationId?: CausationReference | null;
  readonly ruleVersionRefs?: readonly VersionId[];
  readonly contractVersionRefs?: readonly VersionId[];
  readonly provenanceRefs?: readonly ProvenanceReference[];
  readonly evidenceRefs?: readonly EvidenceId[];
}

export class EventEnvelope<TPayload extends EnvelopePayload> {
  readonly eventId: EventId;
  readonly eventType: EventType;
  readonly aggregateId: AggregateId;
  readonly aggregateType: AggregateType;
  readonly aggregateRevision: Revision;
  readonly occurredAt: UtcInstant;
  readonly commandId: CommandId;
  readonly correlationId: CorrelationId;
  readonly actor: ActorReference;
  readonly payload: TPayload;
  readonly causationId: CausationReference | null;
  readonly ruleVersionRefs: readonly VersionId[];
  readonly contractVersionRefs: readonly VersionId[];
  readonly provenanceRefs: readonly ProvenanceReference[];
  readonly evidenceRefs: readonly EvidenceId[];

  private constructor(input: EventEnvelopeInput<TPayload>) {
    this.eventId = input.eventId;
    this.eventType = input.eventType;
    this.aggregateId = input.aggregateId;
    this.aggregateType = input.aggregateType;
    this.aggregateRevision = input.aggregateRevision;
    this.occurredAt = input.occurredAt;
    this.commandId = input.commandId;
    this.correlationId = input.correlationId;
    this.actor = input.actor;
    this.payload = freezePayload(input.payload);
    this.causationId = input.causationId ?? null;
    this.ruleVersionRefs = Object.freeze([...(input.ruleVersionRefs ?? [])]);
    this.contractVersionRefs = Object.freeze([...(input.contractVersionRefs ?? [])]);
    this.provenanceRefs = Object.freeze([...(input.provenanceRefs ?? [])]);
    this.evidenceRefs = Object.freeze([...(input.evidenceRefs ?? [])]);
    Object.freeze(this);
  }

  static create<TPayload extends EnvelopePayload>(input: EventEnvelopeInput<TPayload>): EventEnvelope<TPayload> {
    if (!(input.eventId instanceof EventId)) throw new TypeError('Event envelope requires EventId');
    if (!(input.eventType instanceof EventType)) throw new TypeError('Event envelope requires EventType');
    if (!(input.aggregateId instanceof AggregateId)) throw new TypeError('Event envelope requires AggregateId');
    if (!(input.aggregateType instanceof AggregateType)) throw new TypeError('Event envelope requires AggregateType');
    if (!(input.aggregateRevision instanceof Revision)) throw new TypeError('Event envelope requires aggregate Revision');
    if (!(input.occurredAt instanceof UtcInstant)) throw new TypeError('Event envelope requires occurred-at UtcInstant');
    if (!(input.commandId instanceof CommandId)) throw new TypeError('Event envelope requires CommandId');
    if (!(input.correlationId instanceof CorrelationId)) throw new TypeError('Event envelope requires CorrelationId');
    if (!(input.actor instanceof ActorReference)) throw new TypeError('Event envelope requires ActorReference');
    if (input.causationId !== undefined && input.causationId !== null && !(input.causationId instanceof CommandId) && !(input.causationId instanceof EventId)) {
      throw new TypeError('Event causation must reference a CommandId or EventId');
    }
    for (const ref of [...(input.ruleVersionRefs ?? []), ...(input.contractVersionRefs ?? [])]) {
      if (!(ref instanceof VersionId)) throw new TypeError('Event version references must use VersionId');
    }
    for (const ref of input.provenanceRefs ?? []) {
      if (!(ref instanceof DecisionId) && !(ref instanceof EventId)) throw new TypeError('Event provenance references must use DecisionId or EventId');
    }
    for (const ref of input.evidenceRefs ?? []) {
      if (!(ref instanceof EvidenceId)) throw new TypeError('Event evidence references must use EvidenceId');
    }
    return new EventEnvelope(input);
  }
}
