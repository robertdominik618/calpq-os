# CALPQ Extraction Proposal & Review Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0009-C`

OCR, AI and parsers produce `ExtractionProposal` objects, never authoritative facts.

Each proposal retains parent artifact ID, engine/version, field/value, source location when known, confidence/uncertainty, timestamp and provenance.

Review states:
`PROPOSED | USER_CONFIRMED | USER_CORRECTED | REJECTED | HUMAN_REVIEW_REQUIRED`

A user-confirmed value is still a user assertion unless a separate verification step promotes it.

Corrections create a new reviewed revision; the original extraction remains auditable.

`OCR confidence`, `AI confidence`, parser success, checksum validity or user confirmation MUST NOT directly create `AuthorizationGrant`, `EligibilityAssessment`, `RecognitionDecision`, or VERIFIED evidence.
