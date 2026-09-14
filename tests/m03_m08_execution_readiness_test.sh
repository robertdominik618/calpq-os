#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M03-M08 EXECUTION READINESS: %s\n' "$1" >&2; exit 1; }

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

for f in docs/planning/M0{3,4,5,6,7,8}_EXECUTION_PACKAGE.md docs/planning/M03_M08_EXECUTION_READINESS_MATRIX.md; do
  grep -q 'BLOCKED' "$f" || fail "$f must remain blocked"
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

grep -q '"state": "LOCKED"' foundation/feature-development-gate.json || fail 'feature gate must remain locked'

printf 'M03-M08 EXECUTION READINESS: PASS / 72 OF 72 CRITERIA / 60 DELIVERY SLICES / IMPLEMENTATION BLOCKED\n'
