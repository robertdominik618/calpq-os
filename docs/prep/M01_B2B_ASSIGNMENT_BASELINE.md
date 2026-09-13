# CALPQ M01 PREP-0006 — B2B Assignment Guard Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0006`

## Goal

Prepare reusable contracts for organization roles, delegation, assignment requirements, assignment decisions and B2B compliance before product implementation is authorized.

## Canonical flow

```text
SubjectProfile / ProfessionalPassport
        +
OrganizationMembership / RoleAssignment / DelegationGrant
        +
AssignmentProfile
        +
Credential / Authorization / Recognition / Evidence revisions
        ↓
B2B Assignment Guard
        ↓
AssignmentDecision
        ↓
OrganizationComplianceProjection
```

## Decision boundary

The guard answers whether a concrete assignment is permitted for concrete subject(s), organization, scope and time interval. It does not grant credentials, change roles, create delegations or mutate source evidence.

## Required decision statuses

- ASSIGNABLE
- ASSIGNABLE_WITH_CONDITIONS
- BLOCKED
- REVIEW_REQUIRED
- INDETERMINATE

## Mandatory invariants

1. Credential/authorization does not transfer through employment or delegation.
2. Organization-level authorization and person-level authorization remain separate.
3. Delegation transfers only explicit organizational authority, never professional qualification.
4. Team coverage is valid only if an authoritative rule permits collective coverage.
5. Supervision is valid only if an authoritative rule permits supervised performance.
6. Assignment interval must be covered by all time-sensitive mandatory conditions.
7. Historical decisions retain exact source and object revisions.
8. Review-required or indeterminate inputs cannot be converted to ASSIGNABLE by AI confidence or ranking.
9. A planning dashboard is not an authoritative AssignmentDecision.
10. B2B views apply minimum-necessary disclosure.

## Post-M00 implementation order

1. organization membership and role primitives;
2. delegation validation;
3. assignment requirement profile;
4. deterministic guard evaluator;
5. immutable decision bundle;
6. organization compliance projection;
7. executable scenario tests;
8. API/UI adapters only after Core/Application contracts pass.

## Governance

This baseline does not authorize product implementation. M00 release and feature-development state remain unchanged.
