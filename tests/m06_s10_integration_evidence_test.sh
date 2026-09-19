#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m06-s10-scope.mjs

runtime=packages/application/test/m06-s10-integration-evidence.test.ts
governance=tests/m06_s10_scope_test.mjs

node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const runtime=readFileSync('packages/application/test/m06-s10-integration-evidence.test.ts','utf8');
const governance=readFileSync('tests/m06_s10_scope_test.mjs','utf8');
const ids=[...runtime.matchAll(/^test\('(M06S10-\d{3})\b/gm)].map(m=>m[1]);
assert.deepEqual(ids,Array.from({length:136},(_,i)=>`M06S10-${String(i+1).padStart(3,'0')}`));
assert.equal([...runtime.matchAll(/^test\(/gm)].length,136);
assert(!/\btest\.(skip|todo|only)\s*\(/.test(runtime));
const gids=[...governance.matchAll(/^test\('(M06S10G-\d{2})\b/gm)].map(m=>m[1]);
assert.deepEqual(gids,Array.from({length:16},(_,i)=>`M06S10G-${String(i+1).padStart(2,'0')}`));
assert.equal([...governance.matchAll(/^test\(/gm)].length,16);
assert(!/\btest\.(skip|todo|only)\s*\(/.test(governance));
assert.equal([...readFileSync('packages/application/test/m06-s10-types.compile.ts','utf8').matchAll(/@ts-expect-error/g)].length,28);
assert(readFileSync('docs/planning/M06_S10_IMPLEMENTATION_CONTRACT.md','utf8').includes('M06 does not become production-released merely because S10 passes.'));
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
for(const [path,prefix,count,digits] of [[process.argv[2],'M06S10',136,3],[process.argv[3],'M06S10G',16,2]]){
  const value=readFileSync(path,'utf8');
  const re=new RegExp(`^ok \\d+ - (${prefix}-\\d{${digits}})\\b`,'gm');
  const expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(digits,'0')}`);
  assert.deepEqual([...value.matchAll(re)].map(m=>m[1]),expected);
  for(const [key,n] of Object.entries({tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0})){
    assert.deepEqual([...value.matchAll(new RegExp(`^# ${key} (\\d+)$`,'gm'))].map(m=>Number(m[1])),[n]);
  }
}
NODE

printf 'M06 S10: 136/136 integration runtime, 16/16 scope and 28 readonly assertions PASS.\n'
printf 'Run unchanged S09/S08/S07/S06/S05/S04/S03/S02/S01 and transitive predecessor evidence on CURRENT checkout.\n'
bash tests/m06_s09_historical_replay_test.sh
printf 'M06 S10 INTEGRATION EVIDENCE PASS head=%s tree=%s / S01-S09 COMPOSED / NO NEW BUSINESS SOURCE / NO PRODUCTION RELEASE\n' "$(git rev-parse HEAD)" "$(git rev-parse HEAD^{tree})"
printf 'Full same-head PR matrix and separate owner merge/technical-acceptance approval remain mandatory.\n'
