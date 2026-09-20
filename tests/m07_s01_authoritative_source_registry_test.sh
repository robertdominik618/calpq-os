#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]

base=3882c146634869a817509f4bc8441738185ce257
source=packages/core/src/regulatory/authoritative-source-registry.ts
barrel=packages/core/src/regulatory/index.ts
runtime=packages/core/test/m07-s01-authoritative-source-registry.test.ts
compile=packages/core/test/m07-s01-types.compile.ts
index=docs/planning/M07_S01_TEST_INDEX.md
activation=docs/planning/m07-s01-activation.json
contract=docs/planning/M07_S01_IMPLEMENTATION_CONTRACT.md

git merge-base --is-ancestor "$base" HEAD
for file in "$source" "$barrel" "$runtime" "$compile" "$index" "$activation" "$contract"; do
  [[ -s "$file" ]] || { echo "missing S01 artifact: $file" >&2; exit 1; }
done

first_source="$(git rev-list --reverse "$base"..HEAD -- packages/core/src/regulatory | sed -n '1p')"
[[ -n "$first_source" ]]
git show "\${first_source}^:$activation" >/dev/null
git show "\${first_source}^:$contract" >/dev/null
git show "\${first_source}^:$index" >/dev/null

node scripts/ci/m07-admission.mjs

if grep -En 'fetch\(|node:|axios|openai|anthropic|adapter|database|repository|Date\.now\(|new Date\(|Math\.random\(|randomUUID\(' "$source"; then
  echo 'M07 S01 Core I/O, provider, persistence, ambient time or randomness boundary violated' >&2
  exit 1
fi

node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const expected=Array.from({length:40},(_,i)=>'M07S01-'+String(i+1).padStart(2,'0'));
const runtime=readFileSync('packages/core/test/m07-s01-authoritative-source-registry.test.ts','utf8');
const index=readFileSync('docs/planning/M07_S01_TEST_INDEX.md','utf8');
assert.deepEqual([...runtime.matchAll(/^test\('(M07S01-\d{2})\b/gm)].map(m=>m[1]),expected);
assert.deepEqual([...index.matchAll(/^\| (M07S01-\d{2}) \|/gm)].map(m=>m[1]),expected);
assert.equal([...runtime.matchAll(/^test\(/gm)].length,40);
assert(!/\btest\.(only|skip|todo)\s*\(/.test(runtime));
assert.equal([...readFileSync('packages/core/test/m07-s01-types.compile.ts','utf8').matchAll(/@ts-expect-error/g)].length,6);

const activation=JSON.parse(readFileSync('docs/planning/m07-s01-activation.json','utf8'));
assert.equal(activation.schema_version,1);
assert.equal(activation.milestone,'M07');
assert.equal(activation.slice,'S01');
assert.equal(activation.state,'ACTIVE_AFTER_VERIFIED_ADMISSION');
assert.equal(activation.decision_id,'CALPQ-M07-ADM-DEC-0001');
assert.equal(activation.authorized_execution_entry,'M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY');
assert.equal(activation.admission_pr,163);
assert.equal(activation.admission_head,'35e461e6e6c095c7cfea5a7bb5fa922ac0488c4c');
assert.equal(activation.admission_merge,'3882c146634869a817509f4bc8441738185ce257');
assert.equal(activation.admission_tree,'49ce26c80bd30e6bd5b3e66897f13bb17ad7d883');
assert.equal(activation.owner_merge_approval_reference,'https://github.com/robertdominik618/calpq-os/pull/163#issuecomment-5748427897');
assert.equal(activation.post_merge_evidence_reference,'https://github.com/robertdominik618/calpq-os/pull/163#issuecomment-5748442304');
assert.equal(activation.production_release_authorized,false);
assert.equal(activation.legal_interpretation_authorized,false);
NODE

npx --yes --package=typescript@7.0.2 -- tsc -p packages/core/tsconfig.json

log="$(mktemp)"
trap 'rm -f "$log"' EXIT
node --test --test-reporter=tap "$runtime" | tee "$log"
for summary in '# tests 40' '# pass 40' '# fail 0' '# cancelled 0' '# skipped 0' '# todo 0'; do
  grep -Fxq "$summary" "$log"
done

node --input-type=module - "$log" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const log=readFileSync(process.argv[2],'utf8');
const expected=Array.from({length:40},(_,i)=>'M07S01-'+String(i+1).padStart(2,'0'));
assert.deepEqual([...log.matchAll(/^ok \d+ - (M07S01-\d{2})\b/gm)].map(m=>m[1]),expected);
NODE

bash tests/m07_admission_test.sh
bash tests/architecture_boundaries_test.sh

printf 'M07 S01 AUTHORITATIVE SOURCE REGISTRY PASS / 40 OF 40 SCENARIOS / 6 READONLY ASSERTIONS / CORE ONLY / LEGAL AUTHORITY FALSE / RELEASE FALSE\n'
printf 'Full exact-head PR workflow matrix and separate owner merge approval remain mandatory.\n'
