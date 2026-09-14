#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT

prepare() {
  rm -rf "$fixture/work"
  mkdir -p "$fixture/work"
  cp -R "$repo_root/." "$fixture/work/"
  rm -rf "$fixture/work/.git" "$fixture/work/node_modules"
  printf '%s\n' '{"name":"main","protected":true}' > "$fixture/branch.json"
  printf '%s\n' '[{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active"}]' > "$fixture/rulesets.json"
  cat > "$fixture/ruleset.json" <<'JSON'
{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_review_thread_resolution":true}},{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":true,"required_status_checks":[{"context":"Enforce M00 Foundation gate"},{"context":"M00 internal readiness"},{"context":"M00 repository governance"}]}}]}
JSON
  printf '%s\n' '{"number":2,"state":"closed","title":"M00-BLK-001"}' > "$fixture/blocker.json"
}

release_m00() {
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    CALPQ_M00_BLOCKER_FILE="$fixture/blocker.json" \
    CALPQ_M00_RELEASE_APPROVAL="APPROVE_CALPQ_M00_RELEASE" \
    CALPQ_M00_APPROVED_BY="CALPQ governance test" \
    CALPQ_M00_APPROVED_AT="2026-09-14T20:30:00Z" \
    CALPQ_M00_AUDITED_REVISION="1111111111111111111111111111111111111111" \
    bash scripts/m00_release_transition.sh)
}

open_feature_gate() {
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    CALPQ_FEATURE_DEVELOPMENT_APPROVAL="APPROVE_CALPQ_FEATURE_DEVELOPMENT" \
    CALPQ_FEATURE_DEVELOPMENT_APPROVED_BY="CALPQ governance test" \
    CALPQ_FEATURE_DEVELOPMENT_APPROVED_AT="2026-09-14T20:31:00Z" \
    CALPQ_FEATURE_DEVELOPMENT_REVISION="2222222222222222222222222222222222222222" \
    bash scripts/feature_development_gate_transition.sh)
}

prepare
(cd "$fixture/work" && bash scripts/feature_development_gate_check.sh >/dev/null)
printf 'TEST PASS: initial feature gate is consistently LOCKED while M00 is BLOCKED\n'

if open_feature_gate >/dev/null 2>&1; then
  printf 'TEST FAIL: feature gate opened before M00 release\n' >&2
  exit 1
fi
jq -e '.feature_development == "FROZEN" and .m00_release_status == "BLOCKED"' "$fixture/work/foundation/manifest.json" >/dev/null
jq -e '.state == "LOCKED"' "$fixture/work/foundation/feature-development-gate.json" >/dev/null
printf 'TEST PASS: feature gate cannot open before M00 release\n'

prepare
release_m00 >/dev/null
(cd "$fixture/work" && bash scripts/feature_development_gate_check.sh >/dev/null)
jq -e '.m00_release_status == "RELEASED" and .feature_development == "FROZEN"' "$fixture/work/foundation/manifest.json" >/dev/null
printf 'TEST PASS: released M00 still leaves feature gate locked\n'

open_feature_gate >/dev/null
jq -e '.m00_release_status == "RELEASED" and .feature_development == "AUTHORIZED" and .quality_gates.feature_development_gate == "OPEN"' "$fixture/work/foundation/manifest.json" >/dev/null
jq -e '.state == "OPEN" and .opened_by_transition == "CALPQ-FEATURE-GATE-OPEN-0001" and .opened_revision == "2222222222222222222222222222222222222222" and .next_gate == "FV00_FORMAL_ADMISSION"' "$fixture/work/foundation/feature-development-gate.json" >/dev/null
(cd "$fixture/work" && bash scripts/feature_development_gate_check.sh >/dev/null && bash scripts/m00_release_gate.sh >/dev/null)
grep -q '^`BLOCKED_PENDING_PREREQUISITES`$' "$fixture/work/docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md"
if grep -q '^Status: .*ADMITTED_FOR_IMPLEMENTATION' "$fixture/work/docs/planning/FV00_VERTICAL_ADMISSION_RECORD.md"; then
  printf 'TEST FAIL: feature gate transition implicitly admitted FV-00\n' >&2
  exit 1
fi
printf 'TEST PASS: feature gate opens only after M00 release and does not admit FV-00\n'

prepare
release_m00 >/dev/null
if (cd "$fixture/work" && \
  CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
  CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
  CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
  CALPQ_FEATURE_DEVELOPMENT_APPROVED_BY="CALPQ governance test" \
  CALPQ_FEATURE_DEVELOPMENT_REVISION="2222222222222222222222222222222222222222" \
  bash scripts/feature_development_gate_transition.sh >/dev/null 2>&1); then
  printf 'TEST FAIL: feature gate opened without explicit approval token\n' >&2
  exit 1
fi
jq -e '.feature_development == "FROZEN"' "$fixture/work/foundation/manifest.json" >/dev/null
jq -e '.state == "LOCKED"' "$fixture/work/foundation/feature-development-gate.json" >/dev/null
printf 'TEST PASS: missing feature-development approval rejected without mutation\n'

prepare
release_m00 >/dev/null
jq '.feature_development = "AUTHORIZED" | .quality_gates.feature_development_gate = "OPEN"' "$fixture/work/foundation/manifest.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/manifest.json"
if (cd "$fixture/work" && bash scripts/feature_development_gate_check.sh >/dev/null 2>&1); then
  printf 'TEST FAIL: AUTHORIZED manifest accepted with LOCKED gate\n' >&2
  exit 1
fi
printf 'TEST PASS: unauthorized manifest-only feature opening rejected\n'

prepare
jq '.state = "OPEN" | .opened_revision = "x" | .opened_by_transition = "CALPQ-FEATURE-GATE-OPEN-0001" | .approved_by = "x" | .approved_at = "x" | .next_gate = "FV00_FORMAL_ADMISSION"' "$fixture/work/foundation/feature-development-gate.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/feature-development-gate.json"
if (cd "$fixture/work" && bash scripts/feature_development_gate_check.sh >/dev/null 2>&1); then
  printf 'TEST FAIL: OPEN gate accepted while feature development remained FROZEN\n' >&2
  exit 1
fi
printf 'TEST PASS: gate-only feature opening rejected\n'

printf 'FEATURE DEVELOPMENT GATE SELF-TESTS: PASS\n'
