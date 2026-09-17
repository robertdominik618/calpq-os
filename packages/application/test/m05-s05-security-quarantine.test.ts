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
  IntakeProcessingState,
  IntakeSecurityClassification,
  MultiChannelIntakeSubmission,
} from '../src/intake/index.ts';
import {
  ArchiveByteIntegrityObservation,
  OriginalArchiveEntry,
} from '../src/archive/original-document-archive.ts';
import {
  IntakeSecurityAssessment,
  IntakeSecurityControl,
  IntakeSecurityDisposition,
  IntakeSecurityObservation,
  IntakeSecurityObservationOutcome,
  IntakeSecurityObservationReason,
  SecurityControlPolicy,
  SecurityScannerReference,
  normalizeIntakeSecurityScan,
} from '../src/security/index.ts';
import type {
  IntakeSecurityScannerAdapterPort,
  IntakeSecurityScannerObservation,
} from '../src/security/index.ts';

const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079001';
const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079002';
const ORIGINAL_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079003';
const INTAKE_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079004';
const SECOND_ORIGINAL_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079005';
const SECOND_INTAKE_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c079006';
const HASH = 'c'.repeat(64);
const SECOND_HASH = 'd'.repeat(64);

const actor = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);
const organization = OrganizationScopeReference.from('org:m05-s05-owner');

function original(input: {
  readonly id?: string;
  readonly hash?: string;
  readonly acquiredAt?: string;
  readonly contentReference?: string;
} = {}): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(input.id ?? ORIGINAL_ID),
    kind: EvidenceKind.DOCUMENT,
    contentReference: input.contentReference ?? 'object://immutable/m05-s05-original',
    mediaType: 'application/pdf',
    contentHash: ContentHash.sha256(input.hash ?? HASH),
    acquiredAt: UtcInstant.from(input.acquiredAt ?? '2026-09-17T09:00:00Z'),
    acquiredBy: actor,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
}

function submission(input: {
  readonly intakeId?: string;
  readonly artifact?: EvidenceReference;
  readonly receivedAt?: string;
} = {}): MultiChannelIntakeSubmission {
  const intakeId = input.intakeId ?? INTAKE_ID;
  return MultiChannelIntakeSubmission.create({
    id: DocumentIntakeId.from(intakeId),
    provenance: IntakeChannelProvenance.fileUpload(`upload:${intakeId}`),
    receivedAt: UtcInstant.from(input.receivedAt ?? '2026-09-17T09:05:00Z'),
    receivedBy: actor,
    subject,
    organization,
    originalArtifact: input.artifact ?? original(),
    media: IntakeMediaMetadata.create({
      mediaType: 'application/pdf',
      byteLength: 8192,
      originalFileName: 'credential.pdf',
    }),
    securityClassification: IntakeSecurityClassification.CONFIDENTIAL,
  });
}

function archive(input: {
  readonly intake?: MultiChannelIntakeSubmission;
  readonly archivedAt?: string;
  readonly storageObjectReference?: string;
} = {}): OriginalArchiveEntry {
  const intake = input.intake ?? submission();
  return OriginalArchiveEntry.create({
    submission: intake,
    storageObjectReference: input.storageObjectReference ?? 'archive://sha256/cc/m05-s05-original',
    archivedAt: UtcInstant.from(input.archivedAt ?? '2026-09-17T09:10:00Z'),
    encryptionProfileReference: 'encryption:aes256-at-rest-v1',
    accessPolicyReference: 'access:least-privilege-original-v1',
    retentionPolicyReference: 'retention:credential-original-v1',
    integrity: ArchiveByteIntegrityObservation.matched({
      observedContentHash: intake.originalArtifact.contentHash!,
      checkedAt: UtcInstant.from('2026-09-17T09:08:00Z'),
      methodReference: 'integrity:sha256-readback-v1',
    }),
  });
}

function secondArchive(): OriginalArchiveEntry {
  const artifact = original({
    id: SECOND_ORIGINAL_ID,
    hash: SECOND_HASH,
    contentReference: 'object://immutable/m05-s05-second',
  });
  return archive({
    intake: submission({ intakeId: SECOND_INTAKE_ID, artifact }),
    storageObjectReference: 'archive://sha256/dd/m05-s05-second',
  });
}

