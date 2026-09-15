#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/tests/helpers/governance_fixture.sh"
fixture="$(mktemp -d)"; trap 'rm -rf "$fixture"' EXIT

copy_fixture() {
  rm -rf "$fixture/work"
  mkdir -p "$fixture/work"
  cp -R "$repo_root/." "$fixture/work/"
  rm -rf "$fixture/work/.git" "$fixture/work/node_modules"
  calpq_reset_governance_fixture "$fixture/work"
}
run_guard() { (cd "$fixture/work" && bash scripts/foundation_guard.sh); }
reject() { local name="$1"; if run_guard >/dev/null 2>&1; then echo "TEST FAIL: $name" >&2; exit 1; fi; echo "TEST PASS: rejected $name"; }

prepare_repo_fixtures() {
  printf '%s\n' '{"name":"main","protected":true}' > "$fixture/branch.json"
  printf '%s\n' '[{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active"}]' > "$fixture/rulesets.json"
  cat > "$fixture/ruleset.json" <<'JSON'
{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_review_thread_resolution":true}},{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":true,"required_status_checks":[{"context":"Enforce M00 Foundation gate"},{"context":"M00 internal readiness"},{"context":"M00 repository governance"}]}}]}
JSON
  printf '%s\n' '{"number":2,"state":"closed","title":"M00-BLK-001"}' > "$fixture/blocker.json"
}

release_and_open_feature_gate() {
  prepare_repo_fixtures
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    CALPQ_M00_BLOCKER_FILE="$fixture/blocker.json" \
    CALPQ_M00_RELEASE_APPROVAL="APPROVE_CALPQ_M00_RELEASE" \
    CALPQ_M00_APPROVED_BY="CALPQ foundation guard test" \
    CALPQ_M00_AUDITED_REVISION="1111111111111111111111111111111111111111" \
    bash scripts/m00_release_transition.sh >/dev/null)
  (cd "$fixture/work" && \
    CALPQ_BRANCH_METADATA_FILE="$fixture/branch.json" \
    CALPQ_RULESETS_FILE="$fixture/rulesets.json" \
    CALPQ_RULESET_DETAIL_FILE="$fixture/ruleset.json" \
    CALPQ_FEATURE_DEVELOPMENT_APPROVAL="APPROVE_CALPQ_FEATURE_DEVELOPMENT" \
    CALPQ_FEATURE_DEVELOPMENT_APPROVED_BY="CALPQ foundation guard test" \
    CALPQ_FEATURE_DEVELOPMENT_REVISION="2222222222222222222222222222222222222222" \
    bash scripts/feature_development_gate_transition.sh >/dev/null)
}

copy_fixture; run_guard >/dev/null; echo 'TEST PASS: approved bootstrap foundation'
copy_fixture; rm "$fixture/work/docs/foundation/ACCESSIBILITY_BASELINE.md"; reject 'missing required artifact'
copy_fixture; mkdir -p "$fixture/work/src"; reject 'top-level feature source directory'
copy_fixture; touch "$fixture/work/apps/mobile/feature.ts"; reject 'product TypeScript source while frozen'
copy_fixture; touch "$fixture/work/apps/web/config.yaml"; reject 'non-bootstrap payload inside app shell'
copy_fixture; sed -i 's/"status": "APPROVED"/"status": "NOT_YET_APPROVED"/' "$fixture/work/foundation/manifest.json"; reject 'bootstrap with unapproved technology state'

copy_fixture
jq '.state = "OPEN" | .opened_revision = "x" | .opened_by_transition = "CALPQ-FEATURE-GATE-OPEN-0001" | .approved_by = "x" | .approved_at = "x" | .next_gate = "FV00_FORMAL_ADMISSION"' "$fixture/work/foundation/feature-development-gate.json" > "$fixture/x" && mv "$fixture/x" "$fixture/work/foundation/feature-development-gate.json"
reject 'open feature gate while manifest remains frozen'

copy_fixture
release_and_open_feature_gate
touch "$fixture/work/apps/mobile/feature.ts"
run_guard >/dev/null
echo 'TEST PASS: product source is permitted only after released M00 and explicit feature gate opening'

printf 'FOUNDATION GUARD SELF-TESTS: PASS\n'
