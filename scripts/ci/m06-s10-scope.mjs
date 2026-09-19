import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';

export const BASE='302ce5c9feb6b15a0897c54f982a6883f9e98344';
export const REVIEWED='157e5b5112d8a1bf99b2d25822e21132a4adb9ad';
export const PREVIOUS='b3584fca6e094331ca4c998493c1d6f68de89d4b';
export const TREE='2f42618986506e0ca62e1716210d850760b8f53d';
export const CONTRACT='e90ae158ee4d29ee600b8ee01c5dc7b3c518a164';
export const TEST_INDEX='6c3a21de8c4efff84890773b11eebd510fa428e8';
export const ACTIVATION='082a6f5d121b44b7dcfe82d8948b901cf94547d4';
export const RUNTIME_SPECS='9c41912c4c61bf508622093d96905c985ea34d21';
export const TYPE_SPECS='921d2ab0964e26d4c3ed126d22f078c4f08da806';
export const RECORD='docs/planning/m06-s10-execution.json';

export const NEW_FILES=Object.freeze([
  'docs/planning/M06_S10_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S10_TEST_INDEX.md','docs/planning/M06_S10_EXIT_EVIDENCE.md',RECORD,
  'packages/application/test/m06-s10-integration-evidence.test.ts','packages/application/test/m06-s10-types.compile.ts',
  'scripts/ci/m06-s10-scope.mjs','tests/m06_s10_scope_test.mjs','tests/m06_s10_integration_evidence_test.sh','.github/workflows/m06-s10-integration-evidence.yml'
]);
export const CHANGED_FILES=Object.freeze([
  'packages/application/package.json','packages/application/tsconfig.json',
  'scripts/ci/m06-s09-scope.mjs','scripts/ci/m06-s08-scope.mjs','scripts/ci/m06-s07-scope.mjs',
  'scripts/ci/m06-s06-scope.mjs','scripts/ci/m06-s05-scope.mjs','scripts/ci/m06-s04-scope.mjs'
]);

const REG=Object.freeze({
  4:{script:'test:m06s04',runtime:'test/m06-s04-renewal-case.test.ts',types:'test/m06-s04-types.compile.ts'},
  5:{script:'test:m06s05',runtime:'test/m06-s05-notification-policy.test.ts',types:'test/m06-s05-types.compile.ts'},
  6:{script:'test:m06s06',runtime:'test/m06-s06-dependency-graph.test.ts',types:'test/m06-s06-types.compile.ts'},
  7:{script:'test:m06s07',runtime:'test/m06-s07-selective-reevaluation.test.ts',types:'test/m06-s07-types.compile.ts'},
  8:{script:'test:m06s08',runtime:'test/m06-s08-continuous-compliance.test.ts',types:'test/m06-s08-types.compile.ts'},
  9:{script:'test:m06s09',runtime:'test/m06-s09-historical-replay.test.ts',types:'test/m06-s09-types.compile.ts'},
  10:{script:'test:m06s10',runtime:'test/m06-s10-integration-evidence.test.ts',types:'test/m06-s10-types.compile.ts'},
});

export function expectedRecord(){return {
  schema_version:1,decision_id:'CALPQ-M06-S10-EXEC-0001',milestone:'M06',slice:'S10',issue:158,state:'ACTIVE_AFTER_VERIFIED_PREDECESSOR',
  approval_text:'SCHVALUJI MERGE PR #157 A POKRAČOVÁNÍ NA M06 SLICE 10.',
  predecessor_pr:157,predecessor_head:REVIEWED,predecessor_merge:BASE,
  owner_approval_reference:'https://github.com/robertdominik618/calpq-os/pull/157#issuecomment-5743724372',
  post_merge_evidence_reference:'https://github.com/robertdominik618/calpq-os/pull/157#issuecomment-5744011994',
  contract_commit:CONTRACT,test_index_commit:TEST_INDEX,authorized_execution_entry:'M06_SLICE_10_INTEGRATION_EVIDENCE',authorized_slices:['S10'],
  m06_accepted_slices:9,v1_completed_plan_units:69,v1_total_plan_units:130,production_release_authorized:false,later_slices_authorized:false
};}
export function validateExecution(value){assert.deepEqual(value,expectedRecord(),'S10 execution must bind owner approval and verified S09 merge');}
export function validateDelta(entries){
  assert(Array.isArray(entries),'Delta array required');assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate path');
  for(const e of entries){
    assert.equal(e.mode,'100644');
    assert(NEW_FILES.includes(e.path)||CHANGED_FILES.includes(e.path),'Unauthorized S10 path');
    assert.equal(e.status,NEW_FILES.includes(e.path)?'A':'M','No deletion rename or historical replacement');
    assert(!e.path.startsWith('packages/application/src/'),'S10 may not add or modify Application business source');
  }
  assert.deepEqual(entries.map(e=>e.path).sort(),[...NEW_FILES,...CHANGED_FILES].sort(),'Complete exact18-file S10 evidence bundle required');
}

