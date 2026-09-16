# CALPQ M04 Slice 07 — Gap Navigator Test Index

Status: `IMPLEMENTATION IN PROGRESS / 48 MANDATORY RUNTIME SCENARIOS DEFINED`  
ID: `CALPQ-M04-S07-TEST-0001`  
Tracking issue: #96

The executable matrix converts the M01 Gap Navigator contract and M04 boundaries into fail-closed scenarios:

1. SATISFIED requirement -> ALREADY_SATISFIED.
2. NOT_SATISFIED -> ACTION_REQUIRED.
3. INDETERMINATE -> INFORMATION_MISSING.
4. REVIEW_REQUIRED remains REVIEW_REQUIRED.
5. Missing exact assessment -> INFORMATION_MISSING.
6. FV11 overall step outcome is consumed, not recomputed.
7. Exact RequirementSet version mismatch rejected.
8. Wrong-subject assessment rejected.
9. Future assessment rejected.
10. Unrelated RequirementSet assessment rejected.
11. Duplicate exact assessment rejected.
12. Wrong-jurisdiction path rejected.
13. Expired path rejected.
14. Wrong path provenance target rejected.
15. Evaluation cannot predate path provenance.
16. Unverified path provenance -> REVIEW_REQUIRED.
17. Evidence snapshot IDs retained.
18. Source IDs retained.
19. Path/set/assessment rule-version references retained.
20. FV11 atomic reason codes retained as `why`.
21. Full RecognitionDecision may satisfy requirement item.
22. Requirement recognition cannot silently recompute FV11 step.
23. Partial recognition preserves residual requirements.
24. Recognition route -> RECOGNITION_POSSIBLE.
25. Recognition route alone never completes path.
26. Existing RecognitionDecision satisfies request-recognition step.
27. Existing RecognitionDecision satisfies authority-decision step.
28. Full credential recognition satisfies obtain-credential step.
29. Partial credential recognition keeps residual action.
30. UNKNOWN_REVIEW_REQUIRED route -> REVIEW_REQUIRED.
31. Wrong-target recognition route rejected.
32. Wrong-subject recognition decision rejected.
33. Out-of-period recognition decision rejected.
34. RECOGNITION_ROUTE_ONLY equivalence -> RECOGNITION_POSSIBLE.
35. REVIEW_REQUIRED equivalence remains review.
36. Full equivalence may satisfy requirement item.
37. Equivalence cannot silently recompute FV11 step.
38. Partial equivalence preserves residual requirement and incomplete path.
39. Unresolved prerequisite explicitly recorded.
40. Already-satisfied prerequisite excluded from required-action view.
41. Satisfied alternative makes unsatisfied sibling NOT_APPLICABLE.
42. Required-action view excludes satisfied/not-applicable items.
43. Path comparison is advisory and selects no winner.
44. Path-comparison order is deterministic/canonical.
45. New evidence creates a new gap snapshot without mutating history.
46. New path version creates a distinct evaluation snapshot.
47. Derived output is immutable and rule-input order serializes canonically.
48. Failed gap projection never mutates authoritative input objects.

Compile-time proof additionally covers immutable result collections, controlled state unions, semantic GapEvaluationId and the impossibility of setting an advisory comparison winner.
