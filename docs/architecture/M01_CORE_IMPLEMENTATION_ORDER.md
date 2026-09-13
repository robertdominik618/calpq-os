# CALPQ M01 Core Implementation Order

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-ARCH-M01-PREP-0001`

## Purpose

Define the exact order of the first implementation work after M00 release so Core is established before product features and adapters.

## Phase 1 — Core primitives

Implement and unit-test only:

1. typed UUIDv7 identifiers;
2. UTC instant/date semantic types;
3. revision/version value types;
4. actor and subject references;
5. jurisdiction and verification-state values.

No credential-specific aggregate is admitted in Phase 1.

## Phase 2 — Provider-neutral Core ports

Define minimal interfaces for:

- `Clock`;
- `IdGenerator`.

These ports provide nondeterministic inputs explicitly. Core may not access wall-clock time or randomness globally.

## Phase 3 — Provenance and evidence model

Implement source references, evidence references, derivation links and provenance envelopes. Tests must prove original evidence cannot be silently replaced by derived/OCR/AI content.

## Phase 4 — Result and error model

Implement `SATISFIED`, `NOT_SATISFIED`, `INDETERMINATE`, `REVIEW_REQUIRED`, stable reason codes and the Core error taxonomy.

Tests must distinguish legitimate domain outcomes from processing failures.

## Phase 5 — Contract projection

Only after Core semantics are stable may `packages/contracts` project approved schemas/ports for Application/adapters. Contract serialization is tested against Core values; transport shape does not become domain truth.

## Phase 6 — Application kernel

Introduce the first Application orchestration primitives: operation/correlation context, actor context and unit-of-work/use-case boundary. Application may coordinate Core but may not move domain rules out of Core.

## Phase 7 — First vertical product slice

Only after Phases 1–6 pass architecture and unit tests may the first product vertical be admitted. The vertical must use existing primitives instead of creating duplicate identity, time, provenance, result or error semantics.

The first product slice requires its own approved scope/contract and is not selected by this document.

## Test-first rule

Each phase requires tests in the same coherent change as the implementation. A later phase may not be merged while a prerequisite phase has unresolved contract or architecture failures.

## Dependency rule

Expected dependency direction after M00 release:

`apps/workers -> application -> core`

`adapters -> contracts/application/core` as required by the implemented port.

`core -> no outward application/framework/provider dependency`.

## Forbidden first-commit shortcuts

The first implementation may not:

- place business rules in React/Expo/Fastify handlers;
- introduce a generic untyped `string` ID for multiple aggregate types;
- read `Date.now()` or random UUIDs directly inside deterministic Core rules;
- use database row IDs as domain identity;
- encode verified/unverified state as free text;
- persist derived AI/OCR content as if it were original evidence;
- expose provider-specific exceptions as Core errors.

## Definition of ready for first product vertical

The Core kernel is ready when all four contracts in `CALPQ-M01-PREP-0001` are implemented, dependency tests pass, serialization round-trips are verified, deterministic tests use injected clock/ID sources, and no product-specific workaround is required to express provenance, results or errors.
