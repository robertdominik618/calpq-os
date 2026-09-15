import type { DomainOutcome } from '../../../core/src/index.ts';

export const ApplicationTransportResponseKind = {
  OK: 'OK',
  CREATED: 'CREATED',
  NO_CONTENT: 'NO_CONTENT',
} as const;
export type ApplicationTransportResponseKind = (typeof ApplicationTransportResponseKind)[keyof typeof ApplicationTransportResponseKind];

export const ApplicationTransportErrorKind = {
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  DOMAIN_REJECTED: 'DOMAIN_REJECTED',
  QUOTA: 'QUOTA',
  INFRASTRUCTURE: 'INFRASTRUCTURE',
} as const;
export type ApplicationTransportErrorKind = (typeof ApplicationTransportErrorKind)[keyof typeof ApplicationTransportErrorKind];

export interface ApplicationTransportPagination {
  readonly limit: number;
  readonly cursor: string | null;
}

export interface ApplicationTransportInvocation {
  readonly operationIdentity: string;
  readonly correlationId: string;
  readonly contractVersion: string;
  readonly tenant: string;
  readonly purpose: string;
  readonly accessReference: string;
  readonly principal: string;
  readonly domainId: string;
  readonly expectedRevision: number | null;
  readonly idempotencyKey: string | null;
  readonly pagination: ApplicationTransportPagination | null;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface ApplicationTransportSuccess {
  readonly responseKind: ApplicationTransportResponseKind;
  readonly domainOutcome: DomainOutcome | null;
  readonly data: unknown | null;
  readonly revision: number | null;
  readonly nextCursor: string | null;
}

export interface ApplicationTransportHandler {
  invoke(input: ApplicationTransportInvocation): Promise<ApplicationTransportSuccess>;
}

export class ApplicationTransportError extends Error {
  readonly kind: ApplicationTransportErrorKind;
  readonly stableCode: string;
  readonly correlationId: string;
  readonly discloseExistence: boolean;

  constructor(input: {
    readonly kind: ApplicationTransportErrorKind;
    readonly stableCode: string;
    readonly correlationId: string;
    readonly discloseExistence?: boolean;
    readonly message?: string;
  }) {
    super(input.message ?? input.stableCode);
    this.name = 'ApplicationTransportError';
    this.kind = input.kind;
    this.stableCode = input.stableCode;
    this.correlationId = input.correlationId;
    this.discloseExistence = input.discloseExistence ?? false;
    Object.freeze(this);
  }
}
