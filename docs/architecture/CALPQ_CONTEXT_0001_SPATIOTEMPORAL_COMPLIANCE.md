# CALPQ-CONTEXT-0001 — Contextual Jurisdiction, Position & Time Compliance Engine

Status: OWNER-REQUESTED TARGET ARCHITECTURE / ARCHITECTURE ONLY / RUNTIME NOT AUTHORIZED
Date: 2026-09-23
Owner intake: https://github.com/robertdominik618/calpq-os/issues/168

## 1. Product purpose

CALPQ gains a horizontal engine that answers a new class of question:

> What materially changes for this person, credential, activity, vehicle, vessel, aircraft or other governed subject because the relevant place, zone, time or operating context changed?

The engine is not a navigation app and is not a second Eligibility Core. It converts reviewed context changes into a deterministic request for existing CALPQ rule applicability, eligibility, lifecycle, compliance and notification capabilities.

The canonical chain is:

Position / route / time / environmental observation
→ reviewed spatial-temporal context
→ applicable jurisdiction and rule-pack versions
→ existing CALPQ deterministic evaluation
→ before/after delta
→ safe notification intent
→ explanation and source evidence.

GPS, GNSS, network location, route prediction, sunrise calculation, weather data, AIS/airspace feed or AI explanation are never legal authority by themselves.

## 2. Public product concept

Working public name:

**CALPQ Context Guard — Pravidla podle místa a času**

Typical user experience:

- Before trip: **Journey Brief** — what will change on the planned route.
- Approaching boundary: **Ahead** — material changes likely within the configured corridor.
- Confirmed transition: **Now applicable** — only rule deltas relevant to the active credential/activity.
- Time transition: **At sunset / after local time / from date X** — rule changes tied to a reviewed temporal trigger.
- Dynamic restriction: **Temporary change** — an official operational notice affects the route or activity.
- Offline: **Corridor Pack** — last reviewed rules and boundaries are available with freshness clearly shown.

A briefing must answer:
1. What changed?
2. Why does it apply to me?
3. What action is required, if any?
4. From when / where?
5. Which credential/activity is affected?
6. What is the authoritative source and version?
7. What is uncertain or stale?

## 3. Critical legal correction for nautical time examples

The engine must not encode the broad statement “night navigation is always governed by stricter rules” as a universal rule.

For COLREG, steering and sailing obligations apply across their defined conditions, while Rule 20 specifically makes the lights rules applicable from sunset to sunrise. Other night, visibility, local port, coastal or licensing requirements depend on the relevant reviewed rules.

Therefore the architecture models exact trigger semantics such as SUNSET, SUNRISE, RESTRICTED_VISIBILITY or LOCAL_TIME_WINDOW. It never substitutes a generic “night mode” for the source rule.

Likewise, there is no universal global “distance from coast” threshold. Distance is a rule-pack parameter bound to the relevant jurisdiction, vessel/activity class, credential and effective period.

## 4. Twenty domain families

These are architecture coverage families, not claims that all are already legally modeled.

| ID | Family | Examples of context-sensitive change |
|---|---|---|
| CTX-D01 | Road — general rules | side of road, speed regime, BAC/BrAC rule, lights, belts, helmets, phone use |
| CTX-D02 | Road — credential recognition | licence category/recognition, temporary or provisional documents, medical/age conditions |
| CTX-D03 | Vehicle access | low/zero-emission zone, congestion/toll zone, restricted street, vehicle class/emission rules |
| CTX-D04 | Professional road transport | driving/rest context, tachograph obligations, professional-driver credentials |
| CTX-D05 | Dangerous goods | ADR credential, vehicle/cargo restrictions, local route/tunnel/zone constraints |
| CTX-D06 | Maritime — COLREG/navigation | lights at sunset/sunrise, visibility context, navigation conduct and local overlays |
| CTX-D07 | Maritime — coastal/local | territorial waters, port/harbour rules, coastal-distance, equipment, speed/no-wake, permits |
| CTX-D08 | Inland waterways | waterway class, local navigation rules, locks, local vessel/operator requirements |
| CTX-D09 | Manned aviation | airspace class, VFR/night conditions, local minima, temporary/restricted airspace |
| CTX-D10 | Drones/UAS | geo-zones, registration/competence scope, cross-border specific-category conditions |
| CTX-D11 | Radio/spectrum | permitted band, power, call-sign/reciprocal privilege, local protected-frequency restrictions |
| CTX-D12 | Micromobility/cycling | local helmet, access, age, speed or equipment rules where supported |
| CTX-D13 | Protected areas/outdoor activity | protected zone, seasonal closure, camping/fire/access restrictions |
| CTX-D14 | Fishing/hunting/licensed recreation | permit territory, season, method, quota/area or local safety restriction |
| CTX-D15 | Customs/cash/excise movement | declaration threshold, excise/personal-use rule, border/transit regime |
| CTX-D16 | Pets/animals/plants | destination-specific health/document/treatment or entry-point conditions |
| CTX-D17 | Regulated substances | age, quantity, purchase/possession/use/transport and impairment/driving thresholds |
| CTX-D18 | Mobile regulated professions | credential recognition, local registration, site/region conditions for a mobile worker |
| CTX-D19 | Temporary/emergency/security zones | evacuation, closure, security perimeter, temporary operating restriction |
| CTX-D20 | Family/age/local conditions | age-dependent local applicability where the underlying CALPQ rule requires it |

