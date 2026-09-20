# CALPQ M04 Slice 09 — Exit Evidence

Status: `IMPLEMENTED / VERIFIED IMPLEMENTATION HEAD / PR OPEN / UNMERGED`  
ID: `CALPQ-M04-S09-EXIT-0001`  
Tracking issue: #102  
Pull request: #103

## 1. Authorization and reviewed lineage

The implementation follows the explicit instruction:

`SCHVALUJI MERGE PR #101 A POKRAČOVÁNÍ NA M04 SLICE 09`

Reviewed lineage:

- reviewed Slice 08 PR #101 final head: `d95376fdb0b58442f58266ff94790f5ea2aadea7`;
- reviewed Slice 08 merge commit: `5eacb823b0b54a1717ea7f0632ff38fb45d72c49`;
- S09 feature branch: `impl/m04-s09-historical-version-replay`;
- initial S09 Core commit: `91cd914941a38c1e6eec600f4f6527e71785288e`;
- verified implementation/evidence-package head: `c7362941d9bf7f478221a4f84f8808d1917926e6`.

Slice 09 therefore descends directly from the reviewed and merged Slice 08 result. No obsolete feature branch or parallel historical architecture was used.

## 2. Delivered capability

### HistoricalCatalogVersionQuery

S09 adds a deterministic bitemporal historical query over immutable S05 `CatalogProvenanceBinding` candidates.

The two historical dimensions are deliberately separate:

- `effectiveOn` = valid time: the date for which a catalog/path/requirement version is semantically or legally applicable;
- `asKnownAt` = knowledge/system time: the cutoff by which CALPQ must actually have known the exact governed provenance/source snapshot.

The query additionally records explicit `executedAt`; this operation time does not replace either historical dimension.

Supported S05 target kinds:

- ActivityDefinition;
- ProfessionDefinition;
- CredentialDefinition;
- RequirementDefinition;
- GovernedRequirementSetVersion;
- QualificationPathDefinition.

Controlled query states:

- `SELECTED`;
- `NOT_FOUND`;
- `NOT_YET_KNOWN`;
- `AMBIGUOUS_REVIEW_REQUIRED`.

Selection requires exact target kind/id, jurisdiction, effective date and optional exact version. A candidate is knowledge-eligible only when its provenance evaluation and all exact source retrieval timestamps are at or before `asKnownAt`.

### HistoricalSnapshotReplay

Replay operates over stored immutable S07/S08 outputs and never rebuilds them using current rules.

For a selected historical QualificationPath version, replay filters stored S07 `GapNavigatorEvaluation` snapshots by:

- exact subject;
- exact path ID/version;
- exact jurisdiction;
- exact `effectiveOn`;
- `evaluatedAt <= asKnownAt`.

It then selects the latest eligible historical snapshot by explicit evaluation instant. If two distinct snapshots tie at that latest instant, replay fails closed to `AMBIGUOUS_REVIEW_REQUIRED`.

For an eligible gap snapshot, S08 explanation replay additionally requires:

- exact `GapEvaluationId` binding;
- exact subject/path/version/jurisdiction/effective-date context;
- explanation timestamp at or after the gap timestamp and at or before `asKnownAt`.

Controlled replay states:

- `VERSION_QUERY_UNRESOLVED`;
- `CATALOG_VERSION_ONLY`;
- `GAP_SNAPSHOT_REPLAYED`;
- `FULL_SNAPSHOT_REPLAYED`;
- `AMBIGUOUS_REVIEW_REQUIRED`.

## 3. No-hindsight and historical-integrity guarantees

The implementation explicitly prevents hindsight substitution:

1. a version that was effective in the past but whose governed source/provenance had not yet been incorporated by `asKnownAt` is `NOT_YET_KNOWN`;
2. a later-known overlapping version cannot displace the version that was actually known at the historical cutoff;
3. an exact requested version never silently falls forward to a newer/current version;
4. multiple known overlapping applicable versions fail closed to review;
5. snapshots created after the historical knowledge cutoff are ignored;
6. later stored snapshots do not mutate or rewrite prior query/replay objects;
7. replay returns the original historical S07/S08 objects and their exact serializations rather than reconstructed substitutes.

## 4. Authority boundaries proven

The S09 Core source does not:

- call `EligibilityAssessment.evaluate`;
- call `GapNavigatorEvaluation.evaluate`;
- call `CatalogQueryExplanationGraph.build`;
- create or promote SourceReference/EvidenceReference verification state;
- create or recompute S06 recognition/equivalence authority;
- mutate historical catalog/path/gap/explanation inputs;
- use ambient current time or randomness;
- select/rank/recommend a qualification path;
- create NextBestAction or AuthorizationGrant authority;
- ingest provider payloads;
- own UI truth.

The S07/S08 builders are used only by the dedicated runtime test fixture to manufacture controlled historical snapshots; the production S09 source only consumes stored objects.

## 5. Executable evidence

The dedicated S09 runtime matrix contains exactly **48 mandatory scenarios**.

It proves, among other things:

