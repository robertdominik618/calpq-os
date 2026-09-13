# CALPQ Application Execution Context Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0019-B`

## Purpose
Provide stable execution context for all Application use cases regardless of entrypoint.

## ApplicationExecutionContext
Carries, where applicable:
- operation/request identity;
- authenticated actor reference;
- subject/organization scope;
- correlation ID;
- causation ID;
- requested-at instant from approved clock boundary;
- contract/API version reference;
- access/purpose context reference;
- locale/presentation hints only when needed outside Core.

## Rules
- Authentication context does not prove canonical Subject identity.
- Actor context does not create authorization or professional competence.
- Correlation/causation survives HTTP, worker and async boundaries.
- Context contains references and minimum necessary metadata, not raw evidence or secrets.
- UI/session-specific data must not leak into Core semantics.

## Entry-point neutrality
Fastify routes, background workers, schedulers and future interfaces construct the same logical context and invoke the same Application use cases.