Every family reuses the shared Context engine. No family is allowed to fork the Core evaluator.

## 5. Eighteen trigger families

| ID | Trigger |
|---|---|
| CTX-T01 | Jurisdiction approach |
| CTX-T02 | Jurisdiction enter |
| CTX-T03 | Jurisdiction exit |
| CTX-T04 | Sub-zone/geofence enter |
| CTX-T05 | Sub-zone/geofence exit |
| CTX-T06 | Planned route preview |
| CTX-T07 | Local date/time window start or end |
| CTX-T08 | Astronomical event: sunset/sunrise/twilight as defined by the rule |
| CTX-T09 | Season / effective-date window |
| CTX-T10 | Distance-to-feature threshold |
| CTX-T11 | Altitude threshold |
| CTX-T12 | Depth/draught/water-condition threshold where supported |
| CTX-T13 | Weather/visibility threshold where the reviewed rule uses it |
| CTX-T14 | Speed/motion/operating-state threshold where the reviewed rule uses it |
| CTX-T15 | Dynamic official notice start |
| CTX-T16 | Dynamic official notice end/cancellation |
| CTX-T17 | Credential/subject state change |
| CTX-T18 | Rule-version effective change |

A trigger is not itself a legal conclusion. It only requests re-resolution/re-evaluation.

## 6. Context model

The minimum context supplied to the deterministic evaluation may include:

- subject and credential references;
- active activity and purpose;
- vehicle/vessel/UAS/aircraft/equipment references where relevant;
- cargo/passenger/age/role facts only when purpose-scoped and authorized;
- observed position, accuracy radius, observation instant and integrity metadata;
- planned route/corridor and intended time interval;
- resolved land/maritime/airspace jurisdictions and overlapping zones;
- local time zone derived from reviewed geographic data, not UI locale;
- rule-defined astronomical event;
- distance/altitude/depth measurements with unit and uncertainty;
- reviewed operational notices;
- weather/visibility/tide/current observation only where the rule requires it;
- exact rule/source/pack versions and freshness.

Unknown or materially uncertain context cannot be coerced into a positive assurance.

## 7. Boundary uncertainty and transition confirmation

Borders and geo-zones are not treated as zero-width magical lines.

The resolver must preserve:
- location accuracy radius;
- geometry/source version;
- boundary confidence;
- map-matching confidence where used;
- last stable context;
- candidate next contexts;
- hysteresis/debounce policy;
- crossing evidence as an observation, not legal proof.

If the uncertainty radius intersects multiple materially different jurisdictions, the user sees **Boundary uncertain** and the system may show both relevant rule sets. It must not silently claim a confirmed crossing.

GPS spoofing, stale location, simulator data, dead reckoning, network-only location and user-entered position are distinct observation classes.

## 8. Rule-delta principle

The user does not need an encyclopedia at every border.

The engine compares a version-pinned BEFORE and AFTER applicability/evaluation snapshot and emits only material deltas, for example:
- credential recognition changed;
- requirement added/removed;
- threshold changed;
- activity prohibited/restricted;
- required document/equipment changed;
- zone access changed;
- time window changed;
- reporting/declaration obligation changed;
- operational advisory changed.

No “green permission” can be created merely because no delta was found.

## 9. Road-driving example

A route crosses from jurisdiction A to B.

