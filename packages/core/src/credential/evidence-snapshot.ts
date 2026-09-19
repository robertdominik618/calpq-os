import { EvidenceId, SourceId } from '../ids.ts';
import { UtcInstant } from '../time.ts';
import { VersionId } from '../version.ts';
import { VerificationState } from '../verification-state.ts';
import { ContentHash } from '../provenance/content-hash.ts';
import {
  EvidenceClass,
  EvidenceKind,
  EvidenceReference,
} from '../provenance/evidence-reference.ts';

export class EvidenceSnapshotEntry {
  readonly evidenceId: EvidenceId;
  readonly evidenceClass: EvidenceClass;
  readonly evidenceKind: EvidenceKind;
  readonly contentReference: string;
  readonly contentHash: ContentHash | null;
  readonly verificationState: VerificationState;
  readonly sourceId: SourceId | null;
  readonly sourceVersion: VersionId | null;

  private constructor(evidence: EvidenceReference) {
    this.evidenceId = evidence.id;
    this.evidenceClass = evidence.evidenceClass;
    this.evidenceKind = evidence.kind;
    this.contentReference = evidence.contentReference;
    this.contentHash = evidence.contentHash;
    this.verificationState = evidence.verificationState;
    this.sourceId = evidence.source?.id ?? null;
    this.sourceVersion = evidence.source?.version ?? null;
    Object.freeze(this);
  }

  static fromEvidence(evidence: EvidenceReference): EvidenceSnapshotEntry {
    if (!(evidence instanceof EvidenceReference)) {
      throw new TypeError('Evidence snapshot entry requires EvidenceReference');
    }
    return new EvidenceSnapshotEntry(evidence);
  }
}

export class EvidenceSnapshot {
  readonly capturedAt: UtcInstant;
  readonly entries: readonly EvidenceSnapshotEntry[];

  private constructor(capturedAt: UtcInstant, entries: readonly EvidenceSnapshotEntry[]) {
    this.capturedAt = capturedAt;
    this.entries = Object.freeze([...entries]);
    Object.freeze(this);
  }

  static capture(evidence: readonly EvidenceReference[], capturedAt: UtcInstant): EvidenceSnapshot {
    if (!(capturedAt instanceof UtcInstant)) {
      throw new TypeError('Evidence snapshot requires captured-at UtcInstant');
    }
    if (!Array.isArray(evidence) || evidence.length === 0) {
      throw new TypeError('Evidence snapshot requires at least one evidence reference');
    }

    const entries = evidence.map((item) => EvidenceSnapshotEntry.fromEvidence(item));
    const ids = entries.map((entry) => entry.evidenceId.toString());
    if (new Set(ids).size !== ids.length) {
      throw new TypeError('Evidence snapshot cannot contain duplicate evidence IDs');
    }

    return new EvidenceSnapshot(capturedAt, entries);
  }
}
