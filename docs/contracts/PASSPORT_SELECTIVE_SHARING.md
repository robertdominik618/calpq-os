# CALPQ Professional Passport Selective Sharing

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0005-F`
Extension: `CALPQ-M01-PREP-0012`

## Purpose
Allow a subject to prove relevant professional/authorization facts without exposing unrelated personal or evidentiary data, while enforcing requester purpose, legal basis/consent and policy scope.

## Access request boundary
Before creating a share package, CALPQ evaluates:
- requester / relying party;
- requester role and valid delegation;
- canonical subject;
- declared purpose;
- requested claims;
- legal basis and/or consent reference;
- jurisdiction and evaluation time;
- applicable policy version.

A role alone MUST NOT grant access. A changed purpose or materially expanded claim set requires a new policy decision.

## Access decision
Result is one of:
- `ALLOW`
- `ALLOW_WITH_CONDITIONS`
- `DENY`
- `REVIEW_REQUIRED`
- `INDETERMINATE`

Missing, stale or conflicting policy inputs MUST NOT degrade to broad access.

## Share package
A share package is a scoped projection containing only selected claims and supporting verification metadata.

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
2. Prefer derived claims where they satisfy the purpose with less disclosure.
3. Separate claim sharing from source-document sharing.
4. A verifier may request more evidence, but CALPQ must show what additional data would be disclosed and re-evaluate policy.
5. Expired/revoked/suspended state must not be hidden by an old cached share projection.
6. Share packages are purpose-, audience- and time-bounded where technically feasible.
7. Sharing does not transfer ownership of original evidence.
8. Onward transfer and retention limits travel with the package where policy supports them.

## Derived claims
Examples:
- `holds_valid_authorization=true` instead of a full certificate scan;
- threshold facts instead of full source attributes where legally sufficient;
- credential scope/status instead of unrelated archive contents.

## Consent and legal basis
Consent is one possible legal basis, not the universal basis. When consent is used it must remain specific to purpose, recipient/claim scope and effective period. Revocation prevents future reliance from its effective time but does not rewrite historical lawful disclosures.

## Audit
Every material access/share decision retains an immutable decision snapshot including requester, subject, purpose, basis/consent reference, requested/disclosed claims, result, reason codes, policy versions and conditions. Later policy/consent/role changes create a new linked decision rather than rewriting history. An audit snapshot does not itself grant continuing access.

## Verification boundary
The sharing layer may expose verification results, but it MUST NOT reinterpret legal eligibility beyond the current authoritative CALPQ domain state.
