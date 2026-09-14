#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/tests/helpers/governance_fixture.sh"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT

prepare() {
  rm -rf "$fixture/work"
  mkdir -p "$fixture/work"
  cp -R "$repo_root/." "$fixture/work/"
  rm -rf "$fixture/work/.git" "$fixture/work/node_modules"
  calpq_reset_governance_fixture "$fixture/work"
  printf '%s\n' '{"name":"main","protected":true}' > "$fixture/branch.json"
  printf '%s\n' '[{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active"}]' > "$fixture/rulesets.json"
  cat > "$fixture/ruleset.json" <<'JSON'
{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_review_thread_resolution":true}},{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":true,"required_status_checks":[{"context":"Enforce M00 Foundation gate"},{"context":"M00 internal readiness"},{"context":"M00 repository governance"}]}}]}
JSON
  printf '%s\n' '{"number":2,"state":"closed","title":"M00-BLK-001"}' > "$fixture/blocker.json"
  printf '%s\n' '{"number":7,"state":"open","title":"FV-00 — READY_FOR_FORMAL_ADMISSION_AFTER_M00"}' > "$fixture/fv00-issue.json"
}

release_m00() {
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    CALPQ_M00_BLOCKER_FILE="$fixture/blocker.json" \
    CALPQ_M00_RELEASE_APPROVAL="APPROVE_CALPQ_M00_RELEASE" \
    CALPQ_M00_APPROVED_BY="CALPQ FV00 test" \
    CALPQ_M00_AUDITED_REVISION="1111111111111111111111111111111111111111" \
    bash scripts/m00_release_transition.sh >/dev/null)
}

open_feature_gate() {
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    CALPQ_FEATURE_DEVELOPMENT_APPROVAL="APPROVE_CALPQ_FEATURE_DEVELOPMENT" \
    CALPQ_FEATURE_DEVELOPMENT_APPROVED_BY="CALPQ FV00 test" \
    CALPQ_FEATURE_DEVELOPMENT_REVISION="2222222222222222222222222222222222222222" \
    bash scripts/feature_development_gate_transition.sh >/dev/null)
}

admit_fv00() {
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    CALPQ_FV00_ISSUE_FILE="$fixture/fv00-issue.json" \
    CALPQ_FV00_ADMISSION_APPROVAL="APPROVE_CALPQ_FV00_ADMISSION" \
    CALPQ_FV00_ADMISSION_APPROVED_BY="CALPQ FV00 test" \
    CALPQ_FV00_ADMISSION_APPROVED_AT="2026-09-14T20:32:00Z" \
    CALPQ_FV00_ADMISSION_REVISION="3333333333333333333333333333333333333333" \
    bash scripts/fv00_admission_transition.sh)
}

prepare
(cd "$fixture/work" && bash scripts/fv00_admission_check.sh >/dev/null)
printf 'TEST PASS: initial FV-00 admission is blocked pending prerequisites\n'

if admit_fv00 >/dev/null 2>&1; then
  printf 'TEST FAIL: FV-00 admitted before M00/feature prerequisites\n' >&2
  exit 1
fi
jq -e '.state == "BLOCKED_PENDING_PREREQUISITES"' "$fixture/work/docs/planning/fv00-admission-decision.json" >/dev/null
printf 'TEST PASS: FV-00 cannot be admitted before project-wide gates\n'

prepare
release_m00
open_feature_gate
admit_fv00 >/dev/null
jq -e '.state == "ADMITTED_FOR_IMPLEMENTATION" and .admitted_by_transition == "CALPQ-FV00-ADMIT-0001" and .admitted_revision == "3333333333333333333333333333333333333333" and .authorized_execution_entry == "M02_BATCH_A_FV01"' "$fixture/work/docs/planning/fv00-admission-decision.json" >/dev/null
grep -q '^`ADMITTED_FOR_IMPLEMENTATION`$' "$fixture/work/docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md"
grep -q '^Status: `FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN UNDER M02 BATCH PLAN`$' "$fixture/work/docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md"
(cd "$fixture/work" && bash scripts/fv00_admission_check.sh >/dev/null && bash scripts/foundation_guard.sh >/dev/null)
printf 'TEST PASS: FV-00 formal admission succeeds only after M00 release and feature gate opening\n'

prepare
release_m00
open_feature_gate
if (cd "$fixture/work" && \
  CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
  CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
  CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
  CALPQ_FV00_ISSUE_FILE="$fixture/fv00-issue.json" \
  CALPQ_FV00_ADMISSION_APPROVED_BY="CALPQ FV00 test" \
  CALPQ_FV00_ADMISSION_REVISION="3333333333333333333333333333333333333333" \
  bash scripts/fv00_admission_transition.sh >/dev/null 2>&1); then
  printf 'TEST FAIL: FV-00 admitted without explicit approval token\n' >&2
  exit 1
fi
jq -e '.state == "BLOCKED_PENDING_PREREQUISITES"' "$fixture/work/docs/planning/fv00-admission-decision.json" >/dev/null
printf 'TEST PASS: missing FV-00 approval rejected without mutation\n'

prepare
release_m00
open_feature_gate
printf '%s\n' '{"number":7,"state":"closed","title":"FV-00"}' > "$fixture/fv00-issue.json"
if admit_fv00 >/dev/null 2>&1; then
  printf 'TEST FAIL: FV-00 admitted with closed governance issue\n' >&2
  exit 1
fi
printf 'TEST PASS: closed FV-00 governance issue blocks admission transaction\n'

printf 'FV00 ADMISSION SELF-TESTS: PASS\n'
