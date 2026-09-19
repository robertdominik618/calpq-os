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
import type {
  DependencyImpactTraversalInput,
  LifecycleChangeEventInput,
  LifecycleDependencyEdgeInput,
  LifecycleDependencyGraphSnapshotInput,
  LifecycleDependencyNodeInput,
} from '../src/lifecycle/dependency-graph.ts';

const uuid=(n:number)=>'018f3f7e-bbbb-7abc-8def-'+String(n).padStart(12,'0');
const at=(s:string)=>UtcInstant.from(s),V1=VersionId.from('v1'),V2=VersionId.from('v2');
const T0=at('2025-01-01T00:00:00Z'),T1=at('2025-06-01T00:00:00Z'),T2=at('2025-08-01T00:00:00Z'),NOW=at('2025-12-20T12:00:00Z'),FUTURE=at('2026-02-01T00:00:00Z');
const human=(n:number)=>ActorReference.create(ActorId.from(uuid(n)),ActorKind.HUMAN_USER);
const OPERATOR=human(1),OTHER_ACTOR=human(2),GRANTOR=human(3);
const SUBJECT=SubjectReference.create(SubjectId.from(uuid(10)),SubjectKind.PERSON);
const OTHER_SUBJECT=SubjectReference.create(SubjectId.from(uuid(11)),SubjectKind.PERSON);
const SUBJECT_ORG=SubjectReference.create(SUBJECT.id,SubjectKind.ORGANIZATION);
const TENANT=TenantScopeReference.from('tenant:dependency'),OTHER_TENANT=TenantScopeReference.from('tenant:other');
const ORG=OrganizationScopeReference.from('org:dependency'),OTHER_ORG=OrganizationScopeReference.from('org:other');
const PURPOSE=PurposeReference.from('purpose:dependency'),OTHER_PURPOSE=PurposeReference.from('purpose:other');
const CORR=CorrelationId.from(uuid(20)),OTHER_CORR=CorrelationId.from(uuid(21)),ACCESS=AccessDecisionReference.from('access:dependency');
const VERIFIED=VerificationState.from('VERIFIED'),UNVERIFIED=VerificationState.from('UNVERIFIED'),REVIEW=VerificationState.from('REVIEW_REQUIRED');

