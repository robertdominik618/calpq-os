# CALPQ FV-14 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-14 provides REST/JSON transport over approved Application use cases.

OpenAPI 3.1.x remains the baseline. API DTOs, HTTP status codes, URL shapes and OpenAPI schemas are transport contracts, not Core/domain truth. Core has no transport framework dependency.

Operations preserve correlation identity, operation identity, contract version and stable domain IDs where applicable. Domain outcomes remain explicit and are not inferred from HTTP success alone. Error contracts use stable codes and correlation identifiers.

## Implementation evidence

- REST/JSON + OpenAPI source boundary under `apps/api/src/`.
- Application transport contract under `packages/application/src/transport/transport-contract.ts`.
- Exact 20-point runtime evidence in `apps/api/test/fv14-rest-openapi.test.ts`.
- Compile-time immutability/boundary proof in `apps/api/test/fv14-types.compile.ts`.
- Executable gate: `tests/fv14_rest_openapi_test.sh`.
- Dedicated workflow: `.github/workflows/fv14-rest-openapi.yml`.
- Import-boundary correction: `5198e242b5edcd673b9028b73c38c9923af74f24`.
- Typecheck-scope correction: `200213197fae3084acbe8aa1357b5316261a28c0`.
- `FV-14 REST OpenAPI #6` — SUCCESS, 20/20 mandatory runtime tests plus TypeScript boundary proof.

Verified boundaries: transport invokes Application handlers only; `apps/api` has no Core import, database/ORM/provider SDK dependency or independent eligibility/authorization policy; no-existence-leak error mapping is preserved; correlation, operation identity and contract version are explicit.
