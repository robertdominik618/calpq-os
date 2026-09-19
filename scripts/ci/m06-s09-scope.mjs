import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BASE='b3584fca6e094331ca4c998493c1d6f68de89d4b';
export const REVIEWED='4f5d28cf20fe18d2a6d9fcca1e971f11a484523f';
export const PREVIOUS='8608b3fbb1cfc5d443162e720cc73849eee91b91';
export const TREE='355d31ef8392ed2789942f1be44af33dbd89f510';
export const CONTRACT='077761bd39eb8fe4b34d07a8740662711e7944b6';
export const TEST_INDEX='acdd1b4334bc5c4f67fe9da0c12da2e8a5dbcc8c';
export const ACTIVATION='a3250bcc6d9d3027194d78a77f7019b9f1d6e99c';
export const RUNTIME_SPECS='71b9334494928693e47711d13932215de9625e91';
export const TYPE_SPECS='6adf9ba7c71369c70a0a42981a49ccd8ebee27f1';
export const RECORD='docs/planning/m06-s09-execution.json';

export const NEW_FILES=Object.freeze([
  'docs/planning/M06_S09_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S09_TEST_INDEX.md','docs/planning/M06_S09_EXIT_EVIDENCE.md',RECORD,
  'packages/application/src/lifecycle/historical-replay.ts','packages/application/test/m06-s09-historical-replay.test.ts','packages/application/test/m06-s09-types.compile.ts',
  'scripts/ci/m06-s09-scope.mjs','tests/m06_s09_scope_test.mjs','tests/m06_s09_historical_replay_test.sh','.github/workflows/m06-s09-historical-replay.yml'
]);
export const CHANGED_FILES=Object.freeze([
  'packages/application/src/lifecycle/index.ts','packages/application/package.json','packages/application/tsconfig.json',
  'scripts/ci/m06-s08-scope.mjs','scripts/ci/m06-s07-scope.mjs','scripts/ci/m06-s06-scope.mjs','scripts/ci/m06-s05-scope.mjs','scripts/ci/m06-s04-scope.mjs'
]);

export const INDEX_APPEND="export { LifecycleHistoricalDecisionAnchor, LifecycleReplaySnapshot, LifecycleReplayDivergenceReason, LifecycleHistoricalReplay, LifecycleReplayMode, LifecycleHistoricalReplayTargetType, LifecycleReplayAvailability, LifecycleHistoricalReplayOutcome, LifecycleHistoricalReplayComparisonOutcome, LifecycleReplayDivergenceReasonKind, LifecycleReplayDifferenceKind, HISTORICAL_REPLAY_OPERATION, HISTORICAL_REPLAY_FIELD } from './historical-replay.ts';\nexport type { LifecycleHistoricalDecisionAnchorInput, LifecycleHistoricalDecisionAnchorView, LifecycleReplaySnapshotInput, LifecycleReplaySnapshotView, LifecycleReplayDivergenceReasonInput, LifecycleReplayDivergenceReasonView, LifecycleHistoricalReplayResultView, LifecycleReplayDifferenceView, LifecycleHistoricalReplayComparisonView, LifecycleHistoricalReplayInput, LifecycleHistoricalReplayView } from './historical-replay.ts';\n";

const REG=Object.freeze({
  4:{script:'test:m06s04',runtime:'test/m06-s04-renewal-case.test.ts',types:'test/m06-s04-types.compile.ts'},
  5:{script:'test:m06s05',runtime:'test/m06-s05-notification-policy.test.ts',types:'test/m06-s05-types.compile.ts'},
  6:{script:'test:m06s06',runtime:'test/m06-s06-dependency-graph.test.ts',types:'test/m06-s06-types.compile.ts'},
  7:{script:'test:m06s07',runtime:'test/m06-s07-selective-reevaluation.test.ts',types:'test/m06-s07-types.compile.ts'},
  8:{script:'test:m06s08',runtime:'test/m06-s08-continuous-compliance.test.ts',types:'test/m06-s08-types.compile.ts'},
  9:{script:'test:m06s09',runtime:'test/m06-s09-historical-replay.test.ts',types:'test/m06-s09-types.compile.ts'},
});

