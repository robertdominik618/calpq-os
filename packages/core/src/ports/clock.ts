import type { UtcInstant } from '../time.ts';

export interface Clock {
  now(): UtcInstant;
}
