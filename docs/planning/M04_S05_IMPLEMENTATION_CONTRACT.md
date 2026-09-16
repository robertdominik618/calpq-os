# CALPQ M04 Slice 05 — Catalog Source & Provenance Binding

Status: `COMPLETED / VERIFIED / READY FOR REVIEW`
ID: `CALPQ-M04-S05-IMPL-0001`
Tracking issue: #92
PR: #93

## Reviewed lineage
- M04 admission merge: `d1251424127904a8a1ac0b8ad28cee91558408a5`.
- Slice 04 reviewed/merged/post-merge-verified commit: `9c5dbc0b70df6416897b9e83dc5e3327078ed570`.
- User authorization: `SCHVALUJI MERGE PR #91 A POKRAČOVÁNÍ NA M04 SLICE 05`.
- Initial source commit: `cf09abb7eef63ba72bfccb3d6ac3065b6b6167ad`.
- Verified implementation/evidence-package head: `5274cccfd451779e18ead85b76ada511127265bf`.

## Objective
Bind SourceId identities already carried by governed S01-S04 catalog/path objects to exact existing SourceReference snapshots and an exact existing ProvenanceEnvelope without creating, promoting or reinterpreting source/evidence truth.

## Owned capability
- `CatalogProvenanceBinding` supports ActivityDefinition, ProfessionDefinition, CredentialDefinition, RequirementDefinition, GovernedRequirementSetVersion and QualificationPathDefinition.
- QualificationPath binding includes root and step SourceId identities.
- Binding requires exactly one SourceReference snapshot per required SourceId.
- Missing, extra and duplicate sources fail closed.
- ProvenanceEnvelope sources must exactly match bound source snapshots, including source version and all material source metadata.
- Catalog provenance is subject-free and evidence-free.
- Provenance evaluation cannot predate any bound source retrieval instant.
- Binding serialization is deterministic and historical bindings remain immutable.

## Verification-state boundary
S05 preserves the existing SourceReference verification state exactly. `allSourcesVerified()` and `requiresSourceReview()` are read-only predicates. S05 never creates VerificationState, promotes a source to VERIFIED or treats a non-verified source as verified.

## Source applicability boundary
S05 does not infer legal applicability from source jurisdiction, source type, source dates or authority. A supranational source may ground a state catalog rule; source hierarchy interpretation is outside S05.

## Verification result
On implementation head `5274cccfd451779e18ead85b76ada511127265bf`:
- dedicated M04 S05 workflow #2 = SUCCESS;
- exactly 42/42 mandatory runtime scenarios PASS;
- fail/skipped/todo = 0/0/0;
- strict TypeScript immutability/control proof PASS;
- exact reviewed S04 ancestry PASS;
- S01-S04, FV03 and FV11 regressions PASS;
- complete observed PR CI matrix: 24/24 SUCCESS;
- hard blockers: 0;
- remediation: none;
- mandatory tests waived/deferred: none.

## Explicit non-goals retained
No S06 equivalence/recognition decision; no S07 Gap Navigator; no eligibility recomputation; no evidence verification/promotion; no CredentialArtifact ingestion; no AuthorizationGrant; no provider sync; no UI truth; no AI authority; no ambient current time/randomness.

Slice 05 is ready for review only. Merge and Slice 06 start require separate governed approval and post-merge verification.
