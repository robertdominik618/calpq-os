#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT

printf '%s\n' '{"name":"main","protected":true}' > "$fixture/protected.json"
printf '%s\n' '{"name":"main","protected":false}' > "$fixture/unprotected.json"
printf '%s\n' '[{"id":42,"name":"CALPQ main protection","target":"branch","enforcement":"active"}]' > "$fixture/rulesets.json"
printf '%s\n' '[]' > "$fixture/no-rulesets.json"
cat > "$fixture/ruleset.json" <<'JSON'
{
  "id": 42,
  "name": "CALPQ main protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},
  "rules": [
    {"type":"deletion"},
    {"type":"non_fast_forward"},
    {"type":"pull_request","parameters":{"required_review_thread_resolution":true}},
    {"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":true,"required_status_checks":[
      {"context":"Enforce M00 Foundation gate"},
      {"context":"M00 internal readiness"},
      {"context":"M00 repository governance"}
    ]}}
  ]
}
JSON

run_fixture() {
  CALPQ_BRANCH_METADATA_FILE="$1" \
  CALPQ_RULESETS_FILE="$2" \
  CALPQ_RULESET_DETAIL_FILE="$3" \
  bash "$repo_root/scripts/repository_governance_check.sh"
}

run_fixture "$fixture/protected.json" "$fixture/rulesets.json" "$fixture/ruleset.json" >/dev/null
printf 'TEST PASS: protected main with active CALPQ ruleset accepted\n'

if run_fixture "$fixture/unprotected.json" "$fixture/rulesets.json" "$fixture/ruleset.json" >/dev/null 2>&1; then
  printf 'TEST FAIL: unprotected main was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: unprotected main rejected\n'

if run_fixture "$fixture/protected.json" "$fixture/no-rulesets.json" "$fixture/ruleset.json" >/dev/null 2>&1; then
  printf 'TEST FAIL: missing active ruleset was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: missing active ruleset rejected\n'

cp "$fixture/ruleset.json" "$fixture/bad-ruleset.json"
jq '(.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks) |= map(select(.context != "M00 repository governance"))' \
  "$fixture/bad-ruleset.json" > "$fixture/bad-ruleset.tmp"
mv "$fixture/bad-ruleset.tmp" "$fixture/bad-ruleset.json"
if run_fixture "$fixture/protected.json" "$fixture/rulesets.json" "$fixture/bad-ruleset.json" >/dev/null 2>&1; then
  printf 'TEST FAIL: ruleset missing required CALPQ check was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: incomplete required status checks rejected\n'

printf 'REPOSITORY GOVERNANCE SELF-TESTS: PASS\n'
