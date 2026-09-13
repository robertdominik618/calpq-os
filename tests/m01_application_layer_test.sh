#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 APPLICATION LAYER: %s\n' "$1" >&2; exit 1; }

required=(
  docs/contracts/APPLICATION_USE_CASE_HANDLER_MODEL.md
  docs/contracts/APPLICATION_EXECUTION_CONTEXT_MODEL.md
  docs/contracts/APPLICATION_PORT_CATALOG.md
  docs/contracts/APPLICATION_POLICY_ORCHESTRATION_BOUNDARY.md
  docs/contracts/APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER.md
  docs/prep/M01_APPLICATION_LAYER_BASELINE.md
  docs/prep/M01_APPLICATION_LAYER_TEST_MATRIX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; grep -q 'PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION' "$f" || fail "missing boundary $f"; done

grep -q 'Application orchestration != domain policy' docs/prep/M01_APPLICATION_LAYER_BASELINE.md || fail 'orchestration boundary missing'
grep -q 'Query handler MUST NOT mutate authoritative state' docs/contracts/APPLICATION_USE_CASE_HANDLER_MODEL.md || fail 'query boundary missing'
grep -q 'Application does not import provider SDKs' docs/contracts/APPLICATION_PORT_CATALOG.md || fail 'port boundary missing'
grep -q 'only after durable commit' docs/contracts/APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER.md || fail 'side-effect order missing'
grep -q 'feature_development": "FROZEN' foundation/manifest.json || fail 'feature development unexpectedly enabled'

printf 'M01 APPLICATION LAYER: PASS\n'