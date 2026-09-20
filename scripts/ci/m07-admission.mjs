import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

export const PREP='3d7ed9454f517f5f82b071929b554e4a5609075e';
export const PREP_HEAD='660b469ab3cdf1bd2ca0b4bff9a0712e119e08f4';
export const PREP_TREE='2bc94834214dbeb8f641a51bfe35a4d749da1648';
export const M06='f71bc084e6dc7778a13b0ad80b7637f6663005f8';
export const M04='d2f04aa2bcc68edf1d20deb345faa8a8c239e23d';
export const CONTRACT='c108686c26531b66b7680ac13c8ab16669f7565f';
export const DECISION='docs/planning/m07-admission-decision.json';
export const ACTIVATION='docs/planning/m07-s01-activation.json';
export const ENTRY='M07_SLICE_01_AUTHORITATIVE_SOURCE_REGISTRY';

export const ADDED=Object.freeze([
  'docs/planning/M07_ADMISSION_RECORD.md',DECISION,'docs/planning/M07_S01_SCOPE_CONTRACT.md','docs/planning/M07_ADMISSION_TEST_INDEX.md',
  'scripts/ci/m07-admission.mjs','tests/m07_admission_test.mjs','tests/m07_admission_test.sh','.github/workflows/m07-admission.yml'
]);
export const MODIFIED=Object.freeze([
  'docs/planning/M07_EXECUTION_PACKAGE.md','scripts/ci/m07-admission-preparation.mjs','tests/m07_admission_preparation_test.sh',
  'tests/m03_admission_test.sh','tests/m04_admission_test.sh','tests/m05_admission_test.sh','tests/m03_m08_execution_readiness_test.sh'
]);
export const S01_ADDED=Object.freeze([
  ACTIVATION,'docs/planning/M07_S01_IMPLEMENTATION_CONTRACT.md','docs/planning/M07_S01_TEST_INDEX.md','docs/planning/M07_S01_EXIT_EVIDENCE.md',
  'packages/core/src/regulatory/authoritative-source-registry.ts','packages/core/src/regulatory/index.ts',
  'packages/core/test/m07-s01-authoritative-source-registry.test.ts','packages/core/test/m07-s01-types.compile.ts',
  'tests/m07_s01_authoritative_source_registry_test.sh','.github/workflows/m07-s01-authoritative-source-registry.yml'
]);
export const S01_MODIFIED=Object.freeze([
  'packages/core/package.json','packages/core/tsconfig.json',
  'scripts/ci/m07-admission.mjs','tests/m07_admission_test.mjs',
  'tests/m04_s10_integration_evidence_test.sh',
  'tests/m05_s06_trust_registry_test.sh',
  'tests/m05_s07_verification_route_registry_test.sh',
  'tests/m05_s08_human_review_test.sh',
  'tests/m05_s09_archive_lifecycle_test.sh',
  'tests/m06_s01_lifecycle_timeline_test.sh'
]);
export const S01_EXECUTABLE_MODIFIED=Object.freeze([
  'tests/m04_s10_integration_evidence_test.sh',
  'tests/m05_s06_trust_registry_test.sh',
  'tests/m05_s07_verification_route_registry_test.sh',
  'tests/m05_s08_human_review_test.sh',
  'tests/m05_s09_archive_lifecycle_test.sh',
  'tests/m06_s01_lifecycle_timeline_test.sh'
]);
function expectedMode(stage,path){
  return stage==='S01'&&S01_EXECUTABLE_MODIFIED.includes(path)?'100755':'100644';
}

