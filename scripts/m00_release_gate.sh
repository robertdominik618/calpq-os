#!/usr/bin/env bash
set -euo pipefail
fail() { printf 'M00 RELEASE GATE: %s\n' "$1" >&2; exit 1; }
grep -q '"m00_release_status": "BLOCKED"' foundation/manifest.json || fail "unexpected M00 release state"
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail "feature state is inconsistent with M00"
grep -q '"status": "APPROVED"' foundation/manifest.json || fail "technology stack is not approved"
grep -q '"decision": "ADR-0002"' foundation/manifest.json || fail "technology decision reference missing"
grep -q 'Status: `ACCEPTED`' docs/adr/ADR-0002-technology-stack-selection.md || fail "ADR-0002 is not accepted"
printf 'M00 RELEASE GATE: BLOCKED / STACK APPROVED / FEATURE FROZEN\n'
