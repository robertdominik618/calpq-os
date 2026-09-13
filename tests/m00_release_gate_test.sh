#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fixture="$(mktemp -d)"; trap 'rm -rf "$fixture"' EXIT
copy_fixture() { rm -rf "$fixture/work"; mkdir -p "$fixture/work"; cp -R "$repo_root/." "$fixture/work/"; rm -rf "$fixture/work/.git" "$fixture/work/node_modules"; }
run_gate() { (cd "$fixture/work" && bash scripts/m00_release_gate.sh); }
reject() { local name="$1"; if run_gate >/dev/null 2>&1; then echo "TEST FAIL: $name" >&2; exit 1; fi; echo "TEST PASS: rejected $name"; }
copy_fixture; run_gate >/dev/null; echo 'TEST PASS: approved stack with blocked M00 is consistent'
copy_fixture; sed -i 's/"feature_development": "FROZEN"/"feature_development": "AUTHORIZED"/' "$fixture/work/foundation/manifest.json"; reject 'premature feature enablement'
copy_fixture; sed -i 's/"m00_release_status": "BLOCKED"/"m00_release_status": "APPROVED"/' "$fixture/work/foundation/manifest.json"; reject 'unreviewed M00 release transition'
copy_fixture; sed -i 's/"status": "APPROVED"/"status": "NOT_YET_APPROVED"/' "$fixture/work/foundation/manifest.json"; reject 'technology approval downgrade'
copy_fixture; sed -i 's/Status: `ACCEPTED`/Status: `PROPOSED`/' "$fixture/work/docs/adr/ADR-0002-technology-stack-selection.md"; reject 'ADR status mismatch'
printf 'M00 RELEASE GATE SELF-TESTS: PASS\n'
