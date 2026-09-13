# CALPQ M01 Document Intake Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0009-T`

Mandatory scenarios for post-M00 executable translation:

1. camera/file/email/URL intake create equivalent channel-neutral intake semantics;
2. unsupported input can be rejected or quarantined before extraction;
3. original bytes remain unchanged after OCR;
4. user correction does not overwrite original extraction history;
5. OCR confidence 100% does not create VERIFIED evidence;
6. AI classification does not create `AuthorizationGrant`;
7. user confirmation remains user assertion until separate verification;
8. verifier method and authority are recorded;
9. verification failure is distinguishable from extraction failure;
10. stale verification is not shown as current VERIFIED evidence;
11. valid signature/checksum does not prove current legal authorization by itself;
12. verified document cannot bypass RequirementSet evaluation;
13. document link to credential preserves relation scope and evidence state;
14. same hash means byte identity only, not legal equivalence;
15. replacement document creates a new original artifact;
16. superseded document remains available for historical decision reconstruction;
17. current passport projection can react to evidence invalidation without rewriting history;
18. archive deletion/retention policy is explicit before durable storage;
19. normal logs do not contain document body or extracted sensitive values;
20. external OCR/AI receives only minimum required data;
21. provider change does not alter Core evidence semantics;
22. redacted derivative remains distinct from original;
23. duplicate retry does not create duplicate logical intake when idempotency applies;
24. wrong subject linkage requires correction/review and remains auditable;
25. missing provenance prevents promotion to trusted verification;
26. document expiry may trigger lifecycle re-evaluation but not retroactive mutation;
27. malicious/suspicious input cannot reach normal extraction path before quarantine decision;
28. archive links never transfer professional qualification to another subject;
29. selective sharing uses derivative/minimum disclosure, not automatic original disclosure;
30. technical processing failure never becomes `NOT_SATISFIED` eligibility by itself.
