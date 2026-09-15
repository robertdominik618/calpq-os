# CALPQ M04 Slice 03 — RequirementSet Versioning & Effective Dating

Status: `IMPLEMENTED / CI PENDING`
ID: `CALPQ-M04-S03-IMPL-0001`
Tracking issue: #87

## Reviewed lineage
- M04 admission merge: `d1251424127904a8a1ac0b8ad28cee91558408a5`.
- Slice 01 reviewed merge: `057f39ab18c663c5bb89a531d41d4095968cac6b`.
- Slice 02 reviewed/merged/post-merge-verified commit: `a1367a5e5b874ab0a891a5675f30377cff530431`.
- User authorization: `SCHVALUJI MERGE PR #86 A POKRAČOVÁNÍ NA M04 SLICE 03`.

## Objective
Add governed version/effective-date semantics around the exact existing M02 executable `RequirementSet` snapshot without rewriting eligibility aggregation or assessment authority.

## Owned capability
- immutable `GovernedRequirementSetVersion` around an exact `RequirementSet` instance;
- exact binding to one S02 `CredentialDefinition` identity/version;
- ordered one-to-one binding from executable `RequirementId` codes to S02 `RequirementDefinition` versions;
- explicit controlled `Jurisdiction` and `CatalogEffectivePeriod`;
- immutable source identity references only;
- explicit date+jurisdiction applicability evaluation;
- deterministic `SELECTED`, `NOT_FOUND`, or `AMBIGUOUS_REVIEW_REQUIRED` selection semantics;
- historical version preservation without latest/current inference.

## Compatibility boundary
The M02 `RequirementSet`, `RequirementGroup`, aggregation functions and `EligibilityAssessment` implementation are not modified. `toExecutableRequirementSet()` returns the exact wrapped runtime object. S03 never recomputes satisfaction or eligibility.

## Effective-selection rule
A caller must provide exact RequirementSet identity, CredentialDefinition identity, controlled jurisdiction and `DateOnly`. Selection is fail-closed:
- zero matching effective versions => `NOT_FOUND`;
- one => `SELECTED`;
- more than one => `AMBIGUOUS_REVIEW_REQUIRED` with no selected version.

Version strings are exposed only as deterministic ambiguity evidence and are never ranked as latest/highest/preferred.

## Source boundary
S03 preserves immutable `SourceId` references. Full `SourceReference` / `ProvenanceEnvelope` binding and validation remain Slice 05 authority.

## S01 regression-gate maintenance
The original S01 shell runner applied its later-slice source grep to the whole `packages/core/src/catalog` directory. That was correct while S01 was the only admitted catalog source but would falsely reject explicitly authorized S03 code. This slice scopes the existing S01 guards to `activity-profession-catalog.ts` only. Its 32 runtime scenarios and production invariant remain unchanged; no S01 semantic guard is weakened.

## Explicit non-goals
No S04 QualificationPath/path selection; no S05 full provenance validation; no S06 equivalence/recognition decision; no S07 Gap Navigator; no evidence verification/promotion; no CredentialArtifact ingestion; no AuthorizationGrant; no provider/UI/AI authority; no ambient time/randomness.

## Required verification
Exactly 34 runtime scenarios, strict TypeScript immutability proof, exact reviewed S02 ancestry, dedicated workflow, S01/S02/FV11/M04 admission/readiness/architecture regressions, and a fully green PR CI matrix before exit evidence is packaged.
