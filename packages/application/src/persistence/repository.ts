import { AggregateId, Revision } from '../../../core/src/index.ts';
import { TenantScopeReference } from '../references.ts';

export interface VersionedAggregate<TAggregate> {
  readonly aggregateId: AggregateId;
  readonly revision: Revision;
  readonly value: TAggregate;
}

/**
 * Tenant-scoped authoritative aggregate reader.
 * Writes intentionally do not exist on this port: accepted mutations persist through UnitOfWorkPort.
 */
export interface TenantScopedRepository<TAggregate> {
  load(
    tenantScope: TenantScopeReference,
    aggregateId: AggregateId,
  ): Promise<VersionedAggregate<TAggregate> | null>;
}
