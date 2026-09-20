import {
  ActorReference,
  EvidenceReference,
  SubjectReference,
  UtcInstant,
} from '../../../core/src/index.ts';
import { OrganizationScopeReference } from '../references.ts';
import {
  DocumentIntakeId,
  DocumentIntakeRecord,
  IntakeMediaMetadata,
  IntakeProcessingState,
  IntakeSecurityClassification,
  IntakeSourceChannel,
} from './document-intake.ts';

const MAX_REFERENCE_LENGTH = 512;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;

function normalizeReference(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > MAX_REFERENCE_LENGTH) throw new RangeError(`${label} is too long`);
  if (CONTROL_CHARACTER_PATTERN.test(normalized)) throw new TypeError(`${label} must not contain control characters`);
  return normalized;
}

export const IntakeTransportChannel = {
  CAMERA: 'CAMERA',
  SCAN: 'SCAN',
  FILE_UPLOAD: 'FILE_UPLOAD',
  EMAIL_ATTACHMENT: 'EMAIL_ATTACHMENT',
  SHARE_SHEET: 'SHARE_SHEET',
  URL: 'URL',
  PROVIDER_ADAPTER: 'PROVIDER_ADAPTER',
} as const;
export type IntakeTransportChannel = (typeof IntakeTransportChannel)[keyof typeof IntakeTransportChannel];

const DOCUMENT_CHANNEL_BY_TRANSPORT: Readonly<Record<IntakeTransportChannel, IntakeSourceChannel>> = Object.freeze({
  [IntakeTransportChannel.CAMERA]: IntakeSourceChannel.CAMERA,
  [IntakeTransportChannel.SCAN]: IntakeSourceChannel.SCAN,
  [IntakeTransportChannel.FILE_UPLOAD]: IntakeSourceChannel.FILE_UPLOAD,
  [IntakeTransportChannel.EMAIL_ATTACHMENT]: IntakeSourceChannel.EMAIL_ATTACHMENT,
  [IntakeTransportChannel.SHARE_SHEET]: IntakeSourceChannel.SHARE_SHEET,
  [IntakeTransportChannel.URL]: IntakeSourceChannel.URL,
  [IntakeTransportChannel.PROVIDER_ADAPTER]: IntakeSourceChannel.API,
});

export const ExternalIntakeSourceKind = {
  PROVIDER: 'PROVIDER',
  REGISTRY: 'REGISTRY',
} as const;
export type ExternalIntakeSourceKind = (typeof ExternalIntakeSourceKind)[keyof typeof ExternalIntakeSourceKind];
const EXTERNAL_SOURCE_KINDS = new Set<string>(Object.values(ExternalIntakeSourceKind));

export class IntakeChannelProvenance {
  readonly transportChannel: IntakeTransportChannel;
  readonly captureReference: string | null;
  readonly scanReference: string | null;
  readonly uploadReference: string | null;
  readonly messageReference: string | null;
  readonly attachmentReference: string | null;
  readonly sourceApplicationReference: string | null;
  readonly shareReference: string | null;
  readonly sourceUrlReference: string | null;
  readonly retrievalReference: string | null;
  readonly externalSourceKind: ExternalIntakeSourceKind | null;
  readonly adapterReference: string | null;
  readonly externalRecordReference: string | null;

  private constructor(input: {
    readonly transportChannel: IntakeTransportChannel;
    readonly captureReference?: string | null;
    readonly scanReference?: string | null;
    readonly uploadReference?: string | null;
    readonly messageReference?: string | null;
    readonly attachmentReference?: string | null;
    readonly sourceApplicationReference?: string | null;
    readonly shareReference?: string | null;
    readonly sourceUrlReference?: string | null;
    readonly retrievalReference?: string | null;
    readonly externalSourceKind?: ExternalIntakeSourceKind | null;
    readonly adapterReference?: string | null;
    readonly externalRecordReference?: string | null;
  }) {
    this.transportChannel = input.transportChannel;
    this.captureReference = input.captureReference ?? null;
    this.scanReference = input.scanReference ?? null;
    this.uploadReference = input.uploadReference ?? null;
    this.messageReference = input.messageReference ?? null;
    this.attachmentReference = input.attachmentReference ?? null;
    this.sourceApplicationReference = input.sourceApplicationReference ?? null;
    this.shareReference = input.shareReference ?? null;
    this.sourceUrlReference = input.sourceUrlReference ?? null;
    this.retrievalReference = input.retrievalReference ?? null;
    this.externalSourceKind = input.externalSourceKind ?? null;
    this.adapterReference = input.adapterReference ?? null;
    this.externalRecordReference = input.externalRecordReference ?? null;
    Object.freeze(this);
  }