export function expectedRecord(){return {
  schema_version:1,decision_id:'CALPQ-M06-S09-EXEC-0001',milestone:'M06',slice:'S09',issue:156,state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',
  approval_text:'SCHVALUJI MERGE PR #155 (Pull Request č. 155 – návrh na sloučení změn) A POKRAČOVÁNÍ NA M06 (milník 06) SLICE 09 (implementační část 09).',
  predecessor_pr:155,predecessor_head:REVIEWED,predecessor_merge:BASE,predecessor_tree:TREE,
  owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/155#issuecomment-5742809954',
  post_merge_evidence_reference:'https://github.com/robertdominik618/calpq-os/pull/155#issuecomment-5742901218',
  contract_commit:CONTRACT,test_index_commit:TEST_INDEX,authorized_execution_entry:'M06_SLICE_09_HISTORICAL_REPLAY',authorized_slices:['S09'],
  m06_accepted_slices:8,v1_completed_plan_units:68,v1_total_plan_units:130,production_release_authorized:false,later_slices_authorized:false
};}
export function validateExecution(value){assert.deepEqual(value,expectedRecord(),'S09 execution must bind owner approval and verified S08 merge');}
export function validateDelta(entries){
  assert(Array.isArray(entries),'Delta array required');assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate path');
  for(const e of entries){assert.equal(e.mode,'100644');assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S09 path');assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion rename or historical replacement');}
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Complete exact19-file S09 bundle required');
}

function generatedConfig(slice){
  const current=REG[slice];assert(current);
  const lines=["export function validateConfig(path,original,actual){","  const expected=structuredClone(original);"];
  for(let s=slice+1;s<=9;s++) lines.push(`  const s0${s}=existsSync('docs/planning/m06-s0${s}-execution.json');`);
  for(let s=slice+2;s<=9;s++) lines.push(`  if(s0${s}&&!s0${s-1}) throw new TypeError('S0${s} requires activated S0${s-1} predecessor');`);
  lines.push("  if(path==='packages/application/package.json'){");
  lines.push(`    assert(!Object.hasOwn(expected.scripts,'${current.script}'));expected.scripts['${current.script}']='node --test ${current.runtime}';`);
  for(let s=slice+1;s<=9;s++){const x=REG[s];lines.push(`    if(s0${s}){assert(!Object.hasOwn(expected.scripts,'${x.script}'));expected.scripts['${x.script}']='node --test ${x.runtime}';}`);}
  lines.push("  }","  else if(path==='packages/application/tsconfig.json'){");
  lines.push(`    assert(!expected.include.includes('${current.types}'));expected.include.push('${current.types}');`);
  for(let s=slice+1;s<=9;s++){const x=REG[s];lines.push(`    if(s0${s}){assert(!expected.include.includes('${x.types}'));expected.include.push('${x.types}');}`);}
  lines.push("  }","  else throw new TypeError('Unknown additive configuration');",`  assert.deepEqual(actual,expected,'Only exact additive S0${slice} through activated successor configuration');`,"}");
  return lines.join('\n');
}

export function predecessorPatch(original,slice){
  assert(Number.isSafeInteger(slice)&&slice>=4&&slice<=8,'Supported predecessor slice');
  const marker='\nexport function validateConfig(path,original,actual){';
  const marked=original.lastIndexOf(marker);
  const start=marked<0?-1:marked+1;
  const end=original.indexOf('\nexport function validateIndex',start);
  assert(start>=0&&end>start,`S0${slice} validateConfig segment required`);
  let output=original.slice(0,start)+generatedConfig(slice)+original.slice(end);
  const plainFsImport="import {mkdtempSync,rmSync} from 'node:fs';";
  const governedFsImport="import {mkdtempSync,rmSync,existsSync} from 'node:fs';";
  const lines=output.split('\n');
  const importIndex=lines.findIndex(line=>line===plainFsImport||line===governedFsImport);
  assert(importIndex>=0,`S0${slice} top-level fs import required`);
  if(lines[importIndex]===plainFsImport) lines[importIndex]=governedFsImport;
  output=lines.join('\n');
  if(slice===8){
    const tail="if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();\n";
    assert(output.endsWith(tail),'Exact S08 terminal CLI required');
    output=output.slice(0,-tail.length)+"if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){\n  if(existsSync('docs/planning/m06-s09-execution.json')){\n    execFileSync(process.execPath,[resolve('scripts/ci/m06-s09-scope.mjs')],{stdio:'inherit'});\n  }else main();\n}\n";
  }
  return output;
}
export function validatePredecessorPatch(original,actual,slice){assert.equal(actual,predecessorPatch(original,slice),`Only exact S0${slice} successor compatibility patch permitted`);}

