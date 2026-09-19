import {
  EvidenceReference,
  Jurisdiction,
  SourceId,
  UtcInstant,
  VersionId,
} from '../../../core/src/index.ts';
import {
  AuthorityResolutionOutcome,
  AuthorityResolutionResult,
  AuthorityRole,
  TrustEntity,
  TrustRegistrySnapshot,
} from '../trust/index.ts';

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
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
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

abstract class VerificationUuidV7 {
  readonly #value: string;
  protected constructor(value: string, label: string) {
    if (typeof value !== 'string' || !UUID_V7_PATTERN.test(value)) throw new TypeError(`${label} requires UUIDv7`);
    this.#value = value.toLowerCase();
    Object.freeze(this);
  }
  toString(): string { return this.#value; }
  toJSON(): string { return this.#value; }
}

export class VerificationRouteId extends VerificationUuidV7 {
  private constructor(value: string) { super(value, 'VerificationRouteId'); }
  static from(value: string): VerificationRouteId { return new VerificationRouteId(value); }
}
export class VerificationRouteRegistrySnapshotId extends VerificationUuidV7 {
  private constructor(value: string) { super(value, 'VerificationRouteRegistrySnapshotId'); }
  static from(value: string): VerificationRouteRegistrySnapshotId { return new VerificationRouteRegistrySnapshotId(value); }
}
export class VerificationRequestId extends VerificationUuidV7 {
  private constructor(value: string) { super(value, 'VerificationRequestId'); }
  static from(value: string): VerificationRequestId { return new VerificationRequestId(value); }
}
export class VerificationAttemptId extends VerificationUuidV7 {
  private constructor(value: string) { super(value, 'VerificationAttemptId'); }
  static from(value: string): VerificationAttemptId { return new VerificationAttemptId(value); }
}

export const VerificationMethod = {
  OFFICIAL_REGISTRY_LOOKUP: 'OFFICIAL_REGISTRY_LOOKUP',
  ISSUER_API: 'ISSUER_API',
  TRUST_LIST_VALIDATION: 'TRUST_LIST_VALIDATION',
  SIGNED_DOCUMENT_VALIDATION: 'SIGNED_DOCUMENT_VALIDATION',
  WALLET_PRESENTATION_VALIDATION: 'WALLET_PRESENTATION_VALIDATION',
  MANUAL_AUTHORITY_CONFIRMATION: 'MANUAL_AUTHORITY_CONFIRMATION',
  HUMAN_REVIEW: 'HUMAN_REVIEW',
} as const;
export type VerificationMethod = (typeof VerificationMethod)[keyof typeof VerificationMethod];
const VERIFICATION_METHODS = new Set<string>(Object.values(VerificationMethod));

export const VerificationAssuranceLevel = {
  BASIC: 'BASIC',
  SUBSTANTIAL: 'SUBSTANTIAL',
  HIGH: 'HIGH',
} as const;
export type VerificationAssuranceLevel = (typeof VerificationAssuranceLevel)[keyof typeof VerificationAssuranceLevel];
const ASSURANCE_LEVELS = new Set<string>(Object.values(VerificationAssuranceLevel));
const ASSURANCE_RANK: Readonly<Record<VerificationAssuranceLevel, number>> = Object.freeze({ BASIC: 1, SUBSTANTIAL: 2, HIGH: 3 });

export const VerificationRouteState = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type VerificationRouteState = (typeof VerificationRouteState)[keyof typeof VerificationRouteState];
const ROUTE_STATES = new Set<string>(Object.values(VerificationRouteState));

export const VerificationSelectionOutcome = {
  ROUTES_SELECTED: 'ROUTES_SELECTED',
  PARTIAL_ROUTES_SELECTED: 'PARTIAL_ROUTES_SELECTED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
} as const;
export type VerificationSelectionOutcome = (typeof VerificationSelectionOutcome)[keyof typeof VerificationSelectionOutcome];

export const VerificationRouteOutcome = {
  VERIFIED: 'VERIFIED',
  FAILED: 'FAILED',
  INDETERMINATE: 'INDETERMINATE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  NOT_SUPPORTED: 'NOT_SUPPORTED',
} as const;
export type VerificationRouteOutcome = (typeof VerificationRouteOutcome)[keyof typeof VerificationRouteOutcome];
const ROUTE_OUTCOMES = new Set<string>(Object.values(VerificationRouteOutcome));

export class VerificationRouteDefinition {
  readonly id!: VerificationRouteId;
  readonly method!: VerificationMethod;
  readonly capability!: string;
  readonly verifierEntity!: TrustEntity;
  readonly authorityRole!: AuthorityRole;
  readonly supportedClaims!: readonly string[];
  readonly jurisdictions!: readonly Jurisdiction[];
  readonly assuranceLevel!: VerificationAssuranceLevel;
  readonly priority!: number;
  readonly state!: VerificationRouteState;
  readonly validFrom!: UtcInstant;
  readonly validTo!: UtcInstant | null;
  readonly sourceId!: SourceId;
  readonly sourceVersion!: VersionId;
  readonly sourceSnapshotReference!: string;
  readonly retrievedAt!: UtcInstant;

  private constructor(input: {
    readonly id: VerificationRouteId; readonly method: VerificationMethod; readonly capability: string;
    readonly verifierEntity: TrustEntity; readonly authorityRole: AuthorityRole; readonly supportedClaims: readonly string[];
    readonly jurisdictions: readonly Jurisdiction[]; readonly assuranceLevel: VerificationAssuranceLevel; readonly priority: number;
    readonly state: VerificationRouteState; readonly validFrom: UtcInstant; readonly validTo: UtcInstant | null;
    readonly sourceId: SourceId; readonly sourceVersion: VersionId; readonly sourceSnapshotReference: string; readonly retrievedAt: UtcInstant;
  }) { Object.assign(this, input); Object.freeze(this); }

  static create(input: {
    readonly id: VerificationRouteId; readonly method: VerificationMethod; readonly capability: string;
    readonly verifierEntity: TrustEntity; readonly authorityRole: AuthorityRole; readonly supportedClaims: readonly string[];
    readonly jurisdictions: readonly Jurisdiction[]; readonly assuranceLevel: VerificationAssuranceLevel; readonly priority: number;
    readonly state?: VerificationRouteState; readonly validFrom: UtcInstant; readonly validTo?: UtcInstant | null;
    readonly sourceId: SourceId; readonly sourceVersion: VersionId; readonly sourceSnapshotReference: string; readonly retrievedAt: UtcInstant;
  }): VerificationRouteDefinition {
    if (!(input.id instanceof VerificationRouteId)) throw new TypeError('Verification route requires VerificationRouteId');
    if (!VERIFICATION_METHODS.has(input.method)) throw new TypeError('Verification route method must be controlled');
    if (!(input.verifierEntity instanceof TrustEntity)) throw new TypeError('Verification route requires TrustEntity verifier');
    if (!Object.values(AuthorityRole).includes(input.authorityRole)) throw new TypeError('Verification route authority role must be controlled');
    if (!ASSURANCE_LEVELS.has(input.assuranceLevel)) throw new TypeError('Verification route assurance level must be controlled');
    const state = input.state ?? VerificationRouteState.ACTIVE;
    if (!ROUTE_STATES.has(state)) throw new TypeError('Verification route state must be controlled');
    if (!Number.isSafeInteger(input.priority) || input.priority < 0 || input.priority > 100000) throw new RangeError('Verification route priority must be a non-negative safe integer');
    if (!Array.isArray(input.jurisdictions) || input.jurisdictions.length === 0 || input.jurisdictions.some((value) => !(value instanceof Jurisdiction))) throw new TypeError('Verification route requires controlled jurisdictions');
    const jurisdictions = [...input.jurisdictions];
    if (new Set(jurisdictions.map((value) => value.toString())).size !== jurisdictions.length) throw new TypeError('Verification route jurisdictions must be unique');
    jurisdictions.sort((a, b) => a.toString().localeCompare(b.toString()));
    const validTo = input.validTo ?? null;
    validatePeriod(input.validFrom, validTo, 'Verification route');
    if (!(input.sourceId instanceof SourceId) || !(input.sourceVersion instanceof VersionId) || !(input.retrievedAt instanceof UtcInstant)) throw new TypeError('Verification route requires source/version/retrieval provenance');
    return new VerificationRouteDefinition({
      id: input.id, method: input.method, capability: requiredText(input.capability, 'Verification capability', 256),
      verifierEntity: input.verifierEntity, authorityRole: input.authorityRole,
      supportedClaims: uniqueSortedText(input.supportedClaims, 'Supported verification claim'), jurisdictions: Object.freeze(jurisdictions),
      assuranceLevel: input.assuranceLevel, priority: input.priority, state, validFrom: input.validFrom, validTo,
      sourceId: input.sourceId, sourceVersion: input.sourceVersion,
      sourceSnapshotReference: requiredText(input.sourceSnapshotReference, 'Route source snapshot reference', 512), retrievedAt: input.retrievedAt,
    });
  }

  isEffectiveAt(instant: UtcInstant): boolean {
    if (!(instant instanceof UtcInstant)) throw new TypeError('Route effectiveness requires UtcInstant');
    return isEffective(this.validFrom, this.validTo, instant);
  }
  supportsClaim(claim: string): boolean { return this.supportedClaims.includes(requiredText(claim, 'Verification claim', 512)); }
  toJSON() {
    return Object.freeze({
      id: this.id.toString(), method: this.method, capability: this.capability, verifierEntityId: this.verifierEntity.id.toString(), authorityRole: this.authorityRole,
      supportedClaims: Object.freeze([...this.supportedClaims]), jurisdictions: Object.freeze(this.jurisdictions.map((value) => value.toString())),
      assuranceLevel: this.assuranceLevel, priority: this.priority, state: this.state, validFrom: this.validFrom.toString(), validTo: this.validTo?.toString() ?? null,
      sourceId: this.sourceId.toString(), sourceVersion: this.sourceVersion.toString(), sourceSnapshotReference: this.sourceSnapshotReference, retrievedAt: this.retrievedAt.toString(),
    });
  }
}

export class VerificationRouteRegistrySnapshot {
  readonly id: VerificationRouteRegistrySnapshotId;
  readonly trustSnapshot: TrustRegistrySnapshot;
  readonly asKnownAt: UtcInstant;
  readonly routes: readonly VerificationRouteDefinition[];
  readonly policyVersion: VersionId;
  private constructor(input: { readonly id: VerificationRouteRegistrySnapshotId; readonly trustSnapshot: TrustRegistrySnapshot; readonly asKnownAt: UtcInstant; readonly routes: readonly VerificationRouteDefinition[]; readonly policyVersion: VersionId }) {
    this.id = input.id; this.trustSnapshot = input.trustSnapshot; this.asKnownAt = input.asKnownAt; this.routes = input.routes; this.policyVersion = input.policyVersion; Object.freeze(this);
  }
  static create(input: { readonly id: VerificationRouteRegistrySnapshotId; readonly trustSnapshot: TrustRegistrySnapshot; readonly asKnownAt: UtcInstant; readonly routes: readonly VerificationRouteDefinition[]; readonly policyVersion: VersionId }): VerificationRouteRegistrySnapshot {
    if (!(input.id instanceof VerificationRouteRegistrySnapshotId)) throw new TypeError('Route registry requires snapshot id');
    if (!(input.trustSnapshot instanceof TrustRegistrySnapshot)) throw new TypeError('Route registry requires exact TrustRegistrySnapshot');
    if (!(input.asKnownAt instanceof UtcInstant) || input.asKnownAt.toEpochMilliseconds() > input.trustSnapshot.asKnownAt.toEpochMilliseconds()) throw new RangeError('Route registry asKnownAt must not exceed Trust Registry knowledge cutoff');
    if (!(input.policyVersion instanceof VersionId)) throw new TypeError('Route registry requires policy VersionId');
    if (!Array.isArray(input.routes) || input.routes.some((value) => !(value instanceof VerificationRouteDefinition))) throw new TypeError('Route registry routes must use VerificationRouteDefinition');
    const routes = [...input.routes];
    if (new Set(routes.map((value) => value.id.toString())).size !== routes.length) throw new TypeError('Route ids must be unique');
    for (const route of routes) {
      if (!input.trustSnapshot.entities.includes(route.verifierEntity)) throw new TypeError('Route verifier must be exact TrustEntity from Trust Registry snapshot');
      if (route.retrievedAt.toEpochMilliseconds() > input.asKnownAt.toEpochMilliseconds()) throw new RangeError('Route retrieved after registry knowledge cutoff is not yet known');
    }
    routes.sort((a, b) => a.priority - b.priority || a.id.toString().localeCompare(b.id.toString()));
    return new VerificationRouteRegistrySnapshot({ id: input.id, trustSnapshot: input.trustSnapshot, asKnownAt: input.asKnownAt, routes: Object.freeze(routes), policyVersion: input.policyVersion });
  }
  toJSON() { return Object.freeze({ id: this.id.toString(), trustSnapshotId: this.trustSnapshot.id.toString(), asKnownAt: this.asKnownAt.toString(), policyVersion: this.policyVersion.toString(), routes: Object.freeze(this.routes.map((value) => value.toJSON())) }); }
}

export class VerificationRequest {
  readonly id!: VerificationRequestId;
  readonly evidence!: EvidenceReference;
  readonly subjectReference!: string;
  readonly claims!: readonly string[];
  readonly jurisdiction!: Jurisdiction;
  readonly useCase!: string;
  readonly requiredAssurance!: VerificationAssuranceLevel;
  readonly acceptableMethods!: readonly VerificationMethod[];
  readonly evaluationInstant!: UtcInstant;
  readonly asKnownAt!: UtcInstant;
  readonly idempotencyKey!: string;
  private constructor(input: { readonly id: VerificationRequestId; readonly evidence: EvidenceReference; readonly subjectReference: string; readonly claims: readonly string[]; readonly jurisdiction: Jurisdiction; readonly useCase: string; readonly requiredAssurance: VerificationAssuranceLevel; readonly acceptableMethods: readonly VerificationMethod[]; readonly evaluationInstant: UtcInstant; readonly asKnownAt: UtcInstant; readonly idempotencyKey: string }) { Object.assign(this, input); Object.freeze(this); }
  static create(input: { readonly id: VerificationRequestId; readonly evidence: EvidenceReference; readonly subjectReference: string; readonly claims: readonly string[]; readonly jurisdiction: Jurisdiction; readonly useCase: string; readonly requiredAssurance: VerificationAssuranceLevel; readonly acceptableMethods: readonly VerificationMethod[]; readonly evaluationInstant: UtcInstant; readonly asKnownAt: UtcInstant; readonly idempotencyKey: string }): VerificationRequest {
    if (!(input.id instanceof VerificationRequestId)) throw new TypeError('Verification request requires VerificationRequestId');
    if (!(input.evidence instanceof EvidenceReference)) throw new TypeError('Verification request requires EvidenceReference');
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Verification request requires controlled Jurisdiction');
    if (!ASSURANCE_LEVELS.has(input.requiredAssurance)) throw new TypeError('Verification request assurance must be controlled');
    if (!Array.isArray(input.acceptableMethods) || input.acceptableMethods.length === 0 || input.acceptableMethods.some((value) => !VERIFICATION_METHODS.has(value))) throw new TypeError('Verification request requires controlled acceptable methods');
    if (new Set(input.acceptableMethods).size !== input.acceptableMethods.length) throw new TypeError('Acceptable methods must be unique');
    if (!(input.evaluationInstant instanceof UtcInstant) || !(input.asKnownAt instanceof UtcInstant)) throw new TypeError('Verification request requires explicit time');
    if (input.asKnownAt.toEpochMilliseconds() < input.evaluationInstant.toEpochMilliseconds()) throw new RangeError('Verification request asKnownAt must not predate evaluationInstant');
    return new VerificationRequest({
      id: input.id, evidence: input.evidence, subjectReference: requiredText(input.subjectReference, 'Verification subject reference', 512), claims: uniqueSortedText(input.claims, 'Verification claim'), jurisdiction: input.jurisdiction,
      useCase: requiredText(input.useCase, 'Verification use case', 512), requiredAssurance: input.requiredAssurance, acceptableMethods: Object.freeze([...input.acceptableMethods].sort()),
      evaluationInstant: input.evaluationInstant, asKnownAt: input.asKnownAt, idempotencyKey: requiredText(input.idempotencyKey, 'Verification idempotency key', 512),
    });
  }
  toJSON() { return Object.freeze({ id: this.id.toString(), evidenceId: this.evidence.id.toString(), subjectReference: this.subjectReference, claims: Object.freeze([...this.claims]), jurisdiction: this.jurisdiction.toString(), useCase: this.useCase, requiredAssurance: this.requiredAssurance, acceptableMethods: Object.freeze([...this.acceptableMethods]), evaluationInstant: this.evaluationInstant.toString(), asKnownAt: this.asKnownAt.toString(), idempotencyKey: this.idempotencyKey }); }
}

export class VerificationRouteSelectionItem {
  readonly route: VerificationRouteDefinition;
  readonly claims: readonly string[];
  readonly authorityResolutions: readonly AuthorityResolutionResult[];
  constructor(route: VerificationRouteDefinition, claims: readonly string[], authorityResolutions: readonly AuthorityResolutionResult[]) {
    this.route = route; this.claims = Object.freeze([...claims]); this.authorityResolutions = Object.freeze([...authorityResolutions]); Object.freeze(this);
  }
  toJSON() { return Object.freeze({ routeId: this.route.id.toString(), claims: Object.freeze([...this.claims]), authorityResolutionIds: Object.freeze(this.authorityResolutions.map((value) => value.id.toString())) }); }
}

function isSufficientAuthority(outcome: AuthorityResolutionOutcome): boolean { return outcome === AuthorityResolutionOutcome.AUTHORIZED || outcome === AuthorityResolutionOutcome.AUTHORIZED_WITH_CONDITIONS; }
function authorityMatches(route: VerificationRouteDefinition, request: VerificationRequest, claim: string, resolution: AuthorityResolutionResult): boolean {
  return resolution.entity === route.verifierEntity && resolution.requestedRole === route.authorityRole && resolution.claimScope === claim && resolution.jurisdiction.toString() === request.jurisdiction.toString() && resolution.evaluationInstant.toEpochMilliseconds() === request.evaluationInstant.toEpochMilliseconds() && resolution.asKnownAt.toEpochMilliseconds() === request.asKnownAt.toEpochMilliseconds();
}

export class VerificationRouteSelection {
  readonly registry!: VerificationRouteRegistrySnapshot;
  readonly request!: VerificationRequest;
  readonly outcome!: VerificationSelectionOutcome;
  readonly items!: readonly VerificationRouteSelectionItem[];
  readonly uncoveredClaims!: readonly string[];
  readonly reasonCodes!: readonly string[];
  private constructor(input: { readonly registry: VerificationRouteRegistrySnapshot; readonly request: VerificationRequest; readonly outcome: VerificationSelectionOutcome; readonly items: readonly VerificationRouteSelectionItem[]; readonly uncoveredClaims: readonly string[]; readonly reasonCodes: readonly string[] }) { Object.assign(this, input); Object.freeze(this); }
  static select(input: { readonly registry: VerificationRouteRegistrySnapshot; readonly request: VerificationRequest; readonly authorityResolutions: readonly AuthorityResolutionResult[] }): VerificationRouteSelection {
    if (!(input.registry instanceof VerificationRouteRegistrySnapshot) || !(input.request instanceof VerificationRequest)) throw new TypeError('Route selection requires governed registry and request');
    if (input.request.asKnownAt.toEpochMilliseconds() > input.registry.asKnownAt.toEpochMilliseconds()) throw new RangeError('Request cannot know beyond route registry snapshot');
    if (!Array.isArray(input.authorityResolutions) || input.authorityResolutions.some((value) => !(value instanceof AuthorityResolutionResult))) throw new TypeError('Route selection requires AuthorityResolutionResult values');
    for (const resolution of input.authorityResolutions) if (resolution.snapshot !== input.registry.trustSnapshot) throw new TypeError('Authority resolution must bind exact Trust Registry snapshot');
    const items: VerificationRouteSelectionItem[] = [];
    let reviewSignal = false;
    for (const route of input.registry.routes) {
      if (!route.isEffectiveAt(input.request.evaluationInstant) || route.state === VerificationRouteState.INACTIVE) continue;
      if (route.state === VerificationRouteState.REVIEW_REQUIRED) { reviewSignal = true; continue; }
      if (!input.request.acceptableMethods.includes(route.method)) continue;
      if (ASSURANCE_RANK[route.assuranceLevel] < ASSURANCE_RANK[input.request.requiredAssurance]) continue;
      if (!route.jurisdictions.some((value) => value.toString() === input.request.jurisdiction.toString())) continue;
      const claims: string[] = [];
      const resolutions: AuthorityResolutionResult[] = [];
      for (const claim of input.request.claims) {
        if (!route.supportsClaim(claim)) continue;
        const matching = input.authorityResolutions.filter((resolution) => authorityMatches(route, input.request, claim, resolution));
        if (matching.some((resolution) => resolution.outcome === AuthorityResolutionOutcome.REVIEW_REQUIRED || resolution.outcome === AuthorityResolutionOutcome.INDETERMINATE)) reviewSignal = true;
        const sufficient = matching.filter((resolution) => isSufficientAuthority(resolution.outcome));
        if (sufficient.length === 1) { claims.push(claim); resolutions.push(sufficient[0]!); }
        else if (sufficient.length > 1) reviewSignal = true;
      }
      if (claims.length > 0) items.push(new VerificationRouteSelectionItem(route, claims.sort(), resolutions));
    }
    items.sort((a, b) => a.route.priority - b.route.priority || a.route.id.toString().localeCompare(b.route.id.toString()));
    const covered = new Set(items.flatMap((item) => [...item.claims]));
    const uncovered = input.request.claims.filter((claim) => !covered.has(claim));
    let outcome: VerificationSelectionOutcome; const reasons: string[] = [];
    if (items.length === 0 && reviewSignal) { outcome = VerificationSelectionOutcome.REVIEW_REQUIRED; reasons.push('AUTHORITY_OR_ROUTE_REQUIRES_REVIEW'); }
    else if (items.length === 0) { outcome = VerificationSelectionOutcome.NOT_SUPPORTED; reasons.push('NO_APPLICABLE_AUTHORIZED_ROUTE'); }
    else if (uncovered.length > 0 && reviewSignal) { outcome = VerificationSelectionOutcome.REVIEW_REQUIRED; reasons.push('PARTIAL_ROUTE_COVERAGE_WITH_REVIEW_REQUIRED'); }
    else if (uncovered.length > 0) { outcome = VerificationSelectionOutcome.PARTIAL_ROUTES_SELECTED; reasons.push('PARTIAL_ROUTE_COVERAGE'); }
    else { outcome = VerificationSelectionOutcome.ROUTES_SELECTED; reasons.push('AUTHORIZED_ROUTES_SELECTED'); }
    return new VerificationRouteSelection({ registry: input.registry, request: input.request, outcome, items: Object.freeze(items), uncoveredClaims: Object.freeze(uncovered), reasonCodes: Object.freeze(reasons) });
  }
  toJSON() { return Object.freeze({ registrySnapshotId: this.registry.id.toString(), requestId: this.request.id.toString(), outcome: this.outcome, items: Object.freeze(this.items.map((value) => value.toJSON())), uncoveredClaims: Object.freeze([...this.uncoveredClaims]), reasonCodes: Object.freeze([...this.reasonCodes]) }); }
}

export class VerificationProviderRequest {
  readonly attemptId!: VerificationAttemptId;
  readonly route!: VerificationRouteDefinition;
  readonly request!: VerificationRequest;
  readonly claims!: readonly string[];
  readonly idempotencyKey!: string;
  private constructor(input: { readonly attemptId: VerificationAttemptId; readonly route: VerificationRouteDefinition; readonly request: VerificationRequest; readonly claims: readonly string[]; readonly idempotencyKey: string }) { Object.assign(this, input); Object.freeze(this); }
  static create(input: { readonly attemptId: VerificationAttemptId; readonly route: VerificationRouteDefinition; readonly request: VerificationRequest; readonly claims: readonly string[]; readonly idempotencyKey: string }): VerificationProviderRequest {
    if (!(input.attemptId instanceof VerificationAttemptId) || !(input.route instanceof VerificationRouteDefinition) || !(input.request instanceof VerificationRequest)) throw new TypeError('Provider request requires governed attempt/route/request');
    if (input.route.method === VerificationMethod.MANUAL_AUTHORITY_CONFIRMATION || input.route.method === VerificationMethod.HUMAN_REVIEW) throw new TypeError('Manual/human verification routes are executed by S08, not provider ports');
    const claims = uniqueSortedText(input.claims, 'Provider request claim');
    if (claims.some((claim) => !input.request.claims.includes(claim) || !input.route.supportedClaims.includes(claim))) throw new TypeError('Provider request claims must be a subset of request and route claims');
    return new VerificationProviderRequest({ attemptId: input.attemptId, route: input.route, request: input.request, claims, idempotencyKey: requiredText(input.idempotencyKey, 'Provider idempotency key', 512) });
  }
}

export class VerificationProviderResult {
  readonly outcome!: VerificationRouteOutcome;
  readonly adapterReference!: string;
  readonly adapterVersion!: string;
  readonly checkedClaims!: readonly string[];
  readonly assertionFingerprints!: Readonly<Record<string, string>>;
  readonly sourceSnapshotReference!: string;
  readonly sourceVersionReference!: string;
  readonly checkedAt!: UtcInstant;
  readonly providerResultReference!: string | null;
  readonly reasonCodes!: readonly string[];
  private constructor(input: { readonly outcome: VerificationRouteOutcome; readonly adapterReference: string; readonly adapterVersion: string; readonly checkedClaims: readonly string[]; readonly assertionFingerprints: Readonly<Record<string, string>>; readonly sourceSnapshotReference: string; readonly sourceVersionReference: string; readonly checkedAt: UtcInstant; readonly providerResultReference: string | null; readonly reasonCodes: readonly string[] }) { Object.assign(this, input); Object.freeze(this); }
  static create(input: { readonly outcome: VerificationRouteOutcome; readonly adapterReference: string; readonly adapterVersion: string; readonly checkedClaims: readonly string[]; readonly assertionFingerprints?: Readonly<Record<string, string>>; readonly sourceSnapshotReference: string; readonly sourceVersionReference: string; readonly checkedAt: UtcInstant; readonly providerResultReference?: string | null; readonly reasonCodes?: readonly string[] }): VerificationProviderResult {
    if (!ROUTE_OUTCOMES.has(input.outcome)) throw new TypeError('Provider result outcome must be controlled');
    if (!(input.checkedAt instanceof UtcInstant)) throw new TypeError('Provider result requires checked-at UtcInstant');
    const checkedClaims = uniqueSortedText(input.checkedClaims, 'Provider checked claim');
    const reasons = [...(input.reasonCodes ?? [])].map((value) => requiredText(value, 'Provider reason code', 256)).sort();
    if (new Set(reasons).size !== reasons.length) throw new TypeError('Provider reason codes must be unique');
    if (input.outcome === VerificationRouteOutcome.FAILED && reasons.some((value) => value === 'PROVIDER_UNAVAILABLE' || value === 'PROVIDER_TIMEOUT')) throw new TypeError('Provider outage/timeout must be INDETERMINATE, never FAILED');
    const fingerprints: Record<string, string> = {};
    for (const [claim, fingerprint] of Object.entries(input.assertionFingerprints ?? {})) {
      const normalizedClaim = requiredText(claim, 'Assertion claim', 512);
      if (!checkedClaims.includes(normalizedClaim)) throw new TypeError('Assertion fingerprint claim must be checked');
      fingerprints[normalizedClaim] = requiredText(fingerprint, 'Assertion fingerprint', 512);
    }
    if (input.outcome === VerificationRouteOutcome.VERIFIED && checkedClaims.some((claim) => fingerprints[claim] == null)) throw new TypeError('VERIFIED provider result requires an assertion fingerprint for every checked claim');
    return new VerificationProviderResult({ outcome: input.outcome, adapterReference: requiredText(input.adapterReference, 'Adapter reference', 256), adapterVersion: requiredText(input.adapterVersion, 'Adapter version', 256), checkedClaims, assertionFingerprints: Object.freeze(fingerprints), sourceSnapshotReference: requiredText(input.sourceSnapshotReference, 'Provider source snapshot reference', 512), sourceVersionReference: requiredText(input.sourceVersionReference, 'Provider source version reference', 512), checkedAt: input.checkedAt, providerResultReference: input.providerResultReference == null ? null : requiredText(input.providerResultReference, 'Provider result reference', 512), reasonCodes: Object.freeze(reasons) });
  }
}

export interface VerificationProviderPort {
  readonly capability: string;
  execute(request: VerificationProviderRequest): Promise<VerificationProviderResult> | VerificationProviderResult;
}

export class VerificationRouteResult {
  readonly providerRequest!: VerificationProviderRequest;
  readonly providerResult!: VerificationProviderResult;
  readonly authorityResolutions!: readonly AuthorityResolutionResult[];
  readonly outcome!: VerificationRouteOutcome;
  readonly checkedClaims!: readonly string[];
  readonly reasonCodes!: readonly string[];
  private constructor(input: { readonly providerRequest: VerificationProviderRequest; readonly providerResult: VerificationProviderResult; readonly authorityResolutions: readonly AuthorityResolutionResult[]; readonly outcome: VerificationRouteOutcome; readonly checkedClaims: readonly string[]; readonly reasonCodes: readonly string[] }) { Object.assign(this, input); Object.freeze(this); }
  static normalize(input: { readonly providerRequest: VerificationProviderRequest; readonly providerResult: VerificationProviderResult; readonly authorityResolutions: readonly AuthorityResolutionResult[] }): VerificationRouteResult {
    if (!(input.providerRequest instanceof VerificationProviderRequest) || !(input.providerResult instanceof VerificationProviderResult)) throw new TypeError('Route result requires governed provider request/result');
    if (!Array.isArray(input.authorityResolutions) || input.authorityResolutions.some((value) => !(value instanceof AuthorityResolutionResult))) throw new TypeError('Route result requires authority resolutions');
    const checked = input.providerResult.checkedClaims;
    if (checked.some((claim) => !input.providerRequest.claims.includes(claim))) throw new TypeError('Provider checked claims must remain inside provider request');
    let outcome = input.providerResult.outcome; const reasons = [...input.providerResult.reasonCodes];
    if (outcome === VerificationRouteOutcome.VERIFIED) {
      const allAuthorized = checked.every((claim) => input.authorityResolutions.some((resolution) => authorityMatches(input.providerRequest.route, input.providerRequest.request, claim, resolution) && isSufficientAuthority(resolution.outcome)));
      if (!allAuthorized) { outcome = VerificationRouteOutcome.REVIEW_REQUIRED; reasons.push('INSUFFICIENT_VERIFIER_AUTHORITY'); }
    }
    return new VerificationRouteResult({ providerRequest: input.providerRequest, providerResult: input.providerResult, authorityResolutions: Object.freeze([...input.authorityResolutions]), outcome, checkedClaims: checked, reasonCodes: Object.freeze([...new Set(reasons)].sort()) });
  }
  assertionFingerprintFor(claim: string): string | null { return this.providerResult.assertionFingerprints[claim] ?? null; }
  toJSON() { return Object.freeze({ attemptId: this.providerRequest.attemptId.toString(), routeId: this.providerRequest.route.id.toString(), requestId: this.providerRequest.request.id.toString(), outcome: this.outcome, checkedClaims: Object.freeze([...this.checkedClaims]), adapterReference: this.providerResult.adapterReference, adapterVersion: this.providerResult.adapterVersion, sourceSnapshotReference: this.providerResult.sourceSnapshotReference, sourceVersionReference: this.providerResult.sourceVersionReference, checkedAt: this.providerResult.checkedAt.toString(), providerResultReference: this.providerResult.providerResultReference, authorityResolutionIds: Object.freeze(this.authorityResolutions.map((value) => value.id.toString())), reasonCodes: Object.freeze([...this.reasonCodes]) }); }
}

export class VerificationClaimResolution {
  readonly claim!: string;
  readonly outcome!: VerificationRouteOutcome;
  readonly routeResults!: readonly VerificationRouteResult[];
  readonly assertionFingerprint!: string | null;
  readonly reasonCodes!: readonly string[];
  private constructor(input: { readonly claim: string; readonly outcome: VerificationRouteOutcome; readonly routeResults: readonly VerificationRouteResult[]; readonly assertionFingerprint: string | null; readonly reasonCodes: readonly string[] }) { Object.assign(this, input); Object.freeze(this); }
  static resolve(claimInput: string, resultsInput: readonly VerificationRouteResult[]): VerificationClaimResolution {
    const claim = requiredText(claimInput, 'Claim resolution claim', 512);
    if (!Array.isArray(resultsInput) || resultsInput.some((value) => !(value instanceof VerificationRouteResult))) throw new TypeError('Claim resolution requires route results');
    const results = resultsInput.filter((result) => result.checkedClaims.includes(claim)).sort((a, b) => a.providerRequest.route.priority - b.providerRequest.route.priority || a.providerRequest.route.id.toString().localeCompare(b.providerRequest.route.id.toString()));
    const verified = results.filter((result) => result.outcome === VerificationRouteOutcome.VERIFIED);
    const fingerprints = new Set(verified.map((result) => result.assertionFingerprintFor(claim)).filter((value): value is string => value != null));
    let outcome: VerificationRouteOutcome; let fingerprint: string | null = null; const reasons: string[] = [];
    if (fingerprints.size > 1) { outcome = VerificationRouteOutcome.REVIEW_REQUIRED; reasons.push('CONFLICTING_SUCCESSFUL_ROUTE_ASSERTIONS'); }
    else if (results.some((result) => result.outcome === VerificationRouteOutcome.REVIEW_REQUIRED)) { outcome = VerificationRouteOutcome.REVIEW_REQUIRED; reasons.push('ROUTE_REQUIRES_REVIEW'); }
    else if (verified.length > 0) { outcome = VerificationRouteOutcome.VERIFIED; fingerprint = [...fingerprints][0] ?? null; reasons.push('AUTHORIZED_ROUTE_VERIFIED_CLAIM'); }
    else if (results.some((result) => result.outcome === VerificationRouteOutcome.INDETERMINATE)) { outcome = VerificationRouteOutcome.INDETERMINATE; reasons.push('ROUTE_RESULT_INDETERMINATE'); }
    else if (results.some((result) => result.outcome === VerificationRouteOutcome.FAILED)) { outcome = VerificationRouteOutcome.FAILED; reasons.push('AUTHORIZED_ROUTE_FAILED_CLAIM'); }
    else { outcome = VerificationRouteOutcome.NOT_SUPPORTED; reasons.push('NO_ROUTE_RESULT_FOR_CLAIM'); }
    return new VerificationClaimResolution({ claim, outcome, routeResults: Object.freeze(results), assertionFingerprint: fingerprint, reasonCodes: Object.freeze(reasons) });
  }
  toJSON() { return Object.freeze({ claim: this.claim, outcome: this.outcome, routeResultAttemptIds: Object.freeze(this.routeResults.map((value) => value.providerRequest.attemptId.toString())), assertionFingerprint: this.assertionFingerprint, reasonCodes: Object.freeze([...this.reasonCodes]) }); }
}
