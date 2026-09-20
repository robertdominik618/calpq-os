# CALPQ FV-04 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-04 implements the Core command/event transition kernel.

## Implemented concepts
- stable typed command and event envelopes;
- typed command identity, correlation and command/event causation;
- stable typed aggregate identity/type and explicit expected revision;
- deterministic transition from immutable aggregate snapshot + command + deterministic ports;
- accepted/rejected/review-required/indeterminate transition decisions;
- immutable accepted event metadata;
- explicit stale-revision `CONFLICT` with no silent last-write-wins;
- duplicate-command replay from a previously completed outcome supplied by Application/persistence;
- no hidden Core idempotency store or persistence dependency.

Application/persistence remains responsible for atomically coordinating idempotency claim/check, persisted revision, authoritative state write, event/outbox write and command-outcome record. FV-04 does not implement those concerns.

## Verified evidence
- A5 implementation: `2c382b8a8a8fd604bc42ec34fb1e9c5afc942b28`.
- storage-independence correction: `a87cef309a84035bce236ac638d8009281443ae7` — event creation uses explicit iteration while the strict hidden-state guard remains unchanged.
- Draft Batch A PR: #56.
- `FV-04 Transition Kernel #4` — SUCCESS; 18/18 mandatory tests.
- FV-03 #7, FV-02 #10 and FV-01 #14 — SUCCESS regression evidence.
- Foundation Guard #825 — SUCCESS.
- M00 Readiness #704 — SUCCESS.
- M02 Batch A Manifest #56 and M02 Batch Readiness #113 — SUCCESS.
- Program Execution Readiness #127, M03-M08 #84, M09-M12 #73 and CALPQ v1 Execution Index #64 — SUCCESS.
- 0 mandatory tests waived; 0 scope exceptions.

Result: duplicate logical commands do not create a second transition, stale expected revisions cannot overwrite newer state, accepted state-changing transitions advance revision exactly once, and Core remains transport/storage independent.
