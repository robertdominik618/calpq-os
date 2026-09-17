import type { ContentHash } from '../../core/src/index.ts';
import {
  ArchiveByteIntegrityObservation,
  ArchiveByteIntegrityState,
  OriginalArchiveEntry,
  OriginalArchiveRelationship,
  OriginalArchiveRelationshipKind,
  OriginalContentAddress,
} from '../src/archive/original-document-archive.ts';
import type { OriginalArchiveEntryInput } from '../src/archive/original-document-archive.ts';

declare const entry: OriginalArchiveEntry;
declare const relationship: OriginalArchiveRelationship;
declare const address: OriginalContentAddress;
declare const observation: ArchiveByteIntegrityObservation;
declare const input: OriginalArchiveEntryInput;
declare const hash: ContentHash;

// @ts-expect-error archive fields are immutable
entry.storageObjectReference = 'mutated';
// @ts-expect-error original evidence binding is immutable
entry.originalArtifact = entry.originalArtifact;
// @ts-expect-error relationship endpoints are immutable
relationship.source = entry;
// @ts-expect-error content address hash is immutable
address.contentHash = hash;
// @ts-expect-error integrity state is immutable
observation.state = ArchiveByteIntegrityState.MISMATCH;
// @ts-expect-error input is readonly
input.storageObjectReference = 'mutated';
// @ts-expect-error uncontrolled byte-integrity vocabulary is rejected
const invalidIntegrityState: ArchiveByteIntegrityState = 'VERIFIED';
// @ts-expect-error uncontrolled archive relationship vocabulary is rejected
const invalidRelationshipKind: OriginalArchiveRelationshipKind = 'SUPERSEDES';

void entry;
void relationship;
void address;
void observation;
void input;
void hash;
void invalidIntegrityState;
void invalidRelationshipKind;
