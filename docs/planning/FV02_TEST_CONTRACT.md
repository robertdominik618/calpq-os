# CALPQ FV-02 Test Contract

Status: `PLANNING ONLY / BLOCKED`

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