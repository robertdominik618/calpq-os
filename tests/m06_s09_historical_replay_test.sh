#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m06-s09-scope.mjs

source=packages/application/src/lifecycle/historical-replay.ts
runtime=packages/application/test/m06-s09-historical-replay.test.ts
governance=tests/m06_s09_scope_test.mjs

if grep -En 'Date\.now\(|new Date\(|Math\.random\(|randomUUID\(|setTimeout\(|fetch\(|from .node:|from .*(react|openai|anthropic|axios)' "$source"; then
  echo 'M06 S09 ambient-time/provider boundary violated' >&2
  exit 1
fi

node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const runtime=readFileSync('packages/application/test/m06-s09-historical-replay.test.ts','utf8');
const governance=readFileSync('tests/m06_s09_scope_test.mjs','utf8');
const ids=[...runtime.matchAll(/^test\('(M06S09-\d{3})\b/gm)].map(m=>m[1]);
assert.deepEqual(ids,Array.from({length:128},(_,i)=>`M06S09-${String(i+1).padStart(3,'0')}`));
assert.equal([...runtime.matchAll(/^test\(/gm)].length,128);
assert(!/\btest\.(skip|todo|only)\s*\(/.test(runtime));
const gids=[...governance.matchAll(/^test\('(M06S09G-\d{2})\b/gm)].map(m=>m[1]);
assert.deepEqual(gids,Array.from({length:16},(_,i)=>`M06S09G-${String(i+1).padStart(2,'0')}`));
assert.equal([...governance.matchAll(/^test\(/gm)].length,16);
assert(!/\btest\.(skip|todo|only)\s*\(/.test(governance));
assert.equal([...readFileSync('packages/application/test/m06-s09-types.compile.ts','utf8').matchAll(/@ts-expect-error/g)].length,26);
assert(readFileSync('docs/planning/M06_S09_IMPLEMENTATION_CONTRACT.md','utf8').includes('AS_WAS != AS_IS; replay != authorization; replay match != source truth proof; current rules must not backfill historical truth; missing history != optimistic reconstruction; divergence != mutation'));
NODE

npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json

log=$(mktemp)
govlog=$(mktemp)
trap 'rm -f "$log" "$govlog"' EXIT
node --test --test-reporter=tap "$runtime" | tee "$log"
node --test --test-reporter=tap "$governance" | tee "$govlog"

node --input-type=module - "$log" "$govlog" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [path,prefix,count,digits] of [[process.argv[2],'M06S09',128,3],[process.argv[3],'M06S09G',16,2]]){
  const value=readFileSync(path,'utf8');
  const re=new RegExp(`^ok \\d+ - (${prefix}-\\d{${digits}})\\b`,'gm');
  const expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(digits,'0')}`);
  assert.deepEqual([...value.matchAll(re)].map(m=>m[1]),expected);
  for(const [key,n] of Object.entries({tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual([...value.matchAll(new RegExp(`^# ${key} (\\d+)$`,'gm'))].map(m=>Number(m[1])),[n]);
  }
}
NODE

printf 'M06 S09: 128/128 runtime, 16/16 scope and 26 readonly assertions PASS.\n'
printf 'Run unchanged S08/S07/S06/S05/S04/S03/S02/S01 and transitive predecessor runtime on CURRENT checkout.\n'
bash tests/m06_s08_continuous_compliance_test.sh
printf 'M06 S09 HISTORICAL REPLAY PASS head=%s tree=%s / READ ONLY AS_WAS-AS_IS / NO AUTHORIZATION HISTORY OR COMPLIANCE MUTATION\n' "$(git rev-parse HEAD)" "$(git rev-parse HEAD^{tree})"
printf 'Full same-head PR matrix and separate owner merge approval remain mandatory.\n'
