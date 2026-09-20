import type {
  ActivityTimelineReadModel,
  CredentialCardReadModel,
  CredentialExplanationReadModel,
  DashboardReadModel,
  IntentSearchReadModel,
  MissingConditionNextActionReadModel,
  ProfessionalPassportSummaryReadModel,
} from '../src/index.ts';
import {
  ResponsivePresentationProfile,
  ResponsiveReadFlowReadModel,
  ResponsiveSizeClass,
  ResponsiveSurfaceKind,
} from '../src/index.ts';

declare const dashboard: DashboardReadModel;
declare const passportSummary: ProfessionalPassportSummaryReadModel;
declare const credentialCard: CredentialCardReadModel;
declare const explanation: CredentialExplanationReadModel;
declare const timeline: ActivityTimelineReadModel;
declare const guidance: MissingConditionNextActionReadModel;
declare const searchResult: IntentSearchReadModel;

const profile = ResponsivePresentationProfile.create({
  surface: ResponsiveSurfaceKind.MOBILE,
  sizeClass: ResponsiveSizeClass.COMPACT,
});
const flow = ResponsiveReadFlowReadModel.compose({
  profile,
  dashboard,
  passportSummary,
  credentialCard,
  explanation,
  timeline,
  guidance,
  searchResult,
});

const layoutAuthority: false = flow.layoutAuthority;
const decisionAuthority: false = flow.decisionAuthority;
const authorizationAuthority: false = flow.authorizationAuthority;
const profileAuthority: false = profile.layoutAuthority;
void layoutAuthority;
void decisionAuthority;
void authorizationAuthority;
void profileAuthority;

// @ts-expect-error root flow is immutable
flow.assessmentId = 'changed';
// @ts-expect-error profile is immutable
profile.sizeClass = ResponsiveSizeClass.EXPANDED;
// @ts-expect-error responsive flow requires governed profile
ResponsiveReadFlowReadModel.compose({ profile: {}, dashboard, passportSummary, credentialCard, explanation, timeline, guidance });
// @ts-expect-error responsive flow requires governed card
ResponsiveReadFlowReadModel.compose({ profile, dashboard, passportSummary, credentialCard: {}, explanation, timeline, guidance });
