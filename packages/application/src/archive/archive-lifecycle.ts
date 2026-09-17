import { ActorKind, ActorReference, CommandId, EvidenceReference, EvidenceSnapshot, SourceId, UtcInstant, VersionId } from '../../../core/src/index.ts';
import { ApplicationExecutionContext } from '../application-execution-context.ts';
import { OrganizationScopeReference, PurposeReference, TenantScopeReference } from '../references.ts';
import { AccessDisposition, TenantAccessDecision } from '../tenant/tenant-governance.ts';
import { MultiChannelIntakeSubmission } from '../intake/index.ts';
import { DerivedExtractionProposalRecord, ExtractionProposalReviewHistory } from '../extraction/index.ts';
import { IntakeSecurityAssessment } from '../security/index.ts';
import { VerificationRouteResult } from '../verification/index.ts';
import { HumanReviewHistory } from '../human-review/index.ts';
import { OriginalArchiveEntry, OriginalArchiveRelationship, OriginalArchiveRelationshipKind } from './original-document-archive.ts';

function text(value: string, label: string): string {
  if (typeof value !== 'string' || !value.trim() || value.length > 1024 || /[\u0000-\u001f\u007f]/.test(value)) throw new TypeError(`${label} requires bounded nonempty text`);
  return value.trim();
}
function uuid(value: string): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new TypeError('Archive identity requires UUIDv7');
  return value.toLowerCase();
}
function ms(value: UtcInstant): number {
  if (!(value instanceof UtcInstant)) throw new TypeError('Archive time requires UtcInstant');
  return value.toEpochMilliseconds();
}
function same(a: { toString(): string }, b: { toString(): string }): boolean { return a.toString() === b.toString(); }
function period(start: UtcInstant, end: UtcInstant | null): void { const first = ms(start); if (end !== null && ms(end) < first) throw new RangeError('Archive period ends before start'); }
function list<T>(values: readonly T[], valid: (item: T) => boolean): T[] {
  if (!Array.isArray(values) || values.length > 10000 || values.some(item => !valid(item))) throw new TypeError('Archive collection requires governed values');
  return [...values];
}
function unique(values: readonly string[]): void { if (new Set(values).size !== values.length) throw new TypeError('Archive collection identities must be unique'); }
function references(values: readonly string[]): readonly string[] { const result = list(values, value => typeof value === 'string').map(value => text(value, 'Dependency reference')).sort(); unique(result); return Object.freeze(result); }
function source(id: SourceId, version: VersionId): void { if (!(id instanceof SourceId) || !(version instanceof VersionId)) throw new TypeError('Archive provenance requires source and version'); }

export class ArchiveScope {
  readonly archive: OriginalArchiveEntry;
  readonly intake: MultiChannelIntakeSubmission;
  readonly tenant: TenantScopeReference;
  private constructor(archive: OriginalArchiveEntry, intake: MultiChannelIntakeSubmission, tenant: TenantScopeReference) { this.archive = archive; this.intake = intake; this.tenant = tenant; Object.freeze(this); }
  static create(input: { readonly archive: OriginalArchiveEntry; readonly intake: MultiChannelIntakeSubmission; readonly tenant: TenantScopeReference }): ArchiveScope {
    if (!(input.archive instanceof OriginalArchiveEntry) || !(input.intake instanceof MultiChannelIntakeSubmission) || !(input.tenant instanceof TenantScopeReference)) throw new TypeError('Archive scope requires archive, intake and tenant');
    if (input.intake.subject === null || input.intake.organization === null || input.intake.originalArtifact !== input.archive.originalArtifact || !same(input.intake.id, input.archive.intakeId)) throw new TypeError('Archive scope requires exact original/intake and organization/subject');
    return new ArchiveScope(input.archive, input.intake, input.tenant);
  }
  toJSON() { return Object.freeze({ tenant: this.tenant.toString(), organization: this.intake.organization!.toString(), subjectId: this.intake.subject!.id.toString(), subjectKind: this.intake.subject!.kind, intakeId: this.intake.id.toString(), evidenceId: this.archive.originalArtifact.id.toString(), originalHash: Object.freeze(this.archive.contentAddress.toJSON()) }); }
}

