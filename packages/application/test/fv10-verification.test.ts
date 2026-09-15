import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ActorId,
  ActorKind,
  ActorReference,
  EvidenceId,
  Jurisdiction,
  JurisdictionCode,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VersionId,
} from '../../core/src/index.ts';
import {
  AssuranceLevel,
  AuthorityStatus,
  TechnicalCheckStatus,
  VerificationAdapterCapability,
  VerificationClaim,
  VerificationMethod,
  VerificationRecordState,
  VerificationRequest,
  VerificationRequestId,
  VerificationTargetKind,
  VerificationTargetReference,
  VerificationUseCaseReference,
  orchestrateVerification,
} from '../src/index.ts';
import type {
  AuthorityResolutionInput,
  AuthorityResolverPort,
  VerificationProviderPort,
} from '../src/index.ts';
import { TechnicalVerificationResult } from '../src/verification/verification-model.ts';

const REQUEST_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c077101';
const EVIDENCE_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c077102';
const ACTOR_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c077103';
const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c077104';
const verifier = ActorReference.create(ActorId.from(ACTOR_ID), ActorKind.ORGANIZATION);
const subject = SubjectReference.create(SubjectId.from(SUBJECT_ID), SubjectKind.PERSON);
const claimA = VerificationClaim.from('credential.valid');
const claimB = VerificationClaim.from('issuer.authorized');

function request(claims = [claimA], assurance = AssuranceLevel.STANDARD): VerificationRequest {
  return VerificationRequest.create({
    id: VerificationRequestId.from(REQUEST_ID),
    target: VerificationTargetReference.evidence(EvidenceId.from(EVIDENCE_ID)),
    claims,
    subject,
    jurisdiction: Jurisdiction.fromCode(JurisdictionCode.CZECH_REPUBLIC),
    useCase: VerificationUseCaseReference.from('employment-onboarding'),
    requiredAssurance: assurance,
    acceptableMethods: [VerificationMethod.REGISTRY_LOOKUP, VerificationMethod.ISSUER_CONFIRMATION],
    evaluationInstant: UtcInstant.from('2026-09-15T08:00:00Z'),
  });
}

function provider(resultFactory: (request: VerificationRequest, method: typeof VerificationMethod[keyof typeof VerificationMethod]) => TechnicalVerificationResult): VerificationProviderPort {
  return {
    capability: VerificationAdapterCapability.create({
      adapterId: 'registry.cz',
      methods: [VerificationMethod.REGISTRY_LOOKUP],
      maxAssurance: AssuranceLevel.HIGH,
    }),
    async verify(req, method) { return resultFactory(req, method); },
  };
}

function result(observations: readonly { claim: VerificationClaim; status: typeof TechnicalCheckStatus[keyof typeof TechnicalCheckStatus]; routeReference: string }[], options: { outage?: boolean; verifierPresent?: boolean } = {}): TechnicalVerificationResult {
  return TechnicalVerificationResult.create({
    adapterId: 'registry.cz',
    verifier: options.verifierPresent === false ? null : verifier,
    method: VerificationMethod.REGISTRY_LOOKUP,
    sourceVersion: VersionId.from('registry-2026.09'),
    observations,
    outage: options.outage ?? false,
  });
}

class AuthorityResolver implements AuthorityResolverPort {
  readonly seen: AuthorityResolutionInput[] = [];
  constructor(private readonly status: typeof AuthorityStatus[keyof typeof AuthorityStatus] = AuthorityStatus.SUFFICIENT) {}
  async resolve(input: AuthorityResolutionInput) {
    this.seen.push(input);
    return { status: this.status, reasonCode: this.status === AuthorityStatus.SUFFICIENT ? 'AUTH_OK' : 'AUTH_NOT_OK' };
  }
}

async function verifiedRecord(req = request(), resolver = new AuthorityResolver()) {
  return orchestrateVerification({
    request: req,
    providers: [provider(() => result([{ claim: req.claims[0]!, status: TechnicalCheckStatus.PASSED, routeReference: 'route:1' }]))],
    authorityResolver: resolver,
  });
}

test('FV10-01 verification-request-reference', () => {
  const req = request();
  assert.equal(req.id.toString(), REQUEST_ID);
  assert.equal(req.target.kind, VerificationTargetKind.EVIDENCE);
  assert.equal(req.target.id.toString(), EVIDENCE_ID);
});

test('FV10-02 claims', () => {
  const req = request([claimA, claimB]);
  assert.deepEqual(req.claims.map(String), ['credential.valid', 'issuer.authorized']);
  assert.throws(() => VerificationRequest.create({ ...req, claims: [] }), TypeError);
});

test('FV10-03 subject', () => {
  assert.strictEqual(request().subject, subject);
});

test('FV10-04 jurisdiction-use-case', () => {
  const req = request();
  assert.equal(req.jurisdiction.toJSON().code, 'CZ');
  assert.equal(req.useCase.toString(), 'employment-onboarding');
});

test('FV10-05 assurance-level', () => {
  assert.equal(request().requiredAssurance, AssuranceLevel.STANDARD);
  assert.throws(() => VerificationRequest.create({ ...request(), requiredAssurance: 'SUPER' as never }), TypeError);
});

test('FV10-06 acceptable-methods', () => {
  assert.deepEqual(request().acceptableMethods, [VerificationMethod.REGISTRY_LOOKUP, VerificationMethod.ISSUER_CONFIRMATION]);
});

test('FV10-07 evaluation-instant', () => {
  assert.equal(request().evaluationInstant.toString(), '2026-09-15T08:00:00.000Z');
});

