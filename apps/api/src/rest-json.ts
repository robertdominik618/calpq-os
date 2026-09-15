import {
  ApplicationTransportError,
  ApplicationTransportErrorKind,
  ApplicationTransportResponseKind,
} from '../../../../packages/application/src/transport/transport-contract.ts';
import type {
  ApplicationTransportHandler,
  ApplicationTransportInvocation,
  ApplicationTransportSuccess,
} from '../../../../packages/application/src/transport/transport-contract.ts';

export const API_CONTRACT_VERSION = '2026-09-15.1';
export const API_OPERATION_IDENTITY = 'eligibility.evaluate';
export const API_PATH_TEMPLATE = '/v1/subjects/{subjectId}/eligibility-assessments';
export const API_METHOD = 'POST';

const UUID_V7_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PATH_PATTERN = /^\/v1\/subjects\/([^/]+)\/eligibility-assessments$/;

export interface RestJsonRequest {
  readonly method: string;
  readonly path: string;
  readonly headers: Readonly<Record<string, string | undefined>>;
  readonly query?: Readonly<Record<string, string | undefined>>;
  readonly bodyText: string;
}

export interface RestJsonResponse {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: Readonly<Record<string, unknown>> | null;
}

class TransportBoundaryError extends Error {
  readonly stableCode: string;
  readonly status: number;
  readonly correlationId: string;

  constructor(stableCode: string, status: number, correlationId: string) {
    super(stableCode);
    this.name = 'TransportBoundaryError';
    this.stableCode = stableCode;
    this.status = status;
    this.correlationId = correlationId;
    Object.freeze(this);
  }
}

function header(headers: Readonly<Record<string, string | undefined>>, name: string): string | null {
  const target = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === target && typeof value === 'string') {
      const normalized = value.trim();
      return normalized.length > 0 ? normalized : null;
    }
  }
  return null;
}

function fallbackCorrelation(headers: Readonly<Record<string, string | undefined>>): string {
  return header(headers, 'x-correlation-id') ?? 'correlation-unavailable';
}

function requiredHeader(request: RestJsonRequest, name: string, code: string): string {
  const value = header(request.headers, name);
  if (value === null) throw new TransportBoundaryError(code, 400, fallbackCorrelation(request.headers));
  return value;
}

function canonicalUuidV7(value: string, code: string, correlationId: string): string {
  if (!UUID_V7_PATTERN.test(value)) throw new TransportBoundaryError(code, 400, correlationId);
  return value.toLowerCase();
}

function parseBody(request: RestJsonRequest, correlationId: string): Readonly<Record<string, unknown>> {
  const contentType = header(request.headers, 'content-type');
  if (contentType === null || !/^application\/json(?:\s*;|$)/i.test(contentType)) {
    throw new TransportBoundaryError('TRANSPORT_JSON_REQUIRED', 400, correlationId);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(request.bodyText);
  } catch {
    throw new TransportBoundaryError('TRANSPORT_INVALID_JSON', 400, correlationId);
  }
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new TransportBoundaryError('TRANSPORT_OBJECT_REQUIRED', 400, correlationId);
  }
  return Object.freeze({ ...(parsed as Record<string, unknown>) });
}

function parsePagination(request: RestJsonRequest, correlationId: string) {
  const rawLimit = request.query?.['limit'];
  const rawCursor = request.query?.['cursor'];
  if (rawLimit === undefined && rawCursor === undefined) return null;
  const limit = rawLimit === undefined ? 50 : Number(rawLimit);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    throw new TransportBoundaryError('TRANSPORT_INVALID_PAGINATION', 400, correlationId);
  }
  const cursor = rawCursor?.trim() || null;
  if (cursor !== null && cursor.length > 512) {
    throw new TransportBoundaryError('TRANSPORT_INVALID_PAGINATION', 400, correlationId);
  }
  return Object.freeze({ limit, cursor });
}

function parseExpectedRevision(request: RestJsonRequest, correlationId: string): number | null {
  const raw = header(request.headers, 'if-match-revision');
  if (raw === null) return null;
  const revision = Number(raw);
  if (!Number.isSafeInteger(revision) || revision < 0) {
    throw new TransportBoundaryError('TRANSPORT_INVALID_REVISION', 400, correlationId);
  }
  return revision;
}

function parseIdempotencyKey(request: RestJsonRequest, correlationId: string): string | null {
  const value = header(request.headers, 'idempotency-key');
  if (value === null) return null;
  if (value.length > 128) throw new TransportBoundaryError('TRANSPORT_INVALID_IDEMPOTENCY_KEY', 400, correlationId);
  return value;
}

function mapSuccess(
  success: ApplicationTransportSuccess,
  invocation: ApplicationTransportInvocation,
): RestJsonResponse {
  const status = success.responseKind === ApplicationTransportResponseKind.CREATED
    ? 201
    : success.responseKind === ApplicationTransportResponseKind.NO_CONTENT
      ? 204
      : 200;
  const headers = Object.freeze({
    'content-type': 'application/json',
    'x-correlation-id': invocation.correlationId,
    'x-operation-id': invocation.operationIdentity,
    'x-contract-version': invocation.contractVersion,
  });
  if (status === 204) return Object.freeze({ status, headers, body: null });
  return Object.freeze({
    status,
    headers,
    body: Object.freeze({
      correlationId: invocation.correlationId,
      operationIdentity: invocation.operationIdentity,
      contractVersion: invocation.contractVersion,
      domainId: invocation.domainId,
      domainOutcome: success.domainOutcome,
      revision: success.revision,
      nextCursor: success.nextCursor,
      data: success.data,
    }),
  });
}

