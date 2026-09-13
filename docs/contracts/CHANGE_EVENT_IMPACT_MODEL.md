# CALPQ Change Event & Impact Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0007-A`

## Purpose

Define how CALPQ represents a change that may invalidate, alter, or require re-evaluation of previously computed projections or decisions without rewriting historical truth.

## ChangeEvent

A `ChangeEvent` is an immutable description of something that changed and may affect downstream compliance state.

Required fields:
- change_event_id;
- change_type;
- occurred_at;
- observed_at;
- effective_from where applicable;
- source object and source version;
- jurisdiction and scope where applicable;
- provenance;
- verification state;
- correlation/causation metadata.

## Change types

At minimum:
- REGULATORY_RULE_CHANGED;
- REQUIREMENT_SET_CHANGED;
- CREDENTIAL_STATUS_CHANGED;
- EVIDENCE_VERIFICATION_CHANGED;
- RECOGNITION_DECISION_CHANGED;
- ROLE_CHANGED;
- DELEGATION_CHANGED;
- ASSIGNMENT_SCOPE_CHANGED;
- ORGANIZATION_STATUS_CHANGED;
- CATALOG_MAPPING_CHANGED;
- CLOCK_BOUNDARY_REACHED.

`CLOCK_BOUNDARY_REACHED` may trigger derived temporal re-evaluation but must not fabricate an authority event.

## ImpactCandidate

A change first produces `ImpactCandidate` records, not immediate authoritative mutations.

Each candidate must identify:
- changed source node;
- dependency edge used to reach the candidate;
- target projection or decision type;
- target object ID;
- reason for possible impact;
- whether re-evaluation is mandatory, advisory, or human-review-only.

## Historical integrity

A new change MUST NOT mutate or delete historical `EligibilityAssessment`, `AssignmentDecision`, `RecognitionDecision`, or equivalent immutable decision evidence.

The system creates a new evaluation linked to the superseded snapshot.

## Safety rule

Unknown applicability, stale source state, missing evidence, or ambiguous jurisdiction must produce `REVIEW_REQUIRED` or `INDETERMINATE`, never an optimistic continuation of a previously valid state.
