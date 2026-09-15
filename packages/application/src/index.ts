export {
  AccessDecisionReference,
  ApplicationOperationReference,
  OrganizationScopeReference,
  PurposeReference,
  TenantScopeReference,
} from './references.ts';
export { ApplicationExecutionContext } from './application-execution-context.ts';
export type { ApplicationExecutionContextInput } from './application-execution-context.ts';
export { ApplicationEntrypoint, invokeUseCase } from './use-case-handler.ts';
export type { UseCaseHandler, UseCaseInvocation } from './use-case-handler.ts';
export type { ClockPort, IdGeneratorPort } from './ports.ts';
export type { TenantScopedRepository, VersionedAggregate } from './persistence/repository.ts';
export {
  AuditReference,
  OptimisticConcurrencyConflict,
  OutboxRecord,
  UnitOfWorkCommitStatus,
} from './persistence/unit-of-work.ts';
export type {
  AcceptedMutation,
  UnitOfWorkCommitResult,
  UnitOfWorkPort,
} from './persistence/unit-of-work.ts';
export { executeAcceptedMutation } from './persistence/mutation-orchestrator.ts';
export type { AcceptedMutationExecution } from './persistence/mutation-orchestrator.ts';
export {
  DocumentIntakeId,
  DocumentIntakeRecord,
  IntakeCorrectionRecord,
  IntakeMediaMetadata,
  IntakeProcessingState,
  IntakeSecurityClassification,
  IntakeSourceChannel,
} from './intake/document-intake.ts';
export type { DocumentIntakeRecordInput } from './intake/document-intake.ts';
export {
  AssuranceLevel,
  AuthorityStatus,
  TechnicalCheckStatus,
  VerificationAdapterCapability,
  VerificationClaim,
  VerificationMethod,
  VerificationRecord,
  VerificationRecordState,
  VerificationRequest,
  VerificationRequestId,
  VerificationTargetKind,
  VerificationTargetReference,
  VerificationUseCaseReference,
} from './verification/verification-model.ts';
export type {
  AuthorityResolution,
  CheckedClaimObservation,
  VerificationRequestInput,
} from './verification/verification-model.ts';
export type {
  AuthorityResolutionInput,
  AuthorityResolverPort,
  VerificationProviderPort,
} from './verification/verification-ports.ts';
export { orchestrateVerification } from './verification/verification-orchestrator.ts';
export {
  PassportAuthorityClass,
  PassportEvidenceVerificationLink,
  PassportItemOrigin,
  ProfessionalPassportItem,
  ProfessionalPassportProjection,
} from './passport/professional-passport.ts';
export { summarizePassportAuthorityClasses } from './passport/passport-read-metrics.ts';
export type { PassportReadMetrics } from './passport/passport-read-metrics.ts';
export {
  CredentialGroupReadModel,
  CredentialProjectionSummaryReadModel,
  PassportSummarySourceKind,
  ProfessionalPassportSummaryReadModel,
} from './passport/professional-passport-summary.ts';
export type { EligibilityOutcomeCounts } from './passport/professional-passport-summary.ts';
export {
  CredentialCardDocumentBinding,
  CredentialCardDocumentFacet,
  CredentialCardDocumentSourceKind,
  CredentialCardEligibilityFacet,
  CredentialCardEligibilitySourceKind,
  CredentialCardFacetAvailability,
  CredentialCardFacetKind,
  CredentialCardLifecycleFacet,
  CredentialCardLifecycleSourceKind,
  CredentialCardReadModel,
  CredentialCardUnavailableReason,
  CredentialCardVerificationFacet,
  CredentialCardVerificationSourceKind,
} from './credential-card/credential-card-read-model.ts';
export type {
  CredentialCardEvidenceVerificationCounts,
  CredentialCardRecordVerificationCounts,
} from './credential-card/credential-card-read-model.ts';
export {
  CredentialEvidenceExplanation,
  CredentialExplanationAffordance,
  CredentialExplanationAvailability,
  CredentialExplanationReadModel,
  CredentialExplanationReason,
  CredentialFacetExplanation,
  CredentialRequirementReasonExplanation,
  CredentialSourceExplanation,
  CredentialVerificationItemExplanation,
} from './explanation/credential-explanation-read-model.ts';
export type {
  CredentialFacetExplanationInput,
} from './explanation/credential-explanation-read-model.ts';
export {
  ActivityTimelineActorAttribution,
  ActivityTimelineActorRole,
  ActivityTimelineEvent,
  ActivityTimelineEventKind,
  ActivityTimelineOmission,
  ActivityTimelineOmissionReason,
  ActivityTimelineOrdering,
  ActivityTimelineReadModel,
  ActivityTimelineReference,
  ActivityTimelineReferenceKind,
  ActivityTimelineSourceKind,
  DecisionProvenancePresentation,
} from './timeline/activity-timeline-read-model.ts';
export type {
  ActivityTimelineEventInput,
  ActivityTimelineReadModelInput,
} from './timeline/activity-timeline-read-model.ts';
export {
  DashboardDestination,
  DashboardReadModel,
  DashboardSourceKind,
} from './dashboard/dashboard-read-model.ts';
export type { DashboardNavigationItem } from './dashboard/dashboard-read-model.ts';
export {
  AccessDisposition,
  SystemTenantContext,
  TenantAccessDecision,
  TenantAccessDeniedError,
  TenantAsyncEnvelope,
  TenantAuditEvidence,
  TenantBoundary,
  TenantContext,
  TenantResourceAddress,
  TenantResourceSurface,
  executeSensitiveRead,
} from './tenant/tenant-governance.ts';
export {
  ApplicationTransportError,
  ApplicationTransportErrorKind,
  ApplicationTransportResponseKind,
} from './transport/transport-contract.ts';
export type {
  ApplicationTransportHandler,
  ApplicationTransportInvocation,
  ApplicationTransportPagination,
  ApplicationTransportSuccess,
} from './transport/transport-contract.ts';
export {
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
} from './runtime/operational-resilience.ts';
export type {
  AsyncDeliveryIdentity,
  ReconciliationResult,
  RecoveryValidation,
  RetryDecision,
} from './runtime/operational-resilience.ts';
