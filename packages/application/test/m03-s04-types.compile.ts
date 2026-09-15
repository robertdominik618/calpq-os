import type {
  EligibilityAssessment,
} from '../../core/src/index.ts';
import {
  CredentialCardReadModel,
  EvidenceSourceExplanationReadModel,
  ExplanationViewSourceKind,
  WhyAffordanceKind,
  WhyTargetKind,
} from '../src/index.ts';

declare const card: CredentialCardReadModel;
declare const assessment: EligibilityAssessment;

const view = EvidenceSourceExplanationReadModel.compose({ card, assessment });

const sourceKind: typeof ExplanationViewSourceKind[keyof typeof ExplanationViewSourceKind] = view.sourceKind;
void sourceKind;
const whyKind: typeof WhyAffordanceKind[keyof typeof WhyAffordanceKind] = view.why.kind;
void whyKind;
const whyTarget: typeof WhyTargetKind[keyof typeof WhyTargetKind] = view.why.targetKind;
void whyTarget;
const nonAuthoritative: false = view.authorizationAuthority;
void nonAuthoritative;
const nonDecision: false = view.decisionAuthority;
void nonDecision;
const whyNonDecision: false = view.why.decisionAuthority;
void whyNonDecision;

// @ts-expect-error explanation source kind is controlled
const invalidSourceKind: typeof ExplanationViewSourceKind[keyof typeof ExplanationViewSourceKind] = 'AI_EXPLANATION';
void invalidSourceKind;

// @ts-expect-error Why target kind is controlled
const invalidWhyTarget: typeof WhyTargetKind[keyof typeof WhyTargetKind] = 'AUTHORIZATION';
void invalidWhyTarget;

// @ts-expect-error explanation root is immutable
view.assessmentId = 'changed';

// @ts-expect-error nested Why affordance is immutable
view.why.labelKey = 'changed';

// @ts-expect-error reason list is immutable
view.reasons[0] = view.reasons[0]!;

// @ts-expect-error reason codes are immutable
view.reasons[0]!.reasonCodes[0] = 'CHANGED';

// @ts-expect-error source entries are immutable
view.sources[0]!.version = 'changed';

// @ts-expect-error evidence entries are immutable
view.evidence[0]!.sourceId = 'changed';

// @ts-expect-error provenance is immutable
view.provenance.ruleVersion = 'changed';

// @ts-expect-error compose requires CredentialCardReadModel
EvidenceSourceExplanationReadModel.compose({ card: {}, assessment });

// @ts-expect-error compose requires EligibilityAssessment
EvidenceSourceExplanationReadModel.compose({ card, assessment: {} });
