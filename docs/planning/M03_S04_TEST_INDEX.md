# CALPQ M03 Slice 04 Test Index — Evidence & Source Explanation Views / Why? Affordance

Status: `26 EXECUTABLE SCENARIOS DEFINED`
ID: `CALPQ-M03-S04-TEST-0001`

1. credential-card-input-required
2. passport-input-required
3. authoritative-assessment-input-required
4. card-must-remain-non-authoritative
5. passport-must-remain-non-authoritative
6. subject-binding-must-match
7. assessment-identity-must-match
8. credential-definition-binding-must-match
9. requirement-set-binding-must-match
10. eligibility-outcome-must-be-passthrough
11. evaluation-instant-must-match
12. passport-item-provenance-must-match-assessment
13. explicit-why-affordance-exists-for-all-four-facets
14. unavailable-document-source-is-explained-not-inferred-missing
15. explicit-document-binding-reference-is-preserved-without-provenance-invention
16. verification-item-state-and-attribution-are-preserved
17. governed-evidence-is-joined-only-by-evidence-id
18. absent-governed-evidence-remains-explicitly-unavailable
19. eligibility-reason-codes-are-preserved-verbatim
20. source-reference-details-are-exposed-without-upgrade
21. evidence-reference-details-are-exposed-without-upgrade
22. provenance-rule-and-evaluator-identities-are-preserved
23. lifecycle-unavailability-is-explained-without-date-inference
24. read-model-and-nested-explanation-state-are-immutable
25. deterministic-serialization-and-zero-decision-authority
26. architecture-boundary

Compile-time evidence additionally proves root and nested immutability; root `authorizationAuthority` and `decisionAuthority` are exactly `false`; `WHY` is controlled; explanation availability is controlled; and composition requires `CredentialCardReadModel`, `ProfessionalPassportProjection` and `EligibilityAssessment`.

Reviewed predecessor evidence is mandatory: branch ancestry must include M03 Slice 03 reviewed merge `f92032617783e1ddfc82aefc7e1bdea28534424a`.

No mandatory test is waived or deferred.
