import type { ApplicationExecutionContext } from './application-execution-context.ts';

export const ApplicationEntrypoint = {
  API: 'API',
  WORKER: 'WORKER',
  SCHEDULER: 'SCHEDULER',
} as const;
export type ApplicationEntrypoint = (typeof ApplicationEntrypoint)[keyof typeof ApplicationEntrypoint];

const ENTRYPOINTS = new Set<string>(Object.values(ApplicationEntrypoint));

export interface UseCaseHandler<TInput, TOutput> {
  execute(input: TInput, context: ApplicationExecutionContext): TOutput | Promise<TOutput>;
}

export interface UseCaseInvocation<TInput, TOutput> {
  readonly entrypoint: ApplicationEntrypoint;
  readonly handler: UseCaseHandler<TInput, TOutput>;
  readonly input: TInput;
  readonly context: ApplicationExecutionContext;
}

export async function invokeUseCase<TInput, TOutput>(invocation: UseCaseInvocation<TInput, TOutput>): Promise<TOutput> {
  if (!ENTRYPOINTS.has(invocation.entrypoint)) throw new TypeError('Application entrypoint is not controlled');
  if (typeof invocation.handler?.execute !== 'function') throw new TypeError('Application use case requires an executable handler');
  return await invocation.handler.execute(invocation.input, invocation.context);
}
