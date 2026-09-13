#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'M00 RELEASE GATE: %s\n' "$1" >&2
  exit 1
}

grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json \
  || fail "unexpected M00 release state"

grep -q '"feature_development": "FROZEN"' foundation/manifest.json \
  || fail "feature state is inconsistent with M00"

grep -A 4 '"technology_stack"' foundation/manifest.json | grep -q '"status": "NOT_YET_APPROVED"' \
  || fail "technology state changed without an approved gate transition"

printf 'M00 RELEASE GATE: BLOCKED / CONSISTENT\n'
