# M06 Slice 07 — Selective Reevaluation Engine

Status: `AUTHORIZED / CONTRACT BEFORE SOURCE / PREDECESSOR POST-MERGE VERIFIED`
Tracking #152; epic #36.
Owner authorization: **SCHVALUJI MERGE PR #151 A POKRAČOVÁNÍ NA M06 SLICE 07.**
Predecessor PR #151 reviewed head `21c4a48df955852a8e316106f2a8fa9966a9e76c` merged as `471ba0042d4ce44dec4a123ad2ebe4746f57c1ba`; post-merge evidence is PR #151 comment **5741732658**, confirming 51/51 completed successful merge-associated workflows and zero reviewed-head-to-merge content difference.

## Ownership and canonical reuse
Original M06 execution package Slice 07 applies together with:
- `DEPENDENCY_GRAPH_REEVALUATION_MODEL.md`;
- `CHANGE_EVENT_IMPACT_MODEL.md`;
- `REEVALUATION_DECISION_EVIDENCE.md`;
- `CONTINUOUS_COMPLIANCE_STATUS_MODEL.md`;
- `M06_LIFECYCLE_CONTINUOUS_COMPLIANCE_BASELINE.md`;
- `M06_M08_INTEGRATION_SEQUENCE.md`.

Extend only the existing `@calpq/application/lifecycle` package. Reuse the exact S06 dependency graph, change event and impact traversal outputs plus existing Application execution/tenant/access boundaries. Do not create an alternate Core evaluator, provider, scheduler, persistence stack or UI business logic.

**impact candidate != reevaluation decision; reevaluation decision != authorization mutation; unchanged result != absent audit evidence; future impact != current non-compliance; review required != inferred failure; historical decision != mutable truth**

## Slice boundary
S06 identifies bounded downstream impact candidates and explainable dependency paths. S07 consumes only those candidates and records the outcome of a governed selective reevaluation. S07 never expands the candidate set into a global rebuild.

S07 may create immutable `LifecycleReevaluationDecision` evidence for:
- `UNCHANGED`;
- `STATUS_CHANGED`;
- `FUTURE_IMPACT_REGISTERED`;
- `ACTION_REQUIRED`;
- `REVIEW_REQUIRED`;
- `INDETERMINATE`.

These are reevaluation evidence outcomes, not credential issuance, revocation, authorization, assignment, recognition or continuous-compliance authority.

## Reevaluation fact
`LifecycleReevaluationFact` is an immutable supplied result from a governed target evaluator. Construction establishes internal consistency only; it does not certify that the evaluator had legal authority.

Each fact binds:
- unique fact reference;
- exact S06 candidate deduplication key;
- exact target reference/type/version;
- controlled fact state `COMPLETE | REVIEW_REQUIRED | INDETERMINATE`;
- prior decision reference and prior result when present;
- new result only for `COMPLETE`;
- explicit action-required flag only for `COMPLETE`;
- evaluator actor;
- evaluated-at and as-known-at instants;
- exact required version bindings copied from the S06 candidate;
- bounded evidence references;
- provenance, correlation and optional causation references.

Prior decision reference and prior result are paired. A COMPLETE fact requires a bounded new result. REVIEW_REQUIRED and INDETERMINATE facts must not smuggle a positive result or action flag.

## Exact candidate binding
The engine receives the exact:
- `LifecycleDependencyGraphSnapshot`;
- `LifecycleChangeEvent`;
- `LifecycleDependencyImpactTraversal`;
- fresh Application execution context;
- current tenant context/boundary/access decision;
- explicit evaluation/as-known horizon;
- bounded reevaluation facts;
- explicit maximum decision budget.

The graph/event/impact identities, graph version and event identity must match. The change event must bind the exact graph object. Impact correlation must remain traceable to the current reevaluation request. Cross-tenant, cross-organization, foreign-subject, wrong-purpose, wrong-operation, wrong-access-reference or missing field authorization fails before graph/decision disclosure.

## No global rebuild
Only candidates present in the supplied S06 impact traversal may be reevaluated. Facts for unrelated targets are rejected. Duplicate candidate facts are rejected. Candidate target reference/type/version and candidate dedup identity must match exactly.

The fact's version bindings must equal the candidate's required version set exactly. Missing, extra or changed version bindings fail closed; no evaluator result is silently applied against a different source/rule/catalog snapshot.

## Ordering
Selective reevaluation order is deterministic:
1. shortest dependency-path depth from the change root;
2. target reference as a stable lexical tiebreaker.

This produces an explainable source-proximal order without using caller array order. Dependency paths and required versions from S06 are preserved in every decision.

## Incomplete, review-only and future impact handling
An incomplete S06 traversal cannot be treated as a complete target set. When S06 reports `complete=false`, S07 must not consume ordinary evaluation facts. Known candidates receive review-boundary evidence only and the batch remains REVIEW_REQUIRED.

