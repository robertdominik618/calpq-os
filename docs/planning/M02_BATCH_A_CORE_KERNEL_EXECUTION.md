# CALPQ M02 Batch A — Core Kernel Execution Package

Status: `IMPLEMENTED / EXIT EVIDENCE GREEN / READY FOR REVIEW`
ID: `CALPQ-M02-BATCH-A-0001`
Scope: FV-01 through FV-05.

## Objective
Deliver the deterministic Core kernel required by every later CALPQ capability before any framework, persistence or transport logic is admitted.

## Included work
1. FV-01 — typed UUIDv7 identifiers and semantic values.
2. FV-02 — provider-neutral Clock and IdGenerator ports.
3. FV-03 — provenance, evidence, result and error semantics.
4. FV-04 — command/event/revision/idempotency kernel.
5. FV-05 — minimal credential-evidence domain types.

## Planned commit sequence
A1. core primitive types and value validation.
A2. core primitive tests and serialization round-trips.
A3. Clock/IdGenerator port contracts and deterministic fakes.
A4. provenance/source/evidence primitives.
A5. Core result/reason/error taxonomy.
A6. command/event envelopes, revision and transition contracts.
A7. idempotency/concurrency semantics and deterministic transition tests.
A8. CredentialArtifact/evidence domain types and non-equivalence invariants.
A9. architecture/dependency guard update for new Core source.
A10. Batch A integration test pass and evidence snapshot.

## File ownership
Implementation ownership is restricted to `packages/core` plus test fixtures/contracts required to prove Core behavior. `packages/application`, adapters, apps, workers and persistence-specific code remain outside Batch A except for compile-time test fixtures that do not move business logic outward.

## Hard invariants
- Core has no React, Expo, Fastify, SQL/ORM, queue, cloud, OCR or AI provider dependency.
- durable IDs remain typed and semantically non-interchangeable.
- wall-clock time and randomness enter through explicit ports.
- original evidence and derived information remain distinct.
- legitimate domain outcomes are not infrastructure exceptions.
- same logical command cannot create duplicate accepted transitions.
- CredentialArtifact never implies AuthorizationGrant.

## Required evidence
All FV-01..FV-05 mandatory test/check points are executable implementation evidence. Tests and implementation are present in the same coherent Batch A series. Dependency-boundary tests prove Core remains provider/framework neutral.

## Definition of Done
Batch A implementation is complete when FV-01 through FV-05 are implemented in dependency order, every mandatory test passes, serialization is deterministic, no forbidden dependency appears, no non-equivalence invariant is weakened, and the resulting Core API is sufficient for Batch B without product-specific workarounds.

## Stop conditions
Stop Batch A and return to architecture review if typed IDs collapse to generic strings, time/randomness is read globally in deterministic rules, provenance cannot distinguish original from derived evidence, command idempotency cannot be proven, or credential evidence begins to encode authorization truth.

## Governance boundary
Implementation was admitted through M00 release governance, Feature Development Gate authorization and FV-00 formal admission. Batch B remains separately dependent on a reviewed Batch A result; this document does not itself authorize merging PR #56 or starting Batch B from an unreviewed head.

## Exit evidence
Reviewed-candidate implementation head: `9d894e017912f29e3d87029d07b37f0ae2b24b12` on `impl/m02-batch-a-core-kernel` / PR #56.

Dedicated slice evidence on that head:
- FV-01 Core Primitives #21 — SUCCESS;
- FV-02 Core Ports #17 — SUCCESS;
- FV-03 Core Provenance #14 — SUCCESS;
- FV-04 Transition Kernel #11 — SUCCESS;
- FV-05 Credential Evidence #6 — SUCCESS.

Cross-project evidence on that head:
- Foundation Guard #833 — SUCCESS;
- M00 Readiness #712 — SUCCESS;
- M02 Batch A Manifest #64 — SUCCESS;
- M02 Batch Readiness #121 — SUCCESS;
- Program Execution Readiness #135 — SUCCESS;
- M03-M08 Execution Readiness #92 — SUCCESS;
- M09-M12 Execution Readiness #81 — SUCCESS;
- CALPQ v1 Execution Index #72 — SUCCESS.

No hard blocker remains in the implementation itself. Known limitations are the explicit Batch A non-goals: no persistence, Application orchestration, transport, UI, provider SDK, eligibility evaluator or authorization issuance. Recovery is source-only at this stage: revert/forward-fix on the implementation branch; no schema/data migration exists. Unresolved hard risks: 0.
