import test from 'node:test';
import assert from 'node:assert/strict';
import { ActorId, ActorKind, ActorReference, CorrelationId, SubjectId, SubjectKind, SubjectReference, UtcInstant, VersionId } from '../../core/src/index.ts';
import { AccessDecisionReference, AccessDisposition, ApplicationExecutionContext, ApplicationOperationReference, AuditReference, OrganizationScopeReference, PurposeReference, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext, TenantScopeReference } from '../src/index.ts';
import {
  HISTORICAL_REPLAY_FIELD,
  HISTORICAL_REPLAY_OPERATION,
  LifecycleHistoricalDecisionAnchor,
  LifecycleHistoricalReplay,
  LifecycleHistoricalReplayComparisonOutcome,
  LifecycleHistoricalReplayOutcome,
  LifecycleHistoricalReplayTargetType,
  LifecycleReplayAvailability,
  LifecycleReplayDivergenceReason,
  LifecycleReplayDivergenceReasonKind,
  LifecycleReplayMode,
  LifecycleReplaySnapshot,
} from '../src/lifecycle/historical-replay.ts';
import type {
  LifecycleHistoricalDecisionAnchorInput,
  LifecycleHistoricalReplayInput,
  LifecycleReplayDivergenceReasonInput,
  LifecycleReplaySnapshotInput,
} from '../src/lifecycle/historical-replay.ts';

const uuid=(n:number)=>'018f3f7e-dddd-7abc-8def-'+String(n).padStart(12,'0');
const at=(s:string)=>UtcInstant.from(s),V1=VersionId.from('v1');
const ORIGINAL_EVAL=at('2025-06-01T09:00:00Z'),ORIGINAL_KNOWN=at('2025-06-01T10:00:00Z');
const CURRENT_EVAL=at('2026-01-01T09:00:00Z'),CURRENT_KNOWN=at('2026-01-01T10:00:00Z'),REPLAYED=at('2026-01-02T00:00:00Z'),FUTURE=at('2026-02-01T00:00:00Z');
const human=(n:number)=>ActorReference.create(ActorId.from(uuid(n)),ActorKind.HUMAN_USER);
const OPERATOR=human(1),OTHER_ACTOR=human(2),GRANTOR=human(3),EVALUATOR=human(4);
const SUBJECT=SubjectReference.create(SubjectId.from(uuid(10)),SubjectKind.PERSON),OTHER_SUBJECT=SubjectReference.create(SubjectId.from(uuid(11)),SubjectKind.PERSON),SUBJECT_ORG=SubjectReference.create(SUBJECT.id,SubjectKind.ORGANIZATION);
const TENANT=TenantScopeReference.from('tenant:replay'),OTHER_TENANT=TenantScopeReference.from('tenant:other');
const ORG=OrganizationScopeReference.from('org:replay'),OTHER_ORG=OrganizationScopeReference.from('org:other');
const PURPOSE=PurposeReference.from('purpose:replay'),OTHER_PURPOSE=PurposeReference.from('purpose:other');
const CORR=CorrelationId.from(uuid(20)),OTHER_CORR=CorrelationId.from(uuid(21)),ACCESS=AccessDecisionReference.from('access:replay');

