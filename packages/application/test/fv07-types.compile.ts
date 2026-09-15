import { AggregateId, CommandId, EventId, Revision, VersionId } from '../../core/src/index.ts';
import {
  AuditReference,
  OutboxRecord,
  TenantScopeReference,
} from '../src/index.ts';
import type { AcceptedMutation, TenantScopedRepository } from '../src/index.ts';

interface DomainValue { readonly value: string; }
declare const repository: TenantScopedRepository<DomainValue>;
const tenant = TenantScopeReference.from('tenant:compile');
const aggregateId = AggregateId.from('018f22e2-79b0-7cc3-98c4-dc0c0c074101');
void repository.load(tenant, aggregateId);

// @ts-expect-error Tenant-scoped repositories require an explicit TenantScopeReference.
void repository.load('tenant:compile', aggregateId);

const accepted: AcceptedMutation<DomainValue, { readonly kind: string }, string> = {
  tenantScope: tenant,
  commandId: CommandId.from('018f22e2-79b0-7cc3-98c4-dc0c0c074102'),
  aggregateId,
  expectedRevision: Revision.initial(),
  nextRevision: Revision.from(1),
  authoritativeState: { value: 'next' },
  eventId: EventId.from('018f22e2-79b0-7cc3-98c4-dc0c0c074103'),
  event: { kind: 'CHANGED' },
  outbox: OutboxRecord.create(EventId.from('018f22e2-79b0-7cc3-98c4-dc0c0c074104'), 'changed', VersionId.from('event-v1')),
  outcome: 'OK',
  auditReference: AuditReference.from('audit:compile'),
};
void accepted;

// @ts-expect-error Accepted mutation contract is immutable.
accepted.outcome = 'MUTATED';
