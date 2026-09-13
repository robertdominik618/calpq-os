# CALPQ Document Verification Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0009-D`

## Verification is separate from intake and extraction

Verification evaluates claims against an explicit authority, trusted registry, issuer, signature/trust service, human reviewer or other approved verifier.

Verification outcomes:
`UNVERIFIED | VERIFIED | FAILED | STALE | REVIEW_REQUIRED | NOT_APPLICABLE`

A verification record MUST retain verifier identity/type, method, checked claims, checked-at instant, source/authority reference, expiry or freshness limit when applicable, result and provenance.

Cryptographic validity proves only the property actually checked. It MUST NOT be interpreted as proof that the holder currently possesses a legal authorization unless the relevant rule says so.

Document verification MUST NOT bypass `RequirementSet`, `EligibilityAssessment`, recognition or explicit grant/authority decisions.
