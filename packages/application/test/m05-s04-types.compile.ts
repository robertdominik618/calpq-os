import {
  ExtractionFieldReviewDecision,
  ExtractionProposalReviewHistory,
  ExtractionReviewActorRole,
  ExtractionReviewState,
} from '../src/extraction/index.ts';

declare const history: ExtractionProposalReviewHistory;
declare const decision: ExtractionFieldReviewDecision;

const state: typeof ExtractionReviewState[keyof typeof ExtractionReviewState] = history.currentState;
const role: typeof ExtractionReviewActorRole[keyof typeof ExtractionReviewActorRole] = history.revisions[0]!.actorRole;
const readonlyRevisions: readonly unknown[] = history.revisions;
const readonlyDecisions: readonly unknown[] = history.revisions[0]!.fieldDecisions;
const hasCorrectedValue: boolean = decision.hasCorrectedValue;

void state;
void role;
void readonlyRevisions;
void readonlyDecisions;
void hasCorrectedValue;

// @ts-expect-error revisions are readonly
history.revisions.push(history.revisions[0]!);
// @ts-expect-error field decisions are readonly
history.revisions[0]!.fieldDecisions.push(decision);
// @ts-expect-error controlled review state rejects invented authority state
const badState: typeof ExtractionReviewState[keyof typeof ExtractionReviewState] = 'VERIFIED';
void badState;
