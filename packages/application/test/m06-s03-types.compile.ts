import type { RecurringObligationRule, RecurringObligation, ObligationCompletionRecord, RecurringObligationProjection, RecurringObligationProjectionInput } from '../src/lifecycle/recurring-obligation.ts';
declare const rule:RecurringObligationRule;
declare const obligation:RecurringObligation;
declare const record:ObligationCompletionRecord;
declare const projection:RecurringObligationProjection;
declare const input:RecurringObligationProjectionInput;
// @ts-expect-error immutable rule version
rule.version=rule.version;
// @ts-expect-error immutable recurrence interval
rule.interval.amount=4;
// @ts-expect-error controlled cadence
rule.cadence='AUTO';
// @ts-expect-error readonly requirements
rule.requiredEvidenceClaims.push('other');
// @ts-expect-error readonly conditions
rule.conditions.push('changed');
// @ts-expect-error immutable obligation basis
obligation.basis=obligation.basis;
// @ts-expect-error immutable resolved anchor
obligation.anchorOn=null;
// @ts-expect-error immutable obligation version
obligation.version=obligation.version;
// @ts-expect-error immutable completion disposition
record.disposition='ACCEPTED';
// @ts-expect-error immutable evidence snapshot association
record.evidenceSnapshot=record.evidenceSnapshot;
// @ts-expect-error readonly claims
record.coveredClaims.push('other');
// @ts-expect-error immutable result
projection.toJSON().outcome='EVALUATED';
// @ts-expect-error readonly occurrence array
projection.toJSON().occurrences.push(projection.toJSON().occurrences[0]!);
// @ts-expect-error nested occurrence date immutable
projection.toJSON().occurrences[0]!.dueOn='2026-01-01';
// @ts-expect-error readonly nested evidence
projection.toJSON().occurrences[0]!.records[0]!.evidence.push(projection.toJSON().occurrences[0]!.records[0]!.evidence[0]!);
// @ts-expect-error input budget is numeric
const bad:RecurringObligationProjectionInput={...input,maxOccurrences:'100'};
void bad;
