# M04 Slice 10 — Mandatory Integration Test Index

Status: `48 MANDATORY RUNTIME SCENARIOS`

The fixtures are synthetic integration data only and do not encode current legal requirements.

## A — Domestic direct qualification integration

| ID | Evidence |
|---|---|
| M04S10-01 | Activity and Profession identities remain bound to the selected path. |
| M04S10-02 | Target credential identity and version remain exact. |
| M04S10-03 | Governed RequirementSet preserves executable requirement order. |
| M04S10-04 | QualificationPath step binds the exact governed set version. |
| M04S10-05 | Representative S01–S05 provenance target kinds compose correctly. |
| M04S10-06 | Exact verified source snapshots remain bound. |
| M04S10-07 | Mixed FV11 atomic results remain NOT_SATISFIED. |
| M04S10-08 | Gap Navigator preserves satisfied vs missing requirements. |
| M04S10-09 | Mixed path never becomes falsely complete. |
| M04S10-10 | Explanation binds exact gap and path version. |
| M04S10-11 | ACTION_REQUIRED can be fully explained without promotion. |
| M04S10-12 | Source/rule/evidence graph linkage survives integration. |

## B — Recognition procedure remains governed

| ID | Evidence |
|---|---|
| M04S10-13 | General RecognitionRoute reports ROUTE_AVAILABLE only. |
| M04S10-14 | Request and authority-decision steps remain explicit. |
| M04S10-15 | Route availability becomes RECOGNITION_POSSIBLE, never satisfied. |
| M04S10-16 | Route availability never marks the path complete. |
| M04S10-17 | Recognition-route provenance survives into gap rule references. |
| M04S10-18 | Authority-decision step remains prerequisite-blocked. |
| M04S10-19 | UNKNOWN_REVIEW_REQUIRED remains REVIEW_REQUIRED. |
| M04S10-20 | Review-required route propagates into S07. |
| M04S10-21 | S08 preserves recognition review state. |
| M04S10-22 | Route serialization contains no decision/grant authority. |
| M04S10-23 | Explainability never collapses procedure into readiness. |
| M04S10-24 | Recognition-chain serialization is deterministic. |

## C — Historical transition / no hindsight

| ID | Evidence |
|---|---|
| M04S10-25 | Old effective date selects old path. |
| M04S10-26 | Exact old path version is preserved. |
| M04S10-27 | Retroactively effective but not-yet-known version returns NOT_YET_KNOWN. |
| M04S10-28 | Same version becomes selectable only after knowledge cutoff. |
| M04S10-29 | Applicable candidates and known candidates remain distinct. |
| M04S10-30 | Exact old version never falls forward into a later period. |
| M04S10-31 | Replay returns full stored S07/S08 snapshot. |
| M04S10-32 | Stored gap object identity is preserved. |
| M04S10-33 | Stored explanation object identity is preserved. |
| M04S10-34 | Historical serialization preserves old path version. |
| M04S10-35 | No eligible snapshot means catalog-version-only replay. |
| M04S10-36 | Historical objects remain frozen/nonrewritable. |

## D — Fail-closed boundaries

| ID | Evidence |
|---|---|
| M04S10-37 | Overlapping known versions fail closed to ambiguity. |
| M04S10-38 | Exact requested version resolves overlap without ranking. |
| M04S10-39 | Wrong jurisdiction never reuses a CZ path. |
| M04S10-40 | Duplicate historical bindings are rejected. |
| M04S10-41 | Duplicate exact FV11 assessments are rejected. |
| M04S10-42 | Equally-latest gap snapshots fail closed. |
| M04S10-43 | Equally-latest explanation snapshots fail closed. |
| M04S10-44 | Unverified path source forces review-required gap state. |
| M04S10-45 | Missing material explanation source becomes indeterminate. |
| M04S10-46 | Path comparison stays advisory and selects no winner. |
| M04S10-47 | Integrated-chain serialization is deterministic. |
| M04S10-48 | Integrated evidence creates no authorization/UI/NBA truth. |

## Compile-time proof

`packages/core/test/m04-s10-types.compile.ts` proves readonly boundaries for QualificationPathDefinition, CatalogProvenanceBinding, GapNavigatorEvaluation, CatalogQueryExplanationGraph, HistoricalCatalogVersionQuery and HistoricalSnapshotReplay.