function generatedConfig(slice){
  const current=REG[slice];assert(current);
  const lines=["export function validateConfig(path,original,actual){","  const expected=structuredClone(original);"];
  for(let s=slice+1;s<=10;s++) lines.push(`  const s${String(s).padStart(2,'0')}=existsSync('docs/planning/m06-s${String(s).padStart(2,'0')}-execution.json');`);
  for(let s=slice+2;s<=10;s++) lines.push(`  if(s${String(s).padStart(2,'0')}&&!s${String(s-1).padStart(2,'0')}) throw new TypeError('S${String(s).padStart(2,'0')} requires activated S${String(s-1).padStart(2,'0')} predecessor');`);
  lines.push("  if(path==='packages/application/package.json'){");
  lines.push(`    assert(!Object.hasOwn(expected.scripts,'${current.script}'));expected.scripts['${current.script}']='node --test ${current.runtime}';`);
  for(let s=slice+1;s<=10;s++){const x=REG[s];lines.push(`    if(s${String(s).padStart(2,'0')}){assert(!Object.hasOwn(expected.scripts,'${x.script}'));expected.scripts['${x.script}']='node --test ${x.runtime}';}`);}
  lines.push("  }","  else if(path==='packages/application/tsconfig.json'){");
  lines.push(`    assert(!expected.include.includes('${current.types}'));expected.include.push('${current.types}');`);
  for(let s=slice+1;s<=10;s++){const x=REG[s];lines.push(`    if(s${String(s).padStart(2,'0')}){assert(!expected.include.includes('${x.types}'));expected.include.push('${x.types}');}`);}
  lines.push("  }","  else throw new TypeError('Unknown additive configuration');",`  assert.deepEqual(actual,expected,'Only exact additive S${String(slice).padStart(2,'0')} through activated successor configuration');`,"}");
  return lines.join('\n');
}

export function predecessorPatch(original,slice){
  assert(Number.isSafeInteger(slice)&&slice>=4&&slice<=9,'Supported predecessor slice');
  const marker='\nexport function validateConfig(path,original,actual){';
  const marked=original.lastIndexOf(marker);
  const start=marked<0?-1:marked+1;
  const end=original.indexOf('\nexport function validateIndex',start);
  assert(start>=0&&end>start,`S${String(slice).padStart(2,'0')} validateConfig segment required`);
  let output=original.slice(0,start)+generatedConfig(slice)+original.slice(end);
  const plainFsImport="import {mkdtempSync,rmSync} from 'node:fs';";
  const governedFsImport="import {mkdtempSync,rmSync,existsSync} from 'node:fs';";
  const lines=output.split('\n');
  const importIndex=lines.findIndex(line=>line===plainFsImport||line===governedFsImport);
  assert(importIndex>=0,`S${String(slice).padStart(2,'0')} top-level fs import required`);
  if(lines[importIndex]===plainFsImport) lines[importIndex]=governedFsImport;
  output=lines.join('\n');
  if(slice===9){
    const tail="if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();\n";
    assert(output.endsWith(tail),'Exact S09 terminal CLI required');
    output=output.slice(0,-tail.length)+"if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)){\n  if(existsSync('docs/planning/m06-s10-execution.json')){\n    execFileSync(process.execPath,[resolve('scripts/ci/m06-s10-scope.mjs')],{stdio:'inherit'});\n  }else main();\n}\n";
  }
  return output;
}
export function validatePredecessorPatch(original,actual,slice){assert.equal(actual,predecessorPatch(original,slice),`Only exact S${String(slice).padStart(2,'0')} S10 successor compatibility patch permitted`);}

export function validateConfig(path,original,actual){
  const expected=structuredClone(original);
  if(path==='packages/application/package.json'){assert(!Object.hasOwn(expected.scripts,'test:m06s10'));expected.scripts['test:m06s10']='node --test test/m06-s10-integration-evidence.test.ts';}
  else if(path==='packages/application/tsconfig.json'){assert(!expected.include.includes('test/m06-s10-types.compile.ts'));expected.include.push('test/m06-s10-types.compile.ts');}
  else throw new TypeError('Unknown additive configuration');
  assert.deepEqual(actual,expected,'Only exact additive S10 test registration');
}
export function validateIndex(value){assert.deepEqual([...value.matchAll(/^\| (M06S10-\d{3}) \|/gm)].map(m=>m[1]),Array.from({length:136},(_,i)=>`M06S10-${String(i+1).padStart(3,'0')}`),'136 ordered mandatory integration scenarios required');}

