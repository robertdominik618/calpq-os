#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'PROGRAM EXECUTION READINESS: %s\n' "$1" >&2; exit 1; }

required=(
  docs/architecture/CALPQ_MILESTONE_ARCHITECTURE_M01_M12.md
  docs/planning/CALPQ_PROGRAM_EXECUTION_M02_M12.md
  docs/planning/CALPQ_DELIVERY_WAVES_AND_PARALLELIZATION.md
  docs/planning/CALPQ_MILESTONE_ADMISSION_EXIT_MATRIX.md
  docs/planning/CALPQ_PROGRAM_EXECUTION_READINESS_MATRIX.md
  tests/m02_planning_readiness_test.sh
  tests/m03_m05_planning_readiness_test.sh
  tests/m06_m08_planning_readiness_test.sh
  tests/m09_m12_planning_readiness_test.sh
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

for f in docs/planning/CALPQ_PROGRAM_EXECUTION_M02_M12.md docs/planning/CALPQ_DELIVERY_WAVES_AND_PARALLELIZATION.md docs/planning/CALPQ_MILESTONE_ADMISSION_EXIT_MATRIX.md docs/planning/CALPQ_PROGRAM_EXECUTION_READINESS_MATRIX.md; do
  grep -q 'PLANNING ONLY / IMPLEMENTATION BLOCKED' "$f" || fail "$f must remain planning-only and blocked"
done

criteria_count="$(grep -Ec '^[0-9]+\.' docs/planning/CALPQ_PROGRAM_EXECUTION_READINESS_MATRIX.md)"
[[ "$criteria_count" -eq 36 ]] || fail "program readiness matrix must contain 36 criteria, got $criteria_count"

grep -q 'M00 repository governance PASS' docs/planning/CALPQ_PROGRAM_EXECUTION_M02_M12.md || fail 'Wave 0 governance prerequisite missing'
grep -q 'FV-00 formal admission' docs/planning/CALPQ_PROGRAM_EXECUTION_M02_M12.md || fail 'FV-00 admission prerequisite missing'
grep -q 'Wave 4 — M03/M04/M05 parallel product expansion' docs/planning/CALPQ_PROGRAM_EXECUTION_M02_M12.md || fail 'M03-M05 parallel wave missing'
grep -q 'M12 proves the complete system' docs/planning/CALPQ_PROGRAM_EXECUTION_M02_M12.md || fail 'M12 production proof boundary missing'
grep -q 'At most one milestone owns a given authoritative concept' docs/planning/CALPQ_DELIVERY_WAVES_AND_PARALLELIZATION.md || fail 'authoritative ownership rule missing'
grep -q 'Planning readiness is not implementation admission' docs/planning/CALPQ_MILESTONE_ADMISSION_EXIT_MATRIX.md || fail 'admission boundary missing'
grep -q 'green CI run is evidence' docs/planning/CALPQ_MILESTONE_ADMISSION_EXIT_MATRIX.md || fail 'CI authorization boundary missing'
grep -q 'M10 keeps AI subordinate' docs/planning/CALPQ_PROGRAM_EXECUTION_READINESS_MATRIX.md || fail 'AI authority boundary missing'
grep -q 'M12 requires production evidence' docs/planning/CALPQ_PROGRAM_EXECUTION_READINESS_MATRIX.md || fail 'GA evidence boundary missing'
grep -q '"state": "LOCKED"' foundation/feature-development-gate.json || fail 'feature development gate must remain locked'
grep -q 'current critical external blocker remains M00 repository governance / main protection' docs/architecture/CALPQ_MILESTONE_ARCHITECTURE_M01_M12.md || fail 'current blocker statement missing'

printf 'PROGRAM EXECUTION READINESS: PASS / M02-M12 SEQUENCED / 36 OF 36 CRITERIA / IMPLEMENTATION BLOCKED\n'
