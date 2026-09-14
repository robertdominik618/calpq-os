#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M03-M05 BATCH READINESS: %s\n' "$1" >&2; exit 1; }

required=(
  docs/planning/M03_DELIVERY_BATCHES.md
  docs/planning/M04_DELIVERY_BATCHES.md
  docs/planning/M05_DELIVERY_BATCHES.md
  docs/planning/M03_M05_DELIVERY_DEPENDENCY_MAP.md
  docs/planning/M03_M05_BATCH_READINESS_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

for f in "${required[@]}"; do grep -q 'PLANNING ONLY / IMPLEMENTATION BLOCKED' "$f" || fail "$f must remain blocked"; done

count="$(grep -Ec '^[0-9]+\.' docs/planning/M03_M05_BATCH_READINESS_MATRIX.md)"
[[ "$count" -eq 54 ]] || fail "expected 54 readiness criteria, got $count"

grep -q 'M03-A' docs/planning/M03_DELIVERY_BATCHES.md || fail 'M03-A missing'
grep -q 'M03-B' docs/planning/M03_DELIVERY_BATCHES.md || fail 'M03-B missing'
grep -q 'M03-C' docs/planning/M03_DELIVERY_BATCHES.md || fail 'M03-C missing'
grep -q 'M04-A' docs/planning/M04_DELIVERY_BATCHES.md || fail 'M04-A missing'
grep -q 'M04-B' docs/planning/M04_DELIVERY_BATCHES.md || fail 'M04-B missing'
grep -q 'M04-C' docs/planning/M04_DELIVERY_BATCHES.md || fail 'M04-C missing'
grep -q 'M05-A' docs/planning/M05_DELIVERY_BATCHES.md || fail 'M05-A missing'
grep -q 'M05-B' docs/planning/M05_DELIVERY_BATCHES.md || fail 'M05-B missing'
grep -q 'M05-C' docs/planning/M05_DELIVERY_BATCHES.md || fail 'M05-C missing'

grep -q 'Wave X1' docs/planning/M03_M05_DELIVERY_DEPENDENCY_MAP.md || fail 'X1 missing'
grep -q 'Wave X2' docs/planning/M03_M05_DELIVERY_DEPENDENCY_MAP.md || fail 'X2 missing'
grep -q 'Wave X3' docs/planning/M03_M05_DELIVERY_DEPENDENCY_MAP.md || fail 'X3 missing'
grep -q '"state": "LOCKED"' foundation/feature-development-gate.json || fail 'feature-development gate must remain locked'

printf 'M03-M05 BATCH READINESS: PASS / 54 OF 54 CRITERIA / IMPLEMENTATION BLOCKED\n'
