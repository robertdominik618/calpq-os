import {
  DomainOutcome,
  SubjectReference,
  UtcInstant,
} from '../../../core/src/index.ts';
import { ProfessionalPassportProjection } from './professional-passport.ts';
import {
  summarizePassportAuthorityClasses,
  type PassportReadMetrics,
} from './passport-read-metrics.ts';

export const PassportSummarySourceKind = {
  PROFESSIONAL_PASSPORT_PROJECTIONS: 'PROFESSIONAL_PASSPORT_PROJECTIONS',
} as const;
export type PassportSummarySourceKind = (typeof PassportSummarySourceKind)[keyof typeof PassportSummarySourceKind];

export type EligibilityOutcomeCounts = Readonly<Record<DomainOutcome, number>>;

function subjectKey(subject: SubjectReference): string {
  return `${subject.kind}:${subject.id.toString()}`;
}

function emptyOutcomeCounts(): Record<DomainOutcome, number> {
  return {
    [DomainOutcome.SATISFIED]: 0,
    [DomainOutcome.NOT_SATISFIED]: 0,
    [DomainOutcome.INDETERMINATE]: 0,
    [DomainOutcome.REVIEW_REQUIRED]: 0,
  };
}

export class CredentialProjectionSummaryReadModel {
  readonly assessmentId: string;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly eligibilityOutcome: DomainOutcome;
  readonly authoritativeEvaluatedAt: UtcInstant;
  readonly projectionGeneratedAt: UtcInstant;
  readonly evidenceCount: number;
  readonly verifiedEvidenceCount: number;
  readonly evidenceOnlyCount: number;
  readonly derivedInformationCount: number;
  readonly authorizationAuthority = false as const;

  private constructor(passport: ProfessionalPassportProjection, metrics: PassportReadMetrics) {
    this.assessmentId = passport.assessmentId;
    this.credentialDefinitionId = passport.credentialDefinitionId;
    this.credentialDefinitionVersion = passport.credentialDefinitionVersion;
    this.requirementSetId = passport.requirementSetId;
    this.requirementSetVersion = passport.requirementSetVersion;
    this.eligibilityOutcome = passport.eligibilityOutcome;
    this.authoritativeEvaluatedAt = passport.authoritativeEvaluatedAt;
    this.projectionGeneratedAt = passport.generatedAt;
    this.evidenceCount = metrics.evidenceCount;
    this.verifiedEvidenceCount = metrics.verifiedEvidenceCount;
    this.evidenceOnlyCount = metrics.evidenceOnlyCount;
    this.derivedInformationCount = metrics.derivedInformationCount;
    Object.freeze(this);
  }

  static fromPassport(passport: ProfessionalPassportProjection): CredentialProjectionSummaryReadModel {
    if (!(passport instanceof ProfessionalPassportProjection)) {
      throw new TypeError('Credential projection summary requires ProfessionalPassportProjection input');
    }
    if (passport.authorizationAuthority !== false) {
      throw new TypeError('Credential projection summary source must remain non-authoritative');
    }
    return new CredentialProjectionSummaryReadModel(passport, summarizePassportAuthorityClasses(passport));
  }

  toJSON() {
    return {
      assessmentId: this.assessmentId,
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersion: this.credentialDefinitionVersion,
      requirementSetId: this.requirementSetId,
      requirementSetVersion: this.requirementSetVersion,
      eligibilityOutcome: this.eligibilityOutcome,
      authoritativeEvaluatedAt: this.authoritativeEvaluatedAt.toString(),
      projectionGeneratedAt: this.projectionGeneratedAt.toString(),
      evidenceCount: this.evidenceCount,
      verifiedEvidenceCount: this.verifiedEvidenceCount,
      evidenceOnlyCount: this.evidenceOnlyCount,
      derivedInformationCount: this.derivedInformationCount,
      authorizationAuthority: this.authorizationAuthority,
    } as const;
  }
}

