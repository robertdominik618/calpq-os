# CALPQ M03 Slice 09 Implementation Contract — Accessibility & Localization Foundations

Status: `COMPLETED / VERIFIED`
ID: `CALPQ-M03-S09-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 08 merge commit `d6ce5ab80b07c8f5802193d33f81437c04e4c21c`.
Tracking issue: #77.
Pull request: #78.
Implementation branch: `impl/m03-s09-accessibility-localization`.
Verified implementation/remediation head: `7c971d0f393c8ee9b13c71974fd98d6205519c9f`.

## Scope
Slice 09 implements the ninth delivery slice from `M03_EXECUTION_PACKAGE.md`: accessibility and localization foundations over the governed responsive read flow established in Slice 08.

The capability is presentation-only. It improves keyboard/screen-reader semantics and localized human wording without changing governed domain or decision meaning.

## Controlled locales
The initial controlled presentation locales are:
- `cs-CZ`;
- `en-GB`.

`LocalizationCatalog` is explicit, immutable and locale-scoped. Missing required messages fail closed. There is no silent fallback to another locale and no ambient locale discovery.

## Machine semantics versus human text
`MachineSemanticLabelReference` binds an exact governed machine code to a stable localization key. The code itself is never translated, normalized, inferred or rewritten.

`AccessibleMachineSemanticPresentation` keeps three separate layers:
1. exact machine code;
2. stable localization key;
3. localized human-readable text.

Changing locale may change layer 3 only. Requirement IDs, reason/status codes, source/evidence IDs, outcomes, provenance identities and authority flags remain invariant.

## Accessibility semantics
Every material responsive section receives explicit framework-neutral metadata:
- deterministic keyboard order derived from governed S08 section order;
- `keyboardReachable = true`;
- `screenReaderVisible = true`;
- controlled landmark role;
- semantic heading level;
- stable label key and localized accessible label;
- textual machine-status semantics with `colorOnlyMeaning = false`.

Dashboard is exposed as the main landmark, optional search results as search landmark, and other material sections as regions. This contract describes semantics; it does not introduce DOM, browser or UI-framework code.

## Temporal semantics
Localization cannot rewrite Core UTC/effective-date truth. Source content is preserved unchanged and the root contract exposes:
- `canonicalDateTimePresentation = SOURCE_VALUE_UNCHANGED`;
- `dateTimeDisplayFormatKey = datetime.canonical_utc_iso8601`;
- `ambientTimeZoneConversion = false`.

Outer UI adapters may later format human display text under separately governed rules, but M03 Slice 09 performs no ambient timezone or `Intl` conversion.

## Responsive semantic parity
The S08 governed `ResponsiveReadFlowReadModel` remains the semantic source. Slice 09 preserves subject, assessment identity, CredentialDefinition/RequirementSet identities and versions, eligibility outcome, provenance identity, responsive section kind/order/pane/source reference and deeply frozen governed content snapshots.

Locale changes and accessibility metadata cannot remove, reorder or rewrite material governed sections.

## Authority boundaries
All new authorities are explicitly false:
- `accessibilityAuthority = false`;
- `localizationAuthority = false`;
- `decisionAuthority = false`;
- `authorizationAuthority = false`.

## Hard boundaries
- no UI framework dependency;
- no DOM/browser/device/user-agent dependency;
- no ambient locale or timezone discovery;
- no `Intl`-driven domain formatting;
- no ambient wall-clock or randomness;
- no eligibility recomputation;
- no verification promotion;
- no lifecycle inference;
- no AuthorizationGrant implication;
- no M04 Credential Catalog / QualificationPath authority;
- no M06 lifecycle authority;
- no AI/provider decision authority;
- no color-only status meaning;
- deterministic serialization and immutable nested output.

## Verified evidence
On remediation head `7c971d0f393c8ee9b13c71974fd98d6205519c9f`:
- dedicated M03 Slice 09 Accessibility Localization #6 — SUCCESS;
- exactly 34/34 mandatory runtime scenarios — PASS;
- strict TypeScript compile-time proof — PASS;
- reviewed Slice 08 ancestry guard — PASS;
- keyboard/screen-reader/non-color-only semantics — PASS;
- `cs-CZ` / `en-GB` locale parity with governed machine semantics invariant — PASS;
- canonical UTC/source-value invariance — PASS;
- direct S08→S01, FV-12 and FV-11 regressions — PASS;
- all 25/25 observed PR-triggered workflows — SUCCESS.

The first dedicated S09 workflow #4 already passed 34/34 runtime tests and failed only in a compile-proof assertion that incorrectly expected a non-generic factory result to narrow `PresentationLocale` to literal `cs-CZ`. Commit `7c971d0f393c8ee9b13c71974fd98d6205519c9f` corrected only that proof to assert the controlled union plus the literal locale constants. No production/domain logic, runtime test or mandatory boundary was removed or weakened.

No mandatory test was waived or deferred. Hard blockers: 0.
