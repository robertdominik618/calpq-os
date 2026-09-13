# CALPQ M01 Access Policy Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0012-T`

Mandatory scenarios:
1. Role alone does not grant access.
2. Delegation cannot broaden valid scope.
3. Consent for one purpose does not cover another purpose.
4. Expanded requested claims require re-evaluation.
5. Revoked consent blocks future reliance without rewriting history.
6. Missing/stale policy input never degrades to broad ALLOW.
7. Unrelated credential data is excluded by default.
8. Derived claim is preferred when sufficient for purpose.
9. Source document is not shared merely because a derived claim is allowed.
10. Audience change requires re-evaluation.
11. Incompatible further use is denied or sent to review.
12. Historical decision keeps exact policy and basis versions.
13. Audit evidence does not grant future access.
14. AI explanation cannot change deterministic access result.
15. Legal-basis processing still obeys minimisation and purpose limits.
