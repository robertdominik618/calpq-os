#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
base=0245ba339e019d2f297cb399679bbdee25e53483
contract=daed83cfd66a2d9657ec17998f66ea78be408adc
source=packages/application/src/lifecycle/credential-lifecycle-timeline.ts
runtime=packages/application/test/m06-s01-lifecycle-timeline.test.ts
compile=packages/application/test/m06-s01-types.compile.ts
index=docs/planning/M06_S01_TEST_INDEX.md
node scripts/ci/m06-admission.mjs
git merge-base --is-ancestor "$base" HEAD
git merge-base --is-ancestor "$contract" HEAD
first_source=$(git rev-list --reverse "$base"..HEAD -- packages/application/src/lifecycle | sed -n '1p')
[[ -n "$first_source" ]]
git merge-base --is-ancestor "$contract" "${first_source}^"
for file in "$source" "$runtime" "$compile" "$index" docs/planning/M06_S01_IMPLEMENTATION_CONTRACT.md docs/planning/M06_S01_EXIT_EVIDENCE.md; do [[ -s "$file" ]]; done
scope_tip=HEAD
if [[ -f docs/planning/m07-s01-activation.json ]]; then
  node scripts/ci/m07-admission.mjs
  scope_tip=6fe20885770ddaea879c666304f90c407b5a34eb
  git merge-base --is-ancestor "$scope_tip" HEAD
fi
if git diff --name-only "${base}...${scope_tip}" -- packages/core/src packages/adapters | grep -q .; then
  echo 'M06 S01 cannot change Core or provider adapters' >&2; exit 1
fi
if grep -En 'Date\.now\(|new Date\(|Math\.random\(|randomUUID\(|setTimeout\(|fetch\(|from .node:|from .*(react|openai|anthropic|axios)|AuthorizationGrant|EligibilityAssessment' "$source"; then
  echo 'M06 S01 ambient time, I/O or authority boundary violated' >&2; exit 1
fi
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const expected=Array.from({length:64},(_,i)=>`M06S01-${String(i+1).padStart(2,'0')}`);
const runtime=readFileSync('packages/application/test/m06-s01-lifecycle-timeline.test.ts','utf8');
const index=readFileSync('docs/planning/M06_S01_TEST_INDEX.md','utf8');
assert.deepEqual([...runtime.matchAll(/^test\('(M06S01-\d{2})\b/gm)].map(m=>m[1]),expected);
assert.deepEqual([...index.matchAll(/^\| (M06S01-\d{2}) \|/gm)].map(m=>m[1]),expected);
assert.equal([...runtime.matchAll(/^test\(/gm)].length,64);
assert(!/\btest\.(only|skip|todo)\s*\(/.test(runtime));
const activation=JSON.parse(readFileSync('docs/planning/m06-s01-activation.json','utf8'));
assert.equal(activation.admission_pr,133);
assert.equal(activation.admission_merge,'0245ba339e019d2f297cb399679bbdee25e53483');
assert.equal(activation.admission_head,'aa266f897f0301ce01f047c44f197c8fd1493c1b');
assert.equal(activation.admission_tree,'f0b52b4d0531ba89d9572d45bb1a0a180673ffd4');
assert.equal(activation.owner_merge_approval_reference,'https://github.com/robertdominik618/calpq-os/pull/133#issuecomment-5729438587');
assert.equal(activation.post_merge_evidence_reference,'https://github.com/robertdominik618/calpq-os/pull/133#issuecomment-5729475571');
assert.equal(activation.production_release_authorized,false);
assert.equal([...readFileSync('packages/application/test/m06-s01-types.compile.ts','utf8').matchAll(/@ts-expect-error/g)].length,14);
NODE
npx --yes --package=typescript@7.0.2 -- tsc -p packages/application/tsconfig.json
log=$(mktemp)
trap 'rm -f "$log"' EXIT
node --test --test-reporter=tap "$runtime" | tee "$log"
for summary in '# tests 64' '# pass 64' '# fail 0' '# cancelled 0' '# skipped 0' '# todo 0'; do grep -Fxq "$summary" "$log"; done
node --input-type=module - "$log" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const log=readFileSync(process.argv[2],'utf8');
const expected=Array.from({length:64},(_,i)=>`M06S01-${String(i+1).padStart(2,'0')}`);
assert.deepEqual([...log.matchAll(/^ok \d+ - (M06S01-\d{2})\b/gm)].map(m=>m[1]),expected);
NODE
printf 'M06 S01: 64/64 runtime scenarios and 14 readonly compile assertions PASS.\n'
printf 'Run unchanged admission, preparation, M04/M05 and architecture regressions on this checkout.\n'
bash tests/m06_admission_test.sh
node --test packages/application/test/m03-s05-timeline.test.ts
printf 'M06 S01 LIFECYCLE TIMELINE PASS / READ MODEL ONLY / NO RENEWAL OR AUTHORITY MUTATION\n'
printf 'The full same-head PR workflow matrix and separate merge approval remain required.\n'
