#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT

printf '%s\n' '{"name":"main","protected":true}' > "$fixture/protected.json"
printf '%s\n' '{"name":"main","protected":false}' > "$fixture/unprotected.json"

CALPQ_BRANCH_METADATA_FILE="$fixture/protected.json" bash "$repo_root/scripts/repository_governance_check.sh" >/dev/null
printf 'TEST PASS: protected main accepted\n'

if CALPQ_BRANCH_METADATA_FILE="$fixture/unprotected.json" bash "$repo_root/scripts/repository_governance_check.sh" >/dev/null 2>&1; then
  printf 'TEST FAIL: unprotected main was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: unprotected main rejected\n'

printf 'REPOSITORY GOVERNANCE SELF-TESTS: PASS\n'
