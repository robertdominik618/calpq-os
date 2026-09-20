# CALPQ M09-M12 Execution Readiness Matrix

Status: `PLANNING ONLY / IMPLEMENTATION BLOCKED`

## M09 — Trust / Sharing / Interoperability
1. M09 execution package exists and remains blocked.
2. Selective disclosure is claim-minimized.
3. Relying-party trust policy is explicit.
4. Consent and purpose limitation are enforced for sharing.
5. Presentation/share lifecycle is distinct from credential lifecycle.
6. Registry mappings preserve CALPQ semantics.
7. W3C VC integration remains an adapter boundary.
8. EUDI/OpenID4VC integration remains an adapter boundary.
9. ISO mdoc integration remains an adapter boundary.
10. M09 integration evidence covers conflicting trust and minimum-necessary disclosure.

## M10 — Intelligence Layer
11. M10 execution package exists and remains blocked.
12. AI provider boundary is provider-neutral.
13. Retrieval uses approved read models/source references.
14. Next Best Action is constrained by governed valid actions.
15. What-if outputs are explicitly hypothetical.
16. Conversational guidance cannot mutate governed state.
17. Material explanations preserve source/reason references.
18. Semantic search does not create domain truth.
19. Document assistance returns proposals, not verified facts.
20. M10 integration evidence covers hallucination/authority/fallback behavior.

## M11 — Production UX & Operations
21. M11 execution package exists and remains blocked.
22. Mobile uses governed Application contracts.
23. Web/PWA uses governed Application contracts.
24. Cache/offline state is explicitly non-authoritative when stale/disconnected.
25. Notification runtime is non-authoritative.
26. Background jobs preserve idempotency and accepted truth.
27. Operational surfaces use governed commands and audit.
28. Observability remains diagnostic rather than domain truth.
29. Accessibility/localization/performance are exit evidence.
30. M11 integration evidence covers normal and degraded operation.

## M12 — Hardening / Pilot / GA
31. M12 execution package exists and remains blocked.
32. Security hardening evidence is required.
33. Privacy lifecycle evidence is required.
34. Backup/restore validation is required.
35. Disaster-recovery validation is required.
36. Load/performance evidence is required.
37. Migration/reconciliation integrity evidence is required.
38. Pilot cohort and acceptance evidence are required.
39. Incident/support runbooks and SLOs are required.
40. GA requires an explicit evidence-backed release decision.

## Shared execution controls
41. M09 starts only after stable verified claims/access/sharing prerequisites.
42. M10 starts only after stable deterministic decisions and explainability lineage.
43. M11 may deliver enabling infrastructure earlier but cannot claim milestone exit prematurely.
44. M12 admission requires the intended v1 functional set plus M11 operational readiness.
45. No external format/protocol may redefine CALPQ Core truth.
46. No AI output may self-verify evidence or mutate governed decisions.
47. No client/cache/telemetry layer may become authoritative state.
48. GA cannot be authorized by green CI or architecture readiness alone.
49. Every milestone exit requires durable evidence and reviewable artifacts.
50. Feature Development Gate remains LOCKED until separately governed transition.