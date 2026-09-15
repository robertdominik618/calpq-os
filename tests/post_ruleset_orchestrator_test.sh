#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'POST-RULESET ORCHESTRATOR TEST: %s\n' "$1" >&2; exit 1; }
assert_contains() {
  local haystack="$1"
  local needle="$2"
  grep -Fq "$needle" <<< "$haystack" || fail "expected output missing: $needle"
}

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/tests/helpers/governance_fixture.sh"
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

mkdir -p "$tmpdir/base/foundation" "$tmpdir/base/docs/planning"
cp foundation/manifest.json "$tmpdir/base/foundation/manifest.json"
cp foundation/m00-release-decision.json "$tmpdir/base/foundation/m00-release-decision.json"
cp foundation/m00-release-preflight.json "$tmpdir/base/foundation/m00-release-preflight.json"
cp foundation/feature-development-gate.json "$tmpdir/base/foundation/feature-development-gate.json"
cp docs/planning/fv00-admission-decision.json "$tmpdir/base/docs/planning/fv00-admission-decision.json"
cp docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md "$tmpdir/base/docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md"
calpq_reset_governance_fixture "$tmpdir/base"

cp "$tmpdir/base/foundation/manifest.json" "$tmpdir/manifest.base.json"
cp "$tmpdir/base/foundation/m00-release-decision.json" "$tmpdir/m00-release-decision.base.json"
cp "$tmpdir/base/foundation/feature-development-gate.json" "$tmpdir/feature-development-gate.base.json"
cp "$tmpdir/base/docs/planning/fv00-admission-decision.json" "$tmpdir/fv00-admission-decision.base.json"
cp "$tmpdir/manifest.base.json" "$tmpdir/manifest.json"
cp "$tmpdir/m00-release-decision.base.json" "$tmpdir/m00-release-decision.json"
cp "$tmpdir/feature-development-gate.base.json" "$tmpdir/feature-development-gate.json"
cp "$tmpdir/fv00-admission-decision.base.json" "$tmpdir/fv00-admission-decision.json"

cat > "$tmpdir/branch-pass.json" <<'JSON'
{"name":"main","protected":true}
JSON
cat > "$tmpdir/branch-fail.json" <<'JSON'
{"name":"main","protected":false}
JSON
cat > "$tmpdir/rulesets.json" <<'JSON'
[{"id":9001,"name":"CALPQ main protection","enforcement":"active"}]
JSON
cat > "$tmpdir/ruleset-detail.json" <<'JSON'
{
  "id": 9001,
  "name": "CALPQ main protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {"ref_name": {"include": ["~DEFAULT_BRANCH"], "exclude": []}},
  "rules": [
    {"type": "deletion"},
    {"type": "non_fast_forward"},
    {"type": "pull_request", "parameters": {"required_review_thread_resolution": true}},
    {"type": "required_status_checks", "parameters": {
      "strict_required_status_checks_policy": true,
      "required_status_checks": [
        {"context": "Enforce M00 Foundation gate"},
        {"context": "M00 internal readiness"},
        {"context": "M00 repository governance"}
      ]
    }}
  ]
}
JSON
printf '%s\n' '{"number":2,"state":"open"}' > "$tmpdir/issue2-open.json"
printf '%s\n' '{"number":2,"state":"closed"}' > "$tmpdir/issue2-closed.json"
printf '%s\n' '{"number":7,"state":"open"}' > "$tmpdir/issue7-open.json"
printf '%s\n' '{"number":7,"state":"closed"}' > "$tmpdir/issue7-closed.json"

export CALPQ_MANIFEST_FILE="$tmpdir/manifest.json"
export CALPQ_M00_DECISION_FILE="$tmpdir/m00-release-decision.json"
export CALPQ_FEATURE_GATE_FILE="$tmpdir/feature-development-gate.json"
export CALPQ_FV00_DECISION_FILE="$tmpdir/fv00-admission-decision.json"
export CALPQ_RULESETS_FILE="$tmpdir/rulesets.json"
export CALPQ_RULESET_DETAIL_FILE="$tmpdir/ruleset-detail.json"
export CALPQ_M00_BLOCKER_FILE="$tmpdir/issue2-open.json"
export CALPQ_FV00_ISSUE_FILE="$tmpdir/issue7-open.json"

reset_state() {
  cp "$tmpdir/manifest.base.json" "$tmpdir/manifest.json"
  cp "$tmpdir/m00-release-decision.base.json" "$tmpdir/m00-release-decision.json"
  cp "$tmpdir/feature-development-gate.base.json" "$tmpdir/feature-development-gate.json"
  cp "$tmpdir/fv00-admission-decision.base.json" "$tmpdir/fv00-admission-decision.json"
}

set_post_m00() {
  reset_state
  jq '.m00_release_status = "RELEASED" | .feature_development = "FROZEN" | .quality_gates.repository_governance = "PASS" | .quality_gates.m00_release_decision = "APPROVED"' \
    "$tmpdir/manifest.json" > "$tmpdir/x" && mv "$tmpdir/x" "$tmpdir/manifest.json"
  jq '.status = "APPROVED" | .current_state.m00_release_status = "RELEASED" | .current_state.feature_development = "FROZEN" | .current_state.repository_governance = "PASS" | .remaining_blockers = []' \
    "$tmpdir/m00-release-decision.json" > "$tmpdir/x" && mv "$tmpdir/x" "$tmpdir/m00-release-decision.json"
}

