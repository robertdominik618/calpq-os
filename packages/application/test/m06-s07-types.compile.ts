import type {
  LifecycleReevaluationDecisionView,
  SelectiveReevaluationView,
} from '../src/lifecycle/selective-reevaluation.ts';
import {
  LifecycleReevaluationFact,
  LifecycleReevaluationFactState,
  LifecycleReevaluationOutcome,
  LifecycleReevaluationBatchOutcome,
} from '../src/lifecycle/selective-reevaluation.ts';

declare const fact: LifecycleReevaluationFact;
declare const decision: LifecycleReevaluationDecisionView;
declare const view: SelectiveReevaluationView;

// @ts-expect-error readonly fact reference
fact.reference = 'changed';
// @ts-expect-error readonly candidate binding
fact.candidateDedupKey = 'changed';
// @ts-expect-error readonly target reference
fact.targetReference = 'changed';
// @ts-expect-error readonly target type
fact.targetType = 'AUTHORIZATION_GRANT';
// @ts-expect-error readonly target version
fact.targetVersion = null;
// @ts-expect-error readonly state
fact.state = LifecycleReevaluationFactState.REVIEW_REQUIRED;
// @ts-expect-error readonly previous decision reference
fact.previousDecisionReference = null;
// @ts-expect-error readonly previous result
fact.previousResult = null;
// @ts-expect-error readonly new result
fact.newResult = null;
// @ts-expect-error readonly action flag
fact.actionRequired = true;
// @ts-expect-error readonly evaluator
fact.evaluatedBy = fact.evaluatedBy;
// @ts-expect-error readonly evaluated instant
fact.evaluatedAt = fact.evaluatedAt;
// @ts-expect-error readonly knowledge instant
fact.asKnownAt = fact.asKnownAt;
// @ts-expect-error readonly version binding collection
fact.versionBindings.push(fact.versionBindings[0]!);
// @ts-expect-error readonly evidence references
fact.evidenceReferences.push('evidence:x');
// @ts-expect-error readonly provenance
fact.provenanceReference = 'changed';
// @ts-expect-error readonly decisions collection
view.decisions.push(decision);
// @ts-expect-error readonly decision outcome
decision.outcome = LifecycleReevaluationOutcome.STATUS_CHANGED;
// @ts-expect-error readonly batch outcome
view.outcome = LifecycleReevaluationBatchOutcome.REVIEW_REQUIRED;
// @ts-expect-error fixed negative authority flag
view.authorizationAuthority = true;
// @ts-expect-error fixed zero event count
view.eventsEmitted = 1;
// @ts-expect-error readonly decision dependency paths
decision.dependencyPaths.push(decision.dependencyPaths[0]!);

void fact;
void decision;
void view;
