# CALPQ M02 First Vertical Backlog

Status: `PLANNING ONLY / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M02-PLAN-0002`

## Work packages

| ID | Work package | Depends on | Exit evidence |
|---|---|---|---|
| FV-00 | Vertical admission package | M00/G7 + Feature Gate OPEN | approved admission record |
| FV-01 | Core typed IDs and semantic values | FV-00 | unit tests + dependency checks |
| FV-02 | Clock / IdGenerator ports | FV-01 | deterministic tests |
| FV-03 | Provenance/evidence/result model | FV-01 | original-vs-derived and outcome tests |
| FV-04 | Command/event/revision/idempotency kernel | FV-01–03 | duplicate/stale-revision tests |
| FV-05 | Credential evidence domain types | FV-04 | invariant tests |
| FV-06 | Application execution context/use cases | FV-05 | orchestration tests |
| FV-07 | Persistence UnitOfWork/repositories | FV-06 | atomicity/concurrency tests |
| FV-08 | SQL migration + outbox/inbox | FV-07 | migration/delivery tests |
| FV-09 | Minimal document evidence intake | FV-05–08 | immutable-original tests |
| FV-10 | Verification orchestration | FV-09 | authority/verification tests |
| FV-11 | Eligibility evaluation | FV-10 | four-outcome tests + version replay |
| FV-12 | Passport projection | FV-11 | projection rebuild tests |
| FV-13 | Tenant/access/audit integration | FV-06–12 | isolation/access/audit tests |
| FV-14 | REST/JSON endpoints | FV-13 | contract/API tests |
| FV-15 | Async/retry/reconciliation | FV-14 | operational-resilience tests |

## Commit-size rule
Each work package should land in the smallest coherent changes that preserve a green Foundation/M01 baseline. Tests are delivered in the same change as each implemented invariant.

## Blockers that stop implementation
- M00 governance not released;
- Feature Development Gate not OPEN;
- vertical admission result is not `ADMITTED_FOR_IMPLEMENTATION`;
- unresolved security/privacy/legal/source blocker;
- dependency direction violation;
- any existing Foundation/M01 guard failure.

## First-slice fixtures
Use deterministic, versioned test fixtures only:
- one canonical Subject;
- one tenant/organization context;
- one CredentialDefinition version;
- one RequirementSet version;
- one immutable original artifact;
- one normalized verification observation;
- one eligibility decision path;
- one passport projection.

Production provider credentials, real personal documents and live legal conclusions are not required for the first implementation proof.
