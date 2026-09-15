import {
  CredentialArtifact,
  SubjectReference,
} from '../../core/src/index.ts';
import {
  CredentialCardDocumentBinding,
  CredentialCardFacetAvailability,
  CredentialCardFacetKind,
  CredentialCardReadModel,
  ProfessionalPassportProjection,
} from '../src/index.ts';

declare const passport: ProfessionalPassportProjection;
declare const artifact: CredentialArtifact;
declare const subject: SubjectReference;
void subject;

const binding = CredentialCardDocumentBinding.create({
  credentialDefinitionId: 'credential-definition-003',
  artifact,
  bindingReference: 'read-binding:artifact-003',
});

const card = CredentialCardReadModel.compose({ passport, documentBinding: binding });
const nonAuthoritative: false = card.authorizationAuthority;
void nonAuthoritative;
const documentFacet: typeof CredentialCardFacetKind[keyof typeof CredentialCardFacetKind] = CredentialCardFacetKind.DOCUMENT;
void documentFacet;
const availability: typeof CredentialCardFacetAvailability[keyof typeof CredentialCardFacetAvailability] = card.document.availability;
void availability;
const lifecycleState: null = card.lifecycle.state;
void lifecycleState;

// @ts-expect-error facet kinds are controlled
const invalidFacet: typeof CredentialCardFacetKind[keyof typeof CredentialCardFacetKind] = 'VALIDITY';
void invalidFacet;

// @ts-expect-error Credential Card is immutable
card.assessmentId = 'changed';

// @ts-expect-error nested document facet is immutable
card.document.expiresOn = '2099-01-01';

// @ts-expect-error verification counters are immutable
card.verification.evidenceStateCounts.VERIFIED = 99;

// @ts-expect-error lifecycle source remains unavailable and immutable in Slice 03
card.lifecycle.state = 'ACTIVE';

// @ts-expect-error compose only accepts ProfessionalPassportProjection
CredentialCardReadModel.compose({ passport: {} });

CredentialCardDocumentBinding.create({
  credentialDefinitionId: 'credential-definition-003',
  // @ts-expect-error document binding only accepts CredentialArtifact
  artifact: {},
  bindingReference: 'read-binding:artifact-003',
});