export function expectedDecision(){return {
  schema_version:1,decision_id:'CALPQ-M07-ADM-DEC-0001',admission_record_id:'CALPQ-M07-ADM-0001',
  admission_transition_id:'CALPQ-M07-ADMIT-0001',milestone:'M07',candidate:'Regulatory Intelligence & Radar',
  issue_number:37,transition_issue_number:162,state:'ADMITTED_FOR_IMPLEMENTATION',approved_by:'robertdominik618',
  approved_at:null,approval_time_precision:'NOT_INDEPENDENTLY_CAPTURED',
  approval_text:'SCHVALUJI MERGE PR #161 (Pull Request č. 161 – návrh na sloučení změn) A PO ÚSPĚŠNÉM POST-MERGE OVĚŘENÍ POKRAČOVÁNÍ NA FORMÁLNÍ ADMISSION M07 (milník 07 – regulatorní inteligence a radar).',
  preparation_issue:160,preparation_pr:161,preparation_reviewed_head:PREP_HEAD,preparation_reviewed_merge:PREP,preparation_tree:PREP_TREE,
  preparation_merge_approval_comment:5745674004,preparation_post_merge_comment:5745766680,
  m04_reviewed_merge:M04,m06_accepted_merge:M06,m06_technical_acceptance_comment:5744551633,
  source_governance_id:'CALPQ-REG-0001',admitted_revision:PREP,authorized_execution_entry:ENTRY,authorized_slices:['S01'],
  admission_effective_condition:'ADMISSION_PR_MERGED_AND_POST_MERGE_VERIFIED',scope_contract:'docs/planning/M07_S01_SCOPE_CONTRACT.md',
  blocking_reviews:[],production_release_authorized:false,legal_interpretation_authorized:false,later_slices_authorized:false,
  m07_completed_slices:0,v1_completed_plan_units:70,v1_total_plan_units:130
};}
export function validateDecision(value){assert.deepEqual(value,expectedDecision(),'Invalid or expanded M07 formal-admission decision');}

function once(text,from,to){assert.equal(text.split(from).length,2,'Missing or ambiguous formal-admission patch marker');return text.replace(from,to);}
const successor=`if [[ -f docs/planning/m07-admission-decision.json ]]; then
  node scripts/ci/m07-admission.mjs
else
  grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M07_EXECUTION_PACKAGE.md \\\n    || fail 'M07 requires a valid separate admission decision'
fi

grep -q 'IMPLEMENTATION BLOCKED' docs/planning/M08_EXECUTION_PACKAGE.md \\\n  || fail 'M08 must remain implementation-blocked'`;

export function adaptFile(path,original){
  if(['tests/m03_admission_test.sh','tests/m04_admission_test.sh','tests/m05_admission_test.sh'].includes(path)){
    const loop=`for m in 07 08; do
  grep -q 'IMPLEMENTATION BLOCKED' "docs/planning/M\${m}_EXECUTION_PACKAGE.md" \\\n    || fail "M\${m} must remain implementation-blocked"
done`;
    let result=once(original,loop,successor);
    if(path!=='tests/m05_admission_test.sh'){
      result=once(result,"docs/planning/M0{7,8}_EXECUTION_PACKAGE.md","docs/planning/M08_EXECUTION_PACKAGE.md");
      result=result.replace(/fail 'M06-M08 admission leaked into [^']+'/,"fail 'M08 admission leaked into earlier transition'");
    }
    return once(result,'/ M07-M08 BLOCKED','/ M07 SEPARATELY VALIDATED / M08 BLOCKED');
  }
  if(path==='tests/m03_m08_execution_readiness_test.sh'){
    const old=`for f in docs/planning/M0{7,8}_EXECUTION_PACKAGE.md; do
  grep -q 'IMPLEMENTATION BLOCKED' "$f" || fail "$f must remain implementation-blocked"
done`;
    return once(once(original,old,successor),'/ M07-M08 BLOCKED','/ M07 SEPARATELY VALIDATED / M08 BLOCKED');
  }
  if(path==='scripts/ci/m07-admission-preparation.mjs'){
    const marker="  process.chdir(fileURLToPath(new URL('../../', import.meta.url)));\n  const head = git('rev-parse','HEAD').trim();";
    return once(original,marker,"  process.chdir(fileURLToPath(new URL('../../', import.meta.url)));\n  if (existsSync('docs/planning/m07-admission-decision.json')) {\n    execFileSync(process.execPath, [resolve('scripts/ci/m07-admission.mjs')], {stdio:'inherit'});\n    return git('rev-parse','HEAD').trim();\n  }\n  const head = git('rev-parse','HEAD').trim();");
  }
  if(path==='tests/m07_admission_preparation_test.sh'){
    let result=once(original,'M07 PREPARATION: 24/24 governance validator tests PASS; formal admission remains separate.','M07 PREPARATION: 24/24 historical preparation-validator tests PASS; successor admission is checked separately.');
    return once(result,'M07 PREPARATION REGRESSION PASS / SOURCE GOVERNANCE + M04 + M06 PREREQUISITES / IMPLEMENTATION STILL BLOCKED / FULL PR MATRIX REQUIRED','M07 PREPARATION REGRESSION PASS / SOURCE GOVERNANCE + M04 + M06 PREREQUISITES / SUCCESSOR CHECKED SEPARATELY / FULL PR MATRIX REQUIRED');
  }
  if(path==='docs/planning/M07_EXECUTION_PACKAGE.md'){
    return once(original,'Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`','Status: `FORMALLY ADMITTED / S01 IMPLEMENTATION AUTHORIZED ONLY AFTER ADMISSION MERGE + POST-MERGE GREEN`\n\nAdmission: `M07_ADMISSION_RECORD.md` and `m07-admission-decision.json`. Only S01 (Slice 01 – implementační část 01, registr autoritativních regulatorních zdrojů) is conditionally authorized; S02–S10 remain separately governed.');
  }
  throw new TypeError('No approved M07 formal-admission patch for '+path);
}
export function validatePatch(path,original,actual){assert.equal(actual,adaptFile(path,original),'Unapproved predecessor/package change: '+path);}

