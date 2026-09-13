# CALPQ Selective Disclosure Governance

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-CONTRACT-SELECTIVE-DISCLOSURE-0001`

## Purpose
Define minimum-necessary disclosure from Professional Passport, Credential Archive and verification records.

## DisclosurePackage
A disclosure package must state:
- subject;
- requester / relying party;
- purpose;
- selected claims;
- presentation form;
- legal basis / consent reference;
- expiry / audience restriction;
- onward-transfer rule;
- retention rule;
- policy version;
- provenance of the access decision.

## Minimisation
The system SHOULD prefer a derived claim when it satisfies the purpose without exposing the underlying document or unrelated attributes.

Examples:
- `holds_valid_authorization=true` rather than full certificate scan;
- `age_over_threshold=true` rather than full date of birth;
- credential status and scope rather than unrelated archive contents.

Original documents, unrelated credentials, OCR/AI proposals and internal review notes MUST NOT be included by default.

## Recipient binding
A disclosure package is bound to its intended audience and purpose. Reuse by a different recipient or materially different purpose requires a new access decision.

## Revocation / expiry
Expiry or withdrawal of the sharing authorization prevents future CALPQ-mediated disclosure, but does not rewrite lawful historical disclosures already made.
