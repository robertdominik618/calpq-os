import {
  ActivityDefinitionId,
  CredentialDefinitionId,
  ProfessionDefinitionId,
  QualificationPathId,
  SourceId,
} from '../ids.ts';
import { Jurisdiction } from '../jurisdiction.ts';
import { DateOnly } from '../time.ts';
import { VersionId } from '../version.ts';
import {
  ActivityDefinition,
  CatalogEffectivePeriod,
  ProfessionDefinition,
} from './activity-profession-catalog.ts';
import { CredentialDefinition } from './credential-requirement-catalog.ts';
import { GovernedRequirementSetVersion } from './requirement-set-versioning.ts';

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

function controlledCode(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 128) throw new RangeError(`${label} is too long`);
  if (!/^[A-Z0-9][A-Z0-9._:-]*$/.test(normalized)) {
    throw new TypeError(`${label} must use controlled uppercase machine-code characters`);
  }
  return normalized;
}

function normalizedSourceIds(values: readonly SourceId[], label: string): readonly SourceId[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError(`${label} requires at least one source reference ID`);
  }
  if (values.some((value) => !(value instanceof SourceId))) {
    throw new TypeError(`${label} source references must use SourceId`);
  }
  const keys = values.map(String);
  if (new Set(keys).size !== keys.length) {
    throw new TypeError(`${label} source reference IDs must be unique`);
  }
  return Object.freeze([...values]);
}

function normalizedCodes(values: readonly string[], label: string): readonly string[] {
  if (!Array.isArray(values)) throw new TypeError(`${label} must be an array`);
  const normalized = values.map((value) => controlledCode(value, label));
  if (new Set(normalized).size !== normalized.length) {
    throw new TypeError(`${label} entries must be unique`);
  }
  return Object.freeze(normalized);
}

export const QualificationPathStepType = {
  SATISFY_REQUIREMENT_SET: 'SATISFY_REQUIREMENT_SET',
  OBTAIN_CREDENTIAL: 'OBTAIN_CREDENTIAL',
  COMPLETE_EDUCATION_OR_TRAINING: 'COMPLETE_EDUCATION_OR_TRAINING',
  PASS_EXAM_OR_ASSESSMENT: 'PASS_EXAM_OR_ASSESSMENT',
  PROVE_EXPERIENCE: 'PROVE_EXPERIENCE',
  UNDERGO_MEDICAL_OR_OTHER_CHECK: 'UNDERGO_MEDICAL_OR_OTHER_CHECK',
  REQUEST_RECOGNITION: 'REQUEST_RECOGNITION',
  OBTAIN_AUTHORITY_DECISION: 'OBTAIN_AUTHORITY_DECISION',
  PAY_FEE_OR_COMPLETE_ADMIN_STEP: 'PAY_FEE_OR_COMPLETE_ADMIN_STEP',
} as const;
export type QualificationPathStepType =
  (typeof QualificationPathStepType)[keyof typeof QualificationPathStepType];

const STEP_TYPES = new Set<string>(Object.values(QualificationPathStepType));

export class QualificationPathStep {
  readonly code: string;
  readonly type: QualificationPathStepType;
  readonly prerequisiteStepCodes: readonly string[];
  readonly alternativeGroupCode: string | null;
  readonly requirementSetVersion: GovernedRequirementSetVersion | null;
  readonly sourceReferenceIds: readonly SourceId[];

  private constructor(input: {
    readonly code: string;
    readonly type: QualificationPathStepType;
    readonly prerequisiteStepCodes: readonly string[];
    readonly alternativeGroupCode: string | null;
    readonly requirementSetVersion: GovernedRequirementSetVersion | null;
    readonly sourceReferenceIds: readonly SourceId[];
  }) {
    this.code = input.code;
    this.type = input.type;
    this.prerequisiteStepCodes = input.prerequisiteStepCodes;
    this.alternativeGroupCode = input.alternativeGroupCode;
    this.requirementSetVersion = input.requirementSetVersion;
    this.sourceReferenceIds = input.sourceReferenceIds;
    Object.freeze(this);
  }

