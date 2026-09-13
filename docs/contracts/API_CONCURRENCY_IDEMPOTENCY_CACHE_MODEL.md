# CALPQ API Concurrency, Idempotency and Cache Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0018-D`

Mutation endpoints expose explicit concurrency semantics. Where resource representation semantics fit, strong `ETag` plus `If-Match` may represent expected revision; otherwise the contract carries an explicit revision field.

A transport precondition is mapped to the Application expected-revision contract. It never replaces the Core revision invariant.

Retryable mutation APIs may accept a stable idempotency key mapped to one logical Application command. Reusing the same logical key must not produce a second accepted transition.

Caching applies only where an endpoint contract explicitly permits it. Cache validators describe representations, not credential validity or authorization truth.

A stale cached representation MUST NOT be treated as proof that an authorization is still current.