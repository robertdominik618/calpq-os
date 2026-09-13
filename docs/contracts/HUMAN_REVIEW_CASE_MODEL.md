# CALPQ Human Review Case Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0008-D`

## Purpose

Define the formal review workflow for cases that cannot be safely resolved by deterministic Core alone.

## HumanReviewCase

Required fields:
- case_id;
- source_object_ids;
- case_type;
- subject_or_organization_id;
- jurisdiction;
- severity and urgency;
- assigned_role / assignee reference;
- opened_at;
- due_at where applicable;
- status;
- facts and disputed/unknown points;
- evidence references;
- required decision or resolution question;
- provenance and audit trail.

## Case status

- OPEN;
- TRIAGED;
- IN_REVIEW;
- WAITING_EVIDENCE;
- WAITING_EXTERNAL;
- RESOLVED;
- CLOSED;
- REOPENED;
- SUPERSEDED.

## Review boundary

A case MAY be created automatically from `REVIEW_REQUIRED`, `INDETERMINATE`, an unverified regulatory change, conflicting evidence, recognition ambiguity or a policy-defined high-risk condition.

AI/OCR MAY summarize, classify or propose next questions. They MUST NOT silently resolve the case or promote unverified facts to authoritative status.

## Assignment and segregation

The case records who reviewed it and under which role/authority. Where policy requires segregation of duties, the same actor MUST NOT both originate and independently approve the authoritative resolution.

## Reopen rule

A materially new source fact, evidence item or rule version MAY reopen a previously resolved/closed case while preserving the prior resolution history.