function node(reference='node:root',type:LifecycleDependencyNodeType=LifecycleDependencyNodeType.RULE_VERSION,overrides:Partial<LifecycleDependencyNodeInput>={}){
  return LifecycleDependencyNode.create({
    reference,type,version:V1,tenant:TENANT,organization:ORG,subject:SUBJECT,jurisdictionReference:'CZ',
    provenanceReference:'prov:'+reference,knownAt:T0,...overrides,
  });
}
function edge(id='edge:1',sourceReference='node:root',targetReference='node:target',kind:LifecycleDependencyEdgeKind=LifecycleDependencyEdgeKind.DEPENDS_ON,impactMode:LifecycleDependencyImpactMode=LifecycleDependencyImpactMode.MANDATORY,overrides:Partial<LifecycleDependencyEdgeInput>={}){
  return LifecycleDependencyEdge.create({id,sourceReference,targetReference,kind,impactMode,provenanceReference:'prov:'+id,knownAt:T0,...overrides});
}
function graph(nodes:readonly LifecycleDependencyNode[]=[],edges:readonly LifecycleDependencyEdge[]=[],overrides:Partial<LifecycleDependencyGraphSnapshotInput>={}){
  const baseNodes=nodes.length?nodes:[node('node:root'),node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT)];
  const baseEdges=edges.length||nodes.length?edges:[edge()];
  return LifecycleDependencyGraphSnapshot.create({
    id:'graph:dependency',version:V1,tenant:TENANT,organization:ORG,subject:SUBJECT,
    nodes:baseNodes,edges:baseEdges,capturedAt:T1,asKnownAt:T1,provenanceReference:'prov:graph',...overrides,
  });
}
function context(overrides:Partial<Parameters<typeof ApplicationExecutionContext.create>[0]>={}){
  return ApplicationExecutionContext.create({
    operation:ApplicationOperationReference.from(DEPENDENCY_GRAPH_OPERATION),actor:OPERATOR,subject:SUBJECT,
    tenantScope:TENANT,organizationScope:ORG,purpose:PURPOSE,correlationId:CORR,requestedAt:NOW,
    contractVersion:V1,accessDecision:ACCESS,...overrides,
  });
}
function reader(actor=OPERATOR,overrides:Partial<Parameters<typeof TenantContext.create>[0]>={}){
  return TenantContext.create({tenant:TENANT,organization:ORG,actor,purpose:PURPOSE,correlationId:CORR,...overrides});
}
function access(overrides:Partial<Parameters<typeof TenantAccessDecision.create>[0]>={}){
  return TenantAccessDecision.create({
    reference:ACCESS,tenant:TENANT,purpose:PURPOSE,disposition:AccessDisposition.ALLOW,
    allowedFields:[DEPENDENCY_GRAPH_FIELD],decidedBy:GRANTOR,auditReference:AuditReference.from('audit:dependency'),...overrides,
  });
}
function event(g:LifecycleDependencyGraphSnapshot,overrides:Partial<LifecycleChangeEventInput>={}){
  return LifecycleChangeEvent.create({
    id:'change:1',type:LifecycleChangeType.REGULATORY_RULE_CHANGED,graph:g,rootNodeReference:'node:root',
    tenant:TENANT,organization:ORG,subject:SUBJECT,occurredAt:T2,observedAt:T2,effectiveFrom:null,
    verificationState:VERIFIED,jurisdictionReference:'CZ',provenanceReference:'prov:change',
    correlationReference:'corr:change',causationReference:null,...overrides,
  });
}
function input(g:LifecycleDependencyGraphSnapshot,e=event(g),overrides:Partial<DependencyImpactTraversalInput>={}):DependencyImpactTraversalInput{
  return {
    context:context(),authorizedContext:reader(),boundary:TenantBoundary.create([TENANT]),accessDecision:access(),
    graph:g,event:e,evaluatedAt:NOW,asKnownAt:NOW,
    allowedTargetTypes:[LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT],maxDepth:16,maxCandidates:64,maxPaths:256,...overrides,
  };
}
const run=(g:LifecycleDependencyGraphSnapshot,e=event(g),overrides:Partial<DependencyImpactTraversalInput>={})=>LifecycleDependencyImpactTraversal.evaluate(input(g,e,overrides));
function chain(mode:LifecycleDependencyImpactMode=LifecycleDependencyImpactMode.MANDATORY){
  const root=node('node:root'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT);
  const g=graph([root,target],[edge('edge:1',root.reference,target.reference,LifecycleDependencyEdgeKind.DEPENDS_ON,mode)]);
  return {root,target,g};
}

