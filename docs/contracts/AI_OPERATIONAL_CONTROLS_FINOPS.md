# CALPQ AI Operational Controls & FinOps Contract

Status: `AI ECONOMY ARCHITECTURE / RUNTIME NOT IMPLEMENTED`  
ID: `CALPQ-AI-ECO-0001-E`

## Purpose

Bound retries, agents/background compute and operational spend while providing owner-visible economics and emergency controls.

## Hard bounds

Every AI task has finite:

- maxInputUnits;
- maxOutputUnits;
- maxModelCalls;
- maxToolCalls;
- maxRetries;
- maxDurationMs;
- maxCost;
- maxAgentSteps where applicable.

Limits are enforced at runtime, not advisory documentation.

## Retry

Paid retry consumption remains inside the original reserved maximum unless a separately authorized task is created. Retry exhaustion returns safe failure/fallback.

## Agent workflows

Agents declare finite steps/calls/tools/retries/duration/cost plus allowed tools/providers. Reaching a limit stops execution.

## Background/bulk AI

Background AI is event-driven, deduplicated, budgeted, concurrency-limited, change-conditioned and kill-switchable.

A bulk job has a known maximum batch cost before start.

## Spend anomaly guard

Anomaly policies monitor user/feature/provider/model spend/units/cost-per-operation and can trigger a circuit breaker before further external execution.

## Kill switches

Operations can disable without application release:

- provider;
- model;
- feature;
- region;
- organization;
- user AI access;
- background AI;
- agent workflows;
- all external AI.

## FinOps

Owner-visible metrics include revenue, external provider cost, variable AI infrastructure cost, contribution margin, cost per feature/provider/model/payer, average operation cost, cache hit ratio, deterministic/local resolution ratio, external AI avoidance rate, denied requests, anomalies and unfunded spend.

Normative targets:

- `AI Cost Attribution Rate = 100%`;
- `Unfunded External AI Spend = 0`.

## Economic classes

`INCLUDED_COMPUTING`, `METERED_AI`, `SPONSORED_AI` are distinct analytics/billing classes.

## Release gate

No variable-cost AI feature is production-admissible until implementation evidence proves Gateway, deterministic-first routing, Cost Governor, reservation/settlement, usage ledger, rate card, anomaly guard, kill switches and zero-unfunded-spend negative tests.

Architecture/code existence alone is not production validation.
