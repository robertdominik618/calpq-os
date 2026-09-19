import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  ActorId,
  ActorKind,
  ActorReference,
  AtomicRequirementResult,
  ContentHash,
  CredentialDefinitionId,
  CredentialDefinitionReference,
  DecisionId,
  DomainOutcome,
  EligibilityAssessment,
  EligibilityAssessmentId,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  EvidenceSnapshot,
  Jurisdiction,
  ProvenanceEnvelope,
  RequirementGroup,
  RequirementGroupMode,
  RequirementId,
  RequirementSet,
  RequirementSetId,
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
} from '../../core/src/index.ts';
import {
  PassportAuthorityClass,
  PassportEvidenceVerificationLink,
  PassportItemOrigin,
  ProfessionalPassportProjection,
  VerificationMethod,
  VerificationRecord,
  VerificationRecordState,
  VerificationRequestId,
} from '../src/index.ts';

const IDS = {
  actor: '018f22e2-79b0-7cc3-98c4-dc0c0c079001',
  reviewer: '018f22e2-79b0-7cc3-98c4-dc0c0c079002',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c079003',
  source: '018f22e2-79b0-7cc3-98c4-dc0c0c079004',
  original: '018f22e2-79b0-7cc3-98c4-dc0c0c079005',
  derived: '018f22e2-79b0-7cc3-98c4-dc0c0c079006',
  credential: '018f22e2-79b0-7cc3-98c4-dc0c0c079007',
  requirementSet: '018f22e2-79b0-7cc3-98c4-dc0c0c079008',
  assessment: '018f22e2-79b0-7cc3-98c4-dc0c0c079009',
  decision: '018f22e2-79b0-7cc3-98c4-dc0c0c079010',
  ruleSet: '018f22e2-79b0-7cc3-98c4-dc0c0c079011',
  request: '018f22e2-79b0-7cc3-98c4-dc0c0c079012',
} as const;

const verifier = ActorReference.create(ActorId.from(IDS.actor), ActorKind.EXTERNAL_AUTHORITY);
const reviewer = ActorReference.create(ActorId.from(IDS.reviewer), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);
const generatedAt = UtcInstant.from('2026-09-15T09:00:00Z');

function source(version = 'source-1', hashCharacter = 'a'): SourceReference {
  return SourceReference.create({
    id: SourceId.from(IDS.source),
    authority: verifier,
    jurisdiction: Jurisdiction.fromCode('CZ'),
    sourceType: SourceType.ISSUER_RECORD,
    canonicalLocator: `urn:calpq:passport:${version}`,
    version: VersionId.from(version),
    retrievedAt: UtcInstant.from('2026-09-15T08:00:00Z'),
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256(hashCharacter.repeat(64)),
  });
}

