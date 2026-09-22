# CALPQ AI Usage Ledger & Provider Rate Card Contract

Status: `AI ECONOMY ARCHITECTURE / RUNTIME NOT IMPLEMENTED`  
ID: `CALPQ-AI-ECO-0001-C`

## Purpose

Provide complete external AI cost attribution and versioned provider pricing without turning finance metadata into domain truth.

## AI Usage Ledger

Every variable-cost external execution records at minimum:

- usageId;
- requestId;
- userId where applicable;
- organizationId where applicable;
- featureId;
- taskType;
- fundingSource;
- payerId;
- provider;
- model;
- executionTier;
- inputUnits;
- cachedInputUnits;
- outputUnits;
- toolUnits;
- providerCost;
- variableInfrastructureCost;
- chargedAmount;
- revenue;
- currency;
- rateCardVersion;
- budgetReservationId;
- cacheHit;
- createdAt;
- audit/provenance references;
- `unfundedCost`.

Invariant: `unfundedCost = 0` for accepted external execution.

Ledger records are append-only/auditable and can link to the existing CALPQ Audit Ledger. Corrections use linked adjustment records rather than silent mutation.

## Provider Rate Card Registry

Each rate-card version stores:

- provider;
- model/service;
- currency;
- inputPrice;
- cachedInputPrice when applicable;
- outputPrice;
- image/audio/tool pricing where applicable;
- validFrom/validTo;
- verifiedAt;
- source/provenance;
- status/freshness policy.

Provider prices are never hard-coded in feature/UI code.

## Missing/stale pricing

If cost cannot be safely bounded because pricing is missing or stale beyond policy, the operation is denied or routed to a path whose cost can be bounded. There is no uncontrolled fallback.

## Cost attribution

The system must be able to aggregate cost/revenue/margin by feature, provider, model, payer, organization and task family without copying unnecessary sensitive prompt/content payloads.

Required KPI: `AI Cost Attribution Rate = 100%`.

## Verification

Tests must cover rate-card version changes, stale/missing pricing, ledger completeness, adjustment immutability, cost attribution and `unfundedCost > 0 -> invalid`.
