# CALPQ M01 Exit Readiness Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0021-D`

Mandatory scenarios:
1. M00 blocked means implementation authorization is blocked.
2. Architecture-ready result cannot unfreeze feature development.
3. Exit gate cannot mark PR ready or authorize merge.
4. PREP-0001 Core primitives are represented in readiness matrix.
5. PREP-0002 command/event/concurrency is represented.
6. Credential/Authorization domain is represented.
7. Document/Evidence/Verification/Trust/Identity layers are represented.
8. Passport/Gap layer is represented.
9. B2B/Continuous Compliance/Radar layers are represented.
10. Access/Privacy/Audit layers are represented.
11. Security layer is represented.
12. Persistence/API/Application/Tenant layers are represented.
13. PREP-0015 is repository-backed and machine-enforced.
14. duplicate delivery/retry/recovery cannot create a second accepted domain transition.
15. projection/rebuild/restore behavior cannot rewrite authoritative history.
16. First vertical candidate does not issue AuthorizationGrant.
17. First vertical candidate uses canonical Subject identity.
18. First vertical candidate preserves original vs derived evidence separation.
19. Verification does not imply authorization.
20. EligibilityAssessment remains immutable/version-backed.
21. Passport remains a read projection.
22. TenantContext remains required for tenant-private operations.
23. API/HTTP remains transport, not domain truth.
24. UnitOfWork preserves idempotency/revision/state/event/outcome/audit atomicity.
25. Provider SDKs remain outside Core/Application semantics.
26. no product TypeScript/JavaScript source exists while feature development is frozen.
27. existing active M01 guards remain required.
28. newly found legal/security/privacy blocker downgrades readiness.
29. vertical admission remains separate from exit readiness.
30. M00 release remains a separate explicit governance event.
