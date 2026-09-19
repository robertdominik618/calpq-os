export {
  DocumentIntakeId,
  DocumentIntakeRecord,
  IntakeCorrectionRecord,
  IntakeMediaMetadata,
  IntakeProcessingState,
  IntakeSecurityClassification,
  IntakeSourceChannel,
} from './document-intake.ts';
export type { DocumentIntakeRecordInput } from './document-intake.ts';

export {
  ExternalIntakeSourceKind,
  IntakeChannelProvenance,
  IntakeTransportChannel,
  MultiChannelIntakeSubmission,
  normalizeProviderIntakeProvenance,
} from './multi-channel-intake.ts';
export type {
  IntakeProviderAdapterPort,
  MultiChannelIntakeSubmissionInput,
  ProviderIntakeProvenanceObservation,
} from './multi-channel-intake.ts';
