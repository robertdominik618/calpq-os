import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  DomainOutcome,
  EligibilityAssessment,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
} from '../../core/src/index.ts';
import {
  CredentialExplanationReadModel,
  GovernedNextActionReference,
  MissingConditionNextActionReadModel,
  MissingConditionState,
  NextActionAvailability,
  NextActionPresentationReason,
} from '../src/index.ts';

const subject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079601'),
  SubjectKind.PERSON,
);
const otherSubject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c079602'),
  SubjectKind.PERSON,
);

function textValue(value: string) {
  return Object.freeze({ toString: () => value });
}

type AtomicInput = Readonly<{
  id: string;
  outcome: typeof DomainOutcome[keyof typeof DomainOutcome];
  reasons: readonly string[];
}>;

const DEFAULT_ATOMIC: readonly AtomicInput[] = Object.freeze([
  Object.freeze({ id: 'REQ-A', outcome: DomainOutcome.NOT_SATISFIED, reasons: Object.freeze(['REQ_A_MISSING_EVIDENCE']) }),
  Object.freeze({ id: 'REQ-B', outcome: DomainOutcome.INDETERMINATE, reasons: Object.freeze(['REQ_B_SOURCE_UNAVAILABLE']) }),
  Object.freeze({ id: 'REQ-C', outcome: DomainOutcome.REVIEW_REQUIRED, reasons: Object.freeze(['REQ_C_HUMAN_REVIEW']) }),
  Object.freeze({ id: 'REQ-D', outcome: DomainOutcome.SATISFIED, reasons: Object.freeze(['REQ_D_SATISFIED']) }),
]);

function assessment(input: {
  readonly subjectValue?: SubjectReference;
  readonly assessmentId?: string;
  readonly credentialDefinitionId?: string;
  readonly credentialDefinitionVersion?: string;
  readonly requirementSetId?: string;
  readonly requirementSetVersion?: string;
  readonly evaluatedAt?: string;
  readonly provenanceIdentity?: string;
  readonly ruleSetId?: string;
  readonly ruleVersion?: string;
  readonly atomic?: readonly AtomicInput[];
  readonly sourceIds?: readonly string[];
  readonly evidenceIds?: readonly string[];
} = {}): EligibilityAssessment {
  const atomic = input.atomic ?? DEFAULT_ATOMIC;
  const value = Object.create(EligibilityAssessment.prototype) as Record<string, unknown>;
  Object.assign(value, {
    id: textValue(input.assessmentId ?? 'assessment-006'),
    subject: input.subjectValue ?? subject,
    credentialDefinition: Object.freeze({
      id: textValue(input.credentialDefinitionId ?? 'credential-definition-006'),
      version: textValue(input.credentialDefinitionVersion ?? 'v6'),
    }),
    requirementSetId: textValue(input.requirementSetId ?? 'requirement-set-006'),
    requirementSetVersion: textValue(input.requirementSetVersion ?? 'v9'),
    evaluatedAt: UtcInstant.from(input.evaluatedAt ?? '2026-09-15T13:00:00Z'),
    atomicResults: Object.freeze(atomic.map((item) => Object.freeze({
      requirementId: textValue(item.id),
      outcome: item.outcome,
      reasonCodes: Object.freeze([...item.reasons]),
    }))),
    outcome: DomainOutcome.NOT_SATISFIED,
    evaluator: Object.freeze({ toJSON: () => Object.freeze({ id: 'evaluator-006' }) }),
    provenance: Object.freeze({
      identity: textValue(input.provenanceIdentity ?? 'decision-006'),
      ruleSetId: textValue(input.ruleSetId ?? 'ruleset-006'),
      ruleVersion: textValue(input.ruleVersion ?? 'v9'),
      sources: Object.freeze((input.sourceIds ?? ['source-006']).map((id) => Object.freeze({ id: textValue(id) }))),
      evidence: Object.freeze((input.evidenceIds ?? ['evidence-006']).map((id) => Object.freeze({ id: textValue(id) }))),
    }),
  });
  return Object.freeze(value) as unknown as EligibilityAssessment;
}

