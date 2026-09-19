import {
  Jurisdiction,
  SourceId,
  UtcInstant,
  VersionId,
} from '../../../core/src/index.ts';

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function requiredText(value: string, label: string, max = 1024): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > max) throw new RangeError(`${label} is too long`);
  if (CONTROL_CHARACTER_PATTERN.test(normalized)) throw new TypeError(`${label} must not contain control characters`);
  return normalized;
}

function uniqueSortedText(values: readonly string[], label: string): readonly string[] {
  if (!Array.isArray(values)) throw new TypeError(`${label} must be an array`);
  const normalized = values.map((value) => requiredText(value, label, 512));
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} must be unique`);
  normalized.sort();
  return Object.freeze(normalized);
}

function validatePeriod(validFrom: UtcInstant, validTo: UtcInstant | null, label: string): void {
  if (!(validFrom instanceof UtcInstant)) throw new TypeError(`${label} requires valid-from UtcInstant`);
  if (validTo != null && !(validTo instanceof UtcInstant)) throw new TypeError(`${label} valid-to must be UtcInstant`);
  if (validTo != null && validTo.toEpochMilliseconds() < validFrom.toEpochMilliseconds()) {
    throw new RangeError(`${label} valid-to must not predate valid-from`);
  }
}

function isEffective(validFrom: UtcInstant, validTo: UtcInstant | null, instant: UtcInstant): boolean {
  const at = instant.toEpochMilliseconds();
  return at >= validFrom.toEpochMilliseconds() && (validTo == null || at <= validTo.toEpochMilliseconds());
}

abstract class RegistryUuidV7 {
  readonly #value: string;
  protected constructor(value: string, label: string) {
    if (typeof value !== 'string' || !UUID_V7_PATTERN.test(value)) throw new TypeError(`${label} requires UUIDv7`);
    this.#value = value.toLowerCase();
    Object.freeze(this);
  }
  toString(): string { return this.#value; }
  toJSON(): string { return this.#value; }
}

export class TrustEntityId extends RegistryUuidV7 {
  private constructor(value: string) { super(value, 'TrustEntityId'); }
  static from(value: string): TrustEntityId { return new TrustEntityId(value); }
}
export class AuthorityScopeId extends RegistryUuidV7 {
  private constructor(value: string) { super(value, 'AuthorityScopeId'); }
  static from(value: string): AuthorityScopeId { return new AuthorityScopeId(value); }
}
export class TrustAnchorRecordId extends RegistryUuidV7 {
  private constructor(value: string) { super(value, 'TrustAnchorRecordId'); }
  static from(value: string): TrustAnchorRecordId { return new TrustAnchorRecordId(value); }
}
export class TrustRegistrySnapshotId extends RegistryUuidV7 {
  private constructor(value: string) { super(value, 'TrustRegistrySnapshotId'); }
  static from(value: string): TrustRegistrySnapshotId { return new TrustRegistrySnapshotId(value); }
}
export class TrustResolutionId extends RegistryUuidV7 {
  private constructor(value: string) { super(value, 'TrustResolutionId'); }
  static from(value: string): TrustResolutionId { return new TrustResolutionId(value); }
}

export const TrustEntityKind = {
  PERSON: 'PERSON',
  ORGANIZATION: 'ORGANIZATION',
  SERVICE: 'SERVICE',
  REGISTRY: 'REGISTRY',
  AUTHORITY: 'AUTHORITY',
  VERIFIER: 'VERIFIER',
  TRUST_SERVICE_PROVIDER: 'TRUST_SERVICE_PROVIDER',
  ACCREDITATION_BODY: 'ACCREDITATION_BODY',
  OTHER: 'OTHER',
} as const;
export type TrustEntityKind = (typeof TrustEntityKind)[keyof typeof TrustEntityKind];
const ENTITY_KINDS = new Set<string>(Object.values(TrustEntityKind));

export const TrustEntityStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  REVOKED: 'REVOKED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type TrustEntityStatus = (typeof TrustEntityStatus)[keyof typeof TrustEntityStatus];
const ENTITY_STATUSES = new Set<string>(Object.values(TrustEntityStatus));

export const TrustIdentifierKind = {
  LEGAL_REGISTRY_ID: 'LEGAL_REGISTRY_ID',
  TAX_ID: 'TAX_ID',
  TRUST_LIST_ID: 'TRUST_LIST_ID',
  SERVICE_ID: 'SERVICE_ID',
  DOMAIN: 'DOMAIN',
  CERTIFICATE_SUBJECT: 'CERTIFICATE_SUBJECT',
  OTHER: 'OTHER',
} as const;
export type TrustIdentifierKind = (typeof TrustIdentifierKind)[keyof typeof TrustIdentifierKind];
const IDENTIFIER_KINDS = new Set<string>(Object.values(TrustIdentifierKind));

export const AuthorityRole = {
  ISSUER: 'ISSUER',
  VERIFIER: 'VERIFIER',
  REGISTRY_OPERATOR: 'REGISTRY_OPERATOR',
  SUPERVISORY_BODY: 'SUPERVISORY_BODY',
  TRUST_SERVICE_PROVIDER: 'TRUST_SERVICE_PROVIDER',
  ACCREDITATION_BODY: 'ACCREDITATION_BODY',
  OTHER: 'OTHER',
} as const;
export type AuthorityRole = (typeof AuthorityRole)[keyof typeof AuthorityRole];
const AUTHORITY_ROLES = new Set<string>(Object.values(AuthorityRole));

export const TrustAnchorKind = {
  OFFICIAL_REGISTRY_ENTRY: 'OFFICIAL_REGISTRY_ENTRY',
  TRUSTED_LIST_ENTRY: 'TRUSTED_LIST_ENTRY',
  SUPERVISORY_DECISION: 'SUPERVISORY_DECISION',
  ACCREDITATION_RECORD: 'ACCREDITATION_RECORD',
  OFFICIAL_KEY_CERTIFICATE_METADATA: 'OFFICIAL_KEY_CERTIFICATE_METADATA',
  ORGANIZATIONAL_TRUST_POLICY: 'ORGANIZATIONAL_TRUST_POLICY',
} as const;
export type TrustAnchorKind = (typeof TrustAnchorKind)[keyof typeof TrustAnchorKind];
const ANCHOR_KINDS = new Set<string>(Object.values(TrustAnchorKind));

export const TrustAnchorVerificationState = {
  VERIFIED: 'VERIFIED',
  UNVERIFIED: 'UNVERIFIED',
  STALE: 'STALE',
  REVOKED: 'REVOKED',
  SUSPENDED: 'SUSPENDED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type TrustAnchorVerificationState = (typeof TrustAnchorVerificationState)[keyof typeof TrustAnchorVerificationState];
const ANCHOR_STATES = new Set<string>(Object.values(TrustAnchorVerificationState));

export class TrustIdentifier {
  readonly kind: TrustIdentifierKind;
  readonly value: string;
  readonly sourceReference: string;

  private constructor(kind: TrustIdentifierKind, value: string, sourceReference: string) {
    this.kind = kind;
    this.value = value;
    this.sourceReference = sourceReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly kind: TrustIdentifierKind;
    readonly value: string;
    readonly sourceReference: string;
  }): TrustIdentifier {
    if (!IDENTIFIER_KINDS.has(input.kind)) throw new TypeError('Trust identifier kind must be controlled');
    return new TrustIdentifier(
      input.kind,
      requiredText(input.value, 'Trust identifier value', 512),
      requiredText(input.sourceReference, 'Trust identifier source reference'),
    );
  }

  toJSON() {
    return Object.freeze({ kind: this.kind, value: this.value, sourceReference: this.sourceReference });
  }
}

export class TrustEntity {
  readonly id: TrustEntityId;
  readonly legalName: string;
  readonly displayName: string;
  readonly kind: TrustEntityKind;
  readonly jurisdictions: readonly Jurisdiction[];
  readonly identifiers: readonly TrustIdentifier[];
  readonly status: TrustEntityStatus;
  readonly validFrom: UtcInstant;
  readonly validTo: UtcInstant | null;
  readonly provenanceReference: string;

  private constructor(input: {
    readonly id: TrustEntityId;
    readonly legalName: string;
    readonly displayName: string;
    readonly kind: TrustEntityKind;
    readonly jurisdictions: readonly Jurisdiction[];
    readonly identifiers: readonly TrustIdentifier[];
    readonly status: TrustEntityStatus;
    readonly validFrom: UtcInstant;
    readonly validTo: UtcInstant | null;
    readonly provenanceReference: string;
  }) {
    this.id = input.id;
    this.legalName = input.legalName;
    this.displayName = input.displayName;
    this.kind = input.kind;
    this.jurisdictions = input.jurisdictions;
    this.identifiers = input.identifiers;
    this.status = input.status;
    this.validFrom = input.validFrom;
    this.validTo = input.validTo;
    this.provenanceReference = input.provenanceReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly id: TrustEntityId;
    readonly legalName: string;
    readonly displayName?: string;
    readonly kind: TrustEntityKind;
    readonly jurisdictions: readonly Jurisdiction[];
    readonly identifiers: readonly TrustIdentifier[];
    readonly status: TrustEntityStatus;
    readonly validFrom: UtcInstant;
    readonly validTo?: UtcInstant | null;
    readonly provenanceReference: string;
  }): TrustEntity {
    if (!(input.id instanceof TrustEntityId)) throw new TypeError('Trust entity requires TrustEntityId');
    if (!ENTITY_KINDS.has(input.kind)) throw new TypeError('Trust entity kind must be controlled');
    if (!ENTITY_STATUSES.has(input.status)) throw new TypeError('Trust entity status must be controlled');
    if (!Array.isArray(input.jurisdictions) || input.jurisdictions.length === 0 || input.jurisdictions.some((value) => !(value instanceof Jurisdiction))) {
      throw new TypeError('Trust entity requires controlled jurisdictions');
    }
    const jurisdictionKeys = input.jurisdictions.map(String);
    if (new Set(jurisdictionKeys).size !== jurisdictionKeys.length) throw new TypeError('Trust entity jurisdictions must be unique');
    if (!Array.isArray(input.identifiers) || input.identifiers.some((value) => !(value instanceof TrustIdentifier))) {
      throw new TypeError('Trust entity identifiers must use TrustIdentifier');
    }
    const identifierKeys = input.identifiers.map((value) => `${value.kind}:${value.value}`);
    if (new Set(identifierKeys).size !== identifierKeys.length) throw new TypeError('Trust entity identifiers must be unique');
    const validTo = input.validTo ?? null;
    validatePeriod(input.validFrom, validTo, 'Trust entity');
    const jurisdictions = [...input.jurisdictions].sort((a, b) => a.toString().localeCompare(b.toString()));
    const identifiers = [...input.identifiers].sort((a, b) => `${a.kind}:${a.value}`.localeCompare(`${b.kind}:${b.value}`));
    return new TrustEntity({
      id: input.id,
      legalName: requiredText(input.legalName, 'Trust entity legal name', 512),
      displayName: requiredText(input.displayName ?? input.legalName, 'Trust entity display name', 512),
      kind: input.kind,
      jurisdictions: Object.freeze(jurisdictions),
      identifiers: Object.freeze(identifiers),
      status: input.status,
      validFrom: input.validFrom,
      validTo,
      provenanceReference: requiredText(input.provenanceReference, 'Trust entity provenance reference'),
    });
  }

  isEffectiveAt(instant: UtcInstant): boolean {
    if (!(instant instanceof UtcInstant)) throw new TypeError('Trust entity effective query requires UtcInstant');
    return isEffective(this.validFrom, this.validTo, instant);
  }

  toJSON() {
    return Object.freeze({
      id: this.id.toString(),
      legalName: this.legalName,
      displayName: this.displayName,
      kind: this.kind,
      jurisdictions: Object.freeze(this.jurisdictions.map((value) => value.toJSON())),
      identifiers: Object.freeze(this.identifiers.map((value) => value.toJSON())),
      status: this.status,
      validFrom: this.validFrom.toString(),
      validTo: this.validTo?.toString() ?? null,
      provenanceReference: this.provenanceReference,
    });
  }
}

export class AuthorityScope {
  readonly id: AuthorityScopeId;
  readonly entity: TrustEntity;
  readonly role: AuthorityRole;
  readonly claimScope: string;
  readonly jurisdiction: Jurisdiction;
  readonly validFrom: UtcInstant;
  readonly validTo: UtcInstant | null;
  readonly sourceId: SourceId;
  readonly sourceVersion: VersionId;
  readonly conditions: readonly string[];
  readonly limitations: readonly string[];

  private constructor(input: {
    readonly id: AuthorityScopeId;
    readonly entity: TrustEntity;
    readonly role: AuthorityRole;
    readonly claimScope: string;
    readonly jurisdiction: Jurisdiction;
    readonly validFrom: UtcInstant;
    readonly validTo: UtcInstant | null;
    readonly sourceId: SourceId;
    readonly sourceVersion: VersionId;
    readonly conditions: readonly string[];
    readonly limitations: readonly string[];
  }) {
    this.id = input.id;
    this.entity = input.entity;
    this.role = input.role;
    this.claimScope = input.claimScope;
    this.jurisdiction = input.jurisdiction;
    this.validFrom = input.validFrom;
    this.validTo = input.validTo;
    this.sourceId = input.sourceId;
    this.sourceVersion = input.sourceVersion;
    this.conditions = input.conditions;
    this.limitations = input.limitations;
    Object.freeze(this);
  }

  static create(input: {
    readonly id: AuthorityScopeId;
    readonly entity: TrustEntity;
    readonly role: AuthorityRole;
    readonly claimScope: string;
    readonly jurisdiction: Jurisdiction;
    readonly validFrom: UtcInstant;
    readonly validTo?: UtcInstant | null;
    readonly sourceId: SourceId;
    readonly sourceVersion: VersionId;
    readonly conditions?: readonly string[];
    readonly limitations?: readonly string[];
  }): AuthorityScope {
    if (!(input.id instanceof AuthorityScopeId)) throw new TypeError('Authority scope requires AuthorityScopeId');
    if (!(input.entity instanceof TrustEntity)) throw new TypeError('Authority scope requires TrustEntity');
    if (!AUTHORITY_ROLES.has(input.role)) throw new TypeError('Authority role must be controlled');
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Authority scope requires controlled Jurisdiction');
    if (!input.entity.jurisdictions.some((value) => value.toString() === input.jurisdiction.toString())) {
      throw new TypeError('Authority scope jurisdiction must be declared by the TrustEntity');
    }
    if (!(input.sourceId instanceof SourceId)) throw new TypeError('Authority scope requires SourceId');
    if (!(input.sourceVersion instanceof VersionId)) throw new TypeError('Authority scope requires VersionId');
    const validTo = input.validTo ?? null;
    validatePeriod(input.validFrom, validTo, 'Authority scope');
    return new AuthorityScope({
      id: input.id,
      entity: input.entity,
      role: input.role,
      claimScope: requiredText(input.claimScope, 'Authority claim scope', 512),
      jurisdiction: input.jurisdiction,
      validFrom: input.validFrom,
      validTo,
      sourceId: input.sourceId,
      sourceVersion: input.sourceVersion,
      conditions: uniqueSortedText(input.conditions ?? [], 'Authority condition'),
      limitations: uniqueSortedText(input.limitations ?? [], 'Authority limitation'),
    });
  }

  isEffectiveAt(instant: UtcInstant): boolean {
    if (!(instant instanceof UtcInstant)) throw new TypeError('Authority scope effective query requires UtcInstant');
    return isEffective(this.validFrom, this.validTo, instant);
  }

  toJSON() {
    return Object.freeze({
      id: this.id.toString(),
      entityId: this.entity.id.toString(),
      role: this.role,
      claimScope: this.claimScope,
      jurisdiction: this.jurisdiction.toJSON(),
      validFrom: this.validFrom.toString(),
      validTo: this.validTo?.toString() ?? null,
      sourceId: this.sourceId.toString(),
      sourceVersion: this.sourceVersion.toString(),
      conditions: Object.freeze([...this.conditions]),
      limitations: Object.freeze([...this.limitations]),
    });
  }
}

export class TrustAnchorRecord {
  readonly id: TrustAnchorRecordId;
  readonly entity: TrustEntity;
  readonly authorityScope: AuthorityScope;
  readonly kind: TrustAnchorKind;
  readonly sourceId: SourceId;
  readonly sourceVersion: VersionId;
  readonly sourceSnapshotReference: string;
  readonly retrievedAt: UtcInstant;
  readonly validFrom: UtcInstant;
  readonly validTo: UtcInstant | null;
  readonly verificationState: TrustAnchorVerificationState;
  readonly provenanceReference: string;

  private constructor(input: {
    readonly id: TrustAnchorRecordId;
    readonly entity: TrustEntity;
    readonly authorityScope: AuthorityScope;
    readonly kind: TrustAnchorKind;
    readonly sourceId: SourceId;
    readonly sourceVersion: VersionId;
    readonly sourceSnapshotReference: string;
    readonly retrievedAt: UtcInstant;
    readonly validFrom: UtcInstant;
    readonly validTo: UtcInstant | null;
    readonly verificationState: TrustAnchorVerificationState;
    readonly provenanceReference: string;
  }) {
    this.id = input.id;
    this.entity = input.entity;
    this.authorityScope = input.authorityScope;
    this.kind = input.kind;
    this.sourceId = input.sourceId;
    this.sourceVersion = input.sourceVersion;
    this.sourceSnapshotReference = input.sourceSnapshotReference;
    this.retrievedAt = input.retrievedAt;
    this.validFrom = input.validFrom;
    this.validTo = input.validTo;
    this.verificationState = input.verificationState;
    this.provenanceReference = input.provenanceReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly id: TrustAnchorRecordId;
    readonly entity: TrustEntity;
    readonly authorityScope: AuthorityScope;
    readonly kind: TrustAnchorKind;
    readonly sourceId: SourceId;
    readonly sourceVersion: VersionId;
    readonly sourceSnapshotReference: string;
    readonly retrievedAt: UtcInstant;
    readonly validFrom: UtcInstant;
    readonly validTo?: UtcInstant | null;
    readonly verificationState: TrustAnchorVerificationState;
    readonly provenanceReference: string;
  }): TrustAnchorRecord {
    if (!(input.id instanceof TrustAnchorRecordId)) throw new TypeError('Trust anchor requires TrustAnchorRecordId');
    if (!(input.entity instanceof TrustEntity)) throw new TypeError('Trust anchor requires TrustEntity');
    if (!(input.authorityScope instanceof AuthorityScope)) throw new TypeError('Trust anchor requires AuthorityScope');
    if (input.authorityScope.entity !== input.entity) throw new TypeError('Trust anchor entity must exactly match authority-scope entity');
    if (!ANCHOR_KINDS.has(input.kind)) throw new TypeError('Trust anchor kind must be controlled');
    if (!(input.sourceId instanceof SourceId)) throw new TypeError('Trust anchor requires SourceId');
    if (!(input.sourceVersion instanceof VersionId)) throw new TypeError('Trust anchor requires VersionId');
    if (!(input.retrievedAt instanceof UtcInstant)) throw new TypeError('Trust anchor requires retrieved-at UtcInstant');
    if (!ANCHOR_STATES.has(input.verificationState)) throw new TypeError('Trust anchor verification state must be controlled');
    const validTo = input.validTo ?? null;
    validatePeriod(input.validFrom, validTo, 'Trust anchor');
    return new TrustAnchorRecord({
      id: input.id,
      entity: input.entity,
      authorityScope: input.authorityScope,
      kind: input.kind,
      sourceId: input.sourceId,
      sourceVersion: input.sourceVersion,
      sourceSnapshotReference: requiredText(input.sourceSnapshotReference, 'Trust anchor source snapshot reference'),
      retrievedAt: input.retrievedAt,
      validFrom: input.validFrom,
      validTo,
      verificationState: input.verificationState,
      provenanceReference: requiredText(input.provenanceReference, 'Trust anchor provenance reference'),
    });
  }

  isEffectiveAt(instant: UtcInstant): boolean {
    if (!(instant instanceof UtcInstant)) throw new TypeError('Trust anchor effective query requires UtcInstant');
    return isEffective(this.validFrom, this.validTo, instant);
  }

  toJSON() {
    return Object.freeze({
      id: this.id.toString(),
      entityId: this.entity.id.toString(),
      authorityScopeId: this.authorityScope.id.toString(),
      kind: this.kind,
      sourceId: this.sourceId.toString(),
      sourceVersion: this.sourceVersion.toString(),
      sourceSnapshotReference: this.sourceSnapshotReference,
      retrievedAt: this.retrievedAt.toString(),
      validFrom: this.validFrom.toString(),
      validTo: this.validTo?.toString() ?? null,
      verificationState: this.verificationState,
      provenanceReference: this.provenanceReference,
    });
  }
}

export class TrustRegistrySnapshot {
  readonly id: TrustRegistrySnapshotId;
  readonly asKnownAt: UtcInstant;
  readonly entities: readonly TrustEntity[];
  readonly authorityScopes: readonly AuthorityScope[];
  readonly anchors: readonly TrustAnchorRecord[];
  readonly policyVersion: VersionId;

  private constructor(input: {
    readonly id: TrustRegistrySnapshotId;
    readonly asKnownAt: UtcInstant;
    readonly entities: readonly TrustEntity[];
    readonly authorityScopes: readonly AuthorityScope[];
    readonly anchors: readonly TrustAnchorRecord[];
    readonly policyVersion: VersionId;
  }) {
    this.id = input.id;
    this.asKnownAt = input.asKnownAt;
    this.entities = input.entities;
    this.authorityScopes = input.authorityScopes;
    this.anchors = input.anchors;
    this.policyVersion = input.policyVersion;
    Object.freeze(this);
  }

  static create(input: {
    readonly id: TrustRegistrySnapshotId;
    readonly asKnownAt: UtcInstant;
    readonly entities: readonly TrustEntity[];
    readonly authorityScopes: readonly AuthorityScope[];
    readonly anchors: readonly TrustAnchorRecord[];
    readonly policyVersion: VersionId;
  }): TrustRegistrySnapshot {
    if (!(input.id instanceof TrustRegistrySnapshotId)) throw new TypeError('Trust registry snapshot requires TrustRegistrySnapshotId');
    if (!(input.asKnownAt instanceof UtcInstant)) throw new TypeError('Trust registry snapshot requires as-known-at UtcInstant');
    if (!(input.policyVersion instanceof VersionId)) throw new TypeError('Trust registry snapshot requires policy VersionId');
    if (!Array.isArray(input.entities) || input.entities.some((value) => !(value instanceof TrustEntity))) throw new TypeError('Trust registry entities must use TrustEntity');
    if (!Array.isArray(input.authorityScopes) || input.authorityScopes.some((value) => !(value instanceof AuthorityScope))) throw new TypeError('Trust registry scopes must use AuthorityScope');
    if (!Array.isArray(input.anchors) || input.anchors.some((value) => !(value instanceof TrustAnchorRecord))) throw new TypeError('Trust registry anchors must use TrustAnchorRecord');

    const entities = [...input.entities].sort((a, b) => a.id.toString().localeCompare(b.id.toString()));
    const scopes = [...input.authorityScopes].sort((a, b) => a.id.toString().localeCompare(b.id.toString()));
    const anchors = [...input.anchors].sort((a, b) => a.id.toString().localeCompare(b.id.toString()));
    const entitySet = new Set(entities);
    const scopeSet = new Set(scopes);
    if (new Set(entities.map((value) => value.id.toString())).size !== entities.length) throw new TypeError('Trust registry entity IDs must be unique');
    if (new Set(scopes.map((value) => value.id.toString())).size !== scopes.length) throw new TypeError('Trust registry scope IDs must be unique');
    if (new Set(anchors.map((value) => value.id.toString())).size !== anchors.length) throw new TypeError('Trust registry anchor IDs must be unique');
    for (const scope of scopes) {
      if (!entitySet.has(scope.entity)) throw new TypeError('Trust registry scope must reference an exact entity in the snapshot');
    }
    for (const anchor of anchors) {
      if (!entitySet.has(anchor.entity) || !scopeSet.has(anchor.authorityScope)) {
        throw new TypeError('Trust registry anchor must reference exact entity and scope objects in the snapshot');
      }
      if (anchor.retrievedAt.toEpochMilliseconds() > input.asKnownAt.toEpochMilliseconds()) {
        throw new RangeError('Trust registry snapshot cannot contain an anchor retrieved after asKnownAt');
      }
    }
    return new TrustRegistrySnapshot({
      id: input.id,
      asKnownAt: input.asKnownAt,
      entities: Object.freeze(entities),
      authorityScopes: Object.freeze(scopes),
      anchors: Object.freeze(anchors),
      policyVersion: input.policyVersion,
    });
  }

  entityById(id: TrustEntityId): TrustEntity | null {
    if (!(id instanceof TrustEntityId)) throw new TypeError('Trust registry lookup requires TrustEntityId');
    return this.entities.find((entity) => entity.id.toString() === id.toString()) ?? null;
  }

  toJSON() {
    return Object.freeze({
      id: this.id.toString(),
      asKnownAt: this.asKnownAt.toString(),
      policyVersion: this.policyVersion.toString(),
      entities: Object.freeze(this.entities.map((value) => value.toJSON())),
      authorityScopes: Object.freeze(this.authorityScopes.map((value) => value.toJSON())),
      anchors: Object.freeze(this.anchors.map((value) => value.toJSON())),
    });
  }
}

export const IdentitySignalStrength = {
  AUTHORITATIVE: 'AUTHORITATIVE',
  VERIFIED: 'VERIFIED',
  WEAK: 'WEAK',
} as const;
export type IdentitySignalStrength = (typeof IdentitySignalStrength)[keyof typeof IdentitySignalStrength];
const IDENTITY_STRENGTHS = new Set<string>(Object.values(IdentitySignalStrength));

export const IdentitySignalDirection = {
  MATCH: 'MATCH',
  CONFLICT: 'CONFLICT',
} as const;
export type IdentitySignalDirection = (typeof IdentitySignalDirection)[keyof typeof IdentitySignalDirection];
const IDENTITY_DIRECTIONS = new Set<string>(Object.values(IdentitySignalDirection));

export class IdentityResolutionSignal {
  readonly signalReference: string;
  readonly strength: IdentitySignalStrength;
  readonly direction: IdentitySignalDirection;
  readonly sourceId: SourceId;
  readonly sourceSnapshotReference: string;
  readonly evidenceReference: string;

  private constructor(input: {
    readonly signalReference: string;
    readonly strength: IdentitySignalStrength;
    readonly direction: IdentitySignalDirection;
    readonly sourceId: SourceId;
    readonly sourceSnapshotReference: string;
    readonly evidenceReference: string;
  }) {
    this.signalReference = input.signalReference;
    this.strength = input.strength;
    this.direction = input.direction;
    this.sourceId = input.sourceId;
    this.sourceSnapshotReference = input.sourceSnapshotReference;
    this.evidenceReference = input.evidenceReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly signalReference: string;
    readonly strength: IdentitySignalStrength;
    readonly direction: IdentitySignalDirection;
    readonly sourceId: SourceId;
    readonly sourceSnapshotReference: string;
    readonly evidenceReference: string;
  }): IdentityResolutionSignal {
    if (!IDENTITY_STRENGTHS.has(input.strength)) throw new TypeError('Identity signal strength must be controlled');
    if (!IDENTITY_DIRECTIONS.has(input.direction)) throw new TypeError('Identity signal direction must be controlled');
    if (!(input.sourceId instanceof SourceId)) throw new TypeError('Identity signal requires SourceId');
    return new IdentityResolutionSignal({
      signalReference: requiredText(input.signalReference, 'Identity signal reference'),
      strength: input.strength,
      direction: input.direction,
      sourceId: input.sourceId,
      sourceSnapshotReference: requiredText(input.sourceSnapshotReference, 'Identity signal source snapshot reference'),
      evidenceReference: requiredText(input.evidenceReference, 'Identity signal evidence reference'),
    });
  }

  toJSON() {
    return Object.freeze({
      signalReference: this.signalReference,
      strength: this.strength,
      direction: this.direction,
      sourceId: this.sourceId.toString(),
      sourceSnapshotReference: this.sourceSnapshotReference,
      evidenceReference: this.evidenceReference,
    });
  }
}

export const EntityResolutionOutcome = {
  SAME_SUBJECT: 'SAME_SUBJECT',
  DIFFERENT_SUBJECTS: 'DIFFERENT_SUBJECTS',
  POSSIBLE_MATCH: 'POSSIBLE_MATCH',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  INDETERMINATE: 'INDETERMINATE',
} as const;
export type EntityResolutionOutcome = (typeof EntityResolutionOutcome)[keyof typeof EntityResolutionOutcome];

export const StrongIdentityConflictPolicy = {
  DIFFERENT_SUBJECTS: 'DIFFERENT_SUBJECTS',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type StrongIdentityConflictPolicy = (typeof StrongIdentityConflictPolicy)[keyof typeof StrongIdentityConflictPolicy];
const STRONG_CONFLICT_POLICIES = new Set<string>(Object.values(StrongIdentityConflictPolicy));

export class EntityResolutionResult {
  readonly id: TrustResolutionId;
  readonly leftRecordReference: string;
  readonly rightRecordReference: string;
  readonly outcome: EntityResolutionOutcome;
  readonly ruleVersion: VersionId;
  readonly signals: readonly IdentityResolutionSignal[];
  readonly decidedAt: UtcInstant;
  readonly reasonCodes: readonly string[];
  readonly humanReviewRequired: boolean;

  private constructor(input: {
    readonly id: TrustResolutionId;
    readonly leftRecordReference: string;
    readonly rightRecordReference: string;
    readonly outcome: EntityResolutionOutcome;
    readonly ruleVersion: VersionId;
    readonly signals: readonly IdentityResolutionSignal[];
    readonly decidedAt: UtcInstant;
    readonly reasonCodes: readonly string[];
    readonly humanReviewRequired: boolean;
  }) {
    this.id = input.id;
    this.leftRecordReference = input.leftRecordReference;
    this.rightRecordReference = input.rightRecordReference;
    this.outcome = input.outcome;
    this.ruleVersion = input.ruleVersion;
    this.signals = input.signals;
    this.decidedAt = input.decidedAt;
    this.reasonCodes = input.reasonCodes;
    this.humanReviewRequired = input.humanReviewRequired;
    Object.freeze(this);
  }

  static resolve(input: {
    readonly id: TrustResolutionId;
    readonly leftRecordReference: string;
    readonly rightRecordReference: string;
    readonly signals: readonly IdentityResolutionSignal[];
    readonly ruleVersion: VersionId;
    readonly decidedAt: UtcInstant;
    readonly strongConflictPolicy: StrongIdentityConflictPolicy;
  }): EntityResolutionResult {
    if (!(input.id instanceof TrustResolutionId)) throw new TypeError('Entity resolution requires TrustResolutionId');
    const left = requiredText(input.leftRecordReference, 'Left identity record reference');
    const right = requiredText(input.rightRecordReference, 'Right identity record reference');
    if (left === right) throw new TypeError('Entity resolution requires two distinct identity records');
    if (!Array.isArray(input.signals) || input.signals.some((value) => !(value instanceof IdentityResolutionSignal))) {
      throw new TypeError('Entity resolution signals must use IdentityResolutionSignal');
    }
    if (!(input.ruleVersion instanceof VersionId)) throw new TypeError('Entity resolution requires rule VersionId');
    if (!(input.decidedAt instanceof UtcInstant)) throw new TypeError('Entity resolution requires decided-at UtcInstant');
    if (!STRONG_CONFLICT_POLICIES.has(input.strongConflictPolicy)) throw new TypeError('Strong identity conflict policy must be controlled');
    const signals = [...input.signals].sort((a, b) => a.signalReference.localeCompare(b.signalReference));
    if (new Set(signals.map((value) => value.signalReference)).size !== signals.length) throw new TypeError('Identity signal references must be unique');

    const strongConflict = signals.some((signal) =>
      signal.direction === IdentitySignalDirection.CONFLICT && signal.strength !== IdentitySignalStrength.WEAK);
    const strongMatchSources = new Set(signals
      .filter((signal) => signal.direction === IdentitySignalDirection.MATCH && signal.strength !== IdentitySignalStrength.WEAK)
      .map((signal) => signal.sourceId.toString()));
    const weakMatch = signals.some((signal) => signal.direction === IdentitySignalDirection.MATCH && signal.strength === IdentitySignalStrength.WEAK);
    const weakConflict = signals.some((signal) => signal.direction === IdentitySignalDirection.CONFLICT && signal.strength === IdentitySignalStrength.WEAK);

    let outcome: EntityResolutionOutcome;
    const reasons: string[] = [];
    if (strongConflict) {
      outcome = input.strongConflictPolicy === StrongIdentityConflictPolicy.DIFFERENT_SUBJECTS
        ? EntityResolutionOutcome.DIFFERENT_SUBJECTS
        : EntityResolutionOutcome.REVIEW_REQUIRED;
      reasons.push('STRONG_IDENTITY_CONFLICT');
    } else if (strongMatchSources.size >= 2) {
      outcome = EntityResolutionOutcome.SAME_SUBJECT;
      reasons.push('MULTI_SOURCE_STRONG_MATCH');
    } else if (strongMatchSources.size === 1 || weakMatch) {
      outcome = weakConflict ? EntityResolutionOutcome.REVIEW_REQUIRED : EntityResolutionOutcome.POSSIBLE_MATCH;
      reasons.push(weakConflict ? 'WEAK_CONFLICT_REQUIRES_REVIEW' : 'INSUFFICIENT_INDEPENDENT_STRONG_MATCH');
    } else if (weakConflict) {
      outcome = EntityResolutionOutcome.REVIEW_REQUIRED;
      reasons.push('WEAK_CONFLICT_WITHOUT_POSITIVE_RESOLUTION');
    } else {
      outcome = EntityResolutionOutcome.INDETERMINATE;
      reasons.push('NO_RESOLUTION_EVIDENCE');
    }

    return new EntityResolutionResult({
      id: input.id,
      leftRecordReference: left,
      rightRecordReference: right,
      outcome,
      ruleVersion: input.ruleVersion,
      signals: Object.freeze(signals),
      decidedAt: input.decidedAt,
      reasonCodes: Object.freeze(reasons),
      humanReviewRequired: outcome === EntityResolutionOutcome.REVIEW_REQUIRED,
    });
  }

  toJSON() {
    return Object.freeze({
      id: this.id.toString(),
      leftRecordReference: this.leftRecordReference,
      rightRecordReference: this.rightRecordReference,
      outcome: this.outcome,
      ruleVersion: this.ruleVersion.toString(),
      signals: Object.freeze(this.signals.map((value) => value.toJSON())),
      decidedAt: this.decidedAt.toString(),
      reasonCodes: Object.freeze([...this.reasonCodes]),
      humanReviewRequired: this.humanReviewRequired,
    });
  }
}

export const AuthorityResolutionOutcome = {
  AUTHORIZED: 'AUTHORIZED',
  AUTHORIZED_WITH_CONDITIONS: 'AUTHORIZED_WITH_CONDITIONS',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
  INDETERMINATE: 'INDETERMINATE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type AuthorityResolutionOutcome = (typeof AuthorityResolutionOutcome)[keyof typeof AuthorityResolutionOutcome];

export class AuthorityResolutionResult {
  readonly id: TrustResolutionId;
  readonly snapshot: TrustRegistrySnapshot;
  readonly entity: TrustEntity;
  readonly requestedRole: AuthorityRole;
  readonly claimScope: string;
  readonly jurisdiction: Jurisdiction;
  readonly evaluationInstant: UtcInstant;
  readonly asKnownAt: UtcInstant;
  readonly outcome: AuthorityResolutionOutcome;
  readonly matchedScopes: readonly AuthorityScope[];
  readonly matchedAnchors: readonly TrustAnchorRecord[];
  readonly conditions: readonly string[];
  readonly limitations: readonly string[];
  readonly reasonCodes: readonly string[];
  readonly conflictReferences: readonly string[];

  private constructor(input: {
    readonly id: TrustResolutionId;
    readonly snapshot: TrustRegistrySnapshot;
    readonly entity: TrustEntity;
    readonly requestedRole: AuthorityRole;
    readonly claimScope: string;
    readonly jurisdiction: Jurisdiction;
    readonly evaluationInstant: UtcInstant;
    readonly asKnownAt: UtcInstant;
    readonly outcome: AuthorityResolutionOutcome;
    readonly matchedScopes: readonly AuthorityScope[];
    readonly matchedAnchors: readonly TrustAnchorRecord[];
    readonly conditions: readonly string[];
    readonly limitations: readonly string[];
    readonly reasonCodes: readonly string[];
    readonly conflictReferences: readonly string[];
  }) {
    this.id = input.id;
    this.snapshot = input.snapshot;
    this.entity = input.entity;
    this.requestedRole = input.requestedRole;
    this.claimScope = input.claimScope;
    this.jurisdiction = input.jurisdiction;
    this.evaluationInstant = input.evaluationInstant;
    this.asKnownAt = input.asKnownAt;
    this.outcome = input.outcome;
    this.matchedScopes = input.matchedScopes;
    this.matchedAnchors = input.matchedAnchors;
    this.conditions = input.conditions;
    this.limitations = input.limitations;
    this.reasonCodes = input.reasonCodes;
    this.conflictReferences = input.conflictReferences;
    Object.freeze(this);
  }

  static resolve(input: {
    readonly id: TrustResolutionId;
    readonly snapshot: TrustRegistrySnapshot;
    readonly entity: TrustEntity;
    readonly requestedRole: AuthorityRole;
    readonly claimScope: string;
    readonly jurisdiction: Jurisdiction;
    readonly evaluationInstant: UtcInstant;
    readonly asKnownAt: UtcInstant;
    readonly conflictReferences?: readonly string[];
  }): AuthorityResolutionResult {
    if (!(input.id instanceof TrustResolutionId)) throw new TypeError('Authority resolution requires TrustResolutionId');
    if (!(input.snapshot instanceof TrustRegistrySnapshot)) throw new TypeError('Authority resolution requires TrustRegistrySnapshot');
    if (!(input.entity instanceof TrustEntity) || !input.snapshot.entities.includes(input.entity)) {
      throw new TypeError('Authority resolution entity must be the exact TrustEntity from the snapshot');
    }
    if (!AUTHORITY_ROLES.has(input.requestedRole)) throw new TypeError('Requested authority role must be controlled');
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Authority resolution requires controlled Jurisdiction');
    if (!(input.evaluationInstant instanceof UtcInstant) || !(input.asKnownAt instanceof UtcInstant)) {
      throw new TypeError('Authority resolution requires explicit evaluation and knowledge instants');
    }
    if (input.asKnownAt.toEpochMilliseconds() < input.evaluationInstant.toEpochMilliseconds()) {
      throw new RangeError('Authority resolution asKnownAt must not predate evaluationInstant');
    }
    if (input.asKnownAt.toEpochMilliseconds() > input.snapshot.asKnownAt.toEpochMilliseconds()) {
      throw new RangeError('Authority resolution cannot know beyond registry snapshot asKnownAt');
    }
    const claimScope = requiredText(input.claimScope, 'Requested authority claim scope', 512);
    const conflicts = uniqueSortedText(input.conflictReferences ?? [], 'Authority conflict reference');

    const scopes = input.snapshot.authorityScopes.filter((scope) =>
      scope.entity === input.entity &&
      scope.role === input.requestedRole &&
      scope.claimScope === claimScope &&
      scope.jurisdiction.toString() === input.jurisdiction.toString() &&
      scope.isEffectiveAt(input.evaluationInstant));
    scopes.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

    const anchors = input.snapshot.anchors.filter((anchor) =>
      scopes.includes(anchor.authorityScope) &&
      anchor.entity === input.entity &&
      anchor.isEffectiveAt(input.evaluationInstant) &&
      anchor.retrievedAt.toEpochMilliseconds() <= input.asKnownAt.toEpochMilliseconds());
    anchors.sort((a, b) => a.id.toString().localeCompare(b.id.toString()));

    const conditions = uniqueSortedText(scopes.flatMap((scope) => [...scope.conditions]), 'Resolved authority condition');
    const limitations = uniqueSortedText(scopes.flatMap((scope) => [...scope.limitations]), 'Resolved authority limitation');
    const states = new Set(anchors.map((anchor) => anchor.verificationState));
    const hasVerified = states.has(TrustAnchorVerificationState.VERIFIED);
    const hasAdverse = states.has(TrustAnchorVerificationState.REVOKED) || states.has(TrustAnchorVerificationState.SUSPENDED);
    const hasReviewState = states.has(TrustAnchorVerificationState.UNVERIFIED) || states.has(TrustAnchorVerificationState.STALE) || states.has(TrustAnchorVerificationState.REVIEW_REQUIRED);

    let outcome: AuthorityResolutionOutcome;
    const reasons: string[] = [];
    if (!input.entity.isEffectiveAt(input.evaluationInstant) || input.entity.status === TrustEntityStatus.INACTIVE || input.entity.status === TrustEntityStatus.REVOKED || input.entity.status === TrustEntityStatus.SUSPENDED) {
      outcome = AuthorityResolutionOutcome.NOT_AUTHORIZED;
      reasons.push('ENTITY_NOT_ACTIVE_OR_EFFECTIVE');
    } else if (input.entity.status === TrustEntityStatus.REVIEW_REQUIRED) {
      outcome = AuthorityResolutionOutcome.REVIEW_REQUIRED;
      reasons.push('ENTITY_STATUS_REQUIRES_REVIEW');
    } else if (scopes.length === 0) {
      outcome = AuthorityResolutionOutcome.NOT_AUTHORIZED;
      reasons.push('NO_MATCHING_AUTHORITY_SCOPE');
    } else if (conflicts.length > 0) {
      outcome = AuthorityResolutionOutcome.REVIEW_REQUIRED;
      reasons.push('EXPLICIT_AUTHORITY_CONFLICT');
    } else if (hasVerified && (hasAdverse || hasReviewState)) {
      outcome = AuthorityResolutionOutcome.REVIEW_REQUIRED;
      reasons.push('CONFLICTING_TRUST_ANCHOR_STATES');
    } else if (hasAdverse) {
      outcome = AuthorityResolutionOutcome.NOT_AUTHORIZED;
      reasons.push('AUTHORITY_ANCHOR_REVOKED_OR_SUSPENDED');
    } else if (!hasVerified && hasReviewState) {
      outcome = AuthorityResolutionOutcome.REVIEW_REQUIRED;
      reasons.push('TRUST_ANCHOR_NOT_CURRENTLY_VERIFIED');
    } else if (!hasVerified) {
      outcome = AuthorityResolutionOutcome.INDETERMINATE;
      reasons.push('NO_KNOWN_VERIFIED_TRUST_ANCHOR');
    } else if (conditions.length > 0 || limitations.length > 0) {
      outcome = AuthorityResolutionOutcome.AUTHORIZED_WITH_CONDITIONS;
      reasons.push('VERIFIED_AUTHORITY_WITH_CONDITIONS');
    } else {
      outcome = AuthorityResolutionOutcome.AUTHORIZED;
      reasons.push('VERIFIED_AUTHORITY_SCOPE_AND_ANCHOR');
    }

    return new AuthorityResolutionResult({
      id: input.id,
      snapshot: input.snapshot,
      entity: input.entity,
      requestedRole: input.requestedRole,
      claimScope,
      jurisdiction: input.jurisdiction,
      evaluationInstant: input.evaluationInstant,
      asKnownAt: input.asKnownAt,
      outcome,
      matchedScopes: Object.freeze(scopes),
      matchedAnchors: Object.freeze(anchors),
      conditions,
      limitations,
      reasonCodes: Object.freeze(reasons),
      conflictReferences: conflicts,
    });
  }

  toJSON() {
    return Object.freeze({
      id: this.id.toString(),
      snapshotId: this.snapshot.id.toString(),
      entityId: this.entity.id.toString(),
      requestedRole: this.requestedRole,
      claimScope: this.claimScope,
      jurisdiction: this.jurisdiction.toJSON(),
      evaluationInstant: this.evaluationInstant.toString(),
      asKnownAt: this.asKnownAt.toString(),
      outcome: this.outcome,
      matchedScopeIds: Object.freeze(this.matchedScopes.map((value) => value.id.toString())),
      matchedAnchorIds: Object.freeze(this.matchedAnchors.map((value) => value.id.toString())),
      conditions: Object.freeze([...this.conditions]),
      limitations: Object.freeze([...this.limitations]),
      reasonCodes: Object.freeze([...this.reasonCodes]),
      conflictReferences: Object.freeze([...this.conflictReferences]),
    });
  }
}
