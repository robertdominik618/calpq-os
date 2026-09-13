# CALPQ Application Transaction and Side-Effect Order

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0019-E`

## Purpose
Define the safe order for authoritative mutations and external side effects.

## Authoritative mutation sequence
For a state-changing use case the Application layer coordinates:
1. establish execution context;
2. perform access/precondition checks required before loading sensitive data;
3. load aggregate/current revision and required governed inputs;
4. invoke deterministic Core;
5. if accepted, atomically persist authoritative state, revision, domain event/outbox, command outcome and required audit references through UnitOfWork;
6. commit;
7. only after durable commit, trigger/schedule external side effects that are not part of the authoritative transaction.

## Side effects
Notifications, external publication, index refresh, analytics, AI explanations and similar effects MUST NOT be treated as proof that the domain transaction succeeded. Their failure after commit creates operational work/retry, not rollback of already committed domain truth.

## Before-commit external calls
External calls before commit are permitted only when their returned observation is required input for the Core decision and the use case explicitly records its source/version/provenance. Such calls MUST NOT themselves perform an irreversible domain-side effect unless governed by a separate saga/compensation contract.

## Retry boundary
A retry of the same logical command preserves command/idempotency identity and must not apply the accepted transition twice.

## Query sequence
Read-only queries do not open a mutation UnitOfWork and MUST NOT emit mutation commands/events as a hidden side effect.