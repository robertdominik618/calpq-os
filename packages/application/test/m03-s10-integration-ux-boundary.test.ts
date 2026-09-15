import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActorId,
  ActorKind,
  ActorReference,
  AtomicRequirementResult,
  CredentialDefinitionId,
  CredentialDefinitionReference,
  DecisionId,
  DomainOutcome,
  EligibilityAssessment,
  EligibilityAssessmentId,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  EvidenceSnapshot,
  ProvenanceEnvelope,
  RequirementGroup,
  RequirementGroupMode,
  RequirementId,
  RequirementSet,
  RequirementSetId,
  RuleSetId,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
  VersionId,
} from '../../core/src/index.ts';
import {
  AccessibilityKeyboardTraversal,
  AccessibilityLocalizationReadModel,
  AccessibilityStatusMeaningMode,
  ActivityTimelineEventKind,
  ActivityTimelineOmissionReason,
  ActivityTimelineReadModel,
  ApprovedSearchQueryModel,
  CanonicalDateTimePresentation,
  CredentialCardFacetAvailability,
  CredentialCardFacetKind,
  CredentialCardReadModel,
  CredentialCardUnavailableReason,
  CredentialExplanationAffordance,
  CredentialExplanationReadModel,
  DashboardReadModel,
  DateTimeDisplayFormatKey,
  GovernedNextActionReference,
  IntentSearchIntent,
  IntentSearchQuery,
  IntentSearchReadModel,
  IntentSearchRecordKind,
  LocalizationCatalog,
  LocalizationCatalogEntry,
  MachineSemanticLabelReference,
  MissingConditionNextActionReadModel,
  NextActionAvailability,
  PresentationLocale,
  ProfessionalPassportProjection,
  ProfessionalPassportSummaryReadModel,
  ResponsiveLayoutMode,
  ResponsivePresentationProfile,
  ResponsiveReadFlowReadModel,
  ResponsiveSectionAvailability,
  ResponsiveSectionKind,
  ResponsiveSizeClass,
  ResponsiveSurfaceKind,
} from '../src/index.ts';

const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a001';
const OTHER_SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a002';
const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a003';
const CREDENTIAL_DEFINITION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a004';
const REQUIREMENT_SET_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a005';
const ASSESSMENT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a006';
const EVIDENCE_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a007';
const DECISION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a008';
const RULE_SET_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c07a009';
const CREDENTIAL_VERSION = 'credential-s10-v1';
const REQUIREMENT_VERSION = 'requirements-s10-v1';
const EVALUATED_AT = '2026-09-15T19:00:00.000Z';
const GENERATED_AT = '2026-09-15T19:05:00.000Z';
const EVIDENCE_ACQUIRED_AT = '2026-09-15T18:30:00.000Z';
const SNAPSHOT_AT = '2026-09-15T18:45:00.000Z';

const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);
const otherSubject = SubjectReference.create(SubjectId.from(OTHER_SUBJECT_ID), SubjectKind.PERSON);
const evaluator = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.HUMAN_USER);
const credential = CredentialDefinitionReference.create(
  CredentialDefinitionId.from(CREDENTIAL_DEFINITION_ID),
  VersionId.from(CREDENTIAL_VERSION),
);
const reqA = RequirementId.from('REQ-A');
const reqB = RequirementId.from('REQ-B');

const CS_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  'section.dashboard': 'Přehled',
  'section.passport_summary': 'Profesní pas',
  'section.credential_card': 'Karta oprávnění',
  'section.explanation': 'Vysvětlení',
  'section.timeline': 'Historie',
  'section.guidance': 'Další kroky',
  'section.search_result': 'Výsledky hledání',
  'status.not_satisfied': 'Nesplněno',
  'status.satisfied': 'Splněno',
  'status.available': 'Dostupné',
  'status.verified': 'Ověřeno',
  'status.source_not_available': 'Zdroj není dostupný',
  'status.no_governed_action': 'Řízený další krok není dostupný',
});

