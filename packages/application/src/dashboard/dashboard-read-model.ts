import type { DomainOutcome, SubjectReference, UtcInstant } from '../../../core/src/index.ts';
import {
  PassportAuthorityClass,
  ProfessionalPassportProjection,
} from '../passport/professional-passport.ts';

export const DashboardSourceKind = {
  PROFESSIONAL_PASSPORT_PROJECTION: 'PROFESSIONAL_PASSPORT_PROJECTION',
} as const;
export type DashboardSourceKind = (typeof DashboardSourceKind)[keyof typeof DashboardSourceKind];

export const DashboardDestination = {
  PASSPORT: 'PASSPORT',
  CREDENTIALS: 'CREDENTIALS',
  EVIDENCE: 'EVIDENCE',
  TIMELINE: 'TIMELINE',
} as const;
export type DashboardDestination = (typeof DashboardDestination)[keyof typeof DashboardDestination];

export interface DashboardNavigationItem {
  readonly destination: DashboardDestination;
  readonly labelKey: string;
}

const DASHBOARD_NAVIGATION: readonly DashboardNavigationItem[] = Object.freeze([
  Object.freeze({ destination: DashboardDestination.PASSPORT, labelKey: 'navigation.passport' }),
  Object.freeze({ destination: DashboardDestination.CREDENTIALS, labelKey: 'navigation.credentials' }),
  Object.freeze({ destination: DashboardDestination.EVIDENCE, labelKey: 'navigation.evidence' }),
  Object.freeze({ destination: DashboardDestination.TIMELINE, labelKey: 'navigation.timeline' }),
]);

export class DashboardReadModel {
  readonly sourceKind = DashboardSourceKind.PROFESSIONAL_PASSPORT_PROJECTION;
  readonly subject: SubjectReference;
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
  readonly navigation: readonly DashboardNavigationItem[];
  readonly authorizationAuthority = false as const;

  private constructor(input: {
    readonly passport: ProfessionalPassportProjection;
    readonly verifiedEvidenceCount: number;
    readonly evidenceOnlyCount: number;
    readonly derivedInformationCount: number;
  }) {
    this.subject = input.passport.subject;
    this.assessmentId = input.passport.assessmentId;
    this.credentialDefinitionId = input.passport.credentialDefinitionId;
    this.credentialDefinitionVersion = input.passport.credentialDefinitionVersion;
    this.requirementSetId = input.passport.requirementSetId;
    this.requirementSetVersion = input.passport.requirementSetVersion;
    this.eligibilityOutcome = input.passport.eligibilityOutcome;
    this.authoritativeEvaluatedAt = input.passport.authoritativeEvaluatedAt;
    this.projectionGeneratedAt = input.passport.generatedAt;
    this.evidenceCount = input.passport.items.length;
    this.verifiedEvidenceCount = input.verifiedEvidenceCount;
    this.evidenceOnlyCount = input.evidenceOnlyCount;
    this.derivedInformationCount = input.derivedInformationCount;
    this.navigation = DASHBOARD_NAVIGATION;
    Object.freeze(this);
  }

  static fromPassport(passport: ProfessionalPassportProjection): DashboardReadModel {
    if (!(passport instanceof ProfessionalPassportProjection)) {
      throw new TypeError('Dashboard requires ProfessionalPassportProjection input');
    }
    if (passport.authorizationAuthority !== false) {
      throw new TypeError('Dashboard source must remain non-authoritative');
    }

    let verifiedEvidenceCount = 0;
    let evidenceOnlyCount = 0;
    let derivedInformationCount = 0;

    for (const item of passport.items) {
      switch (item.authorityClass) {
        case PassportAuthorityClass.VERIFIED_EVIDENCE:
          verifiedEvidenceCount += 1;
          break;
        case PassportAuthorityClass.DERIVED_INFORMATION:
          derivedInformationCount += 1;
          break;
        case PassportAuthorityClass.EVIDENCE:
          evidenceOnlyCount += 1;
          break;
      }
    }

    return new DashboardReadModel({
      passport,
      verifiedEvidenceCount,
      evidenceOnlyCount,
      derivedInformationCount,
    });
  }

  toJSON() {
    return {
      sourceKind: this.sourceKind,
      subject: this.subject.toJSON(),
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
      navigation: this.navigation,
    } as const;
  }
}
