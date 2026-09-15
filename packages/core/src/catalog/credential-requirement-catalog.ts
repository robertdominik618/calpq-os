import { CredentialDefinitionId, RequirementDefinitionId, SourceId } from '../ids.ts';
import { Jurisdiction } from '../jurisdiction.ts';
import { DateOnly } from '../time.ts';
import { VersionId } from '../version.ts';
import { CatalogEffectivePeriod } from './activity-profession-catalog.ts';

function requiredText(value: string, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > maxLength) throw new RangeError(`${label} is too long`);
  return normalized;
}

function requiredCode(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 128) throw new RangeError(`${label} is too long`);
  if (!/^[A-Z0-9][A-Z0-9._:-]*$/.test(normalized)) {
    throw new TypeError(`${label} must use controlled uppercase machine-code characters`);
  }
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

type CommonDefinitionInput = {
  readonly version: VersionId;
  readonly code: string;
  readonly preferredLabel: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly sourceReferenceIds: readonly SourceId[];
};

type NormalizedCommonDefinition = {
  readonly version: VersionId;
  readonly code: string;
  readonly preferredLabel: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly sourceReferenceIds: readonly SourceId[];
};

function normalizeCommon(input: CommonDefinitionInput, codeLabel: string): NormalizedCommonDefinition {
  if (!(input.version instanceof VersionId)) throw new TypeError('Catalog definition requires VersionId');
  if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('Catalog definition requires Jurisdiction');
  if (!(input.effectivePeriod instanceof CatalogEffectivePeriod)) throw new TypeError('Catalog definition requires CatalogEffectivePeriod');
  const preferredLabel = requiredText(input.preferredLabel, 'Catalog preferred label', 256);
  return {
    version: input.version,
    code: requiredCode(input.code, codeLabel),
    preferredLabel,
    aliases: normalizedAliases(input.aliases, preferredLabel),
    description: requiredText(input.description, 'Catalog description', 4000),
    jurisdiction: input.jurisdiction,
    effectivePeriod: input.effectivePeriod,
    sourceReferenceIds: normalizedSourceIds(input.sourceReferenceIds),
  };
}

export class CredentialDefinition {
  readonly id: CredentialDefinitionId;
  readonly version: VersionId;
  readonly code: string;
  readonly preferredLabel: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly sourceReferenceIds: readonly SourceId[];

  private constructor(id: CredentialDefinitionId, common: NormalizedCommonDefinition) {
    this.id = id;
    this.version = common.version;
    this.code = common.code;
    this.preferredLabel = common.preferredLabel;
    this.aliases = common.aliases;
    this.description = common.description;
    this.jurisdiction = common.jurisdiction;
    this.effectivePeriod = common.effectivePeriod;
    this.sourceReferenceIds = common.sourceReferenceIds;
    Object.freeze(this);
  }

  static create(input: CommonDefinitionInput & { readonly id: CredentialDefinitionId }): CredentialDefinition {
    if (!(input.id instanceof CredentialDefinitionId)) throw new TypeError('CredentialDefinition requires CredentialDefinitionId');
    return new CredentialDefinition(input.id, normalizeCommon(input, 'Credential definition code'));
  }

  isEffectiveOn(date: DateOnly): boolean {
    return this.effectivePeriod.isEffectiveOn(date);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      version: this.version.toString(),
      code: this.code,
      preferredLabel: this.preferredLabel,
      aliases: [...this.aliases],
      description: this.description,
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      sourceReferenceIds: this.sourceReferenceIds.map(String),
    };
  }
}

export class RequirementDefinition {
  readonly id: RequirementDefinitionId;
  readonly version: VersionId;
  readonly code: string;
  readonly preferredLabel: string;
  readonly aliases: readonly string[];
  readonly description: string;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly sourceReferenceIds: readonly SourceId[];

  private constructor(id: RequirementDefinitionId, common: NormalizedCommonDefinition) {
    this.id = id;
    this.version = common.version;
    this.code = common.code;
    this.preferredLabel = common.preferredLabel;
    this.aliases = common.aliases;
    this.description = common.description;
    this.jurisdiction = common.jurisdiction;
    this.effectivePeriod = common.effectivePeriod;
    this.sourceReferenceIds = common.sourceReferenceIds;
    Object.freeze(this);
  }

  static create(input: CommonDefinitionInput & { readonly id: RequirementDefinitionId }): RequirementDefinition {
    if (!(input.id instanceof RequirementDefinitionId)) throw new TypeError('RequirementDefinition requires RequirementDefinitionId');
    return new RequirementDefinition(input.id, normalizeCommon(input, 'Requirement definition code'));
  }

  isEffectiveOn(date: DateOnly): boolean {
    return this.effectivePeriod.isEffectiveOn(date);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      version: this.version.toString(),
      code: this.code,
      preferredLabel: this.preferredLabel,
      aliases: [...this.aliases],
      description: this.description,
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      sourceReferenceIds: this.sourceReferenceIds.map(String),
    };
  }
}