test('FV10-08 route-adapter-boundary', async () => {
  const low = provider(() => { throw new Error('low-assurance route must not be used'); });
  Object.defineProperty(low, 'capability', { value: VerificationAdapterCapability.create({ adapterId: 'low', methods: [VerificationMethod.REGISTRY_LOOKUP], maxAssurance: AssuranceLevel.BASIC }) });
  const record = await orchestrateVerification({ request: request(), providers: [low], authorityResolver: new AuthorityResolver() });
  assert.equal(record.state, VerificationRecordState.INDETERMINATE);
  assert.deepEqual(record.reasonCodes, ['NO_APPROVED_ROUTE']);
});

test('FV10-09 normalized-outcome', async () => {
  assert.equal((await verifiedRecord()).state, VerificationRecordState.VERIFIED);
});

test('FV10-10 verifier-identity', async () => {
  const record = await verifiedRecord();
  assert.strictEqual(record.verifier, verifier);
});

test('FV10-11 method', async () => {
  assert.equal((await verifiedRecord()).method, VerificationMethod.REGISTRY_LOOKUP);
});

test('FV10-12 authority-resolution', async () => {
  const resolver = new AuthorityResolver(AuthorityStatus.INSUFFICIENT);
  const record = await verifiedRecord(request(), resolver);
  assert.equal(record.state, VerificationRecordState.NOT_VERIFIED);
  assert.equal(resolver.seen.length, 1);
  assert.equal(resolver.seen[0]!.jurisdiction.toJSON().code, 'CZ');
  assert.equal(resolver.seen[0]!.useCase.toString(), 'employment-onboarding');
  assert.equal(resolver.seen[0]!.evaluationInstant.toString(), '2026-09-15T08:00:00.000Z');
});

test('FV10-13 source-version', async () => {
  assert.equal((await verifiedRecord()).sourceVersion?.toString(), 'registry-2026.09');
});

test('FV10-14 checked-claims', async () => {
  assert.deepEqual((await verifiedRecord()).checkedClaims.map(String), ['credential.valid']);
});

test('FV10-15 partial-verification', async () => {
  const req = request([claimA, claimB]);
  const record = await orchestrateVerification({
    request: req,
    providers: [provider(() => result([{ claim: claimA, status: TechnicalCheckStatus.PASSED, routeReference: 'route:1' }]))],
    authorityResolver: new AuthorityResolver(),
  });
  assert.equal(record.state, VerificationRecordState.PARTIAL);
  assert.deepEqual(record.verifiedClaims.map(String), ['credential.valid']);
  assert.deepEqual(record.indeterminateClaims.map(String), ['issuer.authorized']);
});

test('FV10-16 conflicting-routes-review', async () => {
  const req = request();
  const record = await orchestrateVerification({
    request: req,
    providers: [provider(() => result([
      { claim: claimA, status: TechnicalCheckStatus.PASSED, routeReference: 'route:1' },
      { claim: claimA, status: TechnicalCheckStatus.FAILED, routeReference: 'route:2' },
    ]))],
    authorityResolver: new AuthorityResolver(),
  });
  assert.equal(record.state, VerificationRecordState.REVIEW_REQUIRED);
  assert.deepEqual(record.reviewClaims.map(String), ['credential.valid']);
});

test('FV10-17 outage-indeterminate', async () => {
  const req = request();
  const record = await orchestrateVerification({
    request: req,
    providers: [provider(() => result([{ claim: claimA, status: TechnicalCheckStatus.INDETERMINATE, routeReference: 'route:1' }], { outage: true }))],
    authorityResolver: new AuthorityResolver(),
  });
  assert.equal(record.state, VerificationRecordState.INDETERMINATE);
  assert.deepEqual(record.reasonCodes, ['PROVIDER_OUTAGE']);
});

test('FV10-18 retry-idempotency', async () => {
  const req = request();
  const seen: string[] = [];
  const p = provider((current) => { seen.push(current.id.toString()); return result([{ claim: claimA, status: TechnicalCheckStatus.PASSED, routeReference: 'route:1' }]); });
  const resolver = new AuthorityResolver();
  const first = await orchestrateVerification({ request: req, providers: [p], authorityResolver: resolver });
  const second = await orchestrateVerification({ request: req, providers: [p], authorityResolver: resolver });
  assert.deepEqual(seen, [REQUEST_ID, REQUEST_ID]);
  assert.equal(first.state, second.state);
  assert.deepEqual(first.verifiedClaims.map(String), second.verifiedClaims.map(String));
  assert.deepEqual(first.reasonCodes, second.reasonCodes);
});

test('FV10-19 verification-not-eligibility-or-grant', async () => {
  const record = await verifiedRecord();
  assert.equal('eligibilityAssessment' in record, false);
  assert.equal('authorizationGrant' in record, false);
  const module = await import('../src/index.ts');
  assert.equal('EligibilityAssessment' in module, false);
  assert.equal('AuthorizationGrant' in module, false);
});

test('FV10-20 architecture-boundary', () => {
  const source = [
    readFileSync('packages/application/src/verification/verification-model.ts', 'utf8'),
    readFileSync('packages/application/src/verification/verification-ports.ts', 'utf8'),
    readFileSync('packages/application/src/verification/verification-orchestrator.ts', 'utf8'),
  ].join('\n');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|fastify|@?prisma|typeorm|openai|@anthropic-ai|tesseract|aws-sdk|@aws-sdk)/);
  assert.doesNotMatch(source, /\b(?:EligibilityAssessment|AuthorizationGrant)\b/);
  assert.doesNotMatch(source, /Date\.now\(|new Date\(\)|Math\.random\(|randomUUID\(/);
});
