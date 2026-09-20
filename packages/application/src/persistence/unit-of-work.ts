import {
  AggregateId,
  CommandId,
  EventId,
  Revision,
  VersionId,
} from '../../../core/src/index.ts';
import { TenantScopeReference } from '../references.ts';

function normalizeReference(value: string, label: string): string {
  if (typeof value !== 'string') throw new TypeError(`${label} must be text`);
  const normalized = value.trim();
  if (normalized.length === 0) throw new TypeError(`${label} must not be empty`);
  if (normalized.length > 256) throw new RangeError(`${label} is too long`);
  return normalized;
}

export class AuditReference {
  readonly #value: string;
  private constructor(value: string) {
    this.#value = normalizeReference(value, 'Audit reference');
    Object.freeze(this);
  }
  static from(value: string): AuditReference { return new AuditReference(value); }
  toString(): string { return this.#value; }
}

export class OutboxRecord {
  readonly eventId: EventId;
  readonly topic: string;
  readonly payloadVersion: VersionId;

  private constructor(eventId: EventId, topic: string, payloadVersion: VersionId) {
    this.eventId = eventId;
    this.topic = normalizeReference(topic, 'Outbox topic');
    this.payloadVersion = payloadVersion;
    Object.freeze(this);
  }

  static create(eventId: EventId, topic: string, payloadVersion: VersionId): OutboxRecord {
    if (!(eventId instanceof EventId)) throw new TypeError('Outbox record requires EventId');
    if (!(payloadVersion instanceof VersionId)) throw new TypeError('Outbox record requires payload VersionId');
    return new OutboxRecord(eventId, topic, payloadVersion);
  }
}

export interface AcceptedMutation<TState, TEvent, TOutcome> {
  readonly tenantScope: TenantScopeReference;
  readonly commandId: CommandId;
  readonly aggregateId: AggregateId;
  readonly expectedRevision: Revision;
  readonly nextRevision: Revision;
  readonly authoritativeState: TState;
  readonly eventId: EventId;
  readonly event: TEvent;
  readonly outbox: OutboxRecord;
  readonly outcome: TOutcome;
  readonly auditReference: AuditReference;
}

export const UnitOfWorkCommitStatus = {
  COMMITTED: 'COMMITTED',
  REPLAYED: 'REPLAYED',
} as const;
export type UnitOfWorkCommitStatus = (typeof UnitOfWorkCommitStatus)[keyof typeof UnitOfWorkCommitStatus];

export interface UnitOfWorkCommitResult<TOutcome> {
  readonly status: UnitOfWorkCommitStatus;
  readonly revision: Revision;
  readonly outcome: TOutcome;
}

export interface UnitOfWorkPort {
  commitAccepted<TState, TEvent, TOutcome>(
    mutation: AcceptedMutation<TState, TEvent, TOutcome>,
  ): Promise<UnitOfWorkCommitResult<TOutcome>>;
}

export class OptimisticConcurrencyConflict extends Error {
  readonly expectedRevision: Revision;
  readonly actualRevision: Revision;

  constructor(expectedRevision: Revision, actualRevision: Revision) {
    super(`Expected revision ${expectedRevision.toNumber()} but found ${actualRevision.toNumber()}`);
    this.name = 'OptimisticConcurrencyConflict';
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}
