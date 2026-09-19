import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BASE='471ba0042d4ce44dec4a123ad2ebe4746f57c1ba';
export const REVIEWED='21c4a48df955852a8e316106f2a8fa9966a9e76c';
export const PREVIOUS='ca84ec7939471130c72a9a6463d94695d0637ddb';
export const TREE='4ab3b34de96fbed547581d75b0e9aea6848f3b79';
export const CONTRACT='b1da2b7eca36f78a6c54b883fc0c98e06cff3427';
export const TEST_INDEX='c6ea7845484922da355a510e9d9297c12d85765a';
export const ACTIVATION='37be2e06755c20ac167be3b84f29179aa4c4719a';
export const RUNTIME_SPECS='75b2715d051e0dee89c4e90b68c186e98ce00010';
export const TYPE_SPECS='827fde5c3050e48a74a067594a775f27e267f59c';
export const RECORD='docs/planning/m06-s07-execution.json';
export const NEW_FILES=Object.freeze([
  'docs/planning/M06_S07_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S07_TEST_INDEX.md','docs/planning/M06_S07_EXIT_EVIDENCE.md',RECORD,
  'packages/application/src/lifecycle/selective-reevaluation.ts','packages/application/test/m06-s07-selective-reevaluation.test.ts','packages/application/test/m06-s07-types.compile.ts',
  'scripts/ci/m06-s07-scope.mjs','tests/m06_s07_scope_test.mjs','tests/m06_s07_selective_reevaluation_test.sh','.github/workflows/m06-s07-selective-reevaluation.yml'
]);
export const CHANGED_FILES=Object.freeze([
  'packages/application/src/lifecycle/index.ts','packages/application/package.json','packages/application/tsconfig.json',
  'scripts/ci/m06-s06-scope.mjs','scripts/ci/m06-s05-scope.mjs','scripts/ci/m06-s04-scope.mjs'
]);
export const INDEX_APPEND="export { LifecycleReevaluationFact, LifecycleSelectiveReevaluation, LifecycleReevaluationFactState, LifecycleReevaluationOutcome, LifecycleReevaluationBatchOutcome, SELECTIVE_REEVALUATION_OPERATION, SELECTIVE_REEVALUATION_FIELD } from './selective-reevaluation.ts';\nexport type { LifecycleReevaluationVersionBindingInput, LifecycleReevaluationVersionBinding, LifecycleReevaluationFactInput, SelectiveReevaluationInput, LifecycleReevaluationDecisionView, SelectiveReevaluationView } from './selective-reevaluation.ts';\n";

export function expectedRecord(){return {
  schema_version:1,
  decision_id:'CALPQ-M06-S07-EXEC-0001',
  milestone:'M06',
  slice:'S07',
  issue:152,
  state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',
  approval_text:'SCHVALUJI MERGE PR #151 A POKRAČOVÁNÍ NA M06 SLICE 07.',
  predecessor_pr:151,
  predecessor_head:REVIEWED,
  predecessor_merge:BASE,
  owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/151#issuecomment-5741674605',
  post_merge_evidence_reference:'https://github.com/robertdominik618/calpq-os/pull/151#issuecomment-5741732658',
  contract_commit:CONTRACT,
  test_index_commit:TEST_INDEX,
  authorized_execution_entry:'M06_SLICE_07_SELECTIVE_REEVALUATION',
  authorized_slices:['S07'],
  m06_accepted_slices:6,
  v1_completed_plan_units:66,
  v1_total_plan_units:130,
  production_release_authorized:false,
  later_slices_authorized:false
};}
export function validateExecution(value){assert.deepEqual(value,expectedRecord(),'S07 execution must bind owner approval and verified S06 merge');}
export function validateDelta(entries){
  assert(Array.isArray(entries),'Delta array required');assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate path');
  for(const e of entries){assert.equal(e.mode,'100644');assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S07 path');assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion rename or historical replacement');}
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Complete exact17-file S07 bundle required');
}
export function s06SuccessorPatch(original){
  const marker="import {mkdtempSync,rmSync} from 'node:fs';",tail="if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();\n";
  const old=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  if(path==='packages/application/package.json'){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}",
    "  else if(path==='packages/application/tsconfig.json'){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,'Only exact additive S06 configuration');",
    "}"
  ].join('\n');
  const next=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const successor=existsSync('docs/planning/m06-s07-execution.json');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';",
    "    if(successor){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');",
    "    if(successor){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,successor?'Only exact additive S06 plus activated S07 configuration':'Only exact additive S06 configuration');",
    "}"
  ].join('\n');
  assert.equal(original.split(marker).length,2);assert(original.endsWith(tail),'Exact S06 terminal CLI required');assert(original.includes(old),'Exact S06 config guard required');
  const prefix=original.slice(0,-tail.length).replace(marker,"import {mkdtempSync,rmSync,existsSync} from 'node:fs';").replace(old,next);
  return prefix+"if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){\n  if(existsSync('docs/planning/m06-s07-execution.json')){\n    execFileSync(process.execPath,[resolve('scripts/ci/m06-s07-scope.mjs')],{stdio:'inherit'});\n  }else main();\n}\n";
}
export function validateS06Successor(original,actual){assert.equal(actual,s06SuccessorPatch(original),'Only exact S06 successor patch permitted');}

