# CALPQ M08 Execution Package — Organization, B2B Compliance & Assignment Guard

Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`

## Objective
Extend individual professional truth into organization membership, delegation, assignment and compliance decisions without transferring competence through role or access.

## Delivery slices
1. Organization and membership aggregate/read models.
2. Role and delegation model with bounded scope and validity.
3. Professional credential binding to subject within organization context.
4. AssignmentRequirementProfile model for governed activities/tasks.
5. Assignment Guard deterministic evaluation.
6. Conditional assignment and review-required outcomes.
7. Organization compliance projection and exception views.
8. Compliance export with provenance and minimum-necessary disclosure.
9. Cross-tenant/access/audit enforcement for assignment workflows.
10. M08 integration evidence across role changes, expiry, delegation and conflicting credential scenarios.

## Ownership
M08 owns organization membership/role/delegation state, assignment requirement profiles, assignment decision orchestration and organization compliance projections. Professional competence remains derived from governed subject credentials/eligibility, never from role membership alone.

## Definition of Done
- role/delegation never grants professional competence;
- assignment decisions are versioned, evidence-backed and explainable;
- expired/revoked/missing credentials affect assignment through governed evaluation;
- tenant/access/purpose scope is explicit;
- conditional and review-required outcomes remain distinct from assignable/blocked;
- compliance exports preserve provenance and data minimization.

## Stop conditions
Stop if organization role is treated as a credential, delegation widens professional scope, cross-tenant assignment becomes ambient, or projections become authoritative competence records.