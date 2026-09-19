import { CredentialDefinitionId, RequirementSetId, SourceId } from '../ids.ts';
import { RequirementSet } from '../eligibility/eligibility-assessment.ts';
import { Jurisdiction } from '../jurisdiction.ts';
import { DateOnly } from '../time.ts';
import { VersionId } from '../version.ts';
import { CatalogEffectivePeriod } from './activity-profession-catalog.ts';
import { CredentialDefinition, RequirementDefinition } from './credential-requirement-catalog.ts';

function sameJurisdiction(left: Jurisdiction, right: Jurisdiction): boolean {
  return left.toString() === right.toString();
}

function periodContains(container: CatalogEffectivePeriod, inner: CatalogEffectivePeriod): boolean {
  const containerFrom = container.effectiveFrom.toString();
  const containerTo = container.effectiveTo?.toString() ?? null;
  const innerFrom = inner.effectiveFrom.toString();
  const innerTo = inner.effectiveTo?.toString() ?? null;
  if (innerFrom < containerFrom) return false;
  if (containerTo === null) return true;
  if (innerTo === null) return false;
  return innerTo <= containerTo;
}

function normalizedSourceIds(values: readonly SourceId[]): readonly SourceId[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('Governed RequirementSet version requires at least one source reference ID');
  }
  if (values.some((value) => !(value instanceof SourceId))) {
    throw new TypeError('Governed RequirementSet source references must use SourceId');
  }
  const keys = values.map(String);
  if (new Set(keys).size !== keys.length) {
    throw new TypeError('Governed RequirementSet source reference IDs must be unique');
  }
  return Object.freeze([...values]);
}

function normalizedRequirementDefinitions(
  values: readonly RequirementDefinition[],
  requirementSet: RequirementSet,
  jurisdiction: Jurisdiction,
  effectivePeriod: CatalogEffectivePeriod,
): readonly RequirementDefinition[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('Governed RequirementSet version requires RequirementDefinition entries');
  }
  if (values.some((value) => !(value instanceof RequirementDefinition))) {
    throw new TypeError('Governed RequirementSet definitions must use RequirementDefinition');
  }

  const identityKeys = values.map((value) => `${value.id.toString()}|${value.version.toString()}`);
  if (new Set(identityKeys).size !== identityKeys.length) {
    throw new TypeError('Governed RequirementSet RequirementDefinition identity/version entries must be unique');
  }
  const codes = values.map((value) => value.code);
  if (new Set(codes).size !== codes.length) {
    throw new TypeError('Governed RequirementSet RequirementDefinition machine codes must be unique');
  }

  const runtimeIds = requirementSet.requirementIds.map(String);
  if (runtimeIds.length !== codes.length || runtimeIds.some((value, index) => value !== codes[index])) {
    throw new TypeError('Governed RequirementSet RequirementDefinition codes must match executable RequirementId order exactly');
  }

  for (const definition of values) {
    if (!sameJurisdiction(definition.jurisdiction, jurisdiction)) {
      throw new TypeError('RequirementDefinition jurisdiction must match governed RequirementSet jurisdiction exactly');
    }
    if (!periodContains(definition.effectivePeriod, effectivePeriod)) {
      throw new RangeError('Governed RequirementSet effective period must be contained in every RequirementDefinition period');
    }
  }

  return Object.freeze([...values]);
}

export class GovernedRequirementSetVersion {
  readonly id: RequirementSetId;
  readonly version: VersionId;
  readonly requirementSet: RequirementSet;
  readonly credentialDefinition: CredentialDefinition;
  readonly requirementDefinitions: readonly RequirementDefinition[];
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly sourceReferenceIds: readonly SourceId[];

