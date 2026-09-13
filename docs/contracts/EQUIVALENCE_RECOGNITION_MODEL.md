# CALPQ Equivalence & Recognition Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0004-C`

## Purpose

Model when one qualification, credential, experience record or prior decision may satisfy, substitute or reduce another requirement without treating similarity as legal equivalence.

## Core distinction

`equivalence` describes a rule or claim about substitutability.  
`recognition` is a jurisdiction-specific authoritative process/decision.  
Neither concept is identical to eligibility or authorization.

## EquivalenceRule

Required fields:

- `equivalence_rule_id`
- source object/type and version
- target requirement/credential and version
- effect type
- jurisdiction
- effective_from/effective_to
- conditions
- source authority and provenance
- verification status

Effect types:

- `FULL_SUBSTITUTION`
- `PARTIAL_SUBSTITUTION`
- `REQUIREMENT_EXEMPTION`
- `CREDIT_OR_REDUCTION`
- `RECOGNITION_ROUTE_ONLY`
- `NO_EQUIVALENCE`
- `REVIEW_REQUIRED`

## RecognitionRoute

Recognition routes are modeled generically, with optional jurisdiction-specific classifications. Common route kinds include:

- `DOMESTIC_EQUIVALENCE`
- `AUTOMATIC_RECOGNITION`
- `GENERAL_RECOGNITION`
- `PROFESSIONAL_EXPERIENCE_ROUTE`
- `SPECIFIC_LEGISLATION_ROUTE`
- `INDIVIDUAL_ASSESSMENT`
- `NONE_REQUIRED`
- `UNKNOWN_REVIEW_REQUIRED`

A route describes procedure, not a positive decision.

## RecognitionDecision

An authoritative recognition decision is immutable evidence with:

- decision ID;
- authority;
- subject;
- source qualification/credential;
- recognized target/scope;
- jurisdiction;
- effective dates;
- conditions/limitations;
- decision provenance.

## Invariants

1. Similar title/name never implies equivalence.
2. External framework level equality does not by itself imply professional recognition.
3. Recognition route availability does not imply a positive recognition decision.
4. Recognition/equivalence effects apply only to the exact jurisdiction, scope and effective dates encoded by the rule/decision.
5. Partial equivalence must preserve all remaining requirements explicitly.
6. AI may suggest candidate mappings but cannot create a verified equivalence or recognition decision.
