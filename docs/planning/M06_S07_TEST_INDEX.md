# M06 Slice 07 — Mandatory Test Index

Status: `PLANNED / NO EXECUTED RESULTS CLAIMED`
Tracking #152; epic #36.
Owner authorization: **SCHVALUJI MERGE PR #151 A POKRAČOVÁNÍ NA M06 SLICE 07.**

This index is an executable acceptance contract. All 112 IDs must exist exactly once, execute in order and finish with zero skipped/todo/only cases before S07 can be called validated.

## Semantic boundary

**impact candidate != reevaluation decision; reevaluation decision != authorization mutation; unchanged result != absent audit evidence; future impact != current non-compliance; review required != inferred failure; historical decision != mutable truth**

## Mandatory product scenarios

| ID | Required scenario |
|---|---|
| M06S07-001 | immutable reevaluation fact identity and candidate binding |
| M06S07-002 | empty fact reference rejected |
| M06S07-003 | unknown fact state rejected |
| M06S07-004 | target type is controlled |
| M06S07-005 | target version is explicit when present |
| M06S07-006 | previous decision reference and result are paired |
| M06S07-007 | complete fact requires new result |
| M06S07-008 | review-required fact cannot smuggle result |
| M06S07-009 | indeterminate fact cannot smuggle result |
| M06S07-010 | action-required flag allowed only for complete fact |
| M06S07-011 | evaluator actor is governed |
| M06S07-012 | evaluation instant is explicit |
| M06S07-013 | fact knowledge horizon cannot exceed evaluation instant |
| M06S07-014 | version bindings are bounded dense governed data |
| M06S07-015 | duplicate version binding rejected |
| M06S07-016 | evidence references are bounded dense data |
| M06S07-017 | duplicate evidence reference rejected |
| M06S07-018 | provenance reference is mandatory |
| M06S07-019 | correlation and causation references retained |
| M06S07-020 | fact serialization exposes safe metadata only |
| M06S07-021 | explicit scoped invocation required |
| M06S07-022 | denial occurs before graph or decision disclosure |
| M06S07-023 | cross-tenant invocation denied |
| M06S07-024 | cross-organization invocation denied |
| M06S07-025 | foreign subject identity denied |
| M06S07-026 | foreign subject kind denied |
| M06S07-027 | actor identity mismatch denied |
| M06S07-028 | actor kind mismatch denied |
| M06S07-029 | purpose mismatch denied |
| M06S07-030 | correlation continuity required |
| M06S07-031 | selective reevaluation operation required |
| M06S07-032 | selective reevaluation field authorization required |
| M06S07-033 | access-decision reference must match |
| M06S07-034 | graph scope must match invocation |
| M06S07-035 | change event must bind exact graph |
| M06S07-036 | impact traversal must bind graph and event identities |
| M06S07-037 | impact correlation remains traceable |
| M06S07-038 | evaluation instant matches request horizon |
| M06S07-039 | as-known horizon is explicit and bounded |
| M06S07-040 | decision budget is explicit and bounded |
| M06S07-041 | no-impact traversal yields zero decisions |
| M06S07-042 | fact supplied with no impact candidate rejected |
| M06S07-043 | only S06-selected candidates are processed |
| M06S07-044 | unrelated target fact rejected |
| M06S07-045 | duplicate fact for one candidate rejected |
| M06S07-046 | fact target reference must match candidate |
| M06S07-047 | fact target type must match candidate |
| M06S07-048 | fact target version must match candidate |
| M06S07-049 | candidate dedup identity must match exactly |
| M06S07-050 | required version bindings must match candidate exactly |
| M06S07-051 | fact cannot predate impact evaluation horizon |
| M06S07-052 | future fact beyond batch horizon rejected |
| M06S07-053 | mandatory current candidate consumes exact fact |
| M06S07-054 | advisory current candidate consumes exact fact |
| M06S07-055 | review-only candidate produces review evidence |
| M06S07-056 | fact for review-only candidate rejected |
| M06S07-057 | future-effective candidate registers future impact |
| M06S07-058 | fact for future-effective candidate rejected |
| M06S07-059 | incomplete impact traversal blocks ordinary reevaluation |
| M06S07-060 | facts rejected when impact traversal is incomplete |
| M06S07-061 | cycle-bound candidate remains review required |
| M06S07-062 | traversal budget incompleteness remains review required |
| M06S07-063 | evaluation order uses shortest dependency path |
| M06S07-064 | equal-depth order uses target reference tiebreaker |
| M06S07-065 | complete equal result yields unchanged |
| M06S07-066 | complete changed result yields status changed |
| M06S07-067 | explicit action requirement yields action required |
| M06S07-068 | review evaluator fact yields review required |
| M06S07-069 | indeterminate evaluator fact yields indeterminate |
| M06S07-070 | missing evaluator fact yields indeterminate |
| M06S07-071 | future impact yields future-impact-registered |
| M06S07-072 | review boundary takes precedence over future impact |
| M06S07-073 | previous decision reference retained |
| M06S07-074 | previous result retained |
| M06S07-075 | new evaluated result retained |
| M06S07-076 | evaluator attribution retained |
| M06S07-077 | evidence references retained |
| M06S07-078 | provenance retained |
| M06S07-079 | dependency paths retained |
| M06S07-080 | required versions retained |
| M06S07-081 | triggering change identity retained |
| M06S07-082 | graph identity and version retained |
| M06S07-083 | candidate reason codes retained |
| M06S07-084 | decision reason codes are deterministic |
| M06S07-085 | decision reference is deterministic |
| M06S07-086 | decision dedup key is deterministic |
| M06S07-087 | identical input replay returns identical decision |
| M06S07-088 | new fact identity creates new decision identity |
| M06S07-089 | batch no-impact outcome explicit |
| M06S07-090 | conclusive current batch outcome completed |
| M06S07-091 | review decision lifts batch to review-required |
| M06S07-092 | indeterminate decision lifts batch to indeterminate |
| M06S07-093 | future-only batch outcome future-impact-registered |
| M06S07-094 | mixed unchanged and status-changed remains completed |
| M06S07-095 | review-required precedence over indeterminate |
| M06S07-096 | processing completeness distinguished from conclusiveness |
| M06S07-097 | graph event impact and facts remain unchanged |
| M06S07-098 | output is deeply readonly |
| M06S07-099 | fact input order does not affect byte-stable output |
| M06S07-100 | candidate order comes from dependency depth not caller order |
| M06S07-101 | exact maximum decision budget accepted |
| M06S07-102 | insufficient decision budget fails closed |
| M06S07-103 | evidence reference budget overflow rejected |
| M06S07-104 | version binding budget overflow rejected |
| M06S07-105 | safe output excludes raw storage contact and provider payloads |
| M06S07-106 | all authority and mutation flags remain negative |
| M06S07-107 | no notification provider or event side effect occurs |
| M06S07-108 | replay preserves one logical decision identity |
| M06S07-109 | S06 dependency impact composes directly into S07 |
| M06S07-110 | controlled eligibility outcome text remains evidence not authority |
| M06S07-111 | historical decision is referenced and never overwritten |
| M06S07-112 | changed event or graph version changes reevaluation identity |

## Additional mandatory gates

- 16 ordered S07 scope/governance tests.
- 22 readonly/public-contract compile assertions under strict Application TypeScript configuration.
- Exact architecture-first ancestry: contract -> test index -> verified-predecessor activation -> executable specs -> source.
- Exact governed file delta; no Core/provider/UI/database/scheduler expansion.
- Exact successor compatibility for S06, S05 and S04 governance helpers only.
- Unchanged S06/S05/S04/S03/S02/S01 and all transitive predecessor runtime/architecture controls on the current candidate checkout.
- Full same-head pull-request workflow matrix independently complete.
- No ambient time, random ID generation, provider/network call or model inference inside the S07 source.
- No actual credential/authorization/compliance mutation, notification send, provider invocation, event emission, physical deletion or production release.

The index defines required evidence only. It does not claim that any scenario has executed or passed.
