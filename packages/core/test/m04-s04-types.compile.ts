import {
  ActivityDefinitionId,
  ProfessionDefinitionId,
  QualificationPathDefinition,
  QualificationPathId,
  QualificationPathSelection,
  QualificationPathStep,
} from '../src/index.ts';

const pathId = QualificationPathId.from('018f22e2-79b0-7cc3-98c4-dc0c0c091001');
void pathId;

const activityId = ActivityDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c091002');
const professionId = ProfessionDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c091003');

// @ts-expect-error QualificationPathId must not be interchangeable with ActivityDefinitionId.
const wrongActivity: ActivityDefinitionId = pathId;
void wrongActivity;

// @ts-expect-error QualificationPathId must not be interchangeable with ProfessionDefinitionId.
const wrongProfession: ProfessionDefinitionId = pathId;
void wrongProfession;

declare const path: QualificationPathDefinition;
declare const step: QualificationPathStep;
declare const selection: QualificationPathSelection;

// @ts-expect-error QualificationPathDefinition identity is readonly.
path.id = pathId;

// @ts-expect-error QualificationPathDefinition steps are readonly.
path.steps.push(step);

// @ts-expect-error QualificationPathStep prerequisites are readonly.
step.prerequisiteStepCodes.push('STEP.EXTRA');

// @ts-expect-error QualificationPathSelection candidates are readonly.
selection.candidates.push(path);

void activityId;
void professionId;
