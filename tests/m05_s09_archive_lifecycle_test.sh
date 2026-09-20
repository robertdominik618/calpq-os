#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
base=a65975f7d5bf277da8e0018f436d3c9745bdadbf
contract_commit=2129ac132d5a3b4087058944231bb5995cb4f5c4
index_commit=7ad701a7a3075f2fbb0f940efb4e1d3dac4335c7
tests_commit=09f8d39cf42a185d4ee548bf22e877c62b71a584
source=packages/application/src/archive/archive-lifecycle.ts
runtime=packages/application/test/m05-s09-archive-lifecycle.test.ts
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
for ref in "$base" "$contract_commit" "$index_commit" "$tests_commit"; do git merge-base --is-ancestor "$ref" HEAD; done
first=$(git rev-list --reverse "$base"..HEAD -- "$source" | sed -n '1p')
[[ -n "$first" ]]
git merge-base --is-ancestor "$tests_commit" "${first}^"
scope_tip=HEAD
if [[ -f docs/planning/m07-s01-activation.json ]]; then
  node scripts/ci/m07-admission.mjs
  scope_tip=59a6f8df2a45f580f100aa6d8961187ca0af6c1e
  git merge-base --is-ancestor "$scope_tip" HEAD
fi
if git diff --name-only "${base}...${scope_tip}" | grep -Eq '^packages/(core/src/|adapters/)'; then echo 'S09 changes Core/provider adapters' >&2; exit 1; fi
if grep -En 'Date\.now\(|new Date\(|Math\.random\(|randomUUID\(|setTimeout\(|fetch\(|https?://|AuthorizationGrant|EligibilityAssessment|RecognitionDecision|from .(react|expo|fastify|openai|axios|node-fetch|@aws-sdk|@azure/)' "$source"; then echo 'S09 external-I/O or truth boundary violation' >&2; exit 1; fi
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const runtime = readFileSync('packages/application/test/m05-s09-archive-lifecycle.test.ts', 'utf8');
const index = readFileSync('docs/planning/M05_S09_TEST_INDEX.md', 'utf8');
const expected = Array.from({length:56}, (_, n) => `M05S09-${String(n+1).padStart(2,'0')}`);
assert.deepEqual([...runtime.matchAll(/^test\('(M05S09-\d{2})\b/gm)].map(m => m[1]).sort(), expected);
assert.deepEqual([...index.matchAll(/^\| (M05S09-\d{2}) \|/gm)].map(m => m[1]).sort(), expected);
assert.equal([...runtime.matchAll(/^test\(/gm)].length, 56);
assert(!/\btest\.(skip|todo|only)\s*\(/.test(runtime));
assert(JSON.parse(readFileSync('packages/application/tsconfig.json','utf8')).include.includes('test/m05-s09-types.compile.ts'));
assert.equal(JSON.parse(readFileSync('packages/application/package.json','utf8')).scripts['test:m05s09'], 'node --test test/m05-s09-archive-lifecycle.test.ts');
assert(readFileSync('docs/planning/M05_S09_IMPLEMENTATION_CONTRACT.md','utf8').includes('retention expiry != deletion permission'));
NODE
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json
log=$(mktemp)
trap 'rm -f "$log"' EXIT
node --test --test-reporter=tap "$runtime" | tee "$log"
for expected in '# tests 56' '# pass 56' '# fail 0' '# cancelled 0' '# skipped 0' '# todo 0'; do grep -Fxq "$expected" "$log"; done
echo 'M05 S09: 56 mandatory scenarios / strict readonly / ancestry and scope guards PASS'
# Existing predecessor gate is run on the exact same checkout, not inferred from old CI.
bash tests/m05_s08_human_review_test.sh
bash tests/architecture_boundaries_test.sh
echo 'M05 S09 + S08 + architecture PASS; full same-head PR regression matrix remains a separate acceptance gate.'
