import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActorId,
  ActorKind,
  ActorReference,
  CatalogEffectivePeriod,
  ContentHash,
  CredentialDefinition,
  CredentialDefinitionId,
  DateOnly,
  DecisionId,
  EquivalenceEffectType,
  EquivalenceRule,
  EquivalenceRuleApplicationState,
  EquivalenceRuleId,
  EquivalenceSourceObjectType,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  Jurisdiction,
  ProvenanceEnvelope,
  RecognitionDecision,
  RecognitionDecisionEffectType,
  RecognitionReviewCase,
  RecognitionReviewCaseId,
  RecognitionReviewCaseStatus,
  RecognitionReviewResolutionKind,
  RecognitionReviewSeverity,
  RecognitionReviewUrgency,
  RecognitionRoute,
  RecognitionRouteApplicationState,
  RecognitionRouteId,
  RecognitionRouteKind,
  RequirementDefinition,
  RequirementDefinitionId,
  RuleSetId,
  SourceId,
  SourceReference,
  SourceType,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
  VersionId,
} from '../src/index.ts';

const IDS = {
  sourceA: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6001',
  sourceB: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6002',
  authority: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6003',
  otherAuthority: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6004',
  process: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6005',
  opener: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6006',
  reviewer: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6007',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6008',
  otherSubject: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6009',
  provenanceDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6010',
  recognitionDecision: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6011',
  rules: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6012',
  foreignCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6013',
  targetCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6014',
  lookalikeCredential: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6015',
  requirement: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6016',
  residualRequirement: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6017',
  equivalenceRule: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6018',
  route: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6019',
  reviewCase: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6020',
  evidence: '018f22e2-79b0-7cc3-98c4-dc0c0c0b6021',
} as const;

const cz = Jurisdiction.fromCode('CZ');
const eu = Jurisdiction.fromCode('EU');
const authority = ActorReference.create(ActorId.from(IDS.authority), ActorKind.EXTERNAL_AUTHORITY);
const otherAuthority = ActorReference.create(ActorId.from(IDS.otherAuthority), ActorKind.EXTERNAL_AUTHORITY);
const processActor = ActorReference.create(ActorId.from(IDS.process), ActorKind.SYSTEM_PROCESS);
const opener = ActorReference.create(ActorId.from(IDS.opener), ActorKind.HUMAN_USER);
const reviewer = ActorReference.create(ActorId.from(IDS.reviewer), ActorKind.HUMAN_USER);
const subject = SubjectReference.create(SubjectId.from(IDS.subject), SubjectKind.PERSON);
const otherSubject = SubjectReference.create(SubjectId.from(IDS.otherSubject), SubjectKind.PERSON);
const sourceAId = SourceId.from(IDS.sourceA);
const sourceBId = SourceId.from(IDS.sourceB);

function period(from = '2026-01-01', to: string | null = '2026-12-31'): CatalogEffectivePeriod {
  return CatalogEffectivePeriod.create({
    effectiveFrom: DateOnly.from(from),
    effectiveTo: to === null ? null : DateOnly.from(to),
  });
}

function source(
  id: SourceId = sourceAId,
  options: {
    readonly verification?: VerificationStateCode;
    readonly version?: string;
    readonly authorityRef?: ActorReference;
    readonly retrievedAt?: string;
    readonly hashChar?: string;
  } = {},
): SourceReference {
  return SourceReference.create({
    id,
    authority: options.authorityRef ?? authority,
    jurisdiction: cz,
    sourceType: SourceType.REGULATION,
    canonicalLocator: `urn:calpq:m04:s06:${id.toString()}`,
    version: VersionId.from(options.version ?? 'source-1'),
    publicationDate: DateOnly.from('2025-12-15'),
    effectiveFrom: DateOnly.from('2026-01-01'),
    effectiveTo: DateOnly.from('2026-12-31'),
    retrievedAt: UtcInstant.from(options.retrievedAt ?? '2026-01-02T10:00:00Z'),
    verificationState: VerificationState.from(options.verification ?? VerificationStateCode.VERIFIED),
    contentHash: ContentHash.sha256((options.hashChar ?? 'a').repeat(64)),
  });
}