function scanner(): SecurityScannerReference {
  return SecurityScannerReference.create({
    adapterReference: 'adapter:security:test',
    engineReference: 'engine:content-safety:test',
    engineVersion: '1.2.3',
    configurationReference: 'config:security:v1',
  });
}

function policy(
  requiredControls: readonly IntakeSecurityControl[] = [
    IntakeSecurityControl.CONTENT_TYPE_VALIDATION,
    IntakeSecurityControl.MALWARE_SCAN,
  ],
): SecurityControlPolicy {
  return SecurityControlPolicy.create({
    policyReference: 'policy:intake-security:v1',
    requiredControls,
  });
}

function reasonFor(outcome: IntakeSecurityObservationOutcome): IntakeSecurityObservationReason {
  switch (outcome) {
    case IntakeSecurityObservationOutcome.PASS: return IntakeSecurityObservationReason.CONTROL_PASSED;
    case IntakeSecurityObservationOutcome.SUSPICIOUS: return IntakeSecurityObservationReason.SUSPICIOUS_CONTENT;
    case IntakeSecurityObservationOutcome.UNSUPPORTED: return IntakeSecurityObservationReason.UNSUPPORTED_CONTENT;
    case IntakeSecurityObservationOutcome.MALICIOUS: return IntakeSecurityObservationReason.MALICIOUS_CONTENT;
    case IntakeSecurityObservationOutcome.INDETERMINATE: return IntakeSecurityObservationReason.INDETERMINATE_RESULT;
    case IntakeSecurityObservationOutcome.FAILED: return IntakeSecurityObservationReason.CONTROL_FAILED;
  }
}

function observation(
  entry: OriginalArchiveEntry,
  control: IntakeSecurityControl,
  outcome: IntakeSecurityObservationOutcome = IntakeSecurityObservationOutcome.PASS,
  input: {
    readonly observedAt?: string;
    readonly signalReference?: string | null;
    readonly reason?: IntakeSecurityObservationReason;
  } = {},
): IntakeSecurityObservation {
  return IntakeSecurityObservation.create({
    archiveEntry: entry,
    control,
    outcome,
    reason: input.reason ?? reasonFor(outcome),
    observedAt: UtcInstant.from(input.observedAt ?? '2026-09-17T09:12:00Z'),
    scanner: scanner(),
    ...(input.signalReference === undefined ? {} : { signalReference: input.signalReference }),
  });
}

function twoPass(entry = archive()): readonly IntakeSecurityObservation[] {
  return [
    observation(entry, IntakeSecurityControl.CONTENT_TYPE_VALIDATION),
    observation(entry, IntakeSecurityControl.MALWARE_SCAN),
  ];
}

function assess(input: {
  readonly entry?: OriginalArchiveEntry;
  readonly securityPolicy?: SecurityControlPolicy;
  readonly observations?: readonly IntakeSecurityObservation[];
  readonly evaluatedAt?: string;
} = {}): IntakeSecurityAssessment {
  const entry = input.entry ?? archive();
  return IntakeSecurityAssessment.evaluate({
    archiveEntry: entry,
    policy: input.securityPolicy ?? policy(),
    observations: input.observations ?? twoPass(entry),
    evaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-17T09:15:00Z'),
  });
}

test('M05S05-01 security control vocabulary is exact', () => {
  assert.deepEqual(Object.values(IntakeSecurityControl), [
    'CONTENT_TYPE_VALIDATION',
    'MALWARE_SCAN',
    'CONTENT_SAFETY_SCAN',
    'ACTIVE_CONTENT_SCAN',
    'CONTAINER_STRUCTURE_SCAN',
    'EXTERNAL_CONTENT_SAFETY',
    'EMBEDDED_INSTRUCTION_CONTENT',
  ]);
});

