# M05 Slice 09 — Mandatory Test Index

Status: `PLANNED / NO EXECUTION CLAIMED`
Issue #125. Contract: `M05_S09_IMPLEMENTATION_CONTRACT.md`.
Runtime target: `packages/application/test/m05-s09-archive-lifecycle.test.ts`.
Compile target: `packages/application/test/m05-s09-types.compile.ts`.
The gate must match all identities below to executed, non-skipped tests; a passing count alone is insufficient.

| ID | Required evidence |
|---|---|
| M05S09-01 | Archive scope retains exact original and immutable identity |
| M05S09-02 | Foreign original or intake identity is rejected |
| M05S09-03 | Missing organization/subject/tenant is rejected |
| M05S09-04 | Grant scope and invocation tenant/organization/subject match |
| M05S09-05 | Different invocation actor is rejected |
| M05S09-06 | Denied access or wrong access reference is rejected |
| M05S09-07 | Expired or revoked grant is rejected |
| M05S09-08 | Operation-specific permission is required including replay |
| M05S09-09 | Invalid retention dates/version/provenance are rejected |
| M05S09-10 | Policy reference must match immutable original |
| M05S09-11 | Future policy decisions cannot affect current state |
| M05S09-12 | Policy replacement requires new version and preserves history |
| M05S09-13 | All seven canonical link relations preserve evidence state |
| M05S09-14 | Link target kind and relation must match |
| M05S09-15 | Cross-tenant or cross-organization targets are rejected |
| M05S09-16 | Document links reuse exact S02 relationships |
| M05S09-17 | Subject relation must match bound subject |
| M05S09-18 | Link effective/recorded instants and references are validated |
| M05S09-19 | Link identity cannot be duplicated or reused |
| M05S09-20 | Unlink preserves prior events and snapshots |
| M05S09-21 | Hold dates and basis are validated |
| M05S09-22 | Active hold blocks disposal |
| M05S09-23 | Future hold blocks disposal; elapsed hold does not |
| M05S09-24 | Hold release is permissioned and retains history |
| M05S09-25 | Snapshot reuses Core EvidenceSnapshot |
| M05S09-26 | Snapshot requires complete exact derived-parent lineage |
| M05S09-27 | Snapshot rejects duplicated evidence IDs |
| M05S09-28 | Snapshot rejects a foreign original root |
| M05S09-29 | Snapshot rejects future-derived evidence |
| M05S09-30 | Extraction review must bind included proposal and cutoff |
| M05S09-31 | Provider results must bind captured evidence/subject/time |
| M05S09-32 | Human-review histories must bind archive/scope/time |
| M05S09-33 | Snapshot never promotes extraction or original verification |
| M05S09-34 | Snapshot serialization is deterministic and privacy-minimized |
| M05S09-35 | Snapshot pin rejects a different lifecycle revision |
| M05S09-36 | Pinned snapshot remains immutable after transitions |
| M05S09-37 | Snapshot pin cannot be released before retention expires |
| M05S09-38 | Indefinite snapshot pins cannot be silently released |
| M05S09-39 | Retention is inclusive through exact boundary instant |
| M05S09-40 | Indefinite retention is not disposal eligibility |
| M05S09-41 | Overdue policy review requires review, not disposal |
| M05S09-42 | Incomplete dependency inventory fails closed |
| M05S09-43 | Stale or wrong-revision dependency inventory fails closed |
| M05S09-44 | Required external dependencies block disposal |
| M05S09-45 | Registered future/expired links still block disposal |
| M05S09-46 | Registered snapshot pins block disposal |
| M05S09-47 | Disposal candidate never authorizes physical deletion |
| M05S09-48 | Valid logical tombstone preserves original and audit lineage |
| M05S09-49 | Foreign/stale/not-eligible assessment cannot tombstone |
| M05S09-50 | Tombstoned lifecycle rejects new mutations |
| M05S09-51 | Exact replay preserves object identity and revision |
| M05S09-52 | Changed command content/actor collides on idempotency key |
| M05S09-53 | Stale/invalid revision and reused command ID are rejected |
| M05S09-54 | Backdated submissions and replay invocations are rejected |
| M05S09-55 | All prior state, original objects and collections stay immutable |
| M05S09-56 | Cross-archive commands and payloads cannot cross histories |

Additional gates: strict readonly compile; predecessor and architecture-before-implementation ancestry; no Core/provider-adapter diff; no ambient time/randomness or external I/O; S08 same-head evidence and S07/FV13 regression matrix.
