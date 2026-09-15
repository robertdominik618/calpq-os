import {
  EligibilityAssessment,
  SubjectReference,
  UtcInstant,
} from '../../../core/src/index.ts';
import {
  CredentialEvidenceExplanation,
  CredentialExplanationReadModel,
  CredentialRequirementReasonExplanation,
  CredentialSourceExplanation,
} from '../explanation/credential-explanation-read-model.ts';
import {
  DocumentIntakeRecord,
  IntakeCorrectionRecord,
} from '../intake/document-intake.ts';
import {
  ProfessionalPassportProjection,
} from '../passport/professional-passport.ts';

export const ActivityTimelineEventKind = {
  DOCUMENT_RECEIVED: 'DOCUMENT_RECEIVED',
  DOCUMENT_CORRECTED: 'DOCUMENT_CORRECTED',
  VERIFICATION_RECORDED: 'VERIFICATION_RECORDED',
  ELIGIBILITY_EVALUATED: 'ELIGIBILITY_EVALUATED',
} as const;
export type ActivityTimelineEventKind =
  (typeof ActivityTimelineEventKind)[keyof typeof ActivityTimelineEventKind];

export const ActivityTimelineSourceKind = {
  DOCUMENT_INTAKE_RECORD: 'DOCUMENT_INTAKE_RECORD',
  INTAKE_CORRECTION_RECORD: 'INTAKE_CORRECTION_RECORD',
  PROFESSIONAL_PASSPORT_ITEM: 'PROFESSIONAL_PASSPORT_ITEM',
  ELIGIBILITY_ASSESSMENT: 'ELIGIBILITY_ASSESSMENT',
} as const;
export type ActivityTimelineSourceKind =
  (typeof ActivityTimelineSourceKind)[keyof typeof ActivityTimelineSourceKind];

export const ActivityTimelineActorRole = {
  RECEIVED_BY: 'RECEIVED_BY',
  CORRECTED_BY: 'CORRECTED_BY',
  VERIFIER: 'VERIFIER',
  REVIEWER: 'REVIEWER',
  EVALUATOR: 'EVALUATOR',
} as const;
export type ActivityTimelineActorRole =
  (typeof ActivityTimelineActorRole)[keyof typeof ActivityTimelineActorRole];

export const ActivityTimelineReferenceKind = {
  INTAKE: 'INTAKE',
  EVIDENCE: 'EVIDENCE',
  ORIGINAL_EVIDENCE: 'ORIGINAL_EVIDENCE',
  CORRECTION_EVIDENCE: 'CORRECTION_EVIDENCE',
  ASSESSMENT: 'ASSESSMENT',
  CREDENTIAL_DEFINITION: 'CREDENTIAL_DEFINITION',
  REQUIREMENT_SET: 'REQUIREMENT_SET',
  DECISION_PROVENANCE: 'DECISION_PROVENANCE',
} as const;
export type ActivityTimelineReferenceKind =
  (typeof ActivityTimelineReferenceKind)[keyof typeof ActivityTimelineReferenceKind];

export const ActivityTimelineOmissionReason = {
  VERIFICATION_EVENT_TIME_NOT_AVAILABLE: 'VERIFICATION_EVENT_TIME_NOT_AVAILABLE',
} as const;
export type ActivityTimelineOmissionReason =
  (typeof ActivityTimelineOmissionReason)[keyof typeof ActivityTimelineOmissionReason];

export const ActivityTimelineOrdering = {
  OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK: 'OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK',
} as const;
export type ActivityTimelineOrdering =
  (typeof ActivityTimelineOrdering)[keyof typeof ActivityTimelineOrdering];

const KIND_RANK: Readonly<Record<ActivityTimelineEventKind, number>> = Object.freeze({
  [ActivityTimelineEventKind.DOCUMENT_RECEIVED]: 1,
  [ActivityTimelineEventKind.DOCUMENT_CORRECTED]: 2,
  [ActivityTimelineEventKind.VERIFICATION_RECORDED]: 3,
  [ActivityTimelineEventKind.ELIGIBILITY_EVALUATED]: 4,
});

function subjectKey(subject: SubjectReference): string {
  return `${subject.kind}:${subject.id.toString()}`;
}

