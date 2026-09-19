# M06 Slice 09 — Historical Decision Replay & AS_WAS / AS_IS Comparison

Status: `AUTHORIZED / CONTRACT BEFORE SOURCE / PREDECESSOR POST-MERGE VERIFIED`
Tracking #156; epic #36.
Owner authorization: **SCHVALUJI MERGE PR #155 (Pull Request č. 155 – návrh na sloučení změn) A POKRAČOVÁNÍ NA M06 (milník 06) SLICE 09 (implementační část 09).**
Predecessor PR #155 reviewed head `4f5d28cf20fe18d2a6d9fcca1e971f11a484523f` merged as `b3584fca6e094331ca4c998493c1d6f68de89d4b`; post-merge evidence is PR #155 comment **5742901218**, confirming 51/51 completed successful merge-associated workflows and zero reviewed-head-to-merge content difference.

## Ownership and canonical reuse
Original M06 execution package Slice 09 applies together with:
- `DECISION_REPLAY_MODEL.md`;
- `M06_LIFECYCLE_CONTINUOUS_COMPLIANCE_BASELINE.md`;
- `M06_EXECUTION_PACKAGE.md`;
- existing Core `HistoricalCatalogVersionQuery` / `HistoricalSnapshotReplay` primitives from M04;
- existing M07-preparatory replay concepts only as contracts, not regulatory interpretation;
- exact S07 reevaluation evidence and S08 continuous-compliance projections when supplied.

Extend only the existing `@calpq/application/lifecycle` package. Reuse existing Core time/version/party and historical-version primitives plus current Application tenant/access boundaries. Do not create a second persistence stack, provider, scheduler, UI authority layer or alternate Core.

**AS_WAS != AS_IS; replay != authorization; replay match != source truth proof; current rules must not backfill historical truth; missing history != optimistic reconstruction; divergence != mutation**

## Replay modes
Controlled replay modes:
- `AS_WAS` — reconstruct the governed decision from exact inputs, versions and knowledge/evaluation horizons recorded for the original decision.
- `AS_IS` — evaluate the same target identity/context against an explicitly supplied current governed snapshot.

The modes are always labeled explicitly. A response that contains both modes exposes them as separate immutable results; no field is allowed to ambiguously mix historical and current facts.

## Original decision anchor
`LifecycleHistoricalDecisionAnchor` is immutable and binds:
- stable anchor reference;
- controlled target type;
- exact original decision reference;
- exact tenant / organization / subject scope;
- jurisdiction reference;
- original semantic outcome;
- original decision/evaluation instant;
- original as-known instant;
- exact rule/source/contract version references;
- exact evidence snapshot references;
- exact provenance/correlation/causation references;
- recorded implementation-contract reference;
- historical input-completeness declaration.

The original anchor is historical evidence. Construction validates internal shape only and does not prove that the original source material was truthful.

## Replay snapshot
`LifecycleReplaySnapshot` is an immutable supplied deterministic replay result for exactly one mode.

It binds:
- stable snapshot reference;
- replay mode;
- exact anchor object;
- target reference/type and target scope;
- semantic outcome;
- evaluated-at / as-known-at;
- exact source/rule/contract versions used;
- exact evidence references used;
- optional exact Core historical replay metadata reference;
- evaluator actor;
- provenance/correlation/causation references;
- controlled availability state;
- deterministic reason codes.

Availability states:
- `AVAILABLE`;
- `INPUT_MISSING`;
- `VERSION_UNAVAILABLE`;
- `REVIEW_REQUIRED`;
- `INDETERMINATE`.

Only `AVAILABLE` may carry a semantic outcome. All fail-closed states carry no reconstructed semantic outcome.

## AS_WAS strictness
An AS_WAS snapshot must bind the exact anchor and must:
- use the original decision/evaluation instant;
- use the original as-known horizon;
- use exactly the original rule/source/contract version sets;
- use exactly the original evidence reference set;
- preserve original jurisdiction, subject and target identity;
- preserve correlation/causation lineage where present.

