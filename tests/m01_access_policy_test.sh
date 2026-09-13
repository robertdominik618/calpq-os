#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 ACCESS GOVERNANCE: %s\n' "$1" >&2; exit 1; }

required=(
  docs/contracts/ACCESS_POLICY_MODEL.md
  docs/contracts/CONSENT_LEGAL_BASIS_MODEL.md
  docs/contracts/PURPOSE_LIMITATION_MODEL.md
  docs/contracts/SELECTIVE_DISCLOSURE_GOVERNANCE.md
  docs/contracts/PASSPORT_SELECTIVE_SHARING.md
  docs/prep/M01_ACCESS_POLICY_TEST_MATRIX.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing pre-M01 boundary: $file"
done

grep -q 'ALLOW_WITH_CONDITIONS' docs/contracts/ACCESS_POLICY_MODEL.md || fail 'decision states missing'
grep -q 'A role alone MUST NOT imply access' docs/contracts/ACCESS_POLICY_MODEL.md || fail 'role boundary missing'
grep -q 'Consent is one possible basis, not the universal basis' docs/contracts/CONSENT_LEGAL_BASIS_MODEL.md || fail 'basis separation missing'
grep -q 'materially different purpose' docs/contracts/PURPOSE_LIMITATION_MODEL.md || fail 'purpose limitation missing'
grep -q 'prefer a derived claim' docs/contracts/SELECTIVE_DISCLOSURE_GOVERNANCE.md || fail 'minimisation missing'
grep -q 'Extension: `CALPQ-M01-PREP-0012`' docs/contracts/PASSPORT_SELECTIVE_SHARING.md || fail 'PREP-0012 extension missing'
grep -q 'Audit evidence does not grant future access' docs/prep/M01_ACCESS_POLICY_TEST_MATRIX.md || fail 'history boundary missing'

grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'

printf 'M01 ACCESS GOVERNANCE: PASS\n'
