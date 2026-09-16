# CALPQ M04 Slice 05 — Test Index

Status: `42 MANDATORY RUNTIME SCENARIOS / CI PENDING`
ID: `CALPQ-M04-S05-TEST-0001`
Tracking issue: #92

Mandatory runtime scenarios:

1. ActivityDefinition target support.
2. ProfessionDefinition target support.
3. CredentialDefinition target support.
4. RequirementDefinition target support.
5. GovernedRequirementSetVersion target support.
6. QualificationPathDefinition target support.
7. Unsupported target rejection.
8. Non-empty source-reference collection.
9. SourceReference type enforcement.
10. Duplicate SourceId rejection across source versions.
11. Missing required source rejection.
12. Extra source rejection.
13. QualificationPath root + step SourceId union.
14. QualificationPath reused root/step source deduplication.
15. ProvenanceEnvelope type requirement.
16. Subject-free catalog provenance.
17. Evidence-free catalog provenance.
18. Provenance missing source rejection.
19. Provenance extra source rejection.
20. Provenance source-version mismatch rejection.
21. Provenance material snapshot mismatch rejection.
22. Provenance evaluatedAt cannot predate source retrieval.
23. Source order is non-semantic and canonicalized.
24. Required SourceId collection immutability.
25. Bound SourceReference collection immutability.
26. Binding root immutability.
27. Exact target identity preservation.
28. Exact target version preservation.
29. Exact source version preservation.
30. Exact source authority preservation.
31. Source jurisdiction/type/locator preservation.
32. Source publication/effective date preservation.
33. Source retrieval instant preservation.
34. Source verification-state preservation without promotion.
35. Source content-hash preservation.
36. allSourcesVerified true only when every source is VERIFIED.
37. UNVERIFIED remains reviewable/non-promoted.
38. STALE remains reviewable/non-promoted.
39. FAILED/REVIEW_REQUIRED/NOT_APPLICABLE remain non-verified.
40. Deterministic canonical serialization.
41. Historical source-version bindings remain independent.
42. Architecture boundary: no S06+, evidence-verification, provider/AI or ambient-time authority and no backward import into S01-S04.

Compile-time proof additionally covers controlled target-kind typing and readonly root/nested collections.

No mandatory scenario may be waived or deferred.