test('M05S05-02 observation outcome vocabulary is exact', () => {
  assert.deepEqual(Object.values(IntakeSecurityObservationOutcome), [
    'PASS', 'SUSPICIOUS', 'UNSUPPORTED', 'MALICIOUS', 'INDETERMINATE', 'FAILED',
  ]);
});

test('M05S05-03 observation reason vocabulary is exact', () => {
  assert.deepEqual(Object.values(IntakeSecurityObservationReason), [
    'CONTROL_PASSED', 'SUSPICIOUS_CONTENT', 'UNSUPPORTED_CONTENT',
    'MALICIOUS_CONTENT', 'INDETERMINATE_RESULT', 'CONTROL_FAILED',
  ]);
});

test('M05S05-04 disposition vocabulary is exact', () => {
  assert.deepEqual(Object.values(IntakeSecurityDisposition), [
    'PROCESSING_ALLOWED', 'QUARANTINED', 'HUMAN_REVIEW_REQUIRED',
  ]);
});

test('M05S05-05 security policy requires at least one control', () => {
  assert.throws(() => policy([]), /at least one control/);
});

test('M05S05-06 security policy rejects duplicate controls', () => {
  assert.throws(() => policy([IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityControl.MALWARE_SCAN]), /duplicate/);
});

test('M05S05-07 security policy rejects uncontrolled controls', () => {
  assert.throws(() => policy(['TRUST_GRANTED' as IntakeSecurityControl]), /controlled/);
});

test('M05S05-08 security policy controls are canonically sorted', () => {
  const value = policy([IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityControl.CONTENT_TYPE_VALIDATION]);
  assert.deepEqual(value.requiredControls, [IntakeSecurityControl.CONTENT_TYPE_VALIDATION, IntakeSecurityControl.MALWARE_SCAN]);
});

test('M05S05-09 security policy is immutable', () => {
  const value = policy();
  assert.equal(Object.isFrozen(value), true);
  assert.equal(Object.isFrozen(value.requiredControls), true);
});

test('M05S05-10 scanner reference normalizes bounded provenance', () => {
  const value = SecurityScannerReference.create({
    adapterReference: ' adapter:test ', engineReference: ' engine:test ', engineVersion: ' 2.0 ', configurationReference: ' config:test ',
  });
  assert.deepEqual(value.toJSON(), {
    adapterReference: 'adapter:test', engineReference: 'engine:test', engineVersion: '2.0', configurationReference: 'config:test',
  });
});

test('M05S05-11 scanner reference rejects empty identity', () => {
  assert.throws(() => SecurityScannerReference.create({
    adapterReference: '', engineReference: 'engine:test', engineVersion: '1', configurationReference: 'config:test',
  }), /must not be empty/);
});

test('M05S05-12 observation preserves exact archive entry object', () => {
  const entry = archive();
  assert.strictEqual(observation(entry, IntakeSecurityControl.MALWARE_SCAN).archiveEntry, entry);
});

test('M05S05-13 observation reason must match outcome', () => {
  const entry = archive();
  assert.throws(() => observation(entry, IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityObservationOutcome.PASS, {
    reason: IntakeSecurityObservationReason.MALICIOUS_CONTENT,
  }), /reason must match outcome/);
});

test('M05S05-14 observation cannot predate intake receipt', () => {
  const entry = archive();
  assert.throws(() => observation(entry, IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityObservationOutcome.PASS, {
    observedAt: '2026-09-17T09:04:59Z',
  }), /must not predate intake receipt/);
});

test('M05S05-15 observation signal reference defaults to null', () => {
  assert.equal(observation(archive(), IntakeSecurityControl.MALWARE_SCAN).signalReference, null);
});

test('M05S05-16 observation signal reference is normalized', () => {
  assert.equal(observation(archive(), IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityObservationOutcome.PASS, {
    signalReference: ' scan:event:42 ',
  }).signalReference, 'scan:event:42');
});

test('M05S05-17 observation signal reference rejects control characters', () => {
  assert.throws(() => observation(archive(), IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityObservationOutcome.PASS, {
    signalReference: 'scan\nsecret',
  }), /control characters/);
});

