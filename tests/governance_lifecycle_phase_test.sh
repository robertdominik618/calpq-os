#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'GOVERNANCE LIFECYCLE TEST: %s\n' "$1" >&2; exit 1; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

manifest="$tmp/manifest.json"
gate="$tmp/feature-gate.json"
fv00="$tmp/fv00.json"

write_state() {
  local release="$1" feature="$2" gate_state="$3" fv00_state="$4"
  printf '{"m00_release_status":"%s","feature_development":"%s"}\n' "$release" "$feature" > "$manifest"
  printf '{"state":"%s"}\n' "$gate_state" > "$gate"
  printf '{"state":"%s"}\n' "$fv00_state" > "$fv00"
}

resolve() {
  CALPQ_MANIFEST_FILE="$manifest" \
  CALPQ_FEATURE_GATE_FILE="$gate" \
  CALPQ_FV00_DECISION_FILE="$fv00" \
  bash scripts/governance_lifecycle_phase.sh
}

assert_phase() {
  local expected="$1" actual
  actual="$(resolve)"
  [[ "$actual" == "$expected" ]] || fail "expected $expected, got $actual"
  printf 'TEST PASS: %s\n' "$expected"
}

write_state BLOCKED FROZEN LOCKED BLOCKED_PENDING_PREREQUISITES
assert_phase PRE_M00

write_state RELEASED FROZEN LOCKED BLOCKED_PENDING_PREREQUISITES
assert_phase POST_M00_PRE_FEATURE

write_state RELEASED AUTHORIZED OPEN BLOCKED_PENDING_PREREQUISITES
assert_phase POST_FEATURE_PRE_FV00

write_state RELEASED AUTHORIZED OPEN ADMITTED_FOR_IMPLEMENTATION
assert_phase POST_FV00_IMPLEMENTATION

write_state BLOCKED AUTHORIZED OPEN BLOCKED_PENDING_PREREQUISITES
if resolve >/dev/null 2>&1; then
  fail 'invalid cross-gate state was accepted'
fi
printf 'TEST PASS: invalid cross-gate state rejected\n'

printf 'GOVERNANCE LIFECYCLE TESTS: PASS\n'
