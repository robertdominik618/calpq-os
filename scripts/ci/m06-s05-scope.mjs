import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BASE='fcf790578396fcf15f546531d648beca0db3b56d';
export const REVIEWED='e0a4dd7f78b0531fbb03372282f464bb240ba427';
export const PREVIOUS='cd91c80806182fd2cd2b59a8937f180f23cf2ae3';
export const TREE='390bf9902ad7e533bc0f305335ff4e4d1062a093';
export const CONTRACT='a2e94beaafb921f6b59775f95928e4bfb0ee853c';
export const TEST_INDEX='098d1b325b30703bb0493009cc67f281f54e3351';
export const ACTIVATION='bfa421eeabbea90100beea1fc3cf4d0e339d49a6';
export const RUNTIME_SPECS='03be6d4d9d059ba3d6534f009f26a55f223a273f';
export const TYPE_SPECS='ebe56daab56f9239d954fb3acf433564a43eea7b';
export const RECORD='docs/planning/m06-s05-execution.json';
export const NEW_FILES=Object.freeze([
  'docs/planning/M06_S05_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S05_TEST_INDEX.md','docs/planning/M06_S05_EXIT_EVIDENCE.md',RECORD,
  'packages/application/src/lifecycle/notification-policy.ts','packages/application/test/m06-s05-notification-policy.test.ts','packages/application/test/m06-s05-types.compile.ts',
  'scripts/ci/m06-s05-scope.mjs','tests/m06_s05_scope_test.mjs','tests/m06_s05_notification_policy_test.sh','.github/workflows/m06-s05-notification-policy.yml'
]);
export const CHANGED_FILES=Object.freeze(['packages/application/src/lifecycle/index.ts','packages/application/package.json','packages/application/tsconfig.json','scripts/ci/m06-s04-scope.mjs']);
export const INDEX_APPEND="export { LifecycleNotificationPolicy, NotificationObservation, LifecycleNotificationProjection, NOTIFICATION_POLICY_OPERATION, NOTIFICATION_POLICY_FIELD } from './notification-policy.ts';\nexport type { LifecycleNotificationPolicyInput, NotificationStageInput, NotificationObservationInput, NotificationProjectionInput, NotificationTrigger, NotificationIntentKind, NotificationObservationKind, NotificationProjectionOutcome, NotificationProjectionView } from './notification-policy.ts';\n";
export function expectedRecord(){return {schema_version:1,decision_id:'CALPQ-M06-S05-EXEC-0001',milestone:'M06',slice:'S05',issue:147,state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',approval_text:'SCHVALUJI MERGE PR #146 A POKRAČOVÁNÍ NA M06 SLICE 05.',predecessor_pr:146,predecessor_head:REVIEWED,predecessor_merge:BASE,owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/146#issuecomment-5733919392',post_merge_evidence_reference:'https://github.com/robertdominik618/calpq-os/pull/146#issuecomment-5739663296',contract_commit:CONTRACT,test_index_commit:TEST_INDEX,authorized_execution_entry:'M06_SLICE_05_NOTIFICATION_POLICY',authorized_slices:['S05'],m06_accepted_slices:4,v1_completed_plan_units:64,v1_total_plan_units:130,production_release_authorized:false,later_slices_authorized:false};}
export function validateExecution(value){assert.deepEqual(value,expectedRecord(),'S05 execution must bind owner approval and verified S04 merge');}
export function validateDelta(entries){
  assert(Array.isArray(entries),'Delta array required');assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate path');
  for(const e of entries){assert.equal(e.mode,'100644');assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S05 path');assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion rename or historical replacement');}
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Complete exact15-file S05 bundle required');
}
export function dispatchPatch(original){
  const marker="import {mkdtempSync,rmSync} from 'node:fs';",tail="if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();\n";
  const oldConfig=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  if(path==='packages/application/package.json'){assert(!Object.hasOwn(expected.scripts,'test:m06s04'));expected.scripts['test:m06s04']='node --test test/m06-s04-renewal-case.test.ts';}",
    "  else if(path==='packages/application/tsconfig.json'){assert(!expected.include.includes('test/m06-s04-types.compile.ts'));expected.include.push('test/m06-s04-types.compile.ts');}",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,'Only exact additive S04 configuration');",
    "}"
  ].join('\n');
  const successorConfig=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const successor=existsSync('docs/planning/m06-s05-execution.json');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s04'));expected.scripts['test:m06s04']='node --test test/m06-s04-renewal-case.test.ts';",
    "    if(successor){assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s04-types.compile.ts'));expected.include.push('test/m06-s04-types.compile.ts');",
    "    if(successor){assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,successor?'Only exact additive S04 plus activated S05 configuration':'Only exact additive S04 configuration');",
    "}"
  ].join('\n');
  assert.equal(original.split(marker).length,2);assert(original.endsWith(tail),'Exact S04 terminal CLI required');assert(original.includes(oldConfig),'Exact S04 config guard required');
  const prefix=original.slice(0,-tail.length).replace(marker,"import {mkdtempSync,rmSync,existsSync} from 'node:fs';").replace(oldConfig,successorConfig);
  return prefix+"if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){\n  if(existsSync('docs/planning/m06-s05-execution.json')){\n    execFileSync(process.execPath,[resolve('scripts/ci/m06-s05-scope.mjs')],{stdio:'inherit'});\n  }else main();\n}\n";
}
export function validateDispatch(original,actual){assert.equal(actual,dispatchPatch(original),'Only exact S05 successor dispatch permitted');}
export function validateConfig(path,original,actual){
  const expected=structuredClone(original);
  const s06=existsSync('docs/planning/m06-s06-execution.json');
  const s07=existsSync('docs/planning/m06-s07-execution.json');
  if(s07&&!s06) throw new TypeError('S07 requires activated S06 predecessor');
  if(path==='packages/application/package.json'){
    assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';
    if(s06){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}
    if(s07){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}
  }
  else if(path==='packages/application/tsconfig.json'){
    assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');
    if(s06){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}
    if(s07){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}
  }
  else throw new TypeError('Unknown additive configuration');
  assert.deepEqual(actual,expected,s07?'Only exact additive S05 plus activated S06/S07 configuration':s06?'Only exact additive S05 plus activated S06 configuration':'Only exact additive S05 configuration');
}
export function validateIndex(value){assert.deepEqual([...value.matchAll(/^\| (M06S05-\d{2}) \|/gm)].map(m=>m[1]),Array.from({length:96},(_,i)=>`M06S05-${String(i+1).padStart(2,'0')}`),'96 ordered mandatory scenarios required');}
export function validateBarrel(original,actual){assert.equal(actual,original+INDEX_APPEND,'Only exact additive notification exports');}
function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}
function verifyClosedScope(){
  const folder=mkdtempSync(join(tmpdir(),'calpq-m06s05-history-')),worktree=join(folder,'closed-s04');let added=false;
  try{git('worktree','add','--detach','--quiet',worktree,BASE);added=true;
    const log=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s04-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:16*1024*1024});
    assert(log.includes(`M06 S04 SCOPE PASS head=${BASE}`),'Original closed S04 governance must pass');
  }finally{if(added)git('worktree','remove','--force',worktree);rmSync(folder,{recursive:true,force:true});}
}
export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Clean tracked checkout');
  for(const ref of [BASE,REVIEWED,PREVIOUS,CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,head);
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${PREVIOUS} ${REVIEWED}`,'Actual S04 merge parents required');
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE,'Reviewed/merged S04 tree equality required');
  verifyClosedScope();validateDelta(changes(BASE,head));validateExecution(JSON.parse(at(head,RECORD)));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'S05 execution record immutable');
  validateDispatch(at(BASE,'scripts/ci/m06-s04-scope.mjs'),at(head,'scripts/ci/m06-s04-scope.mjs'));
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  validateBarrel(at(BASE,'packages/application/src/lifecycle/index.ts'),at(head,'packages/application/src/lifecycle/index.ts'));
  validateIndex(at(head,'docs/planning/M06_S05_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${BASE}..${head}`,'--','packages/application/src/lifecycle/notification-policy.ts').trim().split('\n')[0];assert(first);
  for(const ref of [CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,`${first}^`);
  assert.equal(at(`${first}^`,RECORD),at(head,RECORD),'Actual S05 activation must precede source');
  for(const path of ['docs/planning/M06_S05_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S05_TEST_INDEX.md','packages/application/test/m06-s05-notification-policy.test.ts','packages/application/test/m06-s05-types.compile.ts'])assert(at(`${first}^`,path).trim());
  for(const path of ['docs/planning/m06-s04-execution.json','docs/planning/m06-s03-execution.json','docs/planning/m06-s02-execution.json','docs/planning/m06-s01-activation.json','docs/planning/m06-admission-decision.json'])assert.equal(at(head,path),at(BASE,path),'Historical decisions unchanged');
  assert.equal(git('rev-parse','HEAD').trim(),head);
  console.log(`M06 S05 SCOPE PASS head=${head} predecessor=${BASE} closed-history=original-s04-validator current-runtime=required release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(existsSync('docs/planning/m06-s06-execution.json')){
    execFileSync(process.execPath,[resolve('scripts/ci/m06-s06-scope.mjs')],{stdio:'inherit'});
  }else main();
}
