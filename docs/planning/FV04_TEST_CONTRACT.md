# CALPQ FV-04 Test Contract

Status: `PLANNING ONLY / BLOCKED`

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

Detailed semantics are governed by `COMMAND_EVENT_ENVELOPES.md` and `IDEMPOTENCY_AND_CONCURRENCY.md`.