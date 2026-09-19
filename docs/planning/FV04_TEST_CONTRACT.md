# CALPQ FV-04 Test Contract

Status: `18 OF 18 EXECUTABLE / VERIFIED`

Mandatory count: 18.

1. command-id
2. command-type
3. correlation-id
4. causation-id
5. expected-revision
6. deterministic-transition
7. accepted-event
8. immutable-event-metadata
9. aggregate-revision
10. duplicate-command
11. duplicate-outcome
12. stale-revision
13. conflict-outcome
14. no-last-write-wins
15. replay-stability
16. core-storage-independence
17. transport-neutrality
18. architecture-boundary

Detailed semantics are governed by `COMMAND_EVENT_ENVELOPES.md`, `IDEMPOTENCY_AND_CONCURRENCY.md` and `AGGREGATE_COMMAND_EVENT_STATE_TRANSITION.md`.

## Verified executable evidence
- `packages/core/test/fv04-transition-kernel.test.ts` maps one-to-one to FV04-01..FV04-18.
- `packages/core/test/fv04-types.compile.ts` proves nominal message/aggregate identity separation, Revision typing and readonly event metadata.
- `tests/fv04_transition_kernel_test.sh` enforces exactly 18 tests, TypeScript compilation, zero runtime dependencies, no provider/persistence imports, no global nondeterminism, FV-03 regression and architecture boundaries.
- `.github/workflows/fv04-core.yml` executes the evidence on pinned Node 24 and pinned GitHub Actions.
- `FV-04 Transition Kernel #4` — SUCCESS on `a87cef309a84035bce236ac638d8009281443ae7`.
- Foundation Guard #825 and all active project readiness workflows are SUCCESS on the same implementation head.

Mandatory result: **18/18 PASS, 0 waived, 0 deferred, 0 scope exceptions.**
