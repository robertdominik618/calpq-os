# CALPQ M03 Slice 01 Implementation Contract — Dashboard Governed Read Models

Status: `IMPLEMENTING / EXECUTABLE EVIDENCE PENDING`
ID: `CALPQ-M03-S01-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Authorized execution entry: `M03_SLICE_01_DASHBOARD_READ_MODELS`.
Admission head: `a7b8198192555a79c6e4b4ebe7e8c9a0060642cf`.
Source-boundary commit: `f39a07380154ebeebe0ba295203a660b49ca4935`.

## Scope
Slice 01 introduces a framework-neutral `DashboardReadModel` composed only from the governed M02 `ProfessionalPassportProjection`.

Included:
- explicit Professional Passport projection source kind;
- canonical subject and authoritative assessment/version references;
- direct eligibility-outcome passthrough without re-evaluation;
- explicit authoritative-evaluated and projection-generated instants;
- read-only counts over existing Passport authority classes;
- controlled dashboard navigation destinations;
- localization-ready navigation label keys;
- explicit `authorizationAuthority = false`.

## Hard boundaries
- dashboard does not compute eligibility, verification or legal validity;
- no generic `valid` / `isValid` state;
- no `AuthorizationGrant` behavior;
- no direct provider/database/UI-framework dependency;
- no ambient wall-clock or randomness;
- UI consumers render this contract rather than reproducing domain logic.

## Evidence target
Exactly 16 runtime checks plus strict TypeScript compile-time evidence, FV-12 predecessor regression, M03 admission integrity and architecture boundary checks.
