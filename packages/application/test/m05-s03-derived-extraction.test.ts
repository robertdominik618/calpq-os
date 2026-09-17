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
import { OrganizationScopeReference } from '../src/index.ts';
import {
  DocumentIntakeId,
  IntakeChannelProvenance,
  IntakeMediaMetadata,
  IntakeSecurityClassification,
  MultiChannelIntakeSubmission,
} from '../src/intake/index.ts';
import {
  ArchiveByteIntegrityObservation,
  OriginalArchiveEntry,
} from '../src/archive/index.ts';
import {
  DerivedExtractionProposalRecord,
  ExtractionConfidence,
  ExtractionFieldProposal,
  ExtractionProcessorKind,
  ExtractionProcessorReference,
} from '../src/extraction/derived-extraction-proposal.ts';

const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079001';
const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079002';
const ORIGINAL_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079003';
const INTAKE_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079004';
const DERIVED_A_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079005';
const DERIVED_B_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079006';
const DERIVED_C_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079007';
const ORIGINAL_HASH = 'a'.repeat(64);
const DERIVED_HASH = 'c'.repeat(64);

const actor = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);
const organization = OrganizationScopeReference.from('org:m05-s03-owner');

function original(): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(ORIGINAL_ID),
    kind: EvidenceKind.DOCUMENT,
    contentReference: 'object://immutable/m05-s03-original',
    mediaType: 'application/pdf',
    contentHash: ContentHash.sha256(ORIGINAL_HASH),
    acquiredAt: UtcInstant.from('2026-09-17T08:00:00Z'),
    acquiredBy: actor,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
}

function archive(): OriginalArchiveEntry {
  const artifact = original();
  const submission = MultiChannelIntakeSubmission.create({
    id: DocumentIntakeId.from(INTAKE_ID),
    provenance: IntakeChannelProvenance.fileUpload(`upload:${INTAKE_ID}`),
    receivedAt: UtcInstant.from('2026-09-17T08:05:00Z'),
    receivedBy: actor,
    subject,
    organization,
    originalArtifact: artifact,
    media: IntakeMediaMetadata.create({
      mediaType: 'application/pdf',
      byteLength: 4096,
      originalFileName: 'credential.pdf',
    }),
    securityClassification: IntakeSecurityClassification.CONFIDENTIAL,
  });
  return OriginalArchiveEntry.create({
    submission,
    storageObjectReference: 'archive://sha256/aa/m05-s03-original',
    archivedAt: UtcInstant.from('2026-09-17T08:10:00Z'),
    encryptionProfileReference: 'encryption:aes256-at-rest-v1',
    accessPolicyReference: 'access:subject-owner-v1',
    retentionPolicyReference: 'retention:credential-original-v1',
    integrity: ArchiveByteIntegrityObservation.matched({
      observedContentHash: ContentHash.sha256(ORIGINAL_HASH),
      checkedAt: UtcInstant.from('2026-09-17T08:08:00Z'),
      methodReference: 'integrity:sha256-readback-v1',
    }),
  });
}

function processor(
  kind: typeof ExtractionProcessorKind[keyof typeof ExtractionProcessorKind] = ExtractionProcessorKind.OCR_ENGINE,
): ExtractionProcessorReference {
  return ExtractionProcessorReference.create({
    kind,
    processorReference: 'processor:document-extraction',
    processorVersion: '2026.09.17',
    configurationReference: 'config:credential-fields-v1',
  });
}

function field(input: {
  readonly fieldPath?: string;
  readonly proposedValue?: string | number | boolean | null;
  readonly sourceLocator?: string | null;
  readonly confidence?: ExtractionConfidence | null;
} = {}): ExtractionFieldProposal {
  return ExtractionFieldProposal.create({
    fieldPath: input.fieldPath ?? 'credential.number',
    proposedValue: input.proposedValue === undefined ? 'ABC-123' : input.proposedValue,
    sourceLocator: input.sourceLocator === undefined ? 'page:1,bbox:10,20,30,40' : input.sourceLocator,
    confidence: input.confidence === undefined ? ExtractionConfidence.from(0.91) : input.confidence,
  });
}

