import {
  CredentialGroupReadModel,
  CredentialProjectionSummaryReadModel,
  PassportSummarySourceKind,
  ProfessionalPassportProjection,
  ProfessionalPassportSummaryReadModel,
} from '../src/index.ts';
import {
  SubjectId,
  SubjectKind,
  SubjectReference,
} from '../../core/src/index.ts';

const subject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079299'),
  SubjectKind.PERSON,
);
declare const projection: ProfessionalPassportProjection;

const summary = ProfessionalPassportSummaryReadModel.compose({ subject, projections: [projection] });
const sourceKind: typeof PassportSummarySourceKind[keyof typeof PassportSummarySourceKind] =
  PassportSummarySourceKind.PROFESSIONAL_PASSPORT_PROJECTIONS;
void sourceKind;

const nonAuthoritative: false = summary.authorizationAuthority;
void nonAuthoritative;

const projectionSummary = CredentialProjectionSummaryReadModel.fromPassport(projection);
const group = CredentialGroupReadModel.create(projectionSummary.credentialDefinitionId, [projectionSummary]);
void group;

// @ts-expect-error summary is immutable
summary.projectionCount = 99;

// @ts-expect-error groups are immutable
summary.groups[0] = group;

// @ts-expect-error group assessment list is immutable
group.assessments[0] = projectionSummary;

// @ts-expect-error outcome counters are immutable
summary.outcomeCounts.SATISFIED = 99;

// @ts-expect-error compose requires SubjectReference
ProfessionalPassportSummaryReadModel.compose({ subject: {}, projections: [projection] });

// @ts-expect-error compose accepts ProfessionalPassportProjection only
ProfessionalPassportSummaryReadModel.compose({ subject, projections: [{}] });

// @ts-expect-error summary source kind is controlled
const invalidSourceKind: typeof PassportSummarySourceKind[keyof typeof PassportSummarySourceKind] = 'USER_ASSERTION';
void invalidSourceKind;
