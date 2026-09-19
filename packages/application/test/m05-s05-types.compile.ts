import {
  IntakeSecurityAssessment,
  IntakeSecurityControl,
  IntakeSecurityDisposition,
  IntakeSecurityObservation,
  SecurityControlPolicy,
} from '../src/security/index.ts';

declare const assessment: IntakeSecurityAssessment;
declare const observation: IntakeSecurityObservation;
declare const securityPolicy: SecurityControlPolicy;

// @ts-expect-error disposition is derived and readonly
assessment.disposition = IntakeSecurityDisposition.QUARANTINED;
// @ts-expect-error assessment observations are readonly
assessment.observations.push(observation);
// @ts-expect-error missing control list is readonly
assessment.missingRequiredControls.push(IntakeSecurityControl.MALWARE_SCAN);
// @ts-expect-error policy controls are readonly
securityPolicy.requiredControls.push(IntakeSecurityControl.CONTENT_TYPE_VALIDATION);
// @ts-expect-error uncontrolled security control is forbidden
const invalidControl: IntakeSecurityControl = 'TRUST_GRANTED';
// @ts-expect-error disposition vocabulary is controlled
const invalidDisposition: IntakeSecurityDisposition = 'VERIFIED';

void invalidControl;
void invalidDisposition;
