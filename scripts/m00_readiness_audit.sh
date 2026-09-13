#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M00 READINESS: %s\n' "$1" >&2; exit 1; }

bash scripts/foundation_guard.sh >/dev/null
bash scripts/m00_release_gate.sh >/dev/null
bash tests/architecture_boundaries_test.sh >/dev/null

[[ -f docs/foundation/REPOSITORY_GOVERNANCE.md ]] || fail "repository governance baseline missing"
[[ -f docs/foundation/GITHUB_MAIN_RULESET.md ]] || fail "GitHub main ruleset procedure missing"
[[ -f foundation/github-main-ruleset.json ]] || fail "importable GitHub main ruleset missing"

grep -q 'WCAG 2.2 AA' docs/foundation/ACCESSIBILITY_BASELINE.md || fail "accessibility target is not measurable"
grep -q 'least-privilege access' docs/foundation/SECURITY_PRIVACY_BASELINE.md || fail "security access baseline missing"
grep -q 'Threat-review' docs/foundation/SECURITY_PRIVACY_BASELINE.md || fail "security review gate missing"
grep -q 'VERIFIED' docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md || fail "regulatory verification state missing"
grep -q 'STALE/REVIEW_REQUIRED' docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md || fail "regulatory stale-state handling missing"
grep -q '"packageManager": "pnpm@12.3.4"' package.json || fail "pnpm is not pinned"
grep -q '^24.21.0$' .node-version || fail "Node LTS is not pinned"
grep -q 'actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1' .github/workflows/foundation-guard.yml || fail "Foundation workflow action is not SHA-pinned"

command -v jq >/dev/null 2>&1 || fail "jq is required for ruleset blueprint validation"
ruleset_file="foundation/github-main-ruleset.json"
jq -e '.name == "CALPQ main protection" and .target == "branch" and .enforcement == "active"' "$ruleset_file" >/dev/null \
  || fail "GitHub ruleset blueprint identity/target/enforcement is invalid"
jq -e '.conditions.ref_name.include | any(. == "~DEFAULT_BRANCH" or . == "refs/heads/main")' "$ruleset_file" >/dev/null \
  || fail "GitHub ruleset blueprint does not target default branch/main"
for rule in deletion non_fast_forward pull_request required_status_checks; do
  jq -e --arg rule "$rule" '.rules | any(.type == $rule)' "$ruleset_file" >/dev/null \
    || fail "GitHub ruleset blueprint is missing rule: $rule"
done
for check in "Enforce M00 Foundation gate" "M00 internal readiness" "M00 repository governance"; do
  jq -e --arg check "$check" '.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks | any(.context == $check)' "$ruleset_file" >/dev/null \
    || fail "GitHub ruleset blueprint is missing status check: $check"
done
jq -e '.rules[] | select(.type == "required_status_checks") | .parameters.strict_required_status_checks_policy == true' "$ruleset_file" >/dev/null \
  || fail "GitHub ruleset blueprint is not strict/up-to-date"

printf 'M00 READINESS INTERNAL: PASS\n'
