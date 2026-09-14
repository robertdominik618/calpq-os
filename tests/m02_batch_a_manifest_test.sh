#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M02 BATCH A MANIFEST: %s\n' "$1" >&2; exit 1; }

manifest='docs/planning/M02_BATCH_A_IMPLEMENTATION_MANIFEST.md'
[[ -f "$manifest" ]] || fail 'manifest missing'
grep -q 'IMPLEMENTATION BLOCKED' "$manifest" || fail 'manifest must remain blocked'

source_count="$(grep -Ec '^A[0-9]+\. `packages/core/src/' "$manifest")"
test_count="$(grep -Ec '^T[0-9]+\. `packages/core/test/' "$manifest")"
commit_count="$(grep -Ec '^[0-9]+\. A[0-9]+ —' "$manifest")"
[[ "$source_count" -eq 11 ]] || fail "expected 11 planned source files, got $source_count"
[[ "$test_count" -eq 10 ]] || fail "expected 10 planned test files, got $test_count"
[[ "$commit_count" -eq 10 ]] || fail "expected 10 commit steps, got $commit_count"

grep -q 'CredentialArtifact cannot create or imply AuthorizationGrant' "$manifest" || fail 'authorization boundary missing'
grep -q 'no ambient time/randomness' "$manifest" || fail 'nondeterminism boundary missing'
grep -q 'Mergeability alone is not completion evidence' "$manifest" || fail 'completion evidence boundary missing'

if grep -q '"state": "LOCKED"' foundation/feature-development-gate.json; then
  unexpected="$(find packages/core -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print)"
  [[ -z "$unexpected" ]] || fail "feature gate locked but product source exists: $unexpected"
fi

printf 'M02 BATCH A MANIFEST: PASS / 11 SOURCE TARGETS / 10 TEST TARGETS / 10 COMMITS / PRE-CODE BASELINE CLEAN\n'
