# CALPQ M02 Batch B — Application, Persistence & Evidence Pipeline

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M02-BATCH-B-0001`
Scope: FV-06 through FV-10.

## Objective
Connect the deterministic Batch A Core to governed Application orchestration, durable persistence, document intake and verification without moving domain policy out of Core.

## Included work
1. FV-06 — ApplicationExecutionContext and use-case handlers.
2. FV-07 — tenant-aware repositories and UnitOfWork.
3. FV-08 — versioned SQL migrations plus transactional outbox/inbox.
4. FV-09 — minimal immutable-original document evidence intake.
5. FV-10 — provider-neutral verification orchestration.

## Planned commit sequence
B1. Application execution context and use-case boundaries.
B2. Application ports and orchestration tests.
B3. repository contracts and UnitOfWork transaction boundary.
B4. optimistic concurrency/idempotency integration.
B5. initial explicit SQL migration baseline and migration registry.
B6. transactional outbox/inbox and deduplication semantics.
B7. immutable original intake record/storage reference flow.
B8. derived extraction/review representation with lineage to original.
B9. verification request/route/record orchestration and authority resolution boundary.
B10. Batch B end-to-end evidence-pipeline tests and reconciliation evidence.

## File ownership
Primary ownership is `packages/application`, persistence/provider-neutral contracts, `packages/adapters` implementations, migrations and tests. `packages/core` may only change through separately reviewed contract extensions that preserve M01 invariants. UI apps do not own business rules in this batch.

## Hard invariants
- Application coordinates Core; it does not replace Core policy.
- one accepted logical command atomically coordinates idempotency, expected revision, state mutation, event/outbox, outcome and audit/provenance reference.
- external network calls do not remain open inside authoritative DB transactions.
- applied SQL migrations are immutable; corrections are new migrations.
- original document bytes/reference and derived extraction are different records.
- OCR/AI extraction never becomes VERIFIED by confidence alone.
- technical verification does not imply issuer/legal authority or AuthorizationGrant.
- provider outage produces uncertainty/retry semantics, not a negative legal conclusion.

## Required evidence
Executable FV-06..FV-10 tests, transaction failure tests, stale-revision tests, duplicate-delivery tests, migration checksum tests, original immutability tests, extraction lineage tests and verification authority-boundary tests.

## Definition of Done
Batch B is complete when Application can execute the first vertical through authoritative persistence, ingest immutable evidence, preserve derived lineage, perform provider-neutral verification and recover from duplicate/retry conditions without corrupting Core truth.

## Stop conditions
Return to architecture review if Application begins deciding eligibility, a repository leaks tenant scope, authoritative writes can partially commit, migrations silently reinterpret historical meaning, extraction overwrites originals, or verifier/provider output bypasses authority resolution.

## Governance boundary
This package is executable only after Batch A exit and all active project admission gates. Planning readiness is not implementation admission.