  static create(input: {
    readonly code: string;
    readonly type: QualificationPathStepType;
    readonly prerequisiteStepCodes?: readonly string[];
    readonly alternativeGroupCode?: string | null;
    readonly requirementSetVersion?: GovernedRequirementSetVersion | null;
    readonly sourceReferenceIds: readonly SourceId[];
  }): QualificationPathStep {
    const code = controlledCode(input.code, 'Qualification path step code');
    if (!STEP_TYPES.has(input.type)) {
      throw new TypeError('Qualification path step type must be controlled');
    }
    const prerequisiteStepCodes = normalizedCodes(
      input.prerequisiteStepCodes ?? [],
      'Qualification path prerequisite code',
    );
    const alternativeGroupCode = input.alternativeGroupCode === undefined || input.alternativeGroupCode === null
      ? null
      : controlledCode(input.alternativeGroupCode, 'Qualification path alternative group code');
    const requirementSetVersion = input.requirementSetVersion ?? null;

    if (input.type === QualificationPathStepType.SATISFY_REQUIREMENT_SET) {
      if (!(requirementSetVersion instanceof GovernedRequirementSetVersion)) {
        throw new TypeError('SATISFY_REQUIREMENT_SET step requires GovernedRequirementSetVersion');
      }
    } else if (requirementSetVersion !== null) {
      throw new TypeError('Only SATISFY_REQUIREMENT_SET step may bind GovernedRequirementSetVersion');
    }

    return new QualificationPathStep({
      code,
      type: input.type,
      prerequisiteStepCodes,
      alternativeGroupCode,
      requirementSetVersion,
      sourceReferenceIds: normalizedSourceIds(input.sourceReferenceIds, 'Qualification path step'),
    });
  }

  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      type: this.type,
      prerequisiteStepCodes: [...this.prerequisiteStepCodes],
      alternativeGroupCode: this.alternativeGroupCode,
      requirementSetVersion: this.requirementSetVersion === null ? null : {
        id: this.requirementSetVersion.id.toString(),
        version: this.requirementSetVersion.version.toString(),
      },
      sourceReferenceIds: this.sourceReferenceIds.map(String),
    };
  }
}

