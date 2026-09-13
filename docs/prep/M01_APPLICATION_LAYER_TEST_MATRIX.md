# CALPQ M01 Application Layer Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`

Mandatory scenarios:
1. HTTP route delegates to Application use case and contains no business rule.
2. Background worker invokes the same logical use case as another entrypoint where semantics are identical.
3. Scheduler does not become a domain authority.
4. Use case loads Aggregate through repository port, not provider SDK.
5. Query handler does not mutate authoritative state.
6. Authentication context is not treated as canonical Subject identity.
7. Actor role alone does not create professional authorization.
8. Application preserves correlation ID across adapter calls.
9. Causation is preserved for derived command/event flow.
10. Time enters Core through approved clock/context input.
11. IDs enter Core through approved generator/context input.
12. Application does not call wall-clock/random global functions inside Core.
13. Access/purpose policy is evaluated before unauthorized sensitive disclosure.
14. Missing material policy input does not become permissive default.
15. Application does not decide legal requirement satisfaction itself.
16. Application does not infer issuer authority from provider success.
17. AI/OCR result cannot upgrade authoritative state through orchestration shortcut.
18. Accepted Core mutation persists state/revision/event-outbox/outcome/audit atomically.
19. External notification failure after commit does not roll back domain truth.
20. External publication failure after commit becomes operational retry work.
21. Same logical command retry does not apply transition twice.
22. Stale expected revision remains explicit conflict.
23. Application does not silently last-write-wins a conflict.
24. Provider exception is translated at adapter boundary before reaching Core.
25. Application outcome preserves domain result vs infrastructure failure distinction.
26. Repository port name is capability/domain oriented, not vendor oriented.
27. Replacing storage provider does not change use-case semantics.
28. Replacing OCR/AI provider does not change verification semantics.
29. Pre-commit external observation records exact source/version/provenance when material.
30. Pre-commit irreversible side effect is forbidden without separately governed saga/compensation design.
31. Query projection remains non-authoritative.
32. Controller does not instantiate database transaction semantics directly.
33. Worker does not bypass access/security/privacy policy contracts.
34. Application Core dependency direction stays inward; Core has no Application dependency.
35. Application has no direct dependency on Fastify/React/provider SDK semantics in governed contracts.
36. Product source remains absent while M00 feature development is frozen.