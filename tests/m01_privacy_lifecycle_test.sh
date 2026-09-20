#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 PRIVACY LIFECYCLE: %s\n' "$1" >&2; exit 1; }
phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/contracts/PRIVACY_LIFECYCLE_MODEL.md
  docs/prep/M01_PRIVACY_LIFECYCLE_BASELINE.md
  docs/prep/M01_PRIVACY_LIFECYCLE_TEST_MATRIX.md
)
for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing pre-M01 boundary: $file"
done

grep -q 'Account closure' docs/contracts/PRIVACY_LIFECYCLE_MODEL.md || fail 'account/domain separation missing'
grep -q 'preservation hold' docs/contracts/PRIVACY_LIFECYCLE_MODEL.md || fail 'preservation hold missing'
grep -q 'does not grant wider access' docs/contracts/PRIVACY_LIFECYCLE_MODEL.md || fail 'hold/access boundary missing'
grep -q 'Derived data' docs/contracts/PRIVACY_LIFECYCLE_MODEL.md || fail 'derived lifecycle rule missing'
grep -q 'reapply current lifecycle restrictions' docs/contracts/PRIVACY_LIFECYCLE_MODEL.md || fail 'restore safety missing'
grep -q 'Pseudonymised data is not treated as anonymous' docs/prep/M01_PRIVACY_LIFECYCLE_TEST_MATRIX.md || fail 'pseudonymisation boundary missing'

printf 'M01 PRIVACY LIFECYCLE: PASS / PHASE %s\n' "$phase"
