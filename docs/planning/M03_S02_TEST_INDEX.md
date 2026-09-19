# CALPQ M03 Slice 02 Test Index — Professional Passport Summary & Credential Grouping

Status: `22 OF 22 EXECUTABLE / VERIFIED`
ID: `CALPQ-M03-S02-TEST-0001`

1. explicit-subject-required
2. projection-array-required
3. invalid-projection-rejected
4. empty-summary-supported
5. subject-preserved
6. mixed-subject-rejected
7. duplicate-assessment-rejected
8. governed-source-kind
9. group-by-stable-credential-id
10. separate-credential-groups-sorted
11. multiple-versions-preserved-within-group
12. assessments-not-collapsed-across-versions
13. requirement-set-identities-and-versions-preserved
14. eligibility-outcomes-passthrough-and-counted
15. evaluation-and-generation-instants-preserved
16. evidence-metrics-aggregate-without-promotion
17. deterministic-independent-of-input-order
18. immutable-summary-groups-assessments
19. group-rejects-mixed-credential-identity
20. shared-metrics-preserve-slice01-dashboard-semantics
21. non-authoritative-no-current-latest-valid-inference
22. architecture-boundary

Compile-time evidence proves:
- `ProfessionalPassportSummaryReadModel` and nested group/assessment collections are immutable;
- outcome counters are readonly;
- `authorizationAuthority` is exactly `false`;
- summary input requires `SubjectReference` and `ProfessionalPassportProjection` values;
- Passport summary source kind is controlled.

Verified evidence head: `b077f18aaeb42286eeda62f5821b5a1894c792ea`.
Dedicated workflow `M03 Slice 02 Passport Summary #2` SUCCESS with 22 pass / 0 fail. Reviewed Slice 01 ancestry, Slice 01 regression, FV-12 predecessor regression, M03 admission integrity and architecture boundaries also pass. No mandatory test was waived or deferred.
