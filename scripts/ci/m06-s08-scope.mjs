import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BASE='8608b3fbb1cfc5d443162e720cc73849eee91b91';
export const REVIEWED='7b74ff2f76ab924cca278e62ef25c5115a6b652e';
export const PREVIOUS='471ba0042d4ce44dec4a123ad2ebe4746f57c1ba';
export const TREE='43ce67e03f14610478d61e9b087b982058f8f21b';
export const CONTRACT='9d13ca4e2d229cfe97add1eba8348c0654ac28c8';
export const TEST_INDEX='67f18a0157432faecfa1f1ae52e2fd71ce8d110c';
export const ACTIVATION='5e5fe4724a20bb818f72153f21022c742691776c';
export const RUNTIME_SPECS='e6ace349e9c4f3c5fabc8235a3096ab45636820a';
export const TYPE_SPECS='724bf3fcbf61c97d16f2ef36ce7e6baa0340a014';
export const RECORD='docs/planning/m06-s08-execution.json';
export const NEW_FILES=Object.freeze([
  'docs/planning/M06_S08_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S08_TEST_INDEX.md','docs/planning/M06_S08_EXIT_EVIDENCE.md',RECORD,
  'packages/application/src/lifecycle/continuous-compliance.ts','packages/application/test/m06-s08-continuous-compliance.test.ts','packages/application/test/m06-s08-types.compile.ts',
  'scripts/ci/m06-s08-scope.mjs','tests/m06_s08_scope_test.mjs','tests/m06_s08_continuous_compliance_test.sh','.github/workflows/m06-s08-continuous-compliance.yml'
]);
export const CHANGED_FILES=Object.freeze([
  'packages/application/src/lifecycle/index.ts','packages/application/package.json','packages/application/tsconfig.json',
  'scripts/ci/m06-s07-scope.mjs','scripts/ci/m06-s06-scope.mjs','scripts/ci/m06-s05-scope.mjs','scripts/ci/m06-s04-scope.mjs'
]);
export const INDEX_APPEND="export { ContinuousComplianceScope, ContinuousComplianceConditionFact, ContinuousComplianceProjection, ContinuousComplianceScopeKind, ContinuousComplianceConditionType, ContinuousComplianceConditionState, ContinuousComplianceTiming, ContinuousComplianceSourceKind, ContinuousComplianceStatus, CONTINUOUS_COMPLIANCE_OPERATION, CONTINUOUS_COMPLIANCE_FIELD } from './continuous-compliance.ts';\nexport type { ContinuousComplianceScopeInput, ContinuousComplianceScopeView, ContinuousComplianceConditionFactInput, ContinuousComplianceConditionFactView, ContinuousComplianceProjectionInput, ContinuousComplianceSourceVersionView, ContinuousComplianceProjectionView } from './continuous-compliance.ts';\n";

export function expectedRecord(){return {
  schema_version:1,
  decision_id:'CALPQ-M06-S08-EXEC-0001',
  milestone:'M06',
  slice:'S08',
  issue:154,
  state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',
  approval_text:'SCHVALUJI MERGE PR #153 (Pull Request č. 153 – návrh na sloučení změn) A POKRAČOVÁNÍ NA M06 (milník 06) SLICE 08 (implementační část 08).',
  predecessor_pr:153,
  predecessor_head:REVIEWED,
  predecessor_merge:BASE,
  owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/153#issuecomment-5742239029',
  post_merge_evidence_reference:'https://github.com/robertdominik618/calpq-os/pull/153#issuecomment-5742334875',
  contract_commit:CONTRACT,
  test_index_commit:TEST_INDEX,
  authorized_execution_entry:'M06_SLICE_08_CONTINUOUS_COMPLIANCE',
  authorized_slices:['S08'],
  m06_accepted_slices:7,
  v1_completed_plan_units:67,
  v1_total_plan_units:130,
  production_release_authorized:false,
  later_slices_authorized:false
};}
export function validateExecution(value){assert.deepEqual(value,expectedRecord(),'S08 execution must bind owner approval and verified S07 merge');}
export function validateDelta(entries){
  assert(Array.isArray(entries),'Delta array required');assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate path');
  for(const e of entries){assert.equal(e.mode,'100644');assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S08 path');assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion rename or historical replacement');}
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Complete exact18-file S08 bundle required');
}

