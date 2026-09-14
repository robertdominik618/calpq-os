# CALPQ FV-10 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-10 prepares provider-neutral verification orchestration.

A verification request identifies evidence/document/credential reference, claims, subject, jurisdiction/use case, required assurance, acceptable methods and evaluation instant. A route selects one approved adapter capability while provider URLs, credentials, SDK and protocol details remain in adapters.

Route outcomes are normalized. A successful technical check is insufficient unless verifier/issuer authority is sufficient for the claim. Partial verification promotes only checked claims. Conflicts require explicit precedence or review. Provider outage is uncertainty, not claim failure. Retry preserves idempotency.

Verification may create an auditable VerificationRecord but does not create EligibilityAssessment or AuthorizationGrant.