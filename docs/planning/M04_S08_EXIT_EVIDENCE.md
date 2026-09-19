# CALPQ M04 Slice 08 — Exit Evidence

Status: `IMPLEMENTED / VERIFIED IMPLEMENTATION HEAD / PR OPEN / UNMERGED`  
ID: `CALPQ-M04-S08-EXIT-0001`  
Tracking issue: #100  
Pull request: #101

## 1. Authorization and reviewed lineage

The implementation follows the explicit instruction:

`SCHVALUJI MERGE PR #97 A POKRAČOVÁNÍ NA M04 SLICE 08`

Reviewed lineage:

- reviewed Slice 07 PR #97 final approved head: `c01b1d879022148a759e9339d0cb367d6c6b543e`;
- reviewed Slice 07 merge commit: `944084ae05f3c40ec578bc43ee4b392349b8dbda`;
- S08 feature branch: `impl/m04-s08-explainability-source-linkage`;
- initial S08 Core commit: `b33c5e9bf3d6e2c7c2cc9a169214b1641cebd64c`;
- executable evidence-package commit: `026083c60d6b9749ad8c4aa74166be4499c025b8`;
- type-only import remediation commit: `44d6d64d7871f067e51ccd026041ed08d9434b18`;
- exact source-snapshot binding implementation commit: `0f69b47948532d61520bc910e7c29a9436012482`;
- exact source-snapshot evidence head: `d616476682ff01bcfeb2d7f20fc922fc7ed86c85`.

Slice 08 therefore descends directly from the reviewed and merged Slice 07 result. No parallel catalog, eligibility, recognition, gap or explainability authority was introduced.

## 2. Delivered capability

### CatalogQueryExplanationGraph

The implementation materializes an immutable deterministic explanation snapshot over one already-computed S07 `GapNavigatorEvaluation`.

It preserves and exposes:

- semantic `ExplanationGraphId`;
- exact `GapEvaluationId`;
- exact subject identity and kind;
- exact `QualificationPathDefinition` identity and version;
- explicit jurisdiction and effective date;
- explicit UTC explanation evaluation instant;
- typed graph nodes for gap evaluation, path, path step, requirement, reason, source, rule and evidence;
- typed graph edges for path traversal, reasons, sources, rules, evidence, prerequisite blockers and residual requirements;
- exact S07 step and requirement states without reinterpretation;
- exact S07 reason codes;
- exact S07 evidence identities;
- exact rule identities and versions;
- exact source identities, versions and verification states;
- controlled unresolved facts;
- deterministic canonical node/edge/fact ordering;
- immutable historical serialization.

The graph is structured authority data. It intentionally contains no authoritative free-text narrative, recommendation or selected path.

## 3. Explainability classification

S08 implements exactly three explanation classifications:

- `EXPLAINED` — all material governed linkage available to the graph is resolved and no review/indeterminate condition exists;
- `INDETERMINATE` — material context is missing or S07 already reports information missing;
- `REVIEW_REQUIRED` — a material supplied source is not verified or S07 already requires review.

`REVIEW_REQUIRED` takes precedence over `INDETERMINATE` when both facts exist.

This classification is metadata about the quality/completeness of the explanation only. It never mutates, replaces or upgrades the underlying S07 `GapItemState`.

## 4. Exact source snapshot boundary

Source handling is fail-closed and historically reproducible:

- caller-supplied sources must be actual governed `SourceReference` values;
- a source retrieved after the explanation evaluation instant is rejected;
- each `SourceId` may occur at most once in the explanation source input;
- a path-provenance source supplied to S08 must match the exact S07 path-provenance `SourceReference` snapshot;
- the exact snapshot comparison binds authority identity/kind, jurisdiction, source type, canonical locator, source version, publication/effective dates, retrieval instant, verification state and content hash;
- a different source version cannot silently replace the source used by the governed path-provenance snapshot;
- a changed verification state cannot silently replace the historical path-provenance snapshot;
- a missing material SourceReference yields an explicit unresolved fact rather than inferred authority.

This prevents last-write-wins behavior for duplicate source identities and prevents explanation history from drifting to a newer source snapshot under the same SourceId.

## 5. S07 and S06 authority preservation

S08 does not recompute or reinterpret the governed result.

It consumes S07 data as-is:

- all six S07 states remain visible unchanged: `ALREADY_SATISFIED`, `ACTION_REQUIRED`, `RECOGNITION_POSSIBLE`, `INFORMATION_MISSING`, `REVIEW_REQUIRED`, `NOT_APPLICABLE`;
- S07 `reasonCodes` become explicit reason nodes/edges;
- S07 source IDs become source linkage;
- S07 evidence IDs become evidence linkage;
- S07 rule references become typed rule/version linkage;
- prerequisite blockers become `BLOCKED_BY_STEP` edges;
- residual obligations become `HAS_RESIDUAL_REQUIREMENT` edges.

S06 recognition/equivalence effects are therefore explainable only insofar as they are already represented by governed S07 reason/rule/source/residual data. S08 creates no recognition rule, route or decision.

## 6. Authority separation

S08 does not:

- call or replace FV11 eligibility evaluation;
- verify or promote evidence;
- create evidence authority;
- create source authority;
- create or resolve S06 equivalence/recognition decisions;
- change S07 gap states, reason codes, residual obligations or completion;
- rank, select or recommend a qualification path;
- create Next Best Action authority;
- issue `AuthorizationGrant` objects;
- perform provider ingestion/synchronization;
- own UI truth;
- use LLM/free text to create graph edges, satisfaction, rules or source authority;
- use ambient current time or randomness.

Natural-language or AI narration may exist only downstream of this governed structured graph.

## 7. Executable evidence

The dedicated S08 runtime matrix contains exactly **48 mandatory scenarios**.