export function validateConfig(path,original,actual){
  const expected=structuredClone(original);
  const s10=existsSync('docs/planning/m06-s10-execution.json');
  if(path==='packages/application/package.json'){
    assert(!Object.hasOwn(expected.scripts,'test:m06s09'));expected.scripts['test:m06s09']='node --test test/m06-s09-historical-replay.test.ts';
    if(s10){assert(!Object.hasOwn(expected.scripts,'test:m06s10'));expected.scripts['test:m06s10']='node --test test/m06-s10-integration-evidence.test.ts';}
  }
  else if(path==='packages/application/tsconfig.json'){
    assert(!expected.include.includes('test/m06-s09-types.compile.ts'));expected.include.push('test/m06-s09-types.compile.ts');
    if(s10){assert(!expected.include.includes('test/m06-s10-types.compile.ts'));expected.include.push('test/m06-s10-types.compile.ts');}
  }
  else throw new TypeError('Unknown additive configuration');
  assert.deepEqual(actual,expected,'Only exact additive S09 through activated successor configuration');
}
export function validateIndex(value){assert.deepEqual([...value.matchAll(/^\| (M06S09-\d{3}) \|/gm)].map(m=>m[1]),Array.from({length:128},(_,i)=>`M06S09-${String(i+1).padStart(3,'0')}`),'128 ordered mandatory scenarios required');}
export function validateBarrel(original,actual){assert.equal(actual,original+INDEX_APPEND,'Only exact additive historical replay exports');}

function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:32*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}
function verifyClosedScope(){
  const folder=mkdtempSync(join(tmpdir(),'calpq-m06s09-history-')),worktree=join(folder,'closed-s08');let added=false;
  try{git('worktree','add','--detach','--quiet',worktree,BASE);added=true;
    const log=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s08-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:32*1024*1024});
    assert(log.includes(`M06 S08 SCOPE PASS head=${BASE}`),'Original closed S08 governance must pass');
  }finally{if(added)git('worktree','remove','--force',worktree);rmSync(folder,{recursive:true,force:true});}
}

export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const head=git('rev-parse','HEAD').trim();assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Clean tracked checkout');
  for(const ref of [BASE,REVIEWED,PREVIOUS,CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,head);
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${PREVIOUS} ${REVIEWED}`,'Actual S08 merge parents required');
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE,'Reviewed/merged S08 tree equality required');
  verifyClosedScope();validateDelta(changes(BASE,head));validateExecution(JSON.parse(at(head,RECORD)));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'S09 execution record immutable');
  for(const slice of [8,7,6,5,4])validatePredecessorPatch(at(BASE,`scripts/ci/m06-s0${slice}-scope.mjs`),at(head,`scripts/ci/m06-s0${slice}-scope.mjs`),slice);
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  validateBarrel(at(BASE,'packages/application/src/lifecycle/index.ts'),at(head,'packages/application/src/lifecycle/index.ts'));
  validateIndex(at(head,'docs/planning/M06_S09_TEST_INDEX.md'));
  const first=git('rev-list','--reverse',`${BASE}..${head}`,'--','packages/application/src/lifecycle/historical-replay.ts').trim().split('\n')[0];assert(first);
  for(const ref of [CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,`${first}^`);
  assert.equal(at(`${first}^`,RECORD),at(head,RECORD),'Actual S09 activation must precede source');
  for(const path of ['docs/planning/M06_S09_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S09_TEST_INDEX.md','docs/planning/M06_S09_EXIT_EVIDENCE.md','packages/application/test/m06-s09-historical-replay.test.ts','packages/application/test/m06-s09-types.compile.ts'])assert(at(`${first}^`,path).trim());
  for(const path of ['docs/planning/m06-s08-execution.json','docs/planning/m06-s07-execution.json','docs/planning/m06-s06-execution.json','docs/planning/m06-s05-execution.json','docs/planning/m06-s04-execution.json','docs/planning/m06-s03-execution.json','docs/planning/m06-s02-execution.json','docs/planning/m06-s01-activation.json','docs/planning/m06-admission-decision.json'])assert.equal(at(head,path),at(BASE,path),'Historical decisions unchanged');
  assert.equal(git('rev-parse','HEAD').trim(),head);
  console.log(`M06 S09 SCOPE PASS head=${head} predecessor=${BASE} closed-history=original-s08-validator current-runtime=required release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  if(existsSync('docs/planning/m06-s10-execution.json')){
    execFileSync(process.execPath,[resolve('scripts/ci/m06-s10-scope.mjs')],{stdio:'inherit'});
  }else main();
}
