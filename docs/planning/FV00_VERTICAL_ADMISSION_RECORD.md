# CALPQ FV-00 Vertical Admission Record

Status: `PLANNING COMPLETE / READY_FOR_FORMAL_ADMISSION_AFTER_M00`
ID: `CALPQ-M02-FV00-ADM-0001`

## Candidate
`Credential Evidence -> Verification -> Eligibility -> Passport Projection`

## Current decision
`BLOCKED_PENDING_M00`

This record does **not** issue `ADMITTED_FOR_IMPLEMENTATION` while M00 repository governance is blocked, M00 release is not explicitly approved, or the Feature Development Gate is not OPEN.

## Planning readiness
The pre-admission package is complete and machine-checked. Domain/state boundary, command/event catalog, 45-scenario acceptance matrix, 45/45 traceability and M02 planning readiness guard are present. Formal admission is intentionally deferred until the project-wide M00 prerequisites are satisfied.

## Purpose
Prove the CALPQ architecture end-to-end using the smallest useful regulated flow that exercises identity, immutable evidence, verification, eligibility, projection, Application orchestration, persistence, tenant isolation, access governance and auditability without issuing or mutating `AuthorizationGrant`.

## Included scope
1. canonical Subject reference;
2. immutable OriginalArtifact and DocumentIntakeRecord;
3. CredentialArtifact linked to evidence/provenance;
4. VerificationRecord based on normalized provider-neutral observations;
5. AuthorityResolution result scoped by claim, jurisdiction and time;
6. versioned CredentialDefinition and RequirementSet fixtures;
7. immutable EligibilityAssessment with four explicit outcomes;
8. Professional Passport read projection;
9. TenantContext, AccessDecision and AuditEntry references across tenant-private operations;
10. UnitOfWork, revision, idempotency and outbox/inbox boundaries for state-changing paths;
11. REST/JSON mapping only after Core/Application semantics exist;
12. async/retry/reconciliation only after the synchronous vertical is proven.

## Explicit non-goals
- issue, suspend, revoke or supersede AuthorizationGrant;
- recognition/equivalence workflow;
- B2B assignment decisions;
- renewal automation;
- Regulatory Radar automation;
- AI/OCR/provider output as authoritative truth;
- provider SDK types inside Core or Application;
- UI-specific business rules.

## Admission prerequisites
All must be true before this record may change to `ADMITTED_FOR_IMPLEMENTATION`:
- M00-BLK-001 closed after real repository-governance PASS;
- G6 PASS;
- explicit M00 release decision recorded;
- Feature Development Gate OPEN;
- Foundation and active M01 guards green on the implementation base;
- no unresolved legal/security/privacy/source blocker;
- domain/state boundary accepted;
- command/event catalog accepted;
- 45-scenario acceptance matrix mapped to executable implementation tests;
- no scope expansion into AuthorizationGrant or excluded capabilities.

## Allowed future decisions
- `ADMITTED_FOR_IMPLEMENTATION`
- `DESIGN_INCOMPLETE`
- `REQUIRES_ADR`
- `REQUIRES_LEGAL_OR_SOURCE_REVIEW`
- `REQUIRES_SECURITY_PRIVACY_REVIEW`

## Admission authority rule
A generic approval to continue planning does not change this record to `ADMITTED_FOR_IMPLEMENTATION`. Admission is a separate project-governance decision after M00 release and Feature Development Gate opening.

## Source hierarchy
Foundation/M01 contracts and Core invariants outrank this planning record. If a conflict is discovered, this record must be corrected before admission.
