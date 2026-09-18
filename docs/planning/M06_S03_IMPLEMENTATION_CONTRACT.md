# M06 Slice 03 — Recurring Obligation Model

Status: `AUTHORIZED / CONTRACT BEFORE SOURCE / IMPLEMENTATION NOT YET CLAIMED`
Tracking #143; epic #36; predecessor #141 / PR #142.
Owner: `SCHVALUJI MERGE PR #142 A POKRAČOVÁNÍ NA M06 SLICE 03`.
Actual S02 merge `06859ccf345c116457c917766488111449551394`, reviewed head `adfa67aa3f413060df0192be9e41e37f167c08f8`, identical tree `d72cf2eb05dbee0ce79de4b3e23183e7b3303e4d`. Owner comment `5730619433`.
Architecture/test preparation may precede post-merge completion. Effective S03 activation and product source require a separate immutable execution record referencing actual successful post-merge evidence.

## Canonical ownership and reuse

Implement only slice 3 of `M06_EXECUTION_PACKAGE.md`: exam, medical check, continuing education and periodic check obligations. Reuse `CredentialLifecycleBasis` (S01), `LifecycleCalendarContext` and `shiftLifecycleDate` (S02), Core credential/definition/source/evidence/actor/date references and existing tenant access contracts. `PASSPORT_LIFECYCLE_RENEWAL_PROJECTION.md`, `APPLICATION_POLICY_ORCHESTRATION_BOUNDARY.md` and evidence/authority boundaries remain authoritative. No new Core, parallel credential repository, renewal case (S04), notification policy/transport (S05), dependency/reevaluation engine or overall compliance verdict.

**recurrence projection != satisfied obligation; accepted completion record != legal authorization; grace != validity extension; passage of time != authority event**

## Versioned rule and scoped snapshot

`RecurringObligationRule` is an approved, explicitly versioned scheduling rule: exact credential-definition ID/version, jurisdiction, inclusive effective-date range, knowledge instant, source and source-snapshot reference, approval actor/time/reference, unresolved conditions, one controlled obligation kind, positive bounded DAYS/MONTHS/YEARS interval with CLAMP/REJECT, lead-window/grace day counts and nonempty required evidence-claim references.

`RecurringObligation` binds one exact rule and S01 basis, independent obligation ID/version, knowledge instant and controlled ISSUED_ON/EFFECTIVE_FROM/EXPLICIT_DATE anchor. Explicit anchor dates require opaque provenance. Missing declared anchor stays unknown. Rule/definition/jurisdiction mismatches are rejected, knowledge cannot precede rule or basis, and later rule versions create separate snapshots rather than mutating old history. An anchor outside rule effectivity requires review.

## Recurrence and calendar semantics

FIXED_ANCHOR: cycle n is calculated directly from the original anchor plus n times the interval. Never iterate a clamped month result as the next original anchor. Completion never moves subsequent fixed due dates and does not erase earlier cycles.

AFTER_ACCEPTED_COMPLETION: first due follows the original anchor. Each next due follows an individually qualified, externally accepted completion record for the preceding cycle. The projection stops at the first missing, unresolved, contradictory, insufficiently evidenced or out-of-window record. It does not guess future completion dates. Accepted completion must be later than the current anchor, at or after that cycle's action window and no later than the evaluation calendar date. Later records cannot silently skip an unresolved earlier cycle.

Both modes expose due date, action-window opening and grace end with DATE_ONLY precision, sequence, a deterministic collision-safe occurrence key and independent calendar/completion states. A late accepted record keeps the original due and lateness. Credential expiry never silently stops the recurring schedule; applicability must come from the admitted rule. Rule validTo bounds due-date generation and is not a legal expiry event.

Projection accepts explicit asKnownAt, S02 calendar context, inclusive horizonOn not before evaluatedOn, and maxOccurrences 1..1000. Generation is bounded and deterministic. Budget overflow or rejected/out-of-range arithmetic returns REVIEW_REQUIRED with no partial occurrence list presented as complete. Coverage is only the requested horizon and supplied records, never all obligations or all historical evidence.

## Completion records are evidence inputs, not a writer

`ObligationCompletionRecord` binds the exact obligation snapshot and cycle sequence. It retains a unique record reference, optional completedOn (required for ACCEPTED), controlled ACCEPTED/REVIEW_REQUIRED/REJECTED disposition, an existing Core EvidenceSnapshot, claimed coverage, external review reference/actor, a source reference and a recorded S02 calendar context. It records prior external acceptance; this module neither performs that acceptance nor creates a legal satisfaction decision.

Construction checks types, dense unique claims, source retrieval/evidence capture not after recorded instant and completedOn not after the explicitly recorded calendar date. Projection admits records only if recordedAt <= asKnownAt and <= evaluatedAt; hidden future records add no result counts, reasons or identifiers. Duplicate visible record IDs fail closed. Multiple visible records for the same cycle require review; there is no latest-writer winner or automatic correction precedence.

For scheduling an ACCEPTED_RECORD must have nonempty captured evidence, all entries VERIFIED with source ID/version matching its verified source, all required claim references, matching jurisdiction and source effective at completion, a completed date in its permitted window and after the cycle anchor. A generic VERIFIED flag is not proof of actual claim scope or issuing authority: trusted ingestion must establish the real external approval, subject/obligation association and evidence coverage. Missing/rejected/unverified inputs never produce FAILED legal truth. Visible records that cannot be assigned to a projected cycle are reported for review, not applied to another cycle.

## Authorization, audit and integrity

Every projection checks independent authenticated-context and access-decision inputs before processing sensitive obligation data: operation, reader actor/kind, tenant, organization, subject/kind, purpose, correlation, field permission, access reference and jurisdiction. Existing TenantBoundary remains in use. Factories validate consistency, not authentication or the authenticity of caller-supplied approval references. Production entrypoints must load genuine current access decisions, complete scoped data and accepted rule/source snapshots. Read serialization is not an authorization gate.

Output copies and freezes only assembled metadata, preserving Core objects and prior snapshots. Evidence IDs/classes/hashes/states/source versions, approval/record references and calculation inputs remain traceable; no raw document, medical result, event payload, source/storage URL or external credential identifier is exposed. Always retain authorizationAuthority=false, legalComplianceDetermined=false, eventsEmitted=0, notificationScheduled=false and historyMutated=false. No database/outbox writer or background execution is introduced.

## Scope and verification

Extend existing lifecycle barrel/package/compile entries additively. The only prior guard modification is an exact successor dispatch in `m06-s02-scope.mjs`; every original pure validator and runtime command remains unchanged. New S03 guard verifies the actual closed S02 merge/tree/parents, prior S02 delta with existing validators, original execution record, current exact paths/configuration, immutable S03 authorization and architecture/test-index-before-source ancestry. Historical S01/S02 decisions are never rewritten to authorize S03.

Mandatory proof: 80 named product scenarios, 16 scope/governance tests, 16 readonly/public-contract assertions, unchanged full S02/S01/admission/preparation/M04/M05/FV09/FV10/M03-timeline gates, strict compilation, architecture and complete same-head PR matrix. Tests are specifications until executed; final SHA/tree/run/job and any corrections belong in actual PR evidence. S03 merge/S04 require new approval. No profession-specific legal/medical duration or production deployment is supplied.
