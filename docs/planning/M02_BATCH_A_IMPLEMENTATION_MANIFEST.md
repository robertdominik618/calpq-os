# CALPQ M02 Batch A Implementation Manifest

Status: `IMPLEMENTED / MACHINE-VERIFIED / REVIEW CANDIDATE`
ID: `CALPQ-M02-BATCH-A-MANIFEST-0001`
Scope: `FV-01..FV-05`

## Purpose
Record the implemented first-code manifest for M02 Batch A after governance/admission and preserve the reviewed-candidate exit boundary for Batch B.

## Entry conditions
Satisfied before implementation began:
- M00 repository governance PASS;
- explicit M00 release decision completed;
- feature-development gate OPEN / feature development AUTHORIZED;
- FV-00 formally `ADMITTED_FOR_IMPLEMENTATION`;
- execution entry `M02_BATCH_A_FV01` authorized.

## Implemented source shape
The original manifest described logical targets. The implementation preserves those responsibilities while using cohesive subdirectories where that improves ownership and testability:
- typed identifiers and semantic values in Core primitive modules;
- Clock/IdGenerator provider-neutral ports plus deterministic test support;
- provenance/evidence and result/error modules;
- transition/revision/idempotency kernel;
- credential-evidence domain types under `packages/core/src/credential/`;
- one explicit Core public export boundary.

The implementation does not introduce runtime dependencies into `@calpq/core`.

## Execution sequence completed
1. FV-01 typed IDs and semantic primitives.
2. FV-01 executable contract evidence.
3. FV-02 Clock/IdGenerator ports and deterministic fakes.
4. FV-03 provenance/evidence primitives and Result/error semantics.
5. FV-04 command/event/revision/idempotency transition kernel.
6. FV-05 CredentialArtifact/evidence snapshot domain types.
7. compile-time nominal and immutability proofs.
8. architecture/dependency guards.
9. cumulative slice regression correction so each FV validates its owned source while common invariants remain global.
10. Batch A exit CI/evidence snapshot.

## Non-negotiable boundaries — verified
- Core knows no React, React Native, Expo, Fastify, OpenAPI, SQL, ORM or persistence adapter.
- Core knows no AI/OCR/provider SDK.
- Actor and Subject remain distinct concepts.
- document/evidence/verification/eligibility/authorization remain distinct.
- CredentialArtifact cannot create or imply AuthorizationGrant.
- Clock/IdGenerator are injected ports; no ambient time/randomness is used by governed rules.
- accepted logical transition semantics remain idempotent under retry/concurrency contracts.
- projections/read models remain outside Batch A.

## Exit evidence
Candidate head: `9d894e017912f29e3d87029d07b37f0ae2b24b12`.
Branch: `impl/m02-batch-a-core-kernel`.
Draft PR: #56.

Dedicated workflows:
- FV-01 #21 — SUCCESS;
- FV-02 #17 — SUCCESS;
- FV-03 #14 — SUCCESS;
- FV-04 #11 — SUCCESS;
- FV-05 #6 — SUCCESS.

Project guards:
- Foundation #833 — SUCCESS;
- M00 #712 — SUCCESS;
- M02 Batch A #64 — SUCCESS;
- M02 Readiness #121 — SUCCESS;
- Program #135 — SUCCESS;
- M03-M08 #92 — SUCCESS;
- M09-M12 #81 — SUCCESS;
- v1 Index #72 — SUCCESS.

## Completion boundary
The implementation and machine evidence satisfy the Batch A Definition of Done. Batch A is therefore a review candidate with zero known hard implementation blockers. Per `M02_BATCH_BRANCH_PR_STRATEGY.md`, Batch B must be based on the reviewed Batch A result; merge/review disposition of PR #56 remains a separate governed action and is not implied by this evidence record.
