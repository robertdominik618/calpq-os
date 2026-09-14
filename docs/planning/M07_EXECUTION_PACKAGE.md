# CALPQ M07 Execution Package — Regulatory Intelligence & Radar

Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`

## Objective
Convert authoritative regulatory/source changes into governed impact analysis without allowing parsers or AI to decide legal applicability by themselves.

## Delivery slices
1. Authoritative source registry and source-classification policy.
2. Source snapshot/version ingestion.
3. Regulatory change event model.
4. Effective-date and supersession semantics.
5. Rule/RequirementSet impact linking.
6. Credential/path/subject/organization impact graph.
7. Human/legal review queue for ambiguous applicability.
8. Explainable affected-target resolution.
9. Action recommendation generation from governed impacts.
10. M07 integration evidence using amendment, delayed-effect and ambiguous-source scenarios.

## Ownership
M07 owns regulatory-source lineage, change-event representation, impact analysis and review workflow. It does not own final legal interpretation outside approved policy/review boundaries and does not rewrite prior historical decisions.

## Definition of Done
- every material change is traceable to source snapshot/version;
- effective dates and supersession are explicit;
- ambiguous applicability routes to review;
- impacts resolve to versioned rules/requirements and affected targets;
- notifications/actions explain source and reason;
- historical assessments remain reproducible as-was.

## Stop conditions
Stop if parser/AI output becomes legal applicability, undated source changes alter active requirements automatically, current law overwrites historical decisions, or source provenance is lost during normalization.