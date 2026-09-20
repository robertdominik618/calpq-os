import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActorId,
  ActorKind,
  ActorReference,
  ContentHash,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
} from '../../core/src/index.ts';
import {
  DocumentIntakeId,
  IntakeMediaMetadata,
  IntakeProcessingState,
  IntakeSecurityClassification,
  IntakeSourceChannel,
  OrganizationScopeReference,
} from '../src/index.ts';
import {
  ExternalIntakeSourceKind,
  IntakeChannelProvenance,
  IntakeTransportChannel,
  MultiChannelIntakeSubmission,
  normalizeProviderIntakeProvenance,
} from '../src/intake/multi-channel-intake.ts';
import type {
  IntakeProviderAdapterPort,
  ProviderIntakeProvenanceObservation,
} from '../src/intake/multi-channel-intake.ts';

const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c077001';
const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c077002';
const ORIGINAL_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c077003';
const INTAKE_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c077004';
const HASH = 'c'.repeat(64);

const actor = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);
const organization = OrganizationScopeReference.from('org:m05-s01-owner');

function original(): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(ORIGINAL_ID),
    kind: EvidenceKind.DOCUMENT,
    contentReference: 'object://immutable/m05-s01-original',
    mediaType: 'application/pdf',
    contentHash: ContentHash.sha256(HASH),
    acquiredAt: UtcInstant.from('2026-09-17T07:29:00Z'),
    acquiredBy: actor,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
}

function submission(
  provenance: IntakeChannelProvenance = IntakeChannelProvenance.fileUpload('upload:default'),
  originalArtifact: EvidenceReference = original(),
): MultiChannelIntakeSubmission {
  return MultiChannelIntakeSubmission.create({
    id: DocumentIntakeId.from(INTAKE_ID),
    provenance,
    receivedAt: UtcInstant.from('2026-09-17T07:30:00Z'),
    receivedBy: actor,
    subject,
    organization,
    originalArtifact,
    media: IntakeMediaMetadata.create({
      mediaType: 'application/pdf',
      byteLength: 4096,
      originalFileName: 'credential.pdf',
    }),
    securityClassification: IntakeSecurityClassification.CONFIDENTIAL,
  });
}

test('M05S01-01 controlled transport vocabulary', () => {
  assert.deepEqual(Object.values(IntakeTransportChannel), [
    'CAMERA',
    'SCAN',
    'FILE_UPLOAD',
    'EMAIL_ATTACHMENT',
    'SHARE_SHEET',
    'URL',
    'PROVIDER_ADAPTER',
  ]);
});

test('M05S01-02 camera provenance', () => {
  assert.deepEqual(IntakeChannelProvenance.camera('capture:42').toJSON(), {
    transportChannel: 'CAMERA',
    captureReference: 'capture:42',
  });
});

test('M05S01-03 scan provenance', () => {
  assert.deepEqual(IntakeChannelProvenance.scan('scan:42').toJSON(), {
    transportChannel: 'SCAN',
    scanReference: 'scan:42',
  });
});

test('M05S01-04 file upload provenance', () => {
  assert.deepEqual(IntakeChannelProvenance.fileUpload('upload:42').toJSON(), {
    transportChannel: 'FILE_UPLOAD',
    uploadReference: 'upload:42',
  });
});

test('M05S01-05 email attachment provenance', () => {
  assert.deepEqual(IntakeChannelProvenance.emailAttachment('message:42', 'attachment:1').toJSON(), {
    transportChannel: 'EMAIL_ATTACHMENT',
    messageReference: 'message:42',
    attachmentReference: 'attachment:1',
  });
});

test('M05S01-06 share sheet provenance', () => {
  assert.deepEqual(IntakeChannelProvenance.shareSheet('app:files', 'share:42').toJSON(), {
    transportChannel: 'SHARE_SHEET',
    sourceApplicationReference: 'app:files',
    shareReference: 'share:42',
  });
});

test('M05S01-07 url provenance uses opaque governed references', () => {
  assert.deepEqual(IntakeChannelProvenance.url('urlref:42', 'retrieval:42').toJSON(), {
    transportChannel: 'URL',
    sourceUrlReference: 'urlref:42',
    retrievalReference: 'retrieval:42',
  });
});

test('M05S01-08 provider provenance', () => {
  assert.deepEqual(IntakeChannelProvenance.providerAdapter({
    sourceKind: ExternalIntakeSourceKind.PROVIDER,
    adapterReference: 'adapter:provider-a',
    externalRecordReference: 'record:42',
  }).toJSON(), {
    transportChannel: 'PROVIDER_ADAPTER',
    externalSourceKind: 'PROVIDER',
    adapterReference: 'adapter:provider-a',
    externalRecordReference: 'record:42',
  });
});

