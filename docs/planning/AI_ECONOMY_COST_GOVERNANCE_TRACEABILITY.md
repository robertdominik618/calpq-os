# CALPQ AI Economy & Cost Governance Traceability

Status: `ARCHITECTURE TRACEABILITY / RUNTIME NOT IMPLEMENTED`  
Architecture: `CALPQ-AI-ECO-0001`  
ADR: `ADR-0006`  
Issue: #166

## Purpose

Map the owner-supplied AI Economy & Cost Governance implementation request to repository artifacts without claiming runtime implementation or production validation.

## Requirement crosswalk

| Source requirement group | Repository owner |
|---|---|
| Economic invariant; deterministic-before-generative | Constitution + `CALPQ_AI_ECONOMY_COST_GOVERNANCE.md` |
| Mandatory AI architecture / Gateway / provider adapter | `AI_TASK_GATEWAY_PROVIDER_ABSTRACTION.md` |
| Cost Governor / funding / wallet separation / reservation | `AI_COST_BUDGET_RESERVATION_SETTLEMENT.md` |
| Usage ledger / rate card / attribution | `AI_USAGE_LEDGER_RATE_CARD.md` |
| Model router / evals / cache / single-flight / precompute / RAG | `AI_ROUTING_CACHE_EVALUATION.md` |
| Hard limits / agents / retry / background / anomaly / kill switch / FinOps | `AI_OPERATIONAL_CONTROLS_FINOPS.md` |
| AI non-authority / provenance | Constitution + existing `UNTRUSTED_CONTENT_AI_SECURITY_BOUNDARY.md` + architecture |
| Margin / economic classes / user & B2B budgets / BYOK | Cost contract + operational contract |
| Negative tests / CI gate | AI economy architecture test + CI workflow |
| M10 integration | M10 baseline + execution package + milestone architecture |

## Source section mapping

- Sections 1-3 -> architecture baseline + ADR.
- Sections 4-8 -> Gateway + cost/reservation contract.
- Sections 9-11 -> ledger/rate-card + routing contract.
- Sections 12-18 -> routing/cache/evaluation contract.
- Sections 19-23 -> operational controls + cost contract.
- Sections 24-25 -> Constitution/existing AI security boundary + architecture provenance rules.
- Sections 26-30 -> cost contract.
- Sections 31-34 -> operational controls/FinOps.
- Sections 35-37 -> machine gate/test artifacts.
- Sections 38-41 -> repository governance, ADR and contracts.
- Sections 42-44 -> architecture Definition of Excellence/economic principles.
- Section 45 -> issue #166, this crosswalk and draft PR evidence.

## State classification

### IMPLEMENTED IN ARCHITECTURE BRANCH

Normative/contractual definition of Gateway, routing, payer/max-cost/reservation gate, provider abstraction, usage ledger, rate cards, bounded execution, margin/anomaly/kill-switch/FinOps requirements and M10 integration.

### TESTED / VALIDATED AT ARCHITECTURE LEVEL

Only repository structure/content invariants and negative fixtures enforced by the AI economy architecture gate.

### NOT RUNTIME IMPLEMENTED

Production Gateway, provider adapters, wallet/budget storage, reservation/settlement transactions, rate-card service, usage ledger persistence, model eval harness, caches, anomaly detection, kill switches, FinOps dashboard, billing/payment integration and provider execution.

### NOT PRODUCTION VALIDATED

No live provider spending, customer charging, production wallet settlement, production cost attribution or production kill-switch evidence is claimed.

## Next canonical step

After architecture review/merge, a separately admitted implementation contract should deliver the P0 runtime guardrails before any mass-used variable-cost AI feature or concrete provider integration.
