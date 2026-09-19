import type { LifecycleChangeEvent, LifecycleDependencyEdge, LifecycleDependencyGraphSnapshot, LifecycleDependencyImpactTraversal, LifecycleDependencyNode } from '../src/lifecycle/dependency-graph.ts';
declare const n: LifecycleDependencyNode;
declare const e: LifecycleDependencyEdge;
declare const g: LifecycleDependencyGraphSnapshot;
declare const c: LifecycleChangeEvent;
declare const x: LifecycleDependencyImpactTraversal;
// @ts-expect-error node reference readonly
n.reference='changed';
// @ts-expect-error node type readonly
n.type=n.type;
// @ts-expect-error node version readonly
n.version=null;
// @ts-expect-error graph id readonly
g.id='changed';
// @ts-expect-error graph nodes readonly
g.nodes.push(n);
// @ts-expect-error graph edges readonly
g.edges.push(e);
// @ts-expect-error edge id readonly
e.id='changed';
// @ts-expect-error edge kind readonly
e.kind=e.kind;
// @ts-expect-error edge source readonly
e.sourceReference='changed';
// @ts-expect-error edge impact readonly
e.impactMode=e.impactMode;
// @ts-expect-error change id readonly
c.id='changed';
// @ts-expect-error change type readonly
c.type=c.type;
// @ts-expect-error change graph readonly
c.graph=g;
// @ts-expect-error change verification readonly
c.verificationState=c.verificationState;
// @ts-expect-error traversal outcome readonly
x.toJSON().outcome='NO_IMPACT';
// @ts-expect-error candidates readonly
x.toJSON().candidates.push(x.toJSON().candidates[0]!);
// @ts-expect-error candidate impact readonly
x.toJSON().candidates[0]!.impactMode='ADVISORY';
// @ts-expect-error path nodes readonly
x.toJSON().candidates[0]!.paths[0]!.nodes.push('changed');
// @ts-expect-error authority flag readonly
x.toJSON().authorizationAuthority=true;
// @ts-expect-error events count readonly
x.toJSON().eventsEmitted=1;
