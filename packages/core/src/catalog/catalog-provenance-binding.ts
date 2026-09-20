import { SourceId } from '../ids.ts';
import { ProvenanceEnvelope } from '../provenance/provenance-envelope.ts';
import { SourceReference } from '../provenance/source-reference.ts';
import { VersionId } from '../version.ts';
import { ActivityDefinition, ProfessionDefinition } from './activity-profession-catalog.ts';
import { CredentialDefinition, RequirementDefinition } from './credential-requirement-catalog.ts';
import { QualificationPathDefinition } from './qualification-path.ts';
import { GovernedRequirementSetVersion } from './requirement-set-versioning.ts';

export const CatalogProvenanceTargetKind = {
  ACTIVITY_DEFINITION: 'ACTIVITY_DEFINITION',
  PROFESSION_DEFINITION: 'PROFESSION_DEFINITION',
  CREDENTIAL_DEFINITION: 'CREDENTIAL_DEFINITION',
  REQUIREMENT_DEFINITION: 'REQUIREMENT_DEFINITION',
  REQUIREMENT_SET_VERSION: 'REQUIREMENT_SET_VERSION',
  QUALIFICATION_PATH: 'QUALIFICATION_PATH',
} as const;
export type CatalogProvenanceTargetKind =
  (typeof CatalogProvenanceTargetKind)[keyof typeof CatalogProvenanceTargetKind];

export type CatalogProvenanceTarget =
  | ActivityDefinition
  | ProfessionDefinition
  | CredentialDefinition
  | RequirementDefinition
  | GovernedRequirementSetVersion
  | QualificationPathDefinition;

export interface CatalogSourceSnapshot {
  readonly id: string;
  readonly version: string;
  readonly authority: ReturnType<SourceReference['authority']['toJSON']>;
  readonly jurisdiction: ReturnType<SourceReference['jurisdiction']['toJSON']>;
  readonly sourceType: SourceReference['sourceType'];
  readonly canonicalLocator: string | null;
  readonly publicationDate: string | null;
  readonly effectiveFrom: string | null;
  readonly effectiveTo: string | null;
  readonly retrievedAt: string;
  readonly verificationState: string;
  readonly contentHash: string | null;
}

function sourceSnapshot(source: SourceReference): CatalogSourceSnapshot {
  return {
    id: source.id.toString(),
    version: source.version.toString(),
    authority: source.authority.toJSON(),
    jurisdiction: source.jurisdiction.toJSON(),
    sourceType: source.sourceType,
    canonicalLocator: source.canonicalLocator,
    publicationDate: source.publicationDate?.toString() ?? null,
    effectiveFrom: source.effectiveFrom?.toString() ?? null,
    effectiveTo: source.effectiveTo?.toString() ?? null,
    retrievedAt: source.retrievedAt.toString(),
    verificationState: source.verificationState.toString(),
    contentHash: source.contentHash?.toString() ?? null,
  };
}

function sourceSnapshotKey(source: SourceReference): string {
  return JSON.stringify(sourceSnapshot(source));
}

function normalizeRequiredSourceIds(values: readonly SourceId[]): readonly SourceId[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('Catalog provenance target requires at least one SourceId');
  }
  if (values.some((value) => !(value instanceof SourceId))) {
    throw new TypeError('Catalog provenance target source identities must use SourceId');
  }

  const byId = new Map<string, SourceId>();
  for (const value of values) byId.set(value.toString(), value);
  return Object.freeze([...byId.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value));
}

function normalizeSourceReferences(
  values: readonly SourceReference[],
  label: string,
): readonly SourceReference[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError(`${label} requires at least one SourceReference`);
  }
  if (values.some((value) => !(value instanceof SourceReference))) {
    throw new TypeError(`${label} must use SourceReference`);
  }

  const ids = values.map((value) => value.id.toString());
  if (new Set(ids).size !== ids.length) {
    throw new TypeError(`${label} source snapshots must use unique SourceId values`);
  }

  return Object.freeze([...values].sort((left, right) =>
    left.id.toString().localeCompare(right.id.toString())));
}

function targetDescriptor(target: CatalogProvenanceTarget): {
  readonly kind: CatalogProvenanceTargetKind;
  readonly id: string;
  readonly version: VersionId;
  readonly requiredSourceIds: readonly SourceId[];
} {
  if (target instanceof ActivityDefinition) {
    return {
      kind: CatalogProvenanceTargetKind.ACTIVITY_DEFINITION,
      id: target.id.toString(),
      version: target.version,
      requiredSourceIds: normalizeRequiredSourceIds(target.sourceReferenceIds),
    };
  }
  if (target instanceof ProfessionDefinition) {
    return {
      kind: CatalogProvenanceTargetKind.PROFESSION_DEFINITION,
      id: target.id.toString(),
      version: target.version,
      requiredSourceIds: normalizeRequiredSourceIds(target.sourceReferenceIds),
    };
  }
  if (target instanceof CredentialDefinition) {
    return {
      kind: CatalogProvenanceTargetKind.CREDENTIAL_DEFINITION,
      id: target.id.toString(),
      version: target.version,
      requiredSourceIds: normalizeRequiredSourceIds(target.sourceReferenceIds),
    };
  }
  if (target instanceof RequirementDefinition) {
    return {
      kind: CatalogProvenanceTargetKind.REQUIREMENT_DEFINITION,
      id: target.id.toString(),
      version: target.version,
      requiredSourceIds: normalizeRequiredSourceIds(target.sourceReferenceIds),
    };
  }
  if (target instanceof GovernedRequirementSetVersion) {
    return {
      kind: CatalogProvenanceTargetKind.REQUIREMENT_SET_VERSION,
      id: target.id.toString(),
      version: target.version,
      requiredSourceIds: normalizeRequiredSourceIds(target.sourceReferenceIds),
    };
  }
  if (target instanceof QualificationPathDefinition) {
    return {
      kind: CatalogProvenanceTargetKind.QUALIFICATION_PATH,
      id: target.id.toString(),
      version: target.version,
      requiredSourceIds: normalizeRequiredSourceIds([
        ...target.sourceReferenceIds,
        ...target.steps.flatMap((step) => step.sourceReferenceIds),
      ]),
    };
  }

  throw new TypeError('Catalog provenance binding requires a supported catalog target');
}

