#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 EXIT READINESS: %s\n' "$1" >&2; exit 1; }

required=(
  docs/prep/M01_EXIT_READINESS_MATRIX.md
  docs/prep/M01_EXIT_GATE.md
  docs/prep/M01_FIRST_VERTICAL_SLICE_CANDIDATE.md
  docs/prep/M01_EXIT_READINESS_TEST_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'READY_WITH_DEFERRED_NONBLOCKING_ITEMS' docs/prep/M01_EXIT_READINESS_MATRIX.md || fail 'architecture readiness missing'
grep -q 'M00_GOVERNANCE_BLOCKED' docs/prep/M01_EXIT_GATE.md || fail 'governance block missing'
grep -q 'DESIGN_PASS_GUARD_DEFERRED' docs/prep/M01_EXIT_READINESS_MATRIX.md || fail 'PREP-0015 gap classification missing'
grep -q 'does not issue AuthorizationGrant' docs/prep/M01_EXIT_READINESS_TEST_MATRIX.md || fail 'first-slice authorization boundary missing'
grep -q 'M00_GOVERNANCE_BLOCKED' docs/prep/M01_FIRST_VERTICAL_SLICE_CANDIDATE.md || fail 'vertical admission block missing'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'
grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'

implementation="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print -quit)"
[[ -z "$implementation" ]] || fail "implementation source detected while frozen: $implementation"

printf 'M01 EXIT READINESS: PASS\n'