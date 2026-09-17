import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ActorId, ActorKind, ActorReference, ContentHash, EvidenceId, EvidenceKind, EvidenceReference,
  Jurisdiction, SourceId, UtcInstant, VerificationState, VerificationStateCode, VersionId,
} from '../../core/src/index.ts';
import {
  AuthorityResolutionOutcome, AuthorityResolutionResult, AuthorityRole, AuthorityScope, AuthorityScopeId,
  TrustAnchorKind, TrustAnchorRecord, TrustAnchorRecordId, TrustAnchorVerificationState,
  TrustEntity, TrustEntityId, TrustEntityKind, TrustEntityStatus, TrustIdentifier, TrustIdentifierKind,
  TrustRegistrySnapshot, TrustRegistrySnapshotId, TrustResolutionId,
} from '../src/trust/index.ts';
import {
  VerificationAssuranceLevel, VerificationAttemptId, VerificationClaimResolution, VerificationMethod,
  VerificationProviderRequest, VerificationProviderResult, VerificationRequest, VerificationRequestId,
  VerificationRouteDefinition, VerificationRouteId, VerificationRouteOutcome, VerificationRouteRegistrySnapshot,
  VerificationRouteRegistrySnapshotId, VerificationRouteResult, VerificationRouteSelection, VerificationRouteState,
  VerificationSelectionOutcome,
} from '../src/verification/index.ts';

function uuid(n: number): string { return `018f3f7e-2222-7abc-8def-${String(n).padStart(12, '0')}`; }
const CZ = Jurisdiction.fromCode('CZ');
const PRAGUE = Jurisdiction.fromCode('CZ-10');
const T0 = UtcInstant.from('2026-01-01T00:00:00Z');
const T1 = UtcInstant.from('2026-05-01T00:00:00Z');
const T2 = UtcInstant.from('2026-09-01T00:00:00Z');
const T3 = UtcInstant.from('2026-12-01T00:00:00Z');
const SOURCE = SourceId.from(uuid(900));
const VERSION = VersionId.from('verification-routes-v1');
const CLAIM_A = 'credential:number';
const CLAIM_B = 'credential:expiry';

const actor = ActorReference.create(ActorId.from(uuid(950)), ActorKind.HUMAN_USER);
function evidence(): EvidenceReference {
  return EvidenceReference.original({
    id: EvidenceId.from(uuid(951)), kind: EvidenceKind.DOCUMENT,
    contentReference: 'object://immutable/m05-s07-document', mediaType: 'application/pdf',
    contentHash: ContentHash.sha256('a'.repeat(64)), acquiredAt: T0, acquiredBy: actor,
    verificationState: VerificationState.from(VerificationStateCode.UNVERIFIED),
  });
}

function entity(): TrustEntity {
  return TrustEntity.create({
    id: TrustEntityId.from(uuid(1)), legalName: 'Example Verification Authority', kind: TrustEntityKind.VERIFIER,
    jurisdictions: [CZ, PRAGUE],
    identifiers: [TrustIdentifier.create({ kind: TrustIdentifierKind.LEGAL_REGISTRY_ID, value: 'CZ-VERIFY-1', sourceReference: 'registry:authority' })],
    status: TrustEntityStatus.ACTIVE, validFrom: T0, provenanceReference: 'prov:entity:verifier',
  });
}

function authorityScope(target: TrustEntity, claim = CLAIM_A, role: AuthorityRole = AuthorityRole.VERIFIER, jurisdiction: Jurisdiction = CZ): AuthorityScope {
  return AuthorityScope.create({
    id: AuthorityScopeId.from(uuid(claim === CLAIM_A ? 10 : 11)), entity: target, role, claimScope: claim,
    jurisdiction, validFrom: T0, sourceId: SOURCE, sourceVersion: VERSION,
  });
}

function anchor(target: TrustEntity, scope: AuthorityScope, id = 20): TrustAnchorRecord {
  return TrustAnchorRecord.create({
    id: TrustAnchorRecordId.from(uuid(id)), entity: target, authorityScope: scope,
    kind: TrustAnchorKind.OFFICIAL_REGISTRY_ENTRY, sourceId: SOURCE, sourceVersion: VERSION,
    sourceSnapshotReference: 'snapshot:trust-registry:v1', retrievedAt: T0, validFrom: T0,
    verificationState: TrustAnchorVerificationState.VERIFIED, provenanceReference: 'prov:anchor:verified',
  });
}

