import {
  CredentialArtifact,
  DomainOutcome,
  SubjectReference,
  UtcInstant,
  VerificationStateCode,
  type VerificationStateCode as VerificationStateCodeType,
} from '../../../core/src/index.ts';
import {
  ProfessionalPassportProjection,
} from '../passport/professional-passport.ts';
import {
  VerificationRecordState,
  type VerificationRecordState as VerificationRecordStateType,
} from '../verification/verification-model.ts';

export const CredentialCardFacetKind = {
  DOCUMENT: 'DOCUMENT',
  VERIFICATION: 'VERIFICATION',
  ELIGIBILITY: 'ELIGIBILITY',
  LIFECYCLE: 'LIFECYCLE',
} as const;
export type CredentialCardFacetKind = (typeof CredentialCardFacetKind)[keyof typeof CredentialCardFacetKind];

export const CredentialCardFacetAvailability = {
  AVAILABLE: 'AVAILABLE',
  SOURCE_NOT_AVAILABLE: 'SOURCE_NOT_AVAILABLE',
} as const;
export type CredentialCardFacetAvailability = (typeof CredentialCardFacetAvailability)[keyof typeof CredentialCardFacetAvailability];

export const CredentialCardDocumentSourceKind = {
  CREDENTIAL_ARTIFACT: 'CREDENTIAL_ARTIFACT',
  NONE: 'NONE',
} as const;
export type CredentialCardDocumentSourceKind = (typeof CredentialCardDocumentSourceKind)[keyof typeof CredentialCardDocumentSourceKind];

export const CredentialCardVerificationSourceKind = {
  PROFESSIONAL_PASSPORT_PROJECTION: 'PROFESSIONAL_PASSPORT_PROJECTION',
} as const;

export const CredentialCardEligibilitySourceKind = {
  ELIGIBILITY_ASSESSMENT_PROJECTION: 'ELIGIBILITY_ASSESSMENT_PROJECTION',
} as const;

export const CredentialCardLifecycleSourceKind = {
  NONE: 'NONE',
} as const;

export const CredentialCardUnavailableReason = {
  DOCUMENT_SOURCE_NOT_AVAILABLE: 'DOCUMENT_SOURCE_NOT_AVAILABLE',
  LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03: 'LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03',
} as const;
export type CredentialCardUnavailableReason = (typeof CredentialCardUnavailableReason)[keyof typeof CredentialCardUnavailableReason];

const FACET_ORDER = Object.freeze([
  CredentialCardFacetKind.DOCUMENT,
  CredentialCardFacetKind.VERIFICATION,
  CredentialCardFacetKind.ELIGIBILITY,
  CredentialCardFacetKind.LIFECYCLE,
] as const);

const EVIDENCE_VERIFICATION_STATES = Object.freeze(Object.values(VerificationStateCode) as VerificationStateCodeType[]);
const RECORD_VERIFICATION_STATES = Object.freeze(Object.values(VerificationRecordState) as VerificationRecordStateType[]);

function requiredText(value: string, label: string, max = 512): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > max) throw new RangeError(`${label} is too long`);
  return normalized;
}

function subjectKey(subject: SubjectReference): string {
  return `${subject.kind}:${subject.id.toString()}`;
}

function emptyEvidenceStateCounts(): Record<VerificationStateCodeType, number> {
  return {
    [VerificationStateCode.UNVERIFIED]: 0,
    [VerificationStateCode.VERIFIED]: 0,
    [VerificationStateCode.FAILED]: 0,
    [VerificationStateCode.STALE]: 0,
    [VerificationStateCode.REVIEW_REQUIRED]: 0,
    [VerificationStateCode.NOT_APPLICABLE]: 0,
  };
}

function emptyRecordStateCounts(): Record<VerificationRecordStateType, number> {
  return {
    [VerificationRecordState.VERIFIED]: 0,
    [VerificationRecordState.PARTIAL]: 0,
    [VerificationRecordState.NOT_VERIFIED]: 0,
    [VerificationRecordState.INDETERMINATE]: 0,
    [VerificationRecordState.REVIEW_REQUIRED]: 0,
  };
}

export class CredentialCardDocumentBinding {
  readonly credentialDefinitionId: string;
  readonly artifact: CredentialArtifact;
  readonly bindingReference: string;
  readonly associationAuthority = false as const;

