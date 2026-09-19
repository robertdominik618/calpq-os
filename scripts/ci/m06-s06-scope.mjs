import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BASE='ca84ec7939471130c72a9a6463d94695d0637ddb';
export const REVIEWED='48e94a0018c056bdfce9c47d4b2fc131ad02b7e2';
export const PREVIOUS='fcf790578396fcf15f546531d648beca0db3b56d';
export const TREE='c21398136a965049aeb846ad0d0878b62bd1d511';
export const CONTRACT='0cc4f5d93306add2fc91a77a6d8bdd7badb89409';
export const TEST_INDEX='21e48a5eaf4900625aece15162360364785acd1a';
export const ACTIVATION='e3009d94ffb5f1e4a3cc06045063f9a8dd5ff55e';
export const RUNTIME_SPECS='12b5cdd4d6c022a8d9489bd653bb93d2f2b20c1e';
export const TYPE_SPECS='50241247bdf89f0edddf5c106314b1c121609200';
export const RECORD='docs/planning/m06-s06-execution.json';
export const NEW_FILES=Object.freeze([
  'docs/planning/M06_S06_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S06_TEST_INDEX.md','docs/planning/M06_S06_EXIT_EVIDENCE.md',RECORD,
  'packages/application/src/lifecycle/dependency-graph.ts','packages/application/test/m06-s06-dependency-graph.test.ts','packages/application/test/m06-s06-types.compile.ts',
  'scripts/ci/m06-s06-scope.mjs','tests/m06_s06_scope_test.mjs','tests/m06_s06_dependency_graph_test.sh','.github/workflows/m06-s06-dependency-graph.yml'
]);
export const CHANGED_FILES=Object.freeze(['packages/application/src/lifecycle/index.ts','packages/application/package.json','packages/application/tsconfig.json','scripts/ci/m06-s05-scope.mjs','scripts/ci/m06-s04-scope.mjs']);
export const INDEX_APPEND="export { LifecycleDependencyNode, LifecycleDependencyEdge, LifecycleDependencyGraphSnapshot, LifecycleChangeEvent, LifecycleDependencyImpactTraversal, LifecycleDependencyNodeType, LifecycleDependencyEdgeKind, LifecycleDependencyImpactMode, LifecycleChangeType, LifecycleDependencyImpactOutcome, DEPENDENCY_GRAPH_OPERATION, DEPENDENCY_GRAPH_FIELD } from './dependency-graph.ts';\nexport type { LifecycleDependencyNodeInput, LifecycleDependencyEdgeInput, LifecycleDependencyGraphSnapshotInput, LifecycleChangeEventInput, DependencyImpactTraversalInput, DependencyImpactPathView, DependencyImpactVersionView, DependencyImpactCandidateView, DependencyCycleView, DependencyImpactTraversalView } from './dependency-graph.ts';\n";

