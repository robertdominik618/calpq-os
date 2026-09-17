import type {
  DerivedExtractionProposalRecord,
  ExtractionFieldProposal,
  ExtractionProcessorKind,
  ExtractionProcessorReference,
} from '../src/extraction/index.ts';

declare const record: DerivedExtractionProposalRecord;
declare const proposal: ExtractionFieldProposal;
declare const processor: ExtractionProcessorReference;

// @ts-expect-error derived evidence is immutable
record.derivedEvidence = record.derivedEvidence;

// @ts-expect-error parent lineage is immutable
record.parent = record.parent;

// @ts-expect-error root original archive is immutable
record.rootOriginalArchiveEntry = record.rootOriginalArchiveEntry;

// @ts-expect-error processor is immutable
record.processor = processor;

// @ts-expect-error proposal collection is readonly
record.proposals.push(proposal);

// @ts-expect-error lineage collection is readonly
record.lineageEvidenceIds.push(record.derivedEvidence.id);

// @ts-expect-error field path is immutable
proposal.fieldPath = 'replacement';

// @ts-expect-error processor kind is immutable
processor.kind = processor.kind;

// @ts-expect-error uncontrolled authority-bearing processor kind is rejected
const badProcessorKind: ExtractionProcessorKind = 'AUTO_VERIFIED';

void badProcessorKind;
