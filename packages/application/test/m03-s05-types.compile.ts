import type { EligibilityAssessment } from '../../core/src/index.ts';
import {
  ActivityTimelineOrdering,
  ActivityTimelineReadModel,
  CredentialExplanationReadModel,
  ProfessionalPassportProjection,
} from '../src/index.ts';

declare const explanation: CredentialExplanationReadModel;
declare const passport: ProfessionalPassportProjection;
declare const assessment: EligibilityAssessment;

const timeline = ActivityTimelineReadModel.compose({
  explanation,
  passport,
  assessment,
});

const authorizationAuthority: false = timeline.authorizationAuthority;
const decisionAuthority: false = timeline.decisionAuthority;
const ordering: 'OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK' = timeline.ordering;

void authorizationAuthority;
void decisionAuthority;
void ordering;
void ActivityTimelineOrdering;

// @ts-expect-error root read model is immutable
timeline.assessmentId = 'changed';

// @ts-expect-error event collection is immutable
timeline.events.push(timeline.events[0]!);

// @ts-expect-error decision provenance is immutable
timeline.decisionProvenance.ruleVersion = 'changed';

// @ts-expect-error compose requires governed Slice 04 explanation
ActivityTimelineReadModel.compose({ explanation: {}, passport, assessment });

// @ts-expect-error compose requires governed Professional Passport
ActivityTimelineReadModel.compose({ explanation, passport: {}, assessment });

// @ts-expect-error compose requires authoritative EligibilityAssessment
ActivityTimelineReadModel.compose({ explanation, passport, assessment: {} });
