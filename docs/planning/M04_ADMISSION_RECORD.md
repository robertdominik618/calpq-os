# CALPQ M04 Admission Record — Catalog, Qualification Paths & Gap Intelligence

Status: `FORMALLY ADMITTED / IMPLEMENTATION MAY BEGIN AFTER MERGE + POST-MERGE GREEN`
ID: `CALPQ-M04-ADM-0001`

## Milestone
`M04 — Catalog, Qualification Paths & Gap Intelligence`

## Decision
`ADMITTED_FOR_IMPLEMENTATION`

Machine-readable companion: `docs/planning/m04-admission-decision.json`.

## Admission basis
M04 admission is based on reviewed implementation evidence, not merely on planning readiness.

Verified predecessor evidence:
- M03 Slice 10 PR #80 = `REVIEWED / MERGED / POST-MERGE VERIFIED`;
- reviewed M03 merge commit = `fa33edd4804b3534d2642dd044e5c2ee4f5bc5dd`;
- M03 post-merge matrix on that commit = 34/34 observed workflow runs SUCCESS;
- durable M02 exit evidence exists in `docs/planning/M02_EXIT_EVIDENCE.md`;
- durable M03 exit evidence exists in `docs/planning/M03_EXIT_EVIDENCE.md`;
- stable M02 runtime semantics exist for RequirementSet, EligibilityAssessment, evidence/provenance, reason codes, jurisdiction, time, versions and typed IDs;
- M01 governed knowledge contracts exist for Activity/Profession/Credential catalogs, QualificationPath, equivalence/recognition and Gap Navigator;
- M04 catalog ownership, versioning, provenance, path and gap boundaries are explicitly defined in `docs/planning/M04_CATALOG_PATHS_GAP_BASELINE.md`.

## Accepted M04 scope
The admitted scope is the existing `M04_EXECUTION_PACKAGE.md` and `M04_CATALOG_PATHS_GAP_BASELINE.md` only:
1. Activity and Profession catalog model;
2. Credential and Requirement catalog model;
3. RequirementSet versioning/effective dating;
4. QualificationPath graph and path selection;
5. source/provenance binding for catalog nodes and requirements;
6. equivalence and recognition review workflow;
7. Gap Navigator evaluation over current evidence/eligibility outputs;
8. explainability and reason/source linkage;
9. historical-version query and replay semantics;
10. M04 integration evidence against representative target-profession scenarios.

## Authority boundary
M04 owns governed catalog knowledge, versioned requirements, path topology, equivalence/recognition workflow state and deterministic gap computation. Admission does not authorize:
- ingestion of raw provider payloads or M05 adapter/provider work;
- evidence verification, evidence promotion or OCR/AI-to-fact promotion;
- eligibility recomputation outside existing governed M02 semantics;
- AuthorizationGrant issuance, inference, mutation, suspension or revocation;
- free-form AI generation of authoritative requirements, equivalences or qualification paths;
- rewriting historical catalog/path versions or historical decisions;
- M05, M06, M07 or M08 implementation;
- M10 AI decision authority.

Ambiguous, missing or conflicting authority must remain review-required or indeterminate rather than guessed.

## Formal transition
- Transition: `CALPQ-M04-ADMIT-0001`
- Admitted predecessor revision: `fa33edd4804b3534d2642dd044e5c2ee4f5bc5dd`
- Approved by: `robertdominik618`
- Approval wording: `tak pokračujeme`
- Approval timing: the exact chat-event timestamp is not independently asserted; the approval was received after M03 had been reported as 10/10 merged and post-merge verified. This record intentionally avoids invented timestamp precision.
- Authorized execution entry: `M04_SLICE_01_ACTIVITY_PROFESSION_CATALOG_MODEL`

The repository transition becomes effective only when the M04 admission PR is merged and its post-merge CI is green. Before that, this record authorizes review of the admission transition only; it does not authorize Slice 01 implementation.

Admission authorizes only M04 after that effective condition is met. It does not mark M04 complete and does not admit any later milestone.
