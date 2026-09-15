# CALPQ M03 Slice 03 Test Index — Credential Card Separated State Presentation

Status: `24 OF 24 EXECUTABLE / VERIFICATION PENDING`
ID: `CALPQ-M03-S03-TEST-0001`

1. passport-input-required
2. non-authoritative-source-required
3. root-subject-and-identifiers-preserved
4. no-document-binding-means-source-unavailable-not-missing
5. document-binding-type-required
6. document-binding-credential-id-must-match-card
7. document-artifact-requires-explicit-subject
8. document-artifact-subject-must-match-card
9. document-metadata-preserved-without-validity-inference
10. document-facet-does-not-collapse-artifact-verification-state
11. verification-evidence-state-counts-preserve-all-governed-states
12. verification-record-state-counts-preserve-all-governed-states
13. verification-unlinked-records-remain-explicit
14. verification-facet-has-no-single-collapsed-status
15. eligibility-four-outcome-passthrough
16. eligibility-authoritative-identifiers-and-evaluation-preserved
17. lifecycle-is-separate-and-explicitly-source-unavailable
18. document-expiry-does-not-infer-lifecycle-state
19. four-facets-remain-distinct-and-stably-ordered
20. facet-availability-is-independent
21. card-and-nested-state-are-immutable
22. deterministic-serialization
23. non-authoritative-no-generic-combined-credential-state
24. architecture-boundary

Compile-time evidence additionally proves:
- Credential Card and nested facets/counters are immutable;
- facet kind and availability values are controlled;
- `authorizationAuthority` is exactly `false`;
- lifecycle state is exactly `null` in Slice 03;
- compose requires `ProfessionalPassportProjection`;
- document binding requires `CredentialArtifact`.

Predecessor evidence is mandatory: branch ancestry must include reviewed Slice 02 merge `953dac4785d613c9ab0c7247e8064f7de2b657de`; Slice 02 and Slice 01 regressions plus FV-12 Professional Passport must pass.
