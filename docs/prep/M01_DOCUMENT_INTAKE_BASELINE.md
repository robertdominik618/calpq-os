# CALPQ-M01-PREP-0009 — Document Intake, Credential Archive, Extraction & Verification Boundary

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

## Goal

Prepare a safe, reusable document-ingestion architecture that can accept existing credentials and supporting documents without confusing storage, extraction, verification, eligibility or authorization.

## Canonical flow

`Intake channel -> DocumentIntakeRecord -> immutable OriginalArtifact -> ExtractionProposal -> user/human review -> VerificationRecord -> Evidence link -> Credential/Passport projections`

## Mandatory invariants

1. The original document is immutable and separate from every derived artifact.
2. OCR/AI/parser output is a proposal, not an authoritative fact.
3. User correction is traceable and is not authority verification by itself.
4. Verification is an explicit separate step with method, verifier, source, time and provenance.
5. A verified document or signature does not automatically equal a current `AuthorizationGrant`.
6. Archive links preserve evidence state and never bypass `RequirementSet`, recognition, eligibility or grant decisions.
7. Suspicious or unsupported inputs can be quarantined before extraction.
8. Sensitive document contents are not written into normal application logs.
9. External processors receive only the minimum data necessary for the processing purpose.
10. Current projections may be re-evaluated when evidence changes, but historical decisions and their evidence snapshots remain immutable.

## Intake channels

The model supports camera, scan, file/PDF, email attachment, share sheet, URL and future provider/registry adapters without changing Core semantics.

## Downstream integration

Verified and reviewed evidence may feed Professional Passport, Gap Navigator, lifecycle/renewal, B2B Assignment Guard and Continuous Compliance. None of those projections may silently upgrade the evidence state.
