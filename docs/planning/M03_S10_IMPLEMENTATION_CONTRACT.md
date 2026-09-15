# CALPQ M03 Slice 10 Implementation Contract — Integration Evidence & UX Boundary Tests

Status: `COMPLETED / VERIFIED`
ID: `CALPQ-M03-S10-0001`
Tracking issue: #79
Pull request: #80

## Reviewed predecessor
- M03 Slice 09 PR #78;
- reviewed / merged / post-merge-verified base: `1d87412aa54a18bda4c8015824085102a5a73055`;
- S09 post-merge evidence: 33/33 observed workflow runs SUCCESS.

## Authorized scope
Delivery slice 10 from `M03_EXECUTION_PACKAGE.md` is exactly:

> M03 integration evidence and UX boundary tests.

This slice closes M03 implementation evidence by proving the already-implemented S01–S09 product surface as one coherent, non-authoritative presentation journey. It adds no new eligibility rule, verification rule, lifecycle rule, authorization mechanism, catalog intelligence, provider adapter or UI framework.

## Representative governed journey
The mandatory integration suite composes real governed M02 objects and the actual M03 read models in this order:

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

## Verified UX boundary invariants
- document/artifact presence, evidence verification, eligibility, lifecycle and later authorization/grant state remain distinct;
- verified evidence does not silently upgrade eligibility to satisfied;
- unavailable document/lifecycle sources do not imply legal invalidity, expiry or revocation;
- next actions are presented only from explicit governed action references; otherwise unavailability is explicit;
- explanation output preserves authoritative reason/source/evidence/provenance bindings;
- activity history uses only governed event times and never promotes projection-generation time into history;
- search uses only approved read/query models and has zero search/ranking/decision/authorization authority;
- responsive changes alter layout/pane/navigation only, never governed semantic content;
- accessibility preserves keyboard/screen-reader access and never encodes meaning by color only;
- localization changes human-readable presentation only; machine status/reason semantics remain invariant;
- canonical UTC/effective-date truth is unchanged by locale or ambient timezone;
- cross-subject composition fails closed;
- no M04/M06/M10 authority leaks into M03.

## Evidence result
Verified implementation/remediation head: `95c4fca8b192380e493b51515c8e902d268e48db`.

- dedicated S10 workflow #6 — SUCCESS;
- exactly 42/42 mandatory runtime scenarios — PASS;
- strict TypeScript 7.0.2 authority/immutability proof — PASS;
- reviewed S09 merge ancestry guard — PASS;
- architecture scans across the complete M03 presentation surface — PASS;
- S09→S01 predecessor runtime suites executed exactly once directly — PASS;
- FV-12, FV-09, FV-11, Core typecheck, M03 admission and architecture-boundary regressions — PASS;
- all 26/26 observed PR-triggered workflows on remediation head — SUCCESS;
- hard blockers: 0;
- no mandatory evidence waived or deferred.

## Transparent remediation record
Initial implementation head `1dd716f007f210116f5310e5d7b6dd5678de0e37` failed the dedicated S10 workflow because the end-to-end fixture contained atomic machine outcome `SATISFIED` but its accessibility localization fixture omitted the corresponding controlled label. The fail-closed accessibility contract correctly rejected this.

Remediation commit `95c4fca8b192380e493b51515c8e902d268e48db` added only the missing `SATISFIED` semantic/localization label in the S10 integration fixture (`Splněno` / `Satisfied`). No production/domain logic, runtime scenario, architecture guard or authority boundary was removed or weakened.

## Authority boundary
S10 creates no production authority surface. Existing presentation authority markers remain exact false, including `authorizationAuthority`, `decisionAuthority`, `actionRecommendationAuthority`, `searchAuthority`, `rankingAuthority`, `layoutAuthority`, `accessibilityAuthority` and `localizationAuthority` where applicable.

Durable detailed evidence is in `M03_S10_EXIT_EVIDENCE.md`; aggregate M03 evidence is in `M03_EXIT_EVIDENCE.md`.
