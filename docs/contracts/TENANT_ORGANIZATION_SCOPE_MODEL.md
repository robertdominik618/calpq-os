# CALPQ Tenant & Organization Scope Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0020-A`

## Purpose
Define tenant and organization isolation without confusing legal identity, account identity or organizational membership.

## Core separation
`Subject != Account != Organization != Tenant`.

- `Subject` is the canonical person/organization identity used by domain logic.
- `Account` is an authentication/control surface and does not define data ownership.
- `Organization` is a domain subject/legal or operational entity.
- `Tenant` is an isolation and administration boundary for CALPQ-held data/resources; it is not itself proof of legal personality.

One Subject may participate in multiple organizations. One organization may be represented inside one tenant according to onboarding/governance rules. A tenant boundary MUST NOT transfer professional credentials or authorization between organizations.

## TenantContext
Material tenant-scoped operations carry:
- tenant_id;
- organization_scope where applicable;
- actor/subject references;
- purpose/access-decision reference;
- correlation/causation identity;
- evaluation instant;
- context provenance.

Missing or conflicting tenant context is fail-closed: `DENY`, `REVIEW_REQUIRED` or `INDETERMINATE` according to the governing use case.

## Scope classes
Data is classified as one of:
- `GLOBAL_REFERENCE` — governed platform reference data such as approved catalog definitions;
- `SUBJECT_OWNED` — data intrinsically attached to a canonical Subject but still access-controlled;
- `TENANT_SCOPED` — data isolated to one tenant;
- `ORGANIZATION_SCOPED` — data isolated to an organization within an allowed tenant context;
- `SHARED_BY_GRANT` — explicitly projected/shared data with audience, purpose, expiry and provenance;
- `SYSTEM_OPERATIONAL` — minimum platform operational metadata not treated as domain ownership.

A scope classification is explicit; absence of classification MUST NOT default to cross-tenant visibility.

## Invariants
- Authentication never substitutes for tenant resolution.
- Role/delegation is evaluated inside the requested organization/tenant scope.
- A global identifier does not make all records global.
- Subject-owned evidence may support multiple organizations only through explicit access/assignment decisions; organization-private data does not follow automatically.
- Tenant merge is not an implicit consequence of organization merge or subject merge.