function anchor(overrides:Partial<LifecycleHistoricalDecisionAnchorInput>={}){
  return LifecycleHistoricalDecisionAnchor.create({
    reference:'anchor:1',targetType:LifecycleHistoricalReplayTargetType.CONTINUOUS_COMPLIANCE,targetReference:'target:1',originalDecisionReference:'decision:original',
    tenant:TENANT,organization:ORG,subject:SUBJECT,jurisdictionReference:'CZ',originalOutcome:'COMPLIANT',
    evaluatedAt:ORIGINAL_EVAL,asKnownAt:ORIGINAL_KN,
    ruleVersionReferences:['rule:v1'],sourceVersionReferences:['source:v1'],contractVersionReferences:['contract:v1'],evidenceReferences:['evidence:1'],
    provenanceReference:'prov:anchor',correlationReference:'corr:anchor',causationReference:'cause:anchor',implementationContractReference:'contract:impl:v1',inputComplete:true,
    ...overrides,
  });
}
function snapshot(mode:LifecycleReplayMode,a=anchor(),overrides:Partial<LifecycleReplaySnapshotInput>={}){
  const was=mode===LifecycleReplayMode.AS_WAS;
  return LifecycleReplaySnapshot.create({
    reference:was?'snapshot:was':'snapshot:is',mode,anchor:a,targetReference:a.targetReference,targetType:a.targetType,jurisdictionReference:a.jurisdictionReference,subject:a.subject,
    availability:LifecycleReplayAvailability.AVAILABLE,semanticOutcome:a.originalOutcome,
    evaluatedAt:was?a.evaluatedAt:CURRENT_EVAL,asKnownAt:was?a.asKnownAt:CURRENT_KNOWN,
    ruleVersionReferences:was?a.ruleVersionReferences:['rule:v1'],sourceVersionReferences:was?a.sourceVersionReferences:['source:v1'],contractVersionReferences:was?a.contractVersionReferences:['contract:v1'],evidenceReferences:was?a.evidenceReferences:['evidence:1'],
    evaluator:EVALUATOR,provenanceReference:was?'prov:was':'prov:is',correlationReference:'corr:anchor',causationReference:null,
    coreHistoricalReplayState:was?'FULL_SNAPSHOT_REPLAYED':null,s07DecisionReference:null,s08ProjectionReference:null,reasonCodes:['REPLAYED'],
    ...overrides,
  });
}
function divergence(mode:LifecycleReplayMode,reason:LifecycleReplayDivergenceReasonKind=LifecycleReplayDivergenceReasonKind.RULE_VERSION_CHANGED,overrides:Partial<LifecycleReplayDivergenceReasonInput>={}){
  return LifecycleReplayDivergenceReason.create({mode,reason,governedReference:'governed:reason',...overrides});
}
function context(overrides:Partial<Parameters<typeof ApplicationExecutionContext.create>[0]>={}){
  return ApplicationExecutionContext.create({operation:ApplicationOperationReference.from(HISTORICAL_REPLAY_OPERATION),actor:OPERATOR,subject:SUBJECT,tenantScope:TENANT,organizationScope:ORG,purpose:PURPOSE,correlationId:CORR,requestedAt:REPLAYED,contractVersion:V1,accessDecision:ACCESS,...overrides});
}
function reader(actor=OPERATOR,overrides:Partial<Parameters<typeof TenantContext.create>[0]>={}){
  return TenantContext.create({tenant:TENANT,organization:ORG,actor,purpose:PURPOSE,correlationId:CORR,...overrides});
}
function access(overrides:Partial<Parameters<typeof TenantAccessDecision.create>[0]>={}){
  return TenantAccessDecision.create({reference:ACCESS,tenant:TENANT,purpose:PURPOSE,disposition:AccessDisposition.ALLOW,allowedFields:[HISTORICAL_REPLAY_FIELD],decidedBy:GRANTOR,auditReference:AuditReference.from('audit:replay'),...overrides});
}
function input(a=anchor(),snaps?:readonly LifecycleReplaySnapshot[],overrides:Partial<LifecycleHistoricalReplayInput>={}):LifecycleHistoricalReplayInput{
  const values=snaps??[snapshot(LifecycleReplayMode.AS_WAS,a),snapshot(LifecycleReplayMode.AS_IS,a)];
  return {context:context(),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:access(),anchor:a,snapshots:values,requestedModes:[LifecycleReplayMode.AS_WAS,LifecycleReplayMode.AS_IS],divergenceReasons:[],correctiveReviewReference:null,replayedAt:REPLAYED,asKnownAt:CURRENT_KNOWN,maxSnapshots:2,maxDifferenceReferences:512,...overrides};
}
const run=(a=anchor(),snaps?:readonly LifecycleReplaySnapshot[],overrides:Partial<LifecycleHistoricalReplayInput>={})=>LifecycleHistoricalReplay.evaluate(input(a,snaps,overrides));

