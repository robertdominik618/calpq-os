# ADR-0004 — EXPATS as a Mobility Context over the single CALPQ Core

Date: `2026-09-18`
Decision: `ACCEPTED_BY_OWNER_FOR_ARCHITECTURE`
Delivery status: `RUNTIME_NOT_IMPLEMENTED_BY_THIS_CHANGE / MERGE_SEPARATE`
Record: [#134](https://github.com/robertdominik618/calpq-os/issues/134).

## Context

The owner approved the complete CALPQ-EXPAT-0001 proposal and requested actual architectural incorporation and proof. The project already separates identity, evidence, recognition, eligibility, authorization, paths, family, lifecycle, disclosure, AI and provider adapters. A separate expat decision engine would duplicate truth and risk inconsistent statuses across languages or contexts.

## Decision

1. Accept all 24 functional areas and all horizontal scope in the [baseline](../architecture/CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md), with phased runtime delivery, no dropped variants.
2. Introduce a reference-based application coordination aggregate MobilityCase. It cannot create or mutate authority/recognition/verification outcomes and does not own a duplicated person/evidence database.
3. Reuse existing EquivalenceRule, RecognitionRoute, RecognitionDecision, AssignmentGuard and command/event contracts. Namespace future mobility semantics; implement wire bindings only through separate admission.
4. Make locale/translation coverage a shared CALPQ capability. Legal result is independent of locale; language, citizenship, origin, residence and actual work are independent facts.
5. Use separately reviewed jurisdiction/route packs with effective dates, authority provenance, four-eyes publication and language freshness. This change publishes no legal rules or reviewed translations.
6. Preserve Family individual identities and equal rights for equivalent verified parental authority. Health PR #84 and other domain dependencies are tracked as dependencies, not silently copied or deemed merged.
7. Constrain employer/institution/provider views to purpose-scoped claims. Unknown is not negative legal evidence; AI/marketplace/tariff cannot grant authority or decide adverse outcomes silently.
8. Keep product roadmap and admission ledgers unchanged. Append canonical links, add scope traceability and execute separate architecture integrity tests. Product acceptance tests remain specified until real implementation.

## Alternatives considered

Translated portal only: rejected as insufficient for the approved lifecycle/qualification goals.
Independent expat Core: rejected due to duplicated truth, permissions and temporal semantics.
Immediate all-regime runtime implementation: rejected as outside this architecture request and current admission, with unsupported content/integration risk.
Nationality- or language-only routing: rejected; unsupported simplification and identity/eligibility conflation.
Copy health architecture from open PR #84: rejected; would hide dependency/merge state and duplicate governance.

## Consequences

Positive: reusable evidence/paths, cross-language parity, long-term family/professional continuity, reviewed scope and demonstrable architecture completeness.
Costs: content governance, qualified translation/legal/clinical review, route coverage management, integration permissions, privacy and end-to-end tests before release.
Migration/compatibility: no runtime schema/API migration now; future migrations require their own backward-compatibility/rollback contract. Existing source is unchanged.
Security/regulatory: intended-use and jurisdiction review are prerequisites, not a certification from this ADR.

## Acceptance and rollback

Require all source scope, 24 capability pairs, 16 cross-cutting scenarios, resolved links, preserved base text and allowlisted diff; execute validator negative tests. Distinguish source completeness from runtime correctness. If the architecture is later withdrawn, mark it superseded by a new decision with provenance; do not silently delete approved scope or alter historical consent/evidence. This ADR reserves number 0004 because 0003 is in open health PR #84.
