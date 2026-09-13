# CALPQ Subject Profile & Professional Passport

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0005-A`

## Purpose

Define the subject-centric projection that answers what a person or organization has, what is verified, what those facts enable, what is expiring, and what remains unresolved.

## SubjectProfile

A `SubjectProfile` identifies the subject and references facts about that subject without turning the profile itself into an authoritative legal decision.

Required concepts:
- stable CALPQ subject ID;
- subject kind: PERSON | ORGANIZATION;
- assertions with provenance and verification state;
- linked credential artifacts;
- linked authorization grants;
- linked eligibility assessments;
- linked recognition decisions;
- lifecycle obligations and deadlines;
- audit history.

Sensitive or inferred attributes must not be copied into unrelated projections merely for convenience.

## ProfessionalPassport

`ProfessionalPassport` is a read model, not a source of truth. It projects authoritative and non-authoritative source records into one coherent view.

Each card or entry must retain at least:
- source object ID;
- type;
- status;
- verification state;
- effective/expiry information where applicable;
- provenance/source summary;
- last evaluated rule/catalog version where applicable;
- whether human review is required.

## State separation

The passport MUST distinguish:
- document status;
- evidence verification status;
- eligibility status;
- authorization status;
- temporal validity;
- renewal/lifecycle status.

These states MUST NOT collapse into one generic green/red badge.

## Projection rule

A passport entry may summarize but MUST NOT create or mutate `AuthorizationGrant`, `EligibilityAssessment`, `RecognitionDecision`, or authoritative evidence.
