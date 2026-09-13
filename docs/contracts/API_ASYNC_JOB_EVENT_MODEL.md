# CALPQ Async API Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0018-E`

Long-running operations return a stable operation identifier.

Operational states may include `QUEUED`, `RUNNING`, `SUCCEEDED`, `FAILED`, `REVIEW_REQUIRED`, `CANCELLED`.

Operational state is not domain truth. `SUCCEEDED` means processing completed, not that a requirement is `SATISFIED`.

External event delivery uses stable event IDs and versioned contracts. Delivery is at-least-once and duplicate delivery is expected.

External payloads expose minimum-necessary projections rather than unrestricted source evidence.