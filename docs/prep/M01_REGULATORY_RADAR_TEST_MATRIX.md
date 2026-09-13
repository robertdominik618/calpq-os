# CALPQ M01 Regulatory Radar / Review Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0008-T`

Mandatory scenarios for executable translation after M00 release:

1. Verified future rule change creates radar item without premature NON_COMPLIANT state.
2. Unverified regulatory input creates review-oriented radar item only.
3. Stale source cannot create authoritative compliance conclusion.
4. Severity and urgency remain distinct.
5. Duplicate equivalent change does not create duplicate radar item.
6. Duplicate action creation collapses under deterministic deduplication.
7. Action completion does not automatically resolve compliance state.
8. Notification sent does not complete action.
9. Notification delivered does not complete action.
10. Notification acknowledged does not resolve review case.
11. Delivery failure can escalate without changing legal state.
12. Notification payload follows minimum-necessary disclosure.
13. Sensitive evidence is not embedded by default.
14. REVIEW_REQUIRED can open HumanReviewCase.
15. INDETERMINATE can open HumanReviewCase.
16. Conflicting evidence can open HumanReviewCase.
17. Unverified rule change can open HumanReviewCase.
18. AI recommendation cannot silently resolve HumanReviewCase.
19. OCR proposal cannot silently resolve HumanReviewCase.
20. New material evidence can reopen resolved case.
21. Previous resolution remains in history after reopen.
22. Closure requires auditable resolution basis.
23. Notification acknowledgement alone cannot close case.
24. Action completion alone cannot close case.
25. Passage of time alone cannot close case.
26. AI recommendation alone cannot close case.
27. Resolution records rule/policy version.
28. Resolution records evidence snapshot references.
29. Conditional resolution preserves residual conditions.
30. Conditional resolution preserves follow-up deadline.
31. New resolution may trigger selective re-evaluation.
32. Re-evaluation does not rewrite historical decision.
33. Irrelevant change produces no action for unaffected subject.
34. Future deadline can create ACTION_SOON while current state remains compliant.
35. Critical current blocker can create ACTION_NOW.
36. Radar recalculation preserves provenance.
37. Review assignment records responsible role/actor.
38. Segregation-of-duties policy can require separate reviewer.
39. Duplicate notification retry does not create duplicate logical notice.
40. Closed case can be superseded by materially newer authoritative resolution without deleting closure history.
