# CALPQ M03 Slice 04 Implementation Contract — Evidence & Source Explanation with Why?

Status: `COMPLETED / VERIFIED`
ID: `CALPQ-M03-S04-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 03 merge commit `f92032617783e1ddfc82aefc7e1bdea28534424a`.
Tracking issue: #63.
Source-boundary commit: `c0329ef818988be51047973061bb8c57ca5c301c`.
Executable-evidence head: `02d3738dbc245e5f437ff360445c2711e83cb8fa`.

## Scope
Slice 04 introduces a framework-neutral immutable `EvidenceSourceExplanationReadModel` bound to one reviewed `CredentialCardReadModel` and its exact authoritative `EligibilityAssessment`.

Verified behavior:
- explicit `Why?` affordance with stable explanation reference and localization-ready `action.why` label key;
- atomic requirement entries preserve exact requirement IDs, outcomes and unchanged machine-readable reason codes;
- governed source entries preserve source ID, authority, jurisdiction, source type, exact version, locator/effective metadata, verification state and content hash;
- evidence entries preserve the exact assessment EvidenceSnapshot identity/class/kind/content reference/hash, verification state and source ID/version;
- provenance preserves decision identity, actor/evaluator, evaluation instant and exact rule set/version;
- composition fails closed unless Card and EligibilityAssessment match exactly on Subject, assessment ID, CredentialDefinition ID/version, RequirementSet ID/version, outcome and evaluation instant;
- all explanation, Why, reason, source, evidence and provenance presentation objects remain non-authoritative and immutable.

## Reason semantics
Reason codes are copied exactly from governed `AtomicRequirementResult.reasonCodes`. Slice 04 does not translate, rewrite, merge, rank or generate them. Human-readable localization or AI rendering may only be a later non-authoritative layer over stable codes/references.

## Source and evidence semantics
Source metadata is direct passthrough from governed `SourceReference`. Evidence metadata is direct passthrough from the exact immutable `EvidenceSnapshot`. Slice 04 does not infer source legal force/current applicability, promote derived evidence, infer verification, or manufacture evidence-to-reason relationships.

## Why? affordance
`WhyAffordance` is presentation/navigation metadata only:
- kind `WHY`;
- target `ELIGIBILITY`;
- label key `action.why`;
- stable reference `calpq:explanation:eligibility:<assessmentId>`;
- `decisionAuthority = false`.

## Hard boundaries verified
- no reason-code invention or semantic rewriting;
- no eligibility or verification re-evaluation;
- no generic validity/current/legal conclusion;
- no `AuthorizationGrant` issuance or implication;
- no M04 Credential Catalog / QualificationPath ownership;
- no M06 lifecycle authority;
- no provider SDK or UI framework dependency;
- no ambient wall-clock/randomness;
- no AI-generated content inside the authoritative explanation read model.

## Verification evidence
On `02d3738dbc245e5f437ff360445c2711e83cb8fa`:
- M03 Slice 04 Explanation #2 — SUCCESS;
- exact runtime result: 26 tests, 26 pass, 0 fail, 0 skipped, 0 todo;
- strict TypeScript compile-time proof — PASS;
- reviewed Slice 03 ancestry guard — PASS;
- M03 Slice 03 Credential Card #12 — SUCCESS;
- M03 Slice 02 Passport Summary #18 — SUCCESS;
- M03 Slice 01 Dashboard Read Models #25 — SUCCESS;
- FV-12 Professional Passport #60 — SUCCESS;
- Foundation Guard #1018 — SUCCESS;
- M00 Readiness #897 — SUCCESS;
- M02 Batch Readiness #306 — SUCCESS;
- Program Execution Readiness #320 — SUCCESS;
- M03-M08 Execution Readiness #277 — SUCCESS;
- CALPQ v1 Execution Index #257 — SUCCESS;
- M09-M12 Execution Readiness #266 and all other triggered regressions — SUCCESS.

## Recovery / migration
No schema or data migration. Slice 04 is additive and reversible without changing M02 authoritative state/history or prior M03 read contracts.

No mandatory test was waived or deferred. Hard blockers: 0.
