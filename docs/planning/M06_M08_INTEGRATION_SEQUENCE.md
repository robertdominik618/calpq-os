# CALPQ M06-M08 Integration Sequence

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M06-M08-PLAN-0001`

## Purpose
Define the dependency order and ownership boundaries between lifecycle/continuous compliance (M06), regulatory intelligence (M07) and organization/B2B assignment (M08).

## Shared spine
M06-M08 reuse authoritative concepts from M01-M05:
- Subject/organization identity;
- CredentialDefinition/RequirementSet versions;
- evidence/provenance and verification records;
- EligibilityAssessment;
- catalog/path sources;
- tenant/access/privacy/audit context.

## Recommended sequence
### Wave A — lifecycle first
M06 establishes time-based obligations, renewal planning, reevaluation, notifications and historical replay over already-governed requirements/evidence.

### Wave B — regulatory impact
M07 feeds versioned/effective-dated change events into the dependency graph. Confirmed regulatory changes may trigger M06 reevaluation/review planning but must not rewrite prior decisions.

### Wave C — organization assignment
M08 consumes governed subject credential/eligibility/compliance outputs plus exact AssignmentRequirementProfile versions. Organization projections may react to M06/M07 changes through reevaluation, but do not become independent sources of truth.

## Ownership rules
- M06 owns lifecycle/renewal/reevaluation status, not regulatory interpretation;
- M07 owns source-change/impact/review lineage, not assignment outcomes;
- M08 owns organization/assignment decision logic, not credential issuance or regulatory-source interpretation;
- notifications never become domain truth;
- organization projections never replace individual authoritative states;
- no milestone may mutate historical decisions in place.

## Change propagation examples
### Expiring evidence
Evidence/lifecycle change -> M06 reevaluation -> affected M08 assignment/compliance projections -> M03 user-facing action/read surfaces.

### Regulatory rule change
Source change -> M07 interpretation/review -> new RequirementSet/profile version -> M06 targeted reevaluation -> M08 affected assignment decisions -> notifications/read projections.

### Organization role change
Role/delegation change -> M08 reevaluation of role-dependent assignments only; subject credential/eligibility truth remains unchanged.

## Failure/review semantics
- source ambiguity -> REVIEW_REQUIRED/INDETERMINATE in M07;
- missing evidence -> governed uncertainty in M06/M08;
- stale projection -> read concern, never authoritative mutation;
- failed notification -> delivery failure, not compliance state;
- provider outage -> retry/review/indeterminate, not fabricated conclusion.

## Admission boundary
This is planning only. M06-M08 implementation requires separate milestone admission after prerequisite milestones and governance gates.

## Exit criteria
M06-M08 planning is integration-ready when change propagation is directional, version-aware and review-aware, and each milestone has unambiguous authority over its own decisions without crossing Core boundaries.