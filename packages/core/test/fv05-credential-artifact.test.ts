import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import {
  ActorId,
  ActorKind,
  ActorReference,
  ArtifactFormat,
  ContentHash,
  CredentialArtifact,
  CredentialArtifactId,
  CredentialArtifactKind,
  CredentialId,
  DateOnly,
  DecisionId,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  EvidenceSnapshot,
  ExternalArtifactReference,
  Jurisdiction,
  SourceId,
  SourceReference,
  SourceType,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
  VersionId,
} from '../src/index.ts';

const IDS = {
  artifact: '018f22e2-79b0-7cc3-98c4-dc0c0c076001',
  evidence: '018f22e2-79b0-7cc3-98c4-dc0c0c076002',
  derived: '018f22e2-79b0-7cc3-98c4-dc0c0c076003',
  source: '018f22e2-79b0-7cc3-98c4-dc0c0c076004',
  issuer: '018f22e2-79b0-7cc3-98c4-dc0c0c076005',
  process: '018f22e2-79b0-7cc3-98c4-dc0c0c076006',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c076007',
  decision: '018f22e2-79b0-7cc3-98c4-dc0c0c076008',
} as const;

const NOW = UtcInstant.from('2026-09-15T06:00:00Z');
const issuer = ActorReference.create(ActorId.from(IDS.issuer), ActorKind.EXTERNAL_AUTHORITY);
const processActor = ActorReference.create(ActorId.from(IDS.process), ActorKind.SYSTEM_PROCESS);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);

function source(version = 'authority-2026.1'): SourceReference {
  return SourceReference.create({
    id: SourceId.from(IDS.source),
    authority: issuer,
    jurisdiction: Jurisdiction.fromCode('CZ'),
    sourceType: SourceType.ISSUER_RECORD,
    canonicalLocator: 'urn:calpq:test:issuer-record',
    version: VersionId.from(version),
    effectiveFrom: DateOnly.from('2026-01-01'),
    retrievedAt: NOW,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256('a'.repeat(64)),
  });
}

function originalEvidence(src = source()): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(IDS.evidence),
    kind: EvidenceKind.DOCUMENT,
    contentReference: 'urn:calpq:evidence:credential-original',
    mediaType: 'application/pdf',
    contentHash: ContentHash.sha256('b'.repeat(64)),
    acquiredAt: NOW,
    acquiredBy: processActor,
    source: src,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
}

function derivedEvidence(parent: EvidenceReference): EvidenceReference {
  return EvidenceReference.derived({
    id: EvidenceId.from(IDS.derived),
    kind: EvidenceKind.OCR_TEXT,
    contentReference: 'urn:calpq:evidence:credential-derived',
    mediaType: 'text/plain',
    acquiredAt: NOW,
    acquiredBy: processActor,
    source: parent.source,
    derivationParent: parent.id,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
}

function artifact(options: {
  snapshot?: EvidenceSnapshot;
  verification?: VerificationState;
} = {}): CredentialArtifact {
  return CredentialArtifact.create({
    id: CredentialArtifactId.from(IDS.artifact),
    kind: CredentialArtifactKind.CERTIFICATE,
    format: ArtifactFormat.DOCUMENT,
    subject,
    issuer,
    issuedOn: DateOnly.from('2026-01-05'),
    effectiveFrom: DateOnly.from('2026-01-10'),
    expiresOn: DateOnly.from('2027-01-10'),
    verificationState: options.verification ?? VerificationState.from(VerificationStateCode.VERIFIED),
    provenanceRefs: [DecisionId.from(IDS.decision)],
    evidenceSnapshot: options.snapshot ?? EvidenceSnapshot.capture([originalEvidence()], NOW),
    externalReference: ExternalArtifactReference.create({
      externalIdentifier: 'CERT-2026-0001',
      locator: 'urn:calpq:external:credential:0001',
      contentHash: ContentHash.sha256('c'.repeat(64)),
    }),
  });
}

test('FV05-01 artifact-id-type', () => {
  const value = artifact();
  assert.equal(value.id instanceof CredentialArtifactId, true);
  assert.equal(value.id instanceof CredentialId, false);
});

test('FV05-02 artifact-subject-reference', () => {
  assert.strictEqual(artifact().subject, subject);
});

test('FV05-03 issuer-reference', () => {
  assert.strictEqual(artifact().issuer, issuer);
});

test('FV05-04 issuance-metadata', () => {
  assert.equal(artifact().issuedOn?.toString(), '2026-01-05');
});

test('FV05-05 effective-metadata', () => {
  assert.equal(artifact().effectiveFrom?.toString(), '2026-01-10');
});

test('FV05-06 expiry-metadata', () => {
  assert.equal(artifact().expiresOn?.toString(), '2027-01-10');
});

test('FV05-07 verification-state', () => {
  assert.equal(artifact().verificationState.toString(), VerificationStateCode.VERIFIED);
});

test('FV05-08 provenance-reference', () => {
  const refs = artifact().provenanceRefs;
  assert.equal(refs[0]?.toString(), IDS.decision);
  assert.equal(Object.isFrozen(refs), true);
});

test('FV05-09 evidence-reference', () => {
  const entry = artifact().evidenceSnapshot.entries[0];
  assert.equal(entry?.evidenceId.toString(), IDS.evidence);
  assert.equal(entry?.contentReference, 'urn:calpq:evidence:credential-original');
});

test('FV05-10 external-reference', () => {
  const external = artifact().externalReference;
  assert.equal(external.externalIdentifier, 'CERT-2026-0001');
  assert.equal(external.contentHash?.toString(), `sha256:${'c'.repeat(64)}`);
  assert.throws(() => ExternalArtifactReference.create({}), TypeError);
});

test('FV05-11 evidence-snapshot', () => {
  const snapshot = artifact().evidenceSnapshot;
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.entries), true);
  assert.equal(Object.isFrozen(snapshot.entries[0]), true);
  assert.equal(snapshot.capturedAt.toString(), NOW.toString());
});

