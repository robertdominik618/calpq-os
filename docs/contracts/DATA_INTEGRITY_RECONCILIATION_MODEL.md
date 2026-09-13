# CALPQ Data Integrity & Reconciliation Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0017-E`

## Integrity classes
CALPQ distinguishes:
- structural persistence violation;
- authoritative-state inconsistency;
- derived projection divergence;
- outbox/inbox/checkpoint mismatch;
- missing referenced artifact/evidence;
- historical-version/replay gap.

## Repair boundary
Derived projections, indexes and checkpoints may be rebuilt from authoritative inputs.

Authoritative aggregate/domain history MUST NOT be repaired by ad-hoc database edits. A material authoritative correction requires a governed correction command, migration or review process with provenance and audit linkage.

## Detection outcomes
`CONSISTENT | LAGGING | DIVERGED | REBUILD_REQUIRED | REVIEW_REQUIRED | INDETERMINATE`.

## Fail-safe behavior
If authoritative integrity cannot be established, CALPQ fails closed for affected regulated decisions. It does not infer a positive eligibility/authorization result from a damaged or ambiguous persistence state.

## Reconciliation record
A material reconciliation records target, detected state, source versions/checkpoints, action taken, actor/process, time, previous/new references and audit linkage.

## Restore interaction
After restore, reconciliation validates authoritative state, delivery positions, evidence/object references and projections before normal regulated processing is declared healthy.
