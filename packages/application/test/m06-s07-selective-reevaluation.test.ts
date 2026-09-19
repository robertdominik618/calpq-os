import test from 'node:test';
import assert from 'node:assert/strict';
import { ActorId, ActorKind, ActorReference, CorrelationId, SubjectId, SubjectKind, SubjectReference, UtcInstant, VerificationState, VersionId } from '../../core/src/index.ts';
import { AccessDecisionReference, AccessDisposition, ApplicationExecutionContext, ApplicationOperationReference, AuditReference, OrganizationScopeReference, PurposeReference, TenantAccessDecision, TenantAccessDeniedError, TenantBoundary, TenantContext, TenantScopeReference } from '../src/index.ts';
import {
  DEPENDENCY_GRAPH_FIELD,
  DEPENDENCY_GRAPH_OPERATION,
  LifecycleChangeEvent,
  LifecycleChangeType,
  LifecycleDependencyEdge,
  LifecycleDependencyEdgeKind,
  LifecycleDependencyGraphSnapshot,
  LifecycleDependencyImpactMode,
  LifecycleDependencyImpactTraversal,
  LifecycleDependencyNode,
  LifecycleDependencyNodeType,
} from '../src/lifecycle/dependency-graph.ts';
import type { DependencyImpactTraversalInput, LifecycleChangeEventInput, LifecycleDependencyEdgeInput, LifecycleDependencyGraphSnapshotInput, LifecycleDependencyNodeInput } from '../src/lifecycle/dependency-graph.ts';
import {
  LifecycleReevaluationBatchOutcome,
  LifecycleReevaluationFact,
  LifecycleReevaluationFactState,
  LifecycleReevaluationOutcome,
  LifecycleSelectiveReevaluation,
  SELECTIVE_REEVALUATION_FIELD,
  SELECTIVE_REEVALUATION_OPERATION,
} from '../src/lifecycle/selective-reevaluation.ts';
import type { LifecycleReevaluationFactInput, SelectiveReevaluationInput } from '../src/lifecycle/selective-reevaluation.ts';

const uuid=(n:number)=>'018f3f7e-cccc-7abc-8def-'+String(n).padStart(12,'0');
const at=(s:string)=>UtcInstant.from(s),V1=VersionId.from('v1'),V2=VersionId.from('v2');
const T0=at('2025-01-01T00:00:00Z'),T1=at('2025-06-01T00:00:00Z'),T2=at('2025-08-01T00:00:00Z'),NOW=at('2025-12-20T12:00:00Z'),FUTURE=at('2026-02-01T00:00:00Z');
const human=(n:number)=>ActorReference.create(ActorId.from(uuid(n)),ActorKind.HUMAN_USER);
const OPERATOR=human(1),OTHER_ACTOR=human(2),GRANTOR=human(3),EVALUATOR=human(4);
const SUBJECT=SubjectReference.create(SubjectId.from(uuid(10)),SubjectKind.PERSON);
const OTHER_SUBJECT=SubjectReference.create(SubjectId.from(uuid(11)),SubjectKind.PERSON);
const SUBJECT_ORG=SubjectReference.create(SUBJECT.id,SubjectKind.ORGANIZATION);
const TENANT=TenantScopeReference.from('tenant:reeval'),OTHER_TENANT=TenantScopeReference.from('tenant:other');
const ORG=OrganizationScopeReference.from('org:reeval'),OTHER_ORG=OrganizationScopeReference.from('org:other');
const PURPOSE=PurposeReference.from('purpose:reeval'),OTHER_PURPOSE=PurposeReference.from('purpose:other');
const CORR=CorrelationId.from(uuid(20)),OTHER_CORR=CorrelationId.from(uuid(21));
const DEP_ACCESS=AccessDecisionReference.from('access:dependency'),REEVAL_ACCESS=AccessDecisionReference.from('access:reeval');
const VERIFIED=VerificationState.from('VERIFIED'),UNVERIFIED=VerificationState.from('UNVERIFIED');