function derivedEvidence(input: {
  readonly id?: string;
  readonly parentId?: string;
  readonly kind?: typeof EvidenceKind[keyof typeof EvidenceKind];
  readonly acquiredAt?: string;
  readonly verificationState?: typeof VerificationStateCode[keyof typeof VerificationStateCode];
} = {}): EvidenceReference {
  const kind = input.kind ?? EvidenceKind.EXTRACTED_METADATA;
  const mediaType = kind === EvidenceKind.OCR_TEXT || kind === EvidenceKind.AI_SUMMARY
    ? 'text/plain'
    : 'application/json';
  return EvidenceReference.derived({
    id: EvidenceId.from(input.id ?? DERIVED_A_ID),
    kind,
    contentReference: `derived://m05-s03/${input.id ?? DERIVED_A_ID}`,
    mediaType,
    contentHash: ContentHash.sha256(DERIVED_HASH),
    acquiredAt: UtcInstant.from(input.acquiredAt ?? '2026-09-17T08:20:00Z'),
    acquiredBy: actor,
    derivationParent: EvidenceId.from(input.parentId ?? ORIGINAL_ID),
    verificationState: VerificationState.from(input.verificationState ?? VerificationStateCode.UNVERIFIED),
  });
}

function record(input: {
  readonly evidence?: EvidenceReference;
  readonly parent?: OriginalArchiveEntry | DerivedExtractionProposalRecord;
  readonly processor?: ExtractionProcessorReference;
  readonly proposals?: readonly ExtractionFieldProposal[];
} = {}): DerivedExtractionProposalRecord {
  return DerivedExtractionProposalRecord.create({
    derivedEvidence: input.evidence ?? derivedEvidence(),
    parent: input.parent ?? archive(),
    processor: input.processor ?? processor(),
    proposals: input.proposals ?? [field()],
  });
}

function firstDerived(): DerivedExtractionProposalRecord {
  return record();
}

function secondDerived(input: {
  readonly id?: string;
  readonly parent?: DerivedExtractionProposalRecord;
  readonly acquiredAt?: string;
  readonly verificationState?: typeof VerificationStateCode[keyof typeof VerificationStateCode];
} = {}): DerivedExtractionProposalRecord {
  const parent = input.parent ?? firstDerived();
  return record({
    parent,
    evidence: derivedEvidence({
      id: input.id ?? DERIVED_B_ID,
      parentId: parent.derivedEvidence.id.toString(),
      acquiredAt: input.acquiredAt ?? '2026-09-17T08:30:00Z',
      verificationState: input.verificationState,
      kind: EvidenceKind.NORMALIZED_FIELDS,
    }),
    processor: processor(ExtractionProcessorKind.NORMALIZER),
    proposals: [field({ fieldPath: 'credential.number.normalized', proposedValue: 'ABC123' })],
  });
}

test('M05S03-01 controlled processor vocabulary', () => {
  assert.deepEqual(Object.values(ExtractionProcessorKind), [
    'OCR_ENGINE',
    'STRUCTURED_PARSER',
    'NORMALIZER',
    'CLASSIFIER',
    'AI_ASSISTED',
    'OTHER',
  ]);
});

test('M05S03-02 processor reference and version are normalized', () => {
  const value = ExtractionProcessorReference.create({
    kind: ExtractionProcessorKind.STRUCTURED_PARSER,
    processorReference: '  processor:parser  ',
    processorVersion: '  2.1.0  ',
  });
  assert.equal(value.processorReference, 'processor:parser');
  assert.equal(value.processorVersion, '2.1.0');
});

test('M05S03-03 processor configuration is optional', () => {
  const value = ExtractionProcessorReference.create({
    kind: ExtractionProcessorKind.OTHER,
    processorReference: 'processor:other',
    processorVersion: '1',
  });
  assert.equal(value.configurationReference, null);
});

test('M05S03-04 uncontrolled processor kind fails closed', () => {
  assert.throws(() => ExtractionProcessorReference.create({
    kind: 'AUTO_VERIFIER' as unknown as typeof ExtractionProcessorKind.OTHER,
    processorReference: 'processor:bad',
    processorVersion: '1',
  }), TypeError);
});

test('M05S03-05 confidence accepts zero', () => {
  assert.equal(ExtractionConfidence.from(0).value, 0);
});

test('M05S03-06 confidence accepts one', () => {
  assert.equal(ExtractionConfidence.from(1).value, 1);
});

test('M05S03-07 confidence outside zero-to-one fails closed', () => {
  assert.throws(() => ExtractionConfidence.from(-0.01), RangeError);
  assert.throws(() => ExtractionConfidence.from(1.01), RangeError);
});

test('M05S03-08 non-finite confidence fails closed', () => {
  assert.throws(() => ExtractionConfidence.from(Number.NaN), TypeError);
  assert.throws(() => ExtractionConfidence.from(Number.POSITIVE_INFINITY), TypeError);
});

