# CALPQ M01 Regulatory Radar / Action / Human Review Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0008`

## Scope

PREP-0008 defines the operational layer above continuous compliance:

`Change / Reevaluation -> Regulatory Radar -> Action Queue -> Notification -> Human Review Case -> Resolution -> Re-evaluation`

## Core separations

1. A RadarItem is not an authoritative legal decision.
2. An ActionItem is not the underlying compliance state.
3. A NotificationIntent is not an ActionItem.
4. Notification acknowledgement is not remediation.
5. A HumanReviewCase is not resolved by AI/OCR alone.
6. Historical decisions and resolutions are immutable.
7. A case is closed only after an auditable resolution basis exists.

## Radar

Radar prioritization combines consequence, deadline/effective-date proximity, blocking impact and verification state. Unverified or stale regulatory information can generate `REVIEW_REQUIRED`, not an authoritative compliance conclusion.

## Action Queue

Operational tasks use deterministic deduplication and explicit ownership. Completing an action does not automatically mean the source compliance issue is resolved.

## Notification

Delivery states are operational only. `ACKNOWLEDGED` means the recipient acknowledged the message. It does not imply remediation, case resolution or legal compliance.

## Human review

A HumanReviewCase records the unresolved question, relevant facts, evidence references, rule/source versions, responsible reviewer and full audit history. Materially new facts can reopen a resolved case without deleting the earlier resolution.

## Closure evidence

Before closure, the system MUST retain an auditable resolution basis containing at minimum:
- reviewer/resolver identity or role;
- decision timestamp;
- relevant rule/policy version;
- evidence snapshot references;
- conclusion;
- residual conditions and follow-up deadlines.

Sending or acknowledging a notification, merely marking an operational task complete, passage of time, or an AI recommendation alone MUST NOT close a review case.

## Re-evaluation

A material resolution or new evidence may produce a new deterministic re-evaluation. Historical `EligibilityAssessment`, `AssignmentDecision`, `ReevaluationDecision` and review resolution history remain reproducible.

## Privacy

Radar, notifications and review views MUST use minimum-necessary disclosure. Sensitive evidence remains behind authorized access boundaries rather than being copied into notifications by default.
