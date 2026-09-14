#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT
mkdir -p "$fixture/bin" "$fixture/state"

export FAKE_GH_STATE="$fixture/state"
export FAKE_GH_REPOSITORY="robertdominik618/calpq-os"
export FAKE_GH_HANDOFF_SHA="$(cd "$repo_root" && git rev-parse HEAD)"

cat > "$fixture/bin/gh" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
state="${FAKE_GH_STATE:?}"
repo="${FAKE_GH_REPOSITORY:?}"

if [[ "${1:-}" == "auth" && "${2:-}" == "status" ]]; then
  exit 0
fi
if [[ "${1:-}" == "auth" && "${2:-}" == "token" ]]; then
  printf 'fake-token\n'
  exit 0
fi
[[ "${1:-}" == "api" ]] || exit 1

endpoint=""
method="GET"
for arg in "$@"; do
  case "$arg" in
    repos/*) endpoint="$arg" ;;
    POST) method="POST" ;;
  esac
done

case "$endpoint" in
  "repos/$repo")
    printf '%s\n' "$(cat "$state/admin.txt")"
    ;;
  "repos/$repo/commits/"*)
    printf '%s\n' "${FAKE_GH_HANDOFF_SHA:?}"
    ;;
  "repos/$repo/rulesets")
    if [[ "$method" == "POST" ]]; then
      printf 'post\n' >> "$state/posts.log"
      cat > "$state/rulesets.json" <<'JSON'
[{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active"}]
JSON
      cat > "$state/ruleset.json" <<'JSON'
{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"},{"type":"non_fast_forward"},{"type":"pull_request","parameters":{"required_review_thread_resolution":true}},{"type":"required_status_checks","parameters":{"strict_required_status_checks_policy":true,"required_status_checks":[{"context":"Enforce M00 Foundation gate"},{"context":"M00 internal readiness"},{"context":"M00 repository governance"}]}}]}
JSON
      printf '%s\n' '{"name":"main","protected":true}' > "$state/branch.json"
      cat "$state/ruleset.json"
    else
      cat "$state/rulesets.json"
    fi
    ;;
  "repos/$repo/rulesets/101") cat "$state/ruleset.json" ;;
  "repos/$repo/branches/main") cat "$state/branch.json" ;;
  *) exit 1 ;;
esac
EOF
chmod +x "$fixture/bin/gh"

reset_absent() {
  printf 'true\n' > "$fixture/state/admin.txt"
  printf '[]\n' > "$fixture/state/rulesets.json"
  printf '%s\n' '{"name":"main","protected":false}' > "$fixture/state/branch.json"
  : > "$fixture/state/ruleset.json"
  : > "$fixture/state/posts.log"
}

run_handoff() {
  (cd "$repo_root" && PATH="$fixture/bin:$PATH" CALPQ_GITHUB_REPOSITORY="$FAKE_GH_REPOSITORY" bash scripts/apply_github_main_ruleset.sh "$@")
}

reset_absent
set +e
run_handoff --check >/dev/null 2>&1
status=$?
set -e
[[ "$status" -eq 2 ]] || { printf 'TEST FAIL: absent ruleset check must exit 2, got %s\n' "$status" >&2; exit 1; }
[[ ! -s "$fixture/state/posts.log" ]] || { printf 'TEST FAIL: --check mutated remote state\n' >&2; exit 1; }
printf 'TEST PASS: --check detects absent ruleset without mutation\n'

run_handoff --apply >/dev/null
[[ "$(wc -l < "$fixture/state/posts.log" | tr -d ' ')" -eq 1 ]] || { printf 'TEST FAIL: --apply did not issue exactly one create request\n' >&2; exit 1; }
grep -q '"protected":true' "$fixture/state/branch.json"
printf 'TEST PASS: --apply creates and verifies CALPQ main protection\n'

run_handoff --apply >/dev/null
[[ "$(wc -l < "$fixture/state/posts.log" | tr -d ' ')" -eq 1 ]] || { printf 'TEST FAIL: idempotent rerun created a duplicate ruleset\n' >&2; exit 1; }
printf 'TEST PASS: rerun is idempotent when valid ruleset already exists\n'

reset_absent
printf 'false\n' > "$fixture/state/admin.txt"
if run_handoff --apply >/dev/null 2>&1; then
  printf 'TEST FAIL: non-admin identity was allowed to apply ruleset\n' >&2
  exit 1
fi
[[ ! -s "$fixture/state/posts.log" ]] || { printf 'TEST FAIL: non-admin path attempted mutation\n' >&2; exit 1; }
printf 'TEST PASS: missing Administration permission is rejected before mutation\n'

reset_absent
cat > "$fixture/state/rulesets.json" <<'JSON'
[{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active"}]
JSON
cat > "$fixture/state/ruleset.json" <<'JSON'
{"id":101,"name":"CALPQ main protection","target":"branch","enforcement":"active","conditions":{"ref_name":{"include":["~DEFAULT_BRANCH"],"exclude":[]}},"rules":[{"type":"deletion"}]}
JSON
printf '%s\n' '{"name":"main","protected":true}' > "$fixture/state/branch.json"
if run_handoff --apply >/dev/null 2>&1; then
  printf 'TEST FAIL: malformed existing ruleset was silently accepted or modified\n' >&2
  exit 1
fi
[[ ! -s "$fixture/state/posts.log" ]] || { printf 'TEST FAIL: malformed existing ruleset triggered automatic replacement\n' >&2; exit 1; }
printf 'TEST PASS: malformed existing ruleset requires explicit human review and is not overwritten\n'

reset_absent
canonical_sha="$FAKE_GH_HANDOFF_SHA"
export FAKE_GH_HANDOFF_SHA="0000000000000000000000000000000000000000"
if run_handoff --apply >/dev/null 2>&1; then
  printf 'TEST FAIL: stale local checkout was allowed to mutate repository governance\n' >&2
  exit 1
fi
[[ ! -s "$fixture/state/posts.log" ]] || { printf 'TEST FAIL: stale checkout attempted repository mutation\n' >&2; exit 1; }
export FAKE_GH_HANDOFF_SHA="$canonical_sha"
printf 'TEST PASS: stale checkout is rejected before mutation\n'

printf 'GITHUB MAIN RULESET HANDOFF SELF-TESTS: PASS\n'
