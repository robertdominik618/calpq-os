# CALPQ FV-08 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-08 implements explicit versioned PostgreSQL migrations and outbox/inbox delivery semantics.

Applied migrations are immutable; corrections use new migrations. Migration identity/checksum is recorded. Expand/contract evolution is preferred for compatibility windows. No production ORM auto-migration is allowed.

Accepted domain changes persist publishable outbox records in the same authoritative transaction. Async delivery is at-least-once, stable event identity supports deduplication, consumer checkpoints remain operational metadata, and repeated unprocessable delivery enters explicit review/repair instead of being silently dropped.

Schema evolution changes storage representation only; it must not rewrite historical rule meaning.

## Implementation evidence

- B5 migration authority: `a789a71c9ceed0bb523d8359836301804cae9b59`.
- B6 executable delivery evidence: `93e0ba98f0497b67e8e5d0128055d4529c7b5ee3`.
- PostgreSQL baseline migration checksum: `04279ce639e6a8cd92ca896a005b606efc36212ed35f9748e9da885b4a8564d0`.
- Forward-only EXPAND migration checksum: `ed59e74f56aa97b575c896b99001e5d6cdc5f406f5beb2fc71b0404a1a95baba`.
- CI independently recalculates every migration SHA-256 before running executable evidence.
- Migration registry rejects checksum mismatch and non-prefix applied history.
- Delivery model proves stable EventId, at-least-once retry, inbox dedup, operational checkpoints, duplicate safety, explicit REVIEW_REQUIRED poison handling and absence of global ordering assumptions.

CI on evidence head `93e0ba98f0497b67e8e5d0128055d4529c7b5ee3`: FV-08 Migration Delivery #2, FV-07 #6, FV-06 #14, Foundation #862, M00 #741, M02 Batch Readiness #150, Program #164, M03-M08 #121, M09-M12 #110 and v1 Index #101 all SUCCESS.