function provenance(
  refs: readonly SourceReference[],
  options: {
    readonly subjectRef?: SubjectReference | null;
    readonly evaluatedAt?: string;
    readonly evidence?: readonly EvidenceReference[];
  } = {},
): ProvenanceEnvelope {
  return ProvenanceEnvelope.create({
    identity: DecisionId.from(IDS.provenanceDecision),
    evaluatedAt: UtcInstant.from(options.evaluatedAt ?? '2026-01-03T10:00:00Z'),
    actor: processActor,
    subject: options.subjectRef ?? null,
    ruleSetId: RuleSetId.from(IDS.rules),
    ruleVersion: VersionId.from('m04-s06-rules-1'),
    sources: refs,
    evidence: options.evidence ?? [],
  });
}

function credential(
  id: string,
  jurisdiction: Jurisdiction,
  options: { readonly label?: string; readonly version?: string } = {},
): CredentialDefinition {
  return CredentialDefinition.create({
    id: CredentialDefinitionId.from(id),
    version: VersionId.from(options.version ?? 'credential-1'),
    code: `CRED.${id.slice(-4).toUpperCase()}`,
    preferredLabel: options.label ?? 'Professional qualification',
    aliases: [],
    description: 'Governed credential for M04 S06 testing.',
    jurisdiction,
    effectivePeriod: period(),
    sourceReferenceIds: [sourceAId],
  });
}

function requirement(id: string = IDS.requirement, label = 'Professional requirement'): RequirementDefinition {
  return RequirementDefinition.create({
    id: RequirementDefinitionId.from(id),
    version: VersionId.from('requirement-1'),
    code: `REQ.${id.slice(-4).toUpperCase()}`,
    preferredLabel: label,
    aliases: [],
    description: 'Governed requirement for M04 S06 testing.',
    jurisdiction: cz,
    effectivePeriod: period(),
    sourceReferenceIds: [sourceAId],
  });
}

function foreignCredential(): CredentialDefinition {
  return credential(IDS.foreignCredential, eu, { label: 'Electrician qualification' });
}

function targetCredential(options: { readonly label?: string; readonly version?: string } = {}): CredentialDefinition {
  return credential(IDS.targetCredential, cz, { label: options.label ?? 'Electrician authorization', version: options.version });
}

function equivalenceRule(
  options: {
    readonly effectType?: EquivalenceEffectType;
    readonly target?: CredentialDefinition | RequirementDefinition;
    readonly jurisdiction?: Jurisdiction;
    readonly effectivePeriod?: CatalogEffectivePeriod;
    readonly residual?: readonly RequirementDefinition[];
    readonly refs?: readonly SourceReference[];
    readonly provenanceEnvelope?: ProvenanceEnvelope;
    readonly conditionCodes?: readonly string[];
  } = {},
): EquivalenceRule {
  const refs = options.refs ?? [source()];
  return EquivalenceRule.create({
    id: EquivalenceRuleId.from(IDS.equivalenceRule),
    sourceObjectType: EquivalenceSourceObjectType.CREDENTIAL_DEFINITION,
    sourceObjectId: foreignCredential().id.toString(),
    sourceObjectVersion: foreignCredential().version,
    target: options.target ?? targetCredential(),
    effectType: options.effectType ?? EquivalenceEffectType.FULL_SUBSTITUTION,
    jurisdiction: options.jurisdiction ?? cz,
    effectivePeriod: options.effectivePeriod ?? period(),
    conditionCodes: options.conditionCodes ?? [],
    residualRequirements: options.residual ?? [],
    sourceReferences: refs,
    provenance: options.provenanceEnvelope ?? provenance(refs),
  });
}

function recognitionRoute(
  options: {
    readonly kind?: RecognitionRouteKind;
    readonly jurisdiction?: Jurisdiction;
    readonly effectivePeriod?: CatalogEffectivePeriod;
    readonly refs?: readonly SourceReference[];
    readonly provenanceEnvelope?: ProvenanceEnvelope;
  } = {},
): RecognitionRoute {
  const refs = options.refs ?? [source()];
  return RecognitionRoute.create({
    id: RecognitionRouteId.from(IDS.route),
    kind: options.kind ?? RecognitionRouteKind.GENERAL_RECOGNITION,
    sourceCredentialDefinition: foreignCredential(),
    targetCredentialDefinition: targetCredential(),
    jurisdiction: options.jurisdiction ?? cz,
    effectivePeriod: options.effectivePeriod ?? period(),
    conditionCodes: [],
    sourceReferences: refs,
    provenance: options.provenanceEnvelope ?? provenance(refs),
  });
}

