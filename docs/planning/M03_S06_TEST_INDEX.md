# CALPQ M03 Slice 06 — Test Index

Status: `VERIFIED / 34 MANDATORY RUNTIME SCENARIOS PASS`
ID: `CALPQ-M03-S06-TEST-0001`
Verified implementation head: `babbba6ccf75184b45bdfbd3a75b7a625633ab95`

## Dedicated runtime scenarios
1. authoritative `EligibilityAssessment` input required;
2. `CredentialExplanationReadModel` input required;
3. explanation must remain non-authoritative;
4. subject binding must match;
5. assessment identity must match;
6. credential-definition ID must match;
7. credential-definition version must match;
8. requirement-set ID must match;
9. requirement-set version must match;
10. evaluated-at instant must match;
11. provenance identity must match;
12. rule-set ID must match;
13. rule version must match;
14. explanation requires complete atomic reason set;
15. duplicate explanation requirement reasons rejected;
16. explanation atomic outcome must match authoritative result;
17. explanation reason codes must match exactly and in governed order;
18. satisfied requirements excluded from missing conditions;
19. `NOT_SATISFIED` remains distinct;
20. `INDETERMINATE` remains distinct;
21. `REVIEW_REQUIRED` remains distinct;
22. missing-condition order preserves authoritative atomic order;
23. absence of governed action is explicitly unavailable;
24. governed actions require `GovernedNextActionReference`;
25. governed action assessment identity must match;
26. governed action provenance identity must match;
27. governed action requirement must exist;
28. governed action cannot turn a satisfied requirement into missing;
29. governed action reason must be an authoritative atomic reason code;
30. supporting source must belong to assessment provenance;
31. supporting evidence must belong to assessment provenance;
32. duplicate action references rejected;
33. governed actions become available and are deterministically ordered;
34. deterministic serialization, nested immutability, zero authority and no reason-code action-inference boundary.

Result on verified implementation head: **34/34 PASS**.

## Compile-time proof
`packages/application/test/m03-s06-types.compile.ts` proves readonly root/nested contracts and literal `false` authority markers. Result: **PASS**.

## Source/architecture guards
`tests/m03_s06_missing_condition_next_action_test.sh` verifies:
- no UI/framework/provider imports in `src/guidance`;
- no ambient time/randomness;
- no lifecycle/authorization authority leakage;
- no reason-code text heuristics such as `startsWith`, `match`, case conversion or string search;
- explicit governed/unavailable action semantics exist;
- ancestry contains reviewed Slice 05 merge `41ed1dc445276cf88d5a3584a7d259d24c2f96b1`.

Result: **PASS**.

## Embedded regression
The dedicated runner executes M03 S05, S04, S03, S02, S01, FV-12, FV-11, M03 Admission and architecture-boundary regression gates. Result: **PASS**.

## PR-wide evidence
On `babbba6ccf75184b45bdfbd3a75b7a625633ab95`, all **22/22 observed PR-triggered workflows** completed with `SUCCESS`; failures, queued and in-progress runs: 0.

No test was waived or deferred.