test('M06S09-001 immutable original decision anchor exact identity',()=>{const a=anchor();assert.equal(a.reference,'anchor:1');assert.equal(a.originalDecisionReference,'decision:original');assert(Object.isFrozen(a));});
test('M06S09-002 anchor reference required',()=>{assert.throws(()=>anchor({reference:''}));});
test('M06S09-003 controlled target type required',()=>{assert.throws(()=>anchor({targetType:'MAGIC' as never}));});
test('M06S09-004 original decision reference required',()=>{assert.throws(()=>anchor({originalDecisionReference:''}));});
test('M06S09-005 tenant and organization scope required',()=>{assert.throws(()=>anchor({tenant:{} as never}));assert.throws(()=>anchor({organization:{} as never}));});
test('M06S09-006 subject scope is governed when present',()=>{assert.throws(()=>anchor({subject:{} as never}));});
test('M06S09-007 jurisdiction reference required',()=>{assert.throws(()=>anchor({jurisdictionReference:''}));});
test('M06S09-008 original semantic outcome required',()=>{assert.throws(()=>anchor({originalOutcome:''}));});
test('M06S09-009 original evaluated-at explicit',()=>{assert.throws(()=>anchor({evaluatedAt:{} as never}));});
test('M06S09-010 original as-known-at explicit',()=>{assert.throws(()=>anchor({asKnownAt:{} as never}));});
test('M06S09-011 original evaluation cannot exceed knowledge horizon',()=>{assert.throws(()=>anchor({evaluatedAt:CURRENT_EVAL,asKnownAt:ORIGINAL_KNOWN}));});
test('M06S09-012 rule version references canonical',()=>{assert.deepEqual(anchor({ruleVersionReferences:['rule:z','rule:a']}).ruleVersionReferences,['rule:a','rule:z']);});
test('M06S09-013 source version references canonical',()=>{assert.deepEqual(anchor({sourceVersionReferences:['source:z','source:a']}).sourceVersionReferences,['source:a','source:z']);});
test('M06S09-014 contract version references canonical',()=>{assert.deepEqual(anchor({contractVersionReferences:['contract:z','contract:a']}).contractVersionReferences,['contract:a','contract:z']);});
test('M06S09-015 evidence references canonical',()=>{assert.deepEqual(anchor({evidenceReferences:['evidence:z','evidence:a']}).evidenceReferences,['evidence:a','evidence:z']);});
test('M06S09-016 duplicate rule version rejected',()=>{assert.throws(()=>anchor({ruleVersionReferences:['rule:a','rule:a']}));});
test('M06S09-017 duplicate source version rejected',()=>{assert.throws(()=>anchor({sourceVersionReferences:['source:a','source:a']}));});
test('M06S09-018 duplicate contract version rejected',()=>{assert.throws(()=>anchor({contractVersionReferences:['contract:a','contract:a']}));});
test('M06S09-019 duplicate evidence reference rejected',()=>{assert.throws(()=>anchor({evidenceReferences:['evidence:a','evidence:a']}));});
test('M06S09-020 anchor serialization safe and frozen',()=>{const v=anchor().toJSON();assert(Object.isFrozen(v));assert(Object.isFrozen(v.ruleVersionReferences));for(const bad of ['s3://','providerToken','@example.com'])assert(!JSON.stringify(v).includes(bad));});

test('M06S09-021 immutable replay snapshot exact mode binding',()=>{const a=anchor(),s=snapshot(LifecycleReplayMode.AS_WAS,a);assert.equal(s.mode,LifecycleReplayMode.AS_WAS);assert.equal(s.anchor,a);assert(Object.isFrozen(s));});
test('M06S09-022 unknown replay mode rejected',()=>{assert.throws(()=>snapshot('MAGIC' as never));});
test('M06S09-023 snapshot must bind exact anchor',()=>{assert.throws(()=>LifecycleReplaySnapshot.create({...snapshot(LifecycleReplayMode.AS_WAS).toInput(),anchor:{} as never}));});
test('M06S09-024 snapshot target reference must be governed',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{targetReference:''}));});
test('M06S09-025 snapshot target type controlled',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{targetType:'MAGIC' as never}));});
test('M06S09-026 snapshot availability state controlled',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{availability:'MAGIC' as never}));});
test('M06S09-027 available snapshot requires semantic outcome',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{semanticOutcome:null}));});
test('M06S09-028 unavailable snapshot forbids semantic outcome',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{availability:LifecycleReplayAvailability.INPUT_MISSING,semanticOutcome:'COMPLIANT'}));});
test('M06S09-029 snapshot evaluated-at explicit',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{evaluatedAt:{} as never}));});
test('M06S09-030 snapshot as-known-at explicit',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{asKnownAt:{} as never}));});
test('M06S09-031 snapshot knowledge cannot exceed evaluation horizon',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{evaluatedAt:ORIGINAL_EVAL,asKnownAt:CURRENT_KNOWN}));});
test('M06S09-032 snapshot rule versions canonical',()=>{assert.deepEqual(snapshot(LifecycleReplayMode.AS_IS,anchor(),{ruleVersionReferences:['rule:z','rule:a']}).ruleVersionReferences,['rule:a','rule:z']);});
test('M06S09-033 snapshot source versions canonical',()=>{assert.deepEqual(snapshot(LifecycleReplayMode.AS_IS,anchor(),{sourceVersionReferences:['source:z','source:a']}).sourceVersionReferences,['source:a','source:z']);});
test('M06S09-034 snapshot contract versions canonical',()=>{assert.deepEqual(snapshot(LifecycleReplayMode.AS_IS,anchor(),{contractVersionReferences:['contract:z','contract:a']}).contractVersionReferences,['contract:a','contract:z']);});
test('M06S09-035 snapshot evidence references canonical',()=>{assert.deepEqual(snapshot(LifecycleReplayMode.AS_IS,anchor(),{evidenceReferences:['evidence:z','evidence:a']}).evidenceReferences,['evidence:a','evidence:z']);});
test('M06S09-036 snapshot evaluator actor governed',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{evaluator:{} as never}));});
test('M06S09-037 snapshot provenance mandatory',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{provenanceReference:''}));});
test('M06S09-038 snapshot correlation mandatory',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,anchor(),{correlationReference:''}));});
test('M06S09-039 snapshot causation optional governed',()=>{const s=snapshot(LifecycleReplayMode.AS_IS,anchor(),{causationReference:'cause:x'});assert.equal(s.causationReference,'cause:x');});
test('M06S09-040 snapshot serialization safe and frozen',()=>{const v=snapshot(LifecycleReplayMode.AS_IS).toJSON();assert(Object.isFrozen(v));assert(Object.isFrozen(v.evidenceReferences));for(const bad of ['s3://','providerToken','rawBody'])assert(!JSON.stringify(v).includes(bad));});

