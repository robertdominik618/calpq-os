import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const M06 = 'f71bc084e6dc7778a13b0ad80b7637f6663005f8';
export const M04 = 'd2f04aa2bcc68edf1d20deb345faa8a8c239e23d';
export const TREE = '6dab0106f388d36de35e9c2296b82ddd0ecc3b74';
export const REVIEWED = 'df67a250c613a7ead56e2511ac13c63dd41348f3';
export const CONTRACT = '7a77b2c3f2633646a1a05a41fe2891922c74aa60';
export const S10 = 'tests/m06_s10_integration_evidence_test.sh';

export const addedPaths = Object.freeze([
  'docs/planning/M06_TECHNICAL_ACCEPTANCE_RECORD.md',
  'docs/planning/M07_ADMISSION_PREPARATION.md',
  'docs/planning/M07_ADMISSION_READINESS_MATRIX.md',
  'docs/planning/M07_CI_TRANSITION_REVIEW.md',
  'docs/planning/m07-admission-preparation.json',
  'scripts/ci/m07-admission-preparation.mjs',
  'tests/m07_admission_preparation_test.mjs',
  'tests/m07_admission_preparation_test.sh',
  '.github/workflows/m07-admission-preparation.yml',
]);

export function expectedRecord() {
  return {
    schema_version: 1,
    record_id: 'CALPQ-M07-ADM-PREP-0001',
    milestone: 'M07',
    issue_number: 160,
    epic_number: 37,
    state: 'PREPARATION_ONLY',
    continuation_instruction: 'tak pokračujme',
    continuation_scope: 'NEXT_CANONICAL_ADMISSION_PREPARATION_ONLY',
    m06_acceptance_record: 'CALPQ-M06-TECH-ACCEPT-0001',
    m06_acceptance_comment: 5744551633,
    m06_post_merge_comment: 5744548390,
    m06_accepted_merge: M06,
    m06_accepted_tree: TREE,
    m06_reviewed_head: REVIEWED,
    m04_reviewed_merge: M04,
    source_governance_id: 'CALPQ-REG-0001',
    admission_approval: null,
    implementation_authorized: false,
    authorized_execution_entry: null,
    preparation_pr_merge_authorized: false,
    production_release_authorized: false,
    legal_interpretation_authorized: false,
    proposed_execution_entry: 'M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY',
    activation_condition: 'SEPARATE_OWNER_FORMAL_ADMISSION_AND_START_APPROVAL_PLUS_APPROVED_ADMISSION_MERGE_AND_POST_MERGE_VERIFICATION',
    m06_completed_slices: 10,
    m07_completed_slices: 0,
    m07_planned_slices: 10,
    v1_completed_plan_units: 70,
    v1_total_plan_units: 130,
    next_transition_requirements: ['M07-NEXT-01','M07-NEXT-02','M07-NEXT-03','M07-NEXT-04'],
  };
}

export function validateRecord(record) {
  assert.deepEqual(record, expectedRecord(), 'M07 preparation cannot admit implementation, invent authority, move anchors or inflate progress');
}

export function validateChanges(entries) {
  assert(Array.isArray(entries), 'Changed paths must be an array');
  assert.equal(new Set(entries.map(e => e.path)).size, entries.length, 'Duplicate changed path');
  for (const entry of entries) {
    assert.equal(entry.mode, '100644', 'Preparation requires regular non-executable repository files');
    if (entry.path === S10) {
      assert.equal(entry.status, 'M', 'Only in-place closed-M06 runner adaptation is allowed');
    } else {
      assert(addedPaths.includes(entry.path), `Unauthorized M07 preparation path: ${entry.path}`);
      assert.equal(entry.status, 'A', 'M07 preparation files must be additions relative to accepted M06');
    }
  }
}

export function adaptS10(original) {
  const marker = 'node scripts/ci/m06-s10-scope.mjs\n\nruntime=';
  assert.equal(original.split(marker).length, 2, 'Expected exactly one M06 closed-scope invocation');
  const block = `if git merge-base --is-ancestor ${M06} HEAD && [[ -f docs/planning/m07-admission-preparation.json ]]; then
  node scripts/ci/m07-admission-preparation.mjs
  closed_root=$(mktemp -d)
  closed_tree="$closed_root/closed-m06"
  cleanup_closed_scope() {
    git worktree remove --force "$closed_tree" >/dev/null 2>&1 || true
    rm -rf "$closed_root"
  }
  trap cleanup_closed_scope EXIT
  git worktree add --detach --quiet "$closed_tree" ${M06}
  (cd "$closed_tree" && node scripts/ci/m06-s10-scope.mjs)
  cleanup_closed_scope
  trap - EXIT
else
  node scripts/ci/m06-s10-scope.mjs
fi

runtime=`;
  return original.replace(marker, block);
}

export function validateS10Patch(original, actual) {
  assert.equal(actual, adaptS10(original), 'M06 S10 runtime/types/predecessor chain or historical scope semantics were altered');
}

export function validateMatrix(text) {
  const ids = [...text.matchAll(/^\| (M07PREP-\d{2}) \|/gm)].map(m => m[1]);
  assert.deepEqual(ids, Array.from({length:28}, (_,i)=>`M07PREP-${String(i+1).padStart(2,'0')}`), 'M07 preparation matrix must preserve all 28 identities');
}

export function validatePackage(text) {
  assert(text.includes('PLANNING COMPLETE / IMPLEMENTATION BLOCKED'), 'M07 package must remain implementation-blocked');
  assert.equal([...text.matchAll(/^\d+\./gm)].length, 10, 'Existing M07 package must remain ten slices');
  assert(!text.includes('ADMITTED_FOR_IMPLEMENTATION'), 'Preparation must not admit M07');
}

