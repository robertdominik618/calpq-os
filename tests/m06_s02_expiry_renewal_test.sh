#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m06-s02-scope.mjs
source=packages/application/src/lifecycle/expiry-renewal-policy.ts
runtime=packages/application/test/m06-s02-expiry-renewal-policy.test.ts
governance=tests/m06_s02_scope_test.mjs
if grep -En 'Date\.now\(|new Date\(|Math\.random\(|randomUUID\(|setTimeout\(|fetch\(|from .node:|from .*(react|openai|anthropic|axios)|AuthorizationGrant|EligibilityAssessment' "$source"; then
  echo 'M06 S02 ambient-time, provider or legal-authority boundary violated' >&2; exit 1
fi
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const scenarios=Array.from({length:72},(_,i)=>`M06S02-${String(i+1).padStart(2,'0')}`);
const runtime=readFileSync('packages/application/test/m06-s02-expiry-renewal-policy.test.ts','utf8');
const index=readFileSync('docs/planning/M06_S02_TEST_INDEX.md','utf8');
assert.deepEqual([...runtime.matchAll(/^test\('(M06S02-\d{2})\b/gm)].map(m=>m[1]),scenarios);
assert.deepEqual([...index.matchAll(/^\| (M06S02-\d{2}) \|/gm)].map(m=>m[1]),scenarios);
assert.equal([...runtime.matchAll(/^test\(/gm)].length,72);
const governance=readFileSync('tests/m06_s02_scope_test.mjs','utf8');
assert.deepEqual([...governance.matchAll(/^test\('(M06S02G-\d{2})\b/gm)].map(m=>m[1]),Array.from({length:16},(_,i)=>`M06S02G-${String(i+1).padStart(2,'0')}`));
assert.equal([...governance.matchAll(/^test\(/gm)].length,16);
for(const file of [runtime,governance])assert(!/\btest\.(only|skip|todo)\s*\(/.test(file),'No omitted or exclusive scenarios');
assert.equal([...readFileSync('packages/application/test/m06-s02-types.compile.ts','utf8').matchAll(/@ts-expect-error/g)].length,14);
const activation=JSON.parse(readFileSync('docs/planning/m06-s02-execution.json','utf8'));
assert.equal(activation.owner_approval_reference,'https://github.com/robertdominik618/calpq-os/pull/140#issuecomment-5730058055');
assert.equal(activation.post_merge_evidence_reference,'https://github.com/robertdominik618/calpq-os/pull/140#issuecomment-5730157642');
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
for(const [path,prefix,count] of [[process.argv[2],'M06S02',72],[process.argv[3],'M06S02G',16]]){
  const log=readFileSync(path,'utf8');
  const expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(2,'0')}`);
  assert.deepEqual([...log.matchAll(new RegExp(`^ok \\d+ - (${prefix}-\\d{2})\\b`,'gm'))].map(m=>m[1]),expected);
  for(const [key,n] of Object.entries({tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0}))assert.deepEqual([...log.matchAll(new RegExp(`^# ${key} (\\d+)$`,'gm'))].map(m=>Number(m[1])),[n]);
}
NODE
printf 'M06 S02: 72/72 runtime, 16/16 governance and 14 readonly assertions PASS.\n'
printf 'Run unchanged S01/admission/preparation/M04/M05/FV09/FV10/timeline regressions on this checkout.\n'
bash tests/m06_s01_lifecycle_timeline_test.sh
printf 'M06 S02 EXPIRY RENEWAL PASS head=%s tree=%s / CALENDAR PROJECTION / NO LEGAL MUTATION\n' "$(git rev-parse HEAD)" "$(git rev-parse HEAD^{tree})"
printf 'Full same-head PR workflow matrix and separate owner merge approval remain mandatory.\n'
