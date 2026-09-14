# CALPQ FV-08 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-08 prepares explicit versioned SQL migrations and outbox/inbox delivery semantics.

Applied migrations are immutable; corrections use new migrations. Migration identity/checksum must be recorded. Expand/contract evolution is preferred for compatibility windows. No production ORM auto-migration is allowed.

Accepted domain changes persist publishable outbox records in the same authoritative transaction. Async delivery is at-least-once, stable event identity supports deduplication, consumer checkpoints remain operational metadata, and repeated unprocessable delivery enters explicit review/repair instead of being silently dropped.

Schema evolution changes storage representation only; it must not rewrite historical rule meaning.