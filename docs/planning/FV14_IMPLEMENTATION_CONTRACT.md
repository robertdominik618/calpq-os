# CALPQ FV-14 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-14 prepares REST/JSON transport over approved Application use cases.

OpenAPI 3.1.x remains the baseline. API DTOs, HTTP status codes, URL shapes and OpenAPI schemas are transport contracts, not Core/domain truth. Core has no transport framework dependency.

Operations preserve correlation identity, operation identity, contract version and stable domain IDs where applicable. Domain outcomes remain explicit and are not inferred from HTTP success alone. Error contracts use stable codes and correlation identifiers.