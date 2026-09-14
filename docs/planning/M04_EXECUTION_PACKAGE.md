# CALPQ M04 Execution Package — Catalog, Qualification Paths & Gap Intelligence

Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`

## Objective
Implement governed knowledge structures that answer what a person needs, what they already satisfy, what is missing and why.

## Delivery slices
1. Activity and Profession catalog model.
2. Credential and Requirement catalog model.
3. RequirementSet versioning/effective dating.
4. QualificationPath graph and path selection.
5. Source/provenance binding for catalog nodes and requirements.
6. Equivalence and recognition review workflow.
7. Gap Navigator evaluation over current evidence/eligibility outputs.
8. Explainability and reason/source linkage.
9. Historical-version query and replay semantics.
10. M04 integration evidence against representative target-profession scenarios.

## Ownership
M04 owns governed catalog knowledge, versioned requirements, path topology, equivalence/recognition workflow state and gap computation. It does not verify evidence, ingest provider payloads, issue authorization or own UI truth.

## Definition of Done
- every active requirement/path is versioned and source-linked;
- historical paths remain reproducible after rule changes;
- Gap Navigator distinguishes missing, not satisfied, indeterminate and review-required states;
- equivalence/recognition never auto-resolves beyond governed policy;
- catalog queries are jurisdiction/effective-date aware;
- path selection explains why each step is required.

## Stop conditions
Stop if current catalog changes rewrite historical decisions, free-form AI output becomes a requirement source, equivalence becomes automatic without governed basis, or path logic duplicates eligibility authority.