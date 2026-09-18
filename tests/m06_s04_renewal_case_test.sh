#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m06-s04-scope.mjs
source=packages/application/src/lifecycle/renewal-case.ts
runtime=packages/application/test/m06-s04-renewal-case.test.ts
governance=tests/m06_s04_scope_test.mjs
if grep -En 'Date\.now\(|new Date\(|Math\.random\(|randomUUID\(|setTimeout\(|fetch\(|from .node:|from .*(react|openai|anthropic|axios)|AuthorizationGrant|EligibilityAssessment' "$source"; then
  echo 'M06 S04 ambient-time/provider/authority boundary violated' >&2; exit 1
fi
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [path,prefix,count] of [['packages/application/test/m06-s04-renewal-case.test.ts','M06S04',88],['tests/m06_s04_scope_test.mjs','M06S04G',16]]){
  const value=readFileSync(path,'utf8'),expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(2,'0')}`);
  assert.deepEqual([...value.matchAll(new RegExp(`^test\\('(${prefix}-\\d{2})\\b`,'gm'))].map(m=>m[1]),expected);
  assert.equal([...value.matchAll(/^test\(/gm)].length,count);assert(!/\btest\.(skip|todo|only)\s*\(/.test(value));
}
assert.equal([...readFileSync('packages/application/test/m06-s04-types.compile.ts','utf8').matchAll(/@ts-expect-error/g)].length,16);
assert(readFileSync('docs/planning/M06_S04_IMPLEMENTATION_CONTRACT.md','utf8').includes('workflow readiness != external submission; recorded external outcome != new legal authorization; grace != validity extension; workflow state != credential state'));
NODE
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json
log=$(mktemp);govlog=$(mktemp)
trap 'rm -f "$log" "$govlog"' EXIT
node --test --test-reporter=tap "$runtime" | tee "$log"
node --test --test-reporter=tap "$governance" | tee "$govlog"
node --input-type=module - "$log" "$govlog" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [path,prefix,count] of [[process.argv[2],'M06S04',88],[process.argv[3],'M06S04G',16]]){
  const value=readFileSync(path,'utf8'),expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(2,'0')}`);
  assert.deepEqual([...value.matchAll(new RegExp(`^ok \\d+ - (${prefix}-\\d{2})\\b`,'gm'))].map(m=>m[1]),expected);
  for(const [key,n] of Object.entries({tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0}))assert.deepEqual([...value.matchAll(new RegExp(`^# ${key} (\\d+)$`,'gm'))].map(m=>Number(m[1])),[n]);
}
NODE
printf 'M06 S04: 88/88 runtime,16/16 scope and16 readonly assertions PASS.\n'
printf 'Run unchanged S03/S02/S01 and transitive predecessor runtime on CURRENT checkout.\n'
bash tests/m06_s03_recurring_obligation_test.sh
printf 'M06 S04 RENEWAL WORKFLOW PASS head=%s tree=%s / INTERNAL WORKFLOW ONLY / NO EXTERNAL ACTION OR LEGAL MUTATION\n' "$(git rev-parse HEAD)" "$(git rev-parse HEAD^{tree})"
printf 'Full same-head PR matrix and separate owner merge approval remain mandatory.\n'
