#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"; trap 'rm -rf "$fixture"' EXIT
copy_fixture() { rm -rf "$fixture/work"; mkdir -p "$fixture/work"; cp -R "$repo_root/." "$fixture/work/"; rm -rf "$fixture/work/.git" "$fixture/work/node_modules"; }
run_guard() { (cd "$fixture/work" && bash scripts/foundation_guard.sh); }
reject() { local name="$1"; if run_guard >/dev/null 2>&1; then echo "TEST FAIL: $name" >&2; exit 1; fi; echo "TEST PASS: rejected $name"; }
copy_fixture; run_guard >/dev/null; echo 'TEST PASS: approved bootstrap foundation'
copy_fixture; rm "$fixture/work/docs/foundation/ACCESSIBILITY_BASELINE.md"; reject 'missing required artifact'
copy_fixture; mkdir -p "$fixture/work/src"; reject 'top-level feature source directory'
copy_fixture; touch "$fixture/work/apps/mobile/feature.ts"; reject 'product TypeScript source while frozen'
copy_fixture; touch "$fixture/work/apps/web/config.yaml"; reject 'non-bootstrap payload inside app shell'
copy_fixture; sed -i 's/"status": "APPROVED"/"status": "NOT_YET_APPROVED"/' "$fixture/work/foundation/manifest.json"; reject 'bootstrap with unapproved technology state'
printf 'FOUNDATION GUARD SELF-TESTS: PASS\n'
