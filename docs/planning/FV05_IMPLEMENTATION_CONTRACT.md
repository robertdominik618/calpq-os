# CALPQ FV-05 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-05 defines only the credential-evidence domain types needed by the first vertical.

Required concepts:
- `CredentialArtifactId` and `CredentialArtifact`;
- subject reference when present;
- issuer/authority identity reference when present;
- issuance/effective/expiry metadata when present;
- verification state;
- provenance/evidence references;
- external identifier/hash/reference;
- immutable evidence snapshot references suitable for later eligibility decisions.

Separation rule:
`document/artifact != evidence != verified fact != eligibility assessment != authorization grant`.

Invariants:
- artifact presence does not create authorization;
- cryptographic validity does not prove legal eligibility;
- extracted/derived information is not automatically verified;
- historical evidence snapshots keep the versions actually used;
- missing required evidence cannot be fabricated as satisfaction.

FV-05 introduces no grant command, no eligibility evaluator, no recognition/equivalence and no provider-specific protocol types in Core.