#!/usr/bin/env bash
set -euo pipefail

fail() {
  printf 'POST-RULESET ORCHESTRATOR: %s\n' "$1" >&2
  exit 1
}

command -v jq >/dev/null 2>&1 || fail "jq is required"

manifest_file="${CALPQ_MANIFEST_FILE:-foundation/manifest.json}"
m00_decision_file="${CALPQ_M00_DECISION_FILE:-foundation/m00-release-decision.json}"
feature_gate_file="${CALPQ_FEATURE_GATE_FILE:-foundation/feature-development-gate.json}"
fv00_decision_file="${CALPQ_FV00_DECISION_FILE:-docs/planning/fv00-admission-decision.json}"

for file in "$manifest_file" "$m00_decision_file" "$feature_gate_file" "$fv00_decision_file"; do
  [[ -f "$file" ]] || fail "required state file missing: $file"
done

m00_status="$(jq -r '.m00_release_status // empty' "$manifest_file")"
feature_status="$(jq -r '.feature_development // empty' "$manifest_file")"
m00_decision="$(jq -r '.status // empty' "$m00_decision_file")"
feature_gate="$(jq -r '.state // empty' "$feature_gate_file")"
fv00_state="$(jq -r '.state // empty' "$fv00_decision_file")"

state_key="$m00_status|$feature_status|$m00_decision|$feature_gate|$fv00_state"
case "$state_key" in
  "BLOCKED|FROZEN|PENDING|LOCKED|BLOCKED_PENDING_PREREQUISITES")
    phase="PRE_M00_RELEASE"
    ;;
  "RELEASED|FROZEN|APPROVED|LOCKED|BLOCKED_PENDING_PREREQUISITES")
    phase="POST_M00_RELEASE"
    ;;
  "RELEASED|AUTHORIZED|APPROVED|OPEN|BLOCKED_PENDING_PREREQUISITES")
    phase="PRE_FV00_ADMISSION"
    ;;
  "RELEASED|AUTHORIZED|APPROVED|OPEN|ADMITTED_FOR_IMPLEMENTATION")
    phase="FV00_ADMITTED"
    ;;
  *)
    fail "invalid cross-gate state: $state_key"
    ;;
esac

if [[ "$phase" != "PRE_M00_RELEASE" ]]; then
  jq -e '.remaining_blockers | type == "array" and length == 0' "$m00_decision_file" >/dev/null \
    || fail "M00 advanced state requires zero remaining blockers"
fi

if [[ "$phase" == "PRE_FV00_ADMISSION" || "$phase" == "FV00_ADMITTED" ]]; then
  jq -e '.next_gate == "FV00_FORMAL_ADMISSION"' "$feature_gate_file" >/dev/null \
    || fail "OPEN feature gate must point to FV00_FORMAL_ADMISSION"
fi

if [[ "$phase" == "FV00_ADMITTED" ]]; then
  jq -e '.authorized_execution_entry == "M02_BATCH_A_FV01" and .admitted_by_transition == "CALPQ-FV00-ADMIT-0001"' "$fv00_decision_file" >/dev/null \
    || fail "admitted FV-00 state does not authorize canonical M02_BATCH_A_FV01 entry"
fi

emit() {
  local next_action="$1"
  local governance="$2"
  printf 'CALPQ_ORCHESTRATION_PHASE=%s\n' "$phase"
  printf 'CALPQ_REPOSITORY_GOVERNANCE=%s\n' "$governance"
  printf 'CALPQ_NEXT_ACTION=%s\n' "$next_action"
  printf 'CALPQ_MUTATION=NONE\n'
}

if bash scripts/repository_governance_check.sh >/dev/null 2>&1; then
  governance="PASS"
else
  governance="FAIL"
fi

if [[ "$governance" != "PASS" ]]; then
  if [[ "$phase" == "PRE_M00_RELEASE" ]]; then
    emit "REPOSITORY_GOVERNANCE" "FAIL"
    exit 0
  fi
  emit "REPOSITORY_GOVERNANCE_REGRESSION" "FAIL"
  fail "repository governance regressed after governance state advanced"
fi

repository="${GITHUB_REPOSITORY:-robertdominik618/calpq-os}"
api="${GITHUB_API_URL:-https://api.github.com}"
headers=(-H 'Accept: application/vnd.github+json')
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  headers+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
fi

read_issue() {
  local number="$1"
  local fixture="$2"
  if [[ -n "$fixture" ]]; then
    cat "$fixture"
  else
    curl -fsSL "${headers[@]}" "$api/repos/$repository/issues/$number" \
      || fail "cannot read governance issue #$number"
  fi
}

blocker="$(read_issue 2 "${CALPQ_M00_BLOCKER_FILE:-}")"
blocker_state="$(jq -r 'select(.number == 2) | .state // empty' <<< "$blocker")"
[[ "$blocker_state" == "open" || "$blocker_state" == "closed" ]] \
  || fail "cannot resolve M00 blocker #2 state"

case "$phase" in
  PRE_M00_RELEASE)
    if [[ "$blocker_state" == "open" ]]; then
      emit "CLOSE_M00_BLOCKER" "PASS"
    else
      emit "M00_RELEASE" "PASS"
    fi
    ;;

  POST_M00_RELEASE)
    [[ "$blocker_state" == "closed" ]] \
      || fail "M00 is RELEASED while blocker #2 is still open"
    emit "FEATURE_DEVELOPMENT_GATE" "PASS"
    ;;

  PRE_FV00_ADMISSION)
    [[ "$blocker_state" == "closed" ]] \
      || fail "feature gate is OPEN while blocker #2 is still open"
    fv00_issue="$(read_issue 7 "${CALPQ_FV00_ISSUE_FILE:-}")"
    jq -e '.number == 7 and .state == "open"' >/dev/null <<< "$fv00_issue" \
      || fail "FV-00 issue #7 must be open before formal admission"
    emit "FV00_FORMAL_ADMISSION" "PASS"
    ;;

  FV00_ADMITTED)
    [[ "$blocker_state" == "closed" ]] \
      || fail "FV-00 is admitted while blocker #2 is still open"
    emit "M02_BATCH_A_FV01" "PASS"
    ;;

  *)
    fail "unreachable orchestration phase: $phase"
    ;;
esac