export const ArchiveOperation = {
  OPEN: 'archive.open', LINK: 'archive.link', UNLINK: 'archive.unlink', PLACE_HOLD: 'archive.hold.place', RELEASE_HOLD: 'archive.hold.release', REPLACE_POLICY: 'archive.policy.replace', CAPTURE: 'archive.snapshot.capture', PIN_SNAPSHOT: 'archive.snapshot.pin', RELEASE_SNAPSHOT: 'archive.snapshot.release', ASSESS: 'archive.disposal.assess', TOMBSTONE: 'archive.tombstone',
} as const;
export type ArchiveOperation = (typeof ArchiveOperation)[keyof typeof ArchiveOperation];
export interface ArchiveLifecycleGrantInput {
  readonly reference: string; readonly scope: ArchiveScope; readonly actor: ActorReference; readonly purpose: PurposeReference;
  readonly permissions: readonly ArchiveOperation[]; readonly accessDecision: TenantAccessDecision;
  readonly validFrom: UtcInstant; readonly validUntil: UtcInstant; readonly revokedAt?: UtcInstant | null;
  readonly sourceId: SourceId; readonly sourceVersion: VersionId; readonly decisionReference: string;
}
export class ArchiveLifecycleGrant {
  readonly reference!: string; readonly scope!: ArchiveScope; readonly actor!: ActorReference; readonly purpose!: PurposeReference;
  readonly permissions!: readonly ArchiveOperation[]; readonly accessDecision!: TenantAccessDecision;
  readonly validFrom!: UtcInstant; readonly validUntil!: UtcInstant; readonly revokedAt!: UtcInstant | null;
  readonly sourceId!: SourceId; readonly sourceVersion!: VersionId; readonly decisionReference!: string;
  private constructor(input: Required<ArchiveLifecycleGrantInput>) { Object.assign(this, input); Object.freeze(this); }
  static create(input: ArchiveLifecycleGrantInput): ArchiveLifecycleGrant {
    if (!(input.scope instanceof ArchiveScope) || !(input.actor instanceof ActorReference) || !(input.purpose instanceof PurposeReference) || !(input.accessDecision instanceof TenantAccessDecision)) throw new TypeError('Archive grant requires governed scope, actor and access decision');
    if (input.actor.kind !== ActorKind.HUMAN_USER && input.actor.kind !== ActorKind.SYSTEM_PROCESS) throw new TypeError('Archive grant requires an individual human or system principal');
    const permissions = list(input.permissions, value => Object.values(ArchiveOperation).includes(value)).sort(); unique(permissions);
    if (!permissions.length) throw new TypeError('Archive grant requires explicit permissions');
    const access = input.accessDecision;
    if (access.disposition !== AccessDisposition.ALLOW || !same(access.tenant, input.scope.tenant) || !same(access.purpose, input.purpose) || !access.allowedFields.includes('archive:metadata')) throw new TypeError('Archive access denied');
    period(input.validFrom, input.validUntil); const revokedAt = input.revokedAt ?? null; if (revokedAt !== null) ms(revokedAt); source(input.sourceId, input.sourceVersion);
    return new ArchiveLifecycleGrant({ reference: text(input.reference, 'Grant reference'), scope: input.scope, actor: input.actor, purpose: input.purpose, permissions: Object.freeze(permissions), accessDecision: access, validFrom: input.validFrom, validUntil: input.validUntil, revokedAt, sourceId: input.sourceId, sourceVersion: input.sourceVersion, decisionReference: text(input.decisionReference, 'Grant decision reference') });
  }
  authorize(scope: ArchiveScope, context: ApplicationExecutionContext, operation: ArchiveOperation): void {
    if (scope !== this.scope || !(context instanceof ApplicationExecutionContext) || context.operation.toString() !== operation || !this.permissions.includes(operation)) throw new TypeError('Archive operation not granted');
    if (context.tenantScope === null || context.organizationScope === null || context.subject === null || context.purpose === null || context.accessDecision === null || !same(context.tenantScope, scope.tenant) || !same(context.organizationScope, scope.intake.organization!) || !same(context.subject.id, scope.intake.subject!.id) || context.subject.kind !== scope.intake.subject!.kind || !same(context.actor.id, this.actor.id) || context.actor.kind !== this.actor.kind || !same(context.purpose, this.purpose) || !same(context.accessDecision, this.accessDecision.reference)) throw new TypeError('Archive invocation scope mismatch');
    const time = ms(context.requestedAt);
    if (time < ms(this.validFrom) || time > ms(this.validUntil) || (this.revokedAt !== null && time >= ms(this.revokedAt))) throw new RangeError('Archive grant is expired, revoked or not yet active');
  }
  toJSON() { return Object.freeze({ reference: this.reference, actorId: this.actor.id.toString(), purpose: this.purpose.toString(), permissions: Object.freeze([...this.permissions]), accessDecisionReference: this.accessDecision.reference.toString(), auditReference: this.accessDecision.auditReference.toString(), sourceId: this.sourceId.toString(), sourceVersion: this.sourceVersion.toString(), decisionReference: this.decisionReference, validFrom: this.validFrom.toString(), validUntil: this.validUntil.toString(), revokedAt: this.revokedAt?.toString() ?? null }); }
}

export interface ArchiveRetentionPolicyInput {
  readonly reference: string; readonly version: VersionId; readonly sourceId: SourceId; readonly sourceSnapshotReference: string;
  readonly reviewedAt: UtcInstant; readonly retainThrough: UtcInstant | null; readonly reviewDueAt: UtcInstant;
}
export class ArchiveRetentionPolicy {
  readonly reference!: string; readonly version!: VersionId; readonly sourceId!: SourceId; readonly sourceSnapshotReference!: string;
  readonly reviewedAt!: UtcInstant; readonly retainThrough!: UtcInstant | null; readonly reviewDueAt!: UtcInstant;
  private constructor(input: ArchiveRetentionPolicyInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: ArchiveRetentionPolicyInput): ArchiveRetentionPolicy {
    source(input.sourceId, input.version); if (ms(input.reviewDueAt) <= ms(input.reviewedAt)) throw new RangeError('Retention policy review deadline must follow review');
    if (input.retainThrough !== null) ms(input.retainThrough);
    return new ArchiveRetentionPolicy({ reference: text(input.reference, 'Retention policy'), version: input.version, sourceId: input.sourceId, sourceSnapshotReference: text(input.sourceSnapshotReference, 'Retention source snapshot'), reviewedAt: input.reviewedAt, retainThrough: input.retainThrough, reviewDueAt: input.reviewDueAt });
  }
  assertApplicable(scope: ArchiveScope, time: UtcInstant): void { if (this.reference !== scope.archive.retentionPolicyReference || ms(this.reviewedAt) > ms(time)) throw new TypeError('Retention policy reference or knowledge time mismatch'); }
  toJSON() { return Object.freeze({ reference: this.reference, version: this.version.toString(), sourceId: this.sourceId.toString(), sourceSnapshotReference: this.sourceSnapshotReference, reviewedAt: this.reviewedAt.toString(), retainThrough: this.retainThrough?.toString() ?? null, reviewDueAt: this.reviewDueAt.toString() }); }
}