  static camera(captureReference: string): IntakeChannelProvenance {
    return new IntakeChannelProvenance({
      transportChannel: IntakeTransportChannel.CAMERA,
      captureReference: normalizeReference(captureReference, 'Camera capture reference'),
    });
  }

  static scan(scanReference: string): IntakeChannelProvenance {
    return new IntakeChannelProvenance({
      transportChannel: IntakeTransportChannel.SCAN,
      scanReference: normalizeReference(scanReference, 'Scan reference'),
    });
  }

  static fileUpload(uploadReference: string): IntakeChannelProvenance {
    return new IntakeChannelProvenance({
      transportChannel: IntakeTransportChannel.FILE_UPLOAD,
      uploadReference: normalizeReference(uploadReference, 'File upload reference'),
    });
  }

  static emailAttachment(messageReference: string, attachmentReference: string): IntakeChannelProvenance {
    return new IntakeChannelProvenance({
      transportChannel: IntakeTransportChannel.EMAIL_ATTACHMENT,
      messageReference: normalizeReference(messageReference, 'Email message reference'),
      attachmentReference: normalizeReference(attachmentReference, 'Email attachment reference'),
    });
  }

  static shareSheet(sourceApplicationReference: string, shareReference: string): IntakeChannelProvenance {
    return new IntakeChannelProvenance({
      transportChannel: IntakeTransportChannel.SHARE_SHEET,
      sourceApplicationReference: normalizeReference(sourceApplicationReference, 'Share-sheet source application reference'),
      shareReference: normalizeReference(shareReference, 'Share-sheet transfer reference'),
    });
  }

  static url(sourceUrlReference: string, retrievalReference: string): IntakeChannelProvenance {
    return new IntakeChannelProvenance({
      transportChannel: IntakeTransportChannel.URL,
      sourceUrlReference: normalizeReference(sourceUrlReference, 'URL source reference'),
      retrievalReference: normalizeReference(retrievalReference, 'URL retrieval reference'),
    });
  }

  static providerAdapter(input: {
    readonly sourceKind: ExternalIntakeSourceKind;
    readonly adapterReference: string;
    readonly externalRecordReference: string;
  }): IntakeChannelProvenance {
    if (!EXTERNAL_SOURCE_KINDS.has(input.sourceKind)) {
      throw new TypeError('External intake source kind must be controlled');
    }
    return new IntakeChannelProvenance({
      transportChannel: IntakeTransportChannel.PROVIDER_ADAPTER,
      externalSourceKind: input.sourceKind,
      adapterReference: normalizeReference(input.adapterReference, 'Provider adapter reference'),
      externalRecordReference: normalizeReference(input.externalRecordReference, 'External record reference'),
    });
  }

  toJSON(): Readonly<Record<string, string>> {
    switch (this.transportChannel) {
      case IntakeTransportChannel.CAMERA:
        return Object.freeze({ transportChannel: this.transportChannel, captureReference: this.captureReference! });
      case IntakeTransportChannel.SCAN:
        return Object.freeze({ transportChannel: this.transportChannel, scanReference: this.scanReference! });
      case IntakeTransportChannel.FILE_UPLOAD:
        return Object.freeze({ transportChannel: this.transportChannel, uploadReference: this.uploadReference! });
      case IntakeTransportChannel.EMAIL_ATTACHMENT:
        return Object.freeze({
          transportChannel: this.transportChannel,
          messageReference: this.messageReference!,
          attachmentReference: this.attachmentReference!,
        });
      case IntakeTransportChannel.SHARE_SHEET:
        return Object.freeze({
          transportChannel: this.transportChannel,
          sourceApplicationReference: this.sourceApplicationReference!,
          shareReference: this.shareReference!,
        });
      case IntakeTransportChannel.URL:
        return Object.freeze({
          transportChannel: this.transportChannel,
          sourceUrlReference: this.sourceUrlReference!,
          retrievalReference: this.retrievalReference!,
        });
      case IntakeTransportChannel.PROVIDER_ADAPTER:
        return Object.freeze({
          transportChannel: this.transportChannel,
          externalSourceKind: this.externalSourceKind!,
          adapterReference: this.adapterReference!,
          externalRecordReference: this.externalRecordReference!,
        });
    }
  }
}

