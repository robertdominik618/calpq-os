#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'M00 RELEASE TRANSITION: %s\n' "$1" >&2; exit 1; }

approval="${CALPQ_M00_RELEASE_APPROVAL:-}"
approver="${CALPQ_M00_APPROVED_BY:-}"
approved_at="${CALPQ_M00_APPROVED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
revision="${CALPQ_M00_AUDITED_REVISION:-}"

[[ "$approval" == "APPROVE_CALPQ_M00_RELEASE" ]] \
  || fail "explicit approval token missing"
[[ -n "$approver" ]] || fail "CALPQ_M00_APPROVED_BY is required"
command -v jq >/dev/null 2>&1 || fail "jq is required"

if [[ -z "$revision" ]]; then
  revision="$(git rev-parse HEAD 2>/dev/null || true)"
fi
[[ -n "$revision" ]] || fail "audited revision cannot be resolved"

bash scripts/m00_release_authorization_check.sh >/dev/null

jq -e '.m00_release_status == "BLOCKED" and .feature_development == "FROZEN"' foundation/manifest.json >/dev/null \
  || fail "manifest is not in releasable blocked/frozen state"
jq -e '.status == "PENDING" and .current_state.m00_release_status == "BLOCKED" and .current_state.feature_development == "FROZEN"' foundation/m00-release-decision.json >/dev/null \
  || fail "release decision is not pending from blocked/frozen state"

tmpdir="$(mktemp -d)"
backupdir="$(mktemp -d)"
rollback_needed=0
cleanup() {
  rm -rf "$tmpdir" "$backupdir"
}
rollback() {
  if [[ "$rollback_needed" == "1" ]]; then
    cp "$backupdir/manifest.json" foundation/manifest.json
    cp "$backupdir/m00-release-decision.json" foundation/m00-release-decision.json
    cp "$backupdir/m00-release-preflight.json" foundation/m00-release-preflight.json
  fi
  cleanup
}
trap rollback ERR
trap cleanup EXIT

cp foundation/manifest.json "$backupdir/manifest.json"
cp foundation/m00-release-decision.json "$backupdir/m00-release-decision.json"
cp foundation/m00-release-preflight.json "$backupdir/m00-release-preflight.json"

jq --arg approved_at "$approved_at" '
  .m00_release_status = "RELEASED"
  | .quality_gates.repository_governance = "PASS"
  | .quality_gates.m00_release_decision = "APPROVED"
  | .last_updated = $approved_at
' foundation/manifest.json > "$tmpdir/manifest.json"

jq \
  --arg revision "$revision" \
  --arg approver "$approver" \
  --arg approved_at "$approved_at" '
  .status = "APPROVED"
  | .audited_revision = $revision
  | .current_state.m00_release_status = "RELEASED"
  | .current_state.feature_development = "FROZEN"
  | .current_state.internal_readiness = "PASS"
  | .current_state.repository_governance = "PASS"
  | .remaining_blockers = []
  | .approved_transition = {
      "m00_release_status": {"from": "BLOCKED", "to": "RELEASED"},
      "feature_development": {"from": "FROZEN", "to": "FROZEN"},
      "next_gate": "FEATURE_DEVELOPMENT_GATE"
    }
  | .approved_by = $approver
  | .approved_at = $approved_at
  | .last_updated = $approved_at
' foundation/m00-release-decision.json > "$tmpdir/m00-release-decision.json"

jq --arg approved_at "$approved_at" '
  .status = "COMPLETED"
  | .required_gate_state.g6_repository_governance = "PASS"
  | .required_gate_state.g7_explicit_release_decision = "APPROVED"
  | .current_project_state.m00_release_status = "RELEASED"
  | .current_project_state.feature_development = "FROZEN"
  | .current_project_state.release_decision = "APPROVED"
  | .current_project_state.remaining_blocker = null
  | .approved_transition = {
      "m00_release_status": "BLOCKED -> RELEASED",
      "feature_development": "FROZEN (unchanged)"
    }
  | .last_updated = $approved_at
' foundation/m00-release-preflight.json > "$tmpdir/m00-release-preflight.json"

jq -e '.m00_release_status == "RELEASED" and .feature_development == "FROZEN" and .quality_gates.repository_governance == "PASS" and .quality_gates.m00_release_decision == "APPROVED"' "$tmpdir/manifest.json" >/dev/null \
  || fail "generated manifest release state is invalid"
jq -e '.status == "APPROVED" and .current_state.m00_release_status == "RELEASED" and .current_state.feature_development == "FROZEN" and .current_state.repository_governance == "PASS" and (.remaining_blockers | length) == 0 and .approved_transition.next_gate == "FEATURE_DEVELOPMENT_GATE"' "$tmpdir/m00-release-decision.json" >/dev/null \
  || fail "generated release decision is invalid"
jq -e '.status == "COMPLETED" and .required_gate_state.g6_repository_governance == "PASS" and .required_gate_state.g7_explicit_release_decision == "APPROVED" and .current_project_state.feature_development == "FROZEN"' "$tmpdir/m00-release-preflight.json" >/dev/null \
  || fail "generated preflight state is invalid"

rollback_needed=1
mv "$tmpdir/manifest.json" foundation/manifest.json
mv "$tmpdir/m00-release-decision.json" foundation/m00-release-decision.json
mv "$tmpdir/m00-release-preflight.json" foundation/m00-release-preflight.json
bash scripts/m00_release_gate.sh >/dev/null
rollback_needed=0

printf 'M00 RELEASE TRANSITION: RELEASED / FEATURE DEVELOPMENT REMAINS FROZEN / NEXT GATE FEATURE_DEVELOPMENT_GATE\n'
