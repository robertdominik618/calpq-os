# CALPQ M04 Slice 01 — Activity & Profession Catalog Model — Implementation Contract

Status: `IMPLEMENTED / VERIFIED / READY FOR REVIEW`
ID: `CALPQ-M04-S01-IMPL-0001`
Tracking issue: #82
PR: #83
Reviewed admission base: `d1251424127904a8a1ac0b8ad28cee91558408a5`
Verified implementation head: `5c8bbb95471fb05b35703e541766be65e91df0bc`

## Governance basis
M04 is formally admitted under `CALPQ-M04-ADMIT-0001`.
Slice 01 descends directly from reviewed / merged / post-merge-verified M04 admission commit `d1251424127904a8a1ac0b8ad28cee91558408a5`.

## Objective
Implement the first canonical M04 knowledge nodes without pulling later catalog/path/provenance authority forward.

## Implemented surface
- `ActivityDefinitionId` and `ProfessionDefinitionId` as distinct CALPQ UUIDv7 semantic identities;
- immutable `ActivityDefinition`;
- immutable `ProfessionDefinition`;
- explicit `VersionId` on every node;
- controlled `Jurisdiction`;
- explicit `CatalogEffectivePeriod` with caller-supplied `DateOnly` evaluation only;
- controlled regulatory statuses `UNREGULATED`, `REGULATED`, `PARTIALLY_REGULATED`, `UNKNOWN_REVIEW_REQUIRED`;
- stable source identity references using `SourceId` without full source/provenance resolution;
- immutable versioned `ExternalClassificationReference` for profession taxonomy references;
- controlled mapping relations `EXACT`, `BROADER`, `NARROWER`, `RELATED`, `CANDIDATE`;
- explicit mapping verification state, source identity and governed mapping timestamp;
- deterministic serialization.

## Invariants
1. Activity and profession are different domain types and different semantic ID types.
2. ESCO/ISCO or other external IDs never replace CALPQ primary identity.
3. Every node carries an explicit version, jurisdiction, effective period, regulatory status and at least one source identity reference.
4. Effective applicability can be evaluated only against an explicitly supplied `DateOnly`; no ambient/current time is used.
5. Historical node instances are immutable; a later version does not rewrite an earlier one.
6. `UNKNOWN_REVIEW_REQUIRED` remains explicit uncertainty and is never promoted to satisfaction/eligibility.
7. External `CANDIDATE` mappings are descriptive only and create no eligibility/equivalence/authorization decision.
8. Full `SourceReference` provenance validation is intentionally deferred to M04 Slice 05; Slice 01 preserves source IDs without pretending to validate source authority.

## Explicit non-scope
Slice 01 does not implement:
- Credential or Requirement catalog entities (S02);
- RequirementSet effective-version selection (S03);
- QualificationPath graph or path selection (S04);
- full source/provenance binding (S05);
- equivalence/recognition decisions (S06);
- Gap Navigator computation (S07);
- evidence verification or promotion;
- AuthorizationGrant;
- provider/import synchronization;
- UI/framework logic;
- AI authority;
- ambient time/randomness.

## Verified evidence
On implementation head `5c8bbb95471fb05b35703e541766be65e91df0bc`:
- exactly 32 mandatory runtime scenarios PASS;
- runtime fail/skipped/todo = 0/0/0;
- strict TypeScript compile-time proof PASS;
- exact M04 admission ancestry guard PASS;
- framework/provider/AI/ambient-time guard PASS;
- later-slice / AuthorizationGrant authority guard PASS;
- FV-01, FV-03, FV-11, M04 admission, M03-M08 readiness and architecture regressions PASS;
- 21/21 observed PR-triggered workflows SUCCESS;
- hard blockers = 0.

## Definition of Done
Satisfied for implementation/review readiness. Merge remains a separate governed action and requires fresh explicit approval.