function node(reference='node:root',type:LifecycleDependencyNodeType=LifecycleDependencyNodeType.RULE_VERSION,overrides:Partial<LifecycleDependencyNodeInput>={}){
  return LifecycleDependencyNode.create({reference,type,version:V1,tenant:TENANT,organization:ORG,subject:SUBJECT,jurisdictionReference:'CZ',provenanceReference:'prov:'+reference,knownAt:T0,...overrides});
}
function edge(id='edge:1',sourceReference='node:root',targetReference='node:target',impactMode:LifecycleDependencyImpactMode=LifecycleDependencyImpactMode.MANDATORY,overrides:Partial<LifecycleDependencyEdgeInput>={}){
  return LifecycleDependencyEdge.create({id,sourceReference,targetReference,kind:LifecycleDependencyEdgeKind.DEPENDS_ON,impactMode,provenanceReference:'prov:'+id,knownAt:T0,...overrides});
}
function graph(nodes:readonly LifecycleDependencyNode[]=[],edges:readonly LifecycleDependencyEdge[]=[],overrides:Partial<LifecycleDependencyGraphSnapshotInput>={}){
  const ns=nodes.length?nodes:[node('node:root'),node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT)];
  const es=edges.length||nodes.length?edges:[edge()];
  return LifecycleDependencyGraphSnapshot.create({id:'graph:reeval',version:V1,tenant:TENANT,organization:ORG,subject:SUBJECT,nodes:ns,edges:es,capturedAt:T1,asKnownAt:T1,provenanceReference:'prov:graph',...overrides});
}
function depContext(overrides:Partial<Parameters<typeof ApplicationExecutionContext.create>[0]>={}){
  return ApplicationExecutionContext.create({operation:ApplicationOperationReference.from(DEPENDENCY_GRAPH_OPERATION),actor:OPERATOR,subject:SUBJECT,tenantScope:TENANT,organizationScope:ORG,purpose:PURPOSE,correlationId:CORR,requestedAt:NOW,contractVersion:V1,accessDecision:DEP_ACCESS,...overrides});
}
function reevalContext(overrides:Partial<Parameters<typeof ApplicationExecutionContext.create>[0]>={}){
  return ApplicationExecutionContext.create({operation:ApplicationOperationReference.from(SELECTIVE_REEVALUATION_OPERATION),actor:OPERATOR,subject:SUBJECT,tenantScope:TENANT,organizationScope:ORG,purpose:PURPOSE,correlationId:CORR,requestedAt:NOW,contractVersion:V1,accessDecision:REEVAL_ACCESS,...overrides});
}
function reader(actor=OPERATOR,overrides:Partial<Parameters<typeof TenantContext.create>[0]>={}){
  return TenantContext.create({tenant:TENANT,organization:ORG,actor,purpose:PURPOSE,correlationId:CORR,...overrides});
}
function depAccess(overrides:Partial<Parameters<typeof TenantAccessDecision.create>[0]>={}){
  return TenantAccessDecision.create({reference:DEP_ACCESS,tenant:TENANT,purpose:PURPOSE,disposition:AccessDisposition.ALLOW,allowedFields:[DEPENDENCY_GRAPH_FIELD],decidedBy:GRANTOR,auditReference:AuditReference.from('audit:dependency'),...overrides});
}
function reevalAccess(overrides:Partial<Parameters<typeof TenantAccessDecision.create>[0]>={}){
  return TenantAccessDecision.create({reference:REEVAL_ACCESS,tenant:TENANT,purpose:PURPOSE,disposition:AccessDisposition.ALLOW,allowedFields:[SELECTIVE_REEVALUATION_FIELD],decidedBy:GRANTOR,auditReference:AuditReference.from('audit:reeval'),...overrides});
}
function event(g:LifecycleDependencyGraphSnapshot,overrides:Partial<LifecycleChangeEventInput>={}){
  return LifecycleChangeEvent.create({id:'change:1',type:LifecycleChangeType.REGULATORY_RULE_CHANGED,graph:g,rootNodeReference:'node:root',tenant:TENANT,organization:ORG,subject:SUBJECT,occurredAt:T2,observedAt:T2,effectiveFrom:null,verificationState:VERIFIED,jurisdictionReference:'CZ',provenanceReference:'prov:change',correlationReference:'corr:change',causationReference:null,...overrides});
}
function depInput(g:LifecycleDependencyGraphSnapshot,e=event(g),overrides:Partial<DependencyImpactTraversalInput>={}):DependencyImpactTraversalInput{
  return {context:depContext(),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:depAccess(),graph:g,event:e,evaluatedAt:NOW,asKnownAt:NOW,allowedTargetTypes:[LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT],maxDepth:16,maxCandidates:64,maxPaths:256,...overrides};
}
const impact=(g:LifecycleDependencyGraphSnapshot,e=event(g),overrides:Partial<DependencyImpactTraversalInput>={})=>LifecycleDependencyImpactTraversal.evaluate(depInput(g,e,overrides));
function chain(mode:LifecycleDependencyImpactMode=LifecycleDependencyImpactMode.MANDATORY){
  const root=node('node:root'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT);
  const g=graph([root,target],[edge('edge:1',root.reference,target.reference,mode)]);
  const e=event(g),i=impact(g,e);
  return {root,target,g,e,i};
}
function fact(candidate:ReturnType<LifecycleDependencyImpactTraversal['toJSON']>['candidates'][number],overrides:Partial<LifecycleReevaluationFactInput>={}){
  return LifecycleReevaluationFact.create({
    reference:'fact:'+candidate.targetReference,
    candidateDedupKey:candidate.dedupKey,
    targetReference:candidate.targetReference,
    targetType:candidate.targetType,
    targetVersion:candidate.targetVersion===null?null:VersionId.from(candidate.targetVersion),
    state:LifecycleReevaluationFactState.COMPLETE,
    previousDecisionReference:'decision:old',
    previousResult:'SATISFIED',
    newResult:'SATISFIED',
    actionRequired:false,
    evaluatedBy:EVALUATOR,
    evaluatedAt:NOW,
    asKnownAt:NOW,
    versionBindings:candidate.requiredVersions.map(v=>({reference:v.reference,type:v.type,version:VersionId.from(v.version)})),
    evidenceReferences:['evidence:1'],
    provenanceReference:'prov:reeval',
    correlationReference:'corr:change',
    causationReference:'cause:reeval',
    reasonCodes:['EVALUATED'],
    ...overrides,
  });
}
function input(g:LifecycleDependencyGraphSnapshot,e:LifecycleChangeEvent,i:LifecycleDependencyImpactTraversal,facts?:readonly LifecycleReevaluationFact[],overrides:Partial<SelectiveReevaluationInput>={}):SelectiveReevaluationInput{
  const defaultFacts=facts??i.toJSON().candidates.filter(c=>!c.reviewRequired&&!c.futureImpact).map(c=>fact(c));
  return {context:reevalContext(),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:reevalAccess(),graph:g,event:e,impact:i,facts:defaultFacts,evaluatedAt:NOW,asKnownAt:NOW,maxDecisions:64,...overrides};
}
const run=(g:LifecycleDependencyGraphSnapshot,e:LifecycleChangeEvent,i:LifecycleDependencyImpactTraversal,facts?:readonly LifecycleReevaluationFact[],overrides:Partial<SelectiveReevaluationInput>={})=>LifecycleSelectiveReevaluation.evaluate(input(g,e,i,facts,overrides));

