# CALPQ Idempotency and Concurrency Contract

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0002-C`

## Purpose

Prevent duplicate state transitions, silent overwrites and retry-induced corruption across regulated workflows.

## Command idempotency

A `command_id` identifies one logical command. Re-delivery or retry of the same command id must not cause the same accepted state transition to be applied twice.

If a previously completed command is received again, Application may return the previously recorded outcome or an equivalent replay response, but Core state must not advance again.

A caller that wants a semantically new attempt must issue a new command id.

## Idempotency boundary

Idempotency is enforced at the Application/persistence transaction boundary, not through hidden mutable state inside Core.

Core remains pure and deterministic; it does not query an idempotency store.

The persistence implementation must atomically coordinate, for one logical command:

1. idempotency claim/check;
2. aggregate revision check;
3. accepted state write;
4. durable event/outbox write;
5. command outcome record.

The exact database implementation is an adapter concern, but partial success that can create duplicate domain transitions is not acceptable.

## Optimistic concurrency

Every mutation command carries `expected_revision`.

The persisted aggregate revision must equal `expected_revision` at commit time.

If not equal, the operation fails with a concurrency-specific error. CALPQ does not silently re-evaluate a stale command against a newer aggregate state unless a separately defined Application retry policy explicitly reloads state, reconstructs a new command and preserves audit traceability.

## No silent last-write-wins

For regulated or auditable domain state, silent last-write-wins is prohibited as a default conflict policy.

Any future merge/conflict-resolution policy must be explicit per domain and covered by a contract/test set.

## Retry classes

Retries are categorized before execution:

- `SAFE_REPLAY` — same command id; return/reuse prior outcome, no new transition;
- `TRANSIENT_INFRASTRUCTURE_RETRY` — same logical command may retry infrastructure steps while preserving idempotency;
- `REISSUE_REQUIRED` — business input/revision changed; caller must create a new command;
- `HUMAN_REVIEW_REQUIRED` — automatic retry is not permitted.

## Event publication

Domain events are persisted atomically with accepted state through a transactional outbox or equivalent pattern.

External publication may be retried independently. Duplicate transport delivery must be expected and consumers must use stable event ids for deduplication where side effects are non-idempotent.

Publication failure after the authoritative transaction commits does not roll back domain truth; it creates an operational retry condition.

## Conflict audit

Concurrency failures must preserve at minimum:

- command id;
- aggregate id;
- expected revision;
- observed revision where safe/available;
- actor;
- occurred/attempted time;
- correlation id.

## Acceptance tests

The implementation must prove:

- same command id delivered twice produces at most one state transition;
- same command id cannot produce two different durable outcomes;
- stale expected revision cannot overwrite a newer revision;
- outbox/event publication retries cannot duplicate the aggregate transition;
- a concurrency failure is distinguishable from domain rejection;
- no hidden Core dependency on persistence or idempotency storage exists.
