import { SubjectReference } from '../../../core/src/index.ts';
import {
  ResponsivePane,
  ResponsiveReadFlowReadModel,
  ResponsiveReadSection,
  ResponsiveSectionKind,
} from '../responsive/responsive-read-flow.ts';

function requiredMachineCode(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  if (value.length === 0 || value.trim().length === 0) throw new TypeError(`${label} must not be empty`);
  if (value !== value.trim()) throw new TypeError(`${label} must preserve exact machine-code whitespace`);
  if (value.length > 200) throw new RangeError(`${label} is too long`);
  return value;
}

function requiredMessageKey(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 160) throw new RangeError(`${label} is too long`);
  if (!/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/.test(normalized)) {
    throw new TypeError(`${label} must use a stable lowercase localization key`);
  }
  return normalized;
}

function requiredLocalizedText(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 500) throw new RangeError(`${label} is too long`);
  return normalized;
}

export const PresentationLocale = {
  CS_CZ: 'cs-CZ',
  EN_GB: 'en-GB',
} as const;
export type PresentationLocale = (typeof PresentationLocale)[keyof typeof PresentationLocale];

export const AccessibilityLandmarkRole = {
  MAIN: 'MAIN',
  REGION: 'REGION',
  SEARCH: 'SEARCH',
} as const;
export type AccessibilityLandmarkRole =
  (typeof AccessibilityLandmarkRole)[keyof typeof AccessibilityLandmarkRole];

export const AccessibilityKeyboardTraversal = {
  GOVERNED_SECTION_ORDER: 'GOVERNED_SECTION_ORDER',
} as const;

export const AccessibilityStatusMeaningMode = {
  TEXT_AND_MACHINE_SEMANTICS: 'TEXT_AND_MACHINE_SEMANTICS',
} as const;

export const CanonicalDateTimePresentation = {
  SOURCE_VALUE_UNCHANGED: 'SOURCE_VALUE_UNCHANGED',
} as const;

export const DateTimeDisplayFormatKey = {
  CANONICAL_UTC_ISO_8601: 'datetime.canonical_utc_iso8601',
} as const;

const SECTION_MESSAGE_KEYS: Readonly<Record<ResponsiveSectionKind, string>> = Object.freeze({
  [ResponsiveSectionKind.DASHBOARD]: 'section.dashboard',
  [ResponsiveSectionKind.PASSPORT_SUMMARY]: 'section.passport_summary',
  [ResponsiveSectionKind.CREDENTIAL_CARD]: 'section.credential_card',
  [ResponsiveSectionKind.EXPLANATION]: 'section.explanation',
  [ResponsiveSectionKind.TIMELINE]: 'section.timeline',
  [ResponsiveSectionKind.GUIDANCE]: 'section.guidance',
  [ResponsiveSectionKind.SEARCH_RESULT]: 'section.search_result',
});

const STATUS_FIELD_NAMES = new Set([
  'eligibilityOutcome',
  'outcome',
  'verificationStatus',
  'verificationRecordState',
  'availability',
  'state',
  'nextActionAvailability',
  'explanationAvailability',
  'sourceDetailAvailability',
  'evidenceReferenceAvailability',
]);

function collectStatusCodes(value: unknown, target: Set<string>): void {
  if (Array.isArray(value)) {
    for (const item of value) collectStatusCodes(item, target);
    return;
  }
  if (value === null || typeof value !== 'object') return;
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (STATUS_FIELD_NAMES.has(key) && typeof item === 'string' && item.length > 0) {
      target.add(item);
    }
    collectStatusCodes(item, target);
  }
}

function statusCodesForSection(section: ResponsiveReadSection): readonly string[] {
  const codes = new Set<string>();
  collectStatusCodes(section.content, codes);
  return Object.freeze([...codes].sort((left, right) => left.localeCompare(right)));
}

function roleForSection(kind: ResponsiveSectionKind): AccessibilityLandmarkRole {
  if (kind === ResponsiveSectionKind.DASHBOARD) return AccessibilityLandmarkRole.MAIN;
  if (kind === ResponsiveSectionKind.SEARCH_RESULT) return AccessibilityLandmarkRole.SEARCH;
  return AccessibilityLandmarkRole.REGION;
}

export class LocalizationCatalogEntry {
  readonly key: string;
  readonly text: string;

  private constructor(key: string, text: string) {
    this.key = key;
    this.text = text;
    Object.freeze(this);
  }

