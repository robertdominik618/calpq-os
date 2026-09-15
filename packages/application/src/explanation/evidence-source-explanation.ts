import {
  DomainOutcome,
  EligibilityAssessment,
  EvidenceClass,
  EvidenceKind,
  EvidenceSnapshotEntry,
  SourceReference,
  SourceType,
  SubjectReference,
  UtcInstant,
  VerificationStateCode,
} from '../../../core/src/index.ts';
import { CredentialCardReadModel } from '../credential-card/credential-card-read-model.ts';

export const ExplanationViewSourceKind = {
  ELIGIBILITY_ASSESSMENT: 'ELIGIBILITY_ASSESSMENT',
} as const;
export type ExplanationViewSourceKind = (typeof ExplanationViewSourceKind)[keyof typeof ExplanationViewSourceKind];

export const WhyAffordanceKind = {
  WHY: 'WHY',
} as const;
export type WhyAffordanceKind = (typeof WhyAffordanceKind)[keyof typeof WhyAffordanceKind];

export const WhyTargetKind = {
  ELIGIBILITY: 'ELIGIBILITY',
} as const;
export type WhyTargetKind = (typeof WhyTargetKind)[keyof typeof WhyTargetKind];

function requiredText(value: string, label: string, max = 2048): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > max) throw new RangeError(`${label} is too long`);
  return normalized;
}

function subjectKey(subject: SubjectReference): string {
  return `${subject.kind}:${subject.id.toString()}`;
}

function explanationRootReference(assessmentId: string): string {
  return `calpq:explanation:eligibility:${assessmentId}`;
}

export class WhyAffordance {
  readonly kind = WhyAffordanceKind.WHY;
  readonly targetKind = WhyTargetKind.ELIGIBILITY;
  readonly labelKey = 'action.why';
  readonly explanationReference: string;
  readonly assessmentId: string;
  readonly decisionAuthority = false as const;

  private constructor(assessmentId: string) {
    this.assessmentId = requiredText(assessmentId, 'Why assessment id', 256);
    this.explanationReference = explanationRootReference(this.assessmentId);
    Object.freeze(this);
  }

  static forAssessment(assessmentId: string): WhyAffordance {
    return new WhyAffordance(assessmentId);
  }

