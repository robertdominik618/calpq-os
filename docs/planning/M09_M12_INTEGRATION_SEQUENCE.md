# CALPQ M09-M12 Integration Sequence

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M09-M12-PLAN-0001`

## Purpose
Define the final roadmap sequence from portable trust/sharing through intelligence, production operations and General Availability.

## Recommended order
### M09 — trust and disclosure
Establish minimum-necessary selective sharing, relying-party trust and external interoperability before AI or production surfaces depend on external claim exchange.

### M10 — guided intelligence
Add AI-assisted explanation, search, What-if and Next Best Action over governed M01-M09 data. M10 must consume trusted/source-backed results rather than create parallel truth.

### M11 — production platform
Operationalize approved capabilities across mobile/web/PWA, background jobs, notifications, admin/reviewer workflows, observability and support tooling.

### M12 — production evidence and GA
Validate security, privacy, recovery, performance, migration, pilot and operating readiness. GA remains a separate explicit release decision.

## Ownership rules
- M09 owns disclosure/trust/interoperability policy and presentation boundaries, not eligibility/authorization truth;
- M10 owns assistance/ranking/explanation/simulation, not authoritative domain decisions;
- M11 owns runtime/client/operations integration, not business policy;
- M12 owns production readiness evidence/release governance, not product-domain semantics.

## Cross-milestone flows
### Verified claim sharing
Authoritative CALPQ state -> M09 selective disclosure -> relying party verification. External verification feedback may become governed evidence through existing verification/intake paths, never direct Core mutation.

### Intelligent guidance
M01-M09 governed data -> M10 retrieval/simulation/explanation -> user/reviewer action. Accepted actions return through approved Application commands rather than direct AI mutation.

### Production operation
M11 clients/workers invoke the same Application/contracts. Offline/cache, notifications, observability and support tooling may lag/fail without changing authoritative truth.

### GA evidence
M11 production-like runtime -> M12 security/privacy/recovery/performance/pilot evidence -> explicit GA decision. CI/architecture readiness alone is insufficient.

## Failure boundaries
- expired/revoked share presentation -> disclosure/verification concern, not automatic historical rewrite;
- AI/model failure -> assistance degradation, not domain decision change;
- client/cache outage -> availability issue, not legal/compliance truth;
- observability loss -> diagnostic degradation, not domain state;
- recovery inconsistency -> normal exposure remains blocked until reconciled;
- failed pilot/SLO/security evidence -> GA remains blocked.

## Admission boundary
M09-M12 implementation is not admitted by this document. Each milestone requires separate planning/admission/release governance consistent with predecessor readiness.

## Exit criteria
The final roadmap block is integration-ready when trust/disclosure, AI assistance, runtime operations and GA evidence remain distinct layers with explicit ownership and no path can bypass Core, access/privacy, provenance or release governance.