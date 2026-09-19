# M06 Slice 08 — Continuous Compliance Status Model

Status: `AUTHORIZED / CONTRACT BEFORE SOURCE / PREDECESSOR POST-MERGE VERIFIED`
Tracking #154; epic #36.
Owner authorization: **SCHVALUJI MERGE PR #153 (Pull Request č. 153 – návrh na sloučení změn) A POKRAČOVÁNÍ NA M06 (milník 06) SLICE 08 (implementační část 08).**
Predecessor PR #153 reviewed head `7b74ff2f76ab924cca278e62ef25c5115a6b652e` merged as `8608b3fbb1cfc5d443162e720cc73849eee91b91`; post-merge evidence is PR #153 comment **5742334875**, confirming 51/51 completed successful merge-associated workflows and zero reviewed-head-to-merge content difference.

## Ownership and canonical reuse
Original M06 execution package Slice 08 applies together with:
- `CONTINUOUS_COMPLIANCE_STATUS_MODEL.md`;
- `REEVALUATION_DECISION_EVIDENCE.md`;
- `M01_CONTINUOUS_COMPLIANCE_BASELINE.md`;
- `M01_CONTINUOUS_COMPLIANCE_TEST_MATRIX.md`;
- `M06_LIFECYCLE_CONTINUOUS_COMPLIANCE_BASELINE.md`;
- `M06_M08_INTEGRATION_SEQUENCE.md`.

Extend only the existing `@calpq/application/lifecycle` package. Reuse existing Core verification/time/version/party primitives, the existing Application execution/tenant/access boundaries, and exact S07 selective-reevaluation evidence where supplied. Do not create an alternate Core, legal-authority engine, provider, scheduler, persistence stack or UI business logic.

**compliance projection != authorization; current status != historical status; future risk != current non-compliance; review required != failure; missing facts != optimistic compliance; organization summary != assignment authority**

## Projection scope
`ContinuousComplianceScope` is immutable and versioned. It binds:
- stable scope reference and version;
- exact tenant and organization;
- controlled scope kind `SUBJECT | ORGANIZATION | ACTIVITY | ASSIGNMENT`;
- subject where the scope is subject/assignment specific;
- jurisdiction reference;
- activity reference where applicable;
- assignment reference only for assignment scope;
- optional credential-scope reference;
- explicit captured/known instant and provenance.

Rules:
- SUBJECT requires a subject and forbids assignment reference;
- ORGANIZATION has no subject or assignment reference;
- ACTIVITY requires activity reference and forbids assignment reference;
- ASSIGNMENT requires subject, activity reference and assignment reference;
- no scope implies broader coverage than it explicitly names.

An organization-level projection must never be interpreted as proving every person or assignment is compliant. Every output therefore retains its exact scope and an explicit `assignmentInferenceAuthorized=false` boundary.

## Condition fact
`ContinuousComplianceConditionFact` is an immutable supplied evaluated fact. Construction validates consistency; it does not confer legal authority.

Each fact binds:
- unique fact reference;
- the exact `ContinuousComplianceScope` object;
- target reference;
- controlled condition type;
- controlled condition state;
- current/future timing;
- blocking flag;
- action-required flag;
- effective-at, evaluated-at, as-known-at and optional valid-until instants;
- Core `VerificationState`;
- controlled source kind `BASELINE_EVALUATION | REEVALUATION_DECISION`;
- source reference and optional source version;
- exact S07 decision reference where the source is reevaluation evidence;
- bounded evidence references;
- bounded condition references;
- provenance/correlation/causation references;
- deterministic reason codes.

Condition states:
- `SATISFIED`;
- `SATISFIED_WITH_CONDITIONS`;
- `UNSATISFIED`;
- `REVIEW_REQUIRED`;
- `INDETERMINATE`;
- `NOT_APPLICABLE`.

Condition types are controlled taxonomy only; they do not embed executable legal logic.

## Temporal rules
CURRENT facts must already be effective at their evaluation instant.
FUTURE facts must have an effective instant strictly after their fact evaluation instant.

A future condition never directly creates current NON_COMPLIANT state. It may contribute only future-risk metadata and AT_RISK treatment where the current projection is otherwise determinable.

A fact whose explicit validity ended before the projection evaluation horizon is stale for current projection purposes. Stale facts cannot establish COMPLIANT, COMPLIANT_WITH_CONDITIONS or NON_COMPLIANT; they contribute INDETERMINATE treatment.

No ambient system clock, local timezone or implicit current date is permitted.

## Verification rules
Only a VERIFIED current fact may establish SATISFIED, SATISFIED_WITH_CONDITIONS or authoritative UNSATISFIED treatment.

For current facts:
- Core REVIEW_REQUIRED, UNVERIFIED or FAILED verification cannot silently become authoritative compliance/non-compliance and produces review-required treatment;
- STALE verification produces indeterminate treatment;
- NOT_APPLICABLE verification is accepted only with NOT_APPLICABLE condition state.

Non-verified future facts may register bounded future risk but never alter current legal/compliance truth.

## Conditional compliance
`SATISFIED_WITH_CONDITIONS` requires at least one explicit bounded condition reference. The output preserves those condition references.

A conditionally compliant status means the current evaluated scope is compliant only while those named conditions remain satisfied. The projection does not itself monitor, enforce or renew those conditions.

## S07 reevaluation integration
A fact with source kind REEVALUATION_DECISION requires an exact supplied `LifecycleSelectiveReevaluation` batch and exact decision reference.

