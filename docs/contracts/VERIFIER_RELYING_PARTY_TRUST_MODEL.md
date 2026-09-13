# CALPQ Verifier / Relying Party Trust Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0010-E`

## Purpose

Define when an external verifier or relying party may request and consume CALPQ verification results without being treated as universally trusted.

## VerifierProfile

Required concepts:
- verifier/relying-party TrustEntity;
- permitted purpose(s);
- jurisdiction;
- data/claim scope;
- assurance level;
- registration or authority source;
- effective dates;
- privacy/minimization policy;
- provenance.

## Rules

1. A verifier's right to request data is separate from an issuer's authority to create a credential.
2. Registration as a relying party MUST NOT grant authority outside the registered purpose/scope.
3. CALPQ sharing defaults to minimum necessary claims.
4. A verifier MUST NOT receive unrelated source documents merely because a summarized claim can be verified.
5. Expired, suspended, revoked or unverified verifier authority yields denial, review or indeterminate state according to policy.
6. Purpose/scope changes create a new auditable trust state; they do not rewrite historical disclosures.

## Decision

`PERMITTED | PERMITTED_WITH_CONDITIONS | DENIED | INDETERMINATE | REVIEW_REQUIRED`

Each decision retains verifier identity, purpose, requested claim set, authority source, policy/rule version, evaluation time and provenance.
