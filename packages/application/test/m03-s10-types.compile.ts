import {
  AccessibilityLocalizationReadModel,
  ActivityTimelineReadModel,
  CredentialCardReadModel,
  CredentialExplanationReadModel,
  DashboardReadModel,
  IntentSearchReadModel,
  MissingConditionNextActionReadModel,
  ProfessionalPassportSummaryReadModel,
  ResponsiveReadFlowReadModel,
  ResponsiveSectionKind,
} from '../src/index.ts';

declare const dashboard: DashboardReadModel;
declare const summary: ProfessionalPassportSummaryReadModel;
declare const card: CredentialCardReadModel;
declare const explanation: CredentialExplanationReadModel;
declare const timeline: ActivityTimelineReadModel;
declare const guidance: MissingConditionNextActionReadModel;
declare const search: IntentSearchReadModel;
declare const responsive: ResponsiveReadFlowReadModel;
declare const accessibility: AccessibilityLocalizationReadModel;

const dashboardAuthority: false = dashboard.authorizationAuthority;
const summaryAuthority: false = summary.authorizationAuthority;
const cardAuthority: false = card.authorizationAuthority;
const explanationDecision: false = explanation.decisionAuthority;
const explanationAuthorization: false = explanation.authorizationAuthority;
const timelineDecision: false = timeline.decisionAuthority;
const timelineAuthorization: false = timeline.authorizationAuthority;
const guidanceDecision: false = guidance.decisionAuthority;
const guidanceAuthorization: false = guidance.authorizationAuthority;
const guidanceActionRecommendation: false = guidance.actionRecommendationAuthority;
const searchAuthority: false = search.searchAuthority;
const rankingAuthority: false = search.rankingAuthority;
const searchDecision: false = search.decisionAuthority;
const searchAuthorization: false = search.authorizationAuthority;
const layoutAuthority: false = responsive.layoutAuthority;
const responsiveDecision: false = responsive.decisionAuthority;
const responsiveAuthorization: false = responsive.authorizationAuthority;
const accessibilityAuthority: false = accessibility.accessibilityAuthority;
const localizationAuthority: false = accessibility.localizationAuthority;
const accessibilityDecision: false = accessibility.decisionAuthority;
const accessibilityAuthorization: false = accessibility.authorizationAuthority;
const keyboardReachable: true = accessibility.sections[0]!.keyboardReachable;
const screenReaderVisible: true = accessibility.sections[0]!.screenReaderVisible;
const colorOnlyMeaning: false = accessibility.sections[0]!.colorOnlyMeaning;

void dashboardAuthority;
void summaryAuthority;
void cardAuthority;
void explanationDecision;
void explanationAuthorization;
void timelineDecision;
void timelineAuthorization;
void guidanceDecision;
void guidanceAuthorization;
void guidanceActionRecommendation;
void searchAuthority;
void rankingAuthority;
void searchDecision;
void searchAuthorization;
void layoutAuthority;
void responsiveDecision;
void responsiveAuthorization;
void accessibilityAuthority;
void localizationAuthority;
void accessibilityDecision;
void accessibilityAuthorization;
void keyboardReachable;
void screenReaderVisible;
void colorOnlyMeaning;

// @ts-expect-error governed responsive sections are readonly
responsive.sections = [];

// @ts-expect-error governed responsive order is readonly
responsive.sectionOrder.push(ResponsiveSectionKind.DASHBOARD);

// @ts-expect-error accessibility sections are readonly
accessibility.sections = [];

// @ts-expect-error keyboard order is immutable
accessibility.sections[0]!.keyboardOrder = 99;

// @ts-expect-error localized labels are immutable presentation output
accessibility.sections[0]!.localizedLabel = 'changed';

// @ts-expect-error machine status semantics are readonly
accessibility.sections[0]!.statusSemantics.push(accessibility.sections[0]!.statusSemantics[0]!);
