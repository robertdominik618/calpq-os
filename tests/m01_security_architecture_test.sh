#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 SECURITY ARCHITECTURE: %s\n' "$1" >&2; exit 1; }
phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/security/SECURITY_ARCHITECTURE_THREAT_MODEL.md
  docs/contracts/SECURITY_IDENTITY_SESSION_BOUNDARY.md
  docs/contracts/SECRETS_CRYPTO_BOUNDARY.md
  docs/contracts/SECURITY_MISUSE_CONTROLS.md
  docs/contracts/UNTRUSTED_CONTENT_AI_SECURITY_BOUNDARY.md
  docs/contracts/PRIVILEGED_ADMIN_BREAK_GLASS_MODEL.md
  docs/prep/M01_SECURITY_BASELINE.md
  docs/prep/M01_SECURITY_TEST_MATRIX.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing pre-M01 boundary: $file"
done

grep -q 'secrets and provider credentials never enter Core domain state' docs/security/SECURITY_ARCHITECTURE_THREAT_MODEL.md || fail 'core secret boundary missing'
grep -q 'authentication proves control' docs/contracts/SECURITY_IDENTITY_SESSION_BOUNDARY.md || fail 'auth identity separation missing'
grep -q 'raw secrets and private keys MUST NOT be stored in Core aggregates' docs/contracts/SECRETS_CRYPTO_BOUNDARY.md || fail 'raw secret boundary missing'
grep -q 'Rate limiting or temporary throttling is an operational/security outcome, not a domain rejection' docs/contracts/SECURITY_MISUSE_CONTROLS.md || fail 'misuse/domain boundary missing'
grep -q 'instructions embedded inside documents are data' docs/contracts/UNTRUSTED_CONTENT_AI_SECURITY_BOUNDARY.md || fail 'untrusted content boundary missing'
grep -q 'no permanent role elevation by break-glass' docs/contracts/PRIVILEGED_ADMIN_BREAK_GLASS_MODEL.md || fail 'break-glass boundary missing'
grep -q 'security signals may trigger protective restrictions/review but do not directly rewrite credential/legal truth' docs/prep/M01_SECURITY_BASELINE.md || fail 'security signal boundary missing'
grep -q 'PREP-0016 remains design-only' docs/prep/M01_SECURITY_TEST_MATRIX.md || fail 'admission boundary missing'

printf 'M01 SECURITY ARCHITECTURE: PASS / PHASE %s\n' "$phase"
