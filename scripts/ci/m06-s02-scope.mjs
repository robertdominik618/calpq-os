import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {PREP,PREP_HEAD,PREP_TREE,M04,M05,CONTRACT,DECISION,ACTIVATION,ADDED,MODIFIED,S01_MODIFIED,validateDecision,validateActivation,validateScope,validatePatch,validateConfig,validateIndex} from './m06-admission.mjs';

export const BASE='6fe20885770ddaea879c666304f90c407b5a34eb';
export const REVIEWED='45f89a2507d24d0412b6524f332c0694f59d3121';
export const TREE='798d230acc79d9bf5a9694258dfcfa569ff39193';
export const S02_CONTRACT='e25f598b1ab74a51c82b1225991c44ab6eef0ef4';
export const S02_TESTS='1087a070ab2b8e3524ea98550ece80b2dd650d40';
export const RECORD='docs/planning/m06-s02-execution.json';
export const ENTRY='M06_SLICE_02_EXPIRY_RENEWAL_POLICY_EVALUATION';
export const NEW_FILES=Object.freeze(['docs/planning/M06_S02_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S02_TEST_INDEX.md','docs/planning/M06_S02_EXIT_EVIDENCE.md',RECORD,'packages/application/src/lifecycle/expiry-renewal-policy.ts','packages/application/test/m06-s02-expiry-renewal-policy.test.ts','packages/application/test/m06-s02-types.compile.ts','scripts/ci/m06-s02-scope.mjs','tests/m06_s02_scope_test.mjs','tests/m06_s02_expiry_renewal_test.sh','.github/workflows/m06-s02-expiry-renewal.yml']);
export const CHANGED_FILES=Object.freeze(['packages/application/src/lifecycle/index.ts','packages/application/package.json','packages/application/tsconfig.json','scripts/ci/m06-admission.mjs']);
export const INDEX_APPEND="export { ExpiryRenewalPolicy, ExpiryRenewalEvaluation, LifecycleCalendarContext, shiftLifecycleDate, EXPIRY_RENEWAL_OPERATION, EXPIRY_RENEWAL_FIELD } from './expiry-renewal-policy.ts';\nexport type { ExpiryRenewalPolicyInput, ExpiryRenewalEvaluationInput, ExpiryRenewalEvaluationView, ExpiryRule, RenewalRule, CalendarUnit, MonthEndConvention } from './expiry-renewal-policy.ts';\n";
export function expectedRecord(postMergeReference) {
  return {schema_version:1,decision_id:'CALPQ-M06-S02-EXEC-0001',milestone:'M06',slice:'S02',issue:141,state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',approval_text:'SCHVALUJI MERGE PR #140 A POKRAČOVÁNÍ NA M06 SLICE 02',predecessor_pr:140,predecessor_head:REVIEWED,predecessor_merge:BASE,predecessor_tree:TREE,owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/140#issuecomment-5730058055',post_merge_evidence_reference:postMergeReference,authorized_execution_entry:ENTRY,authorized_slices:['S02'],m06_accepted_slices:1,v1_completed_plan_units:61,v1_total_plan_units:130,production_release_authorized:false,later_slices_authorized:false};
}
export function validateExecution(value) {
  assert(value && typeof value==='object' && !Array.isArray(value),'Execution record required');
  assert.deepEqual(value,expectedRecord(value.post_merge_evidence_reference),'Expanded or altered S02 execution record');
  assert(typeof value.post_merge_evidence_reference==='string' && /^https:\/\/github\.com\/robertdominik618\/calpq-os\/pull\/140#issuecomment-[1-9][0-9]*$/.test(value.post_merge_evidence_reference),'Actual predecessor PR evidence reference required');
  assert.notEqual(value.post_merge_evidence_reference,value.owner_approval_reference,'Owner approval is not post-merge proof');
}
export function validateDelta(entries) {
  assert(Array.isArray(entries),'Delta array required');
  assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate delta path');
  for(const e of entries) {
    assert.equal(e.mode,'100644','Only regular files');
    assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S02 path');
    assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion/rename or historical mutation');
  }
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Incomplete S02 bundle');
}
export function dispatchPatch(original) {
  const marker="if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();";
  assert.equal(original.split(marker).length,2,'Ambiguous historical CLI');
  return original.replace(marker,"if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {\n  if (existsSync('docs/planning/m06-s02-execution.json')) {\n    execFileSync(process.execPath, [resolve('scripts/ci/m06-s02-scope.mjs')], {stdio:'inherit'});\n  } else main();\n}");
}
export function validateDispatch(original,actual){assert.equal(actual,dispatchPatch(original),'Only exact successor dispatch allowed');}
export function validateS02Config(path,original,actual) {
  const expected=structuredClone(original);
  if(path==='packages/application/package.json') {
    assert(!Object.hasOwn(expected.scripts,'test:m06s02'));
    expected.scripts['test:m06s02']='node --test test/m06-s02-expiry-renewal-policy.test.ts';
  } else if(path==='packages/application/tsconfig.json') {
    assert(!expected.include.includes('test/m06-s02-types.compile.ts'));
    expected.include.push('test/m06-s02-types.compile.ts');
  } else throw new TypeError('Unknown configuration');
  assert.deepEqual(actual,expected,'Only additive S02 configuration permitted');
}
export function validateS02Index(text){assert.deepEqual([...text.matchAll(/^\| (M06S02-\d{2}) \|/gm)].map(m=>m[1]),Array.from({length:72},(_,i)=>`M06S02-${String(i+1).padStart(2,'0')}`));}
function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:8*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}

// Validate closed scopes with the preserved original validators; runtime remains on current checkout.
function verifyClosedHistory(head) {
  for(const ref of [M04,M05,PREP,PREP_HEAD,CONTRACT,BASE,REVIEWED,S02_CONTRACT,S02_TESTS])ancestor(ref,head);
  for(const ref of [PREP,PREP_HEAD])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),PREP_TREE);
  assert.equal(git('show','-s','--format=%P',PREP).trim(),`${M05} ${PREP_HEAD}`);
  const activation=JSON.parse(at(BASE,ACTIVATION));validateActivation(activation);
  assert.equal(at(head,ACTIVATION),at(BASE,ACTIVATION),'Historical activation cannot change');
  validateDecision(JSON.parse(at(head,DECISION)));
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${activation.admission_merge} ${REVIEWED}`);
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE);
  for(const tip of [activation.admission_head,activation.admission_merge]) {
    ancestor(PREP,tip);ancestor(CONTRACT,tip);validateDecision(JSON.parse(at(tip,DECISION)));
    validateScope(changes(PREP,tip));
    for(const path of MODIFIED)validatePatch(path,at(PREP,path),at(tip,path));
    for(const path of ADDED)assert(at(tip,path).trim());
    validateIndex(at(tip,'docs/planning/M06_ADMISSION_TEST_INDEX.md'));
    assert.equal(git('rev-parse',`${tip}^{tree}`).trim(),activation.admission_tree);
  }
  assert.equal(git('show','-s','--format=%P',activation.admission_merge).trim(),`${PREP} ${activation.admission_head}`);
  const closed=changes(activation.admission_merge,BASE);validateScope(closed,'S01');
  for(const path of S01_MODIFIED)validateConfig(path,JSON.parse(at(activation.admission_merge,path)),JSON.parse(at(BASE,path)));
  assert.equal(git('rev-list',`${activation.admission_merge}..${BASE}`,'--',ACTIVATION).trim().split('\n').length,1);
  const first=git('rev-list','--reverse',`${activation.admission_merge}..${BASE}`,'--','packages/application/src/lifecycle').trim().split('\n')[0];assert(first);
  assert.equal(at(`${first}^`,ACTIVATION),at(BASE,ACTIVATION));
  for(const path of ['docs/planning/M06_S01_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S01_TEST_INDEX.md'])assert(at(`${first}^`,path).trim());
}
export function main() {
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Tracked checkout must be clean');
  validateDispatch(at(BASE,'scripts/ci/m06-admission.mjs'),readFileSync('scripts/ci/m06-admission.mjs','utf8'));
  verifyClosedHistory(head);
  const record=JSON.parse(readFileSync(RECORD,'utf8'));validateExecution(record);
  validateDelta(changes(BASE,head));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'S02 execution record is immutable');
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateS02Config(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  assert.equal(at(head,'packages/application/src/lifecycle/index.ts'),at(BASE,'packages/application/src/lifecycle/index.ts')+INDEX_APPEND,'Only exact S02 exports allowed');
  validateS02Index(at(head,'docs/planning/M06_S02_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${BASE}..${head}`,'--','packages/application/src/lifecycle/expiry-renewal-policy.ts').trim().split('\n')[0];assert(first);
  ancestor(S02_CONTRACT,`${first}^`);ancestor(S02_TESTS,`${first}^`);
  assert.equal(at(`${first}^`,RECORD),at(head,RECORD),'Immutable activation before source required');
  for(const path of ['docs/planning/M06_S02_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S02_TEST_INDEX.md'])assert(at(`${first}^`,path).trim());
  for(const m of ['07','08'])assert(at(head,`docs/planning/M${m}_EXECUTION_PACKAGE.md`).includes('IMPLEMENTATION BLOCKED'));
  assert.equal(git('rev-parse','HEAD').trim(),head);
  console.log(`M06 S02 SCOPE PASS head=${head} predecessor=${BASE} entry=${ENTRY} release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
