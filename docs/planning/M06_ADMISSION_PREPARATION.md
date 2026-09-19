# M06 — Admission Preparation

ID: `CALPQ-M06-ADM-PREP-0001`
Status: `PREPARATION AUTHORIZED / CANDIDATE ONLY / IMPLEMENTATION BLOCKED`
Tracking: #130; milestone epic #36.
Owner instruction: `SCHVALUJI TECHNICKÉ PŘIJETÍ M05 V DOLOŽENÉM ROZSAHU A PŘÍPRAVU ADMISSION M06`.
Base: `2deb81901339c2e7631d096939898fa5dd562e53`.
No authored checklist or successful preparation test is an admission decision.

## Existing plan, not a parallel architecture

`M06_EXECUTION_PACKAGE.md` is the authoritative ten-slice scope. This preparation does not change that file, the original M02–M12 execution index, historical admission decisions, feature-development gates or domain contracts.

| Slice | Existing scope | Dependency and boundary for later implementation |
|---|---|---|
| S01 | Credential lifecycle timeline projection | Consume governed credential/evidence/time inputs and existing M03 presentation contracts; projection only, no renewal or legal-state mutation. |
| S02 | Expiry and renewal policy evaluation | S01 plus versioned M04 definitions and explicit time; do not invent jurisdictional deadlines. |
| S03 | Recurring exams, medical, education and checks | S02, source-backed versions and jurisdiction; missing rules remain explicit uncertainty. |
| S04 | Renewal case/workflow | S02/S03 plus M05 evidence/manual-review contracts; completing workflow does not itself renew an authorization. |
| S05 | Notification policy and escalation | S01–S04, actor/tenant/purpose context, deduplication and outbox contracts; delivery is not domain truth. |
| S06 | Dependency graph | M04 versions, M05 evidence and existing decision references; typed directional edges and explicit cycle handling. |
| S07 | Selective reevaluation | S06, immutable snapshots and expected revisions; new decisions, no historical overwrite or default global rebuild. |
| S08 | Continuous Compliance projection | S02/S03/S07, exact subject/activity/jurisdiction/time/version scope; distinguish present compliance, future risk and uncertainty. |
| S09 | Historical replay / as-was versus as-is | Original snapshots/rules/evaluation and knowledge instants remain separately identified. |
| S10 | M06 integration evidence | Expiry, changed evidence and changed requirements through real contracts, plus all mandatory predecessor regressions. |

## Proven predecessor anchors

M04 final merge: `d2f04aa2bcc68edf1d20deb345faa8a8c239e23d`, PR #105, `M04_S10_EXIT_EVIDENCE.md`; immutable requirement/catalog/path versions, source lineage and historical replay.
M05 final merge: `2deb81901339c2e7631d096939898fa5dd562e53`, PR #128, accepted in `M05_TECHNICAL_ACCEPTANCE_RECORD.md` and epic #34 comment `5726064446`.
M02/M03 earlier exit evidence remains preserved. Current-state drift #129 is not used as evidence that predecessor implementation is missing.

## Contract reuse

Read and reuse the existing `PASSPORT_LIFECYCLE_RENEWAL_PROJECTION`, `DEPENDENCY_GRAPH_REEVALUATION_MODEL`, `CONTINUOUS_COMPLIANCE_STATUS_MODEL`, `NOTIFICATION_POLICY_MODEL`, `DECISION_REPLAY_MODEL`, `REEVALUATION_DECISION_EVIDENCE`, `APPLICATION_EXECUTION_CONTEXT_MODEL`, `APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER`, `UNIT_OF_WORK_TRANSACTION_MODEL` and evidence/authority/tenant contracts. Do not substitute new parallel clocks, registries, evidence snapshots, grants or authorization engines.

Time crossing alone cannot fabricate an authority event. A projection may show a known due date but cannot revoke, renew or grant anything. Preserve evaluation time, knowledge cutoff, effective time and calendar-date semantics distinctly. Later policy contracts must explicitly specify timezone, inclusive boundaries, calendar arithmetic and missing/ambiguous dates; no silent UTC conversion of legal calendar dates.

## Proposed first execution entry — NOT AUTHORIZED

`M06_SLICE_01_CREDENTIAL_LIFECYCLE_TIMELINE_PROJECTION`.
Proposed S01 boundary: Application read model using existing governed references and explicit execution context. Include subject/tenant/purpose checks, stable ordering, missing-data explanations, source/evidence versions and immutable deterministic output. No production UI/provider/storage adapter, notification delivery, automatic eligibility decision or actual renewal operation.
S01 must begin only after explicit owner admission/start approval, an approved admission transition is merged and post-merge verified, and its own contract/scenario index is committed before production source. Each later slice retains its own approved handoff.

## Decision states

1. This package: PREPARATION_ONLY; `implementation_authorized=false`, `authorized_execution_entry=null`, `admission_approval=null`.
2. Owner may approve preparation PR merge without admitting M06; that does not activate product work.
3. Formal admission requires a distinct evidence-backed owner approval, machine decision, record, coherent package/guard transition and exact-head green checks.
4. The admission merge and its post-merge verification are recorded before creating the S01 implementation branch. No self-certifying future merge SHA or future test result is written now.

## CI transition review

See `M06_CI_TRANSITION_REVIEW.md`. This preparation only adapts S10's historical changed-path check to validate the closed S10 range and an exact preparation-only current-path allowlist; every current-checkout runtime/type/architecture test remains unchanged. This does NOT enable M06 implementation or claim full future-admission guard compatibility.

## Evidence and scope of validation

Preparation gate validates owner/anchor records, machine-state nonauthorization, exact changed-path allowlist, additive-only files plus the one constrained S10 guard edit, historical S10 range, unchanged product/source/tests, mandatory contract presence and 24 matrix identities. It also exercises adversarial preparation-validator tests. Dedicated CI runs the existing full S10 500-test gate and M04 integration gate on the exact preparation checkout. All same-head PR workflows remain required before FINAL HEAD GREEN.
Tests authored here validate governance preparation, not M06 product functionality. No local clone/run is claimed: the execution container could not resolve github.com; repository execution uses GitHub Actions.

## Exclusions and progress

No real legal/medical deadline source, regulatory interpretation, provider/network/DB/runtime deployment, physical deletion, M06 product code or M07+ admission. Live loading/authentication, complete inventories, current grants, audit/outbox persistence and operational evidence remain explicit integration requirements.
M05 accepted 100%; M06 delivered 0/10; v1 plan coverage remains 60/130 = 46.15%.
