import { ActivityDefinitionId, ProfessionDefinitionId, SourceId } from '../ids.ts';
import { Jurisdiction } from '../jurisdiction.ts';
import { DateOnly, UtcInstant } from '../time.ts';
import { VerificationState } from '../verification-state.ts';
import { VersionId } from '../version.ts';

function requiredText(value: string, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > maxLength) throw new RangeError(`${label} is too long`);
  return normalized;
}

function normalizedAliases(values: readonly string[], preferredLabel: string): readonly string[] {
  if (!Array.isArray(values)) throw new TypeError('Catalog aliases must be an array');
  const aliases = values.map((value) => requiredText(value, 'Catalog alias', 256));
  const keys = aliases.map((value) => value.toLocaleLowerCase('en-US'));
  if (new Set(keys).size !== keys.length) throw new TypeError('Catalog aliases must be unique');
  if (keys.includes(preferredLabel.toLocaleLowerCase('en-US'))) {
    throw new TypeError('Catalog alias must not duplicate the preferred label');
  }
  return Object.freeze(aliases);
}

function normalizedSourceIds(values: readonly SourceId[]): readonly SourceId[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('Catalog definition requires at least one source reference ID');
  }
  if (values.some((value) => !(value instanceof SourceId))) {
    throw new TypeError('Catalog source references must use SourceId');
  }
  const keys = values.map(String);
  if (new Set(keys).size !== keys.length) throw new TypeError('Catalog source reference IDs must be unique');
  return Object.freeze([...values]);
}

export const RegulatoryStatus = {
  UNREGULATED: 'UNREGULATED',
  REGULATED: 'REGULATED',
  PARTIALLY_REGULATED: 'PARTIALLY_REGULATED',
  UNKNOWN_REVIEW_REQUIRED: 'UNKNOWN_REVIEW_REQUIRED',
} as const;
export type RegulatoryStatus = (typeof RegulatoryStatus)[keyof typeof RegulatoryStatus];
const REGULATORY_STATUSES = new Set<string>(Object.values(RegulatoryStatus));

function controlledRegulatoryStatus(value: RegulatoryStatus): RegulatoryStatus {
  if (!REGULATORY_STATUSES.has(value)) throw new TypeError('Regulatory status must be controlled');
  return value;
}

export class CatalogEffectivePeriod {
  readonly effectiveFrom: DateOnly;
  readonly effectiveTo: DateOnly | null;

  private constructor(effectiveFrom: DateOnly, effectiveTo: DateOnly | null) {
    this.effectiveFrom = effectiveFrom;
    this.effectiveTo = effectiveTo;
    Object.freeze(this);
  }

  static create(input: {
    readonly effectiveFrom: DateOnly;
    readonly effectiveTo?: DateOnly | null;
  }): CatalogEffectivePeriod {
    if (!(input.effectiveFrom instanceof DateOnly)) throw new TypeError('Effective period requires DateOnly effectiveFrom');
    const effectiveTo = input.effectiveTo ?? null;
    if (effectiveTo !== null && !(effectiveTo instanceof DateOnly)) {
      throw new TypeError('Effective period effectiveTo must be DateOnly or null');
    }
    if (effectiveTo !== null && effectiveTo.toString() < input.effectiveFrom.toString()) {
      throw new RangeError('Effective period cannot end before it starts');
    }
    return new CatalogEffectivePeriod(input.effectiveFrom, effectiveTo);
  }

  isEffectiveOn(date: DateOnly): boolean {
    if (!(date instanceof DateOnly)) throw new TypeError('Effective-period evaluation requires explicit DateOnly');
    const value = date.toString();
    return value >= this.effectiveFrom.toString()
      && (this.effectiveTo === null || value <= this.effectiveTo.toString());
  }

  toJSON(): {
    readonly effectiveFrom: string;
    readonly effectiveTo: string | null;
  } {
    return {
      effectiveFrom: this.effectiveFrom.toString(),
      effectiveTo: this.effectiveTo?.toString() ?? null,
    };
  }
}

export const ExternalClassificationMappingRelation = {
  EXACT: 'EXACT',
  BROADER: 'BROADER',
  NARROWER: 'NARROWER',
  RELATED: 'RELATED',
  CANDIDATE: 'CANDIDATE',
} as const;
export type ExternalClassificationMappingRelation =
  (typeof ExternalClassificationMappingRelation)[keyof typeof ExternalClassificationMappingRelation];
