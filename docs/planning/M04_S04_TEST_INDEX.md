# CALPQ M04 Slice 04 — Test Index

Status: `VERIFIED / 44 MANDATORY RUNTIME SCENARIOS PASS`
ID: `CALPQ-M04-S04-TEST-0001`
Tracking issue: #89

Mandatory runtime scenarios: **44**.

1. QualificationPath UUIDv7 identity.
2. Explicit VersionId.
3. Credential target type.
4. Activity/Profession target types.
5. Credential jurisdiction match.
6. Activity/Profession jurisdiction match.
7. Credential effective-period containment.
8. Activity/Profession effective-period containment.
9. Controlled step code.
10. Controlled step type.
11. SATISFY_REQUIREMENT_SET requires S03 governed snapshot.
12. Non-SATISFY step cannot carry governed RequirementSet.
13. Prerequisite normalization/immutability.
14. Duplicate prerequisite rejection.
15. Step source identity required.
16. Step SourceId typing/uniqueness/immutability.
17. Path SourceId requirements.
18. Non-empty path steps.
19. Step instance enforcement.
20. Unique step codes.
21. Unknown prerequisite rejection.
22. Self-prerequisite rejection.
23. Cycle rejection.
24. Valid DAG preservation.
25. Controlled alternative-group code.
26. Alternative group minimum cardinality.
27. Valid alternative group remains unresolved.
28. RequirementSet jurisdiction match.
29. RequirementSet period contains path period.
30. Exact S03 executable snapshot preservation/no recomputation.
31. Root/nested immutability.
32. Deterministic serialization.
33. Serialization preserves targets/graph/alternative/RequirementSet version.
34. Historical path-version independence.
35. Explicit DateOnly/Jurisdiction effective evaluation.
36. Selector candidate/query type enforcement.
37. Selector requires explicit target criterion.
38. Duplicate candidate identity/version/jurisdiction rejection.
39. NOT_FOUND.
40. SELECTED.
41. Exact activity/profession target filtering.
42. MULTIPLE_APPLICABLE for distinct path identities with no ranking.
43. AMBIGUOUS_REVIEW_REQUIRED for overlapping versions of one path identity.
44. Architecture/export boundary: no S05+/evidence/grant/AI/provider/ambient-time/optimization authority.

Compile-time proof covers semantic ID separation and readonly path/step/selection state.
No mandatory test may be waived or deferred.

## Verified implementation evidence
Implementation head: `d09b511bedbb87e7100e70f13026a9d23acebcde`.
Dedicated workflow `M04 Slice 04 Qualification Path` #2 = SUCCESS.
Runtime: 44 passed / 0 failed / 0 skipped / 0 todo.
Strict TypeScript proof PASS.
Complete observed implementation-head PR matrix: 24/24 SUCCESS.
Hard blockers: 0. Remediation: none.
