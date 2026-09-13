# Credential Evidence Binding

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-DOM-EVID-0001`

## Purpose

Define how artifacts and evidence support eligibility and authorization decisions without collapsing evidence into authority.

## Evidence snapshot

Every `EligibilityAssessment` and every grant decision references an immutable evidence snapshot. The snapshot records exact evidence IDs, revisions/hashes and verification state used at the time.

Later replacement, re-verification or expiration of an artifact does not rewrite the historical snapshot.

## Verification classes

CALPQ distinguishes at least:

- original/source evidence;
- derived/extracted evidence;
- asserted user data;
- verified structured fact;
- authoritative external fact/decision.

AI/OCR output is derived evidence unless separately verified.

## CredentialArtifact binding

A `CredentialArtifact` may provide:

- issuer/authority assertion;
- subject identity link;
- qualification/attribute facts;
- issuance/effective/expiry facts;
- cryptographic verification result;
- registry lookup reference.

Cryptographic validity proves integrity/authenticity properties defined by the format. It does not by itself prove current legal eligibility or active authorization in CALPQ.

## Decision binding

A grant decision must preserve:

- assessment or authority-decision reference;
- requirement-set version;
- exact evidence snapshot;
- source/rule version;
- actor/authority attribution;
- decision instant.

## Staleness

Evidence can become stale after a historical decision. Staleness triggers reassessment/review according to policy; it does not mutate historical decisions in place.

## Selective disclosure boundary

Presentation/share views may disclose only a subset of evidence or claims, but the internal decision record retains the complete decision provenance required for audit.

## Invariants

- no artifact automatically creates an authorization grant;
- no AI/OCR result becomes `VERIFIED` without a verification step;
- historical decisions retain the evidence version actually used;
- absence of required evidence produces `INDETERMINATE` or `REVIEW_REQUIRED`, never fabricated satisfaction;
- evidence deletion/retention policy must preserve required audit/legal references or tombstone metadata as governed.
