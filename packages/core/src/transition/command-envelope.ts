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
import { CommandType } from './contract-names.ts';
import { freezePayload } from './envelope-utils.ts';
import type { EnvelopePayload } from './envelope-utils.ts';

export type CausationReference = CommandId | EventId;
export type ProvenanceReference = DecisionId | EventId;

export interface CommandEnvelopeInput<TPayload extends EnvelopePayload> {
  readonly commandId: CommandId;
  readonly commandType: CommandType;
  readonly aggregateId: AggregateId;
  readonly expectedRevision: Revision;
  readonly issuedAt: UtcInstant;
  readonly actor: ActorReference;
  readonly correlationId: CorrelationId;
  readonly payload: TPayload;
  readonly causationId?: CausationReference | null;
  readonly evidenceRefs?: readonly EvidenceId[];
  readonly provenanceRefs?: readonly ProvenanceReference[];
}

export class CommandEnvelope<TPayload extends EnvelopePayload> {
  readonly commandId: CommandId;
  readonly commandType: CommandType;
  readonly aggregateId: AggregateId;
  readonly expectedRevision: Revision;
  readonly issuedAt: UtcInstant;
  readonly actor: ActorReference;
  readonly correlationId: CorrelationId;
  readonly payload: TPayload;
  readonly causationId: CausationReference | null;
  readonly evidenceRefs: readonly EvidenceId[];
  readonly provenanceRefs: readonly ProvenanceReference[];

  private constructor(input: CommandEnvelopeInput<TPayload>) {
    this.commandId = input.commandId;
    this.commandType = input.commandType;
    this.aggregateId = input.aggregateId;
    this.expectedRevision = input.expectedRevision;
    this.issuedAt = input.issuedAt;
    this.actor = input.actor;
    this.correlationId = input.correlationId;
    this.payload = freezePayload(input.payload);
    this.causationId = input.causationId ?? null;
    this.evidenceRefs = Object.freeze([...(input.evidenceRefs ?? [])]);
    this.provenanceRefs = Object.freeze([...(input.provenanceRefs ?? [])]);
    Object.freeze(this);
  }

  static create<TPayload extends EnvelopePayload>(input: CommandEnvelopeInput<TPayload>): CommandEnvelope<TPayload> {
    if (!(input.commandId instanceof CommandId)) throw new TypeError('Command envelope requires CommandId');
    if (!(input.commandType instanceof CommandType)) throw new TypeError('Command envelope requires CommandType');
    if (!(input.aggregateId instanceof AggregateId)) throw new TypeError('Command envelope requires AggregateId');
    if (!(input.expectedRevision instanceof Revision)) throw new TypeError('Command envelope requires expected Revision');
    if (!(input.issuedAt instanceof UtcInstant)) throw new TypeError('Command envelope requires issued-at UtcInstant');
    if (!(input.actor instanceof ActorReference)) throw new TypeError('Command envelope requires ActorReference');
    if (!(input.correlationId instanceof CorrelationId)) throw new TypeError('Command envelope requires CorrelationId');
    if (input.causationId !== undefined && input.causationId !== null && !(input.causationId instanceof CommandId) && !(input.causationId instanceof EventId)) {
      throw new TypeError('Command causation must reference a CommandId or EventId');
    }
    for (const evidenceId of input.evidenceRefs ?? []) {
      if (!(evidenceId instanceof EvidenceId)) throw new TypeError('Command evidence references must use EvidenceId');
    }
    for (const provenanceId of input.provenanceRefs ?? []) {
      if (!(provenanceId instanceof DecisionId) && !(provenanceId instanceof EventId)) {
        throw new TypeError('Command provenance references must use DecisionId or EventId');
      }
    }
    return new CommandEnvelope(input);
  }
}
