# CALPQ M02 Batch Branch & Pull Request Strategy

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M02-BATCH-PR-0001`

## Purpose
Define how M02 implementation will be delivered after formal admission so architecture, reviewability and rollback boundaries stay visible in Git history.

## Governing rule
No implementation branch is created from an unadmitted product state. The first implementation base is the reviewed/admitted revision produced after M00 governance and FV-00 admission.

## Batch branches
Planned logical branches:
- `impl/m02-batch-a-core-kernel`
- `impl/m02-batch-b-application-evidence`
- `impl/m02-batch-c-decision-runtime`

Actual branch creation remains a post-admission action.

## Stacking
Batch B is based on the reviewed Batch A result. Batch C is based on the reviewed Batch B result. A later batch must not copy unfinished code around a failed predecessor gate.

## Pull requests
Each batch gets one principal Draft PR plus coherent sub-commits. If a batch becomes too large for safe review, split only along already-defined FV boundaries; do not split across an invariant so that implementation and proof land in unrelated PRs.

## Commit discipline
Every commit should be one of:
- domain/contract implementation;
- executable test/proof;
- adapter/persistence implementation;
- architecture/dependency guard;
- documentation/evidence snapshot.

Commits must not mix unrelated UI, provider and Core changes merely to reduce PR count.

## Test-first sequence
For each FV item:
1. pin contract/invariant reference;
2. add or activate failing executable proof where feasible;
3. implement minimal compliant behavior;
4. pass local package tests;
5. pass architecture/dependency guard;
6. integrate into batch-level tests;
7. record evidence before moving to dependent FV work.

## Review boundaries
Batch A review focuses on deterministic Core semantics and dependencies.
Batch B review focuses on Application orchestration, transactions, persistence, intake and verification authority boundaries.
Batch C review focuses on eligibility, projections, tenant/access/audit, transport and operational resilience.

## Merge discipline
Planning PRs do not merge merely because they are mergeable. Implementation PR merges remain separately governed actions. A batch may not be considered complete until its exit evidence is green on the reviewed head revision.

## Rollback / forward-fix expectations
Core semantic breakage requires revert or corrective implementation before dependent work proceeds. Database migrations prefer explicit forward-fix where reverse migration would risk governed data. Projection/runtime defects may be rebuilt or replayed only when authoritative state remains intact.

## Evidence package per batch
Each batch exit records:
- reviewed head SHA;
- mandatory test results;
- architecture/dependency results;
- known limitations/non-goals;
- migration/recovery notes where relevant;
- unresolved risks, which must be zero for hard blockers.

## Program linkage
Batch A corresponds to Program Wave 1, Batch B to Wave 2 and Batch C to Wave 3. M03/M04/M05 implementation does not begin merely because Batch C code exists; M02 exit and each later milestone's admission criteria still apply.