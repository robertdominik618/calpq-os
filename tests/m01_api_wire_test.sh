#!/usr/bin/env bash
set -euo pipefail

fail(){ printf 'M01 API WIRE: %s\n' "$1" >&2; exit 1; }

required=(docs/contracts/API_WIRE_CONTRACT_BOUNDARY.md docs/contracts/API_COMMAND_QUERY_HTTP_MAPPING.md docs/contracts/API_PROBLEM_DETAILS_ERROR_MAPPING.md docs/contracts/API_CONCURRENCY_IDEMPOTENCY_CACHE_MODEL.md docs/contracts/API_ASYNC_JOB_EVENT_MODEL.md docs/contracts/API_VERSIONING_COMPATIBILITY_MODEL.md docs/prep/M01_API_WIRE_BASELINE.md docs/prep/M01_API_WIRE_TEST_MATRIX.md)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

grep -q 'API DTO != Aggregate Root' docs/contracts/API_WIRE_CONTRACT_BOUNDARY.md || fail 'DTO boundary missing'
grep -q 'HTTP status != domain evaluation result' docs/contracts/API_WIRE_CONTRACT_BOUNDARY.md || fail 'status boundary missing'
grep -q 'RFC 9457' docs/contracts/API_PROBLEM_DETAILS_ERROR_MAPPING.md || fail 'problem-details mapping missing'
grep -q 'OpenAPI `3.1.x`' docs/contracts/API_VERSIONING_COMPATIBILITY_MODEL.md || fail 'OpenAPI baseline missing'
grep -q 'at-least-once' docs/contracts/API_ASYNC_JOB_EVENT_MODEL.md || fail 'delivery semantics missing'
grep -q 'feature_development": "FROZEN' foundation/manifest.json || fail 'feature development unexpectedly enabled'

printf 'M01 API WIRE: PASS\n'