For every reevaluation-sourced fact:
- source reference equals the decision reference;
- target reference matches the S07 target;
- correlation matches the decision evidence;
- decision horizon does not exceed the current projection horizon;
- REVIEW_REQUIRED decision requires REVIEW_REQUIRED fact state;
- INDETERMINATE decision requires INDETERMINATE fact state;
- FUTURE_IMPACT_REGISTERED decision requires FUTURE timing;
- all current outcomes require CURRENT timing;
- ACTION_REQUIRED decision requires the fact action-required flag.

S08 does not reinterpret S07 generic result text into compliance truth. The supplied condition fact provides the controlled compliance meaning and must remain separately governed.

A baseline-only projection may exist with no S07 batch. A reevaluation-sourced fact without its exact S07 batch is rejected.

## Current-status aggregation
The projection derives exactly one current status:

1. `NON_COMPLIANT` when at least one VERIFIED, current, non-stale, blocking UNSATISFIED fact exists.
2. Otherwise `REVIEW_REQUIRED` when at least one current fact requires review by fact state or verification boundary.
3. Otherwise `INDETERMINATE` when required current facts are missing, stale or explicitly indeterminate.
4. Otherwise `AT_RISK` when current compliance is not blocked but:
   - a relevant future fact exists;
   - a VERIFIED current non-blocking UNSATISFIED fact exists; or
   - a VERIFIED current applicable fact explicitly requires action.
5. Otherwise `COMPLIANT_WITH_CONDITIONS` when at least one VERIFIED current fact is SATISFIED_WITH_CONDITIONS and no stronger status applies.
6. Otherwise `COMPLIANT` when at least one VERIFIED current applicable fact is SATISFIED and no stronger status applies.
7. Otherwise `NOT_APPLICABLE` only when explicit current facts exist and all applicable current facts are NOT_APPLICABLE.

An empty current fact set is INDETERMINATE, never COMPLIANT or NOT_APPLICABLE.

A known verified current blocking breach is sufficient for NON_COMPLIANT even if another unrelated condition is uncertain; uncertainty is retained in evidence/reason metadata rather than hiding the known block.

## Future risk
Future facts are preserved separately from current facts and sorted deterministically. Relevant future facts may cause AT_RISK only after current blocking/review/indeterminate precedence has been applied.

Future review/indeterminate facts do not retroactively make the current scope REVIEW_REQUIRED or INDETERMINATE if current facts independently establish a safe current status. They remain future-risk evidence.

## Output and explainability
`ContinuousComplianceProjection` returns safe metadata only:
- exact scope view;
- current status;
- evaluated/as-known instants;
- canonical current/future fact references;
- blocking, conditional, review, indeterminate, action-required and not-applicable reference sets;
- source-version context;
- linked reevaluation decision references;
- deterministic reason codes;
- actor/correlation/access/audit references.

The output must explain why the status was selected and which exact facts contributed to it. Caller input order must not change the serialized result.

No raw document, storage locator, medical detail, unrelated credential data, contact address, provider payload or secret is exposed.

## Historical integrity
S08 is a read/evaluation projection. It does not mutate:
- credentials;
- authorization grants;
- eligibility assessments;
- recognition decisions;
- renewal histories;
- S07 reevaluation evidence;
- assignment decisions;
- prior compliance projections.

A later projection is a new view over explicit governed inputs. Historical replay/as-was versus as-is belongs to Slice 09.

## Authorization and tenant boundary
Every projection requires fresh current:
- tenant;
- organization;
- subject where scoped;
- actor identity and kind;
- purpose;
- correlation;
- operation/field authorization;
- matching ALLOW access decision.

Cross-tenant, cross-organization, foreign-subject, wrong-purpose, wrong-operation, wrong-access-reference or missing field authorization fails before compliance facts are exposed.

## Determinism and bounds
Facts, evidence references, condition references, source versions and output reference sets are dense, bounded, copied and canonically ordered.

The projection receives an explicit max-facts budget. Budget overflow fails closed; no silent truncation may create false completeness.

Identical governed input replay is byte-stable. Scope, fact and S07 objects remain unchanged.

## Required negative authority flags
Every serialized S08 result must preserve:
- `authorizationAuthority=false`;
- `credentialStateMutated=false`;
- `authorizationStateMutated=false`;
- `historicalDecisionMutated=false`;
- `reevaluationDecisionMutated=false`;
- `assignmentDecisionMutated=false`;
- `notificationScheduled=false`;
- `providerInvoked=false`;
- `eventsEmitted=0`;
- `physicalDeletionAuthorized=false`;
- `assignmentInferenceAuthorized=false`.

## Mandatory evidence
The acceptance gate requires:
- **120 ordered S08 product scenarios**;
- **16 ordered scope/governance scenarios**;
- **24 readonly/public-contract assertions** under strict Application compilation;
- unchanged S07/S06/S05/S04/S03/S02/S01 and transitive predecessor gates on the current candidate checkout;
- full same-head pull-request workflow matrix independently complete.

Architecture contract and mandatory test index must precede activation and source. The immutable S08 execution record must bind this owner approval, exact reviewed S07 head/merge, actual post-merge evidence reference, contract/test-index commits and accepted predecessor progress.

Only the original closed S07 scope validator may execute in a temporary historical worktree. Historical scope proof is not current runtime proof.

## Non-goals and release boundary
No Slice 09 historical replay, regulatory interpretation, assignment decision execution, live provider, scheduler, queue, database writer, UI, actual notification send, credential/authorization mutation, physical deletion or production release is part of S08.

S08 pull-request merge, S09+, deployment and release require separate explicit owner approval.

Accepted predecessor coverage is **M06 7/10 = 70%** and original v1 allocation **67/130 = 51.54%**. This S08 contract alone adds no accepted delivery credit.
