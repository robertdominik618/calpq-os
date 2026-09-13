#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M02 PLANNING READINESS: %s\n' "$1" >&2; exit 1; }

required=(
  docs/planning/M02_FIRST_VERTICAL_DELIVERY_PLAN.md
  docs/planning/M02_FIRST_VERTICAL_BACKLOG.md
  docs/planning/M02_FIRST_VERTICAL_ACCEPTANCE_MATRIX.md
  docs/planning/M02_FIRST_VERTICAL_ADMISSION_CHECKLIST.md
  docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md
  docs/planning/FV00_DOMAIN_STATE_BOUNDARY.md
  docs/planning/FV00_COMMAND_EVENT_CATALOG.md
  docs/planning/FV00_TRACEABILITY_INDEX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

scenario_count="$(grep -Ec '^[0-9]+\.' docs/planning/M02_FIRST_VERTICAL_ACCEPTANCE_MATRIX.md)"
[[ "$scenario_count" -eq 45 ]] || fail "acceptance matrix must contain 45 scenarios"

tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
grep -hEo '"[0-9]+":' docs/planning/traceability/FV00_TRC_*.json | tr -d '":' | sort -n > "$tmp"
for n in $(seq 1 45); do
  count="$(grep -xc "$n" "$tmp" || true)"
  [[ "$count" -eq 1 ]] || fail "scenario $n traceability count is $count, expected 1"
done
extra="$(awk '$1 < 1 || $1 > 45 {print; exit}' "$tmp")"
[[ -z "$extra" ]] || fail "traceability contains out-of-range scenario $extra"

for n in $(seq -w 0 15); do
  grep -q "FV-${n}" docs/planning/M02_FIRST_VERTICAL_BACKLOG.md || fail "missing FV-${n} backlog item"
done

grep -q '^`BLOCKED_PENDING_M00`$' docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md || fail "FV-00 must remain blocked pending M00"
grep -q '"state": "LOCKED"' foundation/feature-development-gate.json || fail "feature gate must remain locked"

printf 'M02 PLANNING READINESS: PASS / 45 OF 45 TRACEABLE / FV-00 BLOCKED_PENDING_M00\n'
