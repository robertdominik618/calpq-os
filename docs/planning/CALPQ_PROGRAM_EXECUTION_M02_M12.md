# CALPQ Program Execution Architecture M02-M12

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-PROGRAM-EXEC-M02-M12-0001`

## Purpose
Convert the repository-backed M01-M12 milestone architecture into one governed execution sequence without changing M00 release state or authorizing product source.

## Execution principle
The program is executed by evidence-backed admission gates, not by calendar alone. A later milestone may be planned early, but implementation starts only when its hard prerequisites are satisfied.

## Wave 0 — Governance unlock
Required sequence:
1. active default-branch protection;
2. M00 repository governance PASS;
3. M00 blocker closure;
4. explicit M00 release decision;
5. feature-development gate transition under approved governance;
6. FV-00 formal admission.

No product implementation may precede this wave.

## Wave 1 — M02 Core kernel
Scope: FV-01 through FV-05.
Outcome: stable typed identity/time/result/provenance, provider-neutral nondeterminism ports, command/event/idempotency semantics and credential-evidence domain primitives.
Stop conditions: no framework/provider dependency in Core; no CredentialArtifact->AuthorizationGrant shortcut; deterministic tests pass.

## Wave 2 — M02 application and evidence pipeline
Scope: FV-06 through FV-10.
Outcome: Application orchestration, persistence UnitOfWork, migrations/outbox/inbox, document intake and verification orchestration.
Stop conditions: accepted command remains atomic; originals remain immutable; extraction remains non-authoritative; verification does not imply legal authorization.

## Wave 3 — M02 decision, projection and runtime completion
Scope: FV-11 through FV-15.
Outcome: eligibility evaluation, Professional Passport projection, tenant/access/audit integration, REST/JSON transport and async/reconciliation.
Exit evidence: full first-vertical acceptance matrix plus operational resilience evidence.

## Wave 4 — M03/M04/M05 parallel product expansion
M03, M04 and M05 may execute partially in parallel after the M02 vertical is stable enough to provide authoritative contracts.

M03 owns product surface and explanations.
M04 owns governed catalog/path/gap knowledge.
M05 owns production-grade intake/archive/verification fabric.

Cross-wave rule: UI, catalog and evidence adapters may consume governed Core/Application contracts but may not duplicate or override domain truth.

## Wave 5 — M06 lifecycle and continuous compliance
Starts after sufficient M04 requirement/version semantics and M05 evidence/verification infrastructure exist.
Outcome: renewal, expirations, recurring obligations, notifications, dependency reevaluation, continuous compliance and historical replay.

## Wave 6 — M07 regulatory intelligence and M08 organization/B2B
M07 starts once source governance, versioned requirements and M06 reevaluation semantics are stable.
M08 may overlap M07 after organization/tenant/access primitives and B2B assignment contracts are stable.

M07 outcome: source -> change -> impact -> affected rule/path/subject/organization -> governed action.
M08 outcome: person/activity assignment decision with explicit conditions, review and evidence.

## Wave 7 — M09 trust and interoperability
Starts after sharing-worthy claims, verification semantics, access governance and organization use cases are stable.
Outcome: minimum-necessary disclosure, relying-party trust, registry/wallet/protocol mappings without changing Core meaning.

## Wave 8 — M10 intelligence layer
Starts only on top of stable deterministic decisions, explainability and source/evidence lineage.
Outcome: Next Best Action, What-if, semantic search and conversational assistance.
Hard boundary: AI may assist and explain; it may not self-verify evidence, mutate governed decisions or issue authorization.

## Wave 9 — M11 production operations
Production UX and operating capabilities harden the supported applications and workflows: mobile/web/PWA, background jobs, notifications, reviewer/admin operations, observability, support tooling, import/export, accessibility and performance.
M11 may deliver infrastructure increments earlier where needed by prior milestones, but M11 exit is program-level operational readiness.

## Wave 10 — M12 pilot and GA
M12 proves the complete system under production constraints: security/privacy hardening, DR, backup/restore, performance, reconciliation, pilot operations, support/runbooks, SLOs and release governance.
GA requires production evidence and an explicit release decision; green architecture/CI alone is insufficient.

## Program stop-the-line conditions
Implementation must stop and return to architecture/governance review when any of these occurs:
- Core depends on UI/framework/provider-specific libraries;
- evidence, extraction, verification, eligibility and authorization are collapsed;
- history is silently rewritten;
- tenant/access/purpose scope becomes ambient or optional;
- AI/provider output is treated as authoritative truth;
- idempotency/concurrency cannot prove at-most-one accepted logical transition;
- a projection becomes authoritative state;
- a regulatory parser is allowed to finalize legal applicability without governed review;
- B2B role/delegation is treated as professional competence transfer;
- production release is proposed without recovery/security/privacy evidence.

## Program completion definition
M12 exit is the CALPQ OS v1 General Availability decision. Post-GA domains remain separate milestones and must not weaken the M01-M12 invariants.