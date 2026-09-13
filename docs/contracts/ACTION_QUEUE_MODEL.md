# CALPQ Action Queue Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0008-B`

## Purpose

Define deterministic action items created from compliance, lifecycle, gap, assignment or review needs without confusing an action with the underlying legal/compliance state.

## ActionItem

Required fields:
- action_id;
- source_object_id;
- source_type;
- subject_or_organization_id;
- action_type;
- priority;
- due_at or recommended_by where applicable;
- blocking_effect;
- owner_role or responsible_party reference;
- status;
- explanation;
- provenance/reference set;
- deduplication_key.

## Action types

Examples:
- PROVIDE_EVIDENCE;
- REQUEST_VERIFICATION;
- REQUEST_RECOGNITION;
- RENEW_OR_REVALIDATE;
- UPDATE_ROLE_OR_DELEGATION;
- REASSESS_ASSIGNMENT;
- HUMAN_REVIEW;
- ACKNOWLEDGE_CHANGE;
- COMPLETE_REQUIRED_STEP;
- REMEDIATE_NON_COMPLIANCE.

## Status

- OPEN;
- IN_PROGRESS;
- BLOCKED;
- WAITING_EXTERNAL;
- COMPLETED;
- CANCELLED;
- SUPERSEDED.

`COMPLETED` MUST mean the action itself is complete. It MUST NOT automatically mean the underlying compliance problem is resolved.

## Deduplication

Equivalent active actions for the same source obligation and subject SHOULD collapse under a deterministic deduplication key. A retry MUST NOT create duplicate action items.

## Separation rule

Action Queue is operational workflow. It MUST NOT issue credentials, mutate authorization state, or rewrite authoritative decisions.