- historical selection for every S05 target kind;
- exact kind/id/version/jurisdiction/date matching;
- valid-time versus knowledge-time separation;
- `NOT_FOUND` versus `NOT_YET_KNOWN`;
- no fall-forward of exact versions;
- no hindsight displacement by later-known versions;
- fail-closed overlapping version ambiguity;
- duplicate candidate rejection;
- explicit operation-time ordering;
- source-review flag preservation;
- deterministic canonical query serialization;
- unresolved/non-path/catalog-only replay states;
- exact S07 gap replay;
- exact S08 explanation replay;
- wrong-subject/path-version/effective-date rejection by filtering;
- knowledge cutoff on stored gap/explanation snapshots;
- latest eligible snapshot selection;
- tied-latest fail-closed behavior;
- duplicate GapEvaluationId/ExplanationGraphId rejection;
- immutable replay collections and original object identity;
- later snapshots do not rewrite historical replay;
- replay never mutates historical snapshot serialization.

Strict TypeScript compile proof covers readonly collections, immutable selected bindings, controlled state unions and semantic separation of `HistoricalCatalogQueryId` from `HistoricalReplayId`.

As part of S09 validation hardening, `packages/core/tsconfig.json` now includes both `m04-s08-types.compile.ts` and `m04-s09-types.compile.ts`, closing the previously identified omission of the S08 compile-proof file from the global Core typecheck.

## 6. Dedicated runner evidence

`tests/m04_s09_historical_version_replay_test.sh` additionally proves:

- exact ancestry from reviewed Slice 08 merge `5eacb823b0b54a1717ea7f0632ff38fb45d72c49`;
- formal M04 admission;
- exactly 48 mandatory S09 runtime scenarios;
- strict TypeScript build;
- no framework/provider/AI dependency leakage;
- no ambient time/randomness;
- no eligibility/gap/explanation recomputation;
- no source/evidence/recognition authority creation;
- no AuthorizationGrant / NextBestAction / path-selection authority;
- direct S01–S08, FV03 and FV11 runtime regressions;
- M04 admission, execution-readiness and architecture-boundary guards.

## 7. Verified CI matrix for implementation head `c7362941d9bf7f478221a4f84f8808d1917926e6`

All triggered workflows completed successfully on the verified implementation head:

| Workflow | Run ID | Result |
|---|---:|---|
| M04 Slice 09 Historical Version Replay | 35082317221 | success |
| M04 Slice 08 Explainability | 35082317311 | success |
| M04 Slice 07 Gap Navigator | 35082317083 | success |
| M04 Slice 06 Equivalence Recognition Review | 35082317123 | success |
| M04 Slice 05 Catalog Provenance Binding | 35082317259 | success |
| M04 Slice 04 Qualification Path | 35082317254 | success |
| M04 Slice 03 Requirement Set Versioning | 35082317218 | success |
| M04 Slice 02 Credential Requirement Catalog | 35082317155 | success |
| M04 Slice 01 Activity Profession Catalog | 35082317173 | success |
| FV-03 Core Provenance | 35082317137 | success |
| FV-11 Eligibility Assessment | 35082317158 | success |
| Foundation Guard | 35082317225 | success |
| M04 Admission | 35082317327 | success |
| M00 Readiness | 35082317250 | success |
| Program Execution Readiness | 35082317151 | success |
| M03-M08 Execution Readiness | 35082317160 | success |
| M09-M12 Execution Readiness | 35082317076 | success |
| CALPQ v1 Execution Index | 35082317187 | success |
| M02 Batch Readiness | 35082317201 | success |
| M02 Batch A Manifest | 35082317129 | success |
| FV-01 Core Primitives | 35082317115 | success |
| FV-02 Core Ports | 35082317164 | success |
| FV-04 Transition Kernel | 35082317206 | success |
| FV-05 Credential Evidence | 35082317020 | success |
| FV-06 Application Layer | 35082317042 | success |
| FV-07 Persistence UnitOfWork | 35082317056 | success |
| FV-08 Migration Delivery | 35082317253 | success |
| FV-09 Document Intake | 35082317321 | success |
| FV-12 Professional Passport | 35082317177 | success |

No S09 implementation remediation was required on this implementation head.

## 8. Exit assessment

Against implementation head `c7362941d9bf7f478221a4f84f8808d1917926e6`, M04 Slice 09 satisfies its implementation contract and executable evidence requirements:

- bitemporal historical query exists;
- all S05 provenance target kinds are supported;
- no-hindsight behavior is executable and tested;
- exact stored S07/S08 snapshot replay exists without current-rule recomputation;
- runtime and compile-time mandatory evidence exists;
- exact reviewed S08 lineage is proven;
- direct M04/FV regressions and broad readiness gates pass;
- PR #103 is mergeable;
- no known S09 implementation-head CI failure remains.

This exit-evidence commit is documentation-only and intentionally does not alter runtime semantics. Its own final PR-head workflow matrix must complete successfully before PR #103 is labelled FINAL HEAD GREEN.

## 9. Merge boundary

PR #103 remains **OPEN and UNMERGED**. This evidence demonstrates review readiness only and does not constitute merge authorization. A fresh explicit user approval is required before merging Slice 09.