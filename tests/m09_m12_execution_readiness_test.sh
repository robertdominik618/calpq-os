#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M09-M12 EXECUTION READINESS: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/planning/M09_EXECUTION_PACKAGE.md
  docs/planning/M10_EXECUTION_PACKAGE.md
  docs/planning/M11_EXECUTION_PACKAGE.md
  docs/planning/M12_EXECUTION_PACKAGE.md
  docs/planning/M09_M12_EXECUTION_READINESS_MATRIX.md
  docs/planning/M09_M12_BRANCH_PR_STRATEGY.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

blocked_files=(
  docs/planning/M09_EXECUTION_PACKAGE.md
  docs/planning/M10_EXECUTION_PACKAGE.md
  docs/planning/M11_EXECUTION_PACKAGE.md
  docs/planning/M12_EXECUTION_PACKAGE.md
  docs/planning/M09_M12_EXECUTION_READINESS_MATRIX.md
)
for f in "${blocked_files[@]}"; do
  grep -q 'BLOCKED' "$f" || fail "$f must retain its planning-boundary evidence"
done

criteria_count="$(grep -Ec '^[0-9]+\.' docs/planning/M09_M12_EXECUTION_READINESS_MATRIX.md)"
[[ "$criteria_count" -eq 50 ]] || fail "matrix must contain 50 criteria, got $criteria_count"

for m in 09 10 11 12; do
  slices="$(grep -Ec '^[0-9]+\.' "docs/planning/M${m}_EXECUTION_PACKAGE.md")"
  [[ "$slices" -eq 10 ]] || fail "M${m} must contain 10 delivery slices, got $slices"
done

grep -q 'Selective-disclosure' docs/planning/M09_EXECUTION_PACKAGE.md || fail 'M09 selective disclosure missing'
grep -q 'What-if' docs/planning/M10_EXECUTION_PACKAGE.md || fail 'M10 what-if missing'
grep -q 'cache' docs/planning/M11_EXECUTION_PACKAGE.md || fail 'M11 cache boundary missing'
grep -q 'GA evidence pack' docs/planning/M12_EXECUTION_PACKAGE.md || fail 'M12 GA evidence missing'
grep -q 'explicit evidence-backed decision' docs/planning/M09_M12_BRANCH_PR_STRATEGY.md || fail 'GA release boundary missing'

printf 'M09-M12 EXECUTION READINESS: PASS / 50 OF 50 CRITERIA / 40 DELIVERY SLICES / PHASE %s\n' "$phase"
