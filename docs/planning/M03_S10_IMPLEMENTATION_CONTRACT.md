# CALPQ M03 Slice 10 Implementation Contract — Integration Evidence & UX Boundary Tests

Status: `IMPLEMENTING / EXECUTABLE EVIDENCE ADDED`
ID: `CALPQ-M03-S10-0001`
Tracking issue: #79

## Reviewed predecessor
- M03 Slice 09 PR #78;
- reviewed / merged / post-merge-verified base: `1d87412aa54a18bda4c8015824085102a5a73055`;
- post-merge evidence on that base: 33/33 observed workflow runs SUCCESS.

## Authorized scope
Delivery slice 10 from `M03_EXECUTION_PACKAGE.md` is exactly:

> M03 integration evidence and UX boundary tests.

This slice closes M03 by proving the already-implemented S01–S09 product surface as one coherent, non-authoritative presentation journey. It deliberately adds no new eligibility rule, verification rule, lifecycle rule, authorization mechanism, catalog intelligence, provider adapter or UI framework.

## Representative governed journey
The mandatory integration scenario composes real governed M02 objects and the actual existing M03 read models in this order:

1. authoritative `EligibilityAssessment`;
2. `ProfessionalPassportProjection`;
3. `DashboardReadModel`;
4. `ProfessionalPassportSummaryReadModel`;
5. `CredentialCardReadModel`;
6. `CredentialExplanationReadModel` with explicit `Why?` affordances;
7. `ActivityTimelineReadModel` and decision provenance;
8. `MissingConditionNextActionReadModel`;
9. approved query models + `IntentSearchReadModel`;
10. `ResponsiveReadFlowReadModel`;
11. `AccessibilityLocalizationReadModel` in `cs-CZ` and `en-GB`.

## UX boundary invariants
The integration evidence MUST prove all of the following:
- document/artifact presence, evidence verification, eligibility, lifecycle and later authorization/grant state remain distinct concepts;
- verified evidence cannot silently upgrade eligibility to satisfied;
- unavailable document/lifecycle sources stay explicitly unavailable and do not imply legal invalidity, expiry or revocation;
- next actions are shown only from explicit governed action references; otherwise unavailability is explicit;
- explanation output preserves authoritative reason/source/evidence/provenance bindings;
- activity history uses only governed event times and never promotes projection-generation time into history;
- search operates only over approved read/query models and has zero fact/decision/ranking authority;
- responsive changes may alter layout/pane/navigation only, never governed semantic content;
- accessibility metadata preserves keyboard/screen-reader access and never encodes meaning by color only;
- localization changes human-readable presentation only; machine status/reason semantics remain invariant;
- canonical UTC/effective-date truth is never changed by presentation locale or ambient timezone;
- cross-subject composition fails closed;
- no M04/M06/M10 authority leaks into M03.

## Evidence strategy
- exactly 42 dedicated runtime integration/UX-boundary scenarios;
- strict TypeScript authority and immutability proof;
- reviewed S09 merge ancestry guard;
- architecture scans across all M03 presentation source directories;
- S09→S01 predecessor runtime suites executed exactly once directly, not through recursive predecessor shell runners;
- FV-12, FV-09, FV-11, Core typecheck, M03 admission and architecture-boundary regressions;
- dedicated GitHub workflow `M03 Slice 10 Integration Evidence UX Boundaries`.

## Authority boundary
S10 creates no new production authority surface. The existing presentation stack must continue to expose exact-false authority markers, including `authorizationAuthority`, `decisionAuthority`, `actionRecommendationAuthority`, `searchAuthority`, `rankingAuthority`, `layoutAuthority`, `accessibilityAuthority` and `localizationAuthority` where applicable.

## Completion condition
This contract becomes `COMPLETED / VERIFIED` only after:
1. the dedicated S10 runner is green;
2. all mandatory 42 scenarios pass;
3. strict TypeScript proof passes;
4. all observed PR-triggered workflows on the implementation/remediation head are green;
5. final evidence-packaging head is independently green;
6. `M03_S10_EXIT_EVIDENCE.md` and aggregate `M03_EXIT_EVIDENCE.md` are recorded.

No mandatory evidence may be waived or silently deferred.
