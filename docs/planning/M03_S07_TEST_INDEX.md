# CALPQ M03 Slice 07 Test Index — Intent-Oriented Search

Status: `36 OF 36 EXECUTABLE / VERIFIED`
ID: `CALPQ-M03-S07-TEST-0001`

1. query-input-required
2. models-must-use-approved-query-model
3. subject-reference-is-required
4. intent-is-controlled
5. query-requires-one-to-eight-terms
6. normalized-duplicate-terms-are-rejected
7. limit-is-bounded
8. passport-summary-factory-requires-governed-type
9. passport-summary-must-remain-non-authoritative
10. credential-card-factory-requires-governed-non-authoritative-type
11. explanation-source-must-remain-non-authoritative
12. timeline-source-must-remain-non-authoritative
13. guidance-source-must-remain-non-authoritative
14. cross-subject-model-is-rejected
15. credential-intent-searches-only-passport-and-card-records
16. evidence-intent-searches-only-evidence-approved-record-kinds
17. explanation-intent-can-find-authoritative-reason-code-presentation
18. activity-intent-searches-only-timeline
19. next-action-intent-searches-only-guidance
20. search-never-recalculates-governed-state
21. exact-match-is-supported
22. prefix-match-is-supported
23. every-query-term-must-match-the-same-record
24. case-and-nfkc-normalization-are-deterministic
25. exact-match-ranks-above-prefix-match
26. ranking-has-stable-lexical-tie-break
27. result-is-independent-of-input-model-order
28. duplicate-approved-record-is-rejected
29. limit-and-truncated-state-are-explicit
30. no-result-state-is-explicit
31. governed-references-are-preserved-in-results
32. query-model-result-and-nested-arrays-are-immutable
33. serialization-is-deterministic
34. search-ranking-decision-and-authorization-authority-are-zero
35. architecture-boundary-excludes-provider-ai-fuzzy-and-ambient-state
36. architecture-boundary-excludes-new-domain-authority

Strict compile-time evidence additionally proves immutable query/results, controlled intent typing and exact false authority flags.

Reviewed predecessor evidence is verified: branch ancestry includes M03 Slice 06 reviewed merge `54189c3a08cceb5c457a595a18288fd59e674bb9`.

Verified implementation head: `a4d742f43a4fca93baf289e68df2005b4fd14bdf`.
Dedicated workflow `M03 Slice 07 Intent Search #6` — SUCCESS. All 23 observed PR-triggered workflow runs on the verified implementation head completed successfully.

No mandatory test was waived or deferred. Hard blockers: 0.
