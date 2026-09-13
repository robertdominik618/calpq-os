# CALPQ M01 Persistence / Transaction Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0017-T`

Mandatory scenarios:

1. Domain UUID remains canonical; DB sequence is not domain identity.
2. ORM mapping cannot invent domain lifecycle state.
3. Production schema change requires explicit SQL migration.
4. Applied migration checksum mismatch is rejected/reviewed.
5. Same command ID twice causes one accepted transition.
6. Stale expected revision cannot overwrite newer aggregate state.
7. Accepted state, outbox event and command outcome commit atomically.
8. Failure before commit exposes no accepted partial transition.
9. Publication failure after commit does not roll back domain truth.
10. Publisher retry does not re-run aggregate transition.
11. Duplicate event delivery does not repeat a protected side effect.
12. Consumer dedup uses stable event identity.
13. At-least-once delivery is explicit; exactly-once is not falsely claimed.
14. Global event ordering is not assumed.
15. Projection checkpoint is operational metadata only.
16. Projection rebuild cannot issue or revoke AuthorizationGrant.
17. Search-index lag cannot change eligibility truth.
18. Cross-aggregate invariant uses explicit reviewed consistency policy.
19. Serialization/deadlock retry preserves logical command identity when intent is unchanged.
20. Network call is not hidden inside deterministic Core.
21. External observation records exact source/version used by commit.
22. Legal rule version change is not implemented as schema migration.
23. Schema migration cannot rewrite historical decision semantics.
24. Expand/contract migration preserves compatibility window.
25. Large backfill is resumable/checkpointed and verifiable.
26. New constraint rollout can be staged/validated without changing domain meaning.
27. Broad cascade is not default for governed historical records.
28. Original binary artifact identity/hash remains stable across metadata schema changes.
29. Missing object-storage reference becomes integrity/review condition.
30. Derived projection divergence may be rebuilt from authoritative inputs.
31. Authoritative history is not repaired by ad-hoc DB edit.
32. Material correction retains provenance/audit linkage.
33. Restore triggers reconciliation before regulated processing is declared healthy.
34. Authoritative integrity uncertainty fails closed for affected regulated decisions.
35. PREP-0017 remains design-only while M00 feature development is frozen.
