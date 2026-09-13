# CALPQ B2B Assignment Guard

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0006-C`

## Purpose

Define the deterministic decision projection that answers whether a subject or team may be assigned to a concrete work assignment at a concrete time and scope.

The guard is a read/evaluation model. It MUST NOT issue credentials, mutate authorization grants, create delegations or alter evidence.

## Inputs

`AssignmentGuard.evaluate` receives at least:
- AssignmentProfile revision;
- candidate subject(s);
- organization context;
- ProfessionalPassport/evidence projection revisions;
- relevant AuthorizationGrant revisions;
- relevant role/delegation revisions;
- qualification/equivalence/recognition decisions where applicable;
- evaluation time and assignment interval;
- rule/catalog/source versions.

## Decision statuses

- `ASSIGNABLE` — all authoritative mandatory conditions are satisfied for the requested assignment scope and interval;
- `ASSIGNABLE_WITH_CONDITIONS` — assignment is allowed only with explicit, source-backed conditions such as valid supervision;
- `BLOCKED` — at least one mandatory condition is definitively not satisfied;
- `REVIEW_REQUIRED` — authoritative policy requires human review or unresolved interpretation;
- `INDETERMINATE` — required information is missing, stale or unverifiable.

`ASSIGNABLE_WITH_CONDITIONS` MUST list every condition. A condition that later becomes false invalidates the assignment decision for continued reliance.

## Evaluation layers

The guard evaluates independently:
1. organization eligibility/authorization;
2. membership and role validity;
3. delegation validity where delegation is relied upon;
4. activity and assignment applicability;
5. person-level credential/authorization coverage;
6. temporal validity for the assignment interval;
7. jurisdiction and geographic scope;
8. restrictions/limitations on grants;
9. team coverage, only where explicitly permitted;
10. supervision, only where explicitly permitted;
11. evidence freshness/verification requirements;
12. unresolved review conditions.

## Non-escalation invariants

- verified evidence alone does not create authorization;
- employment alone does not create qualification;
- organization authorization does not automatically authorize every employee;
- one qualified employee does not automatically cover an entire team;
- delegation does not transfer professional qualification;
- team coverage cannot be assumed from overlapping skills;
- supervision cannot be invented as a workaround;
- `REVIEW_REQUIRED` and `INDETERMINATE` never become `ASSIGNABLE` through ranking or AI confidence.

## Re-evaluation

Assignment decisions are point-in-time/interval-bound projections. Changes to authorization status, delegation, role, evidence verification, rule versions, planned dates or assignment scope require re-evaluation.
