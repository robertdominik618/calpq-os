# CALPQ Qualification Path Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0004-B`

## Purpose

Define versioned paths from a user intent or target activity to one or more credential/authorization outcomes.

## QualificationPathDefinition

Required fields:

- `path_id`
- version
- target activity/profession/credential
- jurisdiction
- effective_from/effective_to
- path steps
- authoritative source references
- status

## PathStep types

- `SATISFY_REQUIREMENT_SET`
- `OBTAIN_CREDENTIAL`
- `COMPLETE_EDUCATION_OR_TRAINING`
- `PASS_EXAM_OR_ASSESSMENT`
- `PROVE_EXPERIENCE`
- `UNDERGO_MEDICAL_OR_OTHER_CHECK`
- `REQUEST_RECOGNITION`
- `OBTAIN_AUTHORITY_DECISION`
- `PAY_FEE_OR_COMPLETE_ADMIN_STEP`

A step may have prerequisites and may branch into alternatives.

## Path composition

A path supports:

- mandatory sequential steps;
- alternative branches;
- `ALL`, `ANY`, and `AT_LEAST(n)` composition inherited from RequirementSet semantics;
- jurisdiction-specific substitutions;
- recognition/equivalence edges;
- terminal credential or authorization target.

## User-relative projection

The canonical path definition is independent of a user. A personalized projection may classify each step as:

- `ALREADY_SATISFIED`
- `ACTION_REQUIRED`
- `RECOGNITION_POSSIBLE`
- `INFORMATION_MISSING`
- `REVIEW_REQUIRED`
- `NOT_APPLICABLE`

Personalized status is derived from current evidence and assessments; it must not mutate the path definition.

## Optimization

CALPQ may compute candidate paths such as shortest elapsed time, lowest estimated cost, fewest unresolved steps or highest confidence. These are advisory projections only. Optimization may never remove a legally required step.

## Invariants

1. Every path is versioned and effective-dated.
2. A path is explanatory/planning structure, not itself an authorization grant.
3. Every omitted or substituted mandatory step must be justified by an authoritative equivalence/recognition rule.
4. Historical path evaluations retain the exact path and rule versions used.
5. Unknown data produces `INFORMATION_MISSING` or `REVIEW_REQUIRED`, never assumed satisfaction.
