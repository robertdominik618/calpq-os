# CALPQ M03 Slice 09 Test Index — Accessibility & Localization Foundations

Status: `34 OF 34 EXECUTABLE / VERIFIED`
ID: `CALPQ-M03-S09-TEST-0001`

1. query-input: responsive-flow-input-required
2. localization-catalog-input-required
3. locale-is-controlled
4. catalog-entry-type-required
5. catalog-duplicate-keys-rejected
6. catalog-text-required
7. semantic-reference-preserves-exact-machine-code
8. semantic-label-type-required
9. duplicate-semantic-code-rejected
10. missing-semantic-reference-fails-closed
11. extra-semantic-reference-fails-closed
12. missing-section-localization-fails-closed
13. missing-semantic-localization-fails-closed
14. authoritative-responsive-source-rejected
15. dashboard-main-landmark
16. search-search-landmark
17. non-dashboard-sections-region-landmarks
18. heading-levels-semantic
19. keyboard-order-follows-governed-order
20. keyboard-reachability-all-sections
21. screen-reader-visibility-all-sections
22. status-meaning-never-color-only
23. status-semantics-preserve-machine-code
24. cs-cz-localized-labels
25. en-gb-localized-labels
26. locale-switch-preserves-section-metadata
27. locale-switch-preserves-governed-content
28. locale-switch-preserves-machine-semantics
29. source-references-preserved
30. canonical-utc-content-preserved
31. canonical-time-policy-does-not-convert-timezone
32. search-section-is-optional-and-localized-when-present
33. root-nested-catalog-immutability-and-deterministic-serialization
34. authority-zero-and-architecture-boundary

Strict compile-time evidence proves controlled locale typing, literal locale constants, literal false authority flags, literal accessibility booleans and readonly catalog/section/machine-semantic state.

Reviewed predecessor evidence is mandatory: branch ancestry includes M03 Slice 08 reviewed merge `d6ce5ab80b07c8f5802193d33f81437c04e4c21c`.

## Verified execution
On `7c971d0f393c8ee9b13c71974fd98d6205519c9f`:
- all 34 runtime scenarios PASS;
- strict TypeScript proof PASS;
- dedicated S09 workflow #6 SUCCESS;
- all 25/25 observed workflow runs SUCCESS.

Initial workflow #4 also passed all 34 runtime tests; its sole failure was the compile-proof narrowing assertion corrected in `7c971d0f393c8ee9b13c71974fd98d6205519c9f`. No runtime scenario or mandatory guard was waived or weakened.

No mandatory test is waived or deferred.
