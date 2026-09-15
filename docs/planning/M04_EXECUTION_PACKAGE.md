# CALPQ M04 Execution Package — Catalog, Qualification Paths & Gap Intelligence

Status: `ADMITTED / IMPLEMENTATION AUTHORIZED`

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

## Admission
- Admission record: `docs/planning/M04_ADMISSION_RECORD.md`.
- Machine decision: `docs/planning/m04-admission-decision.json`.
- Transition: `CALPQ-M04-ADMIT-0001`.
- Reviewed predecessor: M03 merge `fa33edd4804b3534d2642dd044e5c2ee4f5bc5dd`.
- Authorized execution entry: `M04_SLICE_01_ACTIVITY_PROFESSION_CATALOG_MODEL`.
- The admission becomes execution-effective only after its admission PR is merged and post-merge CI is green.

## Definition of Done
- every active requirement/path is versioned and source-linked;
- historical paths remain reproducible after rule changes;
- Gap Navigator distinguishes missing, not satisfied, indeterminate and review-required states;
- equivalence/recognition never auto-resolves beyond governed policy;
- catalog queries are jurisdiction/effective-date aware;
- path selection explains why each step is required.

## Authority boundary
M04 must consume existing governed evidence/eligibility semantics rather than replacing them. It must not ingest raw provider payloads, verify or promote evidence, issue or infer AuthorizationGrant, treat free-form AI output as authoritative catalog/path truth, or rewrite historical catalog/path state. M05–M08 remain separately blocked pending their own admissions.

## Stop conditions
Stop if current catalog changes rewrite historical decisions, free-form AI output becomes a requirement source, equivalence becomes automatic without governed basis, path logic duplicates eligibility authority, or M04 starts performing provider ingestion/evidence-verification/authorization work owned elsewhere.
