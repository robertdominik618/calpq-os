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

const UUID_V7 = '018f22e2-79b0-7cc3-98c4-dc0c0c07398f';

const fixed: Clock = new FixedClock(UtcInstant.from('2026-09-15T04:00:00Z'));
fixed.now();

const controlled = new ControlledClock(UtcInstant.from('2026-09-15T04:00:00Z'));
const asClock: Clock = controlled;
asClock.now();
// @ts-expect-error Product Core sees only the Clock port; fixture advancement is not on the port.
asClock.advanceByMilliseconds(1);

const generator: IdGenerator = new DeterministicIdGenerator([UUID_V7]);
const subject: SubjectId = generator.next(SubjectId);
void subject;

// @ts-expect-error Requested SubjectId cannot be assigned to CredentialId.
const credential: CredentialId = generator.next(SubjectId);
void credential;
