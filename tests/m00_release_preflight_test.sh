#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M00 RELEASE PREFLIGHT: %s\n' "$1" >&2; exit 1; }
[[ -f foundation/m00-release-preflight.json ]] || fail 'preflight state missing'
[[ -f docs/foundation/M00_RELEASE_DECISION_PREFLIGHT.md ]] || fail 'preflight document missing'
grep -q '"status": "WAITING_FOR_G6"' foundation/m00-release-preflight.json || fail 'preflight must wait for G6'
grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'M00 unexpectedly released'
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail 'features unexpectedly unfrozen'
grep -q '"status": "PENDING"' foundation/m00-release-decision.json || fail 'release decision unexpectedly changed'
grep -q 'M00_GOVERNANCE_BLOCKED\|M00-BLK-001\|WAITING_FOR_G6' docs/foundation/M00_RELEASE_DECISION_PREFLIGHT.md || fail 'G6 dependency missing'
printf 'M00 RELEASE PREFLIGHT: PASS\n'
