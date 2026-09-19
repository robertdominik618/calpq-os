import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BASE='cd91c80806182fd2cd2b59a8937f180f23cf2ae3';
export const REVIEWED='3c25149fc21de73dc380988fa1d52b77f20e5188';
export const PREVIOUS='06859ccf345c116457c917766488111449551394';
export const TREE='e3a68d90f7fb3516134fc157ae8b87c99ec6c927';
export const CONTRACT='dcc6cc1c524037fbb7ac74bafde455d34d2368cd';
export const TESTS='f453b322c190c3236f15875f7778d0fd94102d50';
export const RECORD='docs/planning/m06-s04-execution.json';
export const NEW_FILES=Object.freeze(['docs/planning/M06_S04_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S04_TEST_INDEX.md','docs/planning/M06_S04_EXIT_EVIDENCE.md',RECORD,'packages/application/src/lifecycle/renewal-case.ts','packages/application/test/m06-s04-renewal-case.test.ts','packages/application/test/m06-s04-types.compile.ts','scripts/ci/m06-s04-scope.mjs','tests/m06_s04_scope_test.mjs','tests/m06_s04_renewal_case_test.sh','.github/workflows/m06-s04-renewal-case.yml']);
export const CHANGED_FILES=Object.freeze(['packages/application/src/lifecycle/index.ts','packages/application/package.json','packages/application/tsconfig.json','scripts/ci/m06-s03-scope.mjs']);
export const INDEX_APPEND="export { RenewalCaseDefinition, RenewalEvidencePackage, RenewalCaseGrant, RenewalExternalObservation, RenewalCaseCommand, RenewalCaseHistory, RenewalRevisionConflictError, RENEWAL_CASE_OPERATION, RENEWAL_CASE_FIELD } from './renewal-case.ts';\nexport type { RenewalCaseDefinitionInput, RenewalEvidencePackageInput, RenewalCaseGrantInput, RenewalExternalObservationInput, RenewalCaseCommandInput, RenewalCaseInvocation, RenewalCaseState, RenewalCasePermission, RenewalCaseChange, RenewalCaseTransitionRecord } from './renewal-case.ts';\n";
export function expectedRecord(){return {schema_version:1,decision_id:'CALPQ-M06-S04-EXEC-0001',milestone:'M06',slice:'S04',issue:145,state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',approval_text:'SCHVALUJI MERGE PR #144 A POKRAČOVÁNÍ NA M06 SLICE 04.',predecessor_pr:144,predecessor_head:REVIEWED,predecessor_merge:BASE,predecessor_tree:TREE,owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/144#issuecomment-5731411583',post_merge_evidence_reference:'https://github.com/robertdominik618/calpq-os/pull/144#issuecomment-5731565014',authorized_execution_entry:'M06_SLICE_04_RENEWAL_CASE_WORKFLOW',authorized_slices:['S04'],m06_accepted_slices:3,v1_completed_plan_units:63,v1_total_plan_units:130,production_release_authorized:false,later_slices_authorized:false};}
export function validateExecution(value){assert.deepEqual(value,expectedRecord(),'S04 execution must bind actual approval and verified predecessor');}
export function validateDelta(entries){
  assert(Array.isArray(entries),'Delta array required');assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate path');
  for(const e of entries){assert.equal(e.mode,'100644');assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S04 path');assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion rename or historical replacement');}
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Complete exact15-file bundle required');
}
export function dispatchPatch(original){
  const marker="import {readFileSync,mkdtempSync,rmSync} from 'node:fs';",tail="if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();\n";
  assert.equal(original.split(marker).length,2);assert(original.endsWith(tail),'Exact final predecessor CLI required');
  const prefix=original.slice(0,-tail.length).replace(marker,"import {readFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';");
  return prefix+"if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){\n  if(existsSync('docs/planning/m06-s04-execution.json')){\n    execFileSync(process.execPath,[resolve('scripts/ci/m06-s04-scope.mjs')],{stdio:'inherit'});\n  }else main();\n}\n";
}
export function validateDispatch(original,actual){assert.equal(actual,dispatchPatch(original),'Only exact successor dispatch permitted');}
export function validateConfig(path,original,actual){
  const expected=structuredClone(original);
  const s05=existsSync('docs/planning/m06-s05-execution.json');
  const s06=existsSync('docs/planning/m06-s06-execution.json');
  const s07=existsSync('docs/planning/m06-s07-execution.json');
  if(s06&&!s05) throw new TypeError('S06 requires activated S05 predecessor');
  if(s07&&!s06) throw new TypeError('S07 requires activated S06 predecessor');
  if(path==='packages/application/package.json'){
    assert(!Object.hasOwn(expected.scripts,'test:m06s04'));expected.scripts['test:m06s04']='node --test test/m06-s04-renewal-case.test.ts';
    if(s05){assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';}
    if(s06){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}
    if(s07){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}
  }
  else if(path==='packages/application/tsconfig.json'){
    assert(!expected.include.includes('test/m06-s04-types.compile.ts'));expected.include.push('test/m06-s04-types.compile.ts');
    if(s05){assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');}
    if(s06){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}
    if(s07){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}
  }
  else throw new TypeError('Unknown additive configuration');
  assert.deepEqual(actual,expected,s07?'Only exact additive S04 plus activated S05/S06/S07 configuration':s06?'Only exact additive S04 plus activated S05/S06 configuration':s05?'Only exact additive S04 plus activated S05 configuration':'Only exact additive S04 configuration');
}
export function validateIndex(value){assert.deepEqual([...value.matchAll(/^\| (M06S04-\d{2}) \|/gm)].map(m=>m[1]),Array.from({length:88},(_,i)=>`M06S04-${String(i+1).padStart(2,'0')}`),'88 ordered mandatory scenarios required');}
export function validateBarrel(original,actual){assert.equal(actual,original+INDEX_APPEND,'Only exact additive exports');}
function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:12*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}
// Only closed-history scope is validated in a detached worktree; runtime remains on the candidate.
function verifyClosedScope(){
  const folder=mkdtempSync(join(tmpdir(),'calpq-m06s04-history-')),worktree=join(folder,'closed-s03');let added=false;
  try{git('worktree','add','--detach','--quiet',worktree,BASE);added=true;
    const log=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s03-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:12*1024*1024});
    assert(log.includes(`M06 S03 SCOPE PASS head=${BASE}`),'Original closed S03 governance must pass');
  }finally{if(added)git('worktree','remove','--force',worktree);rmSync(folder,{recursive:true,force:true});}
}
export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Clean tracked checkout');
  for(const ref of [BASE,REVIEWED,PREVIOUS,CONTRACT,TESTS])ancestor(ref,head);
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${PREVIOUS} ${REVIEWED}`,'Actual S03 merge parents');
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE,'Reviewed/merged tree equality');
  verifyClosedScope();validateDelta(changes(BASE,head));validateExecution(JSON.parse(at(head,RECORD)));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'Execution record immutable');
  validateDispatch(at(BASE,'scripts/ci/m06-s03-scope.mjs'),at(head,'scripts/ci/m06-s03-scope.mjs'));
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  validateBarrel(at(BASE,'packages/application/src/lifecycle/index.ts'),at(head,'packages/application/src/lifecycle/index.ts'));
  validateIndex(at(head,'docs/planning/M06_S04_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${BASE}..${head}`,'--','packages/application/src/lifecycle/renewal-case.ts').trim().split('\n')[0];assert(first);
  for(const ref of [CONTRACT,TESTS])ancestor(ref,`${first}^`);
  assert.equal(at(`${first}^`,RECORD),at(head,RECORD),'Actual activation must precede source');
  for(const path of ['docs/planning/M06_S04_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S04_TEST_INDEX.md'])assert(at(`${first}^`,path).trim());
  for(const path of ['docs/planning/m06-s03-execution.json','docs/planning/m06-s02-execution.json','docs/planning/m06-s01-activation.json','docs/planning/m06-admission-decision.json'])assert.equal(at(head,path),at(BASE,path),'Historical decisions unchanged');
  assert.equal(git('rev-parse','HEAD').trim(),head);
  console.log(`M06 S04 SCOPE PASS head=${head} predecessor=${BASE} closed-history=original-validator current-runtime=required release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(existsSync('docs/planning/m06-s05-execution.json')){
    execFileSync(process.execPath,[resolve('scripts/ci/m06-s05-scope.mjs')],{stdio:'inherit'});
  }else main();
}
