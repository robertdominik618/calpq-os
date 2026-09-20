export const CredentialArtifactKind = {
  DOCUMENT: 'DOCUMENT',
  DIGITAL_CREDENTIAL: 'DIGITAL_CREDENTIAL',
  CERTIFICATE: 'CERTIFICATE',
  CARD: 'CARD',
  REGISTRY_EXTRACT: 'REGISTRY_EXTRACT',
  ATTESTATION: 'ATTESTATION',
  OTHER: 'OTHER',
} as const;
export type CredentialArtifactKind = (typeof CredentialArtifactKind)[keyof typeof CredentialArtifactKind];

export const ArtifactFormat = {
  DOCUMENT: 'DOCUMENT',
  IMAGE: 'IMAGE',
  STRUCTURED_DATA: 'STRUCTURED_DATA',
  BINARY: 'BINARY',
  DIGITAL_ATTESTATION: 'DIGITAL_ATTESTATION',
  REGISTRY_RECORD: 'REGISTRY_RECORD',
  OTHER: 'OTHER',
} as const;
export type ArtifactFormat = (typeof ArtifactFormat)[keyof typeof ArtifactFormat];

const ARTIFACT_KINDS = new Set<string>(Object.values(CredentialArtifactKind));
const ARTIFACT_FORMATS = new Set<string>(Object.values(ArtifactFormat));

export function assertCredentialArtifactKind(value: CredentialArtifactKind): void {
  if (!ARTIFACT_KINDS.has(value)) throw new TypeError('Credential artifact kind must be controlled');
}

export function assertArtifactFormat(value: ArtifactFormat): void {
  if (!ARTIFACT_FORMATS.has(value)) throw new TypeError('Credential artifact format must be controlled');
}
