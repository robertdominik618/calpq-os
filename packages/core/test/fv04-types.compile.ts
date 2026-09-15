import {
  AggregateId,
  AggregateSnapshot,
  AggregateType,
  CommandEnvelope,
  CommandId,
  CommandType,
  CorrelationId,
  DecisionId,
  EventEnvelope,
  EventId,
  EventType,
  ProvenanceEnvelope,
  Revision,
  RuleSetId,
  SubjectId,
  SubjectKind,
  SubjectReference,
  ActorId,
  ActorKind,
  ActorReference,
  UtcInstant,
  VersionId,
} from '../src/index.ts';

const UUIDS = {
  aggregate: '018f22e2-79b0-7cc3-98c4-dc0c0c075001',
  command: '018f22e2-79b0-7cc3-98c4-dc0c0c075002',
  correlation: '018f22e2-79b0-7cc3-98c4-dc0c0c075003',
  actor: '018f22e2-79b0-7cc3-98c4-dc0c0c075004',
  subject: '018f22e2-79b0-7cc3-98c4-dc0c0c075005',
  decision: '018f22e2-79b0-7cc3-98c4-dc0c0c075006',
  rules: '018f22e2-79b0-7cc3-98c4-dc0c0c075007',
} as const;

const now = UtcInstant.from('2026-09-15T05:30:00Z');
const actor = ActorReference.create(ActorId.from(UUIDS.actor), ActorKind.SYSTEM_PROCESS);
const subject = SubjectReference.create(SubjectId.from(UUIDS.subject), SubjectKind.DOMAIN_OBJECT);
const provenance = ProvenanceEnvelope.create({
  identity: DecisionId.from(UUIDS.decision),
  evaluatedAt: now,
  actor,
  subject,
  ruleSetId: RuleSetId.from(UUIDS.rules),
  ruleVersion: VersionId.from('rules-1'),
});

const snapshot = AggregateSnapshot.create({
  aggregateId: AggregateId.from(UUIDS.aggregate),
  aggregateType: AggregateType.from('TEST_AGGREGATE'),
  revision: Revision.from(0),
  creationProvenance: provenance,
  state: { enabled: true },
});
void snapshot;

const command = CommandEnvelope.create({
  commandId: CommandId.from(UUIDS.command),
  commandType: CommandType.from('ENABLE_TEST'),
  aggregateId: AggregateId.from(UUIDS.aggregate),
  expectedRevision: Revision.from(0),
  issuedAt: now,
  actor,
  correlationId: CorrelationId.from(UUIDS.correlation),
  payload: { enabled: true },
});
void command;

// @ts-expect-error expectedRevision must be a Revision value, not a number.
CommandEnvelope.create({ ...command, expectedRevision: 0 });

// @ts-expect-error AggregateId and CommandId are nominally distinct.
const wrongAggregateId: AggregateId = CommandId.from(UUIDS.command);
void wrongAggregateId;

declare const event: EventEnvelope<Readonly<Record<'enabled', boolean>>>;
// @ts-expect-error Event metadata is readonly after acceptance.
event.aggregateRevision = Revision.from(2);

function acceptEventType(value: EventType): EventType { return value; }
// @ts-expect-error CommandType and EventType are distinct semantic names.
acceptEventType(CommandType.from('ENABLE_TEST'));

const eventId: EventId = EventId.from('018f22e2-79b0-7cc3-98c4-dc0c0c075008');
void eventId;