test('M06S09-041 explicit scoped invocation required',()=>{assert.throws(()=>LifecycleHistoricalReplay.evaluate({...input(),context:{} as never}),TenantAccessDeniedError);});
test('M06S09-042 denial occurs before historical disclosure',()=>{assert.throws(()=>LifecycleHistoricalReplay.evaluate({...input(),anchor:{} as never,accessDecision:access({disposition:AccessDisposition.DENY})}),TenantAccessDeniedError);});
test('M06S09-043 cross-tenant replay denied',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({tenantScope:OTHER_TENANT})}),TenantAccessDeniedError);});
test('M06S09-044 cross-organization replay denied',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({organizationScope:OTHER_ORG})}),TenantAccessDeniedError);});
test('M06S09-045 foreign subject identity denied',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({subject:OTHER_SUBJECT})}),TenantAccessDeniedError);});
test('M06S09-046 foreign subject kind denied',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({subject:SUBJECT_ORG})}),TenantAccessDeniedError);});
test('M06S09-047 actor identity mismatch denied',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({actor:OTHER_ACTOR})}),TenantAccessDeniedError);});
test('M06S09-048 actor kind mismatch denied',()=>{const a=ActorReference.create(OPERATOR.id,ActorKind.SYSTEM_PROCESS);assert.throws(()=>run(anchor(),undefined,{context:context({actor:a})}),TenantAccessDeniedError);});
test('M06S09-049 purpose mismatch denied',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({purpose:OTHER_PURPOSE})}),TenantAccessDeniedError);});
test('M06S09-050 correlation mismatch denied',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({correlationId:OTHER_CORR})}),TenantAccessDeniedError);});
test('M06S09-051 replay operation required',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({operation:ApplicationOperationReference.from('wrong.operation')})}),TenantAccessDeniedError);});
test('M06S09-052 replay field authorization required',()=>{assert.throws(()=>run(anchor(),undefined,{accessDecision:access({allowedFields:['credential:other']})}),TenantAccessDeniedError);});
test('M06S09-053 access-decision reference must match',()=>{assert.throws(()=>run(anchor(),undefined,{context:context({accessDecision:AccessDecisionReference.from('access:other')})}),TenantAccessDeniedError);});
test('M06S09-054 anchor scope must match invocation',()=>{const a=anchor({tenant:OTHER_TENANT});assert.throws(()=>run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),snapshot(LifecycleReplayMode.AS_IS,a)]),TenantAccessDeniedError);});
test('M06S09-055 replayed-at explicit',()=>{assert.throws(()=>run(anchor(),undefined,{replayedAt:{} as never}));});
test('M06S09-056 request as-known horizon explicit',()=>{assert.throws(()=>run(anchor(),undefined,{asKnownAt:{} as never}));});
test('M06S09-057 replay horizon cannot exceed request time',()=>{assert.throws(()=>run(anchor(),undefined,{asKnownAt:FUTURE}));});
test('M06S09-058 replayed-at cannot predate current evaluation',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{evaluatedAt:FUTURE,asKnownAt:FUTURE});assert.throws(()=>run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]));});
test('M06S09-059 requested replay modes non-empty',()=>{assert.throws(()=>run(anchor(),[],{requestedModes:[]}));});
test('M06S09-060 duplicate requested mode rejected',()=>{assert.throws(()=>run(anchor(),[snapshot(LifecycleReplayMode.AS_WAS)],{requestedModes:[LifecycleReplayMode.AS_WAS,LifecycleReplayMode.AS_WAS]}));});

