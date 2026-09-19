import { SubjectReference } from '../../../core/src/index.ts';
import { CredentialCardReadModel } from '../credential-card/credential-card-read-model.ts';
import { DashboardReadModel } from '../dashboard/dashboard-read-model.ts';
import { CredentialExplanationReadModel } from '../explanation/credential-explanation-read-model.ts';
import { MissingConditionNextActionReadModel } from '../guidance/missing-condition-next-action-read-model.ts';
import { ProfessionalPassportSummaryReadModel } from '../passport/professional-passport-summary.ts';
import { IntentSearchReadModel } from '../search/intent-search-read-model.ts';
import { ActivityTimelineReadModel } from '../timeline/activity-timeline-read-model.ts';

export const ResponsiveSurfaceKind = {
  MOBILE: 'MOBILE',
  WEB: 'WEB',
} as const;
export type ResponsiveSurfaceKind = (typeof ResponsiveSurfaceKind)[keyof typeof ResponsiveSurfaceKind];

export const ResponsiveSizeClass = {
  COMPACT: 'COMPACT',
  MEDIUM: 'MEDIUM',
  EXPANDED: 'EXPANDED',
} as const;
export type ResponsiveSizeClass = (typeof ResponsiveSizeClass)[keyof typeof ResponsiveSizeClass];

export const ResponsiveLayoutMode = {
  SINGLE_PANE_STACK: 'SINGLE_PANE_STACK',
  SINGLE_PANE_WITH_SECTION_NAV: 'SINGLE_PANE_WITH_SECTION_NAV',
  TWO_PANE_MASTER_DETAIL: 'TWO_PANE_MASTER_DETAIL',
} as const;
export type ResponsiveLayoutMode = (typeof ResponsiveLayoutMode)[keyof typeof ResponsiveLayoutMode];

export const ResponsiveNavigationMode = {
  PUSH_STACK: 'PUSH_STACK',
  SECTION_TABS: 'SECTION_TABS',
  SECTION_RAIL: 'SECTION_RAIL',
  MASTER_DETAIL: 'MASTER_DETAIL',
} as const;
export type ResponsiveNavigationMode = (typeof ResponsiveNavigationMode)[keyof typeof ResponsiveNavigationMode];

export const ResponsivePane = {
  PRIMARY: 'PRIMARY',
  MASTER: 'MASTER',
  DETAIL: 'DETAIL',
} as const;
export type ResponsivePane = (typeof ResponsivePane)[keyof typeof ResponsivePane];

export const ResponsiveSectionAvailability = {
  ALWAYS_AVAILABLE: 'ALWAYS_AVAILABLE',
} as const;

export const ResponsiveSectionKind = {
  DASHBOARD: 'DASHBOARD',
  PASSPORT_SUMMARY: 'PASSPORT_SUMMARY',
  CREDENTIAL_CARD: 'CREDENTIAL_CARD',
  EXPLANATION: 'EXPLANATION',
  TIMELINE: 'TIMELINE',
  GUIDANCE: 'GUIDANCE',
  SEARCH_RESULT: 'SEARCH_RESULT',
} as const;
export type ResponsiveSectionKind = (typeof ResponsiveSectionKind)[keyof typeof ResponsiveSectionKind];

export const ResponsiveSectionOrdering = {
  GOVERNED_READ_FLOW_NON_CAUSAL: 'GOVERNED_READ_FLOW_NON_CAUSAL',
} as const;

const BASE_SECTION_ORDER: readonly ResponsiveSectionKind[] = Object.freeze([
  ResponsiveSectionKind.DASHBOARD,
  ResponsiveSectionKind.PASSPORT_SUMMARY,
  ResponsiveSectionKind.CREDENTIAL_CARD,
  ResponsiveSectionKind.EXPLANATION,
  ResponsiveSectionKind.TIMELINE,
  ResponsiveSectionKind.GUIDANCE,
]);

function subjectKey(subject: SubjectReference): string {
  return `${subject.kind}:${subject.id.toString()}`;
}

function deepFreeze(value: unknown): unknown {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => deepFreeze(item)));
  }
  if (value !== null && typeof value === 'object') {
    const frozenEntries = Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => [key, deepFreeze(item)] as const);
    return Object.freeze(Object.fromEntries(frozenEntries));
  }
  return value;
}

