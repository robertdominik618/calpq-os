# CALPQ M02 Batch C — Decision, Passport & Runtime Completion

Status: `IMPLEMENTED / EXIT EVIDENCE GREEN / READY FOR REVIEW`
ID: `CALPQ-M02-BATCH-C-0001`
Scope: FV-11 through FV-15.

## Objective
Complete the first vertical from verified evidence into deterministic eligibility, Professional Passport projection and production-shaped runtime boundaries without issuing AuthorizationGrant.

## Included work
1. FV-11 — deterministic EligibilityAssessment.
2. FV-12 — Professional Passport read projection.
3. FV-13 — tenant/access/purpose/audit integration.
4. FV-14 — REST/JSON transport and OpenAPI contract mapping.
5. FV-15 — async/retry/reconciliation and recovery semantics.

## Planned commit sequence
C1. versioned RequirementSet fixtures and deterministic atomic requirement evaluation.
C2. eligibility aggregation and immutable assessment persistence contract.
C3. historical/version replay tests and evidence-snapshot binding.
C4. Professional Passport projection and rebuild semantics.
C5. TenantContext/access/purpose propagation across the full vertical.
C6. audit/provenance references for material use cases.
C7. REST/JSON DTO mappings and RFC-style problem/error mapping.
C8. OpenAPI contract tests and transport/domain separation tests.
C9. async worker/retry/reconciliation implementation.
C10. complete first-vertical acceptance run, resilience test and exit evidence package.

## File ownership
Primary ownership spans Core evaluation modules, Application use cases, projection/read-model code, contracts/API, tenant/access/audit integration and workers. UI remains out of scope except test clients/fixtures required to validate transport contracts.

## Hard invariants
- EligibilityAssessment binds an exact subject, credential definition version, RequirementSet version, evaluation instant and evidence snapshot.
- SATISFIED is an eligibility result, not an AuthorizationGrant.
- Professional Passport is a rebuildable read model, not authoritative state.
- TenantContext and purpose/access decisions are explicit and fail closed when missing or conflicting.
- HTTP status and DTO shape do not encode or replace domain truth.
- duplicate async delivery does not repeat logical domain transitions.
- reconciliation may rebuild projections but does not rewrite authoritative history.
- dependency outage never fabricates legal/domain rejection.

## Required evidence
FV-11..FV-15 executable tests plus the 45-scenario first-vertical acceptance matrix, projection rebuild tests, tenant isolation/access tests, API contract tests, async duplicate/retry tests and recovery/reconciliation evidence.

## Exit evidence
- Reviewed Batch B base: `3321aa6773ef9e23c11be83aec34f3ac22af1249`.
- Final FV-15 verified evidence head before exit recording: `cfa0850de8427c522fa2e9a5441bf5ad2a87562a`.
- FV-11: 24/24 mandatory scenarios verified.
- FV-12: 16/16 mandatory scenarios verified.
- FV-13: 24/24 mandatory scenarios verified.
- FV-14: 20/20 mandatory scenarios verified.
- FV-15: 22/22 mandatory scenarios verified.
- Foundation Guard #975, M00 Readiness #854, M02 Batch Readiness #263, Program #277, M03-M08 #234, M09-M12 #223 and v1 Index #214: SUCCESS.
- Durable batch exit record: `docs/planning/M02_BATCH_C_EXIT_EVIDENCE.md`.
- Durable milestone exit record: `docs/planning/M02_EXIT_EVIDENCE.md`.

## Definition of Done
Batch C is complete when the whole first vertical can accept governed evidence, verify it, produce a deterministic eligibility assessment, project it into Professional Passport, expose it through stable transport, survive async/retry/recovery scenarios and reproduce historical decisions without AuthorizationGrant issuance.

Result: Definition of Done satisfied; hard blockers = 0. Review/merge of PR #58 remains a separate action.

## Stop conditions
Return to architecture review if eligibility mutates prior assessments, Passport becomes source of truth, access scope becomes ambient, API handlers acquire business rules, async retry can duplicate accepted truth, or reconciliation mutates authoritative history.

## Governance boundary
Batch C started only after reviewed Batch B exit and active admission gates. Its completion is M02 exit evidence; it does not by itself admit M03/M04/M05 implementation.
