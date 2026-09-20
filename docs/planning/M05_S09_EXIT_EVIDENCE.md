# M05 Slice 09 — Implementation and Exit Evidence

Status at authoring: `IMPLEMENTED / INITIAL TEST FIX AND HARDENING / FINAL-HEAD REVALIDATION REQUIRED`.
Issue #125. Pull request #126. Branch `impl/m05-s09-archive-retention-linking-snapshots`.
Owner: `SCHVALUJI MERGE PR #124 A POKRAČOVÁNÍ NA M05 SLICE 09`.

## Predecessor

PR #124 merged reviewed head `64398e794ed47a80c3eeaa213bd34ace0607a7f0` using an exact-head guard to `a65975f7d5bf277da8e0018f436d3c9745bdadbf`. The merged tree equals reviewed S08 tree `cc4daa59e705d4641f9ddd097320d8da45409028`. GitHub reported 90 total observed runs and 90 successes for the merge SHA before S09 production code was committed. This includes multiple events, not 90 unique suites. Admission is recorded in issue #125 comment `5720602970`. No production release occurred.

## Architecture and tests before code

- Contract: `2129ac132d5a3b4087058944231bb5995cb4f5c4`.
- 56-scenario index: `7ad701a7a3075f2fbb0f940efb4e1d3dac4335c7`.
- Executable acceptance test definitions: `09f8d39cf42a185d4ee548bf22e877c62b71a584`.
- First production source: `a7e63f2b9a7576af28d090b3f9606a59c243aa34`.

The S09 shell gate checks that contract/index/test commits precede first production source. Initial contract/index status labels preserve their pre-implementation drafting state; current completion status is the exact-head record in the implementation PR and issue #125.

## Delivered boundary

Application-only scoped archive lifecycle with explicit grants, versioned retention policies, seven canonical link relations, S02 document relationships, holds, Core EvidenceSnapshot-backed manifests, complete supplied derived lineage, S04/S05/S07/S08 history/provenance preservation, snapshot pins, fresh dependency inventories and fail-closed disposal assessments. Logical tombstones preserve originals and events; no physical-delete operation exists.

**archive link != evidence verification; retention expiry != deletion permission; snapshot != authorization**

## Initial execution and correction

Initial head `140625340d2a6aa0c326255e1934fa8b1449e15e`, S09 workflow run `35270013729`, job `105366681596`:
- exact-head checkout, ancestry and strict TypeScript compile succeeded;
- runtime: 56 tests / 55 pass / 1 fail / 0 cancelled / 0 skipped / 0 todo;
- scenario M05S09-20 reused command 200/idempotency key for LINK and UNLINK. The production idempotency guard correctly raised `Archive idempotency key collision`;
- fixture corrected to use command 201 for the distinct UNLINK. No production idempotency check was weakened and no scenario was removed.

## Additional review hardening

Within the existing version/provenance contract:
1. Lifecycle retains immutable `initialPolicy` alongside current policy and events, so replacement does not discard the opening policy.
2. Replacement rejects every policy version previously used in that lifecycle, including the initial version; a reused version cannot silently change retention semantics.
3. Snapshot serialization explicitly preserves verification method, verifier entity, per-claim fingerprints and authority-resolution provenance. A fingerprint does not promote an INDETERMINATE result or original evidence.
4. Archive grants require individual HUMAN_USER or SYSTEM_PROCESS principals, matching the original contract rather than accepting an organization as the executing principal.

Existing scenarios M05S09-05, M05S09-12 and M05S09-31 contain added assertions; M05S09-20 has corrected command identity. All 56 scenario IDs remain present. These changes require fresh final-head validation; initial execution is not used as proof that the hardened commit passes.

## Reproducible gate

`bash tests/m05_s09_archive_lifecycle_test.sh` on a complete checkout runs:
1. architecture/index/tests-before-code ancestry and zero-Core/adapter scope checks;
2. exact match of 56 runtime test identities and scenario index;
3. strict Application TypeScript compile including S09 readonly proof;
4. all 56 mandatory runtime scenarios with zero failure/cancelled/skipped/todo required;
5. existing S08 runtime/readonly/ancestry gate on the same checkout;
6. existing architecture boundary test.

Dedicated workflow: `.github/workflows/m05-s09-archive-lifecycle.yml` checks out the exact PR head. Full same-head PR regression matrix, including S07 transitive evidence and FV13 tenant governance, remains required. This document cannot certify a run that happens after its own commit; successful final SHA and workflow/job evidence must be recorded in the PR conversation and issue #125 without changing the tested head unnecessarily.

## Integration limits

No Core/provider-adapter production changes, actual file/object deletion, crypto-shredding, UI, database adapter or deployment. Trusted entrypoints authenticate principals, resolve target ownership, load current grants and complete dependency observations, detect cross-archive graph cycles and atomically persist lifecycle/snapshot-pin/audit/idempotency/outbox through the existing UnitOfWork. Internal objects and safe summaries are not substitutes for access control. Versioned policy dates are inputs, not invented legal guidance.

Finite pins may be released only after their preservation boundary; indefinite pins require a separately governed policy reconsideration outside this bounded slice. Required original-byte replay dependencies must be included in the external inventory before any separate physical-purge process. S09 only emits logical state.

S09 PR remains unmerged until separate owner approval. S10 implementation and production release are not authorized by this delivery.