export function validateScope(entries,stage='ADMISSION'){
  assert(['ADMISSION','S01'].includes(stage),'Unknown M07 execution stage');assert(Array.isArray(entries),'Scope array required');
  const added=stage==='ADMISSION'?ADDED:S01_ADDED;const modified=stage==='ADMISSION'?MODIFIED:S01_MODIFIED;
  assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate changed path');
  for(const e of entries){
    assert.equal(e.mode,expectedMode(stage,e.path),'Unexpected file mode for authorized path: '+e.path);
    assert(added.includes(e.path)||modified.includes(e.path),'Unauthorized path: '+e.path);
    assert.equal(e.status,added.includes(e.path)?'A':'M','Deletion/rename/copy or historical mutation prohibited');
  }
  if(stage==='ADMISSION') assert.deepEqual(entries.map(e=>e.path).sort(),[...added,...modified].sort(),'Formal-admission bundle incomplete');
}

export function validateActivation(value){
  assert(value&&typeof value==='object'&&!Array.isArray(value),'Activation must be object');
  const keys=['schema_version','milestone','slice','state','decision_id','authorized_execution_entry','admission_pr','admission_head','admission_merge','admission_tree','owner_merge_approval_reference','post_merge_evidence_reference','production_release_authorized','legal_interpretation_authorized'];
  assert.deepEqual(Object.keys(value).sort(),keys.sort(),'Unexpected/missing M07 activation fields');
  for(const [k,v] of Object.entries({schema_version:1,milestone:'M07',slice:'S01',state:'ACTIVE_AFTER_VERIFIED_ADMISSION',decision_id:'CALPQ-M07-ADM-DEC-0001',authorized_execution_entry:ENTRY,production_release_authorized:false,legal_interpretation_authorized:false}))assert.deepEqual(value[k],v);
  assert(Number.isSafeInteger(value.admission_pr)&&value.admission_pr>161,'Actual post-preparation admission PR required');
  for(const k of ['admission_head','admission_merge','admission_tree'])assert(typeof value[k]==='string'&&/^[0-9a-f]{40}$/.test(value[k]),'Invalid activation SHA');
  assert.equal(new Set([value.admission_head,value.admission_merge,value.admission_tree]).size,3,'Distinct admission commit/tree identities required');
  for(const sha of [value.admission_head,value.admission_merge])assert(![PREP,PREP_HEAD,M06,M04].includes(sha),'Preparation/predecessor is not formal admission');
  for(const k of ['owner_merge_approval_reference','post_merge_evidence_reference']){
    assert(typeof value[k]==='string');const prefix=`https://github.com/robertdominik618/calpq-os/pull/${value.admission_pr}#issuecomment-`;
    assert(value[k].startsWith(prefix)&&/^[1-9][0-9]*$/.test(value[k].slice(prefix.length)),'Evidence must reference this admission PR');
  }
}
export function modeFor(value){if(value===undefined)return 'ADMISSION';validateActivation(value);return 'S01';}
export function validateIndex(text){
  const ids=[...text.matchAll(/^\| (M07ADM-\d{2}) \|/gm)].map(m=>m[1]);
  assert.deepEqual(ids,Array.from({length:36},(_,i)=>`M07ADM-${String(i+1).padStart(2,'0')}`),'36 ordered M07 admission tests required');
}

