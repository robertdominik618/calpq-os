# CALPQ Book — Foundation Map

Status: `M00 FOUNDATION / WORKING BASELINE`  
ID: `CALPQ-BOOK-0001`

## Canonical sources

| Area | Canonical artifact |
|---|---|
| Project state | `foundation/manifest.json` |
| M00 readiness state | `foundation/m00-readiness.json` |
| Pending M00 release decision | `foundation/m00-release-decision.json` |
| Importable GitHub main ruleset | `foundation/github-main-ruleset.json` |
| Non-negotiable rules | `docs/foundation/CONSTITUTION.md` |
| Architecture | `docs/foundation/ARCHITECTURE.md` |
| Apple UX | `docs/foundation/APPLE_HIG_POLICY.md` |
| Human workflow | `docs/foundation/HUMAN_WORKFLOW_GUIDELINES.md` |
| Foundation enforcement | `docs/foundation/FOUNDATION_FRAMEWORK.md` |
| Test policy | `docs/foundation/TEST_FRAMEWORK.md` |
| Security/privacy | `docs/foundation/SECURITY_PRIVACY_BASELINE.md` |
| Accessibility | `docs/foundation/ACCESSIBILITY_BASELINE.md` |
| Regulatory sources | `docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md` |
| Repository governance | `docs/foundation/REPOSITORY_GOVERNANCE.md` |
| GitHub main ruleset procedure | `docs/foundation/GITHUB_MAIN_RULESET.md` |
| M00 release gate | `docs/foundation/M00_RELEASE_GATE.md` |
| M00 readiness audit | `docs/foundation/M00_READINESS_AUDIT.md` |
| Technology gate history | `docs/adr/ADR-0001-technology-stack-gate.md` |
| Accepted technology | `docs/adr/ADR-0002-technology-stack-selection.md` |
| Technology evaluation | `docs/architecture/TECHNOLOGY_STACK_EVALUATION_2026-09-13.md` |
| Monorepo bootstrap | `docs/architecture/MONOREPO_BOOTSTRAP.md` |
| AI economy architecture | `docs/architecture/CALPQ_AI_ECONOMY_COST_GOVERNANCE.md` |
| AI economy decision | `docs/adr/ADR-0006-ai-economy-cost-governance.md` |
| AI task gateway/provider contract | `docs/contracts/AI_TASK_GATEWAY_PROVIDER_ABSTRACTION.md` |
| AI budget/reservation contract | `docs/contracts/AI_COST_BUDGET_RESERVATION_SETTLEMENT.md` |
| AI usage ledger/rate card contract | `docs/contracts/AI_USAGE_LEDGER_RATE_CARD.md` |
| AI routing/cache/evaluation contract | `docs/contracts/AI_ROUTING_CACHE_EVALUATION.md` |
| AI operational/FinOps contract | `docs/contracts/AI_OPERATIONAL_CONTROLS_FINOPS.md` |
| AI economy traceability | `docs/planning/AI_ECONOMY_COST_GOVERNANCE_TRACEABILITY.md` |

## Current milestone

Technology selection is approved, M00 remains blocked and product feature development remains frozen. `CALPQ-M00-RC-0001` is internally ready, but repository governance on `main` is still blocked. `CALPQ-M00-REL-0001` therefore remains `PENDING` and records no approved state transition.

## Change intake

New product ideas enter through `CALPQ-PRIPOJ`. Material architecture changes require impact analysis and an ADR before implementation.

Variable-cost external AI additionally requires the `CALPQ-AI-ECO-0001` economic control plane before any provider call. Architecture adoption does not itself authorize runtime provider integration or production AI spend.
