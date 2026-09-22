# CALPQ AI Economy & Cost Governance Architecture

Status: `OWNER-AUTHORIZED ARCHITECTURE CHANGE / RUNTIME NOT IMPLEMENTED`  
ID: `CALPQ-AI-ECO-0001`  
Date: `2026-09-23`  
Issue: #166  
Decision: `ADR-0006`

## 1. Purpose

CALPQ must use AI economically without allowing user growth to become uncontrolled provider spend. AI is a governed compute capability, not the default implementation technique and not an authority over CALPQ domain truth.

The highest economic invariant is:

**UNFUNDED EXTERNAL AI SPEND = 0**

No variable-cost external AI operation may execute without an identified payer, a finite maximum cost and a successful budget reservation.

## 2. Deterministic before generative AI

Every task is evaluated against the cheapest validated tier that satisfies quality, privacy, rights, latency and safety:

| Tier | Preferred mechanism |
|---|---|
| L0 | deterministic program code |
| L1 | database / rules / fulltext / index |
| L2 | exact cache / precomputed artifact |
| L3 | local / on-device OCR, ML or model |
| L4 | embeddings / small specialized model |
| L5 | inexpensive remote model |
| L6 | higher-capability remote model |
| L7 | expensive multimodal / generative / agent / research operation |

A higher tier requires evidence that lower tiers do not satisfy the task quality contract. "Newest" or "largest" is never a routing rule.

## 3. Mandatory execution path

```text
Feature / Use Case
  -> AI Task Contract
  -> AI Gateway
  -> Deterministic Resolver
  -> Cache
  -> Local / On-device AI
  -> Quality / Cost Model Router
  -> AI Cost Governor
  -> Budget Reservation
  -> Provider Adapter
  -> Bounded Execution
  -> Usage Settlement
  -> AI Usage Ledger
  -> Cache / Versioned Artifact
```

No production feature, UI, Core module or domain use case may call OpenAI, Anthropic, Google, Mistral, Azure AI, AWS model services, a local model server or another concrete provider directly.

Provider replacement must not require rewriting business/domain logic.

## 4. AI Task Contract

Every potentially AI-backed task declares at minimum:

- task type and feature/capability reference;
- actor/user/organization context;
- funding source and payer reference when external spend is possible;
- privacy and rights scope;
- quality threshold;
- allowed model/provider tiers;
- cache policy;
- max input/output units;
- max model calls;
- max tool calls;
- max retries;
- max agent steps where applicable;
- max duration;
- finite max cost;
- prompt template/version or deterministic resolver version;
- provenance requirements.

No limit may be `UNLIMITED`.

## 5. AI Gateway

The AI Gateway is the only production entry point for model/provider execution.

It owns orchestration of task validation, deterministic/local resolution attempts, cache lookup, routing, cost authorization, reservation, bounded provider execution, settlement, audit/provenance and artifact persistence.

The Gateway does not become domain truth and may not widen permissions or alter deterministic legal/credential decisions.

## 6. AI Cost Governor

Before variable-cost external execution the Governor must answer:

1. Who pays?
2. What is the finite maximum cost?
3. Is sufficient budget available?
4. Is the operation allowed?
5. Is the selected model/provider economically eligible?
6. Is the configured minimum contribution margin preserved?
7. Is a provider/model/feature/region/organization/user/background/agent/all-external-AI kill switch active?
8. Is an anomaly/circuit breaker active?

Failure is `DENY_BEFORE_PROVIDER_CALL`. There is no implicit "project pays" fallback.

## 7. Funding sources and wallet separation

Every variable-cost operation has exactly one funding source:

- `USER`;
- `ORGANIZATION`;
- `PARTNER`;
- `PROJECT_PROMOTIONAL_BUDGET`.

Project promotional funding requires explicit owner approval, purpose, hard limit, time window and separate ledger. It is never an automatic fallback.

Feature entitlement is separate from AI consumption budget. A subscription may include a finite allowance, credits, a B2B pool or partner-funded credits, but never unlimited external AI by implication.

## 8. Reservation and settlement

Mandatory sequence:

```text
estimate maximum cost
 -> validate funding source
 -> check available balance
 -> reserve maximum
 -> execute within bounded envelope
 -> calculate actual cost
 -> settle actual cost
 -> release unused reservation
```

Reservation and settlement are atomic, idempotent, auditable and recovery-safe. Paid retries/tool calls remain inside the original maximum cost unless a new explicitly authorized operation is created.

## 9. AI Usage Ledger

Every external AI execution records at least:

- usageId / requestId;
- user/organization/feature/task references;
- funding source and payer;
- provider/model/execution tier;
- input/cached-input/output/tool units;
- provider and variable infrastructure cost;
- charged amount and revenue;
- currency and rate-card version;
- reservation reference;
- cache hit;
- created time;
- provenance/audit references;
- `unfundedCost = 0`.

If economic attribution cannot be completed, external execution is invalid.

The AI Usage Ledger may link to the existing CALPQ audit ledger but does not replace domain audit semantics.

## 10. Provider Rate Card Registry

Provider prices are versioned configuration, never feature/UI hard-coded values.

Each entry carries provider/model, currency, input/cached-input/output/image/audio/tool pricing where relevant, validity window, verification time and source.

Missing or stale-beyond-policy pricing fails closed for uncontrolled spend. Provider price changes must not silently become project subsidy.

## 11. Quality / Cost Model Router

