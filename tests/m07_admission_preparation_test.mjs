import test from 'node:test';
import assert from 'node:assert/strict';
import {
  expectedRecord, validateRecord, validateChanges, adaptS10, validateS10Patch,
  validateMatrix, validatePackage, validateSourceGovernance, validateBaseline,
  addedPaths, S10
} from '../scripts/ci/m07-admission-preparation.mjs';

const record=()=>structuredClone(expectedRecord());
const original='#!/usr/bin/env bash\nnode scripts/ci/m06-s10-scope.mjs\n\nruntime=x\nnode --test "$runtime"\n';
const matrix=Array.from({length:28},(_,i)=>`| M07PREP-${String(i+1).padStart(2,'0')} | requirement |`).join('\n');
const pkg='PLANNING COMPLETE / IMPLEMENTATION BLOCKED\n'+Array.from({length:10},(_,i)=>`${i+1}. Slice`).join('\n');
const governance='Status: `M00 FOUNDATION / NORMATIVE`\nID: `CALPQ-REG-0001`\nVERIFIED UNVERIFIED STALE/REVIEW_REQUIRED\nHistorical decisions retain the rule/source version used at the time.\nAI may help identify or explain a source, but does not by itself upgrade a rule to `VERIFIED`.';
const baseline='Status: `PLANNING ONLY / BLOCKED`\nA fetched text, AI summary or parser output is not itself a legal rule.\nRegulatory interpretation requiring legal/human judgment remains REVIEW_REQUIRED';

test('M07PREPTEST-01 exact preparation manifest accepted',()=>validateRecord(record()));
test('M07PREPTEST-02 implementation permission rejected',()=>{const r=record();r.implementation_authorized=true;assert.throws(()=>validateRecord(r));});
test('M07PREPTEST-03 false-like strings rejected',()=>{const r=record();r.implementation_authorized='false';assert.throws(()=>validateRecord(r));});
test('M07PREPTEST-04 formal admission state rejected',()=>{const r=record();r.state='ADMITTED_FOR_IMPLEMENTATION';assert.throws(()=>validateRecord(r));});
test('M07PREPTEST-05 invented admission approval rejected',()=>{const r=record();r.admission_approval={approved:true};assert.throws(()=>validateRecord(r));});
test('M07PREPTEST-06 active execution entry rejected',()=>{const r=record();r.authorized_execution_entry=r.proposed_execution_entry;assert.throws(()=>validateRecord(r));});
test('M07PREPTEST-07 merge release or legal authority rejected',()=>{for(const key of ['preparation_pr_merge_authorized','production_release_authorized','legal_interpretation_authorized']){const r=record();r[key]=true;assert.throws(()=>validateRecord(r));}});
test('M07PREPTEST-08 changed predecessor anchors rejected',()=>{for(const key of ['m06_accepted_merge','m06_accepted_tree','m06_reviewed_head','m04_reviewed_merge','m06_acceptance_comment','m06_post_merge_comment']){const r=record();r[key]='changed';assert.throws(()=>validateRecord(r));}});
test('M07PREPTEST-09 inflated M07 progress rejected',()=>{const r=record();r.m07_completed_slices=1;assert.throws(()=>validateRecord(r));});
test('M07PREPTEST-10 reduced M06 acceptance rejected',()=>{const r=record();r.m06_completed_slices=9;assert.throws(()=>validateRecord(r));});
test('M07PREPTEST-11 unknown or missing manifest keys rejected',()=>{const r=record();r.override=true;assert.throws(()=>validateRecord(r));const s=record();delete s.activation_condition;assert.throws(()=>validateRecord(s));assert.throws(()=>validateRecord(null));});
test('M07PREPTEST-12 missing next transition rejected',()=>{const r=record();r.next_transition_requirements.pop();assert.throws(()=>validateRecord(r));});
test('M07PREPTEST-13 exact additive preparation scope accepted',()=>validateChanges([...addedPaths.map(path=>({path,status:'A',mode:'100644'})),{path:S10,status:'M',mode:'100644'}]));
test('M07PREPTEST-14 product or unrelated paths rejected',()=>{for(const path of ['packages/core/src/regulatory/new.ts','packages/application/src/regulatory/new.ts','README.md','docs/planning/m07-admission-decision.json'])assert.throws(()=>validateChanges([{path,status:'A',mode:'100644'}]));});
test('M07PREPTEST-15 deletion rename copy and wrong mode rejected',()=>{for(const status of ['D','R100','C100','M'])assert.throws(()=>validateChanges([{path:addedPaths[0],status,mode:'100644'}]));for(const mode of ['100755','120000','160000'])assert.throws(()=>validateChanges([{path:addedPaths[0],status:'A',mode}]));});
test('M07PREPTEST-16 duplicate paths rejected',()=>assert.throws(()=>validateChanges(Array(2).fill({path:addedPaths[0],status:'A',mode:'100644'}))));
test('M07PREPTEST-17 exact M06 successor adaptation preserves runtime suffix',()=>{const adapted=adaptS10(original);validateS10Patch(original,adapted);assert(adapted.endsWith('runtime=x\nnode --test "$runtime"\n'));});
test('M07PREPTEST-18 removed runtime or bypass rejected',()=>{const adapted=adaptS10(original);assert.throws(()=>validateS10Patch(original,adapted.replace('node --test "$runtime"','true')));assert.throws(()=>validateS10Patch(original,'exit 0\n'+adapted));});
test('M07PREPTEST-19 ambiguous M06 scope marker rejected',()=>{assert.throws(()=>adaptS10('no marker'));assert.throws(()=>adaptS10(original+original));});
test('M07PREPTEST-20 exact 28-row matrix accepted',()=>validateMatrix(matrix));
test('M07PREPTEST-21 missing duplicate or reordered matrix rejected',()=>{assert.throws(()=>validateMatrix(matrix.split('\n').slice(1).join('\n')));assert.throws(()=>validateMatrix(matrix+'\n| M07PREP-28 | duplicate |'));assert.throws(()=>validateMatrix(matrix.split('\n').reverse().join('\n')));});
test('M07PREPTEST-22 blocked ten-slice package enforced',()=>{validatePackage(pkg);assert.throws(()=>validatePackage(pkg.replace('IMPLEMENTATION BLOCKED','ADMITTED_FOR_IMPLEMENTATION')));assert.throws(()=>validatePackage(pkg+'\n11. Extra'));});
test('M07PREPTEST-23 normative source governance enforced',()=>{validateSourceGovernance(governance);assert.throws(()=>validateSourceGovernance(governance.replace('UNVERIFIED','')));assert.throws(()=>validateSourceGovernance(governance.replace('does not by itself upgrade','may automatically upgrade')));});
test('M07PREPTEST-24 blocked source/review baseline enforced',()=>{validateBaseline(baseline);assert.throws(()=>validateBaseline(baseline.replace('PLANNING ONLY / BLOCKED','ADMITTED')));assert.throws(()=>validateBaseline(baseline.replace('REVIEW_REQUIRED','AUTO_ACCEPTED')));});
