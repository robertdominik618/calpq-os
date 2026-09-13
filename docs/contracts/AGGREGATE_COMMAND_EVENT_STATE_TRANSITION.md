# CALPQ Aggregate / Command / Event / State Transition Contract

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0002-A`  
Depends on: `CALPQ-M01-PREP-0001`

## Purpose

Define the deterministic Core transaction model before any product-domain aggregate is implemented.

## Aggregate root

An Aggregate Root is the only mutation authority for its consistency boundary. External layers may request a transition through a Command but may not mutate aggregate state directly.

Every aggregate has:

- a stable typed `aggregate_id`;
- an `aggregate_type`;
- an integer `revision` beginning at zero;
- immutable creation provenance;
- current domain state represented only by deterministic Core values;
- zero or more domain events produced by accepted transitions.

Aggregate identity is not a database row identifier and may not depend on persistence technology.

## Command

A Command expresses intent, not truth. It contains:

- `command_id` — unique id for tracing/idempotency;
- `command_type` — stable semantic command name;
- `aggregate_id` — target aggregate;
- `expected_revision` — optimistic concurrency precondition;
- `issued_at` — timestamp supplied through an approved Clock boundary;
- `actor` — identified caller/system actor;
- `correlation_id` — end-to-end business trace;
- optional `causation_id` — prior command/event responsible for this command;
- `payload` — command-specific values;
- optional provenance/evidence references.

Commands do not contain adapter objects, HTTP metadata, ORM entities, UI state, provider SDK objects or authorization tokens.

## Transition function

A Core transition is conceptually:

`CurrentState + Command + DeterministicInputs -> TransitionResult`

The transition must be deterministic for identical normalized inputs.

A transition may return:

1. `ACCEPTED` — producing a new state and one or more domain events;
2. `REJECTED` — legitimate domain rejection, state unchanged;
3. `REVIEW_REQUIRED` — authoritative automation cannot safely conclude, state unchanged unless a separately approved workflow defines a pending-review state;
4. `INDETERMINATE` — required authoritative input is unavailable/insufficient, state unchanged.

Infrastructure failures are not domain transition outcomes; they use the Core error model.

## Revision rule

For an accepted state-changing transition:

`new_revision = previous_revision + 1`

The expected revision in the Command must match the aggregate revision used for evaluation. A mismatch is a concurrency failure and the command must not silently replay against a newer state.

A command that is accepted but intentionally produces no state change must be explicitly modeled as such; revisions may not advance merely because an API call occurred.

## Domain event

A Domain Event records a domain fact that became true because an accepted Core transition occurred.

Every event contains:

- `event_id`;
- `event_type`;
- `aggregate_id`;
- `aggregate_type`;
- `aggregate_revision` after the transition;
- `occurred_at` supplied through Clock;
- `command_id` causing the transition;
- `correlation_id`;
- optional `causation_id`;
- actor/process attribution;
- event payload;
- provenance/rule/contract version references where material.

Events are immutable after publication.

## Event ordering

Within one aggregate, event ordering is defined by aggregate revision and event order within the accepted transition. Cross-aggregate global ordering is not a Core invariant.

No business rule may depend on accidental database insertion order.

## State reconstruction

CALPQ does not require full event sourcing as an M01 baseline. The canonical persistence model may store current aggregate state plus an immutable audit/event stream.

If event sourcing is introduced later, it requires a separate ADR because replay, schema evolution, snapshots and historical rule-version semantics become architecture-level concerns.

## Side effects

The Core transition itself performs no network, database, notification, file, AI/OCR or clock side effect.

Requested side effects are represented as events or application-level intents and are executed outside Core through ports/adapters.

## Prohibited patterns

- aggregate state mutation from UI/API/adapters;
- calling a provider SDK inside Core;
- reading current time directly inside domain logic;
- generating random identifiers from hidden globals;
- silent last-write-wins on revision mismatch;
- emitting an event without a corresponding accepted transition;
- changing state because an event publication adapter failed;
- treating retry count or HTTP status as a domain invariant.

## Acceptance for implementation

The first implementation must demonstrate through tests that:

- identical inputs yield identical transition results;
- revision mismatch is rejected deterministically;
- rejected/review-required/indeterminate transitions do not mutate state;
- accepted state transitions advance revision exactly once;
- events contain the resulting aggregate revision and command correlation;
- Core executes without persistence, network, environment variables or system clock access.
