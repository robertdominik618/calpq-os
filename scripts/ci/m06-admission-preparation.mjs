import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const M05 = '2deb81901339c2e7631d096939898fa5dd562e53';
export const M04 = 'd2f04aa2bcc68edf1d20deb345faa8a8c239e23d';
export const TREE = 'a09ae15bb40a77e49d35d75440dfca338d23fc38';
export const CONTRACT = 'd52a2e6910d76406aa01fd8b2655478c8a1f5d9c';
export const S10 = 'tests/m05_s10_integration_test.sh';
export const addedPaths = Object.freeze([
  'docs/planning/M05_TECHNICAL_ACCEPTANCE_RECORD.md',
  'docs/planning/M06_ADMISSION_PREPARATION.md',
  'docs/planning/M06_ADMISSION_READINESS_MATRIX.md',
  'docs/planning/M06_CI_TRANSITION_REVIEW.md',
  'docs/planning/m06-admission-preparation.json',
  'scripts/ci/m06-admission-preparation.mjs',
  'tests/m06_admission_preparation_test.mjs',
  'tests/m06_admission_preparation_test.sh',
  '.github/workflows/m06-admission-preparation.yml',
]);
export function expectedRecord() {
  return { schema_version: 1, record_id: 'CALPQ-M06-ADM-PREP-0001', milestone: 'M06', issue_number: 130, epic_number: 36,
    state: 'PREPARATION_ONLY',
    preparation_authorization: 'SCHVALUJI TECHNICKÉ PŘIJETÍ M05 V DOLOŽENÉM ROZSAHU A PŘÍPRAVU ADMISSION M06',
    m05_acceptance_record: 'CALPQ-M05-TECH-ACCEPT-0001', m05_acceptance_comment: 5726064446,
    m05_accepted_merge: M05, m05_accepted_tree: TREE, m04_reviewed_merge: M04,
    admission_approval: null, implementation_authorized: false, authorized_execution_entry: null,
    preparation_pr_merge_authorized: false, production_release_authorized: false,
    proposed_execution_entry: 'M06_SLICE_01_CREDENTIAL_LIFECYCLE_TIMELINE_PROJECTION',
    activation_condition: 'SEPARATE_OWNER_ADMISSION_AND_START_APPROVAL_PLUS_APPROVED_ADMISSION_MERGE_AND_POST_MERGE_VERIFICATION',
    m06_completed_slices: 0, m06_planned_slices: 10, v1_completed_plan_units: 60, v1_total_plan_units: 130,
    next_transition_requirements: ['M06-NEXT-01', 'M06-NEXT-02', 'M06-NEXT-03', 'M06-NEXT-04'] };
}
export function validateRecord(record) {
  assert.deepEqual(record, expectedRecord(), 'Preparation cannot authorize implementation, change anchors, omit gates or inflate progress');
}
export function validateChanges(entries) {
  assert(Array.isArray(entries), 'Changed paths must be an array');
  assert.equal(new Set(entries.map(e => e.path)).size, entries.length, 'Duplicate changed path');
  for (const entry of entries) {
    assert.equal(entry.mode, '100644', 'Preparation requires regular non-executable files');
    if (entry.path === S10) assert.equal(entry.status, 'M', 'Only an in-place S10 scope adaptation is allowed');
    else { assert(addedPaths.includes(entry.path), `Unauthorized changed path: ${entry.path}`); assert.equal(entry.status, 'A', 'Preparation files must be new additions relative to M05'); }
  }
}
export function adaptS10(original) {
  const needle = 'while IFS= read -r path; do';
  const oldDiff = 'done < <(git diff --name-only "$base"...HEAD)';
  assert.equal(original.split(needle).length, 2, 'Expected one original S10 scope loop');
  assert.equal(original.split(oldDiff).length, 2, 'Expected one original S10 scope range');
  const addition = `scope_tip=HEAD\nif git merge-base --is-ancestor ${M05} HEAD; then\n  node scripts/ci/m06-admission-preparation.mjs\n  scope_tip=${M05}\nfi\n`;
  return original.replace(needle, addition + needle).replace(oldDiff, 'done < <(git diff --name-only "$base"..."$scope_tip")').replace('NO PRODUCTION OR EXISTING GATE CHANGES', 'CLOSED S10 SCOPE PRESERVED / CURRENT CHECKOUT REGRESSIONS');
}
export function validateS10Patch(original, actual) {
  assert.equal(actual, adaptS10(original), 'S10 runtime/type/architecture commands or historical allowlist were altered');
}
export function validateMatrix(text) {
  const ids = [...text.matchAll(/^\| (M06PREP-\d{2}) \|/gm)].map(m => m[1]);
  assert.deepEqual(ids, Array.from({length: 24}, (_, i) => `M06PREP-${String(i+1).padStart(2,'0')}`), 'Preparation matrix must preserve all 24 identities');
}
export function validatePackage(text) {
  assert(text.includes('PLANNING COMPLETE / IMPLEMENTATION BLOCKED'), 'M06 package must remain blocked');
  assert.equal([...text.matchAll(/^\d+\./gm)].length, 10, 'Existing M06 scope remains ten slices');
  assert(!text.includes('ADMITTED_FOR_IMPLEMENTATION'), 'Preparation must not admit M06');
}
function git(...args) { return execFileSync('git', args, {encoding:'utf8'}); }
export function main() {
  process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
  const head = git('rev-parse','HEAD').trim();
  for (const anchor of [M04, M05, CONTRACT]) git('merge-base','--is-ancestor',anchor,head);
  assert.equal(git('rev-parse',`${M05}^{tree}`).trim(), TREE, 'Accepted M05 tree mismatch');
  assert.equal(git('status','--porcelain','--untracked-files=no').trim(), '', 'Tracked checkout must be clean');
  const record = JSON.parse(readFileSync('docs/planning/m06-admission-preparation.json','utf8'));
  validateRecord(record);
  const raw = git('diff','--name-status','--no-renames',`${M05}...${head}`).trim();
  const entries = raw ? raw.split('\n').map(line => {
    const [status,path,...rest] = line.split('\t'); assert.equal(rest.length,0,'Unsupported rename/path form');
    const item = git('ls-tree',head,'--',path).trim();
    return {status,path,mode:item.split(' ')[0]};
  }) : [];
  validateChanges(entries);
  assert.deepEqual(entries.map(e => e.path).sort(), [...addedPaths,S10].sort(), 'Final preparation bundle must be complete');
  for (const path of addedPaths) assert(readFileSync(path).length > 0, `Empty preparation artifact: ${path}`);
  const firstExecutable = git('rev-list','--reverse',`${M05}..${head}`,'--','scripts/ci/m06-admission-preparation.mjs','tests/m06_admission_preparation_test.mjs').trim().split('\n')[0];
  assert(firstExecutable, 'Missing executable preparation history');
  git('merge-base','--is-ancestor',CONTRACT,`${firstExecutable}^`);
  const originalS10 = git('show',`${M05}:${S10}`);
  validateS10Patch(originalS10,readFileSync(S10,'utf8'));
  validateMatrix(readFileSync('docs/planning/M06_ADMISSION_READINESS_MATRIX.md','utf8'));
  validatePackage(readFileSync('docs/planning/M06_EXECUTION_PACKAGE.md','utf8'));
  const acceptance = readFileSync('docs/planning/M05_TECHNICAL_ACCEPTANCE_RECORD.md','utf8');
  for (const value of [M05,TREE,String(record.m05_acceptance_comment),record.preparation_authorization,'physicalDeletionAuthorized=false']) assert(acceptance.includes(value), `Acceptance reference missing: ${value}`);
  const contracts = ['PASSPORT_LIFECYCLE_RENEWAL_PROJECTION','DEPENDENCY_GRAPH_REEVALUATION_MODEL','CONTINUOUS_COMPLIANCE_STATUS_MODEL','NOTIFICATION_POLICY_MODEL','DECISION_REPLAY_MODEL','REEVALUATION_DECISION_EVIDENCE','APPLICATION_EXECUTION_CONTEXT_MODEL','APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER','UNIT_OF_WORK_TRANSACTION_MODEL'];
  for (const name of contracts) assert(readFileSync(`docs/contracts/${name}.md`).length > 0, `Missing existing contract: ${name}`);
  for (const name of ['M04_S10_EXIT_EVIDENCE','M05_S10_EXIT_EVIDENCE','M05_EXECUTION_PACKAGE']) assert(readFileSync(`docs/planning/${name}.md`).length > 0);
  const transition = readFileSync('docs/planning/M06_CI_TRANSITION_REVIEW.md','utf8');
  for (const requirement of record.next_transition_requirements) assert(transition.includes(requirement));
  assert.equal(git('rev-parse','HEAD').trim(),head,'Checkout moved during preparation validation');
  console.log(`M06 PREPARATION PASS head=${head} matrix=24 implementation_authorized=false entry=null M06=0/10 v1=60/130`);
  return head;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