test('M05S05-18 observation is immutable', () => {
  const value = observation(archive(), IntakeSecurityControl.MALWARE_SCAN);
  assert.equal(Object.isFrozen(value), true);
  assert.equal(Object.isFrozen(value.scanner), true);
});

test('M05S05-19 observation audit JSON uses references not content body', () => {
  const json = observation(archive(), IntakeSecurityControl.MALWARE_SCAN).toJSON();
  assert.equal(json.intakeId, INTAKE_ID);
  assert.equal(json.originalEvidenceId, ORIGINAL_ID);
  assert.equal('documentBody' in json, false);
});

test('M05S05-20 all required PASS observations allow processing', () => {
  assert.equal(assess().disposition, IntakeSecurityDisposition.PROCESSING_ALLOWED);
});

test('M05S05-21 allowed assessment can proceed to derived processing', () => {
  assert.equal(assess().canProceedToDerivedProcessing, true);
});

test('M05S05-22 allowed assessment projects to DERIVATION_PENDING', () => {
  assert.equal(assess().toProcessingState(), IntakeProcessingState.DERIVATION_PENDING);
});

test('M05S05-23 malicious observation quarantines', () => {
  const entry = archive();
  const observations = [
    observation(entry, IntakeSecurityControl.CONTENT_TYPE_VALIDATION),
    observation(entry, IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityObservationOutcome.MALICIOUS),
  ];
  assert.equal(assess({ entry, observations }).disposition, IntakeSecurityDisposition.QUARANTINED);
});

test('M05S05-24 embedded suspicious instruction content quarantines', () => {
  const entry = archive();
  const securityPolicy = policy([IntakeSecurityControl.EMBEDDED_INSTRUCTION_CONTENT]);
  const observations = [observation(entry, IntakeSecurityControl.EMBEDDED_INSTRUCTION_CONTENT, IntakeSecurityObservationOutcome.SUSPICIOUS)];
  assert.equal(assess({ entry, securityPolicy, observations }).disposition, IntakeSecurityDisposition.QUARANTINED);
});

test('M05S05-25 unsupported content quarantines', () => {
  const entry = archive();
  const securityPolicy = policy([IntakeSecurityControl.CONTENT_TYPE_VALIDATION]);
  const observations = [observation(entry, IntakeSecurityControl.CONTENT_TYPE_VALIDATION, IntakeSecurityObservationOutcome.UNSUPPORTED)];
  assert.equal(assess({ entry, securityPolicy, observations }).disposition, IntakeSecurityDisposition.QUARANTINED);
});

test('M05S05-26 quarantine has priority over failed control', () => {
  const entry = archive();
  const observations = [
    observation(entry, IntakeSecurityControl.CONTENT_TYPE_VALIDATION, IntakeSecurityObservationOutcome.FAILED),
    observation(entry, IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityObservationOutcome.MALICIOUS),
  ];
  assert.equal(assess({ entry, observations }).disposition, IntakeSecurityDisposition.QUARANTINED);
});

test('M05S05-27 external-content control failure requires review', () => {
  const entry = archive();
  const securityPolicy = policy([IntakeSecurityControl.EXTERNAL_CONTENT_SAFETY]);
  const observations = [observation(entry, IntakeSecurityControl.EXTERNAL_CONTENT_SAFETY, IntakeSecurityObservationOutcome.FAILED)];
  assert.equal(assess({ entry, securityPolicy, observations }).disposition, IntakeSecurityDisposition.HUMAN_REVIEW_REQUIRED);
});

test('M05S05-28 indeterminate scanner result requires review', () => {
  const entry = archive();
  const observations = [
    observation(entry, IntakeSecurityControl.CONTENT_TYPE_VALIDATION),
    observation(entry, IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityObservationOutcome.INDETERMINATE),
  ];
  assert.equal(assess({ entry, observations }).disposition, IntakeSecurityDisposition.HUMAN_REVIEW_REQUIRED);
});

test('M05S05-29 missing required control requires review', () => {
  const entry = archive();
  const observations = [observation(entry, IntakeSecurityControl.CONTENT_TYPE_VALIDATION)];
  assert.equal(assess({ entry, observations }).disposition, IntakeSecurityDisposition.HUMAN_REVIEW_REQUIRED);
});

