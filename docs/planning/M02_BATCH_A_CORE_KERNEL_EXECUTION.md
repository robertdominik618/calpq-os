# CALPQ M02 Batch A — Core Kernel Execution Package

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
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
Expected implementation ownership is restricted to `packages/core` plus test fixtures/contracts required to prove Core behavior. `packages/application`, adapters, apps, workers and persistence-specific code are outside Batch A except for compile-time test fixtures that do not move business logic outward.

## Hard invariants
- Core has no React, Expo, Fastify, SQL/ORM, queue, cloud, OCR or AI provider dependency.
- durable IDs remain typed and semantically non-interchangeable.
- wall-clock time and randomness enter through explicit ports.
- original evidence and derived information remain distinct.
- legitimate domain outcomes are not infrastructure exceptions.
- same logical command cannot create duplicate accepted transitions.
- CredentialArtifact never implies AuthorizationGrant.

## Required evidence
All existing FV-01..FV-05 mandatory test/check points must become executable implementation evidence. Tests and implementation land in the same coherent change series. Dependency-boundary tests must prove Core remains provider/framework neutral.

## Definition of Done
Batch A is complete only when FV-01 through FV-05 are implemented in dependency order, every mandatory test passes, serialization is deterministic, no forbidden dependency appears, no non-equivalence invariant is weakened, and the resulting Core API is sufficient for Batch B without product-specific workarounds.

## Stop conditions
Stop Batch A and return to architecture review if typed IDs collapse to generic strings, time/randomness is read globally in deterministic rules, provenance cannot distinguish original from derived evidence, command idempotency cannot be proven, or credential evidence begins to encode authorization truth.

## Governance boundary
This execution package does not admit implementation. It becomes executable only after M00 release governance, feature-development authorization and FV-00 admission are separately satisfied.