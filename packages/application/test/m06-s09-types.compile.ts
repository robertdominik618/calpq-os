import {
  LifecycleHistoricalDecisionAnchor,
  LifecycleHistoricalReplay,
  LifecycleHistoricalReplayComparisonOutcome,
  LifecycleHistoricalReplayOutcome,
  LifecycleReplayAvailability,
  LifecycleReplayDivergenceReason,
  LifecycleReplayMode,
  LifecycleReplaySnapshot,
} from '../src/lifecycle/historical-replay.ts';
import type {
  LifecycleHistoricalReplayComparisonView,
  LifecycleHistoricalReplayResultView,
  LifecycleHistoricalReplayView,
} from '../src/lifecycle/historical-replay.ts';

declare const anchor: LifecycleHistoricalDecisionAnchor;
declare const snapshot: LifecycleReplaySnapshot;
declare const reason: LifecycleReplayDivergenceReason;
declare const replay: LifecycleHistoricalReplay;
declare const view: LifecycleHistoricalReplayView;
declare const result: LifecycleHistoricalReplayResultView;
declare const comparison: LifecycleHistoricalReplayComparisonView;

// @ts-expect-error readonly anchor reference
anchor.reference = 'changed';
// @ts-expect-error readonly original decision
anchor.originalDecisionReference = 'changed';
// @ts-expect-error readonly original outcome
anchor.originalOutcome = 'changed';
// @ts-expect-error readonly rule versions
anchor.ruleVersionReferences.push('rule:x');
// @ts-expect-error readonly source versions
anchor.sourceVersionReferences.push('source:x');
// @ts-expect-error readonly contract versions
anchor.contractVersionReferences.push('contract:x');
// @ts-expect-error readonly evidence references
anchor.evidenceReferences.push('evidence:x');
// @ts-expect-error readonly snapshot mode
snapshot.mode = LifecycleReplayMode.AS_IS;
// @ts-expect-error readonly snapshot availability
snapshot.availability = LifecycleReplayAvailability.REVIEW_REQUIRED;
// @ts-expect-error readonly snapshot semantic outcome
snapshot.semanticOutcome = 'changed';
// @ts-expect-error readonly snapshot rule versions
snapshot.ruleVersionReferences.push('rule:x');
// @ts-expect-error readonly snapshot evidence
snapshot.evidenceReferences.push('evidence:x');
// @ts-expect-error readonly divergence reason
reason.reason = reason.reason;
// @ts-expect-error readonly divergence mode
reason.mode = LifecycleReplayMode.AS_WAS;
// @ts-expect-error readonly replay result
replay.toJSON().results.push(result);
// @ts-expect-error readonly view results
view.results.push(result);
// @ts-expect-error fixed result outcome
result.outcome = LifecycleHistoricalReplayOutcome.MATCH;
// @ts-expect-error fixed comparison outcome
comparison.outcome = LifecycleHistoricalReplayComparisonOutcome.SAME_OUTCOME;
// @ts-expect-error readonly differences
comparison.differenceReferences.push(comparison.differenceReferences[0]!);
// @ts-expect-error readonly anchor view
view.anchor.reference = 'changed';
// @ts-expect-error fixed authorization flag
view.authorizationAuthority = true;
// @ts-expect-error fixed historical mutation flag
view.historicalDecisionMutated = true;
// @ts-expect-error fixed compliance mutation flag
view.complianceProjectionMutated = true;
// @ts-expect-error fixed event count
view.eventsEmitted = 1;
// @ts-expect-error readonly reason codes
view.reasonCodes.push('changed');
// @ts-expect-error readonly divergence collection
view.divergenceReasons.push(view.divergenceReasons[0]!);

void anchor;
void snapshot;
void reason;
void replay;
void view;
void result;
void comparison;
