import { DecisionId, RuleSetId } from '../ids.ts';
import { SubjectReference } from '../party-references.ts';
import { Revision } from '../revision.ts';
import { UtcInstant } from '../time.ts';
import { VersionId } from '../version.ts';
import { ProvenanceEnvelope } from '../provenance/provenance-envelope.ts';
import { SourceReference } from '../provenance/source-reference.ts';
import { EvidenceReference } from '../provenance/evidence-reference.ts';
import { ReasonCode } from './reason-code.ts';

export const DomainOutcome = {
  SATISFIED: 'SATISFIED',
  NOT_SATISFIED: 'NOT_SATISFIED',
  INDETERMINATE: 'INDETERMINATE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type DomainOutcome = (typeof DomainOutcome)[keyof typeof DomainOutcome];
const DOMAIN_OUTCOMES = new Set<string>(Object.values(DomainOutcome));

export interface DomainEvaluationResultInput {
  readonly outcome: DomainOutcome;
  readonly reasonCodes: readonly ReasonCode[];
  readonly provenance: ProvenanceEnvelope;
}

export class DomainEvaluationResult {
  readonly decisionId: DecisionId;
  readonly outcome: DomainOutcome;
  readonly reasonCodes: readonly ReasonCode[];
  readonly evaluatedAt: UtcInstant;
  readonly subject: SubjectReference;
  readonly ruleSetId: RuleSetId;
  readonly ruleVersion: VersionId;
  readonly sources: readonly SourceReference[];
  readonly evidence: readonly EvidenceReference[];
  readonly resultingRevision: Revision | null;
  readonly provenance: ProvenanceEnvelope;

  private constructor(input: DomainEvaluationResultInput, decisionId: DecisionId, subject: SubjectReference) {
    this.decisionId = decisionId;
    this.outcome = input.outcome;
    this.reasonCodes = Object.freeze([...input.reasonCodes]);
    this.evaluatedAt = input.provenance.evaluatedAt;
    this.subject = subject;
    this.ruleSetId = input.provenance.ruleSetId;
    this.ruleVersion = input.provenance.ruleVersion;
    this.sources = input.provenance.sources;
    this.evidence = input.provenance.evidence;
    this.resultingRevision = input.provenance.resultingRevision;
    this.provenance = input.provenance;
    Object.freeze(this);
  }

  static create(input: DomainEvaluationResultInput): DomainEvaluationResult {
    if (!DOMAIN_OUTCOMES.has(input.outcome)) throw new TypeError('Domain outcome must be controlled');
    if (!(input.provenance instanceof ProvenanceEnvelope)) throw new TypeError('Domain result requires ProvenanceEnvelope');
    if (!(input.provenance.identity instanceof DecisionId)) {
      throw new TypeError('Domain evaluation result provenance must be identified by DecisionId');
    }
    if (!(input.provenance.subject instanceof SubjectReference)) {
      throw new TypeError('Domain evaluation result requires subject provenance');
    }
    if (!Array.isArray(input.reasonCodes) || input.reasonCodes.length === 0) {
      throw new TypeError('Domain evaluation result requires at least one stable reason code');
    }
    for (const code of input.reasonCodes) {
      if (!(code instanceof ReasonCode)) throw new TypeError('Domain reason codes must use ReasonCode');
    }
    const unique = new Set(input.reasonCodes.map((code) => code.toString()));
    if (unique.size !== input.reasonCodes.length) {
      throw new TypeError('Domain reason codes must not contain duplicates');
    }

    return new DomainEvaluationResult(input, input.provenance.identity, input.provenance.subject);
  }
}
