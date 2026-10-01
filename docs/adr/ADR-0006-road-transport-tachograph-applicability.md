# ADR-0006 — Road Transport Applicability over GLOBAL Jurisdiction Packs

Date: `2026-10-01`  
Decision: `OWNER_REQUESTED_ARCHITECTURE_INTAKE`  
Runtime status: `NOT_IMPLEMENTED`  
Legal-content status: `RESEARCH_CANDIDATES_NOT_PUBLISHED_AS_RULES`  
Record: [Issue #171](https://github.com/robertdominik618/calpq-os/issues/171)

## Context

The owner requested CALPQ to cover tachographs, mandatory driving breaks/rest and the effect of pickup/camping conversions, specifically the different practical treatment encountered in Czechia and Germany.

The problem cannot be modeled by a single vehicle type or mass threshold. EU rules, national supplemental rules, international/cabotage scope, private/non-commercial exemptions, trailer mass, actual journey purpose and approved vehicle conversion can all materially change the result.

Current research also shows a crucial semantic distinction: Germany may apply driving/rest and recording rules in a 2.8–3.5 t national goods-vehicle band without making tachograph installation universally mandatory in that band. Therefore installation, use and alternative recordkeeping must be separate decision dimensions.

## Decision

1. Add CALPQ-TRANSPORT-0001 as a road-transport domain composition over the single Core.
2. Reuse GLOBAL jurisdiction/applicability and temporal/source governance.
3. Introduce no country-specific evaluator and no rules in UI.
4. Model vehicle technical state, registration state and conversion state separately.
5. Model vehicle-only mass and full-combination maximum permissible mass separately.
6. Model carriage subject, commerciality and domestic/international/cabotage semantics explicitly.
7. Return separate decisions for driver-hours scope, tachograph installation, tachograph use and alternative recordkeeping.
8. Treat pickup/camper configuration as evidence/context, never as an automatic exemption.
9. Preserve proposal-level future law as non-effective Regulatory Radar input only.
10. Require replayable source/version/evidence snapshots and UNKNOWN/REQUIRES_REVIEW where material facts are missing.

## Alternatives rejected

### Single “tachograph_required” boolean
Rejected because German 2.8–3.5 t cases demonstrate that driver-hours/recording scope and installation duty can differ.

### Vehicle-registration-category-only evaluator
Rejected because actual carriage/purpose, mass and route may remain legally relevant, and CJEU C-666/21 rejects category-based escape in the examined >7.5 t non-commercial goods scenario.

### “Camper body means passenger vehicle”
Rejected. Physical installation, formal conversion and registry change are separate facts.

### Generic EU thresholds only
Rejected because member-state supplemental rules may apply to national operations.

### Strictest-rule-wins
Rejected because legal applicability requires reviewed precedence/supplement/exemption semantics, not arbitrary maximization.

## Consequences

Positive:
- clear CZ/DE delta explanations;
- reusable future EU/country transport packs;
- safe integration with fleet/B2B use;
- no hidden reclassification from a camping accessory;
- auditable historical decisions.

Costs:
- authoritative content review by jurisdiction;
- vehicle/conversion evidence mapping;
- route and operation-type data;
- negative testing of exemptions and edge cases.

## Acceptance boundary

This ADR accepts the target architecture only. It does not:
- publish legal rules;
- certify any individual vehicle;
- install or configure a tachograph;
- authorize production runtime;
- merge parent GLOBAL/EXPATS changes.

Runtime admission requires separately approved rule packs and tests.
