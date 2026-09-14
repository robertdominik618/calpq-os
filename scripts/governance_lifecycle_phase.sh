#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'GOVERNANCE LIFECYCLE: %s\n' "$1" >&2; exit 1; }

manifest="${CALPQ_MANIFEST_FILE:-foundation/manifest.json}"
feature_gate="${CALPQ_FEATURE_GATE_FILE:-foundation/feature-development-gate.json}"
fv00_decision="${CALPQ_FV00_DECISION_FILE:-docs/planning/fv00-admission-decision.json}"

command -v jq >/dev/null 2>&1 || fail "jq is required"
[[ -f "$manifest" ]] || fail "manifest missing: $manifest"
[[ -f "$feature_gate" ]] || fail "feature gate missing: $feature_gate"
[[ -f "$fv00_decision" ]] || fail "FV-00 decision missing: $fv00_decision"

release="$(jq -r '.m00_release_status // empty' "$manifest")"
feature="$(jq -r '.feature_development // empty' "$manifest")"
gate="$(jq -r '.state // empty' "$feature_gate")"
fv00="$(jq -r '.state // empty' "$fv00_decision")"

case "$release|$feature|$gate|$fv00" in
  'BLOCKED|FROZEN|LOCKED|BLOCKED_PENDING_PREREQUISITES')
    phase='PRE_M00'
    ;;
  'RELEASED|FROZEN|LOCKED|BLOCKED_PENDING_PREREQUISITES')
    phase='POST_M00_PRE_FEATURE'
    ;;
  'RELEASED|AUTHORIZED|OPEN|BLOCKED_PENDING_PREREQUISITES')
    phase='POST_FEATURE_PRE_FV00'
    ;;
  'RELEASED|AUTHORIZED|OPEN|ADMITTED_FOR_IMPLEMENTATION')
    phase='POST_FV00_IMPLEMENTATION'
    ;;
  *)
    fail "invalid cross-gate state: m00=$release feature=$feature feature_gate=$gate fv00=$fv00"
    ;;
esac

printf '%s\n' "$phase"
