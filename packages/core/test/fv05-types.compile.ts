import {
  ArtifactFormat,
  CredentialArtifact,
  CredentialArtifactId,
  CredentialArtifactKind,
  CredentialId,
  EvidenceSnapshot,
  VerificationState,
  VerificationStateCode,
} from '../src/index.ts';

declare const artifact: CredentialArtifact;
declare const snapshot: EvidenceSnapshot;

const artifactId: CredentialArtifactId = CredentialArtifactId.from('018f22e2-79b0-7cc3-98c4-dc0c0c077001');
void artifactId;

// @ts-expect-error Generic CredentialId and CredentialArtifactId are nominally distinct.
const wrongArtifactId: CredentialArtifactId = CredentialId.from('018f22e2-79b0-7cc3-98c4-dc0c0c077002');
void wrongArtifactId;

// @ts-expect-error Evidence snapshot entries are immutable historical references.
snapshot.entries.push(snapshot.entries[0]);

// @ts-expect-error CredentialArtifact verification state is immutable after construction.
artifact.verificationState = VerificationState.from(VerificationStateCode.STALE);

function acceptKind(value: CredentialArtifactKind): CredentialArtifactKind { return value; }
acceptKind(CredentialArtifactKind.CERTIFICATE);
// @ts-expect-error Arbitrary strings are not CredentialArtifactKind values.
acceptKind('PASSPORT');

function acceptFormat(value: ArtifactFormat): ArtifactFormat { return value; }
acceptFormat(ArtifactFormat.DOCUMENT);
// @ts-expect-error External protocol labels do not define Core artifact format types.
acceptFormat('W3C_VC');
