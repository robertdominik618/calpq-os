# CALPQ FV-01 Test Contract

Status: `PLANNING ONLY / BLOCKED`
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
