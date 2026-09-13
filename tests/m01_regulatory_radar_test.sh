#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M01 REGULATORY RADAR: %s\n' "$1" >&2; exit 1; }
required=(
  docs/contracts/REGULATORY_RADAR_MODEL.md
  docs/contracts/ACTION_QUEUE_MODEL.md
  docs/contracts/NOTIFICATION_POLICY_MODEL.md
  docs/contracts/HUMAN_REVIEW_CASE_MODEL.md
  docs/prep/M01_REGULATORY_RADAR_BASELINE.md
  docs/prep/M01_REGULATORY_RADAR_TEST_MATRIX.md
)
for file in "${required[@]}"; do
  [[ -f "$file" ]] || fail "missing artifact: $file"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$file" || fail "missing prep boundary: $file"
done
grep -q 'ACKNOWLEDGED' docs/contracts/NOTIFICATION_POLICY_MODEL.md || fail 'notification acknowledgement state missing'
grep -q 'MUST NOT mean' docs/contracts/NOTIFICATION_POLICY_MODEL.md || fail 'notification/compliance separation missing'
grep -q 'MUST NOT automatically mean' docs/contracts/ACTION_QUEUE_MODEL.md || fail 'action/compliance separation missing'
grep -q 'AI/OCR MAY' docs/contracts/HUMAN_REVIEW_CASE_MODEL.md || fail 'human review AI boundary missing'
grep -q 'closed only after an auditable resolution basis exists' docs/prep/M01_REGULATORY_RADAR_BASELINE.md || fail 'closure evidence invariant missing'
grep -q 'Historical decisions and resolutions are immutable' docs/prep/M01_REGULATORY_RADAR_BASELINE.md || fail 'history invariant missing'
grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'feature development unexpectedly enabled'
printf 'M01 REGULATORY RADAR: PASS\n'
