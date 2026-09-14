#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M02 PREIMPLEMENTATION INTEGRITY: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/planning/M02_FIRST_VERTICAL_DELIVERY_PLAN.md
  docs/planning/M02_FIRST_VERTICAL_BACKLOG.md
  docs/planning/M02_FIRST_VERTICAL_ACCEPTANCE_MATRIX.md
  docs/planning/M02_FIRST_VERTICAL_ADMISSION_CHECKLIST.md
  docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md
  docs/planning/FV00_DOMAIN_STATE_BOUNDARY.md
  docs/planning/FV00_COMMAND_EVENT_CATALOG.md
  docs/planning/FV00_TRACEABILITY_INDEX.md
  docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md
  docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md
  docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md
  docs/planning/M02_BATCH_BRANCH_PR_STRATEGY.md
  docs/planning/M02_BATCH_EXECUTION_READINESS_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done
for n in $(seq -w 1 15); do
  [[ -f "docs/planning/FV${n}_IMPLEMENTATION_CONTRACT.md" ]] || fail "missing FV${n} implementation contract"
done

scenario_count="$(grep -Ec '^[0-9]+\.' docs/planning/M02_FIRST_VERTICAL_ACCEPTANCE_MATRIX.md)"
[[ "$scenario_count" -eq 45 ]] || fail "acceptance matrix must contain 45 scenarios"

tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
grep -hEo '"[0-9]+":' docs/planning/traceability/FV00_TRC_*.json | tr -d '\":' | sort -n > "$tmp"
for n in $(seq 1 45); do
  count="$(grep -xc "$n" "$tmp" || true)"
  [[ "$count" -eq 1 ]] || fail "scenario $n traceability count is $count, expected 1"
done

criteria_count="$(grep -Ec '^[0-9]+\.' docs/planning/M02_BATCH_EXECUTION_READINESS_MATRIX.md)"
[[ "$criteria_count" -eq 60 ]] || fail "batch readiness matrix must contain 60 criteria, got $criteria_count"

grep -q 'FV-01 through FV-05' docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md || fail 'Batch A scope missing'
grep -q 'FV-06 through FV-10' docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md || fail 'Batch B scope missing'
grep -q 'FV-11 through FV-15' docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md || fail 'Batch C scope missing'
grep -q 'A10.' docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md || fail 'Batch A sequence incomplete'
grep -q 'B10.' docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md || fail 'Batch B sequence incomplete'
grep -q 'C10.' docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md || fail 'Batch C sequence incomplete'
grep -q 'Batch B is based on the reviewed Batch A result' docs/planning/M02_BATCH_BRANCH_PR_STRATEGY.md || fail 'Batch B stacking rule missing'
grep -q 'Batch C is based on the reviewed Batch B result' docs/planning/M02_BATCH_BRANCH_PR_STRATEGY.md || fail 'Batch C stacking rule missing'
grep -q 'CredentialArtifact never implies AuthorizationGrant' docs/planning/M02_BATCH_A_CORE_KERNEL_EXECUTION.md || fail 'Batch A authority boundary missing'
grep -q 'OCR/AI extraction never becomes VERIFIED by confidence alone' docs/planning/M02_BATCH_B_APPLICATION_EVIDENCE_EXECUTION.md || fail 'Batch B extraction boundary missing'
grep -q 'SATISFIED is an eligibility result, not an AuthorizationGrant' docs/planning/M02_BATCH_C_DECISION_RUNTIME_EXECUTION.md || fail 'Batch C authorization boundary missing'

case "$phase" in
  PRE_M00|POST_M00_PRE_FEATURE|POST_FEATURE_PRE_FV00)
    jq -e '.state == "BLOCKED_PENDING_PREREQUISITES" and (.blocking_reviews | length) == 0' docs/planning/fv00-admission-decision.json >/dev/null \
      || fail 'FV-00 must be cleanly blocked immediately before formal admission'
    grep -q '^`BLOCKED_PENDING_PREREQUISITES`$' docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md \
      || fail 'FV-00 Markdown record must still be blocked immediately before formal admission'
    implementation="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.swift' -o -name '*.kt' -o -name '*.java' -o -name '*.py' -o -name '*.go' -o -name '*.rs' -o -name '*.cs' -o -name '*.dart' \) -print -quit)"
    [[ -z "$implementation" ]] || fail "product implementation source exists before FV-00 admission: $implementation"
    ;;
  POST_FV00_IMPLEMENTATION)
    jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION" and .admitted_by_transition == "CALPQ-FV00-ADMIT-0001" and .authorized_execution_entry == "M02_BATCH_A_FV01"' docs/planning/fv00-admission-decision.json >/dev/null \
      || fail 'FV-00 admitted state is incomplete'
    grep -q '^`ADMITTED_FOR_IMPLEMENTATION`$' docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md \
      || fail 'FV-00 Markdown record must reflect admission'
    ;;
esac

printf 'M02 PREIMPLEMENTATION INTEGRITY: PASS / 45 TRACEABLE SCENARIOS / 60 BATCH CRITERIA / PHASE %s\n' "$phase"
