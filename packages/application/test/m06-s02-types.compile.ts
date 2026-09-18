import type { ExpiryRenewalPolicy, ExpiryRenewalEvaluation, ExpiryRenewalEvaluationInput, LifecycleCalendarContext } from '../src/lifecycle/expiry-renewal-policy.ts';
import { shiftLifecycleDate } from '../src/lifecycle/expiry-renewal-policy.ts';
import type { DateOnly } from '../../core/src/index.ts';
declare const policy: ExpiryRenewalPolicy;
declare const evaluation: ExpiryRenewalEvaluation;
declare const input: ExpiryRenewalEvaluationInput;
declare const calendar: LifecycleCalendarContext;
declare const date: DateOnly;
// @ts-expect-error policy identity is readonly
policy.id='changed';
// @ts-expect-error policy conditions readonly
policy.conditions.push('changed');
// @ts-expect-error source is immutable
policy.source=policy.source;
// @ts-expect-error expiry rule immutable
policy.expiry.kind='NO_FIXED_EXPIRY';
// @ts-expect-error calendar cannot be reassigned
calendar.evaluatedOn=date;
// @ts-expect-error timezone offset readonly
calendar.utcOffsetMinutes=0;
// @ts-expect-error candidate input collection readonly
input.policies.push(policy);
// @ts-expect-error output expiry immutable
evaluation.toJSON().expiryOn='2099-01-01';
// @ts-expect-error no output authority escalation
evaluation.toJSON().authorizationAuthority=true;
// @ts-expect-error trace is readonly
evaluation.toJSON().trace.push({operation:'fake',inputs:[],output:null});
// @ts-expect-error reason codes readonly
evaluation.toJSON().reasonCodes.push('fake');
// @ts-expect-error metadata policy version readonly
evaluation.toJSON().policy!.version='changed';
// @ts-expect-error unsupported calendar unit
shiftLifecycleDate(date,1,'WEEKS','CLAMP');
// @ts-expect-error no implicit month-end convention
shiftLifecycleDate(date,1,'MONTHS');
