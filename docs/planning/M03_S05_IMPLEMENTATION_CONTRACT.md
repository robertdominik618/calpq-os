# CALPQ M03 Slice 05 Implementation Contract — Activity Timeline & Decision Provenance Presentation

Status: `IMPLEMENTING / EXECUTABLE EVIDENCE ADDED`
ID: `CALPQ-M03-S05-0001`

Admission: `CALPQ-M03-ADMIT-0001`.
Reviewed predecessor: M03 Slice 04 merge commit `378705302a0a4e507018e437bc329b42979e60cb`.
Tracking issue: #67.
Implementation branch: `impl/m03-s05-activity-timeline-decision-provenance`.

## Scope
Slice 05 implements the fifth delivery slice from `M03_EXECUTION_PACKAGE.md`: activity timeline and decision provenance presentation.

The implementation adds an immutable framework-neutral `ActivityTimelineReadModel` composed from governed M02/M03 records and the reviewed Slice 04 explanation layer. It presents chronology and decision provenance only; it does not create historical facts, decisions, verification state, lifecycle truth or authorization.

## Governed timeline sources
The timeline may create presentation events only from explicit source timestamps already carried by governed records:
- `DocumentIntakeRecord.receivedAt` -> `DOCUMENT_RECEIVED`;
- `IntakeCorrectionRecord.correctedAt` -> `DOCUMENT_CORRECTED`;
- `ProfessionalPassportItem.verifiedAt` -> `VERIFICATION_RECORDED`, but only when that timestamp exists;
- `EligibilityAssessment.evaluatedAt` -> `ELIGIBILITY_EVALUATED`.

`ProfessionalPassportProjection.generatedAt` is explicitly excluded from activity history because it is presentation/projection time, not a domain activity occurrence.

## Missing-time semantics
A Passport item without governed `verifiedAt` does not receive an inferred timestamp and does not become a timeline event. The read model emits an explicit omission with stable reason code `VERIFICATION_EVENT_TIME_NOT_AVAILABLE`.

This preserves the distinction between absence of a timestamp and absence of verification evidence.

## Ordering semantics
Events are ordered by governed `occurredAt` descending. Equal timestamps use a documented stable event-kind/event-id tie-break. The contract is named `OCCURRED_AT_DESC_NON_CAUSAL_TIE_BREAK` to make explicit that equal-time ordering is a presentation order only and does not assert causal sequence.

No ambient wall-clock time participates in ordering.

## Subject and reference isolation
All admitted document-intake records must be explicitly bound to the same subject as the assessment, Passport and Slice 04 explanation. Subjectless or foreign-subject intakes fail closed. Corrections must reference an admitted intake belonging to that subject. Duplicate intake records fail closed.

This prevents timeline composition from becoming an accidental cross-subject or cross-tenant aggregation path.

## Verification event presentation
A timestamped verification event preserves only governed Passport item facts: evidence identity, verification status, record state, method, source versions and verifier/reviewer attribution. A timestamped verification item without verifier attribution or verification-record state fails closed.

No verification promotion or recomputation occurs.

## Decision provenance presentation
`DecisionProvenancePresentation` is bound to the authoritative `EligibilityAssessment` and reviewed Slice 04 `CredentialExplanationReadModel`. It preserves:
- assessment identity;
- decision/provenance identity;
- authoritative outcome and evaluated-at instant;
- evaluator attribution;
- rule-set identity/version;
- governed source explanations;
- governed evidence explanations;
- atomic requirement reason presentations.

Composition fails closed when assessment identity, provenance identity, evaluated-at instant, rule-set/version or source/evidence bindings diverge.

The presentation has `decisionAuthority = false`; it references an authoritative decision but is not itself a decision engine.

## Hard boundaries
- no invented events or timestamps;
- no inference from projection/render time;
- no causal inference from timeline ordering;
- no eligibility re-evaluation or aggregation;
- no verification promotion;
- no lifecycle inference;
- no `AuthorizationGrant` issuance or implication;
- no M04 catalog/path authority;
- no M06 lifecycle authority;
- no provider SDK or UI-framework dependency;
- no ambient time or randomness;
- immutable nested output and deterministic serialization.

## Verification target
Dedicated executable evidence must prove exactly 30 runtime scenarios plus strict TypeScript proof, reviewed Slice 04 ancestry, M03 S04/S03/S02/S01 regressions, FV-12/FV-11/FV-09 regressions and architecture boundaries.

No mandatory test is waived or deferred.
