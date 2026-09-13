# CALPQ Regulatory Radar Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0008-A`

## Purpose

Define a read model that turns verified change-impact inputs into a prioritized radar of current, upcoming and review-required compliance developments.

## RadarItem

A `RadarItem` MUST reference, not replace, its source records.

Required fields:
- radar_item_id;
- source_change_event_id;
- source_impact_or_reevaluation_id;
- affected_scope;
- jurisdiction;
- effective_from where known;
- severity;
- urgency;
- confidence / verification state;
- current compliance effect;
- future compliance effect;
- recommended handling class;
- explanation/provenance;
- created_at and last_recalculated_at.

## Severity

Recommended normalized levels:
- INFO;
- LOW;
- MEDIUM;
- HIGH;
- CRITICAL.

Severity represents potential consequence, not delivery priority by itself.

## Urgency

Recommended normalized levels:
- MONITOR;
- PLAN;
- ACTION_SOON;
- ACTION_NOW.

Urgency is derived from effective dates, deadlines and blocking impact. It MUST NOT be inferred solely from message wording.

## Verification boundary

UNVERIFIED or STALE/REVIEW_REQUIRED regulatory information MUST NOT become an authoritative compliance conclusion. Such items may create a radar entry classified for human review.

## Historical rule

A RadarItem is a projection. It MUST NOT mutate historical `ReevaluationDecision`, `AssignmentDecision`, `EligibilityAssessment` or authoritative regulatory source records.
