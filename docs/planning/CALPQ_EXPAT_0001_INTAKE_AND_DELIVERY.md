# CALPQ-EXPAT-0001 — Intake, Impact, Delivery and Evidence Contract

Status: `ACCEPTED_TARGET_ARCHITECTURE / IMPLEMENTATION_ADMISSION_SEPARATE`
Date: `2026-09-18`; tracking: [#134](https://github.com/robertdominik618/calpq-os/issues/134).

## Owner decision and source coverage

Exact instruction: „Perfektní se vším souhlasím kompletně EXPATS implementuj do architektury projektu a podej o tom důkaz“.

ACCEPT the complete immediately preceding 12-chapter proposal into architecture. Do not reinterpret this as authorization to merge other PRs, deploy EXPATS, publish jurisdiction rules or activate later milestone slices. The quoted record is a traceable transcription, not cryptographic consent proof. This package is architecture implementation, not a claim of runtime implementation.

| Approved proposal chapter | Preserved target |
|---|---|
| SRC-01 Why / strategic fit | Baseline Position and value; five CALPQ pillars and three user outcomes. |
| SRC-02 User variants | Baseline Personas PER-01–PER-18; composable factual routing. |
| SRC-03 Languages | Baseline Languages and shared Localization contract: 20 named locales, five layers, four trust labels, identity/RTL/accessibility. |
| SRC-04 Functional catalogue | EXP-01–EXP-24 without dropped areas. |
| SRC-05 Differentiators | DIF-01–DIF-06: today, simulation, reuse, dependency plan, rule impact, handoff. |
| SRC-06 User surface | NAV-01–NAV-07 and action-card explanation, not new global tabs. |
| SRC-07 Architecture | Single Core, MobilityCase, existing contracts, Family/Health/Employment interfaces. |
| SRC-08 Sources and AI | Reviewed rule registry, separated evidence types, temporal validity, human review and no AI authority. |
| SRC-09 Privacy and tests | Safeguards, 64 specified product scenarios and separate executed architecture checks. |
| SRC-10 Product/commercial | VAR-01–VAR-09, allowed monetization patterns, anti-lock-in and partner hypotheses. |
| SRC-11 Delivery | PHA-A–PHA-E, dependency gates and outcome/quality metrics. |
| SRC-12 Examples | STORY-01 nurse, STORY-02 mixed family, STORY-03 graduate. |

Supplied CALPQ-PROD-0001 material, including Family/Employment Rev. B, is preserved as product source. Its original statements are not silently upgraded to implementation evidence. Market statistics and external legal examples in the proposal are contextual, not executable policy. New legal content, fees, processing times, eligibility criteria and reviewed translations require their own verified publication process.

## Verified repository baseline

Repository: `robertdominik618/calpq-os`. Integration branch: `planning/program-execution-m09-m12`.
Pinned base commit: `4a3c97e2314b2c8ccdf508123bb9ce5a04b499f0`.
Pinned base tree: `d46508e55f3b7e787ccc21c07f43505ebce8f022`.
These are the reviewed starting point, not a moving assumption about `main`.

At inspection, PR #133 is a separate open draft for formal M06 S01 admission, head `aa266f897f0301ce01f047c44f197c8fd1493c1b`. It is not used as this branch's base and is not altered or implicitly merged. PR #84 is open/unmerged for Vaccination Passport and equal-parent governance, head `5f3b975389f87a0747874167e902b5a4b1331a64`; it remains an explicit integration dependency. ADR-0003 is reserved there, so this pack uses ADR-0004.

Older BOOK/roadmap current-state prose has known drift tracked by #129. This patch adds clearly dated references without rewriting historical acceptance/admission records or certifying all old statements as current.

## Impact analysis and duplicate check

Constitution: preserve architecture-first, quality, simplicity, reuse, documented decisions, testability, no UI business logic, no UI/adapter imports into Core, no provider patching and additive improvements.

No duplicate credential, evidence, recognition, eligibility, family, tax or notification engine is introduced. MobilityCase is application coordination; localization is shared infrastructure; Czech and future countries are independently reviewed jurisdiction packs. Existing EquivalenceRule/RecognitionRoute/RecognitionDecision and AssignmentGuard status contracts remain unchanged.

No production source, public API, dependency, database schema, runtime enum, existing test, existing workflow, admission state, milestone ledger or source publication state is modified. Canonical Foundation Architecture and Book receive append-only EXPATS links. New architecture test tooling validates this pack; it is not a production engine and does not change the selected technology stack.

## Milestone dependencies — not scope injection

| Dependency | EXPATS use | Gate |
|---|---|---|
| M01/M02 | Existing identity, evidence, deterministic evaluation and contracts | Reuse only; no reopening completed work by this patch. |
| M03 | Accessible intent surface and localization foundations | Extend at separately admitted delivery; do not relabel prior UI as translated EXPATS. |
| M04 | Catalog, recognition and paths | Reviewed Czech/foreign mappings, remaining gaps and exact authority scope. |
| M05 | Intake, original/archive, verification and untrusted-content controls | Real provider/storage integration remains explicit, not inferred from tests. |
| M06 | Lifecycles, dependencies, notifications and replay | Current admission/slice scope unchanged; future route-specific work separately admitted. |
| M07 | Source governance and Radar | Expert-reviewed effective-dated rules and translation invalidation. |
| M08 | Employer/organization assignment | Existing statuses, scoped authentication and no hidden adverse decisions. |
| M09 | Selective sharing and portability | Minimum claims, current authority and recipient-purpose validation. |
| M10 | What-if, assistance and next actions | Side-effect-free simulation; no AI-created authority. |
| M11 | Mobile/web/admin/providers/support | Actual integration availability, localization/accessibility and safe notifications. |
| M12 | Security, privacy, pilot and release | Evidence-based end-to-end acceptance, expert/legal/linguistic review and release decision. |
| Family / Health / Civic | Shared subject/relationship/evidence models | Track source baselines and PR #84 explicitly; do not claim merged runtime. |
| SVJ OS / AI Accounting Company OS | Narrow purpose-specific adapters | Separate contracts, permissions and deployment; no duplicate accounting/tax truth. |

A future admission must determine whether delivery is within a pre-existing slice or an explicitly revised scope; mapping to a milestone does not itself expand its approved definition of done. No new M13 or inflated project denominator is invented.

## Full-scope phased delivery

PHA-A: reusable language, typed facts/references, document types, source registry, access and supported-route coverage.
PHA-B: bounded personal document/task/arrival/explanation journeys with visible unsupported cases.
PHA-C: reviewed profession pilots, gap paths and employer consumption.
PHA-D: family/institutions/health administration and specialist protection cases.
PHA-E: independently reviewed additional jurisdictions and outward Czech mobility.

Each phase requires an implementation contract before runtime code, explicit path/scope allowance, regression tests, adverse-path/privacy tests, source-content owners and a separate acceptance record. Unimplemented target areas remain visible in traceability, not marked complete because an architecture file exists.

## Definition of done for this architecture package

1. All SRC-01–SRC-12, EXP-01–EXP-24, PER-01–PER-18, languages/layers/trust labels, DIF/NAV/VAR/PHA/STORY sets are represented.
2. Existing Architecture and Book link the actual files; reused contract references resolve.
3. Mobility, localization, privacy, ADR, phase dependencies and all 64 acceptance scenarios exist with explicit scope and expected outcomes.
4. Architecture-before-tooling commit order is visible; exact diff is restricted to the package allowlist and append-only canonical references.
5. Executable pack validator and adversarial tests pass on the reviewed head; report their actual run, not planned status.
6. Production code/gates/old tests are unchanged; no rules are published and no product acceptance is fabricated.
7. PR/commit and inspected evidence are recorded. Merge requires its separate reviewed approval; no background merge or automatic deployment is enabled.

## Product acceptance versus architecture validation

`expat_scope.json` holds 24 positive/boundary pairs plus 16 cross-cutting Given/When/Then scenarios. All product scenarios have status `SPECIFIED_NOT_EXECUTED`. A schema/content checker can prove catalogue completeness, links and change boundaries, not actual clinical/legal correctness or production behaviour.

The isolated validator test suite tests malformed/missing/duplicate IDs, dropped scope, empty outcomes, false executed statuses, missing links/anchors, unapproved change paths and base-prefix tampering. Its test count is reported independently. Existing repository workflows remain intact; any inherited failure/pending check must be reported, not waived or relabelled.

## Progress accounting

The latest inspected governance record (#133) reports original-v1 allocation **60/130 = 46.15%**, M05 technically accepted, M06 delivery 0/10. This is a historical planning-unit measure, not effort, cost, time or production readiness. EXPATS architecture adds zero delivered product units. The expanded full-project percentage is undefined until an approved revised scope/weight baseline exists; never silently count these new 24 areas in either numerator or denominator.

## Verification procedure

On the PR's exact head run `python3 scripts/check_expat_architecture.py` and `python3 -m unittest discover -s tests/governance -p 'test_expat_architecture.py' -v`. Run `python3 scripts/check_expat_architecture.py --base 4a3c97e2314b2c8ccdf508123bb9ce5a04b499f0` in a full-history checkout to verify the exact changed-file allowlist and preserved canonical prefixes. The dedicated CI does all three, prints exact head and records no user documents or secrets. Review output, existing CI and merge-base freshness before merge.
