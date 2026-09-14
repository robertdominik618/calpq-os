# CALPQ M09 — Trust, Selective Sharing & Interoperability Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M09-PLAN-0001`
Depends on: M05 evidence/verification fabric planning, M08 organization/B2B planning, M01 trust/access/privacy/interoperability contracts.

## Purpose
Make CALPQ evidence and governed claims portable and verifiable across relying parties while disclosing only the minimum necessary information and keeping Core provider/format neutral.

## Scope
M09 covers:
- selective disclosure;
- share/verification presentations;
- relying-party trust;
- consent and purpose limitation;
- verifier/issuer authority context;
- registry linking;
- interoperable external mappings;
- VC/EUDI Wallet/ISO mdoc boundaries;
- signed/cryptographically verifiable presentations where appropriate;
- revocation/expiry/current-state checking where supported.

## Disclosure model
A disclosure is purpose-scoped and must identify:
- subject/claim set;
- relying party or audience context;
- purpose/legal-basis reference where applicable;
- minimum necessary claims;
- evidence/provenance references;
- verification/freshness state;
- presentation time and expiry where applicable.

Original source documents are not shared by default when a narrower verified claim is sufficient.

## Trust boundary
A technically valid presentation proves only the properties guaranteed by the mechanism. CALPQ must separately preserve issuer/verifier identity, authority scope, jurisdiction/time applicability and claim meaning.

## Consent and purpose
Consent does not create legal authority and purpose does not broaden access. Purpose/consent records are versioned, attributable and auditable. Withdrawal or expiry affects future disclosure policy without rewriting historical audit evidence.

## Interoperability
External formats/protocols map through adapters/contracts. W3C Verifiable Credentials, OpenID4VCI/OpenID4VP, EUDI Wallet attestations and ISO mdoc may transport claims but do not redefine CALPQ Core semantics.

## Verification presentations
A relying party should be able to verify:
- what claim was presented;
- by whom/for which subject;
- source/provenance and verification state;
- applicable time/scope;
- whether the presentation is current enough for the requested purpose.

## Privacy/security
- minimize disclosed data;
- no raw audit/evidence payloads by default;
- protect presentation links/tokens against replay and unintended audience use;
- tenant/purpose/access policies remain effective;
- telemetry excludes credentials, secrets and unnecessary personal data.

## Non-goals
M09 does not grant authorization from presentation validity, replace M08 assignment logic, or allow an external wallet/provider to define CALPQ truth semantics.

## Exit criteria
M09 planning is ready when selective sharing, relying-party trust, consent/purpose and interoperability mappings preserve provenance, authority scope, minimum disclosure and provider-neutral Core semantics.