test('M05S05-30 empty observations fail closed to review', () => {
  const entry = archive();
  assert.equal(assess({ entry, observations: [] }).disposition, IntakeSecurityDisposition.HUMAN_REVIEW_REQUIRED);
});

test('M05S05-31 review assessment cannot proceed to derived processing', () => {
  const entry = archive();
  assert.equal(assess({ entry, observations: [] }).canProceedToDerivedProcessing, false);
});

test('M05S05-32 quarantine/review projects to REVIEW_REQUIRED', () => {
  const entry = archive();
  assert.equal(assess({ entry, observations: [] }).toProcessingState(), IntakeProcessingState.REVIEW_REQUIRED);
});

test('M05S05-33 duplicate control observations fail closed', () => {
  const entry = archive();
  const observations = [
    observation(entry, IntakeSecurityControl.MALWARE_SCAN),
    observation(entry, IntakeSecurityControl.MALWARE_SCAN),
  ];
  assert.throws(() => assess({ entry, observations }), /duplicate control/);
});

test('M05S05-34 observation must bind exact assessed archive object', () => {
  const entry = archive();
  const other = secondArchive();
  assert.throws(() => assess({ entry, observations: [observation(other, IntakeSecurityControl.MALWARE_SCAN)] }), /exact assessed archive entry/);
});

test('M05S05-35 assessment cannot predate intake receipt', () => {
  const entry = archive();
  assert.throws(() => assess({ entry, observations: [], evaluatedAt: '2026-09-17T09:04:59Z' }), /must not predate intake receipt/);
});

test('M05S05-36 assessment cannot predate included observation', () => {
  const entry = archive();
  const observations = [observation(entry, IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityObservationOutcome.PASS, { observedAt: '2026-09-17T09:16:00Z' })];
  assert.throws(() => assess({ entry, observations, evaluatedAt: '2026-09-17T09:15:00Z' }), /cannot predate an included observation/);
});

test('M05S05-37 observations are canonically ordered', () => {
  const entry = archive();
  const value = assess({ entry, observations: [
    observation(entry, IntakeSecurityControl.MALWARE_SCAN),
    observation(entry, IntakeSecurityControl.CONTENT_TYPE_VALIDATION),
  ] });
  assert.deepEqual(value.observations.map((item) => item.control), [
    IntakeSecurityControl.CONTENT_TYPE_VALIDATION,
    IntakeSecurityControl.MALWARE_SCAN,
  ]);
});

test('M05S05-38 missing controls retain canonical policy order', () => {
  const entry = archive();
  const securityPolicy = policy([IntakeSecurityControl.MALWARE_SCAN, IntakeSecurityControl.ACTIVE_CONTENT_SCAN]);
  const value = assess({ entry, securityPolicy, observations: [] });
  assert.deepEqual(value.missingRequiredControls, [IntakeSecurityControl.ACTIVE_CONTENT_SCAN, IntakeSecurityControl.MALWARE_SCAN]);
});

test('M05S05-39 assessment object is immutable', () => {
  assert.equal(Object.isFrozen(assess()), true);
});

test('M05S05-40 assessment observation array is immutable', () => {
  assert.equal(Object.isFrozen(assess().observations), true);
});

test('M05S05-41 missing-required-controls array is immutable', () => {
  const entry = archive();
  assert.equal(Object.isFrozen(assess({ entry, observations: [] }).missingRequiredControls), true);
});

test('M05S05-42 assessment does not mutate original evidence', () => {
  const entry = archive();
  const before = JSON.stringify(entry.originalArtifact.toJSON());
  assess({ entry, observations: twoPass(entry) });
  assert.equal(JSON.stringify(entry.originalArtifact.toJSON()), before);
});

test('M05S05-43 security PASS does not promote verification', () => {
  const value = assess();
  assert.equal(value.archiveEntry.originalArtifact.verificationState.toString(), VerificationStateCode.UNVERIFIED);
  assert.equal(value.toJSON().originalVerificationState, VerificationStateCode.UNVERIFIED);
});

