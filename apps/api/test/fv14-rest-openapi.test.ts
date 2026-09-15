import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

import {
  ApplicationTransportError,
  ApplicationTransportErrorKind,
  ApplicationTransportResponseKind,
} from '../../../packages/application/src/index.ts';
import type {
  ApplicationTransportHandler,
  ApplicationTransportInvocation,
  ApplicationTransportSuccess,
} from '../../../packages/application/src/index.ts';
import {
  API_CONTRACT_VERSION,
  API_METHOD,
  API_OPERATION_IDENTITY,
  API_PATH_TEMPLATE,
  FV14_OPENAPI_DOCUMENT,
  dispatchEligibilityRestJson,
} from '../src/index.ts';
import type { RestJsonRequest } from '../src/index.ts';

const SUBJECT_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c081001';
const CORRELATION_ID = '018f22e2-79b0-7cc3-98c4-dc0c0c081002';

function headers(overrides: Record<string, string | undefined> = {}): Record<string, string | undefined> {
  return {
    authorization: 'Bearer test-token',
    'content-type': 'application/json',
    'x-correlation-id': CORRELATION_ID,
    'x-operation-id': API_OPERATION_IDENTITY,
    'x-contract-version': API_CONTRACT_VERSION,
    'x-tenant-id': 'tenant:A',
    'x-purpose': 'credential-evaluation',
    'x-access-reference': 'access:approved:1',
    'x-principal-id': 'principal:alice',
    ...overrides,
  };
}

function request(overrides: Partial<RestJsonRequest> = {}): RestJsonRequest {
  return {
    method: API_METHOD,
    path: `/v1/subjects/${SUBJECT_ID}/eligibility-assessments`,
    headers: headers(),
    query: {},
    bodyText: JSON.stringify({ requirementSet: 'current' }),
    ...overrides,
  };
}

function success(overrides: Partial<ApplicationTransportSuccess> = {}): ApplicationTransportSuccess {
  return {
    responseKind: ApplicationTransportResponseKind.OK,
    domainOutcome: 'SATISFIED',
    data: Object.freeze({ eligible: true }),
    revision: 7,
    nextCursor: null,
    ...overrides,
  };
}

class CapturingHandler implements ApplicationTransportHandler {
  readonly invocations: ApplicationTransportInvocation[] = [];
  readonly result: ApplicationTransportSuccess;

  constructor(result: ApplicationTransportSuccess = success()) {
    this.result = result;
  }

  async invoke(input: ApplicationTransportInvocation): Promise<ApplicationTransportSuccess> {
    this.invocations.push(input);
    return this.result;
  }
}

class ThrowingHandler implements ApplicationTransportHandler {
  readonly error: Error;
  constructor(error: Error) { this.error = error; }
  async invoke(): Promise<ApplicationTransportSuccess> { throw this.error; }
}

function appError(kind: typeof ApplicationTransportErrorKind[keyof typeof ApplicationTransportErrorKind], code: string, discloseExistence = false) {
  return new ApplicationTransportError({
    kind,
    stableCode: code,
    correlationId: CORRELATION_ID,
    discloseExistence,
  });
}

async function dispatchWithError(kind: typeof ApplicationTransportErrorKind[keyof typeof ApplicationTransportErrorKind], code: string, discloseExistence = false) {
  return dispatchEligibilityRestJson(request(), new ThrowingHandler(appError(kind, code, discloseExistence)));
}

test('FV14-01 REST JSON', async () => {
  const response = await dispatchEligibilityRestJson(request(), new CapturingHandler());
  assert.equal(response.status, 200);
  assert.equal(response.headers['content-type'], 'application/json');
  const invalidType = await dispatchEligibilityRestJson(request({ headers: headers({ 'content-type': 'text/plain' }) }), new CapturingHandler());
  assert.equal(invalidType.status, 400);
  assert.equal((invalidType.body?.error as { code: string }).code, 'TRANSPORT_JSON_REQUIRED');
});

test('FV14-02 OpenAPI 3.1', () => {
  assert.equal(FV14_OPENAPI_DOCUMENT.openapi, '3.1.0');
  assert.equal(FV14_OPENAPI_DOCUMENT.info.version, API_CONTRACT_VERSION);
  assert.ok(API_PATH_TEMPLATE in FV14_OPENAPI_DOCUMENT.paths);
});

test('FV14-03 DTO boundary', async () => {
  const arrayBody = await dispatchEligibilityRestJson(request({ bodyText: '[]' }), new CapturingHandler());
  assert.equal(arrayBody.status, 400);
  assert.equal((arrayBody.body?.error as { code: string }).code, 'TRANSPORT_OBJECT_REQUIRED');
  const invalidJson = await dispatchEligibilityRestJson(request({ bodyText: '{' }), new CapturingHandler());
  assert.equal((invalidJson.body?.error as { code: string }).code, 'TRANSPORT_INVALID_JSON');
});

