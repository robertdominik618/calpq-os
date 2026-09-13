# CALPQ Regulatory Change Impact Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0007-D`

## Purpose

Define how a verified regulatory-source change is converted into bounded CALPQ impact without allowing AI, OCR, or an unverified source update to silently change legal conclusions.

## RegulatoryChange

A regulatory change record must retain:
- authority/source identifier;
- jurisdiction/domain;
- old source/rule version;
- new source/rule version;
- publication/retrieval dates;
- effective_from / effective_to where applicable;
- verification state;
- changed provisions or rule units;
- provenance;
- reviewer/approval evidence when required.

## Source-state boundary

Only a source/rule version satisfying Regulatory Source Governance may enter deterministic production re-evaluation as verified regulatory truth.

`UNVERIFIED` or `STALE/REVIEW_REQUIRED` change material may create review tasks and impact candidates, but it MUST NOT silently downgrade or upgrade legal status.

AI may assist with diffing, classification, candidate mappings, and explanation. AI alone may not mark a legal rule change VERIFIED.

## Change classification

At minimum:
- NO_MATERIAL_EFFECT;
- CLARIFICATION;
- REQUIREMENT_ADDED;
- REQUIREMENT_REMOVED;
- REQUIREMENT_CHANGED;
- SCOPE_CHANGED;
- EFFECTIVE_DATE_CHANGED;
- AUTHORITY_OR_PROCEDURE_CHANGED;
- TRANSITIONAL_RULE_CHANGED;
- REVIEW_REQUIRED.

## Temporal application

The engine must distinguish:
- publication date;
- verification date;
- effective date;
- evaluation instant.

A newly published future rule must not be applied before its effective date unless an explicit transitional rule requires preparatory action.

## Impact output

Regulatory change analysis produces:
- impacted RequirementSet versions;
- impacted QualificationPath/Equivalence rules;
- affected subject/passport/assignment candidates;
- required re-evaluation mode;
- future deadlines/actions;
- explanation path back to the exact changed source version.

## Historical rule

Past decisions remain reproducible under the rule/source versions used at the time. Re-evaluation creates a new decision snapshot; it never rewrites the old one.
