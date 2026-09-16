import {
  GapEvaluationId,
  GapItemState,
  GapNavigatorEvaluation,
  GapPathComparison,
  type GapItemStateCode,
} from '../src/index.ts';

const id = GapEvaluationId.from('018f22e2-79b0-7cc3-98c4-dc0c0c0b7901');
void id;

const state: GapItemStateCode = GapItemState.INFORMATION_MISSING;
void state;

declare const evaluation: GapNavigatorEvaluation;
declare const comparison: GapPathComparison;

// @ts-expect-error derived gap items are immutable
evaluation.items.push(evaluation.items[0]);

// @ts-expect-error per-item reasons are immutable
evaluation.items[0].reasonCodes.push('GAP.MUTATE');

// @ts-expect-error advisory comparison cannot select a winner
comparison.selectedPathId = 'path';

// @ts-expect-error uncontrolled gap outcome is not allowed
const invalidState: GapItemStateCode = 'AUTO_APPROVED';
void invalidState;
