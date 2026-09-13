#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M00 READINESS: %s\n' "$1" >&2; exit 1; }

bash scripts/foundation_guard.sh >/dev/null
bash scripts/m00_release_gate.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

[[ -f docs/foundation/REPOSITORY_GOVERNANCE.md ]] || fail "repository governance baseline missing"
grep -q 'WCAG 2.2 AA' docs/foundation/ACCESSIBILITY_BASELINE.md || fail "accessibility target is not measurable"
grep -q 'least-privilege access' docs/foundation/SECURITY_PRIVACY_BASELINE.md || fail "security access baseline missing"
grep -q 'Threat-review' docs/foundation/SECURITY_PRIVACY_BASELINE.md || fail "security review gate missing"
grep -q 'VERIFIED' docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md || fail "regulatory verification state missing"
grep -q 'STALE/REVIEW_REQUIRED' docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md || fail "regulatory stale-state handling missing"
grep -q '"packageManager": "pnpm@12.3.4"' package.json || fail "pnpm is not pinned"
grep -q '^24.21.0$' .node-version || fail "Node LTS is not pinned"
grep -q 'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1' .github/workflows/foundation-guard.yml || fail "Foundation workflow action is not SHA-pinned"

printf 'M00 READINESS INTERNAL: PASS\n'
