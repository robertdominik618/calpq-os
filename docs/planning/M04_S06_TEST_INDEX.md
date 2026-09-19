# CALPQ M04 Slice 06 — Test Index

Status: `IMPLEMENTATION IN PROGRESS / 48 MANDATORY RUNTIME SCENARIOS DEFINED`  
ID: `CALPQ-M04-S06-TEST-0001`  
Tracking issue: #94

The executable matrix intentionally converts the M01 design scenarios and M04 boundaries into fail-closed tests.

1. Explicit equivalence target binding.
2. Exact target-version preservation.
3. Same label never implies equivalence.
4. Wrong-jurisdiction rule rejection.
5. Expired rule rejection.
6. Unverified rule source -> source review.
7. REVIEW_REQUIRED never auto-resolves.
8. RECOGNITION_ROUTE_ONLY never satisfies a target.
9. Full substitution rejects residual requirements.
10. Partial substitution requires residual requirements.
11. Partial substitution preserves residual requirements.
12. Credit/reduction requires residual requirements.
13. Duplicate SourceId rejection.
14. Subject-free rule provenance.
15. Evidence-free M04 rule provenance.
16. Exact source snapshot/provenance identity.
17. Provenance cannot predate retrieval.
18. Runtime-immutable rule sources.
19. Canonical source-order serialization.
20. Recognition route availability.
21. UNKNOWN_REVIEW_REQUIRED -> review.
22. Wrong-jurisdiction route rejection.
23. Expired route rejection.
24. Unverified route source -> source review.
25. Route availability creates no decision/effect.
26. Authoritative decision requires already-VERIFIED sources.
27. Decision authority must be represented in authoritative source basis.
28. Decision provenance must match exact subject.
29. Decision target jurisdiction must be exact.
30. Decision effective-date/jurisdiction applicability.
31. Partial recognition preserves residual requirements.
32. Full recognition rejects residual requirements.
33. Review case opens explicitly.
34. Explicit audited triage.
35. Explicit IN_REVIEW entry.
36. WAITING_EVIDENCE roundtrip preserves history.
37. WAITING_EXTERNAL roundtrip preserves history.
38. No close-before-resolution transition.
39. Governed rule can resolve human review.
40. REVIEW_REQUIRED rule cannot resolve human review.
41. RecognitionRoute is not a resolution basis.
42. Authoritative decision can resolve human review.
43. Wrong-subject decision cannot resolve review.
44. Optional independent-approval guard blocks self-resolution.
45. Close/reopen preserves prior resolution history.
46. SUPERSEDED is terminal.
47. Transition timestamps are monotonic.
48. Review serialization normalizes non-semantic input order.

Compile-time proof additionally covers readonly nested collections, controlled effect/route unions, semantic-ID separation and the intentional absence of a route-resolution API.

No test may claim that S06 verifies evidence, computes S07 gaps, recomputes FV11 eligibility or issues authorization.