No current rule, source, catalog version, evidence or current compliance projection may fill a missing AS_WAS input. If an exact historical input is unavailable, the snapshot must be fail-closed with `INPUT_MISSING`, `VERSION_UNAVAILABLE`, `REVIEW_REQUIRED` or `INDETERMINATE`.

Where a Core `HistoricalSnapshotReplay` is supplied, S09 validates that its selected historical version context does not exceed the AS_WAS knowledge cutoff. S09 does not modify Core replay semantics.

## AS_IS strictness
An AS_IS snapshot:
- keeps the same target identity/scope/jurisdiction as the anchor;
- uses an explicitly supplied current evaluation and as-known horizon;
- may use current governed source/rule/contract/evidence versions;
- must never be represented as historical truth;
- may optionally bind an exact current S08 projection or S07 reevaluation evidence reference.

AS_IS is a new evaluation view. It does not replace or rewrite the original decision.

## Replay result
A `LifecycleHistoricalReplay` consumes:
- fresh Application execution/tenant/access context;
- exact original anchor;
- optional AS_WAS snapshot;
- optional AS_IS snapshot;
- requested replay modes;
- explicit replayed-at and as-known horizon;
- bounded governed divergence reasons;
- explicit max-snapshot/reference budgets.

Per-mode replay outcomes:
- `MATCH`;
- `EXPLAINED_DIVERGENCE`;
- `INPUT_MISSING`;
- `VERSION_UNAVAILABLE`;
- `REVIEW_REQUIRED`;
- `INDETERMINATE`.

For AS_WAS:
- AVAILABLE + reconstructed semantic outcome equal to original -> MATCH;
- AVAILABLE + different semantic outcome requires explicit governed divergence reason -> EXPLAINED_DIVERGENCE;
- differing outcome without governed divergence reason -> REVIEW_REQUIRED;
- fail-closed snapshot state maps to the corresponding fail-closed replay outcome.

For AS_IS:
- AVAILABLE + current semantic outcome equal to original -> MATCH;
- AVAILABLE + different semantic outcome -> EXPLAINED_DIVERGENCE only when an explicit governed comparison reason is supplied; otherwise REVIEW_REQUIRED;
- fail-closed states map directly.

A MATCH proves deterministic agreement for the supplied governed inputs only. It does not prove that historical source material, external authority data or evaluator assumptions were factually true.

## AS_WAS / AS_IS comparison
When both modes are requested, S09 returns a separate comparison:
- `SAME_OUTCOME`;
- `CHANGED_OUTCOME`;
- `COMPARISON_UNAVAILABLE`;
- `REVIEW_REQUIRED`;
- `INDETERMINATE`.

Comparison never replaces either mode result. It states:
- original outcome;
- AS_WAS reconstructed outcome where available;
- AS_IS current outcome where available;
- exact changed version/evidence references;
- explicit divergence reason codes;
- comparison horizon.

A changed current outcome does not retroactively change the original outcome.

## Divergence reasons
Controlled governed divergence reasons:
- `CORRECTED_EVIDENCE`;
- `SOURCE_VERSION_CHANGED`;
- `RULE_VERSION_CHANGED`;
- `CONTRACT_VERSION_CHANGED`;
- `EVIDENCE_SET_CHANGED`;
- `IMPLEMENTATION_DEFECT_DETECTED`;
- `HISTORICAL_DEPENDENCY_UNAVAILABLE`;
- `CURRENT_SCOPE_CHANGED`;
- `MANUAL_REVIEW_DECISION`;
- `OTHER_GOVERNED_REASON`.

Divergence reasons contain metadata only. Free-form model inference cannot manufacture a reason. `OTHER_GOVERNED_REASON` requires an explicit bounded governed reference.

## Historical defect handling
A detected prior defect does not mutate the historical anchor or any old assessment, grant, replay, reevaluation or compliance projection.

S09 may emit safe metadata indicating:
- `correctiveReviewRequired=true`;
- the exact anchor affected;
- the governed divergence reason;
- an optional new review/reevaluation reference supplied by the caller.

It does not itself create or persist the corrective decision.

## S07 and S08 integration
S09 may bind:
- exact S07 reevaluation decision references;
- exact S08 projection references/statuses;
- historical or current safe metadata from those outputs.

