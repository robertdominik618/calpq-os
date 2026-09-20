# CALPQ FV-13 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-13 integrates tenant isolation, access/purpose decisions and audit references across the full first-vertical path.

TenantContext is explicit for tenant-scoped use cases and carries tenant identity plus organization/actor/purpose/correlation references. Tenant scope is never inferred from ambient/default process state. Missing, unknown or conflicting scope fails closed.

Sensitive reads evaluate access and purpose before disclosure and expose minimum necessary data. Cross-tenant platform operations require explicit bounded system context and audit evidence.

Audit references record attributable facts about material operations but do not become domain truth. Tenant scope survives Application, repository/cache/search/storage addressing, worker/async delivery and retries.

## Implementation evidence

- FV-12 durable predecessor evidence: `b03c084cccbdc5031733a165dfca51fc4cd17207`.
- Tenant governance source started at `ae0cee4a847bdec0cede6e8a757c62229a377f05`.
- Retry context correction `5208d72d89f85259934419ce87397d7e756f70a7` preserves original tenant, organization, actor, purpose and correlation identity instead of synthesizing ambient retry identity.
- Public Application export boundary: `9791fac525504620016eba602524e046bb011f89`.
- Runtime evidence: `4229a4e0bd5d298960ce74559deda79fe6e6f66c` — exact 24-point contract suite.
- Compile-time evidence: `2e2ebd1e143109506a3a8a3952c24261a60740b2` plus tsconfig wiring `71c18d8cb2ea7334f742bb6c9f11ad2ce6502179`.
- Dedicated gate/workflow: `6130df15c79722639d4fb6b583879f96be94861d` / `8e6670a81dc41c8465ee7f900fec2015302447f8`.

Verified behavior:
- explicit `TenantContext` with tenant, organization, actor, purpose and correlation references;
- `TenantBoundary` rejects unknown scopes without exposing tenant existence details;
- repository/cache/search/storage/worker/async addresses are explicitly tenant-keyed;
- retry envelopes retain tenant, organization, actor, purpose and correlation identity;
- sensitive reads invoke the loader only after tenant, access and purpose checks and return only requested fields inside the allowed field set;
- cross-tenant and ordinary denied reads return the same generic `Access denied` boundary;
- cross-tenant system operations require a `SYSTEM_PROCESS` actor, explicit bounded permitted tenant list and audit reference;
- `TenantAuditEvidence` is attributable evidence with `domainTruth=false`;
- degraded-mode resource addressing preserves the same tenant scope.

Verified on `8e6670a81dc41c8465ee7f900fec2015302447f8`:
- FV-13 Tenant Governance #2 — SUCCESS, 24/24 mandatory scenarios plus TypeScript boundaries;
- FV-12 Professional Passport #16 — SUCCESS;
- FV-11 Eligibility #31, FV-06 Application #73 — SUCCESS;
- Foundation Guard #939 — SUCCESS;
- M00 Readiness #818 — SUCCESS;
- M02 Batch Readiness #227 — SUCCESS;
- Program Execution Readiness #241 — SUCCESS;
- M03-M08 #198, M09-M12 #187 and CALPQ v1 Execution Index #178 — SUCCESS.

No mandatory FV-13 test was waived or deferred. Audit remains evidence, not domain truth; no ambient/default tenant exists.
