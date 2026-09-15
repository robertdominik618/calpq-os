# CALPQ M03 Slice 06 — Test Index

Status: `IMPLEMENTING / 34 MANDATORY RUNTIME SCENARIOS`
ID: `CALPQ-M03-S06-TEST-0001`

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

## Compile-time proof
`packages/application/test/m03-s06-types.compile.ts` proves readonly root/nested contracts and literal `false` authority markers.

## Source/architecture guards
`tests/m03_s06_missing_condition_next_action_test.sh` additionally rejects:
- UI/framework/provider imports in `src/guidance`;
- ambient time/randomness;
- lifecycle/authorization authority terms;
- reason-code text heuristics such as `startsWith`, `match`, case conversion or string search;
- absence of explicit governed/unavailable action semantics;
- ancestry that does not contain reviewed Slice 05 merge `41ed1dc445276cf88d5a3584a7d259d24c2f96b1`.

## Embedded regression
The dedicated runner executes M03 S05, S04, S03, S02, S01, FV-12, FV-11, M03 Admission and architecture-boundary regression gates.

No test is optional. Final CI evidence is recorded separately after a green final head.
