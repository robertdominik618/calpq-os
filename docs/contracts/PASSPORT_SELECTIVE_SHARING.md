# CALPQ Professional Passport Selective Sharing

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0005-F`

## Purpose

Allow a subject to prove relevant professional/authorization facts without exposing unrelated personal or evidentiary data.

## Share package

A share package is a scoped projection containing only explicitly selected claims and supporting verification metadata.

It may include:
- subject display identity appropriate to purpose;
- selected credential/authorization claims;
- current verification/validity status;
- issuing/deciding authority where relevant;
- effective/expiry dates where relevant;
- machine-verifiable reference/token where supported;
- provenance summary sufficient for the verifier.

It MUST NOT automatically include source documents, unrelated credentials, rejected evidence, internal notes, AI/OCR proposals or sensitive attributes not required for the purpose.

## Selective-disclosure rules

1. Default to minimum necessary disclosure.
2. Separate claim sharing from source-document sharing.
3. A verifier may request more evidence, but CALPQ must show the subject what additional data would be disclosed.
4. Expired/revoked/suspended state must not be hidden by an old cached share projection.
5. Share packages are purpose- and time-bounded where technically feasible.
6. Sharing does not transfer ownership of original evidence.

## Verification boundary

The sharing layer may expose cryptographic or registry verification results, but it MUST NOT reinterpret legal eligibility beyond the current authoritative CALPQ domain state.

## Audit

Material share events should be auditable with package ID, subject, recipient/purpose when known, selected claims, creation time and expiry/revocation state, without logging unnecessary sensitive payloads.
