# M05 Slice 06 — Mandatory Test Index

Status: `52 MANDATORY SCENARIOS`

| ID | Scenario |
|---|---|
| M05S06-01 | Entity kinds are controlled and exact. |
| M05S06-02 | Authority roles are controlled and exact. |
| M05S06-03 | Trust-anchor verification states are exact. |
| M05S06-04 | TrustEntityId requires UUIDv7. |
| M05S06-05 | AuthorityScopeId requires UUIDv7. |
| M05S06-06 | TrustAnchorRecordId requires UUIDv7. |
| M05S06-07 | TrustEntity requires controlled jurisdiction. |
| M05S06-08 | Duplicate entity jurisdictions fail closed. |
| M05S06-09 | Duplicate entity identifiers fail closed. |
| M05S06-10 | Entity effective time is explicit. |
| M05S06-11 | Entity identity collections are immutable. |
| M05S06-12 | AuthorityScope binds exact TrustEntity object. |
| M05S06-13 | Uncontrolled authority role fails closed. |
| M05S06-14 | Scope jurisdiction must be declared by entity. |
| M05S06-15 | Invalid scope effective period fails closed. |
| M05S06-16 | Scope conditions are canonical and immutable. |
| M05S06-17 | Anchor entity must exactly match scope entity. |
| M05S06-18 | Uncontrolled anchor state fails closed. |
| M05S06-19 | Invalid anchor effective period fails closed. |
| M05S06-20 | Anchor retains source snapshot/version. |
| M05S06-21 | Snapshot preserves exact entity/scope/anchor objects. |
| M05S06-22 | Duplicate entity IDs are rejected. |
| M05S06-23 | Duplicate scope IDs are rejected. |
| M05S06-24 | Duplicate anchor IDs are rejected. |
| M05S06-25 | Future-retrieved anchor is rejected from snapshot. |
| M05S06-26 | Snapshot canonicalizes entity ordering. |
| M05S06-27 | Exact entity lookup preserves object identity. |
| M05S06-28 | Snapshot object and arrays are immutable. |
| M05S06-29 | Identity signal strength is controlled. |
| M05S06-30 | Identity signal direction is controlled. |
| M05S06-31 | Identity signal preserves source snapshot provenance. |
| M05S06-32 | Resolution requires distinct identity records. |
| M05S06-33 | No identity evidence yields INDETERMINATE. |
| M05S06-34 | Weak match cannot independently establish SAME_SUBJECT. |
| M05S06-35 | One strong source remains POSSIBLE_MATCH. |
| M05S06-36 | Independent strong sources may establish SAME_SUBJECT. |
| M05S06-37 | Strong conflict fails closed to REVIEW_REQUIRED by policy. |
| M05S06-38 | Explicit conflict policy may yield DIFFERENT_SUBJECTS. |
| M05S06-39 | Weak conflict routes to review. |
| M05S06-40 | Duplicate identity signal references fail closed. |
| M05S06-41 | Identity result is immutable/deterministic. |
| M05S06-42 | Wrong authority role is NOT_AUTHORIZED. |
| M05S06-43 | Wrong claim scope is NOT_AUTHORIZED. |
| M05S06-44 | Wrong jurisdiction is NOT_AUTHORIZED. |
| M05S06-45 | Exact verified authority scope+anchor is AUTHORIZED. |
| M05S06-46 | Conditions produce AUTHORIZED_WITH_CONDITIONS. |
| M05S06-47 | UNVERIFIED anchor requires review. |
| M05S06-48 | STALE anchor requires review. |
| M05S06-49 | REVOKED anchor is NOT_AUTHORIZED. |
| M05S06-50 | Verified/adverse anchor conflict requires review. |
| M05S06-51 | Anchor not yet known at asKnownAt cannot create authority. |
| M05S06-52 | Later revoked snapshot does not rewrite historical result. |