  private constructor(input: {
    readonly requirementSet: RequirementSet;
    readonly credentialDefinition: CredentialDefinition;
    readonly requirementDefinitions: readonly RequirementDefinition[];
    readonly jurisdiction: Jurisdiction;
    readonly effectivePeriod: CatalogEffectivePeriod;
    readonly sourceReferenceIds: readonly SourceId[];
  }) {
    this.id = input.requirementSet.id;
    this.version = input.requirementSet.version;
    this.requirementSet = input.requirementSet;
    this.credentialDefinition = input.credentialDefinition;
    this.requirementDefinitions = input.requirementDefinitions;
    this.jurisdiction = input.jurisdiction;
    this.effectivePeriod = input.effectivePeriod;
    this.sourceReferenceIds = input.sourceReferenceIds;
    Object.freeze(this);
  }

  static create(input: {
    readonly requirementSet: RequirementSet;
    readonly credentialDefinition: CredentialDefinition;
    readonly requirementDefinitions: readonly RequirementDefinition[];
    readonly jurisdiction: Jurisdiction;
    readonly effectivePeriod: CatalogEffectivePeriod;
    readonly sourceReferenceIds: readonly SourceId[];
  }): GovernedRequirementSetVersion {
    if (!(input.requirementSet instanceof RequirementSet)) {
      throw new TypeError('Governed RequirementSet version requires RequirementSet');
    }
    if (!(input.credentialDefinition instanceof CredentialDefinition)) {
      throw new TypeError('Governed RequirementSet version requires CredentialDefinition');
    }
    if (!(input.jurisdiction instanceof Jurisdiction)) {
      throw new TypeError('Governed RequirementSet version requires Jurisdiction');
    }
    if (!(input.effectivePeriod instanceof CatalogEffectivePeriod)) {
      throw new TypeError('Governed RequirementSet version requires CatalogEffectivePeriod');
    }

    const executableCredential = input.requirementSet.credentialDefinition;
    if (executableCredential.id.toString() !== input.credentialDefinition.id.toString()) {
      throw new TypeError('Executable RequirementSet credential identity must match CredentialDefinition exactly');
    }
    if (executableCredential.version.toString() !== input.credentialDefinition.version.toString()) {
      throw new TypeError('Executable RequirementSet credential version must match CredentialDefinition exactly');
    }
    if (!sameJurisdiction(input.credentialDefinition.jurisdiction, input.jurisdiction)) {
      throw new TypeError('CredentialDefinition jurisdiction must match governed RequirementSet jurisdiction exactly');
    }
    if (!periodContains(input.credentialDefinition.effectivePeriod, input.effectivePeriod)) {
      throw new RangeError('Governed RequirementSet effective period must be contained in CredentialDefinition period');
    }

    const requirementDefinitions = normalizedRequirementDefinitions(
      input.requirementDefinitions,
      input.requirementSet,
      input.jurisdiction,
      input.effectivePeriod,
    );
    const sourceReferenceIds = normalizedSourceIds(input.sourceReferenceIds);

    return new GovernedRequirementSetVersion({ ...input, requirementDefinitions, sourceReferenceIds });
  }

  isEffectiveOn(date: DateOnly, jurisdiction: Jurisdiction): boolean {
    if (!(date instanceof DateOnly)) {
      throw new TypeError('Governed RequirementSet effective evaluation requires explicit DateOnly');
    }
    if (!(jurisdiction instanceof Jurisdiction)) {
      throw new TypeError('Governed RequirementSet effective evaluation requires explicit Jurisdiction');
    }
    return sameJurisdiction(this.jurisdiction, jurisdiction) && this.effectivePeriod.isEffectiveOn(date);
  }

  toExecutableRequirementSet(): RequirementSet {
    return this.requirementSet;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      version: this.version.toString(),
      credentialDefinition: {
        id: this.credentialDefinition.id.toString(),
        version: this.credentialDefinition.version.toString(),
        code: this.credentialDefinition.code,
      },
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      requirementDefinitions: this.requirementDefinitions.map((definition) => ({
        id: definition.id.toString(),
        version: definition.version.toString(),
        code: definition.code,
      })),
      sourceReferenceIds: this.sourceReferenceIds.map(String),
      executableRequirementSet: {
        requirementIds: this.requirementSet.requirementIds.map(String),
        groups: this.requirementSet.groups.map((group) => ({
          code: group.code,
          mode: group.mode,
          requirementIds: group.requirementIds.map(String),
          threshold: group.threshold,
        })),
      },
    };
  }
}

