# ADR-0001 — Technology Stack Gate

Status: `ACCEPTED`  
Decision date: `2026-09-13`  
Scope: `M00 FOUNDATION`

## Context

CALPQ has approved architectural principles and Foundation-first governance, but no programming language, UI framework, backend framework, database, cloud provider or deployment model has been explicitly approved for CALPQ.

Selecting a stack implicitly would violate architecture-before-implementation and would make later choices harder to reverse.

## Decision

Technology selection is deferred and gated.

Until a dedicated technology ADR is explicitly approved:

- no production feature implementation starts;
- no product dependency manifest is committed;
- Foundation artifacts remain technology-neutral;
- CI may use generic repository tooling solely to enforce Foundation policy;
- candidate stacks may be evaluated, but evaluation is not authorization.

## Approval criteria for a future stack ADR

A proposal must address at least:

1. target platforms and deployment model;
2. Core/UI separation;
3. portability and plugin model;
4. security and privacy;
5. accessibility and Apple HIG implications;
6. testing and CI/CD;
7. storage, migrations and auditability;
8. AI/provider abstraction;
9. maintainability and operational cost;
10. migration/exit strategy and vendor lock-in.

## Consequences

M00 work focuses on contracts, governance and verification. The project intentionally accepts a short-term absence of feature code to avoid premature lock-in.
