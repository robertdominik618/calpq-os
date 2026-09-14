#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M06-M08 BATCH READINESS: %s\n' "$1" >&2; exit 1; }

required=(
  docs/planning/M06_DELIVERY_BATCHES.md
  docs/planning/M07_DELIVERY_BATCHES.md
  docs/planning/M08_DELIVERY_BATCHES.md
  docs/planning/M06_M08_DELIVERY_DEPENDENCY_MAP.md
  docs/planning/M06_M08_BATCH_READINESS_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done
for f in "${required[@]}"; do grep -q 'PLANNING ONLY / IMPLEMENTATION BLOCKED' "$f" || fail "$f must remain blocked"; done
count="$(grep -Ec '^[0-9]+\.' docs/planning/M06_M08_BATCH_READINESS_MATRIX.md)"
[[ "$count" -eq 54 ]] || fail "expected 54 readiness criteria, got $count"
for token in M06-A M06-B M06-C; do grep -q "$token" docs/planning/M06_DELIVERY_BATCHES.md || fail "$token missing"; done
for token in M07-A M07-B M07-C; do grep -q "$token" docs/planning/M07_DELIVERY_BATCHES.md || fail "$token missing"; done
for token in M08-A M08-B M08-C; do grep -q "$token" docs/planning/M08_DELIVERY_BATCHES.md || fail "$token missing"; done
for wave in 'Wave Y1' 'Wave Y2' 'Wave Y3'; do grep -q "$wave" docs/planning/M06_M08_DELIVERY_DEPENDENCY_MAP.md || fail "$wave missing"; done
grep -q '"state": "LOCKED"' foundation/feature-development-gate.json || fail 'feature-development gate must remain locked'
printf 'M06-M08 BATCH READINESS: PASS / 54 OF 54 CRITERIA / IMPLEMENTATION BLOCKED\n'
