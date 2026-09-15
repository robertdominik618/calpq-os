import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import {
  CredentialId,
  SubjectId,
  UtcInstant,
} from '../src/index.ts';
import type { Clock, IdGenerator } from '../src/index.ts';
import {
  ControlledClock,
  DeterministicIdGenerator,
  FixedClock,
} from '../test-support/index.ts';

const UUID_1 = '018f22e2-79b0-7cc3-98c4-dc0c0c07398f';
const UUID_2 = '018f22e2-79b1-7cc3-98c4-dc0c0c07398f';

test('FV02-01 Clock returns an absolute UTC instant', () => {
  const clock: Clock = new FixedClock(UtcInstant.from('2026-09-15T06:00:00+02:00'));
  assert.equal(clock.now().toString(), '2026-09-15T04:00:00.000Z');
});

test('FV02-02 Fixed Clock returns the configured instant exactly', () => {
  const instant = UtcInstant.from('2026-09-15T04:00:00Z');
  const clock = new FixedClock(instant);
  assert.strictEqual(clock.now(), instant);
});

test('FV02-03 Controlled Clock advances only through the deterministic test fixture', () => {
  const clock = new ControlledClock(UtcInstant.from('2026-09-15T04:00:00Z'));
  assert.equal(clock.now().toString(), '2026-09-15T04:00:00.000Z');
  assert.equal(clock.advanceByMilliseconds(1500).toString(), '2026-09-15T04:00:01.500Z');
  assert.equal(clock.now().toString(), '2026-09-15T04:00:01.500Z');
  assert.throws(() => clock.advanceByMilliseconds(-1), RangeError);
});

test('FV02-04 Core Clock usage does not call the wall clock directly', () => {
  const originalNow = Date.now;
  Date.now = () => { throw new Error('wall clock access forbidden'); };
  try {
    const clock: Clock = new FixedClock(UtcInstant.from('2026-09-15T04:00:00Z'));
    assert.equal(clock.now().toString(), '2026-09-15T04:00:00.000Z');
  } finally {
    Date.now = originalNow;
  }
});

test('FV02-05 IdGenerator returns the requested semantic ID type', () => {
  const generator: IdGenerator = new DeterministicIdGenerator([UUID_1]);
  const subject = generator.next(SubjectId);
  assert.equal(subject instanceof SubjectId, true);
  assert.equal(subject.toString(), UUID_1);
});

test('FV02-06 generated durable IDs satisfy the UUIDv7 contract', () => {
  const generator = new DeterministicIdGenerator([UUID_1]);
  assert.equal(generator.next(CredentialId).toString(), UUID_1);
  assert.throws(
    () => new DeterministicIdGenerator(['018f22e2-79b0-6cc3-98c4-dc0c0c07398f']).next(CredentialId),
    TypeError,
  );
});

test('FV02-07 deterministic IdGenerator returns its predefined sequence', () => {
  const generator = new DeterministicIdGenerator([UUID_1, UUID_2]);
  assert.equal(generator.next(SubjectId).toString(), UUID_1);
  assert.equal(generator.next(SubjectId).toString(), UUID_2);
  assert.equal(generator.remaining(), 0);
});

test('FV02-08 exhausted deterministic ID sequence fails explicitly', () => {
  const generator = new DeterministicIdGenerator([UUID_1]);
  generator.next(SubjectId);
  assert.throws(() => generator.next(SubjectId), /sequence exhausted/i);
});

test('FV02-09 deterministic IdGenerator does not depend on global randomness', () => {
  const originalRandom = Math.random;
  Math.random = () => { throw new Error('global randomness forbidden'); };
  try {
    assert.equal(new DeterministicIdGenerator([UUID_1]).next(SubjectId).toString(), UUID_1);
  } finally {
    Math.random = originalRandom;
  }
});

test('FV02-10 Clock and IdGenerator ports have no provider SDK dependency', () => {
  const packageJson = JSON.parse(readFileSync('packages/core/package.json', 'utf8')) as {
    dependencies?: Record<string, string>;
    optionalDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
  };
  assert.deepEqual(packageJson.dependencies ?? {}, {});
  assert.deepEqual(packageJson.optionalDependencies ?? {}, {});
  assert.deepEqual(packageJson.peerDependencies ?? {}, {});
});

test('FV02-11 FV-02 owned ports introduce no credential, eligibility or authorization behavior', async () => {
  const modules = await Promise.all([
    import('../src/ports/clock.ts'),
    import('../src/ports/id-generator.ts'),
  ]);
  for (const module of modules) {
    for (const forbidden of ['CredentialArtifact', 'EligibilityAssessment', 'AuthorizationGrant']) {
      assert.equal(forbidden in module, false);
    }
  }
});

test('FV02-12 existing Core architecture guard remains green', () => {
  const result = spawnSync('bash', ['tests/architecture_boundaries_test.sh'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
