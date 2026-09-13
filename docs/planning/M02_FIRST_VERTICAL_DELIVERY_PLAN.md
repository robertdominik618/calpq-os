# CALPQ M02 First Vertical Delivery Plan

Status: `PLANNING ONLY / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M02-PLAN-0001`

## Vertical
`Credential Evidence -> Verification -> Eligibility -> Passport Projection`

## Objective
Prepare an execution-ready delivery sequence for the first end-to-end CALPQ vertical without creating product source while M00 feature development remains frozen.

## Preconditions before implementation
Implementation may begin only after all of the following are independently true:
1. M00 repository governance passes.
2. M00 receives an explicit release decision.
3. Feature Development Gate is explicitly OPEN.
4. This vertical receives `ADMITTED_FOR_IMPLEMENTATION` under the existing vertical admission gate.
5. The implementation base is green for Foundation and active M01 guards.

## Delivery sequence
### D0 — Admission package
Freeze the vertical scope, aggregate/state/command/event catalog, evidence/provenance rules, error mapping and executable test matrix. No source code.

### D1 — Core primitives
Implement typed IDs, Clock/IdGenerator ports, revisions, Actor/Subject references, jurisdiction values, evidence/provenance values and result/error taxonomy.

### D2 — Aggregate kernel
Implement command/event envelopes, deterministic transition rules, optimistic revision and idempotency primitives. No credential-specific shortcut may duplicate Core semantics.

### D3 — Credential evidence model
Implement only the types needed by the first slice: canonical Subject reference, `DocumentIntakeRecord`, immutable `OriginalArtifact`, `CredentialArtifact`, `VerificationRecord`, versioned `CredentialDefinition`, `RequirementSet`, immutable `EligibilityAssessment` and Passport projection inputs.

### D4 — Application layer
Implement `ApplicationExecutionContext`, command/query handlers and provider-neutral ports. Controllers, workers and adapters remain free of business rules.

### D5 — Persistence boundary
Implement versioned SQL migrations, repositories, UnitOfWork, expected revision, idempotency record and transactional outbox/inbox behavior. Database IDs never become domain identity.

### D6 — Evidence intake
Implement the minimal intake path required by this vertical. Original artifacts remain immutable; extracted or AI/OCR-derived values remain derived proposals/evidence until independently verified.

### D7 — Verification
Implement verification orchestration through normalized ports and deterministic test adapters. Signature/technical validity does not imply legal authority.

### D8 — Eligibility
Implement deterministic evaluation against exact `CredentialDefinition` and `RequirementSet` versions with explicit `SATISFIED`, `NOT_SATISFIED`, `INDETERMINATE`, `REVIEW_REQUIRED` outcomes.

### D9 — Passport projection
Build the Professional Passport read projection from authoritative outputs. Projection state never becomes the legal/domain source of truth.

### D10 — Tenant, access and audit enforcement
Apply TenantContext, access/purpose/minimum-necessary rules, audit references and privacy boundaries across every read and write path.

### D11 — REST/JSON boundary
Expose the approved use cases through API DTOs and RFC 9457-compatible errors. HTTP status remains separate from domain evaluation result.

### D12 — Async/recovery hardening
Only after the synchronous path is stable, add workers, retry/reconciliation, projection rebuild and recovery under Operational Resilience contracts.

## Explicit non-goals
The first vertical does not issue or mutate `AuthorizationGrant`; does not perform recognition/equivalence; does not make B2B assignment decisions; does not automate renewal or Regulatory Radar; and does not treat AI/OCR/provider output as authority.

## Dependency rule
`apps/workers -> application -> core`

Provider-specific implementations stay in adapters. Core has no outward dependency on UI, Fastify, persistence, queues, telemetry or provider SDKs.

## Definition of delivery complete
The vertical is complete only when its domain invariants, persistence behavior, API mapping, tenant/access/audit controls and resilience behavior have executable tests and all Foundation/M01 guards remain green.
