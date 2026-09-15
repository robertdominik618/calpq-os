import type {
  ApplicationTransportHandler,
  ApplicationTransportInvocation,
} from '../../../packages/application/src/index.ts';
import {
  API_CONTRACT_VERSION,
  API_METHOD,
  dispatchEligibilityRestJson,
} from '../src/index.ts';
import type { RestJsonRequest, RestJsonResponse } from '../src/index.ts';

declare const invocation: ApplicationTransportInvocation;
declare const request: RestJsonRequest;
declare const response: RestJsonResponse;
declare const handler: ApplicationTransportHandler;

void API_CONTRACT_VERSION;
void API_METHOD;
void dispatchEligibilityRestJson(request, handler);

// @ts-expect-error Transport invocation identity is immutable after boundary mapping.
invocation.domainId = 'changed';

// @ts-expect-error Correlation identity is immutable after boundary mapping.
invocation.correlationId = 'changed';

// @ts-expect-error API request method is readonly transport input.
request.method = 'GET';

// @ts-expect-error API response status is immutable after response mapping.
response.status = 500;
