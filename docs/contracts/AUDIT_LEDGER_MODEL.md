# CALPQ Audit Ledger Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0014-A`

## Purpose
Define a tamper-evident, append-only logical audit layer across CALPQ without turning the audit ledger into the domain source of truth or an event-sourcing requirement.

## Separation
- Domain events describe accepted domain transitions.
- Provenance identifies sources, rules, evidence and responsible actors.
- Decision evidence records the exact basis of a material decision.
- Audit ledger records material actions/decisions and links them into a reviewable historical trail.

The audit ledger MUST NOT itself issue credentials, change eligibility, mutate AuthorizationGrant state, or reinterpret historical decisions.

## AuditEntry
A material audit entry should include:
- audit_entry_id;
- entry_type;
- occurred_at and recorded_at;
- actor/process reference;
- subject/organization reference where applicable;
- object/aggregate reference;
- command/event/decision references where applicable;
- correlation_id and optional causation_id;
- prior/resulting revision where relevant;
- outcome/reason code;
- exact rule/source/evidence/version references;
- integrity metadata;
- privacy/classification metadata.

## Append-only semantics
A recorded audit entry is not rewritten in place. A correction, reclassification or later discovery creates a new linked audit entry that references the prior one and explains the relationship.

## Ordering
CALPQ requires deterministic ordering inside the relevant audit stream/partition. A single global total ordering across the entire platform is not required unless a future ADR explicitly introduces it.

## Privacy boundary
Audit records should prefer stable references and reason codes over copying sensitive payloads, raw documents, secrets or unrestricted personal data.

## Historical reproducibility
A material historical decision must be traceable from the audit entry to the exact decision record, rule/source versions and evidence snapshot used at that time.