A candidate marked `REVIEW_ONLY` does not accept a COMPLETE evaluator fact. It becomes REVIEW_REQUIRED evidence.

A verified future-effective change does not execute current-state reevaluation. Non-review candidates become `FUTURE_IMPACT_REGISTERED`; supplied current evaluation facts for those future candidates are rejected.

Review-required semantics take precedence over future-impact registration.

## Current candidate evaluation
For a complete, current, non-review candidate:
- missing evaluator fact -> `INDETERMINATE`;
- fact state REVIEW_REQUIRED -> `REVIEW_REQUIRED`;
- fact state INDETERMINATE -> `INDETERMINATE`;
- COMPLETE + actionRequired=true -> `ACTION_REQUIRED`;
- COMPLETE + prior/new result differ -> `STATUS_CHANGED`;
- COMPLETE + equal prior/new result -> `UNCHANGED`;
- COMPLETE without prior result may establish a new evaluated result and is represented as `STATUS_CHANGED`.

An UNCHANGED outcome is still immutable evidence that the selected target was reevaluated.

## Decision identity and replay
Every decision has deterministic identity and deduplication key over the exact graph/version, event, target candidate and evaluation-fact identity or governed boundary marker. Identical governed input replay is byte-stable and produces the same logical decision identity.

Changed evaluator content must use a new fact identity. Durable collision detection, optimistic concurrency, audit/outbox commit and persistence idempotency remain responsibilities of the existing UnitOfWork/repositories; S07 does not invent a second persistence mechanism.

## Historical integrity
S07 never mutates or deletes a prior EligibilityAssessment, AuthorizationGrant, RecognitionDecision, AssignmentDecision, renewal history, notification history, passport projection or other historical evidence. New reevaluation evidence may reference a previous decision, but the previous object remains unchanged.

S07 does not update the S08 continuous-compliance projection. A STATUS_CHANGED reevaluation decision is input evidence for later governed projection, not the projection itself.

## Determinism and bounds
All arrays are dense, bounded, copied and canonically ordered. Explicit bounds apply to:
- facts;
- decisions;
- version bindings;
- evidence references;
- reason codes;
- dependency paths inherited from S06.

Decision-budget exhaustion fails closed rather than silently truncating a supposedly complete batch.

No ambient clock, random identifier, network/provider call, model inference or background scheduler participates in a decision.

## Privacy and safe output
Outputs contain only bounded IDs/references, versions, controlled target/outcome metadata, evidence references, dependency paths, provenance-safe references and explicit timestamps.

No raw document body, storage locator, contact address, provider token, secret, email body, phone number or message payload is exposed.

## Batch outcome
The batch distinguishes:
- `NO_IMPACT`;
- `COMPLETED`;
- `FUTURE_IMPACT_REGISTERED`;
- `REVIEW_REQUIRED`;
- `INDETERMINATE`.

REVIEW_REQUIRED takes precedence over INDETERMINATE; INDETERMINATE takes precedence over ordinary completion. A clean future-only batch is FUTURE_IMPACT_REGISTERED. A complete current batch containing only conclusive decisions is COMPLETED.

## Required negative authority flags
Every serialized S07 result must preserve:
- `authorizationAuthority=false`;
- `credentialStateMutated=false`;
- `authorizationStateMutated=false`;
- `historicalDecisionMutated=false`;
- `complianceStateChanged=false`;
- `notificationScheduled=false`;
- `providerInvoked=false`;
- `eventsEmitted=0`;
- `physicalDeletionAuthorized=false`.

The engine may report the count of reevaluation facts applied and decision evidence produced; those counts do not confer legal authority.

## Mandatory evidence
The acceptance gate requires:
- **112 ordered S07 product scenarios**;
- **16 ordered scope/governance scenarios**;
- **22 readonly/public-contract assertions** under strict Application compilation;
- unchanged S06/S05/S04/S03/S02/S01 and transitive predecessor gates on the current candidate checkout;
- full same-head pull-request workflow matrix independently complete.

Architecture contract and mandatory test index must precede activation and source. The immutable S07 execution record must bind this owner approval, exact reviewed S06 head/merge, actual post-merge evidence reference, contract/test-index commits and accepted predecessor progress.

Only the original closed S06 scope validator may execute in a temporary historical worktree. Historical scope proof is not current runtime proof.

## Non-goals and release boundary
No S08 continuous-compliance projection, M07 regulatory interpretation, M08 assignment decision execution, live provider, scheduler, queue, database writer, UI, actual notification send, credential mutation, authorization grant/revocation, physical deletion or production release is part of S07.

S07 pull-request merge, S08+, deployment and release require separate explicit owner approval.

Accepted predecessor coverage is **M06 6/10 = 60%** and original v1 allocation **66/130 = 50.77%**. This S07 contract alone adds no accepted delivery credit.