function trustFixture(includeSecondClaim = false) {
  const target = entity();
  const scopeA = authorityScope(target, CLAIM_A);
  const scopes = [scopeA];
  const anchors = [anchor(target, scopeA, 20)];
  if (includeSecondClaim) {
    const scopeB = authorityScope(target, CLAIM_B);
    scopes.push(scopeB);
    anchors.push(anchor(target, scopeB, 21));
  }
  const snapshot = TrustRegistrySnapshot.create({
    id: TrustRegistrySnapshotId.from(uuid(30)), asKnownAt: T2, entities: [target],
    authorityScopes: scopes, anchors, policyVersion: VERSION,
  });
  return { target, snapshot };
}

function authority(snapshot: TrustRegistrySnapshot, target: TrustEntity, claim = CLAIM_A, role: AuthorityRole = AuthorityRole.VERIFIER, jurisdiction: Jurisdiction = CZ, id = 40): AuthorityResolutionResult {
  return AuthorityResolutionResult.resolve({
    id: TrustResolutionId.from(uuid(id)), snapshot, entity: target, requestedRole: role,
    claimScope: claim, jurisdiction, evaluationInstant: T1, asKnownAt: T2,
  });
}

function route(target: TrustEntity, input: Partial<{
  id: number; method: VerificationMethod; claims: readonly string[]; jurisdictions: readonly Jurisdiction[];
  assurance: VerificationAssuranceLevel; priority: number; state: VerificationRouteState; role: AuthorityRole;
  retrievedAt: UtcInstant; validFrom: UtcInstant; validTo: UtcInstant | null;
}> = {}): VerificationRouteDefinition {
  return VerificationRouteDefinition.create({
    id: VerificationRouteId.from(uuid(input.id ?? 100)), method: input.method ?? VerificationMethod.OFFICIAL_REGISTRY_LOOKUP,
    capability: 'credential-claim-verification', verifierEntity: target, authorityRole: input.role ?? AuthorityRole.VERIFIER,
    supportedClaims: input.claims ?? [CLAIM_A], jurisdictions: input.jurisdictions ?? [CZ],
    assuranceLevel: input.assurance ?? VerificationAssuranceLevel.HIGH, priority: input.priority ?? 10,
    state: input.state ?? VerificationRouteState.ACTIVE, validFrom: input.validFrom ?? T0,
    validTo: input.validTo, sourceId: SOURCE, sourceVersion: VERSION,
    sourceSnapshotReference: 'snapshot:route-registry:v1', retrievedAt: input.retrievedAt ?? T0,
  });
}

function registry(snapshot: TrustRegistrySnapshot, routes: readonly VerificationRouteDefinition[]): VerificationRouteRegistrySnapshot {
  return VerificationRouteRegistrySnapshot.create({
    id: VerificationRouteRegistrySnapshotId.from(uuid(200)), trustSnapshot: snapshot,
    asKnownAt: T2, routes, policyVersion: VERSION,
  });
}

function request(input: Partial<{
  claims: readonly string[]; jurisdiction: Jurisdiction; assurance: VerificationAssuranceLevel;
  methods: readonly VerificationMethod[]; evaluation: UtcInstant; knownAt: UtcInstant; idempotency: string;
}> = {}): VerificationRequest {
  return VerificationRequest.create({
    id: VerificationRequestId.from(uuid(300)), evidence: evidence(), subjectReference: 'subject:person:123',
    claims: input.claims ?? [CLAIM_A], jurisdiction: input.jurisdiction ?? CZ, useCase: 'credential-validation',
    requiredAssurance: input.assurance ?? VerificationAssuranceLevel.SUBSTANTIAL,
    acceptableMethods: input.methods ?? [VerificationMethod.OFFICIAL_REGISTRY_LOOKUP],
    evaluationInstant: input.evaluation ?? T1, asKnownAt: input.knownAt ?? T2,
    idempotencyKey: input.idempotency ?? 'idem:verification-request:123',
  });
}

function selectionFixture(input: Partial<{ secondClaim: boolean; routes: readonly VerificationRouteDefinition[]; request: VerificationRequest }> = {}) {
  const { target, snapshot } = trustFixture(input.secondClaim ?? false);
  const routes = input.routes ?? [route(target)];
  const req = input.request ?? request({ claims: input.secondClaim ? [CLAIM_A, CLAIM_B] : [CLAIM_A] });
  const resolutions = [authority(snapshot, target, CLAIM_A, AuthorityRole.VERIFIER, CZ, 40)];
  if (input.secondClaim) resolutions.push(authority(snapshot, target, CLAIM_B, AuthorityRole.VERIFIER, CZ, 41));
  return { target, snapshot, routes, req, resolutions, registry: registry(snapshot, routes) };
}

