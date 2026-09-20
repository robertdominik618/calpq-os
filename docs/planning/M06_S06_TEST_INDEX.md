# M06 Slice 06 — Mandatory Test Index

Status: `PLANNED / NO EXECUTED RESULTS CLAIMED`. Tracking #150; epic #36.
All IDs must execute in documented order with zero skipped/todo tests. Contract: M06_S06_IMPLEMENTATION_CONTRACT.md.
Architecture/test preparation may exist before predecessor post-merge CI completion; activation/source may not.

| ID | Required scenario |
|---|---|
| M06S06-001 | Immutable dependency node preserves exact reference, type, version and provenance |
| M06S06-002 | Ungoverned or empty node reference rejected |
| M06S06-003 | Unknown dependency node type rejected |
| M06S06-004 | Versioned node requires explicit bounded version identity |
| M06S06-005 | Node known-at instant is explicit and governed |
| M06S06-006 | Node provenance reference is mandatory |
| M06S06-007 | Node scope metadata is copied and frozen |
| M06S06-008 | Node serialization exposes no raw domain payload |
| M06S06-009 | Separate versioned node preserves prior node identity |
| M06S06-010 | Duplicate logical reference cannot silently replace prior node |
| M06S06-011 | Immutable edge preserves exact source target kind mode and provenance |
| M06S06-012 | Unknown edge kind rejected |
| M06S06-013 | Unknown impact mode rejected |
| M06S06-014 | Self edge rejected |
| M06S06-015 | Foreign edge endpoint rejected by graph construction |
| M06S06-016 | Duplicate edge identity rejected |
| M06S06-017 | Edge direction is preserved and never reversed |
| M06S06-018 | SUPERSEDES lineage remains distinguishable from dependency propagation |
| M06S06-019 | Edge known-at chronology is explicit |
| M06S06-020 | Edge metadata is copied and frozen |
| M06S06-021 | Graph snapshot requires governed identity and version |
| M06S06-022 | Empty graph rejected for active traversal use |
| M06S06-023 | Node collection is bounded and dense |
| M06S06-024 | Edge collection is bounded and dense |
| M06S06-025 | Duplicate node reference rejected |
| M06S06-026 | Every edge endpoint must exist in same graph snapshot |
| M06S06-027 | Graph scope tenant is explicit |
| M06S06-028 | Graph scope organization is explicit |
| M06S06-029 | Graph subject scope is explicit where subject-scoped |
| M06S06-030 | Cross-scope node cannot enter graph without exact scope compatibility |
| M06S06-031 | Disconnected components are preserved without fabricated links |
| M06S06-032 | Caller node ordering normalizes deterministically |
| M06S06-033 | Caller edge ordering normalizes deterministically |
| M06S06-034 | Graph serialization is deeply readonly |
| M06S06-035 | Graph serialization excludes storage locators secrets and provider payloads |
| M06S06-036 | Graph capture/knowledge chronology is validated |
| M06S06-037 | Equivalent graph input ordering yields byte-stable snapshot |
| M06S06-038 | Maximum bounded graph accepted |
| M06S06-039 | Graph node budget overflow rejected |
| M06S06-040 | Graph edge budget overflow rejected |
| M06S06-041 | Change event preserves exact event identity and controlled change type |
| M06S06-042 | Unknown change type rejected |
| M06S06-043 | Change event root must exist in exact graph |
| M06S06-044 | Change event occurred-at and observed-at chronology validated |
| M06S06-045 | Future-observed event relative to evaluation horizon rejected |
| M06S06-046 | Effective-from may be future without changing current legal state |
| M06S06-047 | CLOCK_BOUNDARY_REACHED remains derived temporal trigger only |
| M06S06-048 | Verified event preserves VERIFIED state without upgrading authority |
| M06S06-049 | UNVERIFIED event remains unverified |
| M06S06-050 | REVIEW_REQUIRED event remains review-required |
| M06S06-051 | Event provenance is mandatory and bounded |
| M06S06-052 | Event jurisdiction/scope mismatch fails closed |
| M06S06-053 | Event correlation and causation references remain explicit |
| M06S06-054 | Event serialization excludes source body and provider data |
| M06S06-055 | Explicit scoped traversal invocation required |
| M06S06-056 | Access denial occurs before graph exposure |
| M06S06-057 | Cross-tenant traversal denied |
| M06S06-058 | Cross-organization traversal denied |
| M06S06-059 | Subject identity mismatch denied |
| M06S06-060 | Subject kind mismatch denied |
| M06S06-061 | Actor identity mismatch denied |
| M06S06-062 | Actor kind mismatch denied |
| M06S06-063 | Purpose mismatch denied |
| M06S06-064 | Correlation mismatch denied |
| M06S06-065 | Operation and field authorization required |
| M06S06-066 | Access decision reference mismatch denied |
| M06S06-067 | Evaluation instant must match governed invocation horizon |
| M06S06-068 | Allowed target types must be bounded and controlled |
| M06S06-069 | Traversal maximum depth must be explicit and bounded |
| M06S06-070 | Traversal candidate budget must be explicit and bounded |
| M06S06-071 | Traversal path budget must be explicit and bounded |
| M06S06-072 | Root event traverses downstream edges only |
| M06S06-073 | Incoming-only predecessor is not traversed as downstream impact |
| M06S06-074 | Unrelated disconnected component is excluded |
| M06S06-075 | Reachable intermediate node may connect to allowed downstream target |
| M06S06-076 | Target type outside allowed set is not emitted |
| M06S06-077 | Exact directed dependency path explains candidate inclusion |
| M06S06-078 | Multiple deterministic paths to same target are retained without duplicate candidate |
| M06S06-079 | Candidate dedup key is stable for equivalent governed input |
| M06S06-080 | Changed graph version changes candidate identity |
| M06S06-081 | Changed event identity changes candidate identity |
| M06S06-082 | Changed target identity changes candidate identity |
| M06S06-083 | MANDATORY edge path produces mandatory candidate for verified event |
| M06S06-084 | ADVISORY edge path produces advisory candidate for verified event |
| M06S06-085 | REVIEW_ONLY edge path produces review-only candidate |
| M06S06-086 | Unverified event forces review-only candidate |
| M06S06-087 | Review-required event forces review-only candidate |
| M06S06-088 | Mixed-mode path resolves to safest review boundary deterministically |
| M06S06-089 | Reachability alone does not fabricate material impact beyond configured edges |
| M06S06-090 | SUPERSEDES-only historical lineage does not silently invalidate downstream target |
| M06S06-091 | Cycle re-entry is detected on active path |
| M06S06-092 | Cycle branch terminates without infinite recursion |
| M06S06-093 | Cycle metadata is deterministic across edge input order |
| M06S06-094 | Cycle-bound candidate is marked review-required |
| M06S06-095 | Independent acyclic branch continues despite separate cycle |
| M06S06-096 | Depth budget exhaustion produces explicit review-required incompleteness |
| M06S06-097 | Candidate budget exhaustion fails closed without false completeness |
| M06S06-098 | Path budget exhaustion fails closed without silent truncation |
| M06S06-099 | Future-effective verified event may register future impact metadata |
| M06S06-100 | Future-effective event does not claim present compliance change |
| M06S06-101 | Historical node and edge inputs remain unchanged after traversal |
| M06S06-102 | Traversal output preserves negative authority flags |
| M06S06-103 | Traversal output is deeply readonly and metadata-only |
| M06S06-104 | Identical replay is byte-stable and does not emit side effects |
