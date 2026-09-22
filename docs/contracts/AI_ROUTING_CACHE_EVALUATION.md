# CALPQ AI Routing, Cache & Evaluation Contract

Status: `AI ECONOMY ARCHITECTURE / RUNTIME NOT IMPLEMENTED`  
ID: `CALPQ-AI-ECO-0001-D`

## Purpose

Select the cheapest validated execution mechanism that satisfies task quality/privacy/rights/latency/safety requirements.

## Execution hierarchy

`L0 deterministic code -> L1 database/rules/fulltext/index -> L2 cache/precompute -> L3 local/on-device -> L4 embeddings/small specialized -> L5 inexpensive remote -> L6 high-capability remote -> L7 expensive multimodal/agent/research`.

Higher tiers require a recorded reason that lower tiers did not satisfy the quality contract.

## Model router inputs

- task type;
- quality threshold/eval evidence;
- privacy scope;
- rights/licensing scope;
- latency;
- region;
- provider health;
- current rate card;
- user maximum cost;
- contribution margin;
- allowed provider/tier policy.

## Evaluation harness

Important task families maintain versioned evaluation datasets. A model/tier is eligible only after task-family quality validation.

Evaluation data and thresholds are versioned so routing decisions can be reproduced.

## Cache scopes

- `EXACT`;
- `SEMANTIC`;
- `PUBLIC_SHARED`;
- `PRIVATE_USER`;
- `PRIVATE_ORGANIZATION`.

Private data is forbidden from public shared cache.

Cache keys include task, sourceVersion, prompt/resolver version, relevant model version, language, privacyScope, rightsScope and invalidation policy.

## Single-flight

Equivalent public concurrent requests should coalesce to one provider execution where semantics/privacy/rights permit. Private context must not be deduplicated across isolation boundaries unless explicitly safe.

## Precompute/versioned artifacts

Reusable outputs carry artifactId, taskType, sourceVersion, prompt/resolver version, provider/model where used, generatedAt, origin and invalidationPolicy.

## RAG/context minimization

Large source material is extracted, chunked/indexed and retrieved to minimum relevant context. Prompt templates are task-specific/versioned. Structured output is preferred for machine consumption.

## Verification

Tests cover lower-tier preference, quality-gate failure, cache privacy isolation, invalidation, single-flight correctness, semantic-cache false-match handling and deterministic fallback.
