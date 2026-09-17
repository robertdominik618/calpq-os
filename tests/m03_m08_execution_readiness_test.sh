#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M03-M08 EXECUTION READINESS: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/planning/M03_EXECUTION_PACKAGE.md
  docs/planning/M04_EXECUTION_PACKAGE.md
  docs/planning/M05_EXECUTION_PACKAGE.md
  docs/planning/M06_EXECUTION_PACKAGE.md
  docs/planning/M07_EXECUTION_PACKAGE.md
  docs/planning/M08_EXECUTION_PACKAGE.md
  docs/planning/M03_M08_EXECUTION_READINESS_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'BLOCKED' docs/planning/M03_M08_EXECUTION_READINESS_MATRIX.md \
  || fail 'shared planning matrix must retain its planning-boundary evidence'

if [[ -f docs/planning/m03-admission-decision.json ]] \
  && jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"' docs/planning/m03-admission-decision.json >/dev/null; then
  grep -q 'ADMITTED / IMPLEMENTATION AUTHORIZED' docs/planning/M03_EXECUTION_PACKAGE.md \
    || fail 'M03 admitted decision requires admitted execution-package status'
  [[ -f docs/planning/M03_ADMISSION_RECORD.md ]] || fail 'M03 admission record missing'
  [[ -f docs/planning/M02_EXIT_EVIDENCE.md ]] || fail 'M02 durable exit evidence missing for M03 admission'
  jq -e '.milestone == "M03"
    and .admission_transition_id == "CALPQ-M03-ADMIT-0001"
    and .authorized_execution_entry == "M03_SLICE_01_DASHBOARD_READ_MODELS"
    and .m02_reviewed_merge == .admitted_revision
    and (.blocking_reviews | length == 0)' docs/planning/m03-admission-decision.json >/dev/null \
    || fail 'M03 admission decision integrity failed'
  admitted_revision="$(jq -r '.admitted_revision' docs/planning/m03-admission-decision.json)"
  git cat-file -e "${admitted_revision}^{commit}" 2>/dev/null || fail 'M03 admitted predecessor revision is not a commit'
  git merge-base --is-ancestor "$admitted_revision" HEAD || fail 'M03 admitted predecessor revision is not an ancestor of current head'
else
  grep -q 'BLOCKED' docs/planning/M03_EXECUTION_PACKAGE.md \
    || fail 'M03 must remain blocked until a valid admission decision exists'
fi

if [[ -f docs/planning/m04-admission-decision.json ]] \
  && jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"' docs/planning/m04-admission-decision.json >/dev/null; then
  grep -q 'ADMITTED / IMPLEMENTATION AUTHORIZED' docs/planning/M04_EXECUTION_PACKAGE.md \
    || fail 'M04 admitted decision requires admitted execution-package status'
  [[ -f docs/planning/M04_ADMISSION_RECORD.md ]] || fail 'M04 admission record missing'
  [[ -f docs/planning/M03_EXIT_EVIDENCE.md ]] || fail 'M03 durable exit evidence missing for M04 admission'
  [[ -f docs/planning/M04_CATALOG_PATHS_GAP_BASELINE.md ]] || fail 'M04 catalog/path/gap baseline missing'
  jq -e '.milestone == "M04"
    and .admission_transition_id == "CALPQ-M04-ADMIT-0001"
    and .authorized_execution_entry == "M04_SLICE_01_ACTIVITY_PROFESSION_CATALOG_MODEL"
    and .m03_reviewed_merge == .admitted_revision
    and (.blocking_reviews | length == 0)' docs/planning/m04-admission-decision.json >/dev/null \
    || fail 'M04 admission decision integrity failed'
  m04_revision="$(jq -r '.admitted_revision' docs/planning/m04-admission-decision.json)"
  git cat-file -e "${m04_revision}^{commit}" 2>/dev/null || fail 'M04 admitted predecessor revision is not a commit'
  git merge-base --is-ancestor "$m04_revision" HEAD || fail 'M04 admitted predecessor revision is not an ancestor of current head'
