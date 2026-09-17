import {
  EvidenceClass,
  EvidenceId,
  EvidenceKind,
  EvidenceReference,
  UtcInstant,
  VerificationStateCode,
} from '../../../core/src/index.ts';
import { OriginalArchiveEntry } from '../archive/original-document-archive.ts';

const MAX_PROCESSOR_REFERENCE_LENGTH = 512;
const MAX_PROCESSOR_VERSION_LENGTH = 256;
const MAX_CONFIGURATION_REFERENCE_LENGTH = 512;
const MAX_FIELD_PATH_LENGTH = 256;
const MAX_SOURCE_LOCATOR_LENGTH = 512;
const MAX_PROPOSED_TEXT_LENGTH = 4096;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function normalizeBoundedText(value: string, label: string, maxLength: number): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > maxLength) throw new RangeError(`${label} is too long`);
  if (CONTROL_CHARACTER_PATTERN.test(normalized)) throw new TypeError(`${label} must not contain control characters`);
  return normalized;
}

export const ExtractionProcessorKind = {
  OCR_ENGINE: 'OCR_ENGINE',
  STRUCTURED_PARSER: 'STRUCTURED_PARSER',
  NORMALIZER: 'NORMALIZER',
  CLASSIFIER: 'CLASSIFIER',
  AI_ASSISTED: 'AI_ASSISTED',
  OTHER: 'OTHER',
} as const;
export type ExtractionProcessorKind = (typeof ExtractionProcessorKind)[keyof typeof ExtractionProcessorKind];
const PROCESSOR_KINDS = new Set<string>(Object.values(ExtractionProcessorKind));

export class ExtractionProcessorReference {
  readonly kind: ExtractionProcessorKind;
  readonly processorReference: string;
  readonly processorVersion: string;
  readonly configurationReference: string | null;

  private constructor(input: {
    readonly kind: ExtractionProcessorKind;
    readonly processorReference: string;
    readonly processorVersion: string;
    readonly configurationReference: string | null;
  }) {
    this.kind = input.kind;
    this.processorReference = input.processorReference;
    this.processorVersion = input.processorVersion;
    this.configurationReference = input.configurationReference;
    Object.freeze(this);
  }

  static create(input: {
    readonly kind: ExtractionProcessorKind;
    readonly processorReference: string;
    readonly processorVersion: string;
    readonly configurationReference?: string | null;
  }): ExtractionProcessorReference {
    if (!PROCESSOR_KINDS.has(input.kind)) {
      throw new TypeError('Extraction processor kind must be controlled');
    }
    return new ExtractionProcessorReference({
      kind: input.kind,
      processorReference: normalizeBoundedText(
        input.processorReference,
        'Extraction processor reference',
        MAX_PROCESSOR_REFERENCE_LENGTH,
      ),
      processorVersion: normalizeBoundedText(
        input.processorVersion,
        'Extraction processor version',
        MAX_PROCESSOR_VERSION_LENGTH,
      ),
      configurationReference: input.configurationReference == null
        ? null
        : normalizeBoundedText(
          input.configurationReference,
          'Extraction configuration reference',
          MAX_CONFIGURATION_REFERENCE_LENGTH,
        ),
    });
  }

  toJSON() {
    return Object.freeze({
      kind: this.kind,
      processorReference: this.processorReference,
      processorVersion: this.processorVersion,
      configurationReference: this.configurationReference,
    });
  }
}

export class ExtractionConfidence {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
    Object.freeze(this);
  }

  static from(value: number): ExtractionConfidence {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new TypeError('Extraction confidence must be a finite number');
    }
    if (value < 0 || value > 1) {
      throw new RangeError('Extraction confidence must be between 0 and 1');
    }
    return new ExtractionConfidence(value);
  }

  toJSON(): number {
    return this.value;
  }
}

export type ExtractionProposalScalar = string | number | boolean | null;

function validateProposalValue(value: ExtractionProposalScalar): ExtractionProposalScalar {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Extraction proposed number must be finite');
    return value;
  }
  if (typeof value === 'string') {
    if (value.length > MAX_PROPOSED_TEXT_LENGTH) {
      throw new RangeError('Extraction proposed text is too long');
    }
    if (CONTROL_CHARACTER_PATTERN.test(value)) {
      throw new TypeError('Extraction proposed text must not contain control characters');
    }
    return value;
  }
  throw new TypeError('Extraction proposed value must be a JSON-safe scalar');
}

