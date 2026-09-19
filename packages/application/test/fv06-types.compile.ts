import {
  ActorId,
  ActorKind,
  ActorReference,
  CorrelationId,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VersionId,
} from '../../core/src/index.ts';
import {
  ApplicationExecutionContext,
  ApplicationOperationReference,
  OrganizationScopeReference,
  TenantScopeReference,
} from '../src/index.ts';
import type { ClockPort, IdGeneratorPort, UseCaseHandler } from '../src/index.ts';

const actor = ActorReference.create(
  ActorId.from('018f22e2-79b0-7cc3-98c4-dc0c0c073991'),
  ActorKind.HUMAN_USER,
);
const subject = SubjectReference.create(
  SubjectId.from('018f22e2-79b0-7cc3-98c4-dc0c0c073992'),
  SubjectKind.PERSON,
);
const tenant = TenantScopeReference.from('tenant:alpha');
const organization = OrganizationScopeReference.from('org:alpha');

ApplicationExecutionContext.create({
  operation: ApplicationOperationReference.from('op:compile'),
  actor,
  subject,
  tenantScope: tenant,
  organizationScope: organization,
  correlationId: CorrelationId.from('018f22e2-79b0-7cc3-98c4-dc0c0c073993'),
  requestedAt: UtcInstant.from('2026-09-15T06:30:00Z'),
  contractVersion: VersionId.from('application-v1'),
});

// @ts-expect-error Authentication actor and canonical subject are distinct semantic references.
ApplicationExecutionContext.create({ operation: ApplicationOperationReference.from('op:bad-actor'), actor: subject, correlationId: CorrelationId.from('018f22e2-79b0-7cc3-98c4-dc0c0c073994'), requestedAt: UtcInstant.from('2026-09-15T06:30:00Z'), contractVersion: VersionId.from('application-v1') });

// @ts-expect-error Tenant and organization scopes are nominally distinct.
const wrongOrganization: OrganizationScopeReference = tenant;
void wrongOrganization;

const clockPort: ClockPort = { now: () => UtcInstant.from('2026-09-15T06:30:00Z') };
void clockPort;

const idPort: IdGeneratorPort = {
  next(idType) {
    return idType.from('018f22e2-79b0-7cc3-98c4-dc0c0c073995');
  },
};
void idPort;

const handler: UseCaseHandler<{ readonly input: string }, string> = {
  execute(input, context) {
    return `${context.operation.toString()}:${input.input}`;
  },
};
void handler;
