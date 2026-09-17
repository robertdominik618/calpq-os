import type { ApplicationExecutionContext } from '../src/index.ts';
import type { HumanReviewCase, HumanReviewCommand, HumanReviewDecisionRecord, HumanReviewHistory, HumanReviewerMandate, ManualClaimObservation } from '../src/human-review/index.ts';

declare const reviewCase: HumanReviewCase;
declare const command: HumanReviewCommand;
declare const history: HumanReviewHistory;
declare const mandate: HumanReviewerMandate;
declare const observation: ManualClaimObservation;
declare const record: HumanReviewDecisionRecord;
declare const context: ApplicationExecutionContext;

const next: HumanReviewHistory = history.apply({ command, mandate, context, expectedRevision: 0 });
void next;

// @ts-expect-error case claims cannot be mutated
reviewCase.claims.push('outside:claim');
// @ts-expect-error case registry binding is immutable
reviewCase.registry = reviewCase.registry;
// @ts-expect-error claim scope is immutable
command.claims = [];
// @ts-expect-error command observations are readonly
command.observations.push(observation);
// @ts-expect-error history revision cannot be assigned
history.revision = 12;
// @ts-expect-error history records cannot be appended outside apply
history.records.push(record);
// @ts-expect-error decision results are readonly
record.claimResults.push(record.claimResults[0]!);
// @ts-expect-error mandate permissions cannot be mutated
mandate.permissions.push('REVIEW');
// @ts-expect-error reviewer assignment cannot be replaced
mandate.reviewer = mandate.grantedBy;
// @ts-expect-error observation source provenance is immutable
observation.sourceSnapshotReference = 'changed';
// @ts-expect-error expected revision is a number, not text
history.apply({ command, mandate, context, expectedRevision: '0' });
// @ts-expect-error incomplete structural object is not a governed command
history.apply({ command: { idempotencyKey: 'fake' }, mandate, context, expectedRevision: 0 });
