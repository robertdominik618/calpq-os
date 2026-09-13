# CALPQ Cross-Tenant Isolation Model

Status: `PRE-M01 DESIGN / NO IMPLEMENTATION AUTHORIZATION`
ID: `CALPQ-M01-PREP-0020-C`

## Purpose
Prevent one tenant or organization from reading, mutating, exporting or indirectly inferring another tenant's private CALPQ data.

## Defense in depth
Isolation is enforced at multiple layers:
1. Application use-case scope validation;
2. tenant-aware repository/query contracts;
3. persistence constraints and, where adopted, PostgreSQL Row-Level Security;
4. tenant-aware cache/search/index namespaces;
5. object-storage ownership metadata;
6. export/share policy;
7. audit and reconciliation.

No single layer is sufficient by itself.

## Persistence rules
Tenant-scoped authoritative rows carry tenant identity explicitly. Organization-scoped rows also carry/derive organization scope according to the schema contract.

Where relational integrity permits, uniqueness and foreign-key relationships are tenant-aware so a reference cannot silently connect records from different tenants.

PostgreSQL RLS may be used as defense-in-depth, but CALPQ MUST NOT rely on RLS alone because privileged database roles/owners may bypass policy and integrity checks can reveal information if schemas are poorly designed.

## Query boundary
Repository methods for tenant-scoped data require TenantContext or an explicitly bounded system-operation context. Unscoped list/read/update methods are forbidden for tenant-private aggregates and projections.

## Indirect leakage
Cross-tenant isolation applies to:
- counts and existence checks;
- search suggestions;
- pagination totals;
- unique/conflict error wording;
- cache entries;
- logs/telemetry;
- exports and temporary files;
- object metadata;
- derived projections.

A caller MUST NOT learn that another tenant owns a record merely from a detailed error unless policy explicitly permits that disclosure.

## Administrative access
Privileged/platform access is purpose-scoped, time-bounded where appropriate and audited under PREP-0016. It does not redefine ownership or make private data globally visible.