function validateAcyclicSteps(steps: readonly QualificationPathStep[]): void {
  const byCode = new Map(steps.map((step) => [step.code, step]));
  for (const step of steps) {
    for (const prerequisite of step.prerequisiteStepCodes) {
      if (!byCode.has(prerequisite)) {
        throw new TypeError(`Qualification path prerequisite references unknown step ${prerequisite}`);
      }
      if (prerequisite === step.code) {
        throw new TypeError(`Qualification path step ${step.code} cannot require itself`);
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (code: string): void => {
    if (visited.has(code)) return;
    if (visiting.has(code)) {
      throw new TypeError('Qualification path prerequisites must form an acyclic graph');
    }
    visiting.add(code);
    const step = byCode.get(code);
    if (step === undefined) throw new TypeError(`Qualification path step ${code} is unavailable`);
    for (const prerequisite of step.prerequisiteStepCodes) visit(prerequisite);
    visiting.delete(code);
    visited.add(code);
  };

  for (const step of steps) visit(step.code);
}

function normalizedSteps(values: readonly QualificationPathStep[]): readonly QualificationPathStep[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('QualificationPathDefinition requires path steps');
  }
  if (values.some((value) => !(value instanceof QualificationPathStep))) {
    throw new TypeError('QualificationPathDefinition steps must use QualificationPathStep');
  }
  const codes = values.map((step) => step.code);
  if (new Set(codes).size !== codes.length) {
    throw new TypeError('Qualification path step codes must be unique');
  }

  validateAcyclicSteps(values);

  const alternativeGroupCounts = new Map<string, number>();
  for (const step of values) {
    if (step.alternativeGroupCode !== null) {
      alternativeGroupCounts.set(
        step.alternativeGroupCode,
        (alternativeGroupCounts.get(step.alternativeGroupCode) ?? 0) + 1,
      );
    }
  }
  for (const [groupCode, count] of alternativeGroupCounts) {
    if (count < 2) {
      throw new TypeError(`Qualification path alternative group ${groupCode} requires at least two steps`);
    }
  }

  return Object.freeze([...values]);
}

export class QualificationPathDefinition {
  readonly id: QualificationPathId;
  readonly version: VersionId;
  readonly targetCredentialDefinition: CredentialDefinition;
  readonly targetActivityDefinition: ActivityDefinition | null;
  readonly targetProfessionDefinition: ProfessionDefinition | null;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly steps: readonly QualificationPathStep[];
  readonly sourceReferenceIds: readonly SourceId[];

  private constructor(input: {
    readonly id: QualificationPathId;
    readonly version: VersionId;
    readonly targetCredentialDefinition: CredentialDefinition;
    readonly targetActivityDefinition: ActivityDefinition | null;
    readonly targetProfessionDefinition: ProfessionDefinition | null;
    readonly jurisdiction: Jurisdiction;
    readonly effectivePeriod: CatalogEffectivePeriod;
    readonly steps: readonly QualificationPathStep[];
    readonly sourceReferenceIds: readonly SourceId[];
  }) {
    this.id = input.id;
    this.version = input.version;
    this.targetCredentialDefinition = input.targetCredentialDefinition;
    this.targetActivityDefinition = input.targetActivityDefinition;
    this.targetProfessionDefinition = input.targetProfessionDefinition;
    this.jurisdiction = input.jurisdiction;
    this.effectivePeriod = input.effectivePeriod;
    this.steps = input.steps;
    this.sourceReferenceIds = input.sourceReferenceIds;
    Object.freeze(this);
  }

  static create(input: {
    readonly id: QualificationPathId;
    readonly version: VersionId;
    readonly targetCredentialDefinition: CredentialDefinition;
    readonly targetActivityDefinition?: ActivityDefinition | null;
    readonly targetProfessionDefinition?: ProfessionDefinition | null;
    readonly jurisdiction: Jurisdiction;
    readonly effectivePeriod: CatalogEffectivePeriod;
    readonly steps: readonly QualificationPathStep[];
    readonly sourceReferenceIds: readonly SourceId[];
  }): QualificationPathDefinition {
    if (!(input.id instanceof QualificationPathId)) {
      throw new TypeError('QualificationPathDefinition requires QualificationPathId');
    }
    if (!(input.version instanceof VersionId)) {
      throw new TypeError('QualificationPathDefinition requires VersionId');
    }
    if (!(input.targetCredentialDefinition instanceof CredentialDefinition)) {
      throw new TypeError('QualificationPathDefinition requires CredentialDefinition');
    }
    if (!(input.jurisdiction instanceof Jurisdiction)) {
      throw new TypeError('QualificationPathDefinition requires Jurisdiction');
    }
    if (!(input.effectivePeriod instanceof CatalogEffectivePeriod)) {
      throw new TypeError('QualificationPathDefinition requires CatalogEffectivePeriod');
    }

    const targetActivityDefinition = input.targetActivityDefinition ?? null;
    const targetProfessionDefinition = input.targetProfessionDefinition ?? null;
    if (targetActivityDefinition !== null && !(targetActivityDefinition instanceof ActivityDefinition)) {
      throw new TypeError('QualificationPathDefinition activity target must use ActivityDefinition');
    }
    if (targetProfessionDefinition !== null && !(targetProfessionDefinition instanceof ProfessionDefinition)) {
      throw new TypeError('QualificationPathDefinition profession target must use ProfessionDefinition');
    }

    const targets: readonly {
      readonly label: string;
      readonly jurisdiction: Jurisdiction;
      readonly effectivePeriod: CatalogEffectivePeriod;
    }[] = [
      {
        label: 'CredentialDefinition',
        jurisdiction: input.targetCredentialDefinition.jurisdiction,
        effectivePeriod: input.targetCredentialDefinition.effectivePeriod,
      },
      ...(targetActivityDefinition === null ? [] : [{
        label: 'ActivityDefinition',
        jurisdiction: targetActivityDefinition.jurisdiction,
        effectivePeriod: targetActivityDefinition.effectivePeriod,
      }]),
      ...(targetProfessionDefinition === null ? [] : [{
        label: 'ProfessionDefinition',
        jurisdiction: targetProfessionDefinition.jurisdiction,
        effectivePeriod: targetProfessionDefinition.effectivePeriod,
      }]),
    ];

    for (const target of targets) {
      if (!sameJurisdiction(target.jurisdiction, input.jurisdiction)) {
        throw new TypeError(`${target.label} jurisdiction must match qualification path jurisdiction exactly`);
      }
      if (!periodContains(target.effectivePeriod, input.effectivePeriod)) {
        throw new RangeError(`Qualification path effective period must be contained in ${target.label} period`);
      }
    }

    const steps = normalizedSteps(input.steps);
    for (const step of steps) {
      const requirementSetVersion = step.requirementSetVersion;
      if (requirementSetVersion !== null) {
        if (!sameJurisdiction(requirementSetVersion.jurisdiction, input.jurisdiction)) {
          throw new TypeError('RequirementSetVersion jurisdiction must match qualification path jurisdiction exactly');
        }
        if (!periodContains(requirementSetVersion.effectivePeriod, input.effectivePeriod)) {
          throw new RangeError('Qualification path effective period must be contained in RequirementSetVersion period');
        }
      }
    }

    return new QualificationPathDefinition({
      id: input.id,
      version: input.version,
      targetCredentialDefinition: input.targetCredentialDefinition,
      targetActivityDefinition,
      targetProfessionDefinition,
      jurisdiction: input.jurisdiction,
      effectivePeriod: input.effectivePeriod,
      steps,
      sourceReferenceIds: normalizedSourceIds(input.sourceReferenceIds, 'QualificationPathDefinition'),
    });
  }

  isEffectiveOn(date: DateOnly, jurisdiction: Jurisdiction): boolean {
    if (!(date instanceof DateOnly)) {
      throw new TypeError('Qualification path effective evaluation requires explicit DateOnly');
    }
    if (!(jurisdiction instanceof Jurisdiction)) {
      throw new TypeError('Qualification path effective evaluation requires explicit Jurisdiction');
    }
    return sameJurisdiction(this.jurisdiction, jurisdiction) && this.effectivePeriod.isEffectiveOn(date);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      version: this.version.toString(),
      targetCredentialDefinition: {
        id: this.targetCredentialDefinition.id.toString(),
        version: this.targetCredentialDefinition.version.toString(),
        code: this.targetCredentialDefinition.code,
      },
      targetActivityDefinition: this.targetActivityDefinition === null ? null : {
        id: this.targetActivityDefinition.id.toString(),
        version: this.targetActivityDefinition.version.toString(),
      },
      targetProfessionDefinition: this.targetProfessionDefinition === null ? null : {
        id: this.targetProfessionDefinition.id.toString(),
        version: this.targetProfessionDefinition.version.toString(),
      },
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      steps: this.steps.map((step) => step.toJSON()),
      sourceReferenceIds: this.sourceReferenceIds.map(String),
    };
  }
}

export const QualificationPathSelectionState = {
  SELECTED: 'SELECTED',
  NOT_FOUND: 'NOT_FOUND',
  MULTIPLE_APPLICABLE: 'MULTIPLE_APPLICABLE',
  AMBIGUOUS_REVIEW_REQUIRED: 'AMBIGUOUS_REVIEW_REQUIRED',
} as const;
export type QualificationPathSelectionState =
  (typeof QualificationPathSelectionState)[keyof typeof QualificationPathSelectionState];

export class QualificationPathSelection {
  readonly state: QualificationPathSelectionState;
  readonly selected: QualificationPathDefinition | null;
  readonly candidates: readonly QualificationPathDefinition[];

  constructor(
    state: QualificationPathSelectionState,
    selected: QualificationPathDefinition | null,
    candidates: readonly QualificationPathDefinition[],
  ) {
    this.state = state;
    this.selected = selected;
    this.candidates = Object.freeze([...candidates]);
    Object.freeze(this);
  }
}

function targetMatches(
  path: QualificationPathDefinition,
  credentialId: CredentialDefinitionId | null,
  activityId: ActivityDefinitionId | null,
  professionId: ProfessionDefinitionId | null,
): boolean {
  if (credentialId !== null
      && path.targetCredentialDefinition.id.toString() !== credentialId.toString()) return false;
  if (activityId !== null
      && path.targetActivityDefinition?.id.toString() !== activityId.toString()) return false;
  if (professionId !== null
      && path.targetProfessionDefinition?.id.toString() !== professionId.toString()) return false;
  return true;
}

export function selectQualificationPath(input: {
  readonly candidates: readonly QualificationPathDefinition[];
  readonly targetCredentialDefinitionId?: CredentialDefinitionId | null;
  readonly targetActivityDefinitionId?: ActivityDefinitionId | null;
  readonly targetProfessionDefinitionId?: ProfessionDefinitionId | null;
  readonly jurisdiction: Jurisdiction;
  readonly effectiveOn: DateOnly;
}): QualificationPathSelection {
  if (!Array.isArray(input.candidates)) {
    throw new TypeError('Qualification path selection requires candidate array');
  }
  if (input.candidates.some((candidate) => !(candidate instanceof QualificationPathDefinition))) {
    throw new TypeError('Qualification path selection candidates must use QualificationPathDefinition');
  }
  if (!(input.jurisdiction instanceof Jurisdiction)) {
    throw new TypeError('Qualification path selection requires Jurisdiction');
  }
  if (!(input.effectiveOn instanceof DateOnly)) {
    throw new TypeError('Qualification path selection requires explicit DateOnly');
  }

  const credentialId = input.targetCredentialDefinitionId ?? null;
  const activityId = input.targetActivityDefinitionId ?? null;
  const professionId = input.targetProfessionDefinitionId ?? null;
  if (credentialId !== null && !(credentialId instanceof CredentialDefinitionId)) {
    throw new TypeError('Qualification path selection credential target must use CredentialDefinitionId');
  }
  if (activityId !== null && !(activityId instanceof ActivityDefinitionId)) {
    throw new TypeError('Qualification path selection activity target must use ActivityDefinitionId');
  }
  if (professionId !== null && !(professionId instanceof ProfessionDefinitionId)) {
    throw new TypeError('Qualification path selection profession target must use ProfessionDefinitionId');
  }
  if (credentialId === null && activityId === null && professionId === null) {
    throw new TypeError('Qualification path selection requires at least one explicit target criterion');
  }

  const identityKeys = input.candidates.map((candidate) => [
    candidate.id.toString(),
    candidate.version.toString(),
    candidate.jurisdiction.toString(),
  ].join('|'));
  if (new Set(identityKeys).size !== identityKeys.length) {
    throw new TypeError('Qualification path selection candidates contain duplicate identity/version/jurisdiction');
  }

  const matches = input.candidates
    .filter((candidate) => candidate.isEffectiveOn(input.effectiveOn, input.jurisdiction)
      && targetMatches(candidate, credentialId, activityId, professionId))
    .sort((left, right) => {
      const idCompare = left.id.toString().localeCompare(right.id.toString());
      return idCompare !== 0
        ? idCompare
        : left.version.toString().localeCompare(right.version.toString());
    });

  if (matches.length === 0) {
    return new QualificationPathSelection(QualificationPathSelectionState.NOT_FOUND, null, []);
  }

  const countsByPath = new Map<string, number>();
  for (const candidate of matches) {
    const id = candidate.id.toString();
    countsByPath.set(id, (countsByPath.get(id) ?? 0) + 1);
  }
  if ([...countsByPath.values()].some((count) => count > 1)) {
    return new QualificationPathSelection(
      QualificationPathSelectionState.AMBIGUOUS_REVIEW_REQUIRED,
      null,
      matches,
    );
  }

  if (matches.length === 1) {
    return new QualificationPathSelection(
      QualificationPathSelectionState.SELECTED,
      matches[0] ?? null,
      matches,
    );
  }

  return new QualificationPathSelection(
    QualificationPathSelectionState.MULTIPLE_APPLICABLE,
    null,
    matches,
  );
}
