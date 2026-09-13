# CALPQ Security Misuse Controls

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0016-D`

## Purpose
Define deterministic safety controls for repeated requests, stale proofs, excessive automation and privileged operations.

## Control areas
- explicit rate and velocity policy per capability and actor class;
- stronger assurance for security-sensitive operations;
- strict organization and delegation scope isolation;
- audience/time binding for reusable proofs and share packages where applicable;
- expiration/revocation checks before relying on previously issued presentations;
- bounded processing for ingestion, verification and export workflows;
- security signals for unusual request patterns.

## Boundaries
Rate limiting or temporary throttling is an operational/security outcome, not a domain rejection. A security signal does not directly mutate CredentialArtifact, EligibilityAssessment or AuthorizationGrant state.

## Sensitive operations
Canonical identity rebinding, Subject merge/split, TrustEntity or AuthorityScope changes, privileged delegation, source-document disclosure and break-glass actions require policy-defined elevated assurance and audit evidence.

## Proof freshness
Where a proof or share package is replay-sensitive, policy may require expiry, audience binding, nonce/challenge or equivalent freshness control. Old presentation material MUST NOT hide later suspension, revocation or expiry.
