#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FEATURE DEVELOPMENT GATE: %s\n' "$1" >&2; exit 1; }

command -v jq >/dev/null 2>&1 || fail "jq is required"
[[ -f foundation/manifest.json ]] || fail "manifest missing"
[[ -f foundation/feature-development-gate.json ]] || fail "feature development gate record missing"
[[ -f foundation/m00-release-decision.json ]] || fail "M00 release decision missing"

feature_state="$(jq -r '.feature_development' foundation/manifest.json)"
m00_state="$(jq -r '.m00_release_status' foundation/manifest.json)"
gate_state="$(jq -r '.state' foundation/feature-development-gate.json)"
release_decision="$(jq -r '.status' foundation/m00-release-decision.json)"

jq -e '.gate_id == "CALPQ-FEATURE-GATE-0001" and .release_decision_id == "CALPQ-M00-REL-0001"' foundation/feature-development-gate.json >/dev/null \
  || fail "feature gate identity/release reference mismatch"

case "$feature_state" in
  FROZEN)
    [[ "$gate_state" == "LOCKED" ]] \
      || fail "FROZEN feature development requires LOCKED feature gate"
    if [[ "$m00_state" == "BLOCKED" ]]; then
      [[ "$release_decision" == "PENDING" ]] \
        || fail "blocked M00 requires pending release decision while feature gate is locked"
    elif [[ "$m00_state" == "RELEASED" ]]; then
      [[ "$release_decision" == "APPROVED" ]] \
        || fail "released M00 requires approved release decision before feature gate opening"
    else
      fail "unexpected M00 state while feature development is frozen: $m00_state"
    fi
    printf 'FEATURE DEVELOPMENT GATE: LOCKED / FEATURE FROZEN / M00 %s\n' "$m00_state"
    ;;
  AUTHORIZED)
    [[ "$m00_state" == "RELEASED" ]] \
      || fail "feature development cannot be AUTHORIZED before M00 is RELEASED"
    [[ "$release_decision" == "APPROVED" ]] \
      || fail "feature development cannot be AUTHORIZED before explicit M00 release approval"
    [[ "$gate_state" == "OPEN" ]] \
      || fail "AUTHORIZED feature development requires OPEN feature gate"
    jq -e '
      .opened_by_transition == "CALPQ-FEATURE-GATE-OPEN-0001"
      and (.opened_revision | type == "string" and length > 0)
      and (.approved_by | type == "string" and length > 0)
      and (.approved_at | type == "string" and length > 0)
      and .next_gate == "FV00_FORMAL_ADMISSION"
    ' foundation/feature-development-gate.json >/dev/null \
      || fail "OPEN feature gate lacks complete approval evidence"
    jq -e '.quality_gates.feature_development_gate == "OPEN"' foundation/manifest.json >/dev/null \
      || fail "manifest does not record OPEN feature-development gate"
    printf 'FEATURE DEVELOPMENT GATE: OPEN / FEATURE AUTHORIZED / FV00 STILL REQUIRES FORMAL ADMISSION\n'
    ;;
  *)
    fail "unexpected feature_development state: $feature_state"
    ;;
esac
