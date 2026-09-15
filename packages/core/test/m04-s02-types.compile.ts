import {
  CatalogEffectivePeriod,
  CredentialDefinition,
  CredentialDefinitionId,
  DateOnly,
  Jurisdiction,
  RequirementDefinition,
  RequirementDefinitionId,
  SourceId,
  VersionId,
} from '../src/index.ts';

const credentialId = CredentialDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c080101');
const requirementId = RequirementDefinitionId.from('018f22e2-79b0-7cc3-98c4-dc0c0c080102');
const sourceId = SourceId.from('018f22e2-79b0-7cc3-98c4-dc0c0c080103');
const period = CatalogEffectivePeriod.create({ effectiveFrom: DateOnly.from('2026-01-01') });
const jurisdiction = Jurisdiction.fromCode('CZ');

const credential = CredentialDefinition.create({
  id: credentialId,
  version: VersionId.from('credential-definition-1'),
  code: 'CRED.TEST',
  preferredLabel: 'Credential',
  aliases: [],
  description: 'Credential definition.',
  jurisdiction,
  effectivePeriod: period,
  sourceReferenceIds: [sourceId],
});

const requirement = RequirementDefinition.create({
  id: requirementId,
  version: VersionId.from('requirement-definition-1'),
  code: 'REQ.TEST',
  preferredLabel: 'Requirement',
  aliases: [],
  description: 'Requirement definition.',
  jurisdiction,
  effectivePeriod: period,
  sourceReferenceIds: [sourceId],
});

// @ts-expect-error semantic IDs are not interchangeable
const invalidCredentialId: CredentialDefinitionId = requirementId;
// @ts-expect-error semantic IDs are not interchangeable
const invalidRequirementId: RequirementDefinitionId = credentialId;
// @ts-expect-error immutable model
credential.code = 'CRED.OTHER';
// @ts-expect-error immutable nested collection
credential.sourceReferenceIds.push(sourceId);
// @ts-expect-error immutable model
requirement.preferredLabel = 'Changed';
// @ts-expect-error immutable nested collection
requirement.aliases.push('Changed');

void invalidCredentialId;
void invalidRequirementId;
