# CALPQ Authority Resolution Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0010-B`

## Purpose

Resolve whether a specific entity is authoritative for a specific claim, credential, verification task or legal/operational decision at a specific time and jurisdiction.

## AuthorityResolutionRequest

Required inputs:
- target TrustEntity;
- requested authority role;
- claim or credential scope;
- jurisdiction;
- evaluation instant;
- subject/organization context where applicable;
- required assurance level;
- candidate source/anchor references.

## AuthorityResolutionResult

`AUTHORIZED | AUTHORIZED_WITH_CONDITIONS | NOT_AUTHORIZED | INDETERMINATE | REVIEW_REQUIRED`

Each result MUST include:
- matched AuthorityScope IDs;
- TrustAnchorRecord IDs;
- applicable source versions;
- effective dates;
- conditions/limitations;
- explanation reasons;
- unresolved conflicts;
- provenance.

## Deterministic rules

1. Name similarity MUST NOT establish authority.
2. A valid cryptographic signature proves integrity/authenticity properties only within its certificate/trust context; it MUST NOT by itself establish legal competence to issue the underlying professional claim.
3. Authority must match role + scope + jurisdiction + time.
4. `UNVERIFIED`, `STALE`, conflicting or incomplete trust evidence MUST NOT produce unconditional `AUTHORIZED`.
5. Multiple independent scopes may coexist for one entity.
6. A verifier may be authorized to validate a fact without being authorized to issue the credential itself.
7. Organization-level authority MUST NOT automatically extend to every employee, subcontractor or subsidiary.

## Conflict handling

When authoritative sources disagree, the resolver returns `REVIEW_REQUIRED` or `INDETERMINATE` according to policy. Conflict resolution must be explicit and auditable; source priority cannot be guessed by AI.

## Historical semantics

The resolution snapshot is immutable. Subsequent trust-registry changes may trigger re-evaluation through PREP-0007, but the original AuthorityResolutionResult remains reproducible.