function recognitionDecision(
  options: {
    readonly subjectRef?: SubjectReference;
    readonly authorityRef?: ActorReference;
    readonly target?: CredentialDefinition | RequirementDefinition;
    readonly effectType?: RecognitionDecisionEffectType;
    readonly jurisdiction?: Jurisdiction;
    readonly effectivePeriod?: CatalogEffectivePeriod;
    readonly residual?: readonly RequirementDefinition[];
    readonly refs?: readonly SourceReference[];
    readonly provenanceEnvelope?: ProvenanceEnvelope;
  } = {},
): RecognitionDecision {
  const subjectRef = options.subjectRef ?? subject;
  const authorityRef = options.authorityRef ?? authority;
  const refs = options.refs ?? [source(sourceAId, { authorityRef })];
  return RecognitionDecision.create({
    id: DecisionId.from(IDS.recognitionDecision),
    authority: authorityRef,
    subject: subjectRef,
    sourceCredentialDefinition: foreignCredential(),
    target: options.target ?? targetCredential(),
    effectType: options.effectType ?? RecognitionDecisionEffectType.FULL_SUBSTITUTION,
    jurisdiction: options.jurisdiction ?? cz,
    effectivePeriod: options.effectivePeriod ?? period(),
    conditionCodes: [],
    limitationCodes: [],
    residualRequirements: options.residual ?? [],
    sourceReferences: refs,
    provenance: options.provenanceEnvelope ?? provenance(refs, { subjectRef }),
  });
}

function reviewCase(
  options: {
    readonly subjectRef?: SubjectReference;
    readonly independent?: boolean;
    readonly sourceObjectIds?: readonly string[];
    readonly factCodes?: readonly string[];
  } = {},
): RecognitionReviewCase {
  const subjectRef = options.subjectRef ?? subject;
  return RecognitionReviewCase.open({
    id: RecognitionReviewCaseId.from(IDS.reviewCase),
    sourceObjectIds: options.sourceObjectIds ?? [IDS.equivalenceRule],
    subject: subjectRef,
    jurisdiction: cz,
    severity: RecognitionReviewSeverity.HIGH,
    urgency: RecognitionReviewUrgency.EXPEDITED,
    assignedRoleCode: 'ROLE.RECOGNITION_REVIEWER',
    assignee: reviewer,
    openedAt: UtcInstant.from('2026-02-01T09:00:00Z'),
    dueAt: UtcInstant.from('2026-02-10T09:00:00Z'),
    openedBy: opener,
    factCodes: options.factCodes ?? ['FACT.B'],
    unknownPointCodes: ['UNKNOWN.AUTHORITY_SCOPE'],
    evidenceReferenceIds: [EvidenceId.from(IDS.evidence)],
    resolutionQuestionCode: 'QUESTION.EQUIVALENCE_APPLIES',
    requiresIndependentApproval: options.independent ?? false,
    provenance: provenance([source()], {
      subjectRef,
      evaluatedAt: '2026-02-01T09:05:00Z',
    }),
  });
}

function inReview(options: { readonly independent?: boolean; readonly subjectRef?: SubjectReference } = {}): RecognitionReviewCase {
  return reviewCase(options)
    .triage(reviewer, UtcInstant.from('2026-02-01T09:10:00Z'), 'TRIAGE.ACCEPTED')
    .beginReview(reviewer, UtcInstant.from('2026-02-01T09:20:00Z'), 'REVIEW.STARTED');
}

test('M04S06-01-equivalence-rule-binds-explicit-target', () => {
  const value = equivalenceRule();
  assert.equal(value.target.id.toString(), IDS.targetCredential);
});

test('M04S06-02-equivalence-rule-preserves-exact-target-version', () => {
  const target = targetCredential({ version: 'credential-2' });
  assert.equal(equivalenceRule({ target }).target.version.toString(), 'credential-2');
});

test('M04S06-03-same-label-never-implies-equivalence', () => {
  const target = targetCredential({ label: 'Same title' });
  const lookalike = credential(IDS.lookalikeCredential, cz, { label: 'Same title' });
  const value = equivalenceRule({ target });
  assert.equal(value.target.id.toString(), IDS.targetCredential);
  assert.notEqual(value.target.id.toString(), lookalike.id.toString());
});

