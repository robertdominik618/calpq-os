# CALPQ Unit of Work / Transaction Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0017-B`

## Atomic mutation boundary
One accepted logical command must atomically coordinate:
1. idempotency claim/check;
2. expected aggregate revision check;
3. authoritative state mutation;
4. domain event/outbox record;
5. command outcome record;
6. audit/provenance reference needed to reproduce the decision.

If the transaction does not commit, CALPQ must not expose a partially accepted domain transition.

## Concurrency
Single-aggregate mutations use explicit optimistic revision matching. An update that expects revision `n` must affect exactly the intended aggregate at revision `n`; otherwise the result is a concurrency conflict, not silent replay.

Cross-aggregate invariants require an explicit persistence policy. Depending on the use case this may be `SERIALIZABLE`, row locking, an application-defined transaction lock or another reviewed mechanism. No global isolation choice is allowed to substitute for domain analysis.

## External calls
Network calls to registries, AI/OCR providers, notification services or object storage SHOULD NOT be held open inside an authoritative database transaction. External observations are gathered as explicit inputs/snapshots and the authoritative commit records exactly which versions were used.

## Retry
Serialization/deadlock/infrastructure retry is allowed only under the approved retry/idempotency contract. Retrying must preserve logical command identity where the business intent is unchanged.

## Core boundary
Core remains deterministic and unaware of transactions, SQL, ORM sessions or connection pools. Application defines the unit of work; adapters implement it.