  private constructor(credentialDefinitionId: string, artifact: CredentialArtifact, bindingReference: string) {
    this.credentialDefinitionId = credentialDefinitionId;
    this.artifact = artifact;
    this.bindingReference = bindingReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly credentialDefinitionId: string;
    readonly artifact: CredentialArtifact;
    readonly bindingReference: string;
  }): CredentialCardDocumentBinding {
    const credentialDefinitionId = requiredText(input.credentialDefinitionId, 'Document binding credentialDefinitionId');
    if (!(input.artifact instanceof CredentialArtifact)) {
      throw new TypeError('Document binding requires CredentialArtifact');
    }
    const bindingReference = requiredText(input.bindingReference, 'Document binding reference');
    return new CredentialCardDocumentBinding(credentialDefinitionId, input.artifact, bindingReference);
  }
}

export class CredentialCardDocumentFacet {
  readonly facetKind = CredentialCardFacetKind.DOCUMENT;
  readonly availability: CredentialCardFacetAvailability;
  readonly sourceKind: CredentialCardDocumentSourceKind;
  readonly reasonCode: CredentialCardUnavailableReason | null;
  readonly artifactId: string | null;
  readonly artifactKind: string | null;
  readonly artifactFormat: string | null;
  readonly issuedOn: string | null;
  readonly effectiveFrom: string | null;
  readonly expiresOn: string | null;
  readonly bindingReference: string | null;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly availability: CredentialCardFacetAvailability;
    readonly sourceKind: CredentialCardDocumentSourceKind;
    readonly reasonCode: CredentialCardUnavailableReason | null;
    readonly artifactId: string | null;
    readonly artifactKind: string | null;
    readonly artifactFormat: string | null;
    readonly issuedOn: string | null;
    readonly effectiveFrom: string | null;
    readonly expiresOn: string | null;
    readonly bindingReference: string | null;
  }) {
    this.availability = input.availability;
    this.sourceKind = input.sourceKind;
    this.reasonCode = input.reasonCode;
    this.artifactId = input.artifactId;
    this.artifactKind = input.artifactKind;
    this.artifactFormat = input.artifactFormat;
    this.issuedOn = input.issuedOn;
    this.effectiveFrom = input.effectiveFrom;
    this.expiresOn = input.expiresOn;
    this.bindingReference = input.bindingReference;
    Object.freeze(this);
  }

  static sourceUnavailable(): CredentialCardDocumentFacet {
    return new CredentialCardDocumentFacet({
      availability: CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE,
      sourceKind: CredentialCardDocumentSourceKind.NONE,
      reasonCode: CredentialCardUnavailableReason.DOCUMENT_SOURCE_NOT_AVAILABLE,
      artifactId: null,
      artifactKind: null,
      artifactFormat: null,
      issuedOn: null,
      effectiveFrom: null,
      expiresOn: null,
      bindingReference: null,
    });
  }

  static fromBinding(
    binding: CredentialCardDocumentBinding,
    expectedCredentialDefinitionId: string,
    expectedSubject: SubjectReference,
  ): CredentialCardDocumentFacet {
    if (!(binding instanceof CredentialCardDocumentBinding)) {
      throw new TypeError('Credential Card document facet requires CredentialCardDocumentBinding');
    }
    if (binding.credentialDefinitionId !== expectedCredentialDefinitionId) {
      throw new TypeError('Credential Card document binding targets a different credential definition');
    }
    if (binding.artifact.subject === null) {
      throw new TypeError('Credential Card document artifact must have an explicit subject');
    }
    if (subjectKey(binding.artifact.subject) !== subjectKey(expectedSubject)) {
      throw new TypeError('Credential Card document artifact belongs to a different subject');
    }

    return new CredentialCardDocumentFacet({
      availability: CredentialCardFacetAvailability.AVAILABLE,
      sourceKind: CredentialCardDocumentSourceKind.CREDENTIAL_ARTIFACT,
      reasonCode: null,
      artifactId: binding.artifact.id.toString(),
      artifactKind: binding.artifact.kind,
      artifactFormat: binding.artifact.format,
      issuedOn: binding.artifact.issuedOn?.toString() ?? null,
      effectiveFrom: binding.artifact.effectiveFrom?.toString() ?? null,
      expiresOn: binding.artifact.expiresOn?.toString() ?? null,
      bindingReference: binding.bindingReference,
    });
  }

  toJSON() {
    return {
      facetKind: this.facetKind,
      availability: this.availability,
      sourceKind: this.sourceKind,
      reasonCode: this.reasonCode,
      artifactId: this.artifactId,
      artifactKind: this.artifactKind,
      artifactFormat: this.artifactFormat,
      issuedOn: this.issuedOn,
      effectiveFrom: this.effectiveFrom,
      expiresOn: this.expiresOn,
      bindingReference: this.bindingReference,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export type CredentialCardEvidenceVerificationCounts = Readonly<Record<VerificationStateCodeType, number>>;
export type CredentialCardRecordVerificationCounts = Readonly<Record<VerificationRecordStateType, number>>;

export class CredentialCardVerificationFacet {
  readonly facetKind = CredentialCardFacetKind.VERIFICATION;
  readonly availability = CredentialCardFacetAvailability.AVAILABLE;
  readonly sourceKind = CredentialCardVerificationSourceKind.PROFESSIONAL_PASSPORT_PROJECTION;
  readonly evidenceStateCounts: CredentialCardEvidenceVerificationCounts;
  readonly recordStateCounts: CredentialCardRecordVerificationCounts;
  readonly evidenceCount: number;
  readonly linkedRecordCount: number;
  readonly unlinkedRecordCount: number;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly evidenceStateCounts: CredentialCardEvidenceVerificationCounts;
    readonly recordStateCounts: CredentialCardRecordVerificationCounts;
    readonly evidenceCount: number;
    readonly linkedRecordCount: number;
    readonly unlinkedRecordCount: number;
  }) {
    this.evidenceStateCounts = Object.freeze({ ...input.evidenceStateCounts });
    this.recordStateCounts = Object.freeze({ ...input.recordStateCounts });
    this.evidenceCount = input.evidenceCount;
    this.linkedRecordCount = input.linkedRecordCount;
    this.unlinkedRecordCount = input.unlinkedRecordCount;
    Object.freeze(this);
  }

  static fromPassport(passport: ProfessionalPassportProjection): CredentialCardVerificationFacet {
    if (!(passport instanceof ProfessionalPassportProjection)) {
      throw new TypeError('Credential Card verification facet requires ProfessionalPassportProjection');
    }

    const evidenceStateCounts = emptyEvidenceStateCounts();
    const recordStateCounts = emptyRecordStateCounts();
    let linkedRecordCount = 0;
    let unlinkedRecordCount = 0;

    for (const item of passport.items) {
      if (!EVIDENCE_VERIFICATION_STATES.includes(item.verificationStatus as VerificationStateCodeType)) {
        throw new TypeError('Credential Card evidence verification state must remain controlled');
      }
      evidenceStateCounts[item.verificationStatus as VerificationStateCodeType] += 1;

      if (item.verificationRecordState === null) {
        unlinkedRecordCount += 1;
      } else {
        if (!RECORD_VERIFICATION_STATES.includes(item.verificationRecordState)) {
          throw new TypeError('Credential Card verification record state must remain controlled');
        }
        recordStateCounts[item.verificationRecordState] += 1;
        linkedRecordCount += 1;
      }
    }

    return new CredentialCardVerificationFacet({
      evidenceStateCounts,
      recordStateCounts,
      evidenceCount: passport.items.length,
      linkedRecordCount,
      unlinkedRecordCount,
    });
  }

  toJSON() {
    return {
      facetKind: this.facetKind,
      availability: this.availability,
      sourceKind: this.sourceKind,
      evidenceStateCounts: this.evidenceStateCounts,
      recordStateCounts: this.recordStateCounts,
      evidenceCount: this.evidenceCount,
      linkedRecordCount: this.linkedRecordCount,
      unlinkedRecordCount: this.unlinkedRecordCount,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class CredentialCardEligibilityFacet {
  readonly facetKind = CredentialCardFacetKind.ELIGIBILITY;
  readonly availability = CredentialCardFacetAvailability.AVAILABLE;
  readonly sourceKind = CredentialCardEligibilitySourceKind.ELIGIBILITY_ASSESSMENT_PROJECTION;
  readonly assessmentId: string;
  readonly outcome: DomainOutcome;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly evaluatedAt: UtcInstant;
  readonly decisionAuthority = false as const;

  private constructor(passport: ProfessionalPassportProjection) {
    this.assessmentId = passport.assessmentId;
    this.outcome = passport.eligibilityOutcome;
    this.credentialDefinitionId = passport.credentialDefinitionId;
    this.credentialDefinitionVersion = passport.credentialDefinitionVersion;
    this.requirementSetId = passport.requirementSetId;
    this.requirementSetVersion = passport.requirementSetVersion;
    this.evaluatedAt = passport.authoritativeEvaluatedAt;
    Object.freeze(this);
  }

  static fromPassport(passport: ProfessionalPassportProjection): CredentialCardEligibilityFacet {
    if (!(passport instanceof ProfessionalPassportProjection)) {
      throw new TypeError('Credential Card eligibility facet requires ProfessionalPassportProjection');
    }
    return new CredentialCardEligibilityFacet(passport);
  }

  toJSON() {
    return {
      facetKind: this.facetKind,
      availability: this.availability,
      sourceKind: this.sourceKind,
      assessmentId: this.assessmentId,
      outcome: this.outcome,
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersion: this.credentialDefinitionVersion,
      requirementSetId: this.requirementSetId,
      requirementSetVersion: this.requirementSetVersion,
      evaluatedAt: this.evaluatedAt.toString(),
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class CredentialCardLifecycleFacet {
  readonly facetKind = CredentialCardFacetKind.LIFECYCLE;
  readonly availability = CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE;
  readonly sourceKind = CredentialCardLifecycleSourceKind.NONE;
  readonly reasonCode = CredentialCardUnavailableReason.LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03;
  readonly state = null;
  readonly evaluatedAt = null;
  readonly decisionAuthority = false as const;

  private constructor() {
    Object.freeze(this);
  }

  static sourceUnavailable(): CredentialCardLifecycleFacet {
    return new CredentialCardLifecycleFacet();
  }

  toJSON() {
    return {
      facetKind: this.facetKind,
      availability: this.availability,
      sourceKind: this.sourceKind,
      reasonCode: this.reasonCode,
      state: this.state,
      evaluatedAt: this.evaluatedAt,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class CredentialCardReadModel {
  readonly subject: SubjectReference;
  readonly assessmentId: string;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly projectionGeneratedAt: UtcInstant;
  readonly facetOrder = FACET_ORDER;
  readonly document: CredentialCardDocumentFacet;
  readonly verification: CredentialCardVerificationFacet;
  readonly eligibility: CredentialCardEligibilityFacet;
  readonly lifecycle: CredentialCardLifecycleFacet;
  readonly authorizationAuthority = false as const;

  private constructor(input: {
    readonly passport: ProfessionalPassportProjection;
    readonly document: CredentialCardDocumentFacet;
    readonly verification: CredentialCardVerificationFacet;
    readonly eligibility: CredentialCardEligibilityFacet;
    readonly lifecycle: CredentialCardLifecycleFacet;
  }) {
    this.subject = input.passport.subject;
    this.assessmentId = input.passport.assessmentId;
    this.credentialDefinitionId = input.passport.credentialDefinitionId;
    this.credentialDefinitionVersion = input.passport.credentialDefinitionVersion;
    this.requirementSetId = input.passport.requirementSetId;
    this.requirementSetVersion = input.passport.requirementSetVersion;
    this.projectionGeneratedAt = input.passport.generatedAt;
    this.document = input.document;
    this.verification = input.verification;
    this.eligibility = input.eligibility;
    this.lifecycle = input.lifecycle;
    Object.freeze(this);
  }

  static compose(input: {
    readonly passport: ProfessionalPassportProjection;
    readonly documentBinding?: CredentialCardDocumentBinding | null;
  }): CredentialCardReadModel {
    if (!(input.passport instanceof ProfessionalPassportProjection)) {
      throw new TypeError('Credential Card requires ProfessionalPassportProjection');
    }
    if (input.passport.authorizationAuthority !== false) {
      throw new TypeError('Credential Card source must remain non-authoritative');
    }
    if (input.documentBinding !== undefined && input.documentBinding !== null && !(input.documentBinding instanceof CredentialCardDocumentBinding)) {
      throw new TypeError('Credential Card document binding must use CredentialCardDocumentBinding');
    }

    const document = input.documentBinding == null
      ? CredentialCardDocumentFacet.sourceUnavailable()
      : CredentialCardDocumentFacet.fromBinding(
        input.documentBinding,
        input.passport.credentialDefinitionId,
        input.passport.subject,
      );

    return new CredentialCardReadModel({
      passport: input.passport,
      document,
      verification: CredentialCardVerificationFacet.fromPassport(input.passport),
      eligibility: CredentialCardEligibilityFacet.fromPassport(input.passport),
      lifecycle: CredentialCardLifecycleFacet.sourceUnavailable(),
    });
  }

  toJSON() {
    return {
      subject: this.subject.toJSON(),
      assessmentId: this.assessmentId,
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersion: this.credentialDefinitionVersion,
      requirementSetId: this.requirementSetId,
      requirementSetVersion: this.requirementSetVersion,
      projectionGeneratedAt: this.projectionGeneratedAt.toString(),
      authorizationAuthority: this.authorizationAuthority,
      facetOrder: this.facetOrder,
      document: this.document.toJSON(),
      verification: this.verification.toJSON(),
      eligibility: this.eligibility.toJSON(),
      lifecycle: this.lifecycle.toJSON(),
    } as const;
  }
}
