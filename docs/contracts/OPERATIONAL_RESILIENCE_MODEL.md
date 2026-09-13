# CALPQ Operational Resilience Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0015-R`

## Purpose
Preserve CALPQ correctness under duplicate delivery, delayed dependencies, projection lag and recovery operations.

## Core invariants
- one logical command causes at most one accepted domain transition;
- accepted domain truth is not reversed by later delivery/index/notification failure;
- duplicate command/event delivery is expected and handled by stable identities;
- authoritative aggregate/event state outranks projections and checkpoints;
- rebuild/reconciliation never rewrites authoritative history;
- dependency outage yields retry/uncertainty/review semantics, never fabricated legal conclusions;
- restored infrastructure is not normal-service-ready until consistency validation passes;
- access, privacy and retention controls remain active during degraded/recovery modes;
- observability is diagnostic, never domain truth;
- Core has no queue, scheduler, telemetry backend or provider SDK dependency.

## Failure classes
`DOMAIN_REJECTION`, `CONCURRENCY_CONFLICT`, `TRANSIENT_DEPENDENCY_FAILURE`, `PERMANENT_DEPENDENCY_FAILURE`, `DELIVERY_DUPLICATE`, `PARTIAL_WORKFLOW_FAILURE`, `PROJECTION_LAG`, `DATA_INTEGRITY_FAILURE`, `RECOVERY_REQUIRED`, `HUMAN_REVIEW_REQUIRED`.

## Retry classes
`SAFE_REPLAY`, `BOUNDED_TRANSIENT_RETRY`, `REISSUE_REQUIRED`, `NO_RETRY`, `HUMAN_REVIEW_REQUIRED`.

## Reconciliation results
`CONSISTENT`, `LAGGING`, `DIVERGED`, `REBUILD_REQUIRED`, `REVIEW_REQUIRED`, `INDETERMINATE`.

## Restore boundary
Restore validation covers authoritative state, outbox/inbox positions, audit references, projection checkpoints and active access/privacy restrictions before normal exposure resumes.

## External dependencies
Registries, trust services, AI/OCR, delivery and storage providers are dependencies, not legal/domain truth. Fallback providers must preserve the same normalized contract and authority policy.

## Observability
Use provider-neutral traces, metrics and logs. Correlation/causation may be propagated when safe. Raw evidence, source documents, credentials, secrets and unnecessary personal data are excluded from ordinary telemetry.

Technical health is separate from domain outcome: `NOT_SATISFIED` is not an infrastructure error and a timeout is not a legal/domain rejection.
