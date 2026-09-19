import test from 'node:test';
import assert from 'node:assert/strict';
import { ActorId, ActorKind, ActorReference, CorrelationId, SubjectId, SubjectKind, SubjectReference, UtcInstant, VerificationState, VersionId } from '../../core/src/index.ts';
import { AccessDecisionReference, AccessDisposition, ApplicationExecutionContext, ApplicationOperationReference, AuditReference, OrganizationScopeReference, PurposeReference, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext, TenantScopeReference } from '../src/index.ts';
import {
  DEPENDENCY_GRAPH_FIELD, DEPENDENCY_GRAPH_OPERATION, LifecycleChangeEvent, LifecycleChangeType, LifecycleDependencyEdge,
  LifecycleDependencyEdgeKind, LifecycleDependencyGraphSnapshot, LifecycleDependencyImpactMode, LifecycleDependencyImpactTraversal,
  LifecycleDependencyNode, LifecycleDependencyNodeType,
} from '../src/lifecycle/dependency-graph.ts';
import type { DependencyImpactTraversalInput, LifecycleChangeEventInput, LifecycleDependencyGraphSnapshotInput } from '../src/lifecycle/dependency-graph.ts';
import {
  LifecycleReevaluationFact, LifecycleReevaluationFactState, LifecycleSelectiveReevaluation,
  SELECTIVE_REEVALUATION_FIELD, SELECTIVE_REEVALUATION_OPERATION,
} from '../src/lifecycle/selective-reevaluation.ts';
import {
  CONTINUOUS_COMPLIANCE_FIELD, CONTINUOUS_COMPLIANCE_OPERATION,
  ContinuousComplianceConditionFact, ContinuousComplianceConditionState, ContinuousComplianceConditionType,
  ContinuousComplianceProjection, ContinuousComplianceScope, ContinuousComplianceScopeKind,
  ContinuousComplianceSourceKind, ContinuousComplianceStatus, ContinuousComplianceTiming,
} from '../src/lifecycle/continuous-compliance.ts';
import type {
  ContinuousComplianceConditionFactInput, ContinuousComplianceProjectionInput, ContinuousComplianceScopeInput,
} from '../src/lifecycle/continuous-compliance.ts';

const uuid=(n:number)=>'018f3f7e-dddd-7abc-8def-'+String(n).padStart(12,'0');
const at=(s:string)=>UtcInstant.from(s),V1=VersionId.from('v1'),V2=VersionId.from('v2');
const T0=at('2025-01-01T00:00:00Z'),T1=at('2025-06-01T00:00:00Z'),T2=at('2025-08-01T00:00:00Z'),NOW=at('2025-12-20T12:00:00Z'),FUTURE=at('2026-02-01T00:00:00Z'),LATER=at('2026-06-01T00:00:00Z');
const human=(n:number)=>ActorReference.create(ActorId.from(uuid(n)),ActorKind.HUMAN_USER);
const OPERATOR=human(1),OTHER_ACTOR=human(2),GRANTOR=human(3),EVALUATOR=human(4);
const SUBJECT=SubjectReference.create(SubjectId.from(uuid(10)),SubjectKind.PERSON);
const OTHER_SUBJECT=SubjectReference.create(SubjectId.from(uuid(11)),SubjectKind.PERSON);
const SUBJECT_ORG=SubjectReference.create(SUBJECT.id,SubjectKind.ORGANIZATION);
const TENANT=TenantScopeReference.from('tenant:compliance'),OTHER_TENANT=TenantScopeReference.from('tenant:other');
const ORG=OrganizationScopeReference.from('org:compliance'),OTHER_ORG=OrganizationScopeReference.from('org:other');
const PURPOSE=PurposeReference.from('purpose:compliance'),OTHER_PURPOSE=PurposeReference.from('purpose:other');
const CORR=CorrelationId.from(uuid(20)),OTHER_CORR=CorrelationId.from(uuid(21));
const DEP_ACCESS=AccessDecisionReference.from('access:dependency'),REEVAL_ACCESS=AccessDecisionReference.from('access:reeval'),COMP_ACCESS=AccessDecisionReference.from('access:compliance');
const VERIFIED=VerificationState.from('VERIFIED'),UNVERIFIED=VerificationState.from('UNVERIFIED'),FAILED=VerificationState.from('FAILED'),STALE=VerificationState.from('STALE'),VERIFY_REVIEW=VerificationState.from('REVIEW_REQUIRED'),VERIFY_NA=VerificationState.from('NOT_APPLICABLE');