export const RequirementSetVersionSelectionState = {
  SELECTED: 'SELECTED',
  NOT_FOUND: 'NOT_FOUND',
  AMBIGUOUS_REVIEW_REQUIRED: 'AMBIGUOUS_REVIEW_REQUIRED',
} as const;
export type RequirementSetVersionSelectionState =
  (typeof RequirementSetVersionSelectionState)[keyof typeof RequirementSetVersionSelectionState];

export class RequirementSetVersionSelection {
  readonly state: RequirementSetVersionSelectionState;
  readonly selected: GovernedRequirementSetVersion | null;
  readonly candidateVersions: readonly string[];

  constructor(
    state: RequirementSetVersionSelectionState,
    selected: GovernedRequirementSetVersion | null,
    candidateVersions: readonly string[],
  ) {
    this.state = state;
    this.selected = selected;
    this.candidateVersions = Object.freeze([...candidateVersions]);
    Object.freeze(this);
  }
}

export function selectRequirementSetVersion(input: {
  readonly candidates: readonly GovernedRequirementSetVersion[];
  readonly requirementSetId: RequirementSetId;
  readonly credentialDefinitionId: CredentialDefinitionId;
  readonly jurisdiction: Jurisdiction;
  readonly effectiveOn: DateOnly;
}): RequirementSetVersionSelection {
  if (!Array.isArray(input.candidates)) {
    throw new TypeError('RequirementSet version selection requires candidate array');
  }
  if (input.candidates.some((candidate) => !(candidate instanceof GovernedRequirementSetVersion))) {
    throw new TypeError('RequirementSet version selection candidates must use GovernedRequirementSetVersion');
  }
  if (!(input.requirementSetId instanceof RequirementSetId)) {
    throw new TypeError('RequirementSet version selection requires RequirementSetId');
  }
  if (!(input.credentialDefinitionId instanceof CredentialDefinitionId)) {
    throw new TypeError('RequirementSet version selection requires CredentialDefinitionId');
  }
  if (!(input.jurisdiction instanceof Jurisdiction)) {
    throw new TypeError('RequirementSet version selection requires Jurisdiction');
  }
  if (!(input.effectiveOn instanceof DateOnly)) {
    throw new TypeError('RequirementSet version selection requires explicit DateOnly');
  }

  const identityKeys = input.candidates.map((candidate) => [
    candidate.id.toString(),
    candidate.version.toString(),
    candidate.jurisdiction.toString(),
  ].join('|'));
  if (new Set(identityKeys).size !== identityKeys.length) {
    throw new TypeError('RequirementSet version selection candidates contain duplicate identity/version/jurisdiction');
  }

  const matches = input.candidates.filter((candidate) =>
    candidate.id.toString() === input.requirementSetId.toString()
    && candidate.credentialDefinition.id.toString() === input.credentialDefinitionId.toString()
    && candidate.isEffectiveOn(input.effectiveOn, input.jurisdiction));
  const candidateVersions = matches.map((candidate) => candidate.version.toString()).sort((left, right) => left.localeCompare(right));

  if (matches.length === 0) {
    return new RequirementSetVersionSelection(RequirementSetVersionSelectionState.NOT_FOUND, null, []);
  }
  if (matches.length === 1) {
    return new RequirementSetVersionSelection(RequirementSetVersionSelectionState.SELECTED, matches[0] ?? null, candidateVersions);
  }
  return new RequirementSetVersionSelection(
    RequirementSetVersionSelectionState.AMBIGUOUS_REVIEW_REQUIRED,
    null,
    candidateVersions,
  );
}
