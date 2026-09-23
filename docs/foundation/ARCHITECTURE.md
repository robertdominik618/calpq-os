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


## 8. Contextual jurisdiction, position and time extension — CALPQ-CONTEXT-0001 (2026-09-23)

[CALPQ-CONTEXT-0001](../architecture/CALPQ_CONTEXT_0001_SPATIOTEMPORAL_COMPLIANCE.md) is the owner-requested architecture for credential-relevant rule changes caused by jurisdiction, zone, position, time or reviewed operating context. [ADR-0007](../adr/ADR-0007-contextual-spatiotemporal-compliance.md) requires one shared deterministic Core and rejects GPS, route data, AI or commercial providers as legal truth.

Normative target contracts: [contextual jurisdiction runtime](../contracts/CONTEXTUAL_JURISDICTION_RUNTIME.md), [spatiotemporal triggers](../contracts/SPATIOTEMPORAL_TRIGGER_MODEL.md), [rule delta / briefing](../contracts/CONTEXTUAL_RULE_DELTA_BRIEFING.md), [dynamic operational sources](../contracts/DYNAMIC_OPERATIONAL_SOURCE_MODEL.md) and [location privacy/safety](../security/CONTEXTUAL_LOCATION_PRIVACY_SAFETY.md). [Traceability](../planning/CALPQ_CONTEXT_0001_TRACEABILITY.md) and [machine scope](../planning/context_scope.json) record 20 domain families, 18 trigger families and 48 product scenarios.

This architecture reuses M06 lifecycle/notification/re-evaluation/replay and M07 Regulatory Intelligence. Global runtime binding depends on the separate open CALPQ-GLOBAL-0001 PR #138 and must not pretend that #138/#135 are merged. This change authorizes no background location collection, production rule publication, live navigation, provider integration, notification delivery or runtime feature implementation.