export function s07SuccessorPatch(original){
  const marker="import {mkdtempSync,rmSync} from 'node:fs';",tail="if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();\n";
  const old=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  if(path==='packages/application/package.json'){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}",
    "  else if(path==='packages/application/tsconfig.json'){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,'Only exact additive S07 configuration');",
    "}"
  ].join('\n');
  const next=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const successor=existsSync('docs/planning/m06-s08-execution.json');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';",
    "    if(successor){assert(!Object.hasOwn(expected.scripts,'test:m06s08'));expected.scripts['test:m06s08']='node --test test/m06-s08-continuous-compliance.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');",
    "    if(successor){assert(!expected.include.includes('test/m06-s08-types.compile.ts'));expected.include.push('test/m06-s08-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,successor?'Only exact additive S07 plus activated S08 configuration':'Only exact additive S07 configuration');",
    "}"
  ].join('\n');
  assert(original.includes(marker),'Exact S07 fs import marker required');assert(original.endsWith(tail),'Exact S07 terminal CLI required');assert(original.includes(old),'Exact S07 config guard required');
  const prefix=original.slice(0,-tail.length).replace(marker,"import {mkdtempSync,rmSync,existsSync} from 'node:fs';").replace(old,next);
  return prefix+"if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){\n  if(existsSync('docs/planning/m06-s08-execution.json')){\n    execFileSync(process.execPath,[resolve('scripts/ci/m06-s08-scope.mjs')],{stdio:'inherit'});\n  }else main();\n}\n";
}
export function validateS07Successor(original,actual){assert.equal(actual,s07SuccessorPatch(original),'Only exact S07 successor patch permitted');}

export function s06SuccessorPatch(original){
  const old=[
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
  const next=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const s07=existsSync('docs/planning/m06-s07-execution.json');",
    "  const s08=existsSync('docs/planning/m06-s08-execution.json');",
    "  if(s08&&!s07) throw new TypeError('S08 requires activated S07 predecessor');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';",
    "    if(s07){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}",
    "    if(s08){assert(!Object.hasOwn(expected.scripts,'test:m06s08'));expected.scripts['test:m06s08']='node --test test/m06-s08-continuous-compliance.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');",
    "    if(s07){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}",
    "    if(s08){assert(!expected.include.includes('test/m06-s08-types.compile.ts'));expected.include.push('test/m06-s08-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,s08?'Only exact additive S06 plus activated S07/S08 configuration':s07?'Only exact additive S06 plus activated S07 configuration':'Only exact additive S06 configuration');",
    "}"
  ].join('\n');
  assert(original.includes(old),'Exact activated S06 config guard required');
  return original.replace(old,next);
}
export function validateS06Successor(original,actual){assert.equal(actual,s06SuccessorPatch(original),'Only exact S06 successor config patch permitted');}

