import { AggregateId } from '../ids.ts';
import { Revision } from '../revision.ts';
import { ProvenanceEnvelope } from '../provenance/provenance-envelope.ts';
import { AggregateType } from './contract-names.ts';
import { freezePayload } from './envelope-utils.ts';
import type { EnvelopePayload } from './envelope-utils.ts';

export interface AggregateSnapshotInput<TState extends EnvelopePayload> {
  readonly aggregateId: AggregateId;
  readonly aggregateType: AggregateType;
  readonly revision: Revision;
  readonly creationProvenance: ProvenanceEnvelope;
  readonly state: TState;
}

export class AggregateSnapshot<TState extends EnvelopePayload> {
  readonly aggregateId: AggregateId;
  readonly aggregateType: AggregateType;
  readonly revision: Revision;
  readonly creationProvenance: ProvenanceEnvelope;
  readonly state: TState;

  private constructor(input: AggregateSnapshotInput<TState>) {
    this.aggregateId = input.aggregateId;
    this.aggregateType = input.aggregateType;
    this.revision = input.revision;
    this.creationProvenance = input.creationProvenance;
    this.state = freezePayload(input.state);
    Object.freeze(this);
  }

  static create<TState extends EnvelopePayload>(input: AggregateSnapshotInput<TState>): AggregateSnapshot<TState> {
    if (!(input.aggregateId instanceof AggregateId)) throw new TypeError('Aggregate snapshot requires AggregateId');
    if (!(input.aggregateType instanceof AggregateType)) throw new TypeError('Aggregate snapshot requires AggregateType');
    if (!(input.revision instanceof Revision)) throw new TypeError('Aggregate snapshot requires Revision');
    if (!(input.creationProvenance instanceof ProvenanceEnvelope)) throw new TypeError('Aggregate snapshot requires creation ProvenanceEnvelope');
    return new AggregateSnapshot(input);
  }

  static revise<TState extends EnvelopePayload>(
    current: AggregateSnapshot<TState>,
    revision: Revision,
    state: TState,
  ): AggregateSnapshot<TState> {
    if (!(current instanceof AggregateSnapshot)) throw new TypeError('Aggregate revision requires AggregateSnapshot');
    if (!(revision instanceof Revision)) throw new TypeError('Aggregate revision requires Revision');
    return new AggregateSnapshot({
      aggregateId: current.aggregateId,
      aggregateType: current.aggregateType,
      revision,
      creationProvenance: current.creationProvenance,
      state,
    });
  }
}
