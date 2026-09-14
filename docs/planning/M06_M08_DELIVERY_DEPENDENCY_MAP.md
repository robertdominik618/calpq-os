# CALPQ M06-M08 Delivery Dependency Map

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`
ID: `CALPQ-M06-M08-DELIVERY-MAP-0001`

## Lanes
Lane L — Lifecycle: M06-A -> M06-B -> M06-C
Lane R — Regulatory: M07-A -> M07-B -> M07-C
Lane B — B2B/Organization: M08-A -> M08-B -> M08-C

## Hard dependencies
- M06-A requires stable M04 requirement/version semantics and sufficient M05 evidence/verification.
- M06-C dependency graph semantics must stabilize before M07-B uses compliance impact propagation.
- M07-A source governance may start while M06-B is progressing, but M07-B requires stable source/version and reevaluation semantics.
- M08-A may begin once tenant/access/organization contracts are stable.
- M08-B requires stable M06 compliance states and B2B assignment semantics.
- M08-C requires reviewed M08-B outcomes and stable organization projection rules.

## Recommended waves
Wave Y1: M06-A + M07-A + M08-A
Wave Y2: M06-B + M07-B + M08-B
Wave Y3: M06-C + M07-C + M08-C

Parallel execution is allowed only where hard dependencies above are satisfied. A faster lane must not fabricate or locally reimplement a missing upstream truth.

## Cross-lane ownership
- M06 owns lifecycle/renewal/compliance reevaluation semantics.
- M07 owns source/change/impact intelligence, not underlying credential truth.
- M08 owns organization context and assignment decisions, not competence transfer.

## Integration checkpoints
Checkpoint Y1: lifecycle/source/organization identity models compatible.
Checkpoint Y2: renewal/change-impact/assignment decision inputs compatible.
Checkpoint Y3: continuous compliance, Radar actions and organization compliance projection interoperable with preserved provenance.

## Forbidden shortcuts
- regulatory change directly mutates historical decisions;
- delegation creates competence;
- notification becomes legal conclusion;
- organization projection becomes source of individual truth;
- parser/model output bypasses legal/human review where required;
- reevaluation overwrites previous assessment instead of creating a new one.