test('M04S06-04-wrong-jurisdiction-equivalence-is-inapplicable', () => {
  assert.equal(
    equivalenceRule().applicationState(DateOnly.from('2026-06-01'), eu),
    EquivalenceRuleApplicationState.INAPPLICABLE_JURISDICTION,
  );
});

test('M04S06-05-expired-equivalence-is-inapplicable', () => {
  assert.equal(
    equivalenceRule().applicationState(DateOnly.from('2027-01-01'), cz),
    EquivalenceRuleApplicationState.INAPPLICABLE_DATE,
  );
});

test('M04S06-06-unverified-rule-source-requires-review', () => {
  const ref = source(sourceAId, { verification: VerificationStateCode.UNVERIFIED });
  assert.equal(
    equivalenceRule({ refs: [ref], provenanceEnvelope: provenance([ref]) })
      .applicationState(DateOnly.from('2026-06-01'), cz),
    EquivalenceRuleApplicationState.SOURCE_REVIEW_REQUIRED,
  );
});

test('M04S06-07-review-required-effect-never-auto-resolves', () => {
  assert.equal(
    equivalenceRule({ effectType: EquivalenceEffectType.REVIEW_REQUIRED })
      .applicationState(DateOnly.from('2026-06-01'), cz),
    EquivalenceRuleApplicationState.REVIEW_REQUIRED,
  );
});

test('M04S06-08-recognition-route-only-effect-does-not-satisfy-target', () => {
  assert.equal(
    equivalenceRule({ effectType: EquivalenceEffectType.RECOGNITION_ROUTE_ONLY })
      .applicationState(DateOnly.from('2026-06-01'), cz),
    EquivalenceRuleApplicationState.RECOGNITION_ROUTE_REQUIRED,
  );
});

test('M04S06-09-full-substitution-rejects-residual-requirements', () => {
  assert.throws(
    () => equivalenceRule({ residual: [requirement(IDS.residualRequirement)] }),
    /Residual requirements are only valid/i,
  );
});

test('M04S06-10-partial-substitution-requires-residual-requirements', () => {
  assert.throws(
    () => equivalenceRule({ effectType: EquivalenceEffectType.PARTIAL_SUBSTITUTION }),
    /preserve residual requirements/i,
  );
});

test('M04S06-11-partial-substitution-preserves-residual-requirements', () => {
  const residual = requirement(IDS.residualRequirement);
  const value = equivalenceRule({
    effectType: EquivalenceEffectType.PARTIAL_SUBSTITUTION,
    residual: [residual],
  });
  assert.deepEqual(value.residualRequirements.map((entry) => entry.id.toString()), [IDS.residualRequirement]);
});

test('M04S06-12-credit-or-reduction-requires-residual-requirements', () => {
  assert.throws(
    () => equivalenceRule({ effectType: EquivalenceEffectType.CREDIT_OR_REDUCTION }),
    /preserve residual requirements/i,
  );
});

test('M04S06-13-duplicate-source-identity-is-rejected', () => {
  const a = source(sourceAId, { version: 'source-1' });
  const b = source(sourceAId, { version: 'source-2' });
  assert.throws(
    () => equivalenceRule({ refs: [a, b], provenanceEnvelope: provenance([a, b]) }),
    /SourceId identities must be unique/i,
  );
});

test('M04S06-14-rule-provenance-must-be-subject-free', () => {
  const ref = source();
  assert.throws(
    () => equivalenceRule({ refs: [ref], provenanceEnvelope: provenance([ref], { subjectRef: subject }) }),
    /subject-free/i,
  );
});

test('M04S06-15-rule-provenance-must-be-evidence-free', () => {
  const ref = source();
  const evidence = EvidenceReference.original({
    id: EvidenceId.from(IDS.evidence),
    kind: EvidenceKind.REGISTRY_RESPONSE,
    contentReference: 'urn:calpq:m04:s06:evidence',
    mediaType: 'application/json',
    contentHash: ContentHash.sha256('e'.repeat(64)),
    acquiredAt: UtcInstant.from('2026-01-02T11:00:00Z'),
    acquiredBy: processActor,
    source: ref,
    verificationState: VerificationState.from(VerificationStateCode.VERIFIED),
  });
  assert.throws(
    () => equivalenceRule({ refs: [ref], provenanceEnvelope: provenance([ref], { evidence: [evidence] }) }),
    /evidence-free/i,
  );
});