test('M06S06-001 immutable node identity version provenance',()=>{const n=node();assert.equal(n.reference,'node:root');assert.equal(n.version,V1);assert.equal(n.provenanceReference,'prov:node:root');assert(Object.isFrozen(n));});
test('M06S06-002 empty node reference rejected',()=>{assert.throws(()=>node(''));});
test('M06S06-003 unknown node type rejected',()=>{assert.throws(()=>node('node:x','UNKNOWN' as never));});
test('M06S06-004 versioned node requires version',()=>{assert.throws(()=>node('node:x',LifecycleDependencyNodeType.RULE_VERSION,{version:null}));});
test('M06S06-005 node known-at explicit',()=>{assert.equal(node().knownAt,T0);assert.throws(()=>node('node:x',LifecycleDependencyNodeType.RULE_VERSION,{knownAt:{} as never}));});
test('M06S06-006 node provenance mandatory',()=>{assert.throws(()=>node('node:x',LifecycleDependencyNodeType.RULE_VERSION,{provenanceReference:''}));});
test('M06S06-007 node scope copied frozen',()=>{const n=node();assert.equal(n.tenant,TENANT);assert.equal(n.organization,ORG);assert.equal(n.subject,SUBJECT);assert(Object.isFrozen(n));});
test('M06S06-008 node serialization safe metadata',()=>{const v=JSON.stringify(node());for(const bad of ['s3://','rawBody','providerToken'])assert(!v.includes(bad));});
test('M06S06-009 separate version preserves prior',()=>{const a=node(),before=JSON.stringify(a),b=node('node:v2',LifecycleDependencyNodeType.RULE_VERSION,{version:V2});assert.notEqual(a,b);assert.equal(JSON.stringify(a),before);});
test('M06S06-010 duplicate node reference rejected by graph',()=>{const a=node(),b=node();assert.throws(()=>graph([a,b],[]));});
test('M06S06-011 immutable edge exact metadata',()=>{const e=edge();assert.equal(e.sourceReference,'node:root');assert.equal(e.targetReference,'node:target');assert.equal(e.impactMode,LifecycleDependencyImpactMode.MANDATORY);assert(Object.isFrozen(e));});
test('M06S06-012 unknown edge kind rejected',()=>{assert.throws(()=>edge('edge:x','node:root','node:target','UNKNOWN' as never));});
test('M06S06-013 unknown impact mode rejected',()=>{assert.throws(()=>edge('edge:x','node:root','node:target',LifecycleDependencyEdgeKind.DEPENDS_ON,'UNKNOWN' as never));});
test('M06S06-014 self edge rejected',()=>{assert.throws(()=>edge('edge:self','node:root','node:root'));});
test('M06S06-015 foreign edge endpoint rejected',()=>{assert.throws(()=>graph([node('node:root')],[edge('edge:x','node:root','node:missing')]));});
test('M06S06-016 duplicate edge identity rejected',()=>{const a=edge('edge:x'),b=edge('edge:x');assert.throws(()=>graph([node('node:root'),node('node:target')],[a,b]));});
test('M06S06-017 edge direction preserved',()=>{const e=edge();assert.equal(e.sourceReference,'node:root');assert.equal(e.targetReference,'node:target');});
test('M06S06-018 supersedes remains lineage not propagation',()=>{const root=node('node:root'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,target],[edge('edge:s',root.reference,target.reference,LifecycleDependencyEdgeKind.SUPERSEDES)]),v=run(g).toJSON();assert.equal(v.candidates.length,0);assert(v.reasonCodes.includes('SUPERSEDES_LINEAGE_NOT_PROPAGATED'));});
test('M06S06-019 edge known-at chronology validated',()=>{const root=node('node:root'),target=node('node:target');assert.throws(()=>graph([root,target],[edge('edge:x','node:root','node:target',LifecycleDependencyEdgeKind.DEPENDS_ON,LifecycleDependencyImpactMode.MANDATORY,{knownAt:NOW})]));});
test('M06S06-020 edge metadata frozen',()=>{assert(Object.isFrozen(edge()));});
test('M06S06-021 graph identity version governed',()=>{const {g}=chain();assert.equal(g.id,'graph:dependency');assert.equal(g.version,V1);assert(Object.isFrozen(g));});
test('M06S06-022 empty graph rejected',()=>{assert.throws(()=>LifecycleDependencyGraphSnapshot.create({id:'graph:x',version:V1,tenant:TENANT,organization:ORG,subject:SUBJECT,nodes:[],edges:[],capturedAt:T1,asKnownAt:T1,provenanceReference:'prov:x'}));});
test('M06S06-023 node collection bounded dense',()=>{const sparse=new Array<LifecycleDependencyNode>(2);sparse[0]=node();assert.throws(()=>graph(sparse,[]));});
test('M06S06-024 edge collection bounded dense',()=>{const sparse=new Array<LifecycleDependencyEdge>(2);sparse[0]=edge();assert.throws(()=>graph([node('node:root'),node('node:target')],sparse));});
test('M06S06-025 duplicate node rejected',()=>{const n=node('node:x');assert.throws(()=>graph([n,n],[]));});
test('M06S06-026 missing endpoint rejected',()=>{assert.throws(()=>graph([node('node:root')],[edge()]));});
test('M06S06-027 graph tenant explicit',()=>{assert.equal(chain().g.tenant,TENANT);});
test('M06S06-028 graph organization explicit',()=>{assert.equal(chain().g.organization,ORG);});
test('M06S06-029 graph subject explicit',()=>{assert.equal(chain().g.subject,SUBJECT);});
test('M06S06-030 cross-scope node rejected',()=>{const bad=node('node:bad',LifecycleDependencyNodeType.RULE_VERSION,{tenant:OTHER_TENANT});assert.throws(()=>graph([bad],[]));});
test('M06S06-031 disconnected components preserved',()=>{const a=node('node:root'),b=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),c=node('node:disconnected',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([a,b,c],[edge()]),v=g.toJSON();assert.equal(v.nodes.length,3);assert.equal(run(g).toJSON().candidates.length,1);});
test('M06S06-032 node order canonical',()=>{const a=node('node:a'),b=node('node:b');const x=graph([a,b],[],{id:'graph:order'}),y=graph([b,a],[],{id:'graph:order'});assert.equal(JSON.stringify(x),JSON.stringify(y));});
test('M06S06-033 edge order canonical',()=>{const r=node('node:root'),a=node('node:a'),b=node('node:b'),e1=edge('edge:a','node:root','node:a'),e2=edge('edge:b','node:root','node:b');const x=graph([r,a,b],[e1,e2],{id:'graph:edges'}),y=graph([r,a,b],[e2,e1],{id:'graph:edges'});assert.equal(JSON.stringify(x),JSON.stringify(y));});
test('M06S06-034 graph serialization deeply readonly',()=>{const v=chain().g.toJSON();assert(Object.isFrozen(v));assert(Object.isFrozen(v.nodes));assert(Object.isFrozen(v.edges));assert.throws(()=>(v.nodes as unknown[]).push({}));});
test('M06S06-035 graph serialization excludes unsafe payload',()=>{const v=JSON.stringify(chain().g);for(const bad of ['s3://','PRIVATE','providerToken','messageBody'])assert(!v.includes(bad));});
test('M06S06-036 graph chronology validated',()=>{const {root,target}=chain();assert.throws(()=>graph([root,target],[edge()],{capturedAt:NOW,asKnownAt:T1}));});
test('M06S06-037 equivalent graph reorder byte stable',()=>{const r=node('node:root'),a=node('node:a'),b=node('node:b'),e1=edge('edge:a','node:root','node:a'),e2=edge('edge:b','node:root','node:b');assert.equal(JSON.stringify(graph([r,a,b],[e1,e2],{id:'graph:stable'})),JSON.stringify(graph([b,r,a],[e2,e1],{id:'graph:stable'})));});
test('M06S06-038 maximum bounded graph accepted',()=>{const nodes=Array.from({length:256},(_,i)=>node('node:'+i));assert.doesNotThrow(()=>graph(nodes,[],{id:'graph:max'}));});
test('M06S06-039 node budget overflow rejected',()=>{const nodes=Array.from({length:257},(_,i)=>node('node:'+i));assert.throws(()=>graph(nodes,[],{id:'graph:overflow'}));});
test('M06S06-040 edge budget overflow rejected',()=>{const nodes=[node('node:root'),node('node:target')],edges=Array.from({length:2049},(_,i)=>edge('edge:'+i));assert.throws(()=>graph(nodes,edges,{id:'graph:edge-overflow'}));});
test('M06S06-041 change event exact identity controlled type',()=>{const {g}=chain(),e=event(g);assert.equal(e.id,'change:1');assert.equal(e.type,LifecycleChangeType.REGULATORY_RULE_CHANGED);assert(Object.isFrozen(e));});
test('M06S06-042 unknown change type rejected',()=>{const {g}=chain();assert.throws(()=>event(g,{type:'MAGIC' as never}));});
test('M06S06-043 change root must exist',()=>{const {g}=chain();assert.throws(()=>event(g,{rootNodeReference:'node:missing'}));});
test('M06S06-044 change chronology validated',()=>{const {g}=chain();assert.throws(()=>event(g,{occurredAt:T2,observedAt:T1}));});
test('M06S06-045 future observed rejected by horizon',()=>{const {g}=chain(),e=event(g,{occurredAt:FUTURE,observedAt:FUTURE});assert.throws(()=>run(g,e));});
test('M06S06-046 future effective represented without state change',()=>{const {g}=chain(),v=run(g,event(g,{effectiveFrom:FUTURE})).toJSON();assert.equal(v.futureEffective,true);assert.equal(v.complianceStateChanged,false);});
test('M06S06-047 clock boundary remains derived trigger',()=>{const {g}=chain(),e=event(g,{type:LifecycleChangeType.CLOCK_BOUNDARY_REACHED});assert.equal(e.toJSON().type,'CLOCK_BOUNDARY_REACHED');assert.equal(run(g,e).toJSON().authorizationAuthority,false);});
test('M06S06-048 verified state preserved',()=>{const {g}=chain();assert.equal(event(g).verificationState.toString(),'VERIFIED');});
test('M06S06-049 unverified state preserved',()=>{const {g}=chain();assert.equal(event(g,{verificationState:UNVERIFIED}).verificationState.toString(),'UNVERIFIED');});
test('M06S06-050 review-required state preserved',()=>{const {g}=chain();assert.equal(event(g,{verificationState:REVIEW}).verificationState.toString(),'REVIEW_REQUIRED');});
test('M06S06-051 event provenance mandatory',()=>{const {g}=chain();assert.throws(()=>event(g,{provenanceReference:''}));});
test('M06S06-052 event jurisdiction mismatch fails closed',()=>{const {g}=chain();assert.throws(()=>event(g,{jurisdictionReference:'US'}));});
test('M06S06-053 event correlation causation explicit',()=>{const {g}=chain(),v=event(g,{correlationReference:'corr:x',causationReference:'cause:x'}).toJSON();assert.equal(v.correlationReference,'corr:x');assert.equal(v.causationReference,'cause:x');});
test('M06S06-054 event serialization safe',()=>{const {g}=chain(),v=JSON.stringify(event(g));for(const bad of ['s3://','rawBody','providerToken'])assert(!v.includes(bad));});
test('M06S06-055 scoped invocation required',()=>{const {g}=chain(),e=event(g);assert.throws(()=>LifecycleDependencyImpactTraversal.evaluate({...input(g,e),context:{} as never}),TenantAccessDeniedError);});
test('M06S06-056 denial before graph exposure',()=>{const {g}=chain(),e=event(g);assert.throws(()=>LifecycleDependencyImpactTraversal.evaluate({...input(g,e),graph:{} as never,accessDecision:access({disposition:AccessDisposition.DENY})}),TenantAccessDeniedError);});
test('M06S06-057 cross tenant denied',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({tenantScope:OTHER_TENANT})}),TenantAccessDeniedError);});
test('M06S06-058 cross organization denied',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({organizationScope:OTHER_ORG})}),TenantAccessDeniedError);});
test('M06S06-059 subject identity mismatch denied',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({subject:OTHER_SUBJECT})}),TenantAccessDeniedError);});
test('M06S06-060 subject kind mismatch denied',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({subject:SUBJECT_ORG})}),TenantAccessDeniedError);});
test('M06S06-061 actor identity mismatch denied',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({actor:OTHER_ACTOR})}),TenantAccessDeniedError);});
test('M06S06-062 actor kind mismatch denied',()=>{const {g}=chain(),e=event(g),a=ActorReference.create(OPERATOR.id,ActorKind.SYSTEM_PROCESS);assert.throws(()=>run(g,e,{context:context({actor:a})}),TenantAccessDeniedError);});
test('M06S06-063 purpose mismatch denied',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({purpose:OTHER_PURPOSE})}),TenantAccessDeniedError);});
test('M06S06-064 correlation mismatch denied',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({correlationId:OTHER_CORR})}),TenantAccessDeniedError);});
test('M06S06-065 operation and field authorization required',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({operation:ApplicationOperationReference.from('wrong.operation')})}),TenantAccessDeniedError);assert.throws(()=>run(g,e,{accessDecision:access({allowedFields:['credential:other']})}),TenantAccessDeniedError);});
test('M06S06-066 access reference mismatch denied',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{context:context({accessDecision:AccessDecisionReference.from('access:other')})}),TenantAccessDeniedError);});
test('M06S06-067 evaluation instant must match invocation',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{evaluatedAt:T2}));});
test('M06S06-068 allowed target types bounded controlled',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{allowedTargetTypes:[]}));assert.throws(()=>run(g,e,{allowedTargetTypes:['UNKNOWN' as never]}));});
test('M06S06-069 depth budget explicit bounded',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{maxDepth:0}));assert.throws(()=>run(g,e,{maxDepth:65}));});
test('M06S06-070 candidate budget explicit bounded',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{maxCandidates:0}));assert.throws(()=>run(g,e,{maxCandidates:513}));});
test('M06S06-071 path budget explicit bounded',()=>{const {g}=chain(),e=event(g);assert.throws(()=>run(g,e,{maxPaths:0}));assert.throws(()=>run(g,e,{maxPaths:4097}));});
test('M06S06-072 downstream traversal only',()=>{const {g}=chain(),v=run(g).toJSON();assert.equal(v.candidates.length,1);assert.equal(v.candidates[0]!.targetReference,'node:target');});
test('M06S06-073 incoming predecessor not traversed',()=>{const pred=node('node:pred',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),root=node('node:root'),g=graph([pred,root],[edge('edge:incoming','node:pred','node:root')],{id:'graph:incoming'}),v=run(g,event(g),{allowedTargetTypes:[LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT]}).toJSON();assert.equal(v.candidates.length,0);});
test('M06S06-074 disconnected target excluded',()=>{const root=node('node:root'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,target],[],{id:'graph:none'});assert.equal(run(g).toJSON().candidates.length,0);});
test('M06S06-075 intermediate can connect allowed target',()=>{const root=node('node:root'),mid=node('node:mid'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,mid,target],[edge('edge:1','node:root','node:mid'),edge('edge:2','node:mid','node:target')]);assert.equal(run(g).toJSON().candidates[0]!.targetReference,'node:target');});
test('M06S06-076 unallowed target type not emitted',()=>{const {g}=chain();assert.equal(run(g,event(g),{allowedTargetTypes:[LifecycleDependencyNodeType.AUTHORIZATION_GRANT]}).toJSON().candidates.length,0);});
test('M06S06-077 exact path explains inclusion',()=>{const {g}=chain(),p=run(g).toJSON().candidates[0]!.paths[0]!;assert.deepEqual(p.nodes,['node:root','node:target']);assert.deepEqual(p.edges,['edge:1']);});
test('M06S06-078 multiple paths one candidate',()=>{const root=node('node:root'),a=node('node:a'),b=node('node:b'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,a,b,target],[edge('edge:ra','node:root','node:a'),edge('edge:rb','node:root','node:b'),edge('edge:at','node:a','node:target'),edge('edge:bt','node:b','node:target')]);const v=run(g).toJSON();assert.equal(v.candidates.length,1);assert.equal(v.candidates[0]!.paths.length,2);});
test('M06S06-079 candidate dedup stable',()=>{const {g}=chain(),e=event(g);assert.equal(run(g,e).toJSON().candidates[0]!.dedupKey,run(g,e).toJSON().candidates[0]!.dedupKey);});
test('M06S06-080 graph version changes candidate identity',()=>{const {root,target}=chain(),g1=graph([root,target],[edge()],{id:'graph:v',version:V1}),g2=graph([root,target],[edge()],{id:'graph:v',version:V2});assert.notEqual(run(g1,event(g1)).toJSON().candidates[0]!.dedupKey,run(g2,event(g2)).toJSON().candidates[0]!.dedupKey);});
test('M06S06-081 event identity changes candidate identity',()=>{const {g}=chain(),a=event(g,{id:'change:a'}),b=event(g,{id:'change:b'});assert.notEqual(run(g,a).toJSON().candidates[0]!.dedupKey,run(g,b).toJSON().candidates[0]!.dedupKey);});
test('M06S06-082 target identity changes candidate identity',()=>{const root=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),ga=graph([root,a],[edge('edge:a','node:root','node:a')],{id:'graph:a'}),gb=graph([root,b],[edge('edge:b','node:root','node:b')],{id:'graph:b'});assert.notEqual(run(ga,event(ga)).toJSON().candidates[0]!.dedupKey,run(gb,event(gb)).toJSON().candidates[0]!.dedupKey);});
test('M06S06-083 mandatory edge yields mandatory candidate',()=>{const {g}=chain(LifecycleDependencyImpactMode.MANDATORY);assert.equal(run(g).toJSON().candidates[0]!.impactMode,'MANDATORY');});
test('M06S06-084 advisory edge yields advisory candidate',()=>{const {g}=chain(LifecycleDependencyImpactMode.ADVISORY);assert.equal(run(g).toJSON().candidates[0]!.impactMode,'ADVISORY');});
test('M06S06-085 review edge yields review candidate',()=>{const {g}=chain(LifecycleDependencyImpactMode.REVIEW_ONLY),v=run(g).toJSON();assert.equal(v.candidates[0]!.impactMode,'REVIEW_ONLY');assert.equal(v.outcome,'REVIEW_REQUIRED');});
test('M06S06-086 unverified event forces review',()=>{const {g}=chain(),v=run(g,event(g,{verificationState:UNVERIFIED})).toJSON();assert.equal(v.candidates[0]!.impactMode,'REVIEW_ONLY');assert.equal(v.outcome,'REVIEW_REQUIRED');});
test('M06S06-087 review-required event forces review',()=>{const {g}=chain(),v=run(g,event(g,{verificationState:REVIEW})).toJSON();assert.equal(v.candidates[0]!.impactMode,'REVIEW_ONLY');});
test('M06S06-088 mixed mode resolves safest review',()=>{const root=node('node:root'),mid=node('node:mid'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,mid,target],[edge('edge:1','node:root','node:mid',LifecycleDependencyEdgeKind.DEPENDS_ON,LifecycleDependencyImpactMode.MANDATORY),edge('edge:2','node:mid','node:target',LifecycleDependencyEdgeKind.DEPENDS_ON,LifecycleDependencyImpactMode.REVIEW_ONLY)]);assert.equal(run(g).toJSON().candidates[0]!.impactMode,'REVIEW_ONLY');});
test('M06S06-089 reachability requires configured edge',()=>{const root=node('node:root'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,target],[],{id:'graph:unlinked'});assert.equal(run(g).toJSON().outcome,'NO_IMPACT');});
test('M06S06-090 supersedes does not invalidate target',()=>{const root=node('node:root'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,target],[edge('edge:s','node:root','node:target',LifecycleDependencyEdgeKind.SUPERSEDES)]);assert.equal(run(g).toJSON().candidates.length,0);});
test('M06S06-091 cycle re-entry detected',()=>{const root=node('node:root'),a=node('node:a'),g=graph([root,a],[edge('edge:ra','node:root','node:a'),edge('edge:ar','node:a','node:root')]);assert(run(g,event(g),{allowedTargetTypes:[LifecycleDependencyNodeType.RULE_VERSION]}).toJSON().cycles.length>0);});
test('M06S06-092 cycle branch terminates',()=>{const root=node('node:root'),a=node('node:a'),g=graph([root,a],[edge('edge:ra','node:root','node:a'),edge('edge:ar','node:a','node:root')]),v=run(g,event(g),{allowedTargetTypes:[LifecycleDependencyNodeType.RULE_VERSION]}).toJSON();assert.equal(v.complete,false);assert.equal(v.outcome,'REVIEW_REQUIRED');});
test('M06S06-093 cycle metadata deterministic',()=>{const root=node('node:root'),a=node('node:a'),e1=edge('edge:ra','node:root','node:a'),e2=edge('edge:ar','node:a','node:root'),g1=graph([root,a],[e1,e2],{id:'graph:cycle'}),g2=graph([a,root],[e2,e1],{id:'graph:cycle'});assert.equal(JSON.stringify(run(g1,event(g1),{allowedTargetTypes:[LifecycleDependencyNodeType.RULE_VERSION]}).toJSON().cycles),JSON.stringify(run(g2,event(g2),{allowedTargetTypes:[LifecycleDependencyNodeType.RULE_VERSION]}).toJSON().cycles));});
test('M06S06-094 cycle-bound candidate review required',()=>{const root=node('node:root'),a=node('node:a'),g=graph([root,a],[edge('edge:ra','node:root','node:a'),edge('edge:ar','node:a','node:root')]),v=run(g,event(g),{allowedTargetTypes:[LifecycleDependencyNodeType.RULE_VERSION]}).toJSON(),c=v.candidates.find(x=>x.targetReference==='node:root');assert.equal(c?.impactMode,'REVIEW_ONLY');assert.equal(c?.reviewRequired,true);});
test('M06S06-095 acyclic branch continues beside cycle',()=>{const root=node('node:root'),a=node('node:a'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,a,target],[edge('edge:ra','node:root','node:a'),edge('edge:ar','node:a','node:root'),edge('edge:rt','node:root','node:target')]),v=run(g).toJSON();assert(v.candidates.some(x=>x.targetReference==='node:target'));assert(v.cycles.length>0);});
test('M06S06-096 depth budget exhaustion review',()=>{const root=node('node:root'),mid=node('node:mid'),target=node('node:target',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,mid,target],[edge('edge:1','node:root','node:mid'),edge('edge:2','node:mid','node:target')]),v=run(g,event(g),{maxDepth:1}).toJSON();assert.equal(v.complete,false);assert(v.reasonCodes.includes('DEPTH_BUDGET_EXCEEDED'));});
test('M06S06-097 candidate budget fails closed',()=>{const root=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,a,b],[edge('edge:a','node:root','node:a'),edge('edge:b','node:root','node:b')]),v=run(g,event(g),{maxCandidates:1}).toJSON();assert.equal(v.complete,false);assert(v.reasonCodes.includes('CANDIDATE_BUDGET_EXCEEDED'));});
test('M06S06-098 path budget fails closed',()=>{const root=node('node:root'),a=node('node:a',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),b=node('node:b',LifecycleDependencyNodeType.ELIGIBILITY_ASSESSMENT),g=graph([root,a,b],[edge('edge:a','node:root','node:a'),edge('edge:b','node:root','node:b')]),v=run(g,event(g),{maxPaths:1}).toJSON();assert.equal(v.complete,false);assert(v.reasonCodes.includes('PATH_BUDGET_EXCEEDED'));});
test('M06S06-099 future effective registers future impact',()=>{const {g}=chain(),v=run(g,event(g,{effectiveFrom:FUTURE})).toJSON();assert.equal(v.futureEffective,true);assert(v.reasonCodes.includes('FUTURE_EFFECTIVE_CHANGE'));});
test('M06S06-100 future event does not change compliance',()=>{const {g}=chain(),v=run(g,event(g,{effectiveFrom:FUTURE})).toJSON();assert.equal(v.complianceStateChanged,false);assert.equal(v.credentialStateMutated,false);});
test('M06S06-101 historical inputs unchanged',()=>{const {g}=chain(),e=event(g),before=JSON.stringify([g,e]);run(g,e);assert.equal(JSON.stringify([g,e]),before);});
test('M06S06-102 negative authority flags preserved',()=>{const {g}=chain(),v=run(g).toJSON();assert.equal(v.authorizationAuthority,false);assert.equal(v.credentialStateMutated,false);assert.equal(v.historicalDecisionMutated,false);assert.equal(v.reevaluationPerformed,false);assert.equal(v.complianceStateChanged,false);assert.equal(v.notificationScheduled,false);assert.equal(v.providerInvoked,false);assert.equal(v.eventsEmitted,0);assert.equal(v.physicalDeletionAuthorized,false);});
test('M06S06-103 output deeply readonly metadata only',()=>{const {g}=chain(),v=run(g).toJSON();assert(Object.isFrozen(v));assert(Object.isFrozen(v.candidates));assert(Object.isFrozen(v.candidates[0]!.paths));assert.throws(()=>(v.candidates as unknown[]).push({}));const s=JSON.stringify(v);for(const bad of ['s3://','rawBody','providerToken'])assert(!s.includes(bad));});
test('M06S06-104 identical replay byte stable no effects',()=>{const {g}=chain(),e=event(g),a=run(g,e),b=run(g,e);assert.equal(JSON.stringify(a),JSON.stringify(b));assert.equal(a.toJSON().eventsEmitted,0);});