function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:40*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(base,tip){const raw=git('diff','--name-status','--no-renames',`${base}...${tip}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',tip,'--',path).trim().split(' ')[0]};}):[];}

function validateAdmissionTip(tip){
  ancestor(PREP,tip);ancestor(CONTRACT,tip);validateDecision(JSON.parse(at(tip,DECISION)));validateScope(changes(PREP,tip));
  for(const path of MODIFIED)validatePatch(path,at(PREP,path),at(tip,path));
  for(const path of ADDED)assert(at(tip,path).trim(),'Empty M07 admission artifact');
  validateIndex(at(tip,'docs/planning/M07_ADMISSION_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${PREP}..${tip}`,'--','scripts/ci/m07-admission.mjs','tests/m07_admission_test.mjs').trim().split('\n')[0];
  assert(first);ancestor(CONTRACT,`${first}^`);
  const rec=at(tip,'docs/planning/M07_ADMISSION_RECORD.md');
  for(const value of [PREP,PREP_TREE,M06,expectedDecision().approval_text,ENTRY,'62/62'])assert(rec.includes(value),'Admission record provenance missing: '+value);
  const governance=at(tip,'docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md');
  for(const s of ['M00 FOUNDATION / NORMATIVE','CALPQ-REG-0001','VERIFIED','UNVERIFIED','STALE/REVIEW_REQUIRED'])assert(governance.includes(s),'Source governance drift');
  assert.equal(at(tip,'docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md'),at(PREP,'docs/foundation/REGULATORY_SOURCE_GOVERNANCE.md'),'Normative source governance must remain byte-identical');
  assert.equal(git('diff','--name-only',`${PREP}...${tip}`,'--','packages/core/src','packages/application/src','packages/adapters/src').trim(),'','Formal admission contains no product source');
}

export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Tracked checkout must be clean');
  for(const ref of [M04,M06,PREP,PREP_HEAD,CONTRACT])ancestor(ref,head);
  assert.equal(git('rev-parse',`${PREP}^{tree}`).trim(),PREP_TREE,'Preparation merge tree mismatch');
  assert.equal(git('rev-parse',`${PREP_HEAD}^{tree}`).trim(),PREP_TREE,'Preparation reviewed tree mismatch');
  assert.equal(git('show','-s','--format=%P',PREP).trim(),`${M06} ${PREP_HEAD}`,'Preparation merge parents mismatch');
  validateDecision(JSON.parse(readFileSync(DECISION,'utf8')));
  const activation=existsSync(ACTIVATION)?JSON.parse(readFileSync(ACTIVATION,'utf8')):undefined;const mode=modeFor(activation);
  const tip=mode==='S01'?activation.admission_merge:head;validateAdmissionTip(tip);
  if(mode==='S01'){
    ancestor(activation.admission_merge,head);ancestor(activation.admission_head,activation.admission_merge);
    const parents=git('show','-s','--format=%P',activation.admission_merge).trim().split(' ');assert.equal(parents.length,2);assert.equal(parents[1],activation.admission_head);
    for(const ref of [activation.admission_merge,activation.admission_head])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),activation.admission_tree);
    validateAdmissionTip(activation.admission_head);const delta=changes(tip,head);validateScope(delta,'S01');
    assert(delta.some(e=>e.path===ACTIVATION),'S01 activation must be introduced after formal admission');
    assert.equal(git('rev-list',`${tip}..${head}`,'--',ACTIVATION).trim().split('\n').length,1,'Activation must remain immutable');
    const sources=S01_ADDED.filter(p=>p.startsWith('packages/core/src/'));const first=git('rev-list','--reverse',`${tip}..${head}`,'--',...sources).trim().split('\n')[0];
    if(first){assert.equal(at(`${first}^`,ACTIVATION),at(head,ACTIVATION),'Source requires prior activation');for(const p of ['docs/planning/M07_S01_IMPLEMENTATION_CONTRACT.md','docs/planning/M07_S01_TEST_INDEX.md'])assert(at(`${first}^`,p).trim(),'Source requires prior contract/index');}
  }
  assert(at(head,'docs/planning/M08_EXECUTION_PACKAGE.md').includes('IMPLEMENTATION BLOCKED'),'M08 must remain blocked');
  console.log(`M07 FORMAL ADMISSION PASS head=${head} mode=${mode} entry=${ENTRY} product_credit=0 legal_authority=false release=false`);
  return mode;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