function resolveLayout(sizeClass: ResponsiveSizeClass): ResponsiveLayoutMode {
  if (sizeClass === ResponsiveSizeClass.COMPACT) return ResponsiveLayoutMode.SINGLE_PANE_STACK;
  if (sizeClass === ResponsiveSizeClass.MEDIUM) return ResponsiveLayoutMode.SINGLE_PANE_WITH_SECTION_NAV;
  return ResponsiveLayoutMode.TWO_PANE_MASTER_DETAIL;
}

function resolveNavigation(
  surface: ResponsiveSurfaceKind,
  sizeClass: ResponsiveSizeClass,
): ResponsiveNavigationMode {
  if (sizeClass === ResponsiveSizeClass.EXPANDED) return ResponsiveNavigationMode.MASTER_DETAIL;
  if (sizeClass === ResponsiveSizeClass.MEDIUM) {
    return surface === ResponsiveSurfaceKind.WEB
      ? ResponsiveNavigationMode.SECTION_RAIL
      : ResponsiveNavigationMode.SECTION_TABS;
  }
  return surface === ResponsiveSurfaceKind.WEB
    ? ResponsiveNavigationMode.SECTION_TABS
    : ResponsiveNavigationMode.PUSH_STACK;
}

function paneFor(kind: ResponsiveSectionKind, sizeClass: ResponsiveSizeClass): ResponsivePane {
  if (sizeClass !== ResponsiveSizeClass.EXPANDED) return ResponsivePane.PRIMARY;
  if (
    kind === ResponsiveSectionKind.DASHBOARD ||
    kind === ResponsiveSectionKind.PASSPORT_SUMMARY ||
    kind === ResponsiveSectionKind.SEARCH_RESULT
  ) {
    return ResponsivePane.MASTER;
  }
  return ResponsivePane.DETAIL;
}

export class ResponsivePresentationProfile {
  readonly surface: ResponsiveSurfaceKind;
  readonly sizeClass: ResponsiveSizeClass;
  readonly layoutMode: ResponsiveLayoutMode;
  readonly navigationMode: ResponsiveNavigationMode;
  readonly paneCount: 1 | 2;
  readonly layoutAuthority = false as const;

  private constructor(surface: ResponsiveSurfaceKind, sizeClass: ResponsiveSizeClass) {
    this.surface = surface;
    this.sizeClass = sizeClass;
    this.layoutMode = resolveLayout(sizeClass);
    this.navigationMode = resolveNavigation(surface, sizeClass);
    this.paneCount = sizeClass === ResponsiveSizeClass.EXPANDED ? 2 : 1;
    Object.freeze(this);
  }

  static create(input: {
    readonly surface: ResponsiveSurfaceKind;
    readonly sizeClass: ResponsiveSizeClass;
  }): ResponsivePresentationProfile {
    if (!Object.values(ResponsiveSurfaceKind).includes(input.surface)) {
      throw new TypeError('Responsive profile surface must be controlled');
    }
    if (!Object.values(ResponsiveSizeClass).includes(input.sizeClass)) {
      throw new TypeError('Responsive profile size class must be controlled');
    }
    return new ResponsivePresentationProfile(input.surface, input.sizeClass);
  }

  toJSON() {
    return {
      surface: this.surface,
      sizeClass: this.sizeClass,
      layoutMode: this.layoutMode,
      navigationMode: this.navigationMode,
      paneCount: this.paneCount,
      layoutAuthority: this.layoutAuthority,
    } as const;
  }
}

