import { EventId, Revision, VersionId } from '../../core/src/index.ts';
import { TenantScopeReference } from '../../application/src/index.ts';
import {
  MigrationDefinition,
  MigrationPhase,
  OutboxDeliveryMessage,
} from '../src/index.ts';

const migration = MigrationDefinition.create({
  id: '0001_compile_test',
  file: '0001_compile_test.sql',
  phase: MigrationPhase.BASELINE,
  checksumSha256: 'a'.repeat(64),
});
void migration;

// @ts-expect-error Applied migration definitions are immutable.
migration.id = '9999_mutated';

const message = OutboxDeliveryMessage.create({
  eventId: EventId.from('018f22e2-79b0-7cc3-98c4-dc0c0c075101'),
  tenantScope: TenantScopeReference.from('tenant:compile'),
  streamKey: 'stream:compile',
  aggregateRevision: Revision.from(1),
  eventType: 'COMPILE_EVENT',
  payloadVersion: VersionId.from('event-v1'),
  payload: { value: 'stable' },
});
void message;

// @ts-expect-error Stable event identity cannot be reassigned.
message.eventId = EventId.from('018f22e2-79b0-7cc3-98c4-dc0c0c075102');
