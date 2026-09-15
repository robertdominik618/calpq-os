# CALPQ FV-07 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-07 prepares persistence ports, tenant-aware repositories and UnitOfWork behavior.

One accepted logical command coordinates idempotency check, expected revision check, authoritative mutation, event/outbox record, outcome record and required audit/provenance reference in one transaction boundary.

Repositories return domain values, not raw database rows as domain truth. Single-aggregate writes use optimistic revision matching. Core remains unaware of SQL, ORM sessions, transactions and connection pools. External network calls are outside the authoritative transaction.

## Implementation evidence

- B3 contracts: `7af049ab5b6d2ff32491db1dd828c3691bee5caa`.
- B4 executable evidence: `ccae7f89b8689f8aa9336b4bc329f6afe6d6b0a9`.
- `TenantScopedRepository<T>` exposes tenant-explicit domain-value reads; authoritative writes are only accepted through `UnitOfWorkPort`.
- `AcceptedMutation` binds tenant, logical command identity, expected/next revision, authoritative state, event, outbox, outcome and audit reference.
- `executeAcceptedMutation` performs post-commit side effects only after a newly committed durable mutation; idempotent replay does not repeat them.
- Deterministic in-memory evidence proves commit/rollback/concurrency semantics without introducing a database adapter.

CI on evidence head `ccae7f89b8689f8aa9336b4bc329f6afe6d6b0a9`: FV-07 Persistence UnitOfWork #2, FV-06 #10, Foundation #854, M00 #733, M02 Batch Readiness #142, Program #156, M03-M08 #113, M09-M12 #102 and v1 Index #93 all SUCCESS.
