# CALPQ FV-06 Implementation Contract

Status: `PLANNING ONLY / BLOCKED`

FV-06 prepares the first Application layer.

It defines `ApplicationExecutionContext`, use-case handlers and provider-neutral ports. Context carries operation identity, actor, subject/organization scope, correlation/causation, requested-at instant, contract version and access/purpose references.

Application coordinates Core and ports but does not redefine Core rules. The same logical use case must be callable from API, worker or scheduler entrypoints. UI/session details and concrete provider SDK types stay outside Core/Application semantics.