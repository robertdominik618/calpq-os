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