export interface MultiChannelIntakeSubmissionInput {
  readonly id: DocumentIntakeId;
  readonly provenance: IntakeChannelProvenance;
  readonly receivedAt: UtcInstant;
  readonly receivedBy: ActorReference;
  readonly subject?: SubjectReference | null;
  readonly organization?: OrganizationScopeReference | null;
  readonly originalArtifact: EvidenceReference;
  readonly media: IntakeMediaMetadata;
  readonly securityClassification: IntakeSecurityClassification;
}

export class MultiChannelIntakeSubmission {
  readonly record: DocumentIntakeRecord;
  readonly provenance: IntakeChannelProvenance;

  private constructor(record: DocumentIntakeRecord, provenance: IntakeChannelProvenance) {
    this.record = record;
    this.provenance = provenance;
    Object.freeze(this);
  }

  static create(input: MultiChannelIntakeSubmissionInput): MultiChannelIntakeSubmission {
    if (!(input.provenance instanceof IntakeChannelProvenance)) {
      throw new TypeError('Multi-channel intake requires IntakeChannelProvenance');
    }

    const record = DocumentIntakeRecord.create({
      id: input.id,
      sourceChannel: DOCUMENT_CHANNEL_BY_TRANSPORT[input.provenance.transportChannel],
      receivedAt: input.receivedAt,
      receivedBy: input.receivedBy,
      subject: input.subject ?? null,
      organization: input.organization ?? null,
      originalArtifact: input.originalArtifact,
      media: input.media,
      securityClassification: input.securityClassification,
      processingState: IntakeProcessingState.RECEIVED,
    });

    return new MultiChannelIntakeSubmission(record, input.provenance);
  }

  get id(): DocumentIntakeId { return this.record.id; }
  get transportChannel(): IntakeTransportChannel { return this.provenance.transportChannel; }
  get receivedAt(): UtcInstant { return this.record.receivedAt; }
  get receivedBy(): ActorReference { return this.record.receivedBy; }
  get subject(): SubjectReference | null { return this.record.subject; }
  get organization(): OrganizationScopeReference | null { return this.record.organization; }
  get originalArtifact(): EvidenceReference { return this.record.originalArtifact; }
  get media(): IntakeMediaMetadata { return this.record.media; }
  get securityClassification(): IntakeSecurityClassification { return this.record.securityClassification; }

  toDocumentIntakeRecord(): DocumentIntakeRecord {
    return this.record;
  }

  toJSON() {
    return Object.freeze({
      id: this.record.id.toString(),
      transportChannel: this.provenance.transportChannel,
      documentSourceChannel: this.record.sourceChannel,
      receivedAt: this.record.receivedAt.toString(),
      receivedBy: this.record.receivedBy.toJSON(),
      subject: this.record.subject?.toJSON() ?? null,
      organization: this.record.organization?.toString() ?? null,
      originalEvidenceId: this.record.originalArtifact.id.toString(),
      originalContentReference: this.record.originalArtifact.contentReference,
      originalContentHash: this.record.originalArtifact.contentHash?.toJSON() ?? null,
      media: Object.freeze({
        mediaType: this.record.media.mediaType,
        byteLength: this.record.media.byteLength,
        originalFileName: this.record.media.originalFileName,
      }),
      securityClassification: this.record.securityClassification,
      processingState: this.record.processingState,
      provenance: this.provenance.toJSON(),
    });
  }
}

export interface ProviderIntakeProvenanceObservation {
  readonly sourceKind: ExternalIntakeSourceKind;
  readonly externalRecordReference: string;
}

export interface IntakeProviderAdapterPort<ProviderInput = unknown> {
  readonly adapterReference: string;
  normalizeProvenance(input: ProviderInput): ProviderIntakeProvenanceObservation;
}

export function normalizeProviderIntakeProvenance<ProviderInput>(
  adapter: IntakeProviderAdapterPort<ProviderInput>,
  input: ProviderInput,
): IntakeChannelProvenance {
  if (adapter === null || typeof adapter !== 'object') {
    throw new TypeError('Provider intake adapter must be an object');
  }
  const adapterReference = normalizeReference(adapter.adapterReference, 'Provider adapter reference');
  if (typeof adapter.normalizeProvenance !== 'function') {
    throw new TypeError('Provider intake adapter must normalize provenance');
  }
  const observation = adapter.normalizeProvenance(input);
  if (observation === null || typeof observation !== 'object') {
    throw new TypeError('Provider intake adapter must return a provenance observation');
  }

  return IntakeChannelProvenance.providerAdapter({
    sourceKind: observation.sourceKind,
    adapterReference,
    externalRecordReference: observation.externalRecordReference,
  });
}