export function expectedRecord(){return {
  schema_version:1,
  decision_id:'CALPQ-M06-S06-EXEC-0001',
  milestone:'M06',
  slice:'S06',
  issue:150,
  state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',
  approval_text:'SCHVALUJI MERGE PR #148 A POKRAČOVÁNÍ NA M06 SLICE 06.',
  predecessor_pr:148,
  predecessor_head:REVIEWED,
  predecessor_merge:BASE,
  owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/148#issuecomment-5741019743',
  post_merge_evidence_reference:'https://github.com/robertdominik618/calpq-os/pull/148#issuecomment-5741092327',
  contract_commit:CONTRACT,
  test_index_commit:TEST_INDEX,
  authorized_execution_entry:'M06_SLICE_06_DEPENDENCY_GRAPH',
  authorized_slices:['S06'],
  m06_accepted_slices:5,
  v1_completed_plan_units:65,
  v1_total_plan_units:130,
  production_release_authorized:false,
  later_slices_authorized:false
};}
export function validateExecution(value){assert.deepEqual(value,expectedRecord(),'S06 execution must bind owner approval and verified S05 merge');}
export function validateDelta(entries){
  assert(Array.isArray(entries),'Delta array required');assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate path');
  for(const e of entries){assert.equal(e.mode,'100644');assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S06 path');assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion rename or historical replacement');}
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Complete exact16-file S06 bundle required');
}
export function dispatchPatch(original){
  const marker="import {mkdtempSync,rmSync} from 'node:fs';",tail="if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();\n";
  const oldConfig=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  if(path==='packages/application/package.json'){assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';}",
    "  else if(path==='packages/application/tsconfig.json'){assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');}",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,'Only exact additive S05 configuration');",
    "}"
  ].join('\n');
  const successorConfig=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const successor=existsSync('docs/planning/m06-s06-execution.json');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';",
    "    if(successor){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');",
    "    if(successor){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,successor?'Only exact additive S05 plus activated S06 configuration':'Only exact additive S05 configuration');",
    "}"
  ].join('\n');
  assert.equal(original.split(marker).length,3);assert(original.endsWith(tail),'Exact S05 terminal CLI required');assert(original.includes(oldConfig),'Exact S05 config guard required');
  const prefix=original.slice(0,-tail.length).replace(marker,"import {mkdtempSync,rmSync,existsSync} from 'node:fs';").replace(oldConfig,successorConfig);
  return prefix+"if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){\n  if(existsSync('docs/planning/m06-s06-execution.json')){\n    execFileSync(process.execPath,[resolve('scripts/ci/m06-s06-scope.mjs')],{stdio:'inherit'});\n  }else main();\n}\n";
}
export function validateDispatch(original,actual){assert.equal(actual,dispatchPatch(original),'Only exact S06 successor dispatch permitted');}
export function s04SuccessorPatch(original){
  const old=[
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
  const next=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const s05=existsSync('docs/planning/m06-s05-execution.json');",
    "  const s06=existsSync('docs/planning/m06-s06-execution.json');",
    "  if(s06&&!s05) throw new TypeError('S06 requires activated S05 predecessor');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s04'));expected.scripts['test:m06s04']='node --test test/m06-s04-renewal-case.test.ts';",
    "    if(s05){assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';}",
    "    if(s06){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s04-types.compile.ts'));expected.include.push('test/m06-s04-types.compile.ts');",
    "    if(s05){assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');}",
    "    if(s06){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,s06?'Only exact additive S04 plus activated S05/S06 configuration':s05?'Only exact additive S04 plus activated S05 configuration':'Only exact additive S04 configuration');",
    "}"
  ].join('\n');
  assert(original.includes(old),'Exact activated S04 config guard required');
  return original.replace(old,next);
}
export function validateS04Successor(original,actual){assert.equal(actual,s04SuccessorPatch(original),'Only exact S04 successor config compatibility patch permitted');}
export function validateConfig(path,original,actual){
  const expected=structuredClone(original);
  const s07=existsSync('docs/planning/m06-s07-execution.json');
  const s08=existsSync('docs/planning/m06-s08-execution.json');
  const s09=existsSync('docs/planning/m06-s09-execution.json');
  const s10=existsSync('docs/planning/m06-s10-execution.json');
  if(s08&&!s07) throw new TypeError('S08 requires activated S07 predecessor');
  if(s09&&!s08) throw new TypeError('S09 requires activated S08 predecessor');
  if(s10&&!s09) throw new TypeError('S10 requires activated S09 predecessor');
  if(path==='packages/application/package.json'){
    assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';
    if(s07){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}
    if(s08){assert(!Object.hasOwn(expected.scripts,'test:m06s08'));expected.scripts['test:m06s08']='node --test test/m06-s08-continuous-compliance.test.ts';}
    if(s09){assert(!Object.hasOwn(expected.scripts,'test:m06s09'));expected.scripts['test:m06s09']='node --test test/m06-s09-historical-replay.test.ts';}
    if(s10){assert(!Object.hasOwn(expected.scripts,'test:m06s10'));expected.scripts['test:m06s10']='node --test test/m06-s10-integration-evidence.test.ts';}
  }
  else if(path==='packages/application/tsconfig.json'){
    assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');
    if(s07){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}
    if(s08){assert(!expected.include.includes('test/m06-s08-types.compile.ts'));expected.include.push('test/m06-s08-types.compile.ts');}
    if(s09){assert(!expected.include.includes('test/m06-s09-types.compile.ts'));expected.include.push('test/m06-s09-types.compile.ts');}
    if(s10){assert(!expected.include.includes('test/m06-s10-types.compile.ts'));expected.include.push('test/m06-s10-types.compile.ts');}
  }
  else throw new TypeError('Unknown additive configuration');
  assert.deepEqual(actual,expected,'Only exact additive S06 through activated successor configuration');
}
export function validateIndex(value){assert.deepEqual([...value.matchAll(/^\| (M06S06-\d{3}) \|/gm)].map(m=>m[1]),Array.from({length:104},(_,i)=>`M06S06-${String(i+1).padStart(3,'0')}`),'104 ordered mandatory scenarios required');}
export function validateBarrel(original,actual){assert.equal(actual,original+INDEX_APPEND,'Only exact additive dependency graph exports');}
function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:20*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}
function verifyClosedScope(){
  const folder=mkdtempSync(join(tmpdir(),'calpq-m06s06-history-')),worktree=join(folder,'closed-s05');let added=false;
  try{git('worktree','add','--detach','--quiet',worktree,BASE);added=true;
    const log=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s05-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:20*1024*1024});
    assert(log.includes(`M06 S05 SCOPE PASS head=${BASE}`),'Original closed S05 governance must pass');
  }finally{if(added)git('worktree','remove','--force',worktree);rmSync(folder,{recursive:true,force:true});}
}
export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Clean tracked checkout');
  for(const ref of [BASE,REVIEWED,PREVIOUS,CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,head);
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${PREVIOUS} ${REVIEWED}`,'Actual S05 merge parents required');
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE,'Reviewed/merged S05 tree equality required');
  verifyClosedScope();validateDelta(changes(BASE,head));validateExecution(JSON.parse(at(head,RECORD)));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'S06 execution record immutable');
  validateDispatch(at(BASE,'scripts/ci/m06-s05-scope.mjs'),at(head,'scripts/ci/m06-s05-scope.mjs'));
  validateS04Successor(at(BASE,'scripts/ci/m06-s04-scope.mjs'),at(head,'scripts/ci/m06-s04-scope.mjs'));
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  validateBarrel(at(BASE,'packages/application/src/lifecycle/index.ts'),at(head,'packages/application/src/lifecycle/index.ts'));
  validateIndex(at(head,'docs/planning/M06_S06_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${BASE}..${head}`,'--','packages/application/src/lifecycle/dependency-graph.ts').trim().split('\n')[0];assert(first);
  for(const ref of [CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,`${first}^`);
  assert.equal(at(`${first}^`,RECORD),at(head,RECORD),'Actual S06 activation must precede source');
  for(const path of ['docs/planning/M06_S06_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S06_TEST_INDEX.md','docs/planning/M06_S06_EXIT_EVIDENCE.md','packages/application/test/m06-s06-dependency-graph.test.ts','packages/application/test/m06-s06-types.compile.ts'])assert(at(`${first}^`,path).trim());
  for(const path of ['docs/planning/m06-s05-execution.json','docs/planning/m06-s04-execution.json','docs/planning/m06-s03-execution.json','docs/planning/m06-s02-execution.json','docs/planning/m06-s01-activation.json','docs/planning/m06-admission-decision.json'])assert.equal(at(head,path),at(BASE,path),'Historical decisions unchanged');
  assert.equal(git('rev-parse','HEAD').trim(),head);
  console.log(`M06 S06 SCOPE PASS head=${head} predecessor=${BASE} closed-history=original-s05-validator current-runtime=required release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(existsSync('docs/planning/m06-s07-execution.json')){
    execFileSync(process.execPath,[resolve('scripts/ci/m06-s07-scope.mjs')],{stdio:'inherit'});
  }else main();
}
