# CALPQ M01 Audit Ledger Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0014-T`

Mandatory post-M00 scenarios:

1. Domain event and audit entry remain separate records.
2. Audit entry links to exact command/event/decision IDs.
3. Correction creates a new linked entry instead of rewriting history.
4. Retry does not create a second authoritative business decision.
5. Per-stream ordering is deterministic without requiring global ordering.
6. Entry hash changes when governed entry content changes.
7. Broken integrity evidence yields explicit review/uncertainty.
8. Valid integrity evidence does not promote an unverified claim.
9. Algorithm/key rotation preserves old integrity-verification metadata.
10. `AS_WAS` replay uses the historical rule/source/evidence versions.
11. `AS_IS` replay may differ and explains why.
12. Replay never mutates aggregate state or issues a grant.
13. Missing historical input yields `INPUT_MISSING` or `VERSION_UNAVAILABLE`.
14. Prior defect creates a new corrective review/audit record.
15. Compliance export includes a versioned manifest and package integrity metadata.
16. Export excludes unrelated credentials and source documents by default.
17. Redaction is explicit in the export manifest.
18. Export cannot bypass AccessDecision or declared purpose.
19. Audit metadata prefers references over duplicated sensitive payloads.
20. Privacy lifecycle limits audit/source retention independently by documented basis.
21. Preservation hold never widens access permissions.
22. Lawfully unavailable historical payload is not reconstructed by AI.
23. Audit ledger does not become an event-sourcing requirement.
24. Provider/storage replacement does not change Core audit semantics.
25. PREP-0014 remains `NOT_ADMITTED_FOR_IMPLEMENTATION` while M00 is blocked.
