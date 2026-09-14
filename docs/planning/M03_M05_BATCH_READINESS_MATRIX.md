# CALPQ M03-M05 Batch Readiness Matrix

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M03-M05-BATCH-READINESS-0001`

## M03-A — Read Models & Status Semantics
1. Passport read-model contract is stable.
2. Credential Card presentation model is explicit.
3. Document/evidence/eligibility/authorization status labels are distinct.
4. Evidence/status explanation DTOs preserve reason/source references.
5. Timeline model is read-only and historical.
6. UI contains no hidden eligibility/verification logic.

## M03-B — Dashboard & Passport Flows
7. Dashboard uses authoritative projections only.
8. Passport overview has defined empty/loading/error states.
9. Credential Card list/detail flows share stable contracts.
10. Evidence/status detail is source-linked.
11. Timeline is integrated without mutating history.
12. Mobile/web semantics are aligned.

## M03-C — Search, Accessibility & Localization
13. Intent search is non-authoritative.
14. Search does not fabricate domain conclusions.
15. Accessibility baseline is explicit.
16. Localization keys do not replace reason codes.
17. Locale formatting preserves semantic values.
18. Product regression coverage is defined.

## M04-A — Catalog Core
19. Activity catalog ownership is explicit.
20. Profession catalog ownership is explicit.
21. Credential catalog is versioned.
22. RequirementSet versioning is immutable/effective-dated.
23. Jurisdiction is explicit.
24. Source linkage supports historical replay.

## M04-B — Qualification Paths & Recognition
25. QualificationPath graph is explicit.
26. Path prerequisites are versioned.
27. Equivalence candidate != recognition decision.
28. Recognition review path is attributable.
29. AI confidence cannot create recognition.
30. Path selection is explainable.

## M04-C — Gap Navigator
31. Current-vs-target gap computation is deterministic.
32. Missing requirements are classified.
33. Blocking vs optional gap semantics are explicit.
34. Unresolved evidence remains indeterminate/review-required.
35. Gap output consumes governed catalog + verified state.
36. Historical gap evaluation is reproducible.

## M05-A — Intake & Immutable Archive
37. All supported intake channels map to one intake contract.
38. Original artifact is immutable.
39. Hash/media/security metadata is preserved.
40. Quarantine precedes unsafe processing.
41. Intake channel does not imply trust.
42. Archive/retention hooks are auditable.

## M05-B — Extraction & Review
43. OCR/AI outputs are derived proposals.
44. Confidence cannot self-promote verification.
45. Original and derived records remain separate but linked.
46. Corrections are attributable.
47. Review decisions are auditable.
48. Structured fact promotion follows governed rules.

## M05-C — Trust & Verification
49. Trust Registry semantics are explicit.
50. Issuer/verifier identity is distinct from authority.
51. Technical validation != legal authority.
52. Verification promotes only checked claims.
53. Provider outage yields retry/indeterminate/review semantics.
54. Verification cannot issue AuthorizationGrant.

## Governance
All 54 criteria are planning readiness only. Implementation remains blocked until each milestone/batch is separately admitted under project governance.
