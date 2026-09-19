# M07 Formal Admission — Mandatory Governance Tests

Status: `CONTRACT BEFORE EXECUTABLE CHECKS / EXECUTION RESULTS PENDING`  
Tracking #162 / epic #37.

Every identity must execute without skip/todo/only. These tests are governance/admission evidence, not M07 product-functionality tests.

| ID | Required behavior |
|---|---|
| M07ADM-01 | Exact owner instruction and admission identity accepted |
| M07ADM-02 | Invented/wrong approval text rejected |
| M07ADM-03 | Unknown or missing decision fields rejected |
| M07ADM-04 | Wrong milestone/issue/transition identities rejected |
| M07ADM-05 | Preparation reviewed head/merge/tree drift rejected |
| M07ADM-06 | Wrong M04/M06 prerequisite anchors rejected |
| M07ADM-07 | Wrong source-governance identity rejected |
| M07ADM-08 | Wrong execution entry or additional authorized slice rejected |
| M07ADM-09 | Immediate activation, production release or legal authority rejected |
| M07ADM-10 | Progress inflation rejected |
| M07ADM-11 | Blocking reviews or false-like permission strings rejected |
| M07ADM-12 | Exact formal-admission delta allowlist accepted |
| M07ADM-13 | Product source inside admission transition rejected |
| M07ADM-14 | Missing, duplicate or unexpected admission files rejected |
| M07ADM-15 | Delete/rename/copy/executable/symlink admission changes rejected |
| M07ADM-16 | Preparation validator dispatch preserves original 24 pure validators |
| M07ADM-17 | Preparation runtime shell preserves M04/M06 regression calls |
| M07ADM-18 | M03 admission guard becomes M07-aware without weakening M03–M06 checks |
| M07ADM-19 | M04 admission guard becomes M07-aware without weakening M04–M06 checks |
| M07ADM-20 | M05 admission guard becomes M07-aware and retains FV09/FV10 runtime |
| M07ADM-21 | Shared M03–M08 readiness retains 72 criteria / 60 slice identities |
| M07ADM-22 | M08 remains implementation-blocked |
| M07ADM-23 | M07 package status change preserves original 10-slice scope/DoD/stop conditions |
| M07ADM-24 | Normative CALPQ-REG-0001 source governance remains unchanged |
| M07ADM-25 | Parser/AI/OCR cannot become legal applicability or VERIFIED truth |
| M07ADM-26 | Historical source/rule versions remain immutable |
| M07ADM-27 | Publication/retrieval/verification/effective/evaluation time boundaries remain distinct |
| M07ADM-28 | Exact S01 activation shape accepted as consistency data |
| M07ADM-29 | Fake admission hashes/preparation-as-admission rejected |
| M07ADM-30 | Foreign PR/evidence references rejected |
| M07ADM-31 | Incorrect activation state/slice/release/legal-authority rejected |
| M07ADM-32 | Exact S01 additive scope accepted |
| M07ADM-33 | S02–S10/provider/UI/Application/unrelated paths rejected |
| M07ADM-34 | Activation mutation/deletion/rename/mode changes rejected |
| M07ADM-35 | Missing/duplicate/reordered test identities rejected |
| M07ADM-36 | Missing/malformed activation cannot silently enable product execution |

Repository validation additionally verifies actual ancestry/tree/parent relations, immutable closed preparation, current-checkout predecessor regressions and full same-head workflow evidence.