test('M05S01-09 registry provenance remains provider-neutral', () => {
  const provenance = IntakeChannelProvenance.providerAdapter({
    sourceKind: ExternalIntakeSourceKind.REGISTRY,
    adapterReference: 'adapter:registry-a',
    externalRecordReference: 'registry-record:42',
  });
  assert.equal(provenance.externalSourceKind, ExternalIntakeSourceKind.REGISTRY);
  assert.equal(provenance.transportChannel, IntakeTransportChannel.PROVIDER_ADAPTER);
});

test('M05S01-10 camera maps to FV09 camera source channel', () => {
  assert.equal(submission(IntakeChannelProvenance.camera('capture:42')).record.sourceChannel, IntakeSourceChannel.CAMERA);
});

test('M05S01-11 scan maps to FV09 scan source channel', () => {
  assert.equal(submission(IntakeChannelProvenance.scan('scan:42')).record.sourceChannel, IntakeSourceChannel.SCAN);
});

test('M05S01-12 file maps to FV09 file source channel', () => {
  assert.equal(submission(IntakeChannelProvenance.fileUpload('upload:42')).record.sourceChannel, IntakeSourceChannel.FILE_UPLOAD);
});

test('M05S01-13 email maps to FV09 email source channel', () => {
  assert.equal(submission(IntakeChannelProvenance.emailAttachment('message:42', 'attachment:1')).record.sourceChannel, IntakeSourceChannel.EMAIL_ATTACHMENT);
});

test('M05S01-14 share sheet maps to FV09 share source channel', () => {
  assert.equal(submission(IntakeChannelProvenance.shareSheet('app:files', 'share:42')).record.sourceChannel, IntakeSourceChannel.SHARE_SHEET);
});

test('M05S01-15 url maps to FV09 url source channel', () => {
  assert.equal(submission(IntakeChannelProvenance.url('urlref:42', 'retrieval:42')).record.sourceChannel, IntakeSourceChannel.URL);
});

test('M05S01-16 provider maps to generic FV09 API channel', () => {
  const provider = submission(IntakeChannelProvenance.providerAdapter({
    sourceKind: ExternalIntakeSourceKind.PROVIDER,
    adapterReference: 'adapter:p',
    externalRecordReference: 'record:42',
  }));
  assert.equal(provider.record.sourceChannel, IntakeSourceChannel.API);
  assert.equal(provider.transportChannel, IntakeTransportChannel.PROVIDER_ADAPTER);
});

test('M05S01-17 semantic intake id preserved', () => {
  assert.equal(submission().id.toString(), INTAKE_ID);
});

test('M05S01-18 explicit received-at preserved', () => {
  assert.equal(submission().receivedAt.toString(), '2026-09-17T07:30:00.000Z');
});

test('M05S01-19 receiving actor preserved', () => {
  assert.strictEqual(submission().receivedBy, actor);
});

test('M05S01-20 subject context preserved', () => {
  assert.strictEqual(submission().subject, subject);
});

test('M05S01-21 organization context preserved', () => {
  assert.strictEqual(submission().organization, organization);
});

test('M05S01-22 exact immutable original reference preserved', () => {
  const artifact = original();
  assert.strictEqual(submission(undefined, artifact).originalArtifact, artifact);
});

test('M05S01-23 media metadata preserved', () => {
  const media = submission().media;
  assert.equal(media.mediaType, 'application/pdf');
  assert.equal(media.byteLength, 4096);
  assert.equal(media.originalFileName, 'credential.pdf');
});

test('M05S01-24 security classification preserved', () => {
  assert.equal(submission().securityClassification, IntakeSecurityClassification.CONFIDENTIAL);
});

test('M05S01-25 transport always enters FV09 as received', () => {
  assert.equal(submission().record.processingState, IntakeProcessingState.RECEIVED);
});

test('M05S01-26 transport does not verify original evidence', () => {
  assert.equal(submission().originalArtifact.verificationState.toString(), VerificationStateCode.UNVERIFIED);
});

test('M05S01-27 content hash survives normalization', () => {
  assert.deepEqual(submission().originalArtifact.contentHash?.toJSON(), {
    algorithm: 'SHA-256',
    digest: HASH,
  });
});

test('M05S01-28 submission is immutable', () => {
  assert.equal(Object.isFrozen(submission()), true);
});

test('M05S01-29 provenance is immutable', () => {
  assert.equal(Object.isFrozen(IntakeChannelProvenance.camera('capture:42')), true);
});

