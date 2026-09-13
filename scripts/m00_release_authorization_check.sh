#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M00 RELEASE AUTHORIZATION: %s\n' "$1" >&2; exit 1; }

[[ -f foundation/manifest.json ]] || fail "manifest missing"
grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json \
  || fail "release decision must start from BLOCKED state"
grep -q '"feature_development": "FROZEN"' foundation/manifest.json \
  || fail "feature development must remain FROZEN before explicit release"
grep -q '"status": "APPROVED"' foundation/manifest.json \
  || fail "technology stack is not approved"
grep -q 'Status: `ACCEPTED`' docs/adr/ADR-0002-technology-stack-selection.md \
  || fail "ADR-0002 is not accepted"

bash scripts/m00_readiness_audit.sh >/dev/null
bash scripts/repository_governance_check.sh >/dev/null

printf 'M00 RELEASE AUTHORIZATION: ELIGIBLE FOR EXPLICIT RELEASE DECISION\n'