const EXTERNAL_MAPPING_RELATIONS = new Set<string>(Object.values(ExternalClassificationMappingRelation));

export class ExternalClassificationReference {
  readonly system: string;
  readonly conceptId: string;
  readonly datasetVersion: VersionId;
  readonly mappingRelation: ExternalClassificationMappingRelation;
  readonly verificationState: VerificationState;
  readonly mappedAt: UtcInstant;
  readonly sourceReferenceId: SourceId;

  private constructor(input: {
    readonly system: string;
    readonly conceptId: string;
    readonly datasetVersion: VersionId;
    readonly mappingRelation: ExternalClassificationMappingRelation;
    readonly verificationState: VerificationState;
    readonly mappedAt: UtcInstant;
    readonly sourceReferenceId: SourceId;
  }) {
    this.system = input.system;
    this.conceptId = input.conceptId;
    this.datasetVersion = input.datasetVersion;
    this.mappingRelation = input.mappingRelation;
    this.verificationState = input.verificationState;
    this.mappedAt = input.mappedAt;
    this.sourceReferenceId = input.sourceReferenceId;
    Object.freeze(this);
  }

  static create(input: {
    readonly system: string;
    readonly conceptId: string;
    readonly datasetVersion: VersionId;
    readonly mappingRelation: ExternalClassificationMappingRelation;
    readonly verificationState: VerificationState;
    readonly mappedAt: UtcInstant;
    readonly sourceReferenceId: SourceId;
  }): ExternalClassificationReference {
    const system = requiredText(input.system, 'External classification system', 128);
    const conceptId = requiredText(input.conceptId, 'External classification concept ID', 256);
    if (!(input.datasetVersion instanceof VersionId)) throw new TypeError('External classification requires VersionId datasetVersion');
    if (!EXTERNAL_MAPPING_RELATIONS.has(input.mappingRelation)) {
      throw new TypeError('External classification mapping relation must be controlled');
    }
    if (!(input.verificationState instanceof VerificationState)) {
      throw new TypeError('External classification requires VerificationState');
    }
    if (!(input.mappedAt instanceof UtcInstant)) throw new TypeError('External classification requires explicit mappedAt');
    if (!(input.sourceReferenceId instanceof SourceId)) throw new TypeError('External classification requires SourceId');
    return new ExternalClassificationReference({ ...input, system, conceptId });
  }

  toJSON(): {
    readonly system: string;
    readonly conceptId: string;
    readonly datasetVersion: string;
    readonly mappingRelation: ExternalClassificationMappingRelation;
    readonly verificationState: string;
    readonly mappedAt: string;
    readonly sourceReferenceId: string;
  } {
    return {
      system: this.system,
      conceptId: this.conceptId,
      datasetVersion: this.datasetVersion.toString(),
      mappingRelation: this.mappingRelation,
      verificationState: this.verificationState.toString(),
      mappedAt: this.mappedAt.toString(),
      sourceReferenceId: this.sourceReferenceId.toString(),
    };
  }
}

function normalizedExternalClassifications(
  values: readonly ExternalClassificationReference[],
): readonly ExternalClassificationReference[] {
  if (!Array.isArray(values)) throw new TypeError('External classifications must be an array');
  if (values.some((value) => !(value instanceof ExternalClassificationReference))) {
    throw new TypeError('External classifications must use ExternalClassificationReference');
  }
  const keys = values.map((value) => [
    value.system.toLocaleLowerCase('en-US'),
    value.conceptId,
    value.datasetVersion.toString(),
    value.mappingRelation,
  ].join('|'));
  if (new Set(keys).size !== keys.length) throw new TypeError('External classification references must be unique per version and relation');
  return Object.freeze([...values]);
}

type CommonCatalogInput = {
  readonly version: VersionId;
  readonly preferredLabel: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly regulatoryStatus: RegulatoryStatus;
  readonly sourceReferenceIds: readonly SourceId[];
};

type NormalizedCommonCatalogInput = {
  readonly version: VersionId;
  readonly preferredLabel: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly regulatoryStatus: RegulatoryStatus;
  readonly sourceReferenceIds: readonly SourceId[];
};

