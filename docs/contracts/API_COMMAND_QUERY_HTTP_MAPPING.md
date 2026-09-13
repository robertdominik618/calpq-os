# CALPQ API Command Query Mapping

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0018-B`

State-changing requests map to explicit Application commands. Read requests return projections/read models only.

HTTP status carries protocol semantics. Domain outcomes remain explicit domain values; `SATISFIED`, `NOT_SATISFIED`, `INDETERMINATE` and `REVIEW_REQUIRED` are never inferred from HTTP status alone.

Stable CALPQ IDs are exposed where needed; database sequence identity is never public domain identity.

Mutation contracts preserve command identity, correlation metadata and expected revision where applicable.

Pagination cursors are opaque transport values and never domain identity, evidence or authorization proof.