test('M04S06-16-rule-provenance-must-match-exact-source-snapshot', () => {
  const bound = source(sourceAId, { version: 'source-1' });
  const provenanceRef = source(sourceAId, { version: 'source-2' });
  assert.throws(
    () => equivalenceRule({ refs: [bound], provenanceEnvelope: provenance([provenanceRef]) }),
    /exactly match governed source snapshots/i,
  );
});

test('M04S06-17-provenance-cannot-predate-source-retrieval', () => {
  const ref = source(sourceAId, { retrievedAt: '2026-01-04T10:00:00Z' });
  assert.throws(
    () => equivalenceRule({ refs: [ref], provenanceEnvelope: provenance([ref], { evaluatedAt: '2026-01-03T10:00:00Z' }) }),
    /cannot predate source retrieval/i,
  );
});

test('M04S06-18-rule-source-collection-is-runtime-immutable', () => {
  const value = equivalenceRule();
  assert.throws(() => (value.sourceReferences as SourceReference[]).push(source(sourceBId)), TypeError);
});

test('M04S06-19-rule-serialization-is-canonical-across-source-order', () => {
  const a = source(sourceAId, { hashChar: 'a' });
  const b = source(sourceBId, { hashChar: 'b' });
  const left = equivalenceRule({ refs: [b, a], provenanceEnvelope: provenance([a, b]) });
  const right = equivalenceRule({ refs: [a, b], provenanceEnvelope: provenance([b, a]) });
  assert.equal(JSON.stringify(left.toJSON()), JSON.stringify(right.toJSON()));
});

test('M04S06-20-recognition-route-is-procedure-only-and-available', () => {
  assert.equal(
    recognitionRoute().applicationState(DateOnly.from('2026-06-01'), cz),
    RecognitionRouteApplicationState.ROUTE_AVAILABLE,
  );
});

test('M04S06-21-unknown-route-requires-review', () => {
  assert.equal(
    recognitionRoute({ kind: RecognitionRouteKind.UNKNOWN_REVIEW_REQUIRED })
      .applicationState(DateOnly.from('2026-06-01'), cz),
    RecognitionRouteApplicationState.REVIEW_REQUIRED,
  );
});

test('M04S06-22-route-wrong-jurisdiction-is-inapplicable', () => {
  assert.equal(
    recognitionRoute().applicationState(DateOnly.from('2026-06-01'), eu),
    RecognitionRouteApplicationState.INAPPLICABLE_JURISDICTION,
  );
});

test('M04S06-23-route-outside-effective-date-is-inapplicable', () => {
  assert.equal(
    recognitionRoute().applicationState(DateOnly.from('2027-01-01'), cz),
    RecognitionRouteApplicationState.INAPPLICABLE_DATE,
  );
});

test('M04S06-24-route-with-unverified-source-requires-source-review', () => {
  const ref = source(sourceAId, { verification: VerificationStateCode.STALE });
  assert.equal(
    recognitionRoute({ refs: [ref], provenanceEnvelope: provenance([ref]) })
      .applicationState(DateOnly.from('2026-06-01'), cz),
    RecognitionRouteApplicationState.SOURCE_REVIEW_REQUIRED,
  );
});

test('M04S06-25-route-availability-does-not-create-a-recognition-decision', () => {
  const value = recognitionRoute();
  assert.equal('decision' in value, false);
  assert.equal('effectType' in value, false);
});

test('M04S06-26-authoritative-decision-requires-already-verified-sources', () => {
  const ref = source(sourceAId, { verification: VerificationStateCode.UNVERIFIED });
  assert.throws(
    () => recognitionDecision({ refs: [ref], provenanceEnvelope: provenance([ref], { subjectRef: subject }) }),
    /already-VERIFIED/i,
  );
});

test('M04S06-27-decision-authority-must-be-represented-by-source', () => {
  const ref = source(sourceAId, { authorityRef: authority });
  assert.throws(
    () => recognitionDecision({
      authorityRef: otherAuthority,
      refs: [ref],
      provenanceEnvelope: provenance([ref], { subjectRef: subject }),
    }),
    /authority must be represented/i,
  );
});

