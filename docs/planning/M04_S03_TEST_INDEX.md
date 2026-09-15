# CALPQ M04 Slice 03 — Test Index

Status: `VERIFIED / 34 MANDATORY RUNTIME SCENARIOS PASS`
ID: `CALPQ-M04-S03-TEST-0001`
Tracking issue: #87
PR: #88
Verified implementation head: `a1b269f10829127019c9be2eb7f9604840dc7622`

Mandatory runtime scenarios: **34/34 PASS**.

1. Preserve wrapped RequirementSet identity/version.
2. Require real RequirementSet instance.
3. Require real CredentialDefinition instance.
4. Exact CredentialDefinition identity binding.
5. Exact CredentialDefinition version binding.
6. Controlled exact jurisdiction binding.
7. Explicit CatalogEffectivePeriod requirement.
8. Set period contained in CredentialDefinition period.
9. RequirementDefinition entries required.
10. RequirementDefinition runtime type enforcement.
11. Unique RequirementDefinition identity/version entries.
12. Unique requirement machine codes.
13. Definition count equals executable requirement count.
14. Definition-code order equals executable RequirementId order exactly.
15. Exact requirement jurisdiction binding.
16. Set period contained in every RequirementDefinition period.
17. Source identity required.
18. SourceId type enforcement.
19. Unique frozen source identities.
20. Root and nested array immutability.
21. Explicit date+jurisdiction effective evaluation.
22. Exact jurisdiction semantics with no parent fallback.
23. Deterministic serialization.
24. Serialization preserves executable group mode/membership/threshold.
25. Historical versions preserve exact independent runtime snapshots.
26. Selector typed query inputs.
27. Selector candidate type enforcement.
28. Duplicate candidate identity/version/jurisdiction rejection.
29. NOT_FOUND outside applicable effective window.
30. SELECTED only for exactly one match with no recomputation.
31. Overlapping applicable versions => AMBIGUOUS_REVIEW_REQUIRED.
32. Ambiguous candidate versions deterministic with no preference.
33. Core export surface exposes S03 without QualificationPath.
34. No S04+/evidence/authorization/AI/provider/ambient-time authority; M02 eligibility source unchanged.

Compile-time proof covers readonly governed root fields, requirement definitions, source identities, selection state, selected reference and ambiguity candidate versions.
Dedicated workflow `M04 Slice 03 Requirement Set Versioning` #2 = SUCCESS.
Complete observed implementation-head PR matrix = 22/22 SUCCESS.
M04 S01 #14, M04 S02 #8 and FV-11 #178 are SUCCESS.
No mandatory test was waived or deferred.