Routing considers task type, evaluated quality threshold, privacy, rights, latency, region, provider health, current rate card, user maximum cost and contribution margin.

Each important task family has an evaluation dataset and quality gate before a model/tier can be selected for production.

Initial task families include metadata extraction, document classification, translation, OCR repair, moderation, recommendation explanation, long-document QA, image understanding and research.

## 12. Cache, single-flight and precompute

CALPQ supports exact, semantic, public shared, private user and private organization caches.

Private data never enters public shared cache.

Cache keys include task, source version, prompt/resolver version, relevant model version, language, privacy scope, rights scope and invalidation policy.

Equivalent public concurrent requests should use single-flight request deduplication when privacy/rights permit.

Stable outputs should be stored as versioned artifacts and reused until their declared invalidation condition changes.

## 13. Context minimization and RAG

Long documents/profiles/databases are not sent wholesale by default.

Preferred flow:

`extract -> chunk -> index/embeddings -> retrieve minimal relevant context -> model`.

Prompt templates are task-specific and versioned. System-consumed outputs prefer structured data. Context must respect privacy, rights, licensing, purpose limitation and data minimization.

## 14. Local/on-device preference

Local/on-device OCR, embeddings, classification, preprocessing, entity extraction, search/retrieval and platform speech capabilities are preferred when they satisfy the quality/safety contract.

"Free" local compute is not justification for degraded correctness, privacy or safety.

## 15. Agent, retry and background bounds

Every agent/workflow has finite max steps/model calls/tool calls/retries/duration/cost and explicit allowed tools/providers.

Retry exhaustion produces safe failure/fallback, never an unbounded loop.

Background AI is event-driven, deduplicated, budgeted, concurrency-limited, change-conditioned and kill-switchable. Bulk jobs know a maximum batch cost before start.

## 16. AI authority and provenance

AI may suggest, classify, summarize, explain or generate candidates. It does not authoritatively decide identity, rights, payment, entitlement, legal state, security state or canonical domain truth.

Material AI outputs distinguish `USER_AUTHORED`, `SYSTEM_COMPUTED`, `IMPORTED`, `AI_ASSISTED`, `AI_GENERATED` and `AUTHORITATIVE_SOURCE` provenance where relevant.

## 17. Margin governance

Charge and profitability decisions account for provider cost plus directly attributable variable infrastructure/payment/refund/risk costs as configured.

A configurable `MINIMUM_CONTRIBUTION_MARGIN` is enforced. If a task falls below it, the system may route cheaper, increase disclosed charge, reduce scope, require approval or disable the paid path. Silent subsidy is forbidden.

## 18. Economic classes

CALPQ distinguishes:

- `INCLUDED_COMPUTING` — ordinary code/database/cache/local compute;
- `METERED_AI` — variable external compute funded by user/organization;
- `SPONSORED_AI` — partner or explicitly approved promotional budget.

These classes are not conflated in product analytics or billing.

## 19. User and B2B controls

User controls may include max cost per action, daily/monthly budget, auto-approve threshold and high-cost confirmation.

Organizations may define shared pools, per-user/team/feature limits, monthly hard caps, provider restrictions, audit and cost export.

BYOK/BYOP may be supported for appropriate B2B/power-user/developer cases, but never bypasses Gateway, security, privacy, rights, tool permissions or audit.

## 20. Abuse, anomalies and kill switches

Spend anomaly detection can trip circuit breakers for abnormal user/feature/provider behavior.

Runtime kill switches must be able to disable provider, model, feature, region, organization, user AI access, background AI, agent workflows or all external AI without a new application release.

## 21. FinOps and KPIs

Owner-facing FinOps must expose AI revenue, external AI cost, variable AI infrastructure cost, contribution margin, cost by feature/provider/model/payer, average cost per operation, cache hit ratio, deterministic/local resolution ratio, external AI avoidance rate, budget-denied requests, spend anomalies and unfunded AI spend.

Required invariants:

- `AI Cost Attribution Rate = 100%`;
- `Unfunded External AI Spend = 0`.

## 22. Negative acceptance set

At minimum:

- no payer -> no provider call;
- no max cost -> no provider call;
- no budget reservation -> no provider call;
- insufficient balance -> no provider call;
- missing/unusable rate card -> no uncontrolled provider call;
- max cost/model/tool/retry/agent step limit exceeded -> stop;
- kill switch -> stop;
- spend anomaly -> circuit breaker;
- private data -> never public cache;
- unfunded cost > 0 -> invalid.

## 23. Release/admission gate

No variable-cost external AI feature can be admitted to production without implementation-level evidence for AI Gateway, deterministic-first routing, Cost Governor, Usage Ledger, Rate Card Registry, Budget Reservation/Settlement, Spend Anomaly Guard, Kill Switches and zero-unfunded-spend negative tests.

Architecture documentation or source-code existence alone is not runtime validation.

## 24. Roadmap integration

This architecture is a horizontal prerequisite for M10 Intelligence Layer and any other milestone that would use variable-cost external AI.

It does not add a concrete provider and does not authorize production AI spend. Provider selection, runtime persistence, payment integration and production rollout require separately governed implementation evidence.

## 25. Definition of excellence

An AI feature is complete only when it is economically bounded, cost-attributed, margin-aware, budgeted, provider-independent, privacy-safe, rights-aware, secure, testable, observable, cache-conscious, failure-safe, rate-limited, bounded and auditable.

The project monetizes intelligence and workflow value; it does not silently subsidize uncontrolled user compute.
