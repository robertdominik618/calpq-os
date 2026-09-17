#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
base=59a6f8df2a45f580f100aa6d8961187ca0af6c1e
contract=1e481415c7d3e192ed88f0fa7ffca67a65b53fff
index=47c0db4cfc66fb3ac2e51ad49241046c45546fbb
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
for commit in "$base" "$contract" "$index"; do git merge-base --is-ancestor "$commit" HEAD; done
first=$(git rev-list --reverse "$base"..HEAD -- packages/application/test-support/m05-integration-fixtures.ts packages/application/test/m05-s10-integration.test.ts | sed -n '1p')
[[ -n "$first" ]]
git merge-base --is-ancestor "$index" "${first}^"
while IFS= read -r path; do
  case "$path" in
    docs/planning/M05_S10_*.md|packages/application/test-support/m05-integration-fixtures.ts|packages/application/test/m05-s10-integration.test.ts|packages/application/test/m05-s10-types.compile.ts|packages/application/tsconfig.json|scripts/ci/m05-runtime-ledger.mjs|tests/m05_s10_runtime_ledger_test.mjs|tests/m05_s10_integration_test.sh|.github/workflows/m05-s10-integration.yml) ;;
    *) echo "S10 integration-only scope violated: $path" >&2; exit 1 ;;
  esac
done < <(git diff --name-only "$base"...HEAD)
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = readFileSync('packages/application/test/m05-s10-integration.test.ts', 'utf8');
const index = readFileSync('docs/planning/M05_S10_TEST_INDEX.md', 'utf8');
const expected = Array.from({ length: 48 }, (_, i) => `M05S10-${String(i + 1).padStart(2, '0')}`);
assert.deepEqual([...source.matchAll(/^test\('(M05S10-\d{2})\b/gm)].map(match => match[1]).sort(), expected);
assert.deepEqual([...index.matchAll(/^\| (M05S10-\d{2}) \|/gm)].map(match => match[1]).sort(), expected);
assert.equal([...source.matchAll(/^test\(/gm)].length, 48);
assert(!/\btest\.(only|skip|todo)\s*\(/.test(source));
const config = JSON.parse(readFileSync('packages/application/tsconfig.json', 'utf8'));
assert(config.include.includes('test/m05-s10-types.compile.ts'));
NODE
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json
node --test tests/m05_s10_runtime_ledger_test.mjs
node scripts/ci/m05-runtime-ledger.mjs
bash tests/architecture_boundaries_test.sh
printf 'M05 S10 INTEGRATION: PASS / 48 COMPOSED SCENARIOS / S01-S10 RUNTIME LEDGER / STRICT TYPES / ARCHITECTURE / NO PRODUCTION OR EXISTING GATE CHANGES\n'
printf 'Full same-head PR regression workflow matrix remains a separate mandatory acceptance gate.\n'
