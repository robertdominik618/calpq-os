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

run_gate() {
  (
    cd "$fixture/work"
    bash scripts/m00_release_gate.sh
  )
}

copy_fixture
run_gate >/dev/null
printf 'TEST PASS: current M00 state is consistent\n'

copy_fixture
sed -i 's/"feature_development": "FROZEN"/"feature_development": "AUTHORIZED"/' "$fixture/work/foundation/manifest.json"
if run_gate >/dev/null 2>&1; then
  printf 'TEST FAIL: inconsistent feature state was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: premature feature enablement rejected\n'

copy_fixture
sed -i 's/"m00_release_status": "BLOCKED"/"m00_release_status": "APPROVED"/' "$fixture/work/foundation/manifest.json"
if run_gate >/dev/null 2>&1; then
  printf 'TEST FAIL: unreviewed release-state change was accepted\n' >&2
  exit 1
fi
printf 'TEST PASS: unreviewed M00 release transition rejected\n'

printf 'M00 RELEASE GATE SELF-TESTS: PASS\n'