export const ArchiveLinkRelation = {
  EVIDENCES_CREDENTIAL: 'EVIDENCES_CREDENTIAL', EVIDENCES_REQUIREMENT: 'EVIDENCES_REQUIREMENT', SUPPORTS_RECOGNITION: 'SUPPORTS_RECOGNITION', SUPPORTS_RENEWAL: 'SUPPORTS_RENEWAL', SUPPLEMENTS_DOCUMENT: 'SUPPLEMENTS_DOCUMENT', SUPERSEDES_DOCUMENT: 'SUPERSEDES_DOCUMENT', RELATED_TO_SUBJECT: 'RELATED_TO_SUBJECT',
} as const;
export type ArchiveLinkRelation = (typeof ArchiveLinkRelation)[keyof typeof ArchiveLinkRelation];
export type ArchiveTargetKind = 'CREDENTIAL' | 'REQUIREMENT' | 'RECOGNITION' | 'RENEWAL' | 'DOCUMENT' | 'SUBJECT';
const TARGETS: Readonly<Record<ArchiveLinkRelation, ArchiveTargetKind>> = Object.freeze({ EVIDENCES_CREDENTIAL: 'CREDENTIAL', EVIDENCES_REQUIREMENT: 'REQUIREMENT', SUPPORTS_RECOGNITION: 'RECOGNITION', SUPPORTS_RENEWAL: 'RENEWAL', SUPPLEMENTS_DOCUMENT: 'DOCUMENT', SUPERSEDES_DOCUMENT: 'DOCUMENT', RELATED_TO_SUBJECT: 'SUBJECT' });
export interface ArchiveLinkInput {
  readonly id: string; readonly source: ArchiveScope; readonly relation: ArchiveLinkRelation; readonly targetKind: ArchiveTargetKind;
  readonly targetReference: string; readonly targetTenant: TenantScopeReference; readonly targetOrganization: OrganizationScopeReference;
  readonly targetArchive?: ArchiveScope | null; readonly relationship?: OriginalArchiveRelationship | null;
  readonly scopeReference: string; readonly sourceId: SourceId; readonly sourceVersion: VersionId; readonly sourceSnapshotReference: string;
  readonly recordedAt: UtcInstant; readonly validFrom: UtcInstant; readonly validUntil: UtcInstant | null;
}
export class ArchiveLink {
  readonly id!: string; readonly source!: ArchiveScope; readonly relation!: ArchiveLinkRelation; readonly targetKind!: ArchiveTargetKind;
  readonly targetReference!: string; readonly targetTenant!: TenantScopeReference; readonly targetOrganization!: OrganizationScopeReference;
  readonly targetArchive!: ArchiveScope | null; readonly relationship!: OriginalArchiveRelationship | null;
  readonly scopeReference!: string; readonly sourceId!: SourceId; readonly sourceVersion!: VersionId; readonly sourceSnapshotReference!: string;
  readonly recordedAt!: UtcInstant; readonly validFrom!: UtcInstant; readonly validUntil!: UtcInstant | null;
  private constructor(input: Required<ArchiveLinkInput>) { Object.assign(this, input); Object.freeze(this); }
  static create(input: ArchiveLinkInput): ArchiveLink {
    if (!(input.source instanceof ArchiveScope) || !Object.values(ArchiveLinkRelation).includes(input.relation) || TARGETS[input.relation] !== input.targetKind) throw new TypeError('Archive relation and target kind mismatch');
    if (!(input.targetTenant instanceof TenantScopeReference) || !(input.targetOrganization instanceof OrganizationScopeReference) || !same(input.targetTenant, input.source.tenant) || !same(input.targetOrganization, input.source.intake.organization!)) throw new TypeError('Archive link crosses tenant or organization');
    const targetReference = text(input.targetReference, 'Archive link target');
    const targetArchive = input.targetArchive ?? null, relationship = input.relationship ?? null;
    if (input.targetKind === 'DOCUMENT') {
      const expected = input.relation === ArchiveLinkRelation.SUPPLEMENTS_DOCUMENT ? OriginalArchiveRelationshipKind.SUPPLEMENTS : OriginalArchiveRelationshipKind.REPLACES;
      if (!(targetArchive instanceof ArchiveScope) || !(relationship instanceof OriginalArchiveRelationship) || relationship.source !== input.source.archive || relationship.target !== targetArchive.archive || relationship.kind !== expected || targetReference !== targetArchive.archive.originalArtifact.id.toString() || !same(targetArchive.tenant, input.source.tenant) || !same(targetArchive.intake.organization!, input.source.intake.organization!) || ms(relationship.recordedAt) > ms(input.recordedAt)) throw new TypeError('Document link requires exact scoped S02 relationship');
    } else if (targetArchive !== null || relationship !== null) throw new TypeError('Only document links may carry archive relationships');
    if (input.targetKind === 'SUBJECT' && targetReference !== input.source.intake.subject!.id.toString()) throw new TypeError('Subject link must match archive subject');
    period(input.validFrom, input.validUntil); if (ms(input.recordedAt) < ms(input.source.archive.archivedAt)) throw new RangeError('Archive link predates original'); source(input.sourceId, input.sourceVersion);
    return new ArchiveLink({ id: uuid(input.id), source: input.source, relation: input.relation, targetKind: input.targetKind, targetReference, targetTenant: input.targetTenant, targetOrganization: input.targetOrganization, targetArchive, relationship, scopeReference: text(input.scopeReference, 'Link scope'), sourceId: input.sourceId, sourceVersion: input.sourceVersion, sourceSnapshotReference: text(input.sourceSnapshotReference, 'Link source snapshot'), recordedAt: input.recordedAt, validFrom: input.validFrom, validUntil: input.validUntil });
  }
  isEffectiveAt(time: UtcInstant): boolean { return ms(time) >= ms(this.validFrom) && (this.validUntil === null || ms(time) <= ms(this.validUntil)); }
  toJSON() { return Object.freeze({ id: this.id, sourceEvidenceId: this.source.archive.originalArtifact.id.toString(), targetKind: this.targetKind, targetReference: this.targetReference, relation: this.relation, tenant: this.targetTenant.toString(), organization: this.targetOrganization.toString(), scopeReference: this.scopeReference, sourceId: this.sourceId.toString(), sourceVersion: this.sourceVersion.toString(), sourceSnapshotReference: this.sourceSnapshotReference, recordedAt: this.recordedAt.toString(), validFrom: this.validFrom.toString(), validUntil: this.validUntil?.toString() ?? null, verificationState: this.source.archive.originalArtifact.verificationState.toString() }); }
}

