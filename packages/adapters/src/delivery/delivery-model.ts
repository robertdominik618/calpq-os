import {
  CommandId,
  CorrelationId,
  EventId,
  Revision,
  VersionId,
} from '../../../core/src/index.ts';
import { TenantScopeReference } from '../../../application/src/index.ts';

export const DeliveryState = {
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
} as const;
export type DeliveryState = (typeof DeliveryState)[keyof typeof DeliveryState];

function requiredText(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 256) throw new RangeError(`${label} is too long`);
  return normalized;
}

function freezePayload(payload: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> {
  return Object.freeze({ ...payload });
}

export interface OutboxDeliveryMessageInput {
  readonly eventId: EventId;
  readonly tenantScope: TenantScopeReference;
  readonly streamKey: string;
  readonly aggregateRevision: Revision;
  readonly eventType: string;
  readonly payloadVersion: VersionId;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId?: CorrelationId | null;
  readonly causationId?: CommandId | EventId | null;
}

export class OutboxDeliveryMessage {
  readonly eventId: EventId;
  readonly tenantScope: TenantScopeReference;
  readonly streamKey: string;
  readonly aggregateRevision: Revision;
  readonly eventType: string;
  readonly payloadVersion: VersionId;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly correlationId: CorrelationId | null;
  readonly causationId: CommandId | EventId | null;

  private constructor(input: OutboxDeliveryMessageInput) {
    this.eventId = input.eventId;
    this.tenantScope = input.tenantScope;
    this.streamKey = requiredText(input.streamKey, 'Stream key');
    this.aggregateRevision = input.aggregateRevision;
    this.eventType = requiredText(input.eventType, 'Event type');
    this.payloadVersion = input.payloadVersion;
    this.payload = freezePayload(input.payload);
    this.correlationId = input.correlationId ?? null;
    this.causationId = input.causationId ?? null;
    Object.freeze(this);
  }

  static create(input: OutboxDeliveryMessageInput): OutboxDeliveryMessage {
    if (!(input.eventId instanceof EventId)) throw new TypeError('Delivery message requires EventId');
    if (!(input.tenantScope instanceof TenantScopeReference)) throw new TypeError('Delivery message requires tenant scope');
    if (!(input.aggregateRevision instanceof Revision)) throw new TypeError('Delivery message requires aggregate Revision');
    if (!(input.payloadVersion instanceof VersionId)) throw new TypeError('Delivery message requires payload VersionId');
    if (input.correlationId != null && !(input.correlationId instanceof CorrelationId)) {
      throw new TypeError('Delivery correlation requires CorrelationId');
    }
    if (input.causationId != null && !(input.causationId instanceof CommandId) && !(input.causationId instanceof EventId)) {
      throw new TypeError('Delivery causation requires CommandId or EventId');
    }
    if (typeof input.payload !== 'object' || input.payload === null || Array.isArray(input.payload)) {
      throw new TypeError('Delivery payload must be a record');
    }
    return new OutboxDeliveryMessage(input);
  }
}

export class InboxDeduplicationKey {
  readonly consumerId: string;
  readonly eventId: EventId;

  private constructor(consumerId: string, eventId: EventId) {
    this.consumerId = requiredText(consumerId, 'Consumer id');
    this.eventId = eventId;
    Object.freeze(this);
  }

  static create(consumerId: string, eventId: EventId): InboxDeduplicationKey {
    if (!(eventId instanceof EventId)) throw new TypeError('Inbox key requires EventId');
    return new InboxDeduplicationKey(consumerId, eventId);
  }

  toString(): string {
    return `${this.consumerId}::${this.eventId.toString()}`;
  }
}

export class DeliveryReviewRecord {
  readonly eventId: EventId;
  readonly consumerId: string | null;
  readonly reasonCode: string;
  readonly errorSummary: string;

  private constructor(eventId: EventId, consumerId: string | null, reasonCode: string, errorSummary: string) {
    this.eventId = eventId;
    this.consumerId = consumerId === null ? null : requiredText(consumerId, 'Consumer id');
    this.reasonCode = requiredText(reasonCode, 'Review reason code');
    this.errorSummary = requiredText(errorSummary, 'Review error summary');
    Object.freeze(this);
  }

  static create(input: {
    readonly eventId: EventId;
    readonly consumerId?: string | null;
    readonly reasonCode: string;
    readonly errorSummary: string;
  }): DeliveryReviewRecord {
    if (!(input.eventId instanceof EventId)) throw new TypeError('Delivery review requires EventId');
    return new DeliveryReviewRecord(
      input.eventId,
      input.consumerId ?? null,
      input.reasonCode,
      input.errorSummary,
    );
  }
}

/** Operational only; never authoritative domain truth. */
export class ConsumerCheckpoint {
  readonly consumerId: string;
  readonly streamKey: string;
  readonly sourcePosition: string;

  private constructor(consumerId: string, streamKey: string, sourcePosition: string) {
    this.consumerId = requiredText(consumerId, 'Consumer id');
    this.streamKey = requiredText(streamKey, 'Stream key');
    this.sourcePosition = requiredText(sourcePosition, 'Source position');
    Object.freeze(this);
  }

  static create(consumerId: string, streamKey: string, sourcePosition: string): ConsumerCheckpoint {
    return new ConsumerCheckpoint(consumerId, streamKey, sourcePosition);
  }
}
