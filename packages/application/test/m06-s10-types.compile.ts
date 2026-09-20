import type {
  CredentialLifecycleTimelineView,
  ExpiryRenewalEvaluationView,
  RecurringObligationProjectionView,
  NotificationProjectionView,
  DependencyImpactTraversalView,
  SelectiveReevaluationView,
  ContinuousComplianceProjectionView,
  LifecycleHistoricalReplayView,
} from '../src/lifecycle/index.ts';

declare const s01: CredentialLifecycleTimelineView;
declare const s02: ExpiryRenewalEvaluationView;
declare const s03: RecurringObligationProjectionView;
declare const s05: NotificationProjectionView;
declare const s06: DependencyImpactTraversalView;
declare const s07: SelectiveReevaluationView;
declare const s08: ContinuousComplianceProjectionView;
declare const s09: LifecycleHistoricalReplayView;

// @ts-expect-error readonly S01 basis
s01.basis = s01.basis;
// @ts-expect-error readonly S01 events
s01.events.push(s01.events[0]!);
// @ts-expect-error readonly S02 outcome
s02.outcome = s02.outcome;
// @ts-expect-error readonly S02 reasons
s02.reasonCodes.push('X');
// @ts-expect-error readonly S03 occurrences
s03.occurrences.push(s03.occurrences[0]!);
// @ts-expect-error readonly S03 outcome
s03.outcome = s03.outcome;
// @ts-expect-error readonly S05 intents
s05.intents.push(s05.intents[0]!);
// @ts-expect-error readonly S05 outcome
s05.outcome = s05.outcome;
// @ts-expect-error readonly S06 candidates
s06.candidates.push(s06.candidates[0]!);
// @ts-expect-error readonly S06 cycles
s06.cycles.push(s06.cycles[0]!);
// @ts-expect-error fixed S06 authority flag
s06.authorizationAuthority = true;
// @ts-expect-error fixed S06 mutation flag
s06.historicalDecisionMutated = true;
// @ts-expect-error readonly S07 decisions
s07.decisions.push(s07.decisions[0]!);
// @ts-expect-error readonly S07 outcome
s07.outcome = s07.outcome;
// @ts-expect-error fixed S07 authority flag
s07.authorizationAuthority = true;
// @ts-expect-error fixed S07 compliance mutation flag
s07.complianceStateChanged = true;
// @ts-expect-error readonly S08 conditions
s08.conditions.push(s08.conditions[0]!);
// @ts-expect-error readonly S08 status
s08.status = s08.status;
// @ts-expect-error fixed S08 authorization flag
s08.authorizationAuthority = true;
// @ts-expect-error fixed S08 assignment flag
s08.assignmentInferenceAuthorized = true;
// @ts-expect-error readonly S09 results
s09.results.push(s09.results[0]!);
// @ts-expect-error readonly S09 comparison
s09.comparison = s09.comparison;
// @ts-expect-error fixed S09 authorization flag
s09.authorizationAuthority = true;
// @ts-expect-error fixed S09 history mutation flag
s09.historicalDecisionMutated = true;
// @ts-expect-error S06 nested candidate paths readonly
s06.candidates[0]!.paths.push(s06.candidates[0]!.paths[0]!);
// @ts-expect-error S07 nested decision paths readonly
s07.decisions[0]!.dependencyPaths.push(s07.decisions[0]!.dependencyPaths[0]!);
// @ts-expect-error S08 reasons readonly
s08.reasonCodes.push('X');
// @ts-expect-error S09 differences readonly
s09.comparison.differences.push(s09.comparison.differences[0]!);

void s01;void s02;void s03;void s05;void s06;void s07;void s08;void s09;
