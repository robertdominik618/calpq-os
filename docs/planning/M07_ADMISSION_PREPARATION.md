# M07 (milník 07) — Admission Preparation

ID: `CALPQ-M07-ADM-PREP-0001`  
Status: `PREPARATION IN PROGRESS / CANDIDATE ONLY / IMPLEMENTATION BLOCKED`  
Tracking: #160; milestone epic #37.  
Continuation instruction: `tak pokračujme`.  
Base: `f71bc084e6dc7778a13b0ad80b7637f6663005f8`.

The continuation instruction is interpreted narrowly as permission to proceed to the next canonical preparation step after M06 technical closure. It is not represented as an explicit formal-admission or implementation approval.

## Existing plan, not a parallel architecture

`M07_EXECUTION_PACKAGE.md` remains the authoritative ten-slice scope. This preparation does not change that file, the original M02–M12 execution index, historical admission decisions, production gates or domain authority.

| Slice | Existing scope | Dependency and boundary for later implementation |
|---|---|---|
| S01 | Authoritative source registry and source-classification policy | Reuse `CALPQ-REG-0001`; registry records authority, canonical reference, jurisdiction, domain, version/effective dates and verification state. No fetched/parser/AI output becomes VERIFIED by itself. |
| S02 | Source snapshot/version ingestion | S01 plus immutable provenance/content hashes; normalization must retain the original source/version and retrieval context. |
| S03 | Regulatory change event model | S01/S02 plus `REGULATORY_CHANGE_IMPACT_MODEL`; candidate parsing is not legal applicability. |
| S04 | Effective-date and supersession semantics | S02/S03 plus explicit publication, verification, effective and evaluation times; future effect does not silently change current truth. |
| S05 | Rule/RequirementSet impact linking | S03/S04 plus versioned M04 RequirementSet/catalog provenance; impact links create candidates, not automatic legal conclusions. |
| S06 | Credential/path/subject/organization impact graph | S05 plus M06 dependency/selective-reevaluation semantics; graph traversal is bounded and version-aware. |
| S07 | Human/legal review queue for ambiguous applicability | S03–S06 plus existing human-review contracts; ambiguity remains REVIEW_REQUIRED until governed resolution. |
| S08 | Explainable affected-target resolution | S05–S07 plus source/reason/provenance linkage; no unexplained mass targeting. |
| S09 | Governed action recommendation generation | S08 plus M06 notification/continuous-compliance boundaries; recommendation is not authorization or legal decision. |
| S10 | M07 integration evidence | Amendment, delayed-effect and ambiguity scenarios through real contracts plus mandatory predecessor regressions. |

## Proven prerequisite anchors

M04 final technical chain is retained at merge `d2f04aa2bcc68edf1d20deb345faa8a8c239e23d`, with versioned RequirementSets, catalog/path provenance, recognition review and historical replay evidence.

M06 final accepted merge is `f71bc084e6dc7778a13b0ad80b7637f6663005f8`, reviewed head `df67a250c613a7ead56e2511ac13c63dd41348f3`, tree `6dab0106f388d36de35e9c2296b82ddd0ecc3b74`. Owner acceptance is issue #36 comment `5744551633`; final PR #159 post-merge evidence is comment `5744548390`.

Regulatory source governance is already normative as `CALPQ-REG-0001` in `docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md`. It requires source authority/reference, jurisdiction/domain, versions, relevant publication/retrieval/effective dates, verification state, provenance, historical integrity and controlled review.

## Contract reuse

Reuse `REGULATORY_CHANGE_IMPACT_MODEL`, `REGULATORY_RADAR_MODEL`, `CORE_PROVENANCE_AND_EVIDENCE`, `HUMAN_REVIEW_CASE_MODEL`, M04 catalog/version/provenance contracts and M06 dependency/reevaluation/replay/continuous-compliance contracts.

Do not create a parallel legal-truth engine, a second requirement registry, a second clock model, a free-form AI applicability engine or a new historical-state mutation path.

## Proposed first execution entry — NOT AUTHORIZED

`M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY`.

Proposed S01 boundary: deterministic Core/Application contracts for authoritative source identity/classification and versioned source metadata. It may model verification state and provenance. It may not fetch production sources, decide legal applicability, mark AI/parser output VERIFIED, mutate M04 requirements, trigger M06 reevaluation, notify users or deploy a production adapter.

S01 begins only after a separate owner formal-admission/start approval, an approved admission transition is merged and post-merge verified, and the S01 implementation contract/test index is committed before product source.

## Decision states

1. This package is PREPARATION_ONLY: `implementation_authorized=false`, `authorized_execution_entry=null`, `admission_approval=null`.
2. A green preparation PR does not authorize its own merge.
3. A merged preparation PR does not by itself admit M07.
4. Formal admission requires a distinct owner decision, machine decision/record, exact-head green CI, guarded merge and post-merge verification.
5. S02–S10 each remain separately governed after S01.

## CI transition review

See `M07_CI_TRANSITION_REVIEW.md`. The final `scripts/ci/m06-s10-scope.mjs` guard is the single canonical successor-dispatch point already reached by the M06 admission and slice chains. Its M07 preparation wrapper validates the immutable closed M06 S10 scope in a detached worktree at the accepted M06 anchor, while each calling workflow continues its unchanged current-checkout runtime/type/architecture regressions on the M07 preparation head. No historical M06 allowlist is widened.

## Evidence and scope of validation

The preparation gate validates exact predecessor anchors, source-governance semantics, the unchanged blocked M07 package, the exact changed-path allowlist, additive-only preparation files plus one constrained closed-M06 runner adaptation, 28 readiness identities and adversarial non-authorization tests.

Tests authored here validate governance preparation, not M07 product functionality or the correctness of any real legal source.

## Exclusions and progress

No live legal-source fetching, regulatory interpretation, production adapters/providers/network/DB deployment, automatic legal applicability, M07 product source, M08+ admission, physical deletion, key destruction or production release is authorized.

M06 accepted 10/10; M07 delivered 0/10; original version-1 plan coverage remains **70/130 = 53.85%**.
