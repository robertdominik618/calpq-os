import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  SubjectId,
  SubjectKind,
  SubjectReference,
} from '../../core/src/index.ts';
import {
  AccessibilityKeyboardTraversal,
  AccessibilityLandmarkRole,
  AccessibilityLocalizationReadModel,
  AccessibilityStatusMeaningMode,
  CanonicalDateTimePresentation,
  DateTimeDisplayFormatKey,
  LocalizationCatalog,
  LocalizationCatalogEntry,
  MachineSemanticLabelReference,
  PresentationLocale,
  ResponsivePane,
  ResponsivePresentationProfile,
  ResponsiveReadFlowReadModel,
  ResponsiveReadSection,
  ResponsiveSectionKind,
  ResponsiveSizeClass,
  ResponsiveSurfaceKind,
} from '../src/index.ts';

const subject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079901'),
  SubjectKind.PERSON,
);

const CS_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  'section.dashboard': 'Přehled',
  'section.passport_summary': 'Profesní pas',
  'section.credential_card': 'Karta oprávnění',
  'section.explanation': 'Vysvětlení',
  'section.timeline': 'Historie',
  'section.guidance': 'Další kroky',
  'section.search_result': 'Výsledky hledání',
  'status.not_satisfied': 'Nesplněno',
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
  'status.available': 'Available',
  'status.verified': 'Verified',
  'status.source_not_available': 'Source not available',
  'status.no_governed_action': 'Governed next action not available',
});

function catalog(
  locale: typeof PresentationLocale[keyof typeof PresentationLocale] = PresentationLocale.CS_CZ,
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
    MachineSemanticLabelReference.create({ machineCode: 'AVAILABLE', labelKey: 'status.available' }),
    MachineSemanticLabelReference.create({ machineCode: 'VERIFIED', labelKey: 'status.verified' }),
    MachineSemanticLabelReference.create({ machineCode: 'SOURCE_NOT_AVAILABLE', labelKey: 'status.source_not_available' }),
    MachineSemanticLabelReference.create({
      machineCode: 'NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS',
      labelKey: 'status.no_governed_action',
    }),
  ]);
}

function section(kind: typeof ResponsiveSectionKind[keyof typeof ResponsiveSectionKind], order: number, content: unknown) {
  return ResponsiveReadSection.create({
    kind,
    order,
    pane: ResponsivePane.PRIMARY,
    sourceReference: `${kind.toLowerCase()}:source-${order}`,
    content,
  });
}

function flow(input: {
  readonly includeSearch?: boolean;
  readonly surface?: typeof ResponsiveSurfaceKind[keyof typeof ResponsiveSurfaceKind];
  readonly sizeClass?: typeof ResponsiveSizeClass[keyof typeof ResponsiveSizeClass];
  readonly layoutAuthority?: boolean;
  readonly decisionAuthority?: boolean;
  readonly authorizationAuthority?: boolean;
} = {}): ResponsiveReadFlowReadModel {
  const sections = [
    section(ResponsiveSectionKind.DASHBOARD, 0, Object.freeze({
      eligibilityOutcome: 'NOT_SATISFIED',
      authoritativeEvaluatedAt: '2026-09-15T18:00:00.000Z',
    })),
    section(ResponsiveSectionKind.PASSPORT_SUMMARY, 1, Object.freeze({
      generatedAt: '2026-09-15T18:05:00.000Z',
      credentialCount: 1,
    })),
    section(ResponsiveSectionKind.CREDENTIAL_CARD, 2, Object.freeze({
      document: Object.freeze({ availability: 'AVAILABLE' }),
      verification: Object.freeze({ verificationStatus: 'VERIFIED' }),
      eligibility: Object.freeze({ outcome: 'NOT_SATISFIED', evaluatedAt: '2026-09-15T18:00:00.000Z' }),
      lifecycle: Object.freeze({ availability: 'SOURCE_NOT_AVAILABLE' }),
    })),
    section(ResponsiveSectionKind.EXPLANATION, 3, Object.freeze({
      document: Object.freeze({ explanationAvailability: 'AVAILABLE' }),
      eligibility: Object.freeze({ sourceDetailAvailability: 'SOURCE_NOT_AVAILABLE' }),
    })),
    section(ResponsiveSectionKind.TIMELINE, 4, Object.freeze({
      events: Object.freeze([Object.freeze({ occurredAt: '2026-09-15T18:00:00.000Z', kind: 'ELIGIBILITY_EVALUATED' })]),
    })),
    section(ResponsiveSectionKind.GUIDANCE, 5, Object.freeze({
      missingConditions: Object.freeze([Object.freeze({
        state: 'NOT_SATISFIED',
        nextActionAvailability: 'NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS',
      })]),
    })),
  ];
  if (input.includeSearch === true) {
    sections.push(section(ResponsiveSectionKind.SEARCH_RESULT, 6, Object.freeze({
      resultCount: 1,
      hits: Object.freeze([Object.freeze({ recordId: 'credential-1' })]),
    })));
  }

  const value = Object.create(ResponsiveReadFlowReadModel.prototype) as Record<string, unknown>;
  Object.assign(value, {
    profile: ResponsivePresentationProfile.create({
      surface: input.surface ?? ResponsiveSurfaceKind.WEB,
      sizeClass: input.sizeClass ?? ResponsiveSizeClass.MEDIUM,
    }),
    subject,
    assessmentId: 'assessment-009',
    credentialDefinitionId: 'credential-definition-009',
    credentialDefinitionVersion: 'v9',
    requirementSetId: 'requirement-set-009',
    requirementSetVersion: 'v9',
    eligibilityOutcome: 'NOT_SATISFIED',
    provenanceIdentity: 'decision-009',
    ordering: 'GOVERNED_READ_FLOW_NON_CAUSAL',
    sectionOrder: Object.freeze(sections.map((item) => item.kind)),
    sections: Object.freeze(sections),
    sectionCount: sections.length,
    searchIncluded: input.includeSearch === true,
    layoutAuthority: input.layoutAuthority ?? false,
    decisionAuthority: input.decisionAuthority ?? false,
    authorizationAuthority: input.authorizationAuthority ?? false,
  });
  return Object.freeze(value) as unknown as ResponsiveReadFlowReadModel;
}

