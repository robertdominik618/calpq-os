import {
  CredentialDefinitionId,
  EligibilityAssessment,
  EligibilityAssessmentId,
  RequirementSet,
  RequirementSetId,
} from '../src/index.ts';

declare const assessment: EligibilityAssessment;
declare const requirementSet: RequirementSet;

const assessmentId: EligibilityAssessmentId = EligibilityAssessmentId.from('018f22e2-79b0-7cc3-98c4-dc0c0c078101');
void assessmentId;

// @ts-expect-error RequirementSetId and CredentialDefinitionId are nominally distinct.
const wrongCredentialId: CredentialDefinitionId = RequirementSetId.from('018f22e2-79b0-7cc3-98c4-dc0c0c078102');
void wrongCredentialId;

// @ts-expect-error EligibilityAssessmentId and RequirementSetId are nominally distinct.
const wrongRequirementSetId: RequirementSetId = EligibilityAssessmentId.from('018f22e2-79b0-7cc3-98c4-dc0c0c078103');
void wrongRequirementSetId;

// @ts-expect-error EligibilityAssessment is immutable after construction.
assessment.outcome = 'NOT_SATISFIED';

// @ts-expect-error Historical atomic results are immutable.
assessment.atomicResults.push(assessment.atomicResults[0]);

// @ts-expect-error RequirementSet requirement list is immutable.
requirementSet.requirementIds.push(requirementSet.requirementIds[0]);
