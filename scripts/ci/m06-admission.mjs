import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const PREP = '4a3c97e2314b2c8ccdf508123bb9ce5a04b499f0';
export const PREP_HEAD = '2dea0cb024ad557029b98657fc9c51123de4b160';
export const PREP_TREE = 'd46508e55f3b7e787ccc21c07f43505ebce8f022';
export const M05 = '2deb81901339c2e7631d096939898fa5dd562e53';
export const M04 = 'd2f04aa2bcc68edf1d20deb345faa8a8c239e23d';
export const CONTRACT = '0e67388013ad8016141eb059422a515967df5359';
export const DECISION = 'docs/planning/m06-admission-decision.json';
export const ACTIVATION = 'docs/planning/m06-s01-activation.json';
export const ENTRY = 'M06_SLICE_01_CREDENTIAL_LIFECYCLE_TIMELINE_PROJECTION';
export const ADDED = Object.freeze(['docs/planning/M06_ADMISSION_RECORD.md', DECISION,
  'docs/planning/M06_S01_SCOPE_CONTRACT.md', 'docs/planning/M06_ADMISSION_TEST_INDEX.md',
  'scripts/ci/m06-admission.mjs', 'tests/m06_admission_test.mjs',
  'tests/m06_admission_test.sh', '.github/workflows/m06-admission.yml']);
export const MODIFIED = Object.freeze(['docs/planning/M06_EXECUTION_PACKAGE.md',
  'scripts/ci/m06-admission-preparation.mjs', 'tests/m06_admission_preparation_test.sh',
  'tests/m03_admission_test.sh', 'tests/m04_admission_test.sh',
  'tests/m05_admission_test.sh', 'tests/m03_m08_execution_readiness_test.sh']);
export const S01_ADDED = Object.freeze([ACTIVATION,
  'docs/planning/M06_S01_IMPLEMENTATION_CONTRACT.md', 'docs/planning/M06_S01_TEST_INDEX.md',
  'docs/planning/M06_S01_EXIT_EVIDENCE.md',
  'packages/application/src/lifecycle/credential-lifecycle-timeline.ts',
  'packages/application/src/lifecycle/index.ts',
  'packages/application/test/m06-s01-lifecycle-timeline.test.ts',
  'packages/application/test/m06-s01-types.compile.ts',
  'tests/m06_s01_lifecycle_timeline_test.sh', '.github/workflows/m06-s01-lifecycle-timeline.yml']);