function explanation(
  sourceAssessment: EligibilityAssessment,
  input: {
    readonly subjectValue?: SubjectReference;
    readonly assessmentId?: string;
    readonly credentialDefinitionId?: string;
    readonly credentialDefinitionVersion?: string;
    readonly requirementSetId?: string;
    readonly requirementSetVersion?: string;
    readonly evaluatedAt?: string;
    readonly provenanceIdentity?: string;
    readonly ruleSetId?: string;
    readonly ruleVersion?: string;
    readonly authorizationAuthority?: boolean;
    readonly decisionAuthority?: boolean;
    readonly requirementReasons?: readonly { requirementId: string; outcome: string; reasonCodes: readonly string[] }[];
  } = {},
): CredentialExplanationReadModel {
  const defaultReasons = sourceAssessment.atomicResults.map((result) => Object.freeze({
    requirementId: result.requirementId.toString(),
    outcome: result.outcome,
    reasonCodes: Object.freeze([...result.reasonCodes]),
  }));
  const value = Object.create(CredentialExplanationReadModel.prototype) as Record<string, unknown>;
  Object.assign(value, {
    subject: input.subjectValue ?? sourceAssessment.subject,
    assessmentId: input.assessmentId ?? sourceAssessment.id.toString(),
    credentialDefinitionId: input.credentialDefinitionId ?? sourceAssessment.credentialDefinition.id.toString(),
    credentialDefinitionVersion: input.credentialDefinitionVersion ?? sourceAssessment.credentialDefinition.version.toString(),
    requirementSetId: input.requirementSetId ?? sourceAssessment.requirementSetId.toString(),
    requirementSetVersion: input.requirementSetVersion ?? sourceAssessment.requirementSetVersion.toString(),
    evaluatedAt: input.evaluatedAt ?? sourceAssessment.evaluatedAt.toString(),
    provenanceIdentity: input.provenanceIdentity ?? sourceAssessment.provenance.identity.toString(),
    ruleSetId: input.ruleSetId ?? sourceAssessment.provenance.ruleSetId.toString(),
    ruleVersion: input.ruleVersion ?? sourceAssessment.provenance.ruleVersion.toString(),
    eligibility: Object.freeze({
      requirementReasons: Object.freeze([...(input.requirementReasons ?? defaultReasons)]),
    }),
    authorizationAuthority: input.authorizationAuthority ?? false,
    decisionAuthority: input.decisionAuthority ?? false,
  });
  return Object.freeze(value) as unknown as CredentialExplanationReadModel;
}

function action(input: {
  readonly actionCode?: string;
  readonly labelKey?: string;
  readonly assessmentId?: string;
  readonly provenanceIdentity?: string;
  readonly requirementId?: string;
  readonly reasonCode?: string;
  readonly sourceIds?: readonly string[];
  readonly evidenceIds?: readonly string[];
} = {}): GovernedNextActionReference {
  return GovernedNextActionReference.create({
    actionCode: input.actionCode ?? 'PROVIDE_GOVERNED_EVIDENCE',
    labelKey: input.labelKey ?? 'guidance.provide_governed_evidence',
    assessmentId: input.assessmentId ?? 'assessment-006',
    provenanceIdentity: input.provenanceIdentity ?? 'decision-006',
    requirementId: input.requirementId ?? 'REQ-A',
    reasonCode: input.reasonCode ?? 'REQ_A_MISSING_EVIDENCE',
    supportingSourceIds: input.sourceIds ?? ['source-006'],
    supportingEvidenceIds: input.evidenceIds ?? ['evidence-006'],
  });
}

function compose(input: {
  readonly assessmentValue?: EligibilityAssessment;
  readonly explanationValue?: CredentialExplanationReadModel;
  readonly governedActions?: readonly GovernedNextActionReference[];
} = {}) {
  const assessmentValue = input.assessmentValue ?? assessment();
  return MissingConditionNextActionReadModel.compose({
    assessment: assessmentValue,
    explanation: input.explanationValue ?? explanation(assessmentValue),
    governedActions: input.governedActions,
  });
}

test('M03S06-01 authoritative-assessment-input-required', () => {
  const a = assessment();
  assert.throws(() => MissingConditionNextActionReadModel.compose({
    assessment: {} as EligibilityAssessment,
    explanation: explanation(a),
  }), TypeError);
});

test('M03S06-02 explanation-input-required', () => {
  assert.throws(() => MissingConditionNextActionReadModel.compose({
    assessment: assessment(),
    explanation: {} as CredentialExplanationReadModel,
  }), TypeError);
});

test('M03S06-03 explanation-input-must-remain-non-authoritative', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { decisionAuthority: true }) }), TypeError);
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { authorizationAuthority: true }) }), TypeError);
});

test('M03S06-04 subject-binding-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { subjectValue: otherSubject }) }), TypeError);
});

test('M03S06-05 assessment-identity-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { assessmentId: 'assessment-other' }) }), TypeError);
});

test('M03S06-06 credential-definition-id-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { credentialDefinitionId: 'credential-other' }) }), TypeError);
});

test('M03S06-07 credential-definition-version-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { credentialDefinitionVersion: 'v-other' }) }), TypeError);
});

