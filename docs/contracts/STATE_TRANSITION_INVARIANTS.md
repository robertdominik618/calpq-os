# CALPQ State Transition Invariants

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0002-D`

## Purpose

Define non-negotiable rules that every future CALPQ aggregate transition must satisfy.

## Invariants

1. **Single mutation authority** — aggregate state changes only through an accepted aggregate transition.
2. **Determinism** — normalized identical inputs produce identical Core outcomes.
3. **Revision integrity** — accepted state-changing transitions advance revision exactly once.
4. **No mutation on rejection** — rejected, indeterminate and review-required outcomes do not mutate authoritative state unless a separately modeled pending-review transition is explicitly accepted.
5. **Traceability** — every state change is attributable to command, actor, correlation and rule/contract versions where material.
6. **Evidence separation** — evidence references support a decision but raw evidence, OCR output and AI output are not silently promoted into verified domain truth.
7. **Historical reproducibility** — a material historical decision retains enough version/provenance information to explain which rules and evidence were used.
8. **No adapter truth** — persistence, HTTP, UI, queue or provider state cannot redefine a Core invariant.
9. **No hidden time/randomness** — time and ids enter through explicit controlled inputs/ports.
10. **No implicit conflict resolution** — concurrency conflicts cannot be resolved by silent overwrite.
11. **Event consistency** — emitted domain events describe facts created by the accepted transition and reference the resulting revision.
12. **Atomic authority** — authoritative state and its durable audit/event representation must not diverge because of a partial adapter transaction.
13. **Explicit uncertainty** — insufficient authority/evidence results in `INDETERMINATE` or `REVIEW_REQUIRED`, never fabricated certainty.
14. **Stable semantic contracts** — domain meaning cannot depend on route names, UI components, database column names or framework class names.
15. **Backward-accountable change** — changes to an invariant, transition schema or material semantic rule require versioning and migration/compatibility review.

## Required test style

For every aggregate, tests are written from invariants first, examples second. Happy-path examples alone are insufficient.

At minimum each aggregate test suite must include:

- initial-state invariants;
- valid transition;
- invalid/rejected transition;
- stale revision;
- duplicate command;
- missing/insufficient authoritative input where relevant;
- provenance preservation;
- serialization/rehydration equivalence when persistence is introduced;
- regression test for every corrected state-transition defect.

## Change control

No product vertical may weaken these invariants locally. If a domain genuinely requires an exception, the exception must be elevated to an architecture/contract decision and approved before implementation.
