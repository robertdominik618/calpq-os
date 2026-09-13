#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'REPOSITORY GOVERNANCE: %s\n' "$1" >&2; exit 1; }

command -v jq >/dev/null 2>&1 || fail "jq is required"

ruleset_name="${CALPQ_RULESET_NAME:-CALPQ main protection}"
required_checks=(
  "Enforce M00 Foundation gate"
  "M00 internal readiness"
  "M00 repository governance"
)

if [[ -n "${CALPQ_BRANCH_METADATA_FILE:-}" ]]; then
  branch_metadata="$(cat "$CALPQ_BRANCH_METADATA_FILE")"
else
  repository="${GITHUB_REPOSITORY:-robertdominik618/calpq-os}"
  api="${GITHUB_API_URL:-https://api.github.com}"
  headers=(-H 'Accept: application/vnd.github+json')
  if [[ -n "${GITHUB_TOKEN:-}" ]]; then
    headers+=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
  fi
  branch_metadata="$(curl -fsSL "${headers[@]}" "$api/repos/$repository/branches/main")" \
    || fail "cannot read main branch metadata"
fi

jq -e '.protected == true' >/dev/null <<< "$branch_metadata" \
  || fail "main is not protected"

if [[ -n "${CALPQ_RULESETS_FILE:-}" ]]; then
  rulesets="$(cat "$CALPQ_RULESETS_FILE")"
else
  rulesets="$(curl -fsSL "${headers[@]}" "$api/repos/$repository/rulesets")" \
    || fail "cannot read repository rulesets"
fi

ruleset_id="$(jq -r --arg name "$ruleset_name" '.[] | select(.name == $name and .enforcement == "active") | .id' <<< "$rulesets" | head -n 1)"
[[ -n "$ruleset_id" && "$ruleset_id" != "null" ]] \
  || fail "active ruleset '$ruleset_name' not found"

if [[ -n "${CALPQ_RULESET_DETAIL_FILE:-}" ]]; then
  ruleset="$(cat "$CALPQ_RULESET_DETAIL_FILE")"
else
  ruleset="$(curl -fsSL "${headers[@]}" "$api/repos/$repository/rulesets/$ruleset_id")" \
    || fail "cannot read CALPQ main ruleset details"
fi

jq -e --arg name "$ruleset_name" '.name == $name and .target == "branch" and .enforcement == "active"' >/dev/null <<< "$ruleset" \
  || fail "ruleset identity/target/enforcement is invalid"

jq -e '.conditions.ref_name.include | any(. == "~DEFAULT_BRANCH" or . == "refs/heads/main")' >/dev/null <<< "$ruleset" \
  || fail "ruleset does not target the default branch/main"

for rule in deletion non_fast_forward pull_request required_status_checks; do
  jq -e --arg rule "$rule" '.rules | any(.type == $rule)' >/dev/null <<< "$ruleset" \
    || fail "required ruleset rule missing: $rule"
done

jq -e '.rules[] | select(.type == "required_status_checks") | .parameters.strict_required_status_checks_policy == true' >/dev/null <<< "$ruleset" \
  || fail "strict required status checks are not enabled"

for check in "${required_checks[@]}"; do
  jq -e --arg check "$check" '.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks | any(.context == $check)' >/dev/null <<< "$ruleset" \
    || fail "required status check missing: $check"
done

jq -e '.rules[] | select(.type == "pull_request") | .parameters.required_review_thread_resolution == true' >/dev/null <<< "$ruleset" \
  || fail "review-thread resolution is not required"

printf 'REPOSITORY GOVERNANCE: PASS / CALPQ main protection active\n'
