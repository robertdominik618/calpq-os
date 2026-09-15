import {
  ActorReference,
  DomainOutcome,
  EligibilityAssessment,
  EvidenceClass,
  EvidenceId,
  EvidenceKind,
  SubjectReference,
  UtcInstant,
  VerificationStateCode,
} from '../../../core/src/index.ts';
import type { ProvenanceIdentity } from '../../../core/src/index.ts';
import {
  VerificationMethod,
  VerificationRecord,
  VerificationRecordState,
} from '../verification/verification-model.ts';

export const PassportItemOrigin = {
  ORIGINAL_EVIDENCE: 'ORIGINAL_EVIDENCE',
  DERIVED_EVIDENCE: 'DERIVED_EVIDENCE',
} as const;
export type PassportItemOrigin = (typeof PassportItemOrigin)[keyof typeof PassportItemOrigin];

export const PassportAuthorityClass = {
  EVIDENCE: 'EVIDENCE',
  VERIFIED_EVIDENCE: 'VERIFIED_EVIDENCE',
  DERIVED_INFORMATION: 'DERIVED_INFORMATION',
} as const;
export type PassportAuthorityClass = (typeof PassportAuthorityClass)[keyof typeof PassportAuthorityClass];

export class PassportEvidenceVerificationLink {
  readonly evidenceId: EvidenceId;
  readonly record: VerificationRecord;
  readonly verifiedAt: UtcInstant | null;
  readonly reviewer: ActorReference | null;

  private constructor(
    evidenceId: EvidenceId,
    record: VerificationRecord,
    verifiedAt: UtcInstant | null,
    reviewer: ActorReference | null,
  ) {
    this.evidenceId = evidenceId;
    this.record = record;
    this.verifiedAt = verifiedAt;
    this.reviewer = reviewer;
    Object.freeze(this);
  }

  static create(input: {
    readonly evidenceId: EvidenceId;
    readonly record: VerificationRecord;
    readonly verifiedAt?: UtcInstant | null;
    readonly reviewer?: ActorReference | null;
  }): PassportEvidenceVerificationLink {
    if (!(input.evidenceId instanceof EvidenceId)) throw new TypeError('Passport verification link requires EvidenceId');
    if (!(input.record instanceof VerificationRecord)) throw new TypeError('Passport verification link requires VerificationRecord');
    if (input.verifiedAt !== undefined && input.verifiedAt !== null && !(input.verifiedAt instanceof UtcInstant)) {
      throw new TypeError('Passport verified-at value must use UtcInstant');
    }
    if (input.reviewer !== undefined && input.reviewer !== null && !(input.reviewer instanceof ActorReference)) {
      throw new TypeError('Passport reviewer attribution must use ActorReference');
    }

    const verifiedLike = input.record.state === VerificationRecordState.VERIFIED || input.record.state === VerificationRecordState.PARTIAL;
    if (verifiedLike && input.record.verifier === null) {
      throw new TypeError('Verified passport attribution requires verifier identity');
    }
    if (input.verifiedAt !== undefined && input.verifiedAt !== null && input.record.verifier === null) {
      throw new TypeError('verifiedAt cannot be attributed without verifier identity');
    }

    return new PassportEvidenceVerificationLink(
      input.evidenceId,
      input.record,
      input.verifiedAt ?? null,
      input.reviewer ?? null,
    );
  }
}

export class ProfessionalPassportItem {
  readonly evidenceId: EvidenceId;
  readonly provenanceIdentity: ProvenanceIdentity;
  readonly origin: PassportItemOrigin;
  readonly authorityClass: PassportAuthorityClass;
  readonly verificationStatus: string;
  readonly derivationMethod: EvidenceKind | null;
  readonly verifier: ActorReference | null;
  readonly reviewer: ActorReference | null;
  readonly verifiedAt: UtcInstant | null;
  readonly verificationRecordState: VerificationRecordState | null;
  readonly verificationMethod: VerificationMethod | null;
  readonly sourceVersion: string | null;
  readonly verificationSourceVersion: string | null;
  readonly sourceHash: string | null;
  readonly contentReference: string;

