# CALPQ FV-01 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`
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

## Implementation evidence
FV-01 was implemented under formal FV-00 admission on `impl/m02-batch-a-core-kernel` / Draft PR #56.

- A1 implementation: `d2357bf16b0e1b45ff548dd7ded82e6134beece0` — `feat(core): implement FV-01 semantic primitives`.
- A2 executable proof: `7677c06b205c2842e8a9f8ec0a78a92587045fb3` — `test(core): add FV-01 executable contract evidence`.
- Governance fixture forward-fix: `bfc0ecbe6ad15936d3e0445f4da1ad9ee610f654` — historical FROZEN self-tests remain source-empty without changing admitted source.
- Dedicated CI: `FV-01 Core Primitives #3` — SUCCESS.
- Foundation Guard #811 — SUCCESS.
- M00 Readiness #690 — SUCCESS.
- M02 Batch A Manifest #42 and M02 Batch Readiness #99 — SUCCESS.
- Program Execution Readiness #113, M03-M08 #70, M09-M12 #59 and CALPQ v1 Execution Index #50 — SUCCESS.
- No FV-01 mandatory test was waived and no scope exception was used.

Result: all FV-01 Definition-of-Done conditions are satisfied. The next planned Batch A step is A3 / FV-02, provider-neutral `Clock` and `IdGenerator` ports with deterministic fakes.
