# M06 Slice 08 — Mandatory Test Index

Status: `PLANNED / NO EXECUTED RESULTS CLAIMED`
Tracking #154; epic #36.
Owner authorization: **SCHVALUJI MERGE PR #153 (Pull Request č. 153 – návrh na sloučení změn) A POKRAČOVÁNÍ NA M06 (milník 06) SLICE 08 (implementační část 08).**

This index is an executable acceptance contract. All 120 IDs must exist exactly once, execute in order and finish with zero skipped/todo/only cases before Slice 08 can be called validated.

## Semantic boundary

**compliance projection != authorization; current status != historical status; future risk != current non-compliance; review required != failure; missing facts != optimistic compliance; organization summary != assignment authority**

## Mandatory product scenarios

| ID | Required scenario |
|---|---|
| M06S08-001 | scope identity kind and version immutable |
| M06S08-002 | empty scope reference rejected |
| M06S08-003 | unknown scope kind rejected |
| M06S08-004 | tenant and organization scope required |
| M06S08-005 | subject scope requires subject |
| M06S08-006 | organization scope forbids subject identity |
| M06S08-007 | activity scope requires activity reference |
| M06S08-008 | assignment scope requires subject activity and assignment |
| M06S08-009 | assignment reference forbidden outside assignment scope |
| M06S08-010 | jurisdiction reference mandatory |
| M06S08-011 | credential scope reference optional and bounded |
| M06S08-012 | scope serialization deeply readonly |
| M06S08-013 | equivalent scope input byte stable |
| M06S08-014 | distinct scope kind changes serialized identity |
| M06S08-015 | condition fact identity immutable |
| M06S08-016 | unknown condition type rejected |
| M06S08-017 | unknown condition state rejected |
| M06S08-018 | unknown timing rejected |
| M06S08-019 | unknown source kind rejected |
| M06S08-020 | condition fact requires exact scope |
| M06S08-021 | blocking flag must be boolean |
| M06S08-022 | action-required flag must be boolean |
| M06S08-023 | current fact effective time cannot be future |
| M06S08-024 | future fact effective time must be future |
| M06S08-025 | fact knowledge horizon cannot exceed evaluation |
| M06S08-026 | fact validity cannot predate fact evaluation |
| M06S08-027 | baseline source forbids reevaluation decision reference |
| M06S08-028 | reevaluation source requires decision reference |
| M06S08-029 | reevaluation source reference equals decision reference |
| M06S08-030 | source version must be governed or null |
| M06S08-031 | verification state must be governed |
| M06S08-032 | evidence references bounded dense |
| M06S08-033 | duplicate evidence reference rejected |
| M06S08-034 | condition references bounded dense |
| M06S08-035 | duplicate condition reference rejected |
| M06S08-036 | conditional satisfaction requires explicit conditions |
| M06S08-037 | not-applicable fact cannot be blocking |
| M06S08-038 | not-applicable fact cannot require action |
| M06S08-039 | reason codes bounded and unique |
| M06S08-040 | provenance reference mandatory |
| M06S08-041 | fact serialization safe metadata only |
| M06S08-042 | explicit scoped invocation required |
| M06S08-043 | denial occurs before fact disclosure |
| M06S08-044 | cross-tenant invocation denied |
| M06S08-045 | cross-organization invocation denied |
| M06S08-046 | foreign subject identity denied |
| M06S08-047 | foreign subject kind denied |
| M06S08-048 | actor identity mismatch denied |
| M06S08-049 | actor kind mismatch denied |
| M06S08-050 | purpose mismatch denied |
| M06S08-051 | correlation mismatch denied |
| M06S08-052 | continuous-compliance operation required |
| M06S08-053 | continuous-compliance field authorization required |
| M06S08-054 | access-decision reference must match |
| M06S08-055 | evaluation instant matches request horizon |
| M06S08-056 | as-known horizon cannot exceed evaluation |
| M06S08-057 | max-facts budget explicit bounded |
| M06S08-058 | fact scope must be exact projection scope |
| M06S08-059 | future fact beyond projection horizon rejected |
| M06S08-060 | stale current fact is not optimistic compliance |
| M06S08-061 | empty fact set yields indeterminate |
| M06S08-062 | one verified current satisfied fact yields compliant |
| M06S08-063 | multiple verified satisfied facts yield compliant |
| M06S08-064 | conditional current fact yields compliant-with-conditions |
| M06S08-065 | satisfied plus conditional yields compliant-with-conditions |
| M06S08-066 | verified current blocking unsatisfied yields non-compliant |
| M06S08-067 | verified current nonblocking unsatisfied yields at-risk |
| M06S08-068 | known non-compliance takes precedence over review uncertainty |
| M06S08-069 | known non-compliance takes precedence over indeterminate uncertainty |
| M06S08-070 | current review-required fact yields review-required |
| M06S08-071 | current indeterminate fact yields indeterminate |
| M06S08-072 | review-required takes precedence over indeterminate |
| M06S08-073 | future blocking unsatisfied creates at-risk not current non-compliance |
| M06S08-074 | future review creates at-risk not current review-required |
| M06S08-075 | future indeterminate creates at-risk not current indeterminate |
| M06S08-076 | all current not-applicable facts yield not-applicable |
| M06S08-077 | not-applicable current plus future impact yields at-risk |
| M06S08-078 | not-applicable plus applicable satisfied yields compliant |
| M06S08-079 | current review-required plus future risk remains review-required |
| M06S08-080 | current indeterminate plus future risk remains indeterminate |
| M06S08-081 | current non-compliance plus future risk remains non-compliant |
| M06S08-082 | verified current action-required yields at-risk |
| M06S08-083 | conditional fact preserves condition references |
| M06S08-084 | projection reason codes explain final status |
| M06S08-085 | fact input ordering does not change final status |
| M06S08-086 | baseline-only projection requires no reevaluation batch |
| M06S08-087 | reevaluation fact without supplied batch rejected |
| M06S08-088 | supplied reevaluation batch accepted |
| M06S08-089 | foreign reevaluation decision reference rejected |
| M06S08-090 | reevaluation decision target must match fact target |
| M06S08-091 | reevaluation review decision requires review fact |
| M06S08-092 | reevaluation indeterminate decision requires indeterminate fact |
| M06S08-093 | reevaluation future-impact decision requires future timing |
| M06S08-094 | reevaluation current decision requires current timing |
| M06S08-095 | reevaluation action-required decision requires action flag |
| M06S08-096 | reevaluation correlation must match fact |
| M06S08-097 | reevaluation horizon cannot exceed projection horizon |
| M06S08-098 | unchanged reevaluation may support current satisfied condition |
| M06S08-099 | status-changed reevaluation may support current unsatisfied condition |
| M06S08-100 | review batch cannot become optimistic compliance through mismatched fact |
| M06S08-101 | reevaluation object remains unchanged |
| M06S08-102 | projection retains exact scope reference and kind |
| M06S08-103 | projection retains jurisdiction |
| M06S08-104 | projection retains evaluation and knowledge instants |
| M06S08-105 | projection exposes canonical source-version context |
| M06S08-106 | projection separates current and future fact references |
| M06S08-107 | projection exposes blocking fact references |
| M06S08-108 | projection exposes conditional fact references |
| M06S08-109 | projection exposes review fact references |
| M06S08-110 | projection exposes indeterminate fact references |
| M06S08-111 | projection exposes action-required fact references |
| M06S08-112 | projection exposes reevaluation decision references |
| M06S08-113 | organization projection cannot infer assignment compliance |
| M06S08-114 | assignment inference remains unauthorized for every scope |
| M06S08-115 | projection output deeply readonly |
| M06S08-116 | facts and scope remain unchanged after projection |
| M06S08-117 | identical replay is byte stable |
| M06S08-118 | safe output excludes raw storage contact and provider payloads |
| M06S08-119 | all authority and mutation flags remain negative |
| M06S08-120 | no notification provider or event side effect occurs |

## Additional mandatory gates

- 16 ordered Slice 08 scope/governance tests.
- 24 readonly/public-contract compile assertions under strict Application TypeScript configuration.
- Exact architecture-first ancestry: contract -> test index -> verified-predecessor activation -> executable specs -> source.
- Exact governed file delta; no Core/provider/UI/database/scheduler expansion.
- Exact successor compatibility for Slice 07, Slice 06, Slice 05 and Slice 04 governance helpers only.
- Unchanged Slice 07/Slice 06/Slice 05/Slice 04/Slice 03/Slice 02/Slice 01 and all transitive predecessor runtime/architecture controls on the current candidate checkout.
- Full same-head pull-request workflow matrix independently complete.
- No ambient time, random ID generation, provider/network call or model inference inside the Slice 08 source.
- No actual credential/authorization/assignment mutation, notification send, provider invocation, event emission, physical deletion or production release.

The index defines required evidence only. It does not claim that any scenario has executed or passed.
