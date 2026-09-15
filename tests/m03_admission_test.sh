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

# Later milestones may advance only through their own machine-readable admission.
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

for m in 05 06 07 08; do
  grep -q 'IMPLEMENTATION BLOCKED' "docs/planning/M${m}_EXECUTION_PACKAGE.md" \
    || fail "M${m} must remain implementation-blocked"
done

if grep -R -nE 'ADMITTED / IMPLEMENTATION AUTHORIZED|ADMITTED_FOR_IMPLEMENTATION' \
  docs/planning/M0{5,6,7,8}_EXECUTION_PACKAGE.md >/dev/null; then
  fail 'M05-M08 admission leaked into earlier transition'
fi

grep -q 'Professional Passport' docs/planning/M03_PRODUCT_SURFACE_BASELINE.md || fail 'M03 accepted product-surface scope missing'
grep -q 'no business/legal truth computed in UI' "$package" || fail 'M03 UI authority boundary missing'

printf 'M03 ADMISSION: PASS / M03 REMAINS VALID / SEPARATE M04 ADMISSION ALLOWED ONLY BY MACHINE DECISION / M05-M08 BLOCKED\n'
