# CALPQ M11 — Production UX, Operations & Platform Integration Baseline

Status: `PLANNING ONLY / BLOCKED`
ID: `CALPQ-M11-PLAN-0001`
Depends on: M02-M10 governed capabilities and contracts.

## Purpose
Turn CALPQ domain capabilities into robust daily-use applications and operating workflows across supported client surfaces without leaking business truth into UI, infrastructure or provider-specific code.

## Scope
M11 covers:
- React Native + Expo mobile application;
- web/PWA surface;
- Windows/PWA baseline;
- safe offline/cache strategy where allowed;
- notifications and background jobs;
- reviewer/admin operational surfaces;
- observability and diagnostics;
- support tooling;
- import/export operations;
- performance/capacity engineering;
- accessibility/localization hardening;
- deployment/runtime integration.

## Client architecture
UI consumes Application/contracts and projections. UI code must not own credential, eligibility, verification, regulatory or assignment business rules.

Mobile/web should share domain/application contracts while allowing platform-specific presentation/adapters. Core remains unaware of React Native, Expo, browser/PWA, OS or device APIs.

## Offline/cache boundary
Offline/cache may improve read continuity and queued work where safe, but:
- stale cached state is visibly distinguishable;
- offline data cannot silently become authoritative current state;
- sensitive data follows encryption/storage/privacy policy;
- mutations requiring fresh authority/access/rule checks fail closed or queue for governed revalidation.

## Notifications/background work
Notifications and workers preserve tenant, correlation, purpose and source/action references. Delivery failure or background lag is operational state, not credential/compliance truth.

## Reviewer/admin surfaces
Operational/reviewer tools expose the minimum necessary context, explicit authority, audit trace and review state. Privileged actions follow dedicated access/break-glass governance rather than hidden admin shortcuts.

## Observability
Use provider-neutral traces, metrics and logs. Observability supports diagnosis but never becomes domain truth. Raw evidence, secrets, credentials and unnecessary personal data are excluded from ordinary telemetry.

## Support diagnostics
Support tooling may surface correlation IDs, workflow state, adapter/provider health and safe audit references. It must not allow support staff to bypass governed Core/Application decisions.

## Import/export
Imports map through validated contracts/adapters; exports preserve scope/version/provenance and minimum necessary disclosure. Neither path may bypass tenant/access/privacy controls.

## Performance
Performance budgets cover API latency, projection freshness, background throughput, search response, mobile/web startup and large-tenant workloads. Performance optimization must not weaken correctness, auditability or security invariants.

## Accessibility/localization
Production surfaces must meet the existing accessibility baseline, support semantic status communication, keyboard/screen-reader paths where applicable and localization without changing Core semantics.

## Exit criteria
M11 planning is ready when every runtime/client/ops capability has a defined boundary to Application/Core, degraded/offline behavior is safe, observability/support cannot mutate truth, and supported surfaces can be operated consistently.