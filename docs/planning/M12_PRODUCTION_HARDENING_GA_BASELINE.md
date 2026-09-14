# CALPQ M12 — Production Hardening, Pilot & General Availability Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M12-PLAN-0001`
Depends on: M11 production platform baseline and all prior governed domain capabilities.

## Purpose
Prove CALPQ under production constraints and make the General Availability decision from operational/security/privacy evidence rather than architecture readiness alone.

## Scope
M12 covers:
- security hardening and security verification;
- privacy lifecycle verification;
- penetration/security testing;
- dependency/supply-chain review;
- backup/restore and disaster recovery;
- data-integrity reconciliation after restore;
- load/performance/capacity testing;
- auditability and evidence export validation;
- production migration/backfill/reconciliation plans;
- pilot cohorts and staged rollout;
- incident/support/runbooks;
- SLO/SLI definition and monitoring;
- release/rollback governance;
- GA readiness decision.

## Security exit evidence
GA evidence must include reviewed identity/session/access controls, secrets/crypto boundaries, tenant isolation, privileged/break-glass paths, misuse controls, untrusted-content handling and material vulnerability findings/resolution.

Passing architecture/security checklists alone is not sufficient; production-representative validation is required.

## Privacy exit evidence
Validate purpose limitation, minimum necessary access, retention/preservation holds, restriction/anonymization/termination paths, selective disclosure and auditability across real operating workflows.

## Backup/restore/DR
Recovery tests must prove that restored authoritative state, outbox/inbox positions, audit references, projection checkpoints and active access/privacy restrictions are consistent before normal service resumes.

A technically restored database is not automatically production-ready.

## Performance/capacity
Run representative workload tests for API, persistence, search/projections, workers and large-tenant use. Define thresholds, headroom and degradation behavior. Performance remediation must not bypass correctness or security controls.

## Migration/reconciliation
Production imports/backfills use explicit versioned plans, checkpoints, idempotency and reconciliation. Migration may transform representation but must not silently reinterpret historical legal/domain meaning.

## Pilot
Pilot rollout uses bounded cohorts, explicit eligibility, telemetry/feedback boundaries, rollback criteria and support ownership. Pilot evidence includes defect classes, operational incidents, usability findings and unresolved risk.

## Operations
Before GA, establish:
- incident response ownership;
- escalation paths;
- on-call/support expectations where applicable;
- runbooks for critical dependencies;
- backup/restore procedures;
- reconciliation procedures;
- provider outage/degraded-mode procedures;
- security/privacy incident handling.

## SLOs
Define service indicators/objectives for critical user and platform flows. SLO breach is operational evidence and does not rewrite credential/legal truth.

## Release governance
GA requires an explicit release decision based on evidence from security, privacy, recovery, performance, migration, pilot and operations. Architecture completion or successful CI alone cannot authorize GA.

## Exit criteria
M12 completes only when production evidence supports a governed GA decision, critical risks are accepted/remediated explicitly, rollback/recovery/support paths exist and the product can be operated safely at intended scale.