export class CredentialGroupReadModel {
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersions: readonly string[];
  readonly assessmentCount: number;
  readonly assessments: readonly CredentialProjectionSummaryReadModel[];
  readonly outcomeCounts: EligibilityOutcomeCounts;
  readonly evidenceCount: number;
  readonly verifiedEvidenceCount: number;
  readonly evidenceOnlyCount: number;
  readonly derivedInformationCount: number;
  readonly authorizationAuthority = false as const;

  private constructor(
    credentialDefinitionId: string,
    assessments: readonly CredentialProjectionSummaryReadModel[],
  ) {
    const sortedAssessments = [...assessments].sort((left, right) =>
      left.credentialDefinitionVersion.localeCompare(right.credentialDefinitionVersion)
      || left.requirementSetVersion.localeCompare(right.requirementSetVersion)
      || left.assessmentId.localeCompare(right.assessmentId));

    const counts = emptyOutcomeCounts();
    let evidenceCount = 0;
    let verifiedEvidenceCount = 0;
    let evidenceOnlyCount = 0;
    let derivedInformationCount = 0;

    for (const assessment of sortedAssessments) {
      counts[assessment.eligibilityOutcome] += 1;
      evidenceCount += assessment.evidenceCount;
      verifiedEvidenceCount += assessment.verifiedEvidenceCount;
      evidenceOnlyCount += assessment.evidenceOnlyCount;
      derivedInformationCount += assessment.derivedInformationCount;
    }

    this.credentialDefinitionId = credentialDefinitionId;
    this.credentialDefinitionVersions = Object.freeze([
      ...new Set(sortedAssessments.map((assessment) => assessment.credentialDefinitionVersion)),
    ].sort((left, right) => left.localeCompare(right)));
    this.assessmentCount = sortedAssessments.length;
    this.assessments = Object.freeze(sortedAssessments);
    this.outcomeCounts = Object.freeze({ ...counts });
    this.evidenceCount = evidenceCount;
    this.verifiedEvidenceCount = verifiedEvidenceCount;
    this.evidenceOnlyCount = evidenceOnlyCount;
    this.derivedInformationCount = derivedInformationCount;
    Object.freeze(this);
  }

  static create(
    credentialDefinitionId: string,
    assessments: readonly CredentialProjectionSummaryReadModel[],
  ): CredentialGroupReadModel {
    if (credentialDefinitionId.trim().length === 0) {
      throw new TypeError('Credential group requires credentialDefinitionId');
    }
    if (!Array.isArray(assessments) || assessments.length === 0) {
      throw new TypeError('Credential group requires at least one assessment summary');
    }
    for (const assessment of assessments) {
      if (!(assessment instanceof CredentialProjectionSummaryReadModel)) {
        throw new TypeError('Credential group assessments must use CredentialProjectionSummaryReadModel');
      }
      if (assessment.credentialDefinitionId !== credentialDefinitionId) {
        throw new TypeError('Credential group cannot mix credential definition identities');
      }
    }
    return new CredentialGroupReadModel(credentialDefinitionId, assessments);
  }

  toJSON() {
    return {
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersions: this.credentialDefinitionVersions,
      assessmentCount: this.assessmentCount,
      outcomeCounts: this.outcomeCounts,
      evidenceCount: this.evidenceCount,
      verifiedEvidenceCount: this.verifiedEvidenceCount,
      evidenceOnlyCount: this.evidenceOnlyCount,
      derivedInformationCount: this.derivedInformationCount,
      authorizationAuthority: this.authorizationAuthority,
      assessments: this.assessments.map((assessment) => assessment.toJSON()),
    } as const;
  }
}

export class ProfessionalPassportSummaryReadModel {
  readonly sourceKind = PassportSummarySourceKind.PROFESSIONAL_PASSPORT_PROJECTIONS;
  readonly subject: SubjectReference;
  readonly projectionCount: number;
  readonly credentialGroupCount: number;
  readonly groups: readonly CredentialGroupReadModel[];
  readonly outcomeCounts: EligibilityOutcomeCounts;
  readonly evidenceCount: number;
  readonly verifiedEvidenceCount: number;
  readonly evidenceOnlyCount: number;
  readonly derivedInformationCount: number;
  readonly authorizationAuthority = false as const;

