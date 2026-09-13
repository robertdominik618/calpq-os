# CALPQ-M01-PREP-0017 — Persistence, Transaction, Delivery & Migration Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

## Objective
Define a persistence architecture that preserves CALPQ domain semantics independently from PostgreSQL, ORM, object storage and delivery infrastructure.

## Canonical flow

`Command -> Application UnitOfWork -> idempotency/revision check -> deterministic Core transition -> authoritative state + event/outbox + outcome + audit reference -> atomic commit -> asynchronous publication -> idempotent consumers/projections`.

## Required properties
- typed CALPQ IDs remain domain identity;
- SQL migrations, not ORM auto-sync, control schema;
- accepted state/outbox/outcome/audit references commit atomically;
- optimistic concurrency is explicit;
- cross-aggregate consistency uses an explicit transaction/locking policy;
- external network calls are not hidden inside Core or long authoritative transactions;
- asynchronous delivery is at-least-once with deduplication, not falsely claimed exactly-once;
- read projections/checkpoints are rebuildable and never authoritative;
- legal/catalog version changes are domain versioning, not schema migration;
- authoritative data corrections are governed and auditable, not ad-hoc database edits;
- restore/reconciliation must prove integrity before regulated processing resumes.

## Selected infrastructure baseline
PostgreSQL 18 is the selected authoritative relational store. Original binary evidence remains behind the S3-compatible storage port. PostgreSQL-backed transactional outbox/jobs are the initial baseline; another broker requires a later ADR based on measured need.

## Boundaries
`Core -> no SQL/ORM/transaction/provider dependency`.

`Application -> defines use-case/unit-of-work semantics`.

`Adapters -> implement PostgreSQL/object-storage/delivery details`.

## Admission
This baseline is design-only while M00 feature development remains frozen.