test('M05S05-44 assessment preserves exact immutable archive object', () => {
  const entry = archive();
  assert.strictEqual(assess({ entry, observations: twoPass(entry) }).archiveEntry, entry);
});

test('M05S05-45 adapter normalization preserves scanner provenance', () => {
  const entry = archive();
  const adapter: IntakeSecurityScannerAdapterPort = {
    adapterReference: 'adapter:test:normalized',
    engineReference: 'engine:test:normalized',
    engineVersion: '9.1',
    configurationReference: 'config:test:normalized',
    scan: () => ({
      outcome: IntakeSecurityObservationOutcome.PASS,
      reason: IntakeSecurityObservationReason.CONTROL_PASSED,
      observedAt: UtcInstant.from('2026-09-17T09:12:00Z'),
    }),
  };
  const value = normalizeIntakeSecurityScan(adapter, { archiveEntry: entry, control: IntakeSecurityControl.MALWARE_SCAN });
  assert.deepEqual(value.scanner.toJSON(), {
    adapterReference: 'adapter:test:normalized', engineReference: 'engine:test:normalized', engineVersion: '9.1', configurationReference: 'config:test:normalized',
  });
});

test('M05S05-46 adapter receives exact archive and requested control', () => {
  const entry = archive();
  let seenArchive: OriginalArchiveEntry | null = null;
  let seenControl: IntakeSecurityControl | null = null;
  const adapter: IntakeSecurityScannerAdapterPort = {
    adapterReference: 'adapter:test', engineReference: 'engine:test', engineVersion: '1', configurationReference: 'config:test',
    scan: (request): IntakeSecurityScannerObservation => {
      seenArchive = request.archiveEntry;
      seenControl = request.control;
      return { outcome: IntakeSecurityObservationOutcome.PASS, reason: IntakeSecurityObservationReason.CONTROL_PASSED, observedAt: UtcInstant.from('2026-09-17T09:12:00Z') };
    },
  };
  normalizeIntakeSecurityScan(adapter, { archiveEntry: entry, control: IntakeSecurityControl.CONTENT_TYPE_VALIDATION });
  assert.strictEqual(seenArchive, entry);
  assert.equal(seenControl, IntakeSecurityControl.CONTENT_TYPE_VALIDATION);
});

test('M05S05-47 adapter without scan fails closed', () => {
  const entry = archive();
  const adapter = {
    adapterReference: 'adapter:test', engineReference: 'engine:test', engineVersion: '1', configurationReference: 'config:test',
  } as unknown as IntakeSecurityScannerAdapterPort;
  assert.throws(() => normalizeIntakeSecurityScan(adapter, { archiveEntry: entry, control: IntakeSecurityControl.MALWARE_SCAN }), /must implement scan/);
});

test('M05S05-48 adapter returning invalid observation fails closed', () => {
  const entry = archive();
  const adapter = {
    adapterReference: 'adapter:test', engineReference: 'engine:test', engineVersion: '1', configurationReference: 'config:test',
    scan: () => null,
  } as unknown as IntakeSecurityScannerAdapterPort;
  assert.throws(() => normalizeIntakeSecurityScan(adapter, { archiveEntry: entry, control: IntakeSecurityControl.MALWARE_SCAN }), /must return an observation/);
});

test('M05S05-49 canonical assessment serialization is deterministic', () => {
  const entry = archive();
  const left = assess({ entry, observations: twoPass(entry) });
  const right = assess({ entry, observations: [...twoPass(entry)].reverse() });
  assert.equal(JSON.stringify(left.toJSON()), JSON.stringify(right.toJSON()));
});

test('M05S05-50 source exposes no trust verification authority or raw content fields', () => {
  const source = readFileSync(new URL('../src/security/intake-security-quarantine.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /AuthorizationGrant|EligibilityAssessment|RecognitionDecision|TrustEntity|VerificationState\.from|EvidenceReference\.(original|derived)/);
  assert.doesNotMatch(source, /documentBody|extractedSecret|rawContent|instructionText|toolCall|executeInstruction/);
});