function mapApplicationError(error: ApplicationTransportError, requestCorrelationId: string): RestJsonResponse {
  const mapping: Record<string, number> = {
    [ApplicationTransportErrorKind.AUTHENTICATION]: 401,
    [ApplicationTransportErrorKind.AUTHORIZATION]: 403,
    [ApplicationTransportErrorKind.CONFLICT]: 409,
    [ApplicationTransportErrorKind.DOMAIN_REJECTED]: 422,
    [ApplicationTransportErrorKind.QUOTA]: 429,
    [ApplicationTransportErrorKind.INFRASTRUCTURE]: 503,
  };
  let status = mapping[error.kind] ?? 500;
  let stableCode = error.stableCode;
  if (error.kind === ApplicationTransportErrorKind.NOT_FOUND) {
    status = error.discloseExistence ? 404 : 403;
    stableCode = error.discloseExistence ? error.stableCode : 'ACCESS_DENIED';
  }
  const correlationId = error.correlationId || requestCorrelationId;
  return Object.freeze({
    status,
    headers: Object.freeze({ 'content-type': 'application/json', 'x-correlation-id': correlationId }),
    body: Object.freeze({ error: Object.freeze({ code: stableCode, correlationId }) }),
  });
}

function mapBoundaryError(error: TransportBoundaryError): RestJsonResponse {
  return Object.freeze({
    status: error.status,
    headers: Object.freeze({ 'content-type': 'application/json', 'x-correlation-id': error.correlationId }),
    body: Object.freeze({ error: Object.freeze({ code: error.stableCode, correlationId: error.correlationId }) }),
  });
}

export async function dispatchEligibilityRestJson(
  request: RestJsonRequest,
  handler: ApplicationTransportHandler,
): Promise<RestJsonResponse> {
  const fallback = fallbackCorrelation(request.headers);
  try {
    if (request.method.toUpperCase() !== API_METHOD) {
      throw new TransportBoundaryError('TRANSPORT_METHOD_NOT_ALLOWED', 400, fallback);
    }
    const pathMatch = PATH_PATTERN.exec(request.path);
    if (pathMatch === null || pathMatch[1] === undefined) {
      throw new TransportBoundaryError('TRANSPORT_INVALID_URL', 400, fallback);
    }
    if (header(request.headers, 'authorization') === null) {
      throw new TransportBoundaryError('AUTHENTICATION_REQUIRED', 401, fallback);
    }

    const correlationId = canonicalUuidV7(
      requiredHeader(request, 'x-correlation-id', 'TRANSPORT_CORRELATION_REQUIRED'),
      'TRANSPORT_INVALID_CORRELATION',
      fallback,
    );
    const operationIdentity = requiredHeader(request, 'x-operation-id', 'TRANSPORT_OPERATION_REQUIRED');
    if (operationIdentity !== API_OPERATION_IDENTITY) {
      throw new TransportBoundaryError('TRANSPORT_OPERATION_MISMATCH', 400, correlationId);
    }
    const contractVersion = requiredHeader(request, 'x-contract-version', 'TRANSPORT_CONTRACT_VERSION_REQUIRED');
    if (contractVersion !== API_CONTRACT_VERSION) {
      throw new TransportBoundaryError('TRANSPORT_UNSUPPORTED_CONTRACT_VERSION', 400, correlationId);
    }
    const tenant = requiredHeader(request, 'x-tenant-id', 'TRANSPORT_TENANT_REQUIRED');
    const purpose = requiredHeader(request, 'x-purpose', 'TRANSPORT_PURPOSE_REQUIRED');
    const accessReference = requiredHeader(request, 'x-access-reference', 'TRANSPORT_ACCESS_CONTEXT_REQUIRED');
    const principal = requiredHeader(request, 'x-principal-id', 'TRANSPORT_PRINCIPAL_REQUIRED');
    const domainId = canonicalUuidV7(decodeURIComponent(pathMatch[1]), 'TRANSPORT_INVALID_DOMAIN_ID', correlationId);
    const payload = parseBody(request, correlationId);

    const invocation = Object.freeze<ApplicationTransportInvocation>({
      operationIdentity,
      correlationId,
      contractVersion,
      tenant,
      purpose,
      accessReference,
      principal,
      domainId,
      expectedRevision: parseExpectedRevision(request, correlationId),
      idempotencyKey: parseIdempotencyKey(request, correlationId),
      pagination: parsePagination(request, correlationId),
      payload,
    });

    const result = await handler.invoke(invocation);
    return mapSuccess(result, invocation);
  } catch (error) {
    if (error instanceof TransportBoundaryError) return mapBoundaryError(error);
    if (error instanceof ApplicationTransportError) return mapApplicationError(error, fallback);
    return Object.freeze({
      status: 500,
      headers: Object.freeze({ 'content-type': 'application/json', 'x-correlation-id': fallback }),
      body: Object.freeze({ error: Object.freeze({ code: 'INTERNAL_ERROR', correlationId: fallback }) }),
    });
  }
}