export interface ArchiveHoldInput { readonly id: string; readonly scope: ArchiveScope; readonly basisReference: string; readonly recordedAt: UtcInstant; readonly startsAt: UtcInstant; readonly endsAt: UtcInstant | null; }
export class ArchiveHold {
  readonly id!: string; readonly scope!: ArchiveScope; readonly basisReference!: string; readonly recordedAt!: UtcInstant; readonly startsAt!: UtcInstant; readonly endsAt!: UtcInstant | null;
  private constructor(input: ArchiveHoldInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: ArchiveHoldInput): ArchiveHold {
    if (!(input.scope instanceof ArchiveScope)) throw new TypeError('Archive hold requires scope'); period(input.startsAt, input.endsAt);
    if (ms(input.recordedAt) < ms(input.scope.archive.archivedAt)) throw new RangeError('Hold predates archive');
    return new ArchiveHold({ id: uuid(input.id), scope: input.scope, basisReference: text(input.basisReference, 'Hold basis'), recordedAt: input.recordedAt, startsAt: input.startsAt, endsAt: input.endsAt });
  }
  toJSON() { return Object.freeze({ id: this.id, basisReference: this.basisReference, recordedAt: this.recordedAt.toString(), startsAt: this.startsAt.toString(), endsAt: this.endsAt?.toString() ?? null }); }
}

export type ArchiveChange =
  | { readonly kind: 'LINK'; readonly link: ArchiveLink }
  | { readonly kind: 'UNLINK'; readonly reference: string }
  | { readonly kind: 'PLACE_HOLD'; readonly hold: ArchiveHold }
  | { readonly kind: 'RELEASE_HOLD'; readonly reference: string }
  | { readonly kind: 'REPLACE_POLICY'; readonly policy: ArchiveRetentionPolicy }
  | { readonly kind: 'PIN_SNAPSHOT'; readonly snapshot: ArchiveEvidenceSnapshot }
  | { readonly kind: 'RELEASE_SNAPSHOT'; readonly reference: string }
  | { readonly kind: 'TOMBSTONE'; readonly assessment: ArchiveDisposalAssessment };
