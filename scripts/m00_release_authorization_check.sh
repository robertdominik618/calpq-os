#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M00 RELEASE AUTHORIZATION: %s\n' "$1" >&2; exit 1; }

command -v jq >/dev/null 2>&1 || fail "jq is required"
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

if [[ -n "${CALPQ_M00_BLOCKER_FILE:-}" ]]; then
  blocker="$(cat "$CALPQ_M00_BLOCKER_FILE")"
else
  repository="${GITHUB_REPOSITORY:-robertdominik618/calpq-os}"
  api="${GITHUB_API_URL:-https://api.github.com}"
  headers=(-H 'Accept: application/vnd.github+json')
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    headers+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
  fi
  blocker="$(curl -fsSL "${headers[@]}" "$api/repos/$repository/issues/2")" \
    || fail "cannot read M00-BLK-001 issue state"
fi

jq -e '.number == 2 and .state == "closed"' >/dev/null <<< "$blocker" \
  || fail "M00-BLK-001 must be closed after repository governance passes"

printf 'M00 RELEASE AUTHORIZATION: ELIGIBLE FOR EXPLICIT RELEASE DECISION\n'
