# M06 Slice 06 — Exit Evidence

Status: `PRODUCT IMPLEMENTED / EXECUTION VALIDATION PENDING / UNMERGED`
Tracking #150; epic #36. Branch `impl/m06-s06-dependency-graph`.
Owner: **SCHVALUJI MERGE PR #148 A POKRAČOVÁNÍ NA M06 SLICE 06.**

## Verified prerequisite and activation
PR #148 merged to `planning/program-execution-m09-m12` as **ca84ec7939471130c72a9a6463d94695d0637ddb** from reviewed S05 head **48e94a0018c056bdfce9c47d4b2fc131ad02b7e2**.
Reviewed-head-to-merge comparison has zero changed files. Actual merge-associated workflow evidence is PR #148 comment **5741092327**, confirming **51/51 completed SUCCESS**.

S06 architecture-first sequence:
- implementation contract **0cc4f5d93306add2fc91a77a6d8bdd7badb89409**;
- mandatory 104-scenario index **21e48a5eaf4900625aece15162360364785acd1a**;
- initial gated exit-evidence draft **7395be62448a1edc6b635da1ccf17222642da7e5**;
- immutable execution activation **e3009d94ffb5f1e4a3cc06045063f9a8dd5ff55e** after successful predecessor verification;
- executable runtime specifications **12b5cdd4d6c022a8d9489bd653bb93d2f2b20c1e**;
- readonly/public-contract type specifications **50241247bdf89f0edddf5c106314b1c121609200**;
- first product source **e609ab1b1583a90fd3ca5cae0e7109a3c26291b3**;
- pre-CI strict-initialization source review **ecbe7da5be851ce688cd23864bc3ae95eeb6bdcb**.

Contract, index, activation and executable specifications all precede the first product source.

## Delivered scope
The existing Application lifecycle package now adds a provider-neutral immutable dependency graph and deterministic impact traversal:
- controlled versioned dependency nodes across the M01–M08 reference spine;
- typed directional edges with explicit MANDATORY / ADVISORY / REVIEW_ONLY impact modes;
- immutable graph snapshots with tenant/organization/subject scope and bounded canonical ordering;
- immutable change events with explicit chronology, verification state and provenance;
- downstream-only selective traversal with allowed target types, deterministic candidate dedup identities and explainable dependency paths;
- explicit cycle detection, bounded depth/candidate/path budgets and fail-closed REVIEW_REQUIRED semantics;
- future-effective impact metadata without current-state mutation;
- exact Application tenant/access checks before graph disclosure.

`SUPERSEDES` remains lineage and is not silently treated as downstream invalidation. Unverified/review-required change material can only produce review-only treatment. S06 creates candidates/plans only; it performs no S07 reevaluation.

## Static pre-CI validation
Initial source-of-truth comparison from predecessor merge showed 15 paths. The first full PR matrix exposed one historical S04 successor-config compatibility requirement. The governed candidate therefore now uses **exact 16 paths**: the original 11 additions plus five constrained modifications, adding only `scripts/ci/m06-s04-scope.mjs` as a bounded predecessor-compatibility patch. No Core/provider/UI/database/scheduler path is changed.

Connector-side structural reconstruction before PR opening confirms:
- exact S05 successor-governance patch;
- exact S04 successor-config compatibility patch for activated S05+S06 registrations;
- exact additive Application package script and tsconfig entry;
- exact additive lifecycle barrel exports;
- 104 ordered runtime test IDs;
- 16 ordered governance test IDs;
- 20 readonly/public-contract assertions;
- 104 ordered mandatory index IDs;
- zero forbidden ambient-time/provider patterns in the new source.

The first dedicated S06 execution on head `37e237dcbea1835463e3939767e517aa8074f977` is now actual runtime evidence: workflow **35438233315**, job **105884467511**, completed SUCCESS with **104/104 S06 runtime**, **16/16 S06 governance**, **20 readonly assertions**, S05 **96/96**, S04 **88/88**, S03 **80/80**, S02 **72/72**, S01 **64/64**, and M05 runtime ledger **500/500**.

The same initial full PR matrix exposed a separate historical S04 workflow failure in run **35438233359** / job **105884467715**. Its S04 product runtime passed; only its imported current `validateConfig()` rejected the newly activated S06 package/tsconfig registrations. Corrective commits **affcc9662a56c466283a48342457701e722e3e4d**, **26119c38c26dad196112cfa6702cc336e3290457**, and **7a4e942ac451081bb5c18bf34d4792a15848eb93** add and govern the exact compatibility patch. No mandatory product scenario or historical product test is weakened. Fresh exact-head CI remains mandatory.

## Required executed evidence
Dedicated exact-head GitHub Actions must prove:
- **104/104** S06 product scenarios;
- **16/16** S06 scope/governance scenarios;
- **20** readonly/public-contract assertions and strict Application compilation;
- unchanged S05/S04/S03/S02/S01 plus transitive predecessor gates on the current candidate checkout;
- full same-head PR workflow matrix independently complete.

Only the original closed S05 scope validator may execute in a temporary historical worktree at the actual S05 merge. Historical scope evidence is not current runtime evidence.

Actual head/tree, workflow run/job IDs, decoded-log results, failures/fixes and final matrix must be recorded after execution. This file does not certify future CI success.

## Semantic and release boundary
**change event != legal conclusion; graph reachability != material impact; impact candidate != invalidation; traversal plan != reevaluation result; dependency history != mutable truth**

Outputs retain no authorization/re-evaluation authority and no mutable domain effects. No selective reevaluation engine (S07), regulatory interpretation, assignment decision, provider, scheduler, database writer, UI, notification delivery, credential mutation, authorization mutation, physical deletion or production release is included.

S06 PR merge, S07+, deployment and release require separate explicit owner approval.

Accepted predecessor coverage is **M06 5/10 = 50%** and original v1 allocation **65/130 = 50.00%**. This unmerged S06 candidate adds no accepted delivery credit.
