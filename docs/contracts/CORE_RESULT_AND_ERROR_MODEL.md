# CALPQ Core Result and Error Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-CONTRACT-CORE-RESULT-0001`

## Purpose

Define a deterministic, machine-readable result envelope and stable error taxonomy so later CALPQ modules do not invent incompatible outcome semantics.

## Domain evaluation result

A rule evaluation returns one of four semantic outcomes:

- `SATISFIED` — the evaluated requirement is met under the supplied rule/version and evidence set;
- `NOT_SATISFIED` — the requirement is deterministically not met;
- `INDETERMINATE` — available inputs are insufficient or contradictory, so no deterministic conclusion is valid;
- `REVIEW_REQUIRED` — an approved policy requires human/authoritative review before a final domain conclusion.

The result must also carry:

- stable decision/result ID;
- evaluated-at instant supplied by the Clock port;
- subject reference;
- rule-set/version references;
- reason codes;
- source/evidence/provenance references;
- resulting revision where the evaluation causes a state transition.

Human-readable explanation is optional presentation/application data. It must never be the only representation of the decision reason.

## Reason codes

Reason codes are stable machine-readable identifiers owned by the domain contract. They are not free-form provider messages and must remain suitable for testing, audit and localization.

## Error taxonomy

Operational/domain processing failures are distinct from legitimate domain outcomes.

Minimum Core error families:

- `VALIDATION_ERROR` — input violates a declared contract;
- `NOT_FOUND` — required referenced domain object does not exist;
- `CONFLICT` — revision/state precondition conflict;
- `UNAUTHORIZED` — no authenticated actor/context where one is required;
- `FORBIDDEN` — actor is known but the operation is not permitted;
- `INVARIANT_VIOLATION` — an impossible Core state or invariant break was detected;
- `STALE_SOURCE` — a required authoritative source is stale/review-required;
- `DATA_INTEGRITY_ERROR` — hash/reference/revision integrity failed;
- `EXTERNAL_DEPENDENCY_ERROR` — adapter/provider operation failed outside Core;
- `UNSUPPORTED_OPERATION` — operation is outside the supported contract/version.

## Boundary rules

- Expected domain outcomes are never represented by exceptions alone.
- Provider SDK errors must be translated at adapter boundaries.
- Core never exposes raw database, HTTP, cloud, AI or OCR error objects.
- Stable error codes are testable and localizable; human messages may change without breaking contracts.
- Security-sensitive error details must not leak implementation secrets or personal data.

## Retry semantics

Retryability is explicit metadata owned by the Application/adapter boundary, not inferred from message text. Core errors representing invariant or validation failures are not retryable without changed input/state.

## Audit semantics

Material failed operations that affect user-visible workflow or compliance posture must be attributable to actor/process, timestamp, correlation/operation ID and stable error code without storing unnecessary sensitive payloads.
