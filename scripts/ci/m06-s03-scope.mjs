import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BASE='06859ccf345c116457c917766488111449551394';
export const REVIEWED='adfa67aa3f413060df0192be9e41e37f167c08f8';
export const PREVIOUS='6fe20885770ddaea879c666304f90c407b5a34eb';
export const TREE='d72cf2eb05dbee0ce79de4b3e23183e7b3303e4d';
export const CONTRACT='04b2ab648a7ea0f5a7ad824dd6b717f35d97dab4';
export const TESTS='dcaead3031f92c31339f4076ee6a8fc072f87edf';
export const RECORD='docs/planning/m06-s03-execution.json';
export const NEW_FILES=Object.freeze(['docs/planning/M06_S03_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S03_TEST_INDEX.md','docs/planning/M06_S03_EXIT_EVIDENCE.md',RECORD,'packages/application/src/lifecycle/recurring-obligation.ts','packages/application/test/m06-s03-recurring-obligation.test.ts','packages/application/test/m06-s03-types.compile.ts','scripts/ci/m06-s03-scope.mjs','tests/m06_s03_scope_test.mjs','tests/m06_s03_recurring_obligation_test.sh','.github/workflows/m06-s03-recurring-obligation.yml']);
export const CHANGED_FILES=Object.freeze(['packages/application/src/lifecycle/index.ts','packages/application/package.json','packages/application/tsconfig.json','scripts/ci/m06-s02-scope.mjs']);
export const INDEX_APPEND="export { RecurringObligationRule, RecurringObligation, ObligationCompletionRecord, RecurringObligationProjection, RECURRING_OBLIGATION_OPERATION, RECURRING_OBLIGATION_FIELD } from './recurring-obligation.ts';\nexport type { RecurringObligationRuleInput, RecurringObligationInput, ObligationCompletionRecordInput, RecurringObligationProjectionInput, RecurringObligationProjectionView, RecurringObligationOccurrence, ObligationAnchor, ObligationKind, RecurrenceCadence } from './recurring-obligation.ts';\n";
export function expectedRecord(){return {schema_version:1,decision_id:'CALPQ-M06-S03-EXEC-0001',milestone:'M06',slice:'S03',issue:143,state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',approval_text:'SCHVALUJI MERGE PR #142 A POKRAČOVÁNÍ NA M06 SLICE 03',predecessor_pr:142,predecessor_head:REVIEWED,predecessor_merge:BASE,predecessor_tree:TREE,owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/142#issuecomment-5730619433',post_merge_evidence_reference:'https://github.com/robertdominik618/calpq-os/pull/142#issuecomment-5730814396',authorized_execution_entry:'M06_SLICE_03_RECURRING_OBLIGATION_MODEL',authorized_slices:['S03'],m06_accepted_slices:2,v1_completed_plan_units:62,v1_total_plan_units:130,production_release_authorized:false,later_slices_authorized:false};}
export function validateExecution(value){assert.deepEqual(value,expectedRecord(),'S03 execution must bind actual approval, predecessor and permitted slice');}
export function validateDelta(entries){
  assert(Array.isArray(entries),'Delta array required');
  assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate path');
  for(const e of entries){assert.equal(e.mode,'100644','Regular nonexecutable files only');assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S03 path');assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion rename or historical addition');}
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Complete exact S03 bundle required');
}
export function dispatchPatch(original){
  const importMarker="import {readFileSync} from 'node:fs';";
  const tail="if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();";
  assert.equal(original.split(importMarker).length,2,'Unique original fs import required');assert.equal(original.split(tail).length,2,'Unique original S02 CLI required');
  return original.replace(importMarker,"import {readFileSync,existsSync} from 'node:fs';").replace(tail,"if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){\n  if(existsSync('docs/planning/m06-s03-execution.json')){\n    execFileSync(process.execPath,[resolve('scripts/ci/m06-s03-scope.mjs')],{stdio:'inherit'});\n  }else main();\n}");
}
export function validateDispatch(original,actual){assert.equal(actual,dispatchPatch(original),'Only exact S03 successor dispatch permitted');}
export function validateConfig(path,original,actual){
  const expected=structuredClone(original);
  if(path==='packages/application/package.json'){assert(!Object.hasOwn(expected.scripts,'test:m06s03'));expected.scripts['test:m06s03']='node --test test/m06-s03-recurring-obligation.test.ts';}
  else if(path==='packages/application/tsconfig.json'){assert(!expected.include.includes('test/m06-s03-types.compile.ts'));expected.include.push('test/m06-s03-types.compile.ts');}
  else throw new TypeError('Unknown additive configuration');
  assert.deepEqual(actual,expected,'Only additive S03 configuration permitted');
}
export function validateIndex(value){assert.deepEqual([...value.matchAll(/^\| (M06S03-\d{2}) \|/gm)].map(m=>m[1]),Array.from({length:80},(_,i)=>`M06S03-${String(i+1).padStart(2,'0')}`),'Exactly 80 ordered mandatory scenarios');}
export function validateBarrel(original,actual){assert.equal(actual,original+INDEX_APPEND,'Only exact additive recurring-obligation exports');}
function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:8*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}
// Only the closed-history scope validator runs in this immutable worktree.
// Every runtime/type/architecture command still executes on the current candidate checkout.
function verifyClosedScope(){
  const folder=mkdtempSync(join(tmpdir(),'calpq-m06s03-history-')),worktree=join(folder,'closed-s02');
  let added=false;
  try{
    git('worktree','add','--detach','--quiet',worktree,BASE);added=true;
    const result=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s02-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:8*1024*1024});
    assert(result.includes(`M06 S02 SCOPE PASS head=${BASE}`),'Original closed S02 governance must pass');
  }finally{if(added)git('worktree','remove','--force',worktree);rmSync(folder,{recursive:true,force:true});}
}
export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Clean tracked candidate required');
  for(const ref of [BASE,REVIEWED,PREVIOUS,CONTRACT,TESTS])ancestor(ref,head);
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${PREVIOUS} ${REVIEWED}`,'Actual S02 merge parents required');
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE,'Actual reviewed and merged tree required');
  verifyClosedScope();
  validateDelta(changes(BASE,head));validateExecution(JSON.parse(at(head,RECORD)));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'S03 execution record is immutable');
  validateDispatch(at(BASE,'scripts/ci/m06-s02-scope.mjs'),at(head,'scripts/ci/m06-s02-scope.mjs'));
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  validateBarrel(at(BASE,'packages/application/src/lifecycle/index.ts'),at(head,'packages/application/src/lifecycle/index.ts'));
  validateIndex(at(head,'docs/planning/M06_S03_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${BASE}..${head}`,'--','packages/application/src/lifecycle/recurring-obligation.ts').trim().split('\n')[0];assert(first);
  for(const ref of [CONTRACT,TESTS])ancestor(ref,`${first}^`);
  assert.equal(at(`${first}^`,RECORD),at(head,RECORD),'Actual activation before product source');
  for(const path of ['docs/planning/M06_S03_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S03_TEST_INDEX.md'])assert(at(`${first}^`,path).trim());
  for(const path of ['docs/planning/m06-s02-execution.json','docs/planning/m06-s01-activation.json','docs/planning/m06-admission-decision.json'])assert.equal(at(head,path),at(BASE,path),'Historical decisions cannot change');
  assert.equal(git('rev-parse','HEAD').trim(),head);
  console.log(`M06 S03 SCOPE PASS head=${head} predecessor=${BASE} closed-history=original-validator current-runtime=required release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(existsSync('docs/planning/m06-s04-execution.json')){
    execFileSync(process.execPath,[resolve('scripts/ci/m06-s04-scope.mjs')],{stdio:'inherit'});
  }else main();
}
