# ADR-0007 — Contextual jurisdiction, position and time compliance

Date: 2026-09-23
Decision: OWNER-REQUESTED TARGET ARCHITECTURE
Scope: ARCHITECTURE_ONLY
Owner record: https://github.com/robertdominik618/calpq-os/issues/168

ADR-0007 is used intentionally because ADR-0006 is already used by the separate open AI-economy architecture PR #167. This decision does not depend on or merge that PR.

## Context

CALPQ already models credentials, temporal rules, lifecycle, continuous compliance and Regulatory Radar. The owner requested that CALPQ warn a holder when crossing borders or entering another operational context changes rules relevant to the holder's credential, including road-driving rules, BAC/BrAC, driving side, maritime distance/time rules and similar location/time-sensitive obligations.

The problem is broader than country borders: legal and operational applicability can change at subnational, municipal, port, territorial-water, protected-area, airspace and UAS geo-zone boundaries, and at time/season/sunset/visibility/temporary-notice transitions.

## Decision

Create CALPQ-CONTEXT-0001 as one horizontal Contextual Jurisdiction, Position & Time Compliance Engine.

It shall:
- treat location/time/environment as observations, never legal authority;
- reuse existing deterministic Core, lifecycle, re-evaluation, notification and replay semantics;
- resolve overlapping spatial/temporal scopes using reviewed applicability rules;
- produce version-pinned before/after deltas;
- generate notification intents, never direct provider delivery;
- preserve UNKNOWN/REVIEW_REQUIRED on material uncertainty;
- prefer privacy-preserving on-device processing and minimum necessary precision;
- separate normative legal sources, geospatial boundaries, dynamic operational notices and device/environment observations;
- support plan and live modes;
- support offline corridor packs with explicit freshness;
- bind globally to CALPQ-GLOBAL-0001 only after that open architecture dependency is integrated.

## Rejected alternatives

Rejected:
- country-code-only switch;
- GPS -> law lookup without credential/activity context;
- one global table of BAC/speed/coastal limits;
- “strictest rule always wins”;
- storing every user trip by default;
- LLM-generated legal alerts;
- commercial map provider as source of legal truth;
- notification acknowledgement as compliance evidence;
- one giant destination-country briefing at every border;
- separate per-domain engines that duplicate jurisdiction logic.

## Consequences

Benefits:
- one reusable mechanism for road, maritime, aviation, drones and other mobile regulated activities;
- highly relevant delta alerts instead of generic country guides;
- direct reuse of Credential Graph and Regulatory Radar;
- strong global product differentiation.

Costs:
- authoritative geospatial and dynamic-source maintenance;
- difficult boundary/overlap semantics;
- background-location privacy/battery design;
- local expert review;
- replay and freshness evidence;
- careful safety UX.

## Integration boundary

This ADR adds architecture only. It changes no runtime enum, database schema, location permission, provider, production rule, release status or milestone admission.

Runtime implementation requires a new governed admission after:
- exact contract binding to current M06/M07 capabilities;
- resolution/integration of the relevant GLOBAL jurisdiction-pack dependency;
- security/privacy review;
- domain-specific authoritative sources;
- negative tests for uncertain location, stale data and conflicting scopes.
