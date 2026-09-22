# CALPQ Architecture Baseline

Status: `M00 FOUNDATION / NORMATIVE`  
ID: `CALPQ-ARCH-0001`

## 1. Goal

Define stable boundaries without selecting a programming language or UI/backend framework before approval.

## 2. Logical layers

### Core
Owns domain invariants, value semantics, authorization-independent domain rules and deterministic decisions. Core has no dependency on UI, persistence, network clients or concrete AI providers.

### Application
Coordinates use cases through Core and declared ports. It may orchestrate but may not hide domain rules that belong in Core.

### Ports
Explicit contracts for persistence, authoritative sources, notifications, identity, document storage, AI assistance and other external capabilities.

### Adapters
Implement ports for concrete technologies. Adapters translate external formats into internal contracts and must not redefine domain truth.

### UI
Renders application state and captures user intent. UI contains no business logic and cannot bypass Core/Application decisions.

### Plugins
Extend approved extension points through contracts. Plugins do not patch or fork Core behavior.

## 3. Dependency rule

Dependencies point inward toward stable abstractions. Core never imports UI or adapter concerns.

## 4. Deterministic versus probabilistic processing

Authoritative rules and entitlement decisions are deterministic and versioned. AI/OCR outputs are proposals or evidence inputs unless a separately approved contract grants a stronger role.

## 5. Data and evidence

Material state transitions must support provenance, time, rule/contract version and actor/process attribution. Original evidence and extracted/derived data must remain distinguishable.

## 6. Cross-cutting requirements

Security, privacy, accessibility, observability, auditability, localization and legal/regulatory source versioning are architecture concerns, not optional UI features.

## 7. AI economic control plane

Any feature that may use variable-cost AI follows this logical path:

`Feature / Use Case -> AI Task Contract -> AI Gateway -> Deterministic Resolver -> Cache -> Local/On-device AI -> Quality/Cost Router -> AI Cost Governor -> Budget Reservation -> Provider Adapter -> Bounded Execution -> Usage Settlement -> AI Usage Ledger -> Cache/Versioned Artifact`.

The path is fail-closed. Provider execution is denied before the provider call when payer, finite maximum cost, usable rate card, budget reservation, policy, rights/privacy or required margin conditions are missing.

Provider SDKs remain adapter concerns. Core and UI do not import concrete AI providers or AI pricing.

The control plane is horizontal: it is mandatory for M10 intelligence capabilities and for any earlier/later feature that would otherwise invoke variable-cost external AI.

Detailed architecture is defined by `CALPQ-AI-ECO-0001`, ADR-0006 and its contracts.

## 8. Technology neutrality

No concrete stack is approved by this document. Language, frameworks, storage engines and deployment model require a dedicated ADR and explicit approval.