test('M04S06-28-decision-provenance-must-match-subject', () => {
  const ref = source();
  assert.throws(
    () => recognitionDecision({
      refs: [ref],
      provenanceEnvelope: provenance([ref], { subjectRef: otherSubject }),
    }),
    /match the exact subject/i,
  );
});

test('M04S06-29-decision-target-jurisdiction-is-exact', () => {
  assert.throws(
    () => recognitionDecision({ target: foreignCredential() }),
    /target jurisdiction must match/i,
  );
});

test('M04S06-30-decision-applicability-is-date-and-jurisdiction-scoped', () => {
  const value = recognitionDecision();
  assert.equal(value.isEffectiveOn(DateOnly.from('2026-06-01'), cz), true);
  assert.equal(value.isEffectiveOn(DateOnly.from('2027-06-01'), cz), false);
  assert.equal(value.isEffectiveOn(DateOnly.from('2026-06-01'), eu), false);
});

test('M04S06-31-partial-recognition-preserves-residual-requirements', () => {
  const residual = requirement(IDS.residualRequirement);
  const value = recognitionDecision({
    effectType: RecognitionDecisionEffectType.PARTIAL_SUBSTITUTION,
    residual: [residual],
  });
  assert.equal(value.residualRequirements[0]?.id.toString(), IDS.residualRequirement);
});

test('M04S06-32-full-recognition-rejects-residual-requirements', () => {
  assert.throws(
    () => recognitionDecision({ residual: [requirement(IDS.residualRequirement)] }),
    /Residual requirements are only valid/i,
  );
});

test('M04S06-33-review-case-opens-with-explicit-review-state', () => {
  assert.equal(reviewCase().status, RecognitionReviewCaseStatus.OPEN);
});

test('M04S06-34-review-case-triage-is-explicit-and-audited', () => {
  const value = reviewCase().triage(reviewer, UtcInstant.from('2026-02-01T09:10:00Z'), 'TRIAGE.ACCEPTED');
  assert.equal(value.status, RecognitionReviewCaseStatus.TRIAGED);
  assert.equal(value.transitionHistory.length, 1);
});

test('M04S06-35-review-case-enters-review-explicitly', () => {
  assert.equal(inReview().status, RecognitionReviewCaseStatus.IN_REVIEW);
});

test('M04S06-36-waiting-evidence-roundtrip-preserves-history', () => {
  const value = inReview()
    .waitForEvidence(reviewer, UtcInstant.from('2026-02-01T09:25:00Z'), 'WAIT.EVIDENCE')
    .beginReview(reviewer, UtcInstant.from('2026-02-01T09:30:00Z'), 'REVIEW.RESUMED');
  assert.equal(value.status, RecognitionReviewCaseStatus.IN_REVIEW);
  assert.equal(value.transitionHistory.length, 4);
});

test('M04S06-37-waiting-external-roundtrip-preserves-history', () => {
  const value = inReview()
    .waitForExternal(reviewer, UtcInstant.from('2026-02-01T09:25:00Z'), 'WAIT.AUTHORITY')
    .beginReview(reviewer, UtcInstant.from('2026-02-01T09:30:00Z'), 'REVIEW.RESUMED');
  assert.equal(value.status, RecognitionReviewCaseStatus.IN_REVIEW);
  assert.equal(value.transitionHistory.at(-2)?.to, RecognitionReviewCaseStatus.WAITING_EXTERNAL);
});

test('M04S06-38-review-case-cannot-close-before-resolution', () => {
  assert.throws(
    () => inReview().close(reviewer, UtcInstant.from('2026-02-01T09:30:00Z'), 'CLOSE.INVALID'),
    /not allowed/i,
  );
});

test('M04S06-39-human-review-can-resolve-with-applicable-governed-rule', () => {
  const value = inReview().resolveWithRule(
    equivalenceRule(),
    DateOnly.from('2026-06-01'),
    reviewer,
    UtcInstant.from('2026-02-01T09:30:00Z'),
    'RESOLVE.GOVERNED_RULE',
  );
  assert.equal(value.status, RecognitionReviewCaseStatus.RESOLVED);
  assert.equal(value.activeResolution()?.kind, RecognitionReviewResolutionKind.EQUIVALENCE_RULE);
});

