#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
[[ "$(bash scripts/governance_lifecycle_phase.sh)" == POST_FV00_IMPLEMENTATION ]]
node scripts/ci/m06-admission-preparation.mjs
log=$(mktemp)
trap 'rm -f "$log"' EXIT
node --test --test-reporter=tap tests/m06_admission_preparation_test.mjs | tee "$log"
for expected in '# tests 20' '# pass 20' '# fail 0' '# cancelled 0' '# skipped 0' '# todo 0'; do grep -Fxq "$expected" "$log"; done
node --input-type=module - "$log" <<'NODE'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const tap=readFileSync(process.argv[2],'utf8');
const expected=Array.from({length:20},(_,i)=>`M06PREPTEST-${String(i+1).padStart(2,'0')}`);
assert.deepEqual([...tap.matchAll(/^ok \d+ - (M06PREPTEST-\d{2})\b/gm)].map(m=>m[1]),expected);
NODE
printf 'M06 PREPARATION: 20/20 historical preparation-validator tests PASS; successor authorization is checked separately.\n'
printf 'Run unchanged M04 integration and all transitive dependencies on this checkout.\n'
bash tests/m04_s10_integration_evidence_test.sh
printf 'Run full M05 S10 evidence and 500-scenario runtime ledger on this checkout.\n'
bash tests/m05_s10_integration_test.sh
printf 'M06 PREPARATION REGRESSION PASS / SUCCESSOR CHECKED SEPARATELY / FULL PR MATRIX REMAINS REQUIRED\n'
