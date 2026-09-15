import {
  ActorReference,
  CredentialArtifactId,
  EvidenceId,
  Jurisdiction,
  SubjectReference,
  UtcInstant,
  VersionId,
} from '../../../core/src/index.ts';

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function requiredText(value: string, label: string, max = 256): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > max) throw new RangeError(`${label} is too long`);
  return normalized;
}

export class VerificationRequestId {
  readonly #value: string;
  private constructor(value: string) {
    if (typeof value !== 'string' || !UUID_V7_PATTERN.test(value)) throw new TypeError('VerificationRequestId requires UUIDv7');
    this.#value = value.toLowerCase();
    Object.freeze(this);
  }
  static from(value: string): VerificationRequestId { return new VerificationRequestId(value); }
  toString(): string { return this.#value; }
}

export const VerificationTargetKind = {
  EVIDENCE: 'EVIDENCE',
  CREDENTIAL_ARTIFACT: 'CREDENTIAL_ARTIFACT',
} as const;
export type VerificationTargetKind = (typeof VerificationTargetKind)[keyof typeof VerificationTargetKind];

export class VerificationTargetReference {
  readonly kind: VerificationTargetKind;
  readonly id: EvidenceId | CredentialArtifactId;

  private constructor(kind: VerificationTargetKind, id: EvidenceId | CredentialArtifactId) {
    this.kind = kind;
    this.id = id;
    Object.freeze(this);
  }

  static evidence(id: EvidenceId): VerificationTargetReference {
    if (!(id instanceof EvidenceId)) throw new TypeError('Evidence target requires EvidenceId');
    return new VerificationTargetReference(VerificationTargetKind.EVIDENCE, id);
  }

