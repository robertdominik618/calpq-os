import type {
  ContinuousComplianceProjectionView,
  ContinuousComplianceConditionFactView,
} from '../src/lifecycle/continuous-compliance.ts';
import {
  ContinuousComplianceScope,
  ContinuousComplianceConditionFact,
  ContinuousComplianceProjection,
  ContinuousComplianceScopeKind,
  ContinuousComplianceConditionState,
  ContinuousComplianceTiming,
  ContinuousComplianceSourceKind,
  ContinuousComplianceStatus,
} from '../src/lifecycle/continuous-compliance.ts';

declare const scope: ContinuousComplianceScope;
declare const fact: ContinuousComplianceConditionFact;
declare const factView: ContinuousComplianceConditionFactView;
declare const projection: ContinuousComplianceProjection;
declare const view: ContinuousComplianceProjectionView;

// @ts-expect-error readonly scope reference
scope.reference = 'changed';
// @ts-expect-error readonly scope version
scope.version = scope.version;
// @ts-expect-error readonly scope kind
scope.kind = ContinuousComplianceScopeKind.ORGANIZATION;
// @ts-expect-error readonly scope tenant
scope.tenant = scope.tenant;
// @ts-expect-error readonly scope organization
scope.organization = scope.organization;
// @ts-expect-error readonly fact reference
fact.reference = 'changed';
// @ts-expect-error readonly fact state
fact.state = ContinuousComplianceConditionState.UNSATISFIED;
// @ts-expect-error readonly fact timing
fact.timing = ContinuousComplianceTiming.FUTURE;
// @ts-expect-error readonly fact source kind
fact.sourceKind = ContinuousComplianceSourceKind.REEVALUATION_DECISION;
// @ts-expect-error readonly blocking flag
fact.blocking = true;
// @ts-expect-error readonly action flag
fact.actionRequired = true;
// @ts-expect-error readonly evidence references
fact.evidenceReferences.push('evidence:x');
// @ts-expect-error readonly condition references
fact.conditionReferences.push('condition:x');
// @ts-expect-error readonly reason codes
fact.reasonCodes.push('CHANGED');
// @ts-expect-error readonly fact view verification
factView.verificationState = 'UNVERIFIED';
// @ts-expect-error readonly projection status
view.status = ContinuousComplianceStatus.NON_COMPLIANT;
// @ts-expect-error readonly projection facts
view.facts.push(factView);
// @ts-expect-error readonly current refs
view.currentFactReferences.push('fact:x');
// @ts-expect-error readonly future refs
view.futureFactReferences.push('fact:x');
// @ts-expect-error readonly source version context
view.sourceVersions.push(view.sourceVersions[0]!);
// @ts-expect-error fixed authorization flag
view.authorizationAuthority = true;
// @ts-expect-error fixed assignment inference flag
view.assignmentInferenceAuthorized = true;
// @ts-expect-error fixed zero events
view.eventsEmitted = 1;
// @ts-expect-error projection internals are readonly
projection.toJSON().status = ContinuousComplianceStatus.COMPLIANT;

void scope;
void fact;
void factView;
void projection;
void view;
