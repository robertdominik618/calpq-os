# CALPQ M01 Core Kernel Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-TEST-M01-PREP-0001`

## Purpose

Define the minimum evidence required before the Core kernel can be considered ready for a first product vertical after M00 release.

## Identity tests

- generated durable IDs validate as UUIDv7;
- canonical serialization round-trips without case/format drift;
- typed IDs of different aggregate classes are not interchangeable at compile-time boundaries;
- entity identity remains unchanged across revisions;
- adapter/database surrogate IDs never replace domain IDs.

## Time tests

- Core behavior is deterministic under an injected fixed Clock;
- persisted instants round-trip as canonical UTC/RFC3339 values;
- date-only values cannot be silently treated as instants;
- time-zone presentation changes do not alter stored domain instants.

## Revision tests

- aggregate revision increases monotonically on accepted state transitions;
- stale expected revision yields `CONFLICT`;
- rejected/invalid operations do not silently advance revision.

## Provenance tests

- a material decision records exact rule/source versions;
- later source updates do not mutate historical provenance;
- original evidence remains separately addressable after extraction/derivation;
- a derived evidence record references its parent;
- `UNVERIFIED` or `STALE/REVIEW_REQUIRED` sources cannot be silently promoted to `VERIFIED`;
- AI/OCR metadata alone cannot create verified authority.

## Result tests

- the four result outcomes are exhaustive and distinguishable;
- reason codes are stable machine-readable values;
- identical explicit inputs produce identical domain outcome/reason references;
- human explanation text may change without changing the machine result contract.

## Error tests

- validation failure maps to `VALIDATION_ERROR`;
- revision race maps to `CONFLICT`;
- stale authoritative material maps to `STALE_SOURCE` where required by the use case;
- provider failures are translated to `EXTERNAL_DEPENDENCY_ERROR` outside Core truth;
- raw SQL/HTTP/cloud/AI/OCR exceptions never appear in Core result contracts;
- invariant violations are distinguishable from legitimate `NOT_SATISFIED` outcomes.

## Architecture tests

- `packages/core` imports no app, UI, adapter or provider package;
- Core has no direct wall-clock/random/environment access;
- contracts may project Core semantics but cannot redefine outcome/verification states;
- apps and adapters cannot introduce alternative shared ID/time/error models.

## Required proof before first vertical

The implementation PR must provide passing unit and architecture tests for every applicable item above, identify any intentionally deferred item, and obtain explicit approval for a deferral before a product vertical depends on the incomplete primitive.
