import {
  ActorId,
  ActorKind,
  ActorReference,
  CredentialId,
  SubjectId,
  SubjectKind,
  SubjectReference,
} from '../src/index.ts';

const UUID_V7 = '018f22e2-79b0-7cc3-98c4-dc0c0c07398f';

function acceptCredentialId(value: CredentialId): CredentialId {
  return value;
}

function acceptActorReference(value: ActorReference): ActorReference {
  return value;
}

acceptCredentialId(CredentialId.from(UUID_V7));
acceptActorReference(ActorReference.create(ActorId.from(UUID_V7), ActorKind.HUMAN_USER));

// @ts-expect-error SubjectId and CredentialId are intentionally nominally distinct.
acceptCredentialId(SubjectId.from(UUID_V7));

const subject = SubjectReference.create(SubjectId.from(UUID_V7), SubjectKind.PERSON);
// @ts-expect-error ActorReference and SubjectReference are intentionally distinct.
acceptActorReference(subject);
