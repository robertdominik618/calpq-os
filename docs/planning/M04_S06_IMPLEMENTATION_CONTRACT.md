# CALPQ M04 Slice 06 — Equivalence & Recognition Review Workflow

Status: `IMPLEMENTATION IN PROGRESS / AUTHORIZED`  
ID: `CALPQ-M04-S06-IMPL-0001`  
Tracking issue: #94

## Reviewed lineage
- M04 admission merge: `d1251424127904a8a1ac0b8ad28cee91558408a5`.
- Slice 05 reviewed/merged/post-merge-verified commit: `b2e1184563b7368c63d9fd4bbfe417282b6792bb`.
- User authorization: `SCHVALUJI MERGE PR #93 A POKRAČOVÁNÍ NA M04 SLICE 06`.
- Initial S06 Core commit: `d86665485e8f9a971568bb2edce0665bff8740cf`.

## Objective
Implement the governed equivalence and recognition workflow without converting similarity, route availability, unverified source material, AI candidate mappings or human-review ambiguity into legal equivalence, eligibility or authorization.

## Owned capability
### EquivalenceRule
- explicit typed source object/type/version;
- exact governed target credential/requirement version;
- controlled effect types from the M01 contract;
- exact jurisdiction and effective period;
- controlled conditions;
- explicit residual requirements for partial substitution and credit/reduction;
- exact existing SourceReference snapshots plus ProvenanceEnvelope;
- read-only source-verification predicate and explicit application state.

### RecognitionRoute
- controlled route kinds from the M01 contract;
- explicit source and target credential versions;
- target-jurisdiction and effective-date applicability;
- source-backed provenance;
- `UNKNOWN_REVIEW_REQUIRED` fails closed into review;
- route availability never creates or implies a positive recognition decision.

### RecognitionDecision
- immutable DecisionId;
- explicit authority and subject;
- explicit source credential and governed target;
- exact jurisdiction/effective period;
- controlled conditions/limitations;
- explicit residual requirements for partial recognition/credit;
- exact source-backed provenance;
- source snapshots must already be VERIFIED;
- decision authority must be represented by an exact authoritative source snapshot;
- decision construction never promotes verification state.

### RecognitionReviewCase
- formal OPEN / TRIAGED / IN_REVIEW / WAITING_EVIDENCE / WAITING_EXTERNAL / RESOLVED / CLOSED / REOPENED / SUPERSEDED lifecycle;
- explicit subject, jurisdiction, severity, urgency, assignment, facts, unknowns, evidence IDs, resolution question and due date;
- explicit actors/timestamps/reason codes for every transition;
- monotonic immutable transition history;
- resolution only from IN_REVIEW using an applicable governed EquivalenceRule or authoritative RecognitionDecision;
- RecognitionRoute is intentionally not a resolution basis;
- optional segregation-of-duties guard prevents originator self-resolution;
- reopen preserves prior resolution history.

## Mandatory invariants
1. Similar names/titles never imply equivalence.
2. External framework-level similarity never implies professional recognition.
3. Recognition route availability never implies a positive recognition decision.
4. Rule/decision effects apply only to their exact jurisdiction and effective dates.
5. Partial effects preserve residual requirements explicitly.
6. Unverified source state is preserved and cannot be promoted by S06.
7. Authoritative RecognitionDecision requires already-VERIFIED source snapshots.
8. `UNKNOWN_REVIEW_REQUIRED` never becomes automatic satisfaction.
9. Human review is explicit and auditable; no silent resolution exists.
10. AI/external candidates may be represented only as non-authoritative input references; they cannot create a governed rule or decision.

## Explicit non-goals / boundaries
- no S07 Gap Navigator computation;
- no FV11 eligibility recomputation or replacement;
- no EvidenceReference creation, evidence verification or verification-state promotion;
- no CredentialArtifact ingestion;
- no provider synchronization;
- no AuthorizationGrant issuance;
- no UI truth ownership;
- no AI authority;
- no ambient current time or randomness.

## Verification requirement
Slice 06 is not complete merely because types compile. Completion requires the dedicated runtime matrix, strict compile proof, reviewed-S05 ancestry proof, S01-S05/FV03/FV11 direct regressions, M04 admission/readiness/architecture guards, dedicated CI and a fully green PR matrix before review readiness may be declared.

A future S06 PR must remain OPEN and UNMERGED until fresh explicit merge approval.