function normalizeCommon(input: CommonCatalogInput): NormalizedCommonCatalogInput {
  if (!(input.version instanceof VersionId)) throw new TypeError('Catalog definition requires VersionId');
  if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Catalog definition requires Jurisdiction');
  if (!(input.effectivePeriod instanceof CatalogEffectivePeriod)) throw new TypeError('Catalog definition requires CatalogEffectivePeriod');
  const preferredLabel = requiredText(input.preferredLabel, 'Catalog preferred label', 256);
  const description = requiredText(input.description, 'Catalog description', 4000);
  return {
    version: input.version,
    preferredLabel,
    aliases: normalizedAliases(input.aliases, preferredLabel),
    description,
    jurisdiction: input.jurisdiction,
    effectivePeriod: input.effectivePeriod,
    regulatoryStatus: controlledRegulatoryStatus(input.regulatoryStatus),
    sourceReferenceIds: normalizedSourceIds(input.sourceReferenceIds),
  };
}

export class ActivityDefinition {
  readonly id: ActivityDefinitionId;
  readonly version: VersionId;
  readonly preferredLabel: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly regulatoryStatus: RegulatoryStatus;
  readonly sourceReferenceIds: readonly SourceId[];

  private constructor(id: ActivityDefinitionId, common: NormalizedCommonCatalogInput) {
    this.id = id;
    this.version = common.version;
    this.preferredLabel = common.preferredLabel;
    this.aliases = common.aliases;
    this.description = common.description;
    this.jurisdiction = common.jurisdiction;
    this.effectivePeriod = common.effectivePeriod;
    this.regulatoryStatus = common.regulatoryStatus;
    this.sourceReferenceIds = common.sourceReferenceIds;
    Object.freeze(this);
  }

  static create(input: CommonCatalogInput & { readonly id: ActivityDefinitionId }): ActivityDefinition {
    if (!(input.id instanceof ActivityDefinitionId)) throw new TypeError('ActivityDefinition requires ActivityDefinitionId');
    return new ActivityDefinition(input.id, normalizeCommon(input));
  }

  isEffectiveOn(date: DateOnly): boolean {
    return this.effectivePeriod.isEffectiveOn(date);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      version: this.version.toString(),
      preferredLabel: this.preferredLabel,
      aliases: [...this.aliases],
      description: this.description,
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      regulatoryStatus: this.regulatoryStatus,
      sourceReferenceIds: this.sourceReferenceIds.map(String),
    };
  }
}

export class ProfessionDefinition {
  readonly id: ProfessionDefinitionId;
  readonly version: VersionId;
  readonly preferredLabel: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly regulatoryStatus: RegulatoryStatus;
  readonly sourceReferenceIds: readonly SourceId[];
  readonly externalClassifications: readonly ExternalClassificationReference[];

  private constructor(
    id: ProfessionDefinitionId,
    common: NormalizedCommonCatalogInput,
    externalClassifications: readonly ExternalClassificationReference[],
  ) {
    this.id = id;
    this.version = common.version;
    this.preferredLabel = common.preferredLabel;
    this.aliases = common.aliases;
    this.description = common.description;
    this.jurisdiction = common.jurisdiction;
    this.effectivePeriod = common.effectivePeriod;
    this.regulatoryStatus = common.regulatoryStatus;
    this.sourceReferenceIds = common.sourceReferenceIds;
    this.externalClassifications = externalClassifications;
    Object.freeze(this);
  }

  static create(input: CommonCatalogInput & {
    readonly id: ProfessionDefinitionId;
    readonly externalClassifications?: readonly ExternalClassificationReference[];
  }): ProfessionDefinition {
    if (!(input.id instanceof ProfessionDefinitionId)) throw new TypeError('ProfessionDefinition requires ProfessionDefinitionId');
    return new ProfessionDefinition(
      input.id,
      normalizeCommon(input),
      normalizedExternalClassifications(input.externalClassifications ?? []),
    );
  }

  isEffectiveOn(date: DateOnly): boolean {
    return this.effectivePeriod.isEffectiveOn(date);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      version: this.version.toString(),
      preferredLabel: this.preferredLabel,
      aliases: [...this.aliases],
      description: this.description,
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      regulatoryStatus: this.regulatoryStatus,
      sourceReferenceIds: this.sourceReferenceIds.map(String),
      externalClassifications: this.externalClassifications.map((value) => value.toJSON()),
    };
  }
}
