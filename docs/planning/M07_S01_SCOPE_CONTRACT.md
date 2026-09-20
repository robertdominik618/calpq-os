# M07 S01 (Slice 01 – implementační část 01) — Conditional Execution Scope

Status: `OWNER-APPROVED FORMAL ENTRY / ADMISSION MERGE + POST-MERGE ACTIVATION REQUIRED / NO S01 PRODUCT SOURCE YET`  
Entry: `M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY`.  
Parent: `CALPQ-M07-ADM-DEC-0001`, issue #162 / epic #37.

## Functional scope

S01 defines the governed authoritative-source registry and source-classification contract for later regulatory intelligence.

It must preserve:
- authoritative issuer/source identity and canonical reference;
- jurisdiction and affected domain;
- source type/classification;
- source and version identity;
- publication/retrieval date where applicable;
- effective-from/effective-to where known;
- verification/review state;
- provenance back to the source material.

It must preserve at minimum `VERIFIED`, `UNVERIFIED` and `STALE/REVIEW_REQUIRED` semantics from `CALPQ-REG-0001`.

A fetched document, parser output, OCR result, AI summary or candidate mapping is not itself a legal rule or a VERIFIED applicability conclusion.

## Proposed S01 product paths after activation

| Path | Allowed change |
|---|---|
| docs/planning/m07-s01-activation.json | One immutable activation record after verified admission merge |
| docs/planning/M07_S01_IMPLEMENTATION_CONTRACT.md | New S01 contract before source |
| docs/planning/M07_S01_TEST_INDEX.md | New mandatory scenario index before source |
| docs/planning/M07_S01_EXIT_EVIDENCE.md | New slice-specific evidence |
| packages/core/src/regulatory/authoritative-source-registry.ts | New deterministic Core regulatory-source model only |
| packages/core/src/regulatory/index.ts | New regulatory exports only |
| packages/core/test/m07-s01-authoritative-source-registry.test.ts | New runtime scenarios |
| packages/core/test/m07-s01-types.compile.ts | New readonly/type proof |
| packages/core/package.json | Only add the exact S01 test command/export if required by existing package conventions |
| packages/core/tsconfig.json | Only append the exact S01 compile proof if required |
| tests/m07_s01_authoritative_source_registry_test.sh | New exact-entry runtime/type/scope gate |
| .github/workflows/m07-s01-authoritative-source-registry.yml | New exact-head S01 workflow |

Different paths require an explicit reviewed scope change. No provider/adapters/UI/Application business source is permitted by this S01 scope unless separately re-admitted.

## Activation evidence contract

Create `m07-s01-activation.json` only after the formal M07 admission PR is owner-approved, merged and post-merge verified.

Required identity fields must include:
- schema_version=1;
- milestone=M07;
- slice=S01;
- state=ACTIVE_AFTER_VERIFIED_ADMISSION;
- decision_id=CALPQ-M07-ADM-DEC-0001;
- authorized_execution_entry=M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY;
- actual admission PR/head/merge/tree;
- owner merge-approval reference;
- post-merge evidence reference;
- production_release_authorized=false;
- legal_interpretation_authorized=false.

The admission merge must contain the reviewed admission head as its second parent and the identical reviewed tree. Activation is committed once before S01 product source and is never rewritten.

## Source/governance invariants

- Source registry identity does not equal legal applicability.
- Verification status cannot be upgraded by AI/parser confidence alone.
- Effective dates remain distinct from publication, retrieval, verification and evaluation instants.
- Historical decisions retain the source/rule versions originally used.
- S01 does not mutate M04 RequirementSets or M06 decisions.
- Unknown or stale material routes to explicit uncertainty/review.

**source registry != legal rule; VERIFIED source != automatic applicability; effective date != authority event; current source != historical rewrite**
