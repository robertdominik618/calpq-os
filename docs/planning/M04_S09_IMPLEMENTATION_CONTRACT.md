# CALPQ M04 Slice 09 — Historical-Version Query & Replay Semantics

Status: `IMPLEMENTATION AUTHORIZED / IN PROGRESS`  
ID: `CALPQ-M04-S09-CONTRACT-0001`  
Tracking issue: #102

## 1. Reviewed lineage

Slice 09 is implemented only from reviewed Slice 08 merge `5eacb823b0b54a1717ea7f0632ff38fb45d72c49` on branch `impl/m04-s09-historical-version-replay`.

The governing M04 execution package defines S09 as **Historical-version query and replay semantics**. Existing M01/M04 invariants require historical graph versions to remain reproducible and prevent external or current updates from silently rewriting historical answers.

## 2. Bitemporal model

S09 distinguishes two independent clocks:

- `effectiveOn` — valid time: when the catalog/path/requirement version legally or semantically applied;
- `asKnownAt` — knowledge/system time: which exact governed version and source/provenance snapshot CALPQ had actually incorporated by that instant.

`executedAt` / `replayedAt` are explicit operation instants and never replace either historical dimension.

This prevents hindsight bias. A version may be effective for an earlier period but still return `NOT_YET_KNOWN` if its governed provenance had not been incorporated by the requested knowledge cutoff.

## 3. HistoricalCatalogVersionQuery

Historical queries operate over immutable `CatalogProvenanceBinding` candidates and support every S05 provenance target kind:

- ActivityDefinition;
- ProfessionDefinition;
- CredentialDefinition;
- RequirementDefinition;
- GovernedRequirementSetVersion;
- QualificationPathDefinition.

Selection requires exact stable target kind/id, exact jurisdiction, `effectiveOn`, optional exact requested version and `asKnownAt` provenance/source availability.

States:

- `SELECTED`;
- `NOT_FOUND`;
- `NOT_YET_KNOWN`;
- `AMBIGUOUS_REVIEW_REQUIRED`.

Overlapping known versions fail closed to review rather than guessing by semantic version strings or insertion order. An optional requested version never falls forward to a newer/current version.

## 4. HistoricalSnapshotReplay

Replay is retrieval of immutable historical outputs, **not recomputation**.

For a selected historical QualificationPath version, replay may select:

1. the latest exact stored S07 `GapNavigatorEvaluation` at or before `asKnownAt`, matching subject, path id/version, jurisdiction and `effectiveOn`;
2. the latest exact stored S08 `CatalogQueryExplanationGraph` at or before `asKnownAt`, bound to the selected GapEvaluationId and same path/subject/date context.

Replay states:

- `VERSION_QUERY_UNRESOLVED`;
- `CATALOG_VERSION_ONLY`;
- `GAP_SNAPSHOT_REPLAYED`;
- `FULL_SNAPSHOT_REPLAYED`;
- `AMBIGUOUS_REVIEW_REQUIRED`.

If two distinct snapshots share the latest eligible evaluation instant, S09 fails closed to review instead of choosing by ID or input order.

## 5. Authority boundaries

S09 MUST NOT:

- call `EligibilityAssessment.evaluate`;
- call `GapNavigatorEvaluation.evaluate`;
- call `CatalogQueryExplanationGraph.build`;
- construct or promote SourceReference/EvidenceReference verification state;
- recalculate S06 recognition/equivalence outcomes;
- mutate any historical catalog/path/gap/explanation input;
- use current time or randomness;
- select, rank or recommend a qualification path;
- create Next Best Action or AuthorizationGrant authority;
- ingest provider payloads or own UI truth.

## 6. Determinism and history

- all operation times are explicit values;
- candidate collections reject duplicate semantic identities;
- version lists and replay candidate IDs are canonical;
- selected bindings retain exact S05 source snapshots;
- replay returns original S07/S08 objects and serializations rather than reconstructed substitutes;
- future catalog/source updates cannot mutate prior query/replay objects.

## 7. Validation requirement

Completion requires exactly 48 mandatory runtime scenarios, strict compile-time readonly/semantic-ID proof, reviewed-S08 ancestry proof, direct S01–S08/FV03/FV11 regressions, M04 admission/readiness/architecture gates, dedicated CI and durable exit evidence.

## 8. Merge boundary

A green S09 PR establishes review readiness only. Merge requires a fresh explicit user authorization.