test('M05S03-09 field path is normalized', () => {
  assert.equal(field({ fieldPath: '  credential.issuedOn  ' }).fieldPath, 'credential.issuedOn');
});

test('M05S03-10 string proposal value is preserved exactly', () => {
  assert.equal(field({ proposedValue: 'CZ-987' }).proposedValue, 'CZ-987');
});

test('M05S03-11 finite numeric proposal value is preserved', () => {
  assert.equal(field({ proposedValue: 2026 }).proposedValue, 2026);
  assert.throws(() => field({ proposedValue: Number.NaN }), TypeError);
});

test('M05S03-12 boolean and null proposal values are supported', () => {
  assert.equal(field({ proposedValue: true }).proposedValue, true);
  assert.equal(field({ proposedValue: null }).proposedValue, null);
});

test('M05S03-13 source locator may be absent or explicit', () => {
  assert.equal(field({ sourceLocator: null }).sourceLocator, null);
  assert.equal(field({ sourceLocator: 'page:2' }).sourceLocator, 'page:2');
});

test('M05S03-14 field proposal preserves exact confidence object', () => {
  const confidence = ExtractionConfidence.from(0.77);
  assert.strictEqual(field({ confidence }).confidence, confidence);
});

test('M05S03-15 oversized proposed text fails closed', () => {
  assert.throws(() => field({ proposedValue: 'x'.repeat(4097) }), RangeError);
});

test('M05S03-16 control characters in proposal references fail closed', () => {
  assert.throws(() => field({ fieldPath: 'credential.number\nforged' }), TypeError);
  assert.throws(() => field({ sourceLocator: 'page:1\nforged' }), TypeError);
});

test('M05S03-17 immutable S02 original archive is accepted as lineage root', () => {
  const root = archive();
  assert.strictEqual(record({ parent: root }).rootOriginalArchiveEntry, root);
});

test('M05S03-18 direct parent object is preserved exactly', () => {
  const root = archive();
  assert.strictEqual(record({ parent: root }).parent, root);
});

test('M05S03-19 original evidence cannot masquerade as a derived proposal', () => {
  assert.throws(() => record({ evidence: original() }), TypeError);
});

test('M05S03-20 direct derivation parent ID must match exactly', () => {
  const value = record();
  assert.equal(value.derivedEvidence.derivationParent?.toString(), ORIGINAL_ID);
});

test('M05S03-21 mismatched direct parent ID fails closed', () => {
  assert.throws(() => record({
    evidence: derivedEvidence({ parentId: DERIVED_C_ID }),
  }), TypeError);
});

test('M05S03-22 derived-on-derived lineage is supported', () => {
  const parent = firstDerived();
  const child = secondDerived({ parent });
  assert.strictEqual(child.parent, parent);
});

test('M05S03-23 multi-hop lineage is ordered root to current', () => {
  const child = secondDerived();
  assert.deepEqual(child.lineageEvidenceIds.map((id) => id.toString()), [
    ORIGINAL_ID,
    DERIVED_A_ID,
    DERIVED_B_ID,
  ]);
});

test('M05S03-24 root original remains exact across multiple derivations', () => {
  const parent = firstDerived();
  const child = secondDerived({ parent });
  assert.strictEqual(child.rootOriginalArchiveEntry, parent.rootOriginalArchiveEntry);
});

test('M05S03-25 repeated evidence ID in lineage fails closed', () => {
  const parent = firstDerived();
  assert.throws(() => secondDerived({ id: DERIVED_A_ID, parent }), TypeError);
});

test('M05S03-26 direct derivation from original cannot predate archive snapshot', () => {
  assert.throws(() => record({
    evidence: derivedEvidence({ acquiredAt: '2026-09-17T08:09:59Z' }),
  }), RangeError);
});

test('M05S03-27 derived-on-derived child cannot predate its parent', () => {
  const parent = firstDerived();
  assert.throws(() => secondDerived({
    parent,
    acquiredAt: '2026-09-17T08:19:59Z',
  }), RangeError);
});

test('M05S03-28 UNVERIFIED derived state is preserved', () => {
  assert.equal(record().derivedEvidence.verificationState.toString(), VerificationStateCode.UNVERIFIED);
});

test('M05S03-29 REVIEW_REQUIRED derived state is preserved', () => {
  const value = record({
    evidence: derivedEvidence({ verificationState: VerificationStateCode.REVIEW_REQUIRED }),
  });
  assert.equal(value.derivedEvidence.verificationState.toString(), VerificationStateCode.REVIEW_REQUIRED);
});

