# ADR-0002 — CALPQ Technology Stack Selection

Status: `ACCEPTED`  
Decision owner: CALPQ governance  
Decision date: `2026-09-13`  
Approved on: `2026-09-13`  
Depends on: `ADR-0001 — Technology Stack Gate`

## Context

CALPQ must support iOS/iPadOS, Android, web and Windows while preserving strict architecture boundaries, auditability, accessibility, regulatory-source provenance, offline capability and a low-maintenance operating model. The comparative evidence is recorded in `docs/architecture/TECHNOLOGY_STACK_EVALUATION_2026-09-13.md`.

## Decision

CALPQ adopts a **TypeScript-first modular monorepo**.

### Clients

- React Native + Expo for iOS/iPadOS and Android.
- Expo Router for universal application routing.
- React Native Web / React DOM where appropriate for the browser surface.
- Installable PWA as the Windows baseline.
- A native Windows shell requires a later ADR and measured justification.

### Server

- TypeScript as the primary server language.
- Node.js 24 LTS runtime baseline at this decision date.
- Fastify 5.x as the HTTP/API framework.
- REST/JSON with OpenAPI 3.1.x for the initial external and client/server API boundary.

### Persistence and operations

- PostgreSQL 18 as the authoritative relational database baseline.
- Explicit versioned SQL migrations.
- S3-compatible object storage behind a port for evidence/document binaries.
- SQLite behind a local-persistence port for native clients; browser storage behind a separate web adapter.
- GitHub as source of truth and GitHub Actions as baseline CI.
- OCI-container deployable server workloads.
- OpenTelemetry-compatible observability boundary.

### Identity, AI and OCR

Identity is integrated through an OIDC/OAuth-compatible port. AI and OCR are adapter concerns behind provider-neutral contracts. No AI/OCR provider may own authoritative domain state.

## Package boundaries

The approved physical direction is:

- `packages/core` — pure domain values, invariants and deterministic rules;
- `packages/application` — use cases and orchestration;
- `packages/contracts` — wire schemas, stable ports and events;
- `packages/adapters` — external-system implementations;
- `apps/mobile` — Expo/React Native composition and presentation;
- `apps/web` — browser/PWA composition and presentation;
- `apps/api` — Fastify composition root;
- `workers/*` — background-processing composition roots.

`core` knows no UI or provider SDK. `application` depends inward on Core and contracts. Adapters implement ports. Apps and workers compose the system; they do not own domain truth.

## TypeScript policy

Future production packages must extend the strict repository TypeScript baseline. Compile-time typing never replaces runtime validation at trust boundaries.

## Offline policy

Mobile offline writes are represented as explicit pending operations reconciled against server-authoritative revisions. Silent last-write-wins is not the default for regulated state. Web/PWA offline behavior starts narrower and must not compromise update or consistency guarantees.

## Consequences

Benefits include one primary language across clients, server, contracts and most tests; native mobile rendering; standards-based browser semantics; low-friction Windows coverage through PWA; and provider-neutral deployment boundaries.

Costs include JavaScript ecosystem churn, scheduled React Native/Expo upgrades, occasional Swift/Kotlin work at native boundaries, and the fact that PWA does not equal a native Windows executable for every use case.

## Approval effect

This approval authorizes **technology bootstrap only**:

1. `foundation/manifest.json` may set the technology stack to `APPROVED` and reference this ADR.
2. Root/workspace package manifests and strict TypeScript configuration may be created.
3. Empty architectural package/application/worker shells and architecture tests may be created.
4. `M00` remains `BLOCKED`.
5. Product feature development remains `FROZEN`.
6. Production feature source code is still prohibited until a separate explicit M00 release decision.

## Evidence

See `docs/architecture/TECHNOLOGY_STACK_EVALUATION_2026-09-13.md` for the comparative research snapshot that informed this decision.
