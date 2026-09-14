# CALPQ FV-13 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-13 integrates tenant isolation, access/purpose decisions and audit references across the full first-vertical path.

TenantContext is explicit for tenant-scoped use cases and carries tenant identity plus organization/actor/purpose/correlation references where required. Tenant scope is never inferred from ambient/default process state. Missing, unknown or conflicting scope fails closed.

Sensitive reads evaluate access and purpose before disclosure and expose minimum necessary data. Cross-tenant platform operations require explicit bounded system context and audit evidence.

Audit references record attributable facts about material operations but do not become domain truth. Tenant scope must survive API, Application, workers, async delivery, cache/search/storage addressing and retries.