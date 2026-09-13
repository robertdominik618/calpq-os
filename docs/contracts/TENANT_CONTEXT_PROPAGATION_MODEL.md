# CALPQ Tenant Context Propagation Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0020-B`

## Purpose
Carry tenant and organization scope across API, Application, workers and async processing.

## Rules
- `TenantContext` is explicit input to tenant-scoped Application use cases.
- It contains tenant_id and, where needed, organization scope plus actor/purpose/correlation references.
- Tenant scope MUST NOT be inferred from ambient process state or a default tenant.
- Background work retains the tenant/organization references needed to reconstruct the intended scope.
- Retry of one logical operation retains its tenant identity unless explicitly reissued.
- Delayed work re-evaluates time-sensitive access/delegation inputs where policy requires it.
- Cache, search and storage addressing for tenant-scoped data must preserve tenant scope or use stronger physical isolation.
- Missing, unknown or conflicting tenant scope fails closed and performs no tenant-data access.

## Platform operations
Cross-tenant platform operations require an explicit system-operation context, bounded scope and audit evidence. They MUST NOT impersonate an ordinary tenant context.
