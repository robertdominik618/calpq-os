import {
  DomainOutcome,
  EligibilityAssessment,
  SubjectReference,
} from '../../../core/src/index.ts';
import {
  CredentialExplanationAffordance,
  CredentialExplanationReadModel,
} from '../explanation/credential-explanation-read-model.ts';

function requiredCode(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 160) throw new RangeError(`${label} is too long`);
  if (!/^[A-Z0-9][A-Z0-9._:-]*$/i.test(normalized)) {
    throw new TypeError(`${label} contains unsupported characters`);
  }
  return normalized;
}

function freezeStrings(values: readonly string[], label: string): readonly string[] {
  if (!Array.isArray(values)) throw new TypeError(`${label} must be an array`);
  const normalized = values.map((value) => requiredCode(value, label));
  if (new Set(normalized).size !== normalized.length) {
    throw new TypeError(`${label} must not contain duplicates`);
  }
  return Object.freeze(normalized);
}

function sameSubject(left: SubjectReference, right: SubjectReference): boolean {
  return left.kind === right.kind && left.id.toString() === right.id.toString();
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export const MissingConditionState = {
  NOT_SATISFIED: DomainOutcome.NOT_SATISFIED,
  INDETERMINATE: DomainOutcome.INDETERMINATE,
  REVIEW_REQUIRED: DomainOutcome.REVIEW_REQUIRED,
} as const;
export type MissingConditionState = (typeof MissingConditionState)[keyof typeof MissingConditionState];

export const NextActionAvailability = {
  AVAILABLE: 'AVAILABLE',
  NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS: 'NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS',
} as const;
export type NextActionAvailability = (typeof NextActionAvailability)[keyof typeof NextActionAvailability];

export const NextActionSourceKind = {
  EXPLICIT_GOVERNED_REFERENCE: 'EXPLICIT_GOVERNED_REFERENCE',
} as const;
export type NextActionSourceKind = (typeof NextActionSourceKind)[keyof typeof NextActionSourceKind];

export const NextActionPresentationReason = {
  EXPLICIT_GOVERNED_ACTION_REFERENCE: 'EXPLICIT_GOVERNED_ACTION_REFERENCE',
  NO_GOVERNED_ACTION_REFERENCE: 'NO_GOVERNED_ACTION_REFERENCE',
} as const;
export type NextActionPresentationReason =
  (typeof NextActionPresentationReason)[keyof typeof NextActionPresentationReason];

/**
 * Explicit input from a governed upstream source. M03 never constructs one by
 * interpreting a reason-code string, date, badge, verification state, or UI state.
 */
export class GovernedNextActionReference {
  readonly sourceKind = NextActionSourceKind.EXPLICIT_GOVERNED_REFERENCE;
  readonly actionCode: string;
  readonly labelKey: string;
  readonly assessmentId: string;
  readonly provenanceIdentity: string;
  readonly requirementId: string;
  readonly reasonCode: string;
  readonly supportingSourceIds: readonly string[];
  readonly supportingEvidenceIds: readonly string[];
  readonly actionRecommendationAuthority = false as const;

  private constructor(input: {
    readonly actionCode: string;
    readonly labelKey: string;
    readonly assessmentId: string;
    readonly provenanceIdentity: string;
    readonly requirementId: string;
    readonly reasonCode: string;
    readonly supportingSourceIds: readonly string[];
    readonly supportingEvidenceIds: readonly string[];
  }) {
    this.actionCode = input.actionCode;
    this.labelKey = input.labelKey;
    this.assessmentId = input.assessmentId;
    this.provenanceIdentity = input.provenanceIdentity;
    this.requirementId = input.requirementId;
    this.reasonCode = input.reasonCode;
    this.supportingSourceIds = input.supportingSourceIds;
    this.supportingEvidenceIds = input.supportingEvidenceIds;
    Object.freeze(this);
  }

  static create(input: {
    readonly actionCode: string;
    readonly labelKey: string;
    readonly assessmentId: string;
    readonly provenanceIdentity: string;
    readonly requirementId: string;
    readonly reasonCode: string;
    readonly supportingSourceIds?: readonly string[];
    readonly supportingEvidenceIds?: readonly string[];
  }): GovernedNextActionReference {
    return new GovernedNextActionReference({
      actionCode: requiredCode(input.actionCode, 'Next action code'),
      labelKey: requiredCode(input.labelKey, 'Next action label key'),
      assessmentId: requiredCode(input.assessmentId, 'Next action assessment ID'),
      provenanceIdentity: requiredCode(input.provenanceIdentity, 'Next action provenance identity'),
      requirementId: requiredCode(input.requirementId, 'Next action requirement ID'),
      reasonCode: requiredCode(input.reasonCode, 'Next action reason code'),
      supportingSourceIds: freezeStrings(input.supportingSourceIds ?? [], 'Next action source ID'),
      supportingEvidenceIds: freezeStrings(input.supportingEvidenceIds ?? [], 'Next action evidence ID'),
    });
  }

  toJSON() {
    return {
      sourceKind: this.sourceKind,
      actionCode: this.actionCode,
      labelKey: this.labelKey,
      assessmentId: this.assessmentId,
      provenanceIdentity: this.provenanceIdentity,
      requirementId: this.requirementId,
      reasonCode: this.reasonCode,
      supportingSourceIds: this.supportingSourceIds,
      supportingEvidenceIds: this.supportingEvidenceIds,
      actionRecommendationAuthority: this.actionRecommendationAuthority,
    } as const;
  }
}

export class GovernedNextActionPresentation {
  readonly sourceKind = NextActionSourceKind.EXPLICIT_GOVERNED_REFERENCE;
  readonly presentationReason = NextActionPresentationReason.EXPLICIT_GOVERNED_ACTION_REFERENCE;
  readonly actionCode: string;
  readonly labelKey: string;
  readonly requirementId: string;
  readonly reasonCode: string;
  readonly provenanceIdentity: string;
  readonly supportingSourceIds: readonly string[];
  readonly supportingEvidenceIds: readonly string[];
  readonly explanationAffordance = CredentialExplanationAffordance.WHY;
  readonly actionRecommendationAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(reference: GovernedNextActionReference) {
    this.actionCode = reference.actionCode;
    this.labelKey = reference.labelKey;
    this.requirementId = reference.requirementId;
    this.reasonCode = reference.reasonCode;
    this.provenanceIdentity = reference.provenanceIdentity;
    this.supportingSourceIds = Object.freeze([...reference.supportingSourceIds]);
    this.supportingEvidenceIds = Object.freeze([...reference.supportingEvidenceIds]);
    Object.freeze(this);
  }

  static fromReference(reference: GovernedNextActionReference): GovernedNextActionPresentation {
    if (!(reference instanceof GovernedNextActionReference)) {
      throw new TypeError('Next action presentation requires GovernedNextActionReference');
    }
    return new GovernedNextActionPresentation(reference);
  }

  toJSON() {
    return {
      sourceKind: this.sourceKind,
      presentationReason: this.presentationReason,
      actionCode: this.actionCode,
      labelKey: this.labelKey,
      requirementId: this.requirementId,
      reasonCode: this.reasonCode,
      provenanceIdentity: this.provenanceIdentity,
      supportingSourceIds: this.supportingSourceIds,
      supportingEvidenceIds: this.supportingEvidenceIds,
      explanationAffordance: this.explanationAffordance,
      actionRecommendationAuthority: this.actionRecommendationAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class MissingConditionPresentation {
  readonly requirementId: string;
  readonly state: MissingConditionState;
  readonly reasonCodes: readonly string[];
  readonly nextActionAvailability: NextActionAvailability;
  readonly nextActionReason: NextActionPresentationReason;
  readonly nextActions: readonly GovernedNextActionPresentation[];
  readonly explanationAffordance = CredentialExplanationAffordance.WHY;
  readonly decisionAuthority = false as const;
  readonly actionRecommendationAuthority = false as const;

  private constructor(input: {
    readonly requirementId: string;
    readonly state: MissingConditionState;
    readonly reasonCodes: readonly string[];
    readonly nextActions: readonly GovernedNextActionPresentation[];
  }) {
    this.requirementId = input.requirementId;
    this.state = input.state;
    this.reasonCodes = Object.freeze([...input.reasonCodes]);
    this.nextActions = Object.freeze([...input.nextActions]);
    this.nextActionAvailability = this.nextActions.length === 0
      ? NextActionAvailability.NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS
      : NextActionAvailability.AVAILABLE;
    this.nextActionReason = this.nextActions.length === 0
      ? NextActionPresentationReason.NO_GOVERNED_ACTION_REFERENCE
      : NextActionPresentationReason.EXPLICIT_GOVERNED_ACTION_REFERENCE;
    Object.freeze(this);
  }

  static create(input: {
    readonly requirementId: string;
    readonly state: MissingConditionState;
    readonly reasonCodes: readonly string[];
    readonly nextActions?: readonly GovernedNextActionPresentation[];
  }): MissingConditionPresentation {
    if (!Object.values(MissingConditionState).includes(input.state)) {
      throw new TypeError('Missing condition state must be a non-satisfied DomainOutcome');
    }
    if (!Array.isArray(input.nextActions ?? []) ||
        (input.nextActions ?? []).some((action) => !(action instanceof GovernedNextActionPresentation))) {
      throw new TypeError('Missing condition next actions must use GovernedNextActionPresentation');
    }
    return new MissingConditionPresentation({
      requirementId: requiredCode(input.requirementId, 'Missing condition requirement ID'),
      state: input.state,
      reasonCodes: freezeStrings(input.reasonCodes, 'Missing condition reason code'),
      nextActions: input.nextActions ?? [],
    });
  }

  toJSON() {
    return {
      requirementId: this.requirementId,
      state: this.state,
      reasonCodes: this.reasonCodes,
      nextActionAvailability: this.nextActionAvailability,
      nextActionReason: this.nextActionReason,
      nextActions: this.nextActions.map((action) => action.toJSON()),
      explanationAffordance: this.explanationAffordance,
      decisionAuthority: this.decisionAuthority,
      actionRecommendationAuthority: this.actionRecommendationAuthority,
    } as const;
  }
}

export interface MissingConditionNextActionReadModelInput {
  readonly assessment: EligibilityAssessment;
  readonly explanation: CredentialExplanationReadModel;
  readonly governedActions?: readonly GovernedNextActionReference[];
}

export class MissingConditionNextActionReadModel {
  readonly subject: SubjectReference;
  readonly assessmentId: string;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly evaluatedAt: string;
  readonly provenanceIdentity: string;
  readonly ruleSetId: string;
  readonly ruleVersion: string;
  readonly eligibilityOutcome: DomainOutcome;
  readonly missingConditions: readonly MissingConditionPresentation[];
  readonly missingConditionCount: number;
  readonly conditionsWithGovernedActionCount: number;
  readonly authorizationAuthority = false as const;
  readonly decisionAuthority = false as const;
  readonly actionRecommendationAuthority = false as const;

  private constructor(input: {
    readonly assessment: EligibilityAssessment;
    readonly missingConditions: readonly MissingConditionPresentation[];
  }) {
    this.subject = input.assessment.subject;
    this.assessmentId = input.assessment.id.toString();
    this.credentialDefinitionId = input.assessment.credentialDefinition.id.toString();
    this.credentialDefinitionVersion = input.assessment.credentialDefinition.version.toString();
    this.requirementSetId = input.assessment.requirementSetId.toString();
    this.requirementSetVersion = input.assessment.requirementSetVersion.toString();
    this.evaluatedAt = input.assessment.evaluatedAt.toString();
    this.provenanceIdentity = input.assessment.provenance.identity.toString();
    this.ruleSetId = input.assessment.provenance.ruleSetId.toString();
    this.ruleVersion = input.assessment.provenance.ruleVersion.toString();
    this.eligibilityOutcome = input.assessment.outcome;
    this.missingConditions = Object.freeze([...input.missingConditions]);
    this.missingConditionCount = this.missingConditions.length;
    this.conditionsWithGovernedActionCount = this.missingConditions.filter(
      (condition) => condition.nextActionAvailability === NextActionAvailability.AVAILABLE,
    ).length;
    Object.freeze(this);
  }

  static compose(input: MissingConditionNextActionReadModelInput): MissingConditionNextActionReadModel {
    if (!(input.assessment instanceof EligibilityAssessment)) {
      throw new TypeError('Missing-condition presentation requires authoritative EligibilityAssessment');
    }
    if (!(input.explanation instanceof CredentialExplanationReadModel)) {
      throw new TypeError('Missing-condition presentation requires CredentialExplanationReadModel');
    }
    if (input.explanation.authorizationAuthority !== false || input.explanation.decisionAuthority !== false) {
      throw new TypeError('Missing-condition presentation accepts only non-authoritative explanation input');
    }
    if (!sameSubject(input.assessment.subject, input.explanation.subject)) {
      throw new TypeError('Missing-condition presentation subject mismatch');
    }

    const assessmentId = input.assessment.id.toString();
    const provenanceIdentity = input.assessment.provenance.identity.toString();
    if (input.explanation.assessmentId !== assessmentId) {
      throw new TypeError('Missing-condition presentation assessment identity mismatch');
    }
    if (input.explanation.credentialDefinitionId !== input.assessment.credentialDefinition.id.toString() ||
        input.explanation.credentialDefinitionVersion !== input.assessment.credentialDefinition.version.toString()) {
      throw new TypeError('Missing-condition presentation credential-definition binding mismatch');
    }
    if (input.explanation.requirementSetId !== input.assessment.requirementSetId.toString() ||
        input.explanation.requirementSetVersion !== input.assessment.requirementSetVersion.toString()) {
      throw new TypeError('Missing-condition presentation requirement-set binding mismatch');
    }
    if (input.explanation.evaluatedAt !== input.assessment.evaluatedAt.toString()) {
      throw new TypeError('Missing-condition presentation evaluation instant mismatch');
    }
    if (input.explanation.provenanceIdentity !== provenanceIdentity) {
      throw new TypeError('Missing-condition presentation provenance identity mismatch');
    }
    if (input.explanation.ruleSetId !== input.assessment.provenance.ruleSetId.toString() ||
        input.explanation.ruleVersion !== input.assessment.provenance.ruleVersion.toString()) {
      throw new TypeError('Missing-condition presentation rule binding mismatch');
    }

    const assessmentResults = new Map(
      input.assessment.atomicResults.map((result) => [result.requirementId.toString(), result] as const),
    );
    const explanationReasons = input.explanation.eligibility.requirementReasons;
    if (explanationReasons.length !== input.assessment.atomicResults.length) {
      throw new TypeError('Missing-condition presentation requires complete atomic reason presentation');
    }
    const explanationReasonMap = new Map(explanationReasons.map((reason) => [reason.requirementId, reason] as const));
    if (explanationReasonMap.size !== explanationReasons.length) {
      throw new TypeError('Missing-condition explanation cannot contain duplicate requirement reasons');
    }
    for (const result of input.assessment.atomicResults) {
      const requirementId = result.requirementId.toString();
      const presented = explanationReasonMap.get(requirementId);
      if (presented === undefined || presented.outcome !== result.outcome ||
          !sameStrings(presented.reasonCodes, result.reasonCodes)) {
        throw new TypeError(`Missing-condition explanation mismatch for requirement ${requirementId}`);
      }
    }

    const sourceIds = new Set(input.assessment.provenance.sources.map((source) => source.id.toString()));
    const evidenceIds = new Set(input.assessment.provenance.evidence.map((evidence) => evidence.id.toString()));
    const governedActions = input.governedActions ?? [];
    if (!Array.isArray(governedActions) ||
        governedActions.some((action) => !(action instanceof GovernedNextActionReference))) {
      throw new TypeError('Next actions must use GovernedNextActionReference');
    }

    const actionKeys = new Set<string>();
    const actionMap = new Map<string, GovernedNextActionPresentation[]>();
    for (const action of governedActions) {
      if (action.assessmentId !== assessmentId) {
        throw new TypeError('Governed next action assessment identity mismatch');
      }
      if (action.provenanceIdentity !== provenanceIdentity) {
        throw new TypeError('Governed next action provenance identity mismatch');
      }
      const result = assessmentResults.get(action.requirementId);
      if (result === undefined) {
        throw new TypeError(`Governed next action references unknown requirement ${action.requirementId}`);
      }
      if (result.outcome === DomainOutcome.SATISFIED) {
        throw new TypeError('Governed next action cannot convert a satisfied requirement into a missing condition');
      }
      if (!result.reasonCodes.includes(action.reasonCode)) {
        throw new TypeError('Governed next action reason code is not present in the authoritative atomic result');
      }
      for (const sourceId of action.supportingSourceIds) {
        if (!sourceIds.has(sourceId)) {
          throw new TypeError(`Governed next action source is outside assessment provenance: ${sourceId}`);
        }
      }
      for (const evidenceId of action.supportingEvidenceIds) {
        if (!evidenceIds.has(evidenceId)) {
          throw new TypeError(`Governed next action evidence is outside assessment provenance: ${evidenceId}`);
        }
      }
      const key = `${action.requirementId}\u0000${action.reasonCode}\u0000${action.actionCode}`;
      if (actionKeys.has(key)) throw new TypeError('Duplicate governed next action reference');
      actionKeys.add(key);
      const list = actionMap.get(action.requirementId) ?? [];
      list.push(GovernedNextActionPresentation.fromReference(action));
      actionMap.set(action.requirementId, list);
    }

    const missingConditions = input.assessment.atomicResults
      .filter((result) => result.outcome !== DomainOutcome.SATISFIED)
      .map((result) => {
        const actions = [...(actionMap.get(result.requirementId.toString()) ?? [])]
          .sort((left, right) =>
            left.actionCode.localeCompare(right.actionCode) ||
            left.reasonCode.localeCompare(right.reasonCode) ||
            left.labelKey.localeCompare(right.labelKey));
        return MissingConditionPresentation.create({
          requirementId: result.requirementId.toString(),
          state: result.outcome as MissingConditionState,
          reasonCodes: result.reasonCodes,
          nextActions: actions,
        });
      });

    return new MissingConditionNextActionReadModel({
      assessment: input.assessment,
      missingConditions,
    });
  }

  toJSON() {
    return {
      subject: this.subject.toJSON(),
      assessmentId: this.assessmentId,
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersion: this.credentialDefinitionVersion,
      requirementSetId: this.requirementSetId,
      requirementSetVersion: this.requirementSetVersion,
      evaluatedAt: this.evaluatedAt,
      provenanceIdentity: this.provenanceIdentity,
      ruleSetId: this.ruleSetId,
      ruleVersion: this.ruleVersion,
      eligibilityOutcome: this.eligibilityOutcome,
      missingConditionCount: this.missingConditionCount,
      conditionsWithGovernedActionCount: this.conditionsWithGovernedActionCount,
      missingConditions: this.missingConditions.map((condition) => condition.toJSON()),
      authorizationAuthority: this.authorizationAuthority,
      decisionAuthority: this.decisionAuthority,
      actionRecommendationAuthority: this.actionRecommendationAuthority,
    } as const;
  }
}
