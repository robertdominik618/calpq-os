#!/usr/bin/env bash
set -euo pipefail

fail() { printf 'CALPQ MAIN RULESET HANDOFF: %s\n' "$1" >&2; exit "${2:-1}"; }

usage() {
  cat <<'EOF'
Usage:
  bash scripts/apply_github_main_ruleset.sh --check
  bash scripts/apply_github_main_ruleset.sh --apply

--check  Validate canonical checkout, local blueprint, GitHub admin access and current remote ruleset without mutation.
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
handoff_branch="${CALPQ_GITHUB_HANDOFF_BRANCH:-planning/program-execution-m09-m12}"

command -v gh >/dev/null 2>&1 || fail "GitHub CLI 'gh' is required"
command -v jq >/dev/null 2>&1 || fail "jq is required"
command -v git >/dev/null 2>&1 || fail "git is required"
[[ -f "$config" ]] || fail "ruleset blueprint missing: $config"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || fail "helper must be run from a CALPQ git checkout"
git ls-files --error-unmatch "$config" >/dev/null 2>&1 \
  || fail "ruleset blueprint must be the tracked canonical repository file: $config"

handoff_paths=(
  "$config"
  "scripts/apply_github_main_ruleset.sh"
  "scripts/repository_governance_check.sh"
)
for path in "${handoff_paths[@]}"; do
  git ls-files --error-unmatch "$path" >/dev/null 2>&1 \
    || fail "canonical handoff file is not tracked: $path"
done

git diff --quiet -- "${handoff_paths[@]}" \
  || fail "canonical handoff files contain unstaged local modifications"
git diff --cached --quiet -- "${handoff_paths[@]}" \
  || fail "canonical handoff files contain staged but uncommitted modifications"

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

local_head="$(git rev-parse HEAD 2>/dev/null || true)"
[[ "$local_head" =~ ^[0-9a-f]{40}$ ]] || fail "cannot resolve local CALPQ commit SHA"
encoded_handoff_branch="$(jq -rn --arg value "$handoff_branch" '$value | @uri')"
remote_head="$(gh api \
  -H "X-GitHub-Api-Version: $api_version" \
  "repos/$repository/commits/$encoded_handoff_branch" \
  --jq '.sha' 2>/dev/null || true)"
[[ "$remote_head" =~ ^[0-9a-f]{40}$ ]] \
  || fail "cannot resolve remote handoff branch '$handoff_branch'"
[[ "$local_head" == "$remote_head" ]] \
  || fail "stale checkout: local HEAD $local_head does not match remote $handoff_branch at $remote_head"

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
    printf 'CALPQ MAIN RULESET HANDOFF: ACTIVE / VERIFIED / NO MUTATION REQUIRED / SOURCE_SHA=%s\n' "$local_head"
    exit 0
  fi
  fail "ruleset '$ruleset_name' already exists but does not satisfy CALPQ governance; refusing automatic modification"
fi

if [[ "$mode" == "--check" ]]; then
  fail "ruleset '$ruleset_name' is absent; canonical checkout verified at $local_head, rerun with --apply to create it" 2
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
    printf 'CALPQ MAIN RULESET HANDOFF: CREATED / ACTIVE / VERIFIED / RULESET_ID=%s / SOURCE_SHA=%s\n' "$created_id" "$local_head"
    exit 0
  fi
  sleep 1
done

fail "ruleset was created as id $created_id but CALPQ governance verification did not become green"
