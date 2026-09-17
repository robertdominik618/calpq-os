# M05 Slice 08 — Human Review & Manual Authority Confirmation

Status: `IMPLEMENTED / CONTRACT LOCKED / FINAL-HEAD REVALIDATION REQUIRED`
Tracking issue: #123. Pull request: #124. Parent epic: #34.
Owner authorization: `SCHVALUJI MERGE PR #122 A POKRAČOVÁNÍ NA M05 SLICE 08`.
Reviewed S07 head: `62cfeaa798f675e6e92f8f4813d9557355573e78`.
Post-merge verified implementation base: `1c379ba6a488d7a2dea5eb13ed987ebfb5e51b8b` (83/83 observed workflow runs SUCCESS before this branch was created).
Initial contract commit: `4dbcd0b09669de21a92b77ff2ec3729ae771f4d0`; scenario index commit: `052eb2dc12e72f86ba848fc0218200239d125c07`. Both precede production implementation.

## Canonical ownership

Implement slice 8 of `M05_EXECUTION_PACKAGE.md`, reusing S01 intake, S02 original archive, S05 security, S06 Trust Registry/authority, S07 routes/requests/outcomes and existing Application execution/tenant contracts. Canonical constraints are `docs/contracts/VERIFICATION_ORCHESTRATION_MODEL.md`, `AUTHORITY_RESOLUTION_MODEL.md`, `DOCUMENT_VERIFICATION_BOUNDARY.md` and `APPLICATION_TRANSACTION_SIDE_EFFECT_ORDER.md`.

**human review != manual authority confirmation != evidence verification beyond checked claims != eligibility != authorization**

No Core, concrete provider adapter, original, extraction-review or historical trust object is mutated. No provider is called. S09 retention/lifecycle and S10 whole-fabric integration remain separate.

## Case boundary

An immutable `HumanReviewCase` binds an exact S07 request, registry and human/manual route; an exact S02 original/S05 security assessment and S01 submission; scoped opening context; target claim subset; known S06 authority resolutions; and prior S07 route results. The route must be registered, active, effective, acceptable, jurisdiction-compatible and meet required assurance. Uncertain authority permits opening a review, not confirmation.

At this boundary the request subject reference is the canonical S01 subject UUID string. Organization and subject must match the opening context. Archive intake ID and exact original object must match the submission. Case summaries never contain original bytes or extracted values. Prior provider result check times must not exceed the request knowledge cutoff; a later result requires a new request/case snapshot rather than insertion into historical knowledge.

## Reviewer assignment and trust boundary

`HumanReviewerMandate` is an immutable governed assignment to one case, human actor, verification entity, claim subset and explicit REVIEW or MANUAL_CONFIRMATION permission. Tenant, organization and purpose are bound through the case and checked on every invocation. The mandate includes an access-decision snapshot/audit reference, source/version/snapshot, grant time, inclusive validity interval and optional revocation time. Submitting/acquiring actors, explicitly excluded actors, non-human reviewers and self-grants are rejected. Organization authority never automatically grants employees review permission.

Every apply operation checks the current actor, operation, tenant, organization, subject, purpose, access-decision reference, allowed claim fields, mandate validity/revocation and command permission, including replays. DENY cannot be overridden by a mandate.

These Application objects check consistency, not network authentication or authenticity of caller-supplied authorization documents. A trusted entrypoint must authenticate the principal; load the case, current mandate/access decision and complete known prior results from tenant-scoped repositories; and establish actor-to-subject ownership/exclusion bindings. Client JSON is not a trusted mandate. Access-decision `decidedBy` identifies its decision-maker, not the permitted reviewer. Allowed fields do not grant review-command permissions.

## Commands, workflow and concurrency

`HumanReviewCommand` carries caller-supplied UUIDv7 identity, exact case, controlled action, claim subset, observations, supporting references, rationale, fixed submission time and idempotency key. Actions: REQUEST_EVIDENCE, ESCALATE, COMPLETE_REVIEW, REJECT, CONFIRM_CLAIMS.

