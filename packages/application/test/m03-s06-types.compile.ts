import {
  GovernedNextActionPresentation,
  GovernedNextActionReference,
  MissingConditionNextActionReadModel,
  MissingConditionPresentation,
} from '../src/index.ts';
import type {
  MissingConditionNextActionReadModelInput,
  MissingConditionState,
  NextActionAvailability,
  NextActionPresentationReason,
  NextActionSourceKind,
} from '../src/index.ts';

declare const model: MissingConditionNextActionReadModel;
declare const condition: MissingConditionPresentation;
declare const actionReference: GovernedNextActionReference;
declare const actionPresentation: GovernedNextActionPresentation;
declare const input: MissingConditionNextActionReadModelInput;

const assessmentId: string = model.assessmentId;
const evaluatedAt: string = model.evaluatedAt;
const missingConditions: readonly MissingConditionPresentation[] = model.missingConditions;
const missingCount: number = model.missingConditionCount;
const conditionState: MissingConditionState = condition.state;
const availability: NextActionAvailability = condition.nextActionAvailability;
const presentationReason: NextActionPresentationReason = condition.nextActionReason;
const reasonCodes: readonly string[] = condition.reasonCodes;
const actions: readonly GovernedNextActionPresentation[] = condition.nextActions;
const sourceKind: NextActionSourceKind = actionReference.sourceKind;
const actionCode: string = actionPresentation.actionCode;
const labelKey: string = actionPresentation.labelKey;
const rootAuthorizationAuthority: false = model.authorizationAuthority;
const rootDecisionAuthority: false = model.decisionAuthority;
const rootActionAuthority: false = model.actionRecommendationAuthority;
const conditionDecisionAuthority: false = condition.decisionAuthority;
const conditionActionAuthority: false = condition.actionRecommendationAuthority;
const actionAuthority: false = actionPresentation.actionRecommendationAuthority;

void assessmentId;
void evaluatedAt;
void missingConditions;
void missingCount;
void conditionState;
void availability;
void presentationReason;
void reasonCodes;
void actions;
void sourceKind;
void actionCode;
void labelKey;
void rootAuthorizationAuthority;
void rootDecisionAuthority;
void rootActionAuthority;
void conditionDecisionAuthority;
void conditionActionAuthority;
void actionAuthority;
void input;

// @ts-expect-error readonly root identity must not be assignable
model.assessmentId = 'changed';
// @ts-expect-error readonly collection must not expose mutation
model.missingConditions.push(condition);
// @ts-expect-error readonly reason-code collection must not expose mutation
condition.reasonCodes.push('INVENTED');
// @ts-expect-error readonly action collection must not expose mutation
condition.nextActions.push(actionPresentation);
// @ts-expect-error governed action identity is immutable
actionReference.actionCode = 'CHANGED';
