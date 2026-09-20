# M06 — Admission Preparation Readiness Matrix

Status: `AUTHORED / EXECUTION EVIDENCE PENDING / NOT FORMAL ADMISSION`
Tracking #130 / epic #36. Machine record: `m06-admission-preparation.json`.
Rows describe preparation requirements, not 24 implemented lifecycle capabilities. Exact-head results are recorded in the PR/issue after execution; no future result is asserted here.

| ID | Preparation requirement |
|---|---|
| M06PREP-01 | Exact owner preparation wording and no inferred implementation consent |
| M06PREP-02 | M05 accepted anchor, tree and acceptance-comment reference |
| M06PREP-03 | M04 completed ancestor and preserved exit-evidence reference |
| M06PREP-04 | Original ten M06 slice identities/order preserved |
| M06PREP-05 | M05 acceptance excludes production readiness and physical purge |
| M06PREP-06 | Formal admission remains null/unapproved |
| M06PREP-07 | Execution entry remains null and M06 source absent |
| M06PREP-08 | Candidate S01 entry is only a recommendation |
| M06PREP-09 | Existing M06 execution package remains blocked and unchanged |
| M06PREP-10 | Original M07–M12 packages and gates remain unchanged |
| M06PREP-11 | Historical S10 changed-path range remains validated |
| M06PREP-12 | Post-M05 preparation diff uses exact filenames, not wildcards |
| M06PREP-13 | Unauthorized files, deletion/rename and mode changes fail closed |
| M06PREP-14 | Prior production/tests/decisions/workflows remain unchanged except constrained S10 edit |
| M06PREP-15 | Current-checkout S10 runtime/type/architecture execution preserved |
| M06PREP-16 | Adversarial validator tests reject false admission, drift and scope expansion |
| M06PREP-17 | Explicit evaluation/knowledge/effective/calendar time boundaries |
| M06PREP-18 | No historical decision overwrite or date-only authority event |
| M06PREP-19 | Notification delivery does not become authoritative state |
| M06PREP-20 | Selective reevaluation reuses governed dependency and evidence contracts |
| M06PREP-21 | Compliance projection separates current status, future risk and uncertainty |
| M06PREP-22 | Trusted authentication/scoped loading/UnitOfWork responsibilities retained |
| M06PREP-23 | Remaining formal-admission/guard-transition steps explicitly enumerated |
| M06PREP-24 | M05 100%, M06 0/10 and v1 60/130 unchanged by preparation |

Gate: `bash tests/m06_admission_preparation_test.sh` plus exact-head dedicated workflow and the full PR matrix. Static validation, adversarial test counts, predecessor runtime results and human review of boundaries are separate evidence categories. A green preparation gate does not activate M06 or approve merging this PR.
