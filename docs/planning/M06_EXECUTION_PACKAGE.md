# CALPQ M06 Execution Package — Lifecycle, Renewal & Continuous Compliance

Status: `ADMITTED / S01 IMPLEMENTATION AUTHORIZED AFTER MERGE + POST-MERGE GREEN`

Admission: `M06_ADMISSION_RECORD.md` and `m06-admission-decision.json`. Only Slice 01 is authorized, subject to verified admission activation; Slice 02–10 remain separately governed.

## Objective
Turn point-in-time credential truth into governed lifecycle maintenance without mutating history.

## Delivery slices
1. Credential lifecycle timeline projection.
2. Expiry and renewal policy evaluation.
3. Recurring obligation model: exam, medical, continuing education and periodic checks.
4. Renewal case/workflow state.
5. Notification policy with deduplication and escalation semantics.
6. Dependency graph from rules/evidence/credential state to affected decisions.
7. Selective reevaluation engine.
8. Continuous Compliance status model.
9. Historical replay and as-was/as-is comparison.
10. M06 integration evidence over expiry, changed evidence and changed requirement scenarios.

## Ownership
M06 owns lifecycle scheduling semantics, renewal workflow, dependency-based reevaluation, continuous-compliance projections and lifecycle notifications. It does not rewrite historical assessments or create authorization outside explicit authority paths.

## Definition of Done
- historical decisions remain immutable;
- expiry is computed from governed time/state rather than destructive mutation;
- reevaluation creates new decisions/projections;
- notifications are idempotent and explain why action is needed;
- recurring obligations are versioned and jurisdiction-aware;
- continuous compliance distinguishes current state from historical state.

## Stop conditions
Stop if background jobs mutate legal history, notification delivery becomes authoritative state, current rules are retroactively applied without replay semantics, or missing external data is fabricated as satisfaction/failure.