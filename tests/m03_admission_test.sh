#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M03 ADMISSION: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

record=docs/planning/M03_ADMISSION_RECORD.md
decision=docs/planning/m03-admission-decision.json
package=docs/planning/M03_EXECUTION_PACKAGE.md

[[ -f "$record" ]] || fail 'admission record missing'
[[ -f "$decision" ]] || fail 'machine admission decision missing'
[[ -f "$package" ]] || fail 'M03 execution package missing'
[[ -f docs/planning/M02_EXIT_EVIDENCE.md ]] || fail 'M02 exit evidence missing'
[[ -f docs/planning/M03_PRODUCT_SURFACE_BASELINE.md ]] || fail 'M03 product-surface baseline missing'

grep -q 'FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN' "$record" || fail 'Markdown record is not admitted'
grep -q 'ADMITTED / IMPLEMENTATION AUTHORIZED' "$package" || fail 'M03 execution package is not implementation-authorized'

jq -e '.schema_version == 1
  and .milestone == "M03"
  and .candidate == "Professional Passport Product Surface"
  and .issue_number == 32
  and .state == "ADMITTED_FOR_IMPLEMENTATION"
  and .admission_transition_id == "CALPQ-M03-ADMIT-0001"
  and .approved_by == "robertdominik618"
  and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"
  and .m02_reviewed_merge == "387dbfa0246d36e576ff15a6e5bb1016e051093c"
  and .admitted_revision == .m02_reviewed_merge
  and (.blocking_reviews | length == 0)' "$decision" >/dev/null || fail 'machine decision integrity failed'

admitted_revision="$(jq -r '.admitted_revision' "$decision")"
git cat-file -e "${admitted_revision}^{commit}" 2>/dev/null || fail 'admitted predecessor revision missing'
git merge-base --is-ancestor "$admitted_revision" HEAD || fail 'admitted predecessor is not in current history'

if [[ -f docs/planning/m04-admission-decision.json ]] \
  && jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"' docs/planning/m04-admission-decision.json >/dev/null; then
  [[ -f docs/planning/M04_ADMISSION_RECORD.md ]] || fail 'M04 admission decision exists without admission record'
  grep -q 'ADMITTED / IMPLEMENTATION AUTHORIZED' docs/planning/M04_EXECUTION_PACKAGE.md \
    || fail 'valid M04 admission decision requires admitted M04 package status'
  jq -e '.milestone == "M04"
    and .admission_transition_id == "CALPQ-M04-ADMIT-0001"
    and .authorized_execution_entry == "M04_SLICE_01_ACTIVITY_PROFESSION_CATALOG_MODEL"
    and .m03_reviewed_merge == .admitted_revision
    and (.blocking_reviews | length == 0)' docs/planning/m04-admission-decision.json >/dev/null \
    || fail 'M04 separate admission decision integrity failed'
  m04_revision="$(jq -r '.admitted_revision' docs/planning/m04-admission-decision.json)"
  git cat-file -e "${m04_revision}^{commit}" 2>/dev/null || fail 'M04 admitted predecessor revision is not a commit'
  git merge-base --is-ancestor "$m04_revision" HEAD || fail 'M04 admitted predecessor revision is not in current history'
else
  grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M04_EXECUTION_PACKAGE.md \
    || fail 'M04 must remain blocked until a valid separate admission decision exists'
fi

if [[ -f docs/planning/m05-admission-decision.json ]] \
  && jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"' docs/planning/m05-admission-decision.json >/dev/null; then
  [[ -f docs/planning/M05_ADMISSION_RECORD.md ]] || fail 'M05 admission decision exists without admission record'
  grep -q 'ADMITTED / IMPLEMENTATION AUTHORIZED AFTER MERGE + POST-MERGE GREEN' docs/planning/M05_EXECUTION_PACKAGE.md \
    || fail 'valid M05 admission decision requires conditional M05 package status'
  jq -e '.milestone == "M05"
    and .admission_transition_id == "CALPQ-M05-ADMIT-0001"
    and .authorized_execution_entry == "M05_SLICE_01_MULTI_CHANNEL_INTAKE_CONTRACTS"
    and .m04_reviewed_merge == .admitted_revision
    and .admission_effective_condition == "ADMISSION_PR_MERGED_AND_POST_MERGE_VERIFIED"
    and (.blocking_reviews | length == 0)' docs/planning/m05-admission-decision.json >/dev/null \
    || fail 'M05 separate admission decision integrity failed'
  m05_revision="$(jq -r '.admitted_revision' docs/planning/m05-admission-decision.json)"
  git cat-file -e "${m05_revision}^{commit}" 2>/dev/null || fail 'M05 admitted predecessor revision is not a commit'
  git merge-base --is-ancestor "$m05_revision" HEAD || fail 'M05 admitted predecessor revision is not in current history'
else
  grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M05_EXECUTION_PACKAGE.md \
    || fail 'M05 must remain blocked until a valid separate admission decision exists'
fi

if [[ -f docs/planning/m06-admission-decision.json ]]; then
  node scripts/ci/m06-admission.mjs
else
  grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M06_EXECUTION_PACKAGE.md \
    || fail 'M06 requires a valid separate admission decision'
fi

for m in 07 08; do
  grep -q 'IMPLEMENTATION BLOCKED' "docs/planning/M${m}_EXECUTION_PACKAGE.md" \
    || fail "M${m} must remain implementation-blocked"
done

if grep -R -nE 'ADMITTED / IMPLEMENTATION AUTHORIZED|ADMITTED_FOR_IMPLEMENTATION' \
  docs/planning/M0{7,8}_EXECUTION_PACKAGE.md >/dev/null; then
  fail 'M06-M08 admission leaked into earlier transition'
fi

grep -q 'Professional Passport' docs/planning/M03_PRODUCT_SURFACE_BASELINE.md || fail 'M03 accepted product-surface scope missing'
grep -q 'no business/legal truth computed in UI' "$package" || fail 'M03 UI authority boundary missing'

printf 'M03 ADMISSION: PASS / M03 REMAINS VALID / M04+M05 SEPARATE MACHINE ADMISSION AWARE / M06 SEPARATELY VALIDATED / M07-M08 BLOCKED\n'
