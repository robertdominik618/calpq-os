# CALPQ API Wire Contract Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0018-A`

## Purpose
Define the transport boundary between clients/external systems and CALPQ Application/Core without allowing HTTP, DTO or OpenAPI shapes to become domain truth.

## Baseline
- REST/JSON remains the approved initial public transport.
- OpenAPI `3.1.x` remains the approved description baseline from ADR-0002.
- Adoption of OpenAPI 3.2.x requires separate compatibility validation/ADR; this PREP does not change the approved stack.

## Separation rules
- API DTO != Aggregate Root.
- HTTP status != domain evaluation result.
- OpenAPI schema != Core model.
- transport version != rule/catalog/source version.
- URL shape != domain identity.
- UI route name != command/event type.

## Contract ownership
Wire schemas belong to `packages/contracts` after M00 release. Application maps them to/from Core types. Core MUST NOT depend on Fastify, HTTP headers, JSON serialization, OpenAPI libraries or generated clients.

## Required metadata
Material API operations preserve correlation ID, actor/auth context reference, request/operation identity, contract version and stable domain IDs where applicable.

## Privacy/security
Wire contracts expose minimum necessary data. Raw evidence, internal stack traces, provider payloads, secrets and unrestricted audit content are never included by default.