test('M03S06-08 requirement-set-id-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { requirementSetId: 'requirements-other' }) }), TypeError);
});

test('M03S06-09 requirement-set-version-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { requirementSetVersion: 'v-other' }) }), TypeError);
});

test('M03S06-10 evaluated-at-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { evaluatedAt: '2026-09-15T13:01:00.000Z' }) }), TypeError);
});

test('M03S06-11 provenance-identity-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { provenanceIdentity: 'decision-other' }) }), TypeError);
});

test('M03S06-12 rule-set-id-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { ruleSetId: 'ruleset-other' }) }), TypeError);
});

test('M03S06-13 rule-version-must-match', () => {
  const a = assessment();
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { ruleVersion: 'v-other' }) }), TypeError);
});

test('M03S06-14 explanation-requires-complete-atomic-reason-set', () => {
  const a = assessment();
  const reasons = a.atomicResults.slice(0, 3).map((result) => ({
    requirementId: result.requirementId.toString(), outcome: result.outcome, reasonCodes: result.reasonCodes,
  }));
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { requirementReasons: reasons }) }), TypeError);
});

test('M03S06-15 duplicate-explanation-requirement-reasons-are-rejected', () => {
  const a = assessment();
  const first = { requirementId: 'REQ-A', outcome: DomainOutcome.NOT_SATISFIED, reasonCodes: ['REQ_A_MISSING_EVIDENCE'] };
  const reasons = [first, first, { requirementId: 'REQ-C', outcome: DomainOutcome.REVIEW_REQUIRED, reasonCodes: ['REQ_C_HUMAN_REVIEW'] }, { requirementId: 'REQ-D', outcome: DomainOutcome.SATISFIED, reasonCodes: ['REQ_D_SATISFIED'] }];
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { requirementReasons: reasons }) }), TypeError);
});

test('M03S06-16 explanation-atomic-outcome-must-match', () => {
  const a = assessment();
  const reasons = a.atomicResults.map((result) => ({
    requirementId: result.requirementId.toString(),
    outcome: result.requirementId.toString() === 'REQ-A' ? DomainOutcome.SATISFIED : result.outcome,
    reasonCodes: result.reasonCodes,
  }));
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { requirementReasons: reasons }) }), TypeError);
});

test('M03S06-17 explanation-reason-codes-must-match-exactly', () => {
  const a = assessment({ atomic: [{ id: 'REQ-A', outcome: DomainOutcome.NOT_SATISFIED, reasons: ['FIRST', 'SECOND'] }] });
  const reasons = [{ requirementId: 'REQ-A', outcome: DomainOutcome.NOT_SATISFIED, reasonCodes: ['SECOND', 'FIRST'] }];
  assert.throws(() => compose({ assessmentValue: a, explanationValue: explanation(a, { requirementReasons: reasons }) }), TypeError);
});

test('M03S06-18 satisfied-requirements-are-not-presented-as-missing', () => {
  const model = compose();
  assert.equal(model.missingConditions.some((condition) => condition.requirementId === 'REQ-D'), false);
  assert.equal(model.missingConditionCount, 3);
});

test('M03S06-19 not-satisfied-condition-remains-distinct', () => {
  const model = compose();
  assert.equal(model.missingConditions[0]?.requirementId, 'REQ-A');
  assert.equal(model.missingConditions[0]?.state, MissingConditionState.NOT_SATISFIED);
});

test('M03S06-20 indeterminate-condition-remains-distinct', () => {
  const model = compose();
  assert.equal(model.missingConditions[1]?.requirementId, 'REQ-B');
  assert.equal(model.missingConditions[1]?.state, MissingConditionState.INDETERMINATE);
});

test('M03S06-21 review-required-condition-remains-distinct', () => {
  const model = compose();
  assert.equal(model.missingConditions[2]?.requirementId, 'REQ-C');
  assert.equal(model.missingConditions[2]?.state, MissingConditionState.REVIEW_REQUIRED);
});

test('M03S06-22 missing-condition-order-preserves-authoritative-atomic-order', () => {
  const a = assessment({ atomic: [
    { id: 'REQ-Z', outcome: DomainOutcome.REVIEW_REQUIRED, reasons: ['Z_REVIEW'] },
    { id: 'REQ-A', outcome: DomainOutcome.NOT_SATISFIED, reasons: ['A_MISSING'] },
  ] });
  const model = compose({ assessmentValue: a });
  assert.deepEqual(model.missingConditions.map((condition) => condition.requirementId), ['REQ-Z', 'REQ-A']);
});