Coverage proves, among other things:

1. semantic explanation identity;
2. exact S07 gap-evaluation identity;
3. subject/path/version/jurisdiction/effective/evaluation context preservation;
4. root/path/step/requirement graph traversal;
5. reason linkage;
6. source linkage;
7. rule/version linkage;
8. evidence linkage;
9. exact source version and verification presentation;
10. preservation of every S07 gap state;
11. no mutation of S07 inputs;
12. fail-closed missing-source behavior;
13. fail-closed S07 information-missing behavior;
14. review-required source behavior;
15. review precedence over indeterminate;
16. partial equivalence residual linkage;
17. equivalence rule visibility;
18. recognition-route reason visibility;
19. prerequisite blocker linkage;
20. prerequisite reason preservation;
21. duplicate SourceId rejection;
22. exact path-provenance source snapshot binding;
23. changed source version rejection;
24. changed source verification-state rejection;
25. future-retrieved source rejection;
26. explanation-time monotonicity;
27. deterministic repeated serialization;
28. canonical node ordering;
29. canonical edge ordering;
30. object/collection/node/edge/unresolved-fact immutability;
31. read-only derived graph views;
32. historical snapshot immutability when governed inputs change;
33. absence of authoritative narrative/recommendation/path-selection fields.

Compile-time proof additionally enforces readonly graph collections, controlled classification/node/edge unions and semantic `ExplanationGraphId` separation.

The dedicated shell runner also proves:

- exact ancestry from reviewed S07 merge `944084ae05f3c40ec578bc43ee4b392349b8dbda`;
- formal M04 admission;
- no framework/provider/AI dependency leakage into Core;
- no ambient time/randomness;
- no FV11 eligibility evaluation or evidence/source creation/promotion;
- no recognition/equivalence authority creation;
- no AuthorizationGrant, NextBestAction or path-selection authority;
- direct S01–S07, FV03 and FV11 regression coverage;
- M04 admission, execution-readiness and architecture-boundary guards.

## 8. Remediation evidence

The first PR CI execution exposed one concrete TypeScript/ESM boundary defect: `GapRuleReference` is a TypeScript interface and had initially been imported as a runtime value.

The failure was explicit and deterministic:

`SyntaxError: The requested module './gap-navigator.ts' does not provide an export named 'GapRuleReference'`

Commit `44d6d64d7871f067e51ccd026041ed08d9434b18` corrected this to a type-only import. The full dedicated S08 workflow and broad matrix subsequently passed.

A further pre-exit quality review then strengthened source-history behavior in commits `0f69b47948532d61520bc910e7c29a9436012482` and `d616476682ff01bcfeb2d7f20fc922fc7ed86c85`: duplicate SourceIds are rejected and path-provenance sources are bound to the exact historical SourceReference snapshot. The mandatory scenario count remains exactly 48.

## 9. Verified CI matrix for implementation head `d616476682ff01bcfeb2d7f20fc922fc7ed86c85`

All workflows triggered for the verified implementation head completed with `success`:

| Workflow | Run ID | Result |
|---|---:|---|
| M04 Slice 08 Explainability | 35080980406 | success |
| M04 Slice 07 Gap Navigator | 35080980637 | success |
| M04 Slice 06 Equivalence Recognition Review | 35080980655 | success |
| M04 Slice 05 Catalog Provenance Binding | 35080980510 | success |
| M04 Slice 04 Qualification Path | 35080980570 | success |
| M04 Slice 03 Requirement Set Versioning | 35080980554 | success |
| M04 Slice 02 Credential Requirement Catalog | 35080980553 | success |
| M04 Slice 01 Activity Profession Catalog | 35080980604 | success |
| FV-03 Core Provenance | 35080980667 | success |
| FV-11 Eligibility Assessment | 35080980595 | success |
| FV-12 Professional Passport | 35080980438 | success |
| FV-06 Application Layer | 35080980442 | success |
| FV-07 Persistence UnitOfWork | 35080980492 | success |
| FV-08 Migration Delivery | 35080980447 | success |
| FV-09 Document Intake | 35080980559 | success |
| Foundation Guard | 35080980454 | success |
| M04 Admission | 35080980579 | success |
| M00 Readiness | 35080980625 | success |
| Program Execution Readiness | 35080980472 | success |
| M03-M08 Execution Readiness | 35080980563 | success |
| M09-M12 Execution Readiness | 35080980626 | success |
| CALPQ v1 Execution Index | 35080980531 | success |
| M02 Batch Readiness | 35080980588 | success |
| M02 Batch A Manifest | 35080980491 | success |
| FV-01 Core Primitives | 35080980525 | success |
| FV-02 Core Ports | 35080980589 | success |
| FV-04 Transition Kernel | 35080980613 | success |
| FV-05 Credential Evidence | 35080980465 | success |

No known implementation-head CI failure remains.

## 10. Exit assessment

Against implementation head `d616476682ff01bcfeb2d7f20fc922fc7ed86c85`, M04 Slice 08 satisfies its implementation contract and executable evidence requirements:

- Core explainability graph exists;
- mandatory runtime and compile-time evidence exists;
- exact reviewed S07 lineage is proven;
- S01–S07/FV03/FV11 regressions pass;
- broad foundation/application/readiness regressions pass;
- source snapshot history is fail-closed;
- PR #101 is structurally mergeable after GitHub computes the current head;
- no known S08 implementation-head CI failure remains.

This exit-evidence file is documentation-only and intentionally does not change runtime semantics. Its own commit must pass the repository's triggered CI before the PR may be described as final-head green.

## 11. Merge boundary

PR #101 remains **OPEN and UNMERGED**. This exit evidence demonstrates review readiness only and does not constitute merge authorization. A fresh explicit user approval is required before merging Slice 08.