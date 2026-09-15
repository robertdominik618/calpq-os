import type {
  AuthorityResolution,
  TechnicalVerificationResult,
  VerificationAdapterCapability,
  VerificationClaim,
  VerificationMethod,
  VerificationRequest,
} from './verification-model.ts';
import type { ActorReference, Jurisdiction, UtcInstant } from '../../../core/src/index.ts';
import type { VerificationUseCaseReference } from './verification-model.ts';

export interface VerificationProviderPort {
  readonly capability: VerificationAdapterCapability;
  verify(request: VerificationRequest, method: VerificationMethod): Promise<TechnicalVerificationResult>;
}

export interface AuthorityResolutionInput {
  readonly verifier: ActorReference;
  readonly claim: VerificationClaim;
  readonly jurisdiction: Jurisdiction;
  readonly useCase: VerificationUseCaseReference;
  readonly evaluationInstant: UtcInstant;
}

export interface AuthorityResolverPort {
  resolve(input: AuthorityResolutionInput): Promise<AuthorityResolution>;
}
