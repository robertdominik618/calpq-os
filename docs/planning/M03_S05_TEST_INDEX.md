# CALPQ M03 Slice 05 Test Index — Activity Timeline & Decision Provenance

Status: `30 EXECUTABLE SCENARIOS DEFINED`
ID: `CALPQ-M03-S05-TEST-0001`

1. explanation-input-required
2. passport-input-required
3. authoritative-assessment-input-required
4. presentation-inputs-must-remain-non-authoritative
5. subject-binding-must-match
6. assessment-identity-must-match
7. decision-provenance-identity-must-match
8. authoritative-evaluation-instant-must-match
9. eligibility-outcome-is-not-recomputed
10. intakes-must-use-governed-record-type
11. corrections-must-use-governed-record-type
12. intake-must-have-explicit-subject-binding
13. foreign-subject-intake-is-rejected
14. duplicate-intake-is-rejected
15. correction-must-reference-admitted-subject-intake
16. passport-item-provenance-must-match-decision
17. timestamped-verification-requires-verifier-attribution
18. timestamped-verification-requires-record-state
19. document-received-event-uses-explicit-record-time-and-actor
20. correction-event-preserves-explicit-time-and-evidence-links
21. verification-event-is-created-only-from-explicit-verifiedAt
22. verification-without-time-becomes-explicit-omission-not-invented-event
23. eligibility-event-preserves-authoritative-time-outcome-and-reasons
24. decision-provenance-presentation-preserves-authoritative-bindings
25. decision-provenance-rule-binding-fails-closed
26. timeline-is-reverse-chronological-from-governed-times
27. equal-times-use-explicit-non-causal-kind-tie-break
28. deterministic-serialization-and-zero-authority
29. root-and-nested-presentation-state-are-immutable
30. architecture-boundary-no-invented-history-or-authority

Compile-time evidence additionally proves root/event/provenance immutability, exact false authority flags, controlled ordering semantics and governed input types.

Reviewed predecessor evidence is mandatory: branch ancestry must include M03 Slice 04 reviewed merge `378705302a0a4e507018e437bc329b42979e60cb`.

No mandatory test is waived or deferred.
