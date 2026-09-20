# M06 — CI Transition Review

Status: `PREPARATION CONTRACT / FUTURE ADMISSION NOT ENABLED`
Anchor: `2deb81901339c2e7631d096939898fa5dd562e53`.
Tracking #130; documentation drift #129.

## Observed constraints

`tests/m05_admission_test.sh` validates M05's original admission JSON, prohibits Core changes relative to the M04 predecessor and requires M06–M08 execution packages to remain IMPLEMENTATION BLOCKED.
`tests/m03_m08_execution_readiness_test.sh` likewise understands admitted M03/M04/M05 and explicitly requires blocked M06–M08. Those are legitimate historical controls, not permission to ignore them.
`tests/m05_s10_integration_test.sh` restricts every path from the S09 base through HEAD to S10 integration files. After S10 closure, even an M06 preparation document would fail that historical scope check.
S08/S09 and earlier M05 scripts also contain baseline-to-HEAD Core/adapter exclusions. Formal admission must inventory all transitive guards rather than fixing one passing workflow in isolation.

## Narrow change authorized by this preparation

Keep S10's original path allowlist and all execution commands. For descendants of the fixed accepted M05 anchor, validate the historical S09-to-M05-closure range with that original allowlist. Separately run `scripts/ci/m06-admission-preparation.mjs`, which:
- requires the exact accepted M05 anchor/tree and M04 ancestor;
- allows only the explicitly enumerated preparation files plus the narrowly specified S10 shell patch;
- rejects deletion, renames, executable-mode changes and changes to any production source, prior tests/workflows/decisions/packages or historical evidence;
- verifies the S10 script equals its accepted original with only the specified scope-boundary patch;
- rejects any claim of formal M06 admission, implementation permission, execution entry, merge permission, release or progress increase.

There is no environment-variable bypass, detached historical worktree, cached test result or substitute older-checkout runtime. S10's strict compilation, validator tests, all 500 runtime scenarios and architecture execute against HEAD as before. Original standalone PR workflows remain mandatory.

The preparation validator validates repository consistency, not cryptographic proof that an owner sent a chat message; the recorded GitHub acceptance discussion remains the reviewable authority evidence.

## Required next transition before M06 implementation

| ID | Required work | Current disposition |
|---|---|---|
| M06-NEXT-01 | Explicit owner formal-admission/start instruction and a machine decision distinct from preparation | NOT AUTHORIZED |
| M06-NEXT-02 | Make M05/shared/earlier admission checks aware of the valid next admission without rewriting their old decisions | NOT ENABLED BY PREPARATION |
| M06-NEXT-03 | Replace this preparation-only post-M05 allowlist with reviewed per-slice M06 scope/ancestry rules, preserving closed-range and current-source regressions | NOT ENABLED BY PREPARATION |
| M06-NEXT-04 | Exact candidate-head full CI, approved admission merge, post-merge evidence and explicit first-slice entry | FUTURE EVIDENCE REQUIRED |

No blanket permission for all Application/Core files is proposed. Read-only S01 is expected to use Application only; later Core changes, if genuinely required, need their own contract and explicit scope. Unknown successor states fail closed.

## Nonblocking tracked findings versus admission blockers

README/epic current-state drift (#129) remains a documentation follow-up, not permission to alter immutable history. The preparation documents provide an explicit accepted anchor but do not claim #129 resolved. Original nested regression duplication remains; no global CI speedup is claimed. Production integration exclusions from M05 remain visible and are not certified by governance tests.
