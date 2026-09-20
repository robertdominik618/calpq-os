#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
base=1c379ba6a488d7a2dea5eb13ed987ebfb5e51b8b
contract_commit=4dbcd0b09669de21a92b77ff2ec3729ae771f4d0
index_commit=052eb2dc12e72f86ba848fc0218200239d125c07
source=packages/application/src/human-review/human-review.ts
runtime=packages/application/test/m05-s08-human-review.test.ts
compile=packages/application/test/m05-s08-types.compile.ts
contract=docs/planning/M05_S08_IMPLEMENTATION_CONTRACT.md
index=docs/planning/M05_S08_TEST_INDEX.md

[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
git cat-file -e "${base}^{commit}"
git merge-base --is-ancestor "$base" HEAD
git merge-base --is-ancestor "$contract_commit" HEAD
git merge-base --is-ancestor "$index_commit" HEAD
for path in "$source" "$runtime" "$compile" "$contract" "$index" packages/application/src/human-review/index.ts; do [[ -s "$path" ]]; done
first_implementation=$(git rev-list --reverse "$base"..HEAD -- "$source" | sed -n '1p')
[[ -n "$first_implementation" ]]
git merge-base --is-ancestor "$index_commit" "${first_implementation}^"
grep -Fq 'human review != manual authority confirmation != evidence verification beyond checked claims != eligibility != authorization' "$contract"
scope_tip=HEAD
if [[ -f docs/planning/m07-s01-activation.json ]]; then
  node scripts/ci/m07-admission.mjs
  scope_tip=a65975f7d5bf277da8e0018f436d3c9745bdadbf
  git merge-base --is-ancestor "$scope_tip" HEAD
fi
if git diff --name-only "$base"... "$scope_tip" | grep -Eq '^packages/(core/src/|adapters/)'; then
  echo 'S08 must not change production Core or provider adapters' >&2; exit 1
fi
if grep -En 'Date\.now\(|new Date\(|Math\.random\(|randomUUID\(|setTimeout\(|fetch\(|from .(react|react-native|expo|fastify|openai|@anthropic-ai|axios|node-fetch|@aws-sdk|@google-cloud|@azure/)|https?://|api[_-]?key|access[_-]?token|client[_-]?secret|AuthorizationGrant|EligibilityAssessment|RecognitionDecision' "$source"; then
  echo 'S08 provider, ambient-time or legal-decision boundary violated' >&2; exit 1
fi
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const testSource = readFileSync('packages/application/test/m05-s08-human-review.test.ts', 'utf8');
const index = readFileSync('docs/planning/M05_S08_TEST_INDEX.md', 'utf8');
const expected = Array.from({length: 64}, (_, n) => `M05S08-${String(n + 1).padStart(2, '0')}`);
const actual = [...testSource.matchAll(/^test\('(M05S08-\d{2})\b/gm)].map(match => match[1]).sort();
const documented = [...index.matchAll(/^\| (M05S08-\d{2}) \|/gm)].map(match => match[1]).sort();
assert.deepEqual(actual, expected, 'Runtime identities must match all 64 mandatory scenarios');
assert.deepEqual(documented, expected, 'Index identities must match all mandatory scenarios');
assert.equal([...testSource.matchAll(/^test\(/gm)].length, 64);
assert(!/\btest\.(skip|todo|only)\s*\(/.test(testSource), 'No skipped, todo or exclusive tests');
const config = JSON.parse(readFileSync('packages/application/tsconfig.json', 'utf8'));
assert(config.include.includes('test/m05-s08-types.compile.ts'));
const pkg = JSON.parse(readFileSync('packages/application/package.json', 'utf8'));
assert.equal(pkg.exports['./human-review'], './src/human-review/index.ts');
assert.equal(pkg.scripts['test:m05s08'], 'node --test test/m05-s08-human-review.test.ts');
NODE
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json
log=$(mktemp)
trap 'rm -f "$log"' EXIT
node --test --test-reporter=tap "$runtime" | tee "$log"
grep -Eq '^# tests 64$' "$log"
grep -Eq '^# pass 64$' "$log"
grep -Eq '^# fail 0$' "$log"
grep -Eq '^# skipped 0$' "$log"
grep -Eq '^# todo 0$' "$log"
echo 'M05 S08: 64 mandatory scenarios, readonly proof and scope guards PASS.'
echo 'Release evidence additionally requires the complete same-head PR workflow matrix, including existing S07 transitive regressions and FV13 tenant governance. This fast S08 gate does not certify those separate runs.'
