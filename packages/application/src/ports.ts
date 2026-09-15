import type { Clock, IdGenerator } from '../../core/src/index.ts';

/** Provider-neutral clock capability available to Application orchestration. */
export type ClockPort = Clock;

/** Provider-neutral semantic identifier capability available to Application orchestration. */
export type IdGeneratorPort = IdGenerator;
