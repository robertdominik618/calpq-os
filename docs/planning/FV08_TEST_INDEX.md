# FV-08 Test Index

Status: `16 OF 16 EXECUTABLE / VERIFIED`

Mandatory count: 16.

1. migration-order
2. migration-checksum
3. applied-migration-immutable
4. forward-fix
5. expand-contract
6. no-orm-auto-migration
7. outbox-same-transaction
8. post-commit-publication
9. at-least-once
10. stable-event-id
11. consumer-dedup
12. checkpoint-not-domain-truth
13. duplicate-delivery-safe
14. poison-message-review
15. no-global-order-assumption
16. architecture-boundary

## Verified evidence

`packages/adapters/test/fv08-migrations-delivery.test.ts` maps one-to-one to FV08-01..FV08-16. `tests/fv08_migration_delivery_test.sh` independently verifies SHA-256 checksums from the migration manifest before running runtime and TypeScript evidence. `packages/adapters/test/fv08-types.compile.ts` proves migration and event identity immutability at compile time.

Evidence head `93e0ba98f0497b67e8e5d0128055d4529c7b5ee3`; dedicated `FV-08 Migration Delivery #2` SUCCESS. No mandatory test was waived or deferred.
