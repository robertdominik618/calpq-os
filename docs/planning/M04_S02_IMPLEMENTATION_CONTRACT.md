# CALPQ M04 Slice 02 — Credential & Requirement Catalog Model

Status: `COMPLETED / VERIFIED / READY FOR REVIEW`
ID: `CALPQ-M04-S02-IMPL-0001`
Tracking issue: #85
PR: #86

## Reviewed lineage
- M04 admission merge: `d1251424127904a8a1ac0b8ad28cee91558408a5`.
- Slice 01 reviewed/merged/post-merge-verified commit: `057f39ab18c663c5bb89a531d41d4095968cac6b`.
- User authorization: `SCHVALUJI MERGE PR #83 A POKRAČOVÁNÍ NA M04 SLICE 02`.
- Verified implementation head: `b0db0587deadf98a2a8f06bb03661bea9d530528`.

## Objective
Implement the canonical governed catalog definitions for credential classes and atomic requirements without moving RequirementSet selection, eligibility, evidence verification or authorization authority into the catalog.

## Owned capability
- `CredentialDefinition`: stable CALPQ CredentialDefinitionId + explicit VersionId + controlled machine code + descriptive metadata + Jurisdiction + explicit CatalogEffectivePeriod + SourceId references.
- `RequirementDefinition`: distinct stable CALPQ RequirementDefinitionId + explicit VersionId + controlled machine code + descriptive metadata + Jurisdiction + explicit CatalogEffectivePeriod + SourceId references.
- immutable/deterministic representation and historical version preservation.

A CredentialDefinition describes a credential or authorization class. It is never a person's CredentialArtifact, evidence record or AuthorizationGrant.
A RequirementDefinition describes governed atomic requirement knowledge. It carries no satisfied/outcome/evidence/eligibility state.

## Identity and code rule
The UUIDv7 CALPQ identity is primary and stable. Machine `code` is a controlled secondary semantic code and never replaces primary identity. Labels/aliases are presentation metadata and never executable rule identity.

## Source boundary
S02 records immutable SourceId references only. Full SourceReference/ProvenanceEnvelope binding and provenance validation remain Slice 05 authority.

## Verification result
On implementation head `b0db0587deadf98a2a8f06bb03661bea9d530528`:
- dedicated M04 S02 workflow #2 = SUCCESS;
- exactly 32/32 mandatory runtime scenarios PASS;
- fail/skipped/todo = 0/0/0;
- strict TypeScript semantic-ID/immutability proof PASS;
- exact reviewed S01 ancestry PASS;
- S01/Core/M02/M04 governance regressions PASS;
- complete observed PR CI matrix: 22/22 SUCCESS;
- hard blockers: 0;
- remediation: none;
- mandatory tests waived/deferred: none.

## Explicit non-goals retained
No RequirementSet version/effective selection (S03); no QualificationPath (S04); no full provenance binding (S05); no equivalence/recognition decisions (S06); no Gap Navigator (S07); no eligibility recomputation; no evidence verification/promotion; no AuthorizationGrant; no provider sync; no UI logic; no AI authority; no ambient time/randomness.

Slice 02 is ready for review only. Merge and Slice 03 start require separate governed approval and post-merge verification.
