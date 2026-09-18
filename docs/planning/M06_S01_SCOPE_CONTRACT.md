# M06 S01 — Conditional Execution Scope

Status: `OWNER-APPROVED ENTRY / ADMISSION MERGE AND POST-MERGE ACTIVATION REQUIRED / NO S01 SOURCE YET`
Entry: `M06_SLICE_01_CREDENTIAL_LIFECYCLE_TIMELINE_PROJECTION`.
Parent: `CALPQ-M06-ADM-DEC-0001`, issue #132 / epic #36.

## Functional scope

A deterministic, immutable Application read model of governed credential lifecycle events and explicit time facts. Preserve subject, tenant, purpose, source/evidence/rule versions, evaluated time and known-at cutoff. Stable ordering must not hide ambiguous identity or chronology. Missing data is explained, not invented. A timeline is not a scheduler, an authority event or a renewal operation.
Reuse existing Core and Application contracts. No Core/provider/UI source edits, external I/O, ambient clock or new legal authority. S02–S10 remain separate.

## Permitted S01 paths after activation

| Path | Allowed change |
|---|---|
| docs/planning/m06-s01-activation.json | One immutable new activation record |
| docs/planning/M06_S01_IMPLEMENTATION_CONTRACT.md | New slice contract before source |
| docs/planning/M06_S01_TEST_INDEX.md | New scenario index before source |
| docs/planning/M06_S01_EXIT_EVIDENCE.md | New slice-specific execution evidence |
| packages/application/src/lifecycle/credential-lifecycle-timeline.ts | New Application projection only |
| packages/application/src/lifecycle/index.ts | New lifecycle exports only |
| packages/application/test/m06-s01-lifecycle-timeline.test.ts | New runtime scenarios |
| packages/application/test/m06-s01-types.compile.ts | New readonly/type proof |
| packages/application/package.json | Only add ./lifecycle export and test:m06s01 script |
| packages/application/tsconfig.json | Only append test/m06-s01-types.compile.ts |
| tests/m06_s01_lifecycle_timeline_test.sh | New exact-entry runtime/type/scope gate |
| .github/workflows/m06-s01-lifecycle-timeline.yml | New exact-head slice workflow |

All changed entries must be regular non-executable files; existing files are only the two explicitly listed JSON configurations. No deletion, rename, old test edit or wildcard Application permission. Different implementation paths require a reviewed scope change, not a silent exception.

## Activation evidence contract

Create `m06-s01-activation.json` only after the approved admission merge is post-merge verified. Fields: schema_version=1, milestone=M06, slice=S01, state=ACTIVE_AFTER_VERIFIED_ADMISSION, decision_id, authorized_execution_entry, admission_pr, admission_head, admission_merge, admission_tree, owner_merge_approval_reference, post_merge_evidence_reference, production_release_authorized=false.
References must point to the actual repository's admission PR discussion, not a generic string. The merge must have the reviewed admission head as its second parent and the same tree; both must be ancestors of S01. The admission decision at that merge must equal the exact approved decision. The recorded PR number must exceed the preparation PR number. Do not use the preparation merge as admission.
The activation record is committed once, before S01 production source, and never changed. Contract and scenario index must also exist in preceding commits. An activation record cannot create trust by itself: owner instruction and actual workflow evidence must be checked by the authorized integration operator; local consistency validation is not a cryptographic attestation of CI or chat consent.

## Frozen predecessor and current execution

Admission files and all predecessor production/tests remain byte-preserved at the admission merge. Changed-path guards apply separately to closed preparation, closed admission and current S01 ranges. Runtime/type/architecture regressions still execute on current HEAD. Progress fields remain the admission-time snapshot; current delivery evidence is reported in the slice issue, not by rewriting historical decisions.

**timeline projection != renewal; notification != authority; passage of time != authority event; replay != historical mutation**.