The resolver confirms the target context and relevant vehicle/activity. CALPQ evaluates only reviewed rule dimensions relevant to that user, which can include:
- driving side;
- BAC/BrAC rule for the applicable driver class;
- speed rules by road/vehicle type;
- mandatory equipment;
- daytime lights;
- winter equipment;
- child restraint/helmet/phone rules;
- licence recognition and category limits;
- toll/vignette/urban access rules.

The briefing can say “these five items changed” rather than presenting every rule in the destination country.

The actual values must come from reviewed effective-dated packs. They are never hard-coded into this architecture.

## 10. Maritime example

The active vessel and operator credentials are known. The route enters a reviewed coastal/port zone and sunset occurs during the trip.

Possible triggers:
- territorial/internal/port-water boundary;
- local navigation zone;
- distance-from-coast threshold defined by a source rule;
- sunset/sunrise;
- visibility condition;
- temporary maritime safety notice.

The engine composes applicable international, national and local rules using explicit reviewed composition semantics. It does not use a generic “strictest wins” algorithm.

## 11. Drone example

A remote pilot plans a cross-border operation.

The engine checks:
- operator/pilot credential scope;
- jurisdiction and EASA/national applicability;
- current UAS geographical zone;
- local conditions for the intended operation;
- operational authorization/declaration scope where relevant;
- dynamic/restricted zones;
- route altitude and time if the rule uses them.

The user must be warned before entering an excluded/restricted zone when reliable data allows it, while the UI still states that the pilot remains responsible for obtaining current official geo-zone information.

## 12. Aviation and dynamic operational information

For manned aviation and advanced UAS, static legal rules and temporary operational information are separate.

The engine must be able to ingest reviewed operational notices, but:
- operational notice != statute;
- provider feed != regulator;
- notice absence != unrestricted airspace;
- stale feed != current assurance.

Temporary restrictions, NOTAM-like information, airspace class, local minima and night/VFR rules may trigger re-evaluation only through declared source contracts.

## 13. Professional transport and dangerous goods

Context can affect professional-driver and ADR-related obligations. The engine may combine:
- credential status;
- route/jurisdiction;
- vehicle/cargo class;
- driving/rest state supplied by the proper subsystem;
- restricted routes/zones;
- temporary national exceptions when reviewed.

It does not become a tachograph recorder, dispatch system or dangerous-goods classification engine by itself.

## 14. Border-controlled movement beyond licences

The same horizontal mechanism can support CALPQ-held travel/permission facts for:
- cash declaration;
- excise/personal-use limits;
- pets/animals;
- plants/food where a supported rule pack exists;
- regulated-substance quantity/age/movement restrictions;
- controlled equipment.

These are opt-in context packs. The engine does not infer cargo from location or profile.

## 15. Pre-trip planning versus live mode

Two modes are mandatory.

### PLAN
Uses intended route/time and current reviewed rule versions.
Result: advisory future briefing with uncertainty and future-version caveats.

### LIVE
Uses current authorized observations and active context.
Result: current rule delta and notification intent.

A planned route never mutates legal state. A live GPS fix never proves border admission, customs clearance or lawful activity.

## 16. Offline corridor pack

A trip can be prepared while online:
- relevant jurisdictions/zones;
- selected rule-pack versions;
- source freshness;
- geospatial boundary data;
- translations/explanations;
- expiry/review metadata.

Offline mode must display the last-known freshness and suppress claims that depend on unavailable dynamic data. A stale dynamic source cannot be represented as current.

## 17. Notification hierarchy

The engine generates notification intents only. Delivery remains the existing Application notification responsibility.

Suggested intent priorities:
- **CRITICAL_ACTION** — immediate safety/legal action is required by a verified rule and context;
- **ACTION_REQUIRED** — action needed before/at transition;
- **MATERIAL_CHANGE** — important changed rule;
- **PREPARE** — useful before entering;
- **INFORMATION** — explanatory;
- **REVIEW_REQUIRED** — system cannot safely resolve.

Notification deduplication, acknowledgement and escalation reuse the existing M06 lifecycle semantics. Acknowledging an alert never proves compliance.

## 18. Source separation

Five source classes remain distinct:
1. normative legal/regulatory source;
2. reviewed geospatial boundary source;
3. official operational/dynamic notice source;
4. environmental/astronomical observation or deterministic calculation;
5. device/user route/location observation.

No lower class may silently upgrade itself into normative authority.

## 19. AI boundary

AI may:
- explain the delta;
- translate terminology;
- summarize reviewed sources;
- help the user understand why the alert appeared.