function scopeFor(kind:ContinuousComplianceScopeKind=ContinuousComplianceScopeKind.SUBJECT,overrides:Partial<ContinuousComplianceScopeInput>={}){
  const subject=kind===ContinuousComplianceScopeKind.ORGANIZATION?null:SUBJECT;
  const activityReference=(kind===ContinuousComplianceScopeKind.ACTIVITY||kind===ContinuousComplianceScopeKind.ASSIGNMENT)?'activity:1':null;
  const assignmentReference=kind===ContinuousComplianceScopeKind.ASSIGNMENT?'assignment:1':null;
  return ContinuousComplianceScope.create({
    reference:'scope:'+kind.toLowerCase(),version:V1,kind,tenant:TENANT,organization:ORG,subject,
    jurisdictionReference:'CZ',activityReference,assignmentReference,credentialScopeReference:'credential:1',
    capturedAt:T0,asKnownAt:T1,provenanceReference:'prov:scope',...overrides,
  });
}
function fact(scope=scopeFor(),overrides:Partial<ContinuousComplianceConditionFactInput>={}){
  const timing=overrides.timing??ContinuousComplianceTiming.CURRENT;
  return ContinuousComplianceConditionFact.create({
    reference:'fact:1',scope,targetReference:'target:1',conditionType:ContinuousComplianceConditionType.REQUIREMENT,
    state:ContinuousComplianceConditionState.SATISFIED,timing,blocking:true,actionRequired:false,
    effectiveAt:timing===ContinuousComplianceTiming.FUTURE?FUTURE:T1,evaluatedAt:NOW,asKnownAt:NOW,validUntil:LATER,
    verificationState:VERIFIED,sourceKind:ContinuousComplianceSourceKind.BASELINE_EVALUATION,sourceReference:'source:baseline',
    sourceVersion:V1,reevaluationDecisionReference:null,evidenceReferences:['evidence:1'],conditionReferences:[],
    provenanceReference:'prov:fact',correlationReference:'corr:baseline',causationReference:null,reasonCodes:['EVALUATED'],
    ...overrides,
  });
}
function context(overrides:Partial<Parameters<typeof ApplicationExecutionContext.create>[0]>={}){
  return ApplicationExecutionContext.create({operation:ApplicationOperationReference.from(CONTINUOUS_COMPLIANCE_OPERATION),actor:OPERATOR,subject:SUBJECT,tenantScope:TENANT,organizationScope:ORG,purpose:PURPOSE,correlationId:CORR,requestedAt:NOW,contractVersion:V1,accessDecision:COMP_ACCESS,...overrides});
}
function reader(actor=OPERATOR,overrides:Partial<Parameters<typeof TenantContext.create>[0]>={}){
  return TenantContext.create({tenant:TENANT,organization:ORG,actor,purpose:PURPOSE,correlationId:CORR,...overrides});
}
function access(overrides:Partial<Parameters<typeof TenantAccessDecision.create>[0]>={}){
  return TenantAccessDecision.create({reference:COMP_ACCESS,tenant:TENANT,purpose:PURPOSE,disposition:AccessDisposition.ALLOW,allowedFields:[CONTINUOUS_COMPLIANCE_FIELD],decidedBy:GRANTOR,auditReference:AuditReference.from('audit:compliance'),...overrides});
}
function projectionInput(scope:ContinuousComplianceScope,facts:readonly ContinuousComplianceConditionFact[],overrides:Partial<ContinuousComplianceProjectionInput>={}):ContinuousComplianceProjectionInput{
  return {context:context({subject:scope.subject}),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:access(),scope,facts,reevaluation:null,evaluatedAt:NOW,asKnownAt:NOW,maxFacts:128,...overrides};
}
const project=(scope:ContinuousComplianceScope,facts:readonly ContinuousComplianceConditionFact[],overrides:Partial<ContinuousComplianceProjectionInput>={})=>ContinuousComplianceProjection.evaluate(projectionInput(scope,facts,overrides));

