# M07 (milník 07) — Admission Preparation Readiness Matrix

Status: `AUTHORED / EXECUTION EVIDENCE PENDING / NOT FORMAL ADMISSION`  
Tracking #160 / epic #37. Machine record: `m07-admission-preparation.json`.

Rows describe preparation requirements, not 28 implemented regulatory capabilities. Exact-head execution results belong in the PR/issue evidence after CI.

| ID | Preparation requirement |
|---|---|
| M07PREP-01 | Owner continuation text is recorded without converting it into formal M07 admission |
| M07PREP-02 | M06 accepted merge, reviewed head, tree and acceptance/post-merge references are exact |
| M07PREP-03 | Stable M04 predecessor anchor and exit evidence remain present |
| M07PREP-04 | `CALPQ-REG-0001` Regulatory Source Governance remains normative and unchanged by preparation |
| M07PREP-05 | Original M07 execution package remains blocked and exactly ten slices |
| M07PREP-06 | M07 planning baseline remains PLANNING ONLY / BLOCKED |
| M07PREP-07 | Formal admission approval remains null |
| M07PREP-08 | Implementation authorization remains false |
| M07PREP-09 | Authorized execution entry remains null |
| M07PREP-10 | S01 source registry is recommendation only |
| M07PREP-11 | Source identity includes authority/reference, jurisdiction/domain and version metadata |
| M07PREP-12 | VERIFIED, UNVERIFIED and STALE/REVIEW_REQUIRED remain distinguishable |
| M07PREP-13 | Parser/OCR/AI output cannot self-upgrade to authoritative legal truth |
| M07PREP-14 | Historical decisions preserve original source/rule versions |
| M07PREP-15 | Publication, verification, effective and evaluation time remain distinct |
| M07PREP-16 | Regulatory changes remain governed versioned change events |
| M07PREP-17 | Impact linkage targets versioned M04 rules/RequirementSets rather than rewriting them |
| M07PREP-18 | Affected-target traversal reuses bounded M06 dependency/selective-reevaluation semantics |
| M07PREP-19 | Ambiguous applicability routes to human/legal review |
| M07PREP-20 | Recommended actions remain explainable and non-authoritative |
| M07PREP-21 | Preparation diff uses an exact filename allowlist, no wildcard product scope |
| M07PREP-22 | Closed M06 S10 scope is validated against the accepted M06 anchor |
| M07PREP-23 | Current-checkout M06 runtime/type/architecture regressions remain unchanged |
| M07PREP-24 | No Core/Application business source is added or modified |
| M07PREP-25 | Adversarial validator tests reject false admission, drift, path expansion and progress inflation |
| M07PREP-26 | Remaining formal-admission/guard-transition steps are explicitly enumerated |
| M07PREP-27 | Production release and legal-interpretation authority remain false |
| M07PREP-28 | M06=10/10, M07=0/10 and v1=70/130 remain unchanged by preparation |

Gate: `bash tests/m07_admission_preparation_test.sh` plus exact-head dedicated workflow and the complete PR matrix. A green preparation gate is not permission to merge, admit M07 or start S01.
