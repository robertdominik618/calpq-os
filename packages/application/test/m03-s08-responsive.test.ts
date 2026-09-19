import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  DomainOutcome,
  SubjectId,
  SubjectKind,
  SubjectReference,
} from '../../core/src/index.ts';
import {
  ActivityTimelineReadModel,
  CredentialCardReadModel,
  CredentialExplanationReadModel,
  DashboardReadModel,
  IntentSearchIntent,
  IntentSearchReadModel,
  MissingConditionNextActionReadModel,
  ProfessionalPassportSummaryReadModel,
  ResponsiveLayoutMode,
  ResponsiveNavigationMode,
  ResponsivePane,
  ResponsivePresentationProfile,
  ResponsiveReadFlowReadModel,
  ResponsiveSectionAvailability,
  ResponsiveSectionKind,
  ResponsiveSizeClass,
  ResponsiveSurfaceKind,
} from '../src/index.ts';

const subject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079801'),
  SubjectKind.PERSON,
);
const otherSubject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079802'),
  SubjectKind.PERSON,
);

function fake<T>(prototype: object, values: Record<string, unknown>): T {
  const value = Object.create(prototype) as Record<string, unknown>;
  Object.assign(value, values);
  return Object.freeze(value) as T;
}

const base = {
  assessmentId: 'assessment-008',
  credentialDefinitionId: 'credential-definition-008',
  credentialDefinitionVersion: 'v8',
  requirementSetId: 'requirement-set-008',
  requirementSetVersion: 'v13',
};

function dashboard(input: Partial<typeof base> & { subjectValue?: SubjectReference; outcome?: string; authorizationAuthority?: boolean } = {}) {
  const data = { ...base, ...input };
  return fake<DashboardReadModel>(DashboardReadModel.prototype, {
    subject: input.subjectValue ?? subject,
    ...base,
    ...input,
    eligibilityOutcome: input.outcome ?? DomainOutcome.NOT_SATISFIED,
    authorizationAuthority: input.authorizationAuthority ?? false,
    toJSON: () => Object.freeze({ kind: 'dashboard', assessmentId: data.assessmentId, outcome: input.outcome ?? DomainOutcome.NOT_SATISFIED }),
  });
}

function summary(input: Partial<typeof base> & { subjectValue?: SubjectReference; outcome?: string; count?: number; authorizationAuthority?: boolean } = {}) {
  const data = { ...base, ...input };
  const assessment = Object.freeze({
    assessmentId: data.assessmentId,
    credentialDefinitionId: data.credentialDefinitionId,
    credentialDefinitionVersion: data.credentialDefinitionVersion,
    requirementSetId: data.requirementSetId,
    requirementSetVersion: data.requirementSetVersion,
    eligibilityOutcome: input.outcome ?? DomainOutcome.NOT_SATISFIED,
  });
  const count = input.count ?? 1;
  return fake<ProfessionalPassportSummaryReadModel>(ProfessionalPassportSummaryReadModel.prototype, {
    subject: input.subjectValue ?? subject,
    groups: Object.freeze([Object.freeze({ assessments: Object.freeze(Array.from({ length: count }, () => assessment)) })]),
    authorizationAuthority: input.authorizationAuthority ?? false,
    toJSON: () => Object.freeze({ kind: 'passport-summary', assessmentId: data.assessmentId }),
  });
}

function card(input: Partial<typeof base> & { subjectValue?: SubjectReference; outcome?: string; authorizationAuthority?: boolean } = {}) {
  const data = { ...base, ...input };
  return fake<CredentialCardReadModel>(CredentialCardReadModel.prototype, {
    subject: input.subjectValue ?? subject,
    ...base,
    ...input,
    eligibility: Object.freeze({ outcome: input.outcome ?? DomainOutcome.NOT_SATISFIED }),
    authorizationAuthority: input.authorizationAuthority ?? false,
    toJSON: () => Object.freeze({ kind: 'card', assessmentId: data.assessmentId, nested: Object.freeze({ reason: 'CARD_REASON' }) }),
  });
}

function explanation(input: Partial<typeof base> & { subjectValue?: SubjectReference; provenanceIdentity?: string; authorizationAuthority?: boolean; decisionAuthority?: boolean } = {}) {
  const data = { ...base, ...input };
  return fake<CredentialExplanationReadModel>(CredentialExplanationReadModel.prototype, {
    subject: input.subjectValue ?? subject,
    ...base,
    ...input,
    evaluatedAt: '2026-09-15T12:00:00.000Z',
    provenanceIdentity: input.provenanceIdentity ?? 'decision-008',
    authorizationAuthority: input.authorizationAuthority ?? false,
    decisionAuthority: input.decisionAuthority ?? false,
    toJSON: () => Object.freeze({ kind: 'explanation', assessmentId: data.assessmentId, reasonCodes: Object.freeze(['REQ_A_MISSING']) }),
  });
}

function timeline(input: { subjectValue?: SubjectReference; assessmentId?: string; provenanceIdentity?: string; authorizationAuthority?: boolean; decisionAuthority?: boolean } = {}) {
  return fake<ActivityTimelineReadModel>(ActivityTimelineReadModel.prototype, {
    subject: input.subjectValue ?? subject,
    assessmentId: input.assessmentId ?? base.assessmentId,
    decisionProvenanceIdentity: input.provenanceIdentity ?? 'decision-008',
    authorizationAuthority: input.authorizationAuthority ?? false,
    decisionAuthority: input.decisionAuthority ?? false,
    toJSON: () => Object.freeze({ kind: 'timeline', events: Object.freeze([{ eventId: 'event-008' }]) }),
  });
}

function guidance(input: Partial<typeof base> & { subjectValue?: SubjectReference; outcome?: string; provenanceIdentity?: string; authorizationAuthority?: boolean; decisionAuthority?: boolean; actionRecommendationAuthority?: boolean } = {}) {
  const data = { ...base, ...input };
  return fake<MissingConditionNextActionReadModel>(MissingConditionNextActionReadModel.prototype, {
    subject: input.subjectValue ?? subject,
    ...base,
    ...input,
    eligibilityOutcome: input.outcome ?? DomainOutcome.NOT_SATISFIED,
    provenanceIdentity: input.provenanceIdentity ?? 'decision-008',
    authorizationAuthority: input.authorizationAuthority ?? false,
    decisionAuthority: input.decisionAuthority ?? false,
    actionRecommendationAuthority: input.actionRecommendationAuthority ?? false,
    toJSON: () => Object.freeze({ kind: 'guidance', assessmentId: data.assessmentId, missingConditions: Object.freeze(['REQ-A']) }),
  });
}

function search(input: { subjectValue?: SubjectReference; authorizationAuthority?: boolean; decisionAuthority?: boolean; searchAuthority?: boolean; rankingAuthority?: boolean } = {}) {
  return fake<IntentSearchReadModel>(IntentSearchReadModel.prototype, {
    query: Object.freeze({ subject: input.subjectValue ?? subject, intent: IntentSearchIntent.CREDENTIAL, terms: Object.freeze(['credential']) }),
    hits: Object.freeze([{ recordId: 'credential-definition-008', score: 200 }]),
    resultCount: 1,
    truncated: false,
    authorizationAuthority: input.authorizationAuthority ?? false,
    decisionAuthority: input.decisionAuthority ?? false,
    searchAuthority: input.searchAuthority ?? false,
    rankingAuthority: input.rankingAuthority ?? false,
    toJSON: () => Object.freeze({ kind: 'search', hits: Object.freeze([{ recordId: 'credential-definition-008', score: 200 }]) }),
  });
}

function profile(surface = ResponsiveSurfaceKind.MOBILE, sizeClass = ResponsiveSizeClass.COMPACT) {
  return ResponsivePresentationProfile.create({ surface, sizeClass });
}

function compose(overrides: Partial<{
  profile: ResponsivePresentationProfile;
  dashboard: DashboardReadModel;
  passportSummary: ProfessionalPassportSummaryReadModel;
  credentialCard: CredentialCardReadModel;
  explanation: CredentialExplanationReadModel;
  timeline: ActivityTimelineReadModel;
  guidance: MissingConditionNextActionReadModel;
  searchResult: IntentSearchReadModel | null;
}> = {}) {
  return ResponsiveReadFlowReadModel.compose({
    profile: overrides.profile ?? profile(),
    dashboard: overrides.dashboard ?? dashboard(),
    passportSummary: overrides.passportSummary ?? summary(),
    credentialCard: overrides.credentialCard ?? card(),
    explanation: overrides.explanation ?? explanation(),
    timeline: overrides.timeline ?? timeline(),
    guidance: overrides.guidance ?? guidance(),
    searchResult: overrides.searchResult,
  });
}

