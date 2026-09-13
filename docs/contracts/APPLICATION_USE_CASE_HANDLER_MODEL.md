# CALPQ Application Use Case and Handler Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0019-A`

## Purpose
Define how Application coordinates approved use cases without absorbing domain rules from Core.

## Use case types
- command use case: may request authoritative state transition;
- query use case: read-only projection/query orchestration;
- workflow use case: coordinates several approved commands/queries/ports while preserving explicit boundaries.

## Handler responsibilities
A handler may:
- validate transport-independent application input shape;
- establish actor/correlation/causation context;
- load required aggregates through repository ports;
- invoke deterministic Core behavior;
- coordinate UnitOfWork and approved outbound ports;
- translate Core result/error contracts into Application outcomes.

A handler MUST NOT invent eligibility, authorization, credential, lifecycle, access, privacy, compliance or security rules.

## Hard boundaries
- Controller/HTTP route != use case.
- Worker/scheduler != use case.
- Use case != Aggregate Root.
- Application orchestration != domain policy.
- Query handler MUST NOT mutate authoritative state.
- Domain rejection MUST remain distinct from infrastructure failure.

## Determinism
Nondeterministic values such as time and identifiers enter through approved ports/context. Application may acquire them and pass them explicitly to Core; Core does not fetch them globally.