export const S01_MODIFIED = Object.freeze(['packages/application/package.json', 'packages/application/tsconfig.json']);
export function expectedDecision() {
  return {schema_version:1, decision_id:'CALPQ-M06-ADM-DEC-0001', admission_record_id:'CALPQ-M06-ADM-0001',
    admission_transition_id:'CALPQ-M06-ADMIT-0001', milestone:'M06', candidate:'Lifecycle, Renewal & Continuous Compliance',
    issue_number:36, transition_issue_number:132, state:'ADMITTED_FOR_IMPLEMENTATION', approved_by:'robertdominik618',
    approved_at:null, approval_time_precision:'NOT_INDEPENDENTLY_CAPTURED',
    approval_text:'SCHVALUJI MERGE PR #131 A FORMÁLNÍ ADMISSION M06 PRO SLICE 01', preparation_pr:131,
    preparation_reviewed_head:PREP_HEAD, preparation_reviewed_merge:PREP, preparation_tree:PREP_TREE,
    m04_reviewed_merge:M04, m05_accepted_merge:M05, m05_acceptance_comment:5726064446, admitted_revision:PREP,
    authorized_execution_entry:ENTRY, authorized_slices:['S01'],
    admission_effective_condition:'ADMISSION_PR_MERGED_AND_POST_MERGE_VERIFIED',
    scope_contract:'docs/planning/M06_S01_SCOPE_CONTRACT.md', blocking_reviews:[],
    production_release_authorized:false, later_slices_authorized:false,
    m06_completed_slices:0, v1_completed_plan_units:60, v1_total_plan_units:130};
}
export function validateDecision(value) { assert.deepEqual(value, expectedDecision(), 'Invalid or expanded M06 admission decision'); }
function once(text, from, to) {
  assert.equal(text.split(from).length, 2, 'Missing or ambiguous historical patch marker');
  return text.replace(from, to);
}
const successor = `if [[ -f docs/planning/m06-admission-decision.json ]]; then\n  node scripts/ci/m06-admission.mjs\nelse\n  grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M06_EXECUTION_PACKAGE.md \\\n    || fail 'M06 requires a valid separate admission decision'\nfi\n\n`;
export function adaptFile(path, original) {
  if (['tests/m03_admission_test.sh','tests/m04_admission_test.sh','tests/m05_admission_test.sh'].includes(path)) {
    let result = once(original, 'for m in 06 07 08; do', successor + 'for m in 07 08; do');
    if (path !== 'tests/m05_admission_test.sh') result = once(result, 'docs/planning/M0{6,7,8}_EXECUTION_PACKAGE.md', 'docs/planning/M0{7,8}_EXECUTION_PACKAGE.md');
    return once(result, '/ M06-M08 BLOCKED', '/ M06 SEPARATELY VALIDATED / M07-M08 BLOCKED');
  }
  if (path === 'tests/m03_m08_execution_readiness_test.sh') {
    let result = once(original, 'for f in docs/planning/M0{6,7,8}_EXECUTION_PACKAGE.md; do', successor + 'for f in docs/planning/M0{7,8}_EXECUTION_PACKAGE.md; do');
    return once(result, '/ M06-M08 BLOCKED', '/ M06 SEPARATELY VALIDATED / M07-M08 BLOCKED');
  }
  if (path === 'scripts/ci/m06-admission-preparation.mjs') {
    let result = once(original, "import { readFileSync } from 'node:fs';", "import { existsSync, readFileSync } from 'node:fs';");
    return once(result, "  process.chdir(fileURLToPath(new URL('../../', import.meta.url)));", "  process.chdir(fileURLToPath(new URL('../../', import.meta.url)));\n  if (existsSync('docs/planning/m06-admission-decision.json')) {\n    execFileSync(process.execPath, [resolve('scripts/ci/m06-admission.mjs')], {stdio:'inherit'});\n    return git('rev-parse','HEAD').trim();\n  }");
  }
  if (path === 'tests/m06_admission_preparation_test.sh') {
    let result = once(original, 'validator tests PASS; product implementation remains BLOCKED.', 'historical preparation-validator tests PASS; successor authorization is checked separately.');
    return once(result, 'M06 ADMISSION PREPARATION PASS / NOT FORMAL ADMISSION / NO PRODUCT CODE', 'M06 PREPARATION REGRESSION PASS / SUCCESSOR CHECKED SEPARATELY');
  }
  if (path === 'docs/planning/M06_EXECUTION_PACKAGE.md') return once(original,
    'Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`',
    'Status: `ADMITTED / S01 IMPLEMENTATION AUTHORIZED AFTER MERGE + POST-MERGE GREEN`\n\nAdmission: `M06_ADMISSION_RECORD.md` and `m06-admission-decision.json`. Only Slice 01 is authorized, subject to verified admission activation; Slice 02–10 remain separately governed.');
  throw new TypeError('No approved patch for ' + path);
}
export function validatePatch(path, original, actual) { assert.equal(actual, adaptFile(path, original), 'Unapproved predecessor or package change: ' + path); }
export function validateScope(entries, stage = 'ADMISSION') {
  assert(['ADMISSION','S01'].includes(stage), 'Unknown execution stage');
  assert(Array.isArray(entries), 'Scope must be an array');
  const added = stage === 'ADMISSION' ? ADDED : S01_ADDED;
  const modified = stage === 'ADMISSION' ? MODIFIED : S01_MODIFIED;
  assert.equal(new Set(entries.map(e => e.path)).size, entries.length, 'Duplicate changed path');
  for (const e of entries) {
    assert.equal(e.mode, '100644', 'Only regular non-executable files are permitted');
    assert(added.includes(e.path) || modified.includes(e.path), 'Unauthorized path: ' + e.path);
    assert.equal(e.status, added.includes(e.path) ? 'A' : 'M', 'Deletion/rename or historical mutation prohibited');
  }
  if (stage === 'ADMISSION') assert.deepEqual(entries.map(e=>e.path).sort(), [...added,...modified].sort(), 'Admission bundle incomplete');
}
export function validateActivation(value) {
  assert(value && typeof value === 'object' && !Array.isArray(value), 'Activation must be an object');
  const keys = ['schema_version','milestone','slice','state','decision_id','authorized_execution_entry','admission_pr',
    'admission_head','admission_merge','admission_tree','owner_merge_approval_reference','post_merge_evidence_reference','production_release_authorized'];
  assert.deepEqual(Object.keys(value).sort(), keys.sort(), 'Unexpected/missing activation fields');
  for (const [key, expected] of Object.entries({schema_version:1,milestone:'M06',slice:'S01',state:'ACTIVE_AFTER_VERIFIED_ADMISSION',
    decision_id:'CALPQ-M06-ADM-DEC-0001',authorized_execution_entry:ENTRY,production_release_authorized:false})) assert.deepEqual(value[key], expected);
  assert(Number.isSafeInteger(value.admission_pr) && value.admission_pr > 131, 'Actual new admission PR required');
  for (const name of ['admission_head','admission_merge','admission_tree']) assert(typeof value[name] === 'string' && /^[0-9a-f]{40}$/.test(value[name]), 'Invalid activation SHA');
  assert.equal(new Set([value.admission_head,value.admission_merge,value.admission_tree]).size, 3, 'Distinct commit/tree identities required');
  for (const sha of [value.admission_head,value.admission_merge]) assert(![PREP,PREP_HEAD,M05,M04].includes(sha), 'Preparation is not formal admission');
  for (const key of ['owner_merge_approval_reference','post_merge_evidence_reference']) {
    assert(typeof value[key] === 'string');
    const prefix = `https://github.com/robertdominik618/calpq-os/pull/${value.admission_pr}#issuecomment-`;
    assert(value[key].startsWith(prefix) && /^[1-9][0-9]*$/.test(value[key].slice(prefix.length)), 'Evidence must identify this admission PR discussion');
  }
}
export function modeFor(value) { if (value === undefined) return 'ADMISSION'; validateActivation(value); return 'S01'; }
export function validateConfig(path, original, actual) {
  const expected = structuredClone(original);
  if (path === S01_MODIFIED[0]) {
    assert(expected.exports && expected.scripts);
    assert(!Object.hasOwn(expected.exports,'./lifecycle') && !Object.hasOwn(expected.scripts,'test:m06s01'));
    expected.exports['./lifecycle'] = './src/lifecycle/index.ts';
    expected.scripts['test:m06s01'] = 'node --test test/m06-s01-lifecycle-timeline.test.ts';
  } else if (path === S01_MODIFIED[1]) {
    assert(Array.isArray(expected.include) && !expected.include.includes('test/m06-s01-types.compile.ts'));
    expected.include.push('test/m06-s01-types.compile.ts');
  } else throw new TypeError('Unknown S01 config');
  assert.deepEqual(actual, expected, 'S01 cannot change predecessor configuration');
}
export function validateIndex(text) {
  const ids = [...text.matchAll(/^\| (M06ADM-\d{2}) \|/gm)].map(m=>m[1]);
  assert.deepEqual(ids, Array.from({length:32},(_,i)=>`M06ADM-${String(i+1).padStart(2,'0')}`));
}
function git(...args) { return execFileSync('git', args, {encoding:'utf8',maxBuffer:8*1024*1024}); }
function at(ref,path) { return git('show',`${ref}:${path}`); }
function ancestor(a,b) { git('merge-base','--is-ancestor',a,b); }
function changes(base,tip) {
  const raw = git('diff','--name-status','--no-renames',`${base}...${tip}`).trim();
  return raw ? raw.split('\n').map(line=>{
    const [status,path,...extra] = line.split('\t'); assert.equal(extra.length,0,'Unsupported path');
    return {status,path,mode:git('ls-tree',tip,'--',path).trim().split(' ')[0]};
  }) : [];
}
function validateAdmissionTip(tip) {
  ancestor(PREP,tip); ancestor(CONTRACT,tip);
  validateDecision(JSON.parse(at(tip,DECISION)));
  validateScope(changes(PREP,tip));
  for (const path of MODIFIED) validatePatch(path,at(PREP,path),at(tip,path));
  for (const path of ADDED) assert(at(tip,path).trim(), 'Empty admission artifact');
  validateIndex(at(tip,'docs/planning/M06_ADMISSION_TEST_INDEX.md'));
  const first = git('rev-list','--reverse',`${PREP}..${tip}`,'--','scripts/ci/m06-admission.mjs','tests/m06_admission_test.mjs').trim().split('\n')[0];
  assert(first); ancestor(CONTRACT,`${first}^`);
  const record = at(tip,'docs/planning/M06_ADMISSION_RECORD.md');
  for (const value of [PREP,PREP_TREE,M05,expectedDecision().approval_text,ENTRY]) assert(record.includes(value),'Admission record provenance missing');
  assert(record.includes('EXECUTION EFFECTIVE ONLY AFTER APPROVED ADMISSION MERGE + POST-MERGE VERIFICATION'));
}
export function main() {
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head = git('rev-parse','HEAD').trim();
  assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Tracked checkout must be clean');
  for (const ref of [M04,M05,PREP,PREP_HEAD,CONTRACT]) ancestor(ref,head);
  assert.equal(git('rev-parse',`${PREP}^{tree}`).trim(),PREP_TREE);
  assert.equal(git('rev-parse',`${PREP_HEAD}^{tree}`).trim(),PREP_TREE);
  assert.equal(git('show','-s','--format=%P',PREP).trim(),`${M05} ${PREP_HEAD}`);
  validateDecision(JSON.parse(readFileSync(DECISION,'utf8')));
  const activation = existsSync(ACTIVATION) ? JSON.parse(readFileSync(ACTIVATION,'utf8')) : undefined;
  const mode = modeFor(activation);
  const tip = mode === 'S01' ? activation.admission_merge : head;
  validateAdmissionTip(tip);
  if (mode === 'S01') {
    ancestor(activation.admission_merge,head); ancestor(activation.admission_head,activation.admission_merge);
    const parents = git('show','-s','--format=%P',activation.admission_merge).trim().split(' ');
    assert.equal(parents.length,2); assert.equal(parents[1],activation.admission_head);
    ancestor(PREP,parents[0]);
    for (const ref of [activation.admission_merge,activation.admission_head]) assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),activation.admission_tree);
    validateAdmissionTip(activation.admission_head);
    const delta = changes(tip,head); validateScope(delta,'S01');
    assert(delta.some(e=>e.path===ACTIVATION), 'Activation must be introduced after admission');
    assert.equal(git('rev-list',`${tip}..${head}`,'--',ACTIVATION).trim().split('\n').length,1,'Activation is immutable');
    for (const path of S01_MODIFIED) if (delta.some(e=>e.path===path)) validateConfig(path,JSON.parse(at(tip,path)),JSON.parse(at(head,path)));
    const sources = S01_ADDED.filter(path=>path.startsWith('packages/application/src/'));
    const first = git('rev-list','--reverse',`${tip}..${head}`,'--',...sources).trim().split('\n')[0];
    if (first) {
      assert.equal(at(`${first}^`,ACTIVATION),at(head,ACTIVATION),'Source requires prior immutable activation');
      for (const path of ['docs/planning/M06_S01_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S01_TEST_INDEX.md']) assert(at(`${first}^`,path).trim(),'Source requires prior contract/index');
    }
  }
  for (const m of ['07','08']) assert(at(head,`docs/planning/M${m}_EXECUTION_PACKAGE.md`).includes('IMPLEMENTATION BLOCKED'));
  assert.equal(git('rev-parse','HEAD').trim(),head,'Checkout moved');
  console.log(`M06 GOVERNANCE PASS head=${head} mode=${mode} entry=${ENTRY} product_delivery_credit=0 release=false`);
  return mode;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (existsSync('docs/planning/m06-s02-execution.json')) {
    execFileSync(process.execPath, [resolve('scripts/ci/m06-s02-scope.mjs')], {stdio:'inherit'});
  } else main();
}
