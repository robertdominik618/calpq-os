import assert from 'node:assert/strict';
import test from 'node:test';
import { Jurisdiction, SourceId, UtcInstant, VersionId } from '../../core/src/index.ts';
import {
  AuthorityResolutionOutcome,
  AuthorityResolutionResult,
  AuthorityRole,
  AuthorityScope,
  AuthorityScopeId,
  EntityResolutionOutcome,
  EntityResolutionResult,
  IdentityResolutionSignal,
  IdentitySignalDirection,
  IdentitySignalStrength,
  StrongIdentityConflictPolicy,
  TrustAnchorKind,
  TrustAnchorRecord,
  TrustAnchorRecordId,
  TrustAnchorVerificationState,
  TrustEntity,
  TrustEntityId,
  TrustEntityKind,
  TrustEntityStatus,
  TrustIdentifier,
  TrustIdentifierKind,
  TrustRegistrySnapshot,
  TrustRegistrySnapshotId,
  TrustResolutionId,
} from '../src/trust/index.ts';

function uuid(n: number): string {
  return `018f3f7e-1111-7abc-8def-${String(n).padStart(12, '0')}`;
}

const CZ = Jurisdiction.fromCode('CZ');
const PRAGUE = Jurisdiction.fromCode('CZ-10');
const T0 = UtcInstant.from('2026-01-01T00:00:00Z');
const T1 = UtcInstant.from('2026-05-01T00:00:00Z');
const T2 = UtcInstant.from('2026-09-01T00:00:00Z');
const T3 = UtcInstant.from('2026-12-01T00:00:00Z');
const SOURCE_A = SourceId.from(uuid(900));
const SOURCE_B = SourceId.from(uuid(901));
const V1 = VersionId.from('trust-v1');

function identifier(value = 'CZ-ORG-123'): TrustIdentifier {
  return TrustIdentifier.create({ kind: TrustIdentifierKind.LEGAL_REGISTRY_ID, value, sourceReference: 'registry-a' });
}

function entity(input: Partial<{
  id: TrustEntityId;
  legalName: string;
  jurisdictions: readonly Jurisdiction[];
  identifiers: readonly TrustIdentifier[];
  status: TrustEntityStatus;
}> = {}): TrustEntity {
  return TrustEntity.create({
    id: input.id ?? TrustEntityId.from(uuid(1)),
    legalName: input.legalName ?? 'Example Issuer Authority',
    kind: TrustEntityKind.AUTHORITY,
    jurisdictions: input.jurisdictions ?? [CZ],
    identifiers: input.identifiers ?? [identifier()],
    status: input.status ?? TrustEntityStatus.ACTIVE,
    validFrom: T0,
    provenanceReference: 'prov:entity:1',
  });
}

function scope(target: TrustEntity, input: Partial<{
  id: AuthorityScopeId;
  role: AuthorityRole;
  claimScope: string;
  jurisdiction: Jurisdiction;
  conditions: readonly string[];
  limitations: readonly string[];
}> = {}): AuthorityScope {
  return AuthorityScope.create({
    id: input.id ?? AuthorityScopeId.from(uuid(10)),
    entity: target,
    role: input.role ?? AuthorityRole.ISSUER,
    claimScope: input.claimScope ?? 'credential:electrical',
    jurisdiction: input.jurisdiction ?? CZ,
    validFrom: T0,
    sourceId: SOURCE_A,
    sourceVersion: V1,
    conditions: input.conditions,
    limitations: input.limitations,
  });
}

function anchor(target: TrustEntity, targetScope: AuthorityScope, input: Partial<{
  id: TrustAnchorRecordId;
  state: TrustAnchorVerificationState;
  retrievedAt: UtcInstant;
  sourceId: SourceId;
}> = {}): TrustAnchorRecord {
  return TrustAnchorRecord.create({
    id: input.id ?? TrustAnchorRecordId.from(uuid(20)),
    entity: target,
    authorityScope: targetScope,
    kind: TrustAnchorKind.OFFICIAL_REGISTRY_ENTRY,
    sourceId: input.sourceId ?? SOURCE_A,
    sourceVersion: V1,
    sourceSnapshotReference: 'snapshot:official-registry:2026-01',
    retrievedAt: input.retrievedAt ?? T0,
    validFrom: T0,
    verificationState: input.state ?? TrustAnchorVerificationState.VERIFIED,
    provenanceReference: 'prov:anchor:1',
  });
}

