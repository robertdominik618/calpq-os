import type { ProvenanceEnvelope } from '../src/index.ts';
import {
  CoreError,
  CoreErrorFamily,
  DomainOutcome,
  ReasonCode,
} from '../src/index.ts';

const outcome: DomainOutcome = DomainOutcome.SATISFIED;
void outcome;

const failure: CoreError = CoreError.create(
  CoreErrorFamily.EXTERNAL_DEPENDENCY_ERROR,
  ReasonCode.from('PROVIDER_UNAVAILABLE'),
);
void failure;

declare const provenance: ProvenanceEnvelope;
// @ts-expect-error Historical provenance collections are immutable snapshots.
provenance.evidence.push(undefined);

// @ts-expect-error Technical error families are not legitimate domain outcomes.
const wrongOutcome: DomainOutcome = CoreErrorFamily.CONFLICT;
void wrongOutcome;
