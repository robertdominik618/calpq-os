import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {
  BASE,NEW_FILES,CHANGED_FILES,expectedRecord,validateExecution,validateDelta,
  predecessorPatch,validatePredecessorPatch,validateConfig,validateIndex
} from '../scripts/ci/m06-s10-scope.mjs';

const old=path=>execFileSync('git',['show',`${BASE}:${path}`],{encoding:'utf8'});
const delta=()=>[...NEW_FILES.map(path=>({path,status:'A',mode:'100644'})),...CHANGED_FILES.map(path=>({path,status:'M',mode:'100644'}))];
const mutate=(key,value)=>{const r=expectedRecord();r[key]=value;return r;};

test('M06S10G-01 exact S10 execution consistency passes',()=>{validateExecution(JSON.parse(readFileSync('docs/planning/m06-s10-execution.json','utf8')));});
test('M06S10G-02 changed owner approval rejected',()=>{assert.throws(()=>validateExecution(mutate('approval_text','approved')));});
test('M06S10G-03 changed predecessor merge rejected',()=>{assert.throws(()=>validateExecution(mutate('predecessor_merge','0'.repeat(40))));});
test('M06S10G-04 missing or extra execution keys rejected',()=>{const a=expectedRecord();delete a.issue;assert.throws(()=>validateExecution(a));assert.throws(()=>validateExecution({...expectedRecord(),extra:true}));});
test('M06S10G-05 expanded scope or release rejected',()=>{assert.throws(()=>validateExecution(mutate('authorized_slices',['S10','S11'])));assert.throws(()=>validateExecution(mutate('production_release_authorized',true)));});
test('M06S10G-06 progress inflation rejected',()=>{assert.throws(()=>validateExecution(mutate('v1_completed_plan_units',70)));assert.throws(()=>validateExecution(mutate('m06_accepted_slices',10)));});
test('M06S10G-07 invented post-merge evidence rejected',()=>{assert.throws(()=>validateExecution(mutate('post_merge_evidence_reference','https://example.invalid/proof')));});
test('M06S10G-08 complete exact18-file scope accepted',()=>{validateDelta(delta());});
test('M06S10G-09 Application source provider UI DB or historical edits rejected',()=>{for(const path of ['packages/application/src/lifecycle/new.ts','packages/provider/src/send.ts','packages/ui/src/view.ts','docs/planning/m06-s09-execution.json'])assert.throws(()=>validateDelta([...delta(),{path,status:'M',mode:'100644'}]));});
test('M06S10G-10 rename delete executable and symlink rejected',()=>{for(const patch of [{status:'D'},{status:'R'},{mode:'100755'},{mode:'120000'}]){const d=delta();d[0]={...d[0],...patch};assert.throws(()=>validateDelta(d));}});
test('M06S10G-11 duplicate or missing scope rejected',()=>{const d=delta();assert.throws(()=>validateDelta(d.slice(1)));assert.throws(()=>validateDelta([...d,d[0]]));});
test('M06S10G-12 exact S09 through S04 successor patches accepted',()=>{for(const slice of [9,8,7,6,5,4]){const path=`scripts/ci/m06-s${String(slice).padStart(2,'0')}-scope.mjs`,original=old(path);validatePredecessorPatch(original,predecessorPatch(original,slice),slice);}});
test('M06S10G-13 predecessor edits beyond exact patches rejected',()=>{for(const slice of [9,8,7,6,5,4]){const path=`scripts/ci/m06-s${String(slice).padStart(2,'0')}-scope.mjs`,original=old(path);assert.throws(()=>validatePredecessorPatch(original,predecessorPatch(original,slice)+'\n// extra',slice));}});
test('M06S10G-14 exact additive package and compile registrations pass',()=>{for(const path of ['packages/application/package.json','packages/application/tsconfig.json'])validateConfig(path,JSON.parse(old(path)),JSON.parse(readFileSync(path,'utf8')));});
test('M06S10G-15 historical config edits rejected and no lifecycle barrel change allowed',()=>{const path='packages/application/package.json',base=JSON.parse(old(path)),changed=JSON.parse(readFileSync(path,'utf8'));changed.name='other';assert.throws(()=>validateConfig(path,base,changed));assert.equal(readFileSync('packages/application/src/lifecycle/index.ts','utf8'),old('packages/application/src/lifecycle/index.ts'));});
test('M06S10G-16 missing duplicate reordered scenario identities rejected',()=>{const index=readFileSync('docs/planning/M06_S10_TEST_INDEX.md','utf8');validateIndex(index);assert.throws(()=>validateIndex(index.replace('| M06S10-001 |','| M06S10-002 |')));assert.throws(()=>validateIndex(index.replace('| M06S10-136 |','| M06S10-137 |')));});
