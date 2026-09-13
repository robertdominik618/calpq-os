# Credential Interoperability Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-INT-CRED-0001`

## Principle

External credential formats and issuance/presentation protocols do not define CALPQ Core domain truth.

Core owns:

- requirements and eligibility semantics;
- grant/lifecycle semantics;
- validity projection;
- decision provenance;
- evidence binding.

Adapters own wire formats, wallets, cryptography and protocol translation.

## W3C Verifiable Credentials 2.0

W3C VC Data Model 2.0 is an external representation for machine-verifiable credentials.

Mapping may expose CALPQ `CredentialArtifact` data as a VC or ingest a VC into an artifact/evidence adapter. A valid VC is not automatically an `AuthorizationGrant`.

Reference: https://www.w3.org/TR/vc-data-model-2.0/

## OpenID4VCI / OpenID4VP

OpenID for Verifiable Credential Issuance and Presentation belong to integration/adapters. They define issuance/presentation flows, not CALPQ eligibility or legal authority semantics.

References:

- https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0-final.html
- https://openid.net/specs/openid-4-verifiable-presentations-1_0-final.html

## EUDI / electronic attestations

European Digital Identity Wallet person-identification data and electronic attestations of attributes may be consumed or emitted through dedicated adapters. Their trust/assurance metadata must be preserved.

A wallet attestation can be authoritative evidence where applicable law and trust policy say so, but the adapter may not invent that legal status.

Reference family: Regulation (EU) No 910/2014 as amended and relevant implementing regulations.

## Multiple representations

One CALPQ authorization/credential concept may have multiple external representations simultaneously. Representation IDs must not become the canonical domain identity.

## Selective disclosure

Where an external format supports selective disclosure, presentation adapters should disclose the minimum claims necessary for the requested purpose. The internal audit record remains separate from the presented subset.

## Exit rule

Replacing a wallet, credential format, issuer protocol or cryptographic suite must not require rewriting Core eligibility/lifecycle rules.
