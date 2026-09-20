import {
  DecisionId,
  EquivalenceRuleId,
  EvidenceId,
  RecognitionReviewCaseId,
  RecognitionRouteId,
} from '../ids.ts';
import { Jurisdiction } from '../jurisdiction.ts';
import { ActorKind, ActorReference, SubjectReference } from '../party-references.ts';
import { ProvenanceEnvelope } from '../provenance/provenance-envelope.ts';
import { SourceReference } from '../provenance/source-reference.ts';
import { DateOnly, UtcInstant } from '../time.ts';
import { VerificationStateCode } from '../verification-state.ts';
import { VersionId } from '../version.ts';
import { CatalogEffectivePeriod } from './activity-profession-catalog.ts';
import { CredentialDefinition, RequirementDefinition } from './credential-requirement-catalog.ts';

function requiredCode(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 128) throw new RangeError(`${label} is too long`);
  if (!/^[A-Z0-9][A-Z0-9._:-]*$/.test(normalized)) {
    throw new TypeError(`${label} must use controlled uppercase machine-code characters`);
  }
  return normalized;
}

function requiredIdentifier(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 512) throw new RangeError(`${label} is too long`);
  if (/\p{C}/u.test(normalized)) throw new TypeError(`${label} contains control characters`);
  return normalized;
}

