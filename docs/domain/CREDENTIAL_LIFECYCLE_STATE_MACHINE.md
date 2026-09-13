# Credential / Authorization Lifecycle State Machine

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-DOM-LIFE-0001`

## Two-axis model

CALPQ separates:

1. administrative lifecycle state — changed only by explicit domain decisions;
2. temporal validity — derived from validity window + Clock.

`EXPIRED` is therefore not a stored administrative mutation state.

## Administrative states

- `GRANTED`
- `SUSPENDED`
- `REVOKED`
- `SUPERSEDED`

## Temporal validity

For `valid_from` and optional `valid_until`:

- before `valid_from` -> `NOT_YET_EFFECTIVE`;
- inside `[valid_from, valid_until)` -> `IN_FORCE`;
- on/after `valid_until` -> `EXPIRED`.

If `valid_until` is absent, the window remains open subject to other lifecycle rules.

## Effective status projection

Examples:

- `GRANTED + IN_FORCE` -> `ACTIVE`;
- `GRANTED + NOT_YET_EFFECTIVE` -> `SCHEDULED`;
- `GRANTED + EXPIRED` -> `EXPIRED`;
- `SUSPENDED + IN_FORCE` -> `SUSPENDED`;
- `REVOKED + any` -> `REVOKED`;
- `SUPERSEDED + any` -> `SUPERSEDED`.

No caller may infer `ACTIVE` from administrative state alone.

## Transitions

- grant: `none -> GRANTED`;
- suspend: `GRANTED -> SUSPENDED`;
- reinstate: `SUSPENDED -> GRANTED`;
- revoke: `GRANTED|SUSPENDED -> REVOKED`;
- supersede: `GRANTED|SUSPENDED -> SUPERSEDED`.

Every transition requires command metadata, actor/authority attribution, reason and provenance.

## Renewal

Renewal is an operation, not a generic state. Each credential definition selects one policy:

- `EXTEND_EXISTING_GRANT` — explicit validity-window change where allowed;
- `ISSUE_SUCCESSOR_GRANT` — create a successor grant and preserve lineage.

Renewal never erases prior validity or evidence history.

## Invariants

- a revoked grant ID is not reactivated;
- supersession requires successor linkage;
- reinstatement does not extend validity automatically;
- suspension does not pause time unless an explicit policy says so;
- effective status must be reproducible from stored facts plus Clock;
- no lifecycle operation rewrites historical eligibility assessments.
