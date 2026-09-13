# CALPQ-M01-PREP-0007 — Continuous Compliance, Change Impact & Automatic Re-evaluation Baseline

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

## Objective

Connect regulatory-source governance, Credential/Authorization Core, Professional Passport and B2B Assignment Guard into a bounded continuous-compliance loop.

## Processing model

`ChangeEvent → ImpactCandidate → Dependency traversal → ReevaluationPlan → New evaluation snapshot → Compliance projection → Action/notification`

## Supported triggers

The baseline covers at least:
- verified rule/source version changes;
- RequirementSet changes;
- credential grant/suspension/revocation/renewal changes;
- evidence verification changes;
- recognition decisions;
- role/delegation changes;
- assignment scope changes;
- organization-state changes;
- catalog/equivalence changes;
- temporal boundary crossings.

## Non-negotiable invariants

1. Historical decisions are immutable.
2. Re-evaluation creates a new linked decision/evidence snapshot.
3. Only affected dependencies are re-evaluated by default.
4. The same change and graph snapshot produce the same impacted target set.
5. Retries are idempotent and do not duplicate alerts/actions.
6. Future-effective rules do not alter current status before applicability.
7. Unverified/stale regulatory input cannot silently change authoritative conclusions.
8. AI may suggest impact mappings but cannot independently promote them to verified legal truth.
9. `INDETERMINATE` and `REVIEW_REQUIRED` never degrade into optimistic compliance.
10. Compliance projections cannot issue, revoke, renew, or recognize authorizations.

## Impact priority

Suggested processing priority:
- P0: current safety/legal assignment becomes deterministically blocked;
- P1: current authorization/compliance status materially changes;
- P2: future deadline/effective rule creates required action;
- P3: explanation/catalog mapping changes without current compliance effect;
- P4: informational change with no material downstream effect.

Priority affects workflow ordering only, never domain truth.

## Output surfaces

Re-evaluation may update projections for:
- Professional Passport;
- Gap Navigator;
- Next Best Action;
- renewal/lifecycle timeline;
- Assignment Guard status;
- Organization Compliance dashboard;
- notification/action queue.

## Admission boundary

PREP-0007 does not authorize event-bus, scheduler, database, notification, or worker implementation. Those adapters are selected only after M00 release and architecture admission.
