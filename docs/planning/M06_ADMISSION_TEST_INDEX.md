# M06 Formal Admission — Mandatory Governance Tests

Status: `CONTRACT BEFORE EXECUTABLE CHECKS / EXECUTION RESULTS PENDING`
Tracking #132 / epic #36. This index does not assert product implementation or future CI success.
Every identity must execute without skip/todo/only. These tests are separate from the unchanged preparation, M04 and M05 runtime suites.

| ID | Required behavior |
|---|---|
| M06ADM-01 | Exact owner decision accepted |
| M06ADM-02 | Wrong or invented approval rejected |
| M06ADM-03 | Unknown/missing decision fields rejected |
| M06ADM-04 | Changed milestone, issue or decision identity rejected |
| M06ADM-05 | Wrong preparation and accepted anchors rejected |
| M06ADM-06 | Wrong execution entry or additional slice rejected |
| M06ADM-07 | Unconditional activation or release permission rejected |
| M06ADM-08 | Inflation of completed slices or v1 progress rejected |
| M06ADM-09 | Blocking reviews or false-like permission strings rejected |
| M06ADM-10 | Exact complete admission file scope accepted |
| M06ADM-11 | Product and unrelated admission files rejected |
| M06ADM-12 | Missing, duplicate or incomplete admission files rejected |
| M06ADM-13 | Admission delete, rename and mode changes rejected |
| M06ADM-14 | M03 successor patch preserves earlier checks |
| M06ADM-15 | M04 successor patch preserves earlier checks |
| M06ADM-16 | M05 successor patch preserves runtime checks |
| M06ADM-17 | Shared readiness preserves original 72 criteria and slices |
| M06ADM-18 | Preparation dispatch preserves original pure validators |
| M06ADM-19 | Preparation runtime gate keeps all test invocations |
| M06ADM-20 | Unknown/ambiguous guard patch or extra modification rejected |
| M06ADM-21 | M06 package status change preserves all original scope |
| M06ADM-22 | Exact activation shape and evidence references accepted |
| M06ADM-23 | Fake activation hashes and preparation-as-admission rejected |
| M06ADM-24 | Foreign repository/PR or missing activation evidence rejected |
| M06ADM-25 | Wrong activation slice/state/permission rejected |
| M06ADM-26 | Explicit S01 additive path scope accepted |
| M06ADM-27 | S02/Core/provider and old runtime changes rejected |
| M06ADM-28 | Activation mutation and deletion/rename/mode changes rejected |
| M06ADM-29 | Package configuration only adds exact S01 entries |
| M06ADM-30 | Altered predecessor package entries or compile options rejected |
| M06ADM-31 | Missing/duplicate/reordered test identities rejected |
| M06ADM-32 | Missing/invalid activation cannot be silently used as admission mode |

Repository gate additionally verifies actual Git ancestry/tree/parent relations, closed preparation and admission ranges, frozen records, architecture-before-source, current-checkout runtime evidence and all required same-head workflows. Pure fixture tests alone do not prove live owner authorization, CI service identity or a real merge.