function evidenceBundle(sourceVersion = 'source-1', hashCharacter = 'a') {
  const src = source(sourceVersion, hashCharacter);
  const original = EvidenceReference.original({
    id: EvidenceId.from(IDS.original),
    kind: EvidenceKind.DOCUMENT,
    contentReference: `object://passport/${sourceVersion}/original`,
    mediaType: 'application/pdf',
    contentHash: ContentHash.sha256(hashCharacter.repeat(64)),
    acquiredAt: UtcInstant.from('2026-09-15T08:05:00Z'),
    acquiredBy: verifier,
    source: src,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
  const derived = EvidenceReference.derived({
    id: EvidenceId.from(IDS.derived),
    kind: EvidenceKind.OCR_TEXT,
    contentReference: `object://passport/${sourceVersion}/derived`,
    mediaType: 'text/plain',
    acquiredAt: UtcInstant.from('2026-09-15T08:06:00Z'),
    acquiredBy: verifier,
    source: src,
    derivationParent: original.id,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
  return Object.freeze({
    original,
    derived,
    snapshot: EvidenceSnapshot.capture([derived, original], UtcInstant.from('2026-09-15T08:10:00Z')),
  });
}

function assessment(requirementVersion = 'requirements-1', sourceVersion = 'source-1', hashCharacter = 'a'): EligibilityAssessment {
  const requirementId = RequirementId.from('REQ-IDENTITY');
  const credential = CredentialDefinitionReference.create(
    CredentialDefinitionId.from(IDS.credential),
    VersionId.from('credential-1'),
  );
  const set = RequirementSet.create({
    id: RequirementSetId.from(IDS.requirementSet),
    version: VersionId.from(requirementVersion),
    credentialDefinition: credential,
    requirementIds: [requirementId],
    groups: [RequirementGroup.create({
      code: 'PRIMARY',
      mode: RequirementGroupMode.ALL,
      requirementIds: [requirementId],
    })],
  });
  const bundle = evidenceBundle(sourceVersion, hashCharacter);
  const evaluatedAt = UtcInstant.from('2026-09-15T08:30:00Z');
  const provenance = ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.decision),
    evaluatedAt,
    actor: reviewer,
    subject,
    ruleSetId: RuleSetId.from(IDS.ruleSet),
    ruleVersion: set.version,
    evidence: [bundle.original, bundle.derived],
  });
  return EligibilityAssessment.evaluate({
    id: EligibilityAssessmentId.from(IDS.assessment),
    subject,
    credentialDefinition: credential,
    requirementSet: set,
    evaluatedAt,
    evidenceSnapshot: bundle.snapshot,
    atomicResults: [AtomicRequirementResult.create({ requirementId, outcome: DomainOutcome.SATISFIED, reasonCodes: ['IDENTITY_OK'] })],
    evaluator: reviewer,
    provenance,
  });
}

function verificationLink(evidenceId = IDS.original, state = VerificationRecordState.VERIFIED): PassportEvidenceVerificationLink {
  const record = new VerificationRecord({
    requestId: VerificationRequestId.from(IDS.request),
    adapterId: 'registry.cz',
    verifier,
    method: VerificationMethod.REGISTRY_LOOKUP,
    sourceVersion: VersionId.from('verification-source-1'),
    state,
    reasonCodes: [],
  });
  return PassportEvidenceVerificationLink.create({
    evidenceId: EvidenceId.from(evidenceId),
    record,
    verifiedAt: UtcInstant.from('2026-09-15T08:20:00Z'),
    reviewer,
  });
}

function projection(inputAssessment = assessment(), links: readonly PassportEvidenceVerificationLink[] = [verificationLink()]) {
  return ProfessionalPassportProjection.rebuild({
    assessment: inputAssessment,
    generatedAt,
    verificationLinks: links,
  });
}

test('FV12-01 authoritative-input', () => {
  assert.throws(() => ProfessionalPassportProjection.rebuild({ assessment: {} as never, generatedAt }), /authoritative EligibilityAssessment/);
  assert.equal(projection().assessmentId, IDS.assessment);
});

test('FV12-02 evidence-id', () => {
  assert.deepEqual(projection().items.map((item) => item.evidenceId.toString()), [IDS.original, IDS.derived].sort());
});

test('FV12-03 provenance-id', () => {
  assert.deepEqual([...new Set(projection().items.map((item) => item.provenanceIdentity.toString()))], [IDS.decision]);
});

test('FV12-04 origin-class', () => {
  const items = projection().items;
  assert.equal(items.find((item) => item.evidenceId.toString() === IDS.original)?.origin, PassportItemOrigin.ORIGINAL_EVIDENCE);
  assert.equal(items.find((item) => item.evidenceId.toString() === IDS.derived)?.origin, PassportItemOrigin.DERIVED_EVIDENCE);
});

test('FV12-05 verification-status', () => {
  const items = projection().items;
  assert.equal(items.find((item) => item.evidenceId.toString() === IDS.original)?.verificationStatus, VerificationStateCode.VERIFIED);
  assert.equal(items.find((item) => item.evidenceId.toString() === IDS.derived)?.verificationStatus, VerificationStateCode.UNVERIFIED);
});

test('FV12-06 derivation-method', () => {
  const items = projection().items;
  assert.equal(items.find((item) => item.evidenceId.toString() === IDS.original)?.derivationMethod, null);
  assert.equal(items.find((item) => item.evidenceId.toString() === IDS.derived)?.derivationMethod, EvidenceKind.OCR_TEXT);
});

test('FV12-07 verifier-attribution', () => {
  const item = projection().items.find((candidate) => candidate.evidenceId.toString() === IDS.original);
  assert.strictEqual(item?.verifier, verifier);
  assert.strictEqual(item?.reviewer, reviewer);
  assert.equal(item?.verificationRecordState, VerificationRecordState.VERIFIED);
});

test('FV12-08 verified-at', () => {
  const item = projection().items.find((candidate) => candidate.evidenceId.toString() === IDS.original);
  assert.equal(item?.verifiedAt?.toString(), '2026-09-15T08:20:00.000Z');
});

test('FV12-09 source-version', () => {
  const item = projection().items.find((candidate) => candidate.evidenceId.toString() === IDS.original);
  assert.equal(item?.sourceVersion, 'source-1');
  assert.equal(item?.verificationSourceVersion, 'verification-source-1');
  assert.equal(item?.sourceHash, `sha256:${'a'.repeat(64)}`);
});

test('FV12-10 no-assertion-promotion', () => {
  const value = ProfessionalPassportProjection.rebuild({
    assessment: assessment(),
    generatedAt,
    verificationLinks: [verificationLink()],
    userAssertion: { authorityClass: 'VERIFIED_EVIDENCE' },
  } as never);
  assert.equal(value.items.length, 2);
  assert.equal('USER_ASSERTION' in PassportAuthorityClass, false);
  assert.equal(value.authorizationAuthority, false);
});

test('FV12-11 no-derived-promotion', () => {
  const derivedLink = verificationLink(IDS.derived, VerificationRecordState.VERIFIED);
  const item = projection(assessment(), [verificationLink(), derivedLink]).items.find((candidate) => candidate.evidenceId.toString() === IDS.derived);
  assert.equal(item?.verificationRecordState, VerificationRecordState.VERIFIED);
  assert.equal(item?.verificationStatus, VerificationStateCode.UNVERIFIED);
  assert.equal(item?.authorityClass, PassportAuthorityClass.DERIVED_INFORMATION);
});

test('FV12-12 read-only-projection', () => {
  const value = projection();
  assert.equal(Object.isFrozen(value), true);
  assert.equal(Object.isFrozen(value.items), true);
  assert.equal(Object.isFrozen(value.items[0]), true);
  assert.throws(() => value.items.push(value.items[0]!), TypeError);
});

test('FV12-13 stale-projection-no-authority', () => {
  const value = projection();
  assert.equal(value.isStale(UtcInstant.from('2026-09-15T10:00:00Z'), 30 * 60 * 1000), true);
  assert.equal(value.authorizationAuthority, false);
  assert.equal('authorize' in value, false);
  assert.equal('authorizationGrant' in value, false);
});

test('FV12-14 deterministic-rebuild', () => {
  const first = projection();
  const second = projection();
  assert.deepEqual(first.toJSON(), second.toJSON());
});

test('FV12-15 historical-rebuild', () => {
  const oldProjection = projection(assessment('requirements-1', 'source-1', 'a'));
  const oldJson = oldProjection.toJSON();
  const newProjection = projection(assessment('requirements-2', 'source-2', 'b'));
  assert.equal(oldProjection.requirementSetVersion, 'requirements-1');
  assert.equal(oldProjection.items[0]?.sourceVersion, 'source-1');
  assert.equal(newProjection.requirementSetVersion, 'requirements-2');
  assert.equal(newProjection.items[0]?.sourceVersion, 'source-2');
  assert.deepEqual(oldProjection.toJSON(), oldJson);
});

test('FV12-16 architecture-boundary', () => {
  const sourceText = readFileSync('packages/application/src/passport/professional-passport.ts', 'utf8');
  assert.doesNotMatch(sourceText, /from ['"](?:react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)/);
  assert.doesNotMatch(sourceText, /\bAuthorizationGrant\b/);
  assert.doesNotMatch(sourceText, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
});
