#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'CALPQ MAIN RULESET HANDOFF: %s\n' "$1" >&2; exit "${2:-1}"; }

usage() {
  cat <<'EOF'
Usage:
  bash scripts/apply_github_main_ruleset.sh --check
  bash scripts/apply_github_main_ruleset.sh --apply

--check  Validate local blueprint, GitHub admin access and current remote ruleset without mutation.
--apply  Create CALPQ main protection only when absent, then verify it with CALPQ repository governance checks.
EOF
}

mode="${1:---check}"
case "$mode" in
  --check|--apply) ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; fail "unsupported mode: $mode" ;;
esac

repository="${CALPQ_GITHUB_REPOSITORY:-${GITHUB_REPOSITORY:-robertdominik618/calpq-os}}"
config="${CALPQ_GITHUB_RULESET_FILE:-foundation/github-main-ruleset.json}"
ruleset_name="${CALPQ_RULESET_NAME:-CALPQ main protection}"
api_version="${CALPQ_GITHUB_API_VERSION:-2026-03-10}"

command -v gh >/dev/null 2>&1 || fail "GitHub CLI 'gh' is required"
command -v jq >/dev/null 2>&1 || fail "jq is required"
[[ -f "$config" ]] || fail "ruleset blueprint missing: $config"

jq -e --arg name "$ruleset_name" '
  .name == $name
  and .target == "branch"
  and .enforcement == "active"
  and (.conditions.ref_name.include | any(. == "~DEFAULT_BRANCH" or . == "refs/heads/main"))
  and (.rules | any(.type == "deletion"))
  and (.rules | any(.type == "non_fast_forward"))
  and (.rules | any(.type == "pull_request" and .parameters.required_review_thread_resolution == true))
  and (.rules | any(.type == "required_status_checks" and .parameters.strict_required_status_checks_policy == true))
  and (.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks | any(.context == "Enforce M00 Foundation gate"))
  and (.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks | any(.context == "M00 internal readiness"))
  and (.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks | any(.context == "M00 repository governance"))
' "$config" >/dev/null || fail "ruleset blueprint does not satisfy CALPQ M00 policy"

gh auth status -h github.com >/dev/null 2>&1 || fail "GitHub CLI is not authenticated to github.com"
admin="$(gh api -H "X-GitHub-Api-Version: $api_version" "repos/$repository" --jq '.permissions.admin // false' 2>/dev/null || true)"
[[ "$admin" == "true" ]] || fail "authenticated GitHub identity lacks repository Administration permission"

verify_remote() {
  local tmp rulesets ruleset_id branch detail
  tmp="$(mktemp -d)"
  rulesets="$(gh api -H "X-GitHub-Api-Version: $api_version" "repos/$repository/rulesets")" || { rm -rf "$tmp"; return 1; }
  ruleset_id="$(jq -r --arg name "$ruleset_name" '.[] | select(.name == $name and .enforcement == "active") | .id' <<< "$rulesets" | head -n 1)"
  [[ -n "$ruleset_id" && "$ruleset_id" != "null" ]] || { rm -rf "$tmp"; return 1; }
  branch="$(gh api -H "X-GitHub-Api-Version: $api_version" "repos/$repository/branches/main")" || { rm -rf "$tmp"; return 1; }
  detail="$(gh api -H "X-GitHub-Api-Version: $api_version" "repos/$repository/rulesets/$ruleset_id")" || { rm -rf "$tmp"; return 1; }
  printf '%s\n' "$branch" > "$tmp/branch.json"
  printf '%s\n' "$rulesets" > "$tmp/rulesets.json"
  printf '%s\n' "$detail" > "$tmp/ruleset.json"
  if CALPQ_BRANCH_METADATA_FILE="$tmp/branch.json" \
     CALPQ_RULESETS_FILE="$tmp/rulesets.json" \
     CALPQ_RULESET_DETAIL_FILE="$tmp/ruleset.json" \
     CALPQ_RULESET_NAME="$ruleset_name" \
     bash scripts/repository_governance_check.sh >/dev/null; then
    rm -rf "$tmp"
    return 0
  fi
  rm -rf "$tmp"
  return 1
}

rulesets="$(gh api -H "X-GitHub-Api-Version: $api_version" "repos/$repository/rulesets")" \
  || fail "cannot read repository rulesets"
existing_id="$(jq -r --arg name "$ruleset_name" '.[] | select(.name == $name) | .id' <<< "$rulesets" | head -n 1)"

if [[ -n "$existing_id" && "$existing_id" != "null" ]]; then
  if verify_remote; then
    printf 'CALPQ MAIN RULESET HANDOFF: ACTIVE / VERIFIED / NO MUTATION REQUIRED\n'
    exit 0
  fi
  fail "ruleset '$ruleset_name' already exists but does not satisfy CALPQ governance; refusing automatic modification"
fi

if [[ "$mode" == "--check" ]]; then
  fail "ruleset '$ruleset_name' is absent; validation complete, rerun with --apply to create it" 2
fi

response="$(gh api \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: $api_version" \
  --method POST \
  "repos/$repository/rulesets" \
  --input "$config")" || fail "GitHub rejected ruleset creation"
created_id="$(jq -r '.id // empty' <<< "$response")"
[[ -n "$created_id" ]] || fail "ruleset creation returned no id"

for _ in $(seq 1 10); do
  if verify_remote; then
    printf 'CALPQ MAIN RULESET HANDOFF: CREATED / ACTIVE / VERIFIED / RULESET_ID=%s\n' "$created_id"
    exit 0
  fi
  sleep 1
done

fail "ruleset was created as id $created_id but CALPQ governance verification did not become green"