  toJSON() {
    return {
      kind: this.kind,
      targetKind: this.targetKind,
      labelKey: this.labelKey,
      explanationReference: this.explanationReference,
      assessmentId: this.assessmentId,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class ExplanationReasonReadModel {
  readonly requirementId: string;
  readonly outcome: DomainOutcome;
  readonly reasonCodes: readonly string[];
  readonly traceReference: string;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly assessmentId: string;
    readonly requirementId: string;
    readonly outcome: DomainOutcome;
    readonly reasonCodes: readonly string[];
  }) {
    this.requirementId = requiredText(input.requirementId, 'Explanation requirement id', 256);
    this.outcome = input.outcome;
    this.reasonCodes = Object.freeze([...input.reasonCodes]);
    this.traceReference = `${explanationRootReference(input.assessmentId)}:requirement:${this.requirementId}`;
    Object.freeze(this);
  }

  static fromAssessmentResult(
    assessmentId: string,
    result: EligibilityAssessment['atomicResults'][number],
  ): ExplanationReasonReadModel {
    return new ExplanationReasonReadModel({
      assessmentId,
      requirementId: result.requirementId.toString(),
      outcome: result.outcome,
      reasonCodes: result.reasonCodes,
    });
  }

  toJSON() {
    return {
      requirementId: this.requirementId,
      outcome: this.outcome,
      reasonCodes: this.reasonCodes,
      traceReference: this.traceReference,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class ExplanationSourceReadModel {
  readonly sourceId: string;
  readonly authority: Readonly<ReturnType<SourceReference['authority']['toJSON']>>;
  readonly jurisdiction: Readonly<ReturnType<SourceReference['jurisdiction']['toJSON']>>;
  readonly sourceType: SourceType;
  readonly canonicalLocator: string | null;
  readonly version: string;
  readonly publicationDate: string | null;
  readonly effectiveFrom: string | null;
  readonly effectiveTo: string | null;
  readonly retrievedAt: string;
  readonly verificationState: string;
  readonly contentHash: string | null;
  readonly traceReference: string;
  readonly decisionAuthority = false as const;

  private constructor(assessmentId: string, source: SourceReference) {
    this.sourceId = source.id.toString();
    this.authority = Object.freeze(source.authority.toJSON());
    this.jurisdiction = Object.freeze(source.jurisdiction.toJSON());
    this.sourceType = source.sourceType;
    this.canonicalLocator = source.canonicalLocator;
    this.version = source.version.toString();
    this.publicationDate = source.publicationDate?.toString() ?? null;
    this.effectiveFrom = source.effectiveFrom?.toString() ?? null;
    this.effectiveTo = source.effectiveTo?.toString() ?? null;
    this.retrievedAt = source.retrievedAt.toString();
    this.verificationState = source.verificationState.toString();
    this.contentHash = source.contentHash?.toString() ?? null;
    this.traceReference = `${explanationRootReference(assessmentId)}:source:${this.sourceId}`;
    Object.freeze(this);
  }

  static fromSource(assessmentId: string, source: SourceReference): ExplanationSourceReadModel {
    if (!(source instanceof SourceReference)) throw new TypeError('Explanation source requires SourceReference');
    return new ExplanationSourceReadModel(assessmentId, source);
  }

  toJSON() {
    return {
      sourceId: this.sourceId,
      authority: this.authority,
      jurisdiction: this.jurisdiction,
      sourceType: this.sourceType,
      canonicalLocator: this.canonicalLocator,
      version: this.version,
      publicationDate: this.publicationDate,
      effectiveFrom: this.effectiveFrom,
      effectiveTo: this.effectiveTo,
      retrievedAt: this.retrievedAt,
      verificationState: this.verificationState,
      contentHash: this.contentHash,
      traceReference: this.traceReference,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class ExplanationEvidenceReadModel {
  readonly evidenceId: string;
  readonly evidenceClass: EvidenceClass;
  readonly evidenceKind: EvidenceKind;
  readonly contentReference: string;
  readonly contentHash: string | null;
  readonly verificationState: string;
  readonly sourceId: string | null;
  readonly sourceVersion: string | null;
  readonly traceReference: string;
  readonly decisionAuthority = false as const;

  private constructor(assessmentId: string, entry: EvidenceSnapshotEntry) {
    this.evidenceId = entry.evidenceId.toString();
    this.evidenceClass = entry.evidenceClass;
    this.evidenceKind = entry.evidenceKind;
    this.contentReference = entry.contentReference;
    this.contentHash = entry.contentHash?.toString() ?? null;
    this.verificationState = entry.verificationState.toString();
    this.sourceId = entry.sourceId?.toString() ?? null;
    this.sourceVersion = entry.sourceVersion?.toString() ?? null;
    this.traceReference = `${explanationRootReference(assessmentId)}:evidence:${this.evidenceId}`;
    Object.freeze(this);
  }

  static fromSnapshotEntry(assessmentId: string, entry: EvidenceSnapshotEntry): ExplanationEvidenceReadModel {
    if (!(entry instanceof EvidenceSnapshotEntry)) throw new TypeError('Explanation evidence requires EvidenceSnapshotEntry');
    return new ExplanationEvidenceReadModel(assessmentId, entry);
  }

  toJSON() {
    return {
      evidenceId: this.evidenceId,
      evidenceClass: this.evidenceClass,
      evidenceKind: this.evidenceKind,
      contentReference: this.contentReference,
      contentHash: this.contentHash,
      verificationState: this.verificationState,
      sourceId: this.sourceId,
      sourceVersion: this.sourceVersion,
      traceReference: this.traceReference,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class ExplanationProvenanceReadModel {
  readonly provenanceIdentity: string;
  readonly actor: Readonly<ReturnType<EligibilityAssessment['provenance']['actor']['toJSON']>>;
  readonly evaluator: Readonly<ReturnType<EligibilityAssessment['evaluator']['toJSON']>>;
  readonly evaluatedAt: UtcInstant;
  readonly ruleSetId: string;
  readonly ruleVersion: string;
  readonly sourceCount: number;
  readonly evidenceCount: number;
  readonly traceReference: string;
  readonly decisionAuthority = false as const;

  private constructor(assessment: EligibilityAssessment) {
    this.provenanceIdentity = assessment.provenance.identity.toString();
    this.actor = Object.freeze(assessment.provenance.actor.toJSON());
    this.evaluator = Object.freeze(assessment.evaluator.toJSON());
    this.evaluatedAt = assessment.provenance.evaluatedAt;
    this.ruleSetId = assessment.provenance.ruleSetId.toString();
    this.ruleVersion = assessment.provenance.ruleVersion.toString();
    this.sourceCount = assessment.provenance.sources.length;
    this.evidenceCount = assessment.evidenceSnapshot.entries.length;
    this.traceReference = `${explanationRootReference(assessment.id.toString())}:provenance:${this.provenanceIdentity}`;
    Object.freeze(this);
  }

  static fromAssessment(assessment: EligibilityAssessment): ExplanationProvenanceReadModel {
    if (!(assessment instanceof EligibilityAssessment)) throw new TypeError('Explanation provenance requires EligibilityAssessment');
    return new ExplanationProvenanceReadModel(assessment);
  }

  toJSON() {
    return {
      provenanceIdentity: this.provenanceIdentity,
      actor: this.actor,
      evaluator: this.evaluator,
      evaluatedAt: this.evaluatedAt.toString(),
      ruleSetId: this.ruleSetId,
      ruleVersion: this.ruleVersion,
      sourceCount: this.sourceCount,
      evidenceCount: this.evidenceCount,
      traceReference: this.traceReference,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class EvidenceSourceExplanationReadModel {
  readonly sourceKind = ExplanationViewSourceKind.ELIGIBILITY_ASSESSMENT;
  readonly subject: SubjectReference;
  readonly assessmentId: string;
  readonly credentialDefinitionId: string;
  readonly credentialDefinitionVersion: string;
  readonly requirementSetId: string;
  readonly requirementSetVersion: string;
  readonly eligibilityOutcome: DomainOutcome;
  readonly evaluatedAt: UtcInstant;
  readonly why: WhyAffordance;
  readonly reasons: readonly ExplanationReasonReadModel[];
  readonly sources: readonly ExplanationSourceReadModel[];
  readonly evidence: readonly ExplanationEvidenceReadModel[];
  readonly provenance: ExplanationProvenanceReadModel;
  readonly authorizationAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(card: CredentialCardReadModel, assessment: EligibilityAssessment) {
    this.subject = assessment.subject;
    this.assessmentId = assessment.id.toString();
    this.credentialDefinitionId = assessment.credentialDefinition.id.toString();
    this.credentialDefinitionVersion = assessment.credentialDefinition.version.toString();
    this.requirementSetId = assessment.requirementSetId.toString();
    this.requirementSetVersion = assessment.requirementSetVersion.toString();
    this.eligibilityOutcome = assessment.outcome;
    this.evaluatedAt = assessment.evaluatedAt;
    this.why = WhyAffordance.forAssessment(this.assessmentId);
    this.reasons = Object.freeze(assessment.atomicResults.map((result) =>
      ExplanationReasonReadModel.fromAssessmentResult(this.assessmentId, result)));
    this.sources = Object.freeze(assessment.provenance.sources.map((source) =>
      ExplanationSourceReadModel.fromSource(this.assessmentId, source)));
    this.evidence = Object.freeze(assessment.evidenceSnapshot.entries.map((entry) =>
      ExplanationEvidenceReadModel.fromSnapshotEntry(this.assessmentId, entry)));
    this.provenance = ExplanationProvenanceReadModel.fromAssessment(assessment);

    if (card.authorizationAuthority !== false) {
      throw new TypeError('Explanation card source must remain non-authoritative');
    }
    Object.freeze(this);
  }

  static compose(input: {
    readonly card: CredentialCardReadModel;
    readonly assessment: EligibilityAssessment;
  }): EvidenceSourceExplanationReadModel {
    if (!(input.card instanceof CredentialCardReadModel)) {
      throw new TypeError('Explanation requires CredentialCardReadModel');
    }
    if (!(input.assessment instanceof EligibilityAssessment)) {
      throw new TypeError('Explanation requires EligibilityAssessment');
    }

    const assessment = input.assessment;
    const card = input.card;
    const identityMatches =
      subjectKey(card.subject) === subjectKey(assessment.subject)
      && card.assessmentId === assessment.id.toString()
      && card.credentialDefinitionId === assessment.credentialDefinition.id.toString()
      && card.credentialDefinitionVersion === assessment.credentialDefinition.version.toString()
      && card.requirementSetId === assessment.requirementSetId.toString()
      && card.requirementSetVersion === assessment.requirementSetVersion.toString()
      && card.eligibility.outcome === assessment.outcome
      && card.eligibility.evaluatedAt.toString() === assessment.evaluatedAt.toString();

    if (!identityMatches) {
      throw new TypeError('Explanation assessment must exactly match Credential Card eligibility identity and versions');
    }

    return new EvidenceSourceExplanationReadModel(card, assessment);
  }

  toJSON() {
    return {
      sourceKind: this.sourceKind,
      subject: this.subject.toJSON(),
      assessmentId: this.assessmentId,
      credentialDefinitionId: this.credentialDefinitionId,
      credentialDefinitionVersion: this.credentialDefinitionVersion,
      requirementSetId: this.requirementSetId,
      requirementSetVersion: this.requirementSetVersion,
      eligibilityOutcome: this.eligibilityOutcome,
      evaluatedAt: this.evaluatedAt.toString(),
      authorizationAuthority: this.authorizationAuthority,
      decisionAuthority: this.decisionAuthority,
      why: this.why.toJSON(),
      reasons: this.reasons.map((item) => item.toJSON()),
      sources: this.sources.map((item) => item.toJSON()),
      evidence: this.evidence.map((item) => item.toJSON()),
      provenance: this.provenance.toJSON(),
    } as const;
  }
}
