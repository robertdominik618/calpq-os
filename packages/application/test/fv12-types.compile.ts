import {
  EligibilityAssessment,
  EligibilityAssessmentId,
  EvidenceId,
  UtcInstant,
} from '../../core/src/index.ts';
import {
  PassportEvidenceVerificationLink,
  ProfessionalPassportProjection,
} from '../src/index.ts';

declare const projection: ProfessionalPassportProjection;
declare const assessment: EligibilityAssessment;
declare const link: PassportEvidenceVerificationLink;

// @ts-expect-error Passport projection items are read-only.
projection.items.push(projection.items[0]);

// @ts-expect-error Passport can never become authorization authority.
projection.authorizationAuthority = true;

// @ts-expect-error Projected eligibility outcome is immutable read-model data.
projection.eligibilityOutcome = 'NOT_SATISFIED';

// @ts-expect-error Arbitrary user assertions are not accepted projection inputs.
ProfessionalPassportProjection.rebuild({ assessment, generatedAt: UtcInstant.from('2026-09-15T09:00:00Z'), userAssertion: 'verified' });

// @ts-expect-error Verification links require EvidenceId, not assessment identity.
PassportEvidenceVerificationLink.create({ evidenceId: EligibilityAssessmentId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079101'), record: link.record });

const evidenceId: EvidenceId = link.evidenceId;
void evidenceId;
