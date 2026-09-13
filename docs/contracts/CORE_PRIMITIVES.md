# CALPQ Core Primitives Contract

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-CONTRACT-CORE-PRIMITIVES-0001`

## Purpose

Define stable primitives shared by all later CALPQ domain modules without coupling Core to persistence, UI or providers.

## Durable identifiers

Durable domain entities use **UUID version 7** identifiers conforming to RFC 9562. UUIDv7 is time-ordered while remaining globally unique and does not require centralized allocation.

Contract rules:

- canonical external representation is lowercase UUID text;
- identifiers are opaque values, not business data;
- aggregate identifiers are distinct semantic types even when they share the UUIDv7 wire representation;
- identifiers are generated through an `IdGenerator` port, never directly from provider/global randomness inside Core;
- an ID is immutable after entity creation;
- database sequence numbers may exist internally in adapters but are not CALPQ domain identity.

Examples of distinct semantic identity classes include actor, subject, credential, evidence, source, decision, rule-set and event IDs. They must not be freely interchangeable.

## Time

All persisted domain instants are absolute UTC instants. Canonical textual interchange uses RFC 3339-compatible timestamps with an explicit `Z` offset.

Contract rules:

- Core obtains current time only through a `Clock` port;
- wall-clock access is forbidden inside deterministic domain rules;
- local time zones are presentation or scheduling context and must never silently replace an absolute instant;
- effective dates may be date-only values when the legal/business rule is date-based;
- a date-only value and an instant are different semantic types.

## Revisions

Mutable aggregates use a monotonically increasing non-negative revision number.

The revision is used for optimistic concurrency, audit correlation and synchronization conflict detection. A revision is not a timestamp and must not be inferred from an ID.

## Actors and subjects

`Actor` identifies who or what initiated a material action. Actor classes may include human user, organization, system process or approved external authority.

`Subject` identifies what person, organization, asset or other domain object the action concerns.

Actor and subject must remain separate even when they refer to the same real-world party.

## Jurisdiction

Jurisdiction is an explicit controlled value. It must support at least state, EU-level and sub-national applicability without embedding jurisdictional meaning in free text.

## Versions

Rules, schemas and source-derived interpretations that can affect a decision must carry explicit version identifiers. Historical decisions retain the exact versions used at evaluation time.

## Serialization boundary

Wire/database adapters may choose optimized physical representations, but conversion back to Core must preserve the semantic type exactly. No adapter may turn a typed identifier, date, revision or jurisdiction into an unvalidated free-form value before entering Core.

## References

- RFC 9562 — Universally Unique IDentifiers (UUIDs), including UUIDv7.
- RFC 3339 — Date and Time on the Internet: Timestamps.
