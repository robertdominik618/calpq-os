import { ArchiveCommand, ArchiveLifecycle, ArchiveEvidenceSnapshot, ArchiveDisposalAssessment } from '../src/archive/index.ts';
import type { ArchiveLifecycleGrant, ArchiveLifecycleEvent, ArchiveChange } from '../src/archive/index.ts';
import type { ApplicationExecutionContext } from '../src/index.ts';
declare const state: ArchiveLifecycle;
declare const command: ArchiveCommand;
declare const snapshot: ArchiveEvidenceSnapshot;
declare const assessment: ArchiveDisposalAssessment;
declare const grant: ArchiveLifecycleGrant;
declare const event: ArchiveLifecycleEvent;
declare const context: ApplicationExecutionContext;
const next: ArchiveLifecycle = state.apply({ command, context, grant, expectedRevision: 0 });
void next;
// @ts-expect-error immutable lifecycle status
state.status = 'TOMBSTONED';
// @ts-expect-error immutable archive identity
state.scope = state.scope;
// @ts-expect-error append-only events via apply only
state.records.push(event);
// @ts-expect-error immutable link collection
state.links.pop();
// @ts-expect-error immutable snapshot entries
snapshot.evidenceSnapshot.entries.pop();
// @ts-expect-error snapshot metadata is immutable
snapshot.preserveUntil = null;
// @ts-expect-error grant permissions cannot be widened
grant.permissions.push('archive.tombstone');
// @ts-expect-error assessment cannot grant physical deletion
assessment.physicalDeletionAuthorized = true;
// @ts-expect-error revision must be numeric
state.apply({ command, context, grant, expectedRevision: '0' });
// @ts-expect-error controlled discriminated changes
const invalid: ArchiveChange = { kind: 'ERASE_BYTES' };
void invalid;
// @ts-expect-error plain object is not a governed command
state.apply({ command: { idempotencyKey: 'forged' }, context, grant, expectedRevision: 0 });
