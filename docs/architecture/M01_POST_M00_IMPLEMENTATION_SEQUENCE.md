# CALPQ M01 Post-M00 Implementation Sequence

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0022-I`

This sequence becomes usable only after separate M00 release governance authorizes feature development.

## Order
1. Core primitives: typed IDs, Clock/IdGenerator ports, revisions, Result/Error, provenance/evidence states.
2. Aggregate kernel: command/event envelopes, state transitions, optimistic revision and idempotency contracts.
3. Credential/evidence types required by the first vertical.
4. Application execution context, use cases and provider-neutral ports.
5. Persistence UnitOfWork, schema migrations and transactional outbox/inbox boundary.
6. Document/credential evidence intake required by the first vertical.
7. Verification orchestration through approved ports and deterministic test adapters.
8. Eligibility assessment using versioned CredentialDefinition/RequirementSet fixtures.
9. Professional Passport projection from authoritative outputs.
10. Tenant/access/audit enforcement across the full path.
11. REST/JSON wire endpoints using approved API contracts.
12. Async workers, retries, reconciliation and recovery only under Operational Resilience invariants.

## Prohibitions
- do not start from UI or ORM models;
- do not embed domain rules in controllers, workers or adapters;
- do not treat provider/OCR/AI output as authority;
- do not add AuthorizationGrant issuance to the first slice without a later admission decision;
- do not bypass tenant, access, audit or provenance boundaries for convenience.

Every implementation increment must preserve existing Foundation/M01 guards and add executable tests for the implemented invariant.
