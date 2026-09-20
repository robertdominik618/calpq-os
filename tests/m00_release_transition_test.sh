#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/tests/helpers/governance_fixture.sh"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT

prepare() {
  rm -rf "$fixture/work"
  mkdir -p "$fixture/work"
  cp -R "$repo_root/." "$fixture/work/"
  rm -rf "$fixture/work/.git" "$fixture/work/node_modules"
  calpq_reset_governance_fixture "$fixture/work"
  printf '%s\n' '{"name":"main","protected":true}' > "$fixture/branch.json"
  printf '%s\n' '[{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active"}]' > "$fixture/rulesets.json"
  cat > "$fixture/ruleset.json" <<'JSON'
{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_review_thread_resolution":true}},{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":true,"required_status_checks":[{"context":"Enforce M00 Foundation gate"},{"context":"M00 internal readiness"},{"context":"M00 repository governance"}]}}]}
JSON
  printf '%s\n' '{"number":2,"state":"closed","title":"M00-BLK-001"}' > "$fixture/blocker.json"
}

run_transition() {
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    CALPQ_M00_BLOCKER_FILE="$fixture/blocker.json" \
    CALPQ_M00_RELEASE_APPROVAL="APPROVE_CALPQ_M00_RELEASE" \
    CALPQ_M00_APPROVED_BY="CALPQ governance test" \
    CALPQ_M00_APPROVED_AT="2026-09-14T20:30:00Z" \
    CALPQ_M00_AUDITED_REVISION="1111111111111111111111111111111111111111" \
    bash scripts/m00_release_transition.sh)
}

prepare
run_transition >/dev/null
jq -e '.m00_release_status == "RELEASED" and .feature_development == "FROZEN" and .quality_gates.repository_governance == "PASS" and .quality_gates.m00_release_decision == "APPROVED"' "$fixture/work/foundation/manifest.json" >/dev/null
jq -e '.status == "APPROVED" and .current_state.repository_governance == "PASS" and (.remaining_blockers | length) == 0 and .approved_transition.next_gate == "FEATURE_DEVELOPMENT_GATE"' "$fixture/work/foundation/m00-release-decision.json" >/dev/null
jq -e '.status == "COMPLETED" and .required_gate_state.g7_explicit_release_decision == "APPROVED" and .current_project_state.feature_development == "FROZEN"' "$fixture/work/foundation/m00-release-preflight.json" >/dev/null
(cd "$fixture/work" && bash scripts/m00_release_gate.sh >/dev/null)
printf 'TEST PASS: explicit M00 release transition preserves frozen feature development\n'

prepare
if (cd "$fixture/work" && \
  CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
  CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
  CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
  CALPQ_M00_BLOCKER_FILE="$fixture/blocker.json" \
  CALPQ_M00_APPROVED_BY="CALPQ governance test" \
  CALPQ_M00_AUDITED_REVISION="1111111111111111111111111111111111111111" \
  bash scripts/m00_release_transition.sh >/dev/null 2>&1); then
  printf 'TEST FAIL: transition accepted without explicit approval token\n' >&2
  exit 1
fi
jq -e '.m00_release_status == "BLOCKED" and .feature_development == "FROZEN"' "$fixture/work/foundation/manifest.json" >/dev/null
printf 'TEST PASS: missing explicit approval rejected without state mutation\n'

prepare
printf '%s\n' '{"number":2,"state":"open","title":"M00-BLK-001"}' > "$fixture/blocker.json"
if run_transition >/dev/null 2>&1; then
  printf 'TEST FAIL: transition accepted while M00-BLK-001 is open\n' >&2
  exit 1
fi
jq -e '.m00_release_status == "BLOCKED" and .feature_development == "FROZEN"' "$fixture/work/foundation/manifest.json" >/dev/null
printf 'TEST PASS: open M00 blocker rejected without state mutation\n'

prepare
if (cd "$fixture/work" && \
  CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
  CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
  CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
  CALPQ_M00_BLOCKER_FILE="$fixture/blocker.json" \
  CALPQ_M00_RELEASE_APPROVAL="APPROVE_CALPQ_M00_RELEASE" \
  CALPQ_M00_AUDITED_REVISION="1111111111111111111111111111111111111111" \
  bash scripts/m00_release_transition.sh >/dev/null 2>&1); then
  printf 'TEST FAIL: transition accepted without approver identity\n' >&2
  exit 1
fi
printf 'TEST PASS: missing approver identity rejected\n'

printf 'M00 RELEASE TRANSITION SELF-TESTS: PASS\n'