export class ArchiveCommand {
  readonly id: CommandId; readonly scope: ArchiveScope; readonly change: ArchiveChange; readonly submittedAt: UtcInstant; readonly idempotencyKey: string; readonly reasonReference: string;
  private constructor(id: CommandId, scope: ArchiveScope, change: ArchiveChange, submittedAt: UtcInstant, key: string, reason: string) { this.id = id; this.scope = scope; this.change = Object.freeze(change); this.submittedAt = submittedAt; this.idempotencyKey = key; this.reasonReference = reason; Object.freeze(this); }
  static create(input: { readonly id: CommandId; readonly scope: ArchiveScope; readonly change: ArchiveChange; readonly submittedAt: UtcInstant; readonly idempotencyKey: string; readonly reasonReference: string }): ArchiveCommand {
    if (!(input.id instanceof CommandId) || !(input.scope instanceof ArchiveScope) || input.change === null || typeof input.change !== 'object') throw new TypeError('Archive command requires governed identity/scope/change'); ms(input.submittedAt);
    let change: ArchiveChange;
    switch (input.change.kind) {
      case 'LINK': if (!(input.change.link instanceof ArchiveLink) || input.change.link.source !== input.scope) throw new TypeError('Foreign link'); change = { kind: 'LINK', link: input.change.link }; break;
      case 'PLACE_HOLD': if (!(input.change.hold instanceof ArchiveHold) || input.change.hold.scope !== input.scope) throw new TypeError('Foreign hold'); change = { kind: 'PLACE_HOLD', hold: input.change.hold }; break;
      case 'REPLACE_POLICY': if (!(input.change.policy instanceof ArchiveRetentionPolicy)) throw new TypeError('Policy required'); change = { kind: 'REPLACE_POLICY', policy: input.change.policy }; break;
      case 'PIN_SNAPSHOT': if (!(input.change.snapshot instanceof ArchiveEvidenceSnapshot) || input.change.snapshot.lifecycle.scope !== input.scope) throw new TypeError('Foreign snapshot'); change = { kind: 'PIN_SNAPSHOT', snapshot: input.change.snapshot }; break;
      case 'TOMBSTONE': if (!(input.change.assessment instanceof ArchiveDisposalAssessment) || input.change.assessment.lifecycle.scope !== input.scope) throw new TypeError('Foreign disposal assessment'); change = { kind: 'TOMBSTONE', assessment: input.change.assessment }; break;
      case 'UNLINK': case 'RELEASE_HOLD': case 'RELEASE_SNAPSHOT': change = { kind: input.change.kind, reference: uuid(input.change.reference) }; break;
      default: throw new TypeError('Archive change kind must be controlled');
    }
    return new ArchiveCommand(input.id, input.scope, change, input.submittedAt, text(input.idempotencyKey, 'Archive idempotency key'), text(input.reasonReference, 'Archive reason'));
  }
  get operation(): ArchiveOperation { return ArchiveOperation[this.change.kind]; }
  toJSON() {
    const change = this.change;
    const payload = change.kind === 'LINK' ? change.link.toJSON() : change.kind === 'PLACE_HOLD' ? change.hold.toJSON() : change.kind === 'REPLACE_POLICY' ? change.policy.toJSON() : change.kind === 'PIN_SNAPSHOT' ? change.snapshot.toJSON() : change.kind === 'TOMBSTONE' ? change.assessment.toJSON() : change.reference;
    return Object.freeze({ id: this.id.toString(), archive: this.scope.toJSON(), kind: change.kind, payload, submittedAt: this.submittedAt.toString(), idempotencyKey: this.idempotencyKey, reasonReference: this.reasonReference });
  }
}
export interface ArchiveLifecycleEvent { readonly revision: number; readonly command: ArchiveCommand; readonly context: ApplicationExecutionContext; readonly grant: ArchiveLifecycleGrant; }
export class ArchiveLifecycle {
  readonly scope: ArchiveScope; readonly policy: ArchiveRetentionPolicy; readonly initialPolicy: ArchiveRetentionPolicy; readonly links: readonly ArchiveLink[]; readonly holds: readonly ArchiveHold[]; readonly pins: readonly ArchiveEvidenceSnapshot[];
  readonly records: readonly ArchiveLifecycleEvent[]; readonly revision: number; readonly status: 'ACTIVE' | 'TOMBSTONED'; readonly openedAt: UtcInstant; readonly lastChangedAt: UtcInstant;
  readonly openingContext: ApplicationExecutionContext; readonly openingGrant: ArchiveLifecycleGrant;
  private constructor(input: { scope: ArchiveScope; policy: ArchiveRetentionPolicy; initialPolicy: ArchiveRetentionPolicy; links: readonly ArchiveLink[]; holds: readonly ArchiveHold[]; pins: readonly ArchiveEvidenceSnapshot[]; records: readonly ArchiveLifecycleEvent[]; status: 'ACTIVE' | 'TOMBSTONED'; openingContext: ApplicationExecutionContext; openingGrant: ArchiveLifecycleGrant }) {
    this.scope = input.scope; this.policy = input.policy; this.initialPolicy = input.initialPolicy; this.links = Object.freeze([...input.links]); this.holds = Object.freeze([...input.holds]); this.pins = Object.freeze([...input.pins]); this.records = Object.freeze([...input.records]); this.revision = input.records.length; this.status = input.status; this.openingContext = input.openingContext; this.openingGrant = input.openingGrant; this.openedAt = input.openingContext.requestedAt; this.lastChangedAt = input.records.at(-1)?.context.requestedAt ?? this.openedAt; Object.freeze(this);
  }
  static start(input: { readonly scope: ArchiveScope; readonly policy: ArchiveRetentionPolicy; readonly context: ApplicationExecutionContext; readonly grant: ArchiveLifecycleGrant }): ArchiveLifecycle {
    if (!(input.scope instanceof ArchiveScope) || !(input.policy instanceof ArchiveRetentionPolicy) || !(input.grant instanceof ArchiveLifecycleGrant)) throw new TypeError('Archive lifecycle requires governed inputs');
    input.grant.authorize(input.scope, input.context, ArchiveOperation.OPEN); input.policy.assertApplicable(input.scope, input.context.requestedAt);
    if (ms(input.context.requestedAt) < ms(input.scope.archive.archivedAt)) throw new RangeError('Lifecycle predates archive');
    return new ArchiveLifecycle({ scope: input.scope, policy: input.policy, initialPolicy: input.policy, links: [], holds: [], pins: [], records: [], status: 'ACTIVE', openingContext: input.context, openingGrant: input.grant });
  }
  apply(input: { readonly command: ArchiveCommand; readonly context: ApplicationExecutionContext; readonly grant: ArchiveLifecycleGrant; readonly expectedRevision: number }): ArchiveLifecycle {
    if (!(input.command instanceof ArchiveCommand) || input.command.scope !== this.scope || !(input.grant instanceof ArchiveLifecycleGrant)) throw new TypeError('Foreign archive command or grant');
    const cmd = input.command, change = cmd.change;
    input.grant.authorize(this.scope, input.context, cmd.operation);
    const now = ms(input.context.requestedAt);
    if (!Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 0) throw new RangeError('Expected archive revision must be nonnegative safe integer');
    if (now < ms(this.lastChangedAt) || now < ms(cmd.submittedAt)) throw new RangeError('Archive invocation predates command or history');
    const prior = this.records.find(record => record.command.idempotencyKey === cmd.idempotencyKey);
    if (prior !== undefined) { if (JSON.stringify(prior.command.toJSON()) !== JSON.stringify(cmd.toJSON()) || !same(prior.context.actor.id, input.context.actor.id)) throw new TypeError('Archive idempotency key collision'); return this; }
    if (this.records.some(record => same(record.command.id, cmd.id))) throw new TypeError('Archive command ID already used');
    if (input.expectedRevision !== this.revision) throw new RangeError('Archive revision conflict');
    if (this.status !== 'ACTIVE') throw new TypeError('Tombstoned archive is terminal');
    if (ms(cmd.submittedAt) < ms(this.records.at(-1)?.command.submittedAt ?? this.openedAt)) throw new RangeError('Archive submission predates history');
    let links = [...this.links], holds = [...this.holds], pins = [...this.pins], policy = this.policy;
    let status: 'ACTIVE' | 'TOMBSTONED' = this.status;
    const used = (kind: 'LINK' | 'PLACE_HOLD' | 'PIN_SNAPSHOT', id: string) => this.records.some(record => { const c = record.command.change; return c.kind === kind && ((c.kind === 'LINK' && c.link.id === id) || (c.kind === 'PLACE_HOLD' && c.hold.id === id) || (c.kind === 'PIN_SNAPSHOT' && c.snapshot.id === id)); });
    switch (change.kind) {
      case 'LINK': if (used('LINK', change.link.id) || ms(change.link.recordedAt) > ms(cmd.submittedAt)) throw new TypeError('Link ID reused or link not yet recorded'); links.push(change.link); links.sort((a, b) => a.id.localeCompare(b.id)); break;
      case 'UNLINK': if (!links.some(link => link.id === change.reference)) throw new TypeError('Unknown archive link'); links = links.filter(link => link.id !== change.reference); break;
      case 'PLACE_HOLD': if (used('PLACE_HOLD', change.hold.id) || ms(change.hold.recordedAt) > ms(cmd.submittedAt)) throw new TypeError('Hold ID reused or hold not yet recorded'); holds.push(change.hold); holds.sort((a, b) => a.id.localeCompare(b.id)); break;
      case 'RELEASE_HOLD': if (!holds.some(hold => hold.id === change.reference)) throw new TypeError('Unknown archive hold'); holds = holds.filter(hold => hold.id !== change.reference); break;
      case 'REPLACE_POLICY': {
        change.policy.assertApplicable(this.scope, cmd.submittedAt);
        const reusedVersion = same(change.policy.version, this.initialPolicy.version) || this.records.some(record => record.command.change.kind === 'REPLACE_POLICY' && same(record.command.change.policy.version, change.policy.version));
        if (reusedVersion) throw new TypeError('Policy version was already used in archive history');
        if (ms(change.policy.reviewedAt) < ms(this.policy.reviewedAt)) throw new TypeError('Policy review time must not regress');
        policy = change.policy; break;
      }
      case 'PIN_SNAPSHOT': if (change.snapshot.lifecycle !== this || used('PIN_SNAPSHOT', change.snapshot.id) || ms(change.snapshot.capturedAt) > ms(cmd.submittedAt)) throw new TypeError('Snapshot pin requires exact current lifecycle'); pins.push(change.snapshot); pins.sort((a, b) => a.id.localeCompare(b.id)); break;
      case 'RELEASE_SNAPSHOT': { const pin = pins.find(value => value.id === change.reference); if (pin === undefined || pin.preserveUntil === null || now <= ms(pin.preserveUntil)) throw new TypeError('Snapshot pin is unknown, indefinite or still required'); pins = pins.filter(value => value !== pin); break; }
      case 'TOMBSTONE': if (change.assessment.lifecycle !== this || change.assessment.outcome !== 'DISPOSAL_CANDIDATE' || ms(change.assessment.evaluatedAt) !== now) throw new TypeError('Tombstone requires exact current eligible assessment'); status = 'TOMBSTONED'; break;
    }
    const record = Object.freeze({ revision: this.revision + 1, command: cmd, context: input.context, grant: input.grant });
    return new ArchiveLifecycle({ scope: this.scope, policy, initialPolicy: this.initialPolicy, links, holds, pins, records: [...this.records, record], status, openingContext: this.openingContext, openingGrant: this.openingGrant });
  }
  toJSON() { return Object.freeze({ archive: this.scope.toJSON(), revision: this.revision, status: this.status, openedAt: this.openedAt.toString(), lastChangedAt: this.lastChangedAt.toString(), initialPolicy: this.initialPolicy.toJSON(), policy: this.policy.toJSON(), links: Object.freeze(this.links.map(link => link.toJSON())), holds: Object.freeze(this.holds.map(hold => hold.toJSON())), snapshotIds: Object.freeze(this.pins.map(pin => pin.id)), events: Object.freeze(this.records.map(record => Object.freeze({ revision: record.revision, command: record.command.toJSON(), actorId: record.context.actor.id.toString(), executedAt: record.context.requestedAt.toString(), correlationId: record.context.correlationId.toString(), grant: record.grant.toJSON() }))), physicalDeletionAuthorized: false }); }
}