export function validateSourceGovernance(text) {
  for (const required of [
    'Status: `M00 FOUNDATION / NORMATIVE`',
    'ID: `CALPQ-REG-0001`',
    'VERIFIED',
    'UNVERIFIED',
    'STALE/REVIEW_REQUIRED',
    'Historical decisions retain the rule/source version used at the time.',
    'AI may help identify or explain a source, but does not by itself upgrade a rule to `VERIFIED`.'
  ]) assert(text.includes(required), `Regulatory source governance requirement missing: ${required}`);
}

export function validateBaseline(text) {
  assert(text.includes('Status: `PLANNING ONLY / BLOCKED`'), 'M07 baseline must remain blocked');
  assert(text.includes('A fetched text, AI summary or parser output is not itself a legal rule.'), 'M07 source boundary missing');
  assert(text.includes('Regulatory interpretation requiring legal/human judgment remains REVIEW_REQUIRED'), 'M07 review boundary missing');
}

function git(...args) {
  return execFileSync('git', args, {encoding:'utf8', maxBuffer:36*1024*1024});
}

export function main() {
  process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
  const head = git('rev-parse','HEAD').trim();
  assert.equal(git('status','--porcelain','--untracked-files=no').trim(), '', 'Tracked checkout must be clean');

  for (const anchor of [M04, M06, REVIEWED, CONTRACT]) git('merge-base','--is-ancestor',anchor,head);
  assert.equal(git('rev-parse',`${M06}^{tree}`).trim(), TREE, 'Accepted M06 tree mismatch');
  assert.equal(git('show','-s','--format=%P',M06).trim().split(' ')[1], REVIEWED, 'Accepted M06 merge must retain reviewed S10 parent');

  const record = JSON.parse(readFileSync('docs/planning/m07-admission-preparation.json','utf8'));
  validateRecord(record);

  const raw = git('diff','--name-status','--no-renames',`${M06}...${head}`).trim();
  const entries = raw ? raw.split('\n').map(line => {
    const [status,path,...rest] = line.split('\t');
    assert.equal(rest.length,0,'Unsupported rename/path form');
    const item = git('ls-tree',head,'--',path).trim();
    return {status,path,mode:item.split(' ')[0]};
  }) : [];
  validateChanges(entries);
  assert.deepEqual(entries.map(e=>e.path).sort(), [...addedPaths,S10].sort(), 'Final M07 preparation bundle must be exact and complete');

  for (const path of addedPaths) assert(readFileSync(path).length > 0, `Empty M07 preparation artifact: ${path}`);

  const firstExecutable = git('rev-list','--reverse',`${M06}..${head}`,'--',
    'scripts/ci/m07-admission-preparation.mjs',
    'tests/m07_admission_preparation_test.mjs',
    'tests/m07_admission_preparation_test.sh',
    '.github/workflows/m07-admission-preparation.yml').trim().split('\n')[0];
  assert(firstExecutable, 'Missing executable M07 preparation history');
  git('merge-base','--is-ancestor',CONTRACT,`${firstExecutable}^`);

  validateS10Patch(git('show',`${M06}:${S10}`), readFileSync(S10,'utf8'));
  validateMatrix(readFileSync('docs/planning/M07_ADMISSION_READINESS_MATRIX.md','utf8'));
  validatePackage(readFileSync('docs/planning/M07_EXECUTION_PACKAGE.md','utf8'));
  validateSourceGovernance(readFileSync('docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md','utf8'));
  validateBaseline(readFileSync('docs/planning/M07_REGULATORY_INTELLIGENCE_RADAR_BASELINE.md','utf8'));

  const acceptance = readFileSync('docs/planning/M06_TECHNICAL_ACCEPTANCE_RECORD.md','utf8');
  for (const value of [M06,TREE,REVIEWED,String(record.m06_acceptance_comment),String(record.m06_post_merge_comment),'51/51','70/130']) {
    assert(acceptance.includes(value), `M06 acceptance reference missing: ${value}`);
  }

  for (const path of [
    'docs/contracts/REGULATORY_CHANGE_IMPACT_MODEL.md',
    'docs/contracts/REGULATORY_RADAR_MODEL.md',
    'docs/contracts/CORE_PROVENANCE_AND_EVIDENCE.md',
    'docs/contracts/HUMAN_REVIEW_CASE_MODEL.md',
    'docs/contracts/DECISION_REPLAY_MODEL.md',
    'docs/contracts/DEPENDENCY_GRAPH_REEVALUATION_MODEL.md',
    'docs/planning/M04_S10_EXIT_EVIDENCE.md',
    'docs/planning/M06_S10_EXIT_EVIDENCE.md'
  ]) assert(readFileSync(path).length > 0, `Missing prerequisite contract/evidence: ${path}`);

  const transition = readFileSync('docs/planning/M07_CI_TRANSITION_REVIEW.md','utf8');
  for (const requirement of record.next_transition_requirements) assert(transition.includes(requirement), `Missing next transition: ${requirement}`);

  assert.equal(git('diff','--name-only',`${M06}...${head}`,'--','packages/core/src','packages/application/src').trim(), '', 'Preparation may not modify Core/Application business source');
  assert.equal(git('diff','--name-only',`${M06}...${head}`,'--','docs/planning/M07_EXECUTION_PACKAGE.md','docs/planning/M07_REGULATORY_INTELLIGENCE_RADAR_BASELINE.md','docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md').trim(), '', 'Authoritative M07/source-governance planning inputs must remain unchanged');

  console.log(`M07 PREPARATION PASS head=${head} matrix=28 implementation_authorized=false entry=null legal_authority=false M06=10/10 M07=0/10 v1=70/130`);
  return head;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