test('M06S07-001 immutable reevaluation fact identity and candidate binding',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c);assert.equal(f.reference,'fact:node:target');assert.equal(f.candidateDedupKey,c.dedupKey);assert(Object.isFrozen(f));});
test('M06S07-002 empty fact reference rejected',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{reference:''}));});
test('M06S07-003 unknown fact state rejected',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{state:'MAGIC' as never}));});
test('M06S07-004 target type is controlled',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{targetType:'MAGIC' as never}));});
test('M06S07-005 target version is explicit when present',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c);assert.equal(f.targetVersion?.toString(),c.targetVersion);});
test('M06S07-006 previous decision reference and result are paired',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{previousDecisionReference:null,previousResult:'SATISFIED'}));assert.throws(()=>fact(c,{previousDecisionReference:'decision:x',previousResult:null}));});
test('M06S07-007 complete fact requires new result',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{newResult:null}));});
test('M06S07-008 review-required fact cannot smuggle result',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{state:LifecycleReevaluationFactState.REVIEW_REQUIRED,newResult:'SATISFIED'}));});
test('M06S07-009 indeterminate fact cannot smuggle result',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{state:LifecycleReevaluationFactState.INDETERMINATE,newResult:'SATISFIED'}));});
test('M06S07-010 action-required flag allowed only for complete fact',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{state:LifecycleReevaluationFactState.REVIEW_REQUIRED,newResult:null,actionRequired:true}));});
test('M06S07-011 evaluator actor is governed',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{evaluatedBy:{} as never}));});
test('M06S07-012 evaluation instant is explicit',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{evaluatedAt:{} as never}));});
test('M06S07-013 fact knowledge horizon cannot exceed evaluation instant',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{evaluatedAt:NOW,asKnownAt:FUTURE}));});
test('M06S07-014 version bindings are bounded dense governed data',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;const sparse=new Array<LifecycleReevaluationFactInput['versionBindings'][number]>(2);sparse[0]={reference:'x',type:LifecycleDependencyNodeType.RULE_VERSION,version:V1};assert.throws(()=>fact(c,{versionBindings:sparse}));});
test('M06S07-015 duplicate version binding rejected',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!,b={reference:'x',type:LifecycleDependencyNodeType.RULE_VERSION,version:V1};assert.throws(()=>fact(c,{versionBindings:[b,b]}));});
test('M06S07-016 evidence references are bounded dense data',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;const sparse=new Array<string>(2);sparse[0]='evidence:1';assert.throws(()=>fact(c,{evidenceReferences:sparse}));});
test('M06S07-017 duplicate evidence reference rejected',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{evidenceReferences:['evidence:1','evidence:1']}));});
test('M06S07-018 provenance reference is mandatory',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!;assert.throws(()=>fact(c,{provenanceReference:''}));});
test('M06S07-019 correlation and causation references retained',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!,v=fact(c,{correlationReference:'corr:x',causationReference:'cause:x'}).toJSON();assert.equal(v.correlationReference,'corr:x');assert.equal(v.causationReference,'cause:x');});
test('M06S07-020 fact serialization exposes safe metadata only',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!,v=JSON.stringify(fact(c));for(const bad of ['s3://','providerToken','rawBody','@example.com'])assert(!v.includes(bad));});
test('M06S07-021 explicit scoped invocation required',()=>{const {g,e,i}=chain();assert.throws(()=>LifecycleSelectiveReevaluation.evaluate({...input(g,e,i),context:{} as never}),TenantAccessDeniedError);});
test('M06S07-022 denial occurs before graph or decision disclosure',()=>{const {g,e,i}=chain();assert.throws(()=>LifecycleSelectiveReevaluation.evaluate({...input(g,e,i),graph:{} as never,accessDecision:reevalAccess({disposition:AccessDisposition.DENY})}),TenantAccessDeniedError);});
test('M06S07-023 cross-tenant invocation denied',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({tenantScope:OTHER_TENANT})}),TenantAccessDeniedError);});
test('M06S07-024 cross-organization invocation denied',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({organizationScope:OTHER_ORG})}),TenantAccessDeniedError);});
test('M06S07-025 foreign subject identity denied',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({subject:OTHER_SUBJECT})}),TenantAccessDeniedError);});
test('M06S07-026 foreign subject kind denied',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({subject:SUBJECT_ORG})}),TenantAccessDeniedError);});
test('M06S07-027 actor identity mismatch denied',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({actor:OTHER_ACTOR})}),TenantAccessDeniedError);});
test('M06S07-028 actor kind mismatch denied',()=>{const {g,e,i}=chain(),a=ActorReference.create(OPERATOR.id,ActorKind.SYSTEM_PROCESS);assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({actor:a})}),TenantAccessDeniedError);});
test('M06S07-029 purpose mismatch denied',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({purpose:OTHER_PURPOSE})}),TenantAccessDeniedError);});
test('M06S07-030 correlation continuity required',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({correlationId:OTHER_CORR})}),TenantAccessDeniedError);});
test('M06S07-031 selective reevaluation operation required',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({operation:ApplicationOperationReference.from('wrong.operation')})}),TenantAccessDeniedError);});
test('M06S07-032 selective reevaluation field authorization required',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{accessDecision:reevalAccess({allowedFields:['credential:other']})}),TenantAccessDeniedError);});
test('M06S07-033 access-decision reference must match',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{context:reevalContext({accessDecision:AccessDecisionReference.from('access:other')})}),TenantAccessDeniedError);});
test('M06S07-034 graph scope must match invocation',()=>{const {e,i}=chain(),r=node('node:root',LifecycleDependencyNodeType.RULE_VERSION,{tenant:OTHER_TENANT}),t=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT,{tenant:OTHER_TENANT}),bad=graph([r,t],[edge()],{tenant:OTHER_TENANT});assert.throws(()=>run(bad,e,i,[]),TenantAccessDeniedError);});
test('M06S07-035 change event must bind exact graph',()=>{const {g,i}=chain(),other=graph([],[],{id:'graph:other'}),e=event(other);assert.throws(()=>run(g,e,i,[]));});
test('M06S07-036 impact traversal must bind graph and event identities',()=>{const a=chain(),b=chain();const e2=event(b.g,{id:'change:other'}),i2=impact(b.g,e2);assert.throws(()=>run(a.g,a.e,i2,[]));});
test('M06S07-037 impact correlation remains traceable',()=>{const {g,e}=chain();const i=impact(g,e,{context:depContext({correlationId:OTHER_CORR}),authorizedContext:reader(OPERATOR,{correlationId:OTHER_CORR})});assert.throws(()=>run(g,e,i,[]),TenantAccessDeniedError);});
test('M06S07-038 evaluation instant matches request horizon',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{evaluatedAt:T2}));});
test('M06S07-039 as-known horizon is explicit and bounded',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{asKnownAt:FUTURE}));});
test('M06S07-040 decision budget is explicit and bounded',()=>{const {g,e,i}=chain();assert.throws(()=>run(g,e,i,undefined,{maxDecisions:0}));assert.throws(()=>run(g,e,i,undefined,{maxDecisions:513}));});
test('M06S07-041 no-impact traversal yields zero decisions',()=>{const root=node('node:root'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,target],[],{id:'graph:none'}),e=event(g),i=impact(g,e),v=run(g,e,i,[]).toJSON();assert.equal(v.decisions.length,0);assert.equal(v.outcome,LifecycleReevaluationBatchOutcome.NO_IMPACT);});
test('M06S07-042 fact supplied with no impact candidate rejected',()=>{const a=chain(),root=node('node:root'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,target],[],{id:'graph:none'}),e=event(g),i=impact(g,e);assert.throws(()=>run(g,e,i,[fact(a.i.toJSON().candidates[0]!) ]));});
test('M06S07-043 only S06-selected candidates are processed',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.deepEqual(v.decisions.map(d=>d.targetReference),['node:target']);});
test('M06S07-044 unrelated target fact rejected',()=>{const a=chain(),c=a.i.toJSON().candidates[0]!,f=fact(c,{candidateDedupKey:'impact:foreign'});assert.throws(()=>run(a.g,a.e,a.i,[f]));});
test('M06S07-045 duplicate fact for one candidate rejected',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c);assert.throws(()=>run(g,e,i,[f,f]));});
test('M06S07-046 fact target reference must match candidate',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c,{targetReference:'node:other'});assert.throws(()=>run(g,e,i,[f]));});
test('M06S07-047 fact target type must match candidate',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c,{targetType:LifecycleDependencyNodeType.AUTHORIZATION_GRANT});assert.throws(()=>run(g,e,i,[f]));});
test('M06S07-048 fact target version must match candidate',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c,{targetVersion:V2});assert.throws(()=>run(g,e,i,[f]));});
test('M06S07-049 candidate dedup identity must match exactly',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c,{candidateDedupKey:c.dedupKey+':changed'});assert.throws(()=>run(g,e,i,[f]));});
test('M06S07-050 required version bindings must match candidate exactly',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c,{versionBindings:[]});assert.throws(()=>run(g,e,i,[f]));});
test('M06S07-051 fact cannot predate impact evaluation horizon',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c,{evaluatedAt:T2,asKnownAt:T2});assert.throws(()=>run(g,e,i,[f]));});
test('M06S07-052 future fact beyond batch horizon rejected',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c,{evaluatedAt:FUTURE,asKnownAt:FUTURE});assert.throws(()=>run(g,e,i,[f]));});
test('M06S07-053 mandatory current candidate consumes exact fact',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.reevaluationFactsApplied,1);});
test('M06S07-054 advisory current candidate consumes exact fact',()=>{const {g,e,i}=chain(LifecycleDependencyImpactMode.ADVISORY),v=run(g,e,i).toJSON();assert.equal(v.reevaluationFactsApplied,1);});
test('M06S07-055 review-only candidate produces review evidence',()=>{const {g,e,i}=chain(LifecycleDependencyImpactMode.REVIEW_ONLY),v=run(g,e,i,[]).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.REVIEW_REQUIRED);});
test('M06S07-056 fact for review-only candidate rejected',()=>{const {g,e,i}=chain(LifecycleDependencyImpactMode.REVIEW_ONLY),c=i.toJSON().candidates[0]!;assert.throws(()=>run(g,e,i,[fact(c)]));});
test('M06S07-057 future-effective candidate registers future impact',()=>{const base=chain(),e=event(base.g,{effectiveFrom:FUTURE}),i=impact(base.g,e),v=run(base.g,e,i,[]).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.FUTURE_IMPACT_REGISTERED);});
test('M06S07-058 fact for future-effective candidate rejected',()=>{const base=chain(),e=event(base.g,{effectiveFrom:FUTURE}),i=impact(base.g,e),c=i.toJSON().candidates[0]!;assert.throws(()=>run(base.g,e,i,[fact(c)]));});
test('M06S07-059 incomplete impact traversal blocks ordinary reevaluation',()=>{const root=node('node:root'),mid=node('node:mid'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,mid,target],[edge('edge:1','node:root','node:mid'),edge('edge:2','node:mid','node:target')]),e=event(g),i=impact(g,e,{maxDepth:1}),v=run(g,e,i,[]).toJSON();assert.equal(v.outcome,LifecycleReevaluationBatchOutcome.REVIEW_REQUIRED);});
test('M06S07-060 facts rejected when impact traversal is incomplete',()=>{const root=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,a,b],[edge('edge:a','node:root','node:a'),edge('edge:b','node:root','node:b')]),e=event(g),i=impact(g,e,{maxCandidates:1}),c=i.toJSON().candidates[0]!;assert.throws(()=>run(g,e,i,[fact(c)]));});
test('M06S07-061 cycle-bound candidate remains review required',()=>{const root=node('node:root'),a=node('node:a'),g=graph([root,a],[edge('edge:ra','node:root','node:a'),edge('edge:ar','node:a','node:root')]),e=event(g),i=impact(g,e,{allowedTargetTypes:[LifecycleDependencyNodeType.RULE_VERSION]}),v=run(g,e,i,[]).toJSON();assert.equal(v.outcome,LifecycleReevaluationBatchOutcome.REVIEW_REQUIRED);});
test('M06S07-062 traversal budget incompleteness remains review required',()=>{const root=node('node:root'),mid=node('node:mid'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,mid,target],[edge('edge:1','node:root','node:mid'),edge('edge:2','node:mid','node:target')]),e=event(g),i=impact(g,e,{maxDepth:1}),v=run(g,e,i,[]).toJSON();assert.equal(v.complete,false);});
test('M06S07-063 evaluation order uses shortest dependency path',()=>{const r=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),m=node('node:mid'),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([r,a,m,b],[edge('edge:a','node:root','node:a'),edge('edge:m','node:root','node:mid'),edge('edge:b','node:mid','node:b')]),e=event(g),i=impact(g,e),v=run(g,e,i).toJSON();assert.deepEqual(v.decisions.map(d=>d.targetReference),['node:a','node:b']);});
test('M06S07-064 equal-depth order uses target reference tiebreaker',()=>{const r=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([r,b,a],[edge('edge:b','node:root','node:b'),edge('edge:a','node:root','node:a')]),e=event(g),i=impact(g,e),v=run(g,e,i).toJSON();assert.deepEqual(v.decisions.map(d=>d.targetReference),['node:a','node:b']);});
test('M06S07-065 complete equal result yields unchanged',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.UNCHANGED);});
test('M06S07-066 complete changed result yields status changed',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,v=run(g,e,i,[fact(c,{newResult:'NOT_SATISFIED'})]).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.STATUS_CHANGED);});
test('M06S07-067 explicit action requirement yields action required',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,v=run(g,e,i,[fact(c,{newResult:'NOT_SATISFIED',actionRequired:true})]).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.ACTION_REQUIRED);});
test('M06S07-068 review evaluator fact yields review required',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,v=run(g,e,i,[fact(c,{state:LifecycleReevaluationFactState.REVIEW_REQUIRED,newResult:null,actionRequired:false})]).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.REVIEW_REQUIRED);});
test('M06S07-069 indeterminate evaluator fact yields indeterminate',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,v=run(g,e,i,[fact(c,{state:LifecycleReevaluationFactState.INDETERMINATE,newResult:null,actionRequired:false})]).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.INDETERMINATE);});
test('M06S07-070 missing evaluator fact yields indeterminate',()=>{const {g,e,i}=chain(),v=run(g,e,i,[]).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.INDETERMINATE);});
test('M06S07-071 future impact yields future-impact-registered',()=>{const base=chain(),e=event(base.g,{effectiveFrom:FUTURE}),i=impact(base.g,e),v=run(base.g,e,i,[]).toJSON();assert.equal(v.outcome,LifecycleReevaluationBatchOutcome.FUTURE_IMPACT_REGISTERED);});
test('M06S07-072 review boundary takes precedence over future impact',()=>{const base=chain(LifecycleDependencyImpactMode.REVIEW_ONLY),e=event(base.g,{effectiveFrom:FUTURE}),i=impact(base.g,e),v=run(base.g,e,i,[]).toJSON();assert.equal(v.decisions[0]!.outcome,LifecycleReevaluationOutcome.REVIEW_REQUIRED);});
test('M06S07-073 previous decision reference retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.decisions[0]!.previousDecisionReference,'decision:old');});
test('M06S07-074 previous result retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.decisions[0]!.previousResult,'SATISFIED');});
test('M06S07-075 new evaluated result retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.decisions[0]!.newResult,'SATISFIED');});
test('M06S07-076 evaluator attribution retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.decisions[0]!.evaluatorId,EVALUATOR.id.toString());});
test('M06S07-077 evidence references retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.deepEqual(v.decisions[0]!.evidenceReferences,['evidence:1']);});
test('M06S07-078 provenance retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.decisions[0]!.provenanceReference,'prov:reeval');});
test('M06S07-079 dependency paths retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.deepEqual(v.decisions[0]!.dependencyPaths,i.toJSON().candidates[0]!.paths);});
test('M06S07-080 required versions retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.deepEqual(v.decisions[0]!.requiredVersions,i.toJSON().candidates[0]!.requiredVersions);});
test('M06S07-081 triggering change identity retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.eventId,e.id);});
test('M06S07-082 graph identity and version retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.graphId,g.id);assert.equal(v.graphVersion,g.version.toString());});
test('M06S07-083 candidate reason codes retained',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();for(const reason of i.toJSON().candidates[0]!.reasonCodes)assert(v.decisions[0]!.reasonCodes.includes(reason));});
test('M06S07-084 decision reason codes are deterministic',()=>{const {g,e,i}=chain();assert.deepEqual(run(g,e,i).toJSON().decisions[0]!.reasonCodes,run(g,e,i).toJSON().decisions[0]!.reasonCodes);});
test('M06S07-085 decision reference is deterministic',()=>{const {g,e,i}=chain();assert.equal(run(g,e,i).toJSON().decisions[0]!.decisionReference,run(g,e,i).toJSON().decisions[0]!.decisionReference);});
test('M06S07-086 decision dedup key is deterministic',()=>{const {g,e,i}=chain();assert.equal(run(g,e,i).toJSON().decisions[0]!.dedupKey,run(g,e,i).toJSON().decisions[0]!.dedupKey);});
test('M06S07-087 identical input replay returns identical decision',()=>{const {g,e,i}=chain();assert.equal(JSON.stringify(run(g,e,i)),JSON.stringify(run(g,e,i)));});
test('M06S07-088 new fact identity creates new decision identity',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,a=run(g,e,i,[fact(c,{reference:'fact:a'})]),b=run(g,e,i,[fact(c,{reference:'fact:b'})]);assert.notEqual(a.toJSON().decisions[0]!.decisionReference,b.toJSON().decisions[0]!.decisionReference);});
test('M06S07-089 batch no-impact outcome explicit',()=>{const r=node('node:root'),t=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([r,t],[],{id:'graph:none'}),e=event(g),i=impact(g,e);assert.equal(run(g,e,i,[]).toJSON().outcome,LifecycleReevaluationBatchOutcome.NO_IMPACT);});
test('M06S07-090 conclusive current batch outcome completed',()=>{const {g,e,i}=chain();assert.equal(run(g,e,i).toJSON().outcome,LifecycleReevaluationBatchOutcome.COMPLETED);});
test('M06S07-091 review decision lifts batch to review-required',()=>{const {g,e,i}=chain(LifecycleDependencyImpactMode.REVIEW_ONLY);assert.equal(run(g,e,i,[]).toJSON().outcome,LifecycleReevaluationBatchOutcome.REVIEW_REQUIRED);});
test('M06S07-092 indeterminate decision lifts batch to indeterminate',()=>{const {g,e,i}=chain();assert.equal(run(g,e,i,[]).toJSON().outcome,LifecycleReevaluationBatchOutcome.INDETERMINATE);});
test('M06S07-093 future-only batch outcome future-impact-registered',()=>{const base=chain(),e=event(base.g,{effectiveFrom:FUTURE}),i=impact(base.g,e);assert.equal(run(base.g,e,i,[]).toJSON().outcome,LifecycleReevaluationBatchOutcome.FUTURE_IMPACT_REGISTERED);});
test('M06S07-094 mixed unchanged and status-changed remains completed',()=>{const r=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([r,a,b],[edge('edge:a','node:root','node:a'),edge('edge:b','node:root','node:b')]),e=event(g),i=impact(g,e),[ca,cb]=i.toJSON().candidates;const v=run(g,e,i,[fact(ca!),fact(cb!,{newResult:'NOT_SATISFIED'})]).toJSON();assert.equal(v.outcome,LifecycleReevaluationBatchOutcome.COMPLETED);});
test('M06S07-095 review-required precedence over indeterminate',()=>{const r=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([r,a,b],[edge('edge:a','node:root','node:a',LifecycleDependencyImpactMode.REVIEW_ONLY),edge('edge:b','node:root','node:b')]),e=event(g),i=impact(g,e),v=run(g,e,i,[]).toJSON();assert.equal(v.outcome,LifecycleReevaluationBatchOutcome.REVIEW_REQUIRED);});
test('M06S07-096 processing completeness distinguished from conclusiveness',()=>{const {g,e,i}=chain(LifecycleDependencyImpactMode.REVIEW_ONLY),v=run(g,e,i,[]).toJSON();assert.equal(v.complete,true);assert.equal(v.conclusive,false);});
test('M06S07-097 graph event impact and facts remain unchanged',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c),before=JSON.stringify([g,e,i,f]);run(g,e,i,[f]);assert.equal(JSON.stringify([g,e,i,f]),before);});
test('M06S07-098 output is deeply readonly',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert(Object.isFrozen(v));assert(Object.isFrozen(v.decisions));assert(Object.isFrozen(v.decisions[0]!.dependencyPaths));assert.throws(()=>(v.decisions as unknown[]).push({}));});
test('M06S07-099 fact input order does not affect byte-stable output',()=>{const r=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([r,a,b],[edge('edge:a','node:root','node:a'),edge('edge:b','node:root','node:b')]),e=event(g),i=impact(g,e),[ca,cb]=i.toJSON().candidates,fa=fact(ca!),fb=fact(cb!);assert.equal(JSON.stringify(run(g,e,i,[fa,fb])),JSON.stringify(run(g,e,i,[fb,fa])));});
test('M06S07-100 candidate order comes from dependency depth not caller order',()=>{const r=node('node:root'),m=node('node:mid'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([b,a,m,r],[edge('edge:rm','node:root','node:mid'),edge('edge:ma','node:mid','node:a'),edge('edge:rb','node:root','node:b')]),e=event(g),i=impact(g,e),v=run(g,e,i).toJSON();assert.deepEqual(v.decisions.map(d=>d.targetReference),['node:b','node:a']);});
test('M06S07-101 exact maximum decision budget accepted',()=>{const {g,e,i}=chain();assert.doesNotThrow(()=>run(g,e,i,undefined,{maxDecisions:1}));});
test('M06S07-102 insufficient decision budget fails closed',()=>{const r=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([r,a,b],[edge('edge:a','node:root','node:a'),edge('edge:b','node:root','node:b')]),e=event(g),i=impact(g,e);assert.throws(()=>run(g,e,i,undefined,{maxDecisions:1}));});
test('M06S07-103 evidence reference budget overflow rejected',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!,refs=Array.from({length:257},(_,n)=>'evidence:'+n);assert.throws(()=>fact(c,{evidenceReferences:refs}));});
test('M06S07-104 version binding budget overflow rejected',()=>{const {i}=chain(),c=i.toJSON().candidates[0]!,bindings=Array.from({length:65},(_,n)=>({reference:'v:'+n,type:LifecycleDependencyNodeType.RULE_VERSION,version:V1}));assert.throws(()=>fact(c,{versionBindings:bindings}));});
test('M06S07-105 safe output excludes raw storage contact and provider payloads',()=>{const {g,e,i}=chain(),s=JSON.stringify(run(g,e,i));for(const bad of ['s3://','rawBody','providerToken','phoneNumber','messageBody','@example.com'])assert(!s.includes(bad));});
test('M06S07-106 all authority and mutation flags remain negative',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.authorizationAuthority,false);assert.equal(v.credentialStateMutated,false);assert.equal(v.authorizationStateMutated,false);assert.equal(v.historicalDecisionMutated,false);assert.equal(v.complianceStateChanged,false);assert.equal(v.physicalDeletionAuthorized,false);});
test('M06S07-107 no notification provider or event side effect occurs',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.notificationScheduled,false);assert.equal(v.providerInvoked,false);assert.equal(v.eventsEmitted,0);});
test('M06S07-108 replay preserves one logical decision identity',()=>{const {g,e,i}=chain(),a=run(g,e,i).toJSON(),b=run(g,e,i).toJSON();assert.equal(a.decisions[0]!.dedupKey,b.decisions[0]!.dedupKey);});
test('M06S07-109 S06 dependency impact composes directly into S07',()=>{const {g,e,i}=chain(),v=run(g,e,i).toJSON();assert.equal(v.graphId,i.toJSON().graphId);assert.equal(v.eventId,i.toJSON().eventId);assert.equal(v.decisions[0]!.candidateDedupKey,i.toJSON().candidates[0]!.dedupKey);});
test('M06S07-110 controlled eligibility outcome text remains evidence not authority',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,v=run(g,e,i,[fact(c,{previousResult:'SATISFIED',newResult:'NOT_SATISFIED'})]).toJSON();assert.equal(v.decisions[0]!.newResult,'NOT_SATISFIED');assert.equal(v.authorizationAuthority,false);});
test('M06S07-111 historical decision is referenced and never overwritten',()=>{const {g,e,i}=chain(),c=i.toJSON().candidates[0]!,f=fact(c,{previousDecisionReference:'decision:historical'}),before=JSON.stringify(f);const v=run(g,e,i,[f]).toJSON();assert.equal(v.decisions[0]!.previousDecisionReference,'decision:historical');assert.equal(JSON.stringify(f),before);});
test('M06S07-112 changed event or graph version changes reevaluation identity',()=>{const a=chain(),g2=graph([a.root,a.target],[edge()],{id:'graph:reeval',version:V2}),e2=event(g2,{id:'change:2'}),i2=impact(g2,e2),d1=run(a.g,a.e,a.i).toJSON().decisions[0]!.decisionReference,d2=run(g2,e2,i2).toJSON().decisions[0]!.decisionReference;assert.notEqual(d1,d2);});