  private constructor(subject: SubjectReference, groups: readonly CredentialGroupReadModel[]) {
    const counts = emptyOutcomeCounts();
    let projectionCount = 0;
    let evidenceCount = 0;
    let verifiedEvidenceCount = 0;
    let evidenceOnlyCount = 0;
    let derivedInformationCount = 0;

    for (const group of groups) {
      projectionCount += group.assessmentCount;
      evidenceCount += group.evidenceCount;
      verifiedEvidenceCount += group.verifiedEvidenceCount;
      evidenceOnlyCount += group.evidenceOnlyCount;
      derivedInformationCount += group.derivedInformationCount;
      for (const outcome of Object.values(DomainOutcome)) {
        counts[outcome] += group.outcomeCounts[outcome];
      }
    }

    this.subject = subject;
    this.projectionCount = projectionCount;
    this.credentialGroupCount = groups.length;
    this.groups = Object.freeze([...groups]);
    this.outcomeCounts = Object.freeze({ ...counts });
    this.evidenceCount = evidenceCount;
    this.verifiedEvidenceCount = verifiedEvidenceCount;
    this.evidenceOnlyCount = evidenceOnlyCount;
    this.derivedInformationCount = derivedInformationCount;
    Object.freeze(this);
  }

  static compose(input: {
    readonly subject: SubjectReference;
    readonly projections: readonly ProfessionalPassportProjection[];
  }): ProfessionalPassportSummaryReadModel {
    if (!(input.subject instanceof SubjectReference)) {
      throw new TypeError('Professional Passport summary requires explicit SubjectReference');
    }
    if (!Array.isArray(input.projections)) {
      throw new TypeError('Professional Passport summary projections must be an array');
    }

    const expectedSubject = subjectKey(input.subject);
    const assessmentIds = new Set<string>();
    const grouped = new Map<string, CredentialProjectionSummaryReadModel[]>();

    for (const projection of input.projections) {
      if (!(projection instanceof ProfessionalPassportProjection)) {
        throw new TypeError('Professional Passport summary accepts only ProfessionalPassportProjection inputs');
      }
      if (projection.authorizationAuthority !== false) {
        throw new TypeError('Professional Passport summary sources must remain non-authoritative');
      }
      if (subjectKey(projection.subject) !== expectedSubject) {
        throw new TypeError('Professional Passport summary cannot mix subjects');
      }
      if (assessmentIds.has(projection.assessmentId)) {
        throw new TypeError(`Duplicate eligibility assessment projection: ${projection.assessmentId}`);
      }
      assessmentIds.add(projection.assessmentId);

      const assessment = CredentialProjectionSummaryReadModel.fromPassport(projection);
      const group = grouped.get(assessment.credentialDefinitionId) ?? [];
      group.push(assessment);
      grouped.set(assessment.credentialDefinitionId, group);
    }

    const groups = [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([credentialDefinitionId, assessments]) => CredentialGroupReadModel.create(credentialDefinitionId, assessments));

    return new ProfessionalPassportSummaryReadModel(input.subject, groups);
  }

  toJSON() {
    return {
      sourceKind: this.sourceKind,
      subject: this.subject.toJSON(),
      projectionCount: this.projectionCount,
      credentialGroupCount: this.credentialGroupCount,
      outcomeCounts: this.outcomeCounts,
      evidenceCount: this.evidenceCount,
      verifiedEvidenceCount: this.verifiedEvidenceCount,
      evidenceOnlyCount: this.evidenceOnlyCount,
      derivedInformationCount: this.derivedInformationCount,
      authorizationAuthority: this.authorizationAuthority,
      groups: this.groups.map((group) => group.toJSON()),
    } as const;
  }
}
