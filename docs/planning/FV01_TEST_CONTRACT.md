# CALPQ FV-01 Test Contract

Status: `21 OF 21 EXECUTABLE / VERIFIED`
ID: `CALPQ-M02-FV01-TEST-0001`

## Purpose
Define the minimum executable evidence required to complete FV-01 once implementation is permitted.

## Mandatory test groups

### Typed identifiers
1. valid UUIDv7 input is accepted for the correct semantic ID type;
2. canonical serialization is lowercase UUID text;
3. invalid UUID input is rejected;
4. a SubjectId cannot be substituted for a CredentialId without an explicit conversion boundary;
5. an ID remains immutable after construction;
6. database numeric identity is never accepted as CALPQ domain identity.

### Time and date
7. persisted instant representation is absolute UTC;
8. canonical textual instant carries an explicit `Z` offset;
9. date-only and instant values are not interchangeable;
10. Core primitive construction does not depend on global wall-clock access.

### Revision and version
11. revision rejects negative values;
12. revision is represented as a monotonic domain value, not a timestamp;
13. version identifiers remain explicit and are not inferred from revision or ID.

### Actor and subject
14. Actor and Subject are distinct semantic references;
15. equality of their underlying real-world party does not collapse the two concepts.

### Jurisdiction and verification state
16. only controlled jurisdiction values enter Core;
17. free-form jurisdiction text is rejected at the Core boundary;
18. verification state is represented by an approved controlled value, not arbitrary text.

### Architecture boundary
19. `@calpq/core` has no React, Expo, Fastify, ORM/database, provider SDK or AI/OCR SDK dependency;
20. no credential-specific aggregate, eligibility calculation or AuthorizationGrant behavior is introduced by FV-01;
21. no direct global randomness or wall-clock call is used inside deterministic Core primitives.

## Completion rule
FV-01 cannot be closed with a mandatory test waived. If a listed primitive is deliberately removed from FV-01 scope, the implementation contract and Issue #8 must be changed before coding, with the reason recorded.

## Required evidence
The FV-01 completion change must include implementation and tests together, plus a green dependency/boundary check and all active project guards.

## Verified executable evidence
- `packages/core/test/fv01-primitives.test.ts` contains exactly 21 runtime tests mapped one-to-one to FV01-01..FV01-21.
- `packages/core/test/fv01-types.compile.ts` proves nominal compile-time separation for `SubjectId`/`CredentialId` and `ActorReference`/`SubjectReference`.
- `tests/fv01_core_primitives_test.sh` enforces the admitted lifecycle, exactly 21 mandatory tests, TypeScript compilation, zero runtime dependencies, forbidden-import checks, no global wall-clock/randomness and no later-phase aggregate leakage.
- `.github/workflows/fv01-core.yml` executes the evidence under pinned Node 24 and pinned GitHub Actions.
- `FV-01 Core Primitives #3` is SUCCESS on `bfc0ecbe6ad15936d3e0445f4da1ad9ee610f654`.
- Foundation Guard #811 and every active project readiness workflow are SUCCESS on the same head.

Mandatory test result: **21/21 PASS, 0 waived, 0 deferred, 0 scope exceptions.**
