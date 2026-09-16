# CALPQ M04 Slice 09 — Test Index

Status: `IMPLEMENTATION IN PROGRESS / 48 MANDATORY RUNTIME SCENARIOS DEFINED`  
ID: `CALPQ-M04-S09-TEST-0001`  
Tracking issue: #102

## Historical version query — scenarios 01–24

The runtime matrix proves all six S05 provenance target kinds can be queried historically, exact kind/id/version identity, jurisdiction and effective-date filtering, `NOT_FOUND` versus `NOT_YET_KNOWN`, exact requested-version behavior, no hindsight substitution, overlapping-version ambiguity, duplicate rejection, explicit operation times, preservation of source-review status, canonical version metadata, immutability and deterministic serialization.

## Snapshot replay — scenarios 25–48

The runtime matrix proves unresolved/non-path/catalog-only behavior, exact S07 gap replay, exact S08 explanation replay, subject/path-version/effective-date matching, `asKnownAt` cutoff enforcement, latest eligible snapshot selection, fail-closed ties, duplicate snapshot rejection, explicit replay time, runtime immutability, exact object identity and protection of prior replay results from later snapshots.

## Compile-time proof

The strict TypeScript build now includes both `m04-s08-types.compile.ts` and `m04-s09-types.compile.ts`. S09 proof covers readonly collections, immutable selected binding, controlled state unions and semantic separation of HistoricalCatalogQueryId from HistoricalReplayId.

## Boundary proof

The dedicated runner rejects ambient time/randomness, framework/provider/AI dependencies, eligibility/gap/explanation recomputation, evidence/source/recognition authority creation, AuthorizationGrant, NextBestAction and path-selection ownership. It also runs direct S01–S08/FV03/FV11 regressions plus M04 admission/readiness/architecture guards.
