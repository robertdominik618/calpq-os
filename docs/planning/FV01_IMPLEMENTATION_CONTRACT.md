# CALPQ FV-01 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M02-FV01-IMPL-0001`

## Purpose
Define the exact first coding scope for FV-01 once existing project gates permit implementation.

## Authoritative inputs
FV-01 implements only Phase 1 of `docs/architecture/M01_CORE_IMPLEMENTATION_ORDER.md` and conforms to `docs/contracts/CORE_PRIMITIVES.md`.

## Scope
FV-01 is limited to framework-free Core values for:
1. semantically distinct UUIDv7 identifiers;
2. UTC instant values and date-only values as distinct semantic types;
3. non-negative monotonically increasing revisions;
4. explicit version identifiers;
5. Actor and Subject references as separate concepts;
6. controlled Jurisdiction values;
7. controlled verification-state values.

## Invariants
- canonical UUID text is lowercase;
- durable IDs are opaque and immutable;
- different semantic IDs are not freely interchangeable;
- database row or sequence IDs are not CALPQ domain identity;
- instant and date-only values are different semantic types;
- Core does not read wall-clock time or randomness globally;
- revision is not a timestamp and is not inferred from an ID;
- Actor and Subject remain distinct;
- Jurisdiction is controlled data, not unvalidated free text;
- no credential aggregate, eligibility rule, AuthorizationGrant logic, persistence model, transport DTO, UI rule or provider SDK type belongs in FV-01.

## Dependency boundary
The implementation belongs in `@calpq/core`. Core has no dependency on React, Expo, Fastify, ORM/database clients, storage SDKs, AI/OCR SDKs or provider libraries.

## Intended implementation shape
When coding becomes permitted, create the smallest coherent `packages/core/src/` structure needed for these primitive families and one public export boundary. Semantic types must not be collapsed into generic strings or a single generic ID type.

## Definition of done
- all listed primitive families exist explicitly in Core;
- FV-01 tests pass;
- dependency checks prove Core remains framework/provider independent;
- no later-phase capability enters the change;
- all active Foundation, M01 and M02 guards remain green.
