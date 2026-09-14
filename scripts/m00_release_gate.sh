#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M00 RELEASE GATE: %s\n' "$1" >&2; exit 1; }

command -v jq >/dev/null 2>&1 || fail "jq is required"
[[ -f foundation/m00-release-decision.json ]] || fail "M00 release decision record missing"
[[ -f foundation/m00-release-preflight.json ]] || fail "M00 release preflight record missing"

jq -e '.technology_stack.status == "APPROVED" and .technology_stack.decision == "ADR-0002"' foundation/manifest.json >/dev/null \
  || fail "technology stack/decision is not approved"
grep -q 'Status: `ACCEPTED`' docs/adr/ADR-0002-technology-stack-selection.md \
  || fail "ADR-0002 is not accepted"
jq -e '.decision_id == "CALPQ-M00-REL-0001"' foundation/m00-release-decision.json >/dev/null \
  || fail "M00 release decision id mismatch"

release_status="$(jq -r '.m00_release_status' foundation/manifest.json)"
feature_status="$(jq -r '.feature_development' foundation/manifest.json)"
decision_status="$(jq -r '.status' foundation/m00-release-decision.json)"

[[ "$feature_status" == "FROZEN" ]] \
  || fail "feature development must remain FROZEN until separately governed feature gate transition"

case "$release_status" in
  BLOCKED)
    [[ "$decision_status" == "PENDING" ]] \
      || fail "blocked M00 requires a pending release decision"
    jq -e '.current_state.m00_release_status == "BLOCKED" and .current_state.feature_development == "FROZEN"' foundation/m00-release-decision.json >/dev/null \
      || fail "pending release decision record disagrees with blocked manifest"
    jq -e '.status == "WAITING_FOR_G6" and .current_project_state.m00_release_status == "BLOCKED" and .current_project_state.feature_development == "FROZEN" and .current_project_state.release_decision == "PENDING"' foundation/m00-release-preflight.json >/dev/null \
      || fail "blocked release preflight is inconsistent"
    printf 'M00 RELEASE GATE: BLOCKED / DECISION PENDING / STACK APPROVED / FEATURE FROZEN\n'
    ;;
  RELEASED)
    [[ "$decision_status" == "APPROVED" ]] \
      || fail "released M00 requires an approved release decision"
    jq -e '.quality_gates.repository_governance == "PASS" and .quality_gates.m00_release_decision == "APPROVED"' foundation/manifest.json >/dev/null \
      || fail "released manifest does not record repository governance and explicit release approval"
    jq -e '.current_state.m00_release_status == "RELEASED" and .current_state.feature_development == "FROZEN" and .current_state.internal_readiness == "PASS" and .current_state.repository_governance == "PASS" and (.remaining_blockers | length) == 0 and .approved_transition.m00_release_status.from == "BLOCKED" and .approved_transition.m00_release_status.to == "RELEASED" and .approved_transition.feature_development.to == "FROZEN" and .approved_transition.next_gate == "FEATURE_DEVELOPMENT_GATE" and (.approved_by | type == "string" and length > 0) and (.approved_at | type == "string" and length > 0)' foundation/m00-release-decision.json >/dev/null \
      || fail "approved release decision evidence is incomplete or inconsistent"
    jq -e '.status == "COMPLETED" and .required_gate_state.g6_repository_governance == "PASS" and .required_gate_state.g7_explicit_release_decision == "APPROVED" and .current_project_state.m00_release_status == "RELEASED" and .current_project_state.feature_development == "FROZEN" and .current_project_state.release_decision == "APPROVED" and .current_project_state.remaining_blocker == null' foundation/m00-release-preflight.json >/dev/null \
      || fail "completed release preflight is inconsistent"
    printf 'M00 RELEASE GATE: RELEASED / DECISION APPROVED / FEATURE STILL FROZEN / NEXT GATE SEPARATE\n'
    ;;
  *)
    fail "unexpected M00 release state: $release_status"
    ;;
esac