  static credentialArtifact(id: CredentialArtifactId): VerificationTargetReference {
    if (!(id instanceof CredentialArtifactId)) throw new TypeError('Credential artifact target requires CredentialArtifactId');
    return new VerificationTargetReference(VerificationTargetKind.CREDENTIAL_ARTIFACT, id);
  }
}

export class VerificationClaim {
  readonly #value: string;
  private constructor(value: string) { this.#value = requiredText(value, 'Verification claim'); Object.freeze(this); }
  static from(value: string): VerificationClaim { return new VerificationClaim(value); }
  toString(): string { return this.#value; }
}

export class VerificationUseCaseReference {
  readonly #value: string;
  private constructor(value: string) { this.#value = requiredText(value, 'Verification use case'); Object.freeze(this); }
  static from(value: string): VerificationUseCaseReference { return new VerificationUseCaseReference(value); }
  toString(): string { return this.#value; }
}

export const AssuranceLevel = {
  BASIC: 'BASIC',
  STANDARD: 'STANDARD',
  HIGH: 'HIGH',
} as const;
export type AssuranceLevel = (typeof AssuranceLevel)[keyof typeof AssuranceLevel];
export const ASSURANCE_RANK: Readonly<Record<AssuranceLevel, number>> = Object.freeze({ BASIC: 1, STANDARD: 2, HIGH: 3 });

export const VerificationMethod = {
  REGISTRY_LOOKUP: 'REGISTRY_LOOKUP',
  ISSUER_CONFIRMATION: 'ISSUER_CONFIRMATION',
  CRYPTOGRAPHIC_CHECK: 'CRYPTOGRAPHIC_CHECK',
  MANUAL_AUTHORITY_REVIEW: 'MANUAL_AUTHORITY_REVIEW',
} as const;
export type VerificationMethod = (typeof VerificationMethod)[keyof typeof VerificationMethod];

export interface VerificationRequestInput {
  readonly id: VerificationRequestId;
  readonly target: VerificationTargetReference;
  readonly claims: readonly VerificationClaim[];
  readonly subject: SubjectReference;
  readonly jurisdiction: Jurisdiction;
  readonly useCase: VerificationUseCaseReference;
  readonly requiredAssurance: AssuranceLevel;
  readonly acceptableMethods: readonly VerificationMethod[];
  readonly evaluationInstant: UtcInstant;
}

export class VerificationRequest {
  readonly id: VerificationRequestId;
  readonly target: VerificationTargetReference;
  readonly claims: readonly VerificationClaim[];
  readonly subject: SubjectReference;
  readonly jurisdiction: Jurisdiction;
  readonly useCase: VerificationUseCaseReference;
  readonly requiredAssurance: AssuranceLevel;
  readonly acceptableMethods: readonly VerificationMethod[];
  readonly evaluationInstant: UtcInstant;

  private constructor(input: VerificationRequestInput) {
    this.id = input.id;
    this.target = input.target;
    this.claims = Object.freeze([...input.claims]);
    this.subject = input.subject;
    this.jurisdiction = input.jurisdiction;
    this.useCase = input.useCase;
    this.requiredAssurance = input.requiredAssurance;
    this.acceptableMethods = Object.freeze([...input.acceptableMethods]);
    this.evaluationInstant = input.evaluationInstant;
    Object.freeze(this);
  }

  static create(input: VerificationRequestInput): VerificationRequest {
    if (!(input.id instanceof VerificationRequestId)) throw new TypeError('Verification request requires request id');
    if (!(input.target instanceof VerificationTargetReference)) throw new TypeError('Verification request requires target');
    if (!Array.isArray(input.claims) || input.claims.length === 0 || input.claims.some((claim) => !(claim instanceof VerificationClaim))) {
      throw new TypeError('Verification request requires explicit claims');
    }
    const claimTexts = input.claims.map((claim) => claim.toString());
    if (new Set(claimTexts).size !== claimTexts.length) throw new TypeError('Verification claims must be unique');
    if (!(input.subject instanceof SubjectReference)) throw new TypeError('Verification request requires SubjectReference');
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Verification request requires controlled Jurisdiction');
    if (!(input.useCase instanceof VerificationUseCaseReference)) throw new TypeError('Verification request requires use-case reference');
    if (!(input.requiredAssurance in ASSURANCE_RANK)) throw new TypeError('Verification assurance must be controlled');
    if (!Array.isArray(input.acceptableMethods) || input.acceptableMethods.length === 0) throw new TypeError('Verification request requires acceptable methods');
    const methodValues = new Set(Object.values(VerificationMethod));
    if (input.acceptableMethods.some((method) => !methodValues.has(method))) throw new TypeError('Verification method must be controlled');
    if (!(input.evaluationInstant instanceof UtcInstant)) throw new TypeError('Verification request requires evaluation instant');
    return new VerificationRequest(input);
  }
}

export class VerificationAdapterCapability {
  readonly adapterId: string;
  readonly methods: readonly VerificationMethod[];
  readonly maxAssurance: AssuranceLevel;

  private constructor(adapterId: string, methods: readonly VerificationMethod[], maxAssurance: AssuranceLevel) {
    this.adapterId = requiredText(adapterId, 'Verification adapter id');
    this.methods = Object.freeze([...methods]);
    this.maxAssurance = maxAssurance;
    Object.freeze(this);
  }

  static create(input: { readonly adapterId: string; readonly methods: readonly VerificationMethod[]; readonly maxAssurance: AssuranceLevel }): VerificationAdapterCapability {
    if (!Array.isArray(input.methods) || input.methods.length === 0) throw new TypeError('Adapter capability requires methods');
    const allowed = new Set(Object.values(VerificationMethod));
    if (input.methods.some((method) => !allowed.has(method))) throw new TypeError('Adapter method must be controlled');
    if (!(input.maxAssurance in ASSURANCE_RANK)) throw new TypeError('Adapter assurance must be controlled');
    return new VerificationAdapterCapability(input.adapterId, input.methods, input.maxAssurance);
  }
}

export const TechnicalCheckStatus = {
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  INDETERMINATE: 'INDETERMINATE',
} as const;
export type TechnicalCheckStatus = (typeof TechnicalCheckStatus)[keyof typeof TechnicalCheckStatus];

export interface CheckedClaimObservation {
  readonly claim: VerificationClaim;
  readonly status: TechnicalCheckStatus;
  readonly routeReference: string;
}

export class TechnicalVerificationResult {
  readonly adapterId: string;
  readonly verifier: ActorReference | null;
  readonly method: VerificationMethod;
  readonly sourceVersion: VersionId | null;
  readonly observations: readonly CheckedClaimObservation[];
  readonly outage: boolean;

  private constructor(input: {
    readonly adapterId: string;
    readonly verifier?: ActorReference | null;
    readonly method: VerificationMethod;
    readonly sourceVersion?: VersionId | null;
    readonly observations: readonly CheckedClaimObservation[];
    readonly outage?: boolean;
  }) {
    this.adapterId = requiredText(input.adapterId, 'Verification adapter id');
    this.verifier = input.verifier ?? null;
    this.method = input.method;
    this.sourceVersion = input.sourceVersion ?? null;
    this.observations = Object.freeze(input.observations.map((observation) => Object.freeze({
      claim: observation.claim,
      status: observation.status,
      routeReference: requiredText(observation.routeReference, 'Route reference'),
    })));
    this.outage = input.outage ?? false;
    Object.freeze(this);
  }

  static create(input: {
    readonly adapterId: string;
    readonly verifier?: ActorReference | null;
    readonly method: VerificationMethod;
    readonly sourceVersion?: VersionId | null;
    readonly observations: readonly CheckedClaimObservation[];
    readonly outage?: boolean;
  }): TechnicalVerificationResult {
    if (!Object.values(VerificationMethod).includes(input.method)) throw new TypeError('Technical verification method must be controlled');
    if (input.verifier != null && !(input.verifier instanceof ActorReference)) throw new TypeError('Verifier identity requires ActorReference');
    if (input.sourceVersion != null && !(input.sourceVersion instanceof VersionId)) throw new TypeError('Source version requires VersionId');
    const statuses = new Set(Object.values(TechnicalCheckStatus));
    for (const observation of input.observations) {
      if (!(observation.claim instanceof VerificationClaim)) throw new TypeError('Checked claim requires VerificationClaim');
      if (!statuses.has(observation.status)) throw new TypeError('Technical claim status must be controlled');
    }
    if (input.outage === true && input.observations.some((observation) => observation.status === TechnicalCheckStatus.FAILED)) {
      throw new TypeError('Provider outage must not be encoded as claim failure');
    }
    return new TechnicalVerificationResult(input);
  }
}

export const AuthorityStatus = {
  SUFFICIENT: 'SUFFICIENT',
  INSUFFICIENT: 'INSUFFICIENT',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type AuthorityStatus = (typeof AuthorityStatus)[keyof typeof AuthorityStatus];

export interface AuthorityResolution {
  readonly status: AuthorityStatus;
  readonly reasonCode: string;
}

export const VerificationRecordState = {
  VERIFIED: 'VERIFIED',
  PARTIAL: 'PARTIAL',
  NOT_VERIFIED: 'NOT_VERIFIED',
  INDETERMINATE: 'INDETERMINATE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type VerificationRecordState = (typeof VerificationRecordState)[keyof typeof VerificationRecordState];

export class VerificationRecord {
  readonly requestId: VerificationRequestId;
  readonly adapterId: string | null;
  readonly verifier: ActorReference | null;
  readonly method: VerificationMethod | null;
  readonly sourceVersion: VersionId | null;
  readonly checkedClaims: readonly VerificationClaim[];
  readonly verifiedClaims: readonly VerificationClaim[];
  readonly notVerifiedClaims: readonly VerificationClaim[];
  readonly indeterminateClaims: readonly VerificationClaim[];
  readonly reviewClaims: readonly VerificationClaim[];
  readonly state: VerificationRecordState;
  readonly reasonCodes: readonly string[];

  constructor(input: {
    readonly requestId: VerificationRequestId;
    readonly adapterId?: string | null;
    readonly verifier?: ActorReference | null;
    readonly method?: VerificationMethod | null;
    readonly sourceVersion?: VersionId | null;
    readonly checkedClaims?: readonly VerificationClaim[];
    readonly verifiedClaims?: readonly VerificationClaim[];
    readonly notVerifiedClaims?: readonly VerificationClaim[];
    readonly indeterminateClaims?: readonly VerificationClaim[];
    readonly reviewClaims?: readonly VerificationClaim[];
    readonly state: VerificationRecordState;
    readonly reasonCodes?: readonly string[];
  }) {
    this.requestId = input.requestId;
    this.adapterId = input.adapterId ?? null;
    this.verifier = input.verifier ?? null;
    this.method = input.method ?? null;
    this.sourceVersion = input.sourceVersion ?? null;
    this.checkedClaims = Object.freeze([...(input.checkedClaims ?? [])]);
    this.verifiedClaims = Object.freeze([...(input.verifiedClaims ?? [])]);
    this.notVerifiedClaims = Object.freeze([...(input.notVerifiedClaims ?? [])]);
    this.indeterminateClaims = Object.freeze([...(input.indeterminateClaims ?? [])]);
    this.reviewClaims = Object.freeze([...(input.reviewClaims ?? [])]);
    this.state = input.state;
    this.reasonCodes = Object.freeze([...(input.reasonCodes ?? [])].map((reason) => requiredText(reason, 'Verification reason code')));
    Object.freeze(this);
  }
}
