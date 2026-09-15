# CALPQ FV-05 Test Contract

Status: `18 OF 18 EXECUTABLE / VERIFIED`

Mandatory count: 18.

1. artifact-id-type
2. artifact-subject-reference
3. issuer-reference
4. issuance-metadata
5. effective-metadata
6. expiry-metadata
7. verification-state
8. provenance-reference
9. evidence-reference
10. external-reference
11. evidence-snapshot
12. artifact-not-authorization
13. signature-not-eligibility
14. derived-not-verified
15. historical-evidence-version
16. missing-evidence-no-fabrication
17. no-provider-protocol-core-type
18. architecture-boundary

Detailed semantics are governed by `CREDENTIAL_EVIDENCE_BINDING.md` and `CREDENTIAL_AUTHORIZATION_DOMAIN_BASELINE.md`.

## Verified executable evidence
- `packages/core/test/fv05-credential-evidence.test.ts` executes all 18 mandatory runtime cases.
- `packages/core/test/fv05-types.compile.ts` proves nominal separation, immutability and controlled-type boundaries at compile time.
- `tests/fv05_credential_evidence_test.sh` requires the admitted implementation lifecycle, exactly 18 mandatory tests, TypeScript compilation, dependency neutrality and architecture boundaries.
- Dedicated workflow `FV-05 Credential Evidence #6` is SUCCESS on `9d894e017912f29e3d87029d07b37f0ae2b24b12`.
- The same head keeps FV-01 #21, FV-02 #17, FV-03 #14 and FV-04 #11 green.

Completion result: 18/18 passed, 0 waived, 0 deferred, 0 scope exceptions.
