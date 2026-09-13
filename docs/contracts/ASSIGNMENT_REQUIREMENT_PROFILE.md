# CALPQ Assignment Requirement Profile

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0006-B`

## Purpose

Define the exact requirements of one work assignment independently from any candidate person or organization.

## AssignmentProfile

Required fields:
- assignment_id;
- assignment_type;
- organization_subject_id;
- requested_activity_ids;
- jurisdiction;
- location/site scope where relevant;
- planned_start / planned_end;
- requirement_set_version;
- organization_level_requirements;
- subject_level_requirements;
- role_requirements;
- supervision requirements where legally permitted;
- evidence freshness requirements;
- risk/safety constraints;
- provenance and source versions.

## Requirement levels

An assignment may contain requirements applying to:
1. the organization itself;
2. one named assigned person;
3. one or more required roles;
4. a team collectively, but only if the underlying rule permits team coverage;
5. a supervisor/supervised relationship where explicit rules permit supervised performance.

## Coverage modes

Supported structural modes:
- `SINGLE_SUBJECT` — one subject must satisfy all person-level requirements;
- `ROLE_SPECIFIC` — distinct named roles have distinct requirement sets;
- `TEAM_COVERAGE_ALLOWED` — requirements may be distributed among team members only where source rules explicitly permit it;
- `SUPERVISED_ACTIVITY` — a non-fully-qualified subject may participate only under a valid supervision rule.

`TEAM_COVERAGE_ALLOWED` and `SUPERVISED_ACTIVITY` MUST NOT be inferred from convenience or business practice.

## Temporal evaluation

Requirements are evaluated for the intended assignment interval, not merely at query time. A credential that is valid today but expires before planned assignment completion may produce `BLOCKED`, `REVIEW_REQUIRED` or a condition depending on the governing rule.

## Source discipline

Every assignment requirement must retain:
- source authority;
- source/rule version;
- effective dates;
- jurisdiction;
- applicability conditions;
- verification status.

AI or search ranking may help locate a candidate rule but MUST NOT create an authoritative assignment requirement.
