# CALPQ M02 First Vertical Admission Checklist

Status: `PLANNING ONLY / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M02-PLAN-0004`

## Candidate
`Credential Evidence -> Verification -> Eligibility -> Passport Projection`

## Admission status
No `ADMITTED_FOR_IMPLEMENTATION` decision is issued while M00 feature development remains frozen.

## Checklist against M01 Vertical Admission Gate

### 1. Domain purpose
- prove end-to-end evidence/verification/eligibility/passport architecture;
- do not issue legal/operational AuthorizationGrant;
- use deterministic, versioned fixtures for the first implementation proof.

### 2. Aggregate/domain boundary
Before admission, implementation PR must identify which state is aggregate-owned versus immutable decision/evidence records and read projections. Database schema is not accepted as the aggregate definition.

### 3. State model
Before admission, enumerate permitted states/transitions for the mutable records in scope and explicitly list forbidden transitions. Verification, eligibility and passport projection states remain separate.

### 4. Command catalog
Before admission, every mutation command must define actor context, target, expected revision, evidence inputs, Core preconditions, idempotency identity and explicit domain outcomes.

### 5. Event catalog
Before admission, every accepted mutation identifies domain facts, event identity, correlation/causation, aggregate revision and minimum necessary payload.

### 6. Evidence/provenance
Original, derived, asserted, imported, verified and stale evidence remain distinguishable. Exact source/rule/version references are preserved for historical replay.

### 7. Idempotency/concurrency
Duplicate command/event delivery is expected. Optimistic revision checks are mandatory. Silent last-write-wins is forbidden.

### 8. Error/outcome mapping
Domain outcomes remain separate from validation, authorization, concurrency, dependency and infrastructure failures.

### 9. Test matrix
`M02_FIRST_VERTICAL_ACCEPTANCE_MATRIX.md` is the baseline mandatory scenario set. Implementation adds executable tests for every implemented invariant.

### 10. Architecture review
- Core framework-free;
- Application orchestration only;
- provider SDKs in adapters;
- persistence model distinct from domain model;
- tenant/access/audit/provenance enforced end-to-end;
- no AuthorizationGrant issuance in the first slice.

## Admission prerequisites still outstanding
- G6 repository governance PASS;
- explicit M00 release decision;
- Feature Development Gate OPEN;
- green implementation base;
- formal admission record selecting `ADMITTED_FOR_IMPLEMENTATION`.

Until all of these are true, this checklist is preparation only.
