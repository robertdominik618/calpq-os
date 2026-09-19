import type { CredentialLifecycleBasis, CredentialLifecycleEventBinding, CredentialLifecycleTimelineInput } from '../src/lifecycle/index.ts';
import { CredentialLifecycleTimelineReadModel } from '../src/lifecycle/index.ts';

declare const input: CredentialLifecycleTimelineInput;
declare const basis: CredentialLifecycleBasis;
declare const binding: CredentialLifecycleEventBinding;
const projection = CredentialLifecycleTimelineReadModel.compose(input);

// @ts-expect-error immutable basis version
basis.artifactVersion = basis.artifactVersion;
// @ts-expect-error immutable basis sources
basis.sources.push(basis.sources[0]!);
// @ts-expect-error immutable source binding
binding.basis = basis;
// @ts-expect-error immutable event knowledge time
binding.knownAt = binding.knownAt;
// @ts-expect-error read model events cannot be extended
projection.events.push(projection.events[0]!);
// @ts-expect-error event metadata is deeply readonly
projection.events[0]!.actor.id = 'changed';
// @ts-expect-error nested event version list is readonly
projection.events[0]!.ruleVersionRefs.push('changed');
// @ts-expect-error declared date cannot be rewritten
projection.calendarFacts[0]!.date = '2030-01-01';
// @ts-expect-error source version metadata is deeply readonly
projection.data.basis.sources[0]!.version = 'changed';
// @ts-expect-error nested evidence metadata cannot be changed
projection.data.basis.evidence[0]!.verificationState = 'VERIFIED';
// @ts-expect-error issue references cannot be appended
projection.issues[0]!.eventIds.push('changed');
// @ts-expect-error authority false is a literal boundary
const authority: true = projection.authorizationAuthority;
// @ts-expect-error ungoverned time strings rejected by the public API
CredentialLifecycleTimelineReadModel.compose({ ...input, evaluatedAt: '2026-01-01' });
// @ts-expect-error a structural fragment cannot stand in for a governed basis
CredentialLifecycleTimelineReadModel.compose({ ...input, basis: { snapshotReference: 'fake' } });