test('M06S09-061 AS_WAS exact original evaluation instant required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{evaluatedAt:CURRENT_EVAL,asKnownAt:CURRENT_KNOWN}));});
test('M06S09-062 AS_WAS exact original as-known horizon required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{asKnownAt:CURRENT_KNOWN}));});
test('M06S09-063 AS_WAS exact rule versions required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{ruleVersionReferences:['rule:v2']}));});
test('M06S09-064 AS_WAS exact source versions required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{sourceVersionReferences:['source:v2']}));});
test('M06S09-065 AS_WAS exact contract versions required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{contractVersionReferences:['contract:v2']}));});
test('M06S09-066 AS_WAS exact evidence set required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{evidenceReferences:['evidence:2']}));});
test('M06S09-067 AS_WAS exact target identity required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{targetReference:'target:other'}));});
test('M06S09-068 AS_WAS exact target type required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{targetType:LifecycleHistoricalReplayTargetType.RENEWAL_EVALUATION}));});
test('M06S09-069 AS_WAS exact jurisdiction required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{jurisdictionReference:'US'}));});
test('M06S09-070 AS_WAS exact subject scope required',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{subject:OTHER_SUBJECT}));});
test('M06S09-071 AS_WAS available equal outcome yields MATCH',()=>{const v=run().toJSON();assert.equal(v.results.find(x=>x.mode==='AS_WAS')!.outcome,LifecycleHistoricalReplayOutcome.MATCH);});
test('M06S09-072 AS_WAS available changed outcome with governed reason yields EXPLAINED_DIVERGENCE',()=>{const a=anchor(),was=snapshot(LifecycleReplayMode.AS_WAS,a,{semanticOutcome:'NON_COMPLIANT'}),is=snapshot(LifecycleReplayMode.AS_IS,a);const v=run(a,[was,is],{divergenceReasons:[divergence(LifecycleReplayMode.AS_WAS)]}).toJSON();assert.equal(v.results.find(x=>x.mode==='AS_WAS')!.outcome,LifecycleHistoricalReplayOutcome.EXPLAINED_DIVERGENCE);});
test('M06S09-073 AS_WAS changed outcome without reason requires review',()=>{const a=anchor(),was=snapshot(LifecycleReplayMode.AS_WAS,a,{semanticOutcome:'NON_COMPLIANT'});assert.equal(run(a,[was,snapshot(LifecycleReplayMode.AS_IS,a)]).toJSON().results[0]!.outcome,LifecycleHistoricalReplayOutcome.REVIEW_REQUIRED);});
test('M06S09-074 AS_WAS input-missing maps INPUT_MISSING',()=>{const a=anchor(),was=snapshot(LifecycleReplayMode.AS_WAS,a,{availability:LifecycleReplayAvailability.INPUT_MISSING,semanticOutcome:null});assert.equal(run(a,[was,snapshot(LifecycleReplayMode.AS_IS,a)]).toJSON().results[0]!.outcome,LifecycleHistoricalReplayOutcome.INPUT_MISSING);});
test('M06S09-075 AS_WAS version-unavailable maps VERSION_UNAVAILABLE',()=>{const a=anchor(),was=snapshot(LifecycleReplayMode.AS_WAS,a,{availability:LifecycleReplayAvailability.VERSION_UNAVAILABLE,semanticOutcome:null});assert.equal(run(a,[was,snapshot(LifecycleReplayMode.AS_IS,a)]).toJSON().results[0]!.outcome,LifecycleHistoricalReplayOutcome.VERSION_UNAVAILABLE);});
test('M06S09-076 AS_WAS review snapshot maps REVIEW_REQUIRED',()=>{const a=anchor(),was=snapshot(LifecycleReplayMode.AS_WAS,a,{availability:LifecycleReplayAvailability.REVIEW_REQUIRED,semanticOutcome:null});assert.equal(run(a,[was,snapshot(LifecycleReplayMode.AS_IS,a)]).toJSON().results[0]!.outcome,LifecycleHistoricalReplayOutcome.REVIEW_REQUIRED);});
test('M06S09-077 AS_WAS indeterminate snapshot maps INDETERMINATE',()=>{const a=anchor(),was=snapshot(LifecycleReplayMode.AS_WAS,a,{availability:LifecycleReplayAvailability.INDETERMINATE,semanticOutcome:null});assert.equal(run(a,[was,snapshot(LifecycleReplayMode.AS_IS,a)]).toJSON().results[0]!.outcome,LifecycleHistoricalReplayOutcome.INDETERMINATE);});
test('M06S09-078 AS_WAS current rule substitution rejected',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{ruleVersionReferences:['rule:current']}));});
test('M06S09-079 AS_WAS current evidence substitution rejected',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{evidenceReferences:['evidence:current']}));});
test('M06S09-080 AS_WAS future-known input rejected',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,a,{evaluatedAt:ORIGINAL_EVAL,asKnownAt:FUTURE}));});

