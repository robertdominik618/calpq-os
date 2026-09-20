# CALPQ EXPATS — Mobility Context Contract

ID: `CALPQ-EXPAT-0001-C01`; version `1.0.0`; status `OWNER_APPROVED_ARCHITECTURE / NO_RUNTIME_API_CHANGE`.
Parent: [EXPATS baseline](../architecture/CALPQ_EXPAT_0001_GLOBAL_MOBILITY.md).

## Reuse before extension

Use [Core primitives](CORE_PRIMITIVES.md), [evidence/provenance](CORE_PROVENANCE_AND_EVIDENCE.md), [command/event envelopes](COMMAND_EVENT_ENVELOPES.md), [application execution context](APPLICATION_EXECUTION_CONTEXT_MODEL.md), [recognition](EQUIVALENCE_RECOGNITION_MODEL.md), [B2B guard](B2B_ASSIGNMENT_GUARD.md), [dependency re-evaluation](DEPENDENCY_GRAPH_REEVALUATION_MODEL.md), [decision replay](DECISION_REPLAY_MODEL.md), [access policy](ACCESS_POLICY_MODEL.md) and [consent/legal basis](CONSENT_LEGAL_BASIS_MODEL.md). No generic contract is replaced or copied.

## New coordination aggregate: MobilityCase

Required semantic fields: `case_id`, `revision`, `subject_ref`, `goal_ref`, `jurisdiction_refs`, `effective_interval`, `fact_snapshot_refs`, `evidence_refs`, `assessment_refs`, `journey_ref`, `access_scope_ref`, `case_stage`, `created_at`, `created_by`, `contract_version`. Case metadata is purpose-bound and privacy-classified. Sensitive facts remain access-controlled references rather than a second profile database.

Optional references: related family cases, organization/assignment, specialist-review task, travel intervals, cost estimate, supported route version and localization coverage. A family group only coordinates explicit dependencies; it never becomes the subject of all individual entitlements. External system identifiers are adapter mappings, not domain primary keys.

Concepts `ResidenceFact`, `CitizenshipFact`, `WorkContextFact`, `RelationshipFact`, `TravelIntervalFact` are typed evidence views/references under existing subject/evidence contracts. Admission must resolve names against actual types before runtime implementation. Do not add ad-hoc person fields or infer legal facts from language, nationality demographics, account payer or device location.

## Case stages and state separation

Proposed case-coordination stages: `DRAFT`, `NEEDS_INPUT`, `READY_FOR_REVIEW`, `IN_PROGRESS`, `WAITING_EXTERNAL`, `CLOSED`, `ARCHIVED`. These are not residence statuses. Commands require expected revision and authorization; stage changes cannot create a public authority's decision.

Five independent state dimensions must remain visible: original/document processing; proceeding stage; requirement applicability/satisfaction; verified authority/credential state; recommended task stage. A reservation, generated form, received email, reviewed document, filed application, confirmed receipt, final decision and document collection are distinct events. A closed coordination case is not proof of permission or completed legal obligations.

## Assessment projection

`MobilityAssessmentView` references the existing assessment IDs, exact rule/catalog/source/evidence revisions, `as_of`, relevant effective interval, jurisdiction, intended activity and limitations. Display-only condition outcomes distinguish SATISFIED, NOT_SATISFIED, UNKNOWN, REVIEW_REQUIRED, NOT_APPLICABLE with explicit mapping to the existing evaluator contract at admission. These names introduce no incompatible runtime enum.

The projection contains independent questions for residence, labour access, professional qualification/recognition, activity/assignment, insurance and specialist tax questions. NEVER reduce these to one universal green status. A known adverse condition is scoped to its question, jurisdiction and interval. Unknown or stale inputs cannot be elevated to positive assurance; absence of data cannot be asserted as unlawful residence/work. Conflicts preserve both sources and require review.

Existing AssignmentGuard statuses remain exactly ASSIGNABLE, ASSIGNABLE_WITH_CONDITIONS, BLOCKED, REVIEW_REQUIRED, INDETERMINATE. Conditional assignment lists every sourced condition. Recommendations, jobs, language preference, marketplace rank or tariff cannot alter those statuses.

## Commands, events and ports

Every command reuses the mandatory command envelope: command_id, command_type, aggregate_id, expected_revision, issued_at, actor, correlation_id, payload. Every resulting event reuses event_id, event_type, aggregate_id, aggregate_type, aggregate_revision, occurred_at, command_id, correlation_id, actor, payload; material decisions additionally preserve rule/contract/provenance/evidence references. Schema versions are explicit, not inferred from commit SHA.

