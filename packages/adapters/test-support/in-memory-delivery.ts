import { EventId } from '../../core/src/index.ts';
import {
  ConsumerCheckpoint,
  DeliveryReviewRecord,
  DeliveryState,
  InboxDeduplicationKey,
  OutboxDeliveryMessage,
} from '../src/delivery/delivery-model.ts';

interface DeliveryRecord {
  readonly message: OutboxDeliveryMessage;
  state: DeliveryState;
  attempts: number;
  lastError: string | null;
}

export class InMemoryAtLeastOnceOutbox {
  private readonly records = new Map<string, DeliveryRecord>();
  private readonly reviewRecords: DeliveryReviewRecord[] = [];

  enqueue(message: OutboxDeliveryMessage): void {
    const id = message.eventId.toString();
    if (this.records.has(id)) throw new Error(`Duplicate outbox event id: ${id}`);
    this.records.set(id, {
      message,
      state: DeliveryState.PENDING,
      attempts: 0,
      lastError: null,
    });
  }

  getPending(eventId: EventId): OutboxDeliveryMessage | null {
    const record = this.records.get(eventId.toString());
    if (!record || record.state !== DeliveryState.PENDING) return null;
    return record.message;
  }

  stateOf(eventId: EventId): DeliveryState | null {
    return this.records.get(eventId.toString())?.state ?? null;
  }

  attemptsOf(eventId: EventId): number {
    return this.records.get(eventId.toString())?.attempts ?? 0;
  }

  markPublished(eventId: EventId): void {
    const record = this.requireRecord(eventId);
    if (record.state === DeliveryState.REVIEW_REQUIRED) {
      throw new Error('Review-required delivery cannot be silently marked published');
    }
    record.state = DeliveryState.PUBLISHED;
  }

  recordFailure(input: {
    readonly eventId: EventId;
    readonly errorSummary: string;
    readonly maxAttempts: number;
    readonly consumerId?: string | null;
    readonly reasonCode?: string;
  }): DeliveryState {
    if (!Number.isSafeInteger(input.maxAttempts) || input.maxAttempts <= 0) {
      throw new RangeError('maxAttempts must be a positive safe integer');
    }
    const record = this.requireRecord(input.eventId);
    if (record.state === DeliveryState.PUBLISHED) return record.state;

    record.attempts += 1;
    record.lastError = input.errorSummary;
    if (record.attempts >= input.maxAttempts) {
      record.state = DeliveryState.REVIEW_REQUIRED;
      this.reviewRecords.push(DeliveryReviewRecord.create({
        eventId: input.eventId,
        consumerId: input.consumerId ?? null,
        reasonCode: input.reasonCode ?? 'DELIVERY_UNPROCESSABLE',
        errorSummary: input.errorSummary,
      }));
    }
    return record.state;
  }

  reviews(): readonly DeliveryReviewRecord[] {
    return Object.freeze([...this.reviewRecords]);
  }

  private requireRecord(eventId: EventId): DeliveryRecord {
    const record = this.records.get(eventId.toString());
    if (!record) throw new Error(`Unknown outbox event: ${eventId.toString()}`);
    return record;
  }
}

export class InMemoryInboxDeduplicator {
  private readonly claimed = new Set<string>();

  claim(consumerId: string, eventId: EventId): boolean {
    const key = InboxDeduplicationKey.create(consumerId, eventId).toString();
    if (this.claimed.has(key)) return false;
    this.claimed.add(key);
    return true;
  }

  has(consumerId: string, eventId: EventId): boolean {
    return this.claimed.has(InboxDeduplicationKey.create(consumerId, eventId).toString());
  }
}

export class InMemoryCheckpointStore {
  private readonly checkpoints = new Map<string, ConsumerCheckpoint>();

  advance(checkpoint: ConsumerCheckpoint): void {
    this.checkpoints.set(`${checkpoint.consumerId}::${checkpoint.streamKey}`, checkpoint);
  }

  get(consumerId: string, streamKey: string): ConsumerCheckpoint | null {
    return this.checkpoints.get(`${consumerId}::${streamKey}`) ?? null;
  }
}