test('M06S09-081 AS_IS keeps target identity',()=>{const a=anchor();assert.throws(()=>snapshot(LifecycleReplayMode.AS_IS,a,{targetReference:'target:other'}));});
test('M06S09-082 AS_IS may use changed rule versions',()=>{assert.deepEqual(snapshot(LifecycleReplayMode.AS_IS,anchor(),{ruleVersionReferences:['rule:v2']}).ruleVersionReferences,['rule:v2']);});
test('M06S09-083 AS_IS may use changed source versions',()=>{assert.deepEqual(snapshot(LifecycleReplayMode.AS_IS,anchor(),{sourceVersionReferences:['source:v2']}).sourceVersionReferences,['source:v2']);});
test('M06S09-084 AS_IS may use changed contract versions',()=>{assert.deepEqual(snapshot(LifecycleReplayMode.AS_IS,anchor(),{contractVersionReferences:['contract:v2']}).contractVersionReferences,['contract:v2']);});
test('M06S09-085 AS_IS may use changed evidence set',()=>{assert.deepEqual(snapshot(LifecycleReplayMode.AS_IS,anchor(),{evidenceReferences:['evidence:2']}).evidenceReferences,['evidence:2']);});
test('M06S09-086 AS_IS evaluation may be later than original',()=>{assert.equal(snapshot(LifecycleReplayMode.AS_IS).evaluatedAt,CURRENT_EVAL);});
test('M06S09-087 AS_IS equal outcome yields MATCH',()=>{assert.equal(run().toJSON().results.find(x=>x.mode==='AS_IS')!.outcome,LifecycleHistoricalReplayOutcome.MATCH);});
test('M06S09-088 AS_IS changed outcome with governed reason yields EXPLAINED_DIVERGENCE',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{semanticOutcome:'NON_COMPLIANT'}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is],{divergenceReasons:[divergence(LifecycleReplayMode.AS_IS)]}).toJSON();assert.equal(v.results.find(x=>x.mode==='AS_IS')!.outcome,LifecycleHistoricalReplayOutcome.EXPLAINED_DIVERGENCE);});
test('M06S09-089 AS_IS changed outcome without reason requires review',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{semanticOutcome:'NON_COMPLIANT'}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON();assert.equal(v.results.find(x=>x.mode==='AS_IS')!.outcome,LifecycleHistoricalReplayOutcome.REVIEW_REQUIRED);});
test('M06S09-090 AS_IS input-missing maps INPUT_MISSING',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{availability:LifecycleReplayAvailability.INPUT_MISSING,semanticOutcome:null});assert.equal(run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON().results.find(x=>x.mode==='AS_IS')!.outcome,LifecycleHistoricalReplayOutcome.INPUT_MISSING);});
test('M06S09-091 AS_IS version-unavailable maps VERSION_UNAVAILABLE',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{availability:LifecycleReplayAvailability.VERSION_UNAVAILABLE,semanticOutcome:null});assert.equal(run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON().results.find(x=>x.mode==='AS_IS')!.outcome,LifecycleHistoricalReplayOutcome.VERSION_UNAVAILABLE);});
test('M06S09-092 AS_IS review snapshot maps REVIEW_REQUIRED',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{availability:LifecycleReplayAvailability.REVIEW_REQUIRED,semanticOutcome:null});assert.equal(run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON().results.find(x=>x.mode==='AS_IS')!.outcome,LifecycleHistoricalReplayOutcome.REVIEW_REQUIRED);});
test('M06S09-093 AS_IS indeterminate snapshot maps INDETERMINATE',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{availability:LifecycleReplayAvailability.INDETERMINATE,semanticOutcome:null});assert.equal(run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON().results.find(x=>x.mode==='AS_IS')!.outcome,LifecycleHistoricalReplayOutcome.INDETERMINATE);});

