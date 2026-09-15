import type {
  AcceptedMutation,
  UnitOfWorkCommitResult,
  UnitOfWorkPort,
} from './unit-of-work.ts';
import { UnitOfWorkCommitStatus } from './unit-of-work.ts';

export interface AcceptedMutationExecution<TState, TEvent, TOutcome> {
  readonly unitOfWork: UnitOfWorkPort;
  readonly mutation: AcceptedMutation<TState, TEvent, TOutcome>;
  readonly afterCommit?: (result: UnitOfWorkCommitResult<TOutcome>) => void | Promise<void>;
}

/**
 * Commits authoritative truth first. External/post-commit work runs only after a new durable commit.
 * Replays return the previously durable outcome and do not repeat the post-commit side effect.
 */
export async function executeAcceptedMutation<TState, TEvent, TOutcome>(
  execution: AcceptedMutationExecution<TState, TEvent, TOutcome>,
): Promise<UnitOfWorkCommitResult<TOutcome>> {
  const result = await execution.unitOfWork.commitAccepted(execution.mutation);
  if (result.status === UnitOfWorkCommitStatus.COMMITTED && execution.afterCommit) {
    await execution.afterCommit(result);
  }
  return result;
}
