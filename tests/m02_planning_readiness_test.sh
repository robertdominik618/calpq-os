#!/usr/bin/env bash
set -euo pipefail
fail(){ printf 'M02 PLANNING READINESS: %s\n' "$1" >&2; exit 1; }

required=(
  docs/planning/M02_FIRST_VERTICAL_DELIVERY_PLAN.md
  docs/planning/M02_FIRST_VERTICAL_BACKLOG.md
  docs/planning/M02_FIRST_VERTICAL_ACCEPTANCE_MATRIX.md
  docs/planning/M02_FIRST_VERTICAL_ADMISSION_CHECKLIST.md
  docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md
  docs/planning/FV00_DOMAIN_STATE_BOUNDARY.md
  docs/planning/FV00_COMMAND_EVENT_CATALOG.md
  docs/planning/FV00_TRACEABILITY_INDEX.md
  docs/planning/FV01_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV01_TEST_CONTRACT.md
  docs/planning/FV02_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV02_TEST_CONTRACT.md
  docs/planning/FV03_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV03_TEST_INDEX.md
  docs/planning/FV04_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV04_TEST_CONTRACT.md
  docs/planning/FV05_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV05_TEST_CONTRACT.md
  docs/planning/FV06_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV06_TEST_INDEX.md
  docs/planning/FV07_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV07_TEST_INDEX.md
  docs/planning/FV08_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV08_TEST_INDEX.md
  docs/planning/FV09_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV09_TEST_INDEX.md
  docs/planning/FV10_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV10_TEST_INDEX.md
  docs/planning/FV11_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV11_TEST_INDEX.md
  docs/planning/FV12_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV12_TEST_INDEX.md
  docs/planning/FV13_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV13_TEST_INDEX.md
  docs/planning/FV14_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV14_CHECKLIST.md
  docs/planning/FV15_IMPLEMENTATION_CONTRACT.md
  docs/planning/FV15_TEST_INDEX.md
)
for f in "${required[@]}"; do [[ -f "$f" ]] || fail "missing $f"; done

scenario_count="$(grep -Ec '^[0-9]+\.' docs/planning/M02_FIRST_VERTICAL_ACCEPTANCE_MATRIX.md)"
[[ "$scenario_count" -eq 45 ]] || fail "acceptance matrix must contain 45 scenarios"

tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
grep -hEo '"[0-9]+":' docs/planning/traceability/FV00_TRC_*.json | tr -d '":' | sort -n > "$tmp"
for n in $(seq 1 45); do
  count="$(grep -xc "$n" "$tmp" || true)"
  [[ "$count" -eq 1 ]] || fail "scenario $n traceability count is $count, expected 1"
done
extra="$(awk '$1 < 1 || $1 > 45 {print; exit}' "$tmp")"
[[ -z "$extra" ]] || fail "traceability contains out-of-range scenario $extra"

for n in $(seq -w 0 15); do grep -q "FV-${n}" docs/planning/M02_FIRST_VERTICAL_BACKLOG.md || fail "missing FV-${n} backlog item"; done

grep -q '^`BLOCKED_PENDING_M00`$' docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md || fail "FV-00 must remain blocked pending M00"
grep -q '"state": "LOCKED"' foundation/feature-development-gate.json || fail "feature gate must remain locked"

blocked_files=(FV01_IMPLEMENTATION_CONTRACT.md FV01_TEST_CONTRACT.md FV02_IMPLEMENTATION_CONTRACT.md FV02_TEST_CONTRACT.md FV03_IMPLEMENTATION_CONTRACT.md FV03_TEST_INDEX.md FV04_IMPLEMENTATION_CONTRACT.md FV04_TEST_CONTRACT.md FV05_IMPLEMENTATION_CONTRACT.md FV05_TEST_CONTRACT.md FV06_IMPLEMENTATION_CONTRACT.md FV06_TEST_INDEX.md FV07_IMPLEMENTATION_CONTRACT.md FV07_TEST_INDEX.md FV08_IMPLEMENTATION_CONTRACT.md FV08_TEST_INDEX.md FV09_IMPLEMENTATION_CONTRACT.md FV09_TEST_INDEX.md FV10_IMPLEMENTATION_CONTRACT.md FV10_TEST_INDEX.md FV11_IMPLEMENTATION_CONTRACT.md FV11_TEST_INDEX.md FV12_IMPLEMENTATION_CONTRACT.md FV12_TEST_INDEX.md FV13_IMPLEMENTATION_CONTRACT.md FV13_TEST_INDEX.md FV14_IMPLEMENTATION_CONTRACT.md FV14_CHECKLIST.md FV15_IMPLEMENTATION_CONTRACT.md FV15_TEST_INDEX.md)
for f in "${blocked_files[@]}"; do grep -q 'BLOCKED' "docs/planning/$f" || fail "$f must remain blocked"; done