function registry(input: Partial<{
  target: TrustEntity;
  targetScope: AuthorityScope;
  targetAnchor: TrustAnchorRecord;
  asKnownAt: UtcInstant;
}> = {}): { target: TrustEntity; targetScope: AuthorityScope; targetAnchor: TrustAnchorRecord; snapshot: TrustRegistrySnapshot } {
  const target = input.target ?? entity();
  const targetScope = input.targetScope ?? scope(target);
  const targetAnchor = input.targetAnchor ?? anchor(target, targetScope);
  const snapshot = TrustRegistrySnapshot.create({
    id: TrustRegistrySnapshotId.from(uuid(30)),
    asKnownAt: input.asKnownAt ?? T2,
    entities: [target],
    authorityScopes: [targetScope],
    anchors: [targetAnchor],
    policyVersion: V1,
  });
  return { target, targetScope, targetAnchor, snapshot };
}

function signal(n: number, strength: IdentitySignalStrength, direction: IdentitySignalDirection, sourceId = SOURCE_A): IdentityResolutionSignal {
  return IdentityResolutionSignal.create({
    signalReference: `signal:${n}`,
    strength,
    direction,
    sourceId,
    sourceSnapshotReference: `snapshot:${n}`,
    evidenceReference: `evidence:${n}`,
  });
}

function authority(snapshot: TrustRegistrySnapshot, target: TrustEntity, input: Partial<{
  role: AuthorityRole;
  claimScope: string;
  jurisdiction: Jurisdiction;
  evaluationInstant: UtcInstant;
  asKnownAt: UtcInstant;
  conflicts: readonly string[];
}> = {}): AuthorityResolutionResult {
  return AuthorityResolutionResult.resolve({
    id: TrustResolutionId.from(uuid(80)),
    snapshot,
    entity: target,
    requestedRole: input.role ?? AuthorityRole.ISSUER,
    claimScope: input.claimScope ?? 'credential:electrical',
    jurisdiction: input.jurisdiction ?? CZ,
    evaluationInstant: input.evaluationInstant ?? T1,
    asKnownAt: input.asKnownAt ?? T2,
    conflictReferences: input.conflicts,
  });
}

