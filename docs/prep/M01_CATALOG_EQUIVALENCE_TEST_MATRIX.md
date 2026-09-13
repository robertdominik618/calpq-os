# M01 Catalog / Qualification Path / Equivalence Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0004-F`

Mandatory scenarios before implementation admission:

1. External ESCO/ISCO identifier never replaces CALPQ ID.
2. External taxonomy update preserves historical mapping/version.
3. Profession and activity remain distinct.
4. Catalog relation outside effective dates is inapplicable.
5. Missing jurisdiction yields `INDETERMINATE` or `REVIEW_REQUIRED`.
6. Mandatory path steps cannot be skipped by optimization.
7. Alternative path branch does not require all alternatives.
8. Personalized path projection never mutates canonical path.
9. Historical path evaluation remains reproducible after rule/path update.
10. Same name or same framework level does not imply legal equivalence.
11. Full substitution applies only to explicitly covered requirements.
12. Partial substitution leaves residual requirements explicit.
13. Expired/wrong-jurisdiction equivalence rule is rejected.
14. AI candidate mapping remains non-authoritative.
15. Recognition route availability does not imply a positive decision.
16. Recognition decision is immutable, scoped and source-backed.
17. `UNKNOWN_REVIEW_REQUIRED` never becomes automatic satisfaction.
18. `WHAT_DO_I_NEED_FOR_ACTIVITY` returns source-backed explanation.
19. `WHAT_REMAINS_AFTER_RECOGNITION` shows residual requirements.
20. Search ranking cannot override jurisdiction/effective-date applicability.
21. Shortest/cheapest path remains advisory unless legally sufficient.
22. Explanation graph includes traversed edges and source/rule versions.
23. Candidate external mapping cannot affect authorization.
24. Regulated-profession status requires authoritative provenance.
25. External import/synchronization remains an adapter concern.

PREP-0004 is not implementation-authorized until these scenarios become executable tests after M00 release.
