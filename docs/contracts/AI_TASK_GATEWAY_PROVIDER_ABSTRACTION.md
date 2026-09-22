# CALPQ AI Task Gateway & Provider Abstraction Contract

Status: `AI ECONOMY ARCHITECTURE / RUNTIME NOT IMPLEMENTED`  
ID: `CALPQ-AI-ECO-0001-A`

## Purpose

Define the single provider-neutral production entry point for AI-capable tasks.

## Owner

Application orchestration owns the Gateway contract. Core remains provider-neutral and domain-authoritative. Concrete model/provider clients live in adapters.

## AI Task Contract

A task that may escalate to external AI declares:

- taskId/requestId;
- taskType and featureId;
- actor/user/organization context;
- privacyScope and rightsScope;
- qualityThreshold;
- fundingSource and payerId when external cost is possible;
- cachePolicy;
- maxInputUnits;
- maxOutputUnits;
- maxModelCalls;
- maxToolCalls;
- maxRetries;
- maxAgentSteps where applicable;
- maxDurationMs;
- maxCost and currency;
- allowed execution tiers/providers where policy requires;
- promptTemplateId/promptVersion or resolver version;
- provenance/audit requirements.

All numeric execution bounds are finite and non-negative. `UNLIMITED` is invalid.

## Gateway sequence

The Gateway must:

1. validate task contract and access/purpose scope;
2. attempt deterministic resolution when defined;
3. check valid cache/precomputed artifacts;
4. attempt local/on-device execution when permitted and sufficient;
5. ask Quality/Cost Router for an eligible remote tier;
6. invoke Cost Governor and require successful reservation;
7. call a provider only through an adapter;
8. enforce model/tool/retry/step/time/cost bounds;
9. settle actual usage and release unused reservation;
10. emit usage/audit/provenance records;
11. persist/cache only under the declared privacy/rights policy.

## Provider boundary

Provider adapters may translate prompts, structured-output schemas, tool formats, usage metadata and errors. They may not:

- redefine CALPQ domain truth;
- bypass access or purpose policy;
- choose an unapproved funding source;
- raise max cost or limits;
- write authoritative eligibility/authorization state;
- hard-code feature pricing rules into UI/Core;
- treat provider output as verified evidence.

## Failure behavior

Missing payer, max cost, usable rate card or reservation yields `DENY_BEFORE_PROVIDER_CALL`.

Provider outage/error may fall back only to an explicitly declared cheaper/safe path within the original authorization/budget envelope; otherwise return a bounded assistance failure without changing domain truth.

## Verification

Contract tests must prove direct provider execution is impossible without Gateway authorization and that provider replacement does not change domain semantics.
