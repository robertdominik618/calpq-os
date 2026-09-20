import {
  EquivalenceEffectType,
  EquivalenceRule,
  EquivalenceRuleId,
  RecognitionReviewCase,
  RecognitionRouteId,
  RecognitionRouteKind,
  type EquivalenceEffectTypeCode,
  type RecognitionRouteKindCode,
} from '../src/index.ts';

const ruleId = EquivalenceRuleId.from('018f22e2-79b0-7cc3-98c4-dc0c0c0b6101');
const routeId = RecognitionRouteId.from('018f22e2-79b0-7cc3-98c4-dc0c0c0b6102');
void ruleId;
void routeId;

const effect: EquivalenceEffectTypeCode = EquivalenceEffectType.FULL_SUBSTITUTION;
const routeKind: RecognitionRouteKindCode = RecognitionRouteKind.GENERAL_RECOGNITION;
void effect;
void routeKind;

declare const rule: EquivalenceRule;
declare const reviewCase: RecognitionReviewCase;

// @ts-expect-error readonly source snapshots cannot be mutated
rule.sourceReferences.push(rule.sourceReferences[0]);

// @ts-expect-error readonly residual requirements cannot be mutated
rule.residualRequirements.length = 0;

// @ts-expect-error route availability is intentionally not a review-resolution API
reviewCase.resolveWithRoute();

// @ts-expect-error uncontrolled similarity is not an equivalence effect
const invalidEffect: EquivalenceEffectTypeCode = 'SAME_NAME_IS_EQUIVALENT';
void invalidEffect;

// @ts-expect-error semantic ID brands remain distinct
const invalidRouteId: RecognitionRouteId = ruleId;
void invalidRouteId;
