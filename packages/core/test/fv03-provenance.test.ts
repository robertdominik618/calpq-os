import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

import {
  ActorId,
  ActorKind,
  ActorReference,
  ContentHash,
  CoreError,
  CoreErrorFamily,
  DateOnly,
  DecisionId,
  DomainEvaluationResult,
  DomainOutcome,
  EvidenceClass,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  Jurisdiction,
  ProvenanceEnvelope,
  ReasonCode,
  Revision,
  RuleSetId,
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
  source: '018f22e2-79b0-7cc3-98c4-dc0c0c073981',
  original: '018f22e2-79b0-7cc3-98c4-dc0c0c073982',
  derived: '018f22e2-79b0-7cc3-98c4-dc0c0c073983',
  decision: '018f22e2-79b0-7cc3-98c4-dc0c0c073984',
  rules: '018f22e2-79b0-7cc3-98c4-dc0c0c073985',
  authority: '018f22e2-79b0-7cc3-98c4-dc0c0c073986',
  process: '018f22e2-79b0-7cc3-98c4-dc0c0c073987',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c073988',
} as const;

const instant = UtcInstant.from('2026-09-15T05:00:00Z');
const authority = ActorReference.create(ActorId.from(IDS.authority), ActorKind.EXTERNAL_AUTHORITY);
const processActor = ActorReference.create(ActorId.from(IDS.process), ActorKind.SYSTEM_PROCESS);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);

function source(version = 'registry-2026.1'): SourceReference {
  return SourceReference.create({
    id: SourceId.from(IDS.source),
    authority,
    jurisdiction: Jurisdiction.fromCode('CZ'),
    sourceType: SourceType.REGISTRY,
    canonicalLocator: 'urn:calpq:test:registry',
    version: VersionId.from(version),
    publicationDate: DateOnly.from('2026-01-01'),
    effectiveFrom: DateOnly.from('2026-01-01'),
    effectiveTo: DateOnly.from('2026-12-31'),
    retrievedAt: instant,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256('a'.repeat(64)),
  });
}

function originalEvidence(src = source()): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(IDS.original),
    kind: EvidenceKind.REGISTRY_RESPONSE,
    contentReference: 'urn:calpq:evidence:original:1',
    mediaType: 'application/json',
    contentHash: ContentHash.sha256('b'.repeat(64)),
    acquiredAt: instant,
    acquiredBy: processActor,
    source: src,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
}

function derivedEvidence(parent: EvidenceReference): EvidenceReference {
  return EvidenceReference.derived({
    id: EvidenceId.from(IDS.derived),
    kind: EvidenceKind.OCR_TEXT,
    contentReference: 'urn:calpq:evidence:derived:1',
    mediaType: 'text/plain',
    acquiredAt: instant,
    acquiredBy: processActor,
    source: parent.source,
    derivationParent: parent.id,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
}

function provenance(src = source(), evidence = originalEvidence(src)): ProvenanceEnvelope {
  return ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.decision),
    evaluatedAt: instant,
    actor: processActor,
    subject,
    ruleSetId: RuleSetId.from(IDS.rules),
    ruleVersion: VersionId.from('rules-1.0'),
    sources: [src],
    evidence: [evidence],
    priorRevision: Revision.from(3),
    resultingRevision: Revision.from(4),
  });
}

function result(outcome: DomainOutcome, code: string): DomainEvaluationResult {
  return DomainEvaluationResult.create({
    outcome,
    reasonCodes: [ReasonCode.from(code)],
    provenance: provenance(),
  });
}

test('FV03-01 source-version', () => {
  assert.equal(source('registry-2026.2').version.toString(), 'registry-2026.2');
});

test('FV03-02 source-jurisdiction', () => {
  assert.equal(source().jurisdiction.toString(), 'CZ');
});

test('FV03-03 source-effective-date', () => {
  const src = source();
  assert.equal(src.effectiveFrom?.toString(), '2026-01-01');
  assert.equal(src.effectiveTo?.toString(), '2026-12-31');
  assert.throws(() => SourceReference.create({
    id: SourceId.from(IDS.source), authority, jurisdiction: Jurisdiction.fromCode('CZ'),
    sourceType: SourceType.REGISTRY, version: VersionId.from('bad-range'), retrievedAt: instant,
    effectiveFrom: DateOnly.from('2026-12-31'), effectiveTo: DateOnly.from('2026-01-01'),
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  }), RangeError);
});

test('FV03-04 original-derived-separation', () => {
  const original = originalEvidence();
  const derived = derivedEvidence(original);
  assert.equal(original.evidenceClass, EvidenceClass.ORIGINAL);
  assert.equal(derived.evidenceClass, EvidenceClass.DERIVED);
  assert.notEqual(original.id.toString(), derived.id.toString());
});

