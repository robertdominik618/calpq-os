#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M01 CONTRACT PACK: %s\n' "$1" >&2; exit 1; }

required=(
  docs/prep/M01_CORE_KERNEL_CONTRACT_PACK.md
  docs/contracts/CORE_PRIMITIVES.md
  docs/contracts/CORE_PROVENANCE_AND_EVIDENCE.md
  docs/contracts/CORE_RESULT_AND_ERROR_MODEL.md
  docs/architecture/M01_CORE_IMPLEMENTATION_ORDER.md
  docs/prep/M01_CORE_KERNEL_TEST_MATRIX.md
  docs/contracts/AGGREGATE_COMMAND_EVENT_STATE_TRANSITION.md
  docs/contracts/COMMAND_EVENT_ENVELOPES.md
  docs/contracts/IDEMPOTENCY_AND_CONCURRENCY.md
  docs/contracts/STATE_TRANSITION_INVARIANTS.md
  docs/prep/M01_VERTICAL_ADMISSION_GATE.md
)

for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing contract artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" \
    || fail "missing no-implementation boundary: $file"
done

grep -q 'UUIDv7' docs/contracts/CORE_PRIMITIVES.md || fail 'UUIDv7 identity policy missing'
grep -q 'Clock' docs/contracts/CORE_PRIMITIVES.md || fail 'Clock boundary missing'
grep -q 'REVIEW_REQUIRED' docs/contracts/CORE_RESULT_AND_ERROR_MODEL.md || fail 'review-required outcome missing'
grep -q 'expected_revision' docs/contracts/AGGREGATE_COMMAND_EVENT_STATE_TRANSITION.md || fail 'optimistic concurrency input missing'
grep -q 'No silent last-write-wins' docs/contracts/IDEMPOTENCY_AND_CONCURRENCY.md || fail 'last-write-wins prohibition missing'
grep -q 'Single mutation authority' docs/contracts/STATE_TRANSITION_INVARIANTS.md || fail 'aggregate mutation invariant missing'
grep -q 'ADMITTED_FOR_IMPLEMENTATION' docs/prep/M01_VERTICAL_ADMISSION_GATE.md || fail 'vertical admission result missing'

implementation="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print -quit)"
[[ -z "$implementation" ]] || fail "implementation source detected before M00 release: $implementation"

grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'

bash tests/m01_access_policy_test.sh
bash tests/m01_audit_ledger_test.sh

printf 'M01 CONTRACT PACK: PASS\n'
