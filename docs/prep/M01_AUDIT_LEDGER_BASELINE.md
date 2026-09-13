# CALPQ-M01-PREP-0014 — Audit Ledger, Tamper Evidence, Decision Replay & Compliance Export Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

## Objective
Provide one governed audit/proof layer across CALPQ decisions without introducing event sourcing, a second domain source of truth or unrestricted retention.

## Required model
`Domain Decision -> Provenance/Evidence -> AuditEntry -> Integrity Proof -> Decision Replay -> Compliance Export`.

## Required properties
- audit entries are logically append-only; corrections create linked entries;
- domain events, provenance, decision evidence and audit entries remain distinct;
- cryptographic integrity proves record integrity, not legal or semantic correctness;
- `AS_WAS` replay uses exact historical inputs/versions and never substitutes current rules;
- replay is read-only and cannot mutate authoritative state;
- missing historical inputs fail closed to explicit uncertainty/review outcomes;
- compliance exports are purpose-scoped, minimized snapshots with manifests and integrity metadata;
- audit metadata prefers references over copying sensitive source payloads;
- audit retention/disclosure remains subject to PREP-0012 access governance and PREP-0013 privacy lifecycle;
- absence caused by lawful lifecycle disposition must be reported, never reconstructed by AI inference.

## Non-goals
PREP-0014 does not authorize product implementation, event sourcing, blockchain dependency, provider-specific audit storage or a global total order across all CALPQ events.

## Admission
`NOT_ADMITTED_FOR_IMPLEMENTATION` while M00 remains blocked and feature development remains frozen.