# CALPQ Milestone Architecture M01-M12

Status: `MASTER ROADMAP / PLANNING BASELINE`

This roadmap distinguishes repository-backed milestones from proposed future milestones. It does not authorize product implementation or change M00 governance state.

## M01 — Architecture & Core Contract Baseline
Status: `REPOSITORY-BACKED / ARCHITECTURE COMPLETE`
Purpose: establish deterministic Core, domain boundaries, Application/persistence/API/security/privacy/tenant contracts, admission gates, operational resilience and implementation order.
Exit: architecture classified `READY_FOR_IMPLEMENTATION_AFTER_M00_RELEASE` while governance remains separately controlled.

## M02 — First Vertical Delivery
Status: `REPOSITORY-BACKED / FULL PRE-IMPLEMENTATION READY / IMPLEMENTATION BLOCKED`
Vertical: `Credential Evidence -> Verification -> Eligibility -> Professional Passport Projection`.
Scope: FV-00 admission plus FV-01 through FV-15 from Core primitives to async/reconciliation.
Evidence: 45/45 FV-00 traceability and 285 machine-enforced readiness test/check points.
Exit: first working end-to-end vertical proves CALPQ architecture without issuing or mutating AuthorizationGrant.

## M03 — Professional Passport Product Surface
Status: `REPOSITORY-BACKED PLANNING / IMPLEMENTATION NOT ADMITTED`
Purpose: turn M02 domain outputs into the first coherent user product.
Scope: action-oriented dashboard, Professional Passport, Credential Cards, evidence/status explanations, activity timeline, intent-based search baseline, mobile/web read flows, accessibility and localization foundations.
Planning evidence: `docs/planning/M03_PRODUCT_SURFACE_BASELINE.md` and shared M03-M05 readiness guard.
Exit: a user can understand what they hold, what is verified, what is missing and why, without confusing a document with legal authorization.

## M04 — Credential Catalog, Qualification Paths & Gap Intelligence
Status: `REPOSITORY-BACKED PLANNING / IMPLEMENTATION NOT ADMITTED`
Purpose: build the reusable knowledge structure behind eligibility and navigation.
Scope: Activity/Profession/Requirement Catalog, Credential Catalog, qualification paths, RequirementSet versioning, equivalence/recognition workflows, Gap Navigator, explainability and source linking.
Planning evidence: `docs/planning/M04_CATALOG_PATHS_GAP_BASELINE.md` and shared M03-M05 readiness guard.
Exit: CALPQ can answer what is required for a target activity/profession and compute a governed path from current evidence to target eligibility.

## M05 — Document Intake, Archive & Verification Fabric
Status: `REPOSITORY-BACKED PLANNING / IMPLEMENTATION NOT ADMITTED`
Purpose: expand M02 intake/verification into a production-grade universal evidence fabric.
Scope: camera/scan/PDF/email/share sheet/URL/provider intake, immutable originals, extraction proposals, review queues, trust registry, issuer/verifier authority resolution, archive lifecycle, malware/untrusted-content controls and verification adapters.
Planning evidence: `docs/planning/M05_EVIDENCE_VERIFICATION_FABRIC_BASELINE.md` and shared M03-M05 readiness guard.
Exit: multiple real-world evidence channels enter one governed pipeline while extraction/AI remains non-authoritative.

## M06 — Lifecycle, Renewal & Continuous Compliance
Status: `PROPOSED`
Purpose: make credentials and obligations continuously maintained instead of point-in-time records.
Scope: Renewal Autopilot, expirations, continuing obligations, medical/exam cycles, lifecycle timeline, notification policy, dependency graph reevaluation, continuous compliance status and historical decision replay.
Exit: CALPQ detects upcoming and changed obligations and produces governed next actions without rewriting history.

## M07 — Regulatory Intelligence & Radar
Status: `PROPOSED`
Purpose: connect changing rules and authoritative sources to affected credentials, requirements and users.
Scope: source governance, Regulatory Radar, change events, impact analysis, effective dates, rule/source version lineage, human/legal review boundaries and explainable change notifications.
Exit: a regulatory change can be traced from source -> affected rule -> affected credential/path -> affected subject/organization -> recommended action.

## M08 — Organization, B2B Compliance & Assignment Guard
Status: `PROPOSED`
Purpose: extend individual competence truth into organizations and work assignment.
Scope: organizations, memberships, roles, delegation, professional credentials, assignment requirement profiles, B2B Assignment Guard, organization compliance projections and compliance export.
Exit: an organization can determine whether a specific person may be assigned to a specific governed activity, including conditions and review states.

## M09 — Trust, Selective Sharing & Interoperability
Status: `PROPOSED`
Purpose: make CALPQ evidence portable and verifiable across relying parties.
Scope: selective disclosure, relying-party trust, consent/purpose limitation, verification links, registry linking, VC/EUDI-wallet/ISO mdoc boundaries, signed presentations and interoperable external mappings.
Exit: users and organizations can disclose minimum necessary verified claims with provenance while CALPQ Core remains format/provider neutral.

## M10 — Intelligence Layer & Guided Decisions
Status: `PROPOSED`
Purpose: add useful AI assistance without granting AI authority over regulated truth.
Scope: Next Best Action Engine, What-if simulator, conversational guidance, explanation generation, semantic/intent search, document assistance and human-review support.
Boundary: deterministic Core remains authoritative; AI may assist, summarize, search, classify and explain but cannot self-verify evidence, change eligibility or issue authorization.
Exit: users get proactive guidance while every material conclusion remains source/evidence/rule backed.

## M11 — Production UX, Operations & Platform Integration
Status: `PROPOSED`
Purpose: turn domain capabilities into robust daily-use applications and operating workflows.
Scope: React Native/Expo mobile, web/PWA, offline/cache strategy where safe, notifications, background jobs, admin/review surfaces, observability, support diagnostics, import/export, performance, accessibility and operational tooling.
Exit: CALPQ can be operated reliably by end users, reviewers and organizations across supported surfaces.

## M12 — Production Hardening, Pilot & General Availability
Status: `PROPOSED`
Purpose: prove the whole system under production constraints and release it safely.
Scope: security hardening, privacy lifecycle verification, backup/restore and disaster recovery, penetration/security testing, load/performance testing, auditability, data migration/reconciliation, pilot cohorts, support/runbooks, SLOs and release governance.
Exit: GA release decision backed by production evidence rather than architecture readiness alone.

## Dependency spine
`M01 -> M02 -> M03/M04/M05 -> M06 -> M07 -> M08 -> M09 -> M10 -> M11 -> M12`

M03, M04 and M05 may partially overlap after M02 stabilizes, but no milestone may bypass Core invariants, tenant/access/privacy boundaries, evidence provenance or release governance.

## Current project position
- M01: architecture complete;
- M02: full pre-implementation readiness complete, product implementation not started;
- M03-M05: repository-backed planning baselines complete on a dedicated planning branch, implementation not admitted;
- M06-M12: proposed roadmap only, not yet individually planning-baselined or implementation-approved;
- current critical external blocker remains M00 repository governance / main protection.
