# CALPQ M09 Execution Package — Trust, Selective Sharing & Interoperability

Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`

## Objective
Make verified CALPQ claims safely shareable and externally verifiable while preserving minimum-necessary disclosure and CALPQ semantic neutrality.

## Delivery slices
1. Selective-disclosure claim model.
2. Relying-party trust and verifier policy.
3. Consent and purpose-limitation enforcement for sharing.
4. Share/presentation request lifecycle and revocation semantics.
5. Verification link/presentation evidence model.
6. Registry-linking and external trust mapping.
7. W3C VC interoperability adapter boundary.
8. EUDI Wallet / OpenID4VCI/OpenID4VP boundary.
9. ISO mdoc and protocol-specific mapping boundary.
10. M09 integration evidence across minimum-necessary and conflicting-trust scenarios.

## Ownership
M09 owns disclosure policy, relying-party trust, presentation/sharing lifecycle and interoperability adapters. External formats/protocols do not redefine CALPQ Core truth.

## Definition of Done
- disclosure is claim-minimized and purpose-bound;
- relying-party trust is explicit and evidence-backed;
- external protocol payloads map into governed CALPQ semantics;
- revocation/expiry of presentations does not rewrite source credential history;
- all shared claims retain provenance/verification lineage;
- protocol/provider failure cannot change underlying CALPQ truth.

## Stop conditions
Stop if wallet/protocol format becomes the domain model, consent broadens access beyond purpose, unverified claims are presented as verified, or presentation state becomes authoritative credential state.