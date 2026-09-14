# CALPQ M02 First Vertical Acceptance Matrix

Status: `PLANNING ONLY / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M02-PLAN-0003`

Mandatory acceptance scenarios for the first vertical:

1. typed Subject/Credential/Artifact IDs cannot be mixed accidentally;
2. deterministic Core uses injected Clock and IdGenerator;
3. original artifact remains immutable;
4. derived extraction cannot overwrite original evidence;
5. AI/OCR output remains non-authoritative evidence/proposal;
6. CredentialArtifact remains distinct from AuthorizationGrant;
7. verification success does not imply issuer legal authority;
8. authority resolution is scoped by claim, jurisdiction and time;
9. one logical command ID cannot produce two accepted transitions;
10. stale expected revision cannot silently overwrite current state;
11. command outcome remains distinct from transport error;
12. `SATISFIED` is represented explicitly;
13. `NOT_SATISFIED` is represented explicitly;
14. `INDETERMINATE` is represented explicitly;
15. `REVIEW_REQUIRED` is represented explicitly;
16. eligibility records exact CredentialDefinition version;
17. eligibility records exact RequirementSet version;
18. eligibility preserves source/evidence/provenance references;
19. historical eligibility remains immutable after later rule changes;
20. passport is rebuilt from authoritative inputs and remains a projection;
21. stale passport projection cannot authorize a regulated mutation;
22. tenant-private write requires explicit TenantContext;
23. cross-tenant lookup cannot reveal existence through result/error metadata;
24. sensitive read evaluates access/purpose policy before disclosure;
25. minimum-necessary disclosure excludes unrelated evidence;
26. audit entry links actor/process/subject/object/decision without becoming domain truth;
27. accepted state and outbox intent commit atomically;
28. post-commit notification/index failure cannot roll back domain truth;
29. duplicate event delivery does not duplicate consumer-visible effect where deduplication is required;
30. projection rebuild never issues or mutates AuthorizationGrant;
31. API DTO remains distinct from aggregate/domain model;
32. HTTP 2xx does not imply domain `SATISFIED`;
33. RFC 9457-compatible error includes stable code and correlation identifier;
34. provider-specific errors do not cross into Core semantics;
35. repository returns domain types, not raw database rows as domain truth;
36. database row/sequence ID is never CALPQ domain identity;
37. Core has no Fastify/React/ORM/provider SDK dependency;
38. Application orchestrates but does not invent legal/qualification semantics;
39. worker/scheduler path invokes the same Application use-case semantics as API entry points;
40. feature implementation cannot start while Feature Development Gate is LOCKED;
41. first vertical cannot issue or mutate AuthorizationGrant;
42. recognition/equivalence remains out of scope;
43. B2B assignment remains out of scope;
44. renewal/Regulatory Radar automation remains out of scope;
45. all active Foundation/M01 guards remain green after every increment.

## Completion threshold
The vertical cannot be declared complete with waived mandatory scenarios. A scenario may be marked not-applicable only if the vertical admission record explicitly removes the associated capability from scope before implementation.
