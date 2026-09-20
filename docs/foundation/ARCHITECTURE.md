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

## 7. Technology neutrality

No concrete stack is approved by this document. Language, frameworks, storage engines and deployment model require a dedicated ADR and explicit approval.

## 8. Accepted domain extension — CALPQ-EXPAT-0001 (2026-09-18)

[Expat & Global Mobility](../architecture/CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md) is the owner-approved complete target architecture for Život a práce v Česku / Living & Working in Czechia. [ADR-0004](../adr/ADR-0004-expat-global-mobility.md) binds its 24 functional areas, shared localization, reference-based MobilityCase, existing deterministic Core, evidence, recognition, Family, B2B, lifecycle and selective sharing boundaries.

Normative extension contracts: [Mobility context](../contracts/EXPAT_MOBILITY_CONTEXT.md), [shared localization](../contracts/LOCALIZATION_SEMANTIC_PARITY.md), [privacy/safeguards](../security/EXPAT_PRIVACY_SAFEGUARD_MODEL.md). [Intake and delivery](../planning/CALPQ_EXPAT_0001_INTAKE_AND_DELIVERY.md) records complete scope, phase/milestone dependencies, separate implementation admission and [acceptance traceability](../planning/expat_scope.json).

This dated addition does not change the original Foundation text, the accepted technology ADR, milestone admission, AuthorizationGrant semantics or production readiness. Historical status prose must be read with current governance records; documentation drift is separately tracked in #129. This extension is repository architecture, not a deployed feature or a legal-rule publication.
