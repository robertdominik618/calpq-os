# CALPQ FV-02 Test Contract

Status: `12 OF 12 EXECUTABLE / VERIFIED`

## Mandatory tests
1. Clock returns an absolute UTC instant.
2. Fixed Clock returns the configured instant exactly.
3. Controlled Clock can advance only through the test fixture.
4. Core code does not call the wall clock directly.
5. IdGenerator returns an identifier accepted by the requested semantic ID type.
6. Generated durable IDs satisfy the UUIDv7 contract.
7. Deterministic IdGenerator can return a predefined sequence.
8. Exhausted deterministic ID sequence fails explicitly.
9. Core does not call global UUID/random APIs directly.
10. Clock and IdGenerator interfaces have no provider SDK dependency.
11. FV-02 introduces no credential, eligibility or authorization behavior.
12. Existing Core dependency and architecture guards remain green.

FV-02 cannot be completed with a mandatory test waived.

## Verified executable evidence
- `packages/core/test/fv02-ports.test.ts` maps one-to-one to FV02-01..FV02-12.
- `packages/core/test/fv02-types.compile.ts` proves the `Clock` port hides test-only advancement and `IdGenerator` preserves requested semantic ID type at compile time.
- `tests/fv02_core_ports_test.sh` enforces exactly 12 tests, TypeScript compilation, zero runtime dependencies, no provider imports, no direct wall-clock/random/UUID generation and no later-phase domain capability leakage.
- FV-01 regression evidence is re-executed from the FV-02 guard.
- `.github/workflows/fv02-core.yml` runs on pinned Node 24 and pinned GitHub Actions.
- `FV-02 Core Ports #2` — SUCCESS on `7457742cec7ea65d487a15e2ca65ca022a650da8`.
- Foundation Guard #815 and all active project readiness workflows are SUCCESS on the same implementation head.

Mandatory result: **12/12 PASS, 0 waived, 0 deferred, 0 scope exceptions.**
