# M06 Slice 05 — Notification Policy, Deduplication and Escalation Semantics

Status: `AUTHORIZED / CONTRACT BEFORE SOURCE / EXECUTION PENDING`
Tracking #147; epic #36.
Owner authorization: **SCHVALUJI MERGE PR #146 A POKRAČOVÁNÍ NA M06 SLICE 05.**
Verified predecessor merge: `fcf790578396fcf15f546531d648beca0db3b56d`; reviewed S04 head: `e0a4dd7f78b0531fbb03372282f464bb240ba427`.
Post-merge proof: PR #146 comment `5739663296` — reviewed-head-to-merge has zero changed files and the merge SHA has 51/51 returned workflow runs completed SUCCESS.

## Ownership and canonical reuse
Original M06 execution package Slice 05 applies. Extend the existing `@calpq/application/lifecycle` package and reuse S01 `CredentialLifecycleBasis`, S02 `ExpiryRenewalEvaluation` / `LifecycleCalendarContext`, S03 obligation projections where supplied, and S04 `RenewalCaseDefinition` / `RenewalCaseHistory` snapshots. No alternate Core, scheduler, provider, transport, persistence adapter or UI.

**notification intent != notification delivery; escalation != legal urgency; reminder != authorization; deduplication != evidence deletion; notification state != credential state**

## Policy definition
`LifecycleNotificationPolicy` is an immutable, versioned, approved policy snapshot bound to the exact credential definition and jurisdiction. It contains a bounded ordered set of stages. Every stage has a unique opaque ID, level, trigger anchor, offset, dedup window, audience purpose and allowed intent kind. Construction validates source/approval chronology, effectivity, exact field sets, ordering, uniqueness and bounded quantities. Policy construction proves consistency only; production entrypoints must authenticate the approval and current applicability.

Supported trigger anchors are explicit lifecycle facts only: renewal-window opening, renewal due date, grace end and configured recurring-obligation occurrence dates when an exact projection is supplied. No ambient clock or LLM-derived date is permitted.

## Observation ledger and deduplication
`NotificationObservation` records an already-observed notification lifecycle fact; it does not send or schedule anything. Controlled kinds are `RECORDED`, `DELIVERED`, `FAILED`, `ACKNOWLEDGED` and `SUPPRESSED`. Observations bind the exact basis, policy/version, deterministic dedup key, stage, audience purpose, occurrence instant and provenance reference. Contact addresses, phone numbers, provider payloads and raw message bodies are prohibited.

Deduplication uses a deterministic key derived only from exact governed identities: tenant, organization, subject, credential basis snapshot, policy/version, trigger identity, stage and audience purpose. Equivalent prior `RECORDED`/`DELIVERED`/`ACKNOWLEDGED` observations inside the configured window suppress a duplicate intent. A `FAILED` observation never silently authorizes retry; retry remains a separately evaluated intent and may still be suppressed by policy. Deduplication never deletes or rewrites evidence/history.

## Projection and escalation
`LifecycleNotificationProjection.evaluate` requires explicit current `LifecycleCalendarContext`, exact S02 evaluation, optional exact S04 history, optional exact recurring-obligation projections, bounded observations and a fresh scoped Application access decision. It returns one immutable safe projection.

Outcomes are `SUPPRESSED`, `DUE`, `ESCALATED` or `REVIEW_REQUIRED`.
- `REVIEW_REQUIRED`: ambiguous/unresolved/foreign policy, missing exact trigger data, foreign/future observation, or incomplete governed input.
- `SUPPRESSED`: no configured stage currently applies, equivalent observation is inside the dedup window, acknowledgement covers the current trigger/stage, or a terminal/resolved S04 state makes the reminder obsolete.
- `DUE`: exactly one configured stage is applicable and no stronger stage is due.
- `ESCALATED`: a strictly higher configured stage is deterministically due because its threshold has been crossed; escalation does not claim legal urgency or delivery failure.

When more than one stage threshold has passed, the projection selects the highest deterministic applicable stage and records lower passed stages as superseded reason metadata. Escalation cannot be inferred from delivery failure, user silence, model judgment, local timezone, ambient time or an untrusted case state.

## S04 interaction
If supplied, the S04 history must bind the exact `RenewalCaseDefinition.basis`. `RENEWAL_RECORDED`, `REJECTION_RECORDED` and `CANCELLED` suppress renewal reminders as obsolete internal intents; they do not mutate credential validity. `SUBMITTED` and `AWAITING_INFORMATION` may alter the applicable policy stage only where explicitly configured, never by hidden branching. Missing S04 history must not fabricate workflow state.

## Authorization and privacy
Every projection/read operation reuses the existing Application tenant boundary model and requires exact tenant, organization, subject, purpose, actor, correlation and ALLOW decision scope. Denial occurs before sensitive projection. Output contains IDs, versions, trigger date, stage/level, outcome, dedup key, reason codes and provenance-safe references only. No raw evidence, storage locator, contact address, provider token or message body is exposed.

## Determinism, immutability and bounds
All date arithmetic uses explicit `DateOnly`/existing lifecycle helpers and all invocation time uses supplied `UtcInstant`. Inputs are copied where needed; assembled output is recursively frozen. Collections are bounded, dense, unique and deterministically sorted. Unknown fields, duplicate stage IDs, duplicate observation identities, foreign basis/policy, future-known records and chronology inversions fail closed.

## Required negative authority flags
Every projection serializes:
- `authorizationAuthority=false`
- `credentialStateMutated=false`
- `renewalPerformed=false`
- `notificationScheduled=false`
- `notificationSent=false`
- `providerInvoked=false`
- `eventsEmitted=0`
- `physicalDeletionAuthorized=false`

## Mandatory evidence
96 ordered product scenarios, 16 new scope/governance scenarios and strict readonly/public-contract compilation assertions. Contract/index and executable specifications must precede product source. An immutable S05 execution record must bind this owner authorization and the verified S04 merge before source activation. S05 scope is additive: new lifecycle source/tests/docs/workflow plus exact additive barrel/package/tsconfig wiring and exact terminal successor dispatch from S04 scope governance. Original S01–S04 source/runtime/tests and historical decision records remain unchanged.

Dedicated exact-head GitHub Actions must run S05 evidence and then unchanged S04/S03/S02/S01 plus transitive admission/M04/M05/FV/timeline gates on the current candidate checkout. Historical S04 scope may validate its closed history separately; historical proof is never relabeled as current runtime proof.

## Non-goals and release boundary
No real scheduler, queue, cron, email/SMS/push provider, template rendering, contact resolution, notification delivery, delivery acknowledgement, database writer, UI, actual renewal, credential mutation, legal/medical rule invention, physical purge or production release. S05 merge, S06+, deployment and release remain separately owner-gated.

Accepted predecessor coverage after verified S04 merge is M06 4/10 = 40% and original v1 allocation 64/130 = 49.23%. These are unweighted plan units, not effort/time/cost or production readiness.
