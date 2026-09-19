# CALPQ M04 Slice 08 — Explainability & Reason/Source Linkage Implementation Contract

Status: `IMPLEMENTATION AUTHORIZED / IN PROGRESS`  
ID: `CALPQ-M04-S08-CONTRACT-0001`  
Tracking issue: #100

## 1. Reviewed lineage

Slice 08 is implemented only from merged Slice 07 commit `944084ae05f3c40ec578bc43ee4b392349b8dbda` on branch `impl/m04-s08-explainability-source-linkage`.

Authoritative inputs are:

- `docs/planning/M04_EXECUTION_PACKAGE.md` — S08 = Explainability and reason/source linkage;
- `docs/contracts/CATALOG_QUERY_EXPLAINABILITY.md` — M01 explanation-graph contract;
- `docs/contracts/GAP_NAVIGATOR_MODEL.md`;
- M04 S01–S07 executable Core, especially `GapNavigatorEvaluation` and `CatalogProvenanceBinding`.

No parallel catalog, gap, recognition or eligibility architecture is permitted.

## 2. Capability boundary

S08 materializes a deterministic, immutable explanation graph over one already-computed `GapNavigatorEvaluation`. It explains governed results; it does not decide them.

The graph records:

- exact `GapEvaluationId` and semantic `ExplanationGraphId`;
- exact subject, QualificationPath id/version, jurisdiction, effective date and explicit evaluation instant;
- typed path, step, requirement, reason, source, rule and evidence nodes;
- typed traversed edges between those nodes;
- exact S07 gap states without remapping;
- exact S07 reason codes, source IDs, evidence IDs, rule/version references, prerequisite blockers and residual requirements;
- exact SourceReference version and verification state for every material source that can be resolved;
- controlled unresolved facts when material context cannot be resolved safely.

## 3. Fail-closed classification

The explanation classification is one of:

- `EXPLAINED` — material links are resolvable and no review/indeterminate condition exists;
- `INDETERMINATE` — material context is missing, including a referenced SourceReference, target source linkage, or S07 information-missing result;
- `REVIEW_REQUIRED` — a material source is not VERIFIED or S07 already requires review.

`REVIEW_REQUIRED` takes precedence over `INDETERMINATE` when both conditions exist. Classification is explainability metadata only and never mutates or replaces S07 `GapItemState`.

## 4. Determinism and history

- no ambient current time;
- no randomness inside Core;
- explicit semantic id and UTC evaluation instant are inputs;
- node, edge and unresolved-fact order is canonical;
- repeated equal governed inputs serialize identically;
- changed governed inputs produce a new snapshot and never mutate a prior graph.

## 5. Authority boundaries

S08 MUST NOT:

- call or replace FV11 eligibility evaluation;
- verify, promote, create or mutate evidence;
- create or resolve S06 equivalence/recognition decisions;
- change S07 gap states, reason codes, residual obligations or completion;
- select, rank or recommend a qualification path;
- create Next Best Action authority;
- issue an `AuthorizationGrant`;
- ingest/sync provider data (S09 ownership);
- own read-only UI truth (S10 ownership);
- let LLM/free text create graph edges, rules, satisfaction or source authority.

Natural-language/AI narration may only be downstream of the governed structured graph.

## 6. Required executable evidence

S08 evidence must cover exactly 48 mandatory runtime scenarios plus strict TypeScript compile/immutability proof and repository guards. Coverage includes exact context, all six S07 gap states, reason/source/rule/evidence linkage, prerequisites, residuals, recognition/equivalence provenance, missing/unverified sources, deterministic serialization, historical immutability and negative authority-boundary checks.

The dedicated workflow must also prove ancestry from `944084ae05f3c40ec578bc43ee4b392349b8dbda`, run S01–S07/FV03/FV11 regressions and the M04 admission/readiness/architecture gates.

## 7. Merge boundary

Implementation evidence may establish `READY FOR REVIEW`; it does not authorize merge. The S08 PR remains OPEN / UNMERGED until a fresh explicit user approval.
