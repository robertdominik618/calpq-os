# CALPQ FV-05 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

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

## Implementation evidence
FV-05 was implemented on `impl/m02-batch-a-core-kernel` under the formally admitted FV-00 scope.

- Credential evidence implementation is contained under `packages/core/src/credential/` and explicit Core exports.
- Runtime evidence: `FV-05 Credential Evidence #6` — SUCCESS, 18/18 mandatory tests.
- Compile-time nominal/boundary evidence passes on head `9d894e017912f29e3d87029d07b37f0ae2b24b12`.
- FV-01 #21, FV-02 #17, FV-03 #14 and FV-04 #11 regression workflows are all SUCCESS on the same head.
- Foundation Guard #833, M00 Readiness #712, M02 Batch A Manifest #64, M02 Batch Readiness #121, Program Execution Readiness #135, M03-M08 #92, M09-M12 #81 and CALPQ v1 Execution Index #72 are SUCCESS.
- No mandatory FV-05 test was waived or deferred.
- No eligibility evaluator, `AuthorizationGrant`, persistence, transport, UI or provider SDK behavior was introduced.

Result: FV-05 Definition of Done is satisfied and the Batch A Core kernel has complete executable evidence for FV-01 through FV-05.
