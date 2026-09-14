#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M02 BATCH EXECUTION READINESS: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md
  docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md
  docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md
  docs/planning/M02_BATCH_BRANCH_PR_STRATEGY.md
  docs/planning/M02_BATCH_EXECUTION_READINESS_MATRIX.md
  docs/planning/CALPQ_PROGRAM_EXECUTION_M02_M12.md
  docs/planning/CALPQ_MILESTONE_ADMISSION_EXIT_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

for f in docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md docs/planning/M02_BATCH_BRANCH_PR_STRATEGY.md docs/planning/M02_BATCH_EXECUTION_READINESS_MATRIX.md; do
  grep -q 'PLANNING ONLY / IMPLEMENTATION BLOCKED' "$f" || fail "$f must retain planning-boundary evidence"
done

criteria_count="$(grep -Ec '^[0-9]+\.' docs/planning/M02_BATCH_EXECUTION_READINESS_MATRIX.md)"
[[ "$criteria_count" -eq 60 ]] || fail "batch readiness matrix must contain 60 criteria, got $criteria_count"

grep -q 'FV-01 through FV-05' docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md || fail 'Batch A scope missing'
grep -q 'FV-06 through FV-10' docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md || fail 'Batch B scope missing'
grep -q 'FV-11 through FV-15' docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md || fail 'Batch C scope missing'

grep -q 'A10.' docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md || fail 'Batch A commit sequence incomplete'
grep -q 'B10.' docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md || fail 'Batch B commit sequence incomplete'
grep -q 'C10.' docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md || fail 'Batch C commit sequence incomplete'

grep -q 'Batch B is based on the reviewed Batch A result' docs/planning/M02_BATCH_BRANCH_PR_STRATEGY.md || fail 'Batch stacking rule missing'
grep -q 'Batch C is based on the reviewed Batch B result' docs/planning/M02_BATCH_BRANCH_PR_STRATEGY.md || fail 'Batch stacking rule missing'
grep -q 'Planning PRs do not merge merely because they are mergeable' docs/planning/M02_BATCH_BRANCH_PR_STRATEGY.md || fail 'merge governance rule missing'

grep -q 'CredentialArtifact never implies AuthorizationGrant' docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md || fail 'Batch A authority boundary missing'
grep -q 'OCR/AI extraction never becomes VERIFIED by confidence alone' docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md || fail 'Batch B extraction boundary missing'
grep -q 'SATISFIED is an eligibility result, not an AuthorizationGrant' docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md || fail 'Batch C grant boundary missing'

case "$phase" in
  PRE_M00|POST_M00_PRE_FEATURE|POST_FEATURE_PRE_FV00)
    jq -e '.state == "BLOCKED_PENDING_PREREQUISITES"' docs/planning/fv00-admission-decision.json >/dev/null \
      || fail 'FV-00 must remain blocked before formal admission'
    ;;
  POST_FV00_IMPLEMENTATION)
    jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION" and .authorized_execution_entry == "M02_BATCH_A_FV01"' docs/planning/fv00-admission-decision.json >/dev/null \
      || fail 'admitted phase lacks M02 Batch A / FV-01 execution authorization'
    ;;
  *) fail "unsupported lifecycle phase: $phase" ;;
esac

printf 'M02 BATCH EXECUTION READINESS: PASS / A-B-C READY / 60 OF 60 CRITERIA / PHASE %s\n' "$phase"
