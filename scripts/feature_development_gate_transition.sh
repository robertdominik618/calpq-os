#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FEATURE DEVELOPMENT GATE TRANSITION: %s\n' "$1" >&2; exit 1; }

approval="${CALPQ_FEATURE_DEVELOPMENT_APPROVAL:-}"
approver="${CALPQ_FEATURE_DEVELOPMENT_APPROVED_BY:-}"
approved_at="${CALPQ_FEATURE_DEVELOPMENT_APPROVED_AT:-$(date -u +%Y-%m-%dT%H:%M:%SZ)}"
revision="${CALPQ_FEATURE_DEVELOPMENT_REVISION:-}"

[[ "$approval" == "APPROVE_CALPQ_FEATURE_DEVELOPMENT" ]] \
  || fail "explicit feature-development approval token missing"
[[ -n "$approver" ]] || fail "CALPQ_FEATURE_DEVELOPMENT_APPROVED_BY is required"
command -v jq >/dev/null 2>&1 || fail "jq is required"

if [[ -z "$revision" ]]; then
  revision="$(git rev-parse HEAD 2>/dev/null || true)"
fi
[[ -n "$revision" ]] || fail "opening revision cannot be resolved"

bash scripts/m00_release_gate.sh >/dev/null
bash scripts/repository_governance_check.sh >/dev/null
bash scripts/feature_development_gate_check.sh >/dev/null

jq -e '.m00_release_status == "RELEASED" and .feature_development == "FROZEN" and .quality_gates.repository_governance == "PASS" and .quality_gates.m00_release_decision == "APPROVED"' foundation/manifest.json >/dev/null \
  || fail "manifest is not in released/frozen state"
jq -e '.status == "APPROVED" and .current_state.m00_release_status == "RELEASED" and .current_state.repository_governance == "PASS" and (.remaining_blockers | length) == 0' foundation/m00-release-decision.json >/dev/null \
  || fail "M00 release evidence is incomplete"
jq -e '.state == "LOCKED" and .opened_revision == null and .opened_by_transition == null' foundation/feature-development-gate.json >/dev/null \
  || fail "feature gate is not in canonical LOCKED state"

tmpdir="$(mktemp -d)"
backupdir="$(mktemp -d)"
rollback_needed=0
cleanup() { rm -rf "$tmpdir" "$backupdir"; }
rollback() {
  if [[ "$rollback_needed" == "1" ]]; then
    cp "$backupdir/manifest.json" foundation/manifest.json
    cp "$backupdir/feature-development-gate.json" foundation/feature-development-gate.json
  fi
  cleanup
}
trap rollback ERR
trap cleanup EXIT

cp foundation/manifest.json "$backupdir/manifest.json"
cp foundation/feature-development-gate.json "$backupdir/feature-development-gate.json"

jq --arg approved_at "$approved_at" '
  .feature_development = "AUTHORIZED"
  | .quality_gates.feature_development_gate = "OPEN"
  | .last_updated = $approved_at
' foundation/manifest.json > "$tmpdir/manifest.json"

jq \
  --arg revision "$revision" \
  --arg approver "$approver" \
  --arg approved_at "$approved_at" '
  .state = "OPEN"
  | .opened_revision = $revision
  | .opened_by_transition = "CALPQ-FEATURE-GATE-OPEN-0001"
  | .approved_by = $approver
  | .approved_at = $approved_at
  | .next_gate = "FV00_FORMAL_ADMISSION"
  | .last_updated = $approved_at
' foundation/feature-development-gate.json > "$tmpdir/feature-development-gate.json"

jq -e '.m00_release_status == "RELEASED" and .feature_development == "AUTHORIZED" and .quality_gates.feature_development_gate == "OPEN"' "$tmpdir/manifest.json" >/dev/null \
  || fail "generated manifest feature-development state is invalid"
jq -e '.state == "OPEN" and .opened_by_transition == "CALPQ-FEATURE-GATE-OPEN-0001" and (.opened_revision | type == "string" and length > 0) and (.approved_by | type == "string" and length > 0) and (.approved_at | type == "string" and length > 0) and .next_gate == "FV00_FORMAL_ADMISSION"' "$tmpdir/feature-development-gate.json" >/dev/null \
  || fail "generated feature-development gate evidence is invalid"

rollback_needed=1
mv "$tmpdir/manifest.json" foundation/manifest.json
mv "$tmpdir/feature-development-gate.json" foundation/feature-development-gate.json
bash scripts/m00_release_gate.sh >/dev/null
bash scripts/feature_development_gate_check.sh >/dev/null
rollback_needed=0

printf 'FEATURE DEVELOPMENT GATE TRANSITION: OPEN / FEATURE AUTHORIZED / FV00 NOT YET ADMITTED\n'
