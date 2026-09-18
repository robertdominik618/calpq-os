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

## Current milestone

Technology selection is approved, M00 remains blocked and product feature development remains frozen. `CALPQ-M00-RC-0001` is internally ready, but repository governance on `main` is still blocked. `CALPQ-M00-REL-0001` therefore remains `PENDING` and records no approved state transition.

## Change intake

New product ideas enter through `CALPQ-PRIPOJ`. Material architecture changes require impact analysis and an ADR before implementation.

## Accepted extension register — 2026-09-18

This dated register is additive. Historical milestone prose above is not a current delivery assertion; see actual governance records and drift issue #129. The EXPATS change does not rewrite admissions or merge other branches.

| Area | Canonical extension artifact |
|---|---|
| EXPATS complete target, 24 functional areas | [CALPQ-EXPAT-0001](../architecture/CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md) |
| Architecture decision | [ADR-0004](../adr/ADR-0004-expat-global-mobility.md) |
| Mobility case / commands / events / state boundaries | [EXPAT_MOBILITY_CONTEXT](../contracts/EXPAT_MOBILITY_CONTEXT.md) |
| Shared language coverage and semantic parity | [LOCALIZATION_SEMANTIC_PARITY](../contracts/LOCALIZATION_SEMANTIC_PARITY.md) |
| Family, B2B, health, protection and provider safeguards | [EXPAT_PRIVACY_SAFEGUARD_MODEL](../security/EXPAT_PRIVACY_SAFEGUARD_MODEL.md) |
| Owner approval, source coverage, impact and phased delivery | [Intake and delivery](../planning/CALPQ_EXPAT_0001_INTAKE_AND_DELIVERY.md) |
| 24 capability pairs + 16 cross-cutting product acceptance scenarios | [Scope registry](../planning/expat_scope.json) |

Architecture approval and repository storage are separate from reviewed merge, runtime implementation, rule publication and deployment. Localization is shared across CALPQ, not confined to EXPATS. Health PR #84 remains a visible unmerged dependency at the pinned baseline.
