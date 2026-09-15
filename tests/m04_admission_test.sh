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

for m in 05 06 07 08; do
  grep -q 'IMPLEMENTATION BLOCKED' "docs/planning/M${m}_EXECUTION_PACKAGE.md" \
    || fail "M${m} must remain implementation-blocked"
done

if grep -R -nE 'ADMITTED / IMPLEMENTATION AUTHORIZED|ADMITTED_FOR_IMPLEMENTATION' \
  docs/planning/M0{5,6,7,8}_EXECUTION_PACKAGE.md >/dev/null; then
  fail 'later milestone admission leaked into M04 transition'
fi

scope_boundary="$(jq -r '.scope_boundary' "$decision")"
[[ "$scope_boundary" == *'may not ingest raw provider payloads'* ]] || fail 'provider-ingestion boundary missing'
[[ "$scope_boundary" == *'verify/promote evidence'* ]] || fail 'evidence-verification boundary missing'
[[ "$scope_boundary" == *'AuthorizationGrant'* ]] || fail 'AuthorizationGrant boundary missing'
[[ "$scope_boundary" == *'free-form AI'* ]] || fail 'AI authority boundary missing'
[[ "$scope_boundary" == *'rewrite history'* ]] || fail 'historical rewrite boundary missing'

printf 'M04 ADMISSION: PASS / M03 REVIEWED MERGE VERIFIED / M01+M02 CONTRACTS PRESENT / M04 SLICE 01 AUTHORIZED AFTER MERGE+POST-MERGE GREEN / M05-M08 BLOCKED\n'
