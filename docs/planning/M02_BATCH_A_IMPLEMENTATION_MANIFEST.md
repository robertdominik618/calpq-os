# CALPQ M02 Batch A Implementation Manifest

Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M02-BATCH-A-MANIFEST-0001`
Scope: `FV-01..FV-05`

## Purpose
Provide the exact first-code manifest for M02 Batch A after governance/admission. This file does not authorize implementation while the feature-development gate is locked.

## Entry conditions
- M00 repository governance PASS;
- explicit M00 release decision completed;
- feature-development gate transitioned under approved governance;
- FV-00 formally `ADMITTED_FOR_IMPLEMENTATION`;
- Batch A issue #47 moved from blocked planning to active implementation.

## Current pre-code baseline
`packages/core` must remain source-empty while implementation is blocked. Allowed current files: `README.md` and `package.json` only.

## Planned source files
A1. `packages/core/src/ids.ts` — typed semantic IDs and UUIDv7 validation/canonicalization.
A2. `packages/core/src/time.ts` — UTC instant/date-only semantic values and deterministic time contracts.
A3. `packages/core/src/nondeterminism.ts` — provider-neutral Clock and IdGenerator ports.
A4. `packages/core/src/provenance.ts` — provenance/evidence lineage primitives.
A5. `packages/core/src/result.ts` — deterministic result/error/domain-outcome primitives.
A6. `packages/core/src/command.ts` — command identity and metadata primitives.
A7. `packages/core/src/event.ts` — domain event envelope primitives.
A8. `packages/core/src/revision.ts` — revision/version and optimistic-concurrency primitives.
A9. `packages/core/src/idempotency.ts` — idempotency semantics and accepted-transition guard primitives.
A10. `packages/core/src/credential-artifact.ts` — minimal credential/evidence domain types; no AuthorizationGrant issuance.
A11. `packages/core/src/index.ts` — explicit public exports only.

## Planned test files
T1. `packages/core/test/ids.test.ts`
T2. `packages/core/test/time.test.ts`
T3. `packages/core/test/nondeterminism.test.ts`
T4. `packages/core/test/provenance.test.ts`
T5. `packages/core/test/result.test.ts`
T6. `packages/core/test/command-event.test.ts`
T7. `packages/core/test/revision-idempotency.test.ts`
T8. `packages/core/test/credential-artifact.test.ts`
T9. `packages/core/test/architecture-boundary.test.ts`
T10. `packages/core/test/batch-a-integration.test.ts`

## Package metadata changes allowed during Batch A
- add compile/test scripts needed only for `@calpq/core`;
- add package exports for the explicit public barrel;
- add development-only test/build tooling already approved by the monorepo/toolchain;
- no runtime dependency on UI, HTTP, database, ORM, cloud/provider or AI/OCR SDKs.

## Commit sequence
1. A1 — typed IDs and UUIDv7 semantics.
2. A2 — instant/date semantic values.
3. A3 — Clock and IdGenerator ports.
4. A4 — provenance/evidence lineage.
5. A5 — Result/error/domain-outcome model.
6. A6 — Command/Event envelopes.
7. A7 — revision and optimistic-concurrency semantics.
8. A8 — idempotency/accepted-transition semantics.
9. A9 — CredentialArtifact/evidence primitives.
10. A10 — public exports, architecture guard and Batch A integration evidence.

## Non-negotiable boundaries
- Core knows no React, React Native, Expo, Fastify, OpenAPI, SQL, ORM or persistence adapter.
- Core knows no AI/OCR/provider SDK.
- Actor and Subject remain distinct concepts.
- document/evidence/verification/eligibility/authorization remain distinct.
- CredentialArtifact cannot create or imply AuthorizationGrant.
- Clock/IdGenerator are injected ports; no ambient time/randomness in governed rules.
- accepted logical transition must be provably idempotent under retry/concurrency.
- projections/read models do not belong in Batch A.

## Definition of Done
Batch A is complete only when all FV-01..FV-05 contract tests pass, architecture boundaries pass, public exports are intentional, no forbidden dependency exists, and durable Batch A exit evidence is attached to issue #47. Mergeability alone is not completion evidence.
