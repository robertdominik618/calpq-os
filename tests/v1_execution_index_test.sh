#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'CALPQ V1 EXECUTION INDEX: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"
index='docs/planning/CALPQ_V1_EXECUTION_INDEX.md'
[[ -f "$index" ]] || fail 'execution index missing'

grep -q 'M02 — First Vertical' "$index" || fail 'M02 missing'
for m in 03 04 05 06 07 08 09 10 11 12; do
  grep -q "## M${m} —" "$index" || fail "M${m} missing"
done

grep -q 'total v1 execution units: `130`' "$index" || fail '130-unit total missing'
grep -q 'Foundation Guard: SUCCESS' "$index" || fail 'Foundation CI evidence missing'
grep -q 'M09-M12 Execution Readiness: SUCCESS' "$index" || fail 'M09-M12 CI evidence missing'
grep -q 'Verify main protection' "$index" || fail 'governance evidence reference missing'
grep -q 'planning readiness is not implementation admission' "$index" || fail 'admission boundary missing'
grep -q 'GA requires production evidence' "$index" || fail 'GA evidence boundary missing'

printf 'CALPQ V1 EXECUTION INDEX: PASS / 130 UNITS / PHASE %s\n' "$phase"
