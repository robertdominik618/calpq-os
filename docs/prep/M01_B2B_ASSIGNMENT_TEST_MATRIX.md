# CALPQ M01 PREP-0006 — B2B Assignment Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0006-T`

The following scenarios are mandatory for executable translation after M00 release.

1. valid person credential + valid organization context + matching assignment => ASSIGNABLE.
2. expired person authorization => BLOCKED.
3. authorization valid at start but expiring before required assignment end => not silently ASSIGNABLE.
4. suspended authorization => BLOCKED.
5. revoked authorization => BLOCKED.
6. wrong-jurisdiction authorization => BLOCKED or REVIEW_REQUIRED according to rule.
7. scope-limited authorization outside scope => BLOCKED.
8. organization authorization missing where mandatory => BLOCKED.
9. valid organization authorization does not replace missing person authorization.
10. qualified employee does not automatically qualify organization for unrelated activities.
11. employment alone does not create qualification.
12. membership alone does not create authority.
13. valid role assignment inside scope is accepted.
14. expired role assignment is rejected.
15. valid delegation inside explicit scope is accepted where delegation is permitted.
16. delegation outside scope is rejected.
17. revoked delegation is rejected.
18. delegator lacking delegable authority cannot create usable delegation.
19. subdelegation is rejected unless explicitly permitted.
20. delegation never transfers professional credential.
21. TEAM_COVERAGE_ALLOWED may distribute requirements only under explicit rule.
22. team coverage is rejected when rule requires one fully qualified person.
23. SUPERVISED_ACTIVITY requires explicit supervision rule.
24. missing or invalid supervisor blocks conditional assignment.
25. ASSIGNABLE_WITH_CONDITIONS lists every required condition.
26. failure of a required condition invalidates continued reliance.
27. stale or unverifiable mandatory evidence => INDETERMINATE or REVIEW_REQUIRED, never ASSIGNABLE.
28. review-required source interpretation never auto-upgrades via AI confidence.
29. duplicate evaluation with identical inputs is deterministic.
30. changed role/delegation/credential/rule revision creates a new decision, not mutation of historical decision.
31. historical AssignmentDecision remains reproducible from recorded revisions.
32. organization dashboard cannot hide a blocked assignment.
33. global green organization status cannot hide expired person credential.
34. unrelated sensitive evidence is excluded from B2B projection.
35. planning recommendation is not treated as canonical AssignmentDecision.
36. one person's credential is not inherited by teammate.
37. wrong assignment activity mapping blocks or requires review.
38. overlapping skills without authorization do not satisfy regulated requirement.
39. partial recognition preserves residual assignment requirements.
40. M00 BLOCKED state still forbids product source implementation.
