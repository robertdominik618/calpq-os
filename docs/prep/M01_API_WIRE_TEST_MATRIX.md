# CALPQ M01 API Wire Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

Mandatory scenarios:
1. DTO does not become Aggregate Root.
2. 2xx response does not imply `SATISFIED`.
3. `NOT_SATISFIED` may be returned as a legitimate domain result.
4. `INDETERMINATE` remains distinct from transport failure.
5. `REVIEW_REQUIRED` remains distinct from transport failure.
6. stable `error_code` survives localization.
7. RFC 9457 problem response preserves correlation ID.
8. provider-specific error object does not escape the adapter boundary.
9. DB row/sequence ID is never public domain identity.
10. command identity survives retry.
11. reused logical idempotency identity cannot create a second accepted transition.
12. expected revision conflict cannot silently overwrite newer state.
13. `ETag`/`If-Match` mapping never replaces Core revision checks.
14. cache validator is not proof of current authorization.
15. stale cached representation is not authoritative compliance truth.
16. query endpoint cannot mutate authoritative state.
17. pagination cursor is opaque transport metadata.
18. pagination cursor is not authorization evidence.
19. async `SUCCEEDED` does not imply domain `SATISFIED`.
20. async failure does not rewrite domain history.
21. event ID remains stable across delivery retries.
22. duplicate external event delivery is tolerated.
23. external event payload is minimum-necessary.
24. API version is separate from deployment version.
25. API version is separate from DB migration version.
26. API version is separate from rule/catalog/source version.
27. optional additive field does not change existing field meaning.
28. semantic change to an existing field is treated as breaking.
29. OpenAPI 3.2.x adoption requires separate approval from current 3.1.x baseline.
30. Core remains free of HTTP/Fastify/OpenAPI/generated-client dependencies.
31. API contract remains design-only while M00 feature development is frozen.