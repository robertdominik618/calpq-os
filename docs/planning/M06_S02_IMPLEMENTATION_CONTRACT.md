# M06 Slice 02 — Expiry & Renewal Policy Evaluation

Status: `OWNER AUTHORIZED / CONTRACT BEFORE SOURCE / POST-MERGE ACTIVATION REQUIRED`
Tracking: #141; epic #36. Owner: `SCHVALUJI MERGE PR #140 A POKRAČOVÁNÍ NA M06 SLICE 02`.
S01 reviewed head `45f89a2507d24d0412b6524f332c0694f59d3121`; actual S01 merge `6fe20885770ddaea879c666304f90c407b5a34eb`; identical tree `798d230acc79d9bf5a9694258dfcfa569ff39193`.
Owner record: PR #140 comment `5730058055`. Product source starts only after completed post-merge verification and a separate immutable S02 execution record. This architecture-only commit makes no test or activation success claim.

## Canonical ownership and delivery

Implement original slice 2 of M06_EXECUTION_PACKAGE.md. Reuse S01 CredentialLifecycleBasis, Core DateOnly/UtcInstant, SourceReference, CredentialDefinitionReference and existing Application execution/tenant/access contracts. This is bounded deterministic evaluation of approved calendar scheduling policy, not a new legal lifecycle state machine. Preserve APPLICATION_POLICY_ORCHESTRATION_BOUNDARY.md and PASSPORT_LIFECYCLE_RENEWAL_PROJECTION.md: Application does not decide legal satisfaction, lifecycle transition legality or authority. No hard-coded professional/medical/legal durations are shipped; fixtures are synthetic. Core/provider/UI and historical runtime tests remain unchanged.

**calendar expiry projection != legal validity; renewal window != renewal permission; grace != validity extension; time passage != authority event**.

## Policy and selection

ExpiryRenewalPolicy binds an opaque policy ID, VersionId, exact credential-definition ID/version, jurisdiction, inclusive DateOnly effective interval, recorded knowledge time, exact SourceReference and source-snapshot reference, approving ActorReference/time/reference, optional unresolved conditions, controlled expiry rule and renewal rule. Approval cannot postdate recorded knowledge; source retrieval cannot postdate recorded knowledge. Factories validate consistency of governed records, not authenticity of client JSON or authority of the approving actor.

Evaluation requires a trusted complete candidate set for the exact target and an explicit policyEffectiveOn date with selectionBasisReference. The effective selection date may differ from the date being evaluated (e.g. issuance-cohort rules); it must come from governed selection context, not be guessed by UI. Policies recorded beyond asKnownAt are excluded before visible duplicate/ambiguity checks. Exact definition version, jurisdiction and inclusive effectivity must match. No applicable policy is INDETERMINATE; multiple applicable policies are REVIEW_REQUIRED. Never select newest/lexicographically highest or silently choose the earliest deadline. Missing candidates cannot prove absence of a renewal obligation. Completeness/authenticated scoped loading remains an entrypoint responsibility.

A policy source not VERIFIED, out of its declared effective interval, of another jurisdiction, or carrying unresolved policy conditions prevents a trusted calculation. An artifact not VERIFIED likewise yields REVIEW_REQUIRED, never automatically promoted date truth. VERIFIED markers are consistency inputs; upstream verification must cover the dates and associations used. S02 does not establish cryptographic authenticity or claim-specific verification itself.

## Calendar and expiry arithmetic

LifecycleCalendarContext binds explicit evaluatedAt UtcInstant, evaluatedOn DateOnly, UTC offset minutes and an opaque calendarReference. The date must equal the explicitly offset instant. Offset is supplied by a trusted jurisdiction/time-zone provider and recorded; S02 does not guess DST rules. Date arithmetic uses pure proleptic Gregorian calendar arithmetic for years 0001–9999, no DateOnly-to-midnight coercion or ambient clock.

Expiry rules:
- DECLARED_EXPIRES_ON uses only artifact.expiresOn; missing date remains INDETERMINATE.
- AFTER_ANCHOR uses ISSUED_ON or EFFECTIVE_FROM and a positive bounded DAYS/MONTHS/YEARS duration. ANNIVERSARY_DATE or PREVIOUS_DAY boundary is explicit. Month-end adjustment must explicitly CLAMP or REJECT. Missing anchor is INDETERMINATE; arithmetic overflow or required-but-rejected adjustment is REVIEW_REQUIRED. A computed date different from an existing declared date is REVIEW_REQUIRED and retains both candidate values without precedence.
- NO_FIXED_EXPIRY is an explicit governed policy, not inferred from null expiresOn. A conflicting declared expiry is REVIEW_REQUIRED. It never means unlimited legal authorization or absence of recurring obligations.