else
  grep -q 'BLOCKED' docs/planning/M04_EXECUTION_PACKAGE.md \
    || fail 'M04 must remain blocked until a valid admission decision exists'
fi

if [[ -f docs/planning/m05-admission-decision.json ]] \
  && jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION"' docs/planning/m05-admission-decision.json >/dev/null; then
  grep -q 'ADMITTED / IMPLEMENTATION AUTHORIZED AFTER MERGE + POST-MERGE GREEN' docs/planning/M05_EXECUTION_PACKAGE.md \
    || fail 'M05 admitted decision requires conditional execution-package status'
  [[ -f docs/planning/M05_ADMISSION_RECORD.md ]] || fail 'M05 admission record missing'
  [[ -f docs/planning/M04_S10_EXIT_EVIDENCE.md ]] || fail 'M04 durable S10 exit evidence missing for M05 admission'
  jq -e '.milestone == "M05"
    and .admission_transition_id == "CALPQ-M05-ADMIT-0001"
    and .authorized_execution_entry == "M05_SLICE_01_MULTI_CHANNEL_INTAKE_CONTRACTS"
    and .m04_reviewed_merge == .admitted_revision
    and .admission_effective_condition == "ADMISSION_PR_MERGED_AND_POST_MERGE_VERIFIED"
    and (.blocking_reviews | length == 0)' docs/planning/m05-admission-decision.json >/dev/null \
    || fail 'M05 admission decision integrity failed'
  m05_revision="$(jq -r '.admitted_revision' docs/planning/m05-admission-decision.json)"
  git cat-file -e "${m05_revision}^{commit}" 2>/dev/null || fail 'M05 admitted predecessor revision is not a commit'
  git merge-base --is-ancestor "$m05_revision" HEAD || fail 'M05 admitted predecessor revision is not an ancestor of current head'
else
  grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M05_EXECUTION_PACKAGE.md \
    || fail 'M05 must remain blocked until a valid admission decision exists'
fi

for f in docs/planning/M0{6,7,8}_EXECUTION_PACKAGE.md; do
  grep -q 'IMPLEMENTATION BLOCKED' "$f" || fail "$f must remain implementation-blocked"
done

criteria_count="$(grep -Ec '^[0-9]+\.' docs/planning/M03_M08_EXECUTION_READINESS_MATRIX.md)"
[[ "$criteria_count" -eq 72 ]] || fail "matrix must contain 72 criteria, got $criteria_count"

for m in 03 04 05 06 07 08; do
  slices="$(grep -Ec '^[0-9]+\.' "docs/planning/M${m}_EXECUTION_PACKAGE.md")"
  [[ "$slices" -eq 10 ]] || fail "M${m} must contain 10 delivery slices, got $slices"
done

grep -q 'UI' docs/planning/M03_EXECUTION_PACKAGE.md || fail 'M03 UI boundary missing'
grep -q 'QualificationPath' docs/planning/M04_EXECUTION_PACKAGE.md || fail 'M04 qualification path missing'
grep -q 'Immutable original' docs/planning/M05_EXECUTION_PACKAGE.md || fail 'M05 immutable original missing'
grep -q 'Continuous Compliance' docs/planning/M06_EXECUTION_PACKAGE.md || fail 'M06 continuous compliance missing'
grep -qi 'review' docs/planning/M07_EXECUTION_PACKAGE.md || fail 'M07 review boundary missing'
grep -qi 'legal' docs/planning/M07_EXECUTION_PACKAGE.md || fail 'M07 legal boundary missing'
grep -q 'role/delegation never grants professional competence' docs/planning/M08_EXECUTION_PACKAGE.md || fail 'M08 competence boundary missing'

printf 'M03-M08 EXECUTION READINESS: PASS / 72 OF 72 PLANNING CRITERIA / 60 DELIVERY SLICES / M03+M04+M05 MACHINE-ADMISSION AWARE / M06-M08 BLOCKED / PHASE %s\n' "$phase"