export class ResponsiveReadSection {
  readonly kind: ResponsiveSectionKind;
  readonly order: number;
  readonly pane: ResponsivePane;
  readonly availability = ResponsiveSectionAvailability.ALWAYS_AVAILABLE;
  readonly sourceReference: string;
  readonly content: unknown;
  readonly layoutAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly kind: ResponsiveSectionKind;
    readonly order: number;
    readonly pane: ResponsivePane;
    readonly sourceReference: string;
    readonly content: unknown;
  }) {
    this.kind = input.kind;
    this.order = input.order;
    this.pane = input.pane;
    this.sourceReference = input.sourceReference;
    this.content = deepFreeze(input.content);
    Object.freeze(this);
  }

  static create(input: {
    readonly kind: ResponsiveSectionKind;
    readonly order: number;
    readonly pane: ResponsivePane;
    readonly sourceReference: string;
    readonly content: unknown;
  }): ResponsiveReadSection {
    if (!Object.values(ResponsiveSectionKind).includes(input.kind)) {
      throw new TypeError('Responsive section kind must be controlled');
    }
    if (!Number.isSafeInteger(input.order) || input.order < 0) {
      throw new RangeError('Responsive section order must be a non-negative integer');
    }
    if (!Object.values(ResponsivePane).includes(input.pane)) {
      throw new TypeError('Responsive section pane must be controlled');
    }
    if (typeof input.sourceReference !== 'string' || input.sourceReference.trim().length === 0) {
      throw new TypeError('Responsive section requires stable source reference');
    }
    return new ResponsiveReadSection({ ...input, sourceReference: input.sourceReference.trim() });
  }

  toJSON() {
    return {
      kind: this.kind,
      order: this.order,
      pane: this.pane,
      availability: this.availability,
      sourceReference: this.sourceReference,
      content: this.content,
      layoutAuthority: this.layoutAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export interface ResponsiveReadFlowInput {
  readonly profile: ResponsivePresentationProfile;
  readonly dashboard: DashboardReadModel;
  readonly passportSummary: ProfessionalPassportSummaryReadModel;
  readonly credentialCard: CredentialCardReadModel;
  readonly explanation: CredentialExplanationReadModel;
  readonly timeline: ActivityTimelineReadModel;
  readonly guidance: MissingConditionNextActionReadModel;
  readonly searchResult?: IntentSearchReadModel | null;
}

export class ResponsiveReadFlowReadModel {
  readonly profile: ResponsivePresentationProfile;
  readonly subject: SubjectReference;
  readonly assessmentId: string;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly eligibilityOutcome: string;
  readonly provenanceIdentity: string;
  readonly ordering = ResponsiveSectionOrdering.GOVERNED_READ_FLOW_NON_CAUSAL;
  readonly sectionOrder: readonly ResponsiveSectionKind[];
  readonly sections: readonly ResponsiveReadSection[];
  readonly sectionCount: number;
  readonly searchIncluded: boolean;
  readonly layoutAuthority = false as const;
  readonly decisionAuthority = false as const;
  readonly authorizationAuthority = false as const;

  private constructor(input: {
    readonly profile: ResponsivePresentationProfile;
    readonly subject: SubjectReference;
    readonly dashboard: DashboardReadModel;
    readonly credentialCard: CredentialCardReadModel;
    readonly explanation: CredentialExplanationReadModel;
    readonly sections: readonly ResponsiveReadSection[];
    readonly searchIncluded: boolean;
  }) {
    this.profile = input.profile;
    this.subject = input.subject;
    this.assessmentId = input.credentialCard.assessmentId;
    this.credentialDefinitionId = input.credentialCard.credentialDefinitionId;
    this.credentialDefinitionVersion = input.credentialCard.credentialDefinitionVersion;
    this.requirementSetId = input.credentialCard.requirementSetId;
    this.requirementSetVersion = input.credentialCard.requirementSetVersion;
    this.eligibilityOutcome = input.dashboard.eligibilityOutcome;
    this.provenanceIdentity = input.explanation.provenanceIdentity;
    this.sections = Object.freeze([...input.sections]);
    this.sectionOrder = Object.freeze(this.sections.map((section) => section.kind));
    this.sectionCount = this.sections.length;
    this.searchIncluded = input.searchIncluded;
    Object.freeze(this);
  }

  static compose(input: ResponsiveReadFlowInput): ResponsiveReadFlowReadModel {
    if (!(input.profile instanceof ResponsivePresentationProfile)) {
      throw new TypeError('Responsive read flow requires ResponsivePresentationProfile');
    }
    if (!(input.dashboard instanceof DashboardReadModel)) {
      throw new TypeError('Responsive read flow requires DashboardReadModel');
    }
    if (!(input.passportSummary instanceof ProfessionalPassportSummaryReadModel)) {
      throw new TypeError('Responsive read flow requires ProfessionalPassportSummaryReadModel');
    }
    if (!(input.credentialCard instanceof CredentialCardReadModel)) {
      throw new TypeError('Responsive read flow requires CredentialCardReadModel');
    }
    if (!(input.explanation instanceof CredentialExplanationReadModel)) {
      throw new TypeError('Responsive read flow requires CredentialExplanationReadModel');
    }
    if (!(input.timeline instanceof ActivityTimelineReadModel)) {
      throw new TypeError('Responsive read flow requires ActivityTimelineReadModel');
    }
    if (!(input.guidance instanceof MissingConditionNextActionReadModel)) {
      throw new TypeError('Responsive read flow requires MissingConditionNextActionReadModel');
    }
    if (input.searchResult !== undefined && input.searchResult !== null && !(input.searchResult instanceof IntentSearchReadModel)) {
      throw new TypeError('Responsive read flow search result must use IntentSearchReadModel');
    }

    if (
      input.dashboard.authorizationAuthority !== false ||
      input.passportSummary.authorizationAuthority !== false ||
      input.credentialCard.authorizationAuthority !== false ||
      input.explanation.authorizationAuthority !== false ||
      input.explanation.decisionAuthority !== false ||
      input.timeline.authorizationAuthority !== false ||
      input.timeline.decisionAuthority !== false ||
      input.guidance.authorizationAuthority !== false ||
      input.guidance.decisionAuthority !== false ||
      input.guidance.actionRecommendationAuthority !== false
    ) {
      throw new TypeError('Responsive read flow accepts only non-authoritative presentation sources');
    }
    if (input.searchResult !== undefined && input.searchResult !== null && (
      input.searchResult.authorizationAuthority !== false ||
      input.searchResult.decisionAuthority !== false ||
      input.searchResult.searchAuthority !== false ||
      input.searchResult.rankingAuthority !== false
    )) {
      throw new TypeError('Responsive read flow search source must remain non-authoritative');
    }

    const subject = input.credentialCard.subject;
    const expectedSubject = subjectKey(subject);
    for (const candidate of [
      input.dashboard.subject,
      input.passportSummary.subject,
      input.explanation.subject,
      input.timeline.subject,
      input.guidance.subject,
    ]) {
      if (subjectKey(candidate) !== expectedSubject) {
        throw new TypeError('Responsive read flow cannot mix subjects');
      }
    }
    if (input.searchResult !== undefined && input.searchResult !== null &&
        subjectKey(input.searchResult.query.subject) !== expectedSubject) {
      throw new TypeError('Responsive read flow search query subject mismatch');
    }

    const assessmentId = input.credentialCard.assessmentId;
    if (
      input.dashboard.assessmentId !== assessmentId ||
      input.explanation.assessmentId !== assessmentId ||
      input.timeline.assessmentId !== assessmentId ||
      input.guidance.assessmentId !== assessmentId
    ) {
      throw new TypeError('Responsive read flow credential-detail assessment mismatch');
    }

    const summaryMatches = input.passportSummary.groups
      .flatMap((group) => group.assessments)
      .filter((assessment) => assessment.assessmentId === assessmentId);
    if (summaryMatches.length !== 1) {
      throw new TypeError('Responsive read flow Passport summary must contain the detail assessment exactly once');
    }
    const summaryAssessment = summaryMatches[0]!;
    if (
      summaryAssessment.credentialDefinitionId !== input.credentialCard.credentialDefinitionId ||
      summaryAssessment.credentialDefinitionVersion !== input.credentialCard.credentialDefinitionVersion ||
      summaryAssessment.requirementSetId !== input.credentialCard.requirementSetId ||
      summaryAssessment.requirementSetVersion !== input.credentialCard.requirementSetVersion
    ) {
      throw new TypeError('Responsive read flow Passport summary detail binding mismatch');
    }

    for (const bound of [input.dashboard, input.explanation, input.guidance]) {
      if (
        bound.credentialDefinitionId !== input.credentialCard.credentialDefinitionId ||
        bound.credentialDefinitionVersion !== input.credentialCard.credentialDefinitionVersion ||
        bound.requirementSetId !== input.credentialCard.requirementSetId ||
        bound.requirementSetVersion !== input.credentialCard.requirementSetVersion
      ) {
        throw new TypeError('Responsive read flow credential definition or requirement-set binding mismatch');
      }
    }
    if (
      input.dashboard.eligibilityOutcome !== input.credentialCard.eligibility.outcome ||
      input.guidance.eligibilityOutcome !== input.credentialCard.eligibility.outcome ||
      summaryAssessment.eligibilityOutcome !== input.credentialCard.eligibility.outcome
    ) {
      throw new TypeError('Responsive read flow must preserve eligibility outcome');
    }
    if (
      input.timeline.decisionProvenanceIdentity !== input.explanation.provenanceIdentity ||
      input.guidance.provenanceIdentity !== input.explanation.provenanceIdentity
    ) {
      throw new TypeError('Responsive read flow provenance identity mismatch');
    }

    const sourceSections: Array<{
      readonly kind: ResponsiveSectionKind;
      readonly sourceReference: string;
      readonly content: unknown;
    }> = [
      {
        kind: ResponsiveSectionKind.DASHBOARD,
        sourceReference: `assessment:${input.dashboard.assessmentId}`,
        content: input.dashboard.toJSON(),
      },
      {
        kind: ResponsiveSectionKind.PASSPORT_SUMMARY,
        sourceReference: `subject:${expectedSubject}`,
        content: input.passportSummary.toJSON(),
      },
      {
        kind: ResponsiveSectionKind.CREDENTIAL_CARD,
        sourceReference: `assessment:${input.credentialCard.assessmentId}`,
        content: input.credentialCard.toJSON(),
      },
      {
        kind: ResponsiveSectionKind.EXPLANATION,
        sourceReference: `provenance:${input.explanation.provenanceIdentity}`,
        content: input.explanation.toJSON(),
      },
      {
        kind: ResponsiveSectionKind.TIMELINE,
        sourceReference: `provenance:${input.timeline.decisionProvenanceIdentity}`,
        content: input.timeline.toJSON(),
      },
      {
        kind: ResponsiveSectionKind.GUIDANCE,
        sourceReference: `assessment:${input.guidance.assessmentId}`,
        content: input.guidance.toJSON(),
      },
    ];

    if (input.searchResult !== undefined && input.searchResult !== null) {
      sourceSections.push({
        kind: ResponsiveSectionKind.SEARCH_RESULT,
        sourceReference: `search:${input.searchResult.query.intent}:${input.searchResult.query.terms.join('+')}`,
        content: input.searchResult.toJSON(),
      });
    }

    const expectedOrder = input.searchResult == null
      ? BASE_SECTION_ORDER
      : Object.freeze([...BASE_SECTION_ORDER, ResponsiveSectionKind.SEARCH_RESULT]);
    const sections = sourceSections.map((source, index) => ResponsiveReadSection.create({
      kind: source.kind,
      order: index,
      pane: paneFor(source.kind, input.profile.sizeClass),
      sourceReference: source.sourceReference,
      content: source.content,
    }));
    if (sections.some((section, index) => section.kind !== expectedOrder[index])) {
      throw new TypeError('Responsive read flow section order drifted from governed ordering');
    }

    return new ResponsiveReadFlowReadModel({
      profile: input.profile,
      subject,
      dashboard: input.dashboard,
      credentialCard: input.credentialCard,
      explanation: input.explanation,
      sections,
      searchIncluded: input.searchResult != null,
    });
  }

  toJSON() {
    return {
      profile: this.profile.toJSON(),
      subject: this.subject.toJSON(),
      assessmentId: this.assessmentId,
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersion: this.credentialDefinitionVersion,
      requirementSetId: this.requirementSetId,
      requirementSetVersion: this.requirementSetVersion,
      eligibilityOutcome: this.eligibilityOutcome,
      provenanceIdentity: this.provenanceIdentity,
      ordering: this.ordering,
      sectionOrder: this.sectionOrder,
      sectionCount: this.sectionCount,
      searchIncluded: this.searchIncluded,
      sections: this.sections.map((section) => section.toJSON()),
      layoutAuthority: this.layoutAuthority,
      decisionAuthority: this.decisionAuthority,
      authorizationAuthority: this.authorizationAuthority,
    } as const;
  }
}