test('M05S06-01 entity kinds are controlled and exact', () => {
  assert.deepEqual(Object.values(TrustEntityKind), ['PERSON','ORGANIZATION','SERVICE','REGISTRY','AUTHORITY','VERIFIER','TRUST_SERVICE_PROVIDER','ACCREDITATION_BODY','OTHER']);
});
test('M05S06-02 authority roles are controlled and exact', () => {
  assert.deepEqual(Object.values(AuthorityRole), ['ISSUER','VERIFIER','REGISTRY_OPERATOR','SUPERVISORY_BODY','TRUST_SERVICE_PROVIDER','ACCREDITATION_BODY','OTHER']);
});
test('M05S06-03 anchor verification states are exact', () => {
  assert.deepEqual(Object.values(TrustAnchorVerificationState), ['VERIFIED','UNVERIFIED','STALE','REVOKED','SUSPENDED','REVIEW_REQUIRED']);
});
test('M05S06-04 TrustEntityId requires UUIDv7', () => assert.throws(() => TrustEntityId.from('not-an-id')));
test('M05S06-05 AuthorityScopeId requires UUIDv7', () => assert.throws(() => AuthorityScopeId.from('not-an-id')));
test('M05S06-06 TrustAnchorRecordId requires UUIDv7', () => assert.throws(() => TrustAnchorRecordId.from('not-an-id')));
test('M05S06-07 trust entity requires a controlled jurisdiction', () => {
  assert.throws(() => TrustEntity.create({ id: TrustEntityId.from(uuid(2)), legalName: 'X', kind: TrustEntityKind.AUTHORITY, jurisdictions: [], identifiers: [], status: TrustEntityStatus.ACTIVE, validFrom: T0, provenanceReference: 'p' }));
});
test('M05S06-08 duplicate entity jurisdictions fail closed', () => {
  assert.throws(() => entity({ id: TrustEntityId.from(uuid(2)), jurisdictions: [CZ, CZ] }));
});
test('M05S06-09 duplicate entity identifiers fail closed', () => {
  const id = identifier(); assert.throws(() => entity({ id: TrustEntityId.from(uuid(2)), identifiers: [id, id] }));
});
test('M05S06-10 entity effective time is explicit', () => {
  const e = entity(); assert.equal(e.isEffectiveAt(T1), true); assert.equal(e.isEffectiveAt(UtcInstant.from('2025-01-01T00:00:00Z')), false);
});
test('M05S06-11 entity identifiers and jurisdictions are immutable', () => {
  const e = entity(); assert.equal(Object.isFrozen(e), true); assert.equal(Object.isFrozen(e.identifiers), true); assert.equal(Object.isFrozen(e.jurisdictions), true);
});
test('M05S06-12 authority scope binds exact entity object', () => {
  const e = entity(); assert.strictEqual(scope(e).entity, e);
});
test('M05S06-13 authority scope rejects uncontrolled role', () => {
  const e = entity(); assert.throws(() => AuthorityScope.create({ id: AuthorityScopeId.from(uuid(11)), entity: e, role: 'BOSS' as AuthorityRole, claimScope: 'x', jurisdiction: CZ, validFrom: T0, sourceId: SOURCE_A, sourceVersion: V1 }));
});
test('M05S06-14 authority scope jurisdiction must be declared by entity', () => {
  const e = entity(); assert.throws(() => scope(e, { id: AuthorityScopeId.from(uuid(11)), jurisdiction: PRAGUE }));
});
test('M05S06-15 authority scope valid-to cannot predate valid-from', () => {
  const e = entity(); assert.throws(() => AuthorityScope.create({ id: AuthorityScopeId.from(uuid(11)), entity: e, role: AuthorityRole.ISSUER, claimScope: 'x', jurisdiction: CZ, validFrom: T1, validTo: T0, sourceId: SOURCE_A, sourceVersion: V1 }));
});
test('M05S06-16 authority conditions are canonical and immutable', () => {
  const e = entity(); const s = scope(e, { conditions: ['zeta','alpha'] }); assert.deepEqual(s.conditions, ['alpha','zeta']); assert.equal(Object.isFrozen(s.conditions), true);
});
test('M05S06-17 trust anchor requires exact scope entity', () => {
  const a = entity(); const b = entity({ id: TrustEntityId.from(uuid(3)), legalName: 'Other' }); const s = scope(a); assert.throws(() => anchor(b, s));
});
test('M05S06-18 trust anchor rejects uncontrolled verification state', () => {
  const e = entity(); const s = scope(e); assert.throws(() => TrustAnchorRecord.create({ id: TrustAnchorRecordId.from(uuid(21)), entity: e, authorityScope: s, kind: TrustAnchorKind.OFFICIAL_REGISTRY_ENTRY, sourceId: SOURCE_A, sourceVersion: V1, sourceSnapshotReference: 'x', retrievedAt: T0, validFrom: T0, verificationState: 'TRUST_ME' as TrustAnchorVerificationState, provenanceReference: 'p' }));
});
test('M05S06-19 trust anchor valid-to cannot predate valid-from', () => {
  const e = entity(); const s = scope(e); assert.throws(() => TrustAnchorRecord.create({ id: TrustAnchorRecordId.from(uuid(21)), entity: e, authorityScope: s, kind: TrustAnchorKind.OFFICIAL_REGISTRY_ENTRY, sourceId: SOURCE_A, sourceVersion: V1, sourceSnapshotReference: 'x', retrievedAt: T0, validFrom: T1, validTo: T0, verificationState: TrustAnchorVerificationState.VERIFIED, provenanceReference: 'p' }));
});
test('M05S06-20 trust anchor retains exact source snapshot and version', () => {
  const r = registry(); assert.equal(r.targetAnchor.sourceSnapshotReference, 'snapshot:official-registry:2026-01'); assert.strictEqual(r.targetAnchor.sourceVersion, V1);
});
test('M05S06-21 registry snapshot preserves exact entity scope and anchor objects', () => {
  const r = registry(); assert.strictEqual(r.snapshot.entities[0], r.target); assert.strictEqual(r.snapshot.authorityScopes[0], r.targetScope); assert.strictEqual(r.snapshot.anchors[0], r.targetAnchor);
});
test('M05S06-22 duplicate entity IDs are rejected', () => {
  const a = entity(); const b = entity({ id: a.id, legalName: 'Duplicate id' }); assert.throws(() => TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(uuid(31)), asKnownAt: T2, entities: [a,b], authorityScopes: [], anchors: [], policyVersion: V1 }));
});
test('M05S06-23 duplicate scope IDs are rejected', () => {
  const e = entity(); const a = scope(e); const b = scope(e, { id: a.id, claimScope: 'other' }); assert.throws(() => TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(uuid(31)), asKnownAt: T2, entities: [e], authorityScopes: [a,b], anchors: [], policyVersion: V1 }));
});
test('M05S06-24 duplicate anchor IDs are rejected', () => {
  const e = entity(); const s = scope(e); const a = anchor(e,s); const b = anchor(e,s,{ id: a.id, sourceId: SOURCE_B }); assert.throws(() => TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(uuid(31)), asKnownAt: T2, entities: [e], authorityScopes: [s], anchors: [a,b], policyVersion: V1 }));
});
test('M05S06-25 snapshot rejects anchors retrieved after asKnownAt', () => {
  const e = entity(); const s = scope(e); const a = anchor(e,s,{ retrievedAt: T3 }); assert.throws(() => TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(uuid(31)), asKnownAt: T2, entities: [e], authorityScopes: [s], anchors: [a], policyVersion: V1 }));
});
test('M05S06-26 snapshot canonicalizes entity ordering', () => {
  const a = entity({ id: TrustEntityId.from(uuid(5)), legalName: 'A' }); const b = entity({ id: TrustEntityId.from(uuid(4)), legalName: 'B' }); const s = TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(uuid(31)), asKnownAt: T2, entities: [a,b], authorityScopes: [], anchors: [], policyVersion: V1 }); assert.deepEqual(s.entities.map((v) => v.id.toString()), [b.id.toString(), a.id.toString()]);
});
test('M05S06-27 entityById returns the exact snapshot entity', () => {
  const r = registry(); assert.strictEqual(r.snapshot.entityById(r.target.id), r.target);
});
test('M05S06-28 snapshot arrays and object are immutable', () => {
  const r = registry(); assert.equal(Object.isFrozen(r.snapshot), true); assert.equal(Object.isFrozen(r.snapshot.entities), true); assert.equal(Object.isFrozen(r.snapshot.authorityScopes), true); assert.equal(Object.isFrozen(r.snapshot.anchors), true);
});
test('M05S06-29 identity signal rejects uncontrolled strength', () => {
  assert.throws(() => IdentityResolutionSignal.create({ signalReference: 's', strength: 'MAGIC' as IdentitySignalStrength, direction: IdentitySignalDirection.MATCH, sourceId: SOURCE_A, sourceSnapshotReference: 'x', evidenceReference: 'e' }));
});
test('M05S06-30 identity signal rejects uncontrolled direction', () => {
  assert.throws(() => IdentityResolutionSignal.create({ signalReference: 's', strength: IdentitySignalStrength.VERIFIED, direction: 'MAYBE' as IdentitySignalDirection, sourceId: SOURCE_A, sourceSnapshotReference: 'x', evidenceReference: 'e' }));
});
test('M05S06-31 identity signal retains source snapshot provenance', () => {
  const s = signal(1, IdentitySignalStrength.VERIFIED, IdentitySignalDirection.MATCH); assert.equal(s.sourceSnapshotReference, 'snapshot:1'); assert.strictEqual(s.sourceId, SOURCE_A);
});
test('M05S06-32 identity resolution requires distinct records', () => {
  assert.throws(() => EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'same', rightRecordReference: 'same', signals: [], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED }));
});
test('M05S06-33 no identity signals yields INDETERMINATE', () => {
  const r = EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED }); assert.equal(r.outcome, EntityResolutionOutcome.INDETERMINATE);
});
test('M05S06-34 weak match cannot independently produce SAME_SUBJECT', () => {
  const r = EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [signal(1, IdentitySignalStrength.WEAK, IdentitySignalDirection.MATCH)], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED }); assert.equal(r.outcome, EntityResolutionOutcome.POSSIBLE_MATCH);
});
test('M05S06-35 one strong source remains POSSIBLE_MATCH', () => {
  const r = EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [signal(1, IdentitySignalStrength.AUTHORITATIVE, IdentitySignalDirection.MATCH)], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED }); assert.equal(r.outcome, EntityResolutionOutcome.POSSIBLE_MATCH);
});
test('M05S06-36 independent strong sources may establish SAME_SUBJECT', () => {
  const r = EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [signal(1, IdentitySignalStrength.AUTHORITATIVE, IdentitySignalDirection.MATCH, SOURCE_A), signal(2, IdentitySignalStrength.VERIFIED, IdentitySignalDirection.MATCH, SOURCE_B)], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED }); assert.equal(r.outcome, EntityResolutionOutcome.SAME_SUBJECT);
});
test('M05S06-37 strong conflict fails closed to REVIEW_REQUIRED by policy', () => {
  const r = EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [signal(1, IdentitySignalStrength.AUTHORITATIVE, IdentitySignalDirection.CONFLICT)], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED }); assert.equal(r.outcome, EntityResolutionOutcome.REVIEW_REQUIRED); assert.equal(r.humanReviewRequired, true);
});
test('M05S06-38 explicit strong-conflict policy may produce DIFFERENT_SUBJECTS', () => {
  const r = EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [signal(1, IdentitySignalStrength.AUTHORITATIVE, IdentitySignalDirection.CONFLICT)], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.DIFFERENT_SUBJECTS }); assert.equal(r.outcome, EntityResolutionOutcome.DIFFERENT_SUBJECTS);
});
test('M05S06-39 weak conflict fails closed to review', () => {
  const r = EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [signal(1, IdentitySignalStrength.WEAK, IdentitySignalDirection.MATCH), signal(2, IdentitySignalStrength.WEAK, IdentitySignalDirection.CONFLICT, SOURCE_B)], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED }); assert.equal(r.outcome, EntityResolutionOutcome.REVIEW_REQUIRED);
});
test('M05S06-40 duplicate identity signal references fail closed', () => {
  const a = signal(1, IdentitySignalStrength.WEAK, IdentitySignalDirection.MATCH); const b = IdentityResolutionSignal.create({ signalReference: a.signalReference, strength: IdentitySignalStrength.VERIFIED, direction: IdentitySignalDirection.MATCH, sourceId: SOURCE_B, sourceSnapshotReference: 'x', evidenceReference: 'e' }); assert.throws(() => EntityResolutionResult.resolve({ id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [a,b], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED }));
});
test('M05S06-41 identity resolution is immutable and deterministic', () => {
  const inputs = { id: TrustResolutionId.from(uuid(40)), leftRecordReference: 'a', rightRecordReference: 'b', signals: [signal(2, IdentitySignalStrength.VERIFIED, IdentitySignalDirection.MATCH, SOURCE_B), signal(1, IdentitySignalStrength.AUTHORITATIVE, IdentitySignalDirection.MATCH, SOURCE_A)], ruleVersion: V1, decidedAt: T1, strongConflictPolicy: StrongIdentityConflictPolicy.REVIEW_REQUIRED } as const; const a = EntityResolutionResult.resolve(inputs); const b = EntityResolutionResult.resolve(inputs); assert.equal(JSON.stringify(a), JSON.stringify(b)); assert.equal(Object.isFrozen(a), true); assert.equal(Object.isFrozen(a.signals), true);
});
test('M05S06-42 wrong requested role is NOT_AUTHORIZED', () => {
  const r = registry(); assert.equal(authority(r.snapshot, r.target, { role: AuthorityRole.VERIFIER }).outcome, AuthorityResolutionOutcome.NOT_AUTHORIZED);
});
test('M05S06-43 wrong claim scope is NOT_AUTHORIZED', () => {
  const r = registry(); assert.equal(authority(r.snapshot, r.target, { claimScope: 'credential:other' }).outcome, AuthorityResolutionOutcome.NOT_AUTHORIZED);
});
test('M05S06-44 wrong jurisdiction is NOT_AUTHORIZED', () => {
  const r = registry(); assert.equal(authority(r.snapshot, r.target, { jurisdiction: PRAGUE }).outcome, AuthorityResolutionOutcome.NOT_AUTHORIZED);
});
test('M05S06-45 clean verified exact scope is AUTHORIZED', () => {
  const r = registry(); const result = authority(r.snapshot, r.target); assert.equal(result.outcome, AuthorityResolutionOutcome.AUTHORIZED); assert.strictEqual(result.matchedScopes[0], r.targetScope); assert.strictEqual(result.matchedAnchors[0], r.targetAnchor);
});
test('M05S06-46 authority conditions produce AUTHORIZED_WITH_CONDITIONS', () => {
  const e = entity(); const s = scope(e, { conditions: ['requires-current-accreditation'] }); const a = anchor(e,s); const snap = TrustRegistrySnapshot.create({ id: TrustRegistrySnapshotId.from(uuid(31)), asKnownAt: T2, entities: [e], authorityScopes: [s], anchors: [a], policyVersion: V1 }); const result = authority(snap,e); assert.equal(result.outcome, AuthorityResolutionOutcome.AUTHORIZED_WITH_CONDITIONS); assert.deepEqual(result.conditions, ['requires-current-accreditation']);
});
test('M05S06-47 UNVERIFIED anchor requires review', () => {
  const e=entity(); const s=scope(e); const a=anchor(e,s,{state:TrustAnchorVerificationState.UNVERIFIED}); const snap=TrustRegistrySnapshot.create({id:TrustRegistrySnapshotId.from(uuid(31)),asKnownAt:T2,entities:[e],authorityScopes:[s],anchors:[a],policyVersion:V1}); assert.equal(authority(snap,e).outcome, AuthorityResolutionOutcome.REVIEW_REQUIRED);
});
test('M05S06-48 STALE anchor requires review', () => {
  const e=entity(); const s=scope(e); const a=anchor(e,s,{state:TrustAnchorVerificationState.STALE}); const snap=TrustRegistrySnapshot.create({id:TrustRegistrySnapshotId.from(uuid(31)),asKnownAt:T2,entities:[e],authorityScopes:[s],anchors:[a],policyVersion:V1}); assert.equal(authority(snap,e).outcome, AuthorityResolutionOutcome.REVIEW_REQUIRED);
});
test('M05S06-49 REVOKED anchor is NOT_AUTHORIZED', () => {
  const e=entity(); const s=scope(e); const a=anchor(e,s,{state:TrustAnchorVerificationState.REVOKED}); const snap=TrustRegistrySnapshot.create({id:TrustRegistrySnapshotId.from(uuid(31)),asKnownAt:T2,entities:[e],authorityScopes:[s],anchors:[a],policyVersion:V1}); assert.equal(authority(snap,e).outcome, AuthorityResolutionOutcome.NOT_AUTHORIZED);
});
test('M05S06-50 verified plus revoked anchors require review', () => {
  const e=entity(); const s=scope(e); const good=anchor(e,s,{id:TrustAnchorRecordId.from(uuid(20)),state:TrustAnchorVerificationState.VERIFIED}); const bad=anchor(e,s,{id:TrustAnchorRecordId.from(uuid(21)),state:TrustAnchorVerificationState.REVOKED,sourceId:SOURCE_B}); const snap=TrustRegistrySnapshot.create({id:TrustRegistrySnapshotId.from(uuid(31)),asKnownAt:T2,entities:[e],authorityScopes:[s],anchors:[good,bad],policyVersion:V1}); assert.equal(authority(snap,e).outcome, AuthorityResolutionOutcome.REVIEW_REQUIRED);
});
test('M05S06-51 anchors not yet known at asKnownAt cannot create authority', () => {
  const e=entity(); const s=scope(e); const late=anchor(e,s,{retrievedAt:T2}); const snap=TrustRegistrySnapshot.create({id:TrustRegistrySnapshotId.from(uuid(31)),asKnownAt:T3,entities:[e],authorityScopes:[s],anchors:[late],policyVersion:V1}); const knownBefore=UtcInstant.from('2026-06-01T00:00:00Z'); assert.equal(authority(snap,e,{asKnownAt:knownBefore}).outcome, AuthorityResolutionOutcome.INDETERMINATE);
});
test('M05S06-52 historical authority result is not rewritten by a later revoked snapshot', () => {
  const first=registry(); const oldResult=authority(first.snapshot,first.target); const revoked=anchor(first.target,first.targetScope,{id:TrustAnchorRecordId.from(uuid(22)),state:TrustAnchorVerificationState.REVOKED,retrievedAt:T3}); const later=TrustRegistrySnapshot.create({id:TrustRegistrySnapshotId.from(uuid(32)),asKnownAt:T3,entities:[first.target],authorityScopes:[first.targetScope],anchors:[revoked],policyVersion:VersionId.from('trust-v2')}); const newResult=authority(later,first.target,{asKnownAt:T3}); assert.equal(oldResult.outcome,AuthorityResolutionOutcome.AUTHORIZED); assert.equal(oldResult.matchedAnchors[0]?.verificationState,TrustAnchorVerificationState.VERIFIED); assert.equal(newResult.outcome,AuthorityResolutionOutcome.NOT_AUTHORIZED);
});
