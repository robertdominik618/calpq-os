import { Jurisdiction, SourceId, UtcInstant, VersionId } from '../../core/src/index.ts';
import {
  AuthorityResolutionResult,
  AuthorityRole,
  AuthorityScope,
  AuthorityScopeId,
  TrustAnchorKind,
  TrustAnchorRecord,
  TrustAnchorRecordId,
  TrustAnchorVerificationState,
  TrustEntity,
  TrustEntityId,
  TrustEntityKind,
  TrustEntityStatus,
  TrustRegistrySnapshot,
  TrustRegistrySnapshotId,
  TrustResolutionId,
} from '../src/trust/index.ts';

const at = UtcInstant.from('2026-01-01T00:00:00Z');
const jurisdiction = Jurisdiction.fromCode('CZ');
const source = SourceId.from('018f3f7e-1111-7abc-8def-000000000901');
const version = VersionId.from('v1');
const entity = TrustEntity.create({
  id: TrustEntityId.from('018f3f7e-1111-7abc-8def-000000000001'),
  legalName: 'Issuer',
  kind: TrustEntityKind.AUTHORITY,
  jurisdictions: [jurisdiction],
  identifiers: [],
  status: TrustEntityStatus.ACTIVE,
  validFrom: at,
  provenanceReference: 'prov',
});
const scope = AuthorityScope.create({
  id: AuthorityScopeId.from('018f3f7e-1111-7abc-8def-000000000010'),
  entity,
  role: AuthorityRole.ISSUER,
  claimScope: 'credential:test',
  jurisdiction,
  validFrom: at,
  sourceId: source,
  sourceVersion: version,
});
const anchor = TrustAnchorRecord.create({
  id: TrustAnchorRecordId.from('018f3f7e-1111-7abc-8def-000000000020'),
  entity,
  authorityScope: scope,
  kind: TrustAnchorKind.OFFICIAL_REGISTRY_ENTRY,
  sourceId: source,
  sourceVersion: version,
  sourceSnapshotReference: 'snap',
  retrievedAt: at,
  validFrom: at,
  verificationState: TrustAnchorVerificationState.VERIFIED,
  provenanceReference: 'prov',
});
const snapshot = TrustRegistrySnapshot.create({
  id: TrustRegistrySnapshotId.from('018f3f7e-1111-7abc-8def-000000000030'),
  asKnownAt: at,
  entities: [entity],
  authorityScopes: [scope],
  anchors: [anchor],
  policyVersion: version,
});
const result = AuthorityResolutionResult.resolve({
  id: TrustResolutionId.from('018f3f7e-1111-7abc-8def-000000000040'),
  snapshot,
  entity,
  requestedRole: AuthorityRole.ISSUER,
  claimScope: 'credential:test',
  jurisdiction,
  evaluationInstant: at,
  asKnownAt: at,
});

// @ts-expect-error immutable identity
entity.id = TrustEntityId.from('018f3f7e-1111-7abc-8def-000000000002');
// @ts-expect-error immutable jurisdiction collection
entity.jurisdictions.push(jurisdiction);
// @ts-expect-error immutable authority role
scope.role = AuthorityRole.VERIFIER;
// @ts-expect-error immutable anchor state
anchor.verificationState = TrustAnchorVerificationState.REVOKED;
// @ts-expect-error immutable snapshot arrays
snapshot.anchors.push(anchor);
// @ts-expect-error immutable resolution outcome
result.outcome = 'NOT_AUTHORIZED';
void result;
