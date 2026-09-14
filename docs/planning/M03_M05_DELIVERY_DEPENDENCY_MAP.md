# CALPQ M03-M05 Delivery Dependency Map

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M03-M05-DELIVERY-MAP-0001`

## Purpose
Define controlled parallelization after M02 exit.

## Starting point
M03/M04/M05 implementation requires stable M02 contracts and separate milestone admission.

## Parallel lanes
Lane P — Product Surface:
M03-A -> M03-B -> M03-C

Lane K — Knowledge:
M04-A -> M04-B -> M04-C

Lane E — Evidence Fabric:
M05-A -> M05-B -> M05-C

## Cross-lane dependencies
- M03-A may begin once stable M02 Passport/read-model contracts exist.
- M03-B may progress in parallel with M04-A and M05-A, but may not hard-code catalog or verification truth.
- M03-C intent search may consume M04 catalog/query contracts only after their schema is stable enough for read integration.
- M04-A does not depend on M05 implementation, but source references must use governed source semantics.
- M04-B recognition routes may reference verification evidence from M05 but must keep recognition authority separate.
- M04-C Gap Navigator consumes verified/current state and catalog/path semantics; it does not perform intake or verification.
- M05-A may start in parallel with M03/M04 once M02 evidence contracts are stable.
- M05-B must preserve Core provenance semantics from M02.
- M05-C must not redefine eligibility or catalog semantics.

## Recommended delivery waves
Wave X1: M03-A + M04-A + M05-A
Wave X2: M03-B + M04-B + M05-B
Wave X3: M03-C + M04-C + M05-C

A lane may lag another without blocking unrelated work, but no lane may bypass its own predecessor batch or consume an unstable cross-lane contract as if final.

## Shared integration checkpoints
Checkpoint 1 after X1: read-model/catalog/intake contracts compatible.
Checkpoint 2 after X2: product flows, recognition/review and derived evidence semantics compatible.
Checkpoint 3 after X3: search/gap/trust-verification integration plus milestone exit evidence.

## Forbidden coupling
- UI-owned eligibility logic;
- catalog-owned subject evidence truth;
- evidence adapter-owned legal eligibility;
- AI extraction promoted to verified fact by confidence;
- recognition treated as automatic equivalence;
- shared DTO used as a substitute for explicit domain/application ownership.
