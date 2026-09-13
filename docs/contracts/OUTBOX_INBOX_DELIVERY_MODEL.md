# CALPQ Outbox / Inbox Delivery Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0017-C`

## Outbox
Accepted domain changes persist their publishable event/outbox record in the same authoritative database transaction as the state change.

Publication happens after commit and may be retried. Publication failure does not roll back committed domain truth.

## Delivery semantics
CALPQ assumes at-least-once delivery across asynchronous boundaries. It MUST NOT claim end-to-end exactly-once delivery unless a later ADR proves a narrower guarantee.

Every message/event carries stable identity, correlation and causation metadata.

## Inbox / consumer deduplication
A consumer that can cause an externally visible or non-idempotent effect records a deduplication/inbox key such as `(consumer_id, event_id)` before or atomically with its local effect where feasible.

Duplicate delivery of the same stable event must not repeat the same logical side effect.

## Checkpoints
Projection/consumer checkpoints are operational metadata. They identify processed source position/revision and are rebuildable. They MUST NOT become authoritative credential, authorization or compliance state.

## Poison / unprocessable delivery
A repeatedly unprocessable message is quarantined or routed to explicit review/repair workflow. It is not silently dropped and is not converted into a domain rejection.

## Ordering
Only ordering guarantees explicitly required by a domain stream/aggregate are relied upon. CALPQ does not assume global event ordering.