test('M03S06-23 no-governed-action-is-explicitly-unavailable', () => {
  const model = compose();
  const condition = model.missingConditions[0]!;
  assert.equal(condition.nextActionAvailability, NextActionAvailability.NOT_AVAILABLE_FROM_GOVERNED_OUTPUTS);
  assert.equal(condition.nextActionReason, NextActionPresentationReason.NO_GOVERNED_ACTION_REFERENCE);
  assert.deepEqual(condition.nextActions, []);
});

test('M03S06-24 governed-actions-must-use-governed-reference-type', () => {
  assert.throws(() => compose({ governedActions: [{} as GovernedNextActionReference] }), TypeError);
});

test('M03S06-25 governed-action-assessment-identity-must-match', () => {
  assert.throws(() => compose({ governedActions: [action({ assessmentId: 'assessment-other' })] }), TypeError);
});

test('M03S06-26 governed-action-provenance-identity-must-match', () => {
  assert.throws(() => compose({ governedActions: [action({ provenanceIdentity: 'decision-other' })] }), TypeError);
});

test('M03S06-27 governed-action-requirement-must-exist', () => {
  assert.throws(() => compose({ governedActions: [action({ requirementId: 'REQ-UNKNOWN' })] }), TypeError);
});

test('M03S06-28 governed-action-cannot-turn-satisfied-requirement-into-missing', () => {
  assert.throws(() => compose({ governedActions: [action({ requirementId: 'REQ-D', reasonCode: 'REQ_D_SATISFIED' })] }), TypeError);
});

test('M03S06-29 governed-action-reason-must-be-authoritative-atomic-reason', () => {
  assert.throws(() => compose({ governedActions: [action({ reasonCode: 'INFERRED_FROM_TEXT' })] }), TypeError);
});

test('M03S06-30 governed-action-supporting-source-must-be-in-assessment-provenance', () => {
  assert.throws(() => compose({ governedActions: [action({ sourceIds: ['source-outside'] })] }), TypeError);
});

test('M03S06-31 governed-action-supporting-evidence-must-be-in-assessment-provenance', () => {
  assert.throws(() => compose({ governedActions: [action({ evidenceIds: ['evidence-outside'] })] }), TypeError);
});

test('M03S06-32 duplicate-actions-are-rejected', () => {
  const value = action();
  assert.throws(() => compose({ governedActions: [value, value] }), TypeError);
});

test('M03S06-33 governed-actions-are-available-and-deterministically-ordered', () => {
  const model = compose({ governedActions: [
    action({ actionCode: 'Z_ACTION', labelKey: 'guidance.z' }),
    action({ actionCode: 'A_ACTION', labelKey: 'guidance.a' }),
  ] });
  const condition = model.missingConditions[0]!;
  assert.equal(condition.nextActionAvailability, NextActionAvailability.AVAILABLE);
  assert.equal(condition.nextActionReason, NextActionPresentationReason.EXPLICIT_GOVERNED_ACTION_REFERENCE);
  assert.deepEqual(condition.nextActions.map((item) => item.actionCode), ['A_ACTION', 'Z_ACTION']);
  assert.equal(model.conditionsWithGovernedActionCount, 1);
});

test('M03S06-34 deterministic-immutable-zero-authority-and-no-action-inference-boundary', () => {
  const model = compose({ governedActions: [action()] });
  assert.equal(JSON.stringify(model.toJSON()), JSON.stringify(model.toJSON()));
  assert.equal(model.authorizationAuthority, false);
  assert.equal(model.decisionAuthority, false);
  assert.equal(model.actionRecommendationAuthority, false);
  assert.equal(model.missingConditions[0]?.decisionAuthority, false);
  assert.equal(model.missingConditions[0]?.actionRecommendationAuthority, false);
  assert.equal(model.missingConditions[0]?.nextActions[0]?.actionRecommendationAuthority, false);
  assert.equal(Object.isFrozen(model), true);
  assert.equal(Object.isFrozen(model.missingConditions), true);
  assert.equal(Object.isFrozen(model.missingConditions[0]!), true);
  assert.equal(Object.isFrozen(model.missingConditions[0]!.reasonCodes), true);
  assert.equal(Object.isFrozen(model.missingConditions[0]!.nextActions), true);

  const source = readFileSync(new URL('../src/guidance/missing-condition-next-action-read-model.ts', import.meta.url), 'utf8');
  assert.equal(/Date\.now\(|Math\.random\(|randomUUID\(/.test(source), false);
  assert.equal(/reasonCode\.(startsWith|endsWith|match|search|toLowerCase|toUpperCase)\(/.test(source), false);
  assert.equal(/AuthorizationGrant/.test(source), false);
});