test('FV14-04 status boundary', async () => {
  assert.equal((await dispatchEligibilityRestJson(request(), new CapturingHandler(success({ responseKind: ApplicationTransportResponseKind.CREATED })))).status, 201);
  assert.equal((await dispatchEligibilityRestJson(request(), new CapturingHandler(success({ responseKind: ApplicationTransportResponseKind.NO_CONTENT })))).status, 204);
  assert.equal((await dispatchWithError(ApplicationTransportErrorKind.AUTHENTICATION, 'AUTHN_FAILED')).status, 401);
  assert.equal((await dispatchWithError(ApplicationTransportErrorKind.AUTHORIZATION, 'ACCESS_DENIED')).status, 403);
  assert.equal((await dispatchWithError(ApplicationTransportErrorKind.NOT_FOUND, 'RESOURCE_NOT_FOUND', true)).status, 404);
  assert.equal((await dispatchWithError(ApplicationTransportErrorKind.NOT_FOUND, 'SECRET_RESOURCE', false)).status, 403);
  assert.equal((await dispatchWithError(ApplicationTransportErrorKind.CONFLICT, 'REVISION_CONFLICT')).status, 409);
  assert.equal((await dispatchWithError(ApplicationTransportErrorKind.DOMAIN_REJECTED, 'TRANSITION_REJECTED')).status, 422);
  assert.equal((await dispatchWithError(ApplicationTransportErrorKind.QUOTA, 'QUOTA_EXCEEDED')).status, 429);
  assert.equal((await dispatchWithError(ApplicationTransportErrorKind.INFRASTRUCTURE, 'DEPENDENCY_UNAVAILABLE')).status, 503);
  assert.equal((await dispatchEligibilityRestJson(request(), new ThrowingHandler(new Error('unexpected')))).status, 500);
});

test('FV14-05 URL boundary', async () => {
  const invalid = await dispatchEligibilityRestJson(request({ path: '/v1/eligibility' }), new CapturingHandler());
  assert.equal(invalid.status, 400);
  assert.equal((invalid.body?.error as { code: string }).code, 'TRANSPORT_INVALID_URL');
});

test('FV14-06 schema boundary', () => {
  const paths = FV14_OPENAPI_DOCUMENT.paths as Record<string, { post: { requestBody: { content: Record<string, unknown> }; responses: Record<string, unknown> } }>;
  const post = paths[API_PATH_TEMPLATE]?.post;
  assert.ok(post);
  assert.ok('application/json' in post.requestBody.content);
  for (const status of ['200', '400', '401', '403', '404', '409', '422', '429', '500', '503']) assert.ok(status in post.responses);
});

test('FV14-07 version boundary', async () => {
  const handler = new CapturingHandler();
  const response = await dispatchEligibilityRestJson(request({ headers: headers({ 'if-match-revision': '7', 'idempotency-key': 'cmd-1' }) }), handler);
  assert.equal(response.status, 200);
  assert.equal(handler.invocations[0]?.expectedRevision, 7);
  assert.equal(handler.invocations[0]?.idempotencyKey, 'cmd-1');
  const invalid = await dispatchEligibilityRestJson(request({ headers: headers({ 'if-match-revision': '-1' }) }), handler);
  assert.equal((invalid.body?.error as { code: string }).code, 'TRANSPORT_INVALID_REVISION');
});

test('FV14-08 correlation', async () => {
  const handler = new CapturingHandler();
  const response = await dispatchEligibilityRestJson(request(), handler);
  assert.equal(handler.invocations[0]?.correlationId, CORRELATION_ID);
  assert.equal(response.headers['x-correlation-id'], CORRELATION_ID);
});

test('FV14-09 operation identity', async () => {
  const handler = new CapturingHandler();
  await dispatchEligibilityRestJson(request(), handler);
  assert.equal(handler.invocations[0]?.operationIdentity, API_OPERATION_IDENTITY);
  const mismatch = await dispatchEligibilityRestJson(request({ headers: headers({ 'x-operation-id': 'other.operation' }) }), handler);
  assert.equal((mismatch.body?.error as { code: string }).code, 'TRANSPORT_OPERATION_MISMATCH');
});

test('FV14-10 contract version', async () => {
  const handler = new CapturingHandler();
  const response = await dispatchEligibilityRestJson(request(), handler);
  assert.equal(handler.invocations[0]?.contractVersion, API_CONTRACT_VERSION);
  assert.equal(response.headers['x-contract-version'], API_CONTRACT_VERSION);
  const unsupported = await dispatchEligibilityRestJson(request({ headers: headers({ 'x-contract-version': 'old' }) }), handler);
  assert.equal((unsupported.body?.error as { code: string }).code, 'TRANSPORT_UNSUPPORTED_CONTRACT_VERSION');
});

