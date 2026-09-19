import { AggregateId, CommandId, Revision } from '../../core/src/index.ts';
import { TenantScopeReference } from '../src/references.ts';
import type { TenantScopedRepository, VersionedAggregate } from '../src/persistence/repository.ts';
import {
  OptimisticConcurrencyConflict,
  UnitOfWorkCommitStatus,
} from '../src/persistence/unit-of-work.ts';
import type {
  AcceptedMutation,
  UnitOfWorkCommitResult,
  UnitOfWorkPort,
} from '../src/persistence/unit-of-work.ts';

interface StoredAggregate {
  readonly value: unknown;
  readonly revision: Revision;
}

interface StoredCommit {
  readonly result: UnitOfWorkCommitResult<unknown>;
}

export interface InMemoryUnitOfWorkSnapshot {
  readonly aggregates: number;
  readonly events: number;
  readonly outbox: number;
  readonly outcomes: number;
  readonly audits: number;
}

function aggregateKey(tenantScope: TenantScopeReference, aggregateId: AggregateId): string {
  return `${tenantScope.toString()}::${aggregateId.toString()}`;
}

function commandKey(tenantScope: TenantScopeReference, commandId: CommandId): string {
  return `${tenantScope.toString()}::${commandId.toString()}`;
}

export class InMemoryUnitOfWork implements UnitOfWorkPort {
  private aggregates = new Map<string, StoredAggregate>();
  private commits = new Map<string, StoredCommit>();
  private events: unknown[] = [];
  private outbox: unknown[] = [];
  private outcomes: unknown[] = [];
  private audits: string[] = [];
  private active = false;
  private failBeforeCommit = false;

  repository<TAggregate>(): TenantScopedRepository<TAggregate> {
    return {
      load: async (tenantScope, aggregateId) => {
        const stored = this.aggregates.get(aggregateKey(tenantScope, aggregateId));
        if (!stored) return null;
        return {
          aggregateId,
          revision: stored.revision,
          value: stored.value as TAggregate,
        } satisfies VersionedAggregate<TAggregate>;
      },
    };
  }

  seedAggregate<TAggregate>(
    tenantScope: TenantScopeReference,
    aggregateId: AggregateId,
    value: TAggregate,
    revision: Revision,
  ): void {
    this.aggregates.set(aggregateKey(tenantScope, aggregateId), { value, revision });
  }

  failNextCommit(): void {
    this.failBeforeCommit = true;
  }

  isTransactionActive(): boolean {
    return this.active;
  }

  snapshot(): InMemoryUnitOfWorkSnapshot {
    return Object.freeze({
      aggregates: this.aggregates.size,
      events: this.events.length,
      outbox: this.outbox.length,
      outcomes: this.outcomes.length,
      audits: this.audits.length,
    });
  }

  async commitAccepted<TState, TEvent, TOutcome>(
    mutation: AcceptedMutation<TState, TEvent, TOutcome>,
  ): Promise<UnitOfWorkCommitResult<TOutcome>> {
    const replayKey = commandKey(mutation.tenantScope, mutation.commandId);
    const replay = this.commits.get(replayKey);
    if (replay) {
      return Object.freeze({
        status: UnitOfWorkCommitStatus.REPLAYED,
        revision: replay.result.revision,
        outcome: replay.result.outcome as TOutcome,
      });
    }

    const key = aggregateKey(mutation.tenantScope, mutation.aggregateId);
    const current = this.aggregates.get(key);
    const actualRevision = current?.revision ?? Revision.initial();
    if (actualRevision.toNumber() !== mutation.expectedRevision.toNumber()) {
      throw new OptimisticConcurrencyConflict(mutation.expectedRevision, actualRevision);
    }
    if (mutation.nextRevision.toNumber() !== mutation.expectedRevision.toNumber() + 1) {
      throw new RangeError('Accepted mutation next revision must increment expected revision exactly once');
    }

    this.active = true;
    try {
      const nextAggregates = new Map(this.aggregates);
      const nextCommits = new Map(this.commits);
      const nextEvents = [...this.events, mutation.event];
      const nextOutbox = [...this.outbox, mutation.outbox];
      const nextOutcomes = [...this.outcomes, mutation.outcome];
      const nextAudits = [...this.audits, mutation.auditReference.toString()];

      nextAggregates.set(key, {
        value: mutation.authoritativeState,
        revision: mutation.nextRevision,
      });

      const result: UnitOfWorkCommitResult<TOutcome> = Object.freeze({
        status: UnitOfWorkCommitStatus.COMMITTED,
        revision: mutation.nextRevision,
        outcome: mutation.outcome,
      });
      nextCommits.set(replayKey, { result: result as UnitOfWorkCommitResult<unknown> });

      if (this.failBeforeCommit) {
        this.failBeforeCommit = false;
        throw new Error('Injected transaction failure before commit');
      }

      this.aggregates = nextAggregates;
      this.commits = nextCommits;
      this.events = nextEvents;
      this.outbox = nextOutbox;
      this.outcomes = nextOutcomes;
      this.audits = nextAudits;
      return result;
    } finally {
      this.active = false;
    }
  }
}
