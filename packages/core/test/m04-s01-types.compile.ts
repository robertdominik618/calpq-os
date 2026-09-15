import {
  ActivityDefinition,
  ActivityDefinitionId,
  CatalogEffectivePeriod,
  DateOnly,
  ExternalClassificationMappingRelation,
  ExternalClassificationReference,
  Jurisdiction,
  ProfessionDefinition,
  ProfessionDefinitionId,
  RegulatoryStatus,
  SourceId,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
  VersionId,
} from '../src/index.ts';

const activityId = ActivityDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079101');
const professionId = ProfessionDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079102');
const sourceId = SourceId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079103');
const period = CatalogEffectivePeriod.create({ effectiveFrom: DateOnly.from('2026-01-01') });

const activity = ActivityDefinition.create({
  id: activityId,
  version: VersionId.from('activity-1'),
  preferredLabel: 'Activity',
  aliases: [],
  description: 'Activity description',
  jurisdiction: Jurisdiction.fromCode('CZ'),
  effectivePeriod: period,
  regulatoryStatus: RegulatoryStatus.UNREGULATED,
  sourceReferenceIds: [sourceId],
});

const classification = ExternalClassificationReference.create({
  system: 'ESCO',
  conceptId: 'external-id',
  datasetVersion: VersionId.from('esco-1'),
  mappingRelation: ExternalClassificationMappingRelation.CANDIDATE,
  verificationState: VerificationState.from(VerificationStateCode.REVIEW_REQUIRED),
  mappedAt: UtcInstant.from('2026-09-15T08:00:00Z'),
  sourceReferenceId: sourceId,
});

const profession = ProfessionDefinition.create({
  id: professionId,
  version: VersionId.from('profession-1'),
  preferredLabel: 'Profession',
  aliases: [],
  description: 'Profession description',
  jurisdiction: Jurisdiction.fromCode('CZ'),
  effectivePeriod: period,
  regulatoryStatus: RegulatoryStatus.UNKNOWN_REVIEW_REQUIRED,
  sourceReferenceIds: [sourceId],
  externalClassifications: [classification],
});

// @ts-expect-error stable ActivityDefinition identity is readonly
activity.id = ActivityDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079104');
// @ts-expect-error labels are readonly
activity.preferredLabel = 'Changed';
// @ts-expect-error aliases are readonly
activity.aliases.push('Changed');
// @ts-expect-error source references are readonly
profession.sourceReferenceIds.push(sourceId);
// @ts-expect-error external classifications are readonly
profession.externalClassifications.push(classification);
// @ts-expect-error mapping relation is readonly
classification.mappingRelation = ExternalClassificationMappingRelation.EXACT;
// @ts-expect-error semantic ActivityDefinitionId and ProfessionDefinitionId cannot be mixed
const wrongProfessionId: ProfessionDefinitionId = activityId;

void activity;
void profession;
void wrongProfessionId;