  private constructor(input: {
    readonly evidenceId: EvidenceId;
    readonly provenanceIdentity: ProvenanceIdentity;
    readonly origin: PassportItemOrigin;
    readonly authorityClass: PassportAuthorityClass;
    readonly verificationStatus: string;
    readonly derivationMethod: EvidenceKind | null;
    readonly verifier: ActorReference | null;
    readonly reviewer: ActorReference | null;
    readonly verifiedAt: UtcInstant | null;
    readonly verificationRecordState: VerificationRecordState | null;
    readonly verificationMethod: VerificationMethod | null;
    readonly sourceVersion: string | null;
    readonly verificationSourceVersion: string | null;
    readonly sourceHash: string | null;
    readonly contentReference: string;
  }) {
    this.evidenceId = input.evidenceId;
    this.provenanceIdentity = input.provenanceIdentity;
    this.origin = input.origin;
    this.authorityClass = input.authorityClass;
    this.verificationStatus = input.verificationStatus;
    this.derivationMethod = input.derivationMethod;
    this.verifier = input.verifier;
    this.reviewer = input.reviewer;
    this.verifiedAt = input.verifiedAt;
    this.verificationRecordState = input.verificationRecordState;
    this.verificationMethod = input.verificationMethod;
    this.sourceVersion = input.sourceVersion;
    this.verificationSourceVersion = input.verificationSourceVersion;
    this.sourceHash = input.sourceHash;
    this.contentReference = input.contentReference;
    Object.freeze(this);
  }

  static fromAssessmentEntry(
    assessment: EligibilityAssessment,
    entry: EligibilityAssessment['evidenceSnapshot']['entries'][number],
    verificationLink: PassportEvidenceVerificationLink | null,
  ): ProfessionalPassportItem {
    const isDerived = entry.evidenceClass === EvidenceClass.DERIVED;
    const verificationStatus = entry.verificationState.toString();
    const origin = isDerived ? PassportItemOrigin.DERIVED_EVIDENCE : PassportItemOrigin.ORIGINAL_EVIDENCE;
    const authorityClass = isDerived
      ? PassportAuthorityClass.DERIVED_INFORMATION
      : verificationStatus === VerificationStateCode.VERIFIED
        ? PassportAuthorityClass.VERIFIED_EVIDENCE
        : PassportAuthorityClass.EVIDENCE;

    return new ProfessionalPassportItem({
      evidenceId: entry.evidenceId,
      provenanceIdentity: assessment.provenance.identity,
      origin,
      authorityClass,
      verificationStatus,
      derivationMethod: isDerived ? entry.evidenceKind : null,
      verifier: verificationLink?.record.verifier ?? null,
      reviewer: verificationLink?.reviewer ?? null,
      verifiedAt: verificationLink?.verifiedAt ?? null,
      verificationRecordState: verificationLink?.record.state ?? null,
      verificationMethod: verificationLink?.record.method ?? null,
      sourceVersion: entry.sourceVersion?.toString() ?? null,
      verificationSourceVersion: verificationLink?.record.sourceVersion?.toString() ?? null,
      sourceHash: entry.contentHash?.toString() ?? null,
      contentReference: entry.contentReference,
    });
  }

  toJSON() {
    return {
      evidenceId: this.evidenceId.toString(),
      provenanceIdentity: this.provenanceIdentity.toString(),
      origin: this.origin,
      authorityClass: this.authorityClass,
      verificationStatus: this.verificationStatus,
      derivationMethod: this.derivationMethod,
      verifier: this.verifier?.toJSON() ?? null,
      reviewer: this.reviewer?.toJSON() ?? null,
      verifiedAt: this.verifiedAt?.toString() ?? null,
      verificationRecordState: this.verificationRecordState,
      verificationMethod: this.verificationMethod,
      sourceVersion: this.sourceVersion,
      verificationSourceVersion: this.verificationSourceVersion,
      sourceHash: this.sourceHash,
      contentReference: this.contentReference,
    } as const;
  }
}

