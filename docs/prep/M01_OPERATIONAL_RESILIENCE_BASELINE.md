# CALPQ M01 Operational Resilience Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0015-B`

## Source
This repository baseline materializes the design previously tracked in GitHub Issue #4.

## Required boundaries
1. accepted domain truth survives downstream technical failure;
2. duplicate delivery is handled with stable command/event identity and idempotent consumers;
3. authoritative state outranks projections, indexes, caches and telemetry;
4. dependency outage cannot become a fabricated credential/authorization conclusion;
5. restore/recovery requires consistency validation before normal traffic;
6. access/privacy/retention controls remain active in degraded and recovery modes;
7. telemetry is diagnostic only and excludes unnecessary sensitive payloads;
8. Core remains independent from queue/retry/telemetry/provider SDKs;
9. rebuild/replay/reconciliation cannot issue or mutate `AuthorizationGrant` by themselves;
10. recovery actions are auditable and preserve provenance/correlation.

## M01 handoff condition
This PREP is considered machine-enforced only when the dedicated guard is chained into Foundation CI and emits `M01 OPERATIONAL RESILIENCE: PASS` on the current PREP head.