const EN_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  'section.dashboard': 'Overview',
  'section.passport_summary': 'Professional passport',
  'section.credential_card': 'Credential card',
  'section.explanation': 'Explanation',
  'section.timeline': 'Activity',
  'section.guidance': 'Next steps',
  'section.search_result': 'Search results',
  'status.not_satisfied': 'Not satisfied',
  'status.satisfied': 'Satisfied',
  'status.available': 'Available',
  'status.verified': 'Verified',
  'status.source_not_available': 'Source not available',
  'status.no_governed_action': 'Governed next action not available',
});

function localizationCatalog(
  locale: typeof PresentationLocale[keyof typeof PresentationLocale],
  omit: readonly string[] = [],
): LocalizationCatalog {
  const source = locale === PresentationLocale.CS_CZ ? CS_MESSAGES : EN_MESSAGES;
  return LocalizationCatalog.create({
    locale,
    entries: Object.entries(source)
      .filter(([key]) => !omit.includes(key))
      .map(([key, text]) => LocalizationCatalogEntry.create({ key, text })),
  });
}

function semanticLabels(): readonly MachineSemanticLabelReference[] {
  return Object.freeze([
    MachineSemanticLabelReference.create({ machineCode: 'NOT_SATISFIED', labelKey: 'status.not_satisfied' }),
    MachineSemanticLabelReference.create({ machineCode: 'SATISFIED', labelKey: 'status.satisfied' }),
    MachineSemanticLabelReference.create({ machineCode: 'AVAILABLE', labelKey: 'status.available' }),
    MachineSemanticLabelReference.create({ machineCode: 'VERIFIED', labelKey: 'status.verified' }),
    MachineSemanticLabelReference.create({ machineCode: 'SOURCE_NOT_AVAILABLE', labelKey: 'status.source_not_available' }),
    MachineSemanticLabelReference.create({
      machineCode: 'NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS',
      labelKey: 'status.no_governed_action',
    }),
  ]);
}

