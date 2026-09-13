# CALPQ Verification Orchestration Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0010-C`

## Purpose

Define a provider-neutral orchestration layer that decides which verification route should be attempted, in which order, and what evidence may be promoted after each route.

## VerificationRequest

Inputs:
- evidence/document/credential reference;
- claims to verify;
- subject;
- target jurisdiction and use case;
- required assurance level;
- acceptable verification methods;
- evaluation instant.

## VerificationRoute

A route references one adapter capability, such as:
- official registry lookup;
- issuer API;
- trust-list / certificate validation;
- signed-document validation;
- wallet/credential presentation validation;
- manual authority confirmation;
- human review.

The Core/Application contract specifies the intent and acceptable result semantics. Provider URLs, SDKs, credentials and protocol details stay in adapters.

## Route outcomes

`VERIFIED | FAILED | INDETERMINATE | REVIEW_REQUIRED | NOT_SUPPORTED`

A route outcome MUST preserve:
- verifier/adapter identity;
- method;
- AuthorityResolutionResult;
- source snapshot/version;
- checked claims;
- timestamp;
- raw provider reference kept outside Core when necessary;
- provenance and explanation.

## Promotion rules

1. ExtractionProposal is never auto-promoted by confidence score alone.
2. Verification succeeds only when the verification route and the verifier/issuer authority are both sufficient for the requested claim.
3. Technical signature validity MUST NOT substitute for domain/legal authority resolution.
4. Partial verification promotes only the claims actually checked.
5. Conflicting successful routes require explicit precedence policy or human review.
6. Provider outage yields `INDETERMINATE`, not `FAILED` claim semantics.
7. Retry is idempotent and MUST NOT create duplicate authoritative records.

## Fallback policy

Fallback may increase effort but MUST NOT reduce required assurance. Example: registry unavailable -> queue human review; never registry unavailable -> accept OCR.

## Outputs

Successful orchestration creates or updates an auditable `VerificationRecord`; it does not itself create `EligibilityAssessment` or `AuthorizationGrant`.
