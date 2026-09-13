#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M01 CREDENTIAL DOMAIN: %s\n' "$1" >&2; exit 1; }

required=(
  docs/domain/CREDENTIAL_AUTHORIZATION_DOMAIN_BASELINE.md
  docs/domain/REQUIREMENT_ELIGIBILITY_MODEL.md
  docs/domain/CREDENTIAL_LIFECYCLE_STATE_MACHINE.md
  docs/domain/CREDENTIAL_COMMAND_EVENT_CATALOG.md
  docs/domain/CREDENTIAL_EVIDENCE_BINDING.md
  docs/interoperability/CREDENTIAL_INTEROPERABILITY_BOUNDARY.md
  docs/prep/M01_CREDENTIAL_DOMAIN_TEST_MATRIX.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "boundary missing: $file"
done

grep -q 'AuthorizationGrant' docs/domain/CREDENTIAL_AUTHORIZATION_DOMAIN_BASELINE.md || fail 'grant boundary missing'
grep -q 'AT_LEAST' docs/domain/REQUIREMENT_ELIGIBILITY_MODEL.md || fail 'threshold aggregation missing'
grep -q 'Two-axis model' docs/domain/CREDENTIAL_LIFECYCLE_STATE_MACHINE.md || fail 'two-axis lifecycle missing'
grep -q 'GrantAuthorization' docs/domain/CREDENTIAL_COMMAND_EVENT_CATALOG.md || fail 'grant command missing'
grep -q 'immutable evidence snapshot' docs/domain/CREDENTIAL_EVIDENCE_BINDING.md || fail 'evidence snapshot missing'
grep -q 'External credential formats' docs/interoperability/CREDENTIAL_INTEROPERABILITY_BOUNDARY.md || fail 'adapter boundary missing'
grep -q 'duplicate command ID' docs/prep/M01_CREDENTIAL_DOMAIN_TEST_MATRIX.md || fail 'idempotency scenario missing'
grep -q 'NOT_ADMITTED_FOR_IMPLEMENTATION' docs/prep/M01_CREDENTIAL_DOMAIN_TEST_MATRIX.md || fail 'admission boundary missing'

implementation="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print -quit)"
[[ -z "$implementation" ]] || fail "implementation source detected before M00 release: $implementation"

grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'

printf 'M01 CREDENTIAL DOMAIN: PASS\n'
