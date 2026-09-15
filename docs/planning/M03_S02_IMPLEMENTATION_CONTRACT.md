# CALPQ M03 Slice 02 Implementation Contract — Professional Passport Summary & Credential Grouping

Status: `IMPLEMENTED / VERIFICATION PENDING`
ID: `CALPQ-M03-S02-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 01 merge commit `0f25c2637e774dede94749019cfe3f3231610c40`.
Source-boundary commit: `d98e74b1f26c0f11e703ce787706d3c45a96eb61`.

## Scope
Slice 02 composes one Professional Passport summary for an explicit Subject from zero or more governed `ProfessionalPassportProjection` instances.

Implemented behavior:
- explicit Subject even when the Passport has zero projections;
- all source projections must belong to the same Subject;
- duplicate assessment projections are rejected;
- grouping key is stable `credentialDefinitionId` only;
- all CredentialDefinition versions remain explicit inside each group;
- every assessment remains explicit and preserves its CredentialDefinition version, RequirementSet identity/version, eligibility outcome and evaluation/projection instants;
- four eligibility outcomes are counted only as presentation summaries of already-governed results;
- evidence/verified-evidence/derived-information counts reuse one framework-neutral `PassportReadMetrics` implementation shared with Slice 01;
- serialization and grouping order are deterministic and independent of input order;
- empty Passport summary is a supported read state.

## Authority boundary
Slice 02 does not choose or infer a `current`, `latest`, `valid` or otherwise authoritative credential. A group may contain several versions and assessment snapshots simultaneously. The read model never issues or implies `AuthorizationGrant` and keeps `authorizationAuthority = false` at summary, group and assessment levels.

## Ownership boundary
M03 owns only read composition/presentation semantics here. Slice 02 does not own Credential Catalog rules, QualificationPath logic, lifecycle truth, evidence verification, eligibility evaluation or provider integration.

## Recovery / migration
No schema or data migration. The change is additive except for an internal Slice 01 refactor to reuse `PassportReadMetrics`; Slice 01 behavior remains covered by its complete regression gate.

## Verification target
- exactly 22 mandatory runtime scenarios;
- strict TypeScript immutability and controlled-type proof;
- M03 Slice 01 predecessor regression;
- FV-12 Professional Passport regression;
- M03 admission and architecture guards;
- global CALPQ regression workflows.

No mandatory evidence may be waived or deferred.
