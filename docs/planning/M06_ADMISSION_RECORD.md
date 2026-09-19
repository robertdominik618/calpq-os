# M06 — Formal Admission for Slice 01

ID: `CALPQ-M06-ADM-0001`
Transition: `CALPQ-M06-ADMIT-0001`
Status: `FORMALLY APPROVED / EXECUTION EFFECTIVE ONLY AFTER APPROVED ADMISSION MERGE + POST-MERGE VERIFICATION`
Tracking issue #132; parent epic #36; preparation #130 / PR #131.
Owner instruction: `SCHVALUJI MERGE PR #131 A FORMÁLNÍ ADMISSION M06 PRO SLICE 01`.
Recorded on 2026-09-18; exact owner-chat time was not independently captured.

## Accepted prerequisites

M04 completed anchor: `d2f04aa2bcc68edf1d20deb345faa8a8c239e23d` (PR #105).
M05 technically accepted anchor: `2deb81901339c2e7631d096939898fa5dd562e53`, epic #34 comment `5726064446`.
Preparation reviewed head: `2dea0cb024ad557029b98657fc9c51123de4b160`; 14/14 PR workflows SUCCESS, final ledger PR #131 comment `5726386348`.
Owner-approved preparation merge: `4a3c97e2314b2c8ccdf508123bb9ce5a04b499f0`, tree `d46508e55f3b7e787ccc21c07f43505ebce8f022`, identical to reviewed preparation. Its post-merge completion evidence is recorded separately in PR #131; this authored record does not predict future workflow results.

Retain M05's 500-scenario execution provenance, 8 ledger-validator tests, 48 M04 integration tests, 20 preparation-validator tests and all standalone guards. New executions must retain their actual SHA. No historical result is relabeled as a fresh run.

## Decision and exact entry

Machine decision: `m06-admission-decision.json` (`CALPQ-M06-ADM-DEC-0001`).
Existing ten-slice scope remains `M06_EXECUTION_PACKAGE.md`; only its status and admission reference change.
Only authorized entry: `M06_SLICE_01_CREDENTIAL_LIFECYCLE_TIMELINE_PROJECTION`.
Only authorized product slice: **S01**. Admission does not authorize S02–S10, M07+, production release or physical deletion.

Owner approval is recorded now; the admission PR must still be reviewed, explicitly merged and post-merge verified before product source starts. The current branch is an admission transition, not an S01 implementation. A future activation record must identify the actual admission head, merge, identical tree and owner/post-merge evidence; no future hash or successful run is invented here.

## Existing architecture and non-authority

Reuse governed Application execution/tenant context, Core time and references, M04 versioned catalog/requirement/path evidence, M05 original/evidence/review/archive snapshots, and existing M03 presentation contracts. No parallel Clock, snapshot, registry or legal authority engine.
S01 projects recorded lifecycle events and explicit time facts; no provider calls, scheduler, delivery adapter, renewal command or new legal decision. Passing a date does not fabricate an authority event. Unknown dates/rules remain explicit uncertainty.

**timeline projection != renewal; notification != authority; passage of time != authority event; replay != historical mutation**.

## Successor-aware CI without bypass

The old M03/M04/M05/shared guards keep their original decisions, invariants and runtime commands. Only their M06-blocked checks become conditional on a fully validated separate M06 decision; M07/M08 remain blocked.
The preparation JSON/documents remain immutable historical facts, including their PREPARATION_ONLY state. The preparation validator dispatches to the formal successor only when its decision file is present; malformed/unknown successors fail closed. Pure preparation validation and its 20 adversarial tests remain unchanged.
Closed preparation scope is bound to the exact reviewed merge/tree. The current admission delta has an exact filename/status/mode allowlist. No product file is permitted in this admission delta.
S01 future activation has a distinct exact-path allowlist and frozen admission files. Source requires prior activation, contract and scenario-index commits. Package exports/scripts and compile config may only add the specified S01 entries without altering predecessor entries. All predecessor runtime tests run on the current checkout, never on a substitute historical checkout.

## Acceptance criteria

Machine-decision, origin, scope, conditional activation and guard-patch tests must pass. Dedicated CI must execute existing preparation tests, M04 integration, full M05 S01–S10 runtime evidence, old/shared admission guards, strict types and architecture. Full current-head workflow matrix remains mandatory; authored checklists are not execution evidence.
Preparation post-merge state, final admission-head SHA and executed run references are recorded in PR/issue evidence without requiring a self-referential document commit. A merge approval for PR #131 is not automatically approval to merge this new admission PR.

## Progress and exclusions

M05 accepted 100%; M06 delivered 0/10; v1 plan allocation 60/130 = 46.15%. Governance work creates no product delivery credit.
Production identity/current-grant loading, complete dependencies, ownership checks, UnitOfWork/audit/outbox, real OCR/provider/storage/UI adapters and operational proof remain separate responsibilities. Documentation drift #129 remains open. No live legal/medical rules, physical purge, key destruction or deployment is delivered here.
