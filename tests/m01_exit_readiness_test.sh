#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 EXIT READINESS: %s\n' "$1" >&2; exit 1; }

required=(
  docs/prep/M01_EXIT_READINESS_MATRIX.md
  docs/prep/M01_EXIT_GATE.md
  docs/prep/M01_FIRST_VERTICAL_SLICE_CANDIDATE.md
  docs/prep/M01_EXIT_READINESS_TEST_MATRIX.md
  docs/contracts/OPERATIONAL_RESILIENCE_MODEL.md
  docs/prep/M01_OPERATIONAL_RESILIENCE_BASELINE.md
  docs/prep/M01_OPERATIONAL_RESILIENCE_TEST_MATRIX.md
  docs/prep/M01_HANDOFF_RECORD.md
  docs/architecture/M01_POST_M00_IMPLEMENTATION_SEQUENCE.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'READY_FOR_IMPLEMENTATION_AFTER_M00_RELEASE' docs/prep/M01_EXIT_READINESS_MATRIX.md || fail 'final architecture readiness missing'
grep -q 'Operational resilience | 0015 | PASS' docs/prep/M01_EXIT_READINESS_MATRIX.md || fail 'PREP-0015 not closed'
grep -q 'M00_GOVERNANCE_BLOCKED' docs/prep/M01_HANDOFF_RECORD.md || fail 'governance block missing'
grep -q 'one logical command causes at most one accepted domain transition' docs/contracts/OPERATIONAL_RESILIENCE_MODEL.md || fail 'resilience idempotency missing'
grep -q 'authoritative aggregate/event state outranks projections' docs/contracts/OPERATIONAL_RESILIENCE_MODEL.md || fail 'resilience authority missing'
grep -q 'rebuild/replay cannot issue or mutate `AuthorizationGrant`' docs/prep/M01_OPERATIONAL_RESILIENCE_TEST_MATRIX.md || fail 'resilience replay boundary missing'
printf 'M01 OPERATIONAL RESILIENCE: PASS\n'

grep -q 'does not issue AuthorizationGrant' docs/prep/M01_EXIT_READINESS_TEST_MATRIX.md || fail 'first-slice authorization boundary missing'
grep -q 'M00_GOVERNANCE_BLOCKED' docs/prep/M01_FIRST_VERTICAL_SLICE_CANDIDATE.md || fail 'vertical admission block missing'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'
grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
implementation="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print -quit)"
[[ -z "$implementation" ]] || fail "implementation source detected while frozen: $implementation"
printf 'M01 EXIT READINESS: PASS\n'