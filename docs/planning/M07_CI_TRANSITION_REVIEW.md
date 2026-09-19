# M07 (milník 07) — CI Transition Review

Status: `PREPARATION CONTRACT / FUTURE ADMISSION NOT ENABLED`  
Accepted M06 anchor: `f71bc084e6dc7778a13b0ad80b7637f6663005f8`.  
Tracking #160.

## CI finding from the first preparation candidate

The first executable preparation candidate wrapped only `tests/m06_s10_integration_evidence_test.sh`. The full PR matrix correctly demonstrated that this was too narrow: multiple historical M06 workflows reach `scripts/ci/m06-s10-scope.mjs` directly through their successor-dispatch chains. Those workflows therefore failed closed when they saw legitimate M07 preparation paths beyond the completed M06 S10 bundle.

This is retained as useful transition evidence. The failures do not justify weakening old scope allowlists or skipping predecessor workflows.

## Correct canonical successor boundary

`scripts/ci/m06-s10-scope.mjs` is the final M06 scope authority reached by the M06 admission and slice successor chain. Only that file may receive the exact successor wrapper defined by the M07 preparation validator.

When `m07-admission-preparation.json` exists on a descendant of the accepted M06 anchor, the wrapper must:

1. run `scripts/ci/m07-admission-preparation.mjs` on the current checkout;
2. create a detached temporary worktree at the immutable accepted M06 merge;
3. execute the original closed `scripts/ci/m06-s10-scope.mjs` from that accepted M06 checkout;
4. require the original closed-scope PASS marker;
5. remove the worktree and return success to the calling historical workflow.

Every M06 workflow then continues its own unchanged runtime, type, architecture and predecessor commands on the current M07 preparation checkout. The historical M06 S10 allowlist and execution record are never widened to include M07 files.

The previously modified shell runner is restored byte-for-byte to its accepted M06 version. No environment bypass, cached result, skipped runtime suite or alternate product checkout is introduced.

## Required next transition before M07 implementation

| ID | Required work | Current disposition |
|---|---|---|
| M07-NEXT-01 | Explicit owner formal-admission/start decision distinct from `tak pokračujme` | NOT AUTHORIZED |
| M07-NEXT-02 | Machine admission decision/record and reviewed successor-aware admission guards | NOT ENABLED BY PREPARATION |
| M07-NEXT-03 | Exact S01 scope contract/test index with source-registry boundary and no legal-authority escalation | NOT ENABLED BY PREPARATION |
| M07-NEXT-04 | Exact candidate-head full CI, owner-approved admission merge, post-merge verification and only then S01 branch creation | FUTURE EVIDENCE REQUIRED |

## Nonblocking retained responsibilities

Production source acquisition, authenticity/currentness checks, durable storage, authentication/current grants, legal review operations, observability, UnitOfWork/audit/idempotency/outbox integration and documentation drift are not certified by this preparation.

Source governance exists normatively, but formal M07 admission must still prove that its first executable slice reuses that governance without inventing a second source-of-truth model.
