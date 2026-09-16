# M04 Slice 10 — Integration Evidence Contract

Status: `IMPLEMENTATION AUTHORIZED / EVIDENCE-ONLY SLICE`

Tracking issue: #104.
Reviewed predecessor merge: `160ed37e6e1e7264d1dd9843906c098758dbc7bb` (M04 Slice 09).

## Purpose

Slice 10 closes M04 by proving that the already-admitted S01–S09 semantics compose correctly across representative target-profession journeys. It is an integration/evidence slice, not a new catalog, eligibility, recognition, replay, recommendation or authorization engine.

All representative professions, credentials, requirements, sources and dates in the S10 runtime matrix are synthetic test fixtures. They are not statements of current Czech or EU law and must not be reused as production legal content.

## Representative scenario families

### A. Domestic direct qualification
A synthetic electrical-profession fixture binds ActivityDefinition, ProfessionDefinition, CredentialDefinition, RequirementDefinition, GovernedRequirementSetVersion, QualificationPathDefinition and exact CatalogProvenanceBinding snapshots. An FV11 assessment with one satisfied and one unsatisfied atomic requirement must remain NOT_SATISFIED. S07 must preserve the mixed state and S08 must explain it without promoting it to readiness or review.

### B. Cross-border recognition procedure
A synthetic foreign credential enters a governed RecognitionRoute. Route availability means that a procedure exists; it is not a RecognitionDecision and cannot satisfy the target by itself. UNKNOWN_REVIEW_REQUIRED must propagate to REVIEW_REQUIRED. Prerequisites, reason/source/rule linkage and non-completion must remain explicit.

### C. Historical version transition
Two non-overlapping path generations use distinct effective periods and source/provenance knowledge times. `effectiveOn` and `asKnownAt` remain separate. A later-known path cannot be used before its retrieval/evaluation cutoff. HistoricalSnapshotReplay must return the exact stored S07/S08 objects and never recompute history.

### D. Fail-closed integration boundaries
Overlapping known versions, duplicate candidates, duplicate exact assessments, equally-latest historical snapshots, missing explanation sources and unverified path sources must never be resolved by guessing. Ambiguity must remain review/indeterminate as governed by S01–S09. Path comparison remains advisory and selects no winner.

## Mandatory invariants

1. S10 introduces no production Core source file or production Core mutation.
2. Exact CALPQ semantic IDs and VersionId values survive the whole chain.
3. Jurisdiction and effective-date checks remain explicit.
4. Catalog provenance uses exact SourceReference snapshots.
5. FV11 remains the eligibility authority consumed by S07; S10 does not duplicate it.
6. RecognitionRoute never becomes RecognitionDecision implicitly.
7. S07 gap states are not changed by S08/S09.
8. S08 explainability links governed reasons, sources, evidence and rule references without new authority.
9. S09 preserves valid time (`effectiveOn`) separately from knowledge time (`asKnownAt`).
10. Historical replay returns stored object identity and excludes data after the knowledge cutoff.
11. Ambiguity fails closed; no heuristic/path ranking is introduced.
12. No AuthorizationGrant, NextBestAction, provider ingestion, UI truth, LLM/AI truth or ambient time/randomness enters S10.

## Evidence shape

- exactly 48 mandatory runtime integration tests;
- strict TypeScript readonly/immutability compile proof;
- exact ancestry from the reviewed S09 merge;
- no-production-Core-diff guard for S10;
- direct runtime regressions for M04 S01–S09 plus FV03 and FV11;
- M04 admission, M03–M08 execution readiness and architecture-boundary gates;
- dedicated GitHub Actions workflow.

## Exit boundary

Successful S10 evidence proves M04 integration readiness only. It does not authorize merge, M05 execution, production legal-content population or any new authority. The S10 PR remains open and unmerged until a fresh explicit user approval.
