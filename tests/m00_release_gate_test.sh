#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/tests/helpers/governance_fixture.sh"
fixture="$(mktemp -d)"; trap 'rm -rf "$fixture"' EXIT
copy_fixture() {
  rm -rf "$fixture/work"
  mkdir -p "$fixture/work"
  cp -R "$repo_root/." "$fixture/work/"
  rm -rf "$fixture/work/.git" "$fixture/work/node_modules"
  calpq_reset_governance_fixture "$fixture/work"
}
run_gate() { (cd "$fixture/work" && bash scripts/m00_release_gate.sh); }
reject() { local name="$1"; if run_gate >/dev/null 2>&1; then echo "TEST FAIL: $name" >&2; exit 1; fi; echo "TEST PASS: rejected $name"; }

copy_fixture; run_gate >/dev/null; echo 'TEST PASS: approved stack with blocked M00 and pending decision is consistent'
copy_fixture; jq '.feature_development = "AUTHORIZED"' "$fixture/work/foundation/manifest.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/manifest.json"; reject 'premature feature enablement'
copy_fixture; jq '.m00_release_status = "RELEASED"' "$fixture/work/foundation/manifest.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/manifest.json"; reject 'unreviewed M00 release transition'
copy_fixture; jq '.technology_stack.status = "NOT_YET_APPROVED"' "$fixture/work/foundation/manifest.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/manifest.json"; reject 'technology approval downgrade'
copy_fixture; sed -i 's/Status: `ACCEPTED`/Status: `PROPOSED`/' "$fixture/work/docs/adr/ADR-0002-technology-stack-selection.md"; reject 'ADR status mismatch'
copy_fixture; jq '.status = "APPROVED"' "$fixture/work/foundation/m00-release-decision.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/m00-release-decision.json"; reject 'release decision approved while M00 is still blocked'
copy_fixture; rm "$fixture/work/foundation/m00-release-decision.json"; reject 'missing release decision record'

copy_fixture
jq '.m00_release_status = "RELEASED" | .feature_development = "FROZEN" | .quality_gates.repository_governance = "PASS" | .quality_gates.m00_release_decision = "APPROVED"' "$fixture/work/foundation/manifest.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/manifest.json"
jq '.status = "APPROVED" | .current_state.m00_release_status = "RELEASED" | .current_state.feature_development = "FROZEN" | .current_state.internal_readiness = "PASS" | .current_state.repository_governance = "PASS" | .remaining_blockers = [] | .approved_transition = {"m00_release_status":{"from":"BLOCKED","to":"RELEASED"},"feature_development":{"from":"FROZEN","to":"FROZEN"},"next_gate":"FEATURE_DEVELOPMENT_GATE"} | .approved_by = "CALPQ governance test" | .approved_at = "2026-09-14T20:30:00Z"' "$fixture/work/foundation/m00-release-decision.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/m00-release-decision.json"
jq '.status = "COMPLETED" | .required_gate_state.g6_repository_governance = "PASS" | .required_gate_state.g7_explicit_release_decision = "APPROVED" | .current_project_state.m00_release_status = "RELEASED" | .current_project_state.feature_development = "FROZEN" | .current_project_state.release_decision = "APPROVED" | .current_project_state.remaining_blocker = null' "$fixture/work/foundation/m00-release-preflight.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/m00-release-preflight.json"
run_gate >/dev/null
echo 'TEST PASS: explicitly released M00 with feature development still frozen is consistent'

jq '.feature_development = "AUTHORIZED"' "$fixture/work/foundation/manifest.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/manifest.json"
reject 'feature development opened as an implicit side effect of M00 release'

printf 'M00 RELEASE GATE SELF-TESTS: PASS\n'
