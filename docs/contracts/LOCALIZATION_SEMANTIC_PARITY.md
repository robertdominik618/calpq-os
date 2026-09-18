# CALPQ Shared Localization & Semantic Parity

ID: `CALPQ-EXPAT-0001-C02`; status `OWNER_APPROVED_ARCHITECTURE / RUNTIME_NOT_IMPLEMENTED`.
Parent: [EXPATS](../architecture/CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md). Horizontal applicability: Passport, Paths, Family, Health, B2B, review/admin and all jurisdiction packs.

## Invariants

Locale is a presentation/communication choice, not citizenship, residence, ethnicity, profession eligibility or political preference. Identical evidence, rules, scope and time MUST yield identical domain results across languages. UI/translation code may not evaluate legal conditions. Existing M03 accessibility/localization foundations are reused, not replaced.

## Five separate layers

LAYER-01 Interface: navigation, forms, validation and error copy.
LAYER-02 Rule explanation: version-linked plain-language explanation.
LAYER-03 Official terminology: original Czech term beside translation; original wording remains accessible.
LAYER-04 Documents/submissions: original language, working translation and required recipient/submission language independently identified.
LAYER-05 Communication/learning: notices, audio, practical scenarios and preparation; no certificate implied by practice.

TRUST-01 OFFICIAL_TEXT; TRUST-02 PROFESSIONALLY_REVIEWED_TRANSLATION; TRUST-03 WORKING_TRANSLATION; TRUST-04 AI_EXPLANATION. These labels describe text provenance, not legal effect or individual eligibility. AI-generated text never silently replaces an original or a certified translation.

## Coverage model

`LocalizationCoverage` keys: content_id, content_version, locale, layer, jurisdiction, route_version where applicable, source_version, trust_label, review_status, reviewer_ref, reviewed_at, effective_from/to, supersedes, checksum. Review states include DRAFT, REVIEW_REQUIRED, REVIEWED, STALE, WITHDRAWN. Coverage is per content/route/layer, never only a global percentage for a language.

Named catalogue: cs/en/uk initial intent; sk/vi preparation; ru/de/pl/ro/bg/es/fr/it/pt/tr/ar/zh/mn/ko/ja expansion. Additional selected South/Southeast Asian languages require explicit catalogue admission. These are target locales, not delivered translations. Demand and qualified review capacity decide rollout order within approved scope.

## Publication and fallback

A source/rule update invalidates dependent translations. Machine translation may propose revisions; qualified review publishes critical content. Show source version, last review and original text. An outdated translation is visibly stale, not served as current reviewed guidance. Offer a safe original/other reviewed language or specialist help without inventing comprehension. Essential actions cannot disappear because the UI language lacks expert route coverage. Unavailable route content must not become a fabricated answer.

Pinned legal evaluation must use the authoritative structured rule version, not whichever translated string is newest. Reviewers compare semantic predicates, exceptions, negation, dates, numbers, units, actor duties and scope. Preserve source links and legal distinctions while simplifying wording.

## Identity and date handling

Store original script/name order and separately evidenced aliases/transliterations. Do not translate or overwrite the authoritative identity value. Similar spellings are candidate matches requiring entity-resolution evidence, never automatic merging. Preserve original date string/calendar/timezone and normalized value plus confirmation provenance. Ambiguous date interpretation requires confirmation before a critical deadline is created. Device locale does not decide legal day-count policy.

## Accessibility and platforms

Require RTL mirroring where appropriate without reversing document meaning, screen-reader labels, logical reading order, Dynamic Type/equivalent text scaling, text alternatives to color, keyboard navigation, large tap targets, mobile/iPad/web adaptation, easy Czech and optional audio. Audio/explanation uses the same version/provenance as displayed text. Lock-screen previews remain generic. Apple-native interaction quality is preserved without changing the accepted technology stack.

## Tests and content operations

Cross-language scenario tests compare structured outcomes; pseudo-localization tests catch truncation; reviewed golden fixtures cover Czech/English/Ukrainian semantics, RTL, plurals, negation and numeric/date ambiguity. Test reviewer revocation, stale fallback, inaccessible media and missing locale. A screenshot or translated UI does not prove substantive route review. Human linguistic/sector review is a distinct release gate; automated completeness checks cannot certify it.
