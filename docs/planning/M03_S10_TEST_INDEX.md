# CALPQ M03 Slice 10 Test Index — Integration Evidence & UX Boundaries

Status: `42 OF 42 EXECUTABLE / PENDING CI`
ID: `CALPQ-M03-S10-TEST-0001`
Tracking issue: #79

Reviewed predecessor merge: `1d87412aa54a18bda4c8015824085102a5a73055`.

## Mandatory runtime scenarios
1. `M03S10-01` authoritative M02 assessment drives the journey.
2. `M03S10-02` Dashboard preserves assessment identity and outcome.
3. `M03S10-03` authoritative evaluation time stays separate from projection generation time.
4. `M03S10-04` Passport Summary contains the detail assessment exactly once.
5. `M03S10-05` Credential Card preserves four distinct facets.
6. `M03S10-06` unavailable document source remains separate from eligibility.
7. `M03S10-07` verified evidence does not imply satisfied eligibility.
8. `M03S10-08` unavailable lifecycle source does not imply revocation.
9. `M03S10-09` eligibility facet preserves authoritative assessment identity/outcome/time.
10. `M03S10-10` explicit `Why?` affordance exists for all card facets.
11. `M03S10-11` eligibility explanation preserves atomic requirement reasons.
12. `M03S10-12` explanation preserves governed evidence references.
13. `M03S10-13` timeline contains authoritative eligibility event at exact governed time.
14. `M03S10-14` projection `generatedAt` is never promoted into activity history.
15. `M03S10-15` verification without governed event time becomes explicit omission.
16. `M03S10-16` timeline provenance matches the authoritative decision.
17. `M03S10-17` guidance surfaces only non-satisfied conditions.
18. `M03S10-18` absent governed action is explicitly unavailable.
19. `M03S10-19` explicit governed action survives guidance and approved search.
20. `M03S10-20` credential search uses approved query models and governed references.
21. `M03S10-21` search/ranking/decision/authorization authority remains zero.
22. `M03S10-22` responsive flow contains all seven material sections.
23. `M03S10-23` responsive section order is preserved.
24. `M03S10-24` mobile and web preserve identical governed content.
25. `M03S10-25` compact flow hides no material section.
26. `M03S10-26` expanded layout changes layout, not truth.
27. `M03S10-27` accessibility section count/order matches responsive flow.
28. `M03S10-28` all material sections are keyboard reachable in governed order.
29. `M03S10-29` all material sections are screen-reader visible.
30. `M03S10-30` status meaning is never color-only.
31. `M03S10-31` `cs-CZ` renders human presentation labels.
32. `M03S10-32` `en-GB` renders human presentation labels.
33. `M03S10-33` locale switch preserves machine semantics.
34. `M03S10-34` locale switch preserves governed content.
35. `M03S10-35` canonical UTC truth is invariant.
36. `M03S10-36` assessment/credential/requirement identities and versions are preserved end-to-end.
37. `M03S10-37` provenance identity is preserved across explanation/timeline/guidance/responsive/accessibility.
38. `M03S10-38` all M03 presentation authority flags remain exact false.
39. `M03S10-39` serialized journey contains no `AuthorizationGrant` or collapsed generic `valid` truth.
40. `M03S10-40` serialization is deterministic and presentation outputs are immutable.
41. `M03S10-41` cross-subject search fails closed.
42. `M03S10-42` missing localization fails closed and cross-M03 architecture boundaries hold.

## Compile-time proof
`packages/application/test/m03-s10-types.compile.ts` proves exact-false authority markers and exact-true accessibility flags while rejecting mutation of responsive/accessibility collections, keyboard order, localized labels and machine semantic collections.

## Dedicated runner
`tests/m03_s10_integration_ux_boundary_test.sh` requires:
- formal M03 admission;
- ancestry from reviewed S09 merge `1d87412aa54a18bda4c8015824085102a5a73055`;
- exactly 42 runtime tests;
- strict TypeScript 7.0.2 application typecheck;
- exact S10 execution-package wording;
- no UI/provider/DOM/ambient-locale/time/randomness/domain-authority leakage across the full M03 presentation source surface;
- predecessor runtime suites S09→S01 exactly once;
- relevant FV/Core/admission/architecture regressions.

No mandatory scenario is waived or deferred.
