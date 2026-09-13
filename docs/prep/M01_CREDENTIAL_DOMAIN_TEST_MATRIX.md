# M01 Credential / Authorization Domain Test Matrix

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-TEST-CRED-0001`

## Purpose

Define the invariant tests required before the credential/authorization vertical can be admitted for implementation.

## Artifact versus authorization

1. importing a valid credential artifact does not create an `AuthorizationGrant`;
2. cryptographic verification success does not produce eligibility `SATISFIED` by itself;
3. OCR/AI extraction remains derived evidence until verified.

## Requirement aggregation

4. `ALL` rejects when any child is `NOT_SATISFIED`;
5. `ALL` returns `REVIEW_REQUIRED` when no child fails but mandatory review remains;
6. `ANY` succeeds when any child is `SATISFIED`;
7. `AT_LEAST(n)` succeeds/rejects deterministically at threshold boundaries;
8. missing required evidence never fabricates satisfaction.

## Eligibility history

9. an assessment binds exact requirement-set version and evidence snapshot;
10. new evidence creates a new assessment rather than rewriting the previous one;
11. historical assessment remains reproducible after later rule versions appear.

## Grant admission

12. `SATISFIED` assessment can be submitted as grant basis but does not auto-create a grant;
13. `INDETERMINATE` cannot auto-grant;
14. `REVIEW_REQUIRED` cannot auto-grant;
15. `NOT_SATISFIED` requires both an override-permitted policy and attributable authority decision, otherwise reject.

## Lifecycle

16. grant before `valid_from` projects `SCHEDULED`;
17. grant inside validity window projects `ACTIVE`;
18. passing `valid_until` projects `EXPIRED` without mutating aggregate state;
19. suspension blocks effective authorization without rewriting validity history;
20. reinstatement does not extend validity automatically;
21. revoked grant ID cannot be reactivated;
22. supersession requires successor linkage;
23. renewal preserves prior validity/evidence history.

## Concurrency and idempotency

24. duplicate command ID does not create a second grant or second lifecycle transition;
25. stale `expected_revision` is rejected with concurrency conflict;
26. no silent last-write-wins path exists.

## Event/provenance

27. every lifecycle event carries resulting revision, causation/correlation and actor/authority attribution;
28. grant decision retains exact rule/source version and evidence snapshot;
29. later evidence staleness does not rewrite historical grant provenance.

## Interoperability

30. W3C VC ingestion maps to `CredentialArtifact`/evidence, never directly to grant;
31. OpenID issuance/presentation protocol state does not become Core lifecycle state;
32. EUDI/other wallet trust metadata is preserved but legal authority is determined by applicable CALPQ rule/trust policy.

## Admission rule

The credential vertical remains `NOT_ADMITTED_FOR_IMPLEMENTATION` until M00 release plus explicit vertical admission. The first implementation PR must convert these scenarios into executable tests before or alongside production logic.
