# CALPQ FV-15 Implementation Contract

Status: `IMPLEMENTED / VERIFIED`

FV-15 implements async workers, retry classification, reconciliation and recovery under the Operational Resilience model.

Async entrypoints invoke the same Application semantics as synchronous entrypoints. Duplicate command/event delivery is expected and stable identities prevent repeated logical effects. Retry policy distinguishes safe replay, bounded transient retry, reissue, no-retry and human review.

Authoritative aggregate/event state outranks projections and checkpoints. Rebuild/reconciliation never rewrites authoritative history. Dependency outage produces retry, uncertainty or review semantics rather than a fabricated domain conclusion. Recovery validates authoritative state, delivery positions, audit references, projection checkpoints and active access/privacy restrictions before normal exposure resumes.

Workers, queues, schedulers and telemetry remain outside Core.

## Implementation evidence

- Reviewed Batch B base: `3321aa6773ef9e23c11be83aec34f3ac22af1249`.
- Runtime source: `packages/application/src/runtime/operational-resilience.ts`.
- Runtime test: `packages/application/test/fv15-operational-resilience.test.ts`.
- Dedicated gate: `tests/fv15_operational_resilience_test.sh`.
- Dedicated workflow: `.github/workflows/fv15-operational-resilience.yml`.
- Verified evidence head: `cfa0850de8427c522fa2e9a5441bf5ad2a87562a`.
- `FV-15 Operational Resilience #2`: SUCCESS, 22/22 mandatory scenarios.
- Foundation Guard #975, M00 Readiness #854, M02 Batch Readiness #263 and Program Execution Readiness #277: SUCCESS.
- M03-M08 #234, M09-M12 #223 and CALPQ v1 Execution Index #214: SUCCESS.

Verified boundaries: duplicate delivery cannot repeat a logical effect; retry classification is explicit and bounded; projection/checkpoint state never outranks authoritative state; reconciliation never rewrites authoritative history; dependency outage never fabricates legal/domain rejection; recovery remains blocked until authoritative, delivery, audit, projection, access and privacy checks are valid; Core remains free of queue/database/runtime orchestration semantics.
