# CALPQ FV-15 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-15 prepares async workers, retry classification, reconciliation and recovery under the Operational Resilience model.

Async entrypoints invoke the same Application semantics as synchronous entrypoints. Duplicate command/event delivery is expected and stable identities prevent repeated logical effects. Retry policy distinguishes safe replay, bounded transient retry, reissue, no-retry and human review.

Authoritative aggregate/event state outranks projections and checkpoints. Rebuild/reconciliation never rewrites authoritative history. Dependency outage produces retry, uncertainty or review semantics rather than a fabricated domain conclusion. Recovery validates authoritative state, delivery positions, audit references, projection checkpoints and active access/privacy restrictions before normal exposure resumes.

Workers, queues, schedulers and telemetry remain outside Core.