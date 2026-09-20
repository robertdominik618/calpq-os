#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'FV00 ADMISSION GATE: %s\n' "$1" >&2; exit 1; }

command -v jq >/dev/null 2>&1 || fail "jq is required"
[[ -f docs/planning/fv00-admission-decision.json ]] || fail "FV-00 machine admission decision missing"
[[ -f docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md ]] || fail "FV-00 admission record missing"

state="$(jq -r '.state' docs/planning/fv00-admission-decision.json)"

jq -e '.decision_id == "CALPQ-M02-FV00-ADM-DEC-0001" and .admission_record_id == "CALPQ-M02-FV00-ADM-0001" and .issue_number == 7 and .admission_transition_id == "CALPQ-FV00-ADMIT-0001"' docs/planning/fv00-admission-decision.json >/dev/null \
  || fail "FV-00 admission identity mismatch"
jq -e '(.blocking_reviews | type == "array")' docs/planning/fv00-admission-decision.json >/dev/null \
  || fail "blocking_reviews must be an array"

case "$state" in
  BLOCKED_PENDING_PREREQUISITES)
    jq -e '.admitted_revision == null and .admitted_by_transition == null and .approved_by == null and .approved_at == null and .authorized_execution_entry == null' docs/planning/fv00-admission-decision.json >/dev/null \
      || fail "blocked FV-00 decision contains admission evidence"
    grep -q '^`BLOCKED_PENDING_PREREQUISITES`$' docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md \
      || fail "markdown FV-00 decision does not match blocked machine state"
    if grep -q '^Status: .*ADMITTED_FOR_IMPLEMENTATION' docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md; then
      fail "blocked FV-00 record claims implementation admission"
    fi
    printf 'FV00 ADMISSION GATE: BLOCKED_PENDING_PREREQUISITES\n'
    ;;
  ADMITTED_FOR_IMPLEMENTATION)
    jq -e '.m00_release_status == "RELEASED" and .feature_development == "AUTHORIZED" and .quality_gates.m00_release_decision == "APPROVED" and .quality_gates.feature_development_gate == "OPEN"' foundation/manifest.json >/dev/null \
      || fail "FV-00 admission requires released M00 and authorized feature development"
    jq -e '.state == "OPEN" and .next_gate == "FV00_FORMAL_ADMISSION"' foundation/feature-development-gate.json >/dev/null \
      || fail "FV-00 admission requires OPEN feature-development gate"
    jq -e '(.blocking_reviews | length) == 0 and (.admitted_revision | type == "string" and length > 0) and .admitted_by_transition == "CALPQ-FV00-ADMIT-0001" and (.approved_by | type == "string" and length > 0) and (.approved_at | type == "string" and length > 0) and .authorized_execution_entry == "M02_BATCH_A_FV01"' docs/planning/fv00-admission-decision.json >/dev/null \
      || fail "FV-00 admission evidence is incomplete"
    grep -q '^`ADMITTED_FOR_IMPLEMENTATION`$' docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md \
      || fail "markdown FV-00 decision does not match admitted machine state"
    grep -q '^Status: `FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN UNDER M02 BATCH PLAN`$' docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md \
      || fail "markdown FV-00 status does not show formal admission"
    printf 'FV00 ADMISSION GATE: ADMITTED_FOR_IMPLEMENTATION / ENTRY M02_BATCH_A_FV01\n'
    ;;
  *)
    fail "unexpected FV-00 admission state: $state"
    ;;
esac
