# CALPQ M03 Slice 04 Test Index — Evidence & Source Explanation with Why?

Status: `26 OF 26 EXECUTABLE / VERIFIED`
ID: `CALPQ-M03-S04-TEST-0001`

1. card-input-required
2. assessment-input-required
3. assessment-id-match-required
4. subject-match-required
5. credential-definition-id-match-required
6. credential-definition-version-match-required
7. requirement-set-id-match-required
8. requirement-set-version-match-required
9. eligibility-outcome-match-required
10. evaluation-instant-match-required
11. governed-source-kind
12. why-affordance-explicit
13. why-stable-reference
14. why-non-authoritative
15. requirement-reasons-preserve-codes
16. empty-reason-codes-preserved
17. reason-entry-outcome-passthrough
18. source-metadata-passthrough
19. source-verification-state-passthrough
20. evidence-snapshot-identity-metadata
21. evidence-source-link-fields-preserved
22. provenance-rule-identity
23. provenance-actor-evaluator
24. immutable-view-and-nested
25. deterministic-serialization
26. architecture-boundary

Compile-time evidence proves:
- explanation root and nested Why/reason/source/evidence/provenance presentation values are immutable;
- source and Why target kinds are controlled;
- `authorizationAuthority`, root `decisionAuthority` and Why `decisionAuthority` are exactly `false`;
- compose requires `CredentialCardReadModel` and `EligibilityAssessment`.

Verified evidence head: `02d3738dbc245e5f437ff360445c2711e83cb8fa`.
Dedicated workflow `M03 Slice 04 Explanation #2` SUCCESS with exact result 26 pass / 0 fail / 0 skipped / 0 todo plus strict TypeScript proof.
Reviewed Slice 03 ancestry, Slice 03/02/01 regressions, FV-12 predecessor regression, M03 admission integrity and architecture boundaries also pass.

No mandatory test was waived or deferred.
