import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActorId,
  ActorKind,
  ActorReference,
  CredentialId,
  DateOnly,
  Jurisdiction,
  JurisdictionCode,
  JurisdictionScope,
  Revision,
  SubjectId,
  SubjectKind,
  SubjectReference,
  UtcInstant,
  VerificationState,
  VerificationStateCode,
  VersionId,
} from '../src/index.ts';

const UUID_V7 = '018f22e2-79b0-7cc3-98c4-dc0c0c07398f';
const UUID_V7_UPPER = UUID_V7.toUpperCase();

test('FV01-01 valid UUIDv7 input is accepted for the correct semantic ID type', () => {
  assert.equal(SubjectId.from(UUID_V7).toString(), UUID_V7);
});

test('FV01-02 canonical serialization is lowercase UUID text', () => {
  assert.equal(SubjectId.from(UUID_V7_UPPER).toString(), UUID_V7);
});

test('FV01-03 invalid UUID input is rejected', () => {
  assert.throws(() => SubjectId.from('018f22e2-79b0-6cc3-98c4-dc0c0c07398f'), TypeError);
});

test('FV01-04 SubjectId cannot substitute for CredentialId without an explicit boundary', () => {
  const subjectId = SubjectId.from(UUID_V7);
  assert.equal(subjectId instanceof CredentialId, false);
  assert.throws(() => CredentialId.from(subjectId as unknown as string), TypeError);
});

test('FV01-05 an ID remains immutable after construction', () => {
  const id = SubjectId.from(UUID_V7);
  assert.equal(Object.isFrozen(id), true);
  assert.equal(id.toString(), UUID_V7);
});

test('FV01-06 database numeric identity is never accepted as CALPQ domain identity', () => {
  assert.throws(() => SubjectId.from(42 as unknown as string), TypeError);
});

test('FV01-07 persisted instant representation is absolute UTC', () => {
  const instant = UtcInstant.from('2026-09-15T06:00:00+02:00');
  assert.equal(instant.toString(), '2026-09-15T04:00:00.000Z');
});

test('FV01-08 canonical textual instant carries an explicit Z offset', () => {
  assert.match(UtcInstant.from('2026-09-15T04:00:00Z').toString(), /Z$/);
});

test('FV01-09 date-only and instant values are not interchangeable', () => {
  const date = DateOnly.from('2026-09-15');
  const instant = UtcInstant.from('2026-09-15T00:00:00Z');
  assert.equal(date instanceof UtcInstant, false);
  assert.notEqual(date.toString(), instant.toString());
});

test('FV01-10 Core primitive construction does not depend on global wall-clock access', () => {
  const originalNow = Date.now;
  Date.now = () => { throw new Error('wall clock access forbidden'); };
  try {
    assert.equal(UtcInstant.from('2026-09-15T04:00:00Z').toString(), '2026-09-15T04:00:00.000Z');
    assert.equal(DateOnly.from('2026-09-15').toString(), '2026-09-15');
  } finally {
    Date.now = originalNow;
  }
});

test('FV01-11 revision rejects negative values', () => {
  assert.throws(() => Revision.from(-1), RangeError);
});

test('FV01-12 revision is monotonic and not a timestamp', () => {
  const initial = Revision.initial();
  assert.equal(initial.toNumber(), 0);
  assert.equal(initial.next().toNumber(), 1);
});

test('FV01-13 version identifiers remain explicit and independent', () => {
  const version = VersionId.from('ruleset-2026.09');
  assert.equal(version.toString(), 'ruleset-2026.09');
  assert.notEqual(version.toString(), String(Revision.from(2026).toNumber()));
});

test('FV01-14 Actor and Subject are distinct semantic references', () => {
  const actor = ActorReference.create(ActorId.from(UUID_V7), ActorKind.HUMAN_USER);
  const subject = SubjectReference.create(SubjectId.from(UUID_V7), SubjectKind.PERSON);
  assert.equal(actor instanceof SubjectReference, false);
  assert.equal(subject instanceof ActorReference, false);
});

test('FV01-15 same real-world identifier text does not collapse Actor and Subject concepts', () => {
  const actor = ActorReference.create(ActorId.from(UUID_V7), ActorKind.ORGANIZATION);
  const subject = SubjectReference.create(SubjectId.from(UUID_V7), SubjectKind.ORGANIZATION);
  assert.equal(actor.id.toString(), subject.id.toString());
  assert.notDeepEqual(actor.toJSON(), subject.toJSON());
});

test('FV01-16 only controlled jurisdiction values enter Core', () => {
  const jurisdiction = Jurisdiction.fromCode(JurisdictionCode.CZECH_REPUBLIC);
  assert.deepEqual(jurisdiction.toJSON(), { code: 'CZ', scope: JurisdictionScope.STATE });
});

test('FV01-17 free-form jurisdiction text is rejected at the Core boundary', () => {
  assert.throws(() => Jurisdiction.fromCode('Czech Republic'), TypeError);
});

test('FV01-18 verification state uses approved controlled values only', () => {
  assert.equal(VerificationState.from(VerificationStateCode.VERIFIED).toString(), 'VERIFIED');
  assert.throws(() => VerificationState.from('looks-good'), TypeError);
});

test('FV01-19 core runtime surface is dependency-free by construction', async () => {
  const module = await import('../src/index.ts');
  assert.equal(typeof module.SubjectId.from, 'function');
});

test('FV01-20 FV-01 owned primitive modules expose no later-phase aggregate behavior', async () => {
  const modules = await Promise.all([
    import('../src/ids.ts'),
    import('../src/time.ts'),
    import('../src/revision.ts'),
    import('../src/version.ts'),
    import('../src/party-references.ts'),
    import('../src/jurisdiction.ts'),
    import('../src/verification-state.ts'),
  ]);
  for (const module of modules) {
    for (const forbidden of ['CredentialArtifact', 'EligibilityAssessment', 'AuthorizationGrant']) {
      assert.equal(forbidden in module, false);
    }
  }
});

test('FV01-21 deterministic Core primitives do not use global randomness', () => {
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('global randomness forbidden'); };
  try {
    assert.equal(CredentialId.from(UUID_V7).toString(), UUID_V7);
  } finally {
    Math.random = originalRandom;
  }
});