function providerRequest(target: TrustEntity, method: VerificationMethod = VerificationMethod.OFFICIAL_REGISTRY_LOOKUP, attempt = 400): VerificationProviderRequest {
  const r = route(target, { method, id: 101 });
  const req = request({ methods: [method] });
  return VerificationProviderRequest.create({ attemptId: VerificationAttemptId.from(uuid(attempt)), route: r, request: req, claims: [CLAIM_A], idempotencyKey: 'idem:attempt:1' });
}

function providerResult(input: Partial<{ outcome: VerificationRouteOutcome; fingerprint: string; reasons: readonly string[]; checkedClaims: readonly string[] }> = {}): VerificationProviderResult {
  const outcome = input.outcome ?? VerificationRouteOutcome.VERIFIED;
  const checkedClaims = input.checkedClaims ?? [CLAIM_A];
  const fingerprints = outcome === VerificationRouteOutcome.VERIFIED ? { [CLAIM_A]: input.fingerprint ?? 'sha256:assertion:a' } : {};
  return VerificationProviderResult.create({
    outcome, adapterReference: 'adapter:official-registry', adapterVersion: '1.0.0', checkedClaims,
    assertionFingerprints: fingerprints, sourceSnapshotReference: 'provider:snapshot:1', sourceVersionReference: 'provider:v1',
    checkedAt: T2, providerResultReference: 'provider-result:opaque:1', reasonCodes: input.reasons,
  });
}

function verifiedRouteResult(fingerprint = 'sha256:assertion:a', attempt = 400): VerificationRouteResult {
  const { target, snapshot } = trustFixture();
  const pReq = providerRequest(target, VerificationMethod.OFFICIAL_REGISTRY_LOOKUP, attempt);
  const auth = authority(snapshot, target);
  return VerificationRouteResult.normalize({ providerRequest: pReq, providerResult: providerResult({ fingerprint }), authorityResolutions: [auth] });
}