AI may not:
- invent a BAC value;
- infer a maritime distance limit without a source;
- convert GPS into legal proof;
- decide that a stale zone feed is safe;
- create recognition between jurisdictions;
- suppress a reviewed critical rule.

## 20. Privacy and surveillance boundary

Continuous location is sensitive.

Default architecture:
- explicit opt-in per personal context;
- prefer on-device geofence/context evaluation;
- use minimum necessary precision;
- keep raw location transient unless a separate purpose requires retention;
- audit rule evaluation with bounded context references, not a permanent travel diary;
- never expose personal route history to employer/family/provider by default;
- no covert B2B workforce tracking;
- background permission loss degrades visibly and safely.

A user can use manual destination/route preview without background tracking.

## 21. Apple-native UX

On Apple platforms the feature should use native permission and notification semantics, Dynamic Type, VoiceOver and non-distracting presentation.

While driving, UI must avoid requiring reading/interaction. Where platform-supported vehicle experiences are later considered, they require a separate UX/safety review. This architecture does not authorize CarPlay integration.

## 22. Relationship to existing CALPQ capabilities

This engine consumes rather than duplicates:
- Passport / Credential Graph;
- Eligibility and requirement evaluation;
- Lifecycle and continuous compliance;
- Notification Policy;
- Dependency Graph and selective re-evaluation;
- Historical replay;
- Regulatory Radar;
- EXPATS/MobilityCase;
- GLOBAL jurisdiction packs;
- Family/Age Unlock;
- B2B Assignment Guard;
- localization, privacy and audit.

CALPQ-GLOBAL-0001 / PR #138 is the intended source of global jurisdiction-pack semantics. Because #138 is still open/unmerged, runtime admission of this engine is blocked from claiming that dependency as integrated.

## 23. Source research used for architecture discovery

The architecture was checked against representative authoritative sources, not used to hard-code legal values:

- European Commission / Your Europe — road rules vary by country, including alcohol, speed, equipment, lights, winter tyres and side of road.
- Your Europe — driving-licence recognition/exchange has jurisdiction- and document-type conditions.
- European Commission UVAR — urban access can depend on vehicle/emission class and fees.
- IMO COLREG — Rule 20 light requirements operate from sunset to sunrise; COLREG has separate steering/sailing and visibility rules.
- UNCLOS — territorial sea may extend up to 12 nautical miles, while local navigation overlays still require national/local sources.
- EASA — UAS geographical zones may facilitate, restrict or exclude operations; pilots must use current national geo-zone information.
- EASA — cross-border UAS operations in the specific category require additional local-operation handling.
- EASA SERA — VFR/night and airspace requirements can depend on altitude, visibility, cloud distance and State rules.
- IALA — area notices are time-dependent geographic safety information.
- UNECE ADR — international dangerous-goods road transport includes driver training and operating requirements.
- European Commission — professional driving/rest rules and temporary exceptions are versioned regulatory inputs.
- Your Europe — cash, excise goods and pet movement can create border/destination-specific obligations.

Canonical source URLs and discovery limitations are recorded in the traceability document.

## 24. Non-goals

This architecture does not:
- implement runtime location collection;
- publish any country rule values;
- activate background tracking;
- create a navigation route engine;
- provide law-enforcement or surveillance capability;
- merge #135 or #138;
- merge open AI-economy architecture #167;
- authorize production alerts;
- replace specialist or authority decisions;
- change historical CALPQ results;
- add a new technology stack.

## 25. Implementation admission sequence

Future runtime work requires separate owner admission and should be split at least into:
1. Context observation/value contracts.
2. Spatial/temporal resolver.
3. Global jurisdiction-pack binding after dependency integration.
4. Delta evaluator over existing deterministic outputs.
5. Notification-intent adapter to M06 policy.
6. Offline corridor/freshness model.
7. Privacy-preserving device adapter.
8. Dynamic operational source adapters.
9. Domain pilot: road + one maritime/UAS path.
10. Integration/replay/security evidence.

No step is admitted by this document.

## 26. Acceptance principle

The engine is architecture-complete only when every supported alert can be replayed as:

exact context observation
+ exact boundary/zone version
+ exact source/rule versions
+ exact credential/activity snapshot
+ exact evaluator version
→ exact delta
→ exact alert intent.

If any material input is missing, the correct result can be UNKNOWN or REVIEW_REQUIRED.
