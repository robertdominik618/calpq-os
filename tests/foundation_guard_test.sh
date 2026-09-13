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

expect_pass() {
  local name="$1"
  shift
  if ! "$@" >/dev/null; then
    printf 'TEST FAIL: expected PASS: %s\n' "$name" >&2
    exit 1
  fi
  printf 'TEST PASS: %s\n' "$name"
}

expect_reject() {
  local name="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    printf 'TEST FAIL: expected rejection: %s\n' "$name" >&2
    exit 1
  fi
  printf 'TEST PASS: rejected %s\n' "$name"
}

copy_fixture
expect_pass "valid M00 foundation" bash "$fixture/work/scripts/foundation_guard.sh"

copy_fixture
mkdir -p "$fixture/work/src"
expect_reject "feature directory while frozen" bash "$fixture/work/scripts/foundation_guard.sh"

copy_fixture
touch "$fixture/work/package.json"
expect_reject "dependency manifest before stack approval" bash "$fixture/work/scripts/foundation_guard.sh"

copy_fixture
touch "$fixture/work/rogue.ts"
expect_reject "product source file while frozen" bash "$fixture/work/scripts/foundation_guard.sh"

printf 'FOUNDATION GUARD SELF-TESTS: PASS\n'