Pure helper shiftLifecycleDate supports signed calendar shifts with bounded integers (DAYS <=365250, MONTHS <=12000, YEARS <=1000). These are technical bounds, not legal defaults. Invalid supported-shape inputs throw; missing/ambiguous material facts return controlled outcomes. Extra rule keys and uncontrolled variants are rejected rather than ignored.

## Renewal and output semantics

Renewal mode WINDOW carries nonnegative opensDaysBeforeExpiry >= dueDaysBeforeExpiry and graceDaysAfterDue. Open and due boundaries are inclusive; grace starts after due and ends inclusively. Grace applies only to the modeled renewal process and never changes expiry or legal authority. NOT_REQUIRED requires an explicit selected policy; UNKNOWN remains unknown. A window without a resolved expiry is INDETERMINATE. No business-day/holiday/recurrence or conditional-obligation inference is claimed.

Return separate evaluation outcome EVALUATED/INDETERMINATE/REVIEW_REQUIRED, expiry relation BEFORE_EXPIRY/ON_EXPIRY_DATE/AFTER_EXPIRY/NO_FIXED_EXPIRY/UNKNOWN, and renewal state NOT_YET_OPEN/OPEN/DUE_TODAY/OVERDUE_WITHIN_GRACE/OVERDUE/NOT_REQUIRED/UNKNOWN. They are calendar relations, not valid/invalid authorization states. Trace retains input anchor, amount/unit, adjustment/boundary convention, calculated candidate, declared date, window arithmetic, exact source/policy versions and evaluation/knowledge context. No event, notification, command, persistence write or renewal is created.

## Scope, privacy and immutability

Each query uses `credential.lifecycle.policy.evaluate` and `credential:expiry-renewal-policy`, explicit independent authorized TenantContext, TenantBoundary and TenantAccessDecision. Check actor/kind/correlation/tenant/organization/subject/purpose/access-reference/field and jurisdiction before data-dependent output. DENY cannot be overridden. Evaluation and knowledge instants cannot exceed invocation time; basis.recordedAt cannot exceed knowledge cutoff. No output IDs/counts/reasons from future-known policies. Deep-freeze newly constructed metadata only, never freeze/mutate upstream payloads. Omit raw source/storage locators and external credential identifiers.

Output always records legalValidityDetermined=false, authorizationAuthority=false, renewalPerformed=false, notificationScheduled=false and eventsEmitted=0. Evaluation IDs are caller-supplied opaque references; deterministic evaluation has no database idempotency claim.

## Exact implementation scope and historical governance

Added paths: this contract; M06_S02_TEST_INDEX.md; M06_S02_EXIT_EVIDENCE.md; docs/planning/m06-s02-execution.json; packages/application/src/lifecycle/expiry-renewal-policy.ts; packages/application/test/m06-s02-expiry-renewal-policy.test.ts; packages/application/test/m06-s02-types.compile.ts; scripts/ci/m06-s02-scope.mjs; tests/m06_s02_scope_test.mjs; tests/m06_s02_expiry_renewal_test.sh; .github/workflows/m06-s02-expiry-renewal.yml.
Only modified paths: packages/application/src/lifecycle/index.ts (exact additive exports), packages/application/package.json (one new script), packages/application/tsconfig.json (one compile entry), scripts/ci/m06-admission.mjs (exact successor dispatch only). All entries regular mode100644. No other source, historical decision/activation, old script or old test changes. The original M06 package remains an admission-time record; current scope/status belongs to this separate S02 record and epic.

The successor guard seals actual S01 head/merge/tree and earlier admission graph, verifies old decision/activation and closed-slice scopes using preserved validators, and enforces exact current paths/config patches plus contract/index/execution-before-source. Original validator pure functions and all runtime commands remain byte-preserved. A malformed successor does not fall back to S01. Actual owner and post-merge references must be inspected; string format alone is not consent/CI proof. S02 record is introduced once and remains immutable. No further admission-only PR is required for this explicitly authorized S02 delivery.

## Exit

72 named runtime scenarios, readonly compile proof, 16 governance tests, unchanged S01/admission/preparation/M04/M05/FV09/FV10 and M03 timeline regressions plus full same-head PR matrix. No skipped/todo/only or hidden failing scenarios. Record actual head/run evidence separately after execution; documentation does not certify its own future tests. S02 merge/S03 continuation need owner approval. Accepted S01 completion may advance plan coverage to61/130 only after its merge validation; S02 remains unaccepted until its own verified merge. No production deployment.
