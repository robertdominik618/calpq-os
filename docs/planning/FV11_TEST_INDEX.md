# FV-11 Test Index

Status: `24 OF 24 EXECUTABLE / VERIFIED`

Mandatory count: 24.

1. subject-binding
2. credential-version
3. requirement-set-version
4. evaluation-instant
5. evidence-snapshot
6. atomic-results
7. satisfied
8. not-satisfied
9. indeterminate
10. review-required
11. all-satisfied
12. all-negative
13. all-review
14. all-indeterminate
15. any-satisfied
16. any-negative
17. any-review
18. any-indeterminate
19. at-least-satisfied
20. at-least-negative
21. at-least-review
22. historical-immutable
23. eligibility-not-grant
24. architecture-boundary

## Verified evidence

`packages/core/test/fv11-eligibility.test.ts` maps one-to-one to FV11-01..FV11-24. `packages/core/test/fv11-types.compile.ts` proves nominal separation for CredentialDefinitionId, RequirementSetId and EligibilityAssessmentId and compile-time immutability of assessments, atomic results and RequirementSet members.

`tests/fv11_eligibility_test.sh` enforces the admitted lifecycle, exactly 24 mandatory tests, TypeScript compilation, zero Core runtime dependencies, forbidden framework/provider/persistence imports, no ambient wall-clock/randomness, no AuthorizationGrant leakage, FV-10 regression evidence and the global architecture boundary.

Final verified evidence head: `689de613e91d4454debcb3d5bdc9e53e492a7358`. Dedicated workflow `FV-11 Eligibility Assessment #6` SUCCESS. Foundation Guard #907 and M02 Batch Readiness #195 SUCCESS. No mandatory test was waived or deferred.
