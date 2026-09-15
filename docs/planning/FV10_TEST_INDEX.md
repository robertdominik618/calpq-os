# FV-10 Test Index

Status: `20 OF 20 EXECUTABLE / VERIFIED`

Mandatory count: 20.

1. verification-request-reference
2. claims
3. subject
4. jurisdiction-use-case
5. assurance-level
6. acceptable-methods
7. evaluation-instant
8. route-adapter-boundary
9. normalized-outcome
10. verifier-identity
11. method
12. authority-resolution
13. source-version
14. checked-claims
15. partial-verification
16. conflicting-routes-review
17. outage-indeterminate
18. retry-idempotency
19. verification-not-eligibility-or-grant
20. architecture-boundary

## Verified evidence

`packages/application/test/fv10-verification.test.ts` maps one-to-one to FV10-01..FV10-20. `packages/application/test/fv10-types.compile.ts` proves request/intake identity separation plus record and verified-claim immutability. `tests/fv10_verification_test.sh` enforces exact mandatory count, TypeScript compilation, provider/framework independence, no ambient time/randomness, no EligibilityAssessment/AuthorizationGrant leakage and FV-09 regression continuity.

Evidence head: `ef7e175e1f72dd24ecf0840768598e6f9c57aed5`. Dedicated workflow `FV-10 Verification Orchestration #4` SUCCESS. No mandatory test was waived or deferred.
