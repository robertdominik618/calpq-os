# CALPQ FV-04 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-04 defines the Core command/event transition kernel.

Required concepts:
- stable command and event envelopes;
- command identity, correlation and causation;
- aggregate identity and explicit expected revision;
- deterministic transition from prior state plus command to outcome/new state/events;
- immutable event metadata after acceptance;
- explicit conflict when expected revision is stale;
- no silent last-write-wins;
- duplicate logical command must not create a second accepted transition;
- Core remains independent of persistence and idempotency storage.

Application/persistence later coordinates idempotency, revision checks, authoritative write, event/outbox and outcome atomically. FV-04 itself does not implement transport, database or business-specific credential rules.