test('FV05-12 artifact-not-authorization', async () => {
  const value = artifact();
  const core = await import('../src/index.ts');
  assert.equal('AuthorizationGrant' in core, false);
  assert.equal('authorization' in value, false);
  assert.equal('grant' in value, false);
});

test('FV05-13 signature-not-eligibility', async () => {
  const verifiedArtifact = artifact({ verification: VerificationState.from(VerificationStateCode.VERIFIED) });
  const core = await import('../src/index.ts');
  assert.equal(verifiedArtifact.verificationState.toString(), 'VERIFIED');
  assert.equal('EligibilityAssessment' in core, false);
  assert.equal('eligible' in verifiedArtifact, false);
});

test('FV05-14 derived-not-verified', () => {
  const original = originalEvidence();
  const derived = derivedEvidence(original);
  const snapshot = EvidenceSnapshot.capture([original, derived], NOW);
  const derivedEntry = snapshot.entries.find((entry) => entry.evidenceId.toString() === IDS.derived);
  assert.equal(derivedEntry?.verificationState.toString(), VerificationStateCode.UNVERIFIED);
});

test('FV05-15 historical-evidence-version', () => {
  const versionOneSource = source('authority-2026.1');
  const snapshot = EvidenceSnapshot.capture([originalEvidence(versionOneSource)], NOW);
  const laterSource = source('authority-2026.2');
  assert.equal(laterSource.version.toString(), 'authority-2026.2');
  assert.equal(snapshot.entries[0]?.sourceVersion?.toString(), 'authority-2026.1');
});

test('FV05-16 missing-evidence-no-fabrication', () => {
  assert.throws(() => EvidenceSnapshot.capture([], NOW), /at least one evidence reference/);
});

test('FV05-17 no-provider-protocol-core-type', () => {
  const sourceText = [
    readFileSync('packages/core/src/credential/artifact-types.ts', 'utf8'),
    readFileSync('packages/core/src/credential/credential-artifact.ts', 'utf8'),
    readFileSync('packages/core/src/credential/evidence-snapshot.ts', 'utf8'),
    readFileSync('packages/core/src/credential/external-artifact-reference.ts', 'utf8'),
  ].join('\n');
  assert.doesNotMatch(sourceText, /\b(W3C|OpenID|EUDI|mdoc|OID4VC|VC-JOSE|SD-JWT)\b/i);
});

test('FV05-18 architecture-boundary', () => {
  const guard = spawnSync('bash', ['tests/architecture_boundaries_test.sh'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(guard.status, 0, `${guard.stdout}\n${guard.stderr}`);
});
