# CALPQ Contextual Location Privacy & Safety

ID: CALPQ-CONTEXT-0001-S01
Status: TARGET ARCHITECTURE / NO LOCATION COLLECTION AUTHORIZED

## Principle

Location is context for a user-requested CALPQ capability, not a default behavioral surveillance stream.

## Default privacy posture

- feature off until explicitly enabled;
- manual destination/route preview remains possible without continuous tracking;
- prefer on-device geofence and rule-delta evaluation where feasible;
- request the minimum permission and precision needed for the chosen mode;
- raw coordinates are transient by default;
- do not build a permanent travel diary merely to prove an alert occurred;
- store versioned decision/audit metadata and bounded context evidence rather than full traces;
- no secondary advertising profile;
- no sale of location history;
- no hidden analytics precision escalation.

## Background location

Background mode requires:
- explicit user intent;
- clear active purpose;
- revocable permission;
- visible degradation when permission is lost;
- bounded retention;
- battery-aware cadence;
- separate platform review before production.

The architecture does not authorize “always” background location.

## B2B boundary

Employer/organization access to credential or assignment status does not grant access to raw worker location.

Any future worksite/assignment context must independently establish:
- lawful purpose;
- authorized fields;
- minimization;
- worker-facing transparency;
- retention;
- audit;
- separate governance for monitoring.

CALPQ-CONTEXT must not become employee tracking software by side effect.

## Family boundary

Family relationship does not grant continuous tracking. Guardian/parent access to a credential status and access to a minor's location are separate capabilities with separate legal/consent semantics.

## Accuracy and safety

A displayed location-dependent alert must expose uncertainty when material.

The UI must never imply centimeter/metre-level certainty merely because a map pin looks precise.

If location is stale, spoofed/simulated, low-accuracy or unavailable:
- mark the observation state;
- avoid confirmed-crossing claims;
- offer manual context selection/route preview;
- fail closed for positive assurance where the missing precision is material.

## Sensitive contexts

Extra caution is required around:
- home/regular locations;
- health/protection/migration contexts;
- minors;
- religious/political/sensitive venues;
- protected persons;
- workplace surveillance.

The Context engine does not need semantic venue profiling to perform jurisdiction rule resolution.

## Security

- no coordinates in logs unless explicitly required and redacted/controlled;
- no secret/provider tokens in domain events;
- no unbounded route payload in command/event envelopes;
- geospatial packs are integrity/version checked;
- remote source compromise cannot silently rewrite normative authority;
- location observation integrity state is preserved.

## User control

The Privacy Center should eventually show:
- whether Context Guard is on;
- active mode;
- permissions;
- what precision is used;
- what is retained;
- which trip/context packs are cached;
- what organizations can see;
- delete/clear controls where lawful and technically applicable.

Architecture approval does not activate any of these runtime permissions.
