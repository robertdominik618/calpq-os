#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M01 PASSPORT GAP: %s\n' "$1" >&2; exit 1; }

required=(
  docs/contracts/SUBJECT_PROFILE_PROFESSIONAL_PASSPORT.md
  docs/contracts/PASSPORT_EVIDENCE_PROJECTION.md
  docs/contracts/GAP_NAVIGATOR_MODEL.md
  docs/contracts/NEXT_BEST_ACTION_MODEL.md
  docs/contracts/PASSPORT_LIFECYCLE_RENEWAL_PROJECTION.md
  docs/contracts/PASSPORT_SELECTIVE_SHARING.md
  docs/prep/M01_PASSPORT_GAP_NAVIGATOR_BASELINE.md
  docs/prep/M01_PASSPORT_GAP_TEST_MATRIX.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing pre-M01 boundary: $file"
done

grep -q 'document status' docs/contracts/SUBJECT_PROFILE_PROFESSIONAL_PASSPORT.md || fail 'state separation missing'
grep -q 'No projection may upgrade' docs/contracts/PASSPORT_EVIDENCE_PROJECTION.md || fail 'evidence non-escalation missing'
grep -q 'ACTION_REQUIRED' docs/contracts/GAP_NAVIGATOR_MODEL.md || fail 'gap result missing'
grep -q 'bypass a mandatory prerequisite' docs/contracts/NEXT_BEST_ACTION_MODEL.md || fail 'next-action hard constraint missing'
grep -q 'Passing a date alone MUST NOT fabricate an authority event' docs/contracts/PASSPORT_LIFECYCLE_RENEWAL_PROJECTION.md || fail 'time boundary missing'
grep -q 'minimum necessary disclosure' docs/contracts/PASSPORT_SELECTIVE_SHARING.md || fail 'selective disclosure rule missing'

grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'

printf 'M01 PASSPORT GAP: PASS\n'