export class ExtractionFieldProposal {
  readonly fieldPath: string;
  readonly proposedValue: ExtractionProposalScalar;
  readonly sourceLocator: string | null;
  readonly confidence: ExtractionConfidence | null;

  private constructor(input: {
    readonly fieldPath: string;
    readonly proposedValue: ExtractionProposalScalar;
    readonly sourceLocator: string | null;
    readonly confidence: ExtractionConfidence | null;
  }) {
    this.fieldPath = input.fieldPath;
    this.proposedValue = input.proposedValue;
    this.sourceLocator = input.sourceLocator;
    this.confidence = input.confidence;
    Object.freeze(this);
  }

  static create(input: {
    readonly fieldPath: string;
    readonly proposedValue: ExtractionProposalScalar;
    readonly sourceLocator?: string | null;
    readonly confidence?: ExtractionConfidence | null;
  }): ExtractionFieldProposal {
    if (input.confidence != null && !(input.confidence instanceof ExtractionConfidence)) {
      throw new TypeError('Extraction field confidence must use ExtractionConfidence');
    }
    return new ExtractionFieldProposal({
      fieldPath: normalizeBoundedText(input.fieldPath, 'Extraction field path', MAX_FIELD_PATH_LENGTH),
      proposedValue: validateProposalValue(input.proposedValue),
      sourceLocator: input.sourceLocator == null
        ? null
        : normalizeBoundedText(input.sourceLocator, 'Extraction source locator', MAX_SOURCE_LOCATOR_LENGTH),
      confidence: input.confidence ?? null,
    });
  }

  toJSON() {
    return Object.freeze({
      fieldPath: this.fieldPath,
      proposedValue: this.proposedValue,
      sourceLocator: this.sourceLocator,
      confidence: this.confidence?.toJSON() ?? null,
    });
  }
}

const DERIVED_EXTRACTION_KINDS = new Set<string>([
  EvidenceKind.OCR_TEXT,
  EvidenceKind.NORMALIZED_FIELDS,
  EvidenceKind.AI_SUMMARY,
  EvidenceKind.CLASSIFICATION,
  EvidenceKind.EXTRACTED_METADATA,
]);

export type DerivedExtractionParent = OriginalArchiveEntry | DerivedExtractionProposalRecord;

function parentEvidence(parent: DerivedExtractionParent): EvidenceReference {
  return parent instanceof OriginalArchiveEntry ? parent.originalArtifact : parent.derivedEvidence;
}

function parentTime(parent: DerivedExtractionParent): UtcInstant {
  return parent instanceof OriginalArchiveEntry ? parent.archivedAt : parent.derivedEvidence.acquiredAt;
}

function rootOriginal(parent: DerivedExtractionParent): OriginalArchiveEntry {
  return parent instanceof OriginalArchiveEntry ? parent : parent.rootOriginalArchiveEntry;
}

function parentLineage(parent: DerivedExtractionParent): readonly EvidenceId[] {
  if (parent instanceof OriginalArchiveEntry) {
    return Object.freeze([parent.originalArtifact.id]);
  }
  return parent.lineageEvidenceIds;
}

function canonicalProposalKey(item: ExtractionFieldProposal): string {
  return JSON.stringify(item.toJSON());
}

export class DerivedExtractionProposalRecord {
  readonly derivedEvidence: EvidenceReference;
  readonly parent: DerivedExtractionParent;
  readonly rootOriginalArchiveEntry: OriginalArchiveEntry;
  readonly processor: ExtractionProcessorReference;
  readonly proposals: readonly ExtractionFieldProposal[];
  readonly lineageEvidenceIds: readonly EvidenceId[];

  private constructor(input: {
    readonly derivedEvidence: EvidenceReference;
    readonly parent: DerivedExtractionParent;
    readonly rootOriginalArchiveEntry: OriginalArchiveEntry;
    readonly processor: ExtractionProcessorReference;
    readonly proposals: readonly ExtractionFieldProposal[];
    readonly lineageEvidenceIds: readonly EvidenceId[];
  }) {
    this.derivedEvidence = input.derivedEvidence;
    this.parent = input.parent;
    this.rootOriginalArchiveEntry = input.rootOriginalArchiveEntry;
    this.processor = input.processor;
    this.proposals = input.proposals;
    this.lineageEvidenceIds = input.lineageEvidenceIds;
    Object.freeze(this);
  }

