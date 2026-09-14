# CALPQ M06 — Lifecycle, Renewal & Continuous Compliance Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M06-PLAN-0001`
Depends on: M02 authoritative credential/evidence/eligibility outputs; M03-M05 planning contracts where relevant.

## Purpose
Make credential/requirement state continuously maintainable over time without rewriting historical truth.

## Scope
M06 covers:
- lifecycle timeline;
- expiry/effective windows;
- Renewal Autopilot planning;
- recurring obligations such as exams, medical checks and continuing education;
- notification policy;
- dependency graph reevaluation;
- continuous compliance status;
- historical decision replay;
- Next Action inputs for later intelligence layers.

## Lifecycle rules
Lifecycle state is derived from governed authoritative facts, time and applicable rules. A clock tick alone must not silently rewrite historical decisions or create legal conclusions unsupported by rules/source state.

Historical assessment/grant/provenance records remain immutable. New evidence, changed time windows or changed rules produce new assessments/status projections rather than in-place historical mutation.

## Renewal planning
A renewal plan may contain:
- credential/obligation reference;
- due/expiry window;
- required prerequisites;
- lead time;
- evidence needed;
- dependency links;
- notification policy;
- current readiness/gap state;
- source/rule version.

Renewal automation may recommend and schedule governed steps but must not self-issue renewed authorization.

## Recurring obligations
Recurring obligations are versioned requirements with explicit cadence/effective rules. Missed or uncertain evidence yields governed status such as at-risk/review/indeterminate; it must not be fabricated as compliant or non-compliant without the required rule/evidence basis.

## Dependency reevaluation
Change events may include:
- new/expired/revoked evidence;
- new assessment;
- source/rule version change;
- organization/role change;
- time-window threshold;
- external authority update.

The dependency graph selects affected outputs for reevaluation. Reevaluation creates new decision/status records and preserves prior decisions.

## Continuous compliance states
Continuous status remains distinct from point-in-time eligibility and authorization. At minimum the model must distinguish current compliance, at-risk/upcoming action, review required, indeterminate and known non-compliance where governed evidence/rules support it.

## Notifications
Notifications are delivery artifacts, not domain truth. A missed notification does not change the underlying obligation. Notification scheduling must preserve tenant, subject, purpose and source/action references.

## Replay
Historical replay reconstructs AS_WAS decisions from exact versions/evidence used then. Current-state views may also compute AS_IS, but the two must never be silently mixed.

## Non-goals
M06 does not own regulatory-source ingestion/impact propagation (M07), organization assignment decisions (M08), external selective sharing (M09) or AI authority (M10).

## Exit criteria
M06 planning is ready when renewal, recurring obligations, dependency reevaluation, notifications and replay are all traceable to existing M01 contracts and cannot mutate historical truth or self-create authorization.