#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"
trap 'rm -rf "$fixture"' EXIT

copy_fixture() {
  rm -rf "$fixture/work"
  mkdir -p "$fixture/work"
  cp -R "$repo_root/." "$fixture/work/"
  rm -rf "$fixture/work/.git"
}

run_audit() {
  (cd "$fixture/work" && bash scripts/m00_readiness_audit.sh)
}

copy_fixture
run_audit >/dev/null
printf 'TEST PASS: valid internal readiness accepted\n'

copy_fixture
sed -i 's/WCAG 2.2 AA/WCAG TARGET REMOVED/' "$fixture/work/docs/foundation/ACCESSIBILITY_BASELINE.md"
if run_audit >/dev/null 2>&1; then
  printf 'TEST FAIL: missing accessibility target was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: missing accessibility target rejected\n'

copy_fixture
sed -i 's/pnpm@12.3.4/pnpm@0.0.0/' "$fixture/work/package.json"
if run_audit >/dev/null 2>&1; then
  printf 'TEST FAIL: unpinned toolchain baseline was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: toolchain drift rejected\n'

copy_fixture
jq '(.rules[] | select(.type == "required_status_checks") | .parameters.required_status_checks) |= map(select(.context != "M00 repository governance"))' \
  "$fixture/work/foundation/github-main-ruleset.json" > "$fixture/work/foundation/github-main-ruleset.tmp"
mv "$fixture/work/foundation/github-main-ruleset.tmp" "$fixture/work/foundation/github-main-ruleset.json"
if run_audit >/dev/null 2>&1; then
  printf 'TEST FAIL: weakened GitHub ruleset blueprint was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: weakened GitHub ruleset blueprint rejected\n'

printf 'M00 READINESS SELF-TESTS: PASS\n'
