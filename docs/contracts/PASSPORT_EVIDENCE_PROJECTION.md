# CALPQ Passport Evidence Projection

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0005-B`

## Purpose

Define how evidence is projected into the Professional Passport without confusing possession of a document with verified legal effect.

## Evidence projection classes

Every displayed item maps to one of:
- ORIGINAL_EVIDENCE;
- VERIFIED_FACT;
- USER_ASSERTION;
- IMPORTED_ASSERTION;
- OCR_OR_AI_PROPOSAL;
- AUTHORITY_DECISION;
- DERIVED_PROJECTION.

## Required display metadata

Each projection carries:
- evidence/provenance ID;
- origin;
- verification status;
- extraction/derivation method where relevant;
- verified-by authority or reviewer where relevant;
- verified-at timestamp where relevant;
- source version/hash where applicable;
- confidence only for non-authoritative extraction, never as a substitute for verification.

## Non-escalation rule

No projection may upgrade:
- OCR/AI proposal to verified fact;
- user assertion to authority decision;
- cryptographic validity to legal eligibility;
- document possession to authorization grant.

Any such upgrade requires the explicit verification/decision process defined elsewhere in Core.

## Historical reproducibility

If a passport showed a fact as verified at a historical point, CALPQ must be able to identify the exact evidence and verification state used at that time, even if the source later changes or expires.
