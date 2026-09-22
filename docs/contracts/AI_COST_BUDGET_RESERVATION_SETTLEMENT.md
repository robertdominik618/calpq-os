# CALPQ AI Cost, Budget Reservation & Settlement Contract

Status: `AI ECONOMY ARCHITECTURE / RUNTIME NOT IMPLEMENTED`  
ID: `CALPQ-AI-ECO-0001-B`

## Purpose

Guarantee that every variable-cost external AI operation is economically funded before provider execution and reconciled afterward.

## Funding sources

Exactly one:

- `USER`;
- `ORGANIZATION`;
- `PARTNER`;
- `PROJECT_PROMOTIONAL_BUDGET`.

Promotional project funding is explicit, purpose-bound, time-limited, hard-capped and separately ledgered. It is never an automatic fallback.

## Entitlement versus consumption

Feature entitlement answers "may this actor use the feature?". AI consumption budget answers "is variable external compute funded?".

Both must pass. Subscription/premium never means unlimited external AI.

## Pre-execution checks

The Cost Governor validates:

- funding source/payer identity;
- finite task maxCost/currency;
- current usable rate card;
- available balance/pool;
- user/organization limits;
- model/provider eligibility;
- minimum contribution margin;
- applicable high-cost confirmation/auto-approve rule;
- anomaly/circuit-breaker state;
- kill switches.

Any failed mandatory check denies before provider call.

## Reservation lifecycle

States:

`PENDING -> RESERVED -> SETTLED` or `PENDING/RESERVED -> RELEASED/CANCELLED/EXPIRED`.

Rules:

- reservation amount equals a safe upper bound for the authorized operation;
- reserve is atomic with balance availability check;
- one logical request cannot reserve twice under the same idempotency key;
- actual cost never settles above reserved maximum;
- unused reservation is released;
- failure/recovery is idempotent and reconciliation-safe;
- retries/tool calls remain inside the same task cost envelope.

## User/organization budget controls

May include:

- per-action maximum;
- daily/monthly hard limit;
- auto-approve threshold;
- high-cost confirmation;
- B2B pool;
- per-user/team/feature quotas;
- provider restrictions.

## Margin guard

A configurable `MINIMUM_CONTRIBUTION_MARGIN` applies to project-charged metered AI. When violated, policy chooses an allowed action such as cheaper routing, scope reduction, disclosed price adjustment, approval requirement or disablement. Silent project subsidy is forbidden.

## BYOK/BYOP

Customer-provided provider credentials may remove provider model cost from CALPQ, but do not bypass Gateway, privacy/security/rights/tool-policy/audit controls. CALPQ may separately monetize orchestration/software.

## Verification

Required implementation tests include race-condition reservation tests, idempotency, settlement/release recovery, insufficient balance, missing funding, max-cost breach and margin guard behavior.
