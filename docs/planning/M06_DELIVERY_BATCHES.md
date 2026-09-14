# CALPQ M06 Delivery Batches

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M06-DELIVERY-0001`

## Batch M06-A — Lifecycle State & Timeline
Scope:
1. lifecycle policy binding;
2. effective/expiry/renewal timeline;
3. recurring obligation model;
4. lifecycle event projection;
5. historical decision references;
6. status derivation without history rewrite.

Definition of Done:
- lifecycle status is derived from governed facts and time;
- elapsed time does not mutate historical decisions in place;
- recurring obligations preserve source/version lineage;
- timeline distinguishes current state from historical events.

## Batch M06-B — Renewal Autopilot & Notifications
Scope:
1. renewal eligibility window;
2. renewal prerequisite planning;
3. notification policy;
4. escalation/suppression rules;
5. user/organization action queue integration;
6. duplicate-safe scheduling.

Definition of Done:
- reminders are advisory, not legal conclusions;
- duplicate scheduling does not duplicate logical actions;
- notification timing is explainable from lifecycle policy;
- no renewal is auto-granted.

## Batch M06-C — Continuous Compliance & Reevaluation
Scope:
1. dependency graph;
2. change-triggered reevaluation;
3. continuous compliance status;
4. immutable new assessment creation;
5. decision replay;
6. remediation/next-action projection.

Definition of Done:
- reevaluation is selective and deterministic;
- new facts create new decisions rather than rewriting old ones;
- unresolved dependencies yield indeterminate/review semantics;
- historical replay reproduces original versions and evidence.

## Exit
M06 exit requires lifecycle, renewal/notification and continuous-compliance batches complete with reproducible historical truth.