test('M05S07-01 verification methods are controlled and exact', () => assert.equal(Object.keys(VerificationMethod).length, 7));
test('M05S07-02 assurance levels are controlled and exact', () => assert.deepEqual(Object.values(VerificationAssuranceLevel), ['BASIC', 'SUBSTANTIAL', 'HIGH']));
test('M05S07-03 route states are controlled and exact', () => assert.deepEqual(Object.values(VerificationRouteState), ['ACTIVE', 'INACTIVE', 'REVIEW_REQUIRED']));
test('M05S07-04 route outcomes are controlled and exact', () => assert.deepEqual(Object.values(VerificationRouteOutcome), ['VERIFIED', 'FAILED', 'INDETERMINATE', 'REVIEW_REQUIRED', 'NOT_SUPPORTED']));
test('M05S07-05 VerificationRouteId requires UUIDv7', () => assert.throws(() => VerificationRouteId.from('not-v7')));
test('M05S07-06 registry snapshot id requires UUIDv7', () => assert.throws(() => VerificationRouteRegistrySnapshotId.from('bad')));
test('M05S07-07 verification request id requires UUIDv7', () => assert.throws(() => VerificationRequestId.from('bad')));
test('M05S07-08 verification attempt id requires UUIDv7', () => assert.throws(() => VerificationAttemptId.from('bad')));
test('M05S07-09 route requires exact TrustEntity verifier', () => assert.throws(() => VerificationRouteDefinition.create({ ...route(entity()).toJSON(), id: VerificationRouteId.from(uuid(999)) } as never)));
test('M05S07-10 route claims are canonical and immutable', () => { const r = route(entity(), { claims: [CLAIM_B, CLAIM_A] }); assert.deepEqual(r.supportedClaims, [CLAIM_A, CLAIM_B]); assert.ok(Object.isFrozen(r.supportedClaims)); });
test('M05S07-11 duplicate route jurisdictions fail closed', () => assert.throws(() => route(entity(), { jurisdictions: [CZ, CZ] })));
test('M05S07-12 uncontrolled route assurance fails closed', () => assert.throws(() => route(entity(), { assurance: 'SUPER' as VerificationAssuranceLevel })));
test('M05S07-13 invalid route priority fails closed', () => assert.throws(() => route(entity(), { priority: -1 })));
test('M05S07-14 invalid route effective period fails closed', () => assert.throws(() => route(entity(), { validFrom: T2, validTo: T1 })));
test('M05S07-15 route preserves source and retrieval provenance', () => { const r = route(entity()); assert.equal(r.sourceId, SOURCE); assert.equal(r.sourceVersion, VERSION); assert.equal(r.retrievedAt, T0); });
test('M05S07-16 registry binds exact Trust Registry snapshot', () => { const t = trustFixture(); assert.equal(registry(t.snapshot, [route(t.target)]).trustSnapshot, t.snapshot); });
test('M05S07-17 duplicate route ids are rejected', () => { const t = trustFixture(); const r = route(t.target); assert.throws(() => registry(t.snapshot, [r, r])); });
test('M05S07-18 route verifier must exist in exact trust snapshot', () => { const t = trustFixture(); assert.throws(() => registry(t.snapshot, [route(entity(), { id: 102 })])); });
test('M05S07-19 future retrieved route is rejected from historical registry', () => { const t = trustFixture(); assert.throws(() => registry(t.snapshot, [route(t.target, { retrievedAt: T3 })])); });
test('M05S07-20 registry order is explicit priority then route id', () => { const t = trustFixture(); const a = route(t.target, { id: 105, priority: 20 }); const b = route(t.target, { id: 104, priority: 10 }); assert.deepEqual(registry(t.snapshot, [a, b]).routes, [b, a]); });
test('M05S07-21 request requires EvidenceReference', () => assert.throws(() => VerificationRequest.create({ ...request().toJSON(), id: VerificationRequestId.from(uuid(301)) } as never)));
test('M05S07-22 request claims are canonical and immutable', () => { const r = request({ claims: [CLAIM_B, CLAIM_A] }); assert.deepEqual(r.claims, [CLAIM_A, CLAIM_B]); assert.ok(Object.isFrozen(r.claims)); });
test('M05S07-23 acceptable methods must be controlled and unique', () => assert.throws(() => request({ methods: [VerificationMethod.ISSUER_API, VerificationMethod.ISSUER_API] })));
test('M05S07-24 request preserves explicit evaluation and knowledge time', () => { const r = request(); assert.equal(r.evaluationInstant, T1); assert.equal(r.asKnownAt, T2); });
test('M05S07-25 request knowledge time cannot predate evaluation time', () => assert.throws(() => request({ evaluation: T2, knownAt: T1 })));
test('M05S07-26 selection requires authority from exact trust snapshot', () => { const a = selectionFixture(); const other = trustFixture(); assert.throws(() => VerificationRouteSelection.select({ registry: a.registry, request: a.req, authorityResolutions: [authority(other.snapshot, other.target)] })); });
test('M05S07-27 exact authorized route is selected', () => { const f = selectionFixture(); const s = VerificationRouteSelection.select({ registry: f.registry, request: f.req, authorityResolutions: f.resolutions }); assert.equal(s.outcome, VerificationSelectionOutcome.ROUTES_SELECTED); assert.equal(s.items.length, 1); });
test('M05S07-28 authorized-with-conditions remains eligible for route selection', () => { const target = entity(); const scoped = AuthorityScope.create({ id: AuthorityScopeId.from(uuid(12)), entity: target, role: AuthorityRole.VERIFIER, claimScope: CLAIM_A, jurisdiction: CZ, validFrom: T0, sourceId: SOURCE, sourceVersion: VERSION, conditions: ['human-presence-required'] }); const snap = TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(uuid(31)), asKnownAt: T2, entities: [target], authorityScopes: [scoped], anchors: [anchor(target, scoped, 22)], policyVersion: VERSION }); const auth = authority(snap, target); assert.equal(auth.outcome, AuthorityResolutionOutcome.AUTHORIZED_WITH_CONDITIONS); const sel = VerificationRouteSelection.select({ registry: registry(snap, [route(target)]), request: request(), authorityResolutions: [auth] }); assert.equal(sel.outcome, VerificationSelectionOutcome.ROUTES_SELECTED); });
test('M05S07-29 wrong authority role is not selected', () => { const f = selectionFixture(); const wrong = authority(f.snapshot, f.target, CLAIM_A, AuthorityRole.ISSUER); const s = VerificationRouteSelection.select({ registry: f.registry, request: f.req, authorityResolutions: [wrong] }); assert.equal(s.outcome, VerificationSelectionOutcome.NOT_SUPPORTED); });
test('M05S07-30 wrong claim authority is not selected', () => { const f = selectionFixture(); const wrong = authority(f.snapshot, f.target, CLAIM_B); const s = VerificationRouteSelection.select({ registry: f.registry, request: f.req, authorityResolutions: [wrong] }); assert.equal(s.outcome, VerificationSelectionOutcome.NOT_SUPPORTED); });
test('M05S07-31 wrong jurisdiction authority is not selected', () => { const f = selectionFixture(); const wrong = authority(f.snapshot, f.target, CLAIM_A, AuthorityRole.VERIFIER, PRAGUE); const s = VerificationRouteSelection.select({ registry: f.registry, request: f.req, authorityResolutions: [wrong] }); assert.equal(s.outcome, VerificationSelectionOutcome.NOT_SUPPORTED); });
test('M05S07-32 insufficient route assurance is not selected', () => { const t = trustFixture(); const r = route(t.target, { assurance: VerificationAssuranceLevel.BASIC }); const req = request({ assurance: VerificationAssuranceLevel.HIGH }); const s = VerificationRouteSelection.select({ registry: registry(t.snapshot, [r]), request: req, authorityResolutions: [authority(t.snapshot, t.target)] }); assert.equal(s.outcome, VerificationSelectionOutcome.NOT_SUPPORTED); });
test('M05S07-33 unacceptable method is not selected', () => { const t = trustFixture(); const r = route(t.target, { method: VerificationMethod.ISSUER_API }); const s = VerificationRouteSelection.select({ registry: registry(t.snapshot, [r]), request: request(), authorityResolutions: [authority(t.snapshot, t.target)] }); assert.equal(s.outcome, VerificationSelectionOutcome.NOT_SUPPORTED); });
test('M05S07-34 inactive route is not selected', () => { const t = trustFixture(); const r = route(t.target, { state: VerificationRouteState.INACTIVE }); const s = VerificationRouteSelection.select({ registry: registry(t.snapshot, [r]), request: request(), authorityResolutions: [authority(t.snapshot, t.target)] }); assert.equal(s.outcome, VerificationSelectionOutcome.NOT_SUPPORTED); });
test('M05S07-35 route review state fails closed to REVIEW_REQUIRED', () => { const t = trustFixture(); const r = route(t.target, { state: VerificationRouteState.REVIEW_REQUIRED }); const s = VerificationRouteSelection.select({ registry: registry(t.snapshot, [r]), request: request(), authorityResolutions: [authority(t.snapshot, t.target)] }); assert.equal(s.outcome, VerificationSelectionOutcome.REVIEW_REQUIRED); });
test('M05S07-36 partial claim coverage is explicit', () => { const t = trustFixture(true); const req = request({ claims: [CLAIM_A, CLAIM_B] }); const s = VerificationRouteSelection.select({ registry: registry(t.snapshot, [route(t.target)]), request: req, authorityResolutions: [authority(t.snapshot, t.target, CLAIM_A)] }); assert.equal(s.outcome, VerificationSelectionOutcome.PARTIAL_ROUTES_SELECTED); assert.deepEqual(s.uncoveredClaims, [CLAIM_B]); });
test('M05S07-37 no applicable route is NOT_SUPPORTED', () => { const t = trustFixture(); const s = VerificationRouteSelection.select({ registry: registry(t.snapshot, []), request: request(), authorityResolutions: [] }); assert.equal(s.outcome, VerificationSelectionOutcome.NOT_SUPPORTED); });
test('M05S07-38 explicit priority determines route order', () => { const t = trustFixture(); const req = request(); const auth = authority(t.snapshot, t.target); const a = route(t.target, { id: 110, priority: 20 }); const b = route(t.target, { id: 111, priority: 5 }); const s = VerificationRouteSelection.select({ registry: registry(t.snapshot, [a, b]), request: req, authorityResolutions: [auth] }); assert.deepEqual(s.items.map((i) => i.route), [b, a]); });
test('M05S07-39 provider port cannot execute manual authority confirmation', () => { const t = trustFixture(); assert.throws(() => providerRequest(t.target, VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION)); });
test('M05S07-40 provider port cannot execute human review route', () => { const t = trustFixture(); assert.throws(() => providerRequest(t.target, VerificationMethod.HUMAN_REVIEW)); });
test('M05S07-41 provider request claims must be request and route subset', () => { const t = trustFixture(); const r = route(t.target); const req = request(); assert.throws(() => VerificationProviderRequest.create({ attemptId: VerificationAttemptId.from(uuid(401)), route: r, request: req, claims: [CLAIM_B], idempotencyKey: 'idem:bad' })); });
test('M05S07-42 provider result outcome must be controlled', () => assert.throws(() => providerResult({ outcome: 'MAGIC' as VerificationRouteOutcome })));
test('M05S07-43 VERIFIED provider result requires assertion fingerprints', () => assert.throws(() => VerificationProviderResult.create({ outcome: VerificationRouteOutcome.VERIFIED, adapterReference: 'adapter:x', adapterVersion: '1', checkedClaims: [CLAIM_A], sourceSnapshotReference: 'snap:x', sourceVersionReference: 'v1', checkedAt: T2 })));
test('M05S07-44 provider outage cannot be represented as FAILED claim truth', () => assert.throws(() => providerResult({ outcome: VerificationRouteOutcome.FAILED, reasons: ['PROVIDER_TIMEOUT'] })));
test('M05S07-45 provider outage may be INDETERMINATE', () => assert.equal(providerResult({ outcome: VerificationRouteOutcome.INDETERMINATE, reasons: ['PROVIDER_TIMEOUT'] }).outcome, VerificationRouteOutcome.INDETERMINATE));
test('M05S07-46 provider checked claims cannot escape provider request', () => { const t = trustFixture(); const pReq = providerRequest(t.target); const pRes = providerResult({ outcome: VerificationRouteOutcome.INDETERMINATE, checkedClaims: [CLAIM_B] }); assert.throws(() => VerificationRouteResult.normalize({ providerRequest: pReq, providerResult: pRes, authorityResolutions: [] })); });
test('M05S07-47 provider VERIFIED plus sufficient authority remains VERIFIED', () => assert.equal(verifiedRouteResult().outcome, VerificationRouteOutcome.VERIFIED));
test('M05S07-48 provider VERIFIED without sufficient authority becomes REVIEW_REQUIRED', () => { const t = trustFixture(); const pReq = providerRequest(t.target); const result = VerificationRouteResult.normalize({ providerRequest: pReq, providerResult: providerResult(), authorityResolutions: [] }); assert.equal(result.outcome, VerificationRouteOutcome.REVIEW_REQUIRED); });
test('M05S07-49 route result preserves provider and authority provenance', () => { const r = verifiedRouteResult(); const json = r.toJSON(); assert.equal(json.adapterReference, 'adapter:official-registry'); assert.equal(json.sourceSnapshotReference, 'provider:snapshot:1'); assert.equal(json.authorityResolutionIds.length, 1); });
test('M05S07-50 matching successful assertion fingerprints resolve VERIFIED', () => { const a = verifiedRouteResult('sha256:same', 410); const b = verifiedRouteResult('sha256:same', 411); const c = VerificationClaimResolution.resolve(CLAIM_A, [a, b]); assert.equal(c.outcome, VerificationRouteOutcome.VERIFIED); assert.equal(c.assertionFingerprint, 'sha256:same'); });
test('M05S07-51 conflicting successful assertion fingerprints require review', () => { const a = verifiedRouteResult('sha256:a', 412); const b = verifiedRouteResult('sha256:b', 413); assert.equal(VerificationClaimResolution.resolve(CLAIM_A, [a, b]).outcome, VerificationRouteOutcome.REVIEW_REQUIRED); });
test('M05S07-52 indeterminate route result does not become FAILED claim truth', () => { const t = trustFixture(); const pReq = providerRequest(t.target); const routeResult = VerificationRouteResult.normalize({ providerRequest: pReq, providerResult: providerResult({ outcome: VerificationRouteOutcome.INDETERMINATE, reasons: ['PROVIDER_UNAVAILABLE'] }), authorityResolutions: [authority(t.snapshot, t.target)] }); assert.equal(VerificationClaimResolution.resolve(CLAIM_A, [routeResult]).outcome, VerificationRouteOutcome.INDETERMINATE); });
test('M05S07-53 unchecked claim remains NOT_SUPPORTED', () => assert.equal(VerificationClaimResolution.resolve(CLAIM_B, [verifiedRouteResult()]).outcome, VerificationRouteOutcome.NOT_SUPPORTED));
test('M05S07-54 serialization is deterministic and exposes no legal authorization truth', () => { const f = selectionFixture(); const s = VerificationRouteSelection.select({ registry: f.registry, request: f.req, authorityResolutions: f.resolutions }); const a = JSON.stringify(s.toJSON()); const b = JSON.stringify(s.toJSON()); assert.equal(a, b); assert.doesNotMatch(a, /AuthorizationGrant|EligibilityAssessment|RecognitionDecision/); assert.equal(request().idempotencyKey, 'idem:verification-request:123'); });