test('FV14-11 domain ID mapping', async () => {
  const handler = new CapturingHandler();
  await dispatchEligibilityRestJson(request({ path: `/v1/subjects/${SUBJECT_ID.toUpperCase()}/eligibility-assessments` }), handler);
  assert.equal(handler.invocations[0]?.domainId, SUBJECT_ID);
  const invalid = await dispatchEligibilityRestJson(request({ path: '/v1/subjects/123/eligibility-assessments' }), handler);
  assert.equal((invalid.body?.error as { code: string }).code, 'TRANSPORT_INVALID_DOMAIN_ID');
});

test('FV14-12 domain outcome mapping', async () => {
  const response = await dispatchEligibilityRestJson(request(), new CapturingHandler(success({ domainOutcome: 'REVIEW_REQUIRED', data: { note: 'review' } })));
  assert.equal(response.status, 200);
  assert.equal(response.body?.domainOutcome, 'REVIEW_REQUIRED');
  assert.notEqual(response.body?.domainOutcome, response.status);
});

test('FV14-13 stable error code', async () => {
  const response = await dispatchWithError(ApplicationTransportErrorKind.CONFLICT, 'REVISION_CONFLICT');
  assert.deepEqual(response.body, { error: { code: 'REVISION_CONFLICT', correlationId: CORRELATION_ID } });
  const hidden = await dispatchWithError(ApplicationTransportErrorKind.NOT_FOUND, 'SECRET_RESOURCE', false);
  assert.equal((hidden.body?.error as { code: string }).code, 'ACCESS_DENIED');
});

test('FV14-14 error correlation', async () => {
  const malformed = await dispatchEligibilityRestJson(request({ bodyText: '{' }), new CapturingHandler());
  assert.equal((malformed.body?.error as { correlationId: string }).correlationId, CORRELATION_ID);
  assert.equal(malformed.headers['x-correlation-id'], CORRELATION_ID);
});

test('FV14-15 response mapping', async () => {
  const response = await dispatchEligibilityRestJson(request(), new CapturingHandler(success({ revision: 9, nextCursor: 'next-1', data: { id: 'x' } })));
  assert.deepEqual(Object.keys(response.body ?? {}).sort(), ['contractVersion', 'correlationId', 'data', 'domainId', 'domainOutcome', 'nextCursor', 'operationIdentity', 'revision'].sort());
  assert.equal(response.body?.revision, 9);
  assert.equal(response.body?.nextCursor, 'next-1');
});

test('FV14-16 request mapping', async () => {
  const handler = new CapturingHandler();
  await dispatchEligibilityRestJson(request({
    headers: headers({ 'if-match-revision': '4', 'idempotency-key': 'cmd-4' }),
    query: { limit: '25', cursor: 'cursor-1' },
    bodyText: JSON.stringify({ requirementSet: 'v4' }),
  }), handler);
  const invocation = handler.invocations[0]!;
  assert.equal(invocation.tenant, 'tenant:A');
  assert.equal(invocation.purpose, 'credential-evaluation');
  assert.equal(invocation.accessReference, 'access:approved:1');
  assert.equal(invocation.principal, 'principal:alice');
  assert.equal(invocation.expectedRevision, 4);
  assert.equal(invocation.idempotencyKey, 'cmd-4');
  assert.deepEqual(invocation.pagination, { limit: 25, cursor: 'cursor-1' });
  assert.deepEqual(invocation.payload, { requirementSet: 'v4' });
});

test('FV14-17 minimum contract data', async () => {
  const response = await dispatchEligibilityRestJson(request(), new CapturingHandler());
  const json = JSON.stringify(response);
  assert.doesNotMatch(json, /password|token|database|stack|internalError/i);
  assert.match(json, /correlationId/);
  assert.match(json, /operationIdentity/);
  assert.match(json, /contractVersion/);
});

test('FV14-18 Core independence', () => {
  const files = readdirSync('apps/api/src').filter((name) => name.endsWith('.ts'));
  const source = files.map((name) => readFileSync(`apps/api/src/${name}`, 'utf8')).join('\n');
  assert.doesNotMatch(source, /packages\/core|core\/src|@calpq\/core/);
});

test('FV14-19 Application mapping', async () => {
  const handler = new CapturingHandler();
  await dispatchEligibilityRestJson(request(), handler);
  assert.equal(handler.invocations.length, 1);
  const source = readFileSync('apps/api/src/rest-json.ts', 'utf8');
  assert.match(source, /ApplicationTransportHandler/);
  assert.match(source, /handler\.invoke\(invocation\)/);
});

test('FV14-20 architecture boundary', () => {
  const files = readdirSync('apps/api/src').filter((name) => name.endsWith('.ts'));
  const source = files.map((name) => readFileSync(`apps/api/src/${name}`, 'utf8')).join('\n');
  assert.doesNotMatch(source, /from ['"](?:react|react-native|expo|fastify|@?prisma|typeorm|sequelize|knex|drizzle|pg|postgres|mysql|sqlite|aws-sdk|@aws-sdk|openai|@anthropic-ai|tesseract|firebase)/);
  assert.doesNotMatch(source, /\b(?:EligibilityAssessment|RequirementSet|AuthorizationGrant|TenantAccessDecision|orchestrateVerification)\b/);
});
