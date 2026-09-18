#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m06-admission.mjs
log=$(mktemp)
trap 'rm -f "$log"' EXIT
node --test --test-reporter=tap tests/m06_admission_test.mjs | tee "$log"
for expected in '# tests 32' '# pass 32' '# fail 0' '# cancelled 0' '# skipped 0' '# todo 0'; do grep -Fxq "$expected" "$log"; done
node --input-type=module - "$log" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateIndex} from './scripts/ci/m06-admission.mjs';
const expected=Array.from({length:32},(_,i)=>`M06ADM-${String(i+1).padStart(2,'0')}`);
const tap=readFileSync(process.argv[2],'utf8');
assert.deepEqual([...tap.matchAll(/^ok \d+ - (M06ADM-\d{2})\b/gm)].map(m=>m[1]),expected);
const source=readFileSync('tests/m06_admission_test.mjs','utf8');
assert.equal([...source.matchAll(/^test\(/gm)].length,32);
assert(!/\btest\.(only|skip|todo)\s*\(/.test(source));
validateIndex(readFileSync('docs/planning/M06_ADMISSION_TEST_INDEX.md','utf8'));
NODE
printf 'M06 ADMISSION: 32/32 governance scenarios PASS; run current-checkout predecessors.\n'
bash tests/m06_admission_preparation_test.sh
bash tests/m03_admission_test.sh
bash tests/m04_admission_test.sh
bash tests/m05_admission_test.sh
bash tests/m03_m08_execution_readiness_test.sh
bash tests/architecture_boundaries_test.sh
printf 'M06 ADMISSION PASS / S01 ONLY / ACTIVATION REQUIRES APPROVED MERGE AND POST-MERGE PROOF / NO PRODUCT IMPLEMENTATION CREDIT\n'
printf 'Full current-head workflow matrix and separate merge approval remain required.\n'
