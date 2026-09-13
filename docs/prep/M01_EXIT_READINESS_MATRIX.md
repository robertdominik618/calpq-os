# CALPQ M01 Exit Readiness Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0021-A`

## Purpose
Assess PREP-0001 through PREP-0020 for implementation readiness without overriding M00 governance.

## Result vocabulary
- `PASS` — design boundary exists and current machine checks cover its critical invariants.
- `DESIGN_PASS_GUARD_DEFERRED` — design source exists, but dedicated machine enforcement is deferred.
- `READY_WITH_CONDITIONS` — suitable for implementation only with stated conditions.
- `BLOCKED` — implementation must not proceed.

## Matrix
| Area | PREP | Result | Notes |
|---|---|---|---|
| Core primitives / evidence / result model | 0001 | PASS | deterministic Core baseline |
| Aggregate / command / event / concurrency | 0002 | PASS | revision, idempotency, outbox boundary |
| Credential / authorization domain | 0003 | PASS | artifact != authorization |
| Catalog / paths / equivalence | 0004 | PASS | versioned, jurisdiction-aware graph |
| Passport / gap / next action | 0005 | PASS | projection, not source of legal truth |
| B2B assignment / roles / delegation | 0006 | PASS | person/role/delegation/credential separated |
| Continuous compliance | 0007 | PASS | immutable re-evaluation snapshots |
| Regulatory radar / review | 0008 | PASS | alerts/actions/review separated |
| Document intake / archive | 0009 | PASS | original != extraction != verified fact |
| Trust / authority resolution | 0010 | PASS | trust != scoped legal authority |
| Subject identity / account binding | 0011 | PASS | account != canonical Subject |
| Access / consent / purpose | 0012 | PASS | minimum-necessary disclosure |
| Privacy lifecycle | 0013 | PASS | retention/restriction/disposition governed |
| Audit / replay / export | 0014 | PASS | historical `AS_WAS` replay separated from current state |
| Operational resilience | 0015 | DESIGN_PASS_GUARD_DEFERRED | Issue #4 is design source; machine guard missing |
| Security architecture | 0016 | PASS | trust boundaries and privileged controls |
| Persistence / transaction | 0017 | PASS | authoritative transaction and migration boundary |
| API / wire | 0018 | PASS | transport != domain truth |
| Application layer | 0019 | PASS | orchestration != domain policy |
| Tenant isolation | 0020 | PASS | repository contracts + machine guard; detailed baseline in Issue #5 |

## PREP-0015 classification
The missing PREP-0015 machine guard is **not blocking** implementation of M01 Core phases that have no external side effects, queues, recovery or production worker behavior.

It becomes **blocking before** any first vertical slice is considered production/integration complete where background workers, delivery retry, projection rebuild, restore/recovery or provider fallback behavior is exercised.

## Project-level blockers
- M00 release remains `BLOCKED`.
- feature development remains `FROZEN`.
- `main` protection / required CALPQ CI governance remains the known M00 external prerequisite.

## Overall architectural result
`READY_WITH_DEFERRED_NONBLOCKING_ITEMS`

## Implementation authorization result
`M00_GOVERNANCE_BLOCKED`

This matrix does not authorize product source implementation.