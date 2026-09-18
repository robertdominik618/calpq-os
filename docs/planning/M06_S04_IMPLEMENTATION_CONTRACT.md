# M06 Slice 04 — Renewal Case and Workflow State

Status: `AUTHORIZED / CONTRACT BEFORE SOURCE / EXECUTION PENDING`
Tracking #145; epic #36. Owner: `SCHVALUJI MERGE PR #144 A POKRAČOVÁNÍ NA M06 SLICE 04.`
Predecessor reviewed head `3c25149fc21de73dc380988fa1d52b77f20e5188`; actual merge `cd91c80806182fd2cd2b59a8937f180f23cf2ae3`, tree `e3a68d90f7fb3516134fc157ae8b87c99ec6c927`.
Product activation/source follows successful actual post-merge verification. Architecture/test preparation alone does not certify that result.

## Ownership and canonical reuse
Original M06 execution package slice4, PASSPORT_LIFECYCLE_RENEWAL_PROJECTION, APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER and IDEMPOTENCY_AND_CONCURRENCY apply. Extend existing Application lifecycle package; reuse S01 CredentialLifecycleBasis, S02 ExpiryRenewalEvaluation/LifecycleCalendarContext, S03 RecurringObligation/Projection and Core CommandId, evidence, source and party types. No alternate Core, legal authorization transition, provider or persistence adapter.

**workflow readiness != external submission; recorded external outcome != new legal authorization; grace != validity extension; workflow state != credential state**

## Case definition and snapshot binding
An immutable RenewalCaseDefinition pins case ID/version, exact credential basis, applicant, recipient authority, required document claims, required obligation occurrences, approved plan reference/version and creation instant. Occurrence bindings include exact S03 obligation objects and sequence. Duplicate identities, foreign basis and unbounded/sparse inputs are rejected. Zero required obligations is allowed only as an explicit approved-plan input, not inferred from missing data.
A new rule/evidence basis needs a new definition/case and explicit predecessor reference; it never overwrites the old case. Production uniqueness and linking remain repository responsibilities.

## Evidence package and readiness
RenewalEvidencePackage retains its exact definition, unique package reference, S02 evaluation, evidence snapshot, covered claims, source, reviewer and review reference, capture instant and explicit validity limit, plus S03 projections for required occurrences. S02 basis and all supplied S03 obligations must match; unrelated or duplicate projections are rejected. Views expose metadata/versions/hashes, not raw content or locators.
Readiness requires evaluated nonambiguous S02 policy, explicit renewal window, current calendar inside opening/due dates (grace is not submission permission), verified required document evidence with matching source versions and complete claim coverage, and an ACCEPTED_RECORD for each required S03 occurrence without unresolved review. Projection incompleteness beyond the specifically required occurrences does not fabricate whole-obligation satisfaction.
Missing evidence, expired package, incomplete claims or required occurrences, unverified sources or unresolved results produce explicit readiness blockers and keep preparation non-ready. No positive state is inferred merely from time passing. The supplied current policy/complete record set and genuine claim-to-document association are authenticated-entrypoint responsibilities. Cached package validity is explicit, not proof that the external source cannot change.

## Workflow transitions
States: DRAFT, PREPARING, READY, SUBMITTED, AWAITING_INFORMATION, RENEWAL_RECORDED, REJECTION_RECORDED, CANCELLED.
- PREPARE: DRAFT -> PREPARING.
- ATTACH_PACKAGE: PREPARING/READY/AWAITING_INFORMATION -> PREPARING, except an information-request case retains AWAITING_INFORMATION until MARK_READY. Replacing a package invalidates previous readiness; old packages remain in history. References cannot be reused for changed packages.
- MARK_READY: PREPARING/AWAITING_INFORMATION -> READY only when current package and all current required claims/occurrences pass. Otherwise append an explicit blocker record without changing that preparation state.
- RECORD_EXTERNAL(SUBMISSION): READY -> SUBMITTED only on verified receipt for the current package/recipient with fixed actual occurrence and submission references. This records an action already taken; it sends nothing. Actual late receipt is retained with lateness metadata, not disguised as timely permission.
- RECORD_EXTERNAL(INFORMATION_REQUEST): SUBMITTED -> AWAITING_INFORMATION; requires exact active submission reference and verified recipient request, extends required claims explicitly and immutably.
- RECORD_EXTERNAL(RENEWAL or REJECTION): SUBMITTED/AWAITING_INFORMATION -> corresponding terminal RECORDED state only on exact verified recipient outcome, active submission/package binding and separate RECORD_OUTCOME permission. Applicant and most recent submitting actor cannot record their own successful/negative outcome. No credential or source is rewritten. An outcome record is not a new grant.
- CANCEL: any nonterminal state -> CANCELLED with rationale. This is internal case cancellation, not withdrawal of an external application or revocation of a credential.
Unverified or mismatched external observations are rejected as requiring review, never converted to a legal rejection. No automatic retry/last-writer-wins or automatic terminal reopening. A new governed case is needed after terminal outcomes.

## Commands, actor grants and concurrency
RenewalCaseCommand carries Core CommandId, exact definition, controlled discriminated action/payload, immutable expectedRevision, idempotencyKey, fixed submittedAt and rationaleReference. Canonical output includes all behavior-relevant input identities/provenance. Unknown payload keys and sparse collections are rejected.
Every open/read/apply requires fresh execution context, explicit calendar, TenantContext/Boundary, ALLOW access decision, exact actor/kind/tenant/organization/subject/purpose/correlation and appropriate read/operate field. A case-scoped RenewalCaseGrant independently binds human actor, allowed actions, grant/validity/revocation time and provenance. Current permission checks precede sensitive inspection and replay; self-grants are prohibited. Constructors establish consistency, not credential authenticity or grantor authority.
Immutable history starts at revision0. Accepted commands append one immutable record and increment exactly once. Same command/key/content/actor replays return unchanged history after fresh permission/time checks; changed content/key/actor collisions are rejected. Stale revisions produce a distinguishable concurrency error. Time cannot precede case opening, submitted command or previous record; original command IDs and external/package references cannot silently be reused. Explicit history budget fails closed. Prior history, basis, policy and evidence objects remain unchanged.
History serialization is not an authorization endpoint; a guarded read method is required. Durable services must atomically persist logical history/revision, idempotency outcome, audit and any outbox through the existing UnitOfWork. This slice provides deterministic workflow state/records, not database locks, committed storage, transport or domain-authority events.

## Mandatory evidence and limits
88 ordered product scenarios, 16 new scope/governance tests and 16 readonly/public-contract assertions. Contract/index and executable specifications precede product source; immutable execution record binds actual approval/merge/post-merge proof. Exact 15-file scope with constrained additive exports/config and predecessor dispatch only. Previous S03 scope validates its closed history separately; all prior runtime/type/architecture commands run on current checkout. Dedicated exact-head job and complete same-head PR matrix required.
No real legal/medical durations, notification scheduler, actual submission, actual renewal, live provider, UI, database writer, physical purge or release. Source correctness and genuine current authorization/evidence bindings require production integration.
S04 merge and S05+ require fresh owner approval. Accepted M06 remains3/10 only after predecessor verification; v1 accepted plan63/130=48.46%, not time/effort or production readiness. A proposed unmerged S04 adds no accepted credit.
