# CALPQ M01 Vertical Admission Gate

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`  
ID: `CALPQ-M01-PREP-0002-E`

## Purpose

Prevent product verticals from entering implementation before their domain boundary is explicit and compatible with the Core kernel.

## Admission prerequisites

A vertical is not implementation-ready until it provides all of the following.

### 1. Domain purpose

- user/business outcome;
- authoritative scope and explicit non-goals;
- regulatory/jurisdiction context where relevant.

### 2. Aggregate boundary

- aggregate root name and responsibility;
- stable identity;
- owned state;
- invariants;
- what is deliberately outside the aggregate.

### 3. State model

- allowed states;
- allowed transitions;
- terminal states if any;
- review/pending states where necessary;
- forbidden transitions.

### 4. Command catalog

Every mutation command specifies:

- semantic command name;
- actor eligibility at the Application/authorization layer;
- target aggregate;
- expected revision;
- required authoritative inputs/evidence;
- deterministic Core preconditions;
- expected domain outcomes.

### 5. Domain event catalog

Every accepted state-changing transition identifies its emitted facts and event metadata requirements.

### 6. Evidence and provenance

The vertical defines:

- which assertions require evidence;
- which evidence may be verified, asserted, imported, AI/OCR-derived or stale;
- required source/rule versions;
- historical reproducibility expectations.

### 7. Idempotency/concurrency

The vertical identifies duplicate-command behavior, revision conflict behavior and any domain-specific conflict policy. Silent last-write-wins is not accepted by omission.

### 8. Error/outcome mapping

Legitimate domain outcomes are separated from infrastructure, contract and authorization errors.

### 9. Test matrix

Before coding, the vertical lists invariant tests for:

- valid transition;
- invalid transition;
- duplicate command;
- stale revision;
- insufficient evidence/authority;
- provenance preservation;
- historical rule/version behavior where applicable;
- every high-impact or irreversible transition.

### 10. Architecture review

The vertical demonstrates that:

- Core remains framework-free;
- UI owns no domain rule;
- provider SDKs remain in adapters;
- Application orchestrates but does not hide Core invariants;
- persistence schema is not treated as the domain model;
- plugins/extensions use contracts rather than modifying Core.

## Admission result

Possible results:

- `ADMITTED_FOR_IMPLEMENTATION`
- `DESIGN_INCOMPLETE`
- `REQUIRES_ADR`
- `REQUIRES_LEGAL_OR_SOURCE_REVIEW`
- `REQUIRES_SECURITY_PRIVACY_REVIEW`

Only `ADMITTED_FOR_IMPLEMENTATION` permits product source implementation, and only after the project-wide M00 release has separately authorized feature development.

## Initial CALPQ candidates

Likely future verticals include Professional/Credential Passport, Credential Lifecycle, Document Intake, Verification/Evidence, B2B Compliance and Civic/Election Competence. Listing here does not admit any of them automatically.
