# M01 Trust Registry Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

Mandatory scenarios:
1. Known entity with no matching scope -> NOT_AUTHORIZED.
2. Correct issuer, wrong jurisdiction -> NOT_AUTHORIZED.
3. Correct issuer, expired scope -> NOT_AUTHORIZED.
4. Correct issuer, future-effective scope -> NOT_AUTHORIZED for current instant.
5. Stale trust anchor -> REVIEW_REQUIRED or INDETERMINATE.
6. Revoked trust anchor -> no unconditional authorization.
7. Suspended trust anchor -> no unconditional authorization.
8. UNVERIFIED source -> no unconditional authorization.
9. Name similarity alone -> no authority.
10. Matching website/domain alone -> no authority.
11. Valid signature + no professional issuing competence -> NOT_AUTHORIZED for claim.
12. Valid signature + valid scope -> authority may resolve.
13. Verifier authority does not imply issuer authority.
14. Issuer authority does not imply relying-party data access.
15. Organization authority does not automatically extend to employee.
16. Parent company authority does not automatically extend to subsidiary.
17. Partial scope verifies only covered claims.
18. Mixed claims produce partial result, not blanket VERIFIED.
19. Provider outage -> INDETERMINATE, not FAILED claim.
20. Retry does not duplicate VerificationRecord.
21. Conflicting authoritative sources -> REVIEW_REQUIRED.
22. Lower-assurance fallback cannot satisfy higher-assurance request.
23. Registry unavailable may fall back to human review.
24. OCR confidence cannot satisfy authority resolution.
25. User correction cannot create authority.
26. Cached historical source reproduces past decision.
27. Cached stale source cannot silently prove current authority.
28. Trust-source adapter change leaves Core semantics unchanged.
29. Provider-specific error code does not leak into Core result model.
30. Replaced trust anchor triggers PREP-0007 impact flow.
31. Authority-scope reduction affects only dependent decisions.
32. Unrelated trust update does not re-evaluate unrelated subjects.
33. Relying party purpose mismatch -> DENIED.
34. Relying party requests unrelated claims -> DENIED/trimmed by policy.
35. Minimum-necessary verifier disclosure excludes source documents by default.
36. Expired verifier authorization -> DENIED/REVIEW_REQUIRED.
37. Historical disclosure retains original purpose/scope snapshot.
38. Verification success alone does not create EligibilityAssessment.
39. Verification success alone does not create AuthorizationGrant.
40. AI may recommend a route but cannot promote authority state by itself.