test('FV03-05 derivation-parent', () => {
  const original = originalEvidence();
  assert.equal(derivedEvidence(original).derivationParent?.toString(), original.id.toString());
});

test('FV03-06 original-preservation', () => {
  const original = originalEvidence();
  const before = original.contentReference;
  derivedEvidence(original);
  assert.equal(Object.isFrozen(original), true);
  assert.equal(original.contentReference, before);
  assert.equal(original.derivationParent, null);
});

test('FV03-07 evidence-integrity', () => {
  assert.equal(ContentHash.sha256('A'.repeat(64)).toString(), `sha256:${'a'.repeat(64)}`);
  assert.throws(() => ContentHash.sha256('not-a-hash'), TypeError);
  assert.equal(originalEvidence().contentHash?.toString(), `sha256:${'b'.repeat(64)}`);
});

test('FV03-08 actor-provenance', () => {
  assert.equal(provenance().actor.id.toString(), IDS.process);
});

test('FV03-09 subject-provenance', () => {
  assert.equal(provenance().subject?.id.toString(), IDS.subject);
});

test('FV03-10 evidence-provenance', () => {
  const evidence = originalEvidence();
  const envelope = provenance(evidence.source ?? source(), evidence);
  assert.equal(envelope.evidence.length, 1);
  assert.strictEqual(envelope.evidence[0], evidence);
});

test('FV03-11 historical-provenance', () => {
  const historicalSource = source('registry-2026.1');
  const envelope = provenance(historicalSource, originalEvidence(historicalSource));
  const laterSource = source('registry-2026.2');
  assert.equal(laterSource.version.toString(), 'registry-2026.2');
  assert.equal(envelope.sources[0]?.version.toString(), 'registry-2026.1');
  assert.equal(Object.isFrozen(envelope.sources), true);
});

test('FV03-12 satisfied-outcome', () => {
  assert.equal(result(DomainOutcome.SATISFIED, 'REQUIREMENT_MET').outcome, 'SATISFIED');
});

test('FV03-13 not-satisfied-outcome', () => {
  assert.equal(result(DomainOutcome.NOT_SATISFIED, 'REQUIREMENT_NOT_MET').outcome, 'NOT_SATISFIED');
});

test('FV03-14 indeterminate-outcome', () => {
  assert.equal(result(DomainOutcome.INDETERMINATE, 'EVIDENCE_INSUFFICIENT').outcome, 'INDETERMINATE');
});

test('FV03-15 review-required-outcome', () => {
  assert.equal(result(DomainOutcome.REVIEW_REQUIRED, 'AUTHORITY_REVIEW_REQUIRED').outcome, 'REVIEW_REQUIRED');
});

test('FV03-16 outcome-error-separation', () => {
  const domainResult = result(DomainOutcome.INDETERMINATE, 'EVIDENCE_CONTRADICTORY');
  const technical = CoreError.create(CoreErrorFamily.EXTERNAL_DEPENDENCY_ERROR, ReasonCode.from('PROVIDER_UNAVAILABLE'));
  assert.equal(domainResult instanceof CoreError, false);
  assert.equal(technical instanceof DomainEvaluationResult, false);
  assert.equal(technical.family, 'EXTERNAL_DEPENDENCY_ERROR');
});

test('FV03-17 stable-reason-code', () => {
  const code = ReasonCode.from('SOURCE_VERSION_MISMATCH');
  assert.equal(code.toString(), 'SOURCE_VERSION_MISMATCH');
  assert.throws(() => ReasonCode.from('source version mismatch'), TypeError);
});

test('FV03-18 technical-error-boundary', () => {
  const technical = CoreError.create(CoreErrorFamily.EXTERNAL_DEPENDENCY_ERROR, ReasonCode.from('PROVIDER_UNAVAILABLE'));
  assert.deepEqual(technical.toJSON(), { family: 'EXTERNAL_DEPENDENCY_ERROR', code: 'PROVIDER_UNAVAILABLE' });
  assert.equal('cause' in technical.toJSON(), false);
});

test('FV03-19 derived-verification-boundary', () => {
  const original = originalEvidence();
  assert.throws(() => EvidenceReference.derived({
    id: EvidenceId.from(IDS.derived),
    kind: EvidenceKind.AI_SUMMARY,
    contentReference: 'urn:calpq:evidence:derived:verified',
    acquiredAt: instant,
    acquiredBy: processActor,
    source: original.source,
    derivationParent: original.id,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  }), /cannot be created as VERIFIED/);
});

test('FV03-20 architecture-boundary', () => {
  const guard = spawnSync('bash', ['tests/architecture_boundaries_test.sh'], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(guard.status, 0, `${guard.stdout}\n${guard.stderr}`);
});