test('M05S01-30 canonical projection is deterministic', () => {
  const first = submission(IntakeChannelProvenance.emailAttachment('message:42', 'attachment:1')).toJSON();
  const second = submission(IntakeChannelProvenance.emailAttachment('message:42', 'attachment:1')).toJSON();
  assert.deepEqual(first, second);
});

test('M05S01-31 provenance references are normalized', () => {
  assert.deepEqual(IntakeChannelProvenance.emailAttachment('  message:42  ', '  attachment:1  ').toJSON(), {
    transportChannel: 'EMAIL_ATTACHMENT',
    messageReference: 'message:42',
    attachmentReference: 'attachment:1',
  });
});

test('M05S01-32 empty provenance references fail closed', () => {
  assert.throws(() => IntakeChannelProvenance.fileUpload('   '), TypeError);
});

test('M05S01-33 oversized provenance references fail closed', () => {
  assert.throws(() => IntakeChannelProvenance.camera('x'.repeat(513)), RangeError);
});

test('M05S01-34 control characters fail closed', () => {
  assert.throws(() => IntakeChannelProvenance.scan('scan:42\nforged'), TypeError);
});

test('M05S01-35 external source kind is controlled', () => {
  assert.throws(() => IntakeChannelProvenance.providerAdapter({
    sourceKind: 'TRUSTED_PROVIDER' as typeof ExternalIntakeSourceKind[keyof typeof ExternalIntakeSourceKind],
    adapterReference: 'adapter:p',
    externalRecordReference: 'record:42',
  }), TypeError);
});

test('M05S01-36 email provenance requires both bounded references', () => {
  assert.throws(() => IntakeChannelProvenance.emailAttachment('message:42', '   '), TypeError);
  assert.throws(() => IntakeChannelProvenance.emailAttachment('   ', 'attachment:1'), TypeError);
});

test('M05S01-37 url provenance requires source and retrieval references', () => {
  assert.throws(() => IntakeChannelProvenance.url('urlref:42', '   '), TypeError);
  assert.throws(() => IntakeChannelProvenance.url('   ', 'retrieval:42'), TypeError);
});

test('M05S01-38 provider adapter normalization strips extra status-confidence-trust fields', () => {
  const adapter = {
    adapterReference: '  adapter:registry-a  ',
    normalizeProvenance: (_input: { readonly externalId: string }) => ({
      sourceKind: ExternalIntakeSourceKind.REGISTRY,
      externalRecordReference: '  registry-record:42  ',
      providerStatus: 'ACTIVE',
      confidence: 0.999,
      trust: 'VERIFIED',
    }),
  };
  const provenance = normalizeProviderIntakeProvenance(adapter, { externalId: '42' });
  assert.deepEqual(provenance.toJSON(), {
    transportChannel: 'PROVIDER_ADAPTER',
    externalSourceKind: 'REGISTRY',
    adapterReference: 'adapter:registry-a',
    externalRecordReference: 'registry-record:42',
  });
  assert.equal('providerStatus' in provenance, false);
  assert.equal('confidence' in provenance, false);
  assert.equal('trust' in provenance, false);
});

test('M05S01-39 non-authority and architecture surface stays clean', () => {
  const provider = submission(IntakeChannelProvenance.providerAdapter({
    sourceKind: ExternalIntakeSourceKind.PROVIDER,
    adapterReference: 'adapter:p',
    externalRecordReference: 'record:42',
  }));
  const json = provider.toJSON() as Readonly<Record<string, unknown>>;
  const provenanceJson = provider.provenance.toJSON() as Readonly<Record<string, unknown>>;
  for (const forbidden of ['trust', 'confidence', 'verification', 'eligibility', 'authorization', 'recognition', 'providerStatus']) {
    assert.equal(forbidden in json, false);
    assert.equal(forbidden in provenanceJson, false);
  }

  const source = readFileSync('packages/application/src/intake/multi-channel-intake.ts', 'utf8');
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /from\s+['"](?:react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk)(?:['"/])/i);
  assert.doesNotMatch(source, /\b(?:EligibilityAssessment|RecognitionDecision|AuthorizationGrant)\b/);
});

test('M05S01-40 normalized submission returns the exact FV09 intake record', () => {
  const normalized = submission();
  assert.strictEqual(normalized.toDocumentIntakeRecord(), normalized.record);
  assert.equal(normalized.record.originalArtifact.contentReference, 'object://immutable/m05-s01-original');
  assert.equal(Object.isFrozen(normalized.record), true);
});

void ({} as IntakeProviderAdapterPort<unknown>);
void ({} as ProviderIntakeProvenanceObservation);
