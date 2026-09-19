import type { LifecycleNotificationPolicy, NotificationObservation, LifecycleNotificationProjection } from '../src/lifecycle/notification-policy.ts';
declare const p: LifecycleNotificationPolicy;
declare const o: NotificationObservation;
declare const x: LifecycleNotificationProjection;
// @ts-expect-error policy id readonly
p.id='changed';
// @ts-expect-error policy version readonly
p.version=p.version;
// @ts-expect-error policy basis readonly
p.basis=p.basis;
// @ts-expect-error stages readonly
p.stages.push(p.stages[0]!);
// @ts-expect-error stage id readonly
p.stages[0]!.id='changed';
// @ts-expect-error stage level readonly
p.stages[0]!.level=99;
// @ts-expect-error trigger readonly
p.stages[0]!.trigger={kind:'WINDOW_OPENS'};
// @ts-expect-error audience readonly
p.stages[0]!.audiencePurpose='changed';
// @ts-expect-error observation id readonly
o.id='changed';
// @ts-expect-error observation kind readonly
o.kind='FAILED';
// @ts-expect-error observation policy readonly
o.policy=p;
// @ts-expect-error observation stage readonly
o.stageId='changed';
// @ts-expect-error observation dedup readonly
o.dedupKey='changed';
// @ts-expect-error observation provenance readonly
o.provenanceReference='changed';
// @ts-expect-error projection outcome readonly
x.toJSON().outcome='DUE';
// @ts-expect-error projection reasons readonly
x.toJSON().reasonCodes.push('changed');
// @ts-expect-error projection flags readonly
x.toJSON().notificationScheduled=true;
// @ts-expect-error projection events readonly
x.toJSON().eventsEmitted=1;
