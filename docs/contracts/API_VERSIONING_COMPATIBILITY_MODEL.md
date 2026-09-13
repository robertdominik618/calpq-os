# CALPQ API Versioning and Compatibility Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0018-F`

API contract versioning is separate from deployment version, database migration version, catalog version, rule version and source version.

Backward-compatible changes may add optional fields or new enum values only when consumers are contractually required to tolerate them. Breaking changes require an explicit new API contract version and migration/deprecation plan.

Existing fields MUST NOT silently change meaning. A rename with changed semantics is breaking even if the JSON type is unchanged.

Deprecation records identify affected contract, replacement, announced-at date and planned removal boundary.

OpenAPI `3.1.x` remains the approved description baseline. A future OpenAPI 3.2.x adoption changes tooling/description capability only after separate validation; it does not by itself change CALPQ API semantics.