function compose(input: {
  readonly flowValue?: ResponsiveReadFlowReadModel;
  readonly catalogValue?: LocalizationCatalog;
  readonly semanticValues?: readonly MachineSemanticLabelReference[];
} = {}) {
  return AccessibilityLocalizationReadModel.compose({
    flow: input.flowValue ?? flow(),
    catalog: input.catalogValue ?? catalog(),
    semanticLabels: input.semanticValues ?? semanticLabels(),
  });
}

test('M03S09-01 responsive-flow-input-required', () => {
  assert.throws(() => AccessibilityLocalizationReadModel.compose({
    flow: {} as ResponsiveReadFlowReadModel,
    catalog: catalog(),
    semanticLabels: semanticLabels(),
  }), TypeError);
});

test('M03S09-02 localization-catalog-input-required', () => {
  assert.throws(() => AccessibilityLocalizationReadModel.compose({
    flow: flow(),
    catalog: {} as LocalizationCatalog,
    semanticLabels: semanticLabels(),
  }), TypeError);
});

test('M03S09-03 locale-is-controlled', () => {
  assert.throws(() => LocalizationCatalog.create({
    locale: 'de-DE' as typeof PresentationLocale[keyof typeof PresentationLocale],
    entries: [LocalizationCatalogEntry.create({ key: 'section.dashboard', text: 'Übersicht' })],
  }), TypeError);
});

test('M03S09-04 catalog-entry-type-required', () => {
  assert.throws(() => LocalizationCatalog.create({
    locale: PresentationLocale.CS_CZ,
    entries: [{} as LocalizationCatalogEntry],
  }), TypeError);
});

test('M03S09-05 catalog-duplicate-keys-rejected', () => {
  const one = LocalizationCatalogEntry.create({ key: 'section.dashboard', text: 'Přehled' });
  const two = LocalizationCatalogEntry.create({ key: 'section.dashboard', text: 'Jiný přehled' });
  assert.throws(() => LocalizationCatalog.create({ locale: PresentationLocale.CS_CZ, entries: [one, two] }), TypeError);
});

test('M03S09-06 catalog-text-required', () => {
  assert.throws(() => LocalizationCatalogEntry.create({ key: 'section.dashboard', text: '   ' }), TypeError);
});

test('M03S09-07 semantic-reference-preserves-exact-machine-code', () => {
  assert.throws(() => MachineSemanticLabelReference.create({
    machineCode: ' VERIFIED ',
    labelKey: 'status.verified',
  }), TypeError);
  assert.equal(semanticLabels()[2]?.machineCode, 'VERIFIED');
});

test('M03S09-08 semantic-label-type-required', () => {
  assert.throws(() => compose({ semanticValues: [{} as MachineSemanticLabelReference] }), TypeError);
});

test('M03S09-09 duplicate-semantic-code-rejected', () => {
  const values = [...semanticLabels(), MachineSemanticLabelReference.create({
    machineCode: 'VERIFIED',
    labelKey: 'status.verified',
  })];
  assert.throws(() => compose({ semanticValues: values }), TypeError);
});

test('M03S09-10 missing-semantic-reference-fails-closed', () => {
  assert.throws(() => compose({ semanticValues: semanticLabels().filter((item) => item.machineCode !== 'VERIFIED') }), /VERIFIED/);
});

test('M03S09-11 extra-semantic-reference-fails-closed', () => {
  const values = [...semanticLabels(), MachineSemanticLabelReference.create({
    machineCode: 'EXTRA_NOT_IN_FLOW',
    labelKey: 'status.verified',
  })];
  assert.throws(() => compose({ semanticValues: values }), /not present/);
});

test('M03S09-12 missing-section-localization-fails-closed', () => {
  assert.throws(() => compose({ catalogValue: catalog(PresentationLocale.CS_CZ, ['section.dashboard']) }), /section.dashboard/);
});

test('M03S09-13 missing-semantic-localization-fails-closed', () => {
  assert.throws(() => compose({ catalogValue: catalog(PresentationLocale.CS_CZ, ['status.verified']) }), /status.verified/);
});

test('M03S09-14 authoritative-responsive-source-rejected', () => {
  assert.throws(() => compose({ flowValue: flow({ decisionAuthority: true }) }), TypeError);
  assert.throws(() => compose({ flowValue: flow({ authorizationAuthority: true }) }), TypeError);
});

test('M03S09-15 dashboard-main-landmark', () => {
  const model = compose();
  assert.equal(model.sections[0]?.landmarkRole, AccessibilityLandmarkRole.MAIN);
});

test('M03S09-16 search-search-landmark', () => {
  const model = compose({ flowValue: flow({ includeSearch: true }) });
  assert.equal(model.sections.at(-1)?.landmarkRole, AccessibilityLandmarkRole.SEARCH);
});

test('M03S09-17 non-dashboard-sections-region-landmarks', () => {
  const model = compose();
  assert.equal(model.sections.slice(1).every((item) => item.landmarkRole === AccessibilityLandmarkRole.REGION), true);
});

test('M03S09-18 heading-levels-semantic', () => {
  const model = compose();
  assert.equal(model.sections[0]?.headingLevel, 1);
  assert.equal(model.sections.slice(1).every((item) => item.headingLevel === 2), true);
});

test('M03S09-19 keyboard-order-follows-governed-order', () => {
  const model = compose();
  assert.deepEqual(model.sections.map((item) => item.keyboardOrder), [1, 2, 3, 4, 5, 6]);
  assert.equal(model.keyboardTraversal, AccessibilityKeyboardTraversal.GOVERNED_SECTION_ORDER);
});

test('M03S09-20 keyboard-reachability-all-sections', () => {
  assert.equal(compose().sections.every((item) => item.keyboardReachable === true), true);
});

test('M03S09-21 screen-reader-visibility-all-sections', () => {
  assert.equal(compose().sections.every((item) => item.screenReaderVisible === true && item.localizedLabel.length > 0), true);
});

test('M03S09-22 status-meaning-never-color-only', () => {
  const model = compose();
  assert.equal(model.sections.every((item) => item.colorOnlyMeaning === false), true);
  assert.equal(model.sections.every((item) => item.statusMeaningMode === AccessibilityStatusMeaningMode.TEXT_AND_MACHINE_SEMANTICS), true);
  assert.equal(model.sections.flatMap((item) => item.statusSemantics).every((item) => item.colorIndependent === true), true);
});

test('M03S09-23 status-semantics-preserve-machine-code', () => {
  const codes = new Set(compose().sections.flatMap((item) => item.statusSemantics.map((semantic) => semantic.machineCode)));
  assert.deepEqual([...codes].sort(), [
    'AVAILABLE',
    'NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS',
    'NOT_SATISFIED',
    'SOURCE_NOT_AVAILABLE',
    'VERIFIED',
  ]);
});

test('M03S09-24 cs-cz-localized-labels', () => {
  const model = compose({ catalogValue: catalog(PresentationLocale.CS_CZ) });
  assert.equal(model.locale, 'cs-CZ');
  assert.equal(model.sections[0]?.localizedLabel, 'Přehled');
  assert.equal(model.sections.flatMap((item) => item.statusSemantics).find((item) => item.machineCode === 'VERIFIED')?.localizedText, 'Ověřeno');
});

test('M03S09-25 en-gb-localized-labels', () => {
  const model = compose({ catalogValue: catalog(PresentationLocale.EN_GB) });
  assert.equal(model.locale, 'en-GB');
  assert.equal(model.sections[0]?.localizedLabel, 'Overview');
  assert.equal(model.sections.flatMap((item) => item.statusSemantics).find((item) => item.machineCode === 'VERIFIED')?.localizedText, 'Verified');
});

