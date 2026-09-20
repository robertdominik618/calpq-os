# CALPQ FV-10 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-10 provides provider-neutral verification orchestration.

A verification request identifies evidence/document/credential reference, claims, subject, jurisdiction/use case, required assurance, acceptable methods and evaluation instant. A route selects one approved adapter capability while provider URLs, credentials, SDK and protocol details remain in adapters.

Route outcomes are normalized. A successful technical check is insufficient unless verifier/issuer authority is sufficient for the claim. Partial verification promotes only checked claims. Conflicts require explicit precedence or review. Provider outage is uncertainty, not claim failure. Retry preserves logical request identity.

Verification may create an auditable VerificationRecord but does not create EligibilityAssessment or AuthorizationGrant.

## Implementation evidence

- B9 source boundary: `8dc9b720d1e54b16b3211200363f5083f38dd808`.
- B10 executable evidence: runtime tests, compile-time boundaries, dedicated workflow and regression guard through `ef7e175e1f72dd24ecf0840768598e6f9c57aed5`.
- `VerificationRequest` carries explicit target, claims, Subject, controlled Jurisdiction/use case, assurance, acceptable methods and evaluation instant.
- `VerificationProviderPort` exposes only provider-neutral capability + normalized technical result.
- `AuthorityResolverPort` is separate from technical provider checks and is evaluated per claim/jurisdiction/use case/instant.
- only technical `PASSED` plus authority `SUFFICIENT` promotes a claim to verified;
- unchecked or technically indeterminate claims remain indeterminate;
- conflicts become `REVIEW_REQUIRED`;
- provider outage becomes `INDETERMINATE` and never a claim/legal failure;
- verification records carry no EligibilityAssessment or AuthorizationGrant semantics.

Dedicated `FV-10 Verification Orchestration #4` is SUCCESS with 20/20 mandatory runtime scenarios plus compile-time nominal/immutability evidence. On the same evidence head, FV-06, FV-07, FV-08, FV-09, Foundation Guard, M00 Readiness, M02 Batch Readiness, Program Execution Readiness, M03-M08, M09-M12 and CALPQ v1 Index are all SUCCESS.
