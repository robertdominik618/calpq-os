#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 TENANT ISOLATION: %s\n' "$1" >&2; exit 1; }

required=(
  docs/contracts/TENANT_ORGANIZATION_SCOPE_MODEL.md
  docs/contracts/TENANT_CONTEXT_PROPAGATION_MODEL.md
  docs/contracts/CROSS_TENANT_ISOLATION_MODEL.md
)
for f in "${required[@]}"; do
  [[ -f "$f" ]] || fail "missing $f"
  grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$f" || fail "missing boundary $f"
done

grep -q 'Subject != Account != Organization != Tenant' docs/contracts/TENANT_ORGANIZATION_SCOPE_MODEL.md || fail 'core separation missing'
grep -q 'default tenant' docs/contracts/TENANT_CONTEXT_PROPAGATION_MODEL.md || fail 'default-tenant prohibition missing'
grep -q 'No single layer is sufficient by itself' docs/contracts/CROSS_TENANT_ISOLATION_MODEL.md || fail 'defense-in-depth boundary missing'
grep -q 'RLS alone' docs/contracts/CROSS_TENANT_ISOLATION_MODEL.md || fail 'RLS boundary missing'
grep -q 'feature_development": "FROZEN' foundation/manifest.json || fail 'feature development unexpectedly enabled'

printf 'M01 TENANT ISOLATION: PASS\n'