export function s05SuccessorPatch(original){
  const old=[
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
  const next=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const s06=existsSync('docs/planning/m06-s06-execution.json');",
    "  const s07=existsSync('docs/planning/m06-s07-execution.json');",
    "  const s08=existsSync('docs/planning/m06-s08-execution.json');",
    "  if(s07&&!s06) throw new TypeError('S07 requires activated S06 predecessor');",
    "  if(s08&&!s07) throw new TypeError('S08 requires activated S07 predecessor');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';",
    "    if(s06){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}",
    "    if(s07){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}",
    "    if(s08){assert(!Object.hasOwn(expected.scripts,'test:m06s08'));expected.scripts['test:m06s08']='node --test test/m06-s08-continuous-compliance.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');",
    "    if(s06){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}",
    "    if(s07){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}",
    "    if(s08){assert(!expected.include.includes('test/m06-s08-types.compile.ts'));expected.include.push('test/m06-s08-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,s08?'Only exact additive S05 plus activated S06/S07/S08 configuration':s07?'Only exact additive S05 plus activated S06/S07 configuration':s06?'Only exact additive S05 plus activated S06 configuration':'Only exact additive S05 configuration');",
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
  const next=[
    "export function validateConfig(path,original,actual){",
    "  const expected=structuredClone(original);",
    "  const s05=existsSync('docs/planning/m06-s05-execution.json');",
    "  const s06=existsSync('docs/planning/m06-s06-execution.json');",
    "  const s07=existsSync('docs/planning/m06-s07-execution.json');",
    "  const s08=existsSync('docs/planning/m06-s08-execution.json');",
    "  if(s06&&!s05) throw new TypeError('S06 requires activated S05 predecessor');",
    "  if(s07&&!s06) throw new TypeError('S07 requires activated S06 predecessor');",
    "  if(s08&&!s07) throw new TypeError('S08 requires activated S07 predecessor');",
    "  if(path==='packages/application/package.json'){",
    "    assert(!Object.hasOwn(expected.scripts,'test:m06s04'));expected.scripts['test:m06s04']='node --test test/m06-s04-renewal-case.test.ts';",
    "    if(s05){assert(!Object.hasOwn(expected.scripts,'test:m06s05'));expected.scripts['test:m06s05']='node --test test/m06-s05-notification-policy.test.ts';}",
    "    if(s06){assert(!Object.hasOwn(expected.scripts,'test:m06s06'));expected.scripts['test:m06s06']='node --test test/m06-s06-dependency-graph.test.ts';}",
    "    if(s07){assert(!Object.hasOwn(expected.scripts,'test:m06s07'));expected.scripts['test:m06s07']='node --test test/m06-s07-selective-reevaluation.test.ts';}",
    "    if(s08){assert(!Object.hasOwn(expected.scripts,'test:m06s08'));expected.scripts['test:m06s08']='node --test test/m06-s08-continuous-compliance.test.ts';}",
    "  }",
    "  else if(path==='packages/application/tsconfig.json'){",
    "    assert(!expected.include.includes('test/m06-s04-types.compile.ts'));expected.include.push('test/m06-s04-types.compile.ts');",
    "    if(s05){assert(!expected.include.includes('test/m06-s05-types.compile.ts'));expected.include.push('test/m06-s05-types.compile.ts');}",
    "    if(s06){assert(!expected.include.includes('test/m06-s06-types.compile.ts'));expected.include.push('test/m06-s06-types.compile.ts');}",
    "    if(s07){assert(!expected.include.includes('test/m06-s07-types.compile.ts'));expected.include.push('test/m06-s07-types.compile.ts');}",
    "    if(s08){assert(!expected.include.includes('test/m06-s08-types.compile.ts'));expected.include.push('test/m06-s08-types.compile.ts');}",
    "  }",
    "  else throw new TypeError('Unknown additive configuration');",
    "  assert.deepEqual(actual,expected,s08?'Only exact additive S04 plus activated S05/S06/S07/S08 configuration':s07?'Only exact additive S04 plus activated S05/S06/S07 configuration':s06?'Only exact additive S04 plus activated S05/S06 configuration':s05?'Only exact additive S04 plus activated S05 configuration':'Only exact additive S04 configuration');",
    "}"
  ].join('\n');
  assert(original.includes(old),'Exact activated S04 config guard required');
  return original.replace(old,next);
}
export function validateS04Successor(original,actual){assert.equal(actual,s04SuccessorPatch(original),'Only exact S04 successor config patch permitted');}

export function validateConfig(path,original,actual){
  const expected=structuredClone(original);
  const s09=existsSync('docs/planning/m06-s09-execution.json');
  if(path==='packages/application/package.json'){
    assert(!Object.hasOwn(expected.scripts,'test:m06s08'));expected.scripts['test:m06s08']='node --test test/m06-s08-continuous-compliance.test.ts';
    if(s09){assert(!Object.hasOwn(expected.scripts,'test:m06s09'));expected.scripts['test:m06s09']='node --test test/m06-s09-historical-replay.test.ts';}
  }
  else if(path==='packages/application/tsconfig.json'){
    assert(!expected.include.includes('test/m06-s08-types.compile.ts'));expected.include.push('test/m06-s08-types.compile.ts');
    if(s09){assert(!expected.include.includes('test/m06-s09-types.compile.ts'));expected.include.push('test/m06-s09-types.compile.ts');}
  }
  else throw new TypeError('Unknown additive configuration');
  assert.deepEqual(actual,expected,'Only exact additive S08 through activated successor configuration');
}
export function validateIndex(value){assert.deepEqual([...value.matchAll(/^\| (M06S08-\d{3}) \|/gm)].map(m=>m[1]),Array.from({length:120},(_,i)=>`M06S08-${String(i+1).padStart(3,'0')}`),'120 ordered mandatory scenarios required');}
export function validateBarrel(original,actual){assert.equal(actual,original+INDEX_APPEND,'Only exact additive continuous compliance exports');}

function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:28*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}
function verifyClosedScope(){
  const folder=mkdtempSync(join(tmpdir(),'calpq-m06s08-history-')),worktree=join(folder,'closed-s07');let added=false;
  try{git('worktree','add','--detach','--quiet',worktree,BASE);added=true;
    const log=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s07-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:28*1024*1024});
    assert(log.includes(`M06 S07 SCOPE PASS head=${BASE}`),'Original closed S07 governance must pass');
  }finally{if(added)git('worktree','remove','--force',worktree);rmSync(folder,{recursive:true,force:true});}
}

export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Clean tracked checkout');
  for(const ref of [BASE,REVIEWED,PREVIOUS,CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,head);
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${PREVIOUS} ${REVIEWED}`,'Actual S07 merge parents required');
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE,'Reviewed/merged S07 tree equality required');
  verifyClosedScope();validateDelta(changes(BASE,head));validateExecution(JSON.parse(at(head,RECORD)));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'S08 execution record immutable');
  validateS07Successor(at(BASE,'scripts/ci/m06-s07-scope.mjs'),at(head,'scripts/ci/m06-s07-scope.mjs'));
  validateS06Successor(at(BASE,'scripts/ci/m06-s06-scope.mjs'),at(head,'scripts/ci/m06-s06-scope.mjs'));
  validateS05Successor(at(BASE,'scripts/ci/m06-s05-scope.mjs'),at(head,'scripts/ci/m06-s05-scope.mjs'));
  validateS04Successor(at(BASE,'scripts/ci/m06-s04-scope.mjs'),at(head,'scripts/ci/m06-s04-scope.mjs'));
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  validateBarrel(at(BASE,'packages/application/src/lifecycle/index.ts'),at(head,'packages/application/src/lifecycle/index.ts'));
  validateIndex(at(head,'docs/planning/M06_S08_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${BASE}..${head}`,'--','packages/application/src/lifecycle/continuous-compliance.ts').trim().split('\n')[0];assert(first);
  for(const ref of [CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,`${first}^`);
  assert.equal(at(`${first}^`,RECORD),at(head,RECORD),'Actual S08 activation must precede source');
  for(const path of ['docs/planning/M06_S08_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S08_TEST_INDEX.md','docs/planning/M06_S08_EXIT_EVIDENCE.md','packages/application/test/m06-s08-continuous-compliance.test.ts','packages/application/test/m06-s08-types.compile.ts'])assert(at(`${first}^`,path).trim());
  for(const path of ['docs/planning/m06-s07-execution.json','docs/planning/m06-s06-execution.json','docs/planning/m06-s05-execution.json','docs/planning/m06-s04-execution.json','docs/planning/m06-s03-execution.json','docs/planning/m06-s02-execution.json','docs/planning/m06-s01-activation.json','docs/planning/m06-admission-decision.json'])assert.equal(at(head,path),at(BASE,path),'Historical decisions unchanged');
  assert.equal(git('rev-parse','HEAD').trim(),head);
  console.log(`M06 S08 SCOPE PASS head=${head} predecessor=${BASE} closed-history=original-s07-validator current-runtime=required release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(existsSync('docs/planning/m06-s09-execution.json')){
    execFileSync(process.execPath,[resolve('scripts/ci/m06-s09-scope.mjs')],{stdio:'inherit'});
  }else main();
}