export interface ArchiveSnapshotInput {
  readonly id: string; readonly lifecycle: ArchiveLifecycle; readonly context: ApplicationExecutionContext; readonly grant: ArchiveLifecycleGrant; readonly security: IntakeSecurityAssessment;
  readonly derivedRecords: readonly DerivedExtractionProposalRecord[]; readonly extractionReviews: readonly ExtractionProposalReviewHistory[];
  readonly verificationResults: readonly VerificationRouteResult[]; readonly humanReviews: readonly HumanReviewHistory[]; readonly preserveUntil: UtcInstant | null;
}
export class ArchiveEvidenceSnapshot {
  readonly id: string; readonly lifecycle: ArchiveLifecycle; readonly capturedAt: UtcInstant; readonly preserveUntil: UtcInstant | null; readonly evidenceSnapshot: EvidenceSnapshot;
  readonly context: ApplicationExecutionContext; readonly grant: ArchiveLifecycleGrant; readonly security: IntakeSecurityAssessment;
  readonly derivedRecords: readonly DerivedExtractionProposalRecord[]; readonly extractionReviews: readonly ExtractionProposalReviewHistory[];
  readonly verificationResults: readonly VerificationRouteResult[]; readonly humanReviews: readonly HumanReviewHistory[];
  private constructor(input: ArchiveSnapshotInput, evidenceSnapshot: EvidenceSnapshot) { this.id = input.id; this.lifecycle = input.lifecycle; this.context = input.context; this.grant = input.grant; this.capturedAt = input.context.requestedAt; this.preserveUntil = input.preserveUntil; this.security = input.security; this.derivedRecords = Object.freeze([...input.derivedRecords]); this.extractionReviews = Object.freeze([...input.extractionReviews]); this.verificationResults = Object.freeze([...input.verificationResults]); this.humanReviews = Object.freeze([...input.humanReviews]); this.evidenceSnapshot = evidenceSnapshot; Object.freeze(this); }
  static capture(input: ArchiveSnapshotInput): ArchiveEvidenceSnapshot {
    if (!(input.lifecycle instanceof ArchiveLifecycle) || !(input.grant instanceof ArchiveLifecycleGrant) || !(input.security instanceof IntakeSecurityAssessment)) throw new TypeError('Snapshot requires governed lifecycle/grant/security');
    const state = input.lifecycle, scope = state.scope;
    input.grant.authorize(scope, input.context, ArchiveOperation.CAPTURE);
    const time = ms(input.context.requestedAt);
    if (state.status !== 'ACTIVE' || time < ms(state.lastChangedAt) || input.security.archiveEntry !== scope.archive || ms(input.security.evaluatedAt) > time) throw new TypeError('Snapshot lifecycle or security cutoff mismatch');
    period(input.context.requestedAt, input.preserveUntil);
    const derivedRecords = list(input.derivedRecords, value => value instanceof DerivedExtractionProposalRecord).sort((a, b) => a.derivedEvidence.id.toString().localeCompare(b.derivedEvidence.id.toString()));
    for (const item of derivedRecords) if (item.rootOriginalArchiveEntry !== scope.archive || (item.parent !== scope.archive && !derivedRecords.includes(item.parent as DerivedExtractionProposalRecord)) || ms(item.derivedEvidence.acquiredAt) > time) throw new TypeError('Snapshot requires complete exact known derived lineage');
    const evidence: EvidenceReference[] = [scope.archive.originalArtifact, ...derivedRecords.map(item => item.derivedEvidence)].sort((a, b) => a.id.toString().localeCompare(b.id.toString()));
    unique(evidence.map(item => item.id.toString()));
    const extractionReviews = list(input.extractionReviews, value => value instanceof ExtractionProposalReviewHistory).sort((a, b) => a.proposal.derivedEvidence.id.toString().localeCompare(b.proposal.derivedEvidence.id.toString()));
    unique(extractionReviews.map(item => item.proposal.derivedEvidence.id.toString()));
    for (const history of extractionReviews) if (!derivedRecords.includes(history.proposal) || history.revisions.some(revision => ms(revision.reviewedAt) > time)) throw new TypeError('Snapshot extraction review lineage or time mismatch');
    const verificationResults = list(input.verificationResults, value => value instanceof VerificationRouteResult).sort((a, b) => a.providerRequest.attemptId.toString().localeCompare(b.providerRequest.attemptId.toString()));
    unique(verificationResults.map(result => result.providerRequest.attemptId.toString()));
    for (const result of verificationResults) if (!evidence.includes(result.providerRequest.request.evidence) || result.providerRequest.request.subjectReference !== scope.intake.subject!.id.toString() || ms(result.providerRequest.request.asKnownAt) > time || ms(result.providerResult.checkedAt) > time) throw new TypeError('Snapshot provider evidence, subject or time mismatch');
    const humanReviews = list(input.humanReviews, value => value instanceof HumanReviewHistory).sort((a, b) => a.reviewCase.id.toString().localeCompare(b.reviewCase.id.toString())); unique(humanReviews.map(value => value.reviewCase.id.toString()));
    for (const history of humanReviews) {
      const c = history.reviewCase, context = c.context;
      if (c.request.evidence !== scope.archive.originalArtifact || c.security.archiveEntry !== scope.archive || context.tenantScope === null || context.organizationScope === null || context.subject === null || !same(context.tenantScope, scope.tenant) || !same(context.organizationScope, scope.intake.organization!) || !same(context.subject.id, scope.intake.subject!.id) || context.subject.kind !== scope.intake.subject!.kind || ms(context.requestedAt) > time || ms(c.request.asKnownAt) > time || history.records.some(record => ms(record.context.requestedAt) > time)) throw new TypeError('Snapshot human review scope or time mismatch');
    }
    return new ArchiveEvidenceSnapshot({ id: uuid(input.id), lifecycle: state, context: input.context, grant: input.grant, security: input.security, derivedRecords, extractionReviews, verificationResults, humanReviews, preserveUntil: input.preserveUntil }, EvidenceSnapshot.capture(evidence, input.context.requestedAt));
  }
  toJSON() {
    const verificationResults = Object.freeze(this.verificationResults.map(result => Object.freeze({
      ...result.toJSON(),
      method: result.providerRequest.route.method,
      verifierEntityId: result.providerRequest.route.verifierEntity.id.toString(),
      assertions: Object.freeze(result.checkedClaims.map(claim => Object.freeze({ claim, fingerprint: result.assertionFingerprintFor(claim) }))),
      authorityResolutions: Object.freeze(result.authorityResolutions.map(resolution => resolution.toJSON())),
    })));
    return Object.freeze({ id: this.id, archive: this.lifecycle.scope.toJSON(), lifecycleRevision: this.lifecycle.revision, capturedAt: this.capturedAt.toString(), preserveUntil: this.preserveUntil?.toString() ?? null, policy: this.lifecycle.policy.toJSON(), links: Object.freeze(this.lifecycle.links.map(link => link.toJSON())), security: Object.freeze({ disposition: this.security.disposition, evaluatedAt: this.security.evaluatedAt.toString(), policyReference: this.security.policy.policyReference }), evidence: Object.freeze(this.evidenceSnapshot.entries.map(entry => Object.freeze({ evidenceId: entry.evidenceId.toString(), evidenceClass: entry.evidenceClass, evidenceKind: entry.evidenceKind, contentHash: entry.contentHash === null ? null : Object.freeze(entry.contentHash.toJSON()), verificationState: entry.verificationState.toString(), sourceId: entry.sourceId?.toString() ?? null, sourceVersion: entry.sourceVersion?.toString() ?? null }))), derivedLineage: Object.freeze(this.derivedRecords.map(item => Object.freeze({ evidenceId: item.derivedEvidence.id.toString(), parentId: item.derivedEvidence.derivationParent!.toString(), lineageIds: Object.freeze(item.lineageEvidenceIds.map(String)), processor: item.processor.toJSON() }))), extractionReviews: Object.freeze(this.extractionReviews.map(history => Object.freeze({ evidenceId: history.proposal.derivedEvidence.id.toString(), currentState: history.currentState, revisions: Object.freeze(history.revisions.map(revision => Object.freeze({ revision: revision.revisionNumber, state: revision.state, reviewedAt: revision.reviewedAt.toString(), reviewerId: revision.reviewedBy.id.toString(), actorRole: revision.actorRole }))) }))), verificationResults, humanReviews: Object.freeze(this.humanReviews.map(history => history.toJSON())), capturedBy: this.context.actor.id.toString(), correlationId: this.context.correlationId.toString(), grant: this.grant.toJSON() });
  }
}

