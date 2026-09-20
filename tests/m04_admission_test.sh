#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M04 ADMISSION: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
[[ "$phase" == "POST_FV00_IMPLEMENTATION" ]] || fail "expected POST_FV00_IMPLEMENTATION, got $phase"

record=docs/planning/M04_ADMISSION_RECORD.md
decision=docs/planning/m04-admission-decision.json
package=docs/planning/M04_EXECUTION_PACKAGE.md
baseline=docs/planning/M04_CATALOG_PATHS_GAP_BASELINE.md

for f in "$record" "$decision" "$package" "$baseline" docs/planning/M02_EXIT_EVIDENCE.md docs/planning/M03_EXIT_EVIDENCE.md; do
  [[ -f "$f" ]] || fail "missing $f"
done

m01_contracts=(
  docs/contracts/ACTIVITY_PROFESSION_CREDENTIAL_CATALOG.md
  docs/contracts/QUALIFICATION_PATH_MODEL.md
  docs/contracts/EQUIVALENCE_RECOGNITION_MODEL.md
  docs/contracts/GAP_NAVIGATOR_MODEL.md
)
for f in "${m01_contracts[@]}"; do [[ -f "$f" ]] || fail "missing M01 contract $f"; done

m02_runtime=(
  packages/core/src/eligibility/eligibility-assessment.ts
  packages/core/src/provenance/evidence-reference.ts
  packages/core/src/provenance/source-reference.ts
  packages/core/src/result/reason-code.ts
  packages/core/src/jurisdiction.ts
  packages/core/src/version.ts
  packages/core/src/time.ts
  packages/core/src/ids.ts
)
for f in "${m02_runtime[@]}"; do [[ -f "$f" ]] || fail "missing stable M02 runtime contract $f"; done

grep -q 'FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN AFTER MERGE + POST-MERGE GREEN' "$record" \
  || fail 'Markdown admission record is not in controlled admitted state'
grep -q 'ADMITTED / IMPLEMENTATION AUTHORIZED' "$package" \
  || fail 'M04 execution package is not implementation-authorized'

grep -q 'M04 owns governed catalog knowledge' "$package" || fail 'M04 ownership boundary missing'
grep -q 'QualificationPath' "$package" || fail 'QualificationPath scope missing'
grep -q 'historical' "$package" || fail 'historical preservation boundary missing'
grep -q 'Gap Navigator' "$baseline" || fail 'M04 gap baseline missing'
grep -q 'Ambiguity / missing authority' "$baseline" || grep -qi 'review/indeterminate' "$baseline" \
  || fail 'M04 fail-closed ambiguity boundary missing'

jq -e '.schema_version == 1
  and .decision_id == "CALPQ-M04-ADM-DEC-0001"
  and .admission_record_id == "CALPQ-M04-ADM-0001"
  and .milestone == "M04"
  and .candidate == "Catalog, Qualification Paths & Gap Intelligence"
  and .issue_number == 33
  and .state == "ADMITTED_FOR_IMPLEMENTATION"
  and .admission_transition_id == "CALPQ-M04-ADMIT-0001"
  and .approved_by == "robertdominik618"
  and .approved_at == null
  and .approval_time_precision == "NOT_INDEPENDENTLY_CAPTURED"
  and .approval_text == "tak pokračujeme"
  and .authorized_execution_entry == "M04_SLICE_01_ACTIVITY_PROFESSION_CATALOG_MODEL"
  and .admission_effective_condition == "ADMISSION_PR_MERGED_AND_POST_MERGE_VERIFIED"
  and .m03_reviewed_merge == "fa33edd4804b3534d2642dd044e5c2ee4f5bc5dd"
  and .admitted_revision == .m03_reviewed_merge
  and (.blocking_reviews | length == 0)' "$decision" >/dev/null \
  || fail 'machine decision integrity failed'

admitted_revision="$(jq -r '.admitted_revision' "$decision")"
git cat-file -e "${admitted_revision}^{commit}" 2>/dev/null || fail 'reviewed M03 predecessor revision missing'
git merge-base --is-ancestor "$admitted_revision" HEAD || fail 'reviewed M03 predecessor is not in current history'

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

if [[ -f docs/planning/m07-admission-decision.json ]]; then
  node scripts/ci/m07-admission.mjs
else
  grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M07_EXECUTION_PACKAGE.md \
    || fail 'M07 requires a valid separate admission decision'
fi

grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M08_EXECUTION_PACKAGE.md \
  || fail 'M08 must remain implementation-blocked'

if grep -R -nE 'ADMITTED / IMPLEMENTATION AUTHORIZED|ADMITTED_FOR_IMPLEMENTATION' \
  docs/planning/M08_EXECUTION_PACKAGE.md >/dev/null; then
  fail 'M08 admission leaked into earlier transition'
fi

scope_boundary="$(jq -r '.scope_boundary' "$decision")"
[[ "$scope_boundary" == *'may not ingest raw provider payloads'* ]] || fail 'provider-ingestion boundary missing'
[[ "$scope_boundary" == *'verify/promote evidence'* ]] || fail 'evidence-verification boundary missing'
[[ "$scope_boundary" == *'AuthorizationGrant'* ]] || fail 'AuthorizationGrant boundary missing'
[[ "$scope_boundary" == *'free-form AI'* ]] || fail 'AI authority boundary missing'
[[ "$scope_boundary" == *'rewrite history'* ]] || fail 'historical rewrite boundary missing'

printf 'M04 ADMISSION: PASS / M04 REMAINS VALID / SEPARATE M05 MACHINE ADMISSION AWARE / M06 SEPARATELY VALIDATED / M07 SEPARATELY VALIDATED / M08 BLOCKED\n'