function assertExactSourceIdCoverage(
  requiredSourceIds: readonly SourceId[],
  sourceReferences: readonly SourceReference[],
): void {
  const required = requiredSourceIds.map(String);
  const actual = sourceReferences.map((source) => source.id.toString());
  if (required.length !== actual.length || required.some((id, index) => id !== actual[index])) {
    throw new TypeError('Catalog provenance sources must exactly match target SourceId identities');
  }
}

function assertExactProvenanceSources(
  sourceReferences: readonly SourceReference[],
  provenanceSources: readonly SourceReference[],
): void {
  if (sourceReferences.length !== provenanceSources.length) {
    throw new TypeError('Catalog provenance envelope must contain the exact source snapshots');
  }
  for (let index = 0; index < sourceReferences.length; index += 1) {
    const bound = sourceReferences[index];
    const provenance = provenanceSources[index];
    if (bound === undefined || provenance === undefined || sourceSnapshotKey(bound) !== sourceSnapshotKey(provenance)) {
      throw new TypeError('Catalog provenance envelope must contain the exact source snapshots');
    }
  }
}

export class CatalogProvenanceBinding {
  readonly target: CatalogProvenanceTarget;
  readonly targetKind: CatalogProvenanceTargetKind;
  readonly targetId: string;
  readonly targetVersion: VersionId;
  readonly requiredSourceIds: readonly SourceId[];
  readonly sourceReferences: readonly SourceReference[];
  readonly provenance: ProvenanceEnvelope;

  private constructor(input: {
    readonly target: CatalogProvenanceTarget;
    readonly targetKind: CatalogProvenanceTargetKind;
    readonly targetId: string;
    readonly targetVersion: VersionId;
    readonly requiredSourceIds: readonly SourceId[];
    readonly sourceReferences: readonly SourceReference[];
    readonly provenance: ProvenanceEnvelope;
  }) {
    this.target = input.target;
    this.targetKind = input.targetKind;
    this.targetId = input.targetId;
    this.targetVersion = input.targetVersion;
    this.requiredSourceIds = input.requiredSourceIds;
    this.sourceReferences = input.sourceReferences;
    this.provenance = input.provenance;
    Object.freeze(this);
  }

  static create(input: {
    readonly target: CatalogProvenanceTarget;
    readonly sourceReferences: readonly SourceReference[];
    readonly provenance: ProvenanceEnvelope;
  }): CatalogProvenanceBinding {
    const descriptor = targetDescriptor(input.target);
    const sourceReferences = normalizeSourceReferences(input.sourceReferences, 'Catalog provenance binding');
    assertExactSourceIdCoverage(descriptor.requiredSourceIds, sourceReferences);

    if (!(input.provenance instanceof ProvenanceEnvelope)) {
      throw new TypeError('Catalog provenance binding requires ProvenanceEnvelope');
    }
    if (input.provenance.subject !== null) {
      throw new TypeError('Catalog provenance must be subject-free');
    }
    if (input.provenance.evidence.length !== 0) {
      throw new TypeError('Catalog provenance must be evidence-free');
    }

    const provenanceSources = normalizeSourceReferences(input.provenance.sources, 'Catalog provenance envelope');
    assertExactProvenanceSources(sourceReferences, provenanceSources);

    const evaluatedAt = input.provenance.evaluatedAt.toEpochMilliseconds();
    for (const source of sourceReferences) {
      if (evaluatedAt < source.retrievedAt.toEpochMilliseconds()) {
        throw new RangeError('Catalog provenance evaluation cannot predate bound source retrieval');
      }
    }

    return new CatalogProvenanceBinding({
      target: input.target,
      targetKind: descriptor.kind,
      targetId: descriptor.id,
      targetVersion: descriptor.version,
      requiredSourceIds: descriptor.requiredSourceIds,
      sourceReferences,
      provenance: input.provenance,
    });
  }

  allSourcesVerified(): boolean {
    return this.sourceReferences.every((source) => source.verificationState.toString() === 'VERIFIED');
  }

  requiresSourceReview(): boolean {
    return !this.allSourcesVerified();
  }

  toJSON(): Record<string, unknown> {
    return {
      target: {
        kind: this.targetKind,
        id: this.targetId,
        version: this.targetVersion.toString(),
      },
      requiredSourceIds: this.requiredSourceIds.map(String),
      sourceReferences: this.sourceReferences.map(sourceSnapshot),
      provenance: {
        identity: this.provenance.identity.toString(),
        evaluatedAt: this.provenance.evaluatedAt.toString(),
        actor: this.provenance.actor.toJSON(),
        subject: null,
        ruleSetId: this.provenance.ruleSetId.toString(),
        ruleVersion: this.provenance.ruleVersion.toString(),
        sources: this.sourceReferences.map(sourceSnapshot),
        evidenceCount: 0,
      },
      allSourcesVerified: this.allSourcesVerified(),
      requiresSourceReview: this.requiresSourceReview(),
    };
  }
}