`HumanReviewHistory` applies a command with explicit expected logical revision and fresh execution context/mandate; appends a frozen decision record; and returns a new immutable history. Time is explicit and monotonic. Same key plus identical canonical command and same actor returns the same history with no revision change. Key/content/actor collision, reused command ID, stale revision, terminal-case mutation and re-confirming previously confirmed claims are rejected. Permission and latest-history execution-time checks precede replay return; an invocation cannot read future history by backdating its replay context.

REQUEST_EVIDENCE and ESCALATE remain nonterminal. COMPLETE_REVIEW requires the entire case claim set and corresponding reviewer scope; partial generic review cannot close an entire case. COMPLETE_REVIEW and REJECT close the workflow without emitting VERIFIED/FAILED claim truth. CONFIRM_CLAIMS requires a manual-authority route and explicit manual-confirmation permission. Partial confirmation remains open; CONFIRMED requires all case claims. Unchecked request claims remain outside the confirmation scope.

Logical revision checks are not database locking. Durable services must atomically persist accepted history, command-key uniqueness, audit and outbox using the existing UnitOfWork contract. S08 introduces no competing repository writer or concrete persistence adapter and does not claim durable delivery.

## Manual observations and promotion gates

`ManualClaimObservation` stores one checked claim, controlled observation CONFIRMED/NOT_CONFIRMED/SOURCE_UNAVAILABLE, confirmation fingerprint, evidence references, source ID/version/snapshot, retrieval time and check time. Rationale and evidence are references to access-controlled records, not raw source text. Source retrieval must be within the request knowledge cutoff; newer information requires a new request/case snapshot. Observation time cannot predate case opening or follow command submission.

Only CONFIRMED may normalize to S07 VERIFIED, and only with:
1. exact case/request/route/original/security/S06 snapshot binding;
2. active applicable route with sufficient assurance;
3. exactly one matching unconditional AUTHORIZED result for entity, role, claim, jurisdiction, evaluation and knowledge instants;
4. no unresolved conditions, limitations or authority conflicts;
5. S05 PROCESSING_ALLOWED and matched archive byte integrity;
6. no contradictory prior verified assertion, prior FAILED or unresolved REVIEW_REQUIRED route result for the claim;
7. current human invocation, case-scoped manual mandate and explicit supporting source evidence.

Conditional authority stays REVIEW_REQUIRED; textual conditions are not guessed fulfilled. Missing/negative/conflicting authority and security blockers are REVIEW_REQUIRED, not negative legal truth. SOURCE_UNAVAILABLE remains INDETERMINATE. NOT_CONFIRMED is REVIEW_REQUIRED, not proof of nonexistence. Generic HUMAN_REVIEW never emits VERIFIED.

Prior provider INDETERMINATE results allow independently supported manual fallback without assurance reduction. Conflicts are recorded and escalated, not overwritten by last-writer-wins. A governed new source/authority snapshot is required before a fresh case replaces uncertainty; S08 invents no source precedence.

## Privacy, audit and immutability

Summaries expose identifiers, scopes, methods, policy/source versions and security disposition, not filenames, storage URLs, legal names, document bytes or arbitrary extracted values. Decision records retain actor, tenant/organization/purpose, correlation and access/audit/mandate references, command identity, submitted/executed instants, claim outcomes and reasons. Read authorization remains mandatory; serialization is not an access gate.

Collections are defensively copied, validated, deterministically ordered and frozen. Upstream snapshots and previous decisions remain unchanged. Evidence fingerprints are opaque commitments, not document bodies.

## Exit evidence

Mandatory runtime scenarios with one-to-one test index; strict readonly compile proof; exact ancestry; no production Core/adapter diff; no ambient time/provider dependencies; S07 transitive S01–S06/FV09/FV10/admission/architecture regressions; tenant regressions; dedicated final-head workflow and exit evidence. Documentation commits require final-head revalidation. S08 merge and S09 continuation require fresh user authorization.

Initial exact-head S08 evidence on `70bccc79b40b93278432816f86202d2db318aec4` passed 64/64 runtime scenarios, readonly compile and scope guards. Subsequent hardening and this document require fresh final-head evidence; see `M05_S08_EXIT_EVIDENCE.md` and PR #124 for the SHA-specific final matrix.
