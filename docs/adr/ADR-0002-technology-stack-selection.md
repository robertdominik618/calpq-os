# ADR-0002 — CALPQ Technology Stack Selection

Status: `PROPOSED — REQUIRES EXPLICIT APPROVAL`  
Decision owner: CALPQ governance  
Date: 2026-09-13  
Depends on: `ADR-0001 — Technology Stack Gate`

## Context

CALPQ must support iOS/iPadOS, Android, web and Windows while preserving strict architecture boundaries, auditability, accessibility, regulatory-source provenance, offline capability and a low-maintenance operating model.

The detailed comparison is recorded in `docs/architecture/TECHNOLOGY_STACK_EVALUATION_2026-09-13.md`.

## Proposed decision

Adopt a **TypeScript-first modular monorepo** with the following baseline.

### Application clients

- **React Native + Expo** for iOS/iPadOS and Android.
- **Expo Router** for application routing and universal navigation.
- **React Native Web / React DOM where appropriate** for the browser surface.
- **Installable PWA** as the Windows baseline.
- Native Windows packaging is not part of the initial baseline. A future Tauri or React Native Windows shell requires a separate ADR and measured justification.

### Server

- **TypeScript** as the primary server language.
- **Node.js 24 LTS** as the production runtime baseline at the decision date.
- **Fastify 5.x** as the HTTP/API framework.
- **REST/JSON** with **OpenAPI 3.1.x** contracts for the initial external and client/server API boundary.

### Persistence

- **PostgreSQL 18** as the authoritative relational database baseline, using the current supported minor release.
- Explicit, versioned SQL migrations.
- S3-compatible object storage behind a port for document/evidence binaries.
- Native local persistence through SQLite behind a port; browser persistence through a web adapter.

### Operations

- GitHub as source of truth.
- GitHub Actions as baseline CI.
- OCI-container deployable server workloads.
- OpenTelemetry-compatible telemetry boundary.
- Self-hostable web artifacts; Expo EAS is optional, never mandatory.

### Identity

Identity integrates through an OIDC/OAuth-compatible port. The concrete identity provider is deliberately not selected in this ADR.

### AI and OCR

AI/OCR implementations are adapter packages only. Core and Application layers depend on provider-neutral ports and schemas. No AI/OCR provider may own authoritative domain state.

## Architectural package boundaries

After approval, the bootstrap repository should converge on logical packages similar to:

- `core` — pure domain values, invariants and deterministic rules;
- `application` — use cases and orchestration;
- `contracts` — wire schemas, events and stable ports;
- `adapters/*` — database, object storage, identity, AI, OCR, notifications and external registries;
- `apps/mobile` — Expo/React Native presentation and native adapters;
- `apps/web` — universal/web presentation surface;
- `apps/api` — Fastify composition root/API;
- `workers/*` — long-running background processing;
- `tests/*` — architecture, contract, integration and end-to-end verification.

Physical names may be refined during bootstrap, but dependency direction may not be reversed.

## Dependency rule

`core` knows no framework.  
`application` depends on `core` and abstract contracts.  
`adapters` depend inward and implement ports.  
`apps/*` are composition/presentation layers.  
UI may not own business rules.  
Provider SDKs may not appear in `core` or `application`.

## TypeScript policy

The approved baseline requires strict TypeScript configuration. At minimum, bootstrap must enable strict type checking and rules equivalent to preventing unchecked/implicit boundary values. Runtime trust boundaries must still be validated with schemas; TypeScript compile-time types are not accepted as runtime validation.

## API contract policy

Wire contracts are versioned independently of UI implementation. Schemas drive validation, documentation and contract tests. The server is authoritative for state-changing regulated operations.

OpenAPI 3.2.1 was released immediately before this decision. CALPQ deliberately starts with OpenAPI 3.1.x until the chosen generators, validators and documentation tooling demonstrate complete 3.2 support.

## Data policy

PostgreSQL is the canonical structured persistence engine. ORM metadata may assist implementation but may not replace explicit database migrations as the authoritative schema evolution record.

Original document binaries remain distinguishable from derived/extracted data and are stored through a content-storage port with provenance metadata.

## Offline policy

Mobile clients may support meaningful offline workflows. Local writes are explicit pending operations synchronized against server-authoritative revisions. Silent last-write-wins is not the default for regulated data.

Web/PWA offline behavior is intentionally narrower at first because service-worker caching introduces update and consistency risks.

## Windows policy

Windows v1 means an installable standards-based PWA. This satisfies normal desktop installation and Windows integration without introducing a second desktop UI framework. If later requirements demand deep native Windows APIs, offline characteristics unavailable to the PWA, or enterprise packaging beyond PWA capabilities, a separate Windows-shell ADR will be created.

## Rejected as baseline

### Flutter

Not rejected as incapable. It has excellent multi-platform reach and mature mobile/desktop support. CALPQ nevertheless prefers the React/DOM path because browser semantics and accessibility are first-class product requirements, whereas Flutter web renders through its own layer and exposes accessibility through a generated semantics DOM.

### Kotlin Multiplatform + Compose

Excellent candidate for shared domain logic and native/desktop UI, but Compose Multiplatform web/Wasm is still Beta at the decision date. CALPQ does not want its primary browser UI on a pre-stable UI target.

### .NET MAUI + Blazor

Strong ecosystem and Windows story, but web requires a parallel Blazor surface rather than being a direct MAUI deployment target, increasing UI architecture complexity.

### Fully native Swift + Kotlin + separate web

Highest platform fidelity but materially higher maintenance cost and duplication for the initial team size.

### Tauri as universal baseline

Strong desktop technology and viable mobile support, but it would introduce Rust plus a WebView-based client architecture before CALPQ has a demonstrated need for that complexity. Tauri remains a valid future desktop-shell adapter.

## Consequences

### Positive

- one primary language across client, server, contracts and most tests;
- native mobile rendering and integrations;
- standards-based web surface with browser accessibility semantics;
- Windows coverage without immediate native desktop duplication;
- large ecosystem for document, AI and web integrations;
- provider-neutral deployment remains possible;
- incremental path to native platform modules where required.

### Costs and risks

- npm/JavaScript ecosystem dependency churn must be actively controlled;
- React Native/Expo upgrades must be scheduled and tested rather than continuously floated;
- native modules still require Swift/Kotlin knowledge at integration boundaries;
- PWA is not equivalent to a native Windows executable for every use case;
- shared TypeScript code must not blur client/server trust boundaries;
- schema validation and architecture tests are mandatory because compile-time types alone cannot protect runtime boundaries.

## Versioning policy

Exact dependency pins belong to the implementation bootstrap commit/lockfile, not to Core rules. Production runtimes must use supported/LTS versions. Major upgrades require controlled compatibility testing and an ADR amendment when they materially change architecture or contracts.

## Approval effect

If this ADR is explicitly approved:

1. `foundation/manifest.json` may change technology-stack state from `NOT_YET_APPROVED` to `APPROVED` with reference to `ADR-0002`.
2. M00 remains `BLOCKED` until a separate explicit M00 release decision.
3. A bootstrap implementation may then create package manifests, workspace configuration and empty architectural package shells.
4. Product feature development remains `FROZEN` until M00 release.

Approval of this ADR therefore authorizes the **technology bootstrap**, not product features.

## Evidence

See `docs/architecture/TECHNOLOGY_STACK_EVALUATION_2026-09-13.md` for the weighted comparison and primary-source snapshot.