test('M04S06-40-review-required-rule-cannot-resolve-review', () => {
  assert.throws(
    () => inReview().resolveWithRule(
      equivalenceRule({ effectType: EquivalenceEffectType.REVIEW_REQUIRED }),
      DateOnly.from('2026-06-01'),
      reviewer,
      UtcInstant.from('2026-02-01T09:30:00Z'),
      'RESOLVE.INVALID_RULE',
    ),
    /not a governed applicable resolution basis/i,
  );
});

test('M04S06-41-recognition-route-is-not-a-review-resolution-basis', () => {
  const value = inReview() as unknown as { readonly resolveWithRoute?: unknown };
  assert.equal(value.resolveWithRoute, undefined);
});

test('M04S06-42-human-review-can-resolve-with-authoritative-decision', () => {
  const value = inReview().resolveWithDecision(
    recognitionDecision(),
    DateOnly.from('2026-06-01'),
    reviewer,
    UtcInstant.from('2026-02-01T09:30:00Z'),
    'RESOLVE.AUTHORITY_DECISION',
  );
  assert.equal(value.activeResolution()?.kind, RecognitionReviewResolutionKind.RECOGNITION_DECISION);
});

test('M04S06-43-decision-for-different-subject-cannot-resolve-review', () => {
  assert.throws(
    () => inReview().resolveWithDecision(
      recognitionDecision({ subjectRef: otherSubject }),
      DateOnly.from('2026-06-01'),
      reviewer,
      UtcInstant.from('2026-02-01T09:30:00Z'),
      'RESOLVE.WRONG_SUBJECT',
    ),
    /subject does not match/i,
  );
});

test('M04S06-44-independent-approval-prevents-originator-self-resolution', () => {
  assert.throws(
    () => inReview({ independent: true }).resolveWithRule(
      equivalenceRule(),
      DateOnly.from('2026-06-01'),
      opener,
      UtcInstant.from('2026-02-01T09:30:00Z'),
      'RESOLVE.SELF',
    ),
    /independent approval/i,
  );
});

test('M04S06-45-close-and-reopen-preserve-prior-resolution-history', () => {
  const resolved = inReview().resolveWithRule(
    equivalenceRule(),
    DateOnly.from('2026-06-01'),
    reviewer,
    UtcInstant.from('2026-02-01T09:30:00Z'),
    'RESOLVE.GOVERNED_RULE',
  );
  const closed = resolved.close(reviewer, UtcInstant.from('2026-02-01T09:35:00Z'), 'CLOSE.COMPLETE');
  const reopened = closed.reopen(reviewer, UtcInstant.from('2026-02-02T09:00:00Z'), 'REOPEN.NEW_FACT');
  assert.equal(reopened.status, RecognitionReviewCaseStatus.REOPENED);
  assert.equal(reopened.resolutionHistory.length, 1);
  assert.equal(reopened.activeResolution(), null);
});

test('M04S06-46-superseded-review-case-is-terminal', () => {
  const superseded = reviewCase().supersede(reviewer, UtcInstant.from('2026-02-01T09:10:00Z'), 'SUPERSEDE.REPLACED');
  assert.throws(
    () => superseded.supersede(reviewer, UtcInstant.from('2026-02-01T09:20:00Z'), 'SUPERSEDE.AGAIN'),
    /terminal/i,
  );
});

test('M04S06-47-review-transition-times-must-be-monotonic', () => {
  const triaged = reviewCase().triage(reviewer, UtcInstant.from('2026-02-01T09:10:00Z'), 'TRIAGE.ACCEPTED');
  assert.throws(
    () => triaged.beginReview(reviewer, UtcInstant.from('2026-02-01T09:05:00Z'), 'REVIEW.BAD_TIME'),
    /monotonic/i,
  );
});

test('M04S06-48-review-serialization-normalizes-non-semantic-input-order', () => {
  const left = reviewCase({
    sourceObjectIds: [IDS.route, IDS.equivalenceRule],
    factCodes: ['FACT.Z', 'FACT.A'],
  });
  const right = reviewCase({
    sourceObjectIds: [IDS.equivalenceRule, IDS.route],
    factCodes: ['FACT.A', 'FACT.Z'],
  });
  assert.equal(JSON.stringify(left.toJSON()), JSON.stringify(right.toJSON()));
});
