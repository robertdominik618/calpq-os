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

## Explicit non-goals
- issuing or mutating `AuthorizationGrant`;
- recognition/equivalence workflows;
- B2B assignment decisions;
- renewal or Regulatory Radar automation;
- provider-specific AI/OCR authority.

## Required architecture use
Typed IDs, Clock/IdGenerator ports, provenance/evidence states, command/event envelopes, optimistic revision, UnitOfWork, outbox/inbox semantics, Application use cases, API wire contracts, TenantContext, AccessDecision, Audit references and Operational Resilience invariants.

## Admission assessment
Architecture prerequisites are materially complete, including machine-enforced Operational Resilience. Current implementation result remains:

`M00_GOVERNANCE_BLOCKED`

The slice is a candidate, not `ADMITTED_FOR_IMPLEMENTATION`, while M00 feature development remains frozen.