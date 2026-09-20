#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m07-admission.mjs
log=$(mktemp)
trap 'rm -f "$log"' EXIT
node --test --test-reporter=tap tests/m07_admission_test.mjs | tee "$log"
for expected in '# tests 36' '# pass 36' '# fail 0' '# cancelled 0' '# skipped 0' '# todo 0'; do grep -Fxq "$expected" "$log"; done
node --input-type=module - "$log" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateIndex} from './scripts/ci/m07-admission.mjs';
const expected=Array.from({length:36},(_,i)=>`M07ADM-${String(i+1).padStart(2,'0')}`);
const tap=readFileSync(process.argv[2],'utf8');
assert.deepEqual([...tap.matchAll(/^ok \d+ - (M07ADM-\d{2})\b/gm)].map(m=>m[1]),expected);
const source=readFileSync('tests/m07_admission_test.mjs','utf8');
assert.equal([...source.matchAll(/^test\(/gm)].length,36);
assert(!/\btest\.(only|skip|todo)\s*\(/.test(source));
validateIndex(readFileSync('docs/planning/M07_ADMISSION_TEST_INDEX.md','utf8'));
NODE
printf 'M07 FORMAL ADMISSION: 36/36 governance scenarios PASS; run preparation and predecessor regressions.\n'
bash tests/m07_admission_preparation_test.sh
bash tests/m03_admission_test.sh
bash tests/m04_admission_test.sh
bash tests/m05_admission_test.sh
bash tests/m03_m08_execution_readiness_test.sh
bash tests/architecture_boundaries_test.sh
printf 'M07 FORMAL ADMISSION PASS / S01 ONLY / MERGE + POST-MERGE ACTIVATION REQUIRED / LEGAL AUTHORITY FALSE / NO PRODUCT CREDIT\n'
printf 'Full current-head workflow matrix and separate owner merge approval remain mandatory.\n'