  static create(input: { readonly key: string; readonly text: string }): LocalizationCatalogEntry {
    return new LocalizationCatalogEntry(
      requiredMessageKey(input.key, 'Localization message key'),
      requiredLocalizedText(input.text, 'Localization message text'),
    );
  }

  toJSON() {
    return { key: this.key, text: this.text } as const;
  }
}

export class LocalizationCatalog {
  readonly locale: PresentationLocale;
  readonly entries: readonly LocalizationCatalogEntry[];
  readonly localizationAuthority = false as const;

  readonly #byKey: ReadonlyMap<string, LocalizationCatalogEntry>;

  private constructor(locale: PresentationLocale, entries: readonly LocalizationCatalogEntry[]) {
    this.locale = locale;
    this.entries = Object.freeze([...entries]);
    this.#byKey = new Map(this.entries.map((entry) => [entry.key, entry] as const));
    Object.freeze(this);
  }

  static create(input: {
    readonly locale: PresentationLocale;
    readonly entries: readonly LocalizationCatalogEntry[];
  }): LocalizationCatalog {
    if (!Object.values(PresentationLocale).includes(input.locale)) {
      throw new TypeError('Localization catalog locale must be controlled');
    }
    if (!Array.isArray(input.entries) || input.entries.length === 0) {
      throw new TypeError('Localization catalog requires entries');
    }
    if (input.entries.some((entry) => !(entry instanceof LocalizationCatalogEntry))) {
      throw new TypeError('Localization catalog entries must use LocalizationCatalogEntry');
    }
    const keys = input.entries.map((entry) => entry.key);
    if (new Set(keys).size !== keys.length) {
      throw new TypeError('Localization catalog cannot contain duplicate keys');
    }
    return new LocalizationCatalog(input.locale, input.entries);
  }

  resolve(key: string): string {
    const normalized = requiredMessageKey(key, 'Localization lookup key');
    const entry = this.#byKey.get(normalized);
    if (entry === undefined) throw new TypeError(`Missing localization message ${normalized}`);
    return entry.text;
  }

  toJSON() {
    return {
      locale: this.locale,
      entries: this.entries.map((entry) => entry.toJSON()),
      localizationAuthority: this.localizationAuthority,
    } as const;
  }
}

export class MachineSemanticLabelReference {
  readonly machineCode: string;
  readonly labelKey: string;
  readonly localizationAuthority = false as const;

  private constructor(machineCode: string, labelKey: string) {
    this.machineCode = machineCode;
    this.labelKey = labelKey;
    Object.freeze(this);
  }

  static create(input: {
    readonly machineCode: string;
    readonly labelKey: string;
  }): MachineSemanticLabelReference {
    return new MachineSemanticLabelReference(
      requiredMachineCode(input.machineCode, 'Machine semantic code'),
      requiredMessageKey(input.labelKey, 'Machine semantic label key'),
    );
  }

  toJSON() {
    return {
      machineCode: this.machineCode,
      labelKey: this.labelKey,
      localizationAuthority: this.localizationAuthority,
    } as const;
  }
}

export class AccessibleMachineSemanticPresentation {
  readonly machineCode: string;
  readonly labelKey: string;
  readonly localizedText: string;
  readonly meaningMode = AccessibilityStatusMeaningMode.TEXT_AND_MACHINE_SEMANTICS;
  readonly colorIndependent = true as const;
  readonly localizationAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(reference: MachineSemanticLabelReference, catalog: LocalizationCatalog) {
    this.machineCode = reference.machineCode;
    this.labelKey = reference.labelKey;
    this.localizedText = catalog.resolve(reference.labelKey);
    Object.freeze(this);
  }

  static create(
    reference: MachineSemanticLabelReference,
    catalog: LocalizationCatalog,
  ): AccessibleMachineSemanticPresentation {
    if (!(reference instanceof MachineSemanticLabelReference)) {
      throw new TypeError('Accessible semantic presentation requires MachineSemanticLabelReference');
    }
    if (!(catalog instanceof LocalizationCatalog)) {
      throw new TypeError('Accessible semantic presentation requires LocalizationCatalog');
    }
    return new AccessibleMachineSemanticPresentation(reference, catalog);
  }