function authoritativeAssessment(): EligibilityAssessment {
  const evidence = EvidenceReference.original({
    id: EvidenceId.from(EVIDENCE_ID),
    kind: EvidenceKind.DOCUMENT,
    contentReference: 'object://m03-s10/evidence/source-document.pdf',
    mediaType: 'application/pdf',
    acquiredAt: UtcInstant.from(EVIDENCE_ACQUIRED_AT),
    acquiredBy: evaluator,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
  const snapshot = EvidenceSnapshot.capture([evidence], UtcInstant.from(SNAPSHOT_AT));
  const version = VersionId.from(REQUIREMENT_VERSION);
  const requirementSet = RequirementSet.create({
    id: RequirementSetId.from(REQUIREMENT_SET_ID),
    version,
    credentialDefinition: credential,
    requirementIds: [reqA, reqB],
    groups: [RequirementGroup.create({
      code: 'PRIMARY',
      mode: RequirementGroupMode.ALL,
      requirementIds: [reqA, reqB],
    })],
  });
  const atomicResults = [
    AtomicRequirementResult.create({
      requirementId: reqA,
      outcome: DomainOutcome.SATISFIED,
      reasonCodes: ['REQ_A_SATISFIED'],
    }),
    AtomicRequirementResult.create({
      requirementId: reqB,
      outcome: DomainOutcome.NOT_SATISFIED,
      reasonCodes: ['REQ_B_MISSING_EVIDENCE'],
    }),
  ];
  const evaluatedAt = UtcInstant.from(EVALUATED_AT);
  const provenance = ProvenanceEnvelope.create({
    identity: DecisionId.from(DECISION_ID),
    evaluatedAt,
    actor: evaluator,
    subject,
    ruleSetId: RuleSetId.from(RULE_SET_ID),
    ruleVersion: version,
    evidence: [evidence],
  });
  return EligibilityAssessment.evaluate({
    id: EligibilityAssessmentId.from(ASSESSMENT_ID),
    subject,
    credentialDefinition: credential,
    requirementSet,
    evaluatedAt,
    evidenceSnapshot: snapshot,
    atomicResults,
    evaluator,
    provenance,
  });
}

function buildJourney(input: {
  readonly surface?: typeof ResponsiveSurfaceKind[keyof typeof ResponsiveSurfaceKind];
  readonly sizeClass?: typeof ResponsiveSizeClass[keyof typeof ResponsiveSizeClass];
  readonly locale?: typeof PresentationLocale[keyof typeof PresentationLocale];
} = {}) {
  const assessment = authoritativeAssessment();
  const passport = ProfessionalPassportProjection.rebuild({
    assessment,
    generatedAt: UtcInstant.from(GENERATED_AT),
  });
  const dashboard = DashboardReadModel.fromPassport(passport);
  const passportSummary = ProfessionalPassportSummaryReadModel.compose({ subject, projections: [passport] });
  const credentialCard = CredentialCardReadModel.compose({ passport });
  const explanation = CredentialExplanationReadModel.compose({
    card: credentialCard,
    passport,
    assessment,
  });
  const timeline = ActivityTimelineReadModel.compose({ explanation, passport, assessment });
  const guidance = MissingConditionNextActionReadModel.compose({ assessment, explanation });
  const searchModels = Object.freeze([
    ApprovedSearchQueryModel.fromPassportSummary(passportSummary),
    ApprovedSearchQueryModel.fromCredentialCard(credentialCard),
    ApprovedSearchQueryModel.fromExplanation(explanation),
    ApprovedSearchQueryModel.fromTimeline(timeline),
    ApprovedSearchQueryModel.fromGuidance(guidance),
  ]);
  const searchQuery = IntentSearchQuery.create({
    subject,
    intent: IntentSearchIntent.CREDENTIAL,
    terms: [CREDENTIAL_DEFINITION_ID],
    limit: 10,
  });
  const search = IntentSearchReadModel.search({ query: searchQuery, models: searchModels });
  const responsive = ResponsiveReadFlowReadModel.compose({
    profile: ResponsivePresentationProfile.create({
      surface: input.surface ?? ResponsiveSurfaceKind.WEB,
      sizeClass: input.sizeClass ?? ResponsiveSizeClass.MEDIUM,
    }),
    dashboard,
    passportSummary,
    credentialCard,
    explanation,
    timeline,
    guidance,
    searchResult: search,
  });
  const accessibility = AccessibilityLocalizationReadModel.compose({
    flow: responsive,
    catalog: localizationCatalog(input.locale ?? PresentationLocale.CS_CZ),
    semanticLabels: semanticLabels(),
  });
  return Object.freeze({
    assessment,
    passport,
    dashboard,
    passportSummary,
    credentialCard,
    explanation,
    timeline,
    guidance,
    searchModels,
    search,
    responsive,
    accessibility,
  });
}

function explicitGovernedAction(journey: ReturnType<typeof buildJourney>): GovernedNextActionReference {
  return GovernedNextActionReference.create({
    actionCode: 'PROVIDE_GOVERNED_EVIDENCE',
    labelKey: 'guidance.provide_governed_evidence',
    assessmentId: journey.assessment.id.toString(),
    provenanceIdentity: journey.assessment.provenance.identity.toString(),
    requirementId: reqB.toString(),
    reasonCode: 'REQ_B_MISSING_EVIDENCE',
    supportingEvidenceIds: [EVIDENCE_ID],
  });
}

test('M03S10-01 authoritative-m02-assessment-drives-journey', () => {
  const journey = buildJourney();
  assert.ok(journey.assessment instanceof EligibilityAssessment);
  assert.equal(journey.assessment.outcome, DomainOutcome.NOT_SATISFIED);
  assert.equal(journey.assessment.atomicResults.length, 2);
});

test('M03S10-02 dashboard-preserves-assessment-identity-and-outcome', () => {
  const journey = buildJourney();
  assert.equal(journey.dashboard.assessmentId, ASSESSMENT_ID);
  assert.equal(journey.dashboard.eligibilityOutcome, DomainOutcome.NOT_SATISFIED);
  assert.equal(journey.dashboard.credentialDefinitionId, CREDENTIAL_DEFINITION_ID);
});

test('M03S10-03 dashboard-keeps-evaluation-and-projection-times-distinct', () => {
  const journey = buildJourney();
  assert.equal(journey.dashboard.authoritativeEvaluatedAt.toString(), EVALUATED_AT);
  assert.equal(journey.dashboard.projectionGeneratedAt.toString(), GENERATED_AT);
  assert.notEqual(journey.dashboard.authoritativeEvaluatedAt.toString(), journey.dashboard.projectionGeneratedAt.toString());
});

test('M03S10-04 passport-summary-contains-detail-assessment-exactly-once', () => {
  const journey = buildJourney();
  const matches = journey.passportSummary.groups.flatMap((group) => group.assessments)
    .filter((item) => item.assessmentId === ASSESSMENT_ID);
  assert.equal(matches.length, 1);
  assert.equal(journey.passportSummary.projectionCount, 1);
});

test('M03S10-05 credential-card-separates-four-facets', () => {
  const card = buildJourney().credentialCard;
  assert.deepEqual(card.facetOrder, [
    CredentialCardFacetKind.DOCUMENT,
    CredentialCardFacetKind.VERIFICATION,
    CredentialCardFacetKind.ELIGIBILITY,
    CredentialCardFacetKind.LIFECYCLE,
  ]);
});

test('M03S10-06 document-unavailable-remains-separate-from-eligibility', () => {
  const card = buildJourney().credentialCard;
  assert.equal(card.document.availability, CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE);
  assert.equal(card.document.reasonCode, CredentialCardUnavailableReason.DOCUMENT_SOURCE_NOT_AVAILABLE);
  assert.equal(card.eligibility.outcome, DomainOutcome.NOT_SATISFIED);
});

test('M03S10-07 verified-evidence-does-not-imply-satisfied-eligibility', () => {
  const card = buildJourney().credentialCard;
  assert.equal(card.verification.evidenceStateCounts[VerificationStateCode.VERIFIED], 1);
  assert.equal(card.eligibility.outcome, DomainOutcome.NOT_SATISFIED);
});

test('M03S10-08 lifecycle-unavailable-does-not-imply-revocation', () => {
  const card = buildJourney().credentialCard;
  assert.equal(card.lifecycle.availability, CredentialCardFacetAvailability.SOURCE_NOT_AVAILABLE);
  assert.equal(card.lifecycle.reasonCode, CredentialCardUnavailableReason.LIFECYCLE_SOURCE_NOT_AVAILABLE_IN_M03);
  assert.equal(card.lifecycle.state, null);
  assert.equal(card.lifecycle.evaluatedAt, null);
});

test('M03S10-09 eligibility-facet-preserves-authoritative-assessment', () => {
  const journey = buildJourney();
  assert.equal(journey.credentialCard.eligibility.assessmentId, journey.assessment.id.toString());
  assert.equal(journey.credentialCard.eligibility.outcome, journey.assessment.outcome);
  assert.equal(journey.credentialCard.eligibility.evaluatedAt.toString(), journey.assessment.evaluatedAt.toString());
});

test('M03S10-10 why-affordance-exists-for-all-card-facets', () => {
  const explanation = buildJourney().explanation;
  for (const facet of [explanation.document, explanation.verification, explanation.eligibility, explanation.lifecycle]) {
    assert.equal(facet.affordance, CredentialExplanationAffordance.WHY);
  }
});

test('M03S10-11 eligibility-explanation-preserves-atomic-reasons', () => {
  const journey = buildJourney();
  assert.deepEqual(
    journey.explanation.eligibility.requirementReasons.map((item) => ({
      requirementId: item.requirementId,
      outcome: item.outcome,
      reasonCodes: item.reasonCodes,
    })),
    journey.assessment.atomicResults.map((item) => ({
      requirementId: item.requirementId.toString(),
      outcome: item.outcome,
      reasonCodes: item.reasonCodes,
    })),
  );
});

test('M03S10-12 explanation-preserves-governed-evidence-reference', () => {
  const explanation = buildJourney().explanation;
  assert.equal(explanation.eligibility.evidence.length, 1);
  assert.equal(explanation.eligibility.evidence[0]?.evidenceId, EVIDENCE_ID);
  assert.equal(explanation.verification.verificationItems[0]?.governedEvidence?.evidenceId, EVIDENCE_ID);
});

test('M03S10-13 timeline-has-authoritative-eligibility-event', () => {
  const timeline = buildJourney().timeline;
  const event = timeline.events.find((item) => item.kind === ActivityTimelineEventKind.ELIGIBILITY_EVALUATED);
  assert.equal(event?.occurredAt.toString(), EVALUATED_AT);
  assert.equal(event?.details.outcome, DomainOutcome.NOT_SATISFIED);
});

test('M03S10-14 projection-generated-at-never-becomes-history-event', () => {
  const timeline = buildJourney().timeline;
  assert.equal(timeline.events.some((item) => item.occurredAt.toString() === GENERATED_AT), false);
});

test('M03S10-15 verification-without-governed-time-is-explicit-omission', () => {
  const timeline = buildJourney().timeline;
  assert.equal(timeline.events.some((item) => item.kind === ActivityTimelineEventKind.VERIFICATION_RECORDED), false);
  assert.equal(timeline.omissions.length, 1);
  assert.equal(timeline.omissions[0]?.reasonCode, ActivityTimelineOmissionReason.VERIFICATION_EVENT_TIME_NOT_AVAILABLE);
  assert.equal(timeline.omissions[0]?.sourceReference, EVIDENCE_ID);
});

test('M03S10-16 timeline-provenance-matches-authoritative-decision', () => {
  const journey = buildJourney();
  assert.equal(journey.timeline.decisionProvenanceIdentity, DECISION_ID);
  assert.equal(journey.timeline.decisionProvenance.decisionIdentity, DECISION_ID);
  assert.equal(journey.timeline.decisionProvenance.outcome, journey.assessment.outcome);
});

test('M03S10-17 guidance-surfaces-only-non-satisfied-condition', () => {
  const guidance = buildJourney().guidance;
  assert.equal(guidance.missingConditionCount, 1);
  assert.equal(guidance.missingConditions[0]?.requirementId, 'REQ-B');
  assert.equal(guidance.missingConditions.some((item) => item.requirementId === 'REQ-A'), false);
});

test('M03S10-18 no-governed-action-is-explicitly-unavailable', () => {
  const condition = buildJourney().guidance.missingConditions[0]!;
  assert.equal(condition.nextActionAvailability, NextActionAvailability.NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS);
  assert.deepEqual(condition.nextActions, []);
});

test('M03S10-19 explicit-governed-action-survives-guidance-and-search', () => {
  const journey = buildJourney();
  const action = explicitGovernedAction(journey);
  const guidance = MissingConditionNextActionReadModel.compose({
    assessment: journey.assessment,
    explanation: journey.explanation,
    governedActions: [action],
  });
  assert.equal(guidance.missingConditions[0]?.nextActionAvailability, NextActionAvailability.AVAILABLE);
  assert.equal(guidance.missingConditions[0]?.nextActions[0]?.actionCode, 'PROVIDE_GOVERNED_EVIDENCE');
  const query = IntentSearchQuery.create({
    subject,
    intent: IntentSearchIntent.NEXT_ACTION,
    terms: ['PROVIDE_GOVERNED_EVIDENCE'],
  });
  const result = IntentSearchReadModel.search({
    query,
    models: [ApprovedSearchQueryModel.fromGuidance(guidance)],
  });
  assert.equal(result.resultCount, 1);
  assert.equal(result.hits[0]?.recordKind, IntentSearchRecordKind.NEXT_ACTION);
});

test('M03S10-20 credential-search-uses-approved-query-models-and-governed-references', () => {
  const journey = buildJourney();
  assert.equal(journey.searchModels.every((model) => model instanceof ApprovedSearchQueryModel), true);
  assert.equal(journey.search.resultCount, 2);
  assert.equal(journey.search.hits.every((hit) => hit.references.length > 0), true);
  assert.equal(journey.search.hits.some((hit) => hit.recordId === CREDENTIAL_DEFINITION_ID), true);
});

test('M03S10-21 search-authority-remains-zero', () => {
  const search = buildJourney().search;
  assert.equal(search.searchAuthority, false);
  assert.equal(search.rankingAuthority, false);
  assert.equal(search.decisionAuthority, false);
  assert.equal(search.authorizationAuthority, false);
});

test('M03S10-22 responsive-flow-includes-seven-material-sections', () => {
  const responsive = buildJourney().responsive;
  assert.equal(responsive.sectionCount, 7);
  assert.equal(responsive.searchIncluded, true);
});

test('M03S10-23 responsive-section-order-is-preserved', () => {
  assert.deepEqual(buildJourney().responsive.sectionOrder, [
    ResponsiveSectionKind.DASHBOARD,
    ResponsiveSectionKind.PASSPORT_SUMMARY,
    ResponsiveSectionKind.CREDENTIAL_CARD,
    ResponsiveSectionKind.EXPLANATION,
    ResponsiveSectionKind.TIMELINE,
    ResponsiveSectionKind.GUIDANCE,
    ResponsiveSectionKind.SEARCH_RESULT,
  ]);
});

test('M03S10-24 mobile-and-web-preserve-identical-governed-content', () => {
  const mobile = buildJourney({ surface: ResponsiveSurfaceKind.MOBILE, sizeClass: ResponsiveSizeClass.COMPACT });
  const web = buildJourney({ surface: ResponsiveSurfaceKind.WEB, sizeClass: ResponsiveSizeClass.EXPANDED });
  assert.deepEqual(mobile.responsive.sections.map((item) => item.content), web.responsive.sections.map((item) => item.content));
  assert.deepEqual(mobile.responsive.sectionOrder, web.responsive.sectionOrder);
});

test('M03S10-25 compact-flow-hides-no-material-section', () => {
  const responsive = buildJourney({ surface: ResponsiveSurfaceKind.MOBILE, sizeClass: ResponsiveSizeClass.COMPACT }).responsive;
  assert.equal(responsive.sections.every((item) => item.availability === ResponsiveSectionAvailability.ALWAYS_AVAILABLE), true);
  assert.equal(responsive.sectionCount, 7);
});

test('M03S10-26 expanded-layout-changes-layout-not-truth', () => {
  const compact = buildJourney({ surface: ResponsiveSurfaceKind.WEB, sizeClass: ResponsiveSizeClass.COMPACT });
  const expanded = buildJourney({ surface: ResponsiveSurfaceKind.WEB, sizeClass: ResponsiveSizeClass.EXPANDED });
  assert.notEqual(compact.responsive.profile.layoutMode, expanded.responsive.profile.layoutMode);
  assert.equal(expanded.responsive.profile.layoutMode, ResponsiveLayoutMode.TWO_PANE_MASTER_DETAIL);
  assert.equal(compact.responsive.eligibilityOutcome, expanded.responsive.eligibilityOutcome);
  assert.equal(compact.responsive.provenanceIdentity, expanded.responsive.provenanceIdentity);
});

test('M03S10-27 accessibility-section-count-matches-responsive-flow', () => {
  const journey = buildJourney();
  assert.equal(journey.accessibility.sectionCount, journey.responsive.sectionCount);
  assert.deepEqual(journey.accessibility.sections.map((item) => item.kind), journey.responsive.sectionOrder);
});

test('M03S10-28 all-material-sections-are-keyboard-reachable', () => {
  const accessibility = buildJourney().accessibility;
  assert.equal(accessibility.keyboardTraversal, AccessibilityKeyboardTraversal.GOVERNED_SECTION_ORDER);
  assert.equal(accessibility.sections.every((item) => item.keyboardReachable === true), true);
  assert.deepEqual(accessibility.sections.map((item) => item.keyboardOrder), [1, 2, 3, 4, 5, 6, 7]);
});

test('M03S10-29 all-material-sections-are-screen-reader-visible', () => {
  const accessibility = buildJourney().accessibility;
  assert.equal(accessibility.sections.every((item) => item.screenReaderVisible === true), true);
  assert.equal(accessibility.sections.every((item) => item.localizedLabel.length > 0), true);
});

test('M03S10-30 status-meaning-is-never-color-only', () => {
  const accessibility = buildJourney().accessibility;
  assert.equal(accessibility.sections.every((item) => item.colorOnlyMeaning === false), true);
  assert.equal(accessibility.sections.every((item) => item.statusMeaningMode === AccessibilityStatusMeaningMode.TEXT_AND_MACHINE_SEMANTICS), true);
});

test('M03S10-31 cs-cz-localization-renders-human-labels', () => {
  const accessibility = buildJourney({ locale: PresentationLocale.CS_CZ }).accessibility;
  assert.equal(accessibility.locale, 'cs-CZ');
  assert.equal(accessibility.sections[0]?.localizedLabel, 'Přehled');
  assert.equal(accessibility.sections.at(-1)?.localizedLabel, 'Výsledky hledání');
});

test('M03S10-32 en-gb-localization-renders-human-labels', () => {
  const accessibility = buildJourney({ locale: PresentationLocale.EN_GB }).accessibility;
  assert.equal(accessibility.locale, 'en-GB');
  assert.equal(accessibility.sections[0]?.localizedLabel, 'Overview');
  assert.equal(accessibility.sections.at(-1)?.localizedLabel, 'Search results');
});

test('M03S10-33 locale-switch-preserves-machine-semantics', () => {
  const cs = buildJourney({ locale: PresentationLocale.CS_CZ }).accessibility;
  const en = buildJourney({ locale: PresentationLocale.EN_GB }).accessibility;
  assert.deepEqual(
    cs.sections.map((item) => item.statusSemantics.map((semantic) => semantic.machineCode)),
    en.sections.map((item) => item.statusSemantics.map((semantic) => semantic.machineCode)),
  );
});

test('M03S10-34 locale-switch-preserves-governed-content', () => {
  const cs = buildJourney({ locale: PresentationLocale.CS_CZ }).accessibility;
  const en = buildJourney({ locale: PresentationLocale.EN_GB }).accessibility;
  assert.deepEqual(cs.sections.map((item) => item.content), en.sections.map((item) => item.content));
});

test('M03S10-35 canonical-utc-truth-is-invariant', () => {
  const journey = buildJourney({ locale: PresentationLocale.EN_GB });
  assert.equal(journey.accessibility.canonicalDateTimePresentation, CanonicalDateTimePresentation.SOURCE_VALUE_UNCHANGED);
  assert.equal(journey.accessibility.dateTimeDisplayFormatKey, DateTimeDisplayFormatKey.CANONICAL_UTC_ISO_8601);
  assert.equal(journey.accessibility.ambientTimeZoneConversion, false);
  const dashboardContent = journey.accessibility.sections[0]?.content as { authoritativeEvaluatedAt: string };
  assert.equal(dashboardContent.authoritativeEvaluatedAt, EVALUATED_AT);
});

test('M03S10-36 identity-and-version-binding-is-preserved-end-to-end', () => {
  const journey = buildJourney();
  for (const model of [journey.dashboard, journey.credentialCard, journey.explanation, journey.guidance, journey.responsive, journey.accessibility]) {
    assert.equal(model.assessmentId, ASSESSMENT_ID);
    assert.equal(model.credentialDefinitionId, CREDENTIAL_DEFINITION_ID);
    assert.equal(model.credentialDefinitionVersion, CREDENTIAL_VERSION);
    assert.equal(model.requirementSetId, REQUIREMENT_SET_ID);
    assert.equal(model.requirementSetVersion, REQUIREMENT_VERSION);
  }
});

test('M03S10-37 provenance-identity-is-preserved-end-to-end', () => {
  const journey = buildJourney();
  assert.equal(journey.explanation.provenanceIdentity, DECISION_ID);
  assert.equal(journey.timeline.decisionProvenanceIdentity, DECISION_ID);
  assert.equal(journey.guidance.provenanceIdentity, DECISION_ID);
  assert.equal(journey.responsive.provenanceIdentity, DECISION_ID);
  assert.equal(journey.accessibility.provenanceIdentity, DECISION_ID);
});

test('M03S10-38 all-presentation-authority-flags-remain-zero', () => {
  const journey = buildJourney();
  assert.equal(journey.passport.authorizationAuthority, false);
  assert.equal(journey.dashboard.authorizationAuthority, false);
  assert.equal(journey.passportSummary.authorizationAuthority, false);
  assert.equal(journey.credentialCard.authorizationAuthority, false);
  assert.equal(journey.explanation.authorizationAuthority, false);
  assert.equal(journey.explanation.decisionAuthority, false);
  assert.equal(journey.timeline.authorizationAuthority, false);
  assert.equal(journey.timeline.decisionAuthority, false);
  assert.equal(journey.guidance.authorizationAuthority, false);
  assert.equal(journey.guidance.decisionAuthority, false);
  assert.equal(journey.guidance.actionRecommendationAuthority, false);
  assert.equal(journey.search.searchAuthority, false);
  assert.equal(journey.search.rankingAuthority, false);
  assert.equal(journey.search.decisionAuthority, false);
  assert.equal(journey.search.authorizationAuthority, false);
  assert.equal(journey.responsive.layoutAuthority, false);
  assert.equal(journey.responsive.decisionAuthority, false);
  assert.equal(journey.responsive.authorizationAuthority, false);
  assert.equal(journey.accessibility.accessibilityAuthority, false);
  assert.equal(journey.accessibility.localizationAuthority, false);
  assert.equal(journey.accessibility.decisionAuthority, false);
  assert.equal(journey.accessibility.authorizationAuthority, false);
});

test('M03S10-39 serialized-journey-has-no-authorization-grant-or-valid-collapse', () => {
  const journey = buildJourney();
  const serialized = JSON.stringify({
    dashboard: journey.dashboard.toJSON(),
    card: journey.credentialCard.toJSON(),
    explanation: journey.explanation.toJSON(),
    timeline: journey.timeline.toJSON(),
    guidance: journey.guidance.toJSON(),
    search: journey.search.toJSON(),
    responsive: journey.responsive.toJSON(),
    accessibility: journey.accessibility.toJSON(),
  });
  assert.doesNotMatch(serialized, /AuthorizationGrant/);
  assert.doesNotMatch(serialized, /"valid"\s*:/i);
});

test('M03S10-40 deterministic-serialization-and-immutability', () => {
  const first = buildJourney();
  const second = buildJourney();
  assert.equal(JSON.stringify(first.accessibility.toJSON()), JSON.stringify(second.accessibility.toJSON()));
  assert.equal(Object.isFrozen(first.responsive), true);
  assert.equal(Object.isFrozen(first.responsive.sections), true);
  assert.equal(Object.isFrozen(first.accessibility), true);
  assert.equal(Object.isFrozen(first.accessibility.sections), true);
});

test('M03S10-41 cross-subject-search-fails-closed', () => {
  const journey = buildJourney();
  const query = IntentSearchQuery.create({
    subject: otherSubject,
    intent: IntentSearchIntent.CREDENTIAL,
    terms: [CREDENTIAL_DEFINITION_ID],
  });
  assert.throws(() => IntentSearchReadModel.search({ query, models: journey.searchModels }), /subject/i);
});

test('M03S10-42 missing-localization-fails-closed-and-architecture-boundaries-hold', () => {
  const journey = buildJourney();
  assert.throws(() => AccessibilityLocalizationReadModel.compose({
    flow: journey.responsive,
    catalog: localizationCatalog(PresentationLocale.CS_CZ, ['section.dashboard']),
    semanticLabels: semanticLabels(),
  }), /section.dashboard/);

  const files = [
    'packages/application/src/dashboard/dashboard-read-model.ts',
    'packages/application/src/passport/professional-passport.ts',
    'packages/application/src/passport/professional-passport-summary.ts',
    'packages/application/src/credential-card/credential-card-read-model.ts',
    'packages/application/src/explanation/credential-explanation-read-model.ts',
    'packages/application/src/timeline/activity-timeline-read-model.ts',
    'packages/application/src/guidance/missing-condition-next-action-read-model.ts',
    'packages/application/src/search/intent-search-read-model.ts',
    'packages/application/src/responsive/responsive-read-flow.ts',
    'packages/application/src/accessibility/accessibility-localization-read-model.ts',
  ];
  const source = files.map((path) => readFileSync(path, 'utf8')).join('\n');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|next|vue|svelte|@angular|flutter|swiftui|openai|@anthropic-ai|aws-sdk|@aws-sdk)/i);
  assert.doesNotMatch(source, /\bwindow\.|\bnavigator\.|globalThis\.document|document\.(?:querySelector|getElementById|createElement|body|addEventListener)|userAgent|matchMedia|screen\.width|innerWidth/);
  assert.doesNotMatch(source, /\bIntl\.|Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /\bAuthorizationGrant\b|\bQualificationPath\b|\bCredentialCatalog\b|EligibilityAssessment\.evaluate/);
});
