# CALPQ M01 Subject Identity Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

Mandatory scenarios:

1. Same name only -> no automatic merge.
2. Same email only -> no automatic merge.
3. Same phone or address only -> no automatic merge.
4. OCR/AI similarity only -> candidate at most.
5. Verified authoritative identifier match may support `SAME_SUBJECT`.
6. Conflicting authoritative identity facts -> `REVIEW_REQUIRED`.
7. Registry `CANDIDATE` link cannot act as `VERIFIED`.
8. Stale registry link cannot prove current identity.
9. Registry outage -> `INDETERMINATE`, not false mismatch.
10. Historical registry snapshot stays reproducible.
11. Successful login or email ownership alone does not verify legal identity.
12. Wallet/device possession alone does not verify every holder claim.
13. Account recovery or device replacement must not silently move credentials.
14. Delegated access transfers neither identity nor professional credentials.
15. Merge preserves original subject IDs and conflicting evidence.
16. Merge records approver, policy version and evidence snapshot.
17. Merge does not silently transfer AuthorizationGrant semantics.
18. Merge triggers dependent re-evaluation.
19. Split preserves historical decisions and audit history.
20. Duplicate merge/split command remains idempotent.
21. Sensitive matching data follows minimum-necessary processing.
22. Passport projection cannot create identity proof.
23. Document Intake OCR cannot create `SAME_SUBJECT` by itself.
24. Issuer trust verification does not prove credential-holder identity.

Implementation admission remains `NOT_ADMITTED_FOR_IMPLEMENTATION` while M00 feature development is FROZEN.