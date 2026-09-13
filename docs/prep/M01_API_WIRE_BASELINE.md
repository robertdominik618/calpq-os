# CALPQ-M01-PREP-0018 — API Wire Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

Flow: `Client -> REST/JSON -> Application -> Core`.

Normative boundaries:
- DTO != Aggregate Root.
- HTTP status != domain result.
- OpenAPI schema != Core model.
- REST/JSON + OpenAPI 3.1.x remain approved baseline.
- Core has no HTTP/framework/OpenAPI dependency.
- stable CALPQ IDs are distinct from DB storage identity.
- Problem Details responses preserve stable CALPQ error codes.
- HTTP preconditions may carry expected revision but never replace the Core revision invariant.
- async operation state != domain outcome.
- event delivery is at-least-once with stable event identity.
- API, deployment, migration, catalog/rule and source versions are separate.
- breaking wire changes require explicit versioning/deprecation.
- minimum-necessary disclosure applies to responses and external events.

OpenAPI 3.2.1 is current on 2026-09-13; adoption remains deferred pending separate validation/ADR.