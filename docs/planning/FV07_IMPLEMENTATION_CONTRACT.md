# CALPQ FV-07 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-07 prepares persistence ports, tenant-aware repositories and UnitOfWork behavior.

One accepted logical command must coordinate idempotency check, expected revision check, authoritative mutation, event/outbox record, outcome record and required audit/provenance reference in one transaction boundary.

Repositories return domain values, not raw database rows as domain truth. Single-aggregate writes use optimistic revision matching. Core remains unaware of SQL, ORM sessions, transactions and connection pools. External network calls are outside the authoritative transaction.