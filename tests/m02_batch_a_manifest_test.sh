#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M02 BATCH A MANIFEST: %s\n' "$1" >&2; exit 1; }

manifest='docs/planning/M02_BATCH_A_IMPLEMENTATION_MANIFEST.md'
[[ -f "$manifest" ]] || fail 'manifest missing'
phase="$(bash scripts/governance_lifecycle_phase.sh)"

case "$phase" in
  PRE_M00|POST_M00_PRE_FEATURE|POST_FEATURE_PRE_FV00)
    grep -q 'IMPLEMENTATION BLOCKED' "$manifest" || fail 'pre-admission manifest must remain blocked'
    source_count="$(grep -Ec '^A[0-9]+\. `packages/core/src/' "$manifest")"
    test_count="$(grep -Ec '^T[0-9]+\. `packages/core/test/' "$manifest")"
    commit_count="$(grep -Ec '^[0-9]+\. A[0-9]+ —' "$manifest")"
    [[ "$source_count" -eq 11 ]] || fail "expected 11 planned source files, got $source_count"
    [[ "$test_count" -eq 10 ]] || fail "expected 10 planned test files, got $test_count"
    [[ "$commit_count" -eq 10 ]] || fail "expected 10 commit steps, got $commit_count"
    ;;
  POST_FV00_IMPLEMENTATION)
    grep -q 'IMPLEMENTED / MACHINE-VERIFIED / REVIEW CANDIDATE' "$manifest" \
      || fail 'post-admission manifest must record implemented review-candidate state'
    grep -q 'FV-01 #21 — SUCCESS' "$manifest" || fail 'FV-01 exit evidence missing'
    grep -q 'FV-05 #6 — SUCCESS' "$manifest" || fail 'FV-05 exit evidence missing'
    grep -q '9d894e017912f29e3d87029d07b37f0ae2b24b12' "$manifest" || fail 'review-candidate head missing'
    [[ -f docs/planning/M02_BATCH_A_EXIT_EVIDENCE.md ]] || fail 'Batch A exit evidence missing'
    ;;
  *) fail "unsupported lifecycle phase: $phase" ;;
esac

grep -q 'CredentialArtifact cannot create or imply AuthorizationGrant' "$manifest" || fail 'authorization boundary missing'
grep -q 'no ambient time/randomness' "$manifest" || fail 'nondeterminism boundary missing'
grep -q 'merge/review disposition' "$manifest" || grep -q 'Mergeability alone is not completion evidence' "$manifest" \
  || fail 'completion/review evidence boundary missing'

if grep -q '"state": "LOCKED"' foundation/feature-development-gate.json; then
  unexpected="$(find packages/core -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print)"
  [[ -z "$unexpected" ]] || fail "feature gate locked but product source exists: $unexpected"
fi

printf 'M02 BATCH A MANIFEST: PASS / PHASE %s\n' "$phase"