function depContext(overrides:Partial<Parameters<typeof ApplicationExecutionContext.create>[0]>={}){
  return ApplicationExecutionContext.create({operation:ApplicationOperationReference.from(DEPENDENCY_GRAPH_OPERATION),actor:OPERATOR,subject:SUBJECT,tenantScope:TENANT,organizationScope:ORG,purpose:PURPOSE,correlationId:CORR,requestedAt:NOW,contractVersion:V1,accessDecision:DEP_ACCESS,...overrides});
}
function depAccess(){
  return TenantAccessDecision.create({reference:DEP_ACCESS,tenant:TENANT,purpose:PURPOSE,disposition:AccessDisposition.ALLOW,allowedFields:[DEPENDENCY_GRAPH_FIELD],decidedBy:GRANTOR,auditReference:AuditReference.from('audit:dependency')});
}
function reevalContext(){
  return ApplicationExecutionContext.create({operation:ApplicationOperationReference.from(SELECTIVE_REEVALUATION_OPERATION),actor:OPERATOR,subject:SUBJECT,tenantScope:TENANT,organizationScope:ORG,purpose:PURPOSE,correlationId:CORR,requestedAt:NOW,contractVersion:V1,accessDecision:REEVAL_ACCESS});
}
function reevalAccess(){
  return TenantAccessDecision.create({reference:REEVAL_ACCESS,tenant:TENANT,purpose:PURPOSE,disposition:AccessDisposition.ALLOW,allowedFields:[SELECTIVE_REEVALUATION_FIELD],decidedBy:GRANTOR,auditReference:AuditReference.from('audit:reeval')});
}
function dependencyGraph(overrides:Partial<LifecycleDependencyGraphSnapshotInput>={}){
  const root=LifecycleDependencyNode.create({reference:'node:root',type:LifecycleDependencyNodeType.RULE_VERSION,version:V1,tenant:TENANT,organization:ORG,subject:SUBJECT,jurisdictionReference:'CZ',provenanceReference:'prov:root',knownAt:T0});
  const target=LifecycleDependencyNode.create({reference:'node:target',type:LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT,version:null,tenant:TENANT,organization:ORG,subject:SUBJECT,jurisdictionReference:'CZ',provenanceReference:'prov:target',knownAt:T0});
  const edge=LifecycleDependencyEdge.create({id:'edge:1',sourceReference:'node:root',targetReference:'node:target',kind:LifecycleDependencyEdgeKind.DEPENDS_ON,impactMode:LifecycleDependencyImpactMode.MANDATORY,provenanceReference:'prov:edge',knownAt:T0});
  return LifecycleDependencyGraphSnapshot.create({id:'graph:compliance',version:V1,tenant:TENANT,organization:ORG,subject:SUBJECT,nodes:[root,target],edges:[edge],capturedAt:T1,asKnownAt:T1,provenanceReference:'prov:graph',...overrides});
}
function changeEvent(g:LifecycleDependencyGraphSnapshot,overrides:Partial<LifecycleChangeEventInput>={}){
  return LifecycleChangeEvent.create({id:'change:1',type:LifecycleChangeType.REGULATORY_RULE_CHANGED,graph:g,rootNodeReference:'node:root',tenant:TENANT,organization:ORG,subject:SUBJECT,occurredAt:T2,observedAt:T2,effectiveFrom:null,verificationState:VERIFIED,jurisdictionReference:'CZ',provenanceReference:'prov:change',correlationReference:'corr:change',causationReference:null,...overrides});
}
function reevaluation(options:{mode?:LifecycleDependencyImpactMode,effectiveFrom?:UtcInstant|null,state?:LifecycleReevaluationFactState,newResult?:string|null,actionRequired?:boolean}={}){
  const g=dependencyGraph();
  const e=changeEvent(g,{effectiveFrom:options.effectiveFrom??null});
  const impact=LifecycleDependencyImpactTraversal.evaluate({
    context:depContext(),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:depAccess(),graph:g,event:e,evaluatedAt:NOW,asKnownAt:NOW,
    allowedTargetTypes:[LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT],maxDepth:16,maxCandidates:64,maxPaths:256,
  } satisfies DependencyImpactTraversalInput);
  const candidate=impact.toJSON().candidates[0]!;
  const mode=options.mode??LifecycleDependencyImpactMode.MANDATORY;
  if(mode!==LifecycleDependencyImpactMode.MANDATORY){
    const root=g.nodes[0]!,target=g.nodes[1]!;
    const gg=LifecycleDependencyGraphSnapshot.create({id:'graph:compliance',version:V1,tenant:TENANT,organization:ORG,subject:SUBJECT,nodes:[root,target],edges:[LifecycleDependencyEdge.create({id:'edge:1',sourceReference:'node:root',targetReference:'node:target',kind:LifecycleDependencyEdgeKind.DEPENDS_ON,impactMode:mode,provenanceReference:'prov:edge',knownAt:T0})],capturedAt:T1,asKnownAt:T1,provenanceReference:'prov:graph'});
    const ee=changeEvent(gg,{effectiveFrom:options.effectiveFrom??null});
    return reevaluationFrom(gg,ee,options);
  }
  const facts=(candidate.reviewRequired||candidate.futureImpact)?[]:[LifecycleReevaluationFact.create({
    reference:'reeval-fact:1',candidateDedupKey:candidate.dedupKey,targetReference:candidate.targetReference,targetType:candidate.targetType,targetVersion:null,
    state:options.state??LifecycleReevaluationFactState.COMPLETE,previousDecisionReference:'decision:old',previousResult:'SATISFIED',
    newResult:(options.state??LifecycleReevaluationFactState.COMPLETE)===LifecycleReevaluationFactState.COMPLETE?(options.newResult??'SATISFIED'):null,
    actionRequired:options.actionRequired??false,evaluatedBy:EVALUATOR,evaluatedAt:NOW,asKnownAt:NOW,
    versionBindings:candidate.requiredVersions.map(v=>({reference:v.reference,type:v.type,version:VersionId.from(v.version)})),evidenceReferences:['evidence:reeval'],
    provenanceReference:'prov:reeval',correlationReference:'corr:change',causationReference:'cause:reeval',reasonCodes:['REEVALUATED'],
  })];
  const batch=LifecycleSelectiveReevaluation.evaluate({context:reevalContext(),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:reevalAccess(),graph:g,event:e,impact,facts,evaluatedAt:NOW,asKnownAt:NOW,maxDecisions:64});
  return {g,e,impact,batch,decision:batch.toJSON().decisions[0]!};
}
function reevaluationFrom(g:LifecycleDependencyGraphSnapshot,e:LifecycleChangeEvent,options:{state?:LifecycleReevaluationFactState,newResult?:string|null,actionRequired?:boolean}={}){
  const impact=LifecycleDependencyImpactTraversal.evaluate({context:depContext(),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:depAccess(),graph:g,event:e,evaluatedAt:NOW,asKnownAt:NOW,allowedTargetTypes:[LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT],maxDepth:16,maxCandidates:64,maxPaths:256});
  const candidate=impact.toJSON().candidates[0]!;
  const facts=(candidate.reviewRequired||candidate.futureImpact)?[]:[LifecycleReevaluationFact.create({reference:'reeval-fact:1',candidateDedupKey:candidate.dedupKey,targetReference:candidate.targetReference,targetType:candidate.targetType,targetVersion:null,state:options.state??LifecycleReevaluationFactState.COMPLETE,previousDecisionReference:'decision:old',previousResult:'SATISFIED',newResult:(options.state??LifecycleReevaluationFactState.COMPLETE)===LifecycleReevaluationFactState.COMPLETE?(options.newResult??'SATISFIED'):null,actionRequired:options.actionRequired??false,evaluatedBy:EVALUATOR,evaluatedAt:NOW,asKnownAt:NOW,versionBindings:candidate.requiredVersions.map(v=>({reference:v.reference,type:v.type,version:VersionId.from(v.version)})),evidenceReferences:['evidence:reeval'],provenanceReference:'prov:reeval',correlationReference:'corr:change',causationReference:'cause:reeval',reasonCodes:['REEVALUATED']})];
  const batch=LifecycleSelectiveReevaluation.evaluate({context:reevalContext(),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:reevalAccess(),graph:g,event:e,impact,facts,evaluatedAt:NOW,asKnownAt:NOW,maxDecisions:64});
  return {g,e,impact,batch,decision:batch.toJSON().decisions[0]!};
}
function reevalCondition(scope:ContinuousComplianceScope,r=reevaluation(),overrides:Partial<ContinuousComplianceConditionFactInput>={}){
  const d=r.decision;
  const timing=d.outcome==='FUTURE_IMPACT_REGISTERED'?ContinuousComplianceTiming.FUTURE:ContinuousComplianceTiming.CURRENT;
  const state=d.outcome==='REVIEW_REQUIRED'?ContinuousComplianceConditionState.REVIEW_REQUIRED:d.outcome==='INDETERMINATE'?ContinuousComplianceConditionState.INDETERMINATE:ContinuousComplianceConditionState.SATISFIED;
  return fact(scope,{reference:'fact:reeval',targetReference:d.targetReference,state,timing,effectiveAt:timing===ContinuousComplianceTiming.FUTURE?FUTURE:T1,
    actionRequired:d.outcome==='ACTION_REQUIRED',sourceKind:ContinuousComplianceSourceKind.REEVALUATION_DECISION,sourceReference:d.decisionReference,sourceVersion:null,
    reevaluationDecisionReference:d.decisionReference,evidenceReferences:['evidence:reeval'],provenanceReference:'prov:continuous-reeval',correlationReference:d.correlationReference,...overrides});
}

