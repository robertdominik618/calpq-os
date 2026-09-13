# CALPQ Passport Lifecycle & Renewal Projection

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0005-E`

## Purpose

Project future lifecycle obligations for credentials and authorization grants without mutating authoritative records merely because time passed.

## Projection states

A lifecycle projection may expose:
- CURRENT;
- UPCOMING_RENEWAL;
- ACTION_DUE;
- AT_RISK;
- LAPSED;
- REVIEW_REQUIRED;
- NO_KNOWN_RENEWAL.

These are read-model states. They do not replace the administrative state or temporal validity defined in the credential lifecycle contract.

## Renewal obligation

A renewal obligation references:
- source CredentialDefinition/Authorization type;
- current grant/artifact ID;
- applicable lifecycle rule version;
- trigger date or calculation rule;
- earliest/latest action windows;
- prerequisite refreshes such as exam, training, practice, medical check or fee;
- required evidence;
- authority/recipient where applicable;
- provenance.

## Renewal plan

The passport may derive a plan ordered by prerequisite dependency and deadlines. A plan is advisory until authoritative steps are actually completed and verified.

## Time handling

Passing a date alone MUST NOT fabricate an authority event. Temporal validity is calculated from authoritative dates and `Clock`; external renewal actions create new commands/events only when they actually occur.

## Notification boundary

Notifications are projections of known obligations. They may be scheduled or prioritized by Application layer, but Core remains the source of the obligation/deadline semantics.
