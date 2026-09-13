#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT

fresh(){ rm -rf "$tmp/w"; mkdir -p "$tmp/w"; cp -R "$root/." "$tmp/w/"; rm -rf "$tmp/w/.git" "$tmp/w/node_modules"; }
run(){ (cd "$tmp/w" && bash scripts/feature_development_gate.sh); }
reject(){ local n="$1"; if run >/dev/null 2>&1; then echo "TEST FAIL: $n" >&2; exit 1; fi; echo "TEST PASS: rejected $n"; }

fresh; run >/dev/null; echo 'TEST PASS: current blocked/frozen state remains locked'

fresh
sed -i 's/"feature_development": "FROZEN"/"feature_development": "AUTHORIZED"/' "$tmp/w/foundation/manifest.json"
reject 'feature enablement while M00 is blocked'

fresh
sed -i 's/"state": "LOCKED"/"state": "OPEN"/' "$tmp/w/foundation/feature-development-gate.json"
reject 'open gate while manifest remains frozen'

fresh
sed -i 's/"m00_release_status": "BLOCKED"/"m00_release_status": "RELEASED"/' "$tmp/w/foundation/manifest.json"
sed -i '0,/"status": "PENDING"/s//"status": "APPROVED"/' "$tmp/w/foundation/m00-release-decision.json"
run >/dev/null; echo 'TEST PASS: released M00 may remain feature-frozen'

fresh
sed -i 's/"m00_release_status": "BLOCKED"/"m00_release_status": "RELEASED"/' "$tmp/w/foundation/manifest.json"
sed -i 's/"feature_development": "FROZEN"/"feature_development": "AUTHORIZED"/' "$tmp/w/foundation/manifest.json"
sed -i '0,/"status": "PENDING"/s//"status": "APPROVED"/' "$tmp/w/foundation/m00-release-decision.json"
reject 'feature enablement without opening feature gate'

fresh
sed -i 's/"m00_release_status": "BLOCKED"/"m00_release_status": "RELEASED"/' "$tmp/w/foundation/manifest.json"
sed -i 's/"feature_development": "FROZEN"/"feature_development": "AUTHORIZED"/' "$tmp/w/foundation/manifest.json"
sed -i '0,/"status": "PENDING"/s//"status": "APPROVED"/' "$tmp/w/foundation/m00-release-decision.json"
sed -i 's/"state": "LOCKED"/"state": "OPEN"/' "$tmp/w/foundation/feature-development-gate.json"
sed -i 's/"opened_revision": null/"opened_revision": "reviewed-revision"/' "$tmp/w/foundation/feature-development-gate.json"
sed -i 's/"opened_by_transition": null/"opened_by_transition": "explicit-feature-open"/' "$tmp/w/foundation/feature-development-gate.json"
run >/dev/null; echo 'TEST PASS: coherent released/open state accepted'

printf 'FEATURE DEVELOPMENT GATE SELF-TESTS: PASS\n'