export class ProfessionalPassportProjection {
  readonly subject: SubjectReference;
  readonly assessmentId: string;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly eligibilityOutcome: DomainOutcome;
  readonly authoritativeEvaluatedAt: UtcInstant;
  readonly generatedAt: UtcInstant;
  readonly items: readonly ProfessionalPassportItem[];
  readonly authorizationAuthority = false as const;

  private constructor(
    assessment: EligibilityAssessment,
    generatedAt: UtcInstant,
    items: readonly ProfessionalPassportItem[],
  ) {
    this.subject = assessment.subject;
    this.assessmentId = assessment.id.toString();
    this.credentialDefinitionId = assessment.credentialDefinition.id.toString();
    this.credentialDefinitionVersion = assessment.credentialDefinition.version.toString();
    this.requirementSetId = assessment.requirementSetId.toString();
    this.requirementSetVersion = assessment.requirementSetVersion.toString();
    this.eligibilityOutcome = assessment.outcome;
    this.authoritativeEvaluatedAt = assessment.evaluatedAt;
    this.generatedAt = generatedAt;
    this.items = Object.freeze([...items]);
    Object.freeze(this);
  }

  static rebuild(input: {
    readonly assessment: EligibilityAssessment;
    readonly generatedAt: UtcInstant;
    readonly verificationLinks?: readonly PassportEvidenceVerificationLink[];
  }): ProfessionalPassportProjection {
    if (!(input.assessment instanceof EligibilityAssessment)) {
      throw new TypeError('Professional Passport requires authoritative EligibilityAssessment input');
    }
    if (!(input.generatedAt instanceof UtcInstant)) {
      throw new TypeError('Professional Passport rebuild requires explicit generated-at UtcInstant');
    }

    const evidenceIds = new Set(input.assessment.evidenceSnapshot.entries.map((entry) => entry.evidenceId.toString()));
    const links = input.verificationLinks ?? [];
    if (!Array.isArray(links) || links.some((link) => !(link instanceof PassportEvidenceVerificationLink))) {
      throw new TypeError('Passport verification links must use PassportEvidenceVerificationLink');
    }
    const linkMap = new Map<string, PassportEvidenceVerificationLink>();
    for (const link of links) {
      const key = link.evidenceId.toString();
      if (!evidenceIds.has(key)) throw new TypeError(`Passport verification link references evidence outside assessment snapshot: ${key}`);
      if (linkMap.has(key)) throw new TypeError(`Duplicate Passport verification link for evidence: ${key}`);
      linkMap.set(key, link);
    }

    const items = input.assessment.evidenceSnapshot.entries
      .map((entry) => ProfessionalPassportItem.fromAssessmentEntry(
        input.assessment,
        entry,
        linkMap.get(entry.evidenceId.toString()) ?? null,
      ))
      .sort((left, right) => left.evidenceId.toString().localeCompare(right.evidenceId.toString()));

    return new ProfessionalPassportProjection(input.assessment, input.generatedAt, items);
  }

  isStale(asOf: UtcInstant, maxAgeMilliseconds: number): boolean {
    if (!(asOf instanceof UtcInstant)) throw new TypeError('Passport staleness check requires UtcInstant');
    if (!Number.isSafeInteger(maxAgeMilliseconds) || maxAgeMilliseconds < 0) {
      throw new RangeError('Passport staleness max age must be a non-negative safe integer');
    }
    return asOf.toEpochMilliseconds() - this.generatedAt.toEpochMilliseconds() > maxAgeMilliseconds;
  }

  toJSON() {
    return {
      subject: this.subject.toJSON(),
      assessmentId: this.assessmentId,
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersion: this.credentialDefinitionVersion,
      requirementSetId: this.requirementSetId,
      requirementSetVersion: this.requirementSetVersion,
      eligibilityOutcome: this.eligibilityOutcome,
      authoritativeEvaluatedAt: this.authoritativeEvaluatedAt.toString(),
      generatedAt: this.generatedAt.toString(),
      authorizationAuthority: this.authorizationAuthority,
      items: this.items.map((item) => item.toJSON()),
    } as const;
  }
}
