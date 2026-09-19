#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 B2B ASSIGNMENT: %s\n' "$1" >&2; exit 1; }

phase="$(bash scripts/governance_lifecycle_phase.sh)"

required=(
  docs/contracts/ORGANIZATION_ROLE_DELEGATION_MODEL.md
  docs/contracts/ASSIGNMENT_REQUIREMENT_PROFILE.md
  docs/contracts/B2B_ASSIGNMENT_GUARD.md
  docs/contracts/ASSIGNMENT_DECISION_EVIDENCE.md
  docs/contracts/ORGANIZATION_COMPLIANCE_PROJECTION.md
  docs/prep/M01_B2B_ASSIGNMENT_BASELINE.md
  docs/prep/M01_B2B_ASSIGNMENT_TEST_MATRIX.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing pre-M01 boundary: $file"
done

grep -q 'MUST NOT transfer a professional credential' docs/contracts/ORGANIZATION_ROLE_DELEGATION_MODEL.md || fail 'delegation non-transfer invariant missing'
grep -q 'TEAM_COVERAGE_ALLOWED' docs/contracts/ASSIGNMENT_REQUIREMENT_PROFILE.md || fail 'team coverage contract missing'
grep -q 'ASSIGNABLE_WITH_CONDITIONS' docs/contracts/B2B_ASSIGNMENT_GUARD.md || fail 'conditional assignment state missing'
grep -q 'MUST NOT be silently rewritten' docs/contracts/ASSIGNMENT_DECISION_EVIDENCE.md || fail 'immutable decision invariant missing'
grep -q 'minimum-necessary disclosure' docs/prep/M01_B2B_ASSIGNMENT_BASELINE.md || fail 'privacy boundary missing'

bash tests/m01_continuous_compliance_test.sh

printf 'M01 B2B ASSIGNMENT: PASS / PHASE %s\n' "$phase"
