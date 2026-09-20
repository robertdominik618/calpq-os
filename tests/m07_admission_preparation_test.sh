#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m07-admission-preparation.mjs
log=$(mktemp)
trap 'rm -f "$log"' EXIT
node --test --test-reporter=tap tests/m07_admission_preparation_test.mjs | tee "$log"
for expected in '# tests 24' '# pass 24' '# fail 0' '# cancelled 0' '# skipped 0' '# todo 0'; do grep -Fxq "$expected" "$log"; done
node --input-type=module - "$log" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const tap=readFileSync(process.argv[2],'utf8');
const expected=Array.from({length:24},(_,i)=>`M07PREPTEST-${String(i+1).padStart(2,'0')}`);
assert.deepEqual([...tap.matchAll(/^ok \d+ - (M07PREPTEST-\d{2})\b/gm)].map(m=>m[1]),expected);
NODE
printf 'M07 PREPARATION: 24/24 historical preparation-validator tests PASS; successor admission is checked separately.\n'
printf 'Run unchanged M04 final integration evidence on current preparation checkout.\n'
bash tests/m04_s10_integration_evidence_test.sh
printf 'Run M06 final integration evidence with immutable closed-scope proof and current-checkout regressions.\n'
bash tests/m06_s10_integration_evidence_test.sh
printf 'M07 PREPARATION REGRESSION PASS / SOURCE GOVERNANCE + M04 + M06 PREREQUISITES / SUCCESSOR CHECKED SEPARATELY / FULL PR MATRIX REQUIRED\n'
