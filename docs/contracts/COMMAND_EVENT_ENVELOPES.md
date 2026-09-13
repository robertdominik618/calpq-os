# CALPQ Command and Event Envelope Contract

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0002-B`

## Purpose

Define stable envelope metadata shared across future Core/Application contracts without coupling them to HTTP, database or provider-specific transports.

## Command envelope

Required fields:

- `command_id`
- `command_type`
- `aggregate_id`
- `expected_revision`
- `issued_at`
- `actor`
- `correlation_id`
- `payload`

Optional fields:

- `causation_id`
- `evidence_refs`
- `provenance_refs`
- `client_request_id`

## Event envelope

Required fields:

- `event_id`
- `event_type`
- `aggregate_id`
- `aggregate_type`
- `aggregate_revision`
- `occurred_at`
- `command_id`
- `correlation_id`
- `actor`
- `payload`

Optional fields:

- `causation_id`
- `rule_version_refs`
- `contract_version_refs`
- `provenance_refs`
- `evidence_refs`

## Metadata semantics

`command_id` identifies one logical command. Retries preserve the same command id.

`correlation_id` groups operations belonging to one broader business interaction or workflow.

`causation_id` points to the immediate prior command/event that triggered the current message where such relationship exists.

`actor` represents the responsible human, service or controlled automated process. Anonymous/system placeholders must be explicit rather than omitted.

## Versioning

Semantic event and command names are stable contract identifiers. Breaking changes require either:

- a new versioned command/event type; or
- an approved backward-compatible schema migration strategy.

Consumers must never infer schema version from deployment version or Git commit alone.

## Transport neutrality

Envelope fields must be representable in REST/JSON, persisted records, queue messages and test fixtures without changing domain meaning.

HTTP request IDs, database sequence numbers, queue delivery tags, retry headers and provider metadata remain adapter concerns unless explicitly promoted into a governed contract field.

## Security and privacy

Envelopes must not become a dumping ground for secrets, authentication tokens, unrestricted PII or raw evidence binaries.

Sensitive references use stable identifiers; access control is enforced outside the envelope while Core rules decide only authorization-independent domain semantics unless a dedicated authorization contract says otherwise.

## Acceptance rules

- every state-changing event traces back to exactly one command id;
- retries of the same logical command retain identity;
- correlation survives adapter boundaries;
- event metadata is immutable after publication;
- event/command semantic names are not derived from UI route names or framework class names.
