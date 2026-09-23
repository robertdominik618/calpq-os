# CALPQ Contextual Rule Delta & Briefing Contract

ID: CALPQ-CONTEXT-0001-C03
Status: TARGET ARCHITECTURE / NOT IMPLEMENTED

## Goal

Transform two version-pinned contextual applicability snapshots into a concise, explainable set of material changes.

## Delta kinds

- CREDENTIAL_RECOGNITION_CHANGED
- REQUIREMENT_ADDED
- REQUIREMENT_REMOVED
- THRESHOLD_CHANGED
- PROHIBITION_OR_RESTRICTION_CHANGED
- DOCUMENT_OR_EQUIPMENT_CHANGED
- ZONE_ACCESS_CHANGED
- TIME_WINDOW_CHANGED
- REPORTING_OR_DECLARATION_CHANGED
- OPERATIONAL_NOTICE_CHANGED
- ADVISORY_CHANGED
- REVIEW_REQUIRED_CHANGED

A delta type does not itself assign severity. Severity is derived from reviewed policy and exact consequence metadata.

## Delta rules

DRB-01 Compare semantic IDs/versions, never translated strings.
DRB-02 Preserve before and after source/rule refs.
DRB-03 Missing “after” data is UNKNOWN, not requirement removal.
DRB-04 A changed threshold includes quantity/unit/legal meaning and exact scope.
DRB-05 A new restriction never implies prior illegality.
DRB-06 No delta does not prove universal permission.
DRB-07 Multiple changes are canonically grouped by activity/credential and consequence.
DRB-08 Commercial recommendations are excluded from authoritative delta.
DRB-09 AI-generated summary is presentation over structured delta only.
DRB-10 Historical replay retains the exact briefing basis.

## Journey Brief

A pre-trip brief may include:
- expected transition sequence;
- material known rule deltas;
- documents/equipment to prepare;
- unsupported/unknown segments;
- dynamic-data requirements;
- rule versions and planned evaluation date.

It is explicitly a simulation and can become stale before travel.

## Live Delta Brief

Minimum user-facing structure:
- **Changed now**;
- **Why this applies**;
- **What to do**;
- **Affected credential/activity**;
- **Where/from when**;
- **Source**;
- **Freshness/uncertainty**.

## Notification intent classes

- CRITICAL_ACTION
- ACTION_REQUIRED
- MATERIAL_CHANGE
- PREPARE
- INFORMATION
- REVIEW_REQUIRED

The future Application integration must map these to the existing notification policy without creating a second delivery/scheduling subsystem.

## Anti-spam

Only material changes should alert. Repeated samples within the same stable context collapse under deterministic dedup.

Re-entering a zone may generate a new intent only according to the reviewed recurrence policy.

## Safety presentation

Driving/moving users must not be forced into complex interaction. Long legal explanations are deferred; a safe short alert can link to a parked/stopped detailed view.

No alert text may claim “you may legally proceed” unless the existing authoritative evaluator supports that exact conclusion with sufficient evidence.
