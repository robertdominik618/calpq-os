# FV-07 Test Index

Status: `18 OF 18 EXECUTABLE / VERIFIED`

Mandatory count: 18.

1. repository-domain-type
2. tenant-scope
3. unit-of-work
4. idempotency-claim
5. expected-revision
6. authoritative-write
7. event-record
8. outbox-record
9. outcome-record
10. audit-reference
11. atomic-commit
12. rollback-no-partial-state
13. stale-revision-conflict
14. no-last-write-wins
15. external-call-outside-transaction
16. retry-identity
17. core-persistence-independence
18. architecture-boundary

## Verified evidence

`packages/application/test/fv07-persistence.test.ts` maps one-to-one to FV07-01..FV07-18. The deterministic `InMemoryUnitOfWork` exists only as test support and proves tenant isolation, optimistic concurrency, idempotent replay, all-or-nothing mutation evidence and rollback without introducing SQL/ORM semantics into Application contracts or Core.

Evidence head `ccae7f89b8689f8aa9336b4bc329f6afe6d6b0a9`; dedicated `FV-07 Persistence UnitOfWork #2` SUCCESS. No mandatory scenario was waived.
