# CALPQ Spatiotemporal Trigger Model

ID: CALPQ-CONTEXT-0001-C02
Status: TARGET ARCHITECTURE / NOT IMPLEMENTED

## Principle

A trigger means “re-evaluate this bounded scope”, not “the law changed” or “the user violated a rule”.

## Trigger vocabulary

The canonical trigger registry contains CTX-T01..CTX-T18:
- jurisdiction approach/enter/exit;
- zone enter/exit;
- route preview;
- local time window;
- astronomical event;
- season/effective-date window;
- distance threshold;
- altitude threshold;
- depth/water-condition threshold;
- weather/visibility threshold;
- speed/motion state;
- dynamic notice start/end;
- credential state change;
- rule-version effective change.

## Position observation

A position input must carry:
- coordinate reference semantics;
- horizontal accuracy or explicit unknown;
- altitude accuracy where altitude matters;
- observation and receipt time;
- source kind;
- integrity/freshness state.

No exact-address storage is required by the Core.

## Geospatial boundaries

A boundary record has:
- stable boundary_id and version;
- geometry/data-source version;
- jurisdiction/zone semantic ref;
- effective interval;
- source/provenance;
- precision/known-limitations;
- review status.

Geometry changes are versioned separately from legal rule changes.

## Approach and crossing

Approach may be predicted from a planned route or observed motion. It is advisory.

Confirmed transition requires the admitted policy to address:
- accuracy radius;
- hysteresis/debounce;
- map matching if used;
- repeated observations;
- tunnels/ferries/air travel;
- ambiguous border geometry;
- stale observations.

No universal number of metres/seconds/samples is hard-coded in Core.

## Local time and astronomical events

Rule time uses the relevant legal/local time definition, not device UI locale.

Astronomical triggers are deterministic derived context with:
- coordinates/corridor;
- date;
- event definition used by the reviewed rule;
- computation implementation/version.

SUNSET is not interchangeable with civil/nautical/astronomical twilight unless the rule explicitly makes that equivalence.

DST, timezone-boundary and date-line transitions are explicit.

## Distance-to-feature

Distance rules require:
- exact referenced feature/geometry;
- distance method;
- unit;
- threshold;
- uncertainty handling;
- effective rule version.

Examples can include distance from coast, airport, protected feature or people/buildings. Architecture does not supply a global threshold.

## Environmental triggers

Weather, visibility, tide/current or similar inputs are only used where an authoritative reviewed rule requires them.

Observation provider failure yields stale/unknown input, not an invented safe condition.

## Dynamic notice triggers

Operational notices have explicit:
- notice id/version;
- issuing authority/source classification;
- affected geometry;
- valid_from/to or cancellation;
- subject/activity applicability;
- freshness/receipt time.

Cancellation and expiry are distinct events.

## Deterministic trigger key

A future implementation should derive dedup/re-evaluation identity from governed fields such as:
scope + trigger kind + boundary/notice/rule version + effective occurrence + activity context.

UI labels and translated text must not participate in identity.
