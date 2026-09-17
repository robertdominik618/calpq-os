import type { ArchiveEvidenceSnapshot, ArchiveLifecycle } from '../src/archive/index.ts';
import type { HumanReviewHistory } from '../src/human-review/index.ts';
import type { VerificationProviderPort, VerificationRouteResult } from '../src/verification/index.ts';
import { makeFixture, runProvider, confirm, lifecycle, capture } from '../test-support/m05-integration-fixtures.ts';

const fixture = makeFixture();
const state: ArchiveLifecycle = lifecycle(fixture);
const history: HumanReviewHistory = confirm(fixture);
const snapshot: ArchiveEvidenceSnapshot = capture(fixture, state, { humanReviews: [history] });
async function providerContract(): Promise<VerificationRouteResult> {
  const execution = await runProvider(fixture);
  const port: VerificationProviderPort = execution.port;
  void port;
  // @ts-expect-error executed request ledger is readonly
  execution.calls.push(execution.request);
  return execution.result;
}
void providerContract;
// @ts-expect-error integration fixture keeps exact original binding readonly
fixture.original = fixture.original;
// @ts-expect-error snapshots cannot mutate original evidence state
snapshot.evidenceSnapshot.entries[0]!.verificationState = fixture.original.verificationState;
// @ts-expect-error evidence entries cannot be appended outside capture
snapshot.evidenceSnapshot.entries.push(snapshot.evidenceSnapshot.entries[0]!);
// @ts-expect-error human review and evidence verification remain separate types
const falseVerification: VerificationRouteResult = history;
void falseVerification;
// @ts-expect-error logical lifecycle never exposes a physical deletion method
state.deleteOriginal();
