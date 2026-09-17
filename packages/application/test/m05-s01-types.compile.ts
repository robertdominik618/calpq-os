import {
  ExternalIntakeSourceKind,
  IntakeChannelProvenance,
  IntakeTransportChannel,
  MultiChannelIntakeSubmission,
  normalizeProviderIntakeProvenance,
} from '../src/intake/multi-channel-intake.ts';
import type {
  IntakeProviderAdapterPort,
  MultiChannelIntakeSubmissionInput,
  ProviderIntakeProvenanceObservation,
} from '../src/intake/multi-channel-intake.ts';

declare const submission: MultiChannelIntakeSubmission;
declare const provenance: IntakeChannelProvenance;
declare const input: MultiChannelIntakeSubmissionInput;

const channel: IntakeTransportChannel = IntakeTransportChannel.PROVIDER_ADAPTER;
const sourceKind: ExternalIntakeSourceKind = ExternalIntakeSourceKind.REGISTRY;
void channel;
void sourceKind;
void normalizeProviderIntakeProvenance;

const providerObservation: ProviderIntakeProvenanceObservation = {
  sourceKind: ExternalIntakeSourceKind.PROVIDER,
  externalRecordReference: 'record:compile-proof',
};
void providerObservation;

const providerPort: IntakeProviderAdapterPort<{ readonly id: string }> = {
  adapterReference: 'adapter:compile-proof',
  normalizeProvenance: (_payload) => ({
    sourceKind: ExternalIntakeSourceKind.PROVIDER,
    externalRecordReference: 'record:compile-proof',
  }),
};
void providerPort;

// @ts-expect-error submission record is readonly
submission.record = submission.record;
// @ts-expect-error submission provenance is readonly
submission.provenance = provenance;
// @ts-expect-error provenance transport channel is readonly
provenance.transportChannel = IntakeTransportChannel.CAMERA;
// @ts-expect-error provenance capture reference is readonly
provenance.captureReference = 'capture:mutated';
// @ts-expect-error input is readonly
input.provenance = provenance;
// @ts-expect-error uncontrolled transport channel is forbidden
const badChannel: IntakeTransportChannel = 'TRUSTED_PROVIDER';
// @ts-expect-error uncontrolled external source kind is forbidden
const badSourceKind: ExternalIntakeSourceKind = 'AUTHORITATIVE_REGISTRY';
void badChannel;
void badSourceKind;