function compareText(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function freezeArray<T>(items: readonly T[]): readonly T[] {
  return Object.freeze([...items]);
}

export class ActivityTimelineReference {
  readonly kind: ActivityTimelineReferenceKind;
  readonly id: string;

  private constructor(kind: ActivityTimelineReferenceKind, id: string) {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new TypeError('Activity timeline reference id must be non-empty text');
    }
    this.kind = kind;
    this.id = id.trim();
    Object.freeze(this);
  }

  static create(kind: ActivityTimelineReferenceKind, id: string): ActivityTimelineReference {
    return new ActivityTimelineReference(kind, id);
  }

  toJSON() {
    return { kind: this.kind, id: this.id } as const;
  }
}

export class ActivityTimelineActorAttribution {
  readonly role: ActivityTimelineActorRole;
  readonly actor: unknown;

  private constructor(role: ActivityTimelineActorRole, actor: unknown) {
    this.role = role;
    this.actor = Object.freeze(actor as object);
    Object.freeze(this);
  }

  static fromActor(
    role: ActivityTimelineActorRole,
    actor: { toJSON(): unknown },
  ): ActivityTimelineActorAttribution {
    if (actor === null || typeof actor !== 'object' || typeof actor.toJSON !== 'function') {
      throw new TypeError('Activity timeline actor attribution requires a governed actor reference');
    }
    return new ActivityTimelineActorAttribution(role, actor.toJSON());
  }

  toJSON() {
    return { role: this.role, actor: this.actor } as const;
  }
}

export interface ActivityTimelineEventInput {
  readonly eventId: string;
  readonly kind: ActivityTimelineEventKind;
  readonly sourceKind: ActivityTimelineSourceKind;
  readonly occurredAt: UtcInstant;
  readonly actorAttributions?: readonly ActivityTimelineActorAttribution[];
  readonly references?: readonly ActivityTimelineReference[];
  readonly reasonCodes?: readonly string[];
  readonly details?: Readonly<Record<string, string | null>>;
}

export class ActivityTimelineEvent {
  readonly eventId: string;
  readonly kind: ActivityTimelineEventKind;
  readonly sourceKind: ActivityTimelineSourceKind;
  readonly occurredAt: UtcInstant;
  readonly actorAttributions: readonly ActivityTimelineActorAttribution[];
  readonly references: readonly ActivityTimelineReference[];
  readonly reasonCodes: readonly string[];
  readonly details: Readonly<Record<string, string | null>>;
  readonly decisionAuthority = false as const;

  private constructor(input: ActivityTimelineEventInput) {
    if (typeof input.eventId !== 'string' || input.eventId.trim().length === 0) {
      throw new TypeError('Activity timeline event id must be non-empty text');
    }
    if (!(input.occurredAt instanceof UtcInstant)) {
      throw new TypeError('Activity timeline event requires explicit governed UtcInstant');
    }
    this.eventId = input.eventId.trim();
    this.kind = input.kind;
    this.sourceKind = input.sourceKind;
    this.occurredAt = input.occurredAt;
    this.actorAttributions = freezeArray(input.actorAttributions ?? []);
    this.references = freezeArray(input.references ?? []);
    this.reasonCodes = freezeArray(input.reasonCodes ?? []);
    this.details = Object.freeze({ ...(input.details ?? {}) });
    Object.freeze(this);
  }

  static create(input: ActivityTimelineEventInput): ActivityTimelineEvent {
    return new ActivityTimelineEvent(input);
  }