export function s05SuccessorPatch(original){
  const old=[
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
  const next=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const s06=existsSync('docs/planning/m06-s06-execution.json');",
    "  const s07=existsSync('docs/planning/m06-s07-execution.json');",
    "  if(s07&&!s06) throw new TypeError('S07 requires activated S06 predecessor');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';",
    "    if(s06){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}",
    "    if(s07){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');",
    "    if(s06){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}",
    "    if(s07){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,s07?'Only exact additive S05 plus activated S06/S07 configuration':s06?'Only exact additive S05 plus activated S06 configuration':'Only exact additive S05 configuration');",
    "}"
  ].join('\n');
  assert(original.includes(old),'Exact activated S05 config guard required');
  return original.replace(old,next);
}
export function validateS05Successor(original,actual){assert.equal(actual,s05SuccessorPatch(original),'Only exact S05 successor config patch permitted');}

export function s04SuccessorPatch(original){
  const old=[
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
  const next=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const s05=existsSync('docs/planning/m06-s05-execution.json');",
    "  const s06=existsSync('docs/planning/m06-s06-execution.json');",
    "  const s07=existsSync('docs/planning/m06-s07-execution.json');",
    "  if(s06&&!s05) throw new TypeError('S06 requires activated S05 predecessor');",
    "  if(s07&&!s06) throw new TypeError('S07 requires activated S06 predecessor');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s04'));expected.scripts['test:m06s04']='node --test test/m06-s04-renewal-case.test.ts';",
    "    if(s05){assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';}",
    "    if(s06){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}",
    "    if(s07){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s04-types.compile.ts'));expected.include.push('test/m06-s04-types.compile.ts');",
    "    if(s05){assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');}",
    "    if(s06){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}",
    "    if(s07){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,s07?'Only exact additive S04 plus activated S05/S06/S07 configuration':s06?'Only exact additive S04 plus activated S05/S06 configuration':s05?'Only exact additive S04 plus activated S05 configuration':'Only exact additive S04 configuration');",
    "}"
  ].join('\n');
  assert(original.includes(old),'Exact activated S04 config guard required');
  return original.replace(old,next);
}
export function validateS04Successor(original,actual){assert.equal(actual,s04SuccessorPatch(original),'Only exact S04 successor config patch permitted');}

export function validateConfig(path,original,actual){
  const expected=structuredClone(original);
  if(path==='packages/application/package.json'){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}
  else if(path==='packages/application/tsconfig.json'){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}
  else throw new TypeError('Unknown additive configuration');
  assert.deepEqual(actual,expected,'Only exact additive S07 configuration');
}
export function validateIndex(value){assert.deepEqual([...value.matchAll(/^\| (M06S07-\d{3}) \|/gm)].map(m=>m[1]),Array.from({length:112},(_,i)=>`M06S07-${String(i+1).padStart(3,'0')}`),'112 ordered mandatory scenarios required');}
export function validateBarrel(original,actual){assert.equal(actual,original+INDEX_APPEND,'Only exact additive selective reevaluation exports');}

function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:24*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}
function verifyClosedScope(){
  const folder=mkdtempSync(join(tmpdir(),'calpq-m06s07-history-')),worktree=join(folder,'closed-s06');let added=false;
  try{git('worktree','add','--detach','--quiet',worktree,BASE);added=true;
    const log=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s06-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:24*1024*1024});
    assert(log.includes(`M06 S06 SCOPE PASS head=${BASE}`),'Original closed S06 governance must pass');
  }finally{if(added)git('worktree','remove','--force',worktree);rmSync(folder,{recursive:true,force:true});}
}

export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Clean tracked checkout');
  for(const ref of [BASE,REVIEWED,PREVIOUS,CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,head);
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${PREVIOUS} ${REVIEWED}`,'Actual S06 merge parents required');
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE,'Reviewed/merged S06 tree equality required');
  verifyClosedScope();validateDelta(changes(BASE,head));validateExecution(JSON.parse(at(head,RECORD)));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'S07 execution record immutable');
  validateS06Successor(at(BASE,'scripts/ci/m06-s06-scope.mjs'),at(head,'scripts/ci/m06-s06-scope.mjs'));
  validateS05Successor(at(BASE,'scripts/ci/m06-s05-scope.mjs'),at(head,'scripts/ci/m06-s05-scope.mjs'));
  validateS04Successor(at(BASE,'scripts/ci/m06-s04-scope.mjs'),at(head,'scripts/ci/m06-s04-scope.mjs'));
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  validateBarrel(at(BASE,'packages/application/src/lifecycle/index.ts'),at(head,'packages/application/src/lifecycle/index.ts'));
  validateIndex(at(head,'docs/planning/M06_S07_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${BASE}..${head}`,'--','packages/application/src/lifecycle/selective-reevaluation.ts').trim().split('\n')[0];assert(first);
  for(const ref of [CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,`${first}^`);
  assert.equal(at(`${first}^`,RECORD),at(head,RECORD),'Actual S07 activation must precede source');
  for(const path of ['docs/planning/M06_S07_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S07_TEST_INDEX.md','docs/planning/M06_S07_EXIT_EVIDENCE.md','packages/application/test/m06-s07-selective-reevaluation.test.ts','packages/application/test/m06-s07-types.compile.ts'])assert(at(`${first}^`,path).trim());
  for(const path of ['docs/planning/m06-s06-execution.json','docs/planning/m06-s05-execution.json','docs/planning/m06-s04-execution.json','docs/planning/m06-s03-execution.json','docs/planning/m06-s02-execution.json','docs/planning/m06-s01-activation.json','docs/planning/m06-admission-decision.json'])assert.equal(at(head,path),at(BASE,path),'Historical decisions unchanged');
  assert.equal(git('rev-parse','HEAD').trim(),head);
  console.log(`M06 S07 SCOPE PASS head=${head} predecessor=${BASE} closed-history=original-s06-validator current-runtime=required release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
