# CALPQ M01 Application Layer Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0019`

## Baseline
Application is the orchestration layer between entrypoints and deterministic Core.

Canonical flow:
`API / Worker / Scheduler -> Application Use Case -> Core -> Application Ports -> Adapters`

## Hard separations
- controller/route != use case;
- worker/scheduler != use case;
- use case != Aggregate Root;
- Application orchestration != domain policy;
- repository != Aggregate Root;
- adapter != use case;
- provider SDK != Application contract;
- authentication context != canonical Subject identity;
- successful infrastructure call != satisfied domain requirement.

## Context
All use cases operate with an explicit execution context carrying operation identity, actor, correlation/causation and relevant governed purpose/access references.

## Mutation orchestration
State-changing use cases invoke Core first and persist accepted authoritative changes through the approved UnitOfWork contract. Durable commit precedes ordinary post-commit notifications/publication/indexing.

## Queries
Queries are read-only and cannot silently mutate authoritative state.

## Ports
Application depends only on capability-oriented provider-neutral ports. Concrete databases, cloud storage, registries, OCR/AI vendors, notification providers and telemetry SDKs remain adapters.

## Errors and outcomes
Application preserves the distinction between legitimate domain outcomes, access/policy outcomes, optimistic concurrency conflicts and infrastructure failures. It does not convert one family into another for convenience.

## M00 boundary
This baseline authorizes design only. No Application TypeScript/JavaScript product source is authorized while `feature_development` remains `FROZEN`.