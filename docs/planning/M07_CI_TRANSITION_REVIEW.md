# M07 (milník 07) — CI Transition Review

Status: `PREPARATION CONTRACT / FUTURE ADMISSION NOT ENABLED`  
Accepted M06 anchor: `f71bc084e6dc7778a13b0ad80b7637f6663005f8`.  
Tracking #160.

## Observed constraint

`tests/m06_s10_integration_evidence_test.sh` invokes `scripts/ci/m06-s10-scope.mjs`. That historical scope validator intentionally proves the exact M06 S10 evidence delta from the accepted S09 predecessor through the current checkout. Any legitimate M07 preparation file added after M06 closure would therefore be rejected as an M06 S10 scope violation.

Weakening the M06 allowlist would destroy historical evidence. Skipping M06 S10 would drop current-checkout regression evidence. Neither is acceptable.

## Narrow successor adaptation allowed by this preparation

Only `tests/m06_s10_integration_evidence_test.sh` may receive the exact successor wrapper defined by the M07 preparation validator.

When the accepted M06 anchor is an ancestor and `m07-admission-preparation.json` exists, the wrapper must:

1. run `scripts/ci/m07-admission-preparation.mjs` on the current checkout;
2. create a detached temporary worktree at the immutable accepted M06 merge;
3. execute the original closed `scripts/ci/m06-s10-scope.mjs` inside that worktree;
4. remove the worktree;
5. continue the unchanged M06 strict compilation, 136 integration scenarios, 16 governance scenarios, 28 readonly assertions and full predecessor regression chain on the current M07 preparation checkout.

The historical M06 scope validator itself is not widened. No environment bypass, cached result, skipped runtime suite or alternate product checkout is introduced.

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