count_tests(){ local file="$1" expected="$2"; local got; got="$(grep -Ec '^[0-9]+\.' "docs/planning/$file")"; [[ "$got" -eq "$expected" ]] || fail "$file expected $expected checks, got $got"; }
count_tests FV01_TEST_CONTRACT.md 21
count_tests FV02_TEST_CONTRACT.md 12
count_tests FV03_TEST_INDEX.md 20
count_tests FV04_TEST_CONTRACT.md 18
count_tests FV05_TEST_CONTRACT.md 18
count_tests FV06_TEST_INDEX.md 16
count_tests FV07_TEST_INDEX.md 18
count_tests FV08_TEST_INDEX.md 16
count_tests FV09_TEST_INDEX.md 20
count_tests FV10_TEST_INDEX.md 20
count_tests FV11_TEST_INDEX.md 24
count_tests FV12_TEST_INDEX.md 16
count_tests FV13_TEST_INDEX.md 24
count_tests FV14_CHECKLIST.md 20
count_tests FV15_TEST_INDEX.md 22

grep -q 'UUIDv7' docs/planning/FV01_IMPLEMENTATION_CONTRACT.md || fail "FV-01 contract missing"
grep -q 'Clock' docs/planning/FV02_IMPLEMENTATION_CONTRACT.md || fail "FV-02 contract missing"
grep -q 'Provenance' docs/planning/FV03_IMPLEMENTATION_CONTRACT.md || fail "FV-03 contract missing"
grep -q 'expected revision' docs/planning/FV04_IMPLEMENTATION_CONTRACT.md || fail "FV-04 contract missing"
grep -q 'CredentialArtifact' docs/planning/FV05_IMPLEMENTATION_CONTRACT.md || fail "FV-05 contract missing"
grep -q 'ApplicationExecutionContext' docs/planning/FV06_IMPLEMENTATION_CONTRACT.md || fail "FV-06 contract missing"
grep -q 'UnitOfWork' docs/planning/FV07_IMPLEMENTATION_CONTRACT.md || fail "FV-07 contract missing"
grep -q 'outbox' docs/planning/FV08_IMPLEMENTATION_CONTRACT.md || fail "FV-08 contract missing"
grep -q 'original artifact' docs/planning/FV09_IMPLEMENTATION_CONTRACT.md || fail "FV-09 contract missing"
grep -q 'verification' docs/planning/FV10_IMPLEMENTATION_CONTRACT.md || fail "FV-10 contract missing"
grep -q 'EligibilityAssessment' docs/planning/FV11_IMPLEMENTATION_CONTRACT.md || fail "FV-11 contract missing"
grep -q 'Passport' docs/planning/FV12_IMPLEMENTATION_CONTRACT.md || fail "FV-12 contract missing"
grep -q 'TenantContext' docs/planning/FV13_IMPLEMENTATION_CONTRACT.md || fail "FV-13 contract missing"
grep -q 'OpenAPI 3.1' docs/planning/FV14_IMPLEMENTATION_CONTRACT.md || fail "FV-14 contract missing"
grep -q 'Operational Resilience' docs/planning/FV15_IMPLEMENTATION_CONTRACT.md || fail "FV-15 contract missing"

printf 'M02 PLANNING READINESS: PASS / FV-00 TRACEABLE / FV-01..FV-15 READY BUT BLOCKED / 285 CHECK POINTS\n'
