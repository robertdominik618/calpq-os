import {
  EligibilityAssessment,
  EvidenceReference,
  SourceReference,
  SubjectReference,
} from '../../../core/src/index.ts';
import {
  CredentialCardFacetAvailability,
  CredentialCardFacetKind,
  CredentialCardReadModel,
} from '../credential-card/credential-card-read-model.ts';
import {
  ProfessionalPassportProjection,
} from '../passport/professional-passport.ts';

export const CredentialExplanationAvailability = {
  AVAILABLE: 'AVAILABLE',
  SOURCE_NOT_AVAILABLE: 'SOURCE_NOT_AVAILABLE',
} as const;
export type CredentialExplanationAvailability =
  (typeof CredentialExplanationAvailability)[keyof typeof CredentialExplanationAvailability];

export const CredentialExplanationAffordance = {
  WHY: 'WHY',
} as const;

export const CredentialExplanationReason = {
  DOCUMENT_SOURCE_NOT_AVAILABLE: 'DOCUMENT_SOURCE_NOT_AVAILABLE',
  DOCUMENT_PRESENTED_FROM_EXPLICIT_BINDING: 'DOCUMENT_PRESENTED_FROM_EXPLICIT_BINDING',
  VERIFICATION_PRESENTED_FROM_PASSPORT_EVIDENCE: 'VERIFICATION_PRESENTED_FROM_PASSPORT_EVIDENCE',
  ELIGIBILITY_PRESENTED_FROM_AUTHORITATIVE_ASSESSMENT: 'ELIGIBILITY_PRESENTED_FROM_AUTHORITATIVE_ASSESSMENT',
  LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03: 'LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03',
  GOVERNED_EVIDENCE_REFERENCE_NOT_AVAILABLE: 'GOVERNED_EVIDENCE_REFERENCE_NOT_AVAILABLE',
} as const;
export type CredentialExplanationReason =
  (typeof CredentialExplanationReason)[keyof typeof CredentialExplanationReason];

const EXPLANATION_FACET_ORDER = Object.freeze([
  CredentialCardFacetKind.DOCUMENT,
  CredentialCardFacetKind.VERIFICATION,
  CredentialCardFacetKind.ELIGIBILITY,
  CredentialCardFacetKind.LIFECYCLE,
] as const);

function subjectKey(subject: SubjectReference): string {
  return `${subject.kind}:${subject.id.toString()}`;
}

function sameInstant(left: { toString(): string }, right: { toString(): string }): boolean {
  return left.toString() === right.toString();
}

function freezeArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export class CredentialSourceExplanation {
  readonly sourceId: string;
  readonly sourceType: string;
  readonly authority: ReturnType<SourceReference['authority']['toJSON']>;
  readonly jurisdiction: ReturnType<SourceReference['jurisdiction']['toJSON']>;
  readonly canonicalLocator: string | null;
  readonly version: string;
  readonly publicationDate: string | null;
  readonly effectiveFrom: string | null;
  readonly effectiveTo: string | null;
  readonly retrievedAt: string;
  readonly verificationState: string;
  readonly contentHash: string | null;
  readonly decisionAuthority = false as const;

  private constructor(source: SourceReference) {
    this.sourceId = source.id.toString();
    this.sourceType = source.sourceType;
    this.authority = Object.freeze(source.authority.toJSON());
    this.jurisdiction = Object.freeze(source.jurisdiction.toJSON());
    this.canonicalLocator = source.canonicalLocator;
    this.version = source.version.toString();
    this.publicationDate = source.publicationDate?.toString() ?? null;
    this.effectiveFrom = source.effectiveFrom?.toString() ?? null;
    this.effectiveTo = source.effectiveTo?.toString() ?? null;
    this.retrievedAt = source.retrievedAt.toString();
    this.verificationState = source.verificationState.toString();
    this.contentHash = source.contentHash?.toString() ?? null;
    Object.freeze(this);
  }

  static fromReference(source: SourceReference): CredentialSourceExplanation {
    if (!(source instanceof SourceReference)) {
      throw new TypeError('Credential explanation source must use SourceReference');
    }
    return new CredentialSourceExplanation(source);
  }

  toJSON() {
    return {
      sourceId: this.sourceId,
      sourceType: this.sourceType,
      authority: this.authority,
      jurisdiction: this.jurisdiction,
      canonicalLocator: this.canonicalLocator,
      version: this.version,
      publicationDate: this.publicationDate,
      effectiveFrom: this.effectiveFrom,
      effectiveTo: this.effectiveTo,
      retrievedAt: this.retrievedAt,
      verificationState: this.verificationState,
      contentHash: this.contentHash,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class CredentialEvidenceExplanation {
  readonly evidenceId: string;
  readonly kind: string;
  readonly evidenceClass: string;
  readonly contentReference: string;
  readonly mediaType: string | null;
  readonly contentHash: string | null;
  readonly acquiredAt: string;
  readonly acquiredBy: ReturnType<EvidenceReference['acquiredBy']['toJSON']>;
  readonly sourceId: string | null;
  readonly derivationParentEvidenceId: string | null;
  readonly verificationState: string;
  readonly decisionAuthority = false as const;

  private constructor(evidence: EvidenceReference) {
    this.evidenceId = evidence.id.toString();
    this.kind = evidence.kind;
    this.evidenceClass = evidence.evidenceClass;
    this.contentReference = evidence.contentReference;
    this.mediaType = evidence.mediaType;
    this.contentHash = evidence.contentHash?.toString() ?? null;
    this.acquiredAt = evidence.acquiredAt.toString();
    this.acquiredBy = Object.freeze(evidence.acquiredBy.toJSON());
    this.sourceId = evidence.source?.id.toString() ?? null;
    this.derivationParentEvidenceId = evidence.derivationParent?.toString() ?? null;
    this.verificationState = evidence.verificationState.toString();
    Object.freeze(this);
  }

  static fromReference(evidence: EvidenceReference): CredentialEvidenceExplanation {
    if (!(evidence instanceof EvidenceReference)) {
      throw new TypeError('Credential explanation evidence must use EvidenceReference');
    }
    return new CredentialEvidenceExplanation(evidence);
  }

  toJSON() {
    return {
      evidenceId: this.evidenceId,
      kind: this.kind,
      evidenceClass: this.evidenceClass,
      contentReference: this.contentReference,
      mediaType: this.mediaType,
      contentHash: this.contentHash,
      acquiredAt: this.acquiredAt,
      acquiredBy: this.acquiredBy,
      sourceId: this.sourceId,
      derivationParentEvidenceId: this.derivationParentEvidenceId,
      verificationState: this.verificationState,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class CredentialRequirementReasonExplanation {
  readonly requirementId: string;
  readonly outcome: string;
  readonly reasonCodes: readonly string[];
  readonly decisionAuthority = false as const;

  private constructor(requirementId: string, outcome: string, reasonCodes: readonly string[]) {
    this.requirementId = requirementId;
    this.outcome = outcome;
    this.reasonCodes = freezeArray(reasonCodes);
    Object.freeze(this);
  }

  static fromAssessment(
    assessment: EligibilityAssessment,
  ): readonly CredentialRequirementReasonExplanation[] {
    return Object.freeze(
      assessment.atomicResults.map((result) => new CredentialRequirementReasonExplanation(
        result.requirementId.toString(),
        result.outcome,
        result.reasonCodes,
      )),
    );
  }

  toJSON() {
    return {
      requirementId: this.requirementId,
      outcome: this.outcome,
      reasonCodes: this.reasonCodes,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class CredentialVerificationItemExplanation {
  readonly evidenceId: string;
  readonly provenanceIdentity: string;
  readonly origin: string;
  readonly authorityClass: string;
  readonly verificationStatus: string;
  readonly verificationRecordState: string | null;
  readonly verificationMethod: string | null;
  readonly verifier: unknown;
  readonly reviewer: unknown;
  readonly verifiedAt: string | null;
  readonly sourceVersion: string | null;
  readonly verificationSourceVersion: string | null;
  readonly sourceHash: string | null;
  readonly contentReference: string;
  readonly evidenceReferenceAvailability: CredentialExplanationAvailability;
  readonly evidenceReferenceReasonCode: CredentialExplanationReason | null;
  readonly governedEvidence: CredentialEvidenceExplanation | null;
  readonly decisionAuthority = false as const;

  private constructor(
    item: ProfessionalPassportProjection['items'][number],
    governedEvidence: CredentialEvidenceExplanation | null,
  ) {
    this.evidenceId = item.evidenceId.toString();
    this.provenanceIdentity = item.provenanceIdentity.toString();
    this.origin = item.origin;
    this.authorityClass = item.authorityClass;
    this.verificationStatus = item.verificationStatus;
    this.verificationRecordState = item.verificationRecordState;
    this.verificationMethod = item.verificationMethod;
    this.verifier = item.verifier === null ? null : Object.freeze(item.verifier.toJSON());
    this.reviewer = item.reviewer === null ? null : Object.freeze(item.reviewer.toJSON());
    this.verifiedAt = item.verifiedAt?.toString() ?? null;
    this.sourceVersion = item.sourceVersion;
    this.verificationSourceVersion = item.verificationSourceVersion;
    this.sourceHash = item.sourceHash;
    this.contentReference = item.contentReference;
    this.evidenceReferenceAvailability = governedEvidence === null
      ? CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE
      : CredentialExplanationAvailability.AVAILABLE;
    this.evidenceReferenceReasonCode = governedEvidence === null
      ? CredentialExplanationReason.GOVERNED_EVIDENCE_REFERENCE_NOT_AVAILABLE
      : null;
    this.governedEvidence = governedEvidence;
    Object.freeze(this);
  }

  static fromPassport(
    passport: ProfessionalPassportProjection,
    evidenceById: ReadonlyMap<string, CredentialEvidenceExplanation>,
  ): readonly CredentialVerificationItemExplanation[] {
    return Object.freeze(passport.items.map((item) => new CredentialVerificationItemExplanation(
      item,
      evidenceById.get(item.evidenceId.toString()) ?? null,
    )));
  }

  toJSON() {
    return {
      evidenceId: this.evidenceId,
      provenanceIdentity: this.provenanceIdentity,
      origin: this.origin,
      authorityClass: this.authorityClass,
      verificationStatus: this.verificationStatus,
      verificationRecordState: this.verificationRecordState,
      verificationMethod: this.verificationMethod,
      verifier: this.verifier,
      reviewer: this.reviewer,
      verifiedAt: this.verifiedAt,
      sourceVersion: this.sourceVersion,
      verificationSourceVersion: this.verificationSourceVersion,
      sourceHash: this.sourceHash,
      contentReference: this.contentReference,
      evidenceReferenceAvailability: this.evidenceReferenceAvailability,
      evidenceReferenceReasonCode: this.evidenceReferenceReasonCode,
      governedEvidence: this.governedEvidence?.toJSON() ?? null,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export interface CredentialFacetExplanationInput {
  readonly facetKind: string;
  readonly reasonCode: string;
  readonly sourceDetailAvailability: CredentialExplanationAvailability;
  readonly sources?: readonly CredentialSourceExplanation[];
  readonly evidence?: readonly CredentialEvidenceExplanation[];
  readonly verificationItems?: readonly CredentialVerificationItemExplanation[];
  readonly requirementReasons?: readonly CredentialRequirementReasonExplanation[];
  readonly supportingReferences?: readonly string[];
}

export class CredentialFacetExplanation {
  readonly facetKind: string;
  readonly explanationAvailability = CredentialExplanationAvailability.AVAILABLE;
  readonly affordance = CredentialExplanationAffordance.WHY;
  readonly reasonCode: string;
  readonly sourceDetailAvailability: CredentialExplanationAvailability;
  readonly sources: readonly CredentialSourceExplanation[];
  readonly evidence: readonly CredentialEvidenceExplanation[];
  readonly verificationItems: readonly CredentialVerificationItemExplanation[];
  readonly requirementReasons: readonly CredentialRequirementReasonExplanation[];
  readonly supportingReferences: readonly string[];
  readonly decisionAuthority = false as const;

  private constructor(input: CredentialFacetExplanationInput) {
    this.facetKind = input.facetKind;
    this.reasonCode = input.reasonCode;
    this.sourceDetailAvailability = input.sourceDetailAvailability;
    this.sources = freezeArray(input.sources ?? []);
    this.evidence = freezeArray(input.evidence ?? []);
    this.verificationItems = freezeArray(input.verificationItems ?? []);
    this.requirementReasons = freezeArray(input.requirementReasons ?? []);
    this.supportingReferences = freezeArray(input.supportingReferences ?? []);
    Object.freeze(this);
  }

  static create(input: CredentialFacetExplanationInput): CredentialFacetExplanation {
    return new CredentialFacetExplanation(input);
  }

  toJSON() {
    return {
      facetKind: this.facetKind,
      explanationAvailability: this.explanationAvailability,
      affordance: this.affordance,
      reasonCode: this.reasonCode,
      sourceDetailAvailability: this.sourceDetailAvailability,
      sources: this.sources.map((source) => source.toJSON()),
      evidence: this.evidence.map((evidence) => evidence.toJSON()),
      verificationItems: this.verificationItems.map((item) => item.toJSON()),
      requirementReasons: this.requirementReasons.map((reason) => reason.toJSON()),
      supportingReferences: this.supportingReferences,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class CredentialExplanationReadModel {
  readonly subject: SubjectReference;
  readonly assessmentId: string;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly evaluatedAt: string;
  readonly provenanceIdentity: string;
  readonly ruleSetId: string;
  readonly ruleVersion: string;
  readonly evaluator: unknown;
  readonly facetOrder = EXPLANATION_FACET_ORDER;
  readonly document: CredentialFacetExplanation;
  readonly verification: CredentialFacetExplanation;
  readonly eligibility: CredentialFacetExplanation;
  readonly lifecycle: CredentialFacetExplanation;
  readonly authorizationAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly card: CredentialCardReadModel;
    readonly assessment: EligibilityAssessment;
    readonly document: CredentialFacetExplanation;
    readonly verification: CredentialFacetExplanation;
    readonly eligibility: CredentialFacetExplanation;
    readonly lifecycle: CredentialFacetExplanation;
  }) {
    this.subject = input.card.subject;
    this.assessmentId = input.card.assessmentId;
    this.credentialDefinitionId = input.card.credentialDefinitionId;
    this.credentialDefinitionVersion = input.card.credentialDefinitionVersion;
    this.requirementSetId = input.card.requirementSetId;
    this.requirementSetVersion = input.card.requirementSetVersion;
    this.evaluatedAt = input.assessment.evaluatedAt.toString();
    this.provenanceIdentity = input.assessment.provenance.identity.toString();
    this.ruleSetId = input.assessment.provenance.ruleSetId.toString();
    this.ruleVersion = input.assessment.provenance.ruleVersion.toString();
    this.evaluator = Object.freeze(input.assessment.evaluator.toJSON());
    this.document = input.document;
    this.verification = input.verification;
    this.eligibility = input.eligibility;
    this.lifecycle = input.lifecycle;
    Object.freeze(this);
  }

  static compose(input: {
    readonly card: CredentialCardReadModel;
    readonly passport: ProfessionalPassportProjection;
    readonly assessment: EligibilityAssessment;
  }): CredentialExplanationReadModel {
    if (!(input.card instanceof CredentialCardReadModel)) {
      throw new TypeError('Credential explanation requires CredentialCardReadModel');
    }
    if (!(input.passport instanceof ProfessionalPassportProjection)) {
      throw new TypeError('Credential explanation requires ProfessionalPassportProjection');
    }
    if (!(input.assessment instanceof EligibilityAssessment)) {
      throw new TypeError('Credential explanation requires authoritative EligibilityAssessment');
    }
    if (input.card.authorizationAuthority !== false || input.passport.authorizationAuthority !== false) {
      throw new TypeError('Credential explanation accepts only non-authoritative presentation inputs');
    }

    if (subjectKey(input.card.subject) !== subjectKey(input.passport.subject) ||
        subjectKey(input.card.subject) !== subjectKey(input.assessment.subject)) {
      throw new TypeError('Credential explanation inputs must belong to the same subject');
    }

    if (input.card.assessmentId !== input.passport.assessmentId ||
        input.card.assessmentId !== input.assessment.id.toString()) {
      throw new TypeError('Credential explanation assessment identity mismatch');
    }
    if (input.card.credentialDefinitionId !== input.passport.credentialDefinitionId ||
        input.card.credentialDefinitionId !== input.assessment.credentialDefinition.id.toString() ||
        input.card.credentialDefinitionVersion !== input.passport.credentialDefinitionVersion ||
        input.card.credentialDefinitionVersion !== input.assessment.credentialDefinition.version.toString()) {
      throw new TypeError('Credential explanation credential-definition binding mismatch');
    }
    if (input.card.requirementSetId !== input.passport.requirementSetId ||
        input.card.requirementSetId !== input.assessment.requirementSetId.toString() ||
        input.card.requirementSetVersion !== input.passport.requirementSetVersion ||
        input.card.requirementSetVersion !== input.assessment.requirementSetVersion.toString()) {
      throw new TypeError('Credential explanation requirement-set binding mismatch');
    }
    if (input.card.eligibility.outcome !== input.assessment.outcome) {
      throw new TypeError('Credential explanation must preserve authoritative eligibility outcome');
    }
    if (!sameInstant(input.card.eligibility.evaluatedAt, input.assessment.evaluatedAt) ||
        !sameInstant(input.passport.authoritativeEvaluatedAt, input.assessment.evaluatedAt)) {
      throw new TypeError('Credential explanation evaluation instant mismatch');
    }

    const provenanceIdentity = input.assessment.provenance.identity.toString();
    for (const item of input.passport.items) {
      if (item.provenanceIdentity.toString() !== provenanceIdentity) {
        throw new TypeError('Credential explanation Passport item provenance mismatch');
      }
    }

    const sources: readonly CredentialSourceExplanation[] = Object.freeze(
      input.assessment.provenance.sources.map(
        (source) => CredentialSourceExplanation.fromReference(source),
      ),
    );
    const evidence: readonly CredentialEvidenceExplanation[] = Object.freeze(
      input.assessment.provenance.evidence.map(
        (reference) => CredentialEvidenceExplanation.fromReference(reference),
      ),
    );
    const evidenceById = new Map<string, CredentialEvidenceExplanation>(
      evidence.map((reference) => [reference.evidenceId, reference] as const),
    );
    const verificationItems = CredentialVerificationItemExplanation.fromPassport(input.passport, evidenceById);
    const requirementReasons = CredentialRequirementReasonExplanation.fromAssessment(input.assessment);

    const documentReason = input.card.document.availability === CredentialCardFacetAvailability.AVAILABLE
      ? CredentialExplanationReason.DOCUMENT_PRESENTED_FROM_EXPLICIT_BINDING
      : input.card.document.reasonCode ?? CredentialExplanationReason.DOCUMENT_SOURCE_NOT_AVAILABLE;
    const documentReferences = [
      input.card.document.artifactId,
      input.card.document.bindingReference,
    ].filter((value): value is string => value !== null);

    const document = CredentialFacetExplanation.create({
      facetKind: CredentialCardFacetKind.DOCUMENT,
      reasonCode: documentReason,
      sourceDetailAvailability: CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE,
      supportingReferences: documentReferences,
    });
    const verification = CredentialFacetExplanation.create({
      facetKind: CredentialCardFacetKind.VERIFICATION,
      reasonCode: CredentialExplanationReason.VERIFICATION_PRESENTED_FROM_PASSPORT_EVIDENCE,
      sourceDetailAvailability: sources.length === 0
        ? CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE
        : CredentialExplanationAvailability.AVAILABLE,
      sources,
      evidence,
      verificationItems,
    });
    const eligibility = CredentialFacetExplanation.create({
      facetKind: CredentialCardFacetKind.ELIGIBILITY,
      reasonCode: CredentialExplanationReason.ELIGIBILITY_PRESENTED_FROM_AUTHORITATIVE_ASSESSMENT,
      sourceDetailAvailability: sources.length === 0 && evidence.length === 0
        ? CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE
        : CredentialExplanationAvailability.AVAILABLE,
      sources,
      evidence,
      requirementReasons,
      supportingReferences: [
        input.assessment.provenance.ruleSetId.toString(),
        input.assessment.provenance.ruleVersion.toString(),
      ],
    });
    const lifecycle = CredentialFacetExplanation.create({
      facetKind: CredentialCardFacetKind.LIFECYCLE,
      reasonCode: input.card.lifecycle.reasonCode ??
        CredentialExplanationReason.LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03,
      sourceDetailAvailability: CredentialExplanationAvailability.SOURCE_NOT_AVAILABLE,
    });

    return new CredentialExplanationReadModel({
      card: input.card,
      assessment: input.assessment,
      document,
      verification,
      eligibility,
      lifecycle,
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
      evaluatedAt: this.evaluatedAt,
      provenanceIdentity: this.provenanceIdentity,
      ruleSetId: this.ruleSetId,
      ruleVersion: this.ruleVersion,
      evaluator: this.evaluator,
      facetOrder: this.facetOrder,
      document: this.document.toJSON(),
      verification: this.verification.toJSON(),
      eligibility: this.eligibility.toJSON(),
      lifecycle: this.lifecycle.toJSON(),
      authorizationAuthority: this.authorizationAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}
