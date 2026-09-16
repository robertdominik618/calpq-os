# CALPQ M04 Slice 04 — QualificationPath Graph & Path Selection

Status: `COMPLETED / VERIFIED`
ID: `CALPQ-M04-S04-IMPL-0001`
Tracking issue: #89

## Reviewed lineage
- M04 admission merge: `d1251424127904a8a1ac0b8ad28cee91558408a5`.
- Slice 01 merge: `057f39ab18c663c5bb89a531d41d4095968cac6b`.
- Slice 02 merge: `a1367a5e5b874ab0a891a5675f30377cff530431`.
- Slice 03 reviewed/merged/post-merge-verified merge: `62be074297dad3beca1cf53794fdca63c6ba8853`.
- User authorization: `SCHVALUJI MERGE PR #88 A POKRAČOVÁNÍ NA M04 SLICE 04`.

## Objective
Implement canonical governed QualificationPath topology and deterministic applicability selection without moving provenance validation, recognition/equivalence, Gap Navigator, evidence verification or authorization authority into Slice 04.

## Owned capability
- stable CALPQ UUIDv7 `QualificationPathId` and explicit immutable `VersionId`;
- exact target `CredentialDefinition` plus optional exact `ActivityDefinition` and `ProfessionDefinition`;
- exact controlled `Jurisdiction` and explicit `CatalogEffectivePeriod`;
- controlled path-step vocabulary from the M01 Qualification Path contract;
- prerequisite directed acyclic graph with unknown/self/cycle rejection;
- explicit alternative groups without subject-relative automatic resolution;
- exact S03 `GovernedRequirementSetVersion` binding for `SATISFY_REQUIREMENT_SET`;
- immutable `SourceId` references only;
- deterministic explicit target/date/jurisdiction path selection.

## Selection semantics
- zero applicable paths => `NOT_FOUND`;
- exactly one applicable path => `SELECTED`;
- multiple applicable distinct path identities => `MULTIPLE_APPLICABLE`;
- multiple applicable versions of the same path identity => `AMBIGUOUS_REVIEW_REQUIRED`.

Deterministic candidate ordering is serialization/evidence stability only. It is not ranking, recommendation, optimization or domain preference.

## Authority boundaries
Slice 04 does not:
- validate full `SourceReference` or `ProvenanceEnvelope` bindings (S05);
- decide equivalence/recognition (S06);
- compute subject-relative gaps or path-step satisfaction (S07);
- verify/promote evidence or ingest provider payloads;
- create/infer `AuthorizationGrant`;
- rank paths by time, cost, confidence or AI-generated preference;
- use ambient time or randomness;
- own UI truth.

## Verification target
Exactly 44 mandatory runtime scenarios, strict TypeScript ID/immutability proof, exact S03 ancestry and S01-S03/FV11/governance regressions. Exit evidence is added only after the complete implementation-head CI matrix is green.

## Verification result
On implementation head `d09b511bedbb87e7100e70f13026a9d23acebcde`:
- dedicated M04 S04 workflow #2 = SUCCESS;
- exactly 44/44 mandatory runtime scenarios PASS;
- fail/skipped/todo = 0/0/0;
- strict TypeScript ID/immutability proof PASS;
- exact reviewed S03 ancestry PASS;
- S01/S02/S03/FV11 regressions PASS;
- complete observed PR-triggered matrix = 24/24 SUCCESS;
- hard blockers = 0;
- remediation = none;
- mandatory tests waived/deferred = none.

Slice 04 is ready for final evidence-head verification. Merge and Slice 05 start remain separate governed actions.