set_pre_fv00() {
  set_post_m00
  jq '.feature_development = "AUTHORIZED" | .quality_gates.feature_development_gate = "OPEN"' \
    "$tmpdir/manifest.json" > "$tmpdir/x" && mv "$tmpdir/x" "$tmpdir/manifest.json"
  jq '.state = "OPEN" | .opened_revision = "test-revision" | .opened_by_transition = "CALPQ-FEATURE-GATE-OPEN-0001" | .approved_by = "test" | .approved_at = "2026-09-14T00:00:00Z" | .next_gate = "FV00_FORMAL_ADMISSION"' \
    "$tmpdir/feature-development-gate.json" > "$tmpdir/x" && mv "$tmpdir/x" "$tmpdir/feature-development-gate.json"
}

set_admitted() {
  set_pre_fv00
  jq '.state = "ADMITTED_FOR_IMPLEMENTATION" | .admitted_revision = "test-revision" | .admitted_by_transition = "CALPQ-FV00-ADMIT-0001" | .approved_by = "test" | .approved_at = "2026-09-14T00:00:00Z" | .authorized_execution_entry = "M02_BATCH_A_FV01"' \
    "$tmpdir/fv00-admission-decision.json" > "$tmpdir/x" && mv "$tmpdir/x" "$tmpdir/fv00-admission-decision.json"
}

state_digest() {
  sha256sum "$tmpdir/manifest.json" "$tmpdir/m00-release-decision.json" "$tmpdir/feature-development-gate.json" "$tmpdir/fv00-admission-decision.json" \
    | sha256sum | awk '{print $1}'
}

run_read_only() {
  local before after output status
  before="$(state_digest)"
  set +e
  output="$(bash scripts/post_ruleset_orchestrator.sh 2>&1)"
  status=$?
  set -e
  after="$(state_digest)"
  [[ "$before" == "$after" ]] || fail "orchestrator mutated governance state"
  ORCH_OUTPUT="$output"
  ORCH_STATUS="$status"
}

reset_state
export CALPQ_BRANCH_METADATA_FILE="$tmpdir/branch-fail.json"
export CALPQ_M00_BLOCKER_FILE="$tmpdir/issue2-open.json"
run_read_only
[[ "$ORCH_STATUS" -eq 0 ]] || fail "governance blocker should be reported without mutation failure"
assert_contains "$ORCH_OUTPUT" "CALPQ_NEXT_ACTION=REPOSITORY_GOVERNANCE"
assert_contains "$ORCH_OUTPUT" "CALPQ_MUTATION=NONE"

export CALPQ_BRANCH_METADATA_FILE="$tmpdir/branch-pass.json"
run_read_only
[[ "$ORCH_STATUS" -eq 0 ]] || fail "open blocker state should be resolvable"
assert_contains "$ORCH_OUTPUT" "CALPQ_NEXT_ACTION=CLOSE_M00_BLOCKER"

export CALPQ_M00_BLOCKER_FILE="$tmpdir/issue2-closed.json"
run_read_only
[[ "$ORCH_STATUS" -eq 0 ]] || fail "M00 release-ready state should be resolvable"
assert_contains "$ORCH_OUTPUT" "CALPQ_NEXT_ACTION=M00_RELEASE"

set_post_m00
run_read_only
[[ "$ORCH_STATUS" -eq 0 ]] || fail "post-M00 state should be resolvable"
assert_contains "$ORCH_OUTPUT" "CALPQ_NEXT_ACTION=FEATURE_DEVELOPMENT_GATE"

set_pre_fv00
export CALPQ_FV00_ISSUE_FILE="$tmpdir/issue7-open.json"
run_read_only
[[ "$ORCH_STATUS" -eq 0 ]] || fail "pre-FV00 state should be resolvable"
assert_contains "$ORCH_OUTPUT" "CALPQ_NEXT_ACTION=FV00_FORMAL_ADMISSION"

set_admitted
run_read_only
[[ "$ORCH_STATUS" -eq 0 ]] || fail "admitted state should be resolvable"
assert_contains "$ORCH_OUTPUT" "CALPQ_NEXT_ACTION=M02_BATCH_A_FV01"

reset_state
jq '.feature_development = "AUTHORIZED"' "$tmpdir/manifest.json" > "$tmpdir/x" && mv "$tmpdir/x" "$tmpdir/manifest.json"
run_read_only
[[ "$ORCH_STATUS" -ne 0 ]] || fail "invalid cross-gate state was accepted"
assert_contains "$ORCH_OUTPUT" "invalid cross-gate state"

set_post_m00
export CALPQ_BRANCH_METADATA_FILE="$tmpdir/branch-fail.json"
run_read_only
[[ "$ORCH_STATUS" -ne 0 ]] || fail "post-release governance regression was accepted"
assert_contains "$ORCH_OUTPUT" "CALPQ_NEXT_ACTION=REPOSITORY_GOVERNANCE_REGRESSION"

set_pre_fv00
export CALPQ_BRANCH_METADATA_FILE="$tmpdir/branch-pass.json"
export CALPQ_FV00_ISSUE_FILE="$tmpdir/issue7-closed.json"
run_read_only
[[ "$ORCH_STATUS" -ne 0 ]] || fail "closed FV-00 governance issue was accepted before admission"
assert_contains "$ORCH_OUTPUT" "FV-00 issue #7 must be open"

printf 'POST-RULESET ORCHESTRATOR TEST: PASS\n'
