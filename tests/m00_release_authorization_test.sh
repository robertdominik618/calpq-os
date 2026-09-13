#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT

prepare() {
  rm -rf "$fixture/work"
  mkdir -p "$fixture/work"
  cp -R "$repo_root/." "$fixture/work/"
  rm -rf "$fixture/work/.git"
  printf '%s\n' '{"name":"main","protected":true}' > "$fixture/branch.json"
  printf '%s\n' '[{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active"}]' > "$fixture/rulesets.json"
  cat > "$fixture/ruleset.json" <<'JSON'
{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_review_thread_resolution":true}},{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":true,"required_status_checks":[{"context":"Enforce M00 Foundation gate"},{"context":"M00 internal readiness"},{"context":"M00 repository governance"}]}}]}
JSON
}

run_auth() {
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    bash scripts/m00_release_authorization_check.sh)
}

prepare
run_auth >/dev/null
printf 'TEST PASS: eligible M00 state accepted for explicit release decision\n'

prepare
printf '%s\n' '{"name":"main","protected":false}' > "$fixture/branch.json"
if run_auth >/dev/null 2>&1; then
  printf 'TEST FAIL: unprotected main was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: unprotected main rejected\n'
printf 'M00 RELEASE AUTHORIZATION SELF-TESTS: PASS\n'