test('M03S09-26 locale-switch-preserves-section-metadata', () => {
  const source = flow({ includeSearch: true });
  const cs = compose({ flowValue: source, catalogValue: catalog(PresentationLocale.CS_CZ) });
  const en = compose({ flowValue: source, catalogValue: catalog(PresentationLocale.EN_GB) });
  assert.deepEqual(
    cs.sections.map((item) => [item.kind, item.order, item.pane, item.keyboardOrder, item.sourceReference]),
    en.sections.map((item) => [item.kind, item.order, item.pane, item.keyboardOrder, item.sourceReference]),
  );
});

test('M03S09-27 locale-switch-preserves-governed-content', () => {
  const source = flow();
  const cs = compose({ flowValue: source, catalogValue: catalog(PresentationLocale.CS_CZ) });
  const en = compose({ flowValue: source, catalogValue: catalog(PresentationLocale.EN_GB) });
  assert.deepEqual(cs.sections.map((item) => item.content), en.sections.map((item) => item.content));
  assert.equal(cs.sections[0]?.content, source.sections[0]?.content);
});

test('M03S09-28 locale-switch-preserves-machine-semantics', () => {
  const source = flow();
  const cs = compose({ flowValue: source, catalogValue: catalog(PresentationLocale.CS_CZ) });
  const en = compose({ flowValue: source, catalogValue: catalog(PresentationLocale.EN_GB) });
  assert.deepEqual(
    cs.sections.map((item) => item.statusSemantics.map((semantic) => semantic.machineCode)),
    en.sections.map((item) => item.statusSemantics.map((semantic) => semantic.machineCode)),
  );
});

test('M03S09-29 source-references-preserved', () => {
  const source = flow({ includeSearch: true });
  const model = compose({ flowValue: source });
  assert.deepEqual(model.sections.map((item) => item.sourceReference), source.sections.map((item) => item.sourceReference));
});

test('M03S09-30 canonical-utc-content-preserved', () => {
  const source = flow();
  const model = compose({ flowValue: source });
  const dashboard = model.sections[0]?.content as { authoritativeEvaluatedAt: string };
  const card = model.sections[2]?.content as { eligibility: { evaluatedAt: string } };
  assert.equal(dashboard.authoritativeEvaluatedAt, '2026-09-15T18:00:00.000Z');
  assert.equal(card.eligibility.evaluatedAt, '2026-09-15T18:00:00.000Z');
});

test('M03S09-31 canonical-time-policy-does-not-convert-timezone', () => {
  const model = compose();
  assert.equal(model.canonicalDateTimePresentation, CanonicalDateTimePresentation.SOURCE_VALUE_UNCHANGED);
  assert.equal(model.dateTimeDisplayFormatKey, DateTimeDisplayFormatKey.CANONICAL_UTC_ISO_8601);
  assert.equal(model.ambientTimeZoneConversion, false);
});

test('M03S09-32 search-section-is-optional-and-localized-when-present', () => {
  const without = compose();
  const withSearch = compose({ flowValue: flow({ includeSearch: true }) });
  assert.equal(without.sections.some((item) => item.kind === ResponsiveSectionKind.SEARCH_RESULT), false);
  assert.equal(withSearch.sections.at(-1)?.kind, ResponsiveSectionKind.SEARCH_RESULT);
  assert.equal(withSearch.sections.at(-1)?.localizedLabel, 'Výsledky hledání');
});

test('M03S09-33 root-nested-catalog-immutability-and-deterministic-serialization', () => {
  const first = compose();
  const second = compose();
  assert.equal(Object.isFrozen(first), true);
  assert.equal(Object.isFrozen(first.sections), true);
  assert.equal(Object.isFrozen(first.sections[0]), true);
  assert.equal(Object.isFrozen(first.sections[2]?.statusSemantics), true);
  assert.equal(Object.isFrozen(catalog().entries), true);
  assert.equal(JSON.stringify(first.toJSON()), JSON.stringify(second.toJSON()));
});

test('M03S09-34 authority-zero-and-architecture-boundary', () => {
  const model = compose({ flowValue: flow({ surface: ResponsiveSurfaceKind.MOBILE, sizeClass: ResponsiveSizeClass.COMPACT }) });
  assert.equal(model.accessibilityAuthority, false);
  assert.equal(model.localizationAuthority, false);
  assert.equal(model.decisionAuthority, false);
  assert.equal(model.authorizationAuthority, false);
  assert.equal(model.sections.every((item) => item.accessibilityAuthority === false && item.localizationAuthority === false && item.decisionAuthority === false), true);

  const source = readFileSync('packages/application/src/accessibility/accessibility-localization-read-model.ts', 'utf8');
  assert.doesNotMatch(source, /\b(window|document|navigator|userAgent|matchMedia)\b/);
  assert.doesNotMatch(source, /\bIntl\./);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
  assert.doesNotMatch(source, /EligibilityAssessment\.evaluate|AuthorizationGrant|QualificationPath|CredentialCatalog/);
});