  toJSON() {
    return {
      machineCode: this.machineCode,
      labelKey: this.labelKey,
      localizedText: this.localizedText,
      meaningMode: this.meaningMode,
      colorIndependent: this.colorIndependent,
      localizationAuthority: this.localizationAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class AccessibleLocalizedReadSection {
  readonly kind: ResponsiveSectionKind;
  readonly order: number;
  readonly pane: ResponsivePane;
  readonly sourceReference: string;
  readonly content: unknown;
  readonly keyboardOrder: number;
  readonly keyboardReachable = true as const;
  readonly screenReaderVisible = true as const;
  readonly landmarkRole: AccessibilityLandmarkRole;
  readonly headingLevel: 1 | 2;
  readonly labelKey: string;
  readonly localizedLabel: string;
  readonly statusSemantics: readonly AccessibleMachineSemanticPresentation[];
  readonly statusMeaningMode = AccessibilityStatusMeaningMode.TEXT_AND_MACHINE_SEMANTICS;
  readonly colorOnlyMeaning = false as const;
  readonly accessibilityAuthority = false as const;
  readonly localizationAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly source: ResponsiveReadSection;
    readonly catalog: LocalizationCatalog;
    readonly semanticByCode: ReadonlyMap<string, MachineSemanticLabelReference>;
  }) {
    this.kind = input.source.kind;
    this.order = input.source.order;
    this.pane = input.source.pane;
    this.sourceReference = input.source.sourceReference;
    this.content = input.source.content;
    this.keyboardOrder = input.source.order + 1;
    this.landmarkRole = roleForSection(input.source.kind);
    this.headingLevel = input.source.kind === ResponsiveSectionKind.DASHBOARD ? 1 : 2;
    this.labelKey = SECTION_MESSAGE_KEYS[input.source.kind];
    this.localizedLabel = input.catalog.resolve(this.labelKey);
    this.statusSemantics = Object.freeze(statusCodesForSection(input.source).map((code) => {
      const reference = input.semanticByCode.get(code);
      if (reference === undefined) {
        throw new TypeError(`Missing semantic accessibility label for machine code ${code}`);
      }
      return AccessibleMachineSemanticPresentation.create(reference, input.catalog);
    }));
    Object.freeze(this);
  }

  static create(input: {
    readonly source: ResponsiveReadSection;
    readonly catalog: LocalizationCatalog;
    readonly semanticByCode: ReadonlyMap<string, MachineSemanticLabelReference>;
  }): AccessibleLocalizedReadSection {
    if (!(input.source instanceof ResponsiveReadSection)) {
      throw new TypeError('Accessible localized section requires ResponsiveReadSection');
    }
    if (!(input.catalog instanceof LocalizationCatalog)) {
      throw new TypeError('Accessible localized section requires LocalizationCatalog');
    }
    return new AccessibleLocalizedReadSection(input);
  }

  toJSON() {
    return {
      kind: this.kind,
      order: this.order,
      pane: this.pane,
      sourceReference: this.sourceReference,
      content: this.content,
      keyboardOrder: this.keyboardOrder,
      keyboardReachable: this.keyboardReachable,
      screenReaderVisible: this.screenReaderVisible,
      landmarkRole: this.landmarkRole,
      headingLevel: this.headingLevel,
      labelKey: this.labelKey,
      localizedLabel: this.localizedLabel,
      statusSemantics: this.statusSemantics.map((semantic) => semantic.toJSON()),
      statusMeaningMode: this.statusMeaningMode,
      colorOnlyMeaning: this.colorOnlyMeaning,
      accessibilityAuthority: this.accessibilityAuthority,
      localizationAuthority: this.localizationAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export interface AccessibilityLocalizationReadModelInput {
  readonly flow: ResponsiveReadFlowReadModel;
  readonly catalog: LocalizationCatalog;
  readonly semanticLabels: readonly MachineSemanticLabelReference[];
}

export class AccessibilityLocalizationReadModel {
  readonly locale: PresentationLocale;
  readonly subject: SubjectReference;
  readonly assessmentId: string;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly eligibilityOutcome: string;
  readonly provenanceIdentity: string;
  readonly responsiveProfile: ReturnType<ResponsiveReadFlowReadModel['profile']['toJSON']>;
  readonly keyboardTraversal = AccessibilityKeyboardTraversal.GOVERNED_SECTION_ORDER;
  readonly canonicalDateTimePresentation = CanonicalDateTimePresentation.SOURCE_VALUE_UNCHANGED;
  readonly dateTimeDisplayFormatKey = DateTimeDisplayFormatKey.CANONICAL_UTC_ISO_8601;
  readonly ambientTimeZoneConversion = false as const;
  readonly sections: readonly AccessibleLocalizedReadSection[];
  readonly sectionCount: number;
  readonly accessibilityAuthority = false as const;
  readonly localizationAuthority = false as const;
  readonly decisionAuthority = false as const;
  readonly authorizationAuthority = false as const;

  private constructor(input: {
    readonly flow: ResponsiveReadFlowReadModel;
    readonly catalog: LocalizationCatalog;
    readonly sections: readonly AccessibleLocalizedReadSection[];
  }) {
    this.locale = input.catalog.locale;
    this.subject = input.flow.subject;
    this.assessmentId = input.flow.assessmentId;
    this.credentialDefinitionId = input.flow.credentialDefinitionId;
    this.credentialDefinitionVersion = input.flow.credentialDefinitionVersion;
    this.requirementSetId = input.flow.requirementSetId;
    this.requirementSetVersion = input.flow.requirementSetVersion;
    this.eligibilityOutcome = input.flow.eligibilityOutcome;
    this.provenanceIdentity = input.flow.provenanceIdentity;
    this.responsiveProfile = Object.freeze(input.flow.profile.toJSON());
    this.sections = Object.freeze([...input.sections]);
    this.sectionCount = this.sections.length;
    Object.freeze(this);
  }

  static compose(input: AccessibilityLocalizationReadModelInput): AccessibilityLocalizationReadModel {
    if (!(input.flow instanceof ResponsiveReadFlowReadModel)) {
      throw new TypeError('Accessibility/localization foundation requires ResponsiveReadFlowReadModel');
    }
    if (!(input.catalog instanceof LocalizationCatalog)) {
      throw new TypeError('Accessibility/localization foundation requires LocalizationCatalog');
    }
    if (
      input.flow.layoutAuthority !== false ||
      input.flow.decisionAuthority !== false ||
      input.flow.authorizationAuthority !== false
    ) {
      throw new TypeError('Accessibility/localization foundation accepts only non-authoritative responsive input');
    }
    if (!Array.isArray(input.semanticLabels) ||
        input.semanticLabels.some((reference) => !(reference instanceof MachineSemanticLabelReference))) {
      throw new TypeError('Semantic labels must use MachineSemanticLabelReference');
    }

    const semanticCodes = input.semanticLabels.map((reference) => reference.machineCode);
    if (new Set(semanticCodes).size !== semanticCodes.length) {
      throw new TypeError('Semantic labels cannot contain duplicate machine codes');
    }
    const semanticByCode = new Map(input.semanticLabels.map((reference) => [reference.machineCode, reference] as const));

    const requiredCodes = new Set<string>();
    for (const section of input.flow.sections) {
      if (!(section instanceof ResponsiveReadSection)) {
        throw new TypeError('Responsive flow sections must remain governed ResponsiveReadSection values');
      }
      for (const code of statusCodesForSection(section)) requiredCodes.add(code);
    }

    for (const code of requiredCodes) {
      if (!semanticByCode.has(code)) {
        throw new TypeError(`Missing semantic accessibility label for machine code ${code}`);
      }
    }
    for (const code of semanticByCode.keys()) {
      if (!requiredCodes.has(code)) {
        throw new TypeError(`Semantic accessibility label references code not present in governed flow: ${code}`);
      }
    }

    const sections = input.flow.sections.map((section) => AccessibleLocalizedReadSection.create({
      source: section,
      catalog: input.catalog,
      semanticByCode,
    }));

    return new AccessibilityLocalizationReadModel({
      flow: input.flow,
      catalog: input.catalog,
      sections,
    });
  }

  toJSON() {
    return {
      locale: this.locale,
      subject: this.subject.toJSON(),
      assessmentId: this.assessmentId,
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersion: this.credentialDefinitionVersion,
      requirementSetId: this.requirementSetId,
      requirementSetVersion: this.requirementSetVersion,
      eligibilityOutcome: this.eligibilityOutcome,
      provenanceIdentity: this.provenanceIdentity,
      responsiveProfile: this.responsiveProfile,
      keyboardTraversal: this.keyboardTraversal,
      canonicalDateTimePresentation: this.canonicalDateTimePresentation,
      dateTimeDisplayFormatKey: this.dateTimeDisplayFormatKey,
      ambientTimeZoneConversion: this.ambientTimeZoneConversion,
      sectionCount: this.sectionCount,
      sections: this.sections.map((section) => section.toJSON()),
      accessibilityAuthority: this.accessibilityAuthority,
      localizationAuthority: this.localizationAuthority,
      decisionAuthority: this.decisionAuthority,
      authorizationAuthority: this.authorizationAuthority,
    } as const;
  }
}