test('M05S03-30 Core rejects extraction evidence created directly as VERIFIED', () => {
  assert.throws(() => derivedEvidence({ verificationState: VerificationStateCode.VERIFIED }), TypeError);
});

test('M05S03-31 confidence metadata does not change verification state', () => {
  const value = record({
    proposals: [field({ confidence: ExtractionConfidence.from(1) })],
  });
  assert.equal(value.derivedEvidence.verificationState.toString(), VerificationStateCode.UNVERIFIED);
});

test('M05S03-32 record preserves exact derived EvidenceReference object', () => {
  const evidence = derivedEvidence();
  assert.strictEqual(record({ evidence }).derivedEvidence, evidence);
});

test('M05S03-33 creating a proposal does not mutate the S02 original archive', () => {
  const root = archive();
  const before = root.toJSON();
  record({ parent: root });
  assert.deepEqual(root.toJSON(), before);
});

test('M05S03-34 creating a child does not mutate its derived parent record', () => {
  const parent = firstDerived();
  const before = parent.toJSON();
  secondDerived({ parent });
  assert.deepEqual(parent.toJSON(), before);
});

test('M05S03-35 proposal record is immutable', () => {
  assert.equal(Object.isFrozen(record()), true);
});

test('M05S03-36 processor reference is immutable', () => {
  assert.equal(Object.isFrozen(processor()), true);
});

test('M05S03-37 field proposal and confidence are immutable', () => {
  const confidence = ExtractionConfidence.from(0.5);
  const item = field({ confidence });
  assert.equal(Object.isFrozen(item), true);
  assert.equal(Object.isFrozen(confidence), true);
});

test('M05S03-38 proposal collection is immutable', () => {
  assert.equal(Object.isFrozen(record().proposals), true);
});

test('M05S03-39 lineage collection is immutable', () => {
  assert.equal(Object.isFrozen(secondDerived().lineageEvidenceIds), true);
});

test('M05S03-40 proposal ordering is canonical and input-order independent', () => {
  const a = field({ fieldPath: 'b', proposedValue: '2' });
  const b = field({ fieldPath: 'a', proposedValue: '1' });
  const first = record({ proposals: [a, b] });
  const second = record({ proposals: [b, a] });
  assert.deepEqual(first.toJSON().proposals, second.toJSON().proposals);
  assert.deepEqual(first.proposals.map((item) => item.fieldPath), ['a', 'b']);
});

test('M05S03-41 canonical serialization is deterministic', () => {
  assert.deepEqual(record().toJSON(), record().toJSON());
});

test('M05S03-42 empty proposal items are allowed for artifact-level OCR or summaries', () => {
  const value = record({
    evidence: derivedEvidence({ kind: EvidenceKind.OCR_TEXT }),
    proposals: [],
  });
  assert.deepEqual(value.proposals, []);
});

test('M05S03-43 creating another derived record never overwrites the previous record', () => {
  const first = firstDerived();
  const firstSnapshot = first.toJSON();
  const second = secondDerived({ parent: first });
  assert.notEqual(second.derivedEvidence.id.toString(), first.derivedEvidence.id.toString());
  assert.deepEqual(first.toJSON(), firstSnapshot);
});

test('M05S03-44 extraction record exposes no reviewer correction disposition', () => {
  const value = record() as unknown as Record<string, unknown>;
  assert.equal('accepted' in value, false);
  assert.equal('rejected' in value, false);
  assert.equal('correctedBy' in value, false);
  assert.equal('reviewDecision' in value, false);
});

test('M05S03-45 extraction record exposes no verification, eligibility or authorization authority', () => {
  const value = record() as unknown as Record<string, unknown>;
  assert.equal('verificationDecision' in value, false);
  assert.equal('eligibilityAssessment' in value, false);
  assert.equal('authorizationGrant' in value, false);
});

test('M05S03-46 S03 source contains no later-slice authority, provider SDK or ambient time/randomness', () => {
  const source = readFileSync(new URL('../src/extraction/derived-extraction-proposal.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(|crypto\.randomUUID\(/);
  assert.doesNotMatch(source, /from ['"](openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk|@google-cloud\/storage|@azure\/storage-blob)/);
  assert.doesNotMatch(source, /\b(EligibilityAssessment|RecognitionDecision|AuthorizationGrant|IntakeCorrectionRecord|VerificationProviderPort)\b/);
  assert.doesNotMatch(source, /EvidenceReference\.derived\s*\(|VerificationState\.from\s*\(/);
});
