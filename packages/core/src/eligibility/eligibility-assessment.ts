import {
  CredentialDefinitionId,
  EligibilityAssessmentId,
  RequirementSetId,
} from '../ids.ts';
import { ActorReference, SubjectReference } from '../party-references.ts';
import { UtcInstant } from '../time.ts';
import { VersionId } from '../version.ts';
import { EvidenceSnapshot } from '../credential/evidence-snapshot.ts';
import { ProvenanceEnvelope } from '../provenance/provenance-envelope.ts';
import { DomainOutcome } from '../result/domain-evaluation-result.ts';

function requiredCode(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 128) throw new RangeError(`${label} is too long`);
  if (!/^[A-Z0-9][A-Z0-9._:-]*$/i.test(normalized)) throw new TypeError(`${label} contains unsupported characters`);
  return normalized;
}

const OUTCOMES = new Set<string>(Object.values(DomainOutcome));

export class RequirementId {
  readonly #value: string;
  private constructor(value: string) { this.#value = requiredCode(value, 'RequirementId'); Object.freeze(this); }
  static from(value: string): RequirementId { return new RequirementId(value); }
  toString(): string { return this.#value; }
}

export class CredentialDefinitionReference {
  readonly id: CredentialDefinitionId;
  readonly version: VersionId;

  private constructor(id: CredentialDefinitionId, version: VersionId) {
    this.id = id;
    this.version = version;
    Object.freeze(this);
  }

  static create(id: CredentialDefinitionId, version: VersionId): CredentialDefinitionReference {
    if (!(id instanceof CredentialDefinitionId)) throw new TypeError('Credential definition reference requires CredentialDefinitionId');
    if (!(version instanceof VersionId)) throw new TypeError('Credential definition reference requires VersionId');
    return new CredentialDefinitionReference(id, version);
  }
}

export const RequirementGroupMode = {
  ALL: 'ALL',
  ANY: 'ANY',
  AT_LEAST: 'AT_LEAST',
} as const;
export type RequirementGroupMode = (typeof RequirementGroupMode)[keyof typeof RequirementGroupMode];

export class RequirementGroup {
  readonly code: string;
  readonly mode: RequirementGroupMode;
  readonly requirementIds: readonly RequirementId[];
  readonly threshold: number | null;

  private constructor(code: string, mode: RequirementGroupMode, requirementIds: readonly RequirementId[], threshold: number | null) {
    this.code = code;
    this.mode = mode;
    this.requirementIds = Object.freeze([...requirementIds]);
    this.threshold = threshold;
    Object.freeze(this);
  }

  static create(input: {
    readonly code: string;
    readonly mode: RequirementGroupMode;
    readonly requirementIds: readonly RequirementId[];
    readonly threshold?: number | null;
  }): RequirementGroup {
    const code = requiredCode(input.code, 'Requirement group code');
    if (!Object.values(RequirementGroupMode).includes(input.mode)) throw new TypeError('Requirement group mode must be controlled');
    if (!Array.isArray(input.requirementIds) || input.requirementIds.length === 0) throw new TypeError('Requirement group requires requirement IDs');
    if (input.requirementIds.some((id) => !(id instanceof RequirementId))) throw new TypeError('Requirement group IDs must use RequirementId');
    const keys = input.requirementIds.map(String);
    if (new Set(keys).size !== keys.length) throw new TypeError('Requirement group cannot contain duplicate requirement IDs');

    let threshold: number | null = null;
    if (input.mode === RequirementGroupMode.AT_LEAST) {
      threshold = input.threshold ?? null;
      if (threshold === null || !Number.isSafeInteger(threshold) || threshold < 1 || threshold > input.requirementIds.length) {
        throw new RangeError('AT_LEAST threshold must be an integer within the group size');
      }
    } else if (input.threshold !== undefined && input.threshold !== null) {
      throw new TypeError('Threshold is allowed only for AT_LEAST groups');
    }
    return new RequirementGroup(code, input.mode, input.requirementIds, threshold);
  }
}

export class RequirementSet {
  readonly id: RequirementSetId;
  readonly version: VersionId;
  readonly credentialDefinition: CredentialDefinitionReference;
  readonly requirementIds: readonly RequirementId[];
  readonly groups: readonly RequirementGroup[];

  private constructor(input: {
    readonly id: RequirementSetId;
    readonly version: VersionId;
    readonly credentialDefinition: CredentialDefinitionReference;
    readonly requirementIds: readonly RequirementId[];
    readonly groups: readonly RequirementGroup[];
  }) {
    this.id = input.id;
    this.version = input.version;
    this.credentialDefinition = input.credentialDefinition;
    this.requirementIds = Object.freeze([...input.requirementIds]);
    this.groups = Object.freeze([...input.groups]);
    Object.freeze(this);
  }

  static create(input: {
    readonly id: RequirementSetId;
    readonly version: VersionId;
    readonly credentialDefinition: CredentialDefinitionReference;
    readonly requirementIds: readonly RequirementId[];
    readonly groups: readonly RequirementGroup[];
  }): RequirementSet {
    if (!(input.id instanceof RequirementSetId)) throw new TypeError('RequirementSet requires RequirementSetId');
    if (!(input.version instanceof VersionId)) throw new TypeError('RequirementSet requires VersionId');
    if (!(input.credentialDefinition instanceof CredentialDefinitionReference)) throw new TypeError('RequirementSet requires credential definition reference');
    if (!Array.isArray(input.requirementIds) || input.requirementIds.length === 0) throw new TypeError('RequirementSet requires atomic requirements');
    if (input.requirementIds.some((id) => !(id instanceof RequirementId))) throw new TypeError('RequirementSet requirements must use RequirementId');
    const requirementKeys = input.requirementIds.map(String);
    if (new Set(requirementKeys).size !== requirementKeys.length) throw new TypeError('RequirementSet requirement IDs must be unique');
    if (!Array.isArray(input.groups) || input.groups.length === 0) throw new TypeError('RequirementSet requires at least one governed group');
    if (input.groups.some((group) => !(group instanceof RequirementGroup))) throw new TypeError('RequirementSet groups must use RequirementGroup');
    const groupCodes = input.groups.map((group) => group.code);
    if (new Set(groupCodes).size !== groupCodes.length) throw new TypeError('RequirementSet group codes must be unique');
    const allowed = new Set(requirementKeys);
    for (const group of input.groups) {
      for (const id of group.requirementIds) {
        if (!allowed.has(id.toString())) throw new TypeError(`Requirement group references unknown requirement ${id.toString()}`);
      }
    }
    return new RequirementSet(input);
  }
}

export class AtomicRequirementResult {
  readonly requirementId: RequirementId;
  readonly outcome: DomainOutcome;
  readonly reasonCodes: readonly string[];

  private constructor(requirementId: RequirementId, outcome: DomainOutcome, reasonCodes: readonly string[]) {
    this.requirementId = requirementId;
    this.outcome = outcome;
    this.reasonCodes = Object.freeze([...reasonCodes]);
    Object.freeze(this);
  }

  static create(input: {
    readonly requirementId: RequirementId;
    readonly outcome: DomainOutcome;
    readonly reasonCodes?: readonly string[];
  }): AtomicRequirementResult {
    if (!(input.requirementId instanceof RequirementId)) throw new TypeError('Atomic result requires RequirementId');
    if (!OUTCOMES.has(input.outcome)) throw new TypeError('Atomic result outcome must be controlled');
    const reasons = (input.reasonCodes ?? []).map((reason) => requiredCode(reason, 'Requirement reason code'));
    if (new Set(reasons).size !== reasons.length) throw new TypeError('Requirement reason codes must be unique');
    return new AtomicRequirementResult(input.requirementId, input.outcome, reasons);
  }
}

export class RequirementGroupResult {
  readonly groupCode: string;
  readonly outcome: DomainOutcome;

  constructor(groupCode: string, outcome: DomainOutcome) {
    this.groupCode = requiredCode(groupCode, 'Requirement group result code');
    if (!OUTCOMES.has(outcome)) throw new TypeError('Requirement group outcome must be controlled');
    this.outcome = outcome;
    Object.freeze(this);
  }
}

function outcomeCounts(outcomes: readonly DomainOutcome[]): Record<DomainOutcome, number> {
  return {
    SATISFIED: outcomes.filter((value) => value === DomainOutcome.SATISFIED).length,
    NOT_SATISFIED: outcomes.filter((value) => value === DomainOutcome.NOT_SATISFIED).length,
    INDETERMINATE: outcomes.filter((value) => value === DomainOutcome.INDETERMINATE).length,
    REVIEW_REQUIRED: outcomes.filter((value) => value === DomainOutcome.REVIEW_REQUIRED).length,
  };
}

export function aggregateRequirementGroup(group: RequirementGroup, atomicResults: readonly AtomicRequirementResult[]): DomainOutcome {
  if (!(group instanceof RequirementGroup)) throw new TypeError('Group aggregation requires RequirementGroup');
  const resultMap = new Map(atomicResults.map((result) => [result.requirementId.toString(), result]));
  const outcomes = group.requirementIds.map((id) => {
    const result = resultMap.get(id.toString());
    if (result === undefined) throw new TypeError(`Missing atomic result for ${id.toString()}`);
    return result.outcome;
  });
  const counts = outcomeCounts(outcomes);

  if (group.mode === RequirementGroupMode.ALL) {
    if (counts.NOT_SATISFIED > 0) return DomainOutcome.NOT_SATISFIED;
    if (counts.REVIEW_REQUIRED > 0) return DomainOutcome.REVIEW_REQUIRED;
    if (counts.INDETERMINATE > 0) return DomainOutcome.INDETERMINATE;
    return DomainOutcome.SATISFIED;
  }

  if (group.mode === RequirementGroupMode.ANY) {
    if (counts.SATISFIED > 0) return DomainOutcome.SATISFIED;
    if (counts.REVIEW_REQUIRED > 0) return DomainOutcome.REVIEW_REQUIRED;
    if (counts.INDETERMINATE > 0) return DomainOutcome.INDETERMINATE;
    return DomainOutcome.NOT_SATISFIED;
  }

  const threshold = group.threshold;
  if (threshold === null) throw new TypeError('AT_LEAST group requires threshold');
  if (counts.SATISFIED >= threshold) return DomainOutcome.SATISFIED;
  const potentiallySatisfiable = counts.SATISFIED + counts.REVIEW_REQUIRED + counts.INDETERMINATE;
  if (potentiallySatisfiable < threshold) return DomainOutcome.NOT_SATISFIED;
  if (counts.REVIEW_REQUIRED > 0) return DomainOutcome.REVIEW_REQUIRED;
  if (counts.INDETERMINATE > 0) return DomainOutcome.INDETERMINATE;
  return DomainOutcome.NOT_SATISFIED;
}

function aggregateGroups(results: readonly RequirementGroupResult[]): DomainOutcome {
  const outcomes = results.map((result) => result.outcome);
  if (outcomes.includes(DomainOutcome.NOT_SATISFIED)) return DomainOutcome.NOT_SATISFIED;
  if (outcomes.includes(DomainOutcome.REVIEW_REQUIRED)) return DomainOutcome.REVIEW_REQUIRED;
  if (outcomes.includes(DomainOutcome.INDETERMINATE)) return DomainOutcome.INDETERMINATE;
  return DomainOutcome.SATISFIED;
}

export class EligibilityAssessment {
  readonly id: EligibilityAssessmentId;
  readonly subject: SubjectReference;
  readonly credentialDefinition: CredentialDefinitionReference;
  readonly requirementSetId: RequirementSetId;
  readonly requirementSetVersion: VersionId;
  readonly evaluatedAt: UtcInstant;
  readonly evidenceSnapshot: EvidenceSnapshot;
  readonly atomicResults: readonly AtomicRequirementResult[];
  readonly groupResults: readonly RequirementGroupResult[];
  readonly outcome: DomainOutcome;
  readonly evaluator: ActorReference;
  readonly provenance: ProvenanceEnvelope;

  private constructor(input: {
    readonly id: EligibilityAssessmentId;
    readonly subject: SubjectReference;
    readonly credentialDefinition: CredentialDefinitionReference;
    readonly requirementSet: RequirementSet;
    readonly evaluatedAt: UtcInstant;
    readonly evidenceSnapshot: EvidenceSnapshot;
    readonly atomicResults: readonly AtomicRequirementResult[];
    readonly evaluator: ActorReference;
    readonly provenance: ProvenanceEnvelope;
  }, groupResults: readonly RequirementGroupResult[], outcome: DomainOutcome) {
    this.id = input.id;
    this.subject = input.subject;
    this.credentialDefinition = input.credentialDefinition;
    this.requirementSetId = input.requirementSet.id;
    this.requirementSetVersion = input.requirementSet.version;
    this.evaluatedAt = input.evaluatedAt;
    this.evidenceSnapshot = input.evidenceSnapshot;
    this.atomicResults = Object.freeze([...input.atomicResults]);
    this.groupResults = Object.freeze([...groupResults]);
    this.outcome = outcome;
    this.evaluator = input.evaluator;
    this.provenance = input.provenance;
    Object.freeze(this);
  }

  static evaluate(input: {
    readonly id: EligibilityAssessmentId;
    readonly subject: SubjectReference;
    readonly credentialDefinition: CredentialDefinitionReference;
    readonly requirementSet: RequirementSet;
    readonly evaluatedAt: UtcInstant;
    readonly evidenceSnapshot: EvidenceSnapshot;
    readonly atomicResults: readonly AtomicRequirementResult[];
    readonly evaluator: ActorReference;
    readonly provenance: ProvenanceEnvelope;
  }): EligibilityAssessment {
    if (!(input.id instanceof EligibilityAssessmentId)) throw new TypeError('EligibilityAssessment requires EligibilityAssessmentId');
    if (!(input.subject instanceof SubjectReference)) throw new TypeError('EligibilityAssessment requires SubjectReference');
    if (!(input.credentialDefinition instanceof CredentialDefinitionReference)) throw new TypeError('EligibilityAssessment requires credential definition reference');
    if (!(input.requirementSet instanceof RequirementSet)) throw new TypeError('EligibilityAssessment requires RequirementSet');
    if (!(input.evaluatedAt instanceof UtcInstant)) throw new TypeError('EligibilityAssessment requires evaluation instant');
    if (!(input.evidenceSnapshot instanceof EvidenceSnapshot)) throw new TypeError('EligibilityAssessment requires exact EvidenceSnapshot');
    if (!(input.evaluator instanceof ActorReference)) throw new TypeError('EligibilityAssessment requires evaluator attribution');
    if (!(input.provenance instanceof ProvenanceEnvelope)) throw new TypeError('EligibilityAssessment requires rule/source provenance');
    if (input.credentialDefinition.id.toString() !== input.requirementSet.credentialDefinition.id.toString() ||
        input.credentialDefinition.version.toString() !== input.requirementSet.credentialDefinition.version.toString()) {
      throw new TypeError('RequirementSet credential definition version does not match assessment binding');
    }
    if (input.provenance.subject === null || input.provenance.subject.id.toString() !== input.subject.id.toString()) {
      throw new TypeError('Eligibility provenance subject must match assessment subject');
    }
    if (input.provenance.evaluatedAt.toString() !== input.evaluatedAt.toString()) {
      throw new TypeError('Eligibility provenance evaluation instant must match assessment instant');
    }
    if (input.provenance.ruleVersion.toString() !== input.requirementSet.version.toString()) {
      throw new TypeError('Eligibility provenance rule version must match RequirementSet version');
    }

    const expected = input.requirementSet.requirementIds.map(String);
    const actual = input.atomicResults.map((result) => result.requirementId.toString());
    if (input.atomicResults.some((result) => !(result instanceof AtomicRequirementResult))) throw new TypeError('Eligibility atomic results must use AtomicRequirementResult');
    if (new Set(actual).size !== actual.length) throw new TypeError('Eligibility atomic results cannot contain duplicate requirement IDs');
    if (expected.length !== actual.length || expected.some((id) => !actual.includes(id))) {
      throw new TypeError('Eligibility assessment requires exactly one atomic result for every requirement');
    }

    const groupResults = input.requirementSet.groups.map((group) => new RequirementGroupResult(
      group.code,
      aggregateRequirementGroup(group, input.atomicResults),
    ));
    return new EligibilityAssessment(input, groupResults, aggregateGroups(groupResults));
  }
}
