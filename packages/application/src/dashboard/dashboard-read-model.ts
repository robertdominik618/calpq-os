import type { DomainOutcome, SubjectReference, UtcInstant } from '../../../core/src/index.ts';
import { ProfessionalPassportProjection } from '../passport/professional-passport.ts';
import {
  summarizePassportAuthorityClasses,
  type PassportReadMetrics,
} from '../passport/passport-read-metrics.ts';

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

  private constructor(passport: ProfessionalPassportProjection, metrics: PassportReadMetrics) {
    this.subject = passport.subject;
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
    return new DashboardReadModel(passport, summarizePassportAuthorityClasses(passport));
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