test('M06S09-094 both requested modes remain separate',()=>{const v=run().toJSON();assert.deepEqual(v.results.map(x=>x.mode),['AS_WAS','AS_IS']);});
test('M06S09-095 same available outcomes yield SAME_OUTCOME comparison',()=>{assert.equal(run().toJSON().comparison.outcome,LifecycleHistoricalReplayComparisonOutcome.SAME_OUTCOME);});
test('M06S09-096 different available outcomes yield CHANGED_OUTCOME comparison',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{semanticOutcome:'NON_COMPLIANT'}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is],{divergenceReasons:[divergence(LifecycleReplayMode.AS_IS)]}).toJSON();assert.equal(v.comparison.outcome,LifecycleHistoricalReplayComparisonOutcome.CHANGED_OUTCOME);});
test('M06S09-097 missing mode result yields COMPARISON_UNAVAILABLE',()=>{const a=anchor(),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a)],{requestedModes:[LifecycleReplayMode.AS_WAS]}).toJSON();assert.equal(v.comparison.outcome,LifecycleHistoricalReplayComparisonOutcome.COMPARISON_UNAVAILABLE);});
test('M06S09-098 review mode result lifts comparison to REVIEW_REQUIRED',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{semanticOutcome:'NON_COMPLIANT'}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON();assert.equal(v.comparison.outcome,LifecycleHistoricalReplayComparisonOutcome.REVIEW_REQUIRED);});
test('M06S09-099 indeterminate mode result lifts comparison to INDETERMINATE',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{availability:LifecycleReplayAvailability.INDETERMINATE,semanticOutcome:null}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON();assert.equal(v.comparison.outcome,LifecycleHistoricalReplayComparisonOutcome.INDETERMINATE);});
test('M06S09-100 comparison retains original outcome',()=>{assert.equal(run().toJSON().comparison.originalOutcome,'COMPLIANT');});
test('M06S09-101 comparison retains AS_WAS outcome separately',()=>{assert.equal(run().toJSON().comparison.asWasOutcome,'COMPLIANT');});
test('M06S09-102 comparison retains AS_IS outcome separately',()=>{assert.equal(run().toJSON().comparison.asIsOutcome,'COMPLIANT');});
test('M06S09-103 changed rule reference appears in differences',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{ruleVersionReferences:['rule:v2']}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON();assert(v.comparison.differenceReferences.some(x=>x.kind==='RULE_VERSION'));});
test('M06S09-104 changed source reference appears in differences',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{sourceVersionReferences:['source:v2']}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON();assert(v.comparison.differenceReferences.some(x=>x.kind==='SOURCE_VERSION'));});
test('M06S09-105 changed contract reference appears in differences',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{contractVersionReferences:['contract:v2']}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON();assert(v.comparison.differenceReferences.some(x=>x.kind==='CONTRACT_VERSION'));});
test('M06S09-106 changed evidence reference appears in differences',()=>{const a=anchor(),is=snapshot(LifecycleReplayMode.AS_IS,a,{evidenceReferences:['evidence:2']}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is]).toJSON();assert(v.comparison.differenceReferences.some(x=>x.kind==='EVIDENCE'));});
test('M06S09-107 divergence reason taxonomy controlled',()=>{assert.throws(()=>divergence(LifecycleReplayMode.AS_IS,'MAGIC' as never));});
test('M06S09-108 duplicate divergence reason rejected',()=>{const d=divergence(LifecycleReplayMode.AS_IS);assert.throws(()=>run(anchor(),undefined,{divergenceReasons:[d,d]}));});
test('M06S09-109 OTHER_GOVERNED_REASON requires explicit reference',()=>{assert.throws(()=>divergence(LifecycleReplayMode.AS_IS,LifecycleReplayDivergenceReasonKind.OTHER_GOVERNED_REASON,{governedReference:null}));});
test('M06S09-110 implementation defect marks corrective review required',()=>{const d=divergence(LifecycleReplayMode.AS_IS,LifecycleReplayDivergenceReasonKind.IMPLEMENTATION_DEFECT_DETECTED),v=run(anchor(),undefined,{divergenceReasons:[d]}).toJSON();assert.equal(v.correctiveReviewRequired,true);});
test('M06S09-111 corrective review reference retained without mutation',()=>{const d=divergence(LifecycleReplayMode.AS_IS,LifecycleReplayDivergenceReasonKind.IMPLEMENTATION_DEFECT_DETECTED),v=run(anchor(),undefined,{divergenceReasons:[d],correctiveReviewReference:'review:new'}).toJSON();assert.equal(v.correctiveReviewReference,'review:new');assert.equal(v.historicalDecisionMutated,false);});
test('M06S09-112 replay match does not grant authorization',()=>{assert.equal(run().toJSON().authorizationAuthority,false);});
test('M06S09-113 historical anchor remains unchanged',()=>{const a=anchor(),before=JSON.stringify(a);run(a);assert.equal(JSON.stringify(a),before);});
test('M06S09-114 AS_WAS snapshot remains unchanged',()=>{const a=anchor(),s=snapshot(LifecycleReplayMode.AS_WAS,a),before=JSON.stringify(s);run(a,[s,snapshot(LifecycleReplayMode.AS_IS,a)]);assert.equal(JSON.stringify(s),before);});
test('M06S09-115 AS_IS snapshot remains unchanged',()=>{const a=anchor(),s=snapshot(LifecycleReplayMode.AS_IS,a),before=JSON.stringify(s);run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),s]);assert.equal(JSON.stringify(s),before);});
test('M06S09-116 caller snapshot order cannot affect output',()=>{const a=anchor(),w=snapshot(LifecycleReplayMode.AS_WAS,a),i=snapshot(LifecycleReplayMode.AS_IS,a);assert.equal(JSON.stringify(run(a,[w,i])),JSON.stringify(run(a,[i,w])));});
test('M06S09-117 requested mode order cannot affect output',()=>{const a=anchor();assert.equal(JSON.stringify(run(a,undefined,{requestedModes:[LifecycleReplayMode.AS_WAS,LifecycleReplayMode.AS_IS]})),JSON.stringify(run(a,undefined,{requestedModes:[LifecycleReplayMode.AS_IS,LifecycleReplayMode.AS_WAS]})));});
test('M06S09-118 identical governed replay byte stable',()=>{assert.equal(JSON.stringify(run()),JSON.stringify(run()));});
test('M06S09-119 version reference budget overflow rejected',()=>{assert.throws(()=>anchor({ruleVersionReferences:Array.from({length:65},(_,n)=>'rule:'+n)}));});
test('M06S09-120 evidence reference budget overflow rejected',()=>{assert.throws(()=>anchor({evidenceReferences:Array.from({length:257},(_,n)=>'evidence:'+n)}));});
test('M06S09-121 divergence reason budget overflow rejected',()=>{const ds=Array.from({length:65},(_,n)=>divergence(LifecycleReplayMode.AS_IS,LifecycleReplayDivergenceReasonKind.RULE_VERSION_CHANGED,{governedReference:'gov:'+n}));assert.throws(()=>run(anchor(),undefined,{divergenceReasons:ds}));});
test('M06S09-122 safe output excludes raw storage contact provider data',()=>{const s=JSON.stringify(run());for(const bad of ['s3://','providerToken','rawBody','phoneNumber','@example.com'])assert(!s.includes(bad));});
test('M06S09-123 all mutation and authority flags remain negative',()=>{const v=run().toJSON();assert.equal(v.authorizationAuthority,false);assert.equal(v.credentialStateMutated,false);assert.equal(v.authorizationStateMutated,false);assert.equal(v.historicalDecisionMutated,false);assert.equal(v.reevaluationDecisionMutated,false);assert.equal(v.complianceProjectionMutated,false);assert.equal(v.assignmentDecisionMutated,false);assert.equal(v.physicalDeletionAuthorized,false);});
test('M06S09-124 no notification provider or event side effects',()=>{const v=run().toJSON();assert.equal(v.notificationScheduled,false);assert.equal(v.providerInvoked,false);assert.equal(v.eventsEmitted,0);});
test('M06S09-125 Core historical replay ambiguity cannot become AVAILABLE',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,anchor(),{coreHistoricalReplayState:'AMBIGUOUS_REVIEW_REQUIRED'}));});
test('M06S09-126 S08 current projection metadata may bind only AS_IS',()=>{assert.throws(()=>snapshot(LifecycleReplayMode.AS_WAS,anchor(),{s08ProjectionReference:'projection:current'}));assert.equal(snapshot(LifecycleReplayMode.AS_IS,anchor(),{s08ProjectionReference:'projection:current'}).s08ProjectionReference,'projection:current');});
test('M06S09-127 S07 reevaluation metadata remains explicit not replay truth',()=>{const a=anchor(),s=snapshot(LifecycleReplayMode.AS_IS,a,{s07DecisionReference:'reeval:1'}),v=run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),s]).toJSON();assert.equal(v.results.find(x=>x.mode==='AS_IS')!.s07DecisionReference,'reeval:1');assert.equal(v.results.find(x=>x.mode==='AS_IS')!.semanticOutcome,'COMPLIANT');});
test('M06S09-128 changed current outcome never rewrites original history',()=>{const a=anchor(),before=JSON.stringify(a),is=snapshot(LifecycleReplayMode.AS_IS,a,{semanticOutcome:'NON_COMPLIANT'});run(a,[snapshot(LifecycleReplayMode.AS_WAS,a),is],{divergenceReasons:[divergence(LifecycleReplayMode.AS_IS)]});assert.equal(JSON.stringify(a),before);assert.equal(a.originalOutcome,'COMPLIANT');});