Rules:
- historical S07/S08 evidence included in AS_WAS must be explicitly version/time-bound and already known by the AS_WAS horizon;
- current S07/S08 evidence belongs only to AS_IS;
- S08 current status is not silently substituted into AS_WAS;
- S07 generic result text is not reinterpreted as replay truth without an explicit governed replay snapshot.

## Core M04 historical replay integration
Core M04 historical version replay remains authoritative for its own catalog-version selection semantics. S09 may consume safe metadata from it but must not:
- alter its selected historical identity;
- widen its as-known cutoff;
- choose a later version;
- convert ambiguous/not-found states into AVAILABLE;
- mutate Core historical snapshots.

## Tenant, access and privacy
Every replay/read requires exact current:
- tenant;
- organization;
- subject where scoped;
- actor identity and kind;
- purpose;
- correlation;
- operation/field authorization;
- matching ALLOW access decision.

Cross-tenant, cross-organization, foreign-subject, wrong-purpose, wrong-operation, wrong-access-reference or missing field authorization fails before replay snapshots or historical metadata are disclosed.

Outputs contain safe bounded metadata only. No raw evidence/document body, storage locator, contact data, secret, provider payload, medical detail or unrelated credential data is exposed.

## Temporal integrity
All time is explicit `UtcInstant`. No ambient system clock or local timezone.

Rules:
- original evaluated-at cannot exceed original as-known horizon;
- AS_WAS uses exact original horizons;
- AS_IS evaluated-at/as-known-at cannot exceed the replay request horizon;
- replayed-at cannot predate any supplied current evaluation;
- no future-known evidence may appear in AS_WAS;
- no historical snapshot is silently advanced to current knowledge time.

## Determinism, ordering and bounds
Requested modes, snapshots, version/evidence references and divergence reasons are dense, bounded, copied and canonically ordered.

Identical governed input replay is byte-stable. Caller array order does not change output. Duplicate modes/references/reasons are rejected.

Explicit budgets cover:
- snapshots/modes;
- version references;
- evidence references;
- divergence reasons;
- comparison difference references.

Budget overflow fails closed rather than silently truncating a replay.

## Output and authority boundary
Serialized output preserves:
- exact anchor view;
- explicit per-mode results;
- explicit comparison;
- exact horizons and version/evidence metadata;
- deterministic reason codes;
- actor/correlation/access/audit references;
- corrective-review metadata.

Every output must preserve:
- `authorizationAuthority=false`;
- `credentialStateMutated=false`;
- `authorizationStateMutated=false`;
- `historicalDecisionMutated=false`;
- `reevaluationDecisionMutated=false`;
- `complianceProjectionMutated=false`;
- `assignmentDecisionMutated=false`;
- `notificationScheduled=false`;
- `providerInvoked=false`;
- `eventsEmitted=0`;
- `physicalDeletionAuthorized=false`.

## Mandatory evidence
The acceptance gate requires:
- **128 ordered S09 product scenarios**;
- **16 ordered scope/governance scenarios**;
- **26 readonly/public-contract assertions** under strict Application compilation;
- unchanged S08/S07/S06/S05/S04/S03/S02/S01 and transitive predecessor gates on the current candidate checkout;
- full same-head pull-request workflow matrix independently complete.

Architecture contract and mandatory test index must precede activation and source. The immutable S09 execution record must bind this owner approval, exact reviewed S08 head/merge, actual post-merge evidence reference, contract/test-index commits and accepted predecessor progress.

Only the original closed S08 scope validator may execute in a temporary historical worktree. Historical scope proof is not current runtime proof.

## Non-goals and release boundary
No Slice 10 milestone integration evidence, regulatory interpretation, assignment decision execution, live provider, scheduler, queue, database writer, UI, notification send, credential/authorization mutation, physical deletion or production release is part of S09.

S09 pull-request merge, Slice 10 and production deployment require separate explicit owner approval.

Accepted predecessor coverage is **M06 8/10 = 80%** and original v1 allocation **68/130 = 52.31%**. This S09 contract alone adds no accepted delivery credit.
