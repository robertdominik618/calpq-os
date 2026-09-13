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

grep -q '"packageManager": "pnpm@12.3.4"' package.json || fail "pnpm toolchain is not pinned"
grep -q '24.21.0' .node-version || fail "Node LTS baseline is not pinned"
grep -q '^engine-strict=true$' .npmrc || fail "engine-strict is not enabled"
grep -q '^save-exact=true$' .npmrc || fail "save-exact is not enabled"
grep -q '^node_modules/$' .gitignore || fail "node_modules is not ignored"
grep -q '^\.env$' .gitignore || fail "local env file is not ignored"
grep -q 'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1' .github/workflows/foundation-guard.yml || fail "checkout action is not SHA-pinned"
grep -q 'persist-credentials: false' .github/workflows/foundation-guard.yml || fail "checkout credentials persistence is not disabled"

grep -q '"status": "APPROVED"' foundation/manifest.json || fail "technology stack not approved"
grep -q '"feature_development": "FROZEN"' foundation/manifest.json || fail "feature freeze unexpectedly released"

srcdir="$(find packages apps workers -type d -name src -print -quit)"
[[ -z "$srcdir" ]] || fail "source directory exists before M00 release: $srcdir"
code="$(find packages apps workers -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) -print -quit)"
[[ -z "$code" ]] || fail "implementation source exists before M00 release: $code"

for forbidden in '@calpq/application' '@calpq/adapters' '@calpq/mobile' '@calpq/web' '@calpq/api'; do
  ! grep -q "$forbidden" packages/core/package.json || fail "Core depends outward on $forbidden"
done

if grep -R -E '"(dependencies|devDependencies|optionalDependencies|peerDependencies)"[[:space:]]*:' package.json packages apps workers --include='package.json' >/dev/null 2>&1; then
  [[ -f pnpm-lock.yaml ]] || fail "dependency declarations require pnpm-lock.yaml"
fi

printf 'ARCHITECTURE TESTS: PASS\n'