export interface ArchiveDependencyInventoryInput {
  readonly lifecycle: ArchiveLifecycle; readonly completeness: 'COMPLETE' | 'INDETERMINATE'; readonly blockingReferences: readonly string[];
  readonly observedAt: UtcInstant; readonly freshUntil: UtcInstant; readonly sourceId: SourceId; readonly sourceVersion: VersionId; readonly sourceSnapshotReference: string;
}
export class ArchiveDependencyInventory {
  readonly lifecycle!: ArchiveLifecycle; readonly completeness!: 'COMPLETE' | 'INDETERMINATE'; readonly blockingReferences!: readonly string[];
  readonly observedAt!: UtcInstant; readonly freshUntil!: UtcInstant; readonly sourceId!: SourceId; readonly sourceVersion!: VersionId; readonly sourceSnapshotReference!: string;
  private constructor(input: ArchiveDependencyInventoryInput) { Object.assign(this, input); Object.freeze(this); }
  static create(input: ArchiveDependencyInventoryInput): ArchiveDependencyInventory {
    if (!(input.lifecycle instanceof ArchiveLifecycle) || !['COMPLETE', 'INDETERMINATE'].includes(input.completeness)) throw new TypeError('Dependency inventory requires lifecycle and controlled completeness');
    period(input.observedAt, input.freshUntil); if (ms(input.observedAt) < ms(input.lifecycle.lastChangedAt)) throw new RangeError('Dependency inventory predates lifecycle revision'); source(input.sourceId, input.sourceVersion);
    return new ArchiveDependencyInventory({ lifecycle: input.lifecycle, completeness: input.completeness, blockingReferences: references(input.blockingReferences), observedAt: input.observedAt, freshUntil: input.freshUntil, sourceId: input.sourceId, sourceVersion: input.sourceVersion, sourceSnapshotReference: text(input.sourceSnapshotReference, 'Dependency inventory source') });
  }
  toJSON() { return Object.freeze({ archive: this.lifecycle.scope.toJSON(), revision: this.lifecycle.revision, completeness: this.completeness, blockingReferences: Object.freeze([...this.blockingReferences]), observedAt: this.observedAt.toString(), freshUntil: this.freshUntil.toString(), sourceId: this.sourceId.toString(), sourceVersion: this.sourceVersion.toString(), sourceSnapshotReference: this.sourceSnapshotReference }); }
}
export class ArchiveDisposalAssessment {
  readonly lifecycle: ArchiveLifecycle; readonly inventory: ArchiveDependencyInventory; readonly evaluatedAt: UtcInstant;
  readonly context: ApplicationExecutionContext; readonly grant: ArchiveLifecycleGrant;
  readonly outcome: 'RETAIN' | 'REVIEW_REQUIRED' | 'DISPOSAL_CANDIDATE'; readonly reasonCodes: readonly string[]; readonly physicalDeletionAuthorized = false;
  private constructor(state: ArchiveLifecycle, inventory: ArchiveDependencyInventory, context: ApplicationExecutionContext, grant: ArchiveLifecycleGrant, outcome: ArchiveDisposalAssessment['outcome'], reasons: readonly string[]) { this.lifecycle = state; this.inventory = inventory; this.context = context; this.grant = grant; this.evaluatedAt = context.requestedAt; this.outcome = outcome; this.reasonCodes = Object.freeze([...reasons].sort()); Object.freeze(this); }
  static evaluate(input: { readonly lifecycle: ArchiveLifecycle; readonly inventory: ArchiveDependencyInventory; readonly context: ApplicationExecutionContext; readonly grant: ArchiveLifecycleGrant }): ArchiveDisposalAssessment {
    if (!(input.lifecycle instanceof ArchiveLifecycle) || !(input.inventory instanceof ArchiveDependencyInventory) || input.inventory.lifecycle !== input.lifecycle || !(input.grant instanceof ArchiveLifecycleGrant)) throw new TypeError('Disposal requires exact lifecycle dependency inventory');
    const state = input.lifecycle, inventory = input.inventory;
    input.grant.authorize(state.scope, input.context, ArchiveOperation.ASSESS);
    const now = ms(input.context.requestedAt); if (now < ms(state.lastChangedAt) || now < ms(inventory.observedAt)) throw new RangeError('Disposal assessment predates state or inventory');
    const reasons: string[] = []; let needsReview = false;
    if (state.status !== 'ACTIVE') reasons.push('ALREADY_TOMBSTONED');
    if (state.policy.retainThrough === null) reasons.push('INDEFINITE_RETENTION'); else if (now <= ms(state.policy.retainThrough)) reasons.push('RETENTION_NOT_ELAPSED');
    if (now >= ms(state.policy.reviewDueAt)) { reasons.push('RETENTION_POLICY_REVIEW_DUE'); needsReview = true; }
    if (inventory.completeness !== 'COMPLETE' || now > ms(inventory.freshUntil)) { reasons.push('DEPENDENCY_INVENTORY_UNCERTAIN_OR_STALE'); needsReview = true; }
    if (inventory.blockingReferences.length) reasons.push('EXTERNAL_DEPENDENCIES');
    if (state.links.length) reasons.push('REGISTERED_LINKS');
    if (state.holds.some(hold => hold.endsAt === null || now <= ms(hold.endsAt))) reasons.push('HOLD_REQUIRES_RETENTION');
    if (state.pins.length) reasons.push('SNAPSHOT_PINNED');
    const outcome = needsReview ? 'REVIEW_REQUIRED' : reasons.length ? 'RETAIN' : 'DISPOSAL_CANDIDATE';
    return new ArchiveDisposalAssessment(state, inventory, input.context, input.grant, outcome, reasons.length ? reasons : ['LOGICAL_DISPOSAL_CANDIDATE_ONLY']);
  }
  toJSON() { return Object.freeze({ archive: this.lifecycle.scope.toJSON(), revision: this.lifecycle.revision, evaluatedAt: this.evaluatedAt.toString(), outcome: this.outcome, reasonCodes: Object.freeze([...this.reasonCodes]), physicalDeletionAuthorized: false, inventory: this.inventory.toJSON(), assessedBy: this.context.actor.id.toString(), correlationId: this.context.correlationId.toString(), grant: this.grant.toJSON() }); }
}
