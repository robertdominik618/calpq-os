#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M01 CONTINUOUS COMPLIANCE: %s\n' "$1" >&2; exit 1; }

required=(
  docs/contracts/CHANGE_EVENT_IMPACT_MODEL.md
  docs/contracts/DEPENDENCY_GRAPH_REEVALUATION_MODEL.md
  docs/contracts/CONTINUOUS_COMPLIANCE_STATUS_MODEL.md
  docs/contracts/REGULATORY_CHANGE_IMPACT_MODEL.md
  docs/contracts/REEVALUATION_DECISION_EVIDENCE.md
  docs/prep/M01_CONTINUOUS_COMPLIANCE_BASELINE.md
  docs/prep/M01_CONTINUOUS_COMPLIANCE_TEST_MATRIX.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing prep boundary: $file"
done

grep -q 'Historical decisions are immutable' docs/prep/M01_CONTINUOUS_COMPLIANCE_BASELINE.md || fail 'history invariant missing'
grep -q 'Only affected dependencies are re-evaluated' docs/prep/M01_CONTINUOUS_COMPLIANCE_BASELINE.md || fail 'selective reevaluation invariant missing'
grep -q 'AT_RISK' docs/contracts/CONTINUOUS_COMPLIANCE_STATUS_MODEL.md || fail 'future-risk status missing'
grep -q 'UNVERIFIED' docs/contracts/REGULATORY_CHANGE_IMPACT_MODEL.md || fail 'unverified-source boundary missing'
grep -q 'UNCHANGED' docs/contracts/REEVALUATION_DECISION_EVIDENCE.md || fail 'unchanged audit outcome missing'
grep -q 'deterministic deduplication key' docs/contracts/REEVALUATION_DECISION_EVIDENCE.md || fail 'deduplication invariant missing'

implementation="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print -quit)"
[[ -z "$implementation" ]] || fail "implementation source detected before M00 release: $implementation"

grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'

bash tests/m01_regulatory_radar_test.sh
printf 'M01 CONTINUOUS COMPLIANCE: PASS\n'