| Proposed command | Preconditions | Result event | Forbidden effect |
|---|---|---|---|
| CreateMobilityCase | authenticated/scoped actor, purpose and valid subject/goal | MobilityCaseCreated | invent residence or identity |
| ProposeMobilityFact | controlled intake, lineage and access | MobilityFactProposed | promote OCR to verification |
| LinkReviewedFact | authorized reviewer and existing reviewed evidence | ReviewedFactLinked | create authoritative recognition |
| PlanMobilityJourney | supported route, dependencies, explicit assumptions | MobilityJourneyPlanned | submit forms or reserve silently |
| RecordSubmissionEvidence | verified permitted receipt/evidence reference | SubmissionEvidenceLinked | infer receipt from reservation |
| RequestMobilityReevaluation | identified cause and pinned versions | MobilityReevaluationRequested | rewrite prior assessments |
| RequestSpecialistReview | valid scope, safe contact and evidence selection | MobilityReviewRequested | create legal representation |
| PrepareDisclosure | actor access and purpose, selected claims | MobilityDisclosurePrepared | bypass final sharing checks |
| CloseMobilityCase | recorded reason and retained unresolved obligations | MobilityCaseClosed | revoke or grant residence |

Commands and events above are architecture names for future admission; no handlers are claimed delivered. Actual issuance/recognition/verification remains at existing authoritative boundaries. A downstream case event must never masquerade as AuthorizationGrantIssued or an authority decision.

Ports reuse existing subject/evidence lookup, rule/catalog lookup, evaluation, paths, lifecycle, review, audit, access, storage and notification contracts. Authority portal, appointment, form/submission, translator directory, university/HR, health and accounting/SVJ integrations are adapters requiring separate authorization, available APIs, security review and data processing terms. No invented connector capability or background task is assumed.

## Transactions and retries

Access/purpose check precedes scoped loading; then validate expected revision and evidence references, evaluate deterministically, commit state/audit/outbox atomically, deliver external side effects after commit. Reuse command IDs for retries and reject duplicate effects. A provider receipt is required before recording external completion. Partial failure leaves a visible retry/review state, never a false completion. Production UnitOfWork, authentication, scoped loading and provider adapters are explicit admission prerequisites, not supplied by this pack.

## Time, change and replay

Keep observed_at, recorded_at, source effective interval, fact effective interval, review time and evaluation as_of distinct. A deadline records its triggering event, timezone/calendar policy, source rule and interpretation review. Ambiguous dates cannot silently create exact obligations. Rule publication, fact confirmation, document changes and revocations trigger the existing dependency graph with idempotent invalidation keys. Re-evaluate affected projections, preserve old snapshots, and avoid resending identical notifications.

Passage of time is not an authority event. Continuing legal effects during a proceeding, travel return conditions and taxation questions need separate reviewed rule packs. Imported history is not silently normalized using today's rules.

## Scenario simulation

Run against an explicit immutable baseline plus hypothetical deltas. Mark outputs SIMULATION and list unknowns, alternative paths and assumptions. No persistent fact replacement, case-stage transition, notification delivery, purchase, submission or sharing occurs. Applying a simulated change is a separately authorized real command and requires fresh checks.

## Lifecycle planning and cost model

Journey nodes reference requirements, documents, actors, preparation/application windows and predecessor outcomes. Detect cycles and unsupported nodes. Permit independent work in parallel. Cost items are KNOWN, ESTIMATED or UNKNOWN with currency, source and date; estimates and authority processing times are not guarantees. Closed cases retain links to continuing obligations. No detached reminder without traceable origin.

## Recognition and foreign evidence

Reuse EquivalenceRule, RecognitionRoute and RecognitionDecision. A decision applies only to its subject, target, jurisdiction, interval and limitations. Separate original, translation, translator attestation, copy authenticity and legal recognition. Do not blanket-require apostille. Reader-specific requirements are rechecked on reuse. OCR confidence and similar names never merge persons or establish recognition. Untrusted content cannot issue instructions to tools, modify rules or exfiltrate other documents.

## Interoperability and compatibility

All additions are namespaced semantic references and projections over existing contracts. No source-package, database schema, public API, dependency version or AuthorizationGrant contract is changed by this work. Runtime admission must add versioned wire/schema bindings, data migration, authorization tests, backward compatibility and rollback plans. Health #84 and Civic/Family product baselines remain independently governed dependencies. No health or family source files from an unmerged PR are copied into this branch.
