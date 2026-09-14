# CALPQ Milestone Admission & Exit Matrix

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-PROGRAM-GATES-0001`

## M02 — First Vertical
Admission requires: M00 repository governance PASS, explicit M00 release, feature-development authorization under approved gate, FV-00 `ADMITTED_FOR_IMPLEMENTATION`.
Exit requires: FV-01..FV-15 implemented in dependency order, first-vertical acceptance evidence, tenant/access/audit integration, async/recovery evidence, no AuthorizationGrant issuance in the vertical.

## M03 — Professional Passport Product Surface
Admission requires: stable M02 read-model contracts and accepted product-surface scope.
Exit requires: dashboard/Passport/Credential Card flows use authoritative projections, evidence/status explanations are source-linked, accessibility/localization baseline passes, no hidden domain logic in UI.

## M04 — Catalog / Qualification Paths / Gap
Admission requires: stable M02 Core result/evidence/eligibility semantics and catalog ownership contract.
Exit requires: versioned Activity/Profession/Credential/Requirement catalogs, governed QualificationPaths, Gap Navigator, equivalence/recognition review path, source/explainability linkage and historical version preservation.

## M05 — Evidence & Verification Fabric
Admission requires: M02 intake/verification contracts proven and storage/trust/security boundaries accepted.
Exit requires: multi-channel intake, immutable originals, derived lineage, review queues, authority/trust resolution, provider-neutral verification adapters and untrusted-content controls; extraction remains non-authoritative.

## M06 — Lifecycle / Renewal / Continuous Compliance
Admission requires: stable M04 requirement/version semantics and sufficient M05 evidence/verification capability.
Exit requires: lifecycle timeline, renewal/expiry/recurring obligation model, notification policy, dependency reevaluation, continuous-compliance statuses and replayable historical decisions without history mutation.

## M07 — Regulatory Intelligence
Admission requires: source governance plus stable M04/M06 version/impact contracts.
Exit requires: source snapshot/version lineage, change event, impact graph, effective-date handling, legal/human review boundary, affected-target resolution and explainable action generation.

## M08 — Organization / B2B Assignment
Admission requires: organization/tenant/access contracts, stable M06 compliance states and B2B assignment semantics.
Exit requires: memberships/roles/delegations, AssignmentRequirementProfile, governed assignment outcomes, organization compliance projection/export and proof that delegation does not transfer competence.

## M09 — Trust / Selective Sharing / Interoperability
Admission requires: stable verified claims, access/purpose rules and relying-party use cases.
Exit requires: selective disclosure, relying-party trust, consent/purpose enforcement, registry/wallet/protocol mappings, minimum-necessary disclosure and preservation of CALPQ semantic neutrality.

## M10 — Intelligence Layer
Admission requires: stable deterministic decision APIs, explainability/source lineage and human-review boundaries.
Exit requires: Next Best Action, What-if, semantic/intent search and conversational/document assistance with citations/provenance where material; AI cannot mutate governed truth or self-verify evidence.

## M11 — Production UX / Operations
Admission requires: sufficient stable product/application contracts from active milestones.
Exit requires: supported mobile/web/PWA workflows, production background runtime, notification/admin/reviewer surfaces, observability, diagnostics, import/export, accessibility/performance evidence and operational runbooks.

## M12 — Hardening / Pilot / GA
Admission requires: functional milestone set intended for v1, M11 operational readiness and defined pilot scope.
Exit requires: security/privacy hardening evidence, backup/restore and DR validation, performance/load evidence, migration/reconciliation evidence, pilot evidence, incident/support runbooks, SLOs and explicit GA release decision.

## Universal admission rules
- Planning readiness is not implementation admission.
- A green CI run is evidence, not business/release authorization.
- Any unresolved stop-the-line invariant blocks admission or exit.
- Entry criteria must be repository-verifiable where feasible.
- Exit criteria must produce durable evidence suitable for later audit/replay.

## Universal forbidden shortcuts
- document -> authorization;
- OCR/AI -> verified fact without governed verification;
- role/delegation -> competence;
- HTTP status -> domain truth;
- projection -> authoritative aggregate;
- provider outage -> negative legal conclusion;
- current rule -> rewrite of historical decision;
- GA -> architecture readiness only.