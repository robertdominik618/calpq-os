import { DecisionId, EventId, RuleSetId } from '../ids.ts';
import { ActorReference, SubjectReference } from '../party-references.ts';
import { Revision } from '../revision.ts';
import { UtcInstant } from '../time.ts';
import { VersionId } from '../version.ts';
import { EvidenceReference } from './evidence-reference.ts';
import { SourceReference } from './source-reference.ts';

export type ProvenanceIdentity = DecisionId | EventId;

export interface ProvenanceEnvelopeInput {
  readonly identity: ProvenanceIdentity;
  readonly evaluatedAt: UtcInstant;
  readonly actor: ActorReference;
  readonly subject?: SubjectReference | null;
  readonly ruleSetId: RuleSetId;
  readonly ruleVersion: VersionId;
  readonly sources?: readonly SourceReference[];
  readonly evidence?: readonly EvidenceReference[];
  readonly priorRevision?: Revision | null;
  readonly resultingRevision?: Revision | null;
}

export class ProvenanceEnvelope {
  readonly identity: ProvenanceIdentity;
  readonly evaluatedAt: UtcInstant;
  readonly actor: ActorReference;
  readonly subject: SubjectReference | null;
  readonly ruleSetId: RuleSetId;
  readonly ruleVersion: VersionId;
  readonly sources: readonly SourceReference[];
  readonly evidence: readonly EvidenceReference[];
  readonly priorRevision: Revision | null;
  readonly resultingRevision: Revision | null;

  private constructor(input: ProvenanceEnvelopeInput) {
    this.identity = input.identity;
    this.evaluatedAt = input.evaluatedAt;
    this.actor = input.actor;
    this.subject = input.subject ?? null;
    this.ruleSetId = input.ruleSetId;
    this.ruleVersion = input.ruleVersion;
    this.sources = Object.freeze([...(input.sources ?? [])]);
    this.evidence = Object.freeze([...(input.evidence ?? [])]);
    this.priorRevision = input.priorRevision ?? null;
    this.resultingRevision = input.resultingRevision ?? null;
    Object.freeze(this);
  }

  static create(input: ProvenanceEnvelopeInput): ProvenanceEnvelope {
    if (!(input.identity instanceof DecisionId) && !(input.identity instanceof EventId)) {
      throw new TypeError('Provenance identity must be DecisionId or EventId');
    }
    if (!(input.evaluatedAt instanceof UtcInstant)) throw new TypeError('Provenance requires evaluated-at UtcInstant');
    if (!(input.actor instanceof ActorReference)) throw new TypeError('Provenance requires ActorReference');
    if (input.subject !== undefined && input.subject !== null && !(input.subject instanceof SubjectReference)) {
      throw new TypeError('Provenance subject must use SubjectReference');
    }
    if (!(input.ruleSetId instanceof RuleSetId)) throw new TypeError('Provenance requires RuleSetId');
    if (!(input.ruleVersion instanceof VersionId)) throw new TypeError('Provenance requires rule VersionId');

    for (const source of input.sources ?? []) {
      if (!(source instanceof SourceReference)) throw new TypeError('Provenance sources must use SourceReference');
    }
    for (const evidence of input.evidence ?? []) {
      if (!(evidence instanceof EvidenceReference)) throw new TypeError('Provenance evidence must use EvidenceReference');
    }

    const prior = input.priorRevision ?? null;
    const resulting = input.resultingRevision ?? null;
    if ((prior === null) !== (resulting === null)) {
      throw new TypeError('Provenance revisions must provide both prior and resulting revisions or neither');
    }
    if (prior !== null && (!(prior instanceof Revision) || !(resulting instanceof Revision))) {
      throw new TypeError('Provenance revisions must use Revision values');
    }
    if (prior !== null && resulting !== null && resulting.toNumber() !== prior.toNumber() + 1) {
      throw new RangeError('Material state transition provenance must advance revision exactly once');
    }

    return new ProvenanceEnvelope(input);
  }
}
