# CALPQ M01 Operational Resilience Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

The full 35-scenario design matrix remains preserved in GitHub Issue #4. This repository matrix defines the machine-enforcement minimum for M01 handoff.

Mandatory groups:
1. idempotency: duplicate command/event identity does not duplicate accepted transition or consumer effect;
2. transaction boundary: failure before commit creates no accepted partial state; failure after commit cannot roll back accepted domain truth;
3. retry: transient and permanent dependency failures remain distinct; retry exhaustion never means credential invalidity;
4. projection/reconciliation: projections, indexes and checkpoints remain non-authoritative and rebuild from authoritative inputs;
5. restore: normal exposure resumes only after authoritative/outbox/inbox/checkpoint/access validation;
6. dependency semantics: outage, stale cache and fallback provider behavior never fabricate legal/domain conclusions;
7. observability: telemetry is diagnostic, excludes raw evidence/secrets and does not mutate domain state;
8. recovery governance: reconciliation/recovery is audit-linked and cannot bypass approval boundaries;
9. Core boundary: no queue, retry scheduler, telemetry backend or provider SDK dependency;
10. replay/rebuild cannot issue or mutate `AuthorizationGrant`;
11. feature development remains frozen while M00 release is blocked.