function normalizedCodes(values: readonly string[], label: string): readonly string[] {
  if (!Array.isArray(values)) throw new TypeError(`${label} must be an array`);
  const normalized = values.map((value) => requiredCode(value, label)).sort();
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} must be unique`);
  return Object.freeze(normalized);
}

function normalizedIdentifiers(values: readonly string[], label: string): readonly string[] {
  if (!Array.isArray(values) || values.length === 0) throw new TypeError(`${label} must be a non-empty array`);
  const normalized = values.map((value) => requiredIdentifier(value, label)).sort();
  if (new Set(normalized).size !== normalized.length) throw new TypeError(`${label} must be unique`);
  return Object.freeze(normalized);
}

function normalizedEvidenceIds(values: readonly EvidenceId[]): readonly EvidenceId[] {
  if (!Array.isArray(values)) throw new TypeError('Evidence reference IDs must be an array');
  if (values.some((value) => !(value instanceof EvidenceId))) {
    throw new TypeError('Evidence reference IDs must use EvidenceId');
  }
  const sorted = [...values].sort((a, b) => a.toString().localeCompare(b.toString()));
  if (new Set(sorted.map(String)).size !== sorted.length) throw new TypeError('Evidence reference IDs must be unique');
  return Object.freeze(sorted);
}

function sameJurisdiction(left: Jurisdiction, right: Jurisdiction): boolean {
  return left.toString() === right.toString();
}

function sameActor(left: ActorReference, right: ActorReference): boolean {
  return left.id.toString() === right.id.toString() && left.kind === right.kind;
}

function sameSubject(left: SubjectReference, right: SubjectReference): boolean {
  return left.id.toString() === right.id.toString() && left.kind === right.kind;
}

function periodWithin(inner: CatalogEffectivePeriod, outer: CatalogEffectivePeriod): boolean {
  const innerFrom = inner.effectiveFrom.toString();
  const innerTo = inner.effectiveTo?.toString() ?? null;
  const outerFrom = outer.effectiveFrom.toString();
  const outerTo = outer.effectiveTo?.toString() ?? null;
  if (innerFrom < outerFrom) return false;
  if (outerTo === null) return true;
  return innerTo !== null && innerTo <= outerTo;
}

function sourceFingerprint(source: SourceReference): string {
  return JSON.stringify({
    id: source.id.toString(),
    authority: source.authority.toJSON(),
    jurisdiction: source.jurisdiction.toJSON(),
    sourceType: source.sourceType,
    canonicalLocator: source.canonicalLocator,
    version: source.version.toString(),
    publicationDate: source.publicationDate?.toString() ?? null,
    effectiveFrom: source.effectiveFrom?.toString() ?? null,
    effectiveTo: source.effectiveTo?.toString() ?? null,
    retrievedAt: source.retrievedAt.toString(),
    verificationState: source.verificationState.toString(),
    contentHash: source.contentHash?.toJSON() ?? null,
  });
}

function sourceSnapshot(source: SourceReference): Record<string, unknown> {
  return JSON.parse(sourceFingerprint(source)) as Record<string, unknown>;
}

function normalizedSources(values: readonly SourceReference[]): readonly SourceReference[] {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('Governed equivalence/recognition basis requires at least one SourceReference');
  }
  if (values.some((value) => !(value instanceof SourceReference))) {
    throw new TypeError('Governed equivalence/recognition basis must use SourceReference');
  }
  const sorted = [...values].sort((a, b) => a.id.toString().localeCompare(b.id.toString()));
  if (new Set(sorted.map((source) => source.id.toString())).size !== sorted.length) {
    throw new TypeError('Governed equivalence/recognition SourceId identities must be unique');
  }
  return Object.freeze(sorted);
}

function allSourcesVerified(sources: readonly SourceReference[]): boolean {
  return sources.every((source) => source.verificationState.toString() === VerificationStateCode.VERIFIED);
}

function validateSourceBackedProvenance(
  sourceReferences: readonly SourceReference[],
  provenance: ProvenanceEnvelope,
  expectedSubject: SubjectReference | null,
  requireVerified: boolean,
): void {
  if (!(provenance instanceof ProvenanceEnvelope)) throw new TypeError('Governed basis requires ProvenanceEnvelope');
  if (expectedSubject === null) {
    if (provenance.subject !== null) throw new TypeError('Catalog equivalence/recognition rule provenance must be subject-free');
  } else if (provenance.subject === null || !sameSubject(provenance.subject, expectedSubject)) {
    throw new TypeError('Recognition decision provenance must match the exact subject');
  }
  if (provenance.evidence.length !== 0) {
    throw new TypeError('M04 equivalence/recognition provenance must remain evidence-free; M05 owns evidence verification');
  }
  if (provenance.sources.length !== sourceReferences.length) {
    throw new TypeError('Provenance sources must exactly match governed source snapshots');
  }
  const expected = new Map(sourceReferences.map((source) => [source.id.toString(), sourceFingerprint(source)]));
  for (const source of provenance.sources) {
    const fingerprint = expected.get(source.id.toString());
    if (fingerprint === undefined || fingerprint !== sourceFingerprint(source)) {
      throw new TypeError('Provenance sources must exactly match governed source snapshots');
    }
  }
  const evaluatedAt = provenance.evaluatedAt.toEpochMilliseconds();
  if (sourceReferences.some((source) => evaluatedAt < source.retrievedAt.toEpochMilliseconds())) {
    throw new RangeError('Provenance evaluation cannot predate source retrieval');
  }
  if (requireVerified && !allSourcesVerified(sourceReferences)) {
    throw new TypeError('Authoritative recognition decision requires already-VERIFIED source snapshots');
  }
}

function provenanceSnapshot(provenance: ProvenanceEnvelope): Record<string, unknown> {
  return {
    identity: provenance.identity.toString(),
    evaluatedAt: provenance.evaluatedAt.toString(),
    actor: provenance.actor.toJSON(),
    subject: provenance.subject?.toJSON() ?? null,
    ruleSetId: provenance.ruleSetId.toString(),
    ruleVersion: provenance.ruleVersion.toString(),
    sources: [...provenance.sources]
      .sort((a, b) => a.id.toString().localeCompare(b.id.toString()))
      .map(sourceSnapshot),
    evidenceIds: [...provenance.evidence].map((evidence) => evidence.id.toString()).sort(),
  };
}

export const EquivalenceSourceObjectType = {
  CREDENTIAL_DEFINITION: 'CREDENTIAL_DEFINITION',
  REQUIREMENT_DEFINITION: 'REQUIREMENT_DEFINITION',
  RECOGNITION_DECISION: 'RECOGNITION_DECISION',
  EXTERNAL_QUALIFICATION_REFERENCE: 'EXTERNAL_QUALIFICATION_REFERENCE',
  EXPERIENCE_REFERENCE: 'EXPERIENCE_REFERENCE',
} as const;
export type EquivalenceSourceObjectType =
  (typeof EquivalenceSourceObjectType)[keyof typeof EquivalenceSourceObjectType];
const EQUIVALENCE_SOURCE_OBJECT_TYPES = new Set<string>(Object.values(EquivalenceSourceObjectType));

export const EquivalenceEffectType = {
  FULL_SUBSTITUTION: 'FULL_SUBSTITUTION',
  PARTIAL_SUBSTITUTION: 'PARTIAL_SUBSTITUTION',
  REQUIREMENT_EXEMPTION: 'REQUIREMENT_EXEMPTION',
  CREDIT_OR_REDUCTION: 'CREDIT_OR_REDUCTION',
  RECOGNITION_ROUTE_ONLY: 'RECOGNITION_ROUTE_ONLY',
  NO_EQUIVALENCE: 'NO_EQUIVALENCE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type EquivalenceEffectType = (typeof EquivalenceEffectType)[keyof typeof EquivalenceEffectType];
const EQUIVALENCE_EFFECT_TYPES = new Set<string>(Object.values(EquivalenceEffectType));

export const EquivalenceTargetKind = {
  CREDENTIAL_DEFINITION: 'CREDENTIAL_DEFINITION',
  REQUIREMENT_DEFINITION: 'REQUIREMENT_DEFINITION',
} as const;
export type EquivalenceTargetKind = (typeof EquivalenceTargetKind)[keyof typeof EquivalenceTargetKind];
export type EquivalenceTarget = CredentialDefinition | RequirementDefinition;

export const EquivalenceRuleApplicationState = {
  GOVERNED_EFFECT_AVAILABLE: 'GOVERNED_EFFECT_AVAILABLE',
  RECOGNITION_ROUTE_REQUIRED: 'RECOGNITION_ROUTE_REQUIRED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  SOURCE_REVIEW_REQUIRED: 'SOURCE_REVIEW_REQUIRED',
  INAPPLICABLE_JURISDICTION: 'INAPPLICABLE_JURISDICTION',
  INAPPLICABLE_DATE: 'INAPPLICABLE_DATE',
} as const;
export type EquivalenceRuleApplicationState =
  (typeof EquivalenceRuleApplicationState)[keyof typeof EquivalenceRuleApplicationState];

function normalizeResidualRequirements(
  values: readonly RequirementDefinition[],
  jurisdiction: Jurisdiction,
  effectivePeriod: CatalogEffectivePeriod,
): readonly RequirementDefinition[] {
  if (!Array.isArray(values)) throw new TypeError('Residual requirements must be an array');
  if (values.some((value) => !(value instanceof RequirementDefinition))) {
    throw new TypeError('Residual requirements must use RequirementDefinition');
  }
  for (const requirement of values) {
    if (!sameJurisdiction(requirement.jurisdiction, jurisdiction)) {
      throw new TypeError('Residual requirement jurisdiction must match governed rule/decision jurisdiction');
    }
    if (!periodWithin(effectivePeriod, requirement.effectivePeriod)) {
      throw new TypeError('Residual requirement version must cover the governed rule/decision effective period');
    }
  }
  const sorted = [...values].sort((a, b) => {
    const left = `${a.id.toString()}|${a.version.toString()}`;
    const right = `${b.id.toString()}|${b.version.toString()}`;
    return left.localeCompare(right);
  });
  const keys = sorted.map((value) => `${value.id.toString()}|${value.version.toString()}`);
  if (new Set(keys).size !== keys.length) throw new TypeError('Residual requirements must be unique by exact version');
  return Object.freeze(sorted);
}

function targetKind(target: EquivalenceTarget): EquivalenceTargetKind {
  if (target instanceof CredentialDefinition) return EquivalenceTargetKind.CREDENTIAL_DEFINITION;
  if (target instanceof RequirementDefinition) return EquivalenceTargetKind.REQUIREMENT_DEFINITION;
  throw new TypeError('Equivalence target must be a governed CredentialDefinition or RequirementDefinition');
}

function targetSnapshot(target: EquivalenceTarget): Record<string, unknown> {
  return {
    kind: targetKind(target),
    id: target.id.toString(),
    version: target.version.toString(),
    jurisdiction: target.jurisdiction.toJSON(),
    effectivePeriod: target.effectivePeriod.toJSON(),
  };
}

export interface EquivalenceRuleInput {
  readonly id: EquivalenceRuleId;
  readonly sourceObjectType: EquivalenceSourceObjectType;
  readonly sourceObjectId: string;
  readonly sourceObjectVersion: VersionId;
  readonly target: EquivalenceTarget;
  readonly effectType: EquivalenceEffectType;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly conditionCodes?: readonly string[];
  readonly residualRequirements?: readonly RequirementDefinition[];
  readonly sourceReferences: readonly SourceReference[];
  readonly provenance: ProvenanceEnvelope;
}

export class EquivalenceRule {
  readonly id: EquivalenceRuleId;
  readonly sourceObjectType: EquivalenceSourceObjectType;
  readonly sourceObjectId: string;
  readonly sourceObjectVersion: VersionId;
  readonly target: EquivalenceTarget;
  readonly targetKind: EquivalenceTargetKind;
  readonly effectType: EquivalenceEffectType;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly conditionCodes: readonly string[];
  readonly residualRequirements: readonly RequirementDefinition[];
  readonly sourceReferences: readonly SourceReference[];
  readonly provenance: ProvenanceEnvelope;

  private constructor(input: EquivalenceRuleInput, sources: readonly SourceReference[], residual: readonly RequirementDefinition[]) {
    this.id = input.id;
    this.sourceObjectType = input.sourceObjectType;
    this.sourceObjectId = requiredIdentifier(input.sourceObjectId, 'Equivalence source object ID');
    this.sourceObjectVersion = input.sourceObjectVersion;
    this.target = input.target;
    this.targetKind = targetKind(input.target);
    this.effectType = input.effectType;
    this.jurisdiction = input.jurisdiction;
    this.effectivePeriod = input.effectivePeriod;
    this.conditionCodes = normalizedCodes(input.conditionCodes ?? [], 'Equivalence condition code');
    this.residualRequirements = residual;
    this.sourceReferences = sources;
    this.provenance = input.provenance;
    Object.freeze(this);
  }

  static create(input: EquivalenceRuleInput): EquivalenceRule {
    if (!(input.id instanceof EquivalenceRuleId)) throw new TypeError('EquivalenceRule requires EquivalenceRuleId');
    if (!EQUIVALENCE_SOURCE_OBJECT_TYPES.has(input.sourceObjectType)) {
      throw new TypeError('Equivalence source object type must be controlled');
    }
    if (!(input.sourceObjectVersion instanceof VersionId)) throw new TypeError('Equivalence source object requires VersionId');
    if (!EQUIVALENCE_EFFECT_TYPES.has(input.effectType)) throw new TypeError('Equivalence effect type must be controlled');
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('EquivalenceRule requires controlled Jurisdiction');
    if (!(input.effectivePeriod instanceof CatalogEffectivePeriod)) throw new TypeError('EquivalenceRule requires CatalogEffectivePeriod');
    const kind = targetKind(input.target);
    void kind;
    if (!sameJurisdiction(input.target.jurisdiction, input.jurisdiction)) {
      throw new TypeError('Equivalence target jurisdiction must exactly match rule jurisdiction');
    }
    if (!periodWithin(input.effectivePeriod, input.target.effectivePeriod)) {
      throw new TypeError('Equivalence target version must cover the rule effective period');
    }
    const sources = normalizedSources(input.sourceReferences);
    validateSourceBackedProvenance(sources, input.provenance, null, false);
    const residual = normalizeResidualRequirements(input.residualRequirements ?? [], input.jurisdiction, input.effectivePeriod);
    const requiresResidual = input.effectType === EquivalenceEffectType.PARTIAL_SUBSTITUTION
      || input.effectType === EquivalenceEffectType.CREDIT_OR_REDUCTION;
    if (requiresResidual && residual.length === 0) {
      throw new TypeError('Partial substitution and credit/reduction must preserve residual requirements explicitly');
    }
    if (!requiresResidual && residual.length !== 0) {
      throw new TypeError('Residual requirements are only valid for partial substitution or credit/reduction effects');
    }
    return new EquivalenceRule(input, sources, residual);
  }

  allSourcesVerified(): boolean {
    return allSourcesVerified(this.sourceReferences);
  }

  applicationState(date: DateOnly, jurisdiction: Jurisdiction): EquivalenceRuleApplicationState {
    if (!(date instanceof DateOnly)) throw new TypeError('Equivalence rule evaluation requires explicit DateOnly');
    if (!(jurisdiction instanceof Jurisdiction)) throw new TypeError('Equivalence rule evaluation requires controlled Jurisdiction');
    if (!sameJurisdiction(this.jurisdiction, jurisdiction)) return EquivalenceRuleApplicationState.INAPPLICABLE_JURISDICTION;
    if (!this.effectivePeriod.isEffectiveOn(date)) return EquivalenceRuleApplicationState.INAPPLICABLE_DATE;
    if (!this.allSourcesVerified()) return EquivalenceRuleApplicationState.SOURCE_REVIEW_REQUIRED;
    if (this.effectType === EquivalenceEffectType.REVIEW_REQUIRED) return EquivalenceRuleApplicationState.REVIEW_REQUIRED;
    if (this.effectType === EquivalenceEffectType.RECOGNITION_ROUTE_ONLY) {
      return EquivalenceRuleApplicationState.RECOGNITION_ROUTE_REQUIRED;
    }
    return EquivalenceRuleApplicationState.GOVERNED_EFFECT_AVAILABLE;
  }

  isGovernedResolutionCandidate(date: DateOnly, jurisdiction: Jurisdiction): boolean {
    return this.applicationState(date, jurisdiction) === EquivalenceRuleApplicationState.GOVERNED_EFFECT_AVAILABLE;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      sourceObjectType: this.sourceObjectType,
      sourceObjectId: this.sourceObjectId,
      sourceObjectVersion: this.sourceObjectVersion.toString(),
      target: targetSnapshot(this.target),
      effectType: this.effectType,
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      conditionCodes: [...this.conditionCodes],
      residualRequirements: this.residualRequirements.map(targetSnapshot),
      sourceReferences: this.sourceReferences.map(sourceSnapshot),
      provenance: provenanceSnapshot(this.provenance),
    };
  }
}

export const RecognitionRouteKind = {
  DOMESTIC_EQUIVALENCE: 'DOMESTIC_EQUIVALENCE',
  AUTOMATIC_RECOGNITION: 'AUTOMATIC_RECOGNITION',
  GENERAL_RECOGNITION: 'GENERAL_RECOGNITION',
  PROFESSIONAL_EXPERIENCE_ROUTE: 'PROFESSIONAL_EXPERIENCE_ROUTE',
  SPECIFIC_LEGISLATION_ROUTE: 'SPECIFIC_LEGISLATION_ROUTE',
  INDIVIDUAL_ASSESSMENT: 'INDIVIDUAL_ASSESSMENT',
  NONE_REQUIRED: 'NONE_REQUIRED',
  UNKNOWN_REVIEW_REQUIRED: 'UNKNOWN_REVIEW_REQUIRED',
} as const;
export type RecognitionRouteKind = (typeof RecognitionRouteKind)[keyof typeof RecognitionRouteKind];
const RECOGNITION_ROUTE_KINDS = new Set<string>(Object.values(RecognitionRouteKind));

export const RecognitionRouteApplicationState = {
  ROUTE_AVAILABLE: 'ROUTE_AVAILABLE',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  SOURCE_REVIEW_REQUIRED: 'SOURCE_REVIEW_REQUIRED',
  INAPPLICABLE_JURISDICTION: 'INAPPLICABLE_JURISDICTION',
  INAPPLICABLE_DATE: 'INAPPLICABLE_DATE',
} as const;
export type RecognitionRouteApplicationState =
  (typeof RecognitionRouteApplicationState)[keyof typeof RecognitionRouteApplicationState];

export interface RecognitionRouteInput {
  readonly id: RecognitionRouteId;
  readonly kind: RecognitionRouteKind;
  readonly sourceCredentialDefinition: CredentialDefinition;
  readonly targetCredentialDefinition: CredentialDefinition;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly conditionCodes?: readonly string[];
  readonly sourceReferences: readonly SourceReference[];
  readonly provenance: ProvenanceEnvelope;
}

export class RecognitionRoute {
  readonly id: RecognitionRouteId;
  readonly kind: RecognitionRouteKind;
  readonly sourceCredentialDefinition: CredentialDefinition;
  readonly targetCredentialDefinition: CredentialDefinition;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly conditionCodes: readonly string[];
  readonly sourceReferences: readonly SourceReference[];
  readonly provenance: ProvenanceEnvelope;

  private constructor(input: RecognitionRouteInput, sources: readonly SourceReference[]) {
    this.id = input.id;
    this.kind = input.kind;
    this.sourceCredentialDefinition = input.sourceCredentialDefinition;
    this.targetCredentialDefinition = input.targetCredentialDefinition;
    this.jurisdiction = input.jurisdiction;
    this.effectivePeriod = input.effectivePeriod;
    this.conditionCodes = normalizedCodes(input.conditionCodes ?? [], 'Recognition route condition code');
    this.sourceReferences = sources;
    this.provenance = input.provenance;
    Object.freeze(this);
  }

  static create(input: RecognitionRouteInput): RecognitionRoute {
    if (!(input.id instanceof RecognitionRouteId)) throw new TypeError('RecognitionRoute requires RecognitionRouteId');
    if (!RECOGNITION_ROUTE_KINDS.has(input.kind)) throw new TypeError('Recognition route kind must be controlled');
    if (!(input.sourceCredentialDefinition instanceof CredentialDefinition)) {
      throw new TypeError('Recognition route requires governed source CredentialDefinition');
    }
    if (!(input.targetCredentialDefinition instanceof CredentialDefinition)) {
      throw new TypeError('Recognition route requires governed target CredentialDefinition');
    }
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('RecognitionRoute requires controlled Jurisdiction');
    if (!(input.effectivePeriod instanceof CatalogEffectivePeriod)) throw new TypeError('RecognitionRoute requires CatalogEffectivePeriod');
    if (!sameJurisdiction(input.targetCredentialDefinition.jurisdiction, input.jurisdiction)) {
      throw new TypeError('Recognition route target jurisdiction must match route jurisdiction');
    }
    if (!periodWithin(input.effectivePeriod, input.targetCredentialDefinition.effectivePeriod)) {
      throw new TypeError('Recognition route target version must cover the route effective period');
    }
    const sources = normalizedSources(input.sourceReferences);
    validateSourceBackedProvenance(sources, input.provenance, null, false);
    return new RecognitionRoute(input, sources);
  }

  allSourcesVerified(): boolean {
    return allSourcesVerified(this.sourceReferences);
  }

  applicationState(date: DateOnly, jurisdiction: Jurisdiction): RecognitionRouteApplicationState {
    if (!(date instanceof DateOnly)) throw new TypeError('Recognition route evaluation requires explicit DateOnly');
    if (!(jurisdiction instanceof Jurisdiction)) throw new TypeError('Recognition route evaluation requires controlled Jurisdiction');
    if (!sameJurisdiction(this.jurisdiction, jurisdiction)) return RecognitionRouteApplicationState.INAPPLICABLE_JURISDICTION;
    if (!this.effectivePeriod.isEffectiveOn(date)) return RecognitionRouteApplicationState.INAPPLICABLE_DATE;
    if (!this.allSourcesVerified()) return RecognitionRouteApplicationState.SOURCE_REVIEW_REQUIRED;
    if (this.kind === RecognitionRouteKind.UNKNOWN_REVIEW_REQUIRED) return RecognitionRouteApplicationState.REVIEW_REQUIRED;
    return RecognitionRouteApplicationState.ROUTE_AVAILABLE;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      kind: this.kind,
      sourceCredentialDefinition: targetSnapshot(this.sourceCredentialDefinition),
      targetCredentialDefinition: targetSnapshot(this.targetCredentialDefinition),
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      conditionCodes: [...this.conditionCodes],
      sourceReferences: this.sourceReferences.map(sourceSnapshot),
      provenance: provenanceSnapshot(this.provenance),
    };
  }
}

export const RecognitionDecisionEffectType = {
  FULL_SUBSTITUTION: EquivalenceEffectType.FULL_SUBSTITUTION,
  PARTIAL_SUBSTITUTION: EquivalenceEffectType.PARTIAL_SUBSTITUTION,
  REQUIREMENT_EXEMPTION: EquivalenceEffectType.REQUIREMENT_EXEMPTION,
  CREDIT_OR_REDUCTION: EquivalenceEffectType.CREDIT_OR_REDUCTION,
  NO_EQUIVALENCE: EquivalenceEffectType.NO_EQUIVALENCE,
} as const;
export type RecognitionDecisionEffectType =
  (typeof RecognitionDecisionEffectType)[keyof typeof RecognitionDecisionEffectType];
const RECOGNITION_DECISION_EFFECTS = new Set<string>(Object.values(RecognitionDecisionEffectType));

export interface RecognitionDecisionInput {
  readonly id: DecisionId;
  readonly authority: ActorReference;
  readonly subject: SubjectReference;
  readonly sourceCredentialDefinition: CredentialDefinition;
  readonly target: EquivalenceTarget;
  readonly effectType: RecognitionDecisionEffectType;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly conditionCodes?: readonly string[];
  readonly limitationCodes?: readonly string[];
  readonly residualRequirements?: readonly RequirementDefinition[];
  readonly sourceReferences: readonly SourceReference[];
  readonly provenance: ProvenanceEnvelope;
}

export class RecognitionDecision {
  readonly id: DecisionId;
  readonly authority: ActorReference;
  readonly subject: SubjectReference;
  readonly sourceCredentialDefinition: CredentialDefinition;
  readonly target: EquivalenceTarget;
  readonly effectType: RecognitionDecisionEffectType;
  readonly jurisdiction: Jurisdiction;
  readonly effectivePeriod: CatalogEffectivePeriod;
  readonly conditionCodes: readonly string[];
  readonly limitationCodes: readonly string[];
  readonly residualRequirements: readonly RequirementDefinition[];
  readonly sourceReferences: readonly SourceReference[];
  readonly provenance: ProvenanceEnvelope;

  private constructor(
    input: RecognitionDecisionInput,
    sources: readonly SourceReference[],
    residual: readonly RequirementDefinition[],
  ) {
    this.id = input.id;
    this.authority = input.authority;
    this.subject = input.subject;
    this.sourceCredentialDefinition = input.sourceCredentialDefinition;
    this.target = input.target;
    this.effectType = input.effectType;
    this.jurisdiction = input.jurisdiction;
    this.effectivePeriod = input.effectivePeriod;
    this.conditionCodes = normalizedCodes(input.conditionCodes ?? [], 'Recognition decision condition code');
    this.limitationCodes = normalizedCodes(input.limitationCodes ?? [], 'Recognition decision limitation code');
    this.residualRequirements = residual;
    this.sourceReferences = sources;
    this.provenance = input.provenance;
    Object.freeze(this);
  }

  static create(input: RecognitionDecisionInput): RecognitionDecision {
    if (!(input.id instanceof DecisionId)) throw new TypeError('RecognitionDecision requires DecisionId');
    if (!(input.authority instanceof ActorReference)) throw new TypeError('RecognitionDecision requires ActorReference authority');
    if (input.authority.kind !== ActorKind.EXTERNAL_AUTHORITY && input.authority.kind !== ActorKind.ORGANIZATION) {
      throw new TypeError('Recognition decision authority must be an external authority or organization');
    }
    if (!(input.subject instanceof SubjectReference)) throw new TypeError('RecognitionDecision requires SubjectReference');
    if (!(input.sourceCredentialDefinition instanceof CredentialDefinition)) {
      throw new TypeError('RecognitionDecision requires governed source CredentialDefinition');
    }
    targetKind(input.target);
    if (!RECOGNITION_DECISION_EFFECTS.has(input.effectType)) {
      throw new TypeError('Recognition decision effect must be a controlled authoritative outcome');
    }
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('RecognitionDecision requires controlled Jurisdiction');
    if (!(input.effectivePeriod instanceof CatalogEffectivePeriod)) throw new TypeError('RecognitionDecision requires CatalogEffectivePeriod');
    if (!sameJurisdiction(input.target.jurisdiction, input.jurisdiction)) {
      throw new TypeError('Recognition decision target jurisdiction must match decision jurisdiction');
    }
    if (!periodWithin(input.effectivePeriod, input.target.effectivePeriod)) {
      throw new TypeError('Recognition decision target version must cover the decision effective period');
    }
    const sources = normalizedSources(input.sourceReferences);
    validateSourceBackedProvenance(sources, input.provenance, input.subject, true);
    if (!sources.some((source) => sameActor(source.authority, input.authority))) {
      throw new TypeError('Recognition decision authority must be represented by an exact authoritative source snapshot');
    }
    const residual = normalizeResidualRequirements(input.residualRequirements ?? [], input.jurisdiction, input.effectivePeriod);
    const requiresResidual = input.effectType === RecognitionDecisionEffectType.PARTIAL_SUBSTITUTION
      || input.effectType === RecognitionDecisionEffectType.CREDIT_OR_REDUCTION;
    if (requiresResidual && residual.length === 0) {
      throw new TypeError('Partial recognition and credit/reduction must preserve residual requirements explicitly');
    }
    if (!requiresResidual && residual.length !== 0) {
      throw new TypeError('Residual requirements are only valid for partial recognition or credit/reduction outcomes');
    }
    return new RecognitionDecision(input, sources, residual);
  }

  isEffectiveOn(date: DateOnly, jurisdiction: Jurisdiction): boolean {
    if (!(date instanceof DateOnly)) throw new TypeError('Recognition decision evaluation requires explicit DateOnly');
    if (!(jurisdiction instanceof Jurisdiction)) throw new TypeError('Recognition decision evaluation requires controlled Jurisdiction');
    return sameJurisdiction(this.jurisdiction, jurisdiction) && this.effectivePeriod.isEffectiveOn(date);
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      authority: this.authority.toJSON(),
      subject: this.subject.toJSON(),
      sourceCredentialDefinition: targetSnapshot(this.sourceCredentialDefinition),
      target: targetSnapshot(this.target),
      effectType: this.effectType,
      jurisdiction: this.jurisdiction.toJSON(),
      effectivePeriod: this.effectivePeriod.toJSON(),
      conditionCodes: [...this.conditionCodes],
      limitationCodes: [...this.limitationCodes],
      residualRequirements: this.residualRequirements.map(targetSnapshot),
      sourceReferences: this.sourceReferences.map(sourceSnapshot),
      provenance: provenanceSnapshot(this.provenance),
    };
  }
}

export const RecognitionReviewCaseStatus = {
  OPEN: 'OPEN',
  TRIAGED: 'TRIAGED',
  IN_REVIEW: 'IN_REVIEW',
  WAITING_EVIDENCE: 'WAITING_EVIDENCE',
  WAITING_EXTERNAL: 'WAITING_EXTERNAL',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
  SUPERSEDED: 'SUPERSEDED',
} as const;
export type RecognitionReviewCaseStatus =
  (typeof RecognitionReviewCaseStatus)[keyof typeof RecognitionReviewCaseStatus];

export const RecognitionReviewSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type RecognitionReviewSeverity = (typeof RecognitionReviewSeverity)[keyof typeof RecognitionReviewSeverity];
const REVIEW_SEVERITIES = new Set<string>(Object.values(RecognitionReviewSeverity));

export const RecognitionReviewUrgency = {
  NORMAL: 'NORMAL',
  EXPEDITED: 'EXPEDITED',
  IMMEDIATE: 'IMMEDIATE',
} as const;
export type RecognitionReviewUrgency = (typeof RecognitionReviewUrgency)[keyof typeof RecognitionReviewUrgency];
const REVIEW_URGENCIES = new Set<string>(Object.values(RecognitionReviewUrgency));

export const RecognitionReviewResolutionKind = {
  EQUIVALENCE_RULE: 'EQUIVALENCE_RULE',
  RECOGNITION_DECISION: 'RECOGNITION_DECISION',
} as const;
export type RecognitionReviewResolutionKind =
  (typeof RecognitionReviewResolutionKind)[keyof typeof RecognitionReviewResolutionKind];

export interface RecognitionReviewTransition {
  readonly from: RecognitionReviewCaseStatus;
  readonly to: RecognitionReviewCaseStatus;
  readonly actor: ActorReference;
  readonly occurredAt: UtcInstant;
  readonly reasonCode: string;
}

export interface RecognitionReviewResolution {
  readonly kind: RecognitionReviewResolutionKind;
  readonly basisId: string;
  readonly effectType: EquivalenceEffectType | RecognitionDecisionEffectType;
  readonly resolvedBy: ActorReference;
  readonly resolvedAt: UtcInstant;
  readonly reasonCode: string;
}

export interface RecognitionReviewCaseInput {
  readonly id: RecognitionReviewCaseId;
  readonly sourceObjectIds: readonly string[];
  readonly subject: SubjectReference;
  readonly jurisdiction: Jurisdiction;
  readonly severity: RecognitionReviewSeverity;
  readonly urgency: RecognitionReviewUrgency;
  readonly assignedRoleCode?: string | null;
  readonly assignee?: ActorReference | null;
  readonly openedAt: UtcInstant;
  readonly dueAt?: UtcInstant | null;
  readonly openedBy: ActorReference;
  readonly factCodes?: readonly string[];
  readonly unknownPointCodes?: readonly string[];
  readonly evidenceReferenceIds?: readonly EvidenceId[];
  readonly resolutionQuestionCode: string;
  readonly requiresIndependentApproval?: boolean;
  readonly provenance: ProvenanceEnvelope;
}

type RecognitionReviewCaseState = {
  readonly id: RecognitionReviewCaseId;
  readonly sourceObjectIds: readonly string[];
  readonly subject: SubjectReference;
  readonly jurisdiction: Jurisdiction;
  readonly severity: RecognitionReviewSeverity;
  readonly urgency: RecognitionReviewUrgency;
  readonly assignedRoleCode: string | null;
  readonly assignee: ActorReference | null;
  readonly openedAt: UtcInstant;
  readonly dueAt: UtcInstant | null;
  readonly openedBy: ActorReference;
  readonly factCodes: readonly string[];
  readonly unknownPointCodes: readonly string[];
  readonly evidenceReferenceIds: readonly EvidenceId[];
  readonly resolutionQuestionCode: string;
  readonly requiresIndependentApproval: boolean;
  readonly provenance: ProvenanceEnvelope;
  readonly status: RecognitionReviewCaseStatus;
  readonly transitionHistory: readonly RecognitionReviewTransition[];
  readonly resolutionHistory: readonly RecognitionReviewResolution[];
};

function freezeTransition(input: RecognitionReviewTransition): RecognitionReviewTransition {
  return Object.freeze({ ...input });
}

function freezeResolution(input: RecognitionReviewResolution): RecognitionReviewResolution {
  return Object.freeze({ ...input });
}

export class RecognitionReviewCase {
  readonly id: RecognitionReviewCaseId;
  readonly sourceObjectIds: readonly string[];
  readonly subject: SubjectReference;
  readonly jurisdiction: Jurisdiction;
  readonly severity: RecognitionReviewSeverity;
  readonly urgency: RecognitionReviewUrgency;
  readonly assignedRoleCode: string | null;
  readonly assignee: ActorReference | null;
  readonly openedAt: UtcInstant;
  readonly dueAt: UtcInstant | null;
  readonly openedBy: ActorReference;
  readonly factCodes: readonly string[];
  readonly unknownPointCodes: readonly string[];
  readonly evidenceReferenceIds: readonly EvidenceId[];
  readonly resolutionQuestionCode: string;
  readonly requiresIndependentApproval: boolean;
  readonly provenance: ProvenanceEnvelope;
  readonly status: RecognitionReviewCaseStatus;
  readonly transitionHistory: readonly RecognitionReviewTransition[];
  readonly resolutionHistory: readonly RecognitionReviewResolution[];

  private constructor(state: RecognitionReviewCaseState) {
    this.id = state.id;
    this.sourceObjectIds = state.sourceObjectIds;
    this.subject = state.subject;
    this.jurisdiction = state.jurisdiction;
    this.severity = state.severity;
    this.urgency = state.urgency;
    this.assignedRoleCode = state.assignedRoleCode;
    this.assignee = state.assignee;
    this.openedAt = state.openedAt;
    this.dueAt = state.dueAt;
    this.openedBy = state.openedBy;
    this.factCodes = state.factCodes;
    this.unknownPointCodes = state.unknownPointCodes;
    this.evidenceReferenceIds = state.evidenceReferenceIds;
    this.resolutionQuestionCode = state.resolutionQuestionCode;
    this.requiresIndependentApproval = state.requiresIndependentApproval;
    this.provenance = state.provenance;
    this.status = state.status;
    this.transitionHistory = state.transitionHistory;
    this.resolutionHistory = state.resolutionHistory;
    Object.freeze(this);
  }

  static open(input: RecognitionReviewCaseInput): RecognitionReviewCase {
    if (!(input.id instanceof RecognitionReviewCaseId)) throw new TypeError('RecognitionReviewCase requires RecognitionReviewCaseId');
    if (!(input.subject instanceof SubjectReference)) throw new TypeError('RecognitionReviewCase requires SubjectReference');
    if (!(input.jurisdiction instanceof Jurisdiction)) throw new TypeError('RecognitionReviewCase requires controlled Jurisdiction');
    if (!REVIEW_SEVERITIES.has(input.severity)) throw new TypeError('Recognition review severity must be controlled');
    if (!REVIEW_URGENCIES.has(input.urgency)) throw new TypeError('Recognition review urgency must be controlled');
    if (!(input.openedAt instanceof UtcInstant)) throw new TypeError('Recognition review openedAt must be explicit UtcInstant');
    if (!(input.openedBy instanceof ActorReference)) throw new TypeError('Recognition review openedBy must use ActorReference');
    const dueAt = input.dueAt ?? null;
    if (dueAt !== null && !(dueAt instanceof UtcInstant)) throw new TypeError('Recognition review dueAt must use UtcInstant');
    if (dueAt !== null && dueAt.toEpochMilliseconds() < input.openedAt.toEpochMilliseconds()) {
      throw new RangeError('Recognition review dueAt cannot predate openedAt');
    }
    const assignedRoleCode = input.assignedRoleCode === undefined || input.assignedRoleCode === null
      ? null
      : requiredCode(input.assignedRoleCode, 'Recognition review assigned role code');
    const assignee = input.assignee ?? null;
    if (assignee !== null && !(assignee instanceof ActorReference)) throw new TypeError('Recognition review assignee must use ActorReference');
    if (!(input.provenance instanceof ProvenanceEnvelope)) throw new TypeError('Recognition review case requires ProvenanceEnvelope');
    if (input.provenance.subject === null || !sameSubject(input.provenance.subject, input.subject)) {
      throw new TypeError('Recognition review case provenance must match the exact subject');
    }
    if (input.provenance.evaluatedAt.toEpochMilliseconds() < input.openedAt.toEpochMilliseconds()) {
      throw new RangeError('Recognition review case provenance cannot predate case opening');
    }
    return new RecognitionReviewCase({
      id: input.id,
      sourceObjectIds: normalizedIdentifiers(input.sourceObjectIds, 'Recognition review source object ID'),
      subject: input.subject,
      jurisdiction: input.jurisdiction,
      severity: input.severity,
      urgency: input.urgency,
      assignedRoleCode,
      assignee,
      openedAt: input.openedAt,
      dueAt,
      openedBy: input.openedBy,
      factCodes: normalizedCodes(input.factCodes ?? [], 'Recognition review fact code'),
      unknownPointCodes: normalizedCodes(input.unknownPointCodes ?? [], 'Recognition review unknown-point code'),
      evidenceReferenceIds: normalizedEvidenceIds(input.evidenceReferenceIds ?? []),
      resolutionQuestionCode: requiredCode(input.resolutionQuestionCode, 'Recognition review resolution question code'),
      requiresIndependentApproval: input.requiresIndependentApproval ?? false,
      provenance: input.provenance,
      status: RecognitionReviewCaseStatus.OPEN,
      transitionHistory: Object.freeze([]),
      resolutionHistory: Object.freeze([]),
    });
  }

  private rebuild(
    status: RecognitionReviewCaseStatus,
    transitionHistory: readonly RecognitionReviewTransition[],
    resolutionHistory: readonly RecognitionReviewResolution[],
  ): RecognitionReviewCase {
    return new RecognitionReviewCase({
      id: this.id,
      sourceObjectIds: this.sourceObjectIds,
      subject: this.subject,
      jurisdiction: this.jurisdiction,
      severity: this.severity,
      urgency: this.urgency,
      assignedRoleCode: this.assignedRoleCode,
      assignee: this.assignee,
      openedAt: this.openedAt,
      dueAt: this.dueAt,
      openedBy: this.openedBy,
      factCodes: this.factCodes,
      unknownPointCodes: this.unknownPointCodes,
      evidenceReferenceIds: this.evidenceReferenceIds,
      resolutionQuestionCode: this.resolutionQuestionCode,
      requiresIndependentApproval: this.requiresIndependentApproval,
      provenance: this.provenance,
      status,
      transitionHistory,
      resolutionHistory,
    });
  }

  private assertTransitionInput(actor: ActorReference, at: UtcInstant, reasonCode: string): string {
    if (!(actor instanceof ActorReference)) throw new TypeError('Recognition review transition actor must use ActorReference');
    if (!(at instanceof UtcInstant)) throw new TypeError('Recognition review transition time must use explicit UtcInstant');
    const last = this.transitionHistory.at(-1)?.occurredAt ?? this.openedAt;
    if (at.toEpochMilliseconds() < last.toEpochMilliseconds()) {
      throw new RangeError('Recognition review transitions must be monotonic in time');
    }
    return requiredCode(reasonCode, 'Recognition review transition reason code');
  }

  private move(
    to: RecognitionReviewCaseStatus,
    allowedFrom: readonly RecognitionReviewCaseStatus[],
    actor: ActorReference,
    at: UtcInstant,
    reasonCode: string,
  ): RecognitionReviewCase {
    if (!allowedFrom.includes(this.status)) {
      throw new TypeError(`Recognition review transition ${this.status} -> ${to} is not allowed`);
    }
    const normalizedReason = this.assertTransitionInput(actor, at, reasonCode);
    const transition = freezeTransition({ from: this.status, to, actor, occurredAt: at, reasonCode: normalizedReason });
    return this.rebuild(to, Object.freeze([...this.transitionHistory, transition]), this.resolutionHistory);
  }

  triage(actor: ActorReference, at: UtcInstant, reasonCode: string): RecognitionReviewCase {
    return this.move(
      RecognitionReviewCaseStatus.TRIAGED,
      [RecognitionReviewCaseStatus.OPEN, RecognitionReviewCaseStatus.REOPENED],
      actor,
      at,
      reasonCode,
    );
  }

  beginReview(actor: ActorReference, at: UtcInstant, reasonCode: string): RecognitionReviewCase {
    return this.move(
      RecognitionReviewCaseStatus.IN_REVIEW,
      [
        RecognitionReviewCaseStatus.TRIAGED,
        RecognitionReviewCaseStatus.WAITING_EVIDENCE,
        RecognitionReviewCaseStatus.WAITING_EXTERNAL,
        RecognitionReviewCaseStatus.REOPENED,
      ],
      actor,
      at,
      reasonCode,
    );
  }

  waitForEvidence(actor: ActorReference, at: UtcInstant, reasonCode: string): RecognitionReviewCase {
    return this.move(
      RecognitionReviewCaseStatus.WAITING_EVIDENCE,
      [RecognitionReviewCaseStatus.TRIAGED, RecognitionReviewCaseStatus.IN_REVIEW, RecognitionReviewCaseStatus.REOPENED],
      actor,
      at,
      reasonCode,
    );
  }

  waitForExternal(actor: ActorReference, at: UtcInstant, reasonCode: string): RecognitionReviewCase {
    return this.move(
      RecognitionReviewCaseStatus.WAITING_EXTERNAL,
      [RecognitionReviewCaseStatus.TRIAGED, RecognitionReviewCaseStatus.IN_REVIEW, RecognitionReviewCaseStatus.REOPENED],
      actor,
      at,
      reasonCode,
    );
  }

  private resolve(
    kind: RecognitionReviewResolutionKind,
    basisId: string,
    effectType: EquivalenceEffectType | RecognitionDecisionEffectType,
    actor: ActorReference,
    at: UtcInstant,
    reasonCode: string,
  ): RecognitionReviewCase {
    if (this.status !== RecognitionReviewCaseStatus.IN_REVIEW) {
      throw new TypeError('Recognition review can resolve only from IN_REVIEW');
    }
    const normalizedReason = this.assertTransitionInput(actor, at, reasonCode);
    if (this.requiresIndependentApproval && sameActor(actor, this.openedBy)) {
      throw new TypeError('Recognition review policy requires independent approval by a different actor');
    }
    const transition = freezeTransition({
      from: this.status,
      to: RecognitionReviewCaseStatus.RESOLVED,
      actor,
      occurredAt: at,
      reasonCode: normalizedReason,
    });
    const resolution = freezeResolution({
      kind,
      basisId,
      effectType,
      resolvedBy: actor,
      resolvedAt: at,
      reasonCode: normalizedReason,
    });
    return this.rebuild(
      RecognitionReviewCaseStatus.RESOLVED,
      Object.freeze([...this.transitionHistory, transition]),
      Object.freeze([...this.resolutionHistory, resolution]),
    );
  }

  resolveWithRule(
    rule: EquivalenceRule,
    basisDate: DateOnly,
    actor: ActorReference,
    at: UtcInstant,
    reasonCode: string,
  ): RecognitionReviewCase {
    if (!(rule instanceof EquivalenceRule)) throw new TypeError('Recognition review rule resolution requires EquivalenceRule');
    if (!rule.isGovernedResolutionCandidate(basisDate, this.jurisdiction)) {
      throw new TypeError('Equivalence rule is not a governed applicable resolution basis for this review');
    }
    return this.resolve(
      RecognitionReviewResolutionKind.EQUIVALENCE_RULE,
      rule.id.toString(),
      rule.effectType,
      actor,
      at,
      reasonCode,
    );
  }

  resolveWithDecision(
    decision: RecognitionDecision,
    basisDate: DateOnly,
    actor: ActorReference,
    at: UtcInstant,
    reasonCode: string,
  ): RecognitionReviewCase {
    if (!(decision instanceof RecognitionDecision)) {
      throw new TypeError('Recognition review decision resolution requires RecognitionDecision');
    }
    if (!sameSubject(decision.subject, this.subject)) {
      throw new TypeError('Recognition decision subject does not match review subject');
    }
    if (!decision.isEffectiveOn(basisDate, this.jurisdiction)) {
      throw new TypeError('Recognition decision is not applicable to the review jurisdiction/date');
    }
    return this.resolve(
      RecognitionReviewResolutionKind.RECOGNITION_DECISION,
      decision.id.toString(),
      decision.effectType,
      actor,
      at,
      reasonCode,
    );
  }

  close(actor: ActorReference, at: UtcInstant, reasonCode: string): RecognitionReviewCase {
    return this.move(RecognitionReviewCaseStatus.CLOSED, [RecognitionReviewCaseStatus.RESOLVED], actor, at, reasonCode);
  }

  reopen(actor: ActorReference, at: UtcInstant, reasonCode: string): RecognitionReviewCase {
    return this.move(
      RecognitionReviewCaseStatus.REOPENED,
      [RecognitionReviewCaseStatus.RESOLVED, RecognitionReviewCaseStatus.CLOSED],
      actor,
      at,
      reasonCode,
    );
  }

  supersede(actor: ActorReference, at: UtcInstant, reasonCode: string): RecognitionReviewCase {
    if (this.status === RecognitionReviewCaseStatus.SUPERSEDED) {
      throw new TypeError('Superseded recognition review case is terminal');
    }
    return this.move(RecognitionReviewCaseStatus.SUPERSEDED, [this.status], actor, at, reasonCode);
  }

  activeResolution(): RecognitionReviewResolution | null {
    if (this.status !== RecognitionReviewCaseStatus.RESOLVED && this.status !== RecognitionReviewCaseStatus.CLOSED) return null;
    return this.resolutionHistory.at(-1) ?? null;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id.toString(),
      sourceObjectIds: [...this.sourceObjectIds],
      subject: this.subject.toJSON(),
      jurisdiction: this.jurisdiction.toJSON(),
      severity: this.severity,
      urgency: this.urgency,
      assignedRoleCode: this.assignedRoleCode,
      assignee: this.assignee?.toJSON() ?? null,
      openedAt: this.openedAt.toString(),
      dueAt: this.dueAt?.toString() ?? null,
      openedBy: this.openedBy.toJSON(),
      factCodes: [...this.factCodes],
      unknownPointCodes: [...this.unknownPointCodes],
      evidenceReferenceIds: this.evidenceReferenceIds.map(String),
      resolutionQuestionCode: this.resolutionQuestionCode,
      requiresIndependentApproval: this.requiresIndependentApproval,
      status: this.status,
      provenance: provenanceSnapshot(this.provenance),
      transitionHistory: this.transitionHistory.map((transition) => ({
        from: transition.from,
        to: transition.to,
        actor: transition.actor.toJSON(),
        occurredAt: transition.occurredAt.toString(),
        reasonCode: transition.reasonCode,
      })),
      resolutionHistory: this.resolutionHistory.map((resolution) => ({
        kind: resolution.kind,
        basisId: resolution.basisId,
        effectType: resolution.effectType,
        resolvedBy: resolution.resolvedBy.toJSON(),
        resolvedAt: resolution.resolvedAt.toString(),
        reasonCode: resolution.reasonCode,
      })),
    };
  }
}
