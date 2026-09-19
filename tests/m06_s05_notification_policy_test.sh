#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m06-s05-scope.mjs
source=packages/application/src/lifecycle/notification-policy.ts
runtime=packages/application/test/m06-s05-notification-policy.test.ts
governance=tests/m06_s05_scope_test.mjs
if grep -En 'Date\.now\(|new Date\(|Math\.random\(|randomUUID\(|setTimeout\(|setInterval\(|fetch\(|from .node:|from .*(react|openai|anthropic|axios|nodemailer|twilio)|sendMail\(|sendSms\(|pushNotification\(' "$source"; then
  echo 'M06 S05 ambient-time/provider/scheduler boundary violated' >&2; exit 1
fi
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [path,prefix,count] of [['packages/application/test/m06-s05-notification-policy.test.ts','M06S05',96],['tests/m06_s05_scope_test.mjs','M06S05G',16]]){
  const value=readFileSync(path,'utf8'),expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(2,'0')}`);
  assert.deepEqual([...value.matchAll(new RegExp(`^test\\('(${prefix}-\\d{2})\\b`,'gm'))].map(m=>m[1]),expected);
  assert.equal([...value.matchAll(/^test\(/gm)].length,count);
  assert(!/\btest\.(skip|todo|only)\s*\(/.test(value));
}
assert.equal([...readFileSync('packages/application/test/m06-s05-types.compile.ts','utf8').matchAll(/@ts-expect-error/g)].length,18);
assert(readFileSync('docs/planning/M06_S05_IMPLEMENTATION_CONTRACT.md','utf8').includes('notification intent != notification delivery; escalation != legal urgency; reminder != authorization; deduplication != evidence deletion; notification state != credential state'));
NODE
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json
log=$(mktemp);govlog=$(mktemp)
trap 'rm -f "$log" "$govlog"' EXIT
node --test --test-reporter=tap "$runtime" | tee "$log"
node --test --test-reporter=tap "$governance" | tee "$govlog"
node --input-type=module - "$log" "$govlog" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [path,prefix,count] of [[process.argv[2],'M06S05',96],[process.argv[3],'M06S05G',16]]){
  const value=readFileSync(path,'utf8'),expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(2,'0')}`);
  assert.deepEqual([...value.matchAll(new RegExp(`^ok \\d+ - (${prefix}-\\d{2})\\b`,'gm'))].map(m=>m[1]),expected);
  for(const [key,n] of Object.entries({tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0}))assert.deepEqual([...value.matchAll(new RegExp(`^# ${key} (\\d+)$`,'gm'))].map(m=>Number(m[1])),[n]);
}
NODE
printf 'M06 S05: 96/96 runtime,16/16 scope and18 readonly assertions PASS.\n'
printf 'Run unchanged S04/S03/S02/S01 PRODUCT runtime on CURRENT checkout; closed slice governance already ran at historical merge refs.\n'
p04=$(mktemp); p03=$(mktemp); p02=$(mktemp); p01=$(mktemp)
trap 'rm -f "$log" "$govlog" "$p04" "$p03" "$p02" "$p01"' EXIT
node --test --test-reporter=tap packages/application/test/m06-s04-renewal-case.test.ts | tee "$p04"
node --test --test-reporter=tap packages/application/test/m06-s03-recurring-obligation.test.ts | tee "$p03"
node --test --test-reporter=tap packages/application/test/m06-s02-expiry-renewal-policy.test.ts | tee "$p02"
node --test --test-reporter=tap packages/application/test/m06-s01-lifecycle-timeline.test.ts | tee "$p01"
node --input-type=module - "$p04" "$p03" "$p02" "$p01" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [path,prefix,count] of [[process.argv[2],'M06S04',88],[process.argv[3],'M06S03',80],[process.argv[4],'M06S02',72],[process.argv[5],'M06S01',64]]){
  const value=readFileSync(path,'utf8'),expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(2,'0')}`);
  assert.deepEqual([...value.matchAll(new RegExp(`^ok \\d+ - (${prefix}-\\d{2})\\b`,'gm'))].map(m=>m[1]),expected);
  for(const [key,n] of Object.entries({tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0}))assert.deepEqual([...value.matchAll(new RegExp(`^# ${key} (\\d+)#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m06-s05-scope.mjs
source=packages/application/src/lifecycle/notification-policy.ts
runtime=packages/application/test/m06-s05-notification-policy.test.ts
governance=tests/m06_s05_scope_test.mjs
if grep -En 'Date\.now\(|new Date\(|Math\.random\(|randomUUID\(|setTimeout\(|setInterval\(|fetch\(|from .node:|from .*(react|openai|anthropic|axios|nodemailer|twilio)|sendMail\(|sendSms\(|pushNotification\(' "$source"; then
  echo 'M06 S05 ambient-time/provider/scheduler boundary violated' >&2; exit 1
fi
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [path,prefix,count] of [['packages/application/test/m06-s05-notification-policy.test.ts','M06S05',96],['tests/m06_s05_scope_test.mjs','M06S05G',16]]){
  const value=readFileSync(path,'utf8'),expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(2,'0')}`);
  assert.deepEqual([...value.matchAll(new RegExp(`^test\\('(${prefix}-\\d{2})\\b`,'gm'))].map(m=>m[1]),expected);
  assert.equal([...value.matchAll(/^test\(/gm)].length,count);
  assert(!/\btest\.(skip|todo|only)\s*\(/.test(value));
}
assert.equal([...readFileSync('packages/application/test/m06-s05-types.compile.ts','utf8').matchAll(/@ts-expect-error/g)].length,18);
assert(readFileSync('docs/planning/M06_S05_IMPLEMENTATION_CONTRACT.md','utf8').includes('notification intent != notification delivery; escalation != legal urgency; reminder != authorization; deduplication != evidence deletion; notification state != credential state'));
NODE
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json
log=$(mktemp);govlog=$(mktemp)
trap 'rm -f "$log" "$govlog"' EXIT
node --test --test-reporter=tap "$runtime" | tee "$log"
node --test --test-reporter=tap "$governance" | tee "$govlog"
node --input-type=module - "$log" "$govlog" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
for(const [path,prefix,count] of [[process.argv[2],'M06S05',96],[process.argv[3],'M06S05G',16]]){
  const value=readFileSync(path,'utf8'),expected=Array.from({length:count},(_,i)=>`${prefix}-${String(i+1).padStart(2,'0')}`);
  assert.deepEqual([...value.matchAll(new RegExp(`^ok \\d+ - (${prefix}-\\d{2})\\b`,'gm'))].map(m=>m[1]),expected);
  for(const [key,n] of Object.entries({tests:count,pass:count,fail:0,cancelled:0,skipped:0,todo:0}))assert.deepEqual([...value.matchAll(new RegExp(`^# ${key} (\\d+)$`,'gm'))].map(m=>Number(m[1])),[n]);
}
NODE
,'gm'))].map(m=>Number(m[1])),[n]);
}
NODE
printf 'Current-head product regression PASS: S04 88/88, S03 80/80, S02 72/72, S01 64/64.\n'
printf 'Run admission/preparation/M04/M05/architecture transitive gates on CURRENT checkout.\n'
bash tests/m06_admission_test.sh
node --test packages/application/test/m03-s05-timeline.test.ts
printf 'M06 S05 NOTIFICATION POLICY PASS head=%s tree=%s / INTENT ONLY / NO SCHEDULER PROVIDER DELIVERY OR CREDENTIAL MUTATION\n' "$(git rev-parse HEAD)" "$(git rev-parse HEAD^{tree})"
printf 'Full same-head PR matrix and separate owner merge approval remain mandatory.\n'
