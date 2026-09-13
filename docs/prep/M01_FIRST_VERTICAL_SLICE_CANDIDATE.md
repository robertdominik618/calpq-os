# CALPQ First Vertical Slice Candidate

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0021-C`

## Candidate
`Credential Evidence -> Verification -> Eligibility -> Passport Projection`

## Purpose
Prove the CALPQ architecture end-to-end with the smallest useful regulated flow before adding AuthorizationGrant issuance, B2B assignment, renewal or regulatory-change automation.

## Included design path
1. existing canonical Subject reference;
2. `DocumentIntakeRecord` / immutable `OriginalArtifact`;
3. `CredentialArtifact` link;
4. `VerificationRecord` through provider-neutral verification port;
5. one versioned `CredentialDefinition` + `RequirementSet` fixture;
6. immutable `EligibilityAssessment`;
7. Professional Passport read projection.

## Explicit non-goals for first slice
- issuing or mutating `AuthorizationGrant`;
- recognition/equivalence workflows;
- B2B assignment decisions;
- renewal automation;
- Regulatory Radar automation;
- production external notifications;
- provider-specific AI/OCR authority;
- cross-tenant sharing beyond already approved access/tenant contracts.

## Required architecture use
The slice must use existing typed IDs, Clock/IdGenerator ports, provenance/evidence states, command/event envelopes, optimistic revision, UnitOfWork, outbox/inbox semantics, Application use cases, API wire contracts, TenantContext, AccessDecision and Audit references.

## Admission assessment
Design prerequisites are materially present, but current result is:

`M00_GOVERNANCE_BLOCKED`

The slice is a **first candidate**, not `ADMITTED_FOR_IMPLEMENTATION` while M00 feature development remains frozen.

## PREP-0015 condition
The deferred operational-resilience guard does not block initial pure Core/application construction after a future M00 release, but must be closed before this vertical is treated as integration/production complete with workers, retries, projection recovery or external-provider fallback.