test('M06S08-001 scope identity kind and version immutable',()=>{const s=scopeFor();assert.equal(s.kind,ContinuousComplianceScopeKind.SUBJECT);assert.equal(s.version,V1);assert(Object.isFrozen(s));});
test('M06S08-002 empty scope reference rejected',()=>{assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.SUBJECT,{reference:''}));});
test('M06S08-003 unknown scope kind rejected',()=>{assert.throws(()=>scopeFor('MAGIC' as never));});
test('M06S08-004 tenant and organization scope required',()=>{assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.SUBJECT,{tenant:{} as never}));assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.SUBJECT,{organization:{} as never}));});
test('M06S08-005 subject scope requires subject',()=>{assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.SUBJECT,{subject:null}));});
test('M06S08-006 organization scope forbids subject identity',()=>{assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.ORGANIZATION,{subject:SUBJECT}));});
test('M06S08-007 activity scope requires activity reference',()=>{assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.ACTIVITY,{activityReference:null}));});
test('M06S08-008 assignment scope requires subject activity and assignment',()=>{assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.ASSIGNMENT,{subject:null}));assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.ASSIGNMENT,{activityReference:null}));assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.ASSIGNMENT,{assignmentReference:null}));});
test('M06S08-009 assignment reference forbidden outside assignment scope',()=>{assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.SUBJECT,{assignmentReference:'assignment:x'}));});
test('M06S08-010 jurisdiction reference mandatory',()=>{assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.SUBJECT,{jurisdictionReference:''}));});
test('M06S08-011 credential scope reference optional and bounded',()=>{assert.equal(scopeFor(ContinuousComplianceScopeKind.SUBJECT,{credentialScopeReference:null}).credentialScopeReference,null);assert.throws(()=>scopeFor(ContinuousComplianceScopeKind.SUBJECT,{credentialScopeReference:'x'.repeat(300)}));});
test('M06S08-012 scope serialization deeply readonly',()=>{const v=scopeFor().toJSON();assert(Object.isFrozen(v));});
test('M06S08-013 equivalent scope input byte stable',()=>{assert.equal(JSON.stringify(scopeFor()),JSON.stringify(scopeFor()));});
test('M06S08-014 distinct scope kind changes serialized identity',()=>{assert.notEqual(JSON.stringify(scopeFor()),JSON.stringify(scopeFor(ContinuousComplianceScopeKind.ACTIVITY)));});
test('M06S08-015 condition fact identity immutable',()=>{const s=scopeFor(),f=fact(s);assert.equal(f.reference,'fact:1');assert.equal(f.scope,s);assert(Object.isFrozen(f));});
test('M06S08-016 unknown condition type rejected',()=>{assert.throws(()=>fact(scopeFor(),{conditionType:'MAGIC' as never}));});
test('M06S08-017 unknown condition state rejected',()=>{assert.throws(()=>fact(scopeFor(),{state:'MAGIC' as never}));});
test('M06S08-018 unknown timing rejected',()=>{assert.throws(()=>fact(scopeFor(),{timing:'MAGIC' as never}));});
test('M06S08-019 unknown source kind rejected',()=>{assert.throws(()=>fact(scopeFor(),{sourceKind:'MAGIC' as never}));});
test('M06S08-020 condition fact requires exact scope',()=>{assert.throws(()=>ContinuousComplianceConditionFact.create({...fact(scopeFor()).toInput(),scope:{} as never}));});
test('M06S08-021 blocking flag must be boolean',()=>{assert.throws(()=>fact(scopeFor(),{blocking:'yes' as never}));});
test('M06S08-022 action-required flag must be boolean',()=>{assert.throws(()=>fact(scopeFor(),{actionRequired:'yes' as never}));});
test('M06S08-023 current fact effective time cannot be future',()=>{assert.throws(()=>fact(scopeFor(),{effectiveAt:FUTURE}));});
test('M06S08-024 future fact effective time must be future',()=>{assert.throws(()=>fact(scopeFor(),{timing:ContinuousComplianceTiming.FUTURE,effectiveAt:T1}));});
test('M06S08-025 fact knowledge horizon cannot exceed evaluation',()=>{assert.throws(()=>fact(scopeFor(),{asKnownAt:FUTURE}));});
test('M06S08-026 fact validity cannot predate fact evaluation',()=>{assert.throws(()=>fact(scopeFor(),{validUntil:T2}));});
test('M06S08-027 baseline source forbids reevaluation decision reference',()=>{assert.throws(()=>fact(scopeFor(),{reevaluationDecisionReference:'reeval:x'}));});
test('M06S08-028 reevaluation source requires decision reference',()=>{assert.throws(()=>fact(scopeFor(),{sourceKind:ContinuousComplianceSourceKind.REEVALUATION_DECISION,sourceReference:'reeval:x',reevaluationDecisionReference:null}));});
test('M06S08-029 reevaluation source reference equals decision reference',()=>{assert.throws(()=>fact(scopeFor(),{sourceKind:ContinuousComplianceSourceKind.REEVALUATION_DECISION,sourceReference:'reeval:a',reevaluationDecisionReference:'reeval:b'}));});
test('M06S08-030 source version must be governed or null',()=>{assert.throws(()=>fact(scopeFor(),{sourceVersion:{} as never}));});
test('M06S08-031 verification state must be governed',()=>{assert.throws(()=>fact(scopeFor(),{verificationState:{} as never}));});
test('M06S08-032 evidence references bounded dense',()=>{const a=new Array<string>(2);a[0]='evidence:1';assert.throws(()=>fact(scopeFor(),{evidenceReferences:a}));});
test('M06S08-033 duplicate evidence reference rejected',()=>{assert.throws(()=>fact(scopeFor(),{evidenceReferences:['evidence:1','evidence:1']}));});
test('M06S08-034 condition references bounded dense',()=>{const a=new Array<string>(2);a[0]='condition:1';assert.throws(()=>fact(scopeFor(),{conditionReferences:a}));});
test('M06S08-035 duplicate condition reference rejected',()=>{assert.throws(()=>fact(scopeFor(),{conditionReferences:['condition:1','condition:1']}));});
test('M06S08-036 conditional satisfaction requires explicit conditions',()=>{assert.throws(()=>fact(scopeFor(),{state:ContinuousComplianceConditionState.SATISFIED_WITH_CONDITIONS,conditionReferences:[]}));});
test('M06S08-037 not-applicable fact cannot be blocking',()=>{assert.throws(()=>fact(scopeFor(),{state:ContinuousComplianceConditionState.NOT_APPLICABLE,verificationState:VERIFY_NA,blocking:true,actionRequired:false}));});
test('M06S08-038 not-applicable fact cannot require action',()=>{assert.throws(()=>fact(scopeFor(),{state:ContinuousComplianceConditionState.NOT_APPLICABLE,verificationState:VERIFY_NA,blocking:false,actionRequired:true}));});
test('M06S08-039 reason codes bounded and unique',()=>{assert.throws(()=>fact(scopeFor(),{reasonCodes:['DUP','DUP']}));});
test('M06S08-040 provenance reference mandatory',()=>{assert.throws(()=>fact(scopeFor(),{provenanceReference:''}));});
test('M06S08-041 fact serialization safe metadata only',()=>{const s=JSON.stringify(fact(scopeFor()));for(const bad of ['s3://','providerToken','rawBody','@example.com'])assert(!s.includes(bad));});
test('M06S08-042 explicit scoped invocation required',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>ContinuousComplianceProjection.evaluate({...projectionInput(s,[f]),context:{} as never}),TenantAccessDeniedError);});
test('M06S08-043 denial occurs before fact disclosure',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>ContinuousComplianceProjection.evaluate({...projectionInput(s,[f]),facts:[{} as never],accessDecision:access({disposition:AccessDisposition.DENY})}),TenantAccessDeniedError);});
test('M06S08-044 cross-tenant invocation denied',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({tenantScope:OTHER_TENANT})}),TenantAccessDeniedError);});
test('M06S08-045 cross-organization invocation denied',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({organizationScope:OTHER_ORG})}),TenantAccessDeniedError);});
test('M06S08-046 foreign subject identity denied',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({subject:OTHER_SUBJECT})}),TenantAccessDeniedError);});
test('M06S08-047 foreign subject kind denied',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({subject:SUBJECT_ORG})}),TenantAccessDeniedError);});
test('M06S08-048 actor identity mismatch denied',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({actor:OTHER_ACTOR})}),TenantAccessDeniedError);});
test('M06S08-049 actor kind mismatch denied',()=>{const s=scopeFor(),f=fact(s),a=ActorReference.create(OPERATOR.id,ActorKind.SYSTEM_PROCESS);assert.throws(()=>project(s,[f],{context:context({actor:a})}),TenantAccessDeniedError);});
test('M06S08-050 purpose mismatch denied',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({purpose:OTHER_PURPOSE})}),TenantAccessDeniedError);});
test('M06S08-051 correlation mismatch denied',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({correlationId:OTHER_CORR})}),TenantAccessDeniedError);});
test('M06S08-052 continuous-compliance operation required',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({operation:ApplicationOperationReference.from('wrong.operation')})}),TenantAccessDeniedError);});
test('M06S08-053 continuous-compliance field authorization required',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{accessDecision:access({allowedFields:['credential:other']})}),TenantAccessDeniedError);});
test('M06S08-054 access-decision reference must match',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{context:context({accessDecision:AccessDecisionReference.from('access:other')})}),TenantAccessDeniedError);});
test('M06S08-055 evaluation instant matches request horizon',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{evaluatedAt:T2}));});
test('M06S08-056 as-known horizon cannot exceed evaluation',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{asKnownAt:FUTURE}));});
test('M06S08-057 max-facts budget explicit bounded',()=>{const s=scopeFor(),f=fact(s);assert.throws(()=>project(s,[f],{maxFacts:0}));assert.throws(()=>project(s,[f],{maxFacts:257}));});
test('M06S08-058 fact scope must be exact projection scope',()=>{const a=scopeFor(),b=scopeFor(),f=fact(b);assert.throws(()=>project(a,[f]));});
test('M06S08-059 future fact beyond projection horizon rejected',()=>{const s=scopeFor(),f=fact(s,{evaluatedAt:FUTURE,asKnownAt:FUTURE,effectiveAt:LATER,validUntil:null});assert.throws(()=>project(s,[f]));});
test('M06S08-060 stale current fact is not optimistic compliance',()=>{const s=scopeFor(),f=fact(s,{evaluatedAt:T1,asKnownAt:T1,effectiveAt:T0,validUntil:T2}),v=project(s,[f]).toJSON();assert.equal(v.status,ContinuousComplianceStatus.INDETERMINATE);});
test('M06S08-061 empty fact set yields indeterminate',()=>{const s=scopeFor();assert.equal(project(s,[]).toJSON().status,ContinuousComplianceStatus.INDETERMINATE);});
test('M06S08-062 one verified current satisfied fact yields compliant',()=>{const s=scopeFor();assert.equal(project(s,[fact(s)]).toJSON().status,ContinuousComplianceStatus.COMPLIANT);});
test('M06S08-063 multiple verified satisfied facts yield compliant',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:a'}),b=fact(s,{reference:'fact:b',targetReference:'target:2',sourceReference:'source:b'});assert.equal(project(s,[b,a]).toJSON().status,ContinuousComplianceStatus.COMPLIANT);});
test('M06S08-064 conditional current fact yields compliant-with-conditions',()=>{const s=scopeFor(),f=fact(s,{state:ContinuousComplianceConditionState.SATISFIED_WITH_CONDITIONS,conditionReferences:['condition:1']});assert.equal(project(s,[f]).toJSON().status,ContinuousComplianceStatus.COMPLIANT_WITH_CONDITIONS);});
test('M06S08-065 satisfied plus conditional yields compliant-with-conditions',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:a'}),b=fact(s,{reference:'fact:b',state:ContinuousComplianceConditionState.SATISFIED_WITH_CONDITIONS,conditionReferences:['condition:1']});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.COMPLIANT_WITH_CONDITIONS);});
test('M06S08-066 verified current blocking unsatisfied yields non-compliant',()=>{const s=scopeFor(),f=fact(s,{state:ContinuousComplianceConditionState.UNSATISFIED,blocking:true});assert.equal(project(s,[f]).toJSON().status,ContinuousComplianceStatus.NON_COMPLIANT);});
test('M06S08-067 verified current nonblocking unsatisfied yields at-risk',()=>{const s=scopeFor(),f=fact(s,{state:ContinuousComplianceConditionState.UNSATISFIED,blocking:false});assert.equal(project(s,[f]).toJSON().status,ContinuousComplianceStatus.AT_RISK);});
test('M06S08-068 known non-compliance takes precedence over review uncertainty',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:block',state:ContinuousComplianceConditionState.UNSATISFIED,blocking:true}),b=fact(s,{reference:'fact:review',state:ContinuousComplianceConditionState.REVIEW_REQUIRED,blocking:false});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.NON_COMPLIANT);});
test('M06S08-069 known non-compliance takes precedence over indeterminate uncertainty',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:block',state:ContinuousComplianceConditionState.UNSATISFIED,blocking:true}),b=fact(s,{reference:'fact:ind',state:ContinuousComplianceConditionState.INDETERMINATE,blocking:false});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.NON_COMPLIANT);});
test('M06S08-070 current review-required fact yields review-required',()=>{const s=scopeFor();for(const f of [fact(s,{state:ContinuousComplianceConditionState.REVIEW_REQUIRED,blocking:false}),fact(s,{verificationState:UNVERIFIED}),fact(s,{verificationState:FAILED}),fact(s,{verificationState:VERIFY_REVIEW})])assert.equal(project(s,[f]).toJSON().status,ContinuousComplianceStatus.REVIEW_REQUIRED);});
test('M06S08-071 current indeterminate fact yields indeterminate',()=>{const s=scopeFor();for(const f of [fact(s,{state:ContinuousComplianceConditionState.INDETERMINATE,blocking:false}),fact(s,{verificationState:STALE})])assert.equal(project(s,[f]).toJSON().status,ContinuousComplianceStatus.INDETERMINATE);});
test('M06S08-072 review-required takes precedence over indeterminate',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:r',state:ContinuousComplianceConditionState.REVIEW_REQUIRED,blocking:false}),b=fact(s,{reference:'fact:i',state:ContinuousComplianceConditionState.INDETERMINATE,blocking:false});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.REVIEW_REQUIRED);});
test('M06S08-073 future blocking unsatisfied creates at-risk not current non-compliance',()=>{const s=scopeFor(),a=fact(s),b=fact(s,{reference:'fact:future',timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE,state:ContinuousComplianceConditionState.UNSATISFIED});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.AT_RISK);});
test('M06S08-074 future review creates at-risk not current review-required',()=>{const s=scopeFor(),a=fact(s),b=fact(s,{reference:'fact:future',timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE,state:ContinuousComplianceConditionState.REVIEW_REQUIRED,blocking:false});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.AT_RISK);});
test('M06S08-075 future indeterminate creates at-risk not current indeterminate',()=>{const s=scopeFor(),a=fact(s),b=fact(s,{reference:'fact:future',timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE,state:ContinuousComplianceConditionState.INDETERMINATE,blocking:false});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.AT_RISK);});
test('M06S08-076 all current not-applicable facts yield not-applicable',()=>{const s=scopeFor(),f=fact(s,{state:ContinuousComplianceConditionState.NOT_APPLICABLE,verificationState:VERIFY_NA,blocking:false,actionRequired:false});assert.equal(project(s,[f]).toJSON().status,ContinuousComplianceStatus.NOT_APPLICABLE);});
test('M06S08-077 not-applicable current plus future impact yields at-risk',()=>{const s=scopeFor(),a=fact(s,{state:ContinuousComplianceConditionState.NOT_APPLICABLE,verificationState:VERIFY_NA,blocking:false,actionRequired:false}),b=fact(s,{reference:'fact:future',timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE,state:ContinuousComplianceConditionState.UNSATISFIED});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.AT_RISK);});
test('M06S08-078 not-applicable plus applicable satisfied yields compliant',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:na',state:ContinuousComplianceConditionState.NOT_APPLICABLE,verificationState:VERIFY_NA,blocking:false,actionRequired:false}),b=fact(s,{reference:'fact:ok'});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.COMPLIANT);});
test('M06S08-079 current review-required plus future risk remains review-required',()=>{const s=scopeFor(),a=fact(s,{state:ContinuousComplianceConditionState.REVIEW_REQUIRED,blocking:false}),b=fact(s,{reference:'fact:future',timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE,state:ContinuousComplianceConditionState.UNSATISFIED});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.REVIEW_REQUIRED);});
test('M06S08-080 current indeterminate plus future risk remains indeterminate',()=>{const s=scopeFor(),a=fact(s,{state:ContinuousComplianceConditionState.INDETERMINATE,blocking:false}),b=fact(s,{reference:'fact:future',timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE,state:ContinuousComplianceConditionState.UNSATISFIED});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.INDETERMINATE);});
test('M06S08-081 current non-compliance plus future risk remains non-compliant',()=>{const s=scopeFor(),a=fact(s,{state:ContinuousComplianceConditionState.UNSATISFIED,blocking:true}),b=fact(s,{reference:'fact:future',timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE,state:ContinuousComplianceConditionState.UNSATISFIED});assert.equal(project(s,[a,b]).toJSON().status,ContinuousComplianceStatus.NON_COMPLIANT);});
test('M06S08-082 verified current action-required yields at-risk',()=>{const s=scopeFor(),f=fact(s,{actionRequired:true});assert.equal(project(s,[f]).toJSON().status,ContinuousComplianceStatus.AT_RISK);});
test('M06S08-083 conditional fact preserves condition references',()=>{const s=scopeFor(),f=fact(s,{state:ContinuousComplianceConditionState.SATISFIED_WITH_CONDITIONS,conditionReferences:['condition:b','condition:a']}),v=project(s,[f]).toJSON();assert.deepEqual(v.facts[0]!.conditionReferences,['condition:a','condition:b']);});
test('M06S08-084 projection reason codes explain final status',()=>{const s=scopeFor(),v=project(s,[fact(s)]).toJSON();assert(v.reasonCodes.includes('COMPLIANCE_STATUS:COMPLIANT'));});
test('M06S08-085 fact input ordering does not change final status',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:a'}),b=fact(s,{reference:'fact:b'});assert.equal(JSON.stringify(project(s,[a,b])),JSON.stringify(project(s,[b,a])));});
test('M06S08-086 baseline-only projection requires no reevaluation batch',()=>{const s=scopeFor();assert.equal(project(s,[fact(s)]).toJSON().status,ContinuousComplianceStatus.COMPLIANT);});
test('M06S08-087 reevaluation fact without supplied batch rejected',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r);assert.throws(()=>project(s,[f]));});
test('M06S08-088 supplied reevaluation batch accepted',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r);assert.doesNotThrow(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-089 foreign reevaluation decision reference rejected',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r,{sourceReference:'reeval:foreign',reevaluationDecisionReference:'reeval:foreign'});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-090 reevaluation decision target must match fact target',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r,{targetReference:'node:other'});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-091 reevaluation review decision requires review fact',()=>{const s=scopeFor(),r=reevaluation({mode:LifecycleDependencyImpactMode.REVIEW_ONLY}),f=reevalCondition(s,r,{state:ContinuousComplianceConditionState.SATISFIED});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-092 reevaluation indeterminate decision requires indeterminate fact',()=>{const s=scopeFor(),r=reevaluation({state:LifecycleReevaluationFactState.INDETERMINATE}),f=reevalCondition(s,r,{state:ContinuousComplianceConditionState.SATISFIED});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-093 reevaluation future-impact decision requires future timing',()=>{const s=scopeFor(),r=reevaluation({effectiveFrom:FUTURE}),f=reevalCondition(s,r,{timing:ContinuousComplianceTiming.CURRENT,effectiveAt:T1});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-094 reevaluation current decision requires current timing',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r,{timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-095 reevaluation action-required decision requires action flag',()=>{const s=scopeFor(),r=reevaluation({actionRequired:true,newResult:'NOT_SATISFIED'}),f=reevalCondition(s,r,{actionRequired:false});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-096 reevaluation correlation must match fact',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r,{correlationReference:'corr:wrong'});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-097 reevaluation horizon cannot exceed projection horizon',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r);assert.throws(()=>project(s,[f],{reevaluation:r.batch,evaluatedAt:T2,context:context({requestedAt:T2})}));});
test('M06S08-098 unchanged reevaluation may support current satisfied condition',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r),v=project(s,[f],{reevaluation:r.batch}).toJSON();assert.equal(v.status,ContinuousComplianceStatus.COMPLIANT);});
test('M06S08-099 status-changed reevaluation may support current unsatisfied condition',()=>{const s=scopeFor(),r=reevaluation({newResult:'NOT_SATISFIED'}),f=reevalCondition(s,r,{state:ContinuousComplianceConditionState.UNSATISFIED,blocking:true}),v=project(s,[f],{reevaluation:r.batch}).toJSON();assert.equal(v.status,ContinuousComplianceStatus.NON_COMPLIANT);});
test('M06S08-100 review batch cannot become optimistic compliance through mismatched fact',()=>{const s=scopeFor(),r=reevaluation({mode:LifecycleDependencyImpactMode.REVIEW_ONLY}),f=reevalCondition(s,r,{state:ContinuousComplianceConditionState.SATISFIED});assert.throws(()=>project(s,[f],{reevaluation:r.batch}));});
test('M06S08-101 reevaluation object remains unchanged',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r),before=JSON.stringify(r.batch);project(s,[f],{reevaluation:r.batch});assert.equal(JSON.stringify(r.batch),before);});
test('M06S08-102 projection retains exact scope reference and kind',()=>{const s=scopeFor(),v=project(s,[fact(s)]).toJSON();assert.equal(v.scope.reference,s.reference);assert.equal(v.scope.kind,s.kind);});
test('M06S08-103 projection retains jurisdiction',()=>{const s=scopeFor(),v=project(s,[fact(s)]).toJSON();assert.equal(v.scope.jurisdictionReference,'CZ');});
test('M06S08-104 projection retains evaluation and knowledge instants',()=>{const s=scopeFor(),v=project(s,[fact(s)]).toJSON();assert.equal(v.evaluatedAt,NOW.toString());assert.equal(v.asKnownAt,NOW.toString());});
test('M06S08-105 projection exposes canonical source-version context',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:b',sourceReference:'source:b',sourceVersion:V2}),b=fact(s,{reference:'fact:a',sourceReference:'source:a',sourceVersion:V1}),v=project(s,[a,b]).toJSON();assert.deepEqual(v.sourceVersions.map(x=>x.sourceReference),['source:a','source:b']);});
test('M06S08-106 projection separates current and future fact references',()=>{const s=scopeFor(),a=fact(s,{reference:'fact:current'}),b=fact(s,{reference:'fact:future',timing:ContinuousComplianceTiming.FUTURE,effectiveAt:FUTURE}),v=project(s,[b,a]).toJSON();assert.deepEqual(v.currentFactReferences,['fact:current']);assert.deepEqual(v.futureFactReferences,['fact:future']);});
test('M06S08-107 projection exposes blocking fact references',()=>{const s=scopeFor(),v=project(s,[fact(s,{reference:'fact:block',blocking:true})]).toJSON();assert(v.blockingFactReferences.includes('fact:block'));});
test('M06S08-108 projection exposes conditional fact references',()=>{const s=scopeFor(),f=fact(s,{reference:'fact:cond',state:ContinuousComplianceConditionState.SATISFIED_WITH_CONDITIONS,conditionReferences:['condition:1']}),v=project(s,[f]).toJSON();assert.deepEqual(v.conditionalFactReferences,['fact:cond']);});
test('M06S08-109 projection exposes review fact references',()=>{const s=scopeFor(),f=fact(s,{reference:'fact:review',verificationState:UNVERIFIED}),v=project(s,[f]).toJSON();assert.deepEqual(v.reviewFactReferences,['fact:review']);});
test('M06S08-110 projection exposes indeterminate fact references',()=>{const s=scopeFor(),f=fact(s,{reference:'fact:ind',verificationState:STALE}),v=project(s,[f]).toJSON();assert.deepEqual(v.indeterminateFactReferences,['fact:ind']);});
test('M06S08-111 projection exposes action-required fact references',()=>{const s=scopeFor(),f=fact(s,{reference:'fact:action',actionRequired:true}),v=project(s,[f]).toJSON();assert.deepEqual(v.actionRequiredFactReferences,['fact:action']);});
test('M06S08-112 projection exposes reevaluation decision references',()=>{const s=scopeFor(),r=reevaluation(),f=reevalCondition(s,r),v=project(s,[f],{reevaluation:r.batch}).toJSON();assert.deepEqual(v.reevaluationDecisionReferences,[r.decision.decisionReference]);});
test('M06S08-113 organization projection cannot infer assignment compliance',()=>{const s=scopeFor(ContinuousComplianceScopeKind.ORGANIZATION),f=fact(s),v=project(s,[f],{context:context({subject:null})}).toJSON();assert.equal(v.organizationAggregateOnly,true);assert.equal(v.assignmentInferenceAuthorized,false);});
test('M06S08-114 assignment inference remains unauthorized for every scope',()=>{for(const k of Object.values(ContinuousComplianceScopeKind)){const s=scopeFor(k),f=fact(s),v=project(s,[f],{context:context({subject:s.subject})}).toJSON();assert.equal(v.assignmentInferenceAuthorized,false);}});
test('M06S08-115 projection output deeply readonly',()=>{const s=scopeFor(),v=project(s,[fact(s)]).toJSON();assert(Object.isFrozen(v));assert(Object.isFrozen(v.facts));assert(Object.isFrozen(v.currentFactReferences));assert.throws(()=>(v.facts as unknown[]).push({}));});
test('M06S08-116 facts and scope remain unchanged after projection',()=>{const s=scopeFor(),f=fact(s),before=JSON.stringify([s,f]);project(s,[f]);assert.equal(JSON.stringify([s,f]),before);});
test('M06S08-117 identical replay is byte stable',()=>{const s=scopeFor(),f=fact(s);assert.equal(JSON.stringify(project(s,[f])),JSON.stringify(project(s,[f])));});
test('M06S08-118 safe output excludes raw storage contact and provider payloads',()=>{const s=scopeFor(),v=JSON.stringify(project(s,[fact(s)]));for(const bad of ['s3://','rawBody','providerToken','phoneNumber','messageBody','@example.com'])assert(!v.includes(bad));});
test('M06S08-119 all authority and mutation flags remain negative',()=>{const s=scopeFor(),v=project(s,[fact(s)]).toJSON();assert.equal(v.authorizationAuthority,false);assert.equal(v.credentialStateMutated,false);assert.equal(v.authorizationStateMutated,false);assert.equal(v.historicalDecisionMutated,false);assert.equal(v.reevaluationDecisionMutated,false);assert.equal(v.assignmentDecisionMutated,false);assert.equal(v.assignmentInferenceAuthorized,false);assert.equal(v.physicalDeletionAuthorized,false);});
test('M06S08-120 no notification provider or event side effect occurs',()=>{const s=scopeFor(),v=project(s,[fact(s)]).toJSON();assert.equal(v.notificationScheduled,false);assert.equal(v.providerInvoked,false);assert.equal(v.eventsEmitted,0);});
