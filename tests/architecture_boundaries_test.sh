#!/usr/bin/env bash
set -euo pipefail
fail() { printf 'ARCHITECTURE TEST: %s\n' "$1" >&2; exit 1; }
for dir in packages/core packages/application packages/contracts packages/adapters apps/mobile apps/web apps/api workers/background; do
  [[ -f "$dir/package.json" ]] || fail "missing package manifest: $dir"
  [[ -f "$dir/README.md" ]] || fail "missing boundary README: $dir"
done
for flag in strict noUncheckedIndexedAccess exactOptionalPropertyTypes useUnknownInCatchVariables noImplicitOverride noFallthroughCasesInSwitch noPropertyAccessFromIndexSignature; do
  grep -q "\"$flag\": true" tsconfig.base.json || fail "strict flag missing: $flag"
done
grep -q 'packages/\*' pnpm-workspace.yaml || fail "packages workspace missing"
grep -q 'apps/\*' pnpm-workspace.yaml || fail "apps workspace missing"
grep -q 'workers/\*' pnpm-workspace.yaml || fail "workers workspace missing"
grep -q '"status": "APPROVED"' foundation/manifest.json || fail "technology stack not approved"
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail "feature freeze unexpectedly released"
srcdir="$(find packages apps workers -type d -name src -print -quit)"
[[ -z "$srcdir" ]] || fail "source directory exists before M00 release: $srcdir"
code="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print -quit)"
[[ -z "$code" ]] || fail "implementation source exists before M00 release: $code"
for forbidden in '@calpq/application' '@calpq/adapters' '@calpq/mobile' '@calpq/web' '@calpq/api'; do
  ! grep -q "$forbidden" packages/core/package.json || fail "Core depends outward on $forbidden"
done
printf 'ARCHITECTURE TESTS: PASS\n'
