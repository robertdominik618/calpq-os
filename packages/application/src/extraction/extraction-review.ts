import {
  ActorReference,
  UtcInstant,
} from '../../../core/src/index.ts';
import {
  DerivedExtractionProposalRecord,
  ExtractionFieldProposal,
} from './derived-extraction-proposal.ts';
import type { ExtractionProposalScalar } from './derived-extraction-proposal.ts';

const MAX_REASON_LENGTH = 1024;
const MAX_CORRECTED_TEXT_LENGTH = 4096;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function normalizeReason(value: string, label = 'Review reason'): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > MAX_REASON_LENGTH) throw new RangeError(`${label} is too long`);
  if (CONTROL_CHARACTER_PATTERN.test(normalized)) throw new TypeError(`${label} must not contain control characters`);
  return normalized;
}

function validateCorrectedValue(value: unknown): ExtractionProposalScalar {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Corrected numeric value must be finite');
    return value;
  }
  if (typeof value === 'string') {
    if (value.length > MAX_CORRECTED_TEXT_LENGTH) throw new RangeError('Corrected text is too long');
    if (CONTROL_CHARACTER_PATTERN.test(value)) throw new TypeError('Corrected text must not contain control characters');
    return value;
  }
  throw new TypeError('Corrected value must be a JSON-safe scalar');
}

export const ExtractionReviewState = {
  PROPOSED: 'PROPOSED',
  USER_CONFIRMED: 'USER_CONFIRMED',
  USER_CORRECTED: 'USER_CORRECTED',
  REJECTED: 'REJECTED',
  HUMAN_REVIEW_REQUIRED: 'HUMAN_REVIEW_REQUIRED',
} as const;
export type ExtractionReviewState = (typeof ExtractionReviewState)[keyof typeof ExtractionReviewState];
const REVIEW_STATES = new Set<string>(Object.values(ExtractionReviewState));

export const ExtractionReviewActorRole = {
  USER: 'USER',
  REVIEWER: 'REVIEWER',
} as const;
export type ExtractionReviewActorRole = (typeof ExtractionReviewActorRole)[keyof typeof ExtractionReviewActorRole];
const ACTOR_ROLES = new Set<string>(Object.values(ExtractionReviewActorRole));

export const ExtractionFieldReviewDisposition = {
  CONFIRMED: 'CONFIRMED',
  CORRECTED: 'CORRECTED',
  REJECTED: 'REJECTED',
  HUMAN_REVIEW_REQUIRED: 'HUMAN_REVIEW_REQUIRED',
} as const;
export type ExtractionFieldReviewDisposition = (typeof ExtractionFieldReviewDisposition)[keyof typeof ExtractionFieldReviewDisposition];
const FIELD_DISPOSITIONS = new Set<string>(Object.values(ExtractionFieldReviewDisposition));

export class ExtractionFieldReviewDecision {
  readonly fieldProposal: ExtractionFieldProposal;
  readonly disposition: ExtractionFieldReviewDisposition;
  readonly hasCorrectedValue: boolean;
  readonly correctedValue: ExtractionProposalScalar | null;
  readonly reason: string | null;

  private constructor(input: {
    readonly fieldProposal: ExtractionFieldProposal;
    readonly disposition: ExtractionFieldReviewDisposition;
    readonly hasCorrectedValue: boolean;
    readonly correctedValue: ExtractionProposalScalar | null;
    readonly reason: string | null;
  }) {
    this.fieldProposal = input.fieldProposal;
    this.disposition = input.disposition;
    this.hasCorrectedValue = input.hasCorrectedValue;
    this.correctedValue = input.correctedValue;
    this.reason = input.reason;
    Object.freeze(this);
  }

  static confirmed(input: {
    readonly fieldProposal: ExtractionFieldProposal;
    readonly reason?: string | null;
  }): ExtractionFieldReviewDecision {
    ExtractionFieldReviewDecision.requireField(input.fieldProposal);
    return new ExtractionFieldReviewDecision({
      fieldProposal: input.fieldProposal,
      disposition: ExtractionFieldReviewDisposition.CONFIRMED,
      hasCorrectedValue: false,
      correctedValue: null,
      reason: input.reason == null ? null : normalizeReason(input.reason, 'Field confirmation reason'),
    });
  }

  static corrected(input: {
    readonly fieldProposal: ExtractionFieldProposal;
    readonly correctedValue: ExtractionProposalScalar;
    readonly reason: string;
  }): ExtractionFieldReviewDecision {
    ExtractionFieldReviewDecision.requireField(input.fieldProposal);
    return new ExtractionFieldReviewDecision({
      fieldProposal: input.fieldProposal,
      disposition: ExtractionFieldReviewDisposition.CORRECTED,
      hasCorrectedValue: true,
      correctedValue: validateCorrectedValue(input.correctedValue),
      reason: normalizeReason(input.reason, 'Field correction reason'),
    });
  }

  static rejected(input: {
    readonly fieldProposal: ExtractionFieldProposal;
    readonly reason: string;
  }): ExtractionFieldReviewDecision {
    ExtractionFieldReviewDecision.requireField(input.fieldProposal);
    return new ExtractionFieldReviewDecision({
      fieldProposal: input.fieldProposal,
      disposition: ExtractionFieldReviewDisposition.REJECTED,
      hasCorrectedValue: false,
      correctedValue: null,
      reason: normalizeReason(input.reason, 'Field rejection reason'),
    });
  }

  static humanReviewRequired(input: {
    readonly fieldProposal: ExtractionFieldProposal;
    readonly reason: string;
  }): ExtractionFieldReviewDecision {
    ExtractionFieldReviewDecision.requireField(input.fieldProposal);
    return new ExtractionFieldReviewDecision({
      fieldProposal: input.fieldProposal,
      disposition: ExtractionFieldReviewDisposition.HUMAN_REVIEW_REQUIRED,
      hasCorrectedValue: false,
      correctedValue: null,
      reason: normalizeReason(input.reason, 'Field human-review reason'),
    });
  }

  private static requireField(value: ExtractionFieldProposal): void {
    if (!(value instanceof ExtractionFieldProposal)) {
      throw new TypeError('Field review decision requires ExtractionFieldProposal');
    }
  }

  toJSON() {
    return Object.freeze({
      fieldPath: this.fieldProposal.fieldPath,
      proposedValue: this.fieldProposal.proposedValue,
      disposition: this.disposition,
      hasCorrectedValue: this.hasCorrectedValue,
      correctedValue: this.correctedValue,
      reason: this.reason,
    });
  }
}

function canonicalDecisionKey(decision: ExtractionFieldReviewDecision): string {
  return JSON.stringify(decision.toJSON());
}

function validateRevisionState(
  state: ExtractionReviewState,
  decisions: readonly ExtractionFieldReviewDecision[],
): void {
  if (!REVIEW_STATES.has(state)) throw new TypeError('Extraction review state must be controlled');
  if (state === ExtractionReviewState.PROPOSED) {
    throw new TypeError('PROPOSED is the implicit initial history state and cannot be appended as a revision');
  }

  if (state === ExtractionReviewState.USER_CONFIRMED) {
    if (decisions.some((decision) => decision.disposition !== ExtractionFieldReviewDisposition.CONFIRMED)) {
      throw new TypeError('USER_CONFIRMED revision may contain only CONFIRMED field decisions');
    }
    return;
  }

  if (state === ExtractionReviewState.USER_CORRECTED) {
    if (!decisions.some((decision) => decision.disposition === ExtractionFieldReviewDisposition.CORRECTED)) {
      throw new TypeError('USER_CORRECTED revision requires at least one CORRECTED field decision');
    }
    if (decisions.some((decision) =>
      decision.disposition !== ExtractionFieldReviewDisposition.CONFIRMED &&
      decision.disposition !== ExtractionFieldReviewDisposition.CORRECTED
    )) {
      throw new TypeError('USER_CORRECTED revision may contain only CONFIRMED or CORRECTED field decisions');
    }
    return;
  }

  if (state === ExtractionReviewState.REJECTED) {
    if (decisions.some((decision) => decision.disposition !== ExtractionFieldReviewDisposition.REJECTED)) {
      throw new TypeError('REJECTED revision may contain only REJECTED field decisions');
    }
    return;
  }

  if (state === ExtractionReviewState.HUMAN_REVIEW_REQUIRED) {
    if (decisions.some((decision) => decision.disposition !== ExtractionFieldReviewDisposition.HUMAN_REVIEW_REQUIRED)) {
      throw new TypeError('HUMAN_REVIEW_REQUIRED revision may contain only HUMAN_REVIEW_REQUIRED field decisions');
    }
  }
}