  static create(input: {
    readonly derivedEvidence: EvidenceReference;
    readonly parent: DerivedExtractionParent;
    readonly processor: ExtractionProcessorReference;
    readonly proposals?: readonly ExtractionFieldProposal[];
  }): DerivedExtractionProposalRecord {
    if (!(input.derivedEvidence instanceof EvidenceReference)) {
      throw new TypeError('Derived extraction proposal requires EvidenceReference');
    }
    if (input.derivedEvidence.evidenceClass !== EvidenceClass.DERIVED) {
      throw new TypeError('Derived extraction proposal requires DERIVED evidence');
    }
    if (!DERIVED_EXTRACTION_KINDS.has(input.derivedEvidence.kind)) {
      throw new TypeError('Derived extraction proposal requires a supported derived extraction kind');
    }
    if (
      !(input.parent instanceof OriginalArchiveEntry)
      && !(input.parent instanceof DerivedExtractionProposalRecord)
    ) {
      throw new TypeError('Derived extraction proposal requires an immutable original or derived parent');
    }
    if (!(input.processor instanceof ExtractionProcessorReference)) {
      throw new TypeError('Derived extraction proposal requires ExtractionProcessorReference');
    }
    if (input.derivedEvidence.verificationState.toString() === VerificationStateCode.VERIFIED) {
      throw new TypeError('Extraction proposal cannot be VERIFIED without a later approved verification path');
    }

    const directParentEvidence = parentEvidence(input.parent);
    if (
      input.derivedEvidence.derivationParent?.toString()
      !== directParentEvidence.id.toString()
    ) {
      throw new TypeError('Derived extraction evidence must reference the exact direct parent evidence ID');
    }

    if (
      input.derivedEvidence.acquiredAt.toEpochMilliseconds()
      < parentTime(input.parent).toEpochMilliseconds()
    ) {
      throw new RangeError('Derived extraction evidence must not predate its direct parent lineage state');
    }

    const inheritedLineage = parentLineage(input.parent);
    const currentId = input.derivedEvidence.id.toString();
    if (inheritedLineage.some((id) => id.toString() === currentId)) {
      throw new TypeError('Derived extraction lineage must not repeat an evidence ID');
    }

    const proposals = [...(input.proposals ?? [])];
    for (const proposal of proposals) {
      if (!(proposal instanceof ExtractionFieldProposal)) {
        throw new TypeError('Derived extraction proposals must use ExtractionFieldProposal');
      }
    }
    proposals.sort((left, right) => {
      const leftKey = canonicalProposalKey(left);
      const rightKey = canonicalProposalKey(right);
      if (leftKey < rightKey) return -1;
      if (leftKey > rightKey) return 1;
      return 0;
    });
    const frozenProposals = Object.freeze(proposals);
    const lineageEvidenceIds = Object.freeze([...inheritedLineage, input.derivedEvidence.id]);
    const original = rootOriginal(input.parent);

    return new DerivedExtractionProposalRecord({
      derivedEvidence: input.derivedEvidence,
      parent: input.parent,
      rootOriginalArchiveEntry: original,
      processor: input.processor,
      proposals: frozenProposals,
      lineageEvidenceIds,
    });
  }

  toJSON() {
    const directParent = parentEvidence(this.parent);
    return Object.freeze({
      derivedEvidenceId: this.derivedEvidence.id.toString(),
      derivedEvidenceKind: this.derivedEvidence.kind,
      derivedEvidenceClass: this.derivedEvidence.evidenceClass,
      derivedVerificationState: this.derivedEvidence.verificationState.toString(),
      directParentEvidenceId: directParent.id.toString(),
      rootOriginalEvidenceId: this.rootOriginalArchiveEntry.originalArtifact.id.toString(),
      acquiredAt: this.derivedEvidence.acquiredAt.toString(),
      processor: this.processor.toJSON(),
      proposals: Object.freeze(this.proposals.map((proposal) => proposal.toJSON())),
      lineageEvidenceIds: Object.freeze(this.lineageEvidenceIds.map((id) => id.toString())),
    });
  }
}
