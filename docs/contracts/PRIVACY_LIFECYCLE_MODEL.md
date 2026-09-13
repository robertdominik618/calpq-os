# CALPQ Privacy Lifecycle Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0013-A`

## Retention rule
A versioned `RetentionRule` identifies data category, documented basis, lifecycle start trigger, duration or review point, jurisdiction, source/policy version and terminal disposition.

## Lifecycle outcomes
`ACTIVE`, `RESTRICTED`, `PRESERVED_WITH_BASIS`, `ANONYMIZED`, `TERMINAL_REVIEW`, `TERMINATED`, `REVIEW_REQUIRED`, `INDETERMINATE`.

## Preservation hold
A scoped preservation hold records authority, reason, affected data categories, start time, review point and release event. It prevents terminal disposition for its scope but does not grant wider access or wider processing purpose.

## Derived data
A derived record must either have its own documented retention basis or follow the source lifecycle. A projection cannot silently preserve source content after the source is no longer available for normal processing.

## Account closure
Account closure first disables authentication/bindings, then evaluates each domain data category independently. It never acts as one blanket lifecycle instruction for all historical records.

## Restore safety
A restore/recovery process must reapply current lifecycle restrictions and disposition records before data becomes available to normal projections.

## Invariants
- storage is not indefinite by default;
- restriction and terminal disposition are distinct;
- pseudonymisation is not equivalent to anonymisation;
- historical decisions retain the policy/source version used at decision time;
- privacy lifecycle actions are auditable without retaining unnecessary payload content.