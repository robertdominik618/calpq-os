#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'FEATURE DEVELOPMENT GATE: %s\n' "$1" >&2; exit 1; }

[[ -f foundation/manifest.json ]] || fail 'manifest missing'
[[ -f foundation/m00-release-decision.json ]] || fail 'release decision missing'
[[ -f foundation/feature-development-gate.json ]] || fail 'feature gate record missing'

grep -q '"release_decision_id": "CALPQ-M00-REL-0001"' foundation/feature-development-gate.json || fail 'release decision link missing'

if grep -q '"feature_development": "FROZEN"' foundation/manifest.json; then
  grep -q '"state": "LOCKED"' foundation/feature-development-gate.json || fail 'frozen feature state requires locked gate'
  if grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json; then
    grep -q '"status": "PENDING"' foundation/m00-release-decision.json || fail 'blocked M00 requires pending release decision'
  else
    grep -q '"status": "APPROVED"' foundation/m00-release-decision.json || fail 'released-but-frozen state requires approved release decision'
  fi
  printf 'FEATURE DEVELOPMENT GATE: LOCKED\n'
  exit 0
fi

if grep -q '"feature_development": "AUTHORIZED"' foundation/manifest.json; then
  ! grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail 'features cannot open while M00 is blocked'
  grep -q '"status": "APPROVED"' foundation/m00-release-decision.json || fail 'features require approved release decision'
  grep -q '"state": "OPEN"' foundation/feature-development-gate.json || fail 'feature gate is not open'
  ! grep -q '"opened_revision": null' foundation/feature-development-gate.json || fail 'opened revision missing'
  ! grep -q '"opened_by_transition": null' foundation/feature-development-gate.json || fail 'opening transition missing'
  printf 'FEATURE DEVELOPMENT GATE: OPEN\n'
  exit 0
fi

fail 'unknown feature development state'