test('M03S08-01 profile-input-required', () => assert.throws(() => ResponsiveReadFlowReadModel.compose({ profile: {} as ResponsivePresentationProfile, dashboard: dashboard(), passportSummary: summary(), credentialCard: card(), explanation: explanation(), timeline: timeline(), guidance: guidance() }), TypeError));
test('M03S08-02 dashboard-input-required', () => assert.throws(() => compose({ dashboard: {} as DashboardReadModel }), TypeError));
test('M03S08-03 passport-summary-input-required', () => assert.throws(() => compose({ passportSummary: {} as ProfessionalPassportSummaryReadModel }), TypeError));
test('M03S08-04 credential-card-input-required', () => assert.throws(() => compose({ credentialCard: {} as CredentialCardReadModel }), TypeError));
test('M03S08-05 explanation-input-required', () => assert.throws(() => compose({ explanation: {} as CredentialExplanationReadModel }), TypeError));
test('M03S08-06 timeline-input-required', () => assert.throws(() => compose({ timeline: {} as ActivityTimelineReadModel }), TypeError));
test('M03S08-07 guidance-input-required', () => assert.throws(() => compose({ guidance: {} as MissingConditionNextActionReadModel }), TypeError));
test('M03S08-08 search-input-must-use-governed-read-model', () => assert.throws(() => compose({ searchResult: {} as IntentSearchReadModel }), TypeError));
test('M03S08-09 presentation-inputs-must-remain-non-authoritative', () => assert.throws(() => compose({ credentialCard: card({ authorizationAuthority: true }) }), TypeError));
test('M03S08-10 search-authority-must-remain-zero', () => assert.throws(() => compose({ searchResult: search({ rankingAuthority: true }) }), TypeError));
test('M03S08-11 cross-subject-source-is-rejected', () => assert.throws(() => compose({ timeline: timeline({ subjectValue: otherSubject }) }), TypeError));
test('M03S08-12 cross-subject-search-is-rejected', () => assert.throws(() => compose({ searchResult: search({ subjectValue: otherSubject }) }), TypeError));
test('M03S08-13 detail-assessment-mismatch-is-rejected', () => assert.throws(() => compose({ guidance: guidance({ assessmentId: 'assessment-other' }) }), TypeError));
test('M03S08-14 passport-summary-must-contain-detail-assessment', () => assert.throws(() => compose({ passportSummary: summary({ assessmentId: 'assessment-other' }) }), TypeError));
test('M03S08-15 passport-summary-duplicate-detail-assessment-is-rejected', () => assert.throws(() => compose({ passportSummary: summary({ count: 2 }) }), TypeError));
test('M03S08-16 passport-summary-detail-binding-must-match', () => assert.throws(() => compose({ passportSummary: summary({ requirementSetVersion: 'v-other' }) }), TypeError));
test('M03S08-17 detail-definition-binding-must-match', () => assert.throws(() => compose({ explanation: explanation({ credentialDefinitionVersion: 'v-other' }) }), TypeError));
test('M03S08-18 eligibility-outcome-must-be-preserved', () => assert.throws(() => compose({ dashboard: dashboard({ outcome: DomainOutcome.SATISFIED }) }), TypeError));
test('M03S08-19 provenance-identity-must-match', () => assert.throws(() => compose({ timeline: timeline({ provenanceIdentity: 'decision-other' }) }), TypeError));

test('M03S08-20 compact-mobile-layout-is-single-pane-push-stack', () => {
  const flow = compose({ profile: profile(ResponsiveSurfaceKind.MOBILE, ResponsiveSizeClass.COMPACT) });
  assert.equal(flow.profile.layoutMode, ResponsiveLayoutMode.SINGLE_PANE_STACK);
  assert.equal(flow.profile.navigationMode, ResponsiveNavigationMode.PUSH_STACK);
  assert.equal(flow.profile.paneCount, 1);
});

test('M03S08-21 compact-web-layout-uses-section-tabs', () => {
  const flow = compose({ profile: profile(ResponsiveSurfaceKind.WEB, ResponsiveSizeClass.COMPACT) });
  assert.equal(flow.profile.layoutMode, ResponsiveLayoutMode.SINGLE_PANE_STACK);
  assert.equal(flow.profile.navigationMode, ResponsiveNavigationMode.SECTION_TABS);
});

test('M03S08-22 medium-mobile-layout-uses-section-tabs', () => {
  const flow = compose({ profile: profile(ResponsiveSurfaceKind.MOBILE, ResponsiveSizeClass.MEDIUM) });
  assert.equal(flow.profile.layoutMode, ResponsiveLayoutMode.SINGLE_PANE_WITH_SECTION_NAV);
  assert.equal(flow.profile.navigationMode, ResponsiveNavigationMode.SECTION_TABS);
});

test('M03S08-23 medium-web-layout-uses-section-rail', () => {
  const flow = compose({ profile: profile(ResponsiveSurfaceKind.WEB, ResponsiveSizeClass.MEDIUM) });
  assert.equal(flow.profile.navigationMode, ResponsiveNavigationMode.SECTION_RAIL);
});

test('M03S08-24 expanded-layout-is-two-pane-master-detail', () => {
  const flow = compose({ profile: profile(ResponsiveSurfaceKind.WEB, ResponsiveSizeClass.EXPANDED) });
  assert.equal(flow.profile.layoutMode, ResponsiveLayoutMode.TWO_PANE_MASTER_DETAIL);
  assert.equal(flow.profile.navigationMode, ResponsiveNavigationMode.MASTER_DETAIL);
  assert.equal(flow.profile.paneCount, 2);
  assert.equal(flow.sections.find((section) => section.kind === ResponsiveSectionKind.PASSPORT_SUMMARY)?.pane, ResponsivePane.MASTER);
  assert.equal(flow.sections.find((section) => section.kind === ResponsiveSectionKind.CREDENTIAL_CARD)?.pane, ResponsivePane.DETAIL);
});

test('M03S08-25 section-order-is-stable-without-search', () => {
  assert.deepEqual(compose().sectionOrder, [
    ResponsiveSectionKind.DASHBOARD,
    ResponsiveSectionKind.PASSPORT_SUMMARY,
    ResponsiveSectionKind.CREDENTIAL_CARD,
    ResponsiveSectionKind.EXPLANATION,
    ResponsiveSectionKind.TIMELINE,
    ResponsiveSectionKind.GUIDANCE,
  ]);
});

test('M03S08-26 optional-search-appends-without-reordering-governed-sections', () => {
  const flow = compose({ searchResult: search() });
  assert.equal(flow.searchIncluded, true);
  assert.equal(flow.sectionOrder.at(-1), ResponsiveSectionKind.SEARCH_RESULT);
  assert.deepEqual(flow.sectionOrder.slice(0, 6), compose().sectionOrder);
});

test('M03S08-27 compact-layout-does-not-hide-material-sections', () => {
  const flow = compose({ profile: profile(ResponsiveSurfaceKind.MOBILE, ResponsiveSizeClass.COMPACT), searchResult: search() });
  assert.equal(flow.sectionCount, 7);
  assert.ok(flow.sections.every((section) => section.availability === ResponsiveSectionAvailability.ALWAYS_AVAILABLE));
  assert.ok(flow.sections.every((section) => section.pane === ResponsivePane.PRIMARY));
});

test('M03S08-28 mobile-and-web-preserve-identical-section-content', () => {
  const mobile = compose({ profile: profile(ResponsiveSurfaceKind.MOBILE, ResponsiveSizeClass.COMPACT), searchResult: search() });
  const web = compose({ profile: profile(ResponsiveSurfaceKind.WEB, ResponsiveSizeClass.EXPANDED), searchResult: search() });
  assert.deepEqual(mobile.sections.map((section) => section.content), web.sections.map((section) => section.content));
  assert.deepEqual(mobile.sectionOrder, web.sectionOrder);
});

test('M03S08-29 size-class-change-modifies-layout-not-semantic-content', () => {
  const compact = compose({ profile: profile(ResponsiveSurfaceKind.WEB, ResponsiveSizeClass.COMPACT) });
  const expanded = compose({ profile: profile(ResponsiveSurfaceKind.WEB, ResponsiveSizeClass.EXPANDED) });
  assert.notEqual(compact.profile.layoutMode, expanded.profile.layoutMode);
  assert.deepEqual(compact.sections.map((section) => section.content), expanded.sections.map((section) => section.content));
  assert.equal(compact.eligibilityOutcome, expanded.eligibilityOutcome);
  assert.equal(compact.provenanceIdentity, expanded.provenanceIdentity);
});

test('M03S08-30 nested-content-snapshots-are-deeply-frozen', () => {
  const flow = compose({ searchResult: search() });
  const cardSection = flow.sections.find((section) => section.kind === ResponsiveSectionKind.CREDENTIAL_CARD)!;
  assert.equal(Object.isFrozen(flow), true);
  assert.equal(Object.isFrozen(flow.sections), true);
  assert.equal(Object.isFrozen(cardSection), true);
  assert.equal(Object.isFrozen(cardSection.content), true);
  const content = cardSection.content as { nested: object };
  assert.equal(Object.isFrozen(content.nested), true);
});

test('M03S08-31 serialization-is-deterministic-and-authority-is-zero', () => {
  const left = compose({ searchResult: search() });
  const right = compose({ searchResult: search() });
  assert.deepEqual(left.toJSON(), right.toJSON());
  assert.equal(left.layoutAuthority, false);
  assert.equal(left.decisionAuthority, false);
  assert.equal(left.authorizationAuthority, false);
  assert.ok(left.sections.every((section) => section.layoutAuthority === false && section.decisionAuthority === false));
});

test('M03S08-32 architecture-boundary-excludes-framework-device-ambient-and-domain-authority', () => {
  const source = readFileSync('packages/application/src/responsive/responsive-read-flow.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|@angular|flutter|swiftui)/i);
  assert.doesNotMatch(source, /window\.|document\.|navigator\.|userAgent|matchMedia|screen\.width|innerWidth/i);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /\b(?:AuthorizationGrant|QualificationPath|CredentialCatalog|aggregateRequirementGroup)\b|EligibilityAssessment\.evaluate/);
  assert.match(source, /layoutAuthority = false/);
  assert.match(source, /ALWAYS_AVAILABLE/);
});
