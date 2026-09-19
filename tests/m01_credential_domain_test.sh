#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M01 CREDENTIAL DOMAIN: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"

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

trust_required=(
  docs/contracts/TRUST_REGISTRY_MODEL.md
  docs/contracts/AUTHORITY_RESOLUTION_MODEL.md
  docs/contracts/VERIFICATION_ORCHESTRATION_MODEL.md
  docs/contracts/VERIFIER_RELYING_PARTY_TRUST_MODEL.md
  docs/architecture/TRUST_SOURCE_ADAPTER_BOUNDARY.md
  docs/prep/M01_TRUST_REGISTRY_BASELINE.md
  docs/prep/M01_TRUST_REGISTRY_TEST_MATRIX.md
)

for file in "${trust_required[@]}"; do
  [[ -f "$file" ]] || fail "missing trust artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "trust boundary missing: $file"
done

grep -q 'Authority MUST NOT be inferred' docs/contracts/TRUST_REGISTRY_MODEL.md || fail 'identity-authority boundary missing'
grep -q 'cryptographic signature' docs/contracts/AUTHORITY_RESOLUTION_MODEL.md || fail 'signature-authority boundary missing'
grep -q 'Provider outage yields `INDETERMINATE`' docs/contracts/VERIFICATION_ORCHESTRATION_MODEL.md || fail 'provider outage semantic missing'
grep -q 'minimum necessary claims' docs/contracts/VERIFIER_RELYING_PARTY_TRUST_MODEL.md || fail 'verifier minimization missing'
grep -q 'Core MUST NOT depend' docs/architecture/TRUST_SOURCE_ADAPTER_BOUNDARY.md || fail 'trust adapter boundary missing'
grep -q 'verification never creates EligibilityAssessment or AuthorizationGrant by itself' docs/prep/M01_TRUST_REGISTRY_BASELINE.md || fail 'verification non-escalation missing'
grep -q 'AI may recommend a route but cannot promote authority state by itself' docs/prep/M01_TRUST_REGISTRY_TEST_MATRIX.md || fail 'AI authority scenario missing'

if [[ "$phase" != "POST_FV00_IMPLEMENTATION" ]]; then
  implementation="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print -quit)"
  [[ -z "$implementation" ]] || fail "implementation source detected before FV-00 admission: $implementation"
fi

printf 'M01 TRUST REGISTRY: PASS\n'
printf 'M01 CREDENTIAL DOMAIN: PASS / PHASE %s\n' "$phase"
