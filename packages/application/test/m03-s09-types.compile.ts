import {
  AccessibilityLocalizationReadModel,
  LocalizationCatalog,
  LocalizationCatalogEntry,
  MachineSemanticLabelReference,
  PresentationLocale,
  ResponsiveReadFlowReadModel,
} from '../src/index.ts';

const catalog = LocalizationCatalog.create({
  locale: PresentationLocale.CS_CZ,
  entries: [LocalizationCatalogEntry.create({ key: 'section.dashboard', text: 'Přehled' })],
});

const semantic = MachineSemanticLabelReference.create({
  machineCode: 'VERIFIED',
  labelKey: 'status.verified',
});

const literalLocale: 'cs-CZ' = catalog.locale;
const localizationAuthority: false = catalog.localizationAuthority;
const semanticAuthority: false = semantic.localizationAuthority;
void literalLocale;
void localizationAuthority;
void semanticAuthority;

declare const flow: ResponsiveReadFlowReadModel;
declare const model: AccessibilityLocalizationReadModel;

const accessibilityAuthority: false = model.accessibilityAuthority;
const modelLocalizationAuthority: false = model.localizationAuthority;
const decisionAuthority: false = model.decisionAuthority;
const authorizationAuthority: false = model.authorizationAuthority;
const ambientTimeZoneConversion: false = model.ambientTimeZoneConversion;
const keyboardReachable: true = model.sections[0]!.keyboardReachable;
const screenReaderVisible: true = model.sections[0]!.screenReaderVisible;
const colorOnlyMeaning: false = model.sections[0]!.colorOnlyMeaning;
void accessibilityAuthority;
void modelLocalizationAuthority;
void decisionAuthority;
void authorizationAuthority;
void ambientTimeZoneConversion;
void keyboardReachable;
void screenReaderVisible;
void colorOnlyMeaning;

AccessibilityLocalizationReadModel.compose({
  flow,
  catalog,
  semanticLabels: [semantic],
});

// @ts-expect-error locale is controlled and cannot accept arbitrary language tags
LocalizationCatalog.create({ locale: 'de-DE', entries: catalog.entries });

// @ts-expect-error localization catalog entries are readonly
catalog.entries.push(LocalizationCatalogEntry.create({ key: 'section.other', text: 'Other' }));

// @ts-expect-error read-model sections are readonly
model.sections = [];

// @ts-expect-error section keyboard order is immutable
model.sections[0]!.keyboardOrder = 99;

// @ts-expect-error machine semantic code is immutable
semantic.machineCode = 'CHANGED';
