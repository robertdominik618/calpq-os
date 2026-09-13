# CALPQ Document Intake Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0009-A`

## Purpose

Define how documents enter CALPQ without confusing transport, storage, extraction, user correction, verification, evidence, or authorization.

## Intake channels

Supported intake sources may include camera capture, scan, file/PDF upload, email attachment, share sheet, URL import, registry/provider import, and future adapters.

A channel only describes how bytes entered the system. It MUST NOT establish legal validity or trust.

## DocumentIntakeRecord

Each intake creates an immutable intake record containing at least:
- intake ID;
- subject or organization context when known;
- source channel;
- received-at instant;
- original artifact reference;
- media type and size;
- content hash;
- uploader/source provenance;
- security classification;
- processing state.

## Processing states

`RECEIVED | QUARANTINED | ACCEPTED_FOR_PROCESSING | EXTRACTION_PENDING | REVIEW_PENDING | ARCHIVED | REJECTED`

Processing state is operational only. `ARCHIVED` or `ACCEPTED_FOR_PROCESSING` MUST NOT imply that the document is verified or that any credential exists.

## Non-authority invariant

Document intake MUST NOT directly create or mutate `AuthorizationGrant`, `EligibilityAssessment`, `RecognitionDecision`, or VERIFIED evidence.
