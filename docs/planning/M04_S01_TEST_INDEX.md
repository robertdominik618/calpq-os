# CALPQ M04 Slice 01 — Test Index

Status: `IMPLEMENTED / CI PENDING / 32 MANDATORY RUNTIME SCENARIOS`
ID: `CALPQ-M04-S01-TEST-0001`
Tracking issue: #82
Reviewed admission base: `d1251424127904a8a1ac0b8ad28cee91558408a5`

## Runtime scenarios
1. `M04S01-01` Activity CALPQ ID is stable UUIDv7; external token is rejected as identity.
2. `M04S01-02` Profession CALPQ ID is stable UUIDv7; external token is rejected as identity.
3. `M04S01-03` Activity and Profession remain distinct model classes.
4. `M04S01-04` Activity preferred label normalization.
5. `M04S01-05` Profession preferred label normalization.
6. `M04S01-06` Empty label rejection.
7. `M04S01-07` Alias normalization and immutability.
8. `M04S01-08` Case-insensitive duplicate alias rejection.
9. `M04S01-09` Preferred-label/alias duplication rejection.
10. `M04S01-10` Description required/bounded.
11. `M04S01-11` Explicit VersionId required.
12. `M04S01-12` Controlled Jurisdiction required.
13. `M04S01-13` Open-ended effective period semantics.
14. `M04S01-14` Bounded inclusive effective period semantics.
15. `M04S01-15` Inverted period rejected.
16. `M04S01-16` Applicability requires explicit DateOnly.
17. `M04S01-17` Four controlled regulatory statuses preserved.
18. `M04S01-18` Unknown regulatory status rejected.
19. `M04S01-19` UNKNOWN_REVIEW_REQUIRED remains uncertainty, not satisfaction/eligibility.
20. `M04S01-20` Source IDs required.
21. `M04S01-21` Source ID type enforced.
22. `M04S01-22` Source IDs unique and immutable.
23. `M04S01-23` Empty external-classification list does not invent a mapping.
24. `M04S01-24` External mapping preserves system/concept/dataset relation/verification/time/source.
25. `M04S01-25` CANDIDATE mapping remains descriptive and non-authoritative.
26. `M04S01-26` Duplicate external mapping version/relation rejected.
27. `M04S01-27` External identifier never replaces CALPQ primary identity.
28. `M04S01-28` Historical node versions stay independent and immutable.
29. `M04S01-29` Deterministic serialization preserves machine semantics.
30. `M04S01-30` S02-S05/path/provenance authority is absent.
31. `M04S01-31` Authorization/provider/UI/AI/ambient-time authority is absent.
32. `M04S01-32` Core export surface exposes admitted S01 types without QualificationPath/AuthorizationGrant.

## Compile-time proof
`packages/core/test/m04-s01-types.compile.ts` proves readonly IDs/labels/collections/mapping fields and prevents semantic mixing of ActivityDefinitionId and ProfessionDefinitionId.

## Dedicated runner
`tests/m04_s01_activity_profession_catalog_test.sh` verifies:
- formal M04 admission;
- exact reviewed admission merge ancestry;
- exact 32-test cardinality;
- runtime tests;
- TypeScript 7.0.2 typecheck;
- no provider/UI/AI/ambient-time dependency;
- no S02-S05 or AuthorizationGrant authority;
- Core/FV/M04 governance regressions.