export class ExtractionReviewRevision {
  readonly proposal: DerivedExtractionProposalRecord;
  readonly revisionNumber: number;
  readonly state: Exclude<ExtractionReviewState, typeof ExtractionReviewState.PROPOSED>;
  readonly reviewedBy: ActorReference;
  readonly actorRole: ExtractionReviewActorRole;
  readonly reviewedAt: UtcInstant;
  readonly reason: string;
  readonly fieldDecisions: readonly ExtractionFieldReviewDecision[];

  private constructor(input: {
    readonly proposal: DerivedExtractionProposalRecord;
    readonly revisionNumber: number;
    readonly state: Exclude<ExtractionReviewState, typeof ExtractionReviewState.PROPOSED>;
    readonly reviewedBy: ActorReference;
    readonly actorRole: ExtractionReviewActorRole;
    readonly reviewedAt: UtcInstant;
    readonly reason: string;
    readonly fieldDecisions: readonly ExtractionFieldReviewDecision[];
  }) {
    this.proposal = input.proposal;
    this.revisionNumber = input.revisionNumber;
    this.state = input.state;
    this.reviewedBy = input.reviewedBy;
    this.actorRole = input.actorRole;
    this.reviewedAt = input.reviewedAt;
    this.reason = input.reason;
    this.fieldDecisions = input.fieldDecisions;
    Object.freeze(this);
  }

  static create(input: {
    readonly proposal: DerivedExtractionProposalRecord;
    readonly revisionNumber: number;
    readonly state: Exclude<ExtractionReviewState, typeof ExtractionReviewState.PROPOSED>;
    readonly reviewedBy: ActorReference;
    readonly actorRole: ExtractionReviewActorRole;
    readonly reviewedAt: UtcInstant;
    readonly reason: string;
    readonly fieldDecisions?: readonly ExtractionFieldReviewDecision[];
  }): ExtractionReviewRevision {
    if (!(input.proposal instanceof DerivedExtractionProposalRecord)) {
      throw new TypeError('Extraction review revision requires DerivedExtractionProposalRecord');
    }
    if (!Number.isSafeInteger(input.revisionNumber) || input.revisionNumber < 1) {
      throw new RangeError('Extraction review revision number must be a positive safe integer');
    }
    if (!REVIEW_STATES.has(input.state)) {
      throw new TypeError('Extraction review revision requires a non-PROPOSED controlled state');
    }
    if (!(input.reviewedBy instanceof ActorReference)) {
      throw new TypeError('Extraction review revision requires ActorReference');
    }
    if (!ACTOR_ROLES.has(input.actorRole)) {
      throw new TypeError('Extraction review actor role must be controlled');
    }
    if (!(input.reviewedAt instanceof UtcInstant)) {
      throw new TypeError('Extraction review revision requires UtcInstant');
    }

    const fieldDecisions = [...(input.fieldDecisions ?? [])];
    const seenFieldPaths = new Set<string>();
    for (const decision of fieldDecisions) {
      if (!(decision instanceof ExtractionFieldReviewDecision)) {
        throw new TypeError('Review revision field decisions must use ExtractionFieldReviewDecision');
      }
      if (!input.proposal.proposals.includes(decision.fieldProposal)) {
        throw new TypeError('Review field decision must reference an exact field proposal from the reviewed S03 proposal');
      }
      if (seenFieldPaths.has(decision.fieldProposal.fieldPath)) {
        throw new TypeError('Review revision must not contain duplicate field-path decisions');
      }
      seenFieldPaths.add(decision.fieldProposal.fieldPath);
    }
    fieldDecisions.sort((left, right) => {
      const leftKey = canonicalDecisionKey(left);
      const rightKey = canonicalDecisionKey(right);
      if (leftKey < rightKey) return -1;
      if (leftKey > rightKey) return 1;
      return 0;
    });
    validateRevisionState(input.state, fieldDecisions);

    return new ExtractionReviewRevision({
      proposal: input.proposal,
      revisionNumber: input.revisionNumber,
      state: input.state,
      reviewedBy: input.reviewedBy,
      actorRole: input.actorRole,
      reviewedAt: input.reviewedAt,
      reason: normalizeReason(input.reason),
      fieldDecisions: Object.freeze(fieldDecisions),
    });
  }

