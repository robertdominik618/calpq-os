# CALPQ Global Jurisdiction & Applicability Contract

ID: CALPQ-GLOBAL-0001-C01. Status: OWNER_APPROVED_TARGET_ARCHITECTURE. Runtime binding: NOT_IMPLEMENTED.
Parent: [GLOBAL](../architecture/CALPQ_GLOBAL_0001_ARCHITECTURE.md). Reuse existing [Core primitives](CORE_PRIMITIVES.md), [catalog](ACTIVITY_PROFESSION_CREDENTIAL_CATALOG.md), [temporal re-evaluation](DEPENDENCY_GRAPH_REEVALUATION_MODEL.md), [replay](DECISION_REPLAY_MODEL.md) and [MobilityCase](EXPAT_MOBILITY_CONTEXT.md).

## Semantic entities, not new wire types

Jurisdiction: stable jurisdiction_id, kind (national/subnational/local/legal-regime/other-reviewed-scope), name_refs, parent_or_overlap_refs with effective intervals, provenance_refs and status. Geographic classification, market territory and legal regime remain separate concepts. No interpretation of sovereignty is derived from commercial market ID.

RegimeMembership: regime_ref, member_ref, covered_subjects/activities, valid_from/to, exception_refs, authority/source versions and review. Membership is not a blanket permission. EU, EEA, Schengen, euro area, DACH and other names must not share an untyped boolean whose value implies legal recognition. Marketing group membership has no legal effect.

ApplicabilityContext: subject_kind/ref, activity_ref/version, issuer_jurisdiction, target_jurisdictions, actual_place, intended_interval, as_of, evidence_snapshot, relationship/assignment refs and relevant citizenship/residence facts. Language, bill payer and IP-derived location cannot supply missing legal facts. Subnational context is mandatory where the applicable reviewed route requires it.

ApplicabilityDecisionView: applicable_rule_refs with exact versions, each inclusion/exclusion rationale, source/evidence refs, unresolved_conflicts, unknown_inputs, evaluation_interval, evaluator_version and context_hash. It is a projection of existing deterministic logic, not AuthorizationGrant or RecognitionDecision.

## Invariants

GJ-01 No implied nationwide or worldwide coverage from a credential title, visual card or region membership.
GJ-02 No unconditional inheritance from supra-national to local rules and no universal most-restrictive-wins policy.
GJ-03 Composition policy must specify scoped cumulative/alternative/exception/precedence relationships with reviewed authority; unknown composition requires review.
GJ-04 A territory, activity, subject-kind or interval mismatch cannot be silently widened.
GJ-05 UNKNOWN differs from confirmed non-compliance; incomplete inventory is not evidence that an activity is unregulated.
GJ-06 Historical and current memberships/mandates remain independently replayable.
GJ-07 Legal-subject coverage is explicit: person, organization, vehicle, equipment, premises, construction or project. An equipment permit is not transferred to its operator.
GJ-08 Classifier/source hints are proposals until appropriate review; no rules in UI.

## Resolution procedure

1. Authorize the query and load only purpose-scoped facts through existing ports.
2. Resolve context and supported pack versions; stop positive assurance on missing material context.
3. Select candidates by jurisdiction/subject/activity/interval, not by translated words alone.
4. Apply explicit reviewed applicability/composition semantics and preserve exclusions/unknowns.
5. Feed applicable requirements to the existing evaluator. Never create a second GLOBAL evaluator with diverging statuses.
6. Produce an explanation and version-pinned snapshot; enqueue affected re-evaluation through the existing dependency mechanism.

No network or database access belongs inside deterministic Core. Future admission must bind these semantic concepts to existing strict types, runtime validation, migration/compatibility and error contracts. This document neither adds a public endpoint nor changes the existing admission ledger.
