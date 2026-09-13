# CALPQ M01 Continuous Compliance Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0007-T`

These scenarios become executable Core/Application tests after M00 release.

## Mandatory scenarios

1. Unrelated rule change does not invalidate an unrelated passport card.
2. Changed RequirementSet selects only assessments that used that version/path.
3. Credential suspension impacts dependent passport and assignment projections.
4. Credential renewal can restore future assignment eligibility only after a new evaluation.
5. Revoked authorization never remains ASSIGNABLE from a stale projection.
6. Evidence verification downgrade selects all assessments that consumed that evidence.
7. RecognitionDecision change preserves the old decision and creates a new evaluation.
8. Delegation expiry impacts assignments that depend on that delegation only.
9. Role removal impacts assignments requiring that role.
10. Assignment scope change triggers re-evaluation for that assignment.
11. Organization status change does not alter unrelated organizations.
12. Catalog mapping change does not alter legal eligibility unless an authoritative dependency uses it.
13. Future-effective rule produces future impact, not premature current non-compliance.
14. Rule effective now can produce NON_COMPLIANT when a blocking requirement is unsatisfied.
15. Transitional rule can create an ACTION_REQUIRED before final effective date when explicitly modeled.
16. UNVERIFIED regulatory change creates review candidates only.
17. STALE/REVIEW_REQUIRED source cannot silently change authoritative compliance.
18. AI-generated rule mapping remains candidate/non-authoritative until verified.
19. Duplicate ChangeEvent processing does not duplicate decisions.
20. Duplicate ChangeEvent processing does not duplicate alerts.
21. Same change plus same graph snapshot produces the same target set.
22. Dependency-cycle detection does not rely on arbitrary traversal order.
23. Historical EligibilityAssessment remains unchanged after re-evaluation.
24. Historical AssignmentDecision remains unchanged after re-evaluation.
25. Historical RecognitionDecision remains unchanged after re-evaluation.
26. UNCHANGED re-evaluation still records an auditable decision.
27. Missing required evidence produces INDETERMINATE rather than optimistic compliance.
28. Ambiguous jurisdiction produces REVIEW_REQUIRED or INDETERMINATE.
29. Compliance status always carries jurisdiction, scope, time, and rule-version context.
30. Organization-level COMPLIANT state does not imply every assignment is assignable.
31. COMPLIANT_WITH_CONDITIONS becomes invalid when a required condition stops being true.
32. AT_RISK does not equal current NON_COMPLIANT.
33. Clock boundary may alter temporal projection without fabricating an authority event.
34. Retry after partial technical failure preserves idempotency.
35. ReevaluationDecision includes dependency path and source/rule versions.
36. Alert deduplication key is stable for the same effective impact.
37. Priority changes processing order but not evaluation result.
38. Re-evaluation cannot grant, revoke, renew, or recognize authorization by projection side effect.
39. Passport/Gap/NBA projections may update only from new evaluated state, not directly from raw change input.
40. The engine remains provider-neutral and does not require a particular scheduler, queue, database, or AI provider.