  toJSON() {
    return Object.freeze({
      proposalEvidenceId: this.proposal.derivedEvidence.id.toString(),
      revisionNumber: this.revisionNumber,
      state: this.state,
      reviewedBy: this.reviewedBy.toJSON(),
      actorRole: this.actorRole,
      reviewedAt: this.reviewedAt.toString(),
      reason: this.reason,
      fieldDecisions: Object.freeze(this.fieldDecisions.map((decision) => decision.toJSON())),
      proposalVerificationState: this.proposal.derivedEvidence.verificationState.toString(),
    });
  }
}

export class ExtractionProposalReviewHistory {
  readonly proposal: DerivedExtractionProposalRecord;
  readonly revisions: readonly ExtractionReviewRevision[];

  private constructor(
    proposal: DerivedExtractionProposalRecord,
    revisions: readonly ExtractionReviewRevision[],
  ) {
    this.proposal = proposal;
    this.revisions = revisions;
    Object.freeze(this);
  }

  static start(proposal: DerivedExtractionProposalRecord): ExtractionProposalReviewHistory {
    if (!(proposal instanceof DerivedExtractionProposalRecord)) {
      throw new TypeError('Extraction proposal review history requires DerivedExtractionProposalRecord');
    }
    return new ExtractionProposalReviewHistory(proposal, Object.freeze([]));
  }

  get currentState(): ExtractionReviewState {
    return this.revisions.length === 0
      ? ExtractionReviewState.PROPOSED
      : this.revisions[this.revisions.length - 1]!.state;
  }

  append(input: {
    readonly state: Exclude<ExtractionReviewState, typeof ExtractionReviewState.PROPOSED>;
    readonly reviewedBy: ActorReference;
    readonly actorRole: ExtractionReviewActorRole;
    readonly reviewedAt: UtcInstant;
    readonly reason: string;
    readonly fieldDecisions?: readonly ExtractionFieldReviewDecision[];
  }): ExtractionProposalReviewHistory {
    if (!(input.reviewedAt instanceof UtcInstant)) {
      throw new TypeError('Extraction proposal review append requires UtcInstant');
    }
    const lowerBound = this.revisions.length === 0
      ? this.proposal.derivedEvidence.acquiredAt
      : this.revisions[this.revisions.length - 1]!.reviewedAt;
    if (input.reviewedAt.toEpochMilliseconds() < lowerBound.toEpochMilliseconds()) {
      throw new RangeError('Review revision must not predate the proposal or preceding review revision');
    }

    const revision = ExtractionReviewRevision.create({
      proposal: this.proposal,
      revisionNumber: this.revisions.length + 1,
      state: input.state,
      reviewedBy: input.reviewedBy,
      actorRole: input.actorRole,
      reviewedAt: input.reviewedAt,
      reason: input.reason,
      ...(input.fieldDecisions === undefined ? {} : { fieldDecisions: input.fieldDecisions }),
    });

    return new ExtractionProposalReviewHistory(
      this.proposal,
      Object.freeze([...this.revisions, revision]),
    );
  }

  toJSON() {
    return Object.freeze({
      proposalEvidenceId: this.proposal.derivedEvidence.id.toString(),
      rootOriginalEvidenceId: this.proposal.rootOriginalArchiveEntry.originalArtifact.id.toString(),
      currentState: this.currentState,
      proposalVerificationState: this.proposal.derivedEvidence.verificationState.toString(),
      revisions: Object.freeze(this.revisions.map((revision) => revision.toJSON())),
    });
  }
}