function git(...args){return execFileSync('git',args,{encoding:'utf8',maxBuffer:36*1024*1024});}
function at(ref,path){return git('show',`${ref}:${path}`);}
function ancestor(a,b){git('merge-base','--is-ancestor',a,b);}
function changes(a,b){const raw=git('diff','--name-status','--no-renames',`${a}...${b}`).trim();return raw?raw.split('\n').map(line=>{const [status,path,...extra]=line.split('\t');assert.equal(extra.length,0);return {status,path,mode:git('ls-tree',b,'--',path).trim().split(' ')[0]};}):[];}
function verifyClosedScope(){
  const folder=mkdtempSync(join(tmpdir(),'calpq-m06s10-history-')),worktree=join(folder,'closed-s09');let added=false;
  try{git('worktree','add','--detach','--quiet',worktree,BASE);added=true;
    const log=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s09-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:36*1024*1024});
    assert(log.includes(`M06 S09 SCOPE PASS head=${BASE}`),'Original closed S09 governance must pass');
  }finally{if(added)git('worktree','remove','--force',worktree);rmSync(folder,{recursive:true,force:true});}
}

export function main(){
  process.chdir(fileURLToPath(new URL('../../',import.meta.url)));
  const currentHead=git('rev-parse','HEAD').trim();
  if(existsSync('docs/planning/m07-admission-preparation.json')){
    ancestor('f71bc084e6dc7778a13b0ad80b7637f6663005f8',currentHead);
    execFileSync(process.execPath,[resolve('scripts/ci/m07-admission-preparation.mjs')],{stdio:'inherit'});
    const folder=mkdtempSync(join(tmpdir(),'calpq-m06s10-m07-successor-')),worktree=join(folder,'closed-m06');let added=false;
    try{
      git('worktree','add','--detach','--quiet',worktree,'f71bc084e6dc7778a13b0ad80b7637f6663005f8');added=true;
      const log=execFileSync(process.execPath,[join(worktree,'scripts/ci/m06-s10-scope.mjs')],{cwd:worktree,encoding:'utf8',maxBuffer:36*1024*1024});
      assert(log.includes('M06 S10 SCOPE PASS head=f71bc084e6dc7778a13b0ad80b7637f6663005f8'),'Original accepted M06 S10 scope must pass');
    }finally{
      if(added)git('worktree','remove','--force',worktree);
      rmSync(folder,{recursive:true,force:true});
    }
    console.log(`M06 S10 SCOPE PASS closed-head=f71bc084e6dc7778a13b0ad80b7637f6663005f8 successor=M07_PREPARATION current=${currentHead}`);
    return currentHead;
  }
  const head=currentHead;assert.equal(git('status','--porcelain','--untracked-files=no').trim(),'','Clean tracked checkout');
  for(const ref of [BASE,REVIEWED,PREVIOUS,CONTRACT,TEST_INDEX,ACTIVATION,RUNTIME_SPECS,TYPE_SPECS])ancestor(ref,head);
  assert.equal(git('show','-s','--format=%P',BASE).trim(),`${PREVIOUS} ${REVIEWED}`,'Actual S09 merge parents required');
  for(const ref of [BASE,REVIEWED])assert.equal(git('rev-parse',`${ref}^{tree}`).trim(),TREE,'Reviewed/merged S09 tree equality required');
  verifyClosedScope();validateDelta(changes(BASE,head));validateExecution(JSON.parse(at(head,RECORD)));
  assert.equal(git('rev-list',`${BASE}..${head}`,'--',RECORD).trim().split('\n').length,1,'S10 execution record immutable');
  for(const slice of [9,8,7,6,5,4])validatePredecessorPatch(at(BASE,`scripts/ci/m06-s${String(slice).padStart(2,'0')}-scope.mjs`),at(head,`scripts/ci/m06-s${String(slice).padStart(2,'0')}-scope.mjs`),slice);
  for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(at(BASE,path)),JSON.parse(at(head,path)));
  validateIndex(at(head,'docs/planning/M06_S10_TEST_INDEX.md'));
  for(const ref of [CONTRACT,TEST_INDEX,ACTIVATION])ancestor(ref,RUNTIME_SPECS);
  for(const ref of [CONTRACT,TEST_INDEX,ACTIVATION])ancestor(ref,TYPE_SPECS);
  for(const path of ['docs/planning/M06_S10_IMPLEMENTATION_CONTRACT.md','docs/planning/M06_S10_TEST_INDEX.md','docs/planning/M06_S10_EXIT_EVIDENCE.md','packages/application/test/m06-s10-integration-evidence.test.ts','packages/application/test/m06-s10-types.compile.ts'])assert(at(head,path).trim());
  assert.equal(git('diff','--name-only',`${BASE}...${head}`,'--','packages/application/src').trim(),'','S10 must not modify Application business source');
  for(const path of ['docs/planning/m06-s09-execution.json','docs/planning/m06-s08-execution.json','docs/planning/m06-s07-execution.json','docs/planning/m06-s06-execution.json','docs/planning/m06-s05-execution.json','docs/planning/m06-s04-execution.json','docs/planning/m06-s03-execution.json','docs/planning/m06-s02-execution.json','docs/planning/m06-s01-activation.json','docs/planning/m06-admission-decision.json'])assert.equal(at(head,path),at(BASE,path),'Historical decisions unchanged');
  console.log(`M06 S10 SCOPE PASS head=${head} predecessor=${BASE} closed-history=original-s09-validator source=unchanged release=false`);
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
