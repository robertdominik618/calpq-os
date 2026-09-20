# M06 Slice 09 — Mandatory Test Index

Status: `PLANNED / NO EXECUTED RESULTS CLAIMED`
Tracking #156; epic #36.
Owner authorization: **SCHVALUJI MERGE PR #155 (Pull Request č. 155 – návrh na sloučení změn) A POKRAČOVÁNÍ NA M06 (milník 06) SLICE 09 (implementační část 09).**

This index is an executable acceptance contract. All 128 IDs must exist exactly once, execute in order and finish with zero skipped/todo/only cases before Slice 09 can be called validated.

## Semantic boundary

**AS_WAS != AS_IS; replay != authorization; replay match != source truth proof; current rules must not backfill historical truth; missing history != optimistic reconstruction; divergence != mutation**

## Mandatory product scenarios

| ID | Required scenario |
|---|---|
| M06S09-001 | immutable original decision anchor exact identity |
| M06S09-002 | anchor reference required |
| M06S09-003 | controlled target type required |
| M06S09-004 | original decision reference required |
| M06S09-005 | tenant and organization scope required |
| M06S09-006 | subject scope is governed when present |
| M06S09-007 | jurisdiction reference required |
| M06S09-008 | original semantic outcome required |
| M06S09-009 | original evaluated-at explicit |
| M06S09-010 | original as-known-at explicit |
| M06S09-011 | original evaluation cannot exceed knowledge horizon |
| M06S09-012 | rule version references canonical |
| M06S09-013 | source version references canonical |
| M06S09-014 | contract version references canonical |
| M06S09-015 | evidence references canonical |
| M06S09-016 | duplicate rule version rejected |
| M06S09-017 | duplicate source version rejected |
| M06S09-018 | duplicate contract version rejected |
| M06S09-019 | duplicate evidence reference rejected |
| M06S09-020 | anchor serialization safe and frozen |
| M06S09-021 | immutable replay snapshot exact mode binding |
| M06S09-022 | unknown replay mode rejected |
| M06S09-023 | snapshot must bind exact anchor |
| M06S09-024 | snapshot target reference must be governed |
| M06S09-025 | snapshot target type controlled |
| M06S09-026 | snapshot availability state controlled |
| M06S09-027 | available snapshot requires semantic outcome |
| M06S09-028 | unavailable snapshot forbids semantic outcome |
| M06S09-029 | snapshot evaluated-at explicit |
| M06S09-030 | snapshot as-known-at explicit |
| M06S09-031 | snapshot knowledge cannot exceed evaluation horizon |
| M06S09-032 | snapshot rule versions canonical |
| M06S09-033 | snapshot source versions canonical |
| M06S09-034 | snapshot contract versions canonical |
| M06S09-035 | snapshot evidence references canonical |
| M06S09-036 | snapshot evaluator actor governed |
| M06S09-037 | snapshot provenance mandatory |
| M06S09-038 | snapshot correlation mandatory |
| M06S09-039 | snapshot causation optional governed |
| M06S09-040 | snapshot serialization safe and frozen |
| M06S09-041 | explicit scoped invocation required |
| M06S09-042 | denial occurs before historical disclosure |
| M06S09-043 | cross-tenant replay denied |
| M06S09-044 | cross-organization replay denied |
| M06S09-045 | foreign subject identity denied |
| M06S09-046 | foreign subject kind denied |
| M06S09-047 | actor identity mismatch denied |
| M06S09-048 | actor kind mismatch denied |
| M06S09-049 | purpose mismatch denied |
| M06S09-050 | correlation mismatch denied |
| M06S09-051 | replay operation required |
| M06S09-052 | replay field authorization required |
| M06S09-053 | access-decision reference must match |
| M06S09-054 | anchor scope must match invocation |
| M06S09-055 | replayed-at explicit |
| M06S09-056 | request as-known horizon explicit |
| M06S09-057 | replay horizon cannot exceed request time |
| M06S09-058 | replayed-at cannot predate current evaluation |
| M06S09-059 | requested replay modes non-empty |
| M06S09-060 | duplicate requested mode rejected |
| M06S09-061 | AS_WAS exact original evaluation instant required |
| M06S09-062 | AS_WAS exact original as-known horizon required |
| M06S09-063 | AS_WAS exact rule versions required |
| M06S09-064 | AS_WAS exact source versions required |
| M06S09-065 | AS_WAS exact contract versions required |
| M06S09-066 | AS_WAS exact evidence set required |
| M06S09-067 | AS_WAS exact target identity required |
| M06S09-068 | AS_WAS exact target type required |
| M06S09-069 | AS_WAS exact jurisdiction required |
| M06S09-070 | AS_WAS exact subject scope required |
| M06S09-071 | AS_WAS available equal outcome yields MATCH |
| M06S09-072 | AS_WAS available changed outcome with governed reason yields EXPLAINED_DIVERGENCE |
| M06S09-073 | AS_WAS changed outcome without reason requires review |
| M06S09-074 | AS_WAS input-missing maps INPUT_MISSING |
| M06S09-075 | AS_WAS version-unavailable maps VERSION_UNAVAILABLE |
| M06S09-076 | AS_WAS review snapshot maps REVIEW_REQUIRED |
| M06S09-077 | AS_WAS indeterminate snapshot maps INDETERMINATE |
| M06S09-078 | AS_WAS current rule substitution rejected |
| M06S09-079 | AS_WAS current evidence substitution rejected |
| M06S09-080 | AS_WAS future-known input rejected |
| M06S09-081 | AS_IS keeps target identity |
| M06S09-082 | AS_IS may use changed rule versions |
| M06S09-083 | AS_IS may use changed source versions |
| M06S09-084 | AS_IS may use changed contract versions |
| M06S09-085 | AS_IS may use changed evidence set |
| M06S09-086 | AS_IS evaluation may be later than original |
| M06S09-087 | AS_IS equal outcome yields MATCH |
| M06S09-088 | AS_IS changed outcome with governed reason yields EXPLAINED_DIVERGENCE |
| M06S09-089 | AS_IS changed outcome without reason requires review |
| M06S09-090 | AS_IS input-missing maps INPUT_MISSING |
| M06S09-091 | AS_IS version-unavailable maps VERSION_UNAVAILABLE |
| M06S09-092 | AS_IS review snapshot maps REVIEW_REQUIRED |
| M06S09-093 | AS_IS indeterminate snapshot maps INDETERMINATE |
| M06S09-094 | both requested modes remain separate |
| M06S09-095 | same available outcomes yield SAME_OUTCOME comparison |
| M06S09-096 | different available outcomes yield CHANGED_OUTCOME comparison |
| M06S09-097 | missing mode result yields COMPARISON_UNAVAILABLE |
| M06S09-098 | review mode result lifts comparison to REVIEW_REQUIRED |
| M06S09-099 | indeterminate mode result lifts comparison to INDETERMINATE |
| M06S09-100 | comparison retains original outcome |
| M06S09-101 | comparison retains AS_WAS outcome separately |
| M06S09-102 | comparison retains AS_IS outcome separately |
| M06S09-103 | changed rule reference appears in differences |
| M06S09-104 | changed source reference appears in differences |
| M06S09-105 | changed contract reference appears in differences |
| M06S09-106 | changed evidence reference appears in differences |
| M06S09-107 | divergence reason taxonomy controlled |
| M06S09-108 | duplicate divergence reason rejected |
| M06S09-109 | OTHER_GOVERNED_REASON requires explicit reference |
| M06S09-110 | implementation defect marks corrective review required |
| M06S09-111 | corrective review reference retained without mutation |
| M06S09-112 | replay match does not grant authorization |
| M06S09-113 | historical anchor remains unchanged |
| M06S09-114 | AS_WAS snapshot remains unchanged |
| M06S09-115 | AS_IS snapshot remains unchanged |
| M06S09-116 | caller snapshot order cannot affect output |
| M06S09-117 | requested mode order cannot affect output |
| M06S09-118 | identical governed replay byte stable |
| M06S09-119 | version reference budget overflow rejected |
| M06S09-120 | evidence reference budget overflow rejected |
| M06S09-121 | divergence reason budget overflow rejected |
| M06S09-122 | safe output excludes raw storage contact provider data |
| M06S09-123 | all mutation and authority flags remain negative |
| M06S09-124 | no notification provider or event side effects |
| M06S09-125 | Core historical replay ambiguity cannot become AVAILABLE |
| M06S09-126 | S08 current projection metadata may bind only AS_IS |
| M06S09-127 | S07 reevaluation metadata remains explicit not replay truth |
| M06S09-128 | changed current outcome never rewrites original history |

## Additional mandatory gates
- 16 ordered Slice 09 scope/governance tests.
- 26 readonly/public-contract compile assertions under strict Application TypeScript configuration.
- Exact architecture-first ancestry: contract -> test index -> verified-predecessor activation -> executable specs -> source.
- Exact governed file delta; no Core/provider/UI/database/scheduler expansion.
- Exact successor compatibility for Slice 08, Slice 07, Slice 06, Slice 05 and Slice 04 governance helpers only.
- Unchanged Slice 08/Slice 07/Slice 06/Slice 05/Slice 04/Slice 03/Slice 02/Slice 01 and all transitive predecessor runtime/architecture controls on the current candidate checkout.
- Full same-head pull-request workflow matrix independently complete.
- No ambient time, random ID generation, provider/network call or model inference inside the Slice 09 source.
- No actual credential/authorization/compliance/assignment mutation, notification send, provider invocation, event emission, physical deletion or production release.

The index defines required evidence only. It does not claim that any scenario has executed or passed.
