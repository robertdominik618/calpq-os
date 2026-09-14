# CALPQ M02 First Vertical Admission Checklist

Status: `PLANNING ONLY / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M02-PLAN-0004`

## Candidate
`Credential Evidence -> Verification -> Eligibility -> Passport Projection`

## Admission status
`BLOCKED_PENDING_M00`

No `ADMITTED_FOR_IMPLEMENTATION` decision is issued while M00 feature development remains frozen.

## Required FV-00 package
Before admission, all four admission artifacts must exist and be reviewed:
- `FV00_VERTICAL_ADMISSION_RECORD.md`;
- `FV00_DOMAIN_STATE_BOUNDARY.md`;
- `FV00_COMMAND_EVENT_CATALOG.md`;
- complete 1:1 traceability from scenarios 1-45 to FV work packages and executable evidence, recorded in FV-00 Issue #7 if repository file creation is connector-blocked.

## Checklist against M01 Vertical Admission Gate

### 1. Domain purpose
- prove end-to-end evidence/verification/eligibility/passport architecture;
- do not issue legal/operational AuthorizationGrant;
- use deterministic, versioned fixtures for the first implementation proof.

### 2. Aggregate/domain boundary
Implementation must preserve explicit aggregate-owned mutable state, immutable evidence/decision records and read projections as separate concepts. Database schema is not the aggregate definition.

### 3. State model
Permitted outcomes/states and forbidden transitions are defined in the FV-00 domain/state boundary.

### 4. Command catalog
Every mutation command defines target, expected revision where applicable, evidence inputs, deterministic preconditions, idempotency identity and explicit outcomes.

### 5. Event catalog
Every accepted mutation identifies a stable fact/event identity with correlation/causation and minimum-necessary payload.

### 6. Evidence/provenance
Original, derived, asserted, imported, verified and stale evidence remain distinguishable. Exact source/rule/version references are preserved.

### 7. Idempotency/concurrency
Duplicate command/event delivery is expected. Optimistic revision checks are mandatory. Silent last-write-wins is forbidden.

### 8. Error/outcome mapping
Domain outcomes remain separate from validation, authorization, concurrency, dependency and infrastructure failures.

### 9. Test matrix
`M02_FIRST_VERTICAL_ACCEPTANCE_MATRIX.md` is mandatory. Implementation adds executable tests for every implemented invariant.

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
