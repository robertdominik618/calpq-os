# CALPQ FV-02 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-02 defines only the Core `Clock` and `IdGenerator` ports and deterministic test substitutes. Core receives time and identifiers through these ports. No provider, UI, persistence, transport, credential, eligibility or authorization behavior belongs in this package.

The implementation reuses FV-01 UTC instant and typed-ID semantics. Direct wall-clock and global ID generation inside deterministic Core rules are forbidden. Concrete production adapters remain outside Core.

## Verified implementation
- Core port `Clock` exposes only `now(): UtcInstant`.
- Core port `IdGenerator` produces the semantic ID requested through a typed `SemanticIdType<TId>` boundary.
- deterministic `FixedClock` and `ControlledClock` live only under `@calpq/core/test-support`;
- deterministic predefined-sequence `IdGenerator` lives only under test support and fails explicitly when exhausted;
- Core and test-support contain no direct wall-clock, randomness or global UUID generation;
- no provider SDK, persistence, UI, credential, eligibility or AuthorizationGrant behavior was introduced.

## Evidence
- A3 implementation/evidence commit: `7457742cec7ea65d487a15e2ca65ca022a650da8`.
- Draft Batch A PR: #56.
- `FV-02 Core Ports #2` — SUCCESS, 12/12 mandatory FV-02 tests.
- FV-01 regression is executed inside the FV-02 evidence script and remains green.
- Foundation Guard #815 — SUCCESS.
- M00 Readiness #694 — SUCCESS.
- M02 Batch A Manifest #46 and M02 Batch Readiness #103 — SUCCESS.
- Program Execution Readiness #117, M03-M08 #74, M09-M12 #63 and CALPQ v1 Execution Index #54 — SUCCESS.
- 0 mandatory tests waived; 0 scope exceptions.

Completion requirements are satisfied. Next Batch A work may proceed only to the next already-planned FV slice.
