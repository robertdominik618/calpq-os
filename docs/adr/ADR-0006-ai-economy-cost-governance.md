# ADR-0006 — AI Economy & Cost Governance

Status: `PROPOSED / OWNER-AUTHORIZED FOR ARCHITECTURE REVIEW`  
Decision owner: CALPQ project owner  
Decision date: `2026-09-23`  
Issue: #166  
Architecture: `CALPQ-AI-ECO-0001`

## Context

CALPQ already separates deterministic domain truth from probabilistic AI/OCR assistance and keeps providers behind adapters. The repository does not yet define a project-wide economic control plane for variable-cost AI.

Without a shared economic boundary, individual features could independently select providers, hard-code pricing, create unbounded retries or background jobs, confuse subscription entitlement with consumption funding, and cause user growth to increase unowned token/model/tool spend.

## Decision drivers

- zero unfunded external AI spend;
- deterministic-first implementation;
- provider independence;
- bounded cost before execution;
- atomic reservation and settlement;
- complete attribution;
- margin protection;
- reusable controls across B2C/B2B/partner-funded use cases;
- privacy/rights/safety preservation;
- fail-closed operation;
- compatibility with existing Core/Application/Port/Adapter boundaries.

## Options considered

### A. Each feature owns its provider integration and cost logic

Rejected. It duplicates business rules, encourages provider lock-in and makes cost attribution/margin enforcement incomplete.

### B. Provider SDK wrapper only

Rejected. A transport wrapper does not enforce deterministic-first routing, payer identity, reservation, rate-card versioning, margins, retries, anomalies, kill switches or ledger settlement.

### C. Central provider-neutral AI economic control plane

Selected.

## Decision

CALPQ adopts `CALPQ-AI-ECO-0001`.

All variable-cost external AI execution must pass:

`AI Task Contract -> AI Gateway -> deterministic/cache/local attempts -> quality/cost routing -> AI Cost Governor -> budget reservation -> provider adapter -> bounded execution -> settlement -> AI Usage Ledger`.

The invariant `UNFUNDED EXTERNAL AI SPEND = 0` is normative.

Features, UI and Core may not call concrete AI providers or own provider price tables. Entitlement and AI consumption budget remain separate.

## Consequences

### Positive

- provider replacement does not rewrite domain logic;
- user growth does not imply uncontrolled project-funded AI cost;
- every external AI cost has a payer and ledger lineage;
- routing can optimize quality/cost/privacy/latency;
- paid retries/background/agents remain bounded;
- B2B/BYOK/partner sponsorship can share the same governance path.

### Trade-offs

- more orchestration before the first provider integration;
- wallet/reservation/settlement persistence requires careful concurrency semantics;
- rate-card maintenance becomes an operational responsibility;
- quality routing requires evaluation datasets;
- FinOps observability becomes mandatory infrastructure.

## Impact

- Core/contracts: no provider-specific dependency; new provider-neutral economic contracts.
- Data/migrations: future runtime needs reservation, wallet/budget, rate-card and usage-ledger persistence.
- Testing: new contract, negative, race/idempotency, cache-isolation, margin, outage and attribution tests.
- Operations: anomaly detection, kill switches, rate-card verification and FinOps dashboards.
- Accessibility: high-cost confirmations must remain accessible and understandable.
- Legal/regulatory: privacy, rights, purpose limitation and consumer/business charging rules remain separately governed.
- Documentation: Constitution, Architecture, Book and M10 planning cross-reference this ADR.

## Scope boundary

This ADR implements an architecture decision in the repository. It does not implement a concrete AI provider, payment processor, production wallet, production ledger or deployed FinOps service.

## Approval

Project-owner authorization to implement this architecture was supplied on 2026-09-23. Final `ACCEPTED` status is reserved for repository governance/merge acceptance.
