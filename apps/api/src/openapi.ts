import {
  API_CONTRACT_VERSION,
  API_OPERATION_IDENTITY,
  API_PATH_TEMPLATE,
} from './rest-json.ts';

export interface OpenApiDocument {
  readonly openapi: '3.1.0';
  readonly info: Readonly<Record<string, string>>;
  readonly paths: Readonly<Record<string, unknown>>;
  readonly components: Readonly<Record<string, unknown>>;
}

const errorResponse = (description: string) => Object.freeze({
  description,
  content: Object.freeze({
    'application/json': Object.freeze({
      schema: Object.freeze({ $ref: '#/components/schemas/ErrorEnvelope' }),
    }),
  }),
});

export const FV14_OPENAPI_DOCUMENT: OpenApiDocument = Object.freeze({
  openapi: '3.1.0',
  info: Object.freeze({
    title: 'CALPQ First Vertical API',
    version: API_CONTRACT_VERSION,
  }),
  paths: Object.freeze({
    [API_PATH_TEMPLATE]: Object.freeze({
      post: Object.freeze({
        operationId: API_OPERATION_IDENTITY,
        summary: 'Evaluate eligibility through the approved Application use case',
        parameters: Object.freeze([
          Object.freeze({ name: 'subjectId', in: 'path', required: true, schema: Object.freeze({ $ref: '#/components/schemas/UuidV7' }) }),
          Object.freeze({ name: 'x-correlation-id', in: 'header', required: true, schema: Object.freeze({ $ref: '#/components/schemas/UuidV7' }) }),
          Object.freeze({ name: 'x-operation-id', in: 'header', required: true, schema: Object.freeze({ const: API_OPERATION_IDENTITY }) }),
          Object.freeze({ name: 'x-contract-version', in: 'header', required: true, schema: Object.freeze({ const: API_CONTRACT_VERSION }) }),
          Object.freeze({ name: 'x-tenant-id', in: 'header', required: true, schema: Object.freeze({ type: 'string', minLength: 1 }) }),
          Object.freeze({ name: 'x-purpose', in: 'header', required: true, schema: Object.freeze({ type: 'string', minLength: 1 }) }),
          Object.freeze({ name: 'x-access-reference', in: 'header', required: true, schema: Object.freeze({ type: 'string', minLength: 1 }) }),
          Object.freeze({ name: 'x-principal-id', in: 'header', required: true, schema: Object.freeze({ type: 'string', minLength: 1 }) }),
          Object.freeze({ name: 'if-match-revision', in: 'header', required: false, schema: Object.freeze({ type: 'integer', minimum: 0 }) }),
          Object.freeze({ name: 'idempotency-key', in: 'header', required: false, schema: Object.freeze({ type: 'string', minLength: 1, maxLength: 128 }) }),
          Object.freeze({ name: 'limit', in: 'query', required: false, schema: Object.freeze({ type: 'integer', minimum: 1, maximum: 100, default: 50 }) }),
          Object.freeze({ name: 'cursor', in: 'query', required: false, schema: Object.freeze({ type: 'string', maxLength: 512 }) }),
        ]),
        requestBody: Object.freeze({
          required: true,
          content: Object.freeze({
            'application/json': Object.freeze({ schema: Object.freeze({ $ref: '#/components/schemas/EvaluationRequest' }) }),
          }),
        }),
        responses: Object.freeze({
          '200': Object.freeze({ description: 'Application use case completed', content: Object.freeze({ 'application/json': Object.freeze({ schema: Object.freeze({ $ref: '#/components/schemas/SuccessEnvelope' }) }) }) }),
          '201': Object.freeze({ description: 'Application resource created', content: Object.freeze({ 'application/json': Object.freeze({ schema: Object.freeze({ $ref: '#/components/schemas/SuccessEnvelope' }) }) }) }),
          '204': Object.freeze({ description: 'Application use case completed without response body' }),
          '400': errorResponse('Malformed transport request'),
          '401': errorResponse('Authentication required'),
          '403': errorResponse('Authorization denied or existence disclosure suppressed'),
          '404': errorResponse('Resource not found and disclosure permitted'),
          '409': errorResponse('Revision or idempotency conflict'),
          '422': errorResponse('Valid request rejected by the Application/domain transition'),
          '429': errorResponse('Quota exceeded'),
          '500': errorResponse('Unexpected internal failure'),
          '503': errorResponse('Infrastructure dependency unavailable'),
        }),
      }),
    }),
  }),
  components: Object.freeze({
    schemas: Object.freeze({
      UuidV7: Object.freeze({ type: 'string', pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' }),
      EvaluationRequest: Object.freeze({
        type: 'object',
        additionalProperties: true,
        minProperties: 1,
      }),
      SuccessEnvelope: Object.freeze({
        type: 'object',
        additionalProperties: false,
        required: Object.freeze(['correlationId', 'operationIdentity', 'contractVersion', 'domainId', 'domainOutcome', 'revision', 'nextCursor', 'data']),
        properties: Object.freeze({
          correlationId: Object.freeze({ $ref: '#/components/schemas/UuidV7' }),
          operationIdentity: Object.freeze({ const: API_OPERATION_IDENTITY }),
          contractVersion: Object.freeze({ const: API_CONTRACT_VERSION }),
          domainId: Object.freeze({ $ref: '#/components/schemas/UuidV7' }),
          domainOutcome: Object.freeze({ type: ['string', 'null'], enum: Object.freeze(['SATISFIED', 'NOT_SATISFIED', 'INDETERMINATE', 'REVIEW_REQUIRED', null]) }),
          revision: Object.freeze({ type: ['integer', 'null'], minimum: 0 }),
          nextCursor: Object.freeze({ type: ['string', 'null'] }),
          data: Object.freeze({}),
        }),
      }),
      ErrorEnvelope: Object.freeze({
        type: 'object',
        additionalProperties: false,
        required: Object.freeze(['error']),
        properties: Object.freeze({
          error: Object.freeze({
            type: 'object',
            additionalProperties: false,
            required: Object.freeze(['code', 'correlationId']),
            properties: Object.freeze({
              code: Object.freeze({ type: 'string', minLength: 1 }),
              correlationId: Object.freeze({ type: 'string', minLength: 1 }),
            }),
          }),
        }),
      }),
    }),
  }),
});
