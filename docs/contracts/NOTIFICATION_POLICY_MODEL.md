# CALPQ Notification Policy Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0008-C`

## Purpose

Define how CALPQ communicates material changes and actions without treating delivery, opening or acknowledgement of a message as legal resolution.

## NotificationIntent

Required fields:
- notification_intent_id;
- source_action_or_radar_item_id;
- recipient reference or recipient role;
- severity;
- urgency;
- channel policy;
- earliest_send_at;
- latest_useful_send_at where applicable;
- deduplication_key;
- escalation policy;
- privacy classification;
- message facts/provenance references.

## Delivery states

- PLANNED;
- SENT;
- DELIVERED;
- FAILED;
- ACKNOWLEDGED;
- SUPERSEDED.

## Critical separation

`ACKNOWLEDGED` means only that the recipient acknowledged the notification. It MUST NOT mean:
- the ActionItem is completed;
- the HumanReviewCase is resolved;
- the underlying compliance issue is remediated.

## Escalation

Escalation MAY depend on severity, deadline proximity, blocking effect and repeated delivery failure. It MUST NOT fabricate urgency when the underlying source is unverified.

## Privacy

Notifications SHOULD disclose only the minimum data necessary for the recipient to understand and act. Sensitive evidence SHOULD remain behind an authorized detail view rather than be embedded into message payloads by default.

## Noise control

Repeated equivalent events MUST use deterministic deduplication. A material change to facts, deadline or severity MAY create a new notification intent while retaining the previous notification history.
