# CALPQ M02 Batch Execution Readiness Matrix

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M02-BATCH-READINESS-0001`

## Batch A — Core Kernel
1. FV-01 implementation contract exists and remains blocked.
2. FV-01 mandatory test contract exists and is complete.
3. FV-02 implementation contract exists and remains blocked.
4. FV-02 deterministic port tests are defined.
5. FV-03 provenance/evidence/result contract exists.
6. FV-03 original-vs-derived evidence boundary is explicit.
7. FV-03 four domain outcomes remain distinct from processing errors.
8. FV-04 command/event envelope semantics are explicit.
9. FV-04 expected revision semantics are explicit.
10. FV-04 same-command replay cannot imply duplicate accepted transitions.
11. FV-05 CredentialArtifact scope is explicit.
12. FV-05 document/evidence/verified-fact/eligibility/authorization separation is explicit.
13. Batch A file ownership is restricted to Core plus proof fixtures unless reviewed otherwise.
14. Core framework/provider dependency prohibition is explicit.
15. Clock/IdGenerator are the only admitted nondeterministic inputs for deterministic Core behavior.
16. Batch A commit order is defined.
17. Batch A Definition of Done is defined.
18. Batch A stop-the-line conditions are defined.
19. Batch A cannot execute before M00/FV-00 admission chain.
20. Batch B cannot start before Batch A exit evidence.

## Batch B — Application, Persistence & Evidence
21. FV-06 ApplicationExecutionContext and use-case boundary are defined.
22. Application orchestration is prohibited from absorbing Core policy.
23. FV-07 UnitOfWork atomic mutation responsibilities are explicit.
24. optimistic concurrency and idempotency integration are required.
25. tenant-aware repository behavior is required.
26. external calls are excluded from authoritative DB transaction duration by default.
27. FV-08 migration authority uses explicit versioned SQL.
28. applied migration immutability/checksum expectations are explicit.
29. transactional outbox semantics are explicit.
30. inbox/consumer deduplication semantics are explicit.
31. FV-09 immutable original intake semantics are explicit.
32. derived extraction retains lineage to the original.
33. OCR/AI confidence cannot promote extraction directly to VERIFIED.
34. FV-10 verification orchestration is provider neutral.
35. technical verification is distinct from authority/legal competence.
36. provider outage produces uncertainty/retry semantics rather than legal rejection.
37. Batch B commit order is defined.
38. Batch B Definition of Done is defined.
39. Batch B stop-the-line conditions are defined.
40. Batch C cannot start before Batch B exit evidence.

## Batch C — Decision, Passport & Runtime
41. FV-11 EligibilityAssessment binds exact versioned inputs and evidence snapshot.
42. all four eligibility outcomes remain deterministic and machine-readable.
43. historical eligibility assessments are immutable.
44. SATISFIED does not imply AuthorizationGrant.
45. FV-12 Professional Passport is a read projection only.
46. projection rebuild does not mutate authoritative history.
47. FV-13 TenantContext is explicit across the vertical.
48. purpose/access decisions fail closed when context is missing or conflicting.
49. material operations preserve audit/provenance references.
50. FV-14 transport DTOs remain separate from Core domain types.
51. HTTP status does not replace domain result semantics.
52. OpenAPI/REST mapping remains transport ownership.
53. FV-15 duplicate async delivery is expected and safe.
54. retry classification distinguishes replay, transient retry, reissue and review.
55. reconciliation can rebuild projections without rewriting authoritative state.
56. dependency outage cannot fabricate legal/domain rejection.
57. Batch C commit order is defined.
58. Batch C Definition of Done is defined.
59. M02 exit requires the 45-scenario first-vertical acceptance evidence plus runtime resilience evidence.
60. M02 exit does not by itself admit M03/M04/M05 implementation.

## Completion rule
All 60 criteria must remain present and machine-checked before M02 implementation begins. Passing this matrix proves execution preparedness only; it does not authorize product source.