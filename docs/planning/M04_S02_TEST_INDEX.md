# CALPQ M04 Slice 02 — Test Index

Status: `IMPLEMENTED / VERIFICATION PENDING`
ID: `CALPQ-M04-S02-TEST-0001`
Tracking issue: #85

Mandatory runtime scenarios: **32**.

1. CredentialDefinition CALPQ UUIDv7 identity.
2. RequirementDefinition CALPQ UUIDv7 identity.
3. Credential/Requirement identity separation.
4. Controlled credential machine code.
5. Controlled requirement machine code.
6. Label normalization.
7. Empty label rejection.
8. Alias normalization and immutability.
9. Case-insensitive duplicate alias rejection.
10. Preferred-label alias rejection.
11. Description bounds.
12. Explicit VersionId requirement.
13. Controlled Jurisdiction requirement.
14. Explicit CatalogEffectivePeriod evaluation.
15. Source identity required.
16. SourceId type enforcement.
17. Unique immutable source identities.
18. CredentialDefinition is not artifact/grant/evidence/subject state.
19. RequirementDefinition has no outcome/evidence/eligibility state.
20. Credential and Requirement definitions remain distinct models.
21. Credential historical version immutability.
22. Requirement historical version immutability.
23. Stable requirement machine code across explicit versions.
24. Stable credential machine code across explicit versions.
25. Deterministic serialization.
26. Machine-code/source identity serialization preservation.
27. No current/latest/active implicit version selection.
28. No RequirementSet/path/provenance/equivalence/gap authority.
29. No artifact verification or authorization authority.
30. No provider/UI/AI/ambient-time authority.
31. Core export surface exposes S02 types without S03+/AuthorizationGrant leakage.
32. Existing eligibility contract remains definition-agnostic.

Compile-time proof additionally covers semantic ID non-interchangeability and readonly root/nested state.
