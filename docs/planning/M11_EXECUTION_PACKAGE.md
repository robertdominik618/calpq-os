# CALPQ M11 Execution Package — Production UX & Operations

Status: `PLANNING COMPLETE / IMPLEMENTATION BLOCKED`

## Objective
Deliver reliable daily-use mobile, web and operating workflows over governed CALPQ Application contracts.

## Delivery slices
1. React Native/Expo mobile application shell.
2. Web/PWA application shell.
3. Safe cache and offline-read strategy.
4. Notification runtime and preferences.
5. Background-job runtime for approved async workflows.
6. Reviewer and operations surfaces using governed commands.
7. Provider-neutral observability and correlation.
8. Import/export and diagnostic tooling.
9. Accessibility, localization and performance hardening.
10. Operational-readiness evidence across normal and degraded modes.

## Ownership
M11 owns runtime composition, supported client surfaces, delivery operations, diagnostics and usability hardening. Domain authority remains in Core/Application and authoritative persistence.

## Definition of Done
- mobile and web consume the same governed Application contracts;
- cache/offline data is visibly non-authoritative when stale or disconnected;
- notification/background failures do not reverse accepted domain truth;
- operational actions are explicit and audited;
- telemetry excludes secrets and unnecessary evidence payloads;
- accessibility/performance/degraded-mode evidence is reviewable.

## Stop conditions
Stop if client cache becomes source of truth, operations surfaces bypass governed commands, telemetry becomes domain truth, or offline behavior fabricates compliance status.