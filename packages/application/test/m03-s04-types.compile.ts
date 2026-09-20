import type {
  EligibilityAssessment,
} from '../../core/src/index.ts';
import {
  CredentialCardReadModel,
  CredentialExplanationAffordance,
  CredentialExplanationAvailability,
  CredentialExplanationReadModel,
  ProfessionalPassportProjection,
} from '../src/index.ts';

declare const card: CredentialCardReadModel;
declare const passport: ProfessionalPassportProjection;
declare const assessment: EligibilityAssessment;

const explanation = CredentialExplanationReadModel.compose({
  card,
  passport,
  assessment,
});

const authorizationAuthority: false = explanation.authorizationAuthority;
const decisionAuthority: false = explanation.decisionAuthority;
const whyAffordance: 'WHY' = explanation.eligibility.affordance;
const availability:
  | 'AVAILABLE'
  | 'SOURCE_NOT_AVAILABLE' = explanation.eligibility.sourceDetailAvailability;

void authorizationAuthority;
void decisionAuthority;
void whyAffordance;
void availability;
void CredentialExplanationAffordance;
void CredentialExplanationAvailability;

// @ts-expect-error explanation root is immutable
explanation.assessmentId = 'changed';

// @ts-expect-error nested explanation is immutable
explanation.eligibility.reasonCode = 'changed';

// @ts-expect-error compose requires a governed Credential Card
CredentialExplanationReadModel.compose({ card: {}, passport, assessment });

// @ts-expect-error compose requires a governed Professional Passport
CredentialExplanationReadModel.compose({ card, passport: {}, assessment });

// @ts-expect-error compose requires authoritative EligibilityAssessment
CredentialExplanationReadModel.compose({ card, passport, assessment: {} });
