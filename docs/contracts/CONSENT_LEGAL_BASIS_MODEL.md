# CALPQ Consent & Legal Basis Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-CONTRACT-CONSENT-LEGAL-BASIS-0001`

## Purpose
Separate consent from other legal bases and make every data-access decision explainable and revocable where applicable.

## LegalBasisRecord
Required concepts:
- basis type;
- applicable purpose;
- jurisdiction;
- source/policy reference;
- effective interval;
- subject/requester scope;
- verification/provenance state.

Consent is one possible basis, not the universal basis for processing.

## ConsentGrant
A consent grant must be:
- explicit for the covered purpose;
- granular to claims/data categories;
- attributable to the subject or valid representative;
- time-bounded where appropriate;
- versioned;
- revocable;
- recorded with provenance.

Consent MUST NOT silently expand when a requester changes purpose, requested claims or recipient.

## Revocation
Revocation blocks future reliance on that consent from the effective revocation time. It MUST NOT rewrite historical decisions that were lawful when made.

## Representation
Consent given by a representative requires separately validated representation/delegation authority and never implies broader professional or organizational authority.