  toJSON() {
    return {
      eventId: this.eventId,
      kind: this.kind,
      sourceKind: this.sourceKind,
      occurredAt: this.occurredAt.toString(),
      actorAttributions: this.actorAttributions.map((actor) => actor.toJSON()),
      references: this.references.map((reference) => reference.toJSON()),
      reasonCodes: this.reasonCodes,
      details: this.details,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class ActivityTimelineOmission {
  readonly sourceKind: ActivityTimelineSourceKind;
  readonly sourceReference: string;
  readonly reasonCode: ActivityTimelineOmissionReason;
  readonly decisionAuthority = false as const;

  private constructor(
    sourceKind: ActivityTimelineSourceKind,
    sourceReference: string,
    reasonCode: ActivityTimelineOmissionReason,
  ) {
    this.sourceKind = sourceKind;
    this.sourceReference = sourceReference;
    this.reasonCode = reasonCode;
    Object.freeze(this);
  }

  static verificationWithoutTimestamp(evidenceId: string): ActivityTimelineOmission {
    return new ActivityTimelineOmission(
      ActivityTimelineSourceKind.PROFESSIONAL_PASSPORT_ITEM,
      evidenceId,
      ActivityTimelineOmissionReason.VERIFICATION_EVENT_TIME_NOT_AVAILABLE,
    );
  }

  toJSON() {
    return {
      sourceKind: this.sourceKind,
      sourceReference: this.sourceReference,
      reasonCode: this.reasonCode,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export class DecisionProvenancePresentation {
  readonly assessmentId: string;
  readonly decisionIdentity: string;
  readonly outcome: string;
  readonly evaluatedAt: UtcInstant;
  readonly evaluator: unknown;
  readonly ruleSetId: string;
  readonly ruleVersion: string;
  readonly sources: readonly CredentialSourceExplanation[];
  readonly evidence: readonly CredentialEvidenceExplanation[];
  readonly requirementReasons: readonly CredentialRequirementReasonExplanation[];
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly assessment: EligibilityAssessment;
    readonly explanation: CredentialExplanationReadModel;
  }) {
    this.assessmentId = input.assessment.id.toString();
    this.decisionIdentity = input.assessment.provenance.identity.toString();
    this.outcome = input.assessment.outcome;
    this.evaluatedAt = input.assessment.evaluatedAt;
    this.evaluator = Object.freeze(input.assessment.evaluator.toJSON());
    this.ruleSetId = input.assessment.provenance.ruleSetId.toString();
    this.ruleVersion = input.assessment.provenance.ruleVersion.toString();
    this.sources = freezeArray(input.explanation.eligibility.sources);
    this.evidence = freezeArray(input.explanation.eligibility.evidence);
    this.requirementReasons = freezeArray(input.explanation.eligibility.requirementReasons);
    Object.freeze(this);
  }

  static compose(input: {
    readonly assessment: EligibilityAssessment;
    readonly explanation: CredentialExplanationReadModel;
  }): DecisionProvenancePresentation {
    if (!(input.assessment instanceof EligibilityAssessment)) {
      throw new TypeError('Decision provenance requires authoritative EligibilityAssessment');
    }
    if (!(input.explanation instanceof CredentialExplanationReadModel)) {
      throw new TypeError('Decision provenance requires governed CredentialExplanationReadModel');
    }
    if (input.explanation.authorizationAuthority !== false || input.explanation.decisionAuthority !== false) {
      throw new TypeError('Decision provenance presentation input must remain non-authoritative');
    }
    if (input.explanation.assessmentId !== input.assessment.id.toString()) {
      throw new TypeError('Decision provenance assessment identity mismatch');
    }
    if (input.explanation.provenanceIdentity !== input.assessment.provenance.identity.toString()) {
      throw new TypeError('Decision provenance identity mismatch');
    }
    if (input.explanation.evaluatedAt !== input.assessment.evaluatedAt.toString()) {
      throw new TypeError('Decision provenance evaluation instant mismatch');
    }
    if (input.explanation.ruleSetId !== input.assessment.provenance.ruleSetId.toString() ||
        input.explanation.ruleVersion !== input.assessment.provenance.ruleVersion.toString()) {
      throw new TypeError('Decision provenance rule binding mismatch');
    }
    if (input.explanation.eligibility.reasonCode !== 'ELIGIBILITY_PRESENTED_FROM_AUTHORITATIVE_ASSESSMENT') {
      throw new TypeError('Decision provenance requires authoritative eligibility explanation binding');
    }

    const sourceIds = input.assessment.provenance.sources.map((source) => source.id.toString());
    const explanationSourceIds = input.explanation.eligibility.sources.map((source) => source.sourceId);
    if (sourceIds.length !== explanationSourceIds.length || sourceIds.some((id, index) => id !== explanationSourceIds[index])) {
      throw new TypeError('Decision provenance source-reference mismatch');
    }
    const evidenceIds = input.assessment.provenance.evidence.map((evidence) => evidence.id.toString());
    const explanationEvidenceIds = input.explanation.eligibility.evidence.map((evidence) => evidence.evidenceId);
    if (evidenceIds.length !== explanationEvidenceIds.length || evidenceIds.some((id, index) => id !== explanationEvidenceIds[index])) {
      throw new TypeError('Decision provenance evidence-reference mismatch');
    }

    return new DecisionProvenancePresentation(input);
  }

  toJSON() {
    return {
      assessmentId: this.assessmentId,
      decisionIdentity: this.decisionIdentity,
      outcome: this.outcome,
      evaluatedAt: this.evaluatedAt.toString(),
      evaluator: this.evaluator,
      ruleSetId: this.ruleSetId,
      ruleVersion: this.ruleVersion,
      sources: this.sources.map((source) => source.toJSON()),
      evidence: this.evidence.map((evidence) => evidence.toJSON()),
      requirementReasons: this.requirementReasons.map((reason) => reason.toJSON()),
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}

export interface ActivityTimelineReadModelInput {
  readonly explanation: CredentialExplanationReadModel;
  readonly passport: ProfessionalPassportProjection;
  readonly assessment: EligibilityAssessment;
  readonly intakes?: readonly DocumentIntakeRecord[];
  readonly corrections?: readonly IntakeCorrectionRecord[];
}

export class ActivityTimelineReadModel {
  readonly subject: SubjectReference;
  readonly assessmentId: string;
  readonly decisionProvenanceIdentity: string;
  readonly ordering = ActivityTimelineOrdering.OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK;
  readonly events: readonly ActivityTimelineEvent[];
  readonly omissions: readonly ActivityTimelineOmission[];
  readonly decisionProvenance: DecisionProvenancePresentation;
  readonly authorizationAuthority = false as const;
  readonly decisionAuthority = false as const;

  private constructor(input: {
    readonly subject: SubjectReference;
    readonly assessmentId: string;
    readonly decisionProvenanceIdentity: string;
    readonly events: readonly ActivityTimelineEvent[];
    readonly omissions: readonly ActivityTimelineOmission[];
    readonly decisionProvenance: DecisionProvenancePresentation;
  }) {
    this.subject = input.subject;
    this.assessmentId = input.assessmentId;
    this.decisionProvenanceIdentity = input.decisionProvenanceIdentity;
    this.events = freezeArray(input.events);
    this.omissions = freezeArray(input.omissions);
    this.decisionProvenance = input.decisionProvenance;
    Object.freeze(this);
  }

  static compose(input: ActivityTimelineReadModelInput): ActivityTimelineReadModel {
    if (!(input.explanation instanceof CredentialExplanationReadModel)) {
      throw new TypeError('Activity timeline requires CredentialExplanationReadModel');
    }
    if (!(input.passport instanceof ProfessionalPassportProjection)) {
      throw new TypeError('Activity timeline requires ProfessionalPassportProjection');
    }
    if (!(input.assessment instanceof EligibilityAssessment)) {
      throw new TypeError('Activity timeline requires authoritative EligibilityAssessment');
    }
    if (input.explanation.authorizationAuthority !== false || input.explanation.decisionAuthority !== false ||
        input.passport.authorizationAuthority !== false) {
      throw new TypeError('Activity timeline accepts only non-authoritative presentation inputs');
    }

    const subject = input.assessment.subject;
    const key = subjectKey(subject);
    if (subjectKey(input.explanation.subject) !== key || subjectKey(input.passport.subject) !== key) {
      throw new TypeError('Activity timeline inputs must belong to the same subject');
    }
    if (input.explanation.assessmentId !== input.assessment.id.toString() ||
        input.passport.assessmentId !== input.assessment.id.toString()) {
      throw new TypeError('Activity timeline assessment identity mismatch');
    }
    if (input.explanation.provenanceIdentity !== input.assessment.provenance.identity.toString()) {
      throw new TypeError('Activity timeline decision provenance mismatch');
    }
    if (input.passport.authoritativeEvaluatedAt.toString() !== input.assessment.evaluatedAt.toString() ||
        input.explanation.evaluatedAt !== input.assessment.evaluatedAt.toString()) {
      throw new TypeError('Activity timeline authoritative evaluation instant mismatch');
    }
    if (input.passport.eligibilityOutcome !== input.assessment.outcome) {
      throw new TypeError('Activity timeline must preserve authoritative eligibility outcome');
    }

    const intakes = input.intakes ?? [];
    const corrections = input.corrections ?? [];
    if (!Array.isArray(intakes) || intakes.some((record) => !(record instanceof DocumentIntakeRecord))) {
      throw new TypeError('Activity timeline intakes must use DocumentIntakeRecord');
    }
    if (!Array.isArray(corrections) || corrections.some((record) => !(record instanceof IntakeCorrectionRecord))) {
      throw new TypeError('Activity timeline corrections must use IntakeCorrectionRecord');
    }

    const intakeById = new Map<string, DocumentIntakeRecord>();
    for (const intake of intakes) {
      if (intake.subject === null) {
        throw new TypeError('Activity timeline document intake must be explicitly bound to the timeline subject');
      }
      if (subjectKey(intake.subject) !== key) {
        throw new TypeError('Activity timeline must not include another subject document intake');
      }
      const intakeId = intake.id.toString();
      if (intakeById.has(intakeId)) {
        throw new TypeError(`Activity timeline duplicate intake record: ${intakeId}`);
      }
      intakeById.set(intakeId, intake);
    }

    for (const correction of corrections) {
      if (!intakeById.has(correction.intakeId.toString())) {
        throw new TypeError('Activity timeline correction must reference an admitted subject intake');
      }
    }

    const provenanceIdentity = input.assessment.provenance.identity.toString();
    for (const item of input.passport.items) {
      if (item.provenanceIdentity.toString() !== provenanceIdentity) {
        throw new TypeError('Activity timeline Passport item provenance mismatch');
      }
      if (item.verifiedAt !== null && item.verifier === null) {
        throw new TypeError('Activity timeline verified event requires governed verifier attribution');
      }
      if (item.verifiedAt !== null && item.verificationRecordState === null) {
        throw new TypeError('Activity timeline verified event requires verification record state');
      }
    }

    const decisionProvenance = DecisionProvenancePresentation.compose({
      assessment: input.assessment,
      explanation: input.explanation,
    });

    const events: ActivityTimelineEvent[] = [];
    const omissions: ActivityTimelineOmission[] = [];

    for (const intake of intakes) {
      events.push(ActivityTimelineEvent.create({
        eventId: `document-received:${intake.id.toString()}`,
        kind: ActivityTimelineEventKind.DOCUMENT_RECEIVED,
        sourceKind: ActivityTimelineSourceKind.DOCUMENT_INTAKE_RECORD,
        occurredAt: intake.receivedAt,
        actorAttributions: [ActivityTimelineActorAttribution.fromActor(
          ActivityTimelineActorRole.RECEIVED_BY,
          intake.receivedBy,
        )],
        references: [
          ActivityTimelineReference.create(ActivityTimelineReferenceKind.INTAKE, intake.id.toString()),
          ActivityTimelineReference.create(ActivityTimelineReferenceKind.EVIDENCE, intake.originalArtifact.id.toString()),
        ],
        details: {
          sourceChannel: intake.sourceChannel,
          mediaType: intake.media.mediaType,
        },
      }));
    }

    for (const correction of corrections) {
      events.push(ActivityTimelineEvent.create({
        eventId: `document-corrected:${correction.intakeId.toString()}:${correction.correctionEvidence.id.toString()}`,
        kind: ActivityTimelineEventKind.DOCUMENT_CORRECTED,
        sourceKind: ActivityTimelineSourceKind.INTAKE_CORRECTION_RECORD,
        occurredAt: correction.correctedAt,
        actorAttributions: [ActivityTimelineActorAttribution.fromActor(
          ActivityTimelineActorRole.CORRECTED_BY,
          correction.correctedBy,
        )],
        references: [
          ActivityTimelineReference.create(ActivityTimelineReferenceKind.INTAKE, correction.intakeId.toString()),
          ActivityTimelineReference.create(ActivityTimelineReferenceKind.ORIGINAL_EVIDENCE, correction.originalEvidenceId.toString()),
          ActivityTimelineReference.create(ActivityTimelineReferenceKind.CORRECTION_EVIDENCE, correction.correctionEvidence.id.toString()),
        ],
        details: { reason: correction.reason },
      }));
    }

    for (const item of input.passport.items) {
      const evidenceId = item.evidenceId.toString();
      if (item.verifiedAt === null) {
        omissions.push(ActivityTimelineOmission.verificationWithoutTimestamp(evidenceId));
        continue;
      }
      const actors: ActivityTimelineActorAttribution[] = [];
      if (item.verifier !== null) {
        actors.push(ActivityTimelineActorAttribution.fromActor(ActivityTimelineActorRole.VERIFIER, item.verifier));
      }
      if (item.reviewer !== null) {
        actors.push(ActivityTimelineActorAttribution.fromActor(ActivityTimelineActorRole.REVIEWER, item.reviewer));
      }
      events.push(ActivityTimelineEvent.create({
        eventId: `verification-recorded:${evidenceId}:${provenanceIdentity}`,
        kind: ActivityTimelineEventKind.VERIFICATION_RECORDED,
        sourceKind: ActivityTimelineSourceKind.PROFESSIONAL_PASSPORT_ITEM,
        occurredAt: item.verifiedAt,
        actorAttributions: actors,
        references: [
          ActivityTimelineReference.create(ActivityTimelineReferenceKind.EVIDENCE, evidenceId),
          ActivityTimelineReference.create(ActivityTimelineReferenceKind.DECISION_PROVENANCE, provenanceIdentity),
        ],
        details: {
          verificationStatus: item.verificationStatus,
          verificationRecordState: item.verificationRecordState,
          verificationMethod: item.verificationMethod,
          sourceVersion: item.sourceVersion,
          verificationSourceVersion: item.verificationSourceVersion,
        },
      }));
    }

    const assessmentReasonCodes = input.assessment.atomicResults.flatMap((result) => result.reasonCodes);
    events.push(ActivityTimelineEvent.create({
      eventId: `eligibility-evaluated:${input.assessment.id.toString()}:${provenanceIdentity}`,
      kind: ActivityTimelineEventKind.ELIGIBILITY_EVALUATED,
      sourceKind: ActivityTimelineSourceKind.ELIGIBILITY_ASSESSMENT,
      occurredAt: input.assessment.evaluatedAt,
      actorAttributions: [ActivityTimelineActorAttribution.fromActor(
        ActivityTimelineActorRole.EVALUATOR,
        input.assessment.evaluator,
      )],
      references: [
        ActivityTimelineReference.create(ActivityTimelineReferenceKind.ASSESSMENT, input.assessment.id.toString()),
        ActivityTimelineReference.create(ActivityTimelineReferenceKind.CREDENTIAL_DEFINITION, input.assessment.credentialDefinition.id.toString()),
        ActivityTimelineReference.create(ActivityTimelineReferenceKind.REQUIREMENT_SET, input.assessment.requirementSetId.toString()),
        ActivityTimelineReference.create(ActivityTimelineReferenceKind.DECISION_PROVENANCE, provenanceIdentity),
      ],
      reasonCodes: assessmentReasonCodes,
      details: {
        outcome: input.assessment.outcome,
        ruleSetId: input.assessment.provenance.ruleSetId.toString(),
        ruleVersion: input.assessment.provenance.ruleVersion.toString(),
      },
    }));

    events.sort((left, right) => {
      const timeOrder = right.occurredAt.toEpochMilliseconds() - left.occurredAt.toEpochMilliseconds();
      if (timeOrder !== 0) return timeOrder;
      const kindOrder = KIND_RANK[right.kind] - KIND_RANK[left.kind];
      if (kindOrder !== 0) return kindOrder;
      return compareText(left.eventId, right.eventId);
    });
    omissions.sort((left, right) => compareText(left.sourceReference, right.sourceReference));

    return new ActivityTimelineReadModel({
      subject,
      assessmentId: input.assessment.id.toString(),
      decisionProvenanceIdentity: provenanceIdentity,
      events,
      omissions,
      decisionProvenance,
    });
  }

  toJSON() {
    return {
      subject: this.subject.toJSON(),
      assessmentId: this.assessmentId,
      decisionProvenanceIdentity: this.decisionProvenanceIdentity,
      ordering: this.ordering,
      events: this.events.map((event) => event.toJSON()),
      omissions: this.omissions.map((omission) => omission.toJSON()),
      decisionProvenance: this.decisionProvenance.toJSON(),
      authorizationAuthority: this.authorizationAuthority,
      decisionAuthority: this.decisionAuthority,
    } as const;
  }
}
