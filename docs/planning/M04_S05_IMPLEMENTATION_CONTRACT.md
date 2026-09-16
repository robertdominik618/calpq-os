# CALPQ M04 Slice 05 — Catalog Source & Provenance Binding

Status: `IMPLEMENTED / CI PENDING`
ID: `CALPQ-M04-S05-IMPL-0001`
Tracking issue: #92

## Reviewed lineage
- M04 admission merge: `d1251424127904a8a1ac0b8ad28cee91558408a5`.
- Slice 04 reviewed/merged/post-merge-verified commit: `9c5dbc0b70df6416897b9e83dc5e3327078ed570`.
- User authorization: `SCHVALUJI MERGE PR #91 A POKRAČOVÁNÍ NA M04 SLICE 05`.

## Objective
Bind the SourceId identities already carried by governed S01-S04 catalog/path objects to exact existing SourceReference snapshots and an exact existing ProvenanceEnvelope without creating, promoting or reinterpreting source/evidence truth.

## Owned capability
- `CatalogProvenanceBinding` supports ActivityDefinition, ProfessionDefinition, CredentialDefinition, RequirementDefinition, GovernedRequirementSetVersion and QualificationPathDefinition.
- QualificationPath binding includes root and step SourceId identities.
- Binding requires exactly one SourceReference snapshot per required SourceId.
- Missing, extra and duplicate sources fail closed.
- ProvenanceEnvelope sources must exactly match the bound source snapshots, including source version and all material source metadata.
- Catalog provenance is subject-free and evidence-free.
- Provenance evaluation cannot predate any bound source retrieval instant.
- Binding serialization is deterministic and historical bindings remain immutable.

## Verification-state boundary
S05 preserves the existing SourceReference verification state exactly. `allSourcesVerified()` and `requiresSourceReview()` are read-only predicates. S05 never creates VerificationState, promotes a source to VERIFIED or treats a non-verified source as verified.

## Source applicability boundary
S05 does not infer legal applicability from source jurisdiction, source type, source dates or authority. In particular, a supranational source may ground a state catalog rule. Legal/source hierarchy interpretation remains governed elsewhere; S05 records exact source snapshots only.

## Explicit non-goals
No S06 equivalence/recognition decision; no S07 Gap Navigator; no eligibility recomputation; no evidence verification/promotion; no CredentialArtifact ingestion; no AuthorizationGrant; no provider sync; no UI truth; no AI authority; no ambient current time/randomness.

## Required evidence
- exactly 42 mandatory runtime scenarios;
- strict TypeScript immutability/control proof;
- exact reviewed S04 ancestry;
- S01-S04, FV03 and FV11 direct runtime regressions;
- M04 admission/readiness and architecture regressions;
- dedicated workflow and durable exit evidence after green CI.

Slice 05 is implemented for executable verification only. Merge remains a separate governed action.
