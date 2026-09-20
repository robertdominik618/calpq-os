# M07 S01 (Slice 01 – implementační část 01) — Authoritative Source Registry Implementation Contract

ID: `CALPQ-M07-S01-IMP-0001`  
Entry: `M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY`  
Activation: `docs/planning/m07-s01-activation.json`  
Parent decision: `CALPQ-M07-ADM-DEC-0001`

## Status

`ACTIVE AFTER VERIFIED ADMISSION / CORE-ONLY IMPLEMENTATION AUTHORIZED / RELEASE NOT AUTHORIZED`

This contract implements only the deterministic Core registry for authoritative regulatory sources. It does not fetch live sources, interpret law, decide applicability, trigger compliance actions, notify users, or create production integrations.

## Functional model

Each source record MUST preserve, at minimum:

1. stable source identity;
2. authoritative issuer identity;
3. canonical source reference or locator;
4. jurisdiction;
5. affected domain;
6. source type/classification;
7. source version identity where known;
8. publication date where known;
9. retrieval instant where known;
10. effective-from and effective-to bounds where known;
11. verification/review state;
12. provenance back to the source material;
13. explicit review reason where status is stale or review-required.

Supported verification semantics are closed to:

- `VERIFIED`;
- `UNVERIFIED`;
- `STALE_REVIEW_REQUIRED`.

The public label `STALE/REVIEW_REQUIRED` from `CALPQ-REG-0001` maps to the machine-safe enum member `STALE_REVIEW_REQUIRED`.

## Deterministic invariants

- Registry identity is not legal applicability.
- A VERIFIED source is not automatically an applicable legal rule.
- Parser, OCR, AI summary, classifier confidence or candidate mapping cannot upgrade a source to VERIFIED.
- Effective dates are distinct from publication, retrieval, verification and evaluation instants.
- Historical evaluations retain their historical source/version references.
- Unknown dates remain unknown; no date is invented.
- Canonical references are preserved as supplied after deterministic validation; the Core does not dereference URLs.
- Source identity and source version identity are separate concepts.
- Duplicate source identities are rejected by registry construction.
- Duplicate canonical references are allowed only when source identities are distinct and the caller explicitly models distinct versions/records.
- `effective_to` earlier than `effective_from` is invalid.
- No mutable singleton, network access, filesystem access, clock access or provider dependency is permitted in Core.

## Allowed product paths

Only these implementation paths are authorized by S01:

- `packages/core/src/regulatory/authoritative-source-registry.ts`
- `packages/core/src/regulatory/index.ts`
- `packages/core/test/m07-s01-authoritative-source-registry.test.ts`
- `packages/core/test/m07-s01-types.compile.ts`
- `packages/core/package.json` only if required by package conventions
- `packages/core/tsconfig.json` only if required by package conventions
- `tests/m07_s01_authoritative_source_registry_test.sh`
- `.github/workflows/m07-s01-authoritative-source-registry.yml`
- `docs/planning/M07_S01_EXIT_EVIDENCE.md`

Different paths require a separate reviewed scope change.

## Explicit exclusions

S01 does NOT authorize:

- provider/adapters;
- production HTTP fetching;
- scraping;
- databases or persistence;
- Application-layer orchestration;
- UI;
- background jobs;
- notifications;
- automatic regulatory-change decisions;
- M04 RequirementSet mutation;
- M06 reevaluation triggers;
- legal interpretation;
- qualification or eligibility decisions;
- production release;
- S02–S10.

## Acceptance boundary

S01 can be considered implementation-complete only when:

1. all indexed S01 scenarios pass;
2. type-level readonly proof passes;
3. architecture boundaries pass;
4. exact S01 changed-path gate passes;
5. predecessor M07 admission validation still passes;
6. no unauthorized path is changed;
7. exact-head CI is green;
8. exit evidence is generated from the exact reviewed head;
9. separate owner approval is obtained before merge.

Merge alone does not authorize S02.

**source registry != legal rule; VERIFIED source != automatic applicability; effective date != authority event; parser